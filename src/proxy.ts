import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSupabaseMiddlewareClient } from "@/lib/supabase";
import { jwtVerify } from "jose";
import { SESSION_COOKIE } from "@/lib/session";
import {
  getRequiredApiPermission,
  getRequiredScreenPermission,
  hasPermission,
} from "@/lib/rbac";

const SESSION_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "circleworks-dev-secret-change-in-production"
);

async function getJwtSessionRole(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, SESSION_SECRET);
    return (payload.role as string | undefined) ?? "employee";
  } catch {
    return false;
  }
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();
  const apiPermission = getRequiredApiPermission(pathname, request.method);

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

  const needsAuth = Boolean(apiPermission) || protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`) || pathname.startsWith(prefix)
  );

  if (needsAuth) {
    const jwtRole = await getJwtSessionRole(request);
    if (jwtRole) {
      const requiredPermission = apiPermission ?? getRequiredScreenPermission(pathname);
      if (requiredPermission && !hasPermission(jwtRole, requiredPermission)) {
        if (apiPermission) {
          return NextResponse.json(
            { error: "insufficient_permissions", required: requiredPermission },
            { status: 403 }
          );
        }

        const deniedUrl = new URL("/dashboard", request.url);
        deniedUrl.searchParams.set("error", "insufficient_permissions");
        deniedUrl.searchParams.set("required", requiredPermission);
        return NextResponse.redirect(deniedUrl);
      }

      return response;
    }

    const supabase = createSupabaseMiddlewareClient(request, response);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const role = (user.user_metadata?.role as string | undefined) ?? "employee";
      const requiredPermission = apiPermission ?? getRequiredScreenPermission(pathname);
      if (requiredPermission && !hasPermission(role, requiredPermission)) {
        if (apiPermission) {
          return NextResponse.json(
            { error: "insufficient_permissions", required: requiredPermission },
            { status: 403 }
          );
        }

        const deniedUrl = new URL("/dashboard", request.url);
        deniedUrl.searchParams.set("error", "insufficient_permissions");
        deniedUrl.searchParams.set("required", requiredPermission);
        return NextResponse.redirect(deniedUrl);
      }

      return response;
    }

    if (apiPermission) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
