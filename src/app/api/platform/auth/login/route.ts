import { NextResponse, type NextRequest } from "next/server";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { platformAdmins, platformAuditLogs } from "@/db/schema";
import { decryptMfaSecret, verifyPlatformPassword, verifyTotpCode } from "@/lib/platform-crypto";
import { clientKey, rateLimit } from "@/lib/platform-rate-limit";
import {
  issuePlatformSession,
  setPlatformSessionCookie,
} from "@/lib/platform-session";
import type { PlatformAdminRole } from "@/lib/platform-rbac";

export const dynamic = "force-dynamic";

const MAX_FAILED = 5;
const LOCK_MINUTES = 15;

export async function POST(request: NextRequest) {
  const ip = clientKey(request, "platform:login");
  const perIp = await rateLimit({ key: ip, limit: 5, windowMs: 15 * 60 * 1000 });
  if (!perIp.allowed) return NextResponse.json({ error: "rate_limited_ip" }, { status: 429 });

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const email = typeof body.email === "string" ? body.email.toLowerCase().trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const totpCode = typeof body.totpCode === "string" ? body.totpCode.trim() : "";

  const perEmail = await rateLimit({ key: `platform:login:email:${email}`, limit: 20, windowMs: 60 * 60 * 1000 });
  if (!perEmail.allowed) return NextResponse.json({ error: "rate_limited_email" }, { status: 429 });

  if (!email || !password || !totpCode) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const [admin] = await db
    .select()
    .from(platformAdmins)
    .where(eq(platformAdmins.email, email))
    .limit(1);

  // Uniform failure — no user enumeration.
  const genericFail = () =>
    NextResponse.json({ error: "invalid_credentials" }, { status: 401 });

  if (!admin) return genericFail();
  if (admin.status !== "active") return genericFail();
  if (admin.lockedUntil && admin.lockedUntil.getTime() > Date.now()) {
    return NextResponse.json({ error: "account_locked" }, { status: 423 });
  }

  const passwordOk = await verifyPlatformPassword(password, admin.passwordHash);
  const mfaOk = passwordOk && verifyTotpCode(decryptMfaSecret(admin.mfaSecretEncrypted), totpCode);

  if (!passwordOk || !mfaOk) {
    const failed = admin.failedAttempts + 1;
    const shouldLock = failed >= MAX_FAILED;
    await db
      .update(platformAdmins)
      .set({
        failedAttempts: failed,
        lockedUntil: shouldLock ? new Date(Date.now() + LOCK_MINUTES * 60 * 1000) : admin.lockedUntil,
      })
      .where(eq(platformAdmins.id, admin.id));
    await db.insert(platformAuditLogs).values({
      actorAdminId: admin.id,
      actorRole: admin.role,
      action: "platform.login.failed",
      targetType: "platform_admin",
      targetId: String(admin.id),
      metadata: { reason: !passwordOk ? "bad_password" : "bad_totp", failedAttempts: failed, locked: shouldLock },
      ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
      userAgent: request.headers.get("user-agent"),
    });
    return genericFail();
  }

  const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const userAgent = request.headers.get("user-agent");

  const { token, expiresAt } = await issuePlatformSession({
    adminId: admin.id,
    role: admin.role as PlatformAdminRole,
    ipAddress,
    userAgent,
  });

  await db
    .update(platformAdmins)
    .set({ failedAttempts: 0, lockedUntil: null, lastLoginAt: new Date(), lastLoginIp: ipAddress })
    .where(eq(platformAdmins.id, admin.id));

  await db.insert(platformAuditLogs).values({
    actorAdminId: admin.id,
    actorRole: admin.role,
    action: "platform.login.success",
    targetType: "platform_admin",
    targetId: String(admin.id),
    metadata: {},
    ipAddress,
    userAgent,
  });

  const res = NextResponse.json({ success: true, role: admin.role });
  setPlatformSessionCookie(res, token, expiresAt);
  return res;
}
