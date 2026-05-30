import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createSessionToken, SESSION_COOKIE } from "@/lib/session";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const requestedNext = searchParams.get("next");
  const requestedAccountType = searchParams.get("accountType");
  const next = requestedNext?.startsWith("/") ? requestedNext : null;
  const accountType =
    requestedAccountType === "company" ||
    requestedAccountType === "agency" ||
    requestedAccountType === "creator_solo"
      ? requestedAccountType
      : null;

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
  }

  // Collect cookies set during code exchange — applied to the final response
  // after we know the destination, so they aren't lost on new-user redirects.
  const pendingCookies: { name: string; value: string; options: Record<string, unknown> }[] = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach((c) => pendingCookies.push(c));
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("[Auth Callback] exchangeCodeForSession error:", error.message);
    return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
  }

  const normalizedEmail = user.email.toLowerCase().trim();

  const [appUser] = await db
    .select({ id: users.id, email: users.email, role: users.role })
    .from(users)
    .where(eq(users.email, normalizedEmail));

  // Determine destination before building the response
  let destination: string;
  if (appUser) {
    let fallbackNext = "/dashboard";
    if (appUser.role === "accountant") {
      fallbackNext = "/accountant-portal";
    } else if (appUser.role === "contractor") {
      fallbackNext = "/contractor-portal";
    }
    destination = `${origin}${next || fallbackNext}`;
  } else {
    const fullName =
      (user.user_metadata?.full_name as string) ||
      (user.user_metadata?.name as string) ||
      "";
    const authProvider =
      typeof user.app_metadata?.provider === "string" ? user.app_metadata.provider : "";
    const signupMode =
      authProvider === "azure" || authProvider === "microsoft" ? "microsoft" : "google";
    const params = new URLSearchParams({ mode: signupMode, email: normalizedEmail, name: fullName });
    if (accountType) params.set("accountType", accountType);
    destination = `${origin}/signup?${params.toString()}`;
  }

  // Build response with correct destination, then apply all pending cookies
  const response = NextResponse.redirect(destination);
  pendingCookies.forEach(({ name, value, options }) =>
    response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
  );

  if (appUser) {
    // Mint a JWT session for existing users
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
  }

  return response;
}
