import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSupabaseMiddlewareClient } from "@/lib/supabase";

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  const protectedPrefixes = [
    "/dashboard",
    "/me",
    "/employees",
    "/payroll",
    "/time",
    "/compliance",
    "/reports",
    "/onboarding",
    "/benefits",
    "/expenses",
    "/settings",
    "/agency",
    "/hiring",
    "/learning",
    "/performance",
    "/contractors",
    "/accountant-portal",
    "/c/",
  ];

  const needsAuth = protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`) || pathname.startsWith(prefix));

  if (needsAuth) {
    const supabase = createSupabaseMiddlewareClient(request, response);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      return response;
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
