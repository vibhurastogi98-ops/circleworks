"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  DollarSign,
  Play,
  RefreshCw,
  WalletCards,
} from "lucide-react";
import { toast } from "sonner";

import { usePlatformStore } from "@/store/usePlatformStore";

type PaySchedule = "Weekly" | "Biweekly" | "Semi-monthly" | "Monthly";

const schedulePeriods: Record<PaySchedule, number> = {
  Weekly: 52,
  Biweekly: 26,
  "Semi-monthly": 24,
  Monthly: 12,
};

const scheduleOptions: PaySchedule[] = ["Weekly", "Biweekly", "Semi-monthly", "Monthly"];

type PayRun = {
  id: number;
  status: string;
  checkDate: string;
  gross: number;
  net: number;
  taxes: number;
  createdAt: string | null;
};

type PayMyselfState = {
  currentAnnualSalary: number;
  schedule: PaySchedule;
  history: PayRun[];
};

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function FieldLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor: string }) {
  return (
    <label htmlFor={htmlFor} className="text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">
      {children}
    </label>
  );
}

function statusChip(status: string) {
  const map: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
    processing: "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300",
    paid: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
    cancelled: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  };
  return map[status] ?? map.pending;
}

export default function PayMyselfPage() {
  const { currentCompany, payrollRunInProgress, setPayrollRunning } = usePlatformStore();
  const [annualSalary, setAnnualSalary] = useState(96000);
  const [schedule, setSchedule] = useState<PaySchedule>("Semi-monthly");
  const [autoPilot, setAutoPilot] = useState(true);
  const [state, setState] = useState<PayMyselfState | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/pay-myself", { cache: "no-store", credentials: "include" });
      if (r.status === 401) {
        setLoadErr("Please sign in as a creator to use Pay Myself.");
        return;
      }
      if (r.status === 403) {
        setLoadErr("Pay Myself is available on creator accounts only.");
        return;
      }
      if (!r.ok) {
        setLoadErr(`Failed to load (HTTP ${r.status}).`);
        return;
      }
      const data = (await r.json()) as PayMyselfState;
      setState(data);
      setLoadErr(null);
      if (data.currentAnnualSalary > 0) setAnnualSalary(data.currentAnnualSalary);
      if (data.schedule) setSchedule(data.schedule);
    } catch {
      setLoadErr("Network error loading Pay Myself.");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Poll while any run is in a non-terminal state.
  useEffect(() => {
    if (!state) return;
    const inFlight = state.history.some((r) => r.status === "pending" || r.status === "processing");
    if (!inFlight) return;
    const t = setInterval(() => void load(), 3000);
    return () => clearInterval(t);
  }, [state, load]);

  const payrollPreview = useMemo(() => {
    const gross = annualSalary / schedulePeriods[schedule];
    const ownerWithholding = gross * 0.2;
    const payrollTax = gross * 0.0765;
    const net = gross - ownerWithholding - payrollTax;
    return {
      gross,
      ownerWithholding,
      payrollTax,
      net,
      totalTax: ownerWithholding + payrollTax,
    };
  }, [annualSalary, schedule]);

  const runOwnerPayroll = async () => {
    setPayrollRunning(true);
    try {
      const r = await fetch("/api/pay-myself", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ annualSalary, schedule }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        toast.error(data.error ?? `Run failed (HTTP ${r.status}).`);
        return;
      }
      toast.success(`${money(data.run.net)} owner payroll queued. Will settle in a few seconds.`);
      await load();
    } catch {
      toast.error("Network error running payroll.");
    } finally {
      setPayrollRunning(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-bold text-blue-600 dark:text-blue-300">Creator payroll</p>
            <h1 className="mt-1 text-2xl font-black text-slate-950 dark:text-white">Pay Myself</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Set owner salary, choose the pay schedule, and run payroll for {currentCompany.name}.
            </p>
          </div>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-300">
            <CheckCircle2 className="mr-2 inline h-4 w-4" />
            Owner profile verified
          </div>
        </div>
      </section>

      {loadErr && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">
          {loadErr}
        </div>
      )}

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <FieldLabel htmlFor="owner-salary">Annual owner salary</FieldLabel>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="owner-salary"
                  type="number"
                  min={0}
                  step={1000}
                  value={annualSalary}
                  onChange={(event) => setAnnualSalary(Number(event.target.value))}
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm font-bold text-slate-950 outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <FieldLabel htmlFor="owner-pay-schedule">Pay schedule</FieldLabel>
              <div className="grid grid-cols-2 gap-2">
                {scheduleOptions.map((option) => (
                  <button
                    id={schedule === option ? "owner-pay-schedule" : undefined}
                    key={option}
                    type="button"
                    onClick={() => setSchedule(option)}
                    className={`h-11 rounded-lg border px-3 text-sm font-black transition ${
                      schedule === option
                        ? "border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-500/10 dark:text-blue-200"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <RefreshCw className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-black text-slate-950 dark:text-white">AutoPilot</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Repeat this owner-payroll setup every {schedule.toLowerCase()} period.
                  </p>
                </div>
              </div>
              <label className="inline-flex items-center gap-3">
                <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{autoPilot ? "On" : "Off"}</span>
                <input
                  type="checkbox"
                  aria-label="AutoPilot"
                  checked={autoPilot}
                  onChange={(event) => setAutoPilot(event.target.checked)}
                  className="sr-only"
                />
                <span
                  aria-hidden="true"
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                    autoPilot ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 rounded-full bg-white shadow transition ${
                      autoPilot ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </span>
              </label>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
              <p className="text-xs font-bold uppercase text-slate-400">Gross per run</p>
              <p className="mt-2 text-xl font-black text-slate-950 dark:text-white">{money(payrollPreview.gross)}</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
              <p className="text-xs font-bold uppercase text-slate-400">Taxes withheld</p>
              <p className="mt-2 text-xl font-black text-slate-950 dark:text-white">{money(payrollPreview.totalTax)}</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
              <p className="text-xs font-bold uppercase text-slate-400">Net deposit</p>
              <p className="mt-2 text-xl font-black text-slate-950 dark:text-white">{money(payrollPreview.net)}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={runOwnerPayroll}
            disabled={payrollRunInProgress || !!loadErr}
            className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-black text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-700 sm:w-auto"
          >
            <Play className="h-4 w-4" />
            {payrollRunInProgress ? "Running owner payroll" : "Run now"}
          </button>

          {state && state.history.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-3 text-sm font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Recent runs
              </h2>
              <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500 dark:bg-slate-950/60 dark:text-slate-400">
                    <tr>
                      <th className="px-3 py-2 text-left">Check date</th>
                      <th className="px-3 py-2 text-right">Gross</th>
                      <th className="px-3 py-2 text-right">Taxes</th>
                      <th className="px-3 py-2 text-right">Net</th>
                      <th className="px-3 py-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.history.map((r) => (
                      <tr key={r.id} className="border-t border-slate-100 dark:border-slate-800">
                        <td className="px-3 py-2 font-mono text-slate-700 dark:text-slate-200">{r.checkDate}</td>
                        <td className="px-3 py-2 text-right">{money(r.gross)}</td>
                        <td className="px-3 py-2 text-right">{money(r.taxes)}</td>
                        <td className="px-3 py-2 text-right font-bold">{money(r.net)}</td>
                        <td className="px-3 py-2">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold uppercase ${statusChip(r.status)}`}>
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                <WalletCards className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-black text-slate-950 dark:text-white">Next owner deposit</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">ACH-ready payroll preview</p>
              </div>
            </div>
            <p className="mt-5 text-3xl font-black text-slate-950 dark:text-white">{money(payrollPreview.net)}</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Estimated deposit after payroll taxes and withholding.</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-sm font-black text-slate-950 dark:text-white">Recent runs</h2>
            <div className="mt-4 space-y-3">
              {state?.history?.slice(0, 3).map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-950/60">
                  <span className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                    <CalendarDays className="h-4 w-4 text-slate-400" />
                    {r.checkDate}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase ${statusChip(r.status)}`}>
                    {r.status}
                  </span>
                </div>
              )) ?? (
                <p className="text-xs text-slate-500 dark:text-slate-400">No runs yet.</p>
              )}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
