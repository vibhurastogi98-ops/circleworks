import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { platformAdmins } from "@/db/schema";
import {
  encryptMfaSecret,
  generateTotpSecret,
  hashPlatformPassword,
  totpAuthUri,
} from "@/lib/platform-crypto";
import { withPlatformAudit } from "@/lib/platform-audit";
import { PLATFORM_ADMIN_ROLES, type PlatformAdminRole } from "@/lib/platform-rbac";

export const dynamic = "force-dynamic";

export const POST = withPlatformAudit(
  {
    action: "admin.invite",
    targetType: "platform_admin",
    extractTargetId: () => "new",
    mutating: true,
  },
  async ({ tx, request, session }) => {
    const body = (await request.clone().json().catch(() => ({}))) as Record<string, unknown>;
    const email = typeof body.email === "string" ? body.email.toLowerCase().trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const roleRaw = String(body.role ?? "");
    const role = (PLATFORM_ADMIN_ROLES as readonly string[]).includes(roleRaw)
      ? (roleRaw as PlatformAdminRole)
      : null;
    if (!email || !password || !role) throw new Error("missing_or_invalid_fields");

    // Only super_admin may create super_admin.
    if (role === "super_admin" && session.role !== "super_admin") {
      throw new Error("only_super_admin_may_create_super_admin");
    }

    const [existing] = await tx
      .select({ id: platformAdmins.id })
      .from(platformAdmins)
      .where(eq(platformAdmins.email, email))
      .limit(1);
    if (existing) throw new Error("email_already_exists");

    const passwordHash = await hashPlatformPassword(password);
    const secret = generateTotpSecret();
    const [inserted] = await tx
      .insert(platformAdmins)
      .values({
        email,
        passwordHash,
        role,
        mfaSecretEncrypted: encryptMfaSecret(secret.base32),
        createdBy: session.adminId,
      })
      .returning();

    return {
      body: {
        ok: true,
        adminId: inserted!.id,
        mfaSecretBase32: secret.base32,
        otpauthUri: totpAuthUri(secret.base32, email),
      },
      before: null,
      after: { email, role },
      metadata: { createdBy: session.adminId },
    };
  },
);
