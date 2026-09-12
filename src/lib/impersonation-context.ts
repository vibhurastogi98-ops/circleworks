/**
 * Server-side impersonation context helpers.
 *
 * Tenant route handlers that mutate should call `assertImpersonationAllowsAction`
 * before doing their write. `getImpersonationFromCookies()` is safe to call
 * anywhere in an RSC / route handler.
 */
import "server-only";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { impersonationSessions } from "@/db/schema";
import {
  IMPERSONATION_COOKIE,
  IMPERSONATION_FORBIDDEN_TENANT_ACTIONS,
} from "@/lib/platform-impersonation";

const PLATFORM_JWT_SECRET = new TextEncoder().encode(
  process.env.PLATFORM_JWT_SECRET || "circleworks-platform-dev-secret-change-in-production",
);

export type ImpersonationContext = {
  impersonationId: number;
  adminId: number;
  targetUserId: number;
  targetCompanyId: number;
  expiresAt: Date;
};

export async function getImpersonationFromCookies(): Promise<ImpersonationContext | null> {
  const jar = await cookies();
  const raw = jar.get(IMPERSONATION_COOKIE)?.value;
  if (!raw) return null;
  let claims: {
    impersonationId: number;
    adminId: number;
    targetUserId: number;
    targetCompanyId: number;
    exp: number;
  };
  try {
    const { payload } = await jwtVerify(raw, PLATFORM_JWT_SECRET);
    claims = payload as unknown as typeof claims;
  } catch {
    return null;
  }
  const [row] = await db
    .select({ id: impersonationSessions.id, expiresAt: impersonationSessions.expiresAt })
    .from(impersonationSessions)
    .where(and(eq(impersonationSessions.id, claims.impersonationId), isNull(impersonationSessions.endedAt)))
    .limit(1);
  if (!row) return null;
  if (row.expiresAt.getTime() < Date.now()) return null;
  return { ...claims, expiresAt: row.expiresAt };
}

/**
 * Throw if `action` is in the impersonation forbid-list AND we're inside an
 * impersonation session. Tenant mutating handlers must call this at the top.
 * Returns the context (or null) so the caller can double-audit.
 */
export async function assertImpersonationAllowsAction(action: string): Promise<ImpersonationContext | null> {
  const ctx = await getImpersonationFromCookies();
  if (!ctx) return null;
  if (IMPERSONATION_FORBIDDEN_TENANT_ACTIONS.has(action)) {
    const err = new Error(
      `impersonation_forbidden_action: '${action}' cannot be performed during an impersonation session`,
    );
    (err as Error & { code?: string; status?: number }).code = "IMPERSONATION_FORBIDDEN";
    (err as Error & { status?: number }).status = 403;
    throw err;
  }
  return ctx;
}
