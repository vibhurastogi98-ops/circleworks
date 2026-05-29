import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword } from "@/lib/password";
import {
  markPasswordResetTokenUsed,
  validatePasswordResetToken,
} from "@/lib/password-reset";
import { invalidateUserSessions, SESSION_COOKIE } from "@/lib/session";

const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must include an uppercase letter")
      .regex(/[a-z]/, "Password must include a lowercase letter")
      .regex(/[0-9]/, "Password must include a number")
      .regex(/[^A-Za-z0-9]/, "Password must include a special character"),
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) return null;

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function invalidTokenResponse() {
  return NextResponse.json(
    {
      error: "This link has expired.",
      message: "Reset links are valid for 15 minutes.",
      status: "expired",
    },
    { status: 401 }
  );
}

function usedTokenResponse() {
  return NextResponse.json(
    {
      error: "This reset link has already been used. Request a new one.",
      status: "used",
    },
    { status: 409 }
  );
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") || "";
  const validation = await validatePasswordResetToken(token);

  if (validation.status === "used") return usedTokenResponse();
  if (validation.status !== "valid") return invalidTokenResponse();

  return NextResponse.json({ valid: true, status: "valid" });
}

export async function POST(req: NextRequest) {
  try {
    const parsed = resetPasswordSchema.safeParse(await req.json());

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid password reset request" },
        { status: 400 }
      );
    }

    const validation = await validatePasswordResetToken(parsed.data.token);

    if (validation.status === "used") return usedTokenResponse();
    if (validation.status !== "valid" || !validation.user) return invalidTokenResponse();

    const passwordHash = hashPassword(parsed.data.password);

    await db
      .update(users)
      .set({ passwordHash })
      .where(eq(users.id, validation.user.id));

    if (validation.user.clerkUserId) {
      const supabaseAdmin = getSupabaseAdmin();

      if (!supabaseAdmin) {
        return NextResponse.json(
          { error: "Unable to reset password. Please try again." },
          { status: 500 }
        );
      }

      const { error } = await supabaseAdmin.auth.admin.updateUserById(
        validation.user.clerkUserId,
        { password: parsed.data.password }
      );

      if (error) {
        console.error("[Reset Password] Supabase password update failed:", error.message);
        return NextResponse.json(
          { error: "Unable to reset password. Please try again." },
          { status: 500 }
        );
      }
    }

    markPasswordResetTokenUsed(parsed.data.token);
    invalidateUserSessions(validation.user.id);

    const response = NextResponse.json({
      success: true,
      message: "Password reset successful",
      sessionsInvalidated: true,
    });

    response.cookies.set(SESSION_COOKIE, "", {
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error("[Reset Password Error]", error);
    return invalidTokenResponse();
  }
}
