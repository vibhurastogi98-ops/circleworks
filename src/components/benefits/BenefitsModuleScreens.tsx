"use client";

import { useMemo, useState, type ElementType } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowRight,
  BadgeDollarSign,
  Bell,
  BriefcaseMedical,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Download,
  Edit3,
  FileSpreadsheet,
  HeartPulse,
  Loader2,
  Mail,
  PiggyBank,
  Plus,
  Search,
  Send,
  Shield,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
  WalletCards,
  X,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  employees as hrisEmployees,
  getEmployeeName,
} from "@/lib/hris-module-data";
import type {
  BenefitPlan,
  BenefitsModuleData,
  BenefitsModuleScreen,
  BenefitsOverviewData,
  BenefitsPlansData,
  CobraData,
  EnrollmentWizardData,
  FsaHsaData,
  LifeDisabilityData,
  OpenEnrollmentData,
  PlanCategory,
  QleData,
  QleStatus,
  RetirementData,
} from "@/lib/benefits-module-data";

type ApiResponse<T extends BenefitsModuleData> = {
  screen: BenefitsModuleScreen;
  data: T;
};

type BenefitsActionPayload = {
  action: string;
  screen: BenefitsModuleScreen;
  payload?: Record<string, unknown>;
};

const planIcons: Record<string, ElementType> = {
  Medical: BriefcaseMedical,
  Dental: HeartPulse,
  Vision: ShieldCheck,
  "401k": PiggyBank,
  Life: Shield,
  HSA: WalletCards,
  FSA: WalletCards,
  Supplemental: Sparkles,
};

const statusStyles: Record<string, string> = {
  Active: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-300",
  "Renewal Soon": "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-300",
  Expired: "border-red-200 bg-red-50 text-red-700 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-300",
  Draft: "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200",
  Completed: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-300",
  Enrolled: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-300",
  "In Progress": "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-400/30 dark:bg-blue-500/10 dark:text-blue-300",
  "Not Started": "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200",
  Waived: "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-400/30 dark:bg-violet-500/10 dark:text-violet-300",
  "Pending Review": "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-300",
  Approved: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-300",
  Denied: "border-red-200 bg-red-50 text-red-700 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-300",
  Connected: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-300",
  Synced: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-300",
  Pending: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-300",
  Current: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-300",
  "Past Due": "border-red-200 bg-red-50 text-red-700 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-300",
  Unpaid: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-300",
  Sent: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-400/30 dark:bg-blue-500/10 dark:text-blue-300",
  "Not Sent": "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200",
  Elected: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-300",
  Ready: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-300",
  "Needs Review": "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-300",
  Healthy: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-300",
  "Sync Needed": "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-300",
  "Pre-tax": "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-300",
  "Post-tax": "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-400/30 dark:bg-violet-500/10 dark:text-violet-300",
  Open: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-300",
  Closed: "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200",
  "N/A": "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200",
};

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function number(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

async function fetchBenefitsModule<T extends BenefitsModuleData>(
  screen: BenefitsModuleScreen,
  employeeId?: string,
) {
  const params = new URLSearchParams({ screen });
  if (employeeId) params.set("employeeId", employeeId);
  const response = await fetch(`/api/benefits/module?${params.toString()}`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Unable to load benefits data");
  return (await response.json()) as ApiResponse<T>;
}

async function mutateBenefitsModule(payload: BenefitsActionPayload) {
  const response = await fetch("/api/benefits/module", {
    method: payload.action.includes("update") ? "PATCH" : "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Unable to save benefits changes");
  return response.json() as Promise<{ ok: boolean; updatedAt: string }>;
}

async function submitBenefitsEnrollment(payload: Record<string, unknown>) {
  const response = await fetch("/api/benefits/enrollment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error || "Unable to submit enrollment");
  }
  return response.json() as Promise<{ ok: boolean; enrollmentId: string }>;
}

function useBenefitsModule<T extends BenefitsModuleData>(
  screen: BenefitsModuleScreen,
  employeeId?: string,
) {
  return useQuery({
    queryKey: ["benefits", "module", screen, employeeId || "company"],
    queryFn: () => fetchBenefitsModule<T>(screen, employeeId),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
}

function useBenefitsAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mutateBenefitsModule,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["benefits"] }),
        queryClient.invalidateQueries({ queryKey: ["payroll"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
      ]);
    },
  });
}

function useEnrollmentSubmit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitBenefitsEnrollment,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["benefits"] }),
        queryClient.invalidateQueries({ queryKey: ["payroll"] }),
        queryClient.invalidateQueries({ queryKey: ["employees"] }),
      ]);
    },
  });
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold",
        statusStyles[status] || statusStyles.Draft,
      )}
    >
      {status}
    </span>
  );
}

function LoadingState({ title = "Loading benefits data" }: { title?: string }) {
  return (
    <div className="flex min-h-[420px] items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-sm font-semibold">{title}</p>
      </div>
    </div>
  );
}

function ErrorState({ retry }: { retry: () => void }) {
  return (
    <div className="rounded-xl border border-red-200 bg-white p-8 text-center shadow-sm dark:border-red-500/30 dark:bg-slate-900">
      <AlertTriangle className="mx-auto h-10 w-10 text-red-500" />
      <h2 className="mt-4 text-lg font-bold text-slate-950 dark:text-white">Benefits data could not load</h2>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Check your connection and retry. Unsaved benefits changes are not submitted.
      </p>
      <button
        type="button"
        onClick={retry}
        className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
      >
        Retry
      </button>
    </div>
  );
}

function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-black text-slate-950 dark:text-white">{title}</h1>
        <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </div>
  );
}

function Section({
  title,
  description,
  children,
  action,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-black text-slate-950 dark:text-white">{title}</h2>
          {description ? <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function IconButton({
  children,
  onClick,
  variant = "secondary",
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cx(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" && "bg-blue-600 text-white shadow-sm hover:bg-blue-700",
        variant === "secondary" && "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800",
        variant === "danger" && "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300",
      )}
    >
      {children}
    </button>
  );
}

function KpiCard({ icon: Icon, label, value, detail }: { icon: ElementType; label: string; value: string; detail: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-black text-slate-950 dark:text-white">{value}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{detail}</p>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
          <Icon size={20} />
        </span>
      </div>
    </div>
  );
}

function downloadCsv(filename: string, rows: Array<Array<string | number>>) {
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function planIcon(category: PlanCategory) {
  return planIcons[category] || HeartPulse;
}

export function BenefitsOverviewScreen() {
  const query = useBenefitsModule<BenefitsOverviewData>("overview");
  const action = useBenefitsAction();
  const data = query.data?.data;

  if (query.isLoading) return <LoadingState />;
  if (query.isError || !data) return <ErrorState retry={() => query.refetch()} />;

  const icons = [Users, ClipboardCheck, BadgeDollarSign, PiggyBank];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <PageHeader
        title="Benefits"
        description="Manage plan administration, enrollment, carrier files, payroll deductions, and compliance workflows."
        actions={
          <>
            <Link href="/benefits/plans">
              <IconButton>
                <ShieldCheck size={16} /> Manage Plans
              </IconButton>
            </Link>
            <Link href="/benefits/enrollment/1">
              <IconButton variant="primary">
                <UserCheck size={16} /> Start Enrollment
              </IconButton>
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.kpis.map((kpi, index) => (
          <KpiCard key={kpi.label} icon={icons[index] || Users} label={kpi.label} value={kpi.value} detail={kpi.detail} />
        ))}
      </div>

      {data.openEnrollment.active ? (
        <div className="flex flex-col gap-4 rounded-xl border border-blue-200 bg-blue-50 p-5 shadow-sm dark:border-blue-400/30 dark:bg-blue-500/10 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
              <CalendarDays size={20} />
            </span>
            <div>
              <p className="text-sm font-black uppercase tracking-[0.16em] text-blue-700 dark:text-blue-300">Open Enrollment Active</p>
              <h2 className="mt-1 text-xl font-black text-slate-950 dark:text-white">
                {data.openEnrollment.daysRemaining} days left - {data.openEnrollment.employeesNotEnrolled} employees have not enrolled
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Window: {data.openEnrollment.startDate} to {data.openEnrollment.endDate}. Carrier census files update nightly.
              </p>
            </div>
          </div>
          <IconButton
            variant="primary"
            disabled={action.isPending}
            onClick={() => action.mutate({ action: "benefits.oe.remind", screen: "overview" })}
          >
            {action.isPending ? <Loader2 size={16} className="animate-spin" /> : <Bell size={16} />}
            Send Reminders
          </IconButton>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.planSummaries.map((plan) => {
          const Icon = planIcon(plan.category);
          return (
            <Link
              key={plan.category}
              href={plan.href}
              className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-700"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                    <Icon size={20} />
                  </span>
                  <div>
                    <h3 className="font-black text-slate-950 dark:text-white">{plan.category}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{plan.carrier}</p>
                  </div>
                </div>
                <StatusBadge status={plan.status} />
              </div>
              <p className="mt-5 text-sm font-bold text-slate-700 dark:text-slate-200">{plan.planName}</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
                  <p className="text-xs font-bold text-slate-500">Enrolled</p>
                  <p className="mt-1 text-lg font-black text-slate-950 dark:text-white">{number(plan.enrolledCount)}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
                  <p className="text-xs font-bold text-slate-500">Monthly Cost</p>
                  <p className="mt-1 text-lg font-black text-slate-950 dark:text-white">{money(plan.monthlyCost)}</p>
                </div>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-black text-blue-600 dark:text-blue-300">
                Manage <ChevronRight size={15} className="transition group-hover:translate-x-0.5" />
              </span>
            </Link>
          );
        })}
      </div>

      <Section
        title="Payroll Deduction Preview"
        description="Employee deductions sync to payroll after enrollment confirmation."
        action={
          <IconButton
            onClick={() =>
              downloadCsv("benefit-deductions.csv", [
                ["Plan", "Category", "Monthly employee", "Per pay period", "Tax treatment"],
                ...data.payrollDeductionPreview.map((row) => [
                  row.plan,
                  row.category,
                  row.employeeMonthly,
                  row.employeePerPayPeriod,
                  row.taxTreatment,
                ]),
              ])
            }
          >
            <Download size={16} /> Export CSV
          </IconButton>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-black uppercase tracking-[0.14em] text-slate-500 dark:bg-slate-800/60">
              <tr>
                <th className="px-5 py-3">Plan</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3 text-right">Employee Monthly</th>
                <th className="px-5 py-3 text-right">Per Pay Period</th>
                <th className="px-5 py-3">Tax Treatment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.payrollDeductionPreview.map((row) => (
                <tr key={row.plan} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-5 py-4 font-bold text-slate-950 dark:text-white">{row.plan}</td>
                  <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{row.category}</td>
                  <td className="px-5 py-4 text-right font-semibold text-slate-700 dark:text-slate-200">{money(row.employeeMonthly)}</td>
                  <td className="px-5 py-4 text-right font-black text-red-600 dark:text-red-300">-{money(row.employeePerPayPeriod)}</td>
                  <td className="px-5 py-4"><StatusBadge status={row.taxTreatment} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}

export function BenefitsPlansScreen() {
  const query = useBenefitsModule<BenefitsPlansData>("plans");
  const action = useBenefitsAction();
  const [activeCategory, setActiveCategory] = useState<PlanCategory | "All">("Medical");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const data = query.data?.data;

  if (query.isLoading) return <LoadingState />;
  if (query.isError || !data) return <ErrorState retry={() => query.refetch()} />;

  const filtered = data.plans.filter((plan) => {
    const categoryMatch = activeCategory === "All" || plan.category === activeCategory;
    const queryMatch = [plan.name, plan.carrier, plan.type].join(" ").toLowerCase().includes(search.toLowerCase());
    return categoryMatch && queryMatch;
  });

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <PageHeader
        title="Benefits Plan Management"
        description="Configure carriers, plan details, employee costs, contribution formulas, and renewal status."
        actions={
          <IconButton variant="primary" onClick={() => setDialogOpen(true)}>
            <Plus size={16} /> Add Plan
          </IconButton>
        }
      />

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {(["All", ...data.categories] as Array<PlanCategory | "All">).map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={cx(
                  "whitespace-nowrap rounded-lg px-4 py-2 text-sm font-black transition",
                  activeCategory === category
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700",
                )}
              >
                {category}
              </button>
            ))}
          </div>
          <div className="relative w-full lg:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search plans or carriers..."
              className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm font-semibold text-slate-900 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {filtered.map((plan) => {
          const Icon = planIcon(plan.category);
          return (
            <div key={plan.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-black text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    {plan.carrierLogo}
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-black text-slate-950 dark:text-white">{plan.name}</h2>
                      <StatusBadge status={plan.status} />
                    </div>
                    <p className="mt-1 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <Icon size={15} /> {plan.carrier} - {plan.type}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <IconButton onClick={() => setDialogOpen(true)}>
                    <Edit3 size={16} /> Edit
                  </IconButton>
                  <IconButton
                    variant="danger"
                    onClick={() => action.mutate({ action: "benefits.plan.deactivate", screen: "plans", payload: { planId: plan.id } })}
                  >
                    <X size={16} /> Deactivate
                  </IconButton>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
                  <p className="text-xs font-bold text-slate-500">Deductible</p>
                  <p className="mt-1 font-black text-slate-950 dark:text-white">{plan.deductible ? money(plan.deductible) : "-"}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
                  <p className="text-xs font-bold text-slate-500">Out-of-pocket max</p>
                  <p className="mt-1 font-black text-slate-950 dark:text-white">{plan.outOfPocketMax ? money(plan.outOfPocketMax) : "-"}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
                  <p className="text-xs font-bold text-slate-500">Employer Pays</p>
                  <p className="mt-1 font-black text-slate-950 dark:text-white">{money(plan.employerContribution)}/mo</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
                  <p className="text-xs font-bold text-slate-500">Employee Pays</p>
                  <p className="mt-1 font-black text-slate-950 dark:text-white">{money(plan.employeeCost)}/mo</p>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2 text-sm text-slate-600 dark:text-slate-300">
                <p><span className="font-black text-slate-800 dark:text-white">Contribution:</span> {plan.contributionFormula}</p>
                <p><span className="font-black text-slate-800 dark:text-white">Renewal:</span> {plan.renewalDate}</p>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen} contentClassName="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Benefits Plan</DialogTitle>
            <DialogDescription>Capture carrier details, plan category, contribution formula, and renewal dates.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
            {[
              ["Carrier", "BlueCross BlueShield"],
              ["Plan name", "PPO Gold 500"],
              ["Plan type", "PPO"],
              ["Employer contribution", "72% of premium"],
              ["Employee cost", "238"],
              ["Renewal date", "2026-10-15"],
            ].map(([label, placeholder]) => (
              <label key={label} className="text-sm font-bold text-slate-700 dark:text-slate-200">
                {label}
                <input
                  placeholder={placeholder}
                  className="mt-1 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </label>
            ))}
            <label className="text-sm font-bold text-slate-700 dark:text-slate-200">
              Category
              <select className="mt-1 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white">
                {data.categories.map((category) => <option key={category}>{category}</option>)}
              </select>
            </label>
            <label className="text-sm font-bold text-slate-700 dark:text-slate-200">
              Contribution formula
              <select className="mt-1 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white">
                {data.contributionModels.map((model) => <option key={model}>{model}</option>)}
              </select>
            </label>
          </div>
          <DialogFooter>
            <IconButton onClick={() => setDialogOpen(false)}>Cancel</IconButton>
            <IconButton
              variant="primary"
              disabled={action.isPending}
              onClick={() => {
                action.mutate({ action: "benefits.plan.create", screen: "plans" });
                setDialogOpen(false);
              }}
            >
              {action.isPending ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              Save Plan
            </IconButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function BenefitsEnrollmentLandingScreen() {
  const query = useBenefitsModule<OpenEnrollmentData>("oe");
  const data = query.data?.data;

  if (query.isLoading) return <LoadingState title="Loading enrollment roster" />;
  if (query.isError || !data) return <ErrorState retry={() => query.refetch()} />;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <PageHeader
        title="Enrollment"
        description="Choose an employee to launch the guided enrollment wizard."
        actions={
          <Link href="/benefits/oe">
            <IconButton>
              <ClipboardCheck size={16} /> Open Enrollment Admin
            </IconButton>
          </Link>
        }
      />
      <Section title="Enrollment Roster" description="Wizard links open the employee-specific enrollment flow.">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-black uppercase tracking-[0.14em] text-slate-500 dark:bg-slate-800/60">
              <tr>
                <th className="px-5 py-3">Employee</th>
                <th className="px-5 py-3">Department</th>
                <th className="px-5 py-3">Plans</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.statusRows.map((row) => (
                <tr key={row.employeeId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-5 py-4 font-black text-slate-950 dark:text-white">{row.employee}</td>
                  <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{row.department}</td>
                  <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{row.enrolledPlans.join(", ")}</td>
                  <td className="px-5 py-4"><StatusBadge status={row.status} /></td>
                  <td className="px-5 py-4 text-right">
                    <Link href={`/benefits/enrollment/${row.employeeId}`} className="inline-flex items-center gap-1 text-sm font-black text-blue-600 hover:underline dark:text-blue-300">
                      Open wizard <ChevronRight size={15} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}

function PlanOptionCard({
  plan,
  selected,
  onSelect,
}: {
  plan: BenefitPlan;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cx(
        "flex h-full flex-col rounded-xl border p-5 text-left transition",
        selected
          ? "border-blue-400 bg-blue-50 ring-2 ring-blue-100 dark:border-blue-500 dark:bg-blue-500/10 dark:ring-blue-900"
          : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600 dark:text-blue-300">{plan.type}</p>
          <h3 className="mt-1 text-lg font-black text-slate-950 dark:text-white">{plan.name}</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{plan.carrier}</p>
        </div>
        {selected ? <CheckCircle2 size={20} className="text-blue-600" /> : null}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-white p-3 dark:bg-slate-950/70">
          <p className="text-xs font-bold text-slate-500">Deductible</p>
          <p className="mt-1 font-black text-slate-950 dark:text-white">{money(plan.deductible)}</p>
        </div>
        <div className="rounded-lg bg-white p-3 dark:bg-slate-950/70">
          <p className="text-xs font-bold text-slate-500">Employee Pays</p>
          <p className="mt-1 font-black text-slate-950 dark:text-white">{money(plan.employeeCost)}/mo</p>
        </div>
      </div>
      <details className="mt-4 text-sm text-slate-600 dark:text-slate-300">
        <summary className="cursor-pointer font-black text-slate-800 dark:text-slate-100">What&apos;s covered</summary>
        <ul className="mt-2 space-y-1">
          {plan.coveredHighlights.map((item) => <li key={item}>- {item}</li>)}
        </ul>
      </details>
    </button>
  );
}

export function BenefitsEnrollmentWizardScreen({ employeeId }: { employeeId: string }) {
  const query = useBenefitsModule<EnrollmentWizardData>("enrollment", employeeId);
  const submit = useEnrollmentSubmit();
  const [step, setStep] = useState(0);
  const [successOpen, setSuccessOpen] = useState(false);
  const [medicalPlanId, setMedicalPlanId] = useState("med-silver");
  const [dentalPlanId, setDentalPlanId] = useState("dental-core");
  const [visionPlanId, setVisionPlanId] = useState("vision-core");
  const [lifeMultiplier, setLifeMultiplier] = useState(1);
  const [supplementalIds, setSupplementalIds] = useState<string[]>(["critical-illness"]);
  const data = query.data?.data;

  if (query.isLoading) return <LoadingState title="Loading enrollment wizard" />;
  if (query.isError || !data) return <ErrorState retry={() => query.refetch()} />;

  const medical = data.medicalPlans.find((plan) => plan.id === medicalPlanId) || data.medicalPlans[0];
  const dental = data.dentalPlans.find((plan) => plan.id === dentalPlanId);
  const vision = data.visionPlans.find((plan) => plan.id === visionPlanId);
  const supplemental = data.supplementalOptions.filter((option) => supplementalIds.includes(option.id));
  const monthlyEmployeeCost =
    (medical?.employeeCost || 0) +
    (dental?.employeeCost || 0) +
    (vision?.employeeCost || 0) +
    supplemental.reduce((sum, option) => sum + option.monthlyCost, 0) +
    (lifeMultiplier > 1 ? (lifeMultiplier - 1) * 12 : 0);
  const monthlyEmployerCost =
    (medical?.employerContribution || 0) +
    (dental?.employerContribution || 0) +
    (vision?.employerContribution || 0) +
    data.lifeBase.employerCost;

  const steps = ["Medical", "Dental + Vision", "Supplemental", "Review"];

  const toggleSupplemental = (id: string) => {
    setSupplementalIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const submitEnrollment = () => {
    submit.mutate(
      {
        employeeId: data.employee.id,
        medicalPlanId,
        dentalPlanId,
        visionPlanId,
        lifeMultiplier,
        supplementalIds,
        monthlyEmployeeCost,
      },
      {
        onSuccess: () => setSuccessOpen(true),
      },
    );
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <PageHeader
        title={`Enrollment - ${data.employee.firstName} ${data.employee.lastName}`}
        description={`${data.employee.title} - ${data.employee.department}. Review health, dental, vision, life, and voluntary benefits.`}
        actions={
          <Link href="/benefits/enrollment">
            <IconButton>
              <Users size={16} /> Roster
            </IconButton>
          </Link>
        }
      />

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {steps.map((label, index) => (
            <button
              key={label}
              type="button"
              onClick={() => setStep(index)}
              className={cx(
                "rounded-lg px-3 py-3 text-sm font-black transition",
                step === index ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
              )}
            >
              <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs">{index + 1}</span>
              {label}
            </button>
          ))}
        </div>
      </div>

      {step === 0 ? (
        <Section title="Step 1 - Medical" description="Choose one medical plan for this enrollment period.">
          <div className="grid grid-cols-1 gap-4 p-5 lg:grid-cols-3">
            {data.medicalPlans.map((plan) => (
              <PlanOptionCard key={plan.id} plan={plan} selected={medicalPlanId === plan.id} onSelect={() => setMedicalPlanId(plan.id)} />
            ))}
          </div>
        </Section>
      ) : null}

      {step === 1 ? (
        <Section title="Step 2 - Dental + Vision" description="Select coverage or waive each plan type.">
          <div className="grid grid-cols-1 gap-4 p-5 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 p-5 dark:border-slate-800">
              <h3 className="font-black text-slate-950 dark:text-white">Dental</h3>
              <div className="mt-4 space-y-3">
                {data.dentalPlans.map((plan) => (
                  <label key={plan.id} className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                    <span>
                      <span className="block font-black text-slate-950 dark:text-white">{plan.name}</span>
                      <span className="text-sm text-slate-500">{money(plan.employeeCost)}/mo - annual max {money(plan.outOfPocketMax)}</span>
                    </span>
                    <input type="radio" checked={dentalPlanId === plan.id} onChange={() => setDentalPlanId(plan.id)} />
                  </label>
                ))}
                <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                  <span className="font-black text-slate-950 dark:text-white">Waive dental</span>
                  <input type="radio" checked={dentalPlanId === "waive"} onChange={() => setDentalPlanId("waive")} />
                </label>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 p-5 dark:border-slate-800">
              <h3 className="font-black text-slate-950 dark:text-white">Vision</h3>
              <div className="mt-4 space-y-3">
                {data.visionPlans.map((plan) => (
                  <label key={plan.id} className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                    <span>
                      <span className="block font-black text-slate-950 dark:text-white">{plan.name}</span>
                      <span className="text-sm text-slate-500">{money(plan.employeeCost)}/mo - frames allowance {money(plan.outOfPocketMax)}</span>
                    </span>
                    <input type="radio" checked={visionPlanId === plan.id} onChange={() => setVisionPlanId(plan.id)} />
                  </label>
                ))}
                <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                  <span className="font-black text-slate-950 dark:text-white">Waive vision</span>
                  <input type="radio" checked={visionPlanId === "waive"} onChange={() => setVisionPlanId("waive")} />
                </label>
              </div>
            </div>
          </div>
        </Section>
      ) : null}

      {step === 2 ? (
        <Section title="Step 3 - Supplemental" description="Basic life is auto-enrolled at 1x salary. Optional coverage updates payroll deductions.">
          <div className="grid grid-cols-1 gap-4 p-5 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="rounded-xl border border-slate-200 p-5 dark:border-slate-800">
              <h3 className="font-black text-slate-950 dark:text-white">Life Insurance</h3>
              <p className="mt-2 text-sm text-slate-500">Base coverage: {money(data.lifeBase.amount)} through {data.lifeBase.carrier}</p>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {[1, 2, 3].map((multiplier) => (
                  <button
                    key={multiplier}
                    type="button"
                    onClick={() => setLifeMultiplier(multiplier)}
                    className={cx(
                      "rounded-lg px-3 py-3 text-sm font-black",
                      lifeMultiplier === multiplier ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
                    )}
                  >
                    {multiplier}x salary
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 p-5 dark:border-slate-800">
              <h3 className="font-black text-slate-950 dark:text-white">Voluntary Benefits</h3>
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                {data.supplementalOptions.map((option) => (
                  <label key={option.id} className="flex cursor-pointer flex-col gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                    <span className="flex items-center justify-between gap-3">
                      <span className="font-black text-slate-950 dark:text-white">{option.name}</span>
                      <input type="checkbox" checked={supplementalIds.includes(option.id)} onChange={() => toggleSupplemental(option.id)} />
                    </span>
                    <span className="text-sm text-slate-500">{option.description}</span>
                    <span className="text-sm font-black text-slate-950 dark:text-white">{money(option.monthlyCost)}/mo</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </Section>
      ) : null}

      {step === 3 ? (
        <Section title="Step 4 - Review + Submit" description="Confirm selected plans and payroll deduction impact.">
          <div className="grid grid-cols-1 gap-4 p-5 lg:grid-cols-[1fr_360px]">
            <div className="space-y-3">
              {[
                ["Medical", medical?.name || "Waived", medical?.employeeCost || 0],
                ["Dental", dental?.name || "Waived", dental?.employeeCost || 0],
                ["Vision", vision?.name || "Waived", vision?.employeeCost || 0],
                ["Life", `${lifeMultiplier}x salary`, lifeMultiplier > 1 ? (lifeMultiplier - 1) * 12 : 0],
                ["Voluntary", supplemental.map((option) => option.name).join(", ") || "None", supplemental.reduce((sum, option) => sum + option.monthlyCost, 0)],
              ].map(([label, value, cost]) => (
                <div key={label as string} className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">{label}</p>
                    <p className="mt-1 font-black text-slate-950 dark:text-white">{value}</p>
                  </div>
                  <p className="font-black text-slate-950 dark:text-white">{money(Number(cost))}/mo</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl bg-slate-50 p-5 dark:bg-slate-800/60">
              <h3 className="font-black text-slate-950 dark:text-white">Cost Summary</h3>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">Employee monthly premium</span>
                  <span className="font-black text-slate-950 dark:text-white">{money(monthlyEmployeeCost)}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">Per pay period deduction</span>
                  <span className="font-black text-red-600 dark:text-red-300">-{money(monthlyEmployeeCost / data.payPeriodsPerMonth)}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">Employer monthly cost</span>
                  <span className="font-black text-slate-950 dark:text-white">{money(monthlyEmployerCost)}</span>
                </div>
              </div>
              <IconButton variant="primary" disabled={submit.isPending} onClick={submitEnrollment}>
                {submit.isPending ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                Confirm Enrollment
              </IconButton>
              {submit.isError ? <p className="mt-3 text-sm font-bold text-red-600">{(submit.error as Error).message}</p> : null}
            </div>
          </div>
        </Section>
      ) : null}

      <div className="flex items-center justify-between gap-3">
        <IconButton disabled={step === 0} onClick={() => setStep((current) => Math.max(0, current - 1))}>
          Back
        </IconButton>
        {step < 3 ? (
          <IconButton variant="primary" onClick={() => setStep((current) => Math.min(3, current + 1))}>
            Next <ArrowRight size={16} />
          </IconButton>
        ) : null}
      </div>

      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enrollment Confirmed</DialogTitle>
            <DialogDescription>Payroll deduction updates are queued and the carrier sync will run with the next benefits file.</DialogDescription>
          </DialogHeader>
          <div className="p-6">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-200">
              Confirmation ID: {submit.data?.enrollmentId || "pending"}
            </div>
          </div>
          <DialogFooter>
            <Link href="/benefits">
              <IconButton variant="primary">Back to Benefits</IconButton>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function BenefitsOpenEnrollmentScreen() {
  const query = useBenefitsModule<OpenEnrollmentData>("oe");
  const action = useBenefitsAction();
  const data = query.data?.data;

  if (query.isLoading) return <LoadingState title="Loading open enrollment" />;
  if (query.isError || !data) return <ErrorState retry={() => query.refetch()} />;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <PageHeader
        title="Open Enrollment Management"
        description="Set enrollment windows, monitor employee progress, send reminders, and generate carrier census files."
        actions={
          <IconButton
            variant="primary"
            disabled={action.isPending}
            onClick={() => action.mutate({ action: "benefits.oe.reminders", screen: "oe" })}
          >
            {action.isPending ? <Loader2 size={16} className="animate-spin" /> : <Bell size={16} />}
            Send Reminder
          </IconButton>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[360px_1fr]">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="font-black text-slate-950 dark:text-white">Enrollment Window</h2>
          <div className="mt-4 space-y-4">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">
              Start date
              <input type="date" defaultValue={data.window.startDate} className="mt-1 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
            </label>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">
              End date
              <input type="date" defaultValue={data.window.endDate} className="mt-1 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
            </label>
            <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-500/10">
              <p className="text-3xl font-black text-blue-700 dark:text-blue-300">{data.completionRate}%</p>
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Completion rate</p>
            </div>
            <IconButton
              variant="primary"
              onClick={() => action.mutate({ action: "benefits.oe.window.update", screen: "oe" })}
            >
              <CalendarDays size={16} /> Save Window
            </IconButton>
          </div>
        </div>

        <Section title="Carrier Census Files" description="Generated after OE closes for EDI submission.">
          <div className="grid grid-cols-1 gap-3 p-5 md:grid-cols-2">
            {data.carrierFiles.map((file) => (
              <div key={file.carrier} className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-black text-slate-950 dark:text-white">{file.carrier}</h3>
                    <p className="mt-1 text-sm text-slate-500">{file.fileType} - {file.rows} rows</p>
                  </div>
                  <StatusBadge status={file.status} />
                </div>
                <button className="mt-4 inline-flex items-center gap-2 text-sm font-black text-blue-600 hover:underline dark:text-blue-300">
                  <FileSpreadsheet size={16} /> Generate report
                </button>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <Section title="Enrollment Status" description={`${data.window.employeesNotEnrolled} employees still need attention.`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-black uppercase tracking-[0.14em] text-slate-500 dark:bg-slate-800/60">
              <tr>
                <th className="px-5 py-3">Employee</th>
                <th className="px-5 py-3">Department</th>
                <th className="px-5 py-3">Enrolled Plans</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Last Activity</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.statusRows.map((row) => (
                <tr key={row.employeeId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-5 py-4 font-black text-slate-950 dark:text-white">{row.employee}</td>
                  <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{row.department}</td>
                  <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{row.enrolledPlans.join(", ")}</td>
                  <td className="px-5 py-4"><StatusBadge status={row.status} /></td>
                  <td className="px-5 py-4 text-slate-500">{row.lastActivity}</td>
                  <td className="px-5 py-4 text-right">
                    <Link href={`/benefits/enrollment/${row.employeeId}`} className="text-sm font-black text-blue-600 hover:underline dark:text-blue-300">Open</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}

export function BenefitsQleScreen() {
  const query = useBenefitsModule<QleData>("qle");
  const action = useBenefitsAction();
  const [overrides, setOverrides] = useState<Record<string, QleStatus>>({});
  const data = query.data?.data;

  if (query.isLoading) return <LoadingState title="Loading qualifying life events" />;
  if (query.isError || !data) return <ErrorState retry={() => query.refetch()} />;

  const updateStatus = (id: string, status: QleStatus) => {
    setOverrides((current) => ({ ...current, [id]: status }));
    action.mutate({ action: `benefits.qle.${status.toLowerCase().replaceAll(" ", "_")}`, screen: "qle", payload: { id } });
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <PageHeader
        title="Qualifying Life Events"
        description="Review life event submissions and open mid-year enrollment windows for approved employees."
      />
      <Section title="QLE Review Queue" description="Approvals trigger an employee-specific enrollment window.">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-black uppercase tracking-[0.14em] text-slate-500 dark:bg-slate-800/60">
              <tr>
                <th className="px-5 py-3">Employee</th>
                <th className="px-5 py-3">Event Type</th>
                <th className="px-5 py-3">Event Date</th>
                <th className="px-5 py-3">Window Expires</th>
                <th className="px-5 py-3">Requested Changes</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.events.map((event) => {
                const status = overrides[event.id] || event.status;
                return (
                  <tr key={event.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-5 py-4 font-black text-slate-950 dark:text-white">{event.employee}</td>
                    <td className="px-5 py-4 text-slate-700 dark:text-slate-200">{event.eventType}</td>
                    <td className="px-5 py-4 text-slate-500">{event.eventDate}</td>
                    <td className="px-5 py-4 text-slate-500">{event.windowExpires}</td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{event.requestedChanges.join(", ")}</td>
                    <td className="px-5 py-4"><StatusBadge status={status} /></td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <IconButton disabled={status === "Approved"} onClick={() => updateStatus(event.id, "Approved")}>
                          <CheckCircle2 size={16} /> Approve
                        </IconButton>
                        <IconButton variant="danger" disabled={status === "Denied"} onClick={() => updateStatus(event.id, "Denied")}>
                          <X size={16} /> Deny
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}

export function Benefits401kScreen() {
  const query = useBenefitsModule<RetirementData>("401k");
  const action = useBenefitsAction();
  const data = query.data?.data;

  if (query.isLoading) return <LoadingState title="Loading 401k data" />;
  if (query.isError || !data) return <ErrorState retry={() => query.refetch()} />;

  const ytdEmployee = data.rows.reduce((sum, row) => sum + row.ytdEmployee, 0);
  const ytdEmployer = data.rows.reduce((sum, row) => sum + row.ytdEmployer, 0);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <PageHeader
        title="401k Management"
        description="Track contribution elections, Roth/traditional split, employer match, provider sync, and census exports."
        actions={
          <>
            <IconButton onClick={() => downloadCsv("401k-census.csv", [["Employee", "Contribution", "Type"], ...data.rows.map((row) => [row.employee, row.contributionRate, row.contributionType])])}>
              <Download size={16} /> Census Export
            </IconButton>
            <IconButton variant="primary" onClick={() => action.mutate({ action: "benefits.401k.sync", screen: "401k" })}>
              <PiggyBank size={16} /> Sync Guideline
            </IconButton>
          </>
        }
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <KpiCard icon={PiggyBank} label="Participation Rate" value={`${data.participationRate}%`} detail={`${data.provider} integration`} />
        <KpiCard icon={BadgeDollarSign} label="YTD Employee" value={money(ytdEmployee)} detail={`Limit ${money(data.annualLimit)}`} />
        <KpiCard icon={BadgeDollarSign} label="YTD Employer" value={money(ytdEmployer)} detail="Safe Harbor match" />
        <KpiCard icon={ShieldCheck} label="Provider Status" value={data.providerStatus} detail="Contribution changes sync automatically" />
      </div>

      <Section title="Participation Table" description="Contribution changes are queued for the next payroll sync.">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-black uppercase tracking-[0.14em] text-slate-500 dark:bg-slate-800/60">
              <tr>
                <th className="px-5 py-3">Employee</th>
                <th className="px-5 py-3 text-right">Contribution</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Employer Match</th>
                <th className="px-5 py-3 text-right">YTD Employee</th>
                <th className="px-5 py-3 text-right">YTD Employer</th>
                <th className="px-5 py-3">Sync</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.rows.map((row) => (
                <tr key={row.employeeId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-5 py-4 font-black text-slate-950 dark:text-white">{row.employee}</td>
                  <td className="px-5 py-4 text-right font-black text-slate-950 dark:text-white">{row.contributionRate}%</td>
                  <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{row.contributionType}</td>
                  <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{row.employerMatch}</td>
                  <td className="px-5 py-4 text-right font-semibold text-slate-700 dark:text-slate-200">{money(row.ytdEmployee)}</td>
                  <td className="px-5 py-4 text-right font-semibold text-slate-700 dark:text-slate-200">{money(row.ytdEmployer)}</td>
                  <td className="px-5 py-4"><StatusBadge status={row.syncStatus} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Contribution Change Requests">
        <div className="grid grid-cols-1 gap-3 p-5 md:grid-cols-2">
          {data.changeRequests.map((request) => (
            <div key={request.id} className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-black text-slate-950 dark:text-white">{request.employee}</h3>
                  <p className="mt-1 text-sm text-slate-500">{request.change}</p>
                  <p className="mt-1 text-xs font-bold text-slate-400">{request.requestedAt}</p>
                </div>
                <StatusBadge status={request.status} />
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

export function BenefitsCobraScreen() {
  const query = useBenefitsModule<CobraData>("cobra");
  const action = useBenefitsAction();
  const [noticeOpen, setNoticeOpen] = useState(false);
  const data = query.data?.data;

  if (query.isLoading) return <LoadingState title="Loading COBRA cases" />;
  if (query.isError || !data) return <ErrorState retry={() => query.refetch()} />;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <PageHeader
        title="COBRA Administration"
        description="Track terminated employee coverage, notice delivery, 18-month coverage windows, premiums, and payment status."
        actions={
          <IconButton variant="primary" onClick={() => setNoticeOpen(true)}>
            <Send size={16} /> Send COBRA Notice
          </IconButton>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <KpiCard icon={Shield} label="COBRA Cases" value={String(data.rows.length)} detail="Active and eligible participants" />
        <KpiCard icon={Mail} label="Notices Pending" value={String(data.rows.filter((row) => row.noticeStatus === "Not Sent").length)} detail={data.noticeTemplate.name} />
        <KpiCard icon={BadgeDollarSign} label="Monthly Premiums" value={money(data.rows.reduce((sum, row) => sum + row.premium, 0))} detail="Participant paid premium" />
        <KpiCard icon={AlertTriangle} label="Past Due" value={String(data.rows.filter((row) => row.paymentStatus !== "Current").length)} detail="Needs payment follow-up" />
      </div>

      <Section title="Coverage List">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-black uppercase tracking-[0.14em] text-slate-500 dark:bg-slate-800/60">
              <tr>
                <th className="px-5 py-3">Employee</th>
                <th className="px-5 py-3">Coverage</th>
                <th className="px-5 py-3">Event</th>
                <th className="px-5 py-3">Start</th>
                <th className="px-5 py-3">End</th>
                <th className="px-5 py-3 text-right">Premium</th>
                <th className="px-5 py-3">Payment</th>
                <th className="px-5 py-3">Notice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.rows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-5 py-4 font-black text-slate-950 dark:text-white">{row.employee}</td>
                  <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{row.coverageType}</td>
                  <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{row.qualifyingEvent}</td>
                  <td className="px-5 py-4 text-slate-500">{row.cobraStartDate}</td>
                  <td className="px-5 py-4 text-slate-500">{row.cobraEndDate}</td>
                  <td className="px-5 py-4 text-right font-black text-slate-950 dark:text-white">{money(row.premium)}</td>
                  <td className="px-5 py-4"><StatusBadge status={row.paymentStatus} /></td>
                  <td className="px-5 py-4"><StatusBadge status={row.noticeStatus} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Dialog open={noticeOpen} onOpenChange={setNoticeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send COBRA Notice</DialogTitle>
            <DialogDescription>{data.noticeTemplate.source}. Delivery: {data.noticeTemplate.delivery}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 p-6">
            {data.rows.filter((row) => row.noticeStatus === "Not Sent").map((row) => (
              <label key={row.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                <span>
                  <span className="block font-black text-slate-950 dark:text-white">{row.employee}</span>
                  <span className="text-sm text-slate-500">{row.coverageType} - {money(row.premium)}/mo</span>
                </span>
                <input type="checkbox" defaultChecked />
              </label>
            ))}
          </div>
          <DialogFooter>
            <IconButton onClick={() => setNoticeOpen(false)}>Cancel</IconButton>
            <IconButton
              variant="primary"
              disabled={action.isPending}
              onClick={() => {
                action.mutate({ action: "benefits.cobra.notice", screen: "cobra" });
                setNoticeOpen(false);
              }}
            >
              {action.isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              Send Notice
            </IconButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function BenefitsFsaHsaScreen() {
  const query = useBenefitsModule<FsaHsaData>("fsa-hsa");
  const [filter, setFilter] = useState<"All" | "FSA" | "HSA">("All");
  const data = query.data?.data;

  if (query.isLoading) return <LoadingState title="Loading FSA/HSA accounts" />;
  if (query.isError || !data) return <ErrorState retry={() => query.refetch()} />;

  const accounts = filter === "All" ? data.accounts : data.accounts.filter((account) => account.accountType === filter);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <PageHeader
        title="FSA / HSA Accounts"
        description={`Track annual elections, IRS limits, balances, spend, and TPA files through ${data.tpa}.`}
        actions={<IconButton><Download size={16} /> Download for TPA</IconButton>}
      />
      <div className="flex gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {(["All", "FSA", "HSA"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={cx("rounded-lg px-4 py-2 text-sm font-black", filter === item ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300")}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {accounts.map((account) => {
          const spentPct = Math.round((account.ytdSpent / account.annualElection) * 100);
          return (
            <div key={account.employeeId} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-black text-slate-950 dark:text-white">{account.employee}</h2>
                  <p className="mt-1 text-sm font-bold text-blue-600 dark:text-blue-300">{account.accountType}</p>
                </div>
                <StatusBadge status={account.status} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60"><p className="text-xs font-bold text-slate-500">Election</p><p className="font-black text-slate-950 dark:text-white">{money(account.annualElection)}</p></div>
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60"><p className="text-xs font-bold text-slate-500">Contributed</p><p className="font-black text-slate-950 dark:text-white">{money(account.ytdContributions)}</p></div>
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60"><p className="text-xs font-bold text-slate-500">Spent</p><p className="font-black text-slate-950 dark:text-white">{money(account.ytdSpent)}</p></div>
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60"><p className="text-xs font-bold text-slate-500">Balance</p><p className="font-black text-slate-950 dark:text-white">{money(account.balance)}</p></div>
              </div>
              <div className="mt-4">
                <div className="mb-1 flex justify-between text-xs font-bold text-slate-500">
                  <span>Funds used</span><span>{spentPct}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className="h-full rounded-full bg-blue-600" style={{ width: `${Math.min(100, spentPct)}%` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function BenefitsLifeSupplementalScreen() {
  const query = useBenefitsModule<LifeDisabilityData>("life-disability");
  const data = query.data?.data;

  if (query.isLoading) return <LoadingState title="Loading life and supplemental benefits" />;
  if (query.isError || !data) return <ErrorState retry={() => query.refetch()} />;

  const totalCoverage = data.rows.reduce((sum, row) => sum + row.lifeAmount + row.voluntaryLife, 0);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <PageHeader
        title="Life & Supplemental Benefits"
        description={`Track basic life, voluntary life, disability coverage, EOI, beneficiaries, and voluntary benefits through ${data.carrier}.`}
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <KpiCard icon={Shield} label="Total Coverage" value={money(totalCoverage)} detail="Basic and voluntary life" />
        <KpiCard icon={ClipboardCheck} label="STD Enrolled" value={`${data.rows.filter((row) => row.stdStatus === "Enrolled").length}/${data.rows.length}`} detail="Short-term disability" />
        <KpiCard icon={ShieldCheck} label="LTD Enrolled" value={`${data.rows.filter((row) => row.ltdStatus === "Enrolled").length}/${data.rows.length}`} detail="Long-term disability" />
        <KpiCard icon={AlertTriangle} label="EOI Pending" value={String(data.rows.filter((row) => row.eoiStatus === "Pending").length)} detail="Evidence of insurability" />
      </div>
      <Section title="Employee Coverage">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-black uppercase tracking-[0.14em] text-slate-500 dark:bg-slate-800/60">
              <tr>
                <th className="px-5 py-3">Employee</th>
                <th className="px-5 py-3 text-right">Life</th>
                <th className="px-5 py-3 text-right">Voluntary Life</th>
                <th className="px-5 py-3">STD</th>
                <th className="px-5 py-3">LTD</th>
                <th className="px-5 py-3">Voluntary Benefits</th>
                <th className="px-5 py-3">Beneficiary</th>
                <th className="px-5 py-3">EOI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.rows.map((row) => (
                <tr key={row.employeeId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-5 py-4 font-black text-slate-950 dark:text-white">{row.employee}</td>
                  <td className="px-5 py-4 text-right font-semibold text-slate-700 dark:text-slate-200">{money(row.lifeAmount)}</td>
                  <td className="px-5 py-4 text-right font-semibold text-slate-700 dark:text-slate-200">{money(row.voluntaryLife)}</td>
                  <td className="px-5 py-4"><StatusBadge status={row.stdStatus} /></td>
                  <td className="px-5 py-4"><StatusBadge status={row.ltdStatus} /></td>
                  <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{row.voluntaryBenefits.join(", ")}</td>
                  <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{row.beneficiary}</td>
                  <td className="px-5 py-4"><StatusBadge status={row.eoiStatus} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}

export function BenefitsWorkersCompRedirectScreen() {
  const claims = useMemo(
    () => [
      { id: "wc-1", employee: getEmployeeName(hrisEmployees[7] || hrisEmployees[0]), status: "Open", paid: 3200 },
      { id: "wc-2", employee: getEmployeeName(hrisEmployees[5] || hrisEmployees[0]), status: "Closed", paid: 8500 },
    ],
    [],
  );

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <PageHeader
        title="Workers' Compensation"
        description="Policy details, class codes, claims, certificates, and year-end audit exports."
        actions={<IconButton><Download size={16} /> Year-End Audit Export</IconButton>}
      />
      <Section title="Claims">
        <div className="grid grid-cols-1 gap-3 p-5 md:grid-cols-2">
          {claims.map((claim) => (
            <div key={claim.id} className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-black text-slate-950 dark:text-white">{claim.employee}</h3>
                  <p className="mt-1 text-sm text-slate-500">Total paid: {money(claim.paid)}</p>
                </div>
                <StatusBadge status={claim.status} />
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
