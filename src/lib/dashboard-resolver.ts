import { normalizeAccountType, type AccountType } from "@/lib/account-types";

export const CHOOSE_ACCOUNT_TYPE_ROUTE = "/app/choose-type";

export const DASHBOARD_ROUTES = {
  company: "/app/dashboard/company",
  agency: "/app/dashboard/agency",
  creator: "/app/dashboard/creator",
} as const satisfies Record<AccountType, string>;

export type DashboardAccountType = keyof typeof DASHBOARD_ROUTES;

export function isDashboardAccountType(value: unknown): value is DashboardAccountType {
  return value === "company" || value === "agency" || value === "creator";
}

export function resolveDashboard(accountType?: string | null) {
  if (!accountType?.trim()) return CHOOSE_ACCOUNT_TYPE_ROUTE;
  return DASHBOARD_ROUTES[normalizeAccountType(accountType)];
}
