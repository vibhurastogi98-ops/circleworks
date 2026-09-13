import { getCapabilities, type CapabilityKey } from "@/lib/capabilities";
import { CHOOSE_ACCOUNT_TYPE_ROUTE, resolveDashboard } from "@/lib/dashboard-resolver";
import { normalizeAccountType, type AccountType } from "@/lib/account-types";

type CapabilityRouteRule = {
  capability: CapabilityKey;
  prefixes: string[];
};

const CAPABILITY_ROUTE_RULES: CapabilityRouteRule[] = [
  { capability: "ownerPayroll", prefixes: ["/app/pay-myself"] },
  { capability: "ownerTaxes", prefixes: ["/app/taxes"] },
  { capability: "documents", prefixes: ["/app/documents"] },
  { capability: "clients", prefixes: ["/app/clients", "/agency"] },
  { capability: "automations", prefixes: ["/app/automations"] },
  { capability: "contractors", prefixes: ["/app/contractors"] },
  { capability: "contractorOnboarding", prefixes: ["/contractors"] },
  { capability: "clientInvoicing", prefixes: ["/invoices"] },
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

const SETTINGS_CATEGORY_PREFIXES: Record<AccountType, string> = {
  company: "/settings/company",
  agency: "/settings/agency",
  creator: "/settings/creator",
};

function pathStartsWith(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function getCategoryOwnerForPath(pathname: string): AccountType | null {
  for (const [type, prefix] of Object.entries(SETTINGS_CATEGORY_PREFIXES) as Array<[
    AccountType,
    string,
  ]>) {
    if (pathStartsWith(pathname, prefix)) return type;
  }
  return null;
}

export function getRequiredCapabilityForPath(pathname: string): CapabilityKey | null {
  return CAPABILITY_ROUTE_RULES.find((rule) =>
    rule.prefixes.some((prefix) => pathStartsWith(pathname, prefix)),
  )?.capability ?? null;
}

export function isCapabilityRouteAllowed(accountType: string | null | undefined, pathname: string) {
  if (!accountType?.trim()) return pathname === CHOOSE_ACCOUNT_TYPE_ROUTE;

  const categoryOwner = getCategoryOwnerForPath(pathname);
  if (categoryOwner) {
    return categoryOwner === normalizeAccountType(accountType);
  }

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

  const categoryOwner = getCategoryOwnerForPath(pathname);
  if (categoryOwner) {
    const normalized = normalizeAccountType(accountType);
    if (categoryOwner === normalized) return null;
    return `/settings/${normalized}`;
  }

  return isCapabilityRouteAllowed(accountType, pathname) ? null : "/403";
}
