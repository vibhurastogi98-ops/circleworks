"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  Download,
  FileText,
  Loader2,
  Percent,
  Plus,
  Receipt,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

// 2026 tax-year IRS estimated-tax due dates (Form 1040-ES).
// Q4 falls on Jan 15 of the following calendar year.
const ESTIMATED_TAX_DEADLINES_2026: { period: "Q1" | "Q2" | "Q3" | "Q4"; date: string; label: string }[] = [
  { period: "Q1", date: "2026-04-15", label: "Apr 15, 2026" },
  { period: "Q2", date: "2026-06-15", label: "Jun 15, 2026" },
  { period: "Q3", date: "2026-09-15", label: "Sep 15, 2026" },
  { period: "Q4", date: "2027-01-15", label: "Jan 15, 2027" },
];

type TaxForm = {
  name: string;
  description: string;
  due: string;
  status: "Ready" | "Draft" | "Upcoming";
};

const forms: TaxForm[] = [
  { name: "1040-ES",  description: "Quarterly estimated owner tax vouchers", due: "Jun 15, 2026", status: "Ready" },
  { name: "1099-NEC", description: "Contractor forms for eligible 1099 payments", due: "Jan 31, 2027", status: "Draft" },
  { name: "W-2",      description: "Owner-employee wage and withholding statement", due: "Jan 31, 2027", status: "Draft" },
  { name: "Form 941", description: "Quarterly federal payroll tax return", due: "Jul 31, 2026", status: "Upcoming" },
];

const QUARTER_META: { key: "Q1" | "Q2" | "Q3" | "Q4"; label: string; dueLabel: string }[] = [
  { key: "Q1", label: "Q1", dueLabel: "Apr 15" },
  { key: "Q2", label: "Q2", dueLabel: "Jun 15" },
  { key: "Q3", label: "Q3", dueLabel: "Sep 15" },
  { key: "Q4", label: "Q4", dueLabel: "Jan 15" },
];

type SetAsideState = {
  taxYear: number;
  totalYtd: number;
  byPeriod: Record<"Q1" | "Q2" | "Q3" | "Q4" | "ANNUAL", number>;
  entries: {
    id: number;
    taxYear: number;
    period: string;
    amount: number;
    note: string | null;
    createdAt: string;
    createdBy: number | null;
  }[];
};

function money(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
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
  const [inputsHydrated, setInputsHydrated] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const [setAsides, setSetAsides] = useState<SetAsideState | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [openContribute, setOpenContribute] = useState<"Q1" | "Q2" | "Q3" | "Q4" | null>(null);
  const [contribAmount, setContribAmount] = useState("");
  const [contribNote, setContribNote] = useState("");
  const [contribBusy, setContribBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const [saR, estR] = await Promise.all([
        fetch("/api/tax-set-asides", { cache: "no-store", credentials: "include" }),
        fetch("/api/tax-estimator", { cache: "no-store", credentials: "include" }),
      ]);
      if (saR.status === 401 || estR.status === 401) { setLoadErr("Please sign in."); return; }
      if (!saR.ok) { setLoadErr(`Failed (HTTP ${saR.status})`); return; }
      const sa = (await saR.json()) as SetAsideState;
      setSetAsides(sa);
      if (estR.ok) {
        const est = await estR.json();
        setAnnualRevenue(est.inputs.annualRevenue);
        setBusinessExpenses(est.inputs.businessExpenses);
        setOwnerSalary(est.inputs.ownerSalary);
        setWithholding(est.inputs.withholding);
      }
      setInputsHydrated(true);
      setLoadErr(null);
    } catch { setLoadErr("Network error"); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  // Debounced save whenever the estimator inputs change (after initial hydrate).
  useEffect(() => {
    if (!inputsHydrated) return;
    setSaveState("saving");
    const t = setTimeout(() => {
      fetch("/api/tax-estimator", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ annualRevenue, businessExpenses, ownerSalary, withholding }),
      })
        .then((r) => setSaveState(r.ok ? "saved" : "error"))
        .catch(() => setSaveState("error"));
    }, 600);
    return () => clearTimeout(t);
  }, [annualRevenue, businessExpenses, ownerSalary, withholding, inputsHydrated]);

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

  const totalCovered = (setAsides?.totalYtd ?? 0) + withholding;
  const safeHarborPct = estimate.totalEstimatedTax > 0
    ? Math.min(100, Math.round((totalCovered / estimate.totalEstimatedTax) * 100))
    : 0;

  async function submitContribution() {
    if (!openContribute) return;
    const amt = Math.round(Number(contribAmount));
    if (!Number.isFinite(amt) || amt <= 0) {
      toast.error("Enter a positive amount.");
      return;
    }
    setContribBusy(true);
    const r = await fetch("/api/tax-set-asides", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ period: openContribute, amount: amt, note: contribNote || null }),
    });
    const data = await r.json().catch(() => ({}));
    setContribBusy(false);
    if (!r.ok) {
      toast.error(data.error || `save_failed_${r.status}`);
      return;
    }
    toast.success(`Set aside ${money(amt)} for ${openContribute}.`);
    setOpenContribute(null);
    setContribAmount("");
    setContribNote("");
    void load();
  }

  async function removeEntry(id: number) {
    if (!confirm("Remove this set-aside entry?")) return;
    const r = await fetch(`/api/tax-set-asides?id=${id}`, { method: "DELETE", credentials: "include" });
    if (!r.ok) {
      const data = await r.json().catch(() => ({}));
      toast.error(data.error || `delete_failed_${r.status}`);
      return;
    }
    toast.success("Removed.");
    void load();
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-bold text-blue-600 dark:text-blue-300">Creator taxes</p>
            <h1 className="mt-1 text-2xl font-black text-slate-950 dark:text-white">Taxes</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Estimate quarterly payments, track set-aside contributions, and keep 1099/W-2 forms ready.
            </p>
          </div>
          <button className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800">
            <Download className="h-4 w-4" /> Export packet
          </button>
        </div>
      </section>

      {loadErr && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">
          {loadErr}
        </div>
      )}

      <EstimatedTaxDeadlines />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
              <Percent className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <h2 className="text-base font-black text-slate-950 dark:text-white">Quarterly estimated-tax helper</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Preview remaining safe-harbor payments for the current year.</p>
            </div>
            <span
              className={`ml-auto rounded-full px-2 py-0.5 text-[11px] font-bold ${
                saveState === "saving" ? "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400" :
                saveState === "saved"  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" :
                saveState === "error"  ? "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300" :
                                          "bg-slate-50 text-slate-500 dark:bg-slate-800/50 dark:text-slate-400"
              }`}
              title={saveState === "error" ? "Last save failed — retry by editing a field." : ""}
            >
              {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved" : saveState === "error" ? "Save failed" : "Ready"}
            </span>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <FieldLabel>Annual creator revenue</FieldLabel>
              <input type="number" value={annualRevenue} onChange={(e) => setAnnualRevenue(Number(e.target.value))} className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-950 outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
            </div>
            <div className="space-y-2">
              <FieldLabel>Business expenses</FieldLabel>
              <input type="number" value={businessExpenses} onChange={(e) => setBusinessExpenses(Number(e.target.value))} className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-950 outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
            </div>
            <div className="space-y-2">
              <FieldLabel>Owner payroll salary</FieldLabel>
              <input type="number" value={ownerSalary} onChange={(e) => setOwnerSalary(Number(e.target.value))} className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-950 outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
            </div>
            <div className="space-y-2">
              <FieldLabel>Withholding already paid</FieldLabel>
              <input type="number" value={withholding} onChange={(e) => setWithholding(Number(e.target.value))} className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-950 outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
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
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {setAsides ? `Set aside ${money(setAsides.totalYtd)} + withheld ${money(withholding)}` : "Loading…"}
                </p>
              </div>
            </div>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className={`h-full rounded-full transition-all ${safeHarborPct >= 90 ? "bg-emerald-500" : safeHarborPct >= 50 ? "bg-amber-500" : "bg-red-500"}`}
                style={{ width: `${safeHarborPct}%` }}
              />
            </div>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              {safeHarborPct}% of estimated annual obligation covered by withholding and set-asides.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-slate-950 dark:text-white">Quarter set-asides</h2>
              <span className="text-xs text-slate-400">{setAsides?.taxYear ?? "—"}</span>
            </div>
            <div className="mt-4 space-y-2">
              {QUARTER_META.map((q) => {
                const total = setAsides?.byPeriod[q.key] ?? 0;
                return (
                  <div key={q.key} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-950/60">
                    <span className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                      <CalendarDays className="h-4 w-4 text-slate-400" />
                      {q.label}
                      <span className="text-xs font-normal text-slate-400">due {q.dueLabel}</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <span className={`text-sm font-black ${total > 0 ? "text-slate-950 dark:text-white" : "text-slate-400"}`}>
                        {money(total)}
                      </span>
                      <button
                        type="button"
                        onClick={() => { setOpenContribute(q.key); setContribAmount(String(Math.round(estimate.quarterlyPayment) || 0)); }}
                        className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-2 py-1 text-xs font-black text-white hover:bg-blue-700"
                      >
                        <Plus className="h-3 w-3" /> Add
                      </button>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {setAsides && setAsides.entries.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-sm font-black text-slate-950 dark:text-white">Recent set-asides</h2>
              <ul className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
                {setAsides.entries.slice(0, 6).map((e) => (
                  <li key={e.id} className="flex items-center justify-between py-2 text-sm">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{money(e.amount)} · {e.period}</p>
                      <p className="text-xs text-slate-500">{new Date(e.createdAt).toLocaleDateString()}{e.note ? ` · ${e.note}` : ""}</p>
                    </div>
                    <button onClick={() => removeEntry(e.id)} className="text-slate-300 hover:text-red-500" aria-label="Remove"><Trash2 className="h-4 w-4" /></button>
                  </li>
                ))}
              </ul>
            </div>
          )}
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

      {openContribute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" onClick={() => !contribBusy && setOpenContribute(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
            <div className="mb-4 flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Set aside for {openContribute}</h2>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Records money you've moved into a tax reserve. Counts toward the safe-harbor tracker.
            </p>
            <div className="mt-4 space-y-3">
              <label className="text-xs font-bold uppercase text-slate-500">Amount (USD)
                <input type="number" min={1} value={contribAmount} onChange={(e) => setContribAmount(e.target.value)} className="mt-1 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-950 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
              </label>
              <label className="text-xs font-bold uppercase text-slate-500">Note (optional)
                <input value={contribNote} onChange={(e) => setContribNote(e.target.value)} placeholder="e.g. moved from operating to tax reserve" className="mt-1 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
              </label>
            </div>
            <div className="mt-5 flex gap-2">
              <button disabled={contribBusy} onClick={() => setOpenContribute(null)} className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">Cancel</button>
              <button disabled={contribBusy} onClick={submitContribution} className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50">
                {contribBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EstimatedTaxDeadlines() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const items = ESTIMATED_TAX_DEADLINES_2026.map((d) => {
    const dt = new Date(`${d.date}T00:00:00`);
    const diffMs = dt.getTime() - today.getTime();
    const daysUntil = Math.round(diffMs / 86400000);
    return { ...d, daysUntil };
  });
  const next = items.find((i) => i.daysUntil >= 0);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
          <Bell className="h-5 w-5" />
        </span>
        <div className="flex-1">
          <h2 className="text-base font-black text-slate-950 dark:text-white">2026 estimated-tax deadlines</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Federal 1040-ES quarterly due dates. Scheduled email reminders are not wired yet — check back here.
          </p>
        </div>
      </div>

      {next && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/40 dark:bg-amber-500/10">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
            Next deadline · {next.period}
          </p>
          <p className="mt-1 text-2xl font-black text-amber-900 dark:text-amber-100">
            {next.label}
          </p>
          <p className="mt-1 text-sm font-bold text-amber-800 dark:text-amber-200">
            {next.daysUntil === 0 ? "Due today" : next.daysUntil === 1 ? "1 day away" : `${next.daysUntil} days away`}
          </p>
        </div>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => {
          const past = item.daysUntil < 0;
          const isNext = next?.period === item.period;
          return (
            <div
              key={item.period}
              className={`rounded-lg border p-4 ${
                past
                  ? "border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-500"
                  : isNext
                    ? "border-amber-300 bg-amber-50 dark:border-amber-500/40 dark:bg-amber-500/10"
                    : "border-slate-200 dark:border-slate-800"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className={`text-sm font-black ${past ? "text-slate-400 dark:text-slate-500" : "text-slate-950 dark:text-white"}`}>
                  {item.period}
                </p>
                {past ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-black text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    <CheckCircle2 className="h-3 w-3" /> Done
                  </span>
                ) : (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {item.daysUntil === 0 ? "Today" : `${item.daysUntil}d`}
                  </span>
                )}
              </div>
              <p className={`mt-2 text-sm font-bold ${past ? "text-slate-400 dark:text-slate-500" : "text-slate-700 dark:text-slate-200"}`}>
                {item.label}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
