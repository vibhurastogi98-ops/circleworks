import { normalizeAccountType, type AccountType } from "@/lib/account-types";

export type CapabilityKey =
  | "dashboard"
  | "payroll"
  | "ownerPayroll"
  | "ownerTaxes"
  | "employees"
  | "contractors"
  | "contractorOnboarding"
  | "clients"
  | "hiring"
  | "onboarding"
  | "benefits"
  | "time"
  | "expenses"
  | "performance"
  | "learning"
  | "compliance"
  | "taxCompliance"
  | "reports"
  | "documents"
  | "automations"
  | "clientInvoicing"
  | "settings";

export type Capabilities = Record<CapabilityKey, boolean>;

export const CAPABILITY_MATRIX = {
  company: {
    dashboard: true,
    payroll: true,
    ownerPayroll: false,
    ownerTaxes: false,
    employees: true,
    contractors: true,
    contractorOnboarding: true,
    clients: false,
    hiring: true,
    onboarding: true,
    benefits: true,
    time: true,
    expenses: true,
    performance: true,
    learning: true,
    compliance: true,
    taxCompliance: true,
    reports: true,
    documents: true,
    automations: true,
    clientInvoicing: false,
    settings: true,
  },
  agency: {
    dashboard: true,
    payroll: true,
    ownerPayroll: false,
    ownerTaxes: false,
    employees: true,
    contractors: true,
    contractorOnboarding: true,
    clients: true,
    hiring: true,
    onboarding: true,
    benefits: true,
    time: true,
    expenses: true,
    performance: true,
    learning: true,
    compliance: true,
    taxCompliance: true,
    reports: true,
    documents: true,
    automations: true,
    clientInvoicing: false,
    settings: true,
  },
  creator: {
    dashboard: true,
    payroll: false,
    ownerPayroll: true,
    ownerTaxes: true,
    employees: false,
    contractors: true,
    contractorOnboarding: false,
    clients: false,
    hiring: false,
    onboarding: false,
    benefits: false,
    time: false,
    expenses: true,
    performance: false,
    learning: false,
    compliance: false,
    taxCompliance: true,
    reports: false,
    documents: true,
    automations: false,
    clientInvoicing: true,
    settings: true,
  },
} satisfies Record<AccountType, Capabilities>;

export function getCapabilities(accountType?: string | null): Capabilities {
  return { ...CAPABILITY_MATRIX[normalizeAccountType(accountType)] };
}
