const PLATFORM_ROUTE_PREFIXES = [
  "/dashboard",
  "/payroll",
  "/employees",
  "/hiring",
  "/onboarding",
  "/benefits",
  "/time",
  "/expenses",
  "/performance",
  "/compliance",
  "/reports",
  "/settings",
  "/app",
  "/documents",
  "/help",
  "/contractors",
  "/agency",
  "/learning",
  "/c/",
];

const AUTH_ROUTE_PREFIXES = [
  "/login",
  "/signup",
  "/auth",
  "/reset-password",
  "/forgot-password",
  "/welcome",
];

function routeStartsWith(pathname: string, prefix: string) {
  return prefix.endsWith("/")
    ? pathname.startsWith(prefix)
    : pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function isPlatformRoute(pathname: string) {
  return PLATFORM_ROUTE_PREFIXES.some((prefix) => routeStartsWith(pathname, prefix));
}

export function shouldSyncAuthOnRoute(pathname: string) {
  return (
    isPlatformRoute(pathname) ||
    AUTH_ROUTE_PREFIXES.some((prefix) => routeStartsWith(pathname, prefix))
  );
}
