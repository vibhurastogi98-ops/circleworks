"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  Wallet,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Download,
  Settings,
  Plus,
  ArrowUpRight,
  Loader2,
  X,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import EmptyState from "@/components/EmptyState";
import { ExpensesEmptyIllustration } from "@/components/StateIllustrations";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import ResponsiveContainer from "@/components/charts/MeasuredResponsiveContainer";

const COLORS = ["#6366f1", "#a855f7", "#ec4899", "#f97316", "#eab308", "#22c55e"];

type Stats = {
  pendingReports: number;
  pendingAmount: number;
  totalReports: number;
  violationCount: number;
  categoryData: { name: string; value: number }[];
};

type ReportRow = {
  id: number;
  title: string;
  status: string;
  totalAmount: number;
  submittedAt: string | null;
  approvedAt: string | null;
  reimbursedAt: string | null;
  createdAt: string | null;
  employeeId: number | null;
  employeeFirst: string | null;
  employeeLast: string | null;
};

type NewItem = { date: string; merchant: string; category: string; amount: string };

const CATEGORIES = ["Travel", "Meals", "Software", "Office", "Marketing", "Training", "Other"];

function money(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(n);
}

function NewReportModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const today = new Date().toISOString().slice(0, 10);
  const [title, setTitle] = useState("");
  const [items, setItems] = useState<NewItem[]>([{ date: today, merchant: "", category: "Travel", amount: "" }]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function updateItem(i: number, patch: Partial<NewItem>) {
    setItems((rows) => rows.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
  }
  function addItem() {
    setItems((rows) => [...rows, { date: today, merchant: "", category: "Travel", amount: "" }]);
  }
  function removeItem(i: number) {
    setItems((rows) => rows.filter((_, idx) => idx !== i));
  }

  async function submit(submitForApproval: boolean) {
    setErr(null);
    setBusy(true);
    try {
      const cleaned = items
        .filter((it) => it.merchant.trim() && it.category.trim() && it.date && Number(it.amount) > 0)
        .map((it) => ({ ...it, amount: Math.round(Number(it.amount)) }));
      const r = await fetch("/api/expenses", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, items: cleaned, submit: submitForApproval }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setErr(data.error || `create_failed_${r.status}`);
        return;
      }
      toast.success(submitForApproval ? "Report submitted for approval" : "Draft saved");
      onDone();
      onClose();
    } finally {
      setBusy(false);
    }
  }

  const total = items.reduce((s, it) => s + (Number(it.amount) || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => e.preventDefault()}
        className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 max-h-[90vh] overflow-y-auto"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900 dark:text-white">New expense report</h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>
        <label className="text-xs font-bold uppercase text-slate-500">Title
          <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. September travel" className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
        </label>
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-500">Items</span>
            <button type="button" onClick={addItem} className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
              <Plus size={12} /> Add item
            </button>
          </div>
          {items.map((it, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-950/60">
              <input type="date" value={it.date} onChange={(e) => updateItem(i, { date: e.target.value })} className="col-span-3 rounded border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-950" />
              <input placeholder="Merchant" value={it.merchant} onChange={(e) => updateItem(i, { merchant: e.target.value })} className="col-span-3 rounded border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-950" />
              <select value={it.category} onChange={(e) => updateItem(i, { category: e.target.value })} className="col-span-3 rounded border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-950">
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
              <input type="number" min={0} step={1} placeholder="$" value={it.amount} onChange={(e) => updateItem(i, { amount: e.target.value })} className="col-span-2 rounded border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-950" />
              <button type="button" onClick={() => removeItem(i)} disabled={items.length === 1} className="col-span-1 flex items-center justify-center rounded text-slate-400 hover:text-red-600 disabled:opacity-30"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-slate-500">Total</span>
          <span className="font-black text-slate-900 dark:text-white">{money(total)}</span>
        </div>
        {err && <div className="mt-3 rounded border border-red-300 bg-red-50 p-2 text-xs text-red-800 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">{err}</div>}
        <div className="mt-5 flex gap-2">
          <button type="button" disabled={busy || !title} onClick={() => submit(false)} className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">Save draft</button>
          <button type="button" disabled={busy || !title} onClick={() => submit(true)} className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50">
            {busy ? <Loader2 size={14} className="animate-spin" /> : null}
            Submit for approval
          </button>
        </div>
      </form>
    </div>
  );
}

export default function ExpensesOverview() {
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [reports, setReports] = useState<ReportRow[] | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [approving, setApproving] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/expenses", { cache: "no-store", credentials: "include" });
      if (r.status === 401) { setLoadErr("Please sign in."); return; }
      if (!r.ok) { setLoadErr(`Failed (HTTP ${r.status})`); return; }
      const data = await r.json();
      setStats(data.stats);
      setReports(data.reports);
      setLoadErr(null);
    } catch { setLoadErr("Network error"); }
  }, []);

  useEffect(() => { setMounted(true); void load(); }, [load]);

  async function approveAllSubmitted() {
    if (!reports) return;
    const submitted = reports.filter((r) => r.status === "Submitted");
    if (submitted.length === 0) {
      toast.info("Nothing pending approval.");
      return;
    }
    setApproving(true);
    let ok = 0;
    let fail = 0;
    for (const rpt of submitted) {
      const r = await fetch(`/api/expenses/${rpt.id}/approve`, { method: "POST", credentials: "include" });
      if (r.ok) ok++;
      else fail++;
    }
    setApproving(false);
    if (fail === 0) toast.success(`Approved ${ok} report${ok === 1 ? "" : "s"}.`);
    else toast.error(`Approved ${ok}, ${fail} failed.`);
    void load();
  }

  const hasExpenses = stats
    ? stats.pendingReports > 0 || stats.pendingAmount > 0 || stats.totalReports > 0 || stats.categoryData.length > 0
    : false;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Wallet size={22} className="text-white" />
            </div>
            Expenses Overview
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 ml-[52px]">
            Manage employee reimbursements and corporate spend policies.
          </p>
        </div>
        <div className="flex items-center gap-3 ml-[52px] sm:ml-0 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto">
          <button className="flex-shrink-0 flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">
            <Download size={16} /> Export Report
          </button>
          <Link href="/expenses/policies" className="flex-shrink-0 flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">
            <Settings size={16} /> Policies
          </Link>
          <button onClick={() => setShowNew(true)} className="flex-shrink-0 flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">
            <Plus size={16} /> New report
          </button>
          <button onClick={approveAllSubmitted} disabled={approving} className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-indigo-600 border border-indigo-500 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/20 active:scale-95 disabled:opacity-50">
            {approving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={16} />} Approve All
          </button>
        </div>
      </div>

      {loadErr && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">
          {loadErr}
        </div>
      )}

      {!stats && !loadErr && <div className="text-sm text-slate-500">Loading…</div>}

      {stats && !hasExpenses && (
        <EmptyState
          illustration={<ExpensesEmptyIllustration />}
          title="No expenses yet"
          description="Create your first report to get started."
          cta={{ label: "New report", onClick: () => setShowNew(true) }}
        />
      )}

      {stats && hasExpenses && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Clock size={20} />
                </div>
                <Link href="/expenses/reports?status=Submitted" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5">
                  View All <ArrowRight size={12} />
                </Link>
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">{stats.pendingReports}</div>
              <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">Reports Pending Approval</div>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <BarChart3 size={20} />
                </div>
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">{money(stats.pendingAmount)}</div>
              <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">Pending Reimbursement</div>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm border-l-4 border-l-amber-500">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <AlertTriangle size={20} />
                </div>
              </div>
              <div className="text-3xl font-black text-amber-600 dark:text-amber-400 mb-1">{stats.violationCount}</div>
              <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">Policy Violations Detected</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                Category Distribution
              </h3>
              <div className="h-[300px] w-full">
                {mounted && stats.categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                    <PieChart>
                      <Pie data={stats.categoryData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value" label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}>
                        {stats.categoryData.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px", color: "#fff" }} itemStyle={{ color: "#fff" }} />
                      <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm text-slate-500">No categorized items yet.</div>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Recent reports</h3>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {reports?.slice(0, 6).map((r) => (
                  <div key={r.id} className="flex items-center justify-between py-3 text-sm">
                    <div className="min-w-0">
                      <div className="truncate font-bold text-slate-900 dark:text-white">{r.title}</div>
                      <div className="text-xs text-slate-500">
                        {[r.employeeFirst, r.employeeLast].filter(Boolean).join(" ") || "—"} · {r.createdAt?.slice(0, 10) ?? "—"}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-900 dark:text-white">{money(r.totalAmount)}</span>
                      <span className="text-xs font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">{r.status}</span>
                    </div>
                  </div>
                ))}
                {(!reports || reports.length === 0) && (
                  <p className="text-xs text-slate-500 py-3">No reports yet.</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {showNew && <NewReportModal onClose={() => setShowNew(false)} onDone={load} />}
    </div>
  );
}

function Clock({ size = 24, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
