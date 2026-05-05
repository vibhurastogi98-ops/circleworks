import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createSessionToken, SESSION_COOKIE } from "@/lib/session";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/dashboard";
  const mode = searchParams.get("mode"); // "signup" | undefined

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
  }

  // Build the response early so we can write Supabase session cookies onto it
  const response = NextResponse.redirect(`${origin}${next}`);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("[Auth Callback] exchangeCodeForSession error:", error.message);
    return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
  }

  const normalizedEmail = user.email.toLowerCase().trim();

  const [appUser] = await db
    .select({ id: users.id, email: users.email, role: users.role })
    .from(users)
    .where(eq(users.email, normalizedEmail));

  if (appUser) {
    // Existing user — mint a JWT session and go to destination
    const token = await createSessionToken({
      userId: appUser.id,
      email: appUser.email,
      role: appUser.role ?? "employee",
    });
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
    return response;
  }

  // New user — redirect to signup wizard (step 2: company setup)
  const fullName =
    (user.user_metadata?.full_name as string) ||
    (user.user_metadata?.name as string) ||
    "";

  const params = new URLSearchParams({
    mode: "google",
    email: normalizedEmail,
    name: fullName,
  });

  if (mode === "signup") {
    return NextResponse.redirect(`${origin}/signup?${params.toString()}`);
  }

  // Came from login but no account exists — send to signup
  return NextResponse.redirect(`${origin}/signup?${params.toString()}`);
}
