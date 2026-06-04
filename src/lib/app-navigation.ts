import type { ElementType } from "react";
import {
  BarChart2,
  BookOpen,
  Briefcase,
  Building2,
  Clock,
  DollarSign,
  FileText,
  Handshake,
  Heart,
  HelpCircle,
  LayoutDashboard,
  Receipt,
  Settings,
  Shield,
  Target,
  UserPlus,
  Users,
  Zap,
} from "lucide-react";

import type { AccountType } from "@/lib/account-types";
import { getCapabilities, type CapabilityKey } from "@/lib/capabilities";
import { isCapabilityRouteAllowed } from "@/lib/capability-routes";
import { normalizeAccountType } from "@/lib/creator-mode";

export type AppNavKey = CapabilityKey | "help" | "divider";

export type AppNavChild = {
  label: string;
  href: string;
  capability?: CapabilityKey;
};

export type AppNavItem = {
  id: AppNavKey;
  label: string;
  icon: ElementType;
  capability?: CapabilityKey;
  href?: string;
  children?: AppNavChild[];
  badge?: {
    text?: string;
    count?: number;
    tone?: "default" | "critical" | "draft";
  };
  divider?: boolean;
  emphasis?: "agency";
};

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

const MODULE_ORDER: Record<AccountType, AppNavKey[]> = {
  company: [
    "dashboard",
    "payroll",
    "employees",
    "contractors",
    "hiring",
    "onboarding",
    "benefits",
    "time",
    "expenses",
    "performance",
    "learning",
    "compliance",
    "reports",
    "documents",
    "automations",
    "settings",
    "help",
  ],
  agency: [
    "dashboard",
    "clients",
    "contractors",
    "payroll",
    "employees",
    "hiring",
    "onboarding",
    "benefits",
    "time",
    "expenses",
    "performance",
    "learning",
    "compliance",
    "reports",
    "documents",
    "automations",
    "settings",
    "help",
  ],
  creator: [
    "dashboard",
    "ownerPayroll",
    "contractors",
    "ownerTaxes",
    "expenses",
    "documents",
  ],
};

const APP_MODULE_NAV_ITEMS: AppNavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    capability: "dashboard",
    href: "/app/dashboard",
  },
  {
    id: "ownerPayroll",
    label: "Pay Myself",
    icon: DollarSign,
    capability: "ownerPayroll",
    href: "/app/pay-myself",
  },
  {
    id: "clients",
    label: "Clients",
    icon: Building2,
    capability: "clients",
    href: "/app/clients",
    badge: { text: "Client ops" },
    emphasis: "agency",
    children: [
      { label: "Client Billing", href: "/app/clients", capability: "clients" },
      { label: "Billing", href: "/agency/billing", capability: "clients" },
      { label: "Profitability", href: "/agency/profitability", capability: "clients" },
      { label: "Client Settings", href: "/settings/agency/clients", capability: "clients" },
    ],
  },
  {
    id: "contractors",
    label: "Contractors",
    icon: Handshake,
    capability: "contractors",
    href: "/app/contractors",
    children: [
      { label: "Contractor Module", href: "/app/contractors", capability: "contractors" },
      { label: "Contractor Hub", href: "/contractors", capability: "contractorOnboarding" },
      { label: "Onboarding", href: "/contractors/onboarding", capability: "contractorOnboarding" },
      { label: "Contracts", href: "/contractors/contracts", capability: "contractorOnboarding" },
      { label: "Payments", href: "/contractors/payments", capability: "contractorOnboarding" },
      { label: "1099s", href: "/contractors/1099s", capability: "contractorOnboarding" },
      { label: "Portal", href: "/contractors/portal", capability: "contractorOnboarding" },
    ],
  },
  {
    id: "payroll",
    label: "Payroll",
    icon: DollarSign,
    capability: "payroll",
    href: "/payroll",
    children: [
      { label: "Payroll Hub", href: "/payroll", capability: "payroll" },
      { label: "Run Payroll", href: "/payroll/run", capability: "payroll" },
      { label: "Completed Run", href: "/payroll/run/pr-2026-0515", capability: "payroll" },
      { label: "Pay Stubs", href: "/payroll/run/pr-2026-0515/paystubs", capability: "payroll" },
      { label: "Off-Cycle", href: "/payroll/off-cycle", capability: "payroll" },
      { label: "History", href: "/payroll/history", capability: "payroll" },
      { label: "Contractors", href: "/payroll/contractors", capability: "payroll" },
      { label: "Pay Schedule", href: "/payroll/schedule", capability: "payroll" },
      { label: "Tax Setup", href: "/payroll/tax-setup", capability: "payroll" },
      { label: "Garnishments", href: "/payroll/garnishments", capability: "payroll" },
      { label: "Earned Wage Access", href: "/payroll/ewa", capability: "payroll" },
      { label: "Payroll Bridge", href: "/payroll/bridge", capability: "payroll" },
      { label: "Payroll Settings", href: "/payroll/settings", capability: "payroll" },
      { label: "Payroll Reports", href: "/payroll/reports", capability: "payroll" },
      { label: "GL Mapping", href: "/payroll/gl-mapping", capability: "payroll" },
      { label: "Multi-State", href: "/payroll/multi-state", capability: "payroll" },
      { label: "Supplemental Pay", href: "/payroll/supplemental-payments", capability: "payroll" },
      { label: "Tips", href: "/payroll/tips", capability: "payroll" },
      { label: "Union Payroll", href: "/payroll/union", capability: "payroll" },
      { label: "Quarterly Recon", href: "/payroll/quarterly-reconciliation", capability: "payroll" },
      { label: "Year-End", href: "/payroll/year-end", capability: "payroll" },
    ],
  },
  {
    id: "employees",
    label: "Employees",
    icon: Users,
    capability: "employees",
    href: "/employees",
    children: [
      { label: "Directory", href: "/employees", capability: "employees" },
      { label: "Add Employee", href: "/employees/new", capability: "employees" },
      { label: "Bulk Import", href: "/employees/bulk", capability: "employees" },
      { label: "Org Chart", href: "/employees/org-chart", capability: "employees" },
      { label: "Employee Profile", href: "/employees/1", capability: "employees" },
      { label: "Compensation", href: "/employees/1/compensation", capability: "employees" },
      { label: "Benefits", href: "/employees/1/benefits", capability: "employees" },
      { label: "Time & PTO", href: "/employees/1/time", capability: "employees" },
      { label: "Documents", href: "/employees/1/documents", capability: "employees" },
      { label: "Payroll", href: "/employees/1/payroll", capability: "employees" },
      { label: "Performance", href: "/employees/1/performance", capability: "employees" },
      { label: "Activity", href: "/employees/1/activity", capability: "employees" },
      { label: "Edit Employee", href: "/employees/1/edit", capability: "employees" },
      { label: "Termination Workflow", href: "/employees/1/terminate", capability: "employees" },
    ],
  },
  {
    id: "hiring",
    label: "Hiring",
    icon: Briefcase,
    capability: "hiring",
    href: "/hiring",
    children: [
      { label: "ATS Overview", href: "/hiring", capability: "hiring" },
      { label: "Jobs", href: "/hiring/jobs", capability: "hiring" },
      { label: "Candidates", href: "/hiring/candidates", capability: "hiring" },
      { label: "Interviews", href: "/hiring/interviews", capability: "hiring" },
      { label: "Offers", href: "/hiring/offers", capability: "hiring" },
      { label: "Job Templates", href: "/hiring/templates", capability: "hiring" },
      { label: "New Job", href: "/hiring/jobs/new", capability: "hiring" },
      { label: "New Offer", href: "/hiring/offers/new", capability: "hiring" },
      { label: "Hiring Settings", href: "/hiring/settings", capability: "hiring" },
    ],
  },
  {
    id: "onboarding",
    label: "Onboarding",
    icon: UserPlus,
    capability: "onboarding",
    href: "/onboarding",
    children: [
      { label: "Onboarding Hub", href: "/onboarding", capability: "onboarding" },
      { label: "Company Setup", href: "/onboarding/company-setup", capability: "onboarding" },
      { label: "Documents", href: "/onboarding/documents", capability: "onboarding" },
      { label: "Templates", href: "/onboarding/templates", capability: "onboarding" },
      { label: "Offboarding", href: "/onboarding/offboarding", capability: "onboarding" },
    ],
  },
  {
    id: "benefits",
    label: "Benefits",
    icon: Heart,
    capability: "benefits",
    href: "/benefits",
    children: [
      { label: "Benefits Overview", href: "/benefits", capability: "benefits" },
      { label: "Plan Management", href: "/benefits/plans", capability: "benefits" },
      { label: "Enrollment Wizard", href: "/benefits/enrollment/1", capability: "benefits" },
      { label: "Open Enrollment", href: "/benefits/oe", capability: "benefits" },
      { label: "Life Events", href: "/benefits/qle", capability: "benefits" },
      { label: "401(k)", href: "/benefits/401k", capability: "benefits" },
      { label: "FSA/HSA", href: "/benefits/fsa-hsa", capability: "benefits" },
      { label: "Life & Supplemental", href: "/benefits/life-disability", capability: "benefits" },
      { label: "COBRA", href: "/benefits/cobra", capability: "benefits" },
      { label: "Workers' Comp", href: "/benefits/workers-comp", capability: "benefits" },
    ],
  },
  {
    id: "time",
    label: "Time",
    icon: Clock,
    capability: "time",
    href: "/time",
    children: [
      { label: "Time Hub", href: "/time", capability: "time" },
      { label: "Timesheets", href: "/time/timesheets", capability: "time" },
      { label: "Schedule", href: "/time/schedule", capability: "time" },
      { label: "Open Shifts", href: "/time/schedule/open-shifts", capability: "time" },
      { label: "PTO", href: "/time/pto", capability: "time" },
      { label: "PTO Policies", href: "/time/pto/policies", capability: "time" },
      { label: "Overtime", href: "/time/overtime", capability: "time" },
      { label: "Time Settings", href: "/time/settings", capability: "time" },
      { label: "Breaks", href: "/time/breaks", capability: "time" },
      { label: "Kiosk", href: "/time/kiosk", capability: "time" },
    ],
  },
  {
    id: "expenses",
    label: "Expenses",
    icon: Receipt,
    capability: "expenses",
    href: "/expenses",
    children: [
      { label: "Expenses Hub", href: "/expenses", capability: "expenses" },
      { label: "Reports", href: "/expenses/reports", capability: "expenses" },
      { label: "Policies", href: "/expenses/policies", capability: "expenses" },
      { label: "Mileage", href: "/expenses/mileage", capability: "expenses" },
    ],
  },
  {
    id: "performance",
    label: "Performance",
    icon: Target,
    capability: "performance",
    href: "/performance",
    children: [
      { label: "Performance Hub", href: "/performance", capability: "performance" },
      { label: "Reviews", href: "/performance/reviews", capability: "performance" },
      { label: "OKRs", href: "/performance/okrs", capability: "performance" },
      { label: "Feedback", href: "/performance/feedback", capability: "performance" },
    ],
  },
  {
    id: "learning",
    label: "Learning",
    icon: BookOpen,
    capability: "learning",
    href: "/learning",
    children: [
      { label: "Learning Hub", href: "/learning", capability: "learning" },
      { label: "Courses", href: "/learning/courses", capability: "learning" },
      { label: "Assignments", href: "/learning/assignments", capability: "learning" },
    ],
  },
  {
    id: "compliance",
    label: "Compliance",
    icon: Shield,
    capability: "compliance",
    href: "/compliance",
    children: [
      { label: "Dashboard", href: "/compliance", capability: "compliance" },
      { label: "I-9", href: "/compliance/i9", capability: "compliance" },
      { label: "E-Verify", href: "/compliance/everify", capability: "compliance" },
      { label: "EEO-1", href: "/compliance/eeo1", capability: "compliance" },
      { label: "OSHA Log", href: "/compliance/osha", capability: "compliance" },
      { label: "ACA", href: "/compliance/aca", capability: "compliance" },
      { label: "Labor Law", href: "/compliance/labor-law", capability: "compliance" },
      { label: "Federal Filings", href: "/compliance/federal-filings", capability: "compliance" },
      { label: "Tax Filings", href: "/compliance/tax-filings", capability: "compliance" },
      { label: "Paid Leave", href: "/compliance/paid-leave", capability: "compliance" },
      { label: "Pay Equity", href: "/compliance/pay-equity", capability: "compliance" },
      { label: "Handbook", href: "/compliance/handbook", capability: "compliance" },
      { label: "Posters", href: "/compliance/posters", capability: "compliance" },
      { label: "WOTC", href: "/compliance/wotc", capability: "compliance" },
      { label: "Audit Log", href: "/compliance/audit-log", capability: "compliance" },
    ],
  },
  {
    id: "reports",
    label: "Reports",
    icon: BarChart2,
    capability: "reports",
    href: "/reports",
    children: [
      { label: "Reports Hub", href: "/reports", capability: "reports" },
      { label: "Payroll Summary", href: "/reports/payroll-summary", capability: "reports" },
      { label: "Headcount", href: "/reports/headcount", capability: "reports" },
      { label: "Pay Equity", href: "/reports/pay-equity", capability: "reports" },
      { label: "Expense Summary", href: "/reports/expense-summary", capability: "reports" },
      { label: "Time Analytics", href: "/reports/time-analytics", capability: "reports" },
      { label: "Custom Reports", href: "/reports/custom", capability: "reports" },
      { label: "Saved Custom Report", href: "/reports/custom/department-cost-center", capability: "reports" },
      { label: "Certified Payroll", href: "/reports/certified-payroll", capability: "reports" },
      { label: "Headcount Forecast", href: "/reports/headcount-forecast", capability: "reports" },
      { label: "Project Profitability", href: "/reports/project-profitability", capability: "reports" },
    ],
  },
  {
    id: "documents",
    label: "Documents",
    icon: FileText,
    capability: "documents",
    href: "/app/documents",
  },
  {
    id: "ownerTaxes",
    label: "Taxes",
    icon: Shield,
    capability: "ownerTaxes",
    href: "/app/taxes",
  },
  {
    id: "automations",
    label: "Automations",
    icon: Zap,
    capability: "automations",
    href: "/app/automations",
    children: [
      { label: "Automations Hub", href: "/app/automations", capability: "automations" },
      { label: "Templates", href: "/app/automations/templates", capability: "automations" },
      { label: "New Automation", href: "/app/automations/new", capability: "automations" },
      { label: "Legacy Workflows", href: "/settings/workflows", capability: "settings" },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    capability: "settings",
    href: "/settings",
  },
  {
    id: "help",
    label: "Help",
    icon: HelpCircle,
    href: "/help",
  },
];

const ROUTE_LABELS: Record<string, string> = {
  "401k": "401(k)",
  "aca": "ACA",
  "api": "API",
  "app": "App",
  "assets": "Assets",
  "audit-log": "Audit Log",
  "automations": "Automations",
  "billing": "Billing",
  "bulk": "Bulk Import",
  "clients": "Clients",
  "cobra": "COBRA",
  "company": "Company",
  "company-setup": "Company Setup",
  "contractors": "Contractors",
  "custom": "Custom Reports",
  "custom-fields": "Custom Fields",
  "dashboard": "Dashboard",
  "departments": "Departments",
  "documents": "Documents",
  "eeo1": "EEO-1",
  "everify": "E-Verify",
  "fsa-hsa": "FSA / HSA",
  "gl-mapping": "GL Mapping",
  "headcount-forecast": "Headcount Forecast",
  "i9": "I-9",
  "life-disability": "Life & Supplemental",
  "multi-state": "Multi-State",
  "oe": "Open Enrollment",
  "paid-leave": "Paid Leave",
  "pay-equity": "Pay Equity",
  "pay-myself": "Pay Myself",
  "payroll-summary": "Payroll Summary",
  "project-profitability": "Project Profitability",
  "qle": "Life Events",
  "sso": "SSO",
  "tax-filings": "Tax Filings",
  "tax-setup": "Tax Setup",
  "taxes": "Taxes",
  "time-analytics": "Time Analytics",
  "wotc": "WOTC",
  "workers-comp": "Workers' Comp",
};

function routeLabel(segment: string) {
  if (ROUTE_LABELS[segment]) return ROUTE_LABELS[segment];
  if (/^\d+$/.test(segment)) return `Employee ${segment}`;
  return segment
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function navChildAllowed(accountType: AccountType, child: AppNavChild) {
  const capabilities = getCapabilities(accountType);
  return (
    (!child.capability || capabilities[child.capability]) &&
    isCapabilityRouteAllowed(accountType, child.href)
  );
}

function normalizeItemForAccountType(accountType: AccountType, item: AppNavItem): AppNavItem | null {
  const capabilities = getCapabilities(accountType);
  if (item.capability && !capabilities[item.capability]) return null;
  if (item.href && !isCapabilityRouteAllowed(accountType, item.href)) return null;

  const children = item.children?.filter((child) => navChildAllowed(accountType, child));
  if (!children?.length) return { ...item, children: undefined };
  if (children.length === 1 && children[0]?.href === item.href) {
    return { ...item, children: undefined };
  }
  return { ...item, children };
}

export function getAppNavItems(accountType?: string | null): AppNavItem[] {
  const normalizedAccountType = normalizeAccountType(accountType);
  const itemsById = new Map<AppNavKey, AppNavItem>(
    APP_MODULE_NAV_ITEMS.map((item) => [item.id, item]),
  );

  const orderedItems = MODULE_ORDER[normalizedAccountType]
    .map((key) => itemsById.get(key))
    .filter((item): item is AppNavItem => Boolean(item))
    .map((item) => normalizeItemForAccountType(normalizedAccountType, item))
    .filter((item): item is AppNavItem => Boolean(item));

  if (normalizedAccountType === "creator") return orderedItems;

  const settingsIndex = orderedItems.findIndex((item) => item.id === "settings" || item.id === "help");
  if (settingsIndex <= 0) return orderedItems;
  return [
    ...orderedItems.slice(0, settingsIndex),
    { id: "divider", label: "Divider", icon: LayoutDashboard, divider: true },
    ...orderedItems.slice(settingsIndex),
  ];
}

export function routeMatches(href: string, pathname: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function navItemMatchesPath(item: AppNavItem, pathname: string) {
  return Boolean(
    (item.href && routeMatches(item.href, pathname)) ||
      item.children?.some((child) => routeMatches(child.href, pathname)),
  );
}

function breadcrumbPartsForPath(pathname: string) {
  const parts = pathname.split("?")[0]?.split("/").filter(Boolean) ?? [];
  if (parts[0] === "app" && parts[1] === "dashboard") return ["dashboard"];
  if (parts[0] === "dashboard") return ["dashboard"];
  if (parts[0] === "app") return parts.slice(1);
  if (parts[0] === "agency") return ["clients", ...parts.slice(1)];
  return parts;
}

function hrefForBreadcrumb(parts: string[], index: number, originalPathname: string) {
  const originalParts = originalPathname.split("?")[0]?.split("/").filter(Boolean) ?? [];
  const current = parts.slice(0, index + 1);

  if (parts[0] === "dashboard") return "/app/dashboard";
  if (originalParts[0] === "app") return `/app/${current.join("/")}`;
  if (originalParts[0] === "agency") {
    if (index === 0) return "/app/clients";
    return `/agency/${originalParts.slice(1, index + 1).join("/")}`;
  }
  return `/${current.join("/")}`;
}

export function getBreadcrumbItemsForPath(accountType: string | null | undefined, pathname: string): BreadcrumbItem[] {
  const parts = breadcrumbPartsForPath(pathname);
  if (!parts.length) return [];

  return parts.map((part, index) => {
    const href = index < parts.length - 1 ? hrefForBreadcrumb(parts, index, pathname) : undefined;
    return {
      label: routeLabel(part),
      href: href && isCapabilityRouteAllowed(accountType, href) ? href : undefined,
    };
  });
}

export function getRouteTitleForPath(_accountType: string | null | undefined, pathname: string) {
  const parts = breadcrumbPartsForPath(pathname);
  if (!parts.length) return "Dashboard";
  if (parts[0] === "benefits" && parts[1] === "enrollment" && parts[2]) {
    return "Enrollment Wizard";
  }
  return routeLabel(parts[parts.length - 1] ?? "dashboard");
}
