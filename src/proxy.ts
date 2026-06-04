import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSupabaseMiddlewareClient } from "@/lib/supabase";
import { jwtVerify } from "jose";
import { SESSION_COOKIE } from "@/lib/session";
import { getCapabilityRouteRedirect } from "@/lib/capability-routes";
import {
  getRequiredApiPermission,
  getRequiredScreenPermission,
  hasPermission,
} from "@/lib/rbac";

const SESSION_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "circleworks-dev-secret-change-in-production"
);

type ProxySession = {
  role: string;
  accountType: string | null;
};

async function getJwtSession(request: NextRequest): Promise<ProxySession | null> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SESSION_SECRET);
    return {
      role: (payload.role as string | undefined) ?? "employee",
      accountType: typeof payload.accountType === "string" ? payload.accountType : null,
    };
  } catch {
    return null;
  }
}

function getCapabilityRedirectUrl(
  request: NextRequest,
  accountType: string | null,
  pathname: string,
) {
  const redirectTo = getCapabilityRouteRedirect(accountType, pathname);
  if (!redirectTo || redirectTo === pathname) return null;
  return new URL(redirectTo, request.url);
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();
  const apiPermission = getRequiredApiPermission(pathname, request.method);

  const protectedPrefixes = [
    "/dashboard",
    "/app",
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
    "/contractor-portal",
    "/accountant-portal",
    "/c/",
  ];

  const needsAuth = Boolean(apiPermission) || protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`) || pathname.startsWith(prefix)
  );

  if (needsAuth) {
    const jwtSession = await getJwtSession(request);
    if (jwtSession) {
      const requiredPermission = apiPermission ?? getRequiredScreenPermission(pathname);
      if (requiredPermission && !hasPermission(jwtSession.role, requiredPermission)) {
        if (apiPermission) {
          return NextResponse.json(
            { error: "insufficient_permissions", required: requiredPermission },
            { status: 403 }
          );
        }

        const deniedUrl = new URL("/app/dashboard", request.url);
        deniedUrl.searchParams.set("error", "insufficient_permissions");
        deniedUrl.searchParams.set("required", requiredPermission);
        return NextResponse.redirect(deniedUrl);
      }

      if (!apiPermission) {
        const capabilityRedirectUrl = getCapabilityRedirectUrl(request, jwtSession.accountType, pathname);
        if (capabilityRedirectUrl) return NextResponse.redirect(capabilityRedirectUrl);
      }

      return response;
    }

    const supabase = createSupabaseMiddlewareClient(request, response);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const role = (user.user_metadata?.role as string | undefined) ?? "employee";
      const accountType =
        typeof user.user_metadata?.accountType === "string"
          ? user.user_metadata.accountType
          : null;
      const requiredPermission = apiPermission ?? getRequiredScreenPermission(pathname);
      if (requiredPermission && !hasPermission(role, requiredPermission)) {
        if (apiPermission) {
          return NextResponse.json(
            { error: "insufficient_permissions", required: requiredPermission },
            { status: 403 }
          );
        }

        const deniedUrl = new URL("/app/dashboard", request.url);
        deniedUrl.searchParams.set("error", "insufficient_permissions");
        deniedUrl.searchParams.set("required", requiredPermission);
        return NextResponse.redirect(deniedUrl);
      }

      if (!apiPermission) {
        const capabilityRedirectUrl = getCapabilityRedirectUrl(request, accountType, pathname);
        if (capabilityRedirectUrl) return NextResponse.redirect(capabilityRedirectUrl);
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
