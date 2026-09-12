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
import { PLATFORM_SESSION_COOKIE } from "@/lib/platform-session";

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

const PLATFORM_PUBLIC_PATHS = new Set<string>([
  "/platform/bootstrap",
  "/platform/login",
  "/platform/logout",
  "/api/platform/auth/login",
  "/api/platform/auth/logout",
  "/api/platform/bootstrap",
]);

function isPlatformPath(pathname: string) {
  return pathname === "/platform" ||
    pathname.startsWith("/platform/") ||
    pathname === "/api/platform" ||
    pathname.startsWith("/api/platform/");
}

/**
 * Platform-admin routes run through a completely separate gate that DOES NOT
 * import or call anything from @/lib/rbac, @/lib/capabilities, or
 * @/lib/capability-routes. Enforced by CI grep-check.
 * See docs/platform-admin-spec.md §5.
 */
async function guardPlatformRoute(request: NextRequest): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl;
  if (PLATFORM_PUBLIC_PATHS.has(pathname)) return null;

  const cookie = request.cookies.get(PLATFORM_SESSION_COOKIE)?.value ??
    request.cookies.get(`${PLATFORM_SESSION_COOKIE}_api`)?.value ??
    null;

  if (!cookie) {
    if (pathname.startsWith("/api/platform")) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/platform/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }
  // Middleware only checks presence + signature validity — deeper DB-backed
  // revocation happens inside route handlers via getPlatformSession(). Doing
  // the DB call in middleware would run in the Node-lite runtime and slow
  // every request; the handler-level check is a stricter belt-and-suspenders.
  try {
    // Reuse the platform JWT secret. We import lazily so this file stays
    // free of any circular imports with platform-session.
    const secret = new TextEncoder().encode(
      process.env.PLATFORM_JWT_SECRET || "circleworks-platform-dev-secret-change-in-production",
    );
    await jwtVerify(cookie, secret);
  } catch {
    if (pathname.startsWith("/api/platform")) {
      return NextResponse.json({ error: "invalid_session" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/platform/login", request.url));
  }
  return null;
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Platform admin branch — evaluated FIRST and independently of tenant auth.
  if (isPlatformPath(pathname)) {
    const platformResult = await guardPlatformRoute(request);
    if (platformResult) return platformResult;
    return NextResponse.next();
  }

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
