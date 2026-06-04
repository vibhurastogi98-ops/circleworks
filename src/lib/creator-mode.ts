import {
  normalizeAccountType as normalizeCanonicalAccountType,
  normalizeEnumToken,
  type AccountType,
} from "@/lib/account-types";
import { getCapabilityRouteRedirect, isCapabilityRouteAllowed } from "@/lib/capability-routes";

export type PlatformAccountType = AccountType;

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
  return normalizeCanonicalAccountType(value);
}

export function isCreatorAccountType(value?: string | null) {
  return normalizeAccountType(value) === "creator";
}

export function isAgencyAccountType(value?: string | null) {
  return normalizeAccountType(value) === "agency";
}

export function isCreatorRouteAllowed(pathname: string) {
  return isCapabilityRouteAllowed("creator", pathname);
}

export function getCreatorModeRedirect(pathname: string) {
  return getCapabilityRouteRedirect("creator", pathname);
}

export function getAccountTypeRouteRedirect(accountType: string | null | undefined, pathname: string) {
  return getCapabilityRouteRedirect(accountType, pathname);
}
