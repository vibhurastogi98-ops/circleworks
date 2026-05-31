"use client";

import { useMemo, useState } from "react";
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

export default function PayMyselfPage() {
  const { currentCompany, payrollRunInProgress, setPayrollRunning } = usePlatformStore();
  const [annualSalary, setAnnualSalary] = useState(96000);
  const [schedule, setSchedule] = useState<PaySchedule>("Semi-monthly");
  const [autoPilot, setAutoPilot] = useState(true);

  const payrollPreview = useMemo(() => {
    const gross = annualSalary / schedulePeriods[schedule];
    const ownerWithholding = gross * 0.22;
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

  const runOwnerPayroll = () => {
    setPayrollRunning(true);
    window.setTimeout(() => setPayrollRunning(false), 1200);
    toast.success(`${money(payrollPreview.net)} owner payroll is queued for ${schedule.toLowerCase()} processing.`);
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
            disabled={payrollRunInProgress}
            className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-black text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-700 sm:w-auto"
          >
            <Play className="h-4 w-4" />
            {payrollRunInProgress ? "Running owner payroll" : "Run now"}
          </button>
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
            <h2 className="text-sm font-black text-slate-950 dark:text-white">Upcoming schedule</h2>
            <div className="mt-4 space-y-3">
              {["Jun 15", "Jun 30", "Jul 15"].map((date, index) => (
                <div key={date} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-950/60">
                  <span className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                    <CalendarDays className="h-4 w-4 text-slate-400" />
                    {date}
                  </span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {index === 0 ? "Ready" : autoPilot ? "AutoPilot" : "Manual"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
