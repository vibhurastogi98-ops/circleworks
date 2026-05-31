"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Download,
  FileText,
  Percent,
  Receipt,
  ShieldCheck,
} from "lucide-react";

type TaxForm = {
  name: string;
  description: string;
  due: string;
  status: "Ready" | "Draft" | "Upcoming";
};

const forms: TaxForm[] = [
  {
    name: "1040-ES",
    description: "Quarterly estimated owner tax vouchers",
    due: "Jun 15, 2026",
    status: "Ready",
  },
  {
    name: "1099-NEC",
    description: "Contractor forms for eligible 1099 payments",
    due: "Jan 31, 2027",
    status: "Draft",
  },
  {
    name: "W-2",
    description: "Owner-employee wage and withholding statement",
    due: "Jan 31, 2027",
    status: "Draft",
  },
  {
    name: "Form 941",
    description: "Quarterly federal payroll tax return",
    due: "Jul 31, 2026",
    status: "Upcoming",
  },
];

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function statusClasses(status: TaxForm["status"]) {
  if (status === "Ready") return "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300";
  if (status === "Draft") return "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300";
  return "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300";
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">{children}</label>;
}

export default function CreatorTaxesPage() {
  const [annualRevenue, setAnnualRevenue] = useState(240000);
  const [businessExpenses, setBusinessExpenses] = useState(72000);
  const [ownerSalary, setOwnerSalary] = useState(96000);
  const [withholding, setWithholding] = useState(18000);

  const estimate = useMemo(() => {
    const profitAfterSalary = Math.max(0, annualRevenue - businessExpenses - ownerSalary);
    const selfEmploymentTax = profitAfterSalary * 0.9235 * 0.153;
    const federalIncomeTax = profitAfterSalary * 0.18;
    const stateEstimate = profitAfterSalary * 0.05;
    const totalEstimatedTax = selfEmploymentTax + federalIncomeTax + stateEstimate;
    const remaining = Math.max(0, totalEstimatedTax - withholding);
    return {
      profitAfterSalary,
      selfEmploymentTax,
      federalIncomeTax,
      stateEstimate,
      totalEstimatedTax,
      remaining,
      quarterlyPayment: remaining / 4,
      effectiveRate: profitAfterSalary ? Math.round((totalEstimatedTax / profitAfterSalary) * 100) : 0,
    };
  }, [annualRevenue, businessExpenses, ownerSalary, withholding]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-bold text-blue-600 dark:text-blue-300">Creator taxes</p>
            <h1 className="mt-1 text-2xl font-black text-slate-950 dark:text-white">Taxes</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Estimate quarterly payments, track payroll tax filings, and keep 1099/W-2 forms ready.
            </p>
          </div>
          <button className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800">
            <Download className="h-4 w-4" /> Export packet
          </button>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
              <Percent className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-black text-slate-950 dark:text-white">Quarterly estimated-tax helper</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Preview remaining safe-harbor payments for the current year.</p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <FieldLabel>Annual creator revenue</FieldLabel>
              <input
                type="number"
                value={annualRevenue}
                onChange={(event) => setAnnualRevenue(Number(event.target.value))}
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-950 outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <FieldLabel>Business expenses</FieldLabel>
              <input
                type="number"
                value={businessExpenses}
                onChange={(event) => setBusinessExpenses(Number(event.target.value))}
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-950 outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <FieldLabel>Owner payroll salary</FieldLabel>
              <input
                type="number"
                value={ownerSalary}
                onChange={(event) => setOwnerSalary(Number(event.target.value))}
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-950 outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <FieldLabel>Withholding already paid</FieldLabel>
              <input
                type="number"
                value={withholding}
                onChange={(event) => setWithholding(Number(event.target.value))}
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-950 outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
              <p className="text-xs font-bold uppercase text-slate-400">Taxable profit</p>
              <p className="mt-2 text-xl font-black text-slate-950 dark:text-white">{money(estimate.profitAfterSalary)}</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
              <p className="text-xs font-bold uppercase text-slate-400">Estimated tax</p>
              <p className="mt-2 text-xl font-black text-slate-950 dark:text-white">{money(estimate.totalEstimatedTax)}</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
              <p className="text-xs font-bold uppercase text-slate-400">Quarterly payment</p>
              <p className="mt-2 text-xl font-black text-slate-950 dark:text-white">{money(estimate.quarterlyPayment)}</p>
            </div>
          </div>

          <div className="mt-5 rounded-lg bg-slate-50 p-4 dark:bg-slate-950/60">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-black text-slate-950 dark:text-white">Q2 voucher</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Effective estimate: {estimate.effectiveRate}% after owner salary and expenses.
                </p>
              </div>
              <span className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-black text-white">
                Pay {money(estimate.quarterlyPayment)}
              </span>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-black text-slate-950 dark:text-white">Safe harbor tracker</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Based on current-year estimate</p>
              </div>
            </div>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div className="h-full w-[72%] rounded-full bg-emerald-500" />
            </div>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">72% of estimated annual obligation covered by withholding and vouchers.</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-sm font-black text-slate-950 dark:text-white">Quarter dates</h2>
            <div className="mt-4 space-y-3">
              {["Apr 15", "Jun 15", "Sep 15", "Jan 15"].map((date, index) => (
                <div key={date} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-950/60">
                  <span className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                    <CalendarDays className="h-4 w-4 text-slate-400" />
                    {date}
                  </span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    Q{index + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-100 p-5 dark:border-slate-800">
          <h2 className="text-base font-black text-slate-950 dark:text-white">1099/W-2 forms</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Creator payroll and contractor forms in one filing queue.</p>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {forms.map((form) => (
            <div key={form.name} className="grid gap-3 p-5 md:grid-cols-[180px_minmax(0,1fr)_160px_120px] md:items-center">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                  {form.name === "1099-NEC" ? <Receipt className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                </span>
                <p className="font-black text-slate-950 dark:text-white">{form.name}</p>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">{form.description}</p>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{form.due}</p>
              <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-black ${statusClasses(form.status)}`}>
                {form.status}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
