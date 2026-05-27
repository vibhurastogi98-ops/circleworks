import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { db } from "@/db";
import { users, employees } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createSessionToken, SESSION_COOKIE } from "@/lib/session";
import { warmDashboardCacheOnLogin } from "@/lib/cache-warm";

export async function POST(req: NextRequest) {
  try {
    const { email, password, rememberMe } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const pendingCookies: { name: string; value: string; options: Record<string, unknown> }[] = [];

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach((cookie) => pendingCookies.push(cookie));
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

    const [empRow] = await db
      .select({ companyId: employees.companyId })
      .from(employees)
      .where(eq(employees.userId, appUser.id))
      .limit(1);
    if (empRow?.companyId != null) {
      void warmDashboardCacheOnLogin(appUser.id, empRow.companyId);
    }

    const sessionToken = await createSessionToken(
      {
        userId: appUser.id,
        email: appUser.email,
        role: appUser.role ?? "employee",
      },
      Boolean(rememberMe)
    );

    let redirectTo = "/dashboard";
    if (appUser.role === "accountant") {
      redirectTo = "/accountant-portal";
    } else if (appUser.role === "contractor") {
      redirectTo = "/contractor-portal";
    }
    const response = NextResponse.json({ success: true, redirectTo });

    pendingCookies.forEach(({ name, value, options }) =>
      response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
    );

    response.cookies.set(SESSION_COOKIE, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: Boolean(rememberMe) ? 60 * 60 * 24 * 30 : 60 * 60 * 24,
    });

    return response;
  } catch (err) {
    console.error("[Auth Login Error]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
