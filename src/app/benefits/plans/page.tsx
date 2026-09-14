"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Building2, Edit3, Loader2, Plus, Shield, Trash2, X } from "lucide-react";
import { toast } from "sonner";

type PlanType = "medical" | "dental" | "vision" | "life" | "disability" | "hsa" | "fsa" | "401k" | "cobra";
type Plan = {
  id: number;
  name: string;
  type: string;
  category: string | null;
  carrier: string | null;
  planType: string | null;
  employeePremium: number | null;
  employerPremium: number | null;
  deductible: number | null;
  outOfPocketMax: number | null;
  monthlyCost: number | null;
  effectiveStart: string | null;
  effectiveEnd: string | null;
};

const TYPES: PlanType[] = ["medical", "dental", "vision", "life", "disability", "hsa", "fsa", "401k", "cobra"];

function money(n: number | null | undefined) { return `$${(n ?? 0).toLocaleString()}`; }

export default function BenefitsPlansPage() {
  const [plans, setPlans] = useState<Plan[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Plan | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/benefits/plans", { cache: "no-store", credentials: "include" });
      if (r.status === 401) { setErr("Please sign in."); return; }
      if (!r.ok) { setErr(`Failed (HTTP ${r.status})`); return; }
      const d = await r.json();
      setPlans(d.plans ?? []);
      setErr(null);
    } catch { setErr("Network error"); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  async function remove(p: Plan) {
    if (!confirm(`Delete plan "${p.name}"? Existing enrollments will cascade.`)) return;
    const r = await fetch(`/api/benefits/plans?id=${p.id}`, { method: "DELETE", credentials: "include" });
    if (!r.ok) { toast.error("delete_failed"); return; }
    toast.success("Plan removed.");
    void load();
  }

  const byType = useMemo(() => {
    const m = new Map<string, Plan[]>();
    for (const p of plans ?? []) {
      const list = m.get(p.type) ?? [];
      list.push(p);
      m.set(p.type, list);
    }
    return m;
  }, [plans]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-300">Benefits</p>
          <h1 className="text-2xl font-black text-slate-950 dark:text-white flex items-center gap-2"><Shield className="h-6 w-6 text-blue-600" /> Plans</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Health, dental, vision, life, and retirement plan definitions.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/benefits/enrollment" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800">Enrollment</Link>
          <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm font-bold text-white"><Plus size={16} /> New plan</button>
        </div>
      </div>

      {err && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">{err}</div>}
      {!plans && !err && <p className="text-sm text-slate-500">Loading…</p>}
      {plans?.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">No plans configured. Click <strong>New plan</strong> to add one.</div>
      )}

      {[...byType.entries()].map(([type, group]) => (
        <section key={type}>
          <h2 className="mb-2 text-sm font-black uppercase tracking-wider text-slate-500">{type}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {group.map((p) => (
              <div key={p.id} className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-black text-slate-950 dark:text-white">{p.name}</h3>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1"><Building2 size={12} /> {p.carrier ?? "—"}{p.planType ? ` · ${p.planType}` : ""}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setEditing(p)} className="p-1.5 text-slate-400 hover:text-blue-600" aria-label="Edit"><Edit3 size={16} /></button>
                    <button onClick={() => remove(p)} className="p-1.5 text-slate-400 hover:text-red-600" aria-label="Delete"><Trash2 size={16} /></button>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <Field label="Employee premium" value={`${money(p.employeePremium)}/mo`} />
                  <Field label="Employer premium" value={`${money(p.employerPremium)}/mo`} />
                  <Field label="Deductible" value={money(p.deductible)} />
                  <Field label="Out-of-pocket max" value={money(p.outOfPocketMax)} />
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      {(showCreate || editing) && (
        <PlanModal initial={editing} onClose={() => { setShowCreate(false); setEditing(null); }} onSaved={() => { setShowCreate(false); setEditing(null); void load(); }} />
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-2">
      <p className="text-[10px] font-bold uppercase text-slate-500">{label}</p>
      <p className="mt-0.5 font-bold text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}

function PlanModal({ initial, onClose, onSaved }: { initial: Plan | null; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState<PlanType>((initial?.type as PlanType) ?? "medical");
  const [carrier, setCarrier] = useState(initial?.carrier ?? "");
  const [planType, setPlanType] = useState(initial?.planType ?? "");
  const [employeePremium, setEmployeePremium] = useState(String(initial?.employeePremium ?? ""));
  const [employerPremium, setEmployerPremium] = useState(String(initial?.employerPremium ?? ""));
  const [deductible, setDeductible] = useState(String(initial?.deductible ?? ""));
  const [outOfPocketMax, setOutOfPocketMax] = useState(String(initial?.outOfPocketMax ?? ""));
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!name.trim()) { toast.error("Name required"); return; }
    setBusy(true);
    const method = initial ? "PATCH" : "POST";
    const body = {
      id: initial?.id,
      name, type, carrier: carrier || null, planType: planType || null,
      employeePremium: Number(employeePremium) || 0,
      employerPremium: Number(employerPremium) || 0,
      deductible: Number(deductible) || 0,
      outOfPocketMax: Number(outOfPocketMax) || 0,
    };
    const r = await fetch("/api/benefits/plans", { method, credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setBusy(false);
    const d = await r.json().catch(() => ({}));
    if (!r.ok) { toast.error(d.error || `save_failed_${r.status}`); return; }
    toast.success(initial ? "Plan updated" : "Plan created");
    onSaved();
  }

  const input = "w-full h-10 rounded-lg border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white";
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-lg font-black text-slate-950 dark:text-white">{initial ? "Edit plan" : "New plan"}</h3>
          <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
        </div>
        <div className="p-5 grid gap-3 md:grid-cols-2 text-sm">
          <label className="md:col-span-2 flex flex-col gap-1"><span className="font-bold text-slate-600 dark:text-slate-300">Plan name</span><input value={name} onChange={(e) => setName(e.target.value)} className={input} placeholder="e.g. Aetna Silver PPO" /></label>
          <label className="flex flex-col gap-1"><span className="font-bold text-slate-600 dark:text-slate-300">Type</span>
            <select value={type} onChange={(e) => setType(e.target.value as PlanType)} className={input}>{TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</select>
          </label>
          <label className="flex flex-col gap-1"><span className="font-bold text-slate-600 dark:text-slate-300">Plan structure</span><input value={planType} onChange={(e) => setPlanType(e.target.value)} className={input} placeholder="e.g. PPO / HMO / HSA-eligible" /></label>
          <label className="md:col-span-2 flex flex-col gap-1"><span className="font-bold text-slate-600 dark:text-slate-300">Carrier</span><input value={carrier} onChange={(e) => setCarrier(e.target.value)} className={input} placeholder="e.g. Aetna, Delta Dental" /></label>
          <label className="flex flex-col gap-1"><span className="font-bold text-slate-600 dark:text-slate-300">Employee premium (per month)</span><input type="number" value={employeePremium} onChange={(e) => setEmployeePremium(e.target.value)} className={input} /></label>
          <label className="flex flex-col gap-1"><span className="font-bold text-slate-600 dark:text-slate-300">Employer premium (per month)</span><input type="number" value={employerPremium} onChange={(e) => setEmployerPremium(e.target.value)} className={input} /></label>
          <label className="flex flex-col gap-1"><span className="font-bold text-slate-600 dark:text-slate-300">Deductible</span><input type="number" value={deductible} onChange={(e) => setDeductible(e.target.value)} className={input} /></label>
          <label className="flex flex-col gap-1"><span className="font-bold text-slate-600 dark:text-slate-300">Out-of-pocket max</span><input type="number" value={outOfPocketMax} onChange={(e) => setOutOfPocketMax(e.target.value)} className={input} /></label>
        </div>
        <div className="p-5 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600">Cancel</button>
          <button onClick={submit} disabled={busy || !name.trim()} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-2 text-sm font-bold text-white">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {initial ? "Save" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
