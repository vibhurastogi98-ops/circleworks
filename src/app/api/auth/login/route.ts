import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createSessionToken, SESSION_COOKIE } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const response = NextResponse.json({ success: true });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password,
    });

    if (error || !data.session) {
      console.error("[Auth Login Error]", error?.message);
      if (
        error?.message?.toLowerCase().includes("invalid") ||
        error?.message?.toLowerCase().includes("credentials") ||
        error?.code === "invalid_credentials"
      ) {
        return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
      }
      return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const [appUser] = await db
      .select({ id: users.id, role: users.role, email: users.email })
      .from(users)
      .where(eq(users.email, normalizedEmail));

    if (!appUser) {
      return NextResponse.json({ error: "Account profile not found" }, { status: 404 });
    }

    const sessionToken = await createSessionToken(
      {
        userId: appUser.id,
        email: appUser.email,
        role: appUser.role ?? "employee",
      },
      false
    );

    response.cookies.set(SESSION_COOKIE, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (err) {
    console.error("[Auth Login Error]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
