// middleware (edge-safe) — only verify the JWT/cookie
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose"; // ✅ edge-compatible

const PROTECTED_ROUTES = [
  "/dashboard",
  "/employees",
  "/payroll",
  "/settings",
  "/me",
  "/onboarding",
  "/benefits",
  "/time",
  "/compliance",
  "/reports",
  "/agency",
  "/hiring",
  "/learning",
  "/performance",
  "/contractors",
  "/accountant-portal",
];

function isProtected(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/employees/:path*",
    "/payroll/:path*",
    "/settings/:path*",
    "/me/:path*",
    "/onboarding/:path*",
    "/benefits/:path*",
    "/time/:path*",
    "/compliance/:path*",
    "/reports/:path*",
    "/agency/:path*",
    "/hiring/:path*",
    "/learning/:path*",
    "/performance/:path*",
    "/contractors/:path*",
    "/accountant-portal/:path*",
  ],
};

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!isProtected(pathname)) return NextResponse.next();

  const token = req.cookies.get("session")?.value;
  const secret = process.env.JWT_SECRET;

  if (!token || !secret) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}