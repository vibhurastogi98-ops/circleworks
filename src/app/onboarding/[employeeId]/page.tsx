"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Briefcase, CheckCircle2, ChevronLeft, Circle, Loader2, Monitor, User, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/utils/formatDate";

// The route folder is /onboarding/[employeeId] for legacy reasons — the
// param is now interpreted as a case id. Renaming the folder is a follow-up.

type Task = {
  id: number;
  title: string;
  assigneeRole: string | null;
  dueOffsetDays: number | null;
  sortOrder: number | null;
  completed: boolean;
  completedAt: string | null;
};

type CaseInfo = {
  id: number;
  templateId: number | null;
  employeeId: number | null;
  status: string | null;
  startDate: string | null;
};

const ROLE_ICON: Record<string, React.ElementType> = {
  HR: UserCheck,
  Manager: Briefcase,
  IT: Monitor,
  Employee: User,
};
const ROLE_COLOR: Record<string, string> = {
  HR: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Manager: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  IT: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Employee: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

function addDays(base: Date, days: number) {
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return next;
}

export default function IndividualOnboarding() {
  const params = useParams();
  const caseId = Number(params.employeeId);
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [caseInfo, setCaseInfo] = useState<CaseInfo | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [toggling, setToggling] = useState<number | null>(null);

  const load = useCallback(async () => {
    if (!Number.isInteger(caseId)) { setErr("Invalid case id"); return; }
    try {
      const r = await fetch(`/api/onboarding/cases/${caseId}/tasks`, { cache: "no-store", credentials: "include" });
      if (r.status === 401) { setErr("Please sign in."); return; }
      if (r.status === 404) { setErr("Onboarding case not found."); return; }
      if (!r.ok) { setErr(`Failed (HTTP ${r.status})`); return; }
      const d = await r.json();
      setCaseInfo(d.case ?? null);
      setTasks(d.tasks ?? []);
      setErr(null);
    } catch { setErr("Network error"); }
  }, [caseId]);

  useEffect(() => { void load(); }, [load]);

  async function toggle(task: Task) {
    const next = !task.completed;
    setToggling(task.id);
    // Optimistic UI update; roll back on failure so state stays consistent
    // with what the server actually persisted.
    setTasks((prev) => prev?.map((t) => t.id === task.id ? { ...t, completed: next } : t) ?? null);
    const r = await fetch(`/api/onboarding/cases/${caseId}/tasks`, {
      method: "PATCH", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId: task.id, completed: next }),
    });
    setToggling(null);
    if (!r.ok) {
      setTasks((prev) => prev?.map((t) => t.id === task.id ? { ...t, completed: task.completed } : t) ?? null);
      const d = await r.json().catch(() => ({}));
      toast.error(d.error || "toggle_failed");
      return;
    }
    void load();
  }

  if (err) return <div className="p-12 text-center text-sm text-red-600">{err}</div>;
  if (tasks === null || !caseInfo) return <div className="p-12 text-center text-slate-500"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></div>;

  const completed = tasks.filter((t) => t.completed).length;
  const total = tasks.length || 1;
  const pct = Math.round((completed / total) * 100);
  const startBase = caseInfo.startDate ? new Date(`${caseInfo.startDate}T00:00:00`) : new Date();

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-4xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-2">
          <Link href="/onboarding" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors w-fit">
            <ChevronLeft size={16} /> Dashboard
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Case #{caseInfo.id}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {caseInfo.startDate ? <>Starts {formatDate(caseInfo.startDate)}</> : "No start date on file"}
              {caseInfo.templateId === null && <> · No template</>}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Completion</p>
          <p className="text-3xl font-black text-slate-950 dark:text-white">{pct}%</p>
          <p className="text-xs text-slate-500">{completed} of {tasks.length} tasks</p>
        </div>
      </div>

      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${pct === 100 ? "bg-green-500" : pct >= 60 ? "bg-blue-500" : "bg-amber-500"}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {tasks.length === 0 && (
        <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <p className="text-sm text-slate-500">No tasks configured for this case's template.</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {tasks.map((t) => {
          const RoleIcon = ROLE_ICON[t.assigneeRole ?? "HR"] ?? UserCheck;
          const roleColor = ROLE_COLOR[t.assigneeRole ?? "HR"] ?? ROLE_COLOR.HR;
          const due = t.dueOffsetDays !== null ? addDays(startBase, t.dueOffsetDays ?? 0) : null;
          return (
            <div key={t.id} className={`flex items-center gap-4 p-4 rounded-xl border shadow-sm ${t.completed ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/30" : "bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800"}`}>
              <button
                onClick={() => toggle(t)}
                disabled={toggling === t.id}
                aria-label={t.completed ? "Mark incomplete" : "Mark complete"}
                className="flex-shrink-0 disabled:opacity-50"
              >
                {toggling === t.id ? <Loader2 className="h-6 w-6 animate-spin text-slate-400" /> :
                  t.completed ? <CheckCircle2 className="h-6 w-6 text-emerald-600" /> :
                  <Circle className="h-6 w-6 text-slate-300 hover:text-slate-500" />}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${roleColor}`}>
                    <RoleIcon size={10} /> {t.assigneeRole ?? "HR"}
                  </span>
                  <p className={`font-bold ${t.completed ? "text-slate-500 line-through dark:text-slate-500" : "text-slate-900 dark:text-white"}`}>{t.title}</p>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {due ? <>Due {formatDate(due.toISOString())}</> : "No due date"}
                  {t.completed && t.completedAt && <> · Completed {formatDate(t.completedAt)}</>}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
