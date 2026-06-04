import type { AccountType } from "@/lib/account-types";

export type DashboardQuickAction = {
  id: string;
  label: string;
  href: string;
  tone: "primary" | "secondary";
};

export type CompanyDashboardData = {
  headcount: {
    active: number;
    onboarding: number;
  };
  nextPayroll: {
    date: string | null;
    employeeCount: number;
    estimatedGross: number;
    status: string | null;
  };
  pendingHrTasks: {
    total: number;
    onboardingCases: number;
    onboardingEmployees: number;
    ptoRequests: number;
    timesheets: number;
  };
  quickActions: DashboardQuickAction[];
};

export type AgencyDashboardData = {
  clientMargin: {
    revenue: number;
    cost: number;
    marginPercent: number | null;
    activeClients: number;
    activeProjects: number;
  };
  contractorPaymentsDue: {
    amount: number;
    count: number;
    nextDueDate: string | null;
  };
  nextMixedPayroll: {
    date: string | null;
    employeeCount: number;
    contractorCount: number;
    estimatedGross: number;
    contractorAmount: number;
    status: string | null;
  };
  quickActions: DashboardQuickAction[];
};

export type CreatorDashboardData = {
  nextSelfPay: {
    date: string | null;
    amount: number;
    status: string | null;
  };
  taxSetAside: {
    amount: number;
    basis: "payroll_taxes" | "estimated_gross" | "none";
  };
  contractorPayments: {
    amount: number;
    count: number;
    nextDueDate: string | null;
  };
  quickActions: DashboardQuickAction[];
};

export type DashboardSummary = {
  accountType: AccountType;
  companyId: number;
  companyName: string;
  generatedAt: string;
  company: CompanyDashboardData;
  agency: AgencyDashboardData;
  creator: CreatorDashboardData;
};
