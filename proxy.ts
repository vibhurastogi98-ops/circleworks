import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession } from "@/lib/session";

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

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!isProtected(pathname)) {
    return NextResponse.next();
  }

  const session = await getSession(req);
  if (!session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}
