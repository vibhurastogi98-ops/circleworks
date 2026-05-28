import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import { z } from "zod";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "circleworks-dev-secret-change-in-production"
);

const APP_URL = process.env.NEXT_PUBLIC_APP_URL
  ? process.env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, "")
  : "http://localhost:3000";

const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;
const RATE_LIMIT_LIMIT = 3;
const RATE_LIMIT_BLOCK_MS = 10 * 60 * 1000;

const forgotPasswordSchema = z.object({
  email: z.string().trim().email(),
});

type RateLimitEntry = {
  timestamps: number[];
  blockedUntil: number | null;
};

const rateLimitStore = new Map<string, RateLimitEntry>();

function getClientIp(req: NextRequest) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

function checkRateLimit(key: string) {
  const now = Date.now();
  const entry = rateLimitStore.get(key) ?? { timestamps: [], blockedUntil: null };

  if (entry.blockedUntil && entry.blockedUntil > now) {
    return {
      limited: true,
      retryAfterSeconds: Math.ceil((entry.blockedUntil - now) / 1000),
    };
  }

  const timestamps = entry.timestamps.filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS
  );

  if (timestamps.length >= RATE_LIMIT_LIMIT) {
    const blockedUntil = now + RATE_LIMIT_BLOCK_MS;
    rateLimitStore.set(key, { timestamps, blockedUntil });
    return { limited: true, retryAfterSeconds: RATE_LIMIT_BLOCK_MS / 1000 };
  }

  rateLimitStore.set(key, { timestamps: [...timestamps, now], blockedUntil: null });
  return { limited: false, retryAfterSeconds: 0 };
}

export async function POST(req: NextRequest) {
  try {
    const parsed = forgotPasswordSchema.safeParse(await req.json());

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    const normalizedEmail = parsed.data.email.toLowerCase();
    const rateLimit = checkRateLimit(`${getClientIp(req)}:${normalizedEmail}`);

    if (rateLimit.limited) {
      return NextResponse.json(
        {
          error: "Too many requests. Try again in 10 minutes.",
          retryAfterSeconds: rateLimit.retryAfterSeconds,
        },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
        }
      );
    }

    const [user] = await db.select().from(users).where(eq(users.email, normalizedEmail));

    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If email exists, a reset link has been sent.",
      });
    }

    const token = await new SignJWT({ sub: String(user.id), type: "password-reset" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(SECRET);

    const resetUrl = `${APP_URL}/reset-password?token=${encodeURIComponent(token)}`;
    console.log(`[Password Reset] send reset link to ${normalizedEmail}: ${resetUrl}`);

    return NextResponse.json({
      success: true,
      message: "If email exists, a reset link has been sent.",
    });
  } catch (error) {
    console.error("[Forgot Password Error]", error);
    return NextResponse.json({ error: "Unable to process request" }, { status: 500 });
  }
}
