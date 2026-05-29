import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { db } from "@/db";
import { users, employees } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createSessionToken, SESSION_COOKIE } from "@/lib/session";
import { warmDashboardCacheOnLogin } from "@/lib/cache-warm";

const FAILED_LOGIN_LIMIT = 5;
const LOGIN_LOCK_MS = 15 * 60 * 1000;
const failedLoginStore = new Map<string, { count: number; lockedUntil: number | null }>();

function getLockedResponse(email: string) {
  const state = failedLoginStore.get(email);
  if (!state?.lockedUntil) return null;

  const now = Date.now();
  if (state.lockedUntil <= now) {
    failedLoginStore.delete(email);
    return null;
  }

  return NextResponse.json(
    {
      error: "account_locked",
      message: "Account temporarily locked. Wait 15 minutes or reset your password.",
      retryAfterSeconds: Math.ceil((state.lockedUntil - now) / 1000),
    },
    { status: 423 }
  );
}

function recordFailedLogin(email: string) {
  const current = failedLoginStore.get(email) ?? { count: 0, lockedUntil: null };
  const nextCount = current.count + 1;

  if (nextCount >= FAILED_LOGIN_LIMIT) {
    failedLoginStore.set(email, {
      count: nextCount,
      lockedUntil: Date.now() + LOGIN_LOCK_MS,
    });
  } else {
    failedLoginStore.set(email, { count: nextCount, lockedUntil: null });
  }
}

function isUnverifiedEmailError(message: string | undefined) {
  const normalized = message?.toLowerCase() ?? "";
  return (
    normalized.includes("email not confirmed") ||
    normalized.includes("not confirmed") ||
    normalized.includes("verify your email") ||
    normalized.includes("unverified")
  );
}

export async function POST(req: NextRequest) {
  try {
    const { email, password, rememberMe } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const lockedResponse = getLockedResponse(normalizedEmail);
    if (lockedResponse) return lockedResponse;

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
      email: normalizedEmail,
      password,
    });

    if (error || !data.session) {
      console.error("[Auth Login Error]", error?.message);
      if (isUnverifiedEmailError(error?.message)) {
        return NextResponse.json(
          {
            error: "unverified_email",
            message: "Please verify your email. Resend verification →",
          },
          { status: 403 }
        );
      }
      if (
        error?.message?.toLowerCase().includes("invalid") ||
        error?.message?.toLowerCase().includes("credentials") ||
        error?.code === "invalid_credentials"
      ) {
        recordFailedLogin(normalizedEmail);
        const lockedAfterFailure = getLockedResponse(normalizedEmail);
        if (lockedAfterFailure) return lockedAfterFailure;
        return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
      }
      return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
    }

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

    failedLoginStore.delete(normalizedEmail);

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
