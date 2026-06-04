"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Cell,
  Legend,
  Pie,
  PieChart as RechartsPieChart,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  DollarSign,
  Eye,
  FileText,
  FileWarning,
  Handshake,
  Heart,
  PieChart,
  Play,
  Receipt,
  ShieldAlert,
  TrendingUp,
  UserMinus,
  UserPlus,
  Users,
  WalletCards,
  X,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useDashboardRealtimeStore } from "@/store/useDashboardRealtimeStore";
import { usePlatformStore } from "@/store/usePlatformStore";
import { useSocketStore } from "@/store/useSocketStore";
import type { AccountType } from "@/lib/account-types";
import { getCapabilities, type CapabilityKey } from "@/lib/capabilities";
import { normalizeAccountType } from "@/lib/creator-mode";
import type {
  DashboardActivity,
  DashboardActivityType,
  DashboardOverview,
  HeadcountBreakdownPoint,
  PayrollTrendPoint,
} from "@/lib/dashboard-data";
import type {
  DashboardQuickAction,
  DashboardSummary,
} from "@/lib/dashboard-summary";
import ErrorState from "@/components/ErrorState";
import OnboardingChecklistWidget from "@/components/dashboard/OnboardingChecklistWidget";
import { DashboardSkeleton } from "@/components/skeletons";

type DateRange = "Last 7 days" | "Last 30 days" | "This Quarter" | "Custom";

const DATE_RANGES: DateRange[] = [
  "Last 7 days",
  "Last 30 days",
  "This Quarter",
  "Custom",
];

type DashboardWidgetTone = "blue" | "emerald" | "amber" | "violet" | "rose";

type DefaultDashboardWidget = {
  id: string;
  title: string;
  value: string;
  detail: string;
  delta: string;
  href: string;
  icon: React.ElementType;
  tone: DashboardWidgetTone;
  empty?: boolean;
  emptyText?: string;
};

const WIDGET_TONE_CLASSES: Record<DashboardWidgetTone, { icon: string; badge: string }> = {
  blue: {
    icon: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300",
    badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  },
  emerald: {
    icon: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300",
    badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  },
  amber: {
    icon: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300",
    badge: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  },
  violet: {
    icon: "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300",
    badge: "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300",
  },
  rose: {
    icon: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300",
    badge: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
  },
};

const MODULE_TONES: Record<string, string> = {
  blue: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
  emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  amber: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  violet: "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300",
  rose: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
  cyan: "bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300",
};

const MODULE_ICONS: Record<string, React.ElementType> = {
  clients: Building2,
  contractors: Handshake,
  documents: FileText,
  ownerPayroll: WalletCards,
  ownerTaxes: Receipt,
  time: Clock,
  benefits: Heart,
  hiring: Briefcase,
  compliance: ShieldAlert,
  expenses: Receipt,
  onboarding: UserPlus,
};

const ACTIVITY_ICONS: Record<DashboardActivityType, React.ElementType> = {
  "payroll.run.completed": BadgeCheck,
  "employee.hired": UserPlus,
  "employee.terminated": UserMinus,
  "benefit.enrolled": Heart,
  "time.approved": Clock,
  "compliance.alert": ShieldAlert,
  "expense.approved": Receipt,
};

const ACTIVITY_STYLES: Record<DashboardActivityType, string> = {
  "payroll.run.completed": "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300",
  "employee.hired": "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300",
  "employee.terminated": "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  "benefit.enrolled": "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300",
  "time.approved": "bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-300",
  "compliance.alert": "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  "expense.approved": "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300",
};

const PIE_COLORS = ["#2563eb", "#10b981", "#f59e0b"];

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { credentials: "include" });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getQuarterContext() {
  const now = new Date();
  return `Q${Math.floor(now.getMonth() / 3) + 1} ${now.getFullYear()}`;
}

function firstNameFromName(name: string) {
  return name.trim().split(/\s+/)[0] || "there";
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDashboardDate(value: string | null) {
  if (!value) return "Not scheduled";
  const [year, month, day] = value.split("-").map(Number);
  const date = year && month && day ? new Date(year, month - 1, day) : new Date(value);
  if (Number.isNaN(date.getTime())) return "Not scheduled";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatPercent(value: number | null) {
  return value == null ? "No margin yet" : `${value.toFixed(value % 1 === 0 ? 0 : 1)}%`;
}

function accountTypeLabel(accountType: AccountType) {
  if (accountType === "agency") return "Agency";
  if (accountType === "creator") return "Creator/Solo";
  return "Company";
}

function buildActivityFromSocket(
  type: DashboardActivityType,
  data: Record<string, unknown>,
): DashboardActivity {
  const now = new Date();
  const name = String(data.name || data.employeeName || data.candidateName || "Team update");
  const amount = Number(data.amount || data.totalGross || 0);
  const employeeCount = Number(data.employeeCount || 0);

  const descriptions: Record<DashboardActivityType, string> = {
    "payroll.run.completed": employeeCount
      ? `Payroll run completed for ${employeeCount} employees`
      : "Payroll run completed",
    "employee.hired": `${name} was hired`,
    "employee.terminated": `${name} was terminated`,
    "benefit.enrolled": `${name} enrolled in benefits`,
    "time.approved": "Time approvals were completed",
    "compliance.alert": String(data.description || "New compliance alert received"),
    "expense.approved": amount
      ? `${formatCurrency(amount)} expense approved`
      : "Expense approved",
  };

  return {
    id: `${type}-${now.getTime()}`,
    type,
    description: descriptions[type],
    actor: String(data.actor || "CircleWorks"),
    timeAgo: "now",
    timestamp: now.toISOString(),
  };
}

function PreviewBanner({
  previewAccountType,
  onExit,
}: {
  previewAccountType: AccountType;
  onExit: () => void;
}) {
  return (
    <section
      data-testid="dashboard-preview-banner"
      className="flex flex-col gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-900 shadow-sm dark:border-blue-400/30 dark:bg-blue-500/10 dark:text-blue-100 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-blue-700 dark:bg-blue-500/15 dark:text-blue-200">
          <Eye className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-black">
            Previewing as {accountTypeLabel(previewAccountType)}
          </p>
          <p className="mt-0.5 text-xs font-semibold text-blue-700 dark:text-blue-200">
            Dashboard actions are read-only.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onExit}
        className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-blue-200 bg-white px-3 text-sm font-bold text-blue-700 transition hover:bg-blue-100 dark:border-blue-400/30 dark:bg-blue-500/10 dark:text-blue-100 dark:hover:bg-blue-500/20"
      >
        <X className="h-4 w-4" />
        Exit preview
      </button>
    </section>
  );
}

function PageHeader({
  firstName,
  accountType,
  dateRange,
  setDateRange,
  onRunPayroll,
  readOnly = false,
}: {
  firstName: string;
  accountType: string;
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  onRunPayroll: () => void;
  readOnly?: boolean;
}) {
  const isCreator = accountType === "creator";
  const isAgency = accountType === "agency";
  const secondaryHref = isCreator ? "/app/contractors" : isAgency ? "/app/clients" : "/employees/new";
  const tertiaryHref = isCreator ? "/app/taxes" : isAgency ? "/agency/profitability" : "/reports";
  const secondaryLabel = isCreator ? "Contractors" : isAgency ? "Clients" : "Add Employee";
  const tertiaryLabel = isCreator ? "Tax set-aside" : isAgency ? "Margins" : "View Reports";
  const SecondaryIcon = isCreator ? Handshake : isAgency ? Building2 : UserPlus;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            {getGreeting()}, {firstName}
          </p>
          <div className="mt-2 flex flex-wrap items-end gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
              Dashboard
            </h1>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {getQuarterContext()}
            </span>
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
            {isCreator
              ? "Owner pay, contractor payments, taxes, expenses, and documents in one focused view."
              : isAgency
                ? "Client margin, contractor payments, team payroll, and operating alerts in one view."
                : "Company health, payroll readiness, team activity, and alerts in one operational view."}
          </p>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onRunPayroll}
              disabled={readOnly}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600 dark:focus-visible:ring-offset-slate-950 dark:disabled:bg-slate-700 dark:disabled:text-slate-300"
            >
              {isCreator ? <WalletCards className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isCreator ? "Pay Myself" : "Run Payroll"}
            </button>
            {readOnly ? (
              <span className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <SecondaryIcon className="h-4 w-4" />
                {secondaryLabel}
              </span>
            ) : (
              <Link
                href={secondaryHref}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-blue-300 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-400 dark:hover:text-blue-300"
              >
                <SecondaryIcon className="h-4 w-4" />
                {secondaryLabel}
              </Link>
            )}
            {readOnly ? (
              <span className="inline-flex h-10 items-center gap-2 px-2 text-sm font-bold text-slate-500 dark:text-slate-400">
                {tertiaryLabel}
                <ArrowRight className="h-4 w-4" />
              </span>
            ) : (
              <Link
                href={tertiaryHref}
                className="inline-flex h-10 items-center gap-2 px-2 text-sm font-bold text-blue-700 transition hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200"
              >
                {tertiaryLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>

          <div className="flex flex-wrap gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-950">
            {DATE_RANGES.map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setDateRange(range)}
                className={cx(
                  "h-8 rounded-md px-3 text-xs font-bold transition",
                  dateRange === range
                    ? "bg-white text-slate-950 shadow-sm dark:bg-slate-800 dark:text-white"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white",
                )}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function DefaultWidgetCard({
  widget,
  readOnly = false,
}: {
  widget: DefaultDashboardWidget;
  readOnly?: boolean;
}) {
  const Icon = widget.icon;
  const styles = WIDGET_TONE_CLASSES[widget.tone];
  const content = (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            {widget.detail}
          </p>
          <p className={cx(
            "mt-3 text-3xl font-bold tracking-tight",
            widget.empty ? "text-slate-400 dark:text-slate-500" : "text-slate-950 dark:text-white",
          )}>
            {widget.empty ? widget.emptyText ?? widget.value : widget.value}
          </p>
        </div>
        <span className={cx("flex h-12 w-12 items-center justify-center rounded-xl", styles.icon)}>
          <Icon className="h-8 w-8" />
        </span>
      </div>
      <div className="mt-5 flex items-center justify-between gap-3">
        <span className={cx("rounded-full px-2.5 py-1 text-xs font-bold", styles.badge)}>
          {widget.delta}
        </span>
        <ArrowRight className={cx(
          "h-4 w-4 text-slate-300 transition",
          !readOnly && "group-hover:translate-x-0.5 group-hover:text-blue-600",
        )} />
      </div>
    </>
  );

  if (readOnly) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {content}
      </div>
    );
  }

  return (
    <Link
      href={widget.href}
      className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-blue-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-400/60"
    >
      {content}
    </Link>
  );
}

function getDefaultDashboardWidgets(
  accountType: string,
  summary: DashboardSummary,
): DefaultDashboardWidget[] {
  if (accountType === "creator") {
    const nextSelfPay = summary.creator.nextSelfPay;
    const taxSetAside = summary.creator.taxSetAside;
    const contractorPayments = summary.creator.contractorPayments;

    return [
      {
        id: "creator-next-pay-self",
        title: "Next pay-self",
        value: formatDashboardDate(nextSelfPay.date),
        detail: "Next pay-self",
        delta: nextSelfPay.date
          ? `${formatCurrency(nextSelfPay.amount)} estimated deposit`
          : "Set owner payroll schedule",
        href: "/app/pay-myself",
        icon: WalletCards,
        tone: "blue",
        empty: !nextSelfPay.date && nextSelfPay.amount === 0,
        emptyText: "Not scheduled",
      },
      {
        id: "creator-tax-set-aside",
        title: "Tax set-aside",
        value: formatCurrency(taxSetAside.amount),
        detail: "Tax set-aside",
        delta: taxSetAside.basis === "payroll_taxes"
          ? "Based on payroll taxes"
          : taxSetAside.basis === "estimated_gross"
            ? "Estimated from recent gross"
            : "No payroll basis yet",
        href: "/app/taxes",
        icon: Receipt,
        tone: "amber",
        empty: taxSetAside.basis === "none",
        emptyText: "$0",
      },
      {
        id: "creator-contractor-payments",
        title: "Contractor payments",
        value: formatCurrency(contractorPayments.amount),
        detail: "Contractor payments",
        delta: contractorPayments.count
          ? `${contractorPayments.count} invoices - due ${formatDashboardDate(contractorPayments.nextDueDate)}`
          : "No payments due",
        href: "/app/contractors",
        icon: Handshake,
        tone: "emerald",
        empty: contractorPayments.count === 0,
        emptyText: "$0",
      },
    ];
  }

  if (accountType === "agency") {
    const margin = summary.agency.clientMargin;
    const contractorPayments = summary.agency.contractorPaymentsDue;
    const mixedPayroll = summary.agency.nextMixedPayroll;

    return [
      {
        id: "agency-margin",
        title: "Blended margin",
        value: formatPercent(margin.marginPercent),
        detail: "Client margin",
        delta: margin.marginPercent == null
          ? `${margin.activeClients} active clients`
          : `${formatCurrency(margin.revenue)} revenue - ${formatCurrency(margin.cost)} cost`,
        href: "/agency/profitability",
        icon: TrendingUp,
        tone: "blue",
        empty: margin.marginPercent == null,
        emptyText: "No margin yet",
      },
      {
        id: "agency-contractor-payments",
        title: "Contractor payments",
        value: formatCurrency(contractorPayments.amount),
        detail: "Contractor payments",
        delta: contractorPayments.count
          ? `${contractorPayments.count} invoices - due ${formatDashboardDate(contractorPayments.nextDueDate)}`
          : "No payments due",
        href: "/app/contractors",
        icon: Handshake,
        tone: "emerald",
        empty: contractorPayments.count === 0,
        emptyText: "$0",
      },
      {
        id: "agency-next-mixed-payroll",
        title: "Next mixed payroll run",
        value: formatDashboardDate(mixedPayroll.date),
        detail: "Next mixed run",
        delta: `${mixedPayroll.employeeCount} staff - ${mixedPayroll.contractorCount} contractors`,
        href: "/payroll/run",
        icon: CalendarDays,
        tone: "amber",
        empty: !mixedPayroll.date && mixedPayroll.contractorCount === 0,
        emptyText: "Not scheduled",
      },
    ];
  }

  const company = summary.company;
  return [
    {
      id: "company-headcount",
      title: "Headcount",
      value: String(company.headcount.active),
      detail: "Headcount",
      delta: `${company.headcount.onboarding} onboarding`,
      href: "/employees",
      icon: Users,
      tone: "blue",
      empty: company.headcount.active === 0,
      emptyText: "No employees yet",
    },
    {
      id: "company-next-run",
      title: "Next payroll run",
      value: formatDashboardDate(company.nextPayroll.date),
      detail: "Next payroll run",
      delta: company.nextPayroll.date
        ? `${company.nextPayroll.employeeCount} employees - ${formatCurrency(company.nextPayroll.estimatedGross)}`
        : "Set a payroll schedule",
      href: "/payroll/run",
      icon: CalendarDays,
      tone: "emerald",
      empty: !company.nextPayroll.date,
      emptyText: "Not scheduled",
    },
    {
      id: "company-pending-hr-tasks",
      title: "Pending HR tasks",
      value: String(company.pendingHrTasks.total),
      detail: "Pending HR/onboarding tasks",
      delta: `${company.pendingHrTasks.onboardingCases + company.pendingHrTasks.onboardingEmployees} onboarding - ${company.pendingHrTasks.ptoRequests + company.pendingHrTasks.timesheets} approvals`,
      href: "/onboarding",
      icon: CheckCircle2,
      tone: "amber",
      empty: company.pendingHrTasks.total === 0,
      emptyText: "Clear",
    },
  ];
}

function DefaultDashboardWidgets({
  accountType,
  summary,
  readOnly = false,
}: {
  accountType: string;
  summary: DashboardSummary;
  readOnly?: boolean;
}) {
  const widgets = getDefaultDashboardWidgets(accountType, summary);

  return (
    <section className="grid gap-4 md:grid-cols-3">
      {widgets.map((widget) => (
        <DefaultWidgetCard key={widget.id} widget={widget} readOnly={readOnly} />
      ))}
    </section>
  );
}

function getVariantQuickActions(accountType: string, summary: DashboardSummary) {
  if (accountType === "creator") return summary.creator.quickActions;
  if (accountType === "agency") return summary.agency.quickActions;
  return summary.company.quickActions;
}

function VariantQuickActions({
  accountType,
  summary,
  readOnly = false,
}: {
  accountType: string;
  summary: DashboardSummary;
  readOnly?: boolean;
}) {
  const actions = getVariantQuickActions(accountType, summary);
  const icons: Record<string, React.ElementType> = {
    "add-client": Building2,
    "add-contractor": Handshake,
    "add-employee": UserPlus,
    "pay-contractors": Handshake,
    "pay-myself": WalletCards,
    "run-payroll": Play,
  };

  return (
    <section className="flex flex-wrap gap-3">
      {actions.map((action: DashboardQuickAction) => {
        const Icon = icons[action.id] ?? ArrowRight;
        const classes = cx(
          "inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-bold transition",
          action.tone === "primary"
            ? readOnly
              ? "bg-slate-300 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
              : "bg-blue-600 text-white hover:bg-blue-700"
            : readOnly
              ? "border border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              : "border border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-400 dark:hover:text-blue-300",
        );
        return readOnly ? (
          <button
            key={action.id}
            type="button"
            disabled
            className={cx(classes, "cursor-not-allowed")}
          >
            <Icon className="h-4 w-4" />
            {action.label}
          </button>
        ) : (
          <Link
            key={action.id}
            href={action.href}
            className={cx(
              classes,
            )}
          >
            <Icon className="h-4 w-4" />
            {action.label}
          </Link>
        );
      })}
    </section>
  );
}

function PayrollStatusCard({
  overview,
  payrollRunInProgress,
  onStart,
  readOnly = false,
}: {
  overview: DashboardOverview;
  payrollRunInProgress: boolean;
  onStart: () => void;
  readOnly?: boolean;
}) {
  const activeRun = overview.activePayrollRun;
  const hasActiveRun = payrollRunInProgress || activeRun.status !== "NONE";
  const status = payrollRunInProgress && activeRun.status === "NONE" ? "PROCESSING" : activeRun.status;

  if (!hasActiveRun) {
    return (
      <section className="rounded-xl border border-slate-200 bg-slate-100 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              Next payroll: {overview.nextPayroll.date}
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {overview.nextPayroll.employeeCount} employees - estimated gross {formatCurrency(overview.nextPayroll.estimatedGross)}
            </p>
          </div>
          <button
            type="button"
            onClick={onStart}
            disabled={readOnly}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600 dark:disabled:bg-slate-700 dark:disabled:text-slate-300"
          >
            Start Run
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-xl border border-blue-500/20 bg-blue-600 p-5 text-white shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-black uppercase tracking-wide text-white">
              {status}
            </span>
            <span className="text-sm font-semibold text-blue-100">
              Pay date {activeRun.payDate}
            </span>
          </div>
          <h2 className="mt-3 text-xl font-bold">
            Active payroll run for {activeRun.period}
          </h2>
          <p className="mt-1 text-sm text-blue-100">
            {activeRun.employeeCount} employees - estimated gross {formatCurrency(activeRun.estimatedGross)}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {status === "PROCESSING" ? (
            <div className="min-w-[220px]">
              <div className="mb-2 flex items-center justify-between text-xs font-bold text-blue-100">
                <span>Processing</span>
                <span>{activeRun.progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-white transition-all"
                  style={{ width: `${activeRun.progress}%` }}
                />
              </div>
            </div>
          ) : null}
          {readOnly ? (
            <span className="inline-flex h-10 items-center justify-center rounded-lg bg-white/80 px-4 text-sm font-bold text-blue-700">
              Review & Submit
            </span>
          ) : (
            <Link
              href="/payroll/run"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-white px-4 text-sm font-bold text-blue-700 transition hover:bg-blue-50"
            >
              Review & Submit
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

function CreatorPaySelfStatusCard({
  summary,
  readOnly = false,
}: {
  summary: DashboardSummary["creator"];
  readOnly?: boolean;
}) {
  const hasSelfPay = Boolean(summary.nextSelfPay.date) || summary.nextSelfPay.amount > 0;

  return (
    <section className="overflow-hidden rounded-xl border border-blue-500/20 bg-blue-600 p-5 text-white shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-black uppercase tracking-wide text-white">
              {summary.nextSelfPay.status ?? "Not scheduled"}
            </span>
            <span className="text-sm font-semibold text-blue-100">
              Next owner deposit {formatDashboardDate(summary.nextSelfPay.date)}
            </span>
          </div>
          <h2 className="mt-3 text-xl font-bold">
            {hasSelfPay ? "Owner payroll is ready to review" : "Owner payroll is not scheduled"}
          </h2>
          <p className="mt-1 text-sm text-blue-100">
            Estimated net deposit {formatCurrency(summary.nextSelfPay.amount)}.
          </p>
        </div>
        {readOnly ? (
          <span className="inline-flex h-10 items-center justify-center rounded-lg bg-white/80 px-4 text-sm font-bold text-blue-700">
            Review Pay Myself
          </span>
        ) : (
          <Link
            href="/app/pay-myself"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-white px-4 text-sm font-bold text-blue-700 transition hover:bg-blue-50"
          >
            Review Pay Myself
          </Link>
        )}
      </div>
    </section>
  );
}

function CreatorDashboardPanels({ summary }: { summary: DashboardSummary["creator"] }) {
  const upcomingSelfPay = summary.nextSelfPay.date
    ? [summary.nextSelfPay.date]
    : [];

  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-950 dark:text-white">Pay-self schedule</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Upcoming owner payroll runs</p>
          </div>
          <WalletCards className="h-5 w-5 text-blue-600" />
        </div>
        <div className="mt-5 space-y-3">
          {upcomingSelfPay.length ? (
            upcomingSelfPay.map((date) => (
              <div key={date} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-950/60">
                <span className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                  <CalendarDays className="h-4 w-4 text-slate-400" />
                  {formatDashboardDate(date)}
                </span>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {summary.nextSelfPay.status ?? "Scheduled"}
                </span>
              </div>
            ))
          ) : (
            <div className="rounded-lg bg-slate-50 px-3 py-4 text-sm font-semibold text-slate-500 dark:bg-slate-950/60 dark:text-slate-400">
              No owner payroll run scheduled.
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-950 dark:text-white">Tax set-aside</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Quarterly estimate coverage</p>
          </div>
          <Receipt className="h-5 w-5 text-amber-600" />
        </div>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-amber-500"
            style={{ width: `${summary.taxSetAside.amount > 0 ? 72 : 0}%` }}
          />
        </div>
        <div className="mt-4 flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-950/60">
          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
            {summary.taxSetAside.basis === "none" ? "No estimate" : "Current set-aside"}
          </span>
          <span className="text-sm font-black text-slate-950 dark:text-white">
            {formatCurrency(summary.taxSetAside.amount)}
          </span>
        </div>
      </div>
    </section>
  );
}

function AgencyDashboardPanels({ summary }: { summary: DashboardSummary["agency"] }) {
  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-950 dark:text-white">Client margin</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {summary.clientMargin.activeClients} clients - {summary.clientMargin.activeProjects} projects
            </p>
          </div>
          <TrendingUp className="h-5 w-5 text-blue-600" />
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-slate-50 px-3 py-3 dark:bg-slate-950/60">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Revenue</p>
            <p className="mt-1 text-lg font-black text-slate-950 dark:text-white">
              {formatCurrency(summary.clientMargin.revenue)}
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 px-3 py-3 dark:bg-slate-950/60">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Cost</p>
            <p className="mt-1 text-lg font-black text-slate-950 dark:text-white">
              {formatCurrency(summary.clientMargin.cost)}
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 px-3 py-3 dark:bg-slate-950/60">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Margin</p>
            <p className="mt-1 text-lg font-black text-slate-950 dark:text-white">
              {formatPercent(summary.clientMargin.marginPercent)}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-950 dark:text-white">Mixed payroll queue</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Staff payroll and contractor payments
            </p>
          </div>
          <Handshake className="h-5 w-5 text-emerald-600" />
        </div>
        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-950/60">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
              Next run
            </span>
            <span className="text-sm font-black text-slate-950 dark:text-white">
              {formatDashboardDate(summary.nextMixedPayroll.date)}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-950/60">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
              Contractor payments
            </span>
            <span className="text-sm font-black text-slate-950 dark:text-white">
              {formatCurrency(summary.contractorPaymentsDue.amount)}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function ChartPlaceholder() {
  return (
    <div className="h-full w-full animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
  );
}

function ChartFrame({
  children,
  mounted,
}: {
  children: (size: { width: number; height: number }) => React.ReactNode;
  mounted: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const updateSize = () => {
      const rect = element.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setSize({
          width: Math.max(1, Math.floor(rect.width)),
          height: Math.max(1, Math.floor(rect.height)),
        });
      }
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="h-[320px] min-w-[1px]">
      {mounted && size ? children(size) : <ChartPlaceholder />}
    </div>
  );
}

function PayrollTrendChart({
  data,
  mounted,
}: {
  data: PayrollTrendPoint[];
  mounted: boolean;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-950 dark:text-white">
            Payroll Trend - Last 12 Months
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Monthly gross payroll
          </p>
        </div>
        <TrendingUp className="h-5 w-5 text-blue-600" />
      </div>
      <ChartFrame mounted={mounted}>
        {({ width, height }) => (
          <AreaChart width={width} height={height} data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="payrollGrossFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563eb" stopOpacity={0.32} />
                <stop offset="100%" stopColor="#2563eb" stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#64748b", fontWeight: 600 }}
            />
            <YAxis
              width={64}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#94a3b8" }}
              tickFormatter={(value) => `$${Math.round(Number(value) / 1000)}k`}
            />
            <RechartsTooltip
              cursor={{ stroke: "#93c5fd", strokeWidth: 1 }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const value = Number(payload[0]?.value || 0);
                return (
                  <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-700 dark:bg-slate-900">
                    <p className="text-sm font-bold text-slate-950 dark:text-white">
                      {label}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-blue-600 dark:text-blue-300">
                      {formatCurrency(value)}
                    </p>
                  </div>
                );
              }}
            />
            <Area
              type="monotone"
              dataKey="gross"
              stroke="#2563eb"
              strokeWidth={3}
              fill="url(#payrollGrossFill)"
              dot={{ r: 3, fill: "#2563eb", strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        )}
      </ChartFrame>
    </section>
  );
}

function HeadcountBreakdownChart({
  data,
  mounted,
}: {
  data: HeadcountBreakdownPoint[];
  mounted: boolean;
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-950 dark:text-white">
            Team Composition
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Full-time, part-time, and contractors
          </p>
        </div>
        <PieChart className="h-5 w-5 text-violet-600" />
      </div>
      <ChartFrame mounted={mounted}>
        {({ width, height }) => (
          <RechartsPieChart width={width} height={height}>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={68}
              outerRadius={104}
              paddingAngle={4}
            >
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
            <RechartsTooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const point = payload[0]?.payload as HeadcountBreakdownPoint;
                return (
                  <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-700 dark:bg-slate-900">
                    <p className="text-sm font-bold text-slate-950 dark:text-white">
                      {point.name}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
                      {point.value} people
                    </p>
                  </div>
                );
              }}
            />
            <Legend
              verticalAlign="bottom"
              iconType="circle"
              formatter={(value) => (
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {value}
                </span>
              )}
            />
          </RechartsPieChart>
        )}
      </ChartFrame>
      <div className="mt-3 rounded-lg bg-slate-50 px-4 py-3 text-center text-sm font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
        {total} total workers
      </div>
    </section>
  );
}

type QuickModule = DashboardOverview["quickModules"][number];

const QUICK_MODULE_CAPABILITIES: Record<string, CapabilityKey> = {
  benefits: "benefits",
  clients: "clients",
  compliance: "compliance",
  contractors: "contractors",
  documents: "documents",
  expenses: "expenses",
  hiring: "hiring",
  onboarding: "onboarding",
  ownerPayroll: "ownerPayroll",
  ownerTaxes: "ownerTaxes",
  time: "time",
};

function getQuickModulesForAccountType(accountType: string, overview: DashboardOverview): QuickModule[] {
  const capabilities = getCapabilities(accountType);
  const allowedOverviewModules = overview.quickModules.filter((module) => {
    const capability = QUICK_MODULE_CAPABILITIES[module.id];
    return !capability || capabilities[capability];
  });

  if (accountType === "creator") {
    return [
      {
        id: "ownerPayroll",
        title: "Pay Myself",
        primary: "Owner payroll ready",
        secondary: "Salary, schedule, AutoPilot, and run-now controls",
        href: "/app/pay-myself",
        actionLabel: "Open",
        tone: "blue",
      },
      {
        id: "ownerTaxes",
        title: "Taxes",
        primary: "Q2 set-aside is tracking",
        secondary: "Quarterly estimates and filing forms",
        href: "/app/taxes",
        actionLabel: "Review",
        tone: "amber",
      },
      {
        id: "contractors",
        title: "Contractors",
        primary: "3 collaborators active",
        secondary: "Editors, VAs, designers, and 1099 payments",
        href: "/app/contractors",
        actionLabel: "Manage",
        tone: "emerald",
      },
      {
        id: "documents",
        title: "Documents",
        primary: "4 creator records",
        secondary: "Owner W-2, 1099, W-9, and tax worksheets",
        href: "/app/documents",
        actionLabel: "Open",
        tone: "violet",
      },
      ...allowedOverviewModules.filter((module) => module.id === "expenses"),
    ];
  }

  if (accountType === "agency") {
    return [
      {
        id: "clients",
        title: "Clients",
        primary: "Client billing ready",
        secondary: "Projects, bill rates, and margin controls",
        href: "/app/clients",
        actionLabel: "Open",
        tone: "blue",
      },
      {
        id: "contractors",
        title: "Contractors",
        primary: "Mixed workforce payments",
        secondary: "W-2 staff and contractor payroll queues",
        href: "/app/contractors",
        actionLabel: "Manage",
        tone: "emerald",
      },
      ...allowedOverviewModules,
    ];
  }

  return allowedOverviewModules;
}

function QuickModulesGrid({
  overview,
  accountType,
  readOnly = false,
}: {
  overview: DashboardOverview;
  accountType: string;
  readOnly?: boolean;
}) {
  const modules = getQuickModulesForAccountType(accountType, overview);

  if (!modules.length) return null;

  return (
    <section>
      <h2 className="mb-3 text-base font-bold text-slate-950 dark:text-white">
        Quick Modules
      </h2>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {modules.map((module) => {
          const Icon = MODULE_ICONS[module.id] || CheckCircle2;
          const content = (
            <>
              <div className="flex items-start justify-between gap-3">
                <span className={cx("flex h-10 w-10 items-center justify-center rounded-lg", MODULE_TONES[module.tone])}>
                  <Icon className="h-5 w-5" />
                </span>
                <ArrowRight className={cx(
                  "h-4 w-4 text-slate-300 transition",
                  !readOnly && "group-hover:translate-x-0.5 group-hover:text-blue-600",
                )} />
              </div>
              <h3 className="mt-4 text-sm font-bold text-slate-950 dark:text-white">
                {module.title}
              </h3>
              <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                {module.primary}
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {module.secondary}
              </p>
              <span className="mt-4 inline-flex text-sm font-bold text-blue-700 dark:text-blue-300">
                {module.actionLabel}
              </span>
            </>
          );

          return readOnly ? (
            <div
              key={module.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              {content}
            </div>
          ) : (
            <Link
              key={module.id}
              href={module.href}
              className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-400/60"
            >
              {content}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function AlertsPanel({ overview }: { overview: DashboardOverview }) {
  const hasCompliance = overview.alerts.compliance.length > 0;
  const hasDocuments = overview.alerts.missingDocuments.length > 0;

  if (!hasCompliance && !hasDocuments) return null;

  return (
    <section className="grid gap-4 lg:grid-cols-2">
      {hasCompliance ? (
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-5 shadow-sm dark:border-orange-400/20 dark:bg-orange-500/10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300">
                <AlertTriangle className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-sm font-bold text-orange-950 dark:text-orange-100">
                  Compliance alerts
                </h2>
                <div className="mt-3 space-y-2">
                  {overview.alerts.compliance.map((alert) => (
                    <div key={alert.id}>
                      <p className="text-sm font-semibold text-orange-950 dark:text-orange-100">
                        {alert.title}
                      </p>
                      <p className="text-sm text-orange-800 dark:text-orange-200">
                        {alert.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <Link
              href="/compliance"
              className="shrink-0 text-sm font-bold text-orange-800 underline-offset-2 hover:underline dark:text-orange-200"
            >
              View All
            </Link>
          </div>
        </div>
      ) : null}

      {hasDocuments ? (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-5 shadow-sm dark:border-yellow-400/20 dark:bg-yellow-500/10">
          <div className="flex gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-300">
              <FileWarning className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-yellow-950 dark:text-yellow-100">
                Missing employee documents
              </h2>
              <div className="mt-3 space-y-2">
                {overview.alerts.missingDocuments.map((alert) => (
                  <div key={alert.id}>
                    <p className="text-sm font-semibold text-yellow-950 dark:text-yellow-100">
                      {alert.title}
                    </p>
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      {alert.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function ActivityFeed({ events }: { events: DashboardActivity[] }) {
  return (
    <aside className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 xl:sticky xl:top-24 xl:h-[calc(100dvh-8rem)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-950 dark:text-white">
            Recent Activity
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Live company events
          </p>
        </div>
        <CalendarDays className="h-5 w-5 text-slate-400" />
      </div>

      <div className="max-h-[calc(100dvh-14rem)] space-y-1 overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {events.map((event) => {
            const Icon = ACTIVITY_ICONS[event.type];
            return (
              <motion.div
                key={event.id}
                layout
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 16 }}
                className="flex gap-3 rounded-lg px-2 py-3 transition hover:bg-slate-50 dark:hover:bg-slate-800/70"
              >
                <span className={cx("mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", ACTIVITY_STYLES[event.type])}>
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold leading-5 text-slate-900 dark:text-white">
                    {event.description}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {event.actor} - {event.timeAgo}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </aside>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    currentCompany,
    currentUser,
    accountType,
    dashboardPreviewAccountType,
    payrollRunInProgress,
    clearDashboardPreviewAccountType,
    setPayrollRunning,
  } = usePlatformStore();
  const { setPayrollStatus } = useDashboardRealtimeStore();
  const { socket, emit, on, off } = useSocketStore();
  const [dateRange, setDateRange] = useState<DateRange>("Last 30 days");
  const [activityEvents, setActivityEvents] = useState<DashboardActivity[]>([]);
  const [chartsMounted, setChartsMounted] = useState(false);

  const userRole = user?.role?.toLowerCase() || currentUser.role;
  const firstName = firstNameFromName(currentUser.name);
  const normalizedAccountType = normalizeAccountType(currentCompany.accountType ?? accountType);

  useEffect(() => {
    if (userRole === "accountant") router.push("/accountant-portal");
    if (userRole === "contractor") router.push("/contractor-portal");
    if (userRole === "employee") router.push("/me");
  }, [router, userRole]);

  useEffect(() => {
    setChartsMounted(true);
  }, []);

  const overviewQuery = useQuery({
    queryKey: ["dashboard", "overview", currentCompany.id, dateRange],
    queryFn: () =>
      fetchJson<DashboardOverview>(
        `/api/dashboard/overview?companyId=${encodeURIComponent(currentCompany.id)}&range=${encodeURIComponent(dateRange)}`,
      ),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const summaryQuery = useQuery({
    queryKey: ["dashboard", "summary", currentCompany.id, normalizedAccountType],
    queryFn: () => fetchJson<DashboardSummary>("/api/dashboard/summary"),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const payrollTrendQuery = useQuery({
    queryKey: ["reports", "payroll-trend", 12],
    queryFn: async () => {
      const response = await fetchJson<{ data: PayrollTrendPoint[] }>(
        "/api/reports/payroll-trend?months=12",
      );
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const headcountBreakdownQuery = useQuery({
    queryKey: ["reports", "headcount-breakdown", currentCompany.id],
    queryFn: async () => {
      const response = await fetchJson<{ data: HeadcountBreakdownPoint[] }>(
        "/api/reports/headcount-breakdown",
      );
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (overviewQuery.data?.activity) {
      setActivityEvents(overviewQuery.data.activity);
    }
  }, [overviewQuery.data?.activity]);

  useEffect(() => {
    if (!socket) return;

    const room = `company:${currentCompany.id}`;
    emit("room.join", { room });

    const eventTypes: DashboardActivityType[] = [
      "payroll.run.completed",
      "employee.hired",
      "employee.terminated",
      "benefit.enrolled",
      "time.approved",
      "compliance.alert",
      "expense.approved",
    ];

    const handlers = eventTypes.map((type) => {
      const handler = (data: Record<string, unknown>) => {
        const nextEvent = buildActivityFromSocket(type, data);
        setActivityEvents((current) => [nextEvent, ...current].slice(0, 30));
      };
      on(type, handler);
      return { type, handler };
    });

    return () => {
      handlers.forEach(({ type, handler }) => off(type, handler));
      emit("room.leave", { room });
    };
  }, [currentCompany.id, emit, off, on, socket]);

  const overview = overviewQuery.data;
  const summary = summaryQuery.data;
  const payrollTrend = payrollTrendQuery.data ?? [];
  const headcountBreakdown = headcountBreakdownQuery.data ?? [];
  const isLoading =
    (summaryQuery.isLoading && !summaryQuery.data) ||
    (overviewQuery.isLoading && !overviewQuery.data) ||
    (payrollTrendQuery.isLoading && !payrollTrendQuery.data) ||
    (headcountBreakdownQuery.isLoading && !headcountBreakdownQuery.data);
  const hasError =
    summaryQuery.isError ||
    overviewQuery.isError ||
    payrollTrendQuery.isError ||
    headcountBreakdownQuery.isError;
  const queryError =
    summaryQuery.error ||
    overviewQuery.error ||
    payrollTrendQuery.error ||
    headcountBreakdownQuery.error;
  const previewAccountType = dashboardPreviewAccountType
    ? normalizeAccountType(dashboardPreviewAccountType)
    : null;
  const isPreviewingDashboard = Boolean(previewAccountType && previewAccountType !== normalizedAccountType);
  const dashboardAccountType = normalizeAccountType(
    isPreviewingDashboard ? previewAccountType : summary?.accountType ?? normalizedAccountType,
  );

  const startPayrollRun = () => {
    if (isPreviewingDashboard) return;
    if (dashboardAccountType === "creator") {
      router.push("/app/pay-myself");
      return;
    }

    setPayrollRunning(true);
    setPayrollStatus({ isRunning: true, employeeCount: overview?.activePayrollRun.employeeCount ?? 0 });
    router.push("/payroll/run");
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!overview || !summary || hasError) {
    return (
      <div className="mx-auto flex min-h-[calc(100dvh-8rem)] w-full max-w-3xl items-center justify-center px-4">
        <ErrorState
          title="Something went wrong"
          description={queryError instanceof Error ? queryError.message : "Dashboard data could not load."}
          retry={() => {
            void summaryQuery.refetch();
            void overviewQuery.refetch();
            void payrollTrendQuery.refetch();
            void headcountBreakdownQuery.refetch();
          }}
        />
      </div>
    );
  }

  return (
    <div
      id="tour-dashboard"
      className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 py-6 sm:px-6"
    >
      {isPreviewingDashboard && previewAccountType ? (
        <PreviewBanner
          previewAccountType={previewAccountType}
          onExit={clearDashboardPreviewAccountType}
        />
      ) : null}

      <PageHeader
        firstName={firstName}
        accountType={dashboardAccountType}
        dateRange={dateRange}
        setDateRange={setDateRange}
        onRunPayroll={startPayrollRun}
        readOnly={isPreviewingDashboard}
      />

      <OnboardingChecklistWidget
        companyId={currentCompany.id}
        accountType={dashboardAccountType}
        entityType={currentCompany.entityType}
        creatorEntityType={currentCompany.creatorEntityType}
        readOnly={isPreviewingDashboard}
      />

      <DefaultDashboardWidgets accountType={dashboardAccountType} summary={summary} readOnly={isPreviewingDashboard} />
      <VariantQuickActions accountType={dashboardAccountType} summary={summary} readOnly={isPreviewingDashboard} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-6">
          {dashboardAccountType === "creator" ? (
            <CreatorPaySelfStatusCard summary={summary.creator} readOnly={isPreviewingDashboard} />
          ) : (
            <PayrollStatusCard
              overview={overview}
              payrollRunInProgress={payrollRunInProgress}
              onStart={startPayrollRun}
              readOnly={isPreviewingDashboard}
            />
          )}

          {dashboardAccountType === "creator" ? (
            <CreatorDashboardPanels summary={summary.creator} />
          ) : dashboardAccountType === "agency" ? (
            <AgencyDashboardPanels summary={summary.agency} />
          ) : (
            <section className="grid gap-6 lg:grid-cols-[3fr_2fr]">
              <PayrollTrendChart data={payrollTrend} mounted={chartsMounted} />
              <HeadcountBreakdownChart data={headcountBreakdown} mounted={chartsMounted} />
            </section>
          )}

          <QuickModulesGrid overview={overview} accountType={dashboardAccountType} readOnly={isPreviewingDashboard} />
          <AlertsPanel overview={overview} />
        </div>

        <ActivityFeed events={activityEvents} />
      </div>
    </div>
  );
}
