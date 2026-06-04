import { getCapabilities, type CapabilityKey } from "@/lib/capabilities";
import { CHOOSE_ACCOUNT_TYPE_ROUTE, resolveDashboard } from "@/lib/dashboard-resolver";

type CapabilityRouteRule = {
  capability: CapabilityKey;
  prefixes: string[];
};

const CAPABILITY_ROUTE_RULES: CapabilityRouteRule[] = [
  { capability: "ownerPayroll", prefixes: ["/app/pay-myself"] },
  { capability: "ownerTaxes", prefixes: ["/app/taxes"] },
  { capability: "documents", prefixes: ["/app/documents"] },
  { capability: "clients", prefixes: ["/app/clients", "/agency", "/settings/agency"] },
  { capability: "automations", prefixes: ["/app/automations"] },
  { capability: "contractors", prefixes: ["/app/contractors"] },
  { capability: "contractorOnboarding", prefixes: ["/contractors"] },
  { capability: "payroll", prefixes: ["/payroll", "/app/payroll"] },
  { capability: "employees", prefixes: ["/employees"] },
  { capability: "hiring", prefixes: ["/hiring"] },
  { capability: "onboarding", prefixes: ["/onboarding"] },
  { capability: "benefits", prefixes: ["/benefits"] },
  { capability: "time", prefixes: ["/time"] },
  { capability: "expenses", prefixes: ["/expenses"] },
  { capability: "performance", prefixes: ["/performance"] },
  { capability: "learning", prefixes: ["/learning"] },
  { capability: "reports", prefixes: ["/reports"] },
  { capability: "compliance", prefixes: ["/compliance"] },
  { capability: "settings", prefixes: ["/settings", "/app/settings"] },
  { capability: "dashboard", prefixes: ["/dashboard", "/app/dashboard"] },
];

function pathStartsWith(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function getRequiredCapabilityForPath(pathname: string): CapabilityKey | null {
  return CAPABILITY_ROUTE_RULES.find((rule) =>
    rule.prefixes.some((prefix) => pathStartsWith(pathname, prefix)),
  )?.capability ?? null;
}

export function isCapabilityRouteAllowed(accountType: string | null | undefined, pathname: string) {
  if (!accountType?.trim()) return pathname === CHOOSE_ACCOUNT_TYPE_ROUTE;
  if (pathStartsWith(pathname, "/settings/workspace")) return true;

  const requiredCapability = getRequiredCapabilityForPath(pathname);
  if (!requiredCapability) return true;

  return getCapabilities(accountType)[requiredCapability];
}

export function getCapabilityRouteRedirect(accountType: string | null | undefined, pathname: string) {
  if (pathname === CHOOSE_ACCOUNT_TYPE_ROUTE) return null;
  if (!accountType?.trim()) return CHOOSE_ACCOUNT_TYPE_ROUTE;
  if (
    pathname === "/app" ||
    pathname === "/app/dashboard" ||
    pathStartsWith(pathname, "/app/dashboard") ||
    pathname === "/dashboard" ||
    pathStartsWith(pathname, "/dashboard")
  ) {
    const dashboardRoute = resolveDashboard(accountType);
    return pathname === dashboardRoute ? null : dashboardRoute;
  }
  return isCapabilityRouteAllowed(accountType, pathname) ? null : "/403";
}
