/**
 * Server-component variant of getPlatformSession that reads cookies via
 * next/headers instead of a NextRequest.
 */
import "server-only";

import { cookies, headers } from "next/headers";
import { jwtVerify } from "jose";
import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { platformAdminSessions, platformAdmins } from "@/db/schema";
import {
  PLATFORM_SESSION_COOKIE,
  PLATFORM_SESSION_IDLE_MS,
  type PlatformSession,
  type PlatformSessionClaims,
} from "@/lib/platform-session";
import type { PlatformAdminRole } from "@/lib/platform-rbac";

const PLATFORM_JWT_SECRET = new TextEncoder().encode(
  process.env.PLATFORM_JWT_SECRET || "circleworks-platform-dev-secret-change-in-production",
);

export async function getPlatformSessionServer(): Promise<PlatformSession | null> {
  const jar = await cookies();
  const token = jar.get(PLATFORM_SESSION_COOKIE)?.value ?? jar.get(`${PLATFORM_SESSION_COOKIE}_api`)?.value;
  if (!token) return null;
  let claims: PlatformSessionClaims;
  try {
    const { payload } = await jwtVerify(token, PLATFORM_JWT_SECRET);
    claims = payload as unknown as PlatformSessionClaims;
  } catch {
    return null;
  }
  if (!claims.jti) return null;

  const [row] = await db
    .select({
      jti: platformAdminSessions.jti,
      lastMfaAt: platformAdminSessions.lastMfaAt,
      lastSeenAt: platformAdminSessions.lastSeenAt,
      expiresAt: platformAdminSessions.expiresAt,
      adminId: platformAdminSessions.adminId,
      role: platformAdmins.role,
      status: platformAdmins.status,
    })
    .from(platformAdminSessions)
    .innerJoin(platformAdmins, eq(platformAdminSessions.adminId, platformAdmins.id))
    .where(and(eq(platformAdminSessions.jti, claims.jti), isNull(platformAdminSessions.revokedAt)))
    .limit(1);

  if (!row) return null;
  if (row.status !== "active") return null;
  if (row.expiresAt.getTime() < Date.now()) return null;
  if (row.lastSeenAt.getTime() + PLATFORM_SESSION_IDLE_MS < Date.now()) return null;

  return {
    adminId: claims.adminId,
    role: row.role as PlatformAdminRole,
    jti: claims.jti,
    iat: claims.iat,
    exp: claims.exp,
    lastMfaAt: row.lastMfaAt,
    expiresAt: row.expiresAt,
  };
}

/** Convenience: throw redirect() if not signed in. */
export async function requirePlatformSession(): Promise<PlatformSession> {
  const session = await getPlatformSessionServer();
  if (!session) {
    const { redirect } = await import("next/navigation");
    redirect("/platform/login");
  }
  return session as PlatformSession;
}

export async function currentRequestMetadata() {
  const h = await headers();
  return {
    ipAddress: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    userAgent: h.get("user-agent"),
  };
}
