import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { jwtVerify } from "jose";
import { z } from "zod";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword } from "@/lib/password";
import { SESSION_COOKIE } from "@/lib/session";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "circleworks-dev-secret-change-in-production"
);

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

async function verifyResetToken(token: string) {
  const { payload } = await jwtVerify(token, SECRET);

  if (payload.type !== "password-reset") {
    return null;
  }

  const userId = Number(payload.sub);
  if (!userId) return null;

  const [user] = await db
    .select({ id: users.id, clerkUserId: users.clerkUserId })
    .from(users)
    .where(eq(users.id, userId));

  return user ?? null;
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }

  try {
    const user = await verifyResetToken(token);
    if (!user) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    return NextResponse.json({ valid: true });
  } catch {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }
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

    const user = await verifyResetToken(parsed.data.token);

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    const passwordHash = hashPassword(parsed.data.password);

    await db
      .update(users)
      .set({ passwordHash })
      .where(eq(users.id, user.id));

    if (user.clerkUserId) {
      const supabaseAdmin = getSupabaseAdmin();

      if (!supabaseAdmin) {
        return NextResponse.json(
          { error: "Unable to reset password. Please try again." },
          { status: 500 }
        );
      }

      const { error } = await supabaseAdmin.auth.admin.updateUserById(user.clerkUserId, {
        password: parsed.data.password,
      });

      if (error) {
        console.error("[Reset Password] Supabase password update failed:", error.message);
        return NextResponse.json(
          { error: "Unable to reset password. Please try again." },
          { status: 500 }
        );
      }
    }

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
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }
}
