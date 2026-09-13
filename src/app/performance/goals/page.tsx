"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, ChevronLeft, Loader2, Plus, Target, Trash2, X } from "lucide-react";
import { toast } from "sonner";

type GoalStatus = "on_track" | "at_risk" | "completed";
type Goal = {
  id: number;
  employeeId: number;
  title: string;
  description: string | null;
  targetDate: string | null;
  status: GoalStatus;
  progressPct: number;
  updatedAt: string | null;
  firstName: string | null;
  lastName: string | null;
};
type Employee = { id: number; firstName: string; lastName: string | null };

const STATUS_LABEL: Record<GoalStatus, string> = { on_track: "On track", at_risk: "At risk", completed: "Completed" };
const STATUS_CLASS: Record<GoalStatus, string> = {
  on_track: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300",
  at_risk: "bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300",
  completed: "bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-300",
};

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[] | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);

  const load = useCallback(async () => {
    try {
      const [gr, er] = await Promise.all([
        fetch("/api/performance/goals", { cache: "no-store", credentials: "include" }),
        fetch("/api/employees", { cache: "no-store", credentials: "include" }),
      ]);
      if (gr.status === 401) { setErr("Please sign in."); return; }
      if (!gr.ok) { setErr(`Failed (HTTP ${gr.status})`); return; }
      const gd = await gr.json();
      setGoals(gd.goals ?? []);
      if (er.ok) {
        const ed = await er.json();
        const list = Array.isArray(ed) ? ed : ed.employees ?? [];
        setEmployees(list.map((e: { id: number; firstName?: string; lastName?: string | null }) => ({
          id: e.id, firstName: e.firstName ?? "", lastName: e.lastName ?? null,
        })));
      }
      setErr(null);
    } catch { setErr("Network error"); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function remove(g: Goal) {
    if (!confirm(`Delete goal "${g.title}"?`)) return;
    const r = await fetch(`/api/performance/goals?id=${g.id}`, { method: "DELETE", credentials: "include" });
    if (!r.ok) { toast.error("delete_failed"); return; }
    toast.success("Goal removed.");
    void load();
  }

  async function updateProgress(g: Goal, newProgress: number) {
    const r = await fetch("/api/performance/goals", {
      method: "PATCH", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: g.id, progressPct: newProgress }),
    });
    if (!r.ok) { toast.error("update_failed"); return; }
    void load();
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <Link href="/performance" className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 hover:underline"><ChevronLeft className="h-4 w-4" /> Performance</Link>

      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-black text-slate-950 dark:text-white"><Target className="h-6 w-6 text-blue-600" /> Goals</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Flat per-employee goals. For hierarchical OKRs, see <Link href="/performance/okrs" className="text-blue-600 hover:underline">OKRs</Link>.</p>
        </div>
        <button onClick={() => setShowCreate(true)} disabled={employees.length === 0} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-2 text-sm font-bold text-white">
          <Plus size={16} /> New goal
        </button>
      </section>

      {err && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">{err}</div>}
      {!goals && !err && <p className="text-sm text-slate-500">Loading…</p>}
      {goals?.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
          No goals yet. Click <strong>New goal</strong> to add one.
        </div>
      )}

      <div className="grid gap-4">
        {goals?.map((g) => (
          <div key={g.id} className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-slate-950 dark:text-white">{g.title}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${STATUS_CLASS[g.status]}`}>{STATUS_LABEL[g.status]}</span>
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {g.firstName} {g.lastName ?? ""} {g.targetDate && <>· due {g.targetDate}</>}
                </p>
                {g.description && <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{g.description}</p>}
              </div>
              <div className="flex gap-1">
                <button onClick={() => setEditing(g)} className="p-1.5 text-slate-400 hover:text-blue-600 text-sm font-bold">Edit</button>
                <button onClick={() => remove(g)} className="p-1.5 text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center gap-3">
                <input type="range" min={0} max={100} step={5} value={g.progressPct} onChange={(e) => updateProgress(g, Number(e.target.value))} className="flex-1" />
                <span className="w-12 text-right text-sm font-black text-slate-950 dark:text-white">{g.progressPct}%</span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className={`h-full ${g.status === "at_risk" ? "bg-amber-500" : g.status === "completed" ? "bg-blue-500" : "bg-emerald-500"}`} style={{ width: `${g.progressPct}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {(showCreate || editing) && (
        <GoalModal
          initial={editing}
          employees={employees}
          onClose={() => { setShowCreate(false); setEditing(null); }}
          onSaved={() => { setShowCreate(false); setEditing(null); void load(); }}
        />
      )}
    </div>
  );
}

function GoalModal({ initial, employees, onClose, onSaved }: { initial: Goal | null; employees: Employee[]; onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [employeeId, setEmployeeId] = useState(initial?.employeeId ?? employees[0]?.id ?? 0);
  const [targetDate, setTargetDate] = useState(initial?.targetDate ?? "");
  const [status, setStatus] = useState<GoalStatus>(initial?.status ?? "on_track");
  const [progressPct, setProgressPct] = useState(initial?.progressPct ?? 0);
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!title.trim()) { toast.error("Title required"); return; }
    if (!employeeId) { toast.error("Assign an employee"); return; }
    setBusy(true);
    const method = initial ? "PATCH" : "POST";
    const body = initial
      ? { id: initial.id, title, description, targetDate: targetDate || null, status, progressPct }
      : { employeeId, title, description, targetDate: targetDate || null, status, progressPct };
    const r = await fetch("/api/performance/goals", { method, credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setBusy(false);
    const d = await r.json().catch(() => ({}));
    if (!r.ok) { toast.error(d.error || `save_failed_${r.status}`); return; }
    toast.success(initial ? "Goal updated" : "Goal created");
    onSaved();
  }

  const inputCls = "w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm";
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-lg font-black text-slate-950 dark:text-white">{initial ? "Edit goal" : "New goal"}</h3>
          <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
        </div>
        <div className="p-5 flex flex-col gap-3 text-sm">
          <label className="flex flex-col gap-1"><span className="font-bold text-slate-600 dark:text-slate-300">Title</span><input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} /></label>
          {!initial && (
            <label className="flex flex-col gap-1"><span className="font-bold text-slate-600 dark:text-slate-300">Assign to</span>
              <select value={employeeId} onChange={(e) => setEmployeeId(Number(e.target.value))} className={inputCls}>
                {employees.length === 0 && <option value={0}>No employees available</option>}
                {employees.map((e) => <option key={e.id} value={e.id}>{e.firstName} {e.lastName ?? ""}</option>)}
              </select>
            </label>
          )}
          <label className="flex flex-col gap-1"><span className="font-bold text-slate-600 dark:text-slate-300">Description (optional)</span><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={inputCls} /></label>
          <label className="flex flex-col gap-1"><span className="font-bold text-slate-600 dark:text-slate-300">Target date</span><input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className={inputCls} /></label>
          <label className="flex flex-col gap-1"><span className="font-bold text-slate-600 dark:text-slate-300">Status</span>
            <select value={status} onChange={(e) => setStatus(e.target.value as GoalStatus)} className={inputCls}>
              <option value="on_track">On track</option>
              <option value="at_risk">At risk</option>
              <option value="completed">Completed</option>
            </select>
          </label>
          <label className="flex flex-col gap-1"><span className="font-bold text-slate-600 dark:text-slate-300">Progress ({progressPct}%)</span><input type="range" min={0} max={100} step={5} value={progressPct} onChange={(e) => setProgressPct(Number(e.target.value))} /></label>
        </div>
        <div className="p-5 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600">Cancel</button>
          <button onClick={submit} disabled={busy} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-2 text-sm font-bold text-white">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            {initial ? "Save" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
