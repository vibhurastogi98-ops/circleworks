"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, ChevronLeft, Loader2, ShieldCheck, X } from "lucide-react";
import { toast } from "sonner";

type Plan = {
  id: number;
  name: string;
  type: string;
  carrier: string | null;
  planType: string | null;
  employeePremium: number | null;
  employerPremium: number | null;
  deductible: number | null;
  outOfPocketMax: number | null;
};
type Enrollment = {
  id: number;
  employeeId: number;
  planId: number;
  status: string;
  coverageLevel: string | null;
  employeeMonthlyCost: number | null;
  employerMonthlyCost: number | null;
  planName: string | null;
  planType: string | null;
  planCarrier: string | null;
};

const COVERAGE = ["Employee", "Employee + Spouse", "Employee + Children", "Family"];

function money(n: number | null | undefined) { return `$${(n ?? 0).toLocaleString()}`; }

const STATUS_CLASS: Record<string, string> = {
  Enrolled: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300",
  Pending: "bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300",
  Waived: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  Cancelled: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300",
};

export default function EmployeeEnrollmentPage() {
  const params = useParams<{ employeeId: string }>();
  const employeeId = Number(params.employeeId);
  const [plans, setPlans] = useState<Plan[] | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [enrolling, setEnrolling] = useState<Plan | null>(null);

  const load = useCallback(async () => {
    if (!Number.isInteger(employeeId)) { setErr("Invalid employee id"); return; }
    try {
      const [pR, eR] = await Promise.all([
        fetch("/api/benefits/plans", { cache: "no-store", credentials: "include" }),
        fetch(`/api/benefits/enrollments?employeeId=${employeeId}`, { cache: "no-store", credentials: "include" }),
      ]);
      if (pR.status === 401) { setErr("Please sign in."); return; }
      if (!pR.ok || !eR.ok) { setErr(`Failed (HTTP ${pR.status}/${eR.status})`); return; }
      setPlans((await pR.json()).plans ?? []);
      setEnrollments((await eR.json()).enrollments ?? []);
      setErr(null);
    } catch { setErr("Network error"); }
  }, [employeeId]);
  useEffect(() => { void load(); }, [load]);

  async function updateStatus(en: Enrollment, status: string) {
    const r = await fetch("/api/benefits/enrollments", { method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: en.id, status }) });
    if (!r.ok) { toast.error("update_failed"); return; }
    toast.success(`Marked ${status.toLowerCase()}`);
    void load();
  }

  const activePlanIds = useMemo(() => new Set((enrollments ?? []).filter((e) => e.status === "Enrolled").map((e) => e.planId)), [enrollments]);
  const availablePlans = useMemo(() => (plans ?? []).filter((p) => !activePlanIds.has(p.id)), [plans, activePlanIds]);

  const totals = useMemo(() => {
    const active = (enrollments ?? []).filter((e) => e.status === "Enrolled");
    return {
      employee: active.reduce((s, e) => s + (e.employeeMonthlyCost ?? 0), 0),
      employer: active.reduce((s, e) => s + (e.employerMonthlyCost ?? 0), 0),
    };
  }, [enrollments]);

  if (err) return <div className="p-12 text-center text-sm text-red-600">{err}</div>;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <Link href="/benefits/enrollment" className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 hover:underline"><ChevronLeft className="h-4 w-4" /> Enrollment roster</Link>

      <div>
        <p className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-300">Employee #{employeeId}</p>
        <h1 className="text-2xl font-black text-slate-950 dark:text-white flex items-center gap-2"><ShieldCheck className="h-6 w-6 text-blue-600" /> Benefits enrollment</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Enroll in a plan or waive coverage. Premiums pulled from the plan definitions.</p>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-bold uppercase text-slate-500">Employee cost (active) / mo</p>
          <p className="mt-1 text-3xl font-black text-slate-950 dark:text-white">{money(totals.employee)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-bold uppercase text-slate-500">Employer cost (active) / mo</p>
          <p className="mt-1 text-3xl font-black text-slate-950 dark:text-white">{money(totals.employer)}</p>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-base font-black text-slate-950 dark:text-white">Current enrollments</h2>
        {!enrollments && <p className="text-sm text-slate-500">Loading…</p>}
        {enrollments?.length === 0 && <p className="text-sm text-slate-500">No enrollments yet.</p>}
        <div className="flex flex-col gap-3">
          {enrollments?.map((e) => (
            <div key={e.id} className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-4 shadow-sm flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="flex items-center gap-2">
                  <p className="font-black text-slate-950 dark:text-white">{e.planName}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${STATUS_CLASS[e.status] ?? STATUS_CLASS.Pending}`}>{e.status}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase mt-1">{e.planType} · {e.planCarrier ?? "—"} · {e.coverageLevel ?? "Employee"}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Employee / month</p>
                <p className="font-black text-slate-950 dark:text-white">{money(e.employeeMonthlyCost)}</p>
              </div>
              <div className="flex gap-2">
                {e.status === "Enrolled" && (
                  <button onClick={() => updateStatus(e, "Waived")} className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800">Waive</button>
                )}
                {e.status === "Waived" && (
                  <button onClick={() => updateStatus(e, "Enrolled")} className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white">Re-enroll</button>
                )}
                {e.status === "Pending" && (
                  <button onClick={() => updateStatus(e, "Enrolled")} className="rounded-lg bg-blue-600 hover:bg-blue-700 px-3 py-1.5 text-xs font-bold text-white">Confirm</button>
                )}
                {e.status !== "Cancelled" && (
                  <button onClick={() => updateStatus(e, "Cancelled")} className="rounded-lg border border-red-300 dark:border-red-500/40 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">Cancel</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-base font-black text-slate-950 dark:text-white">Available plans</h2>
        {!plans && <p className="text-sm text-slate-500">Loading…</p>}
        {plans?.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
            No plans configured. <Link href="/benefits/plans" className="text-blue-600 hover:underline">Create plans</Link> first.
          </div>
        )}
        {availablePlans.length === 0 && plans && plans.length > 0 && (
          <p className="text-sm text-slate-500">Enrolled in every available plan.</p>
        )}
        <div className="grid gap-3 md:grid-cols-2">
          {availablePlans.map((p) => (
            <div key={p.id} className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-black text-slate-950 dark:text-white">{p.name}</p>
                  <p className="text-xs text-slate-500 uppercase mt-1">{p.type} · {p.carrier ?? "—"}</p>
                </div>
                <button onClick={() => setEnrolling(p)} className="rounded-lg bg-blue-600 hover:bg-blue-700 px-3 py-1.5 text-xs font-bold text-white">Enroll</button>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <span className="text-slate-500">Employee: <span className="font-bold text-slate-900 dark:text-white">{money(p.employeePremium)}/mo</span></span>
                <span className="text-slate-500">Employer: <span className="font-bold text-slate-900 dark:text-white">{money(p.employerPremium)}/mo</span></span>
                <span className="text-slate-500">Deductible: <span className="font-bold text-slate-900 dark:text-white">{money(p.deductible)}</span></span>
                <span className="text-slate-500">OOP max: <span className="font-bold text-slate-900 dark:text-white">{money(p.outOfPocketMax)}</span></span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {enrolling && <EnrollModal plan={enrolling} employeeId={employeeId} onClose={() => setEnrolling(null)} onSaved={() => { setEnrolling(null); void load(); }} />}
    </div>
  );
}

function EnrollModal({ plan, employeeId, onClose, onSaved }: { plan: Plan; employeeId: number; onClose: () => void; onSaved: () => void }) {
  const [coverageLevel, setCoverageLevel] = useState(COVERAGE[0]);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    const r = await fetch("/api/benefits/enrollments", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ employeeId, planId: plan.id, coverageLevel, status: "Enrolled" }) });
    setBusy(false);
    const d = await r.json().catch(() => ({}));
    if (!r.ok) { toast.error(d.error === "already_enrolled" ? "Already enrolled in this plan." : (d.error || `enroll_failed_${r.status}`)); return; }
    toast.success("Enrolled ✓");
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-lg font-black text-slate-950 dark:text-white">Enroll in {plan.name}</h3>
          <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
        </div>
        <div className="p-5 flex flex-col gap-3 text-sm">
          <label className="flex flex-col gap-1"><span className="font-bold text-slate-600 dark:text-slate-300">Coverage level</span>
            <select value={coverageLevel} onChange={(e) => setCoverageLevel(e.target.value)} className="w-full h-10 rounded-lg border border-slate-200 px-3 dark:border-slate-700 dark:bg-slate-950 dark:text-white">
              {COVERAGE.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3 text-xs">
            <p className="text-slate-500">You'll pay <strong className="text-slate-900 dark:text-white">{money(plan.employeePremium)}/mo</strong>. Employer pays <strong className="text-slate-900 dark:text-white">{money(plan.employerPremium)}/mo</strong>. These come directly from the plan definition.</p>
          </div>
        </div>
        <div className="p-5 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600">Cancel</button>
          <button onClick={submit} disabled={busy} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-2 text-sm font-bold text-white">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            Enroll
          </button>
        </div>
      </div>
    </div>
  );
}
