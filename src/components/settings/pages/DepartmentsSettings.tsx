"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Briefcase, Loader2, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";

type Department = {
  id: number;
  name: string;
  head: string | null;
  budgetCents: number;
};

function money(cents: number) {
  return cents ? `$${(cents / 100).toLocaleString()}` : "—";
}

export default function DepartmentsSettingsPage() {
  const [departments, setDepartments] = useState<Department[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [name, setName] = useState("");
  const [head, setHead] = useState("");
  const [budget, setBudget] = useState("");
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState<Department | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/departments", { cache: "no-store", credentials: "include" });
      if (r.status === 401) { setErr("Please sign in."); return; }
      if (!r.ok) { setErr(`Failed (HTTP ${r.status})`); return; }
      const data = await r.json();
      setDepartments(data.departments ?? []);
      setErr(null);
    } catch { setErr("Network error"); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  function openCreate() { setEditing(null); setName(""); setHead(""); setBudget(""); setShowModal(true); }
  function openEdit(d: Department) { setEditing(d); setName(d.name); setHead(d.head ?? ""); setBudget(String(d.budgetCents / 100)); setShowModal(true); }

  async function save() {
    if (!name.trim()) { toast.error("Name is required"); return; }
    setBusy(true);
    const method = editing ? "PATCH" : "POST";
    const body = editing
      ? { id: editing.id, name, head, budget: Number(budget) || 0 }
      : { name, head, budget: Number(budget) || 0 };
    const r = await fetch("/api/departments", { method, credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setBusy(false);
    const d = await r.json().catch(() => ({}));
    if (!r.ok) { toast.error(d.error === "name_in_use" ? "A department with that name already exists." : (d.error || `save_failed_${r.status}`)); return; }
    toast.success(editing ? `Department "${name}" updated.` : `Department "${name}" created.`);
    setShowModal(false);
    void load();
  }

  async function remove(d: Department) {
    const r = await fetch(`/api/departments?id=${d.id}`, { method: "DELETE", credentials: "include" });
    if (!r.ok) { toast.error("delete_failed"); return; }
    toast.success(`Department "${d.name}" removed.`);
    setDeleting(null);
    void load();
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-5xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Departments</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Org units used to group employees and route approvals.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold">
          <Plus size={16} /> New Department
        </button>
      </div>

      {err && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">{err}</div>
      )}

      {!departments && !err && <p className="text-sm text-slate-500">Loading…</p>}
      {departments?.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
          No departments yet. Click <strong>New Department</strong> to add one.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {departments?.map((d) => (
          <div key={d.id} className="rounded-xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 p-5 shadow-sm flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"><Briefcase className="h-5 w-5" /></span>
                <div>
                  <h3 className="text-base font-black text-slate-950 dark:text-white">{d.name}</h3>
                  <p className="text-xs text-slate-500">Head: {d.head ?? "Unassigned"}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(d)} className="p-1.5 text-slate-400 hover:text-blue-600" aria-label="Edit">Edit</button>
                <button onClick={() => setDeleting(d)} className="p-1.5 text-slate-400 hover:text-red-600" aria-label="Delete"><Trash2 size={16} /></button>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm border-t border-slate-100 dark:border-slate-800 pt-3">
              <span className="text-slate-500">Budget</span>
              <span className="font-bold text-slate-900 dark:text-white">{money(d.budgetCents)}</span>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowModal(false)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-black text-slate-950 dark:text-white">{editing ? "Edit department" : "New department"}</h3>
              <button onClick={() => setShowModal(false)}><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="p-5 flex flex-col gap-3">
              <label className="flex flex-col gap-1 text-sm"><span className="font-bold text-slate-600 dark:text-slate-300">Name</span><input value={name} onChange={(e) => setName(e.target.value)} className="w-full h-10 rounded-lg border border-slate-200 px-3 dark:border-slate-700 dark:bg-slate-950 dark:text-white" /></label>
              <label className="flex flex-col gap-1 text-sm"><span className="font-bold text-slate-600 dark:text-slate-300">Head (optional)</span><input value={head} onChange={(e) => setHead(e.target.value)} className="w-full h-10 rounded-lg border border-slate-200 px-3 dark:border-slate-700 dark:bg-slate-950 dark:text-white" placeholder="e.g. Priya Shah" /></label>
              <label className="flex flex-col gap-1 text-sm"><span className="font-bold text-slate-600 dark:text-slate-300">Annual budget (USD)</span><input type="number" step="0.01" value={budget} onChange={(e) => setBudget(e.target.value)} className="w-full h-10 rounded-lg border border-slate-200 px-3 dark:border-slate-700 dark:bg-slate-950 dark:text-white" placeholder="0" /></label>
            </div>
            <div className="p-5 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-slate-600">Cancel</button>
              <button onClick={save} disabled={busy || !name.trim()} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-bold rounded-lg">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {editing ? "Save" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleting && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-sm p-6">
            <p className="text-sm">Delete <strong>{deleting.name}</strong>?</p>
            <div className="mt-4 flex gap-2">
              <button onClick={() => setDeleting(null)} className="flex-1 px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">Cancel</button>
              <button onClick={() => remove(deleting)} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
