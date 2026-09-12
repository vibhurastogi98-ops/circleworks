import { NextResponse, type NextRequest } from "next/server";
import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { impersonationSessions, platformAuditLogs } from "@/db/schema";
import { getPlatformSession } from "@/lib/platform-session";
import { clearImpersonationCookie, readImpersonation } from "@/lib/platform-impersonation";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const session = await getPlatformSession(request);
  const imp = await readImpersonation(request);

  // Even without a platform session (e.g. cookie was cleared), let stop
  // succeed to clear the impersonation cookie. But require SOMETHING.
  if (!session && !imp) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (imp) {
    await db.transaction(async (tx) => {
      const [row] = await tx
        .select()
        .from(impersonationSessions)
        .where(and(eq(impersonationSessions.id, imp.impersonationId), isNull(impersonationSessions.endedAt)))
        .limit(1);
      if (row) {
        await tx
          .update(impersonationSessions)
          .set({ endedAt: new Date(), endedReason: "admin_stopped" })
          .where(eq(impersonationSessions.id, row.id));
        await tx.insert(platformAuditLogs).values({
          actorAdminId: session?.adminId ?? row.adminId,
          actorRole: session?.role ?? null,
          action: "impersonation.stop",
          targetType: "tenant_user",
          targetId: `${row.targetCompanyId}:${row.targetUserId}`,
          metadata: { impersonationId: row.id, reason: "admin_stopped" },
          ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
          userAgent: request.headers.get("user-agent"),
        });
      }
    });
  }

  const res = NextResponse.json({ ok: true });
  return clearImpersonationCookie(res);
}
