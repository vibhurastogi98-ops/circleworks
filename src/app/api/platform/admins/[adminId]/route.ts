import type { NextRequest } from "next/server";
import { and, eq, isNull, sql, count } from "drizzle-orm";

import { platformAdmins, platformAdminSessions } from "@/db/schema";
import { withPlatformAudit } from "@/lib/platform-audit";

export const dynamic = "force-dynamic";

async function extractTargetId(request: NextRequest) {
  const m = new URL(request.url).pathname.match(/\/admins\/(\d+)/);
  return m?.[1] ?? "0";
}

/**
 * Disable an admin (soft; row stays). Also revokes every open session that
 * belongs to them so they can't linger. Only super_admin may disable another
 * super_admin.
 */
export const DELETE = withPlatformAudit<Record<string, unknown>>(
  { action: "admin.disable", targetType: "platform_admin", extractTargetId, mutating: true },
  async ({ tx, request, session }) => {
    const adminId = Number(await extractTargetId(request));
    if (!Number.isInteger(adminId) || adminId <= 0) throw new Error("invalid_admin_id");
    if (adminId === session.adminId) throw new Error("cannot_disable_self");

    const [target] = await tx.select().from(platformAdmins).where(eq(platformAdmins.id, adminId)).limit(1);
    if (!target) throw new Error("admin_not_found");
    if (target.role === "super_admin" && session.role !== "super_admin") {
      throw new Error("only_super_admin_may_disable_super_admin");
    }
    if (target.status === "disabled") {
      return { body: { ok: true, alreadyDisabled: true }, before: null, after: null };
    }

    await tx
      .update(platformAdmins)
      .set({ status: "disabled", disabledAt: new Date(), disabledBy: session.adminId, disabledReason: "admin_disable_action" })
      .where(eq(platformAdmins.id, adminId));

    // Revoke every open session for this admin.
    const revoked = await tx
      .update(platformAdminSessions)
      .set({ revokedAt: new Date(), revokedReason: "admin_disabled" })
      .where(and(eq(platformAdminSessions.adminId, adminId), isNull(platformAdminSessions.revokedAt)))
      .returning({ jti: platformAdminSessions.jti });

    return {
      body: { ok: true, revokedSessions: revoked.length },
      before: { status: target.status, disabledAt: target.disabledAt },
      after: { status: "disabled", disabledAt: new Date().toISOString(), revokedSessions: revoked.length },
    };
  },
);

/**
 * Change an admin's role. super_admin promotion is super_admin-only.
 */
export const PATCH = withPlatformAudit<Record<string, unknown>>(
  { action: "admin.edit", targetType: "platform_admin", extractTargetId, mutating: true },
  async ({ tx, request, session }) => {
    const adminId = Number(await extractTargetId(request));
    if (!Number.isInteger(adminId)) throw new Error("invalid_admin_id");
    const body = (await request.clone().json().catch(() => ({}))) as Record<string, unknown>;
    const newRole = String(body.role ?? "");
    const validRoles = ["super_admin", "ops", "risk_analyst", "billing_ops", "read_only"];
    if (!validRoles.includes(newRole)) throw new Error("invalid_role");

    const [target] = await tx.select().from(platformAdmins).where(eq(platformAdmins.id, adminId)).limit(1);
    if (!target) throw new Error("admin_not_found");
    if ((target.role === "super_admin" || newRole === "super_admin") && session.role !== "super_admin") {
      throw new Error("only_super_admin_may_touch_super_admin_role");
    }
    if (adminId === session.adminId && newRole !== target.role && target.role === "super_admin" && newRole !== "super_admin") {
      // A super_admin demoting themselves would lock everyone else out of
      // super_admin-only actions if they're the last one. Guard.
      const [supers] = await tx
        .select({ n: count() })
        .from(platformAdmins)
        .where(and(eq(platformAdmins.role, "super_admin"), eq(platformAdmins.status, "active")));
      if (Number(supers?.n ?? 0) <= 1) {
        throw new Error("cannot_demote_last_super_admin");
      }
    }
    void sql; // reserved for future queries

    await tx.update(platformAdmins).set({ role: newRole as "super_admin" }).where(eq(platformAdmins.id, adminId));
    return {
      body: { ok: true },
      before: { role: target.role },
      after: { role: newRole },
    };
  },
);
