"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, Search, ShieldCheck, Users } from "lucide-react";

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
  employeeFirst: string | null;
  employeeLast: string | null;
};

function money(n: number | null | undefined) { return `$${(n ?? 0).toLocaleString()}`; }

const STATUS_CLASS: Record<string, string> = {
  Enrolled: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300",
  Pending: "bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300",
  Waived: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  Cancelled: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300",
};

export default function BenefitsEnrollmentLanding() {
  const [enrollments, setEnrollments] = useState<Enrollment[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/benefits/enrollments", { cache: "no-store", credentials: "include" });
      if (r.status === 401) { setErr("Please sign in."); return; }
      if (!r.ok) { setErr(`Failed (HTTP ${r.status})`); return; }
      const d = await r.json();
      setEnrollments(d.enrollments ?? []);
      setErr(null);
    } catch { setErr("Network error"); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const filtered = useMemo(() => (enrollments ?? []).filter((e) => `${e.employeeFirst ?? ""} ${e.employeeLast ?? ""} ${e.planName ?? ""}`.toLowerCase().includes(search.toLowerCase())), [enrollments, search]);

  const stats = useMemo(() => {
    const list = enrollments ?? [];
    return {
      total: list.length,
      enrolled: list.filter((e) => e.status === "Enrolled").length,
      waived: list.filter((e) => e.status === "Waived").length,
      monthlyEmployer: list.filter((e) => e.status === "Enrolled").reduce((s, e) => s + (e.employerMonthlyCost ?? 0), 0),
    };
  }, [enrollments]);

  // Group by employee for the per-employee roster
  const byEmployee = useMemo(() => {
    const m = new Map<number, { name: string; enrollments: Enrollment[] }>();
    for (const e of filtered) {
      const name = `${e.employeeFirst ?? ""} ${e.employeeLast ?? ""}`.trim() || `Employee ${e.employeeId}`;
      const entry = m.get(e.employeeId) ?? { name, enrollments: [] };
      entry.enrollments.push(e);
      m.set(e.employeeId, entry);
    }
    return [...m.entries()];
  }, [filtered]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-300">Benefits</p>
          <h1 className="text-2xl font-black text-slate-950 dark:text-white flex items-center gap-2"><ShieldCheck className="h-6 w-6 text-blue-600" /> Enrollment roster</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Every active benefit enrollment in the workspace. Enroll or waive per-employee from the linked pages.</p>
        </div>
        <Link href="/benefits/plans" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800">Manage plans</Link>
      </div>

      {err && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">{err}</div>}

      <section className="grid gap-4 md:grid-cols-4">
        <Stat label="Total enrollments" value={String(stats.total)} />
        <Stat label="Enrolled" value={String(stats.enrolled)} />
        <Stat label="Waived" value={String(stats.waived)} />
        <Stat label="Employer cost / mo" value={money(stats.monthlyEmployer)} />
      </section>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search employee or plan" className="w-full h-10 rounded-lg border border-slate-200 pl-9 pr-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
        </div>
      </div>

      {!enrollments && !err && <p className="text-sm text-slate-500">Loading…</p>}
      {enrollments?.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
          <Users className="mx-auto mb-2 h-8 w-8" />
          No enrollments yet. Add employees to a plan by visiting <Link href="/benefits/enrollment/1" className="text-blue-600 hover:underline">their enrollment page</Link>.
        </div>
      )}

      <div className="flex flex-col gap-4">
        {byEmployee.map(([empId, entry]) => (
          <div key={empId} className="rounded-xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-black text-slate-950 dark:text-white">{entry.name}</h3>
              <Link href={`/benefits/enrollment/${empId}`} className="text-sm font-bold text-blue-600 hover:underline">Manage</Link>
            </div>
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-2">Plan</th>
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2">Coverage</th>
                  <th className="px-4 py-2 text-right">Employee $/mo</th>
                  <th className="px-4 py-2 text-right">Employer $/mo</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {entry.enrollments.map((e) => (
                  <tr key={e.id}>
                    <td className="px-4 py-2 font-bold text-slate-900 dark:text-white">{e.planName ?? "—"}</td>
                    <td className="px-4 py-2 text-slate-500 uppercase text-[10px]">{e.planType ?? "—"}</td>
                    <td className="px-4 py-2 text-slate-500">{e.coverageLevel ?? "—"}</td>
                    <td className="px-4 py-2 text-right">{money(e.employeeMonthlyCost)}</td>
                    <td className="px-4 py-2 text-right">{money(e.employerMonthlyCost)}</td>
                    <td className="px-4 py-2"><span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${STATUS_CLASS[e.status] ?? STATUS_CLASS.Pending}`}>{e.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-black text-slate-950 dark:text-white">{value}</p>
    </div>
  );
}
