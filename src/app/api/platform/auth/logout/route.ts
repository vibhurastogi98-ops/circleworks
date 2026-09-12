import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { platformAuditLogs } from "@/db/schema";
import {
  clearPlatformSessionCookie,
  getPlatformSession,
  revokeSessionByJti,
} from "@/lib/platform-session";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const session = await getPlatformSession(request);
  if (session) {
    await revokeSessionByJti(session.jti, "user_logout");
    await db.insert(platformAuditLogs).values({
      actorAdminId: session.adminId,
      actorRole: session.role,
      action: "platform.logout",
      targetType: "platform_admin",
      targetId: String(session.adminId),
      metadata: { jti: session.jti },
      ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
      userAgent: request.headers.get("user-agent"),
    });
  }
  const res = NextResponse.json({ success: true });
  clearPlatformSessionCookie(res);
  return res;
}
