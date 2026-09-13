"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Trash2, X, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

type Contract = {
  id: number;
  contractName: string;
  duesType: string;
  duesRate: number;
  pensionRate: number;
  healthWelfareRate: number;
  workDuesRate: number | null;
  effectiveDate: string;
  expirationDate: string | null;
  status: string | null;
};

type Union = {
  id: number;
  name: string;
  abbreviation: string | null;
  description: string | null;
  status: string | null;
  contracts: Contract[];
};

export default function PayrollUnionsSettingsPage() {
  const [unions, setUnions] = useState<Union[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [showAddUnion, setShowAddUnion] = useState(false);
  const [contractFor, setContractFor] = useState<Union | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/payroll/unions", { cache: "no-store", credentials: "include" });
      if (r.status === 401) { setErr("Please sign in."); return; }
      if (!r.ok) { setErr(`Failed (HTTP ${r.status})`); return; }
      const data = await r.json();
      setUnions(data.unions ?? []);
      setErr(null);
    } catch { setErr("Network error"); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function deleteUnion(id: number) {
    if (!confirm("Remove this union and all its contracts?")) return;
    const r = await fetch(`/api/payroll/unions?id=${id}`, { method: "DELETE", credentials: "include" });
    if (!r.ok) { toast.error("delete_failed"); return; }
    toast.success("Union removed.");
    void load();
  }

  async function deleteContract(id: number) {
    if (!confirm("Remove this contract?")) return;
    const r = await fetch(`/api/payroll/unions/contracts?id=${id}`, { method: "DELETE", credentials: "include" });
    if (!r.ok) { toast.error("delete_failed"); return; }
    toast.success("Contract removed.");
    void load();
  }

  return (
    <div className="flex max-w-5xl animate-in flex-col gap-6 fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-blue-600" />
            Payroll Unions
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Configure unions, contract terms, dues, pension &amp; health/welfare rates.</p>
        </div>
        <button onClick={() => setShowAddUnion(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold">
          <Plus size={16} /> New Union
        </button>
      </div>

      {err && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">{err}</div>
      )}

      {!unions && !err && <p className="text-sm text-slate-500">Loading…</p>}
      {unions?.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
          No unions configured. Click <strong>New Union</strong> to add one.
        </div>
      )}

      {unions?.map((u) => (
        <div key={u.id} className="rounded-xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-black text-slate-950 dark:text-white">{u.name} {u.abbreviation ? <span className="ml-2 text-slate-400 font-bold text-sm">({u.abbreviation})</span> : null}</h2>
              {u.description && <p className="mt-1 text-sm text-slate-500">{u.description}</p>}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setContractFor(u)} className="text-sm font-bold text-blue-600 hover:underline">+ Contract</button>
              <button onClick={() => deleteUnion(u.id)} className="p-2 text-slate-400 hover:text-red-600" aria-label="Delete union"><Trash2 size={16} /></button>
            </div>
          </div>
          <div className="p-5">
            {u.contracts.length === 0 ? (
              <p className="text-sm text-slate-500">No contracts on this union yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-xs uppercase text-slate-500">
                  <tr>
                    <th className="pb-2 text-left">Contract</th>
                    <th className="pb-2 text-right">Dues</th>
                    <th className="pb-2 text-right">Pension</th>
                    <th className="pb-2 text-right">H&amp;W</th>
                    <th className="pb-2 text-right">Effective</th>
                    <th className="pb-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {u.contracts.map((c) => (
                    <tr key={c.id}>
                      <td className="py-2 font-bold text-slate-900 dark:text-white">{c.contractName}</td>
                      <td className="py-2 text-right">{c.duesType === "flat" ? `$${c.duesRate}` : `${c.duesRate}%`}</td>
                      <td className="py-2 text-right">{c.pensionRate}%</td>
                      <td className="py-2 text-right">{c.healthWelfareRate}%</td>
                      <td className="py-2 text-right text-slate-500">{c.effectiveDate}{c.expirationDate ? ` – ${c.expirationDate}` : ""}</td>
                      <td className="py-2 text-right">
                        <button onClick={() => deleteContract(c.id)} className="p-1.5 text-slate-400 hover:text-red-600" aria-label="Delete contract"><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ))}

      {showAddUnion && <AddUnionModal onClose={() => setShowAddUnion(false)} onDone={() => { setShowAddUnion(false); void load(); }} />}
      {contractFor && <AddContractModal union={contractFor} onClose={() => setContractFor(null)} onDone={() => { setContractFor(null); void load(); }} />}
    </div>
  );
}

const inputCls = "w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm";

function AddUnionModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [name, setName] = useState("");
  const [abbr, setAbbr] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!name.trim()) { toast.error("Name is required"); return; }
    setBusy(true);
    const r = await fetch("/api/payroll/unions", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, abbreviation: abbr, description }),
    });
    setBusy(false);
    const data = await r.json().catch(() => ({}));
    if (!r.ok) { toast.error(data.error || "create_failed"); return; }
    toast.success("Union added.");
    onDone();
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-lg font-black text-slate-900 dark:text-white">New Union</h3>
          <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
        </div>
        <div className="p-5 flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm"><span className="font-bold text-slate-600 dark:text-slate-300">Name</span><input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="e.g. SAG-AFTRA" /></label>
          <label className="flex flex-col gap-1 text-sm"><span className="font-bold text-slate-600 dark:text-slate-300">Abbreviation</span><input value={abbr} onChange={(e) => setAbbr(e.target.value)} className={inputCls} placeholder="e.g. SAG" /></label>
          <label className="flex flex-col gap-1 text-sm"><span className="font-bold text-slate-600 dark:text-slate-300">Description (optional)</span><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className={inputCls} /></label>
        </div>
        <div className="p-5 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600">Cancel</button>
          <button onClick={submit} disabled={busy || !name.trim()} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-bold rounded-lg">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

function AddContractModal({ union, onClose, onDone }: { union: Union; onClose: () => void; onDone: () => void }) {
  const [contractName, setContractName] = useState("");
  const [duesType, setDuesType] = useState<"percentage" | "flat">("percentage");
  const [duesRate, setDuesRate] = useState("");
  const [pensionRate, setPensionRate] = useState("");
  const [healthWelfareRate, setHealthWelfareRate] = useState("");
  const [workDuesRate, setWorkDuesRate] = useState("0");
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().slice(0, 10));
  const [expirationDate, setExpirationDate] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!contractName.trim() || !duesRate || !pensionRate || !healthWelfareRate) {
      toast.error("All rate fields are required");
      return;
    }
    setBusy(true);
    const r = await fetch("/api/payroll/unions/contracts", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        unionId: union.id, contractName, duesType,
        duesRate: Number(duesRate), pensionRate: Number(pensionRate),
        healthWelfareRate: Number(healthWelfareRate), workDuesRate: Number(workDuesRate),
        effectiveDate, expirationDate: expirationDate || null,
      }),
    });
    setBusy(false);
    const data = await r.json().catch(() => ({}));
    if (!r.ok) { toast.error(data.error || "create_failed"); return; }
    toast.success("Contract added.");
    onDone();
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-lg font-black text-slate-900 dark:text-white">Contract for {union.name}</h3>
          <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
        </div>
        <div className="p-5 grid gap-3 md:grid-cols-2 text-sm">
          <label className="md:col-span-2 flex flex-col gap-1"><span className="font-bold text-slate-600 dark:text-slate-300">Contract name</span><input value={contractName} onChange={(e) => setContractName(e.target.value)} className={inputCls} /></label>
          <label className="flex flex-col gap-1"><span className="font-bold text-slate-600 dark:text-slate-300">Dues type</span><select value={duesType} onChange={(e) => setDuesType(e.target.value as "percentage" | "flat")} className={inputCls}><option value="percentage">Percentage</option><option value="flat">Flat</option></select></label>
          <label className="flex flex-col gap-1"><span className="font-bold text-slate-600 dark:text-slate-300">Dues rate {duesType === "flat" ? "($)" : "(%)"}</span><input type="number" step="0.01" value={duesRate} onChange={(e) => setDuesRate(e.target.value)} className={inputCls} /></label>
          <label className="flex flex-col gap-1"><span className="font-bold text-slate-600 dark:text-slate-300">Pension rate (%)</span><input type="number" step="0.01" value={pensionRate} onChange={(e) => setPensionRate(e.target.value)} className={inputCls} /></label>
          <label className="flex flex-col gap-1"><span className="font-bold text-slate-600 dark:text-slate-300">Health &amp; welfare (%)</span><input type="number" step="0.01" value={healthWelfareRate} onChange={(e) => setHealthWelfareRate(e.target.value)} className={inputCls} /></label>
          <label className="flex flex-col gap-1"><span className="font-bold text-slate-600 dark:text-slate-300">Work dues (%)</span><input type="number" step="0.01" value={workDuesRate} onChange={(e) => setWorkDuesRate(e.target.value)} className={inputCls} /></label>
          <label className="flex flex-col gap-1"><span className="font-bold text-slate-600 dark:text-slate-300">Effective date</span><input type="date" value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)} className={inputCls} /></label>
          <label className="flex flex-col gap-1"><span className="font-bold text-slate-600 dark:text-slate-300">Expiration (optional)</span><input type="date" value={expirationDate} onChange={(e) => setExpirationDate(e.target.value)} className={inputCls} /></label>
        </div>
        <div className="p-5 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600">Cancel</button>
          <button onClick={submit} disabled={busy} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-bold rounded-lg">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Add Contract
          </button>
        </div>
      </div>
    </div>
  );
}
