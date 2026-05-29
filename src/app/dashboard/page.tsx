"use client";

import { useEffect, useMemo, useState } from "react";
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
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  Clock,
  DollarSign,
  FileWarning,
  Heart,
  Loader2,
  PieChart,
  Play,
  Receipt,
  ShieldAlert,
  TrendingUp,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useDashboardRealtimeStore } from "@/store/useDashboardRealtimeStore";
import { usePlatformStore } from "@/store/usePlatformStore";
import { useSocketStore } from "@/store/useSocketStore";
import type {
  DashboardActivity,
  DashboardActivityType,
  DashboardKpi,
  DashboardOverview,
  HeadcountBreakdownPoint,
  PayrollTrendPoint,
} from "@/lib/dashboard-data";

type DateRange = "Last 7 days" | "Last 30 days" | "This Quarter" | "Custom";

const DATE_RANGES: DateRange[] = [
  "Last 7 days",
  "Last 30 days",
  "This Quarter",
  "Custom",
];

const KPI_ICONS: Record<DashboardKpi["id"], React.ElementType> = {
  headcount: Users,
  monthlyGross: DollarSign,
  taxLiability: ShieldAlert,
  openPositions: Briefcase,
};

const TONE_CLASSES: Record<
  DashboardKpi["tone"],
  { icon: string; badge: string }
> = {
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

function DashboardSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 py-6 sm:px-6">
      <div className="h-28 animate-pulse rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-36 animate-pulse rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
          />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
    </div>
  );
}

function PageHeader({
  firstName,
  dateRange,
  setDateRange,
  onRunPayroll,
}: {
  firstName: string;
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  onRunPayroll: () => void;
}) {
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
            Company health, payroll readiness, team activity, and alerts in one operational view.
          </p>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onRunPayroll}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
            >
              <Play className="h-4 w-4" />
              Run Payroll
            </button>
            <Link
              href="/employees/new"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-blue-300 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-400 dark:hover:text-blue-300"
            >
              <UserPlus className="h-4 w-4" />
              Add Employee
            </Link>
            <Link
              href="/reports"
              className="inline-flex h-10 items-center gap-2 px-2 text-sm font-bold text-blue-700 transition hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200"
            >
              View Reports
              <ArrowRight className="h-4 w-4" />
            </Link>
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

function KpiCard({ kpi }: { kpi: DashboardKpi }) {
  const Icon = KPI_ICONS[kpi.id];
  const styles = TONE_CLASSES[kpi.tone];

  return (
    <Link
      href={kpi.href}
      className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-blue-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-400/60"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            {kpi.detail}
          </p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
            {kpi.value}
          </p>
        </div>
        <span className={cx("flex h-12 w-12 items-center justify-center rounded-xl", styles.icon)}>
          <Icon className="h-8 w-8" />
        </span>
      </div>
      <div className="mt-5 flex items-center justify-between gap-3">
        <span className={cx("rounded-full px-2.5 py-1 text-xs font-bold", styles.badge)}>
          {kpi.delta}
        </span>
        <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-600" />
      </div>
    </Link>
  );
}

function PayrollStatusCard({
  overview,
  payrollRunInProgress,
  onStart,
}: {
  overview: DashboardOverview;
  payrollRunInProgress: boolean;
  onStart: () => void;
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
            className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-bold text-white transition hover:bg-blue-700"
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
          <Link
            href="/payroll/run"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-white px-4 text-sm font-bold text-blue-700 transition hover:bg-blue-50"
          >
            Review & Submit
          </Link>
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
      <div className="h-[320px] min-w-0">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
            <AreaChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
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
          </ResponsiveContainer>
        ) : (
          <ChartPlaceholder />
        )}
      </div>
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
      <div className="h-[320px] min-w-0">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
            <RechartsPieChart>
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
          </ResponsiveContainer>
        ) : (
          <ChartPlaceholder />
        )}
      </div>
      <div className="mt-3 rounded-lg bg-slate-50 px-4 py-3 text-center text-sm font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
        {total} total workers
      </div>
    </section>
  );
}

function QuickModulesGrid({ overview }: { overview: DashboardOverview }) {
  return (
    <section>
      <h2 className="mb-3 text-base font-bold text-slate-950 dark:text-white">
        Quick Modules
      </h2>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {overview.quickModules.map((module) => {
          const Icon = MODULE_ICONS[module.id] || CheckCircle2;
          return (
            <Link
              key={module.id}
              href={module.href}
              className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-400/60"
            >
              <div className="flex items-start justify-between gap-3">
                <span className={cx("flex h-10 w-10 items-center justify-center rounded-lg", MODULE_TONES[module.tone])}>
                  <Icon className="h-5 w-5" />
                </span>
                <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-600" />
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
    payrollRunInProgress,
    setPayrollRunning,
  } = usePlatformStore();
  const { setPayrollStatus } = useDashboardRealtimeStore();
  const { socket, emit, on, off } = useSocketStore();
  const [dateRange, setDateRange] = useState<DateRange>("Last 30 days");
  const [activityEvents, setActivityEvents] = useState<DashboardActivity[]>([]);
  const [chartsMounted, setChartsMounted] = useState(false);

  const userRole = user?.role?.toLowerCase() || currentUser.role;
  const firstName = firstNameFromName(currentUser.name);

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
  const payrollTrend = payrollTrendQuery.data ?? [];
  const headcountBreakdown = headcountBreakdownQuery.data ?? [];
  const isLoading =
    overviewQuery.isLoading ||
    payrollTrendQuery.isLoading ||
    headcountBreakdownQuery.isLoading;
  const hasError =
    overviewQuery.isError ||
    payrollTrendQuery.isError ||
    headcountBreakdownQuery.isError;

  const kpis = useMemo(() => overview?.kpis ?? [], [overview?.kpis]);

  const startPayrollRun = () => {
    setPayrollRunning(true);
    setPayrollStatus({ isRunning: true, employeeCount: overview?.activePayrollRun.employeeCount ?? 0 });
    router.push("/payroll/run");
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!overview || hasError) {
    return (
      <div className="mx-auto flex min-h-[calc(100dvh-8rem)] w-full max-w-3xl items-center justify-center px-4">
        <div className="rounded-xl border border-red-200 bg-white p-8 text-center shadow-sm dark:border-red-500/30 dark:bg-slate-900">
          <AlertTriangle className="mx-auto h-10 w-10 text-red-500" />
          <h1 className="mt-4 text-lg font-bold text-slate-950 dark:text-white">
            Dashboard data could not load
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Refresh the page or try again in a moment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      id="tour-dashboard"
      className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 py-6 sm:px-6"
    >
      <PageHeader
        firstName={firstName}
        dateRange={dateRange}
        setDateRange={setDateRange}
        onRunPayroll={startPayrollRun}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.id} kpi={kpi} />
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-6">
          <PayrollStatusCard
            overview={overview}
            payrollRunInProgress={payrollRunInProgress}
            onStart={startPayrollRun}
          />

          <section className="grid gap-6 lg:grid-cols-[3fr_2fr]">
            <PayrollTrendChart data={payrollTrend} mounted={chartsMounted} />
            <HeadcountBreakdownChart data={headcountBreakdown} mounted={chartsMounted} />
          </section>

          <QuickModulesGrid overview={overview} />
          <AlertsPanel overview={overview} />
        </div>

        <ActivityFeed events={activityEvents} />
      </div>
    </div>
  );
}
