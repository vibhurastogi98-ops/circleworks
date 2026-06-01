export const ACCOUNT_TYPES = ["company", "agency", "creator"] as const;
export type AccountType = (typeof ACCOUNT_TYPES)[number];

export const ENTITY_TYPES = ["sole_prop", "smllc", "mmllc", "s_corp", "c_corp", "none"] as const;
export type EntityType = (typeof ENTITY_TYPES)[number];

const accountTypeSet = new Set<string>(ACCOUNT_TYPES);

const accountTypeAliases: Record<string, AccountType> = {
  company: "company",
  employer: "company",
  business: "company",
  agency: "agency",
  firm: "agency",
  creator: "creator",
  creator_solo: "creator",
  creator_solo_account: "creator",
  creator_solo_mode: "creator",
  creator_solo_business: "creator",
  creator_solo_studio: "creator",
  creator_solo_company: "creator",
  creator_individual: "creator",
  solo: "creator",
  solo_creator: "creator",
  contractor_payer: "creator",
};

const entityTypeAliases: Record<string, EntityType> = {
  sole_prop: "sole_prop",
  sole_proprietor: "sole_prop",
  sole_proprietorship: "sole_prop",
  smllc: "smllc",
  single_member_llc: "smllc",
  single_member: "smllc",
  llc: "smllc",
  mmllc: "mmllc",
  multi_member_llc: "mmllc",
  multimember_llc: "mmllc",
  partnership_llc: "mmllc",
  s_corp: "s_corp",
  scorp: "s_corp",
  s_corporation: "s_corp",
  c_corp: "c_corp",
  ccorp: "c_corp",
  c_corporation: "c_corp",
  none: "none",
};

export function normalizeEnumToken(value?: string | null) {
  return (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[/-]+/g, "_")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_");
}

export function isAccountType(value: unknown): value is AccountType {
  return typeof value === "string" && accountTypeSet.has(value);
}

export function normalizeAccountType(value?: string | null): AccountType {
  const normalized = normalizeEnumToken(value);
  return accountTypeAliases[normalized] ?? "company";
}

export function normalizeOptionalAccountType(value: unknown): AccountType | null {
  if (typeof value !== "string" || !value.trim()) return null;
  return normalizeAccountType(value);
}

export function normalizeEntityType(value?: string | null): EntityType | null {
  const normalized = normalizeEnumToken(value);
  if (!normalized) return null;
  return entityTypeAliases[normalized] ?? null;
}

export function toLegacyCreatorEntityType(value?: string | null) {
  const entityType = normalizeEntityType(value);
  if (entityType === "sole_prop") return "sole-prop";
  if (entityType === "smllc" || entityType === "mmllc") return "llc";
  if (entityType === "s_corp") return "s-corp";
  if (entityType === "c_corp") return "c-corp";
  if (entityType === "none") return "none";
  return null;
}
