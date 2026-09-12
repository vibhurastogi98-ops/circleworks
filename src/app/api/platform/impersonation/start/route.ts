import { NextResponse, type NextRequest } from "next/server";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { companies, employees, impersonationSessions, platformAuditLogs, users } from "@/db/schema";
import { getPlatformSession } from "@/lib/platform-session";
import {
  hasPlatformPermission,
  PLATFORM_STEPUP_WINDOW_MS,
  STEPUP_ACTIONS,
} from "@/lib/platform-rbac";
import { isPlatformAuditReason } from "@/lib/platform-audit-reasons";
import {
  IMPERSONATION_MAX_MS,
  issueImpersonationCookie,
  setImpersonationCookie,
} from "@/lib/platform-impersonation";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const session = await getPlatformSession(request);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!hasPlatformPermission(session.role, "impersonation.start")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  if (STEPUP_ACTIONS.has("impersonation.start")) {
    if (Date.now() - session.lastMfaAt.getTime() > PLATFORM_STEPUP_WINDOW_MS) {
      return NextResponse.json({ error: "stepup_required" }, { status: 401 });
    }
  }

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const companyId = Number(body.companyId);
  const userId = Number(body.userId);
  const reasonCode = body.reasonCode;
  const reasonNotes = typeof body.reasonNotes === "string" ? body.reasonNotes.trim() : "";
  if (!Number.isInteger(companyId) || !Number.isInteger(userId)) {
    return NextResponse.json({ error: "invalid_ids" }, { status: 400 });
  }
  if (!isPlatformAuditReason(reasonCode)) {
    return NextResponse.json({ error: "reason_code_required_or_invalid" }, { status: 400 });
  }
  if (reasonNotes.length < 20) {
    return NextResponse.json({ error: "reason_notes_min_20_chars" }, { status: 400 });
  }

  const [targetCompany] = await db.select().from(companies).where(eq(companies.id, companyId)).limit(1);
  if (!targetCompany) return NextResponse.json({ error: "tenant_not_found" }, { status: 404 });
  if (targetCompany.softDeletedAt) {
    return NextResponse.json({ error: "tenant_soft_deleted" }, { status: 409 });
  }

  const [targetEmployee] = await db
    .select({ id: employees.id, userId: employees.userId })
    .from(employees)
    .where(and(eq(employees.companyId, companyId), eq(employees.userId, userId)))
    .limit(1);
  if (!targetEmployee) {
    return NextResponse.json({ error: "user_not_in_tenant" }, { status: 400 });
  }

  const [targetUser] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!targetUser) return NextResponse.json({ error: "user_not_found" }, { status: 404 });

  const expiresAt = new Date(Date.now() + IMPERSONATION_MAX_MS);
  const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const userAgent = request.headers.get("user-agent");

  const result = await db.transaction(async (tx) => {
    // Look up the session row id — needed for the FK.
    const [adminSession] = await tx
      .select({ id: platformAuditLogs.id })
      .from(platformAuditLogs)
      .where(eq(platformAuditLogs.id, -1))
      .limit(1);
    // Actually get session_id from platform_admin_sessions by JTI.
    // We import here to avoid a top-level cycle risk.
    const { platformAdminSessions } = await import("@/db/schema");
    const [adminSess] = await tx
      .select({ id: platformAdminSessions.id })
      .from(platformAdminSessions)
      .where(eq(platformAdminSessions.jti, session.jti))
      .limit(1);
    if (!adminSess) throw new Error("admin_session_row_missing");
    void adminSession;

    const [imp] = await tx
      .insert(impersonationSessions)
      .values({
        adminId: session.adminId,
        adminSessionId: adminSess.id,
        targetUserId: userId,
        targetCompanyId: companyId,
        reasonCode,
        reasonNotes,
        expiresAt,
        ipAddress,
        userAgent,
      })
      .returning();

    await tx.insert(platformAuditLogs).values({
      actorAdminId: session.adminId,
      actorRole: session.role,
      action: "impersonation.start",
      targetType: "tenant_user",
      targetId: `${companyId}:${userId}`,
      reasonCode,
      reasonNotes,
      before: null,
      after: { impersonationId: imp!.id, expiresAt: expiresAt.toISOString() },
      metadata: { sessionJti: session.jti },
      ipAddress,
      userAgent,
    });
    return imp!;
  });

  const token = await issueImpersonationCookie({
    impersonationId: result.id,
    adminId: session.adminId,
    targetUserId: userId,
    targetCompanyId: companyId,
    expiresAt,
  });
  const res = NextResponse.json({
    ok: true,
    impersonationId: result.id,
    expiresAt: expiresAt.toISOString(),
    target: { userId, companyId, email: targetUser.email },
  });
  return setImpersonationCookie(res, token, expiresAt);
}
