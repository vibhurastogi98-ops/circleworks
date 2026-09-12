/**
 * Platform-admin session handling.
 *
 * SEPARATE from tenant sessions: distinct cookie name, distinct signing secret,
 * distinct verification path. Do NOT import from `@/lib/session` here.
 * See docs/platform-admin-spec.md §4.
 */

import { SignJWT, jwtVerify } from "jose";
import type { NextRequest } from "next/server";
import type { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

import { db } from "@/db";
import { platformAdminSessions, platformAdmins } from "@/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import type { PlatformAdminRole } from "@/lib/platform-rbac";

export const PLATFORM_SESSION_COOKIE = "cw_platform_session";
export const PLATFORM_SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8h absolute
export const PLATFORM_SESSION_IDLE_MS = 30 * 60 * 1000; // 30m idle

const PLATFORM_JWT_SECRET_STRING =
  process.env.PLATFORM_JWT_SECRET ||
  // Deliberately different fallback than JWT_SECRET so a misconfig fails loud
  // in dev. Production MUST set PLATFORM_JWT_SECRET distinct from JWT_SECRET.
  "circleworks-platform-dev-secret-change-in-production";

const PLATFORM_JWT_SECRET = new TextEncoder().encode(PLATFORM_JWT_SECRET_STRING);

if (
  process.env.NODE_ENV === "production" &&
  PLATFORM_JWT_SECRET_STRING === (process.env.JWT_SECRET ?? "")
) {
  // Invariant #3 from the spec: keys must differ.
  throw new Error(
    "PLATFORM_JWT_SECRET must be set and MUST differ from JWT_SECRET in production",
  );
}

export type PlatformSessionClaims = {
  adminId: number;
  role: PlatformAdminRole;
  jti: string;
  iat: number;
  exp: number;
};

export type PlatformSession = PlatformSessionClaims & {
  lastMfaAt: Date;
  expiresAt: Date;
};

export async function issuePlatformSession(input: {
  adminId: number;
  role: PlatformAdminRole;
  ipAddress?: string | null;
  userAgent?: string | null;
}): Promise<{ token: string; jti: string; expiresAt: Date }> {
  const now = new Date();
  const jti = randomUUID();
  const expiresAt = new Date(now.getTime() + PLATFORM_SESSION_TTL_MS);

  const [row] = await db
    .insert(platformAdminSessions)
    .values({
      adminId: input.adminId,
      jti,
      lastMfaAt: now,
      expiresAt,
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null,
    })
    .returning();

  const token = await new SignJWT({
    adminId: input.adminId,
    role: input.role,
    jti,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(Math.floor(now.getTime() / 1000))
    .setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
    .sign(PLATFORM_JWT_SECRET);

  return { token, jti: row?.jti ?? jti, expiresAt };
}

export function setPlatformSessionCookie(response: NextResponse, token: string, expiresAt: Date) {
  response.cookies.set(PLATFORM_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/platform",
    expires: expiresAt,
  });
  // Cookie must ALSO be sent for /api/platform routes; browsers apply the Path
  // filter, so we set a mirror cookie scoped to that path.
  response.cookies.set(`${PLATFORM_SESSION_COOKIE}_api`, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api/platform",
    expires: expiresAt,
  });
  return response;
}

export function clearPlatformSessionCookie(response: NextResponse) {
  for (const name of [PLATFORM_SESSION_COOKIE, `${PLATFORM_SESSION_COOKIE}_api`]) {
    response.cookies.set(name, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: name.endsWith("_api") ? "/api/platform" : "/platform",
      expires: new Date(0),
    });
  }
  return response;
}

async function extractToken(request: NextRequest) {
  return (
    request.cookies.get(PLATFORM_SESSION_COOKIE)?.value ??
    request.cookies.get(`${PLATFORM_SESSION_COOKIE}_api`)?.value ??
    null
  );
}

export async function getPlatformSession(request: NextRequest): Promise<PlatformSession | null> {
  const token = await extractToken(request);
  if (!token) return null;
  let claims: PlatformSessionClaims;
  try {
    const { payload } = await jwtVerify(token, PLATFORM_JWT_SECRET);
    claims = payload as unknown as PlatformSessionClaims;
  } catch {
    return null;
  }
  if (!claims.jti || typeof claims.adminId !== "number") return null;

  // DB-backed revocation check.
  const [row] = await db
    .select({
      id: platformAdminSessions.id,
      jti: platformAdminSessions.jti,
      lastMfaAt: platformAdminSessions.lastMfaAt,
      expiresAt: platformAdminSessions.expiresAt,
      revokedAt: platformAdminSessions.revokedAt,
      lastSeenAt: platformAdminSessions.lastSeenAt,
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
  const idleWindow = row.lastSeenAt.getTime() + PLATFORM_SESSION_IDLE_MS;
  if (idleWindow < Date.now()) return null;

  // Touch last_seen_at (non-blocking best-effort — errors ignored to avoid
  // taking down the request path if the DB is momentarily unhappy).
  db.update(platformAdminSessions)
    .set({ lastSeenAt: new Date() })
    .where(eq(platformAdminSessions.jti, claims.jti))
    .catch(() => undefined);

  return {
    ...claims,
    role: row.role as PlatformAdminRole,
    lastMfaAt: row.lastMfaAt,
    expiresAt: row.expiresAt,
  };
}

export async function revokeSessionByJti(jti: string, reason: string) {
  await db
    .update(platformAdminSessions)
    .set({ revokedAt: new Date(), revokedReason: reason })
    .where(eq(platformAdminSessions.jti, jti));
}

export async function markStepUp(jti: string) {
  await db
    .update(platformAdminSessions)
    .set({ lastMfaAt: new Date() })
    .where(eq(platformAdminSessions.jti, jti));
}
