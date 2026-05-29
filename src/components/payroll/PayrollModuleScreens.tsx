"use client";

import { Fragment, useEffect, useMemo, useState, type ElementType } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Download,
  Edit3,
  FileArchive,
  FileSpreadsheet,
  FileText,
  Filter,
  Landmark,
  Loader2,
  MoreHorizontal,
  Percent,
  Plus,
  Receipt,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Upload,
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
import { useSocketStore } from "@/store/useSocketStore";
import type {
  BridgeData,
  CompletedRunData,
  ContractorPaymentData,
  EwaData,
  GarnishmentData,
  OffCycleData,
  PayrollHistoryData,
  PayrollHubData,
  PayrollLineStatus,
  PayrollModuleData,
  PayrollModuleScreen,
  PayrollReportsData,
  PayrollRunData,
  PayrollRunStatus,
  PayrollScheduleData,
  PayrollSettingsData,
  PayrollTaxSetupData,
  PaystubData,
  PayType,
} from "@/lib/payroll-module-data";

type ApiResponse<T extends PayrollModuleData> = {
  screen: PayrollModuleScreen;
  data: T;
};

type PayrollActionPayload = {
  action: string;
  screen: PayrollModuleScreen;
  payload?: Record<string, unknown>;
};

const statusStyles: Record<string, string> = {
  Draft: "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200",
  Pending: "border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-200",
  Processing: "border-blue-200 bg-blue-100 text-blue-800 dark:border-blue-400/30 dark:bg-blue-500/10 dark:text-blue-200",
  Paid: "border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-200",
  Failed: "border-red-200 bg-red-100 text-red-800 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-200",
  Verified: "border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-200",
  Flagged: "border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-200",
  Error: "border-red-200 bg-red-100 text-red-800 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-200",
  Active: "border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-200",
  Review: "border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-200",
  PendingStatus: "border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-200",
};

const moduleIcons: Record<string, ElementType> = {
  hub: Banknote,
  run: WalletCards,
  history: CalendarDays,
  contractors: Briefcase,
  schedule: CalendarDays,
  "tax-setup": Landmark,
  garnishments: ShieldCheck,
  ewa: WalletCards,
  bridge: Banknote,
  settings: Settings,
  reports: FileSpreadsheet,
  "off-cycle": Plus,
  paystubs: FileText,
  "completed-run": Receipt,
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

async function fetchPayrollModule<T extends PayrollModuleData>(
  screen: PayrollModuleScreen,
  runId?: string,
) {
  const params = new URLSearchParams({ screen });
  if (runId) params.set("runId", runId);
  const response = await fetch(`/api/payroll/module?${params.toString()}`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Unable to load payroll data");
  return (await response.json()) as ApiResponse<T>;
}

async function mutatePayrollModule(payload: PayrollActionPayload) {
  const response = await fetch("/api/payroll/module", {
    method: payload.action.includes("update") ? "PATCH" : "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Unable to save payroll changes");
  return response.json() as Promise<{ ok: boolean; updatedAt: string }>;
}

function usePayrollModule<T extends PayrollModuleData>(
  screen: PayrollModuleScreen,
  runId?: string,
) {
  return useQuery({
    queryKey: ["payroll", "module", screen, runId || "current"],
    queryFn: () => fetchPayrollModule<T>(screen, runId),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
}

function usePayrollAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mutatePayrollModule,
    onSuccess: async (_result, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["payroll"] });
      if (variables.action === "payroll.run.complete") {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
          queryClient.invalidateQueries({ queryKey: ["employees"] }),
          queryClient.invalidateQueries({ queryKey: ["reports"] }),
        ]);
      }
    },
  });
}

function downloadCsv(filename: string, rows: Array<Array<string | number>>) {
  const csv = rows
    .map((row) =>
      row
        .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
        .join(","),
    )
    .join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
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

function LoadingState({ title = "Loading payroll data" }: { title?: string }) {
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
      <h2 className="mt-4 text-lg font-bold text-slate-950 dark:text-white">
        Payroll data could not load
      </h2>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Check your connection and retry. Unsaved payroll edits are not submitted.
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

function PageShell({
  screen,
  title,
  description,
  actions,
  children,
}: {
  screen: PayrollModuleScreen;
  title: string;
  description: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const Icon = moduleIcons[screen] || Banknote;
  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 py-6 sm:px-6">
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
              {title}
            </h1>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              {description}
            </p>
          </div>
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
      {children}
    </div>
  );
}

function PrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}

function GhostLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-blue-300 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
    >
      {children}
    </Link>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cx("rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900", className)}>
      {children}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">{children}</label>;
}

export function PayrollHubScreen() {
  const query = usePayrollModule<PayrollHubData>("hub");

  if (query.isLoading) return <LoadingState />;
  if (query.isError || !query.data) return <ErrorState retry={() => void query.refetch()} />;

  const data = query.data.data;

  return (
    <PageShell
      screen="hub"
      title="Payroll"
      description="Run payroll, review active batches, jump to setup, contractor payments, and tax workflows."
      actions={
        <>
          <GhostLink href="/payroll/reports"><FileSpreadsheet className="h-4 w-4" /> Reports</GhostLink>
          <GhostLink href="/payroll/settings"><Settings className="h-4 w-4" /> Settings</GhostLink>
          <GhostLink href="/payroll/run"><ArrowRight className="h-4 w-4" /> Run Payroll</GhostLink>
        </>
      }
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.kpis.map((kpi) => (
          <Link
            key={kpi.label}
            href={kpi.href || "/payroll"}
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-blue-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
          >
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{kpi.label}</p>
            <p className="mt-3 text-3xl font-bold text-slate-950 dark:text-white">{kpi.value}</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{kpi.detail}</p>
          </Link>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-4">
        {data.quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-bold text-slate-950 dark:text-white">{link.label}</h2>
              <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-600" />
            </div>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{link.detail}</p>
          </Link>
        ))}
      </section>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-950 dark:text-white">Active runs</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Current drafts, approvals, and processing batches.</p>
          </div>
          <GhostLink href="/payroll/run">Start Run</GhostLink>
        </div>
        {data.activeRuns.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <Banknote className="h-12 w-12 text-blue-500" />
            <h3 className="mt-4 text-lg font-bold text-slate-950 dark:text-white">Set up your first payroll</h3>
            <p className="mt-2 max-w-md text-sm text-slate-500">Complete schedules, tax setup, and employee payment details before the first run.</p>
            <GhostLink href="/payroll/schedule">Open setup wizard</GhostLink>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500 dark:bg-slate-800/60">
                <tr>
                  <th className="px-5 py-3">Pay period</th>
                  <th className="px-5 py-3">Check date</th>
                  <th className="px-5 py-3 text-right">Employees</th>
                  <th className="px-5 py-3 text-right">Gross</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.activeRuns.map((run) => (
                  <tr key={run.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-5 py-4 font-semibold text-slate-950 dark:text-white">{run.payPeriod}</td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{run.checkDate}</td>
                    <td className="px-5 py-4 text-right">{number(run.employees)}</td>
                    <td className="px-5 py-4 text-right font-semibold">{money(run.gross)}</td>
                    <td className="px-5 py-4"><StatusBadge status={run.status} /></td>
                    <td className="px-5 py-4 text-right">
                      <Link href={run.status === "Paid" ? `/payroll/run/${run.id}` : "/payroll/run"} className="font-bold text-blue-700 hover:underline dark:text-blue-300">
                        {run.status === "Draft" ? "Continue" : "View"}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </PageShell>
  );
}

function SummaryCard({
  label,
  value,
  onClick,
}: {
  label: string;
  value: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-blue-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
    >
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">{value}</p>
    </button>
  );
}

export function RunPayrollScreen() {
  const queryClient = useQueryClient();
  const query = usePayrollModule<PayrollRunData>("run");
  const action = usePayrollAction();
  const { on, off } = useSocketStore();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [summaryModal, setSummaryModal] = useState<string | null>(null);
  const [approvalOpen, setApprovalOpen] = useState(false);
  const [processingOpen, setProcessingOpen] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All");
  const [payType, setPayType] = useState("All");
  const [status, setStatus] = useState("All");
  const [flaggedOnly, setFlaggedOnly] = useState(false);

  const updateLine = useMutation({
    mutationFn: (payload: { employeeId: string; patch: Partial<PayrollRunData["employees"][number]> }) =>
      mutatePayrollModule({ action: "payroll.line.update", screen: "run", payload }),
    onMutate: async ({ employeeId, patch }) => {
      await queryClient.cancelQueries({ queryKey: ["payroll", "module", "run", "current"] });
      const previous = queryClient.getQueryData<ApiResponse<PayrollRunData>>(["payroll", "module", "run", "current"]);
      queryClient.setQueryData<ApiResponse<PayrollRunData>>(["payroll", "module", "run", "current"], (current) => {
        if (!current) return current;
        return {
          ...current,
          data: {
            ...current.data,
            employees: current.data.employees.map((employee) =>
              employee.id === employeeId ? { ...employee, ...patch } : employee,
            ),
          },
        };
      });
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["payroll", "module", "run", "current"], context.previous);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["payroll", "module", "run"] }),
  });

  useEffect(() => {
    const runId = query.data?.data.runId;
    if (!runId) return;
    const eventName = `payroll.run.${runId}.status`;
    const handler = (payload: { step?: number; complete?: boolean }) => {
      if (typeof payload.step === "number") setProcessingStep(payload.step);
      if (payload.complete) setProcessingStep(4);
    };
    on(eventName, handler);
    return () => off(eventName, handler);
  }, [off, on, query.data?.data.runId]);

  useEffect(() => {
    if (!processingOpen) return;
    const id = window.setInterval(() => {
      setProcessingStep((current) => Math.min(current + 1, 4));
    }, 900);
    return () => window.clearInterval(id);
  }, [processingOpen]);

  if (query.isLoading) return <LoadingState title="Loading payroll draft" />;
  if (query.isError || !query.data) return <ErrorState retry={() => void query.refetch()} />;

  const data = query.data.data;
  const departments = ["All", ...Array.from(new Set(data.employees.map((employee) => employee.department)))];
  const payTypes: Array<"All" | PayType> = ["All", "Salary", "Hourly", "Contractor"];
  const statuses: Array<"All" | PayrollLineStatus> = ["All", "Verified", "Flagged", "Error"];
  const hasErrors = data.employees.some((employee) => employee.status === "Error");
  const filteredEmployees = data.employees.filter((employee) => {
    const matchesSearch = `${employee.name} ${employee.title}`.toLowerCase().includes(search.toLowerCase());
    const matchesDepartment = department === "All" || employee.department === department;
    const matchesPayType = payType === "All" || employee.payType === payType;
    const matchesStatus = status === "All" || employee.status === status;
    const matchesFlagged = !flaggedOnly || employee.status !== "Verified";
    return matchesSearch && matchesDepartment && matchesPayType && matchesStatus && matchesFlagged;
  });
  const selectedCount = selected.size;
  const verifiedCount = data.employees.filter((employee) => employee.status === "Verified").length;
  const flaggedCount = data.employees.filter((employee) => employee.status === "Flagged").length;
  const errorCount = data.employees.filter((employee) => employee.status === "Error").length;

  const toggleSelected = (employeeId: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(employeeId)) next.delete(employeeId);
      else next.add(employeeId);
      return next;
    });
  };

  const toggleExpanded = (employeeId: string) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(employeeId)) next.delete(employeeId);
      else next.add(employeeId);
      return next;
    });
  };

  const submitForApproval = () => {
    void action.mutateAsync({ action: "payroll.approval.prepare", screen: "run" });
    setApprovalOpen(true);
  };

  const runPayrollNow = async () => {
    setApprovalOpen(false);
    setProcessingOpen(true);
    setProcessingStep(0);
    await action.mutateAsync({ action: "payroll.run.complete", screen: "run" });
  };

  return (
    <PageShell
      screen="run"
      title="Run Payroll"
      description="Review every employee line, fix exceptions, route approval, and submit ACH-ready payroll."
      actions={
        <>
          <button
            type="button"
            onClick={() => action.mutate({ action: "payroll.draft.save", screen: "run" })}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            Save Draft
          </button>
          <PrimaryButton onClick={submitForApproval} disabled={hasErrors}>
            <Send className="h-4 w-4" /> Submit for Approval
          </PrimaryButton>
        </>
      }
    >
      <Card className="p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-slate-950 dark:text-white">{data.payPeriod}</h2>
              <StatusBadge status={data.status} />
            </div>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Check date {data.checkDate}</p>
          </div>
          <button
            type="button"
            onClick={() =>
              downloadCsv("payroll-draft.csv", [
                ["Employee", "Gross", "Deductions", "Net", "Status"],
                ...data.employees.map((employee) => [employee.name, employee.grossPay, employee.deductions, employee.netPay, employee.status]),
              ])
            }
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>
      </Card>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Total Gross" value={money(data.totals.gross)} onClick={() => setSummaryModal("Total Gross")} />
        <SummaryCard label="Total Taxes" value={money(data.totals.taxes)} onClick={() => setSummaryModal("Total Taxes")} />
        <SummaryCard label="Total Net" value={money(data.totals.net)} onClick={() => setSummaryModal("Total Net")} />
        <SummaryCard label="Employer Cost" value={money(data.totals.employerCost)} onClick={() => setSummaryModal("Employer Cost")} />
      </section>

      <Card className="overflow-hidden">
        <div className="grid gap-3 border-b border-slate-200 p-4 dark:border-slate-800 xl:grid-cols-[minmax(240px,1fr)_160px_140px_150px_auto_auto]">
          <label className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search employees..."
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800"
            />
          </label>
          <select value={department} onChange={(event) => setDepartment(event.target.value)} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900">
            {departments.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select value={payType} onChange={(event) => setPayType(event.target.value)} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900">
            {payTypes.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900">
            {statuses.map((item) => <option key={item}>{item}</option>)}
          </select>
          <label className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold dark:border-slate-700">
            <input type="checkbox" checked={flaggedOnly} onChange={(event) => setFlaggedOnly(event.target.checked)} />
            Show flagged only
          </label>
          <span className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-100 px-3 text-sm font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <Filter className="h-4 w-4" /> {filteredEmployees.length}
          </span>
        </div>

        {selectedCount > 0 ? (
          <div className="flex flex-wrap items-center gap-2 border-b border-blue-100 bg-blue-50 px-4 py-3 dark:border-blue-500/20 dark:bg-blue-500/10">
            <span className="text-sm font-bold text-blue-800 dark:text-blue-200">{selectedCount} selected</span>
            {["Apply bonus", "Mark reviewed", "Exclude from run"].map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => action.mutate({ action: `bulk.${label.toLowerCase().replaceAll(" ", "-")}`, screen: "run" })}
                className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-blue-700 shadow-sm dark:bg-slate-900 dark:text-blue-300"
              >
                {label}
              </button>
            ))}
          </div>
        ) : null}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-left text-sm">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500 dark:bg-slate-800/60">
              <tr>
                <th className="px-4 py-3"> </th>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Pay type</th>
                <th className="px-4 py-3 text-right">Hours</th>
                <th className="px-4 py-3 text-right">Gross pay</th>
                <th className="px-4 py-3 text-right">Deductions</th>
                <th className="px-4 py-3 text-right">Net pay</th>
                <th className="px-4 py-3">Verify</th>
                <th className="px-4 py-3 text-right"> </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredEmployees.map((employee) => {
                const rowTone =
                  employee.status === "Error"
                    ? "bg-red-50/70 dark:bg-red-500/10"
                    : employee.status === "Flagged"
                      ? "bg-amber-50/70 dark:bg-amber-500/10"
                      : "bg-white dark:bg-slate-900";
                return (
                  <Fragment key={employee.id}>
                    <tr className={cx("transition hover:bg-slate-50 dark:hover:bg-slate-800/60", rowTone)}>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <input type="checkbox" checked={selected.has(employee.id)} onChange={() => toggleSelected(employee.id)} />
                          <button type="button" onClick={() => toggleExpanded(employee.id)} aria-label={`Toggle ${employee.name} tax breakdown`}>
                            <ChevronDown className={cx("h-4 w-4 transition", expanded.has(employee.id) && "rotate-180")} />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                            {employee.name.split(" ").map((part) => part[0]).join("")}
                          </span>
                          <span>
                            <span className="block font-bold text-slate-950 dark:text-white">{employee.name}</span>
                            <span className="block text-xs text-slate-500">{employee.title} - {employee.department}</span>
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">{employee.payType}</td>
                      <td className="px-4 py-4 text-right">
                        {employee.payType === "Hourly" ? (
                          <input
                            value={employee.hours}
                            onChange={(event) => updateLine.mutate({ employeeId: employee.id, patch: { hours: Number(event.target.value) || 0 } })}
                            className="h-9 w-20 rounded-lg border border-slate-200 bg-white px-2 text-right dark:border-slate-700 dark:bg-slate-900"
                          />
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <input
                          value={employee.grossPay}
                          onChange={(event) => updateLine.mutate({ employeeId: employee.id, patch: { grossPay: Number(event.target.value) || 0 } })}
                          className="h-9 w-28 rounded-lg border border-slate-200 bg-white px-2 text-right font-semibold dark:border-slate-700 dark:bg-slate-900"
                        />
                      </td>
                      <td className="px-4 py-4 text-right">{money(employee.deductions)}</td>
                      <td className="px-4 py-4 text-right font-bold">{money(employee.netPay)}</td>
                      <td className="px-4 py-4">
                        <span title={employee.issue || "Ready for payroll"}>
                          <StatusBadge status={employee.status} />
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button type="button" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                    {expanded.has(employee.id) ? (
                      <tr className="bg-slate-50 dark:bg-slate-950" key={`${employee.id}-taxes`}>
                        <td />
                        <td colSpan={8} className="px-4 py-4">
                          <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 md:grid-cols-6">
                            {[
                              ["Federal IT", employee.taxes.federalIT],
                              ["FICA SS", employee.taxes.ficaSS],
                              ["FICA Med", employee.taxes.ficaMed],
                              ["State IT", employee.taxes.stateIT],
                              ["Local IT", employee.taxes.localIT],
                              ["Net", employee.netPay],
                            ].map(([label, value]) => (
                              <div key={label}>
                                <p className="text-xs font-bold uppercase text-slate-400">{label}</p>
                                <p className="mt-1 font-bold text-slate-950 dark:text-white">{money(Number(value))}</p>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="sticky bottom-4 z-20 rounded-xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2 text-sm font-semibold">
            <span>{verifiedCount} verified</span>
            <span className="text-amber-600">{flaggedCount} flagged</span>
            <span className="text-red-600">{errorCount} errors</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => action.mutate({ action: "payroll.draft.save", screen: "run" })} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-bold dark:border-slate-700">Save Draft</button>
            <GhostLink href="/payroll/reports">Preview Report</GhostLink>
            <PrimaryButton onClick={submitForApproval} disabled={hasErrors}>Submit for Approval</PrimaryButton>
          </div>
        </div>
      </div>

      <Dialog open={!!summaryModal} onOpenChange={() => setSummaryModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{summaryModal} breakdown</DialogTitle>
            <DialogDescription>Totals are calculated from current employee line items.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 p-6">
            {data.employees.map((employee) => (
              <div key={employee.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800">
                <span className="font-semibold">{employee.name}</span>
                <span>{summaryModal === "Total Taxes" ? money(Object.values(employee.taxes).reduce((a, b) => a + b, 0)) : money(employee.grossPay)}</span>
              </div>
            ))}
          </div>
          <DialogFooter><PrimaryButton onClick={() => setSummaryModal(null)}>Done</PrimaryButton></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={approvalOpen} onOpenChange={setApprovalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit payroll for approval</DialogTitle>
            <DialogDescription>Required approvers will receive email and in-app notifications.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 p-6">
            {data.approvers.map((approver) => (
              <div key={approver.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-800">
                <div>
                  <p className="font-bold text-slate-950 dark:text-white">{approver.name}</p>
                  <p className="text-sm text-slate-500">{approver.role}</p>
                </div>
                <StatusBadge status={approver.status} />
              </div>
            ))}
          </div>
          <DialogFooter>
            <button type="button" onClick={() => action.mutate({ action: "payroll.approval.send", screen: "run" })} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-bold dark:border-slate-700">Send for approval</button>
            <PrimaryButton onClick={runPayrollNow}>Run Payroll Now</PrimaryButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AnimatePresence>
        {processingOpen ? (
          <motion.div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/80 p-6 text-white backdrop-blur" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-slate-900 p-8 shadow-2xl">
              <Loader2 className="mx-auto h-10 w-10 animate-spin text-blue-300" />
              <h2 className="mt-5 text-center text-2xl font-bold">Processing payroll</h2>
              <div className="mt-6 space-y-3">
                {["Calculating taxes", "Submitting ACH", "Generating pay stubs", "Notifying employees", "Complete!"].map((step, index) => (
                  <div key={step} className="flex items-center gap-3">
                    <span className={cx("flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold", processingStep >= index ? "bg-blue-500" : "bg-white/10")}>
                      {processingStep > index || processingStep === 4 ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                    </span>
                    <span className={processingStep >= index ? "font-bold" : "text-slate-400"}>{step}</span>
                  </div>
                ))}
              </div>
              {processingStep >= 4 ? (
                <Link href="/payroll/run/pr-2026-0620" className="mt-6 flex h-11 items-center justify-center rounded-lg bg-white text-sm font-bold text-blue-700">
                  View completed run
                </Link>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </PageShell>
  );
}

export function CompletedRunDetailScreen({ runId }: { runId: string }) {
  const query = usePayrollModule<CompletedRunData>("completed-run", runId);
  const action = usePayrollAction();
  if (query.isLoading) return <LoadingState />;
  if (query.isError || !query.data) return <ErrorState retry={() => void query.refetch()} />;
  const { run, lineItems, journalEntries, auditTrail } = query.data.data;

  return (
    <PageShell
      screen="completed-run"
      title={`Completed Run Detail - ${run.id}`}
      description="Completed run detail with employee line items, tax breakdowns, exports, pay stubs, and immutable audit trail."
      actions={
        <>
          <GhostLink href={`/payroll/run/${run.id}/paystubs`}><FileText className="h-4 w-4" /> Pay stubs</GhostLink>
          <PrimaryButton onClick={() => action.mutate({ action: "payroll.paystubs.zip", screen: "completed-run" })}><FileArchive className="h-4 w-4" /> Download ZIP</PrimaryButton>
        </>
      }
    >
      <section className="grid gap-4 md:grid-cols-4">
        {[["Employees", run.employees], ["Gross", money(run.gross)], ["Taxes", money(run.taxes)], ["Net", money(run.net)]].map(([label, value]) => (
          <Card key={label} className="p-5"><p className="text-sm font-semibold text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p></Card>
        ))}
      </section>
      <Card className="overflow-hidden">
        <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800"><h2 className="font-bold">Line items and tax breakdown</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800"><tr>{["Employee", "Gross", "Federal", "FICA", "State/Local", "Deductions", "Net"].map((h) => <th key={h} className="px-5 py-3">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {lineItems.map((line) => (
                <tr key={line.id}>
                  <td className="px-5 py-4 font-bold">{line.name}</td>
                  <td className="px-5 py-4">{money(line.grossPay)}</td>
                  <td className="px-5 py-4">{money(line.taxes.federalIT)}</td>
                  <td className="px-5 py-4">{money(line.taxes.ficaSS + line.taxes.ficaMed)}</td>
                  <td className="px-5 py-4">{money(line.taxes.stateIT + line.taxes.localIT)}</td>
                  <td className="px-5 py-4">{money(line.deductions)}</td>
                  <td className="px-5 py-4 font-bold">{money(line.netPay || line.grossPay * 0.72)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center justify-between"><h2 className="font-bold">QBO journal entry export</h2><PrimaryButton onClick={() => action.mutate({ action: "payroll.journal.export", screen: "completed-run" })}>Export QBO</PrimaryButton></div>
          <div className="mt-4 space-y-2">{journalEntries.map((entry) => <div key={entry.account} className="grid grid-cols-4 gap-2 rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-800"><span className="col-span-2 font-semibold">{entry.account}</span><span>{entry.debit ? money(entry.debit) : "-"}</span><span>{entry.credit ? money(entry.credit) : "-"}</span></div>)}</div>
        </Card>
        <Card className="p-5">
          <h2 className="font-bold">Audit Trail</h2>
          <div className="mt-4 space-y-3">{auditTrail.map((item) => <div key={`${item.time}-${item.action}`} className="border-l-2 border-blue-200 pl-4"><p className="text-sm font-bold">{item.action}</p><p className="text-xs text-slate-500">{item.actor} - {item.time}</p></div>)}</div>
        </Card>
      </section>
    </PageShell>
  );
}

export function PaystubsScreen({ runId }: { runId: string }) {
  const query = usePayrollModule<PaystubData>("paystubs", runId);
  const action = usePayrollAction();
  const [search, setSearch] = useState("");
  if (query.isLoading) return <LoadingState />;
  if (query.isError || !query.data) return <ErrorState retry={() => void query.refetch()} />;
  const stubs = query.data.data.stubs.filter((stub) => stub.employee.toLowerCase().includes(search.toLowerCase()));
  return (
    <PageShell screen="paystubs" title="Pay Stubs" description="Search, preview, and download individual pay stub PDFs or export the full run as a ZIP." actions={<PrimaryButton onClick={() => action.mutate({ action: "payroll.paystubs.zip", screen: "paystubs" })}><FileArchive className="h-4 w-4" /> Download All ZIP</PrimaryButton>}>
      <Card className="p-4"><label className="relative block max-w-md"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by employee name..." className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm dark:border-slate-700 dark:bg-slate-800" /></label></Card>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {stubs.map((stub) => (
          <Card key={stub.id} className="p-5">
            <div className="flex items-start justify-between gap-3"><div><h2 className="font-bold">{stub.employee}</h2><p className="text-sm text-slate-500">{stub.title}</p></div><FileText className="h-5 w-5 text-blue-600" /></div>
            <div className="mt-5 grid grid-cols-3 gap-2 text-sm"><div><p className="text-xs text-slate-400">Gross</p><p className="font-bold">{money(stub.gross)}</p></div><div><p className="text-xs text-slate-400">Taxes</p><p className="font-bold">{money(stub.taxes)}</p></div><div><p className="text-xs text-slate-400">Net</p><p className="font-bold">{money(stub.net)}</p></div></div>
            <button type="button" onClick={() => action.mutate({ action: "payroll.paystub.download", screen: "paystubs", payload: { id: stub.id } })} className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 text-sm font-bold dark:border-slate-700"><Download className="h-4 w-4" /> Download PDF</button>
          </Card>
        ))}
      </section>
    </PageShell>
  );
}

export function OffCycleScreen() {
  const query = usePayrollModule<OffCycleData>("off-cycle");
  const action = usePayrollAction();
  const [step, setStep] = useState(1);
  const [reason, setReason] = useState("Bonus");
  if (query.isLoading) return <LoadingState />;
  if (query.isError || !query.data) return <ErrorState retry={() => void query.refetch()} />;
  const data = query.data.data;
  return (
    <PageShell screen="off-cycle" title="Off-Cycle Payroll" description="Create a bonus, correction, commission, or termination pay run with tax preview and approval.">
      <Card className="p-5">
        <div className="flex flex-wrap gap-2">{[1, 2, 3, 4].map((n) => <button key={n} onClick={() => setStep(n)} className={cx("rounded-full px-4 py-2 text-sm font-bold", step === n ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800")}>Step {n}</button>)}</div>
      </Card>
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="p-5">
          {step === 1 ? <div><h2 className="font-bold">Select employees</h2><div className="mt-4 grid gap-3 md:grid-cols-2">{data.employees.map((employee) => <label key={employee.id} className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-800"><input type="checkbox" defaultChecked={employee.selected} /><span><span className="block font-bold">{employee.name}</span><span className="text-sm text-slate-500">{employee.title}</span></span></label>)}</div></div> : null}
          {step === 2 ? <div><h2 className="font-bold">Pay reason</h2><select value={reason} onChange={(e) => setReason(e.target.value)} className="mt-4 h-10 rounded-lg border border-slate-200 px-3 dark:border-slate-700 dark:bg-slate-900">{["Bonus", "Correction", "Commission", "Termination Pay"].map((item) => <option key={item}>{item}</option>)}</select></div> : null}
          {step === 3 ? <div><h2 className="font-bold">Enter amounts</h2><div className="mt-4 space-y-2">{data.employees.filter((e) => e.selected).map((employee) => <div key={employee.id} className="flex items-center justify-between rounded-lg bg-slate-50 p-3 dark:bg-slate-800"><span className="font-semibold">{employee.name}</span><input defaultValue={employee.amount} className="h-9 w-28 rounded-lg border border-slate-200 px-2 text-right dark:border-slate-700 dark:bg-slate-900" /></div>)}</div></div> : null}
          {step === 4 ? <div><h2 className="font-bold">Approve and process</h2><p className="mt-2 text-sm text-slate-500">Reason: {reason}. Tax preview is ready for approval.</p><PrimaryButton onClick={() => action.mutate({ action: "payroll.offcycle.process", screen: "off-cycle" })}>Process off-cycle run</PrimaryButton></div> : null}
        </Card>
        <Card className="p-5"><h2 className="font-bold">Tax Preview</h2>{[["Gross", data.taxPreview.gross], ["Taxes", data.taxPreview.taxes], ["Net", data.taxPreview.net]].map(([label, value]) => <div key={label} className="mt-4 flex justify-between text-sm"><span>{label}</span><span className="font-bold">{money(Number(value))}</span></div>)}</Card>
      </section>
    </PageShell>
  );
}

export function PayrollHistoryScreen() {
  const query = usePayrollModule<PayrollHistoryData>("history");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [type, setType] = useState("All");
  if (query.isLoading) return <LoadingState />;
  if (query.isError || !query.data) return <ErrorState retry={() => void query.refetch()} />;
  const runs = query.data.data.runs.filter((run) => {
    return (
      `${run.id} ${run.payPeriod}`.toLowerCase().includes(search.toLowerCase()) &&
      (status === "All" || run.status === status) &&
      (type === "All" || run.type === type)
    );
  });
  const totals = runs.reduce((acc, run) => ({ runs: acc.runs + 1, gross: acc.gross + run.gross, tax: acc.tax + run.taxes }), { runs: 0, gross: 0, tax: 0 });
  return (
    <PageShell screen="history" title="Payroll History" description="Search, filter, export, and open any regular, off-cycle, or contractor payroll run." actions={<PrimaryButton onClick={() => downloadCsv("payroll-history.csv", [["Run", "Period", "Status", "Gross"], ...runs.map((r) => [r.id, r.payPeriod, r.status, r.gross])])}><Download className="h-4 w-4" /> Export to Excel</PrimaryButton>}>
      <section className="grid gap-4 md:grid-cols-3">{[["Total runs", totals.runs], ["Total gross", money(totals.gross)], ["Total tax", money(totals.tax)]].map(([label, value]) => <Card key={label} className="p-5"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p></Card>)}</section>
      <Card className="overflow-hidden">
        <div className="flex flex-wrap gap-3 border-b border-slate-200 p-4 dark:border-slate-800"><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search runs..." className="h-10 rounded-lg border border-slate-200 px-3 dark:border-slate-700 dark:bg-slate-900" /><select value={status} onChange={(e) => setStatus(e.target.value)} className="h-10 rounded-lg border border-slate-200 px-3 dark:border-slate-700 dark:bg-slate-900">{["All", "Draft", "Pending", "Processing", "Paid", "Failed"].map((item) => <option key={item}>{item}</option>)}</select><select value={type} onChange={(e) => setType(e.target.value)} className="h-10 rounded-lg border border-slate-200 px-3 dark:border-slate-700 dark:bg-slate-900">{["All", "Regular", "Off-cycle", "Contractor"].map((item) => <option key={item}>{item}</option>)}</select><input type="date" className="h-10 rounded-lg border border-slate-200 px-3 dark:border-slate-700 dark:bg-slate-900" /><input type="date" className="h-10 rounded-lg border border-slate-200 px-3 dark:border-slate-700 dark:bg-slate-900" /></div>
        <RunTable runs={runs} />
      </Card>
    </PageShell>
  );
}

function RunTable({ runs }: { runs: PayrollHistoryData["runs"] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[860px] text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800"><tr>{["Run", "Pay period", "Check date", "Employees", "Gross", "Status", "Action"].map((h) => <th key={h} className="px-5 py-3">{h}</th>)}</tr></thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">{runs.map((run) => <tr key={run.id}><td className="px-5 py-4 font-bold">{run.id}</td><td className="px-5 py-4">{run.payPeriod}</td><td className="px-5 py-4">{run.checkDate}</td><td className="px-5 py-4">{run.employees}</td><td className="px-5 py-4 font-semibold">{money(run.gross)}</td><td className="px-5 py-4"><StatusBadge status={run.status} /></td><td className="px-5 py-4"><Link href={`/payroll/run/${run.id}`} className="font-bold text-blue-700 hover:underline">Open</Link></td></tr>)}</tbody>
      </table>
    </div>
  );
}

export function ContractorsScreen() {
  const query = usePayrollModule<ContractorPaymentData>("contractors");
  const action = usePayrollAction();
  const [amounts, setAmounts] = useState<Record<string, number>>({});
  if (query.isLoading) return <LoadingState />;
  if (query.isError || !query.data) return <ErrorState retry={() => void query.refetch()} />;
  const contractors = query.data.data.contractors;
  const total = contractors.reduce((sum, c) => sum + (amounts[c.id] ?? c.amount), 0);
  return (
    <PageShell screen="contractors" title="Contractor Payments" description="Create contractor ACH runs and monitor 1099-NEC thresholds." actions={<PrimaryButton onClick={() => action.mutate({ action: "payroll.contractors.submit", screen: "contractors", payload: { total } })}>Submit ACH</PrimaryButton>}>
      <Card className="overflow-hidden"><div className="border-b border-slate-200 p-5 dark:border-slate-800"><h2 className="font-bold">Contractor payment run - {money(total)}</h2></div><div className="divide-y divide-slate-100 dark:divide-slate-800">{contractors.map((contractor) => <div key={contractor.id} className="grid gap-3 p-5 md:grid-cols-[1fr_160px_170px_160px] md:items-center"><div><p className="font-bold">{contractor.name}</p><p className="text-sm text-slate-500">{contractor.company}</p></div><div><p className="text-xs text-slate-400">YTD paid</p><p className="font-bold">{money(contractor.ytdPaid)}</p></div><StatusBadge status={contractor.thresholdStatus.includes("Approaching") ? "Pending" : "Paid"} /><input value={amounts[contractor.id] ?? contractor.amount} onChange={(e) => setAmounts((current) => ({ ...current, [contractor.id]: Number(e.target.value) || 0 }))} className="h-10 rounded-lg border border-slate-200 px-3 text-right dark:border-slate-700 dark:bg-slate-900" /></div>)}</div></Card>
    </PageShell>
  );
}

export function ScheduleScreen() {
  const query = usePayrollModule<PayrollScheduleData>("schedule");
  const action = usePayrollAction();
  const [modalOpen, setModalOpen] = useState(false);
  if (query.isLoading) return <LoadingState />;
  if (query.isError || !query.data) return <ErrorState retry={() => void query.refetch()} />;
  const data = query.data.data;
  return (
    <PageShell screen="schedule" title="Pay Schedules" description="Manage active payroll schedules and preview six months of upcoming check dates." actions={<PrimaryButton onClick={() => setModalOpen(true)}><Plus className="h-4 w-4" /> Add Schedule</PrimaryButton>}>
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]"><Card className="overflow-hidden"><div className="divide-y divide-slate-100 dark:divide-slate-800">{data.schedules.map((schedule) => <div key={schedule.id} className="grid gap-3 p-5 md:grid-cols-5 md:items-center"><div className="md:col-span-2"><p className="font-bold">{schedule.name}</p><p className="text-sm text-slate-500">{schedule.employees} employees</p></div><p>{schedule.frequency}</p><p>{schedule.nextCheckDate}</p><button onClick={() => setModalOpen(true)} className="text-left font-bold text-blue-700">Edit</button></div>)}</div></Card><Card className="p-5"><h2 className="font-bold">6-Month Calendar Preview</h2><div className="mt-4 grid gap-3">{data.upcomingDates.map((date) => <div key={`${date.date}-${date.label}`} className="flex items-center justify-between rounded-lg bg-slate-50 p-3 dark:bg-slate-800"><span className="font-bold">{date.date}</span><span className="text-sm text-slate-500">{date.label} - {date.schedule}</span></div>)}</div></Card></section>
      <Dialog open={modalOpen} onOpenChange={setModalOpen}><DialogContent><DialogHeader><DialogTitle>Add/Edit schedule</DialogTitle><DialogDescription>Set frequency, anchor date, and generated check dates.</DialogDescription></DialogHeader><div className="grid gap-4 p-6"><FieldLabel>Frequency</FieldLabel><select className="h-10 rounded-lg border border-slate-200 px-3 dark:border-slate-700 dark:bg-slate-900"><option>Biweekly</option><option>Weekly</option><option>Semi-monthly</option></select><FieldLabel>Anchor date</FieldLabel><input type="date" className="h-10 rounded-lg border border-slate-200 px-3 dark:border-slate-700 dark:bg-slate-900" /></div><DialogFooter><PrimaryButton onClick={() => { action.mutate({ action: "payroll.schedule.save", screen: "schedule" }); setModalOpen(false); }}>Save Schedule</PrimaryButton></DialogFooter></DialogContent></Dialog>
    </PageShell>
  );
}

export function TaxSetupScreen() {
  const query = usePayrollModule<PayrollTaxSetupData>("tax-setup");
  const action = usePayrollAction();
  const [modalOpen, setModalOpen] = useState(false);
  if (query.isLoading) return <LoadingState />;
  if (query.isError || !query.data) return <ErrorState retry={() => void query.refetch()} />;
  const data = query.data.data;
  return (
    <PageShell screen="tax-setup" title="Tax Setup" description="Configure Federal EIN, state employer accounts, SUTA rates, state forms, and EFTPS status." actions={<PrimaryButton onClick={() => setModalOpen(true)}><Plus className="h-4 w-4" /> Add State</PrimaryButton>}>
      <section className="grid gap-4 md:grid-cols-3"><Card className="p-5"><p className="text-sm text-slate-500">Federal EIN</p><input defaultValue={data.federalEin} className="mt-2 h-10 w-full rounded-lg border border-slate-200 px-3 font-bold dark:border-slate-700 dark:bg-slate-900" /></Card><Card className="p-5"><p className="text-sm text-slate-500">EFTPS enrollment</p><div className="mt-3"><StatusBadge status={data.eftpsStatus === "Enrolled" ? "Paid" : "Pending"} /></div><a href="https://www.eftps.gov/" className="mt-3 inline-flex text-sm font-bold text-blue-700">Open guide</a></Card><Card className="p-5"><p className="text-sm text-slate-500">State accounts</p><p className="mt-2 text-2xl font-bold">{data.states.length}</p></Card></section>
      <Card className="overflow-hidden"><table className="w-full min-w-[840px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800"><tr>{["State", "Account number", "SUTA rate", "State form", "Status"].map((h) => <th key={h} className="px-5 py-3">{h}</th>)}</tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{data.states.map((state) => <tr key={state.state}><td className="px-5 py-4 font-bold">{state.state}</td><td className="px-5 py-4">{state.accountNumber}</td><td className="px-5 py-4">{state.sutaRate}</td><td className="px-5 py-4">{state.form}</td><td className="px-5 py-4"><StatusBadge status={state.status === "Verified" ? "Paid" : "Pending"} /></td></tr>)}</tbody></table></Card>
      <Dialog open={modalOpen} onOpenChange={setModalOpen}><DialogContent><DialogHeader><DialogTitle>Add state tax account</DialogTitle><DialogDescription>Add employer account number, SUTA rate, and state form.</DialogDescription></DialogHeader><div className="grid gap-3 p-6"><input placeholder="State" className="h-10 rounded-lg border px-3 dark:bg-slate-900" /><input placeholder="Employer account number" className="h-10 rounded-lg border px-3 dark:bg-slate-900" /><input placeholder="SUTA rate" className="h-10 rounded-lg border px-3 dark:bg-slate-900" /><input placeholder="State form" className="h-10 rounded-lg border px-3 dark:bg-slate-900" /></div><DialogFooter><PrimaryButton onClick={() => { action.mutate({ action: "payroll.tax-state.add", screen: "tax-setup" }); setModalOpen(false); }}>Save state</PrimaryButton></DialogFooter></DialogContent></Dialog>
    </PageShell>
  );
}

export function GarnishmentsScreen() {
  const query = usePayrollModule<GarnishmentData>("garnishments");
  const action = usePayrollAction();
  const [modalOpen, setModalOpen] = useState(false);
  if (query.isLoading) return <LoadingState />;
  if (query.isError || !query.data) return <ErrorState retry={() => void query.refetch()} />;
  return (
    <PageShell screen="garnishments" title="Garnishments" description="Manage child support, IRS levies, student loans, creditor orders, priority, and document evidence." actions={<PrimaryButton onClick={() => setModalOpen(true)}><Plus className="h-4 w-4" /> Add Garnishment</PrimaryButton>}>
      <Card className="overflow-hidden"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800"><tr>{["Employee", "Type", "Amount", "Priority", "Effective", "Court order", "Status"].map((h) => <th key={h} className="px-5 py-3">{h}</th>)}</tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{query.data.data.orders.map((order) => <tr key={order.id}><td className="px-5 py-4 font-bold">{order.employee}</td><td className="px-5 py-4">{order.type}</td><td className="px-5 py-4">{order.amount}</td><td className="px-5 py-4">{order.priority}</td><td className="px-5 py-4">{order.effectiveDate}</td><td className="px-5 py-4">{order.courtOrder}</td><td className="px-5 py-4"><StatusBadge status={order.status} /></td></tr>)}</tbody></table></Card>
      <Dialog open={modalOpen} onOpenChange={setModalOpen}><DialogContent><DialogHeader><DialogTitle>Add garnishment</DialogTitle><DialogDescription>Capture order details and upload the source document.</DialogDescription></DialogHeader><div className="grid gap-3 p-6"><select className="h-10 rounded-lg border px-3 dark:bg-slate-900">{["Child Support", "IRS Levy", "Student Loan", "Creditor"].map((x) => <option key={x}>{x}</option>)}</select><input placeholder="Amount" className="h-10 rounded-lg border px-3 dark:bg-slate-900" /><input placeholder="Priority" className="h-10 rounded-lg border px-3 dark:bg-slate-900" /><input type="date" className="h-10 rounded-lg border px-3 dark:bg-slate-900" /><input placeholder="Court order #" className="h-10 rounded-lg border px-3 dark:bg-slate-900" /><button className="inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-bold"><Upload className="h-4 w-4" /> Upload order document</button></div><DialogFooter><PrimaryButton onClick={() => { action.mutate({ action: "payroll.garnishment.add", screen: "garnishments" }); setModalOpen(false); }}>Save order</PrimaryButton></DialogFooter></DialogContent></Dialog>
    </PageShell>
  );
}

export function EwaScreen() {
  const query = usePayrollModule<EwaData>("ewa");
  if (query.isLoading) return <LoadingState />;
  if (query.isError || !query.data) return <ErrorState retry={() => void query.refetch()} />;
  const data = query.data.data;
  return (
    <PageShell screen="ewa" title="Earned Wage Access" description={`Administer EWA availability, advance requests, and next-run repayments with ${data.provider}.`}>
      <section className="grid gap-4 md:grid-cols-3">{data.employees.map((employee) => <Card key={employee.id} className="p-5"><p className="font-bold">{employee.name}</p><p className="mt-2 text-sm text-slate-500">{employee.percent}% of earned wages available</p><p className="mt-3 text-2xl font-bold">{money(employee.available)}</p><div className="mt-4 h-2 rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-blue-600" style={{ width: `${employee.percent}%` }} /></div></Card>)}</section>
      <section className="grid gap-6 lg:grid-cols-2"><SimpleList title="Recent advance requests" items={data.requests.map((r) => [`${r.employee} - ${money(r.amount)}`, `${r.status} - ${r.requestedAt}`])} /><SimpleList title="Pending repayments on next run" items={data.repayments.map((r) => [`${r.employee} - ${money(r.amount)}`, r.nextRun])} /></section>
    </PageShell>
  );
}

export function BridgeScreen() {
  const query = usePayrollModule<BridgeData>("bridge");
  const action = usePayrollAction();
  if (query.isLoading) return <LoadingState />;
  if (query.isError || !query.data) return <ErrorState retry={() => void query.refetch()} />;
  const data = query.data.data;
  return (
    <PageShell screen="bridge" title="Payroll Bridge" description="Apply for a payroll line of credit based on payroll history, Plaid bank data, and Parafin or Capchase underwriting." actions={<PrimaryButton onClick={() => action.mutate({ action: "payroll.bridge.apply", screen: "bridge" })}>Submit Application</PrimaryButton>}>
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]"><Card className="p-5"><h2 className="font-bold">Application form</h2><div className="mt-4 grid gap-3 md:grid-cols-2"><input placeholder="Requested credit line" className="h-10 rounded-lg border px-3 dark:bg-slate-900" /><input placeholder="Use of funds" className="h-10 rounded-lg border px-3 dark:bg-slate-900" /><button className="inline-flex h-10 items-center gap-2 rounded-lg border px-3 font-bold"><Landmark className="h-4 w-4" /> Connect bank with Plaid</button><select className="h-10 rounded-lg border px-3 dark:bg-slate-900"><option>Provider: Parafin</option><option>Provider: Capchase</option></select></div><h3 className="mt-6 font-bold">Underwriting</h3><div className="mt-3 grid gap-3 md:grid-cols-2">{data.underwriting.map((row) => <div key={row.label} className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800"><p className="text-xs text-slate-400">{row.label}</p><p className="font-bold">{row.value}</p><p className="text-sm text-slate-500">{row.status}</p></div>)}</div></Card><SimpleList title="Repayment schedule" items={data.repaymentSchedule.map((r) => [r.date, `${money(r.amount)} - ${r.status}`])} /></section>
    </PageShell>
  );
}

export function PayrollSettingsScreen() {
  const query = usePayrollModule<PayrollSettingsData>("settings");
  const action = usePayrollAction();
  if (query.isLoading) return <LoadingState />;
  if (query.isError || !query.data) return <ErrorState retry={() => void query.refetch()} />;
  const data = query.data.data;
  return (
    <PageShell screen="settings" title="Payroll Settings" description="Configure check date calculation, funding account, ACH timing, approval chains, and notifications." actions={<PrimaryButton onClick={() => action.mutate({ action: "payroll.settings.save", screen: "settings" })}>Save Settings</PrimaryButton>}>
      <section className="grid gap-6 lg:grid-cols-2"><Card className="p-5"><h2 className="font-bold">Processing rules</h2><div className="mt-4 grid gap-4"><label><FieldLabel>Check date calculation</FieldLabel><select defaultValue={data.checkDateCalculation} className="mt-2 h-10 w-full rounded-lg border px-3 dark:bg-slate-900"><option>Business days</option><option>Calendar days</option></select></label><label><FieldLabel>ACH timing</FieldLabel><select defaultValue={data.achTiming} className="mt-2 h-10 w-full rounded-lg border px-3 dark:bg-slate-900"><option>2-day</option><option>Next-day</option></select></label><div><FieldLabel>Bank account</FieldLabel><p className="mt-2 rounded-lg border p-3 font-bold dark:border-slate-700">{data.bankAccount}</p><button className="mt-2 text-sm font-bold text-blue-700">Connect with Plaid</button></div></div></Card><Card className="p-5"><h2 className="font-bold">Approval Chain Setup</h2><div className="mt-4 space-y-3">{data.approvalChain.map((approver) => <div key={approver.id} className="flex items-center justify-between rounded-lg bg-slate-50 p-3 dark:bg-slate-800"><span><span className="block font-bold">{approver.name}</span><span className="text-sm text-slate-500">{approver.role}</span></span><Edit3 className="h-4 w-4 text-slate-400" /></div>)}</div></Card></section><Card className="p-5"><h2 className="font-bold">Notification preferences</h2><div className="mt-4 grid gap-3 md:grid-cols-2">{data.notifications.map((n) => <label key={n.label} className="flex items-center justify-between rounded-lg border border-slate-200 p-3 dark:border-slate-800"><span className="font-semibold">{n.label}</span><input type="checkbox" defaultChecked={n.enabled} /></label>)}</div></Card>
    </PageShell>
  );
}

export function PayrollReportsScreen() {
  const query = usePayrollModule<PayrollReportsData>("reports");
  const action = usePayrollAction();
  if (query.isLoading) return <LoadingState />;
  if (query.isError || !query.data) return <ErrorState retry={() => void query.refetch()} />;
  return (
    <PageShell screen="reports" title="Payroll Reports" description="Download payroll summary, tax liability, deductions, and journal entry reports as Excel or CSV.">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{query.data.data.reports.map((report) => <Card key={report.id} className="p-5"><FileSpreadsheet className="h-6 w-6 text-blue-600" /><h2 className="mt-4 font-bold">{report.name}</h2><p className="mt-2 text-sm text-slate-500">{report.description}</p><p className="mt-3 text-xs font-bold text-slate-400">Last run {report.lastRun}</p><button onClick={() => action.mutate({ action: "payroll.report.download", screen: "reports", payload: { id: report.id } })} className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 text-sm font-bold dark:border-slate-700"><Download className="h-4 w-4" /> Download {report.format}</button></Card>)}</section>
    </PageShell>
  );
}

function SimpleList({ title, items }: { title: string; items: Array<[string, string]> }) {
  return (
    <Card className="p-5">
      <h2 className="font-bold">{title}</h2>
      <div className="mt-4 space-y-3">
        {items.map(([left, right]) => (
          <div key={`${left}-${right}`} className="flex items-center justify-between gap-4 rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-800">
            <span className="font-semibold">{left}</span>
            <span className="text-slate-500">{right}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
