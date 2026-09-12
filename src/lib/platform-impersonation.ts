/**
 * Impersonation cookie + session helpers. Impersonation writes are additionally
 * gated by a compile-time forbid list (see IMPERSONATION_FORBIDDEN_ACTIONS).
 *
 * The tenant middleware (src/proxy.ts) checks for this cookie and, when
 * present + valid + not expired + row not ended, synthesizes the tenant
 * identity from the impersonation target. It never mints a tenant session cookie.
 *
 * See docs/platform-admin-spec.md §6.3.
 */

import { SignJWT, jwtVerify } from "jose";
import type { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { impersonationSessions } from "@/db/schema";
import { and, eq, isNull } from "drizzle-orm";

export const IMPERSONATION_COOKIE = "cw_impersonation";
export const IMPERSONATION_MAX_MS = 30 * 60 * 1000;

const PLATFORM_JWT_SECRET = new TextEncoder().encode(
  process.env.PLATFORM_JWT_SECRET || "circleworks-platform-dev-secret-change-in-production",
);

export type ImpersonationClaims = {
  impersonationId: number;
  adminId: number;
  targetUserId: number;
  targetCompanyId: number;
  exp: number;
};

export async function issueImpersonationCookie(input: {
  impersonationId: number;
  adminId: number;
  targetUserId: number;
  targetCompanyId: number;
  expiresAt: Date;
}) {
  const token = await new SignJWT({
    impersonationId: input.impersonationId,
    adminId: input.adminId,
    targetUserId: input.targetUserId,
    targetCompanyId: input.targetCompanyId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(input.expiresAt.getTime() / 1000))
    .sign(PLATFORM_JWT_SECRET);
  return token;
}

export function setImpersonationCookie(response: NextResponse, token: string, expiresAt: Date) {
  response.cookies.set(IMPERSONATION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    expires: expiresAt,
  });
  return response;
}

export function clearImpersonationCookie(response: NextResponse) {
  response.cookies.set(IMPERSONATION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    expires: new Date(0),
  });
  return response;
}

export async function readImpersonation(request: NextRequest): Promise<ImpersonationClaims | null> {
  const cookie = request.cookies.get(IMPERSONATION_COOKIE)?.value;
  if (!cookie) return null;
  try {
    const { payload } = await jwtVerify(cookie, PLATFORM_JWT_SECRET);
    return payload as unknown as ImpersonationClaims;
  } catch {
    return null;
  }
}

export async function isImpersonationActive(impersonationId: number): Promise<boolean> {
  const [row] = await db
    .select({ id: impersonationSessions.id, expiresAt: impersonationSessions.expiresAt })
    .from(impersonationSessions)
    .where(and(eq(impersonationSessions.id, impersonationId), isNull(impersonationSessions.endedAt)))
    .limit(1);
  if (!row) return false;
  return row.expiresAt.getTime() > Date.now();
}

/**
 * Compile-time forbid list — irreversible or high-blast-radius tenant actions
 * that MUST NOT run through an impersonated request even if the impersonated
 * user has the tenant permission. Enforced server-side in the tenant handlers
 * via `assertNotImpersonating(action)`.
 *
 * Anything an admin needs to do that lives on this list should be exposed as
 * a platform-panel action instead — where the audit trail is under the admin's
 * identity, not fig-leafed through the tenant user.
 */
export const IMPERSONATION_FORBIDDEN_TENANT_ACTIONS = new Set<string>([
  "payroll.approve",
  "payroll.submit",
  "payroll.off_cycle.approve",
  "employee.delete",
  "employee.terminate",
  "bank.change",
  "bank.remove",
  "billing.change_plan",
  "billing.update_payment_method",
  "tax.submit_filing",
  "settings.transfer_ownership",
  "user.delete",
  "user.change_email",
  "api_key.create",
  "api_key.rotate",
]);

export type ImpersonationForbiddenAction = string;

export function assertNotImpersonatingOr(action: string, impersonating: boolean): void {
  if (!impersonating) return;
  if (IMPERSONATION_FORBIDDEN_TENANT_ACTIONS.has(action)) {
    const err = new Error(
      `impersonation_forbidden_action: '${action}' cannot be performed during an impersonation session`,
    );
    (err as Error & { code?: string }).code = "IMPERSONATION_FORBIDDEN";
    throw err;
  }
}
