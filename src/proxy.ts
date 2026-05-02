import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "cw_session";
const SESSION_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "circleworks-dev-secret-change-in-production"
);

async function hasValidSession(request: NextRequest) {
  const sessionCookie = request.cookies.get(SESSION_COOKIE)?.value;
  if (!sessionCookie) return false;

  try {
    await jwtVerify(sessionCookie, SESSION_SECRET);
    return true;
  } catch {
    return false;
  }
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

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

  if (needsAuth && !(await hasValidSession(request))) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
