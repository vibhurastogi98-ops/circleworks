import {
  normalizeAccountType as normalizeCanonicalAccountType,
  normalizeEnumToken,
  type AccountType,
} from "@/lib/account-types";

export type PlatformAccountType = AccountType | "contractor_payer";

const creatorAliases = new Set([
  "creator",
  "creator_solo",
  "creator_solo_account",
  "creator_solo_mode",
  "creator_solo_business",
  "creator_solo_studio",
  "creator_solo_company",
  "creator__solo",
  "creator_solo_",
  "creator__solo_",
  "creator/solo",
  "creator solo",
  "creator-solo",
  "solo",
  "solo_creator",
  "creator_individual",
]);

export function normalizeAccountType(value?: string | null): PlatformAccountType {
  const normalized = normalizeEnumToken(value);
  if (creatorAliases.has(normalized)) return "creator";
  if (normalized === "agency") return "agency";
  if (normalized === "contractor_payer" || normalized === "contractor-payer") return "contractor_payer";
  return normalizeCanonicalAccountType(value);
}

export function isCreatorAccountType(value?: string | null) {
  return normalizeAccountType(value) === "creator";
}

export function isAgencyAccountType(value?: string | null) {
  return normalizeAccountType(value) === "agency";
}

function pathStartsWith(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

const creatorAllowedPrefixes = [
  "/dashboard",
  "/app/pay-myself",
  "/app/contractors",
  "/app/taxes",
  "/app/documents",
  "/expenses",
  "/settings/profile",
  "/help",
];

const creatorGuardedPrefixes = [
  "/dashboard",
  "/app",
  "/payroll",
  "/employees",
  "/hiring",
  "/onboarding",
  "/benefits",
  "/time",
  "/expenses",
  "/performance",
  "/learning",
  "/compliance",
  "/reports",
  "/contractors",
  "/agency",
];

const creatorOnlyPrefixes = [
  "/app/pay-myself",
  "/app/taxes",
  "/app/documents",
];

const agencyOnlyPrefixes = [
  "/app/clients",
  "/agency",
];

export function isCreatorRouteAllowed(pathname: string) {
  if (!creatorGuardedPrefixes.some((prefix) => pathStartsWith(pathname, prefix))) {
    return true;
  }

  return creatorAllowedPrefixes.some((prefix) => pathStartsWith(pathname, prefix));
}

export function getCreatorModeRedirect(pathname: string) {
  if (pathname === "/app") return "/dashboard";
  return isCreatorRouteAllowed(pathname) ? null : "/dashboard";
}

export function getAccountTypeRouteRedirect(accountType: string | null | undefined, pathname: string) {
  const normalizedAccountType = normalizeAccountType(accountType);

  if (normalizedAccountType === "creator") {
    return getCreatorModeRedirect(pathname);
  }

  if (creatorOnlyPrefixes.some((prefix) => pathStartsWith(pathname, prefix))) {
    return "/dashboard";
  }

  if (
    normalizedAccountType !== "agency" &&
    agencyOnlyPrefixes.some((prefix) => pathStartsWith(pathname, prefix))
  ) {
    return "/dashboard";
  }

  return null;
}
