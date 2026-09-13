"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Calendar, Clock, Edit3, Loader2, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";

type Schedule = {
  id: number;
  name: string;
  frequency: string;
  cutoffHoursBeforeRun: number | null;
  isDefault: boolean | null;
};

const FREQ_OPTIONS = [
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Bi-weekly" },
  { value: "semi-monthly", label: "Semi-monthly" },
  { value: "monthly", label: "Monthly" },
];

function freqLabel(v: string) {
  return FREQ_OPTIONS.find((o) => o.value === v)?.label ?? v;
}

function previewPayPeriods(frequency: string) {
  const intervalDays = frequency === "weekly" ? 7 : frequency === "monthly" ? 30 : 14;
  return Array.from({ length: 6 }, (_, index) => {
    const payDate = new Date(Date.now() + (index + 1) * intervalDays * 24 * 60 * 60 * 1000);
    const start = new Date(payDate.getTime() - intervalDays * 24 * 60 * 60 * 1000);
    const end = new Date(payDate.getTime() - 24 * 60 * 60 * 1000);
    return { start, end, payDate };
  });
}

export default function PaySchedulesSettingsPage() {
  const [schedules, setSchedules] = useState<Schedule[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newFreq, setNewFreq] = useState("biweekly");
  const [newCutoffHours, setNewCutoffHours] = useState(24);
  const [newIsDefault, setNewIsDefault] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [editSchedule, setEditSchedule] = useState<Schedule | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Schedule | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/pay-schedules", { cache: "no-store", credentials: "include" });
      if (r.status === 401) { setErr("Please sign in."); return; }
      if (!r.ok) { setErr(`Failed (HTTP ${r.status})`); return; }
      const data = await r.json();
      setSchedules(data.schedules ?? []);
      setErr(null);
    } catch { setErr("Network error"); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function createSchedule() {
    setBusy("create");
    const r = await fetch("/api/pay-schedules", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, frequency: newFreq, cutoffHoursBeforeRun: newCutoffHours, isDefault: newIsDefault }),
    });
    setBusy(null);
    const data = await r.json().catch(() => ({}));
    if (!r.ok) { toast.error(data.error || "create_failed"); return; }
    toast.success(`Pay schedule "${newName}" created.`);
    setShowModal(false); setNewName(""); setNewCutoffHours(24); setNewIsDefault(false);
    void load();
  }

  async function updateSchedule() {
    if (!editSchedule) return;
    setBusy("update");
    const r = await fetch("/api/pay-schedules", {
      method: "PATCH", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editSchedule.id,
        name: editSchedule.name,
        frequency: editSchedule.frequency,
        cutoffHoursBeforeRun: editSchedule.cutoffHoursBeforeRun ?? 24,
        isDefault: editSchedule.isDefault ?? false,
      }),
    });
    setBusy(null);
    const data = await r.json().catch(() => ({}));
    if (!r.ok) { toast.error(data.error || "update_failed"); return; }
    toast.success(`Pay schedule "${editSchedule.name}" updated.`);
    setEditSchedule(null);
    void load();
  }

  async function deleteSchedule(id: number) {
    setBusy("delete");
    const r = await fetch(`/api/pay-schedules?id=${id}`, { method: "DELETE", credentials: "include" });
    setBusy(null);
    if (!r.ok) { const data = await r.json().catch(() => ({})); toast.error(data.error || "delete_failed"); return; }
    toast.success("Pay schedule removed.");
    setShowDeleteConfirm(null);
    void load();
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-5xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pay Schedules</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Configure how and when your employees are paid.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Plus size={16} /> New Schedule
        </button>
      </div>

      {err && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">{err}</div>
      )}

      {!schedules && !err && <p className="text-sm text-slate-500">Loading…</p>}
      {schedules?.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
          No pay schedules yet. Click <strong>New Schedule</strong> to create one.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {schedules?.map((schedule) => (
          <div key={schedule.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{schedule.name}</h3>
                  {schedule.isDefault && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500 font-medium">{freqLabel(schedule.frequency)}</p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setEditSchedule({ ...schedule })}
                  className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label="Edit"
                ><Edit3 size={16} /></button>
                {!schedule.isDefault && (
                  <button
                    onClick={() => setShowDeleteConfirm(schedule)}
                    className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30"
                    aria-label="Delete"
                  ><Trash2 size={16} /></button>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2 border-t border-slate-100 dark:border-slate-800 pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-1.5"><Clock size={14} /> Cutoff window</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">{schedule.cutoffHoursBeforeRun ?? 24} hours before run</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-1.5"><Calendar size={14} /> Frequency</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">{freqLabel(schedule.frequency)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowModal(false)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">New Pay Schedule</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400"><X size={20} /></button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Schedule Name</label>
                <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Salaried Semi-monthly" className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Frequency</label>
                <select value={newFreq} onChange={(e) => setNewFreq(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white">
                  {FREQ_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Cutoff Hours Before Run</label>
                <input type="number" min={1} value={newCutoffHours} onChange={(e) => setNewCutoffHours(Number(e.target.value))} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white" />
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <input type="checkbox" checked={newIsDefault} onChange={(e) => setNewIsDefault(e.target.checked)} />
                Make default (unsets any current default)
              </label>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                <h4 className="mb-3 text-xs font-black uppercase text-slate-500">Preview next 6 pay periods</h4>
                <div className="grid gap-2 text-xs">
                  {previewPayPeriods(newFreq).map((p, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 dark:bg-slate-900">
                      <span className="font-semibold text-slate-600 dark:text-slate-300">Period {i + 1}</span>
                      <span className="text-slate-500">{p.start.toLocaleDateString()} – {p.end.toLocaleDateString()} / pay {p.payDate.toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">Cancel</button>
              <button onClick={createSchedule} disabled={!newName || busy === "create"} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-bold rounded-lg inline-flex items-center gap-2">
                {busy === "create" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Create Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {editSchedule && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setEditSchedule(null)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit Schedule</h3>
              <button onClick={() => setEditSchedule(null)} className="text-slate-400"><X size={20} /></button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Schedule Name</label>
                <input value={editSchedule.name} onChange={(e) => setEditSchedule({ ...editSchedule, name: e.target.value })} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Frequency</label>
                <select value={editSchedule.frequency} onChange={(e) => setEditSchedule({ ...editSchedule, frequency: e.target.value })} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white">
                  {FREQ_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Cutoff Hours Before Run</label>
                <input type="number" min={1} value={editSchedule.cutoffHoursBeforeRun ?? 24} onChange={(e) => setEditSchedule({ ...editSchedule, cutoffHoursBeforeRun: Number(e.target.value) })} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white" />
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <input type="checkbox" checked={Boolean(editSchedule.isDefault)} onChange={(e) => setEditSchedule({ ...editSchedule, isDefault: e.target.checked })} />
                Default schedule
              </label>
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
              <button onClick={() => setEditSchedule(null)} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">Cancel</button>
              <button onClick={updateSchedule} disabled={!editSchedule.name || busy === "update"} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-bold rounded-lg inline-flex items-center gap-2">
                {busy === "update" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-sm">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={32} /></div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Delete Pay Schedule</h3>
              <p className="text-sm text-slate-500">Delete <span className="font-bold text-slate-900 dark:text-white">"{showDeleteConfirm.name}"</span>? Employees assigned to it will need to be re-assigned.</p>
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex gap-3">
              <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">Cancel</button>
              <button onClick={() => deleteSchedule(showDeleteConfirm.id)} disabled={busy === "delete"} className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl inline-flex items-center justify-center gap-2">
                {busy === "delete" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
