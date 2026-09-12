import { NextResponse, type NextRequest } from "next/server";
import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { bootstrapTokens, platformAdmins, platformAuditLogs } from "@/db/schema";
import {
  encryptMfaSecret,
  generateTotpSecret,
  hashBootstrapToken,
  hashPlatformPassword,
  totpAuthUri,
  verifyTotpCode,
} from "@/lib/platform-crypto";
import { rateLimit, clientKey } from "@/lib/platform-rate-limit";

export const dynamic = "force-dynamic";

async function anySuperAdminExists(): Promise<boolean> {
  const [row] = await db
    .select({ id: platformAdmins.id })
    .from(platformAdmins)
    .where(and(eq(platformAdmins.role, "super_admin"), eq(platformAdmins.status, "active")))
    .limit(1);
  return !!row;
}

// GET: hand out the freshly-provisioned TOTP secret + otpauth uri BEFORE the
// admin submits the bootstrap POST. The token is required to reveal the URI.
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") ?? "";
  const email = url.searchParams.get("email")?.toLowerCase() ?? "";

  if (await anySuperAdminExists()) {
    return NextResponse.json({ error: "bootstrap_closed" }, { status: 410 });
  }
  if (!token || !email) return NextResponse.json({ error: "missing_params" }, { status: 400 });

  const hash = hashBootstrapToken(token);
  const [row] = await db
    .select()
    .from(bootstrapTokens)
    .where(and(eq(bootstrapTokens.tokenHash, hash), isNull(bootstrapTokens.usedAt)))
    .limit(1);

  if (!row) return NextResponse.json({ error: "invalid_token" }, { status: 401 });
  if (row.allowedEmail.toLowerCase() !== email) {
    return NextResponse.json({ error: "email_mismatch" }, { status: 401 });
  }
  if (row.expiresAt.getTime() < Date.now()) {
    return NextResponse.json({ error: "token_expired" }, { status: 401 });
  }

  const secret = generateTotpSecret();
  const uri = totpAuthUri(secret.base32, email);
  return NextResponse.json({
    mfaSecretBase32: secret.base32,
    otpauthUri: uri,
    email,
  });
}

export async function POST(request: NextRequest) {
  const rl = await rateLimit({ key: clientKey(request, "platform:bootstrap"), limit: 3, windowMs: 15 * 60 * 1000 });
  if (!rl.allowed) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  if (await anySuperAdminExists()) {
    return NextResponse.json({ error: "bootstrap_closed" }, { status: 410 });
  }

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const email = typeof body.email === "string" ? body.email.toLowerCase().trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const token = typeof body.token === "string" ? body.token : "";
  const mfaSecret = typeof body.mfaSecret === "string" ? body.mfaSecret.trim() : "";
  const totpCode = typeof body.totpCode === "string" ? body.totpCode.trim() : "";

  if (!email || !password || !token || !mfaSecret || !totpCode) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  if (!verifyTotpCode(mfaSecret, totpCode)) {
    return NextResponse.json({ error: "totp_verification_failed" }, { status: 400 });
  }

  const hash = hashBootstrapToken(token);
  const [tokenRow] = await db
    .select()
    .from(bootstrapTokens)
    .where(and(eq(bootstrapTokens.tokenHash, hash), isNull(bootstrapTokens.usedAt)))
    .limit(1);

  if (!tokenRow) return NextResponse.json({ error: "invalid_token" }, { status: 401 });
  if (tokenRow.allowedEmail.toLowerCase() !== email) {
    return NextResponse.json({ error: "email_mismatch" }, { status: 401 });
  }
  if (tokenRow.expiresAt.getTime() < Date.now()) {
    return NextResponse.json({ error: "token_expired" }, { status: 401 });
  }

  const passwordHash = await hashPlatformPassword(password);
  const mfaEncrypted = encryptMfaSecret(mfaSecret);
  const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

  const result = await db.transaction(async (tx) => {
    // Re-check inside the transaction to close the TOCTOU window.
    const [again] = await tx
      .select({ id: platformAdmins.id })
      .from(platformAdmins)
      .where(and(eq(platformAdmins.role, "super_admin"), eq(platformAdmins.status, "active")))
      .limit(1);
    if (again) throw new Error("bootstrap_race_lost");

    const [admin] = await tx
      .insert(platformAdmins)
      .values({
        email,
        passwordHash,
        role: "super_admin",
        mfaSecretEncrypted: mfaEncrypted,
      })
      .returning();

    await tx
      .update(bootstrapTokens)
      .set({ usedAt: new Date(), usedFromIp: ipAddress })
      .where(eq(bootstrapTokens.id, tokenRow.id));

    await tx.insert(platformAuditLogs).values({
      actorAdminId: admin!.id,
      actorRole: "super_admin",
      action: "platform.bootstrap.super_admin_created",
      targetType: "platform_admin",
      targetId: String(admin!.id),
      reasonCode: "system_maintenance",
      reasonNotes: tokenRow.createdByNote,
      before: null,
      after: { email, role: "super_admin" },
      metadata: { bootstrapTokenId: tokenRow.id, systemActor: true },
      ipAddress,
      userAgent: request.headers.get("user-agent"),
    });

    return admin!;
  }).catch((err) => ({ __error: err instanceof Error ? err.message : String(err) }));

  if ("__error" in (result as Record<string, unknown>)) {
    return NextResponse.json({ error: "bootstrap_failed" }, { status: 500 });
  }
  return NextResponse.json({ success: true, adminId: (result as { id: number }).id });
}
