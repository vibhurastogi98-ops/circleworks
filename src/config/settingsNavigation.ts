import { normalizeAccountType } from "@/lib/creator-mode";

export type SettingsNavItem = { label: string; href: string };

const buildStandard = (prefix: string): SettingsNavItem[] => [
  { label: "Workspace", href: `${prefix}/workspace` },
  { label: "Business Profile", href: `${prefix}/business` },
  { label: "Profile", href: `${prefix}/profile` },
  { label: "Users", href: `${prefix}/users` },
  { label: "Roles", href: `${prefix}/roles` },
  { label: "Departments", href: `${prefix}/departments` },
  { label: "Locations", href: `${prefix}/locations` },
  { label: "Billing", href: `${prefix}/billing` },
  { label: "Bank", href: `${prefix}/bank` },
  { label: "Pay Schedules", href: `${prefix}/pay-schedules` },
  { label: "Payroll Unions", href: `${prefix}/payroll/unions` },
  { label: "Time Settings", href: `${prefix}/time` },
  { label: "Notifications", href: `${prefix}/notifications` },
  { label: "Integrations", href: `${prefix}/integrations` },
  { label: "API", href: `${prefix}/api` },
  { label: "SSO", href: `${prefix}/sso` },
  { label: "Security Devices", href: `${prefix}/security/devices` },
  { label: "Assets", href: `${prefix}/assets` },
  { label: "Import", href: `${prefix}/import` },
  { label: "Custom Fields", href: `${prefix}/custom-fields` },
  { label: "Workflows", href: `${prefix}/workflows` },
  { label: "Announcements", href: `${prefix}/announcements` },
  { label: "Audit Log", href: `${prefix}/audit-log` },
];

export const COMPANY_SETTINGS_NAV_ITEMS: SettingsNavItem[] = buildStandard("/settings/company");

export const AGENCY_SETTINGS_NAV_ITEMS: SettingsNavItem[] = [
  ...buildStandard("/settings/agency"),
  { label: "Agency Clients", href: "/settings/agency/clients" },
];

export const CREATOR_SETTINGS_NAV_ITEMS: SettingsNavItem[] = [
  { label: "Workspace", href: "/settings/creator/workspace" },
  { label: "Business Profile", href: "/settings/creator/business" },
  { label: "Profile", href: "/settings/creator/profile" },
  { label: "Billing", href: "/settings/creator/billing" },
  { label: "Bank", href: "/settings/creator/bank" },
  { label: "Notifications", href: "/settings/creator/notifications" },
  { label: "Integrations", href: "/settings/creator/integrations" },
  { label: "Security Devices", href: "/settings/creator/security/devices" },
];

export function getSettingsNavItems(accountType: string | null | undefined): SettingsNavItem[] {
  const normalized = normalizeAccountType(accountType);
  if (normalized === "agency") return AGENCY_SETTINGS_NAV_ITEMS;
  if (normalized === "creator") return CREATOR_SETTINGS_NAV_ITEMS;
  return COMPANY_SETTINGS_NAV_ITEMS;
}

export function getSettingsBasePath(accountType: string | null | undefined) {
  return `/settings/${normalizeAccountType(accountType)}`;
}
