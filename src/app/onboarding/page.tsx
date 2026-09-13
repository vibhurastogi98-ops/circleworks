"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock, Loader2, Search, UserMinus, Users } from "lucide-react";
import { formatDate } from "@/utils/formatDate";

type OnboardingCase = {
  id: number;
  employeeId: number;
  templateId: number | null;
  templateName: string | null;
  status: string | null;
  startDate: string | null;
  createdAt: string | null;
  employeeName: string;
  email: string | null;
  avatar: string | null;
  department: string | null;
  jobTitle: string | null;
  taskTotal: number;
  taskCompleted: number;
  percent: number;
};

export default function OnboardingDashboard() {
  const [cases, setCases] = useState<OnboardingCase[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/onboarding/cases", { cache: "no-store", credentials: "include" });
      if (r.status === 401) { setErr("Please sign in."); return; }
      if (!r.ok) { setErr(`Failed (HTTP ${r.status})`); return; }
      const d = await r.json();
      setCases(d.cases ?? []);
      setErr(null);
    } catch { setErr("Network error"); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const filtered = useMemo(() => {
    return (cases ?? []).filter((c) => c.employeeName.toLowerCase().includes(search.toLowerCase()));
  }, [cases, search]);

  const active = cases?.length ?? 0;
  const avgPercent = useMemo(() => {
    if (!cases || cases.length === 0) return 0;
    return Math.round(cases.reduce((s, c) => s + c.percent, 0) / cases.length);
  }, [cases]);
  const tasksPending = useMemo(() => (cases ?? []).reduce((s, c) => s + Math.max(0, c.taskTotal - c.taskCompleted), 0), [cases]);
  const completedCount = useMemo(() => (cases ?? []).filter((c) => c.percent === 100).length, [cases]);

  if (cases === null && !err) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-medium">Loading onboarding pipeline...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Onboarding Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Every case created by <Link href="/hiring" className="text-blue-600 hover:underline">Hiring → Hire</Link> shows up here. Task completions persist per-case.</p>
        </div>
        <Link href="/onboarding/offboarding" className="flex items-center gap-2 px-4 py-2 border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/30">
          <UserMinus size={16} /> Start offboarding
        </Link>
      </div>

      {err && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">{err}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi icon={<Users size={20} />} color="blue" label="Active cases" value={String(active)} />
        <Kpi icon={<Clock size={20} />} color="amber" label="Tasks pending" value={String(tasksPending)} />
        <Kpi icon={<CheckCircle2 size={20} />} color="green" label="Avg completion" value={`${avgPercent}%`} />
        <Kpi icon={<AlertTriangle size={20} />} color="green" label="Complete" value={String(completedCount)} />
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
        <div className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search cases…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length > 0 ? filtered.map((c) => (
          <Link key={c.id} href={`/onboarding/${c.id}`} className="block group focus:outline-none">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-all hover:border-blue-300 dark:hover:border-blue-800 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                {c.avatar ? <img src={c.avatar} className="w-12 h-12 rounded-full border-2 border-white dark:border-slate-800 shadow-sm object-cover" alt="" /> : <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-bold">{c.employeeName.slice(0, 2)}</div>}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors truncate">{c.employeeName}</h3>
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <span>{c.department ?? c.jobTitle ?? "—"}</span>
                    {c.startDate && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                        <span>Starts {formatDate(c.startDate)}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">
                  {c.templateName ?? c.status ?? "Active"}
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{c.percent}%</span>
              </div>

              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${c.percent === 100 ? "bg-green-500" : c.percent >= 60 ? "bg-blue-500" : "bg-amber-500"}`}
                  style={{ width: `${c.percent}%` }}
                />
              </div>

              <div className="text-xs text-slate-500 flex justify-between">
                <span>{c.taskCompleted} of {c.taskTotal} tasks complete</span>
                {c.taskTotal === 0 && <span className="text-slate-400">No template</span>}
              </div>
            </div>
          </Link>
        )) : (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
            <Users size={48} className="text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No onboarding cases</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">Cases are created when a candidate is hired via the Hiring module or when an employee is added.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Kpi({ icon, color, label, value }: { icon: React.ReactNode; color: "blue" | "amber" | "green"; label: string; value: string }) {
  const cls = color === "blue" ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" :
              color === "amber" ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400" :
              "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400";
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex items-start justify-between">
      <div>
        <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{label}</h4>
        <div className="text-2xl font-bold text-slate-900 dark:text-white">{value}</div>
      </div>
      <div className={`p-2 rounded-lg ${cls}`}>{icon}</div>
    </div>
  );
}
