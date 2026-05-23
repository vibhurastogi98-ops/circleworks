"use client";

import React, { useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Calculator,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  Plus,
  Save,
  Settings,
  Upload,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";

type TipRecord = {
  id: string;
  employeeId: string;
  employeeName: string;
  role: string;
  payPeriod: string;
  hoursWorked: number;
  grossReceipts: number;
  declaredTips: number;
  allocatedTips: number;
  totalTips: number;
  ficaOnTips: number;
  minimumWageTipPortion: number;
  netTipCredit: number;
  state: string;
  source: "manual" | "Square" | "Toast" | "Clover";
};

type TipPool = {
  id: string;
  name: string;
  distributionMethod: "hours" | "points" | "percentage";
  participatingEmployeeIds: string[];
  payPeriod: string;
  poolAmount: number;
  overrides: Record<string, number>;
  state: string;
  complianceFlag?: string;
  status: "active" | "draft";
};

type TipsPayload = {
  tipRecords: TipRecord[];
  tipPools: TipPool[];
  employees: Array<{ id: string; name: string; role: string; state: string }>;
  form8027: {
    isLargeEstablishment: boolean;
    allocationMethod: "hours" | "gross" | "goodfaith";
    grossReceipts: number;
    chargeReceipts: number;
    chargedTips: number;
    totalDeclaredTips: number;
    eightPercentThreshold: number;
    allocationShortfall: number;
    needsAllocation: boolean;
  };
  summary: {
    totalFicaPaid: number;
    portionAttributableToMinimumWage: number;
    eligibleCredit: number;
    totalDeclaredTips: number;
    totalAllocatedTips: number;
    totalTips: number;
  };
};

const tabs = [
  { id: "reporting", label: "Tip Reporting", icon: FileSpreadsheet },
  { id: "8846", label: "FICA Tip Credit", icon: Calculator },
  { id: "8027", label: "Form 8027", icon: FileText },
  { id: "pools", label: "Tip Pools", icon: Users },
] as const;

type TabId = (typeof tabs)[number]["id"];

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const percent = new Intl.NumberFormat("en-US", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

async function fetchTips(): Promise<TipsPayload> {
  const response = await fetch("/api/payroll/tips", { cache: "no-store" });
  if (!response.ok) throw new Error("Failed to load tip reporting data");
  return response.json();
}

async function postTips(body: Record<string, unknown>): Promise<TipsPayload> {
  const response = await fetch("/api/payroll/tips", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? "Failed to update tips");
  return data;
}

function parseCsv(text: string) {
  const [headerLine, ...lines] = text.trim().split(/\r?\n/);
  const headers = headerLine.split(",").map((header) => header.trim().toLowerCase());

  return lines
    .map((line) => {
      const values = line.split(",").map((value) => value.trim());
      const row = Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
      return {
        employeeId: row.employeeid || row.employee_id || row.id,
        employeeName: row.employee || row.name || row.employeename,
        declaredTips: Number(row.declaredtips || row.declared_tips || row.tips || 0),
        grossReceipts: Number(row.grossreceipts || row.gross_receipts || row.receipts || 0),
        hoursWorked: Number(row.hours || row.hoursworked || row.hours_worked || 0),
      };
    })
    .filter((row) => row.employeeId || row.employeeName);
}

function StatCard({ label, value, tone = "slate" }: { label: string; value: string; tone?: "slate" | "emerald" | "blue" | "amber" }) {
  const colors = {
    slate: "text-slate-900 dark:text-white",
    emerald: "text-emerald-600",
    blue: "text-blue-600",
    amber: "text-amber-600",
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs font-black uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-1 text-2xl font-black ${colors[tone]}`}>{value}</p>
    </div>
  );
}

function InlineTipCell({
  record,
  onSave,
}: {
  record: TipRecord;
  onSave: (id: string, value: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(record.declaredTips));

  if (editing) {
    return (
      <input
        autoFocus
        type="number"
        min={0}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onBlur={() => {
          setEditing(false);
          onSave(record.id, Number(value || 0));
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.currentTarget.blur();
          }
          if (event.key === "Escape") {
            setValue(String(record.declaredTips));
            setEditing(false);
          }
        }}
        className="h-9 w-28 rounded-lg border border-blue-300 bg-white px-2 text-right font-mono text-sm outline-none ring-2 ring-blue-100 dark:bg-slate-950"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="rounded-lg px-2 py-1 text-right font-mono font-bold text-blue-700 hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-950/40"
      title="Edit declared tips"
    >
      {currency.format(record.declaredTips)}
    </button>
  );
}

export default function TipsPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("reporting");
  const [poolModalOpen, setPoolModalOpen] = useState(false);
  const [newPool, setNewPool] = useState({
    name: "",
    distributionMethod: "hours" as TipPool["distributionMethod"],
    participatingEmployeeIds: [] as string[],
    poolAmount: 0,
    state: "CA",
  });

  const tipsQuery = useQuery({
    queryKey: ["payroll-tips"],
    queryFn: fetchTips,
  });

  const mutation = useMutation({
    mutationFn: postTips,
    onSuccess: (data) => {
      queryClient.setQueryData(["payroll-tips"], data);
      queryClient.invalidateQueries({ queryKey: ["payroll-preview"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const data = tipsQuery.data;
  const rows = data?.tipRecords ?? [];
  const summary = data?.summary;
  const form8027 = data?.form8027;
  const employees = data?.employees ?? [];

  const underReportedRows = useMemo(() => {
    if (!form8027?.grossReceipts) return [];
    return rows.filter((row) => row.grossReceipts > 0 && row.declaredTips / row.grossReceipts < 0.08);
  }, [form8027?.grossReceipts, rows]);

  const handleImport = async (file?: File) => {
    if (!file) return;
    const text = await file.text();
    const importedRows = parseCsv(text);
    mutation.mutate({ action: "import_csv", provider: "Square", rows: importedRows });
    toast.success(`Imported ${importedRows.length} POS tip rows`);
  };

  const download8846 = () => {
    if (!summary) return;
    const csv = [
      "label,amount",
      `Total FICA paid,${summary.totalFicaPaid.toFixed(2)}`,
      `Portion attributable to minimum wage,${summary.portionAttributableToMinimumWage.toFixed(2)}`,
      `Eligible credit,${summary.eligibleCredit.toFixed(2)}`,
    ].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "form-8846-tip-credit-data.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const generate8027Pdf = async () => {
    const response = await fetch("/api/payroll/tips/8027-generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "pdf",
        tips: rows,
        grossReceipts: form8027?.grossReceipts,
        chargeReceipts: form8027?.chargeReceipts,
        chargedTips: form8027?.chargedTips,
        allocMethod: form8027?.allocationMethod,
      }),
    });

    if (!response.ok) {
      toast.error("Unable to generate Form 8027 PDF");
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "form-8027-tip-allocation.pdf";
    link.click();
    URL.revokeObjectURL(url);
  };

  if (tipsQuery.isLoading) {
    return (
      <div className="flex min-h-[360px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-20">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
            <span>Payroll</span>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className="text-slate-900 dark:text-white">Tips</span>
          </div>
          <h1 className="flex items-center gap-3 text-2xl font-extrabold text-slate-900 dark:text-white">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-300">
              <Calculator size={21} />
            </span>
            Tip Reporting
          </h1>
          <p className="ml-[52px] mt-1 text-sm text-slate-500 dark:text-slate-400">
            Track declared tips, FICA tip credit, Form 8027 allocations, and tip pools.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(event) => handleImport(event.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <Upload size={16} />
            Import POS CSV
          </button>
          <button
            type="button"
            onClick={() => mutation.mutate({ action: "publish" })}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
          >
            <Save size={16} />
            Publish to Payroll
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Total Tips" value={currency.format(summary?.totalTips ?? 0)} tone="blue" />
        <StatCard label="Total FICA Paid" value={currency.format(summary?.totalFicaPaid ?? 0)} />
        <StatCard label="8846 Eligible Credit" value={currency.format(summary?.eligibleCredit ?? 0)} tone="emerald" />
        <StatCard label="8027 Shortfall" value={currency.format(form8027?.allocationShortfall ?? 0)} tone={form8027?.needsAllocation ? "amber" : "slate"} />
      </div>

      <div className="flex w-full gap-1 overflow-x-auto rounded-xl bg-slate-200/60 p-1 dark:bg-slate-800/70 md:w-max">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex min-h-10 items-center gap-2 rounded-lg px-4 text-sm font-bold transition-colors ${
                active
                  ? "bg-white text-slate-900 shadow-sm dark:bg-slate-950 dark:text-white"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "reporting" && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-800 dark:bg-slate-950">
            <h2 className="font-black text-slate-900 dark:text-white">Tip Reporting Table</h2>
            <p className="mt-1 text-sm text-slate-500">Per employee per pay period.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1040px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-400 dark:border-slate-800 dark:bg-slate-950/70">
                <tr>
                  <th className="px-5 py-4">Employee</th>
                  <th className="px-5 py-4">Pay Period</th>
                  <th className="px-5 py-4 text-right">Declared Tips</th>
                  <th className="px-5 py-4 text-right">Allocated Tips</th>
                  <th className="px-5 py-4 text-right">Total Tips</th>
                  <th className="px-5 py-4 text-right">FICA on Tips</th>
                  <th className="px-5 py-4 text-right">Net Tip Credit</th>
                  <th className="px-5 py-4">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {rows.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="px-5 py-4">
                      <p className="font-black text-slate-900 dark:text-white">{record.employeeName}</p>
                      <p className="text-xs font-semibold text-slate-500">{record.role} · {record.state}</p>
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-600 dark:text-slate-300">{record.payPeriod}</td>
                    <td className="px-5 py-4 text-right">
                      <InlineTipCell
                        record={record}
                        onSave={(id, declaredTips) => mutation.mutate({ action: "update_declared", id, declaredTips })}
                      />
                    </td>
                    <td className="px-5 py-4 text-right font-mono text-slate-500">{currency.format(record.allocatedTips)}</td>
                    <td className="px-5 py-4 text-right font-mono font-black text-slate-900 dark:text-white">{currency.format(record.totalTips)}</td>
                    <td className="px-5 py-4 text-right font-mono text-red-600">{currency.format(record.ficaOnTips)}</td>
                    <td className="px-5 py-4 text-right font-mono font-black text-emerald-600">{currency.format(record.netTipCredit)}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-black text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {record.source}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "8846" && (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-6 flex items-start justify-between gap-4 border-b border-slate-200 pb-6 dark:border-slate-800">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">FICA Tip Credit Calculator</h2>
                <p className="mt-1 text-sm text-slate-500">Form 8846 credit on employer FICA for tips above the federal minimum wage threshold.</p>
              </div>
              <button
                type="button"
                onClick={download8846}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
              >
                <Download size={16} />
                Export 8846 Data
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                <span className="font-bold text-slate-600 dark:text-slate-300">Total FICA paid</span>
                <span className="font-mono text-lg font-black text-slate-900 dark:text-white">{currency.format(summary?.totalFicaPaid ?? 0)}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                <span className="font-bold text-slate-600 dark:text-slate-300">Portion attributable to min wage</span>
                <span className="font-mono text-lg font-black text-amber-600">{currency.format(summary?.portionAttributableToMinimumWage ?? 0)}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900 dark:bg-emerald-950/30">
                <span className="font-black text-emerald-900 dark:text-emerald-200">Eligible credit</span>
                <span className="font-mono text-2xl font-black text-emerald-600">{currency.format(summary?.eligibleCredit ?? 0)}</span>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-black text-slate-900 dark:text-white">Employee Credit Detail</h3>
            <div className="mt-4 space-y-3">
              {rows.map((row) => (
                <div key={row.id} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{row.employeeName}</span>
                    <span className="font-mono text-sm font-black text-emerald-600">{currency.format(row.netTipCredit)}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Min wage portion: {currency.format(row.minimumWageTipPortion)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "8027" && form8027 && (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Form 8027</h2>
                <p className="mt-1 text-sm text-slate-500">Large food/beverage establishment tip allocation and PDF generation.</p>
              </div>
              <button
                type="button"
                onClick={generate8027Pdf}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800"
              >
                <Download size={16} />
                Generate Form 8027 PDF
              </button>
            </div>

            <div className="mt-6 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
              <label className="flex cursor-pointer items-center justify-between gap-4">
                <span>
                  <span className="block font-black text-slate-900 dark:text-white">
                    This is a large food/beverage establishment (10+ employees)
                  </span>
                  <span className="mt-1 block text-sm text-slate-500">Enable allocation method controls and 8% gross receipts tests.</span>
                </span>
                <input
                  type="checkbox"
                  checked={form8027.isLargeEstablishment}
                  onChange={(event) => mutation.mutate({ action: "set_8027", isLargeEstablishment: event.target.checked })}
                  className="h-5 w-5 rounded border-slate-300 text-blue-600"
                />
              </label>
            </div>

            <div className={`mt-5 grid gap-4 md:grid-cols-3 ${form8027.isLargeEstablishment ? "" : "pointer-events-none opacity-45"}`}>
              {[
                ["hours", "Hours-worked"],
                ["gross", "Gross receipts"],
                ["goodfaith", "Good faith"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => mutation.mutate({ action: "set_8027", allocationMethod: value })}
                  className={`rounded-xl border px-4 py-3 text-left text-sm font-black ${
                    form8027.allocationMethod === value
                      ? "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <button
              type="button"
              disabled={!form8027.isLargeEstablishment || mutation.isPending}
              onClick={() => mutation.mutate({ action: "auto_allocate_8027" })}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Settings size={16} />}
              Auto-allocate employees below 8%
            </button>

            <div className="mt-6">
              <h3 className="mb-3 font-black text-slate-900 dark:text-white">Employees below 8% of gross receipts</h3>
              <div className="space-y-2">
                {underReportedRows.length === 0 ? (
                  <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-sm font-bold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                    <CheckCircle2 size={16} />
                    All employees meet or exceed 8%.
                  </div>
                ) : (
                  underReportedRows.map((row) => (
                    <div key={row.id} className="flex items-center justify-between rounded-xl bg-amber-50 p-3 text-sm dark:bg-amber-950/30">
                      <span className="font-bold text-amber-900 dark:text-amber-200">{row.employeeName}</span>
                      <span className="font-mono font-black text-amber-700">{percent.format(row.declaredTips / row.grossReceipts)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-black text-slate-900 dark:text-white">8027 Status</h3>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Gross receipts</span>
                <span className="font-mono font-bold">{currency.format(form8027.grossReceipts)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">8% threshold</span>
                <span className="font-mono font-bold">{currency.format(form8027.eightPercentThreshold)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Declared tips</span>
                <span className="font-mono font-bold">{currency.format(form8027.totalDeclaredTips)}</span>
              </div>
              <div className="border-t border-slate-200 pt-4 dark:border-slate-800">
                {form8027.needsAllocation ? (
                  <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 font-bold text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
                    <AlertTriangle size={17} className="mt-0.5 shrink-0" />
                    Allocation shortfall of {currency.format(form8027.allocationShortfall)}.
                  </div>
                ) : (
                  <div className="flex items-start gap-2 rounded-xl bg-emerald-50 p-3 font-bold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                    <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
                    No 8027 allocation required.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "pools" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Tip Pool Management</h2>
              <p className="mt-1 text-sm text-slate-500">Per-pay-period distributions and overrides.</p>
            </div>
            <button
              type="button"
              onClick={() => setPoolModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
            >
              <Plus size={16} />
              Create Tip Pool
            </button>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {(data?.tipPools ?? []).map((pool) => (
              <div key={pool.id} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-black text-slate-900 dark:text-white">{pool.name}</h3>
                    <p className="mt-1 text-xs font-bold uppercase text-slate-400">{pool.payPeriod}</p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-black uppercase text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                    {pool.status}
                  </span>
                </div>
                <div className="mt-5 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Distribution</span>
                    <span className="font-bold capitalize">{pool.distributionMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Pool amount</span>
                    <span className="font-mono font-black text-blue-600">{currency.format(pool.poolAmount)}</span>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-black uppercase tracking-wide text-slate-400">Overrides</p>
                    <div className="space-y-2">
                      {pool.participatingEmployeeIds.map((employeeId) => {
                        const employee = employees.find((item) => item.id === employeeId);
                        const override = pool.overrides[employeeId] ?? 0;
                        return (
                          <div key={employeeId} className="flex items-center justify-between gap-3">
                            <span className="truncate text-slate-600 dark:text-slate-300">{employee?.name ?? employeeId}</span>
                            <input
                              type="number"
                              min={0}
                              defaultValue={override || ""}
                              placeholder="Auto"
                              onBlur={(event) =>
                                mutation.mutate({
                                  action: "update_pool_override",
                                  poolId: pool.id,
                                  employeeId,
                                  amount: Number(event.target.value || 0),
                                })
                              }
                              className="h-8 w-24 rounded-lg border border-slate-200 bg-white px-2 text-right text-xs font-mono dark:border-slate-700 dark:bg-slate-950"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                {pool.complianceFlag && (
                  <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
                    <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                    {pool.complianceFlag}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {poolModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Create Tip Pool</h2>
              <button type="button" onClick={() => setPoolModalOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4 p-6">
              <input
                value={newPool.name}
                onChange={(event) => setNewPool((pool) => ({ ...pool, name: event.target.value }))}
                placeholder="Pool name"
                className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950"
              />
              <div className="grid gap-3 md:grid-cols-2">
                <select
                  value={newPool.distributionMethod}
                  onChange={(event) => setNewPool((pool) => ({ ...pool, distributionMethod: event.target.value as TipPool["distributionMethod"] }))}
                  className="h-11 rounded-xl border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950"
                >
                  <option value="hours">Hours worked</option>
                  <option value="points">Points</option>
                  <option value="percentage">Percentage</option>
                </select>
                <input
                  type="number"
                  value={newPool.poolAmount || ""}
                  onChange={(event) => setNewPool((pool) => ({ ...pool, poolAmount: Number(event.target.value || 0) }))}
                  placeholder="Pool amount"
                  className="h-11 rounded-xl border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950"
                />
              </div>
              <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                <p className="mb-3 text-xs font-black uppercase tracking-wide text-slate-400">Participating Employees</p>
                <div className="grid gap-2 md:grid-cols-2">
                  {employees.map((employee) => (
                    <label key={employee.id} className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                      <input
                        type="checkbox"
                        checked={newPool.participatingEmployeeIds.includes(employee.id)}
                        onChange={(event) => {
                          setNewPool((pool) => ({
                            ...pool,
                            participatingEmployeeIds: event.target.checked
                              ? [...pool.participatingEmployeeIds, employee.id]
                              : pool.participatingEmployeeIds.filter((id) => id !== employee.id),
                          }));
                        }}
                        className="rounded border-slate-300 text-blue-600"
                      />
                      {employee.name}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-950">
              <button type="button" onClick={() => setPoolModalOpen(false)} className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  mutation.mutate({ action: "create_pool", pool: newPool });
                  setPoolModalOpen(false);
                  setNewPool({ name: "", distributionMethod: "hours", participatingEmployeeIds: [], poolAmount: 0, state: "CA" });
                }}
                className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
              >
                Create Pool
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
