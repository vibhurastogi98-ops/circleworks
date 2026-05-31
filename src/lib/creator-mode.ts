export type PlatformAccountType =
  | "company"
  | "agency"
  | "creator_solo"
  | "contractor_payer";

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

function normalizeRawAccountType(value?: string | null) {
  return (value ?? "company").trim().toLowerCase().replace(/[/-]+/g, "_").replace(/\s+/g, "_");
}

export function normalizeAccountType(value?: string | null): PlatformAccountType {
  const normalized = normalizeRawAccountType(value);
  if (creatorAliases.has(normalized)) return "creator_solo";
  if (normalized === "agency") return "agency";
  if (normalized === "contractor_payer" || normalized === "contractor-payer") return "contractor_payer";
  return "company";
}

export function isCreatorAccountType(value?: string | null) {
  return normalizeAccountType(value) === "creator_solo";
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
