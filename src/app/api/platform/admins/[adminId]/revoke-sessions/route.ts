import type { NextRequest } from "next/server";
import { and, eq, isNull } from "drizzle-orm";

import { platformAdminSessions } from "@/db/schema";
import { withPlatformAudit } from "@/lib/platform-audit";

export const dynamic = "force-dynamic";

async function extractTargetId(request: NextRequest) {
  const m = new URL(request.url).pathname.match(/\/admins\/(\d+)\//);
  return m?.[1] ?? "0";
}

export const POST = withPlatformAudit<Record<string, unknown>>(
  { action: "admin.revokeSession", targetType: "platform_admin", extractTargetId, mutating: true },
  async ({ tx, request }) => {
    const adminId = Number(await extractTargetId(request));
    if (!Number.isInteger(adminId)) throw new Error("invalid_admin_id");
    const revoked = await tx
      .update(platformAdminSessions)
      .set({ revokedAt: new Date(), revokedReason: "admin_revoked_by_platform_admin" })
      .where(and(eq(platformAdminSessions.adminId, adminId), isNull(platformAdminSessions.revokedAt)))
      .returning({ jti: platformAdminSessions.jti });
    return {
      body: { ok: true, revokedSessions: revoked.length },
      before: null,
      after: { revokedSessions: revoked.length },
    };
  },
);
