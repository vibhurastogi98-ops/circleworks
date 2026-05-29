import crypto from "crypto";
import { SignJWT, errors as joseErrors, jwtVerify } from "jose";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";

const RESET_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "circleworks-dev-secret-change-in-production"
);

export const RESET_TOKEN_EXPIRY_MINUTES = 15;
export const RESET_RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;
export const RESET_RATE_LIMIT_LIMIT = 3;
export const RESET_RATE_LIMIT_BLOCK_MS = 10 * 60 * 1000;

type ResetUser = {
  id: number;
  clerkUserId: string | null;
  passwordHash: string | null;
};

type UsedTokenEntry = {
  usedAt: number;
  expiresAt: number;
};

type RateLimitEntry = {
  timestamps: number[];
  blockedUntil: number | null;
};

export type ResetTokenStatus = "valid" | "expired" | "used" | "invalid";

export type ResetTokenValidation = {
  status: ResetTokenStatus;
  user?: ResetUser;
};

const usedResetTokens = new Map<string, UsedTokenEntry>();
const resetRateLimitStore = new Map<string, RateLimitEntry>();

function tokenFingerprint(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function passwordFingerprint(passwordHash: string | null | undefined) {
  return crypto
    .createHash("sha256")
    .update(passwordHash || "no-password-hash")
    .digest("hex");
}

function pruneUsedTokens() {
  const now = Date.now();
  usedResetTokens.forEach((entry, key) => {
    if (entry.expiresAt <= now) usedResetTokens.delete(key);
  });
}

export function getPasswordResetRateLimit(key: string) {
  const now = Date.now();
  const entry = resetRateLimitStore.get(key) ?? {
    timestamps: [],
    blockedUntil: null,
  };

  if (entry.blockedUntil && entry.blockedUntil > now) {
    return {
      limited: true,
      retryAfterSeconds: Math.ceil((entry.blockedUntil - now) / 1000),
    };
  }

  const timestamps = entry.timestamps.filter(
    (timestamp) => now - timestamp < RESET_RATE_LIMIT_WINDOW_MS
  );

  if (timestamps.length >= RESET_RATE_LIMIT_LIMIT) {
    const blockedUntil = now + RESET_RATE_LIMIT_BLOCK_MS;
    resetRateLimitStore.set(key, { timestamps, blockedUntil });
    return {
      limited: true,
      retryAfterSeconds: RESET_RATE_LIMIT_BLOCK_MS / 1000,
    };
  }

  resetRateLimitStore.set(key, {
    timestamps: [...timestamps, now],
    blockedUntil: null,
  });

  return { limited: false, retryAfterSeconds: 0 };
}

export async function createPasswordResetToken(
  userId: number,
  passwordHash?: string | null
) {
  return new SignJWT({
    sub: String(userId),
    type: "password-reset",
    jti: crypto.randomUUID(),
    pwd: passwordFingerprint(passwordHash),
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${RESET_TOKEN_EXPIRY_MINUTES}m`)
    .sign(RESET_SECRET);
}

export async function validatePasswordResetToken(
  token: string
): Promise<ResetTokenValidation> {
  if (!token) return { status: "invalid" };

  pruneUsedTokens();

  if (usedResetTokens.has(tokenFingerprint(token))) {
    return { status: "used" };
  }

  try {
    const { payload } = await jwtVerify(token, RESET_SECRET);

    if (payload.type !== "password-reset") {
      return { status: "invalid" };
    }

    const userId = Number(payload.sub);
    if (!Number.isFinite(userId) || userId <= 0) {
      return { status: "invalid" };
    }

    const [user] = await db
      .select({
        id: users.id,
        clerkUserId: users.clerkUserId,
        passwordHash: users.passwordHash,
      })
      .from(users)
      .where(eq(users.id, userId));

    if (!user) return { status: "invalid" };

    if (typeof payload.pwd !== "string") {
      return { status: "invalid" };
    }

    if (payload.pwd !== passwordFingerprint(user.passwordHash)) {
      return { status: "used" };
    }

    return { status: "valid", user };
  } catch (error) {
    if (error instanceof joseErrors.JWTExpired) {
      return { status: "expired" };
    }

    return { status: "invalid" };
  }
}

export function markPasswordResetTokenUsed(token: string) {
  pruneUsedTokens();
  usedResetTokens.set(tokenFingerprint(token), {
    usedAt: Date.now(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
  });
}
