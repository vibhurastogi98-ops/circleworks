import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { users } from "@/db/schema";
import { sendTransactionalEmail } from "@/lib/email";
import {
  createPasswordResetToken,
  getPasswordResetRateLimit,
} from "@/lib/password-reset";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL
  ? process.env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, "")
  : "http://localhost:3000";

const forgotPasswordSchema = z.object({
  email: z.string().trim().email(),
});

function getClientIp(req: NextRequest) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

function successResponse() {
  return NextResponse.json({
    success: true,
    message: "If email exists, a reset link has been sent.",
  });
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
    const rateLimit = getPasswordResetRateLimit(`${getClientIp(req)}:${normalizedEmail}`);

    if (rateLimit.limited) {
      return NextResponse.json(
        {
          error:
            "Too many requests. Please wait 10 minutes before requesting another reset link.",
          retryAfterSeconds: rateLimit.retryAfterSeconds,
        },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
        }
      );
    }

    const [user] = await db
      .select({ id: users.id, passwordHash: users.passwordHash })
      .from(users)
      .where(eq(users.email, normalizedEmail));

    if (!user) {
      return successResponse();
    }

    const token = await createPasswordResetToken(user.id, user.passwordHash);
    const resetUrl = `${APP_URL}/reset-password?token=${encodeURIComponent(token)}`;

    console.log(`[Password Reset] send reset link to ${normalizedEmail}: ${resetUrl}`);
    await sendTransactionalEmail({
      to: normalizedEmail,
      template: "password-reset",
      variables: { reset_url: resetUrl },
      messageStream: "outbound",
    });

    return successResponse();
  } catch (error) {
    console.error("[Forgot Password Error]", error);
    return NextResponse.json({ error: "Unable to process request" }, { status: 500 });
  }
}
