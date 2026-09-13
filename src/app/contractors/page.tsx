"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Users, FileWarning, DollarSign, FileText, Search,
  UserPlus, AlertTriangle, CheckCircle2, Clock,
  Eye, ArrowUpRight, XCircle, X, CheckCheck, FilePlus2, Loader2,
} from "lucide-react";
import { formatDate } from "@/utils/formatDate";
import { toast } from "sonner";

/* ─── Types (mirror the /api/contractors response shape) ─────── */

type ContractorStatus = "Active" | "Pending" | "Inactive" | "Onboarding";
type W9Status = "Collected" | "Pending" | "Expired" | "Not Submitted";

type ContractorRow = {
  id: number;
  name: string;
  businessName: string | null;
  email: string;
  phone: string | null;
  status: ContractorStatus;
  w9Status: W9Status;
  ytdPayments: number | null;
  onboardingStep: string | null;
  contract: null | {
    id: number;
    title: string;
    endDate: string | null;
    daysUntilExpiry: number | null;
    type: string;
    rate: number;
    rateUnit: string | null;
  };
};

type Stats = {
  active: number;
  pendingW9: number;
  paymentsThisMonth: number;
  necs1099Due: number;
};

type PendingInvoice = {
  id: number;
  amount: number;
  invoiceNumber: string;
  contractorName: string;
  contractorId: number;
  submittedDate: string;
};

/* ─── Sub-Navigation ──────────────────────────────────────────── */

const SUB_NAV = [
  { label: "Dashboard", href: "/contractors" },
  { label: "Onboarding", href: "/contractors/onboarding" },
  { label: "Contracts", href: "/contractors/contracts" },
  { label: "Payments", href: "/contractors/payments" },
  { label: "1099s", href: "/contractors/1099s" },
  { label: "Contractor Portal", href: "/contractor-portal" },
];

function ContractorSubNav({ active }: { active: string }) {
  return (
    <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1.5 shadow-sm overflow-x-auto">
      {SUB_NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
            active === item.href
              ? "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 shadow-sm border border-orange-200 dark:border-orange-800"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}

export { ContractorSubNav, SUB_NAV };

/* ─── Stat Card ───────────────────────────────────────────────── */

function StatCard({ icon: Icon, iconBg, iconColor, label, value, subtext, href }: {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string | number;
  subtext?: string;
  href?: string;
}) {
  const content = (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-orange-300 dark:hover:border-orange-800 transition-all group cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon size={22} className={iconColor} />
        </div>
        {href && (
          <ArrowUpRight size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-orange-500 transition-colors" />
        )}
      </div>
      <p className="text-2xl font-black text-slate-900 dark:text-white">{value}</p>
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">{label}</p>
      {subtext && (
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{subtext}</p>
      )}
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

/* ─── Badges ──────────────────────────────────────────────────── */

function StatusBadge({ status }: { status: ContractorStatus }) {
  const config = {
    Active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    Pending: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    Inactive: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700",
    Onboarding: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  }[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${config}`}>
      {status}
    </span>
  );
}

function W9Badge({ status }: { status: string }) {
  const config: Record<string, string> = {
    Collected: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
    Pending: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
    Expired: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
    "Not Submitted": "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${config[status] || config["Not Submitted"]}`}>
      {status === "Collected" && <CheckCircle2 size={10} />}
      {status === "Pending" && <Clock size={10} />}
      {status === "Expired" && <AlertTriangle size={10} />}
      {status === "Not Submitted" && <XCircle size={10} />}
      {status}
    </span>
  );
}

/* ─── Modals ──────────────────────────────────────────────────── */

function InviteModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: "", businessName: "", email: "", phone: "" });
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const r = await fetch("/api/contractors", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "invite", ...form }),
    });
    const data = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) {
      toast.error(data.error || `Invite failed (HTTP ${r.status})`);
      return;
    }
    toast.success(`Invited ${form.email}`);
    onDone();
    onClose();
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900 dark:text-white">Invite contractor</h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="sm:col-span-2 text-xs font-bold uppercase text-slate-500">
            Email
            <input required type="email" value={form.email} onChange={(e) => setForm((s) => ({...s, email: e.target.value}))} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
          </label>
          <label className="text-xs font-bold uppercase text-slate-500">
            Full name
            <input value={form.name} onChange={(e) => setForm((s) => ({...s, name: e.target.value}))} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
          </label>
          <label className="text-xs font-bold uppercase text-slate-500">
            Business name
            <input value={form.businessName} onChange={(e) => setForm((s) => ({...s, businessName: e.target.value}))} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
          </label>
          <label className="sm:col-span-2 text-xs font-bold uppercase text-slate-500">
            Phone (optional)
            <input value={form.phone} onChange={(e) => setForm((s) => ({...s, phone: e.target.value}))} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
          </label>
        </div>
        <button disabled={busy} type="submit" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-orange-700 disabled:opacity-50">
          {busy ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
          {busy ? "Inviting…" : "Send invite"}
        </button>
      </form>
    </div>
  );
}

function ContractModal({ contractor, onClose, onDone }: { contractor: ContractorRow; onClose: () => void; onDone: () => void }) {
  const [busy, setBusy] = useState(false);
  const today = new Date().toISOString().slice(0, 10);
  const oneYear = new Date(Date.now() + 365 * 86_400_000).toISOString().slice(0, 10);
  const [form, setForm] = useState({
    title: `${contractor.name} — Services`,
    type: "Hourly",
    rate: 100,
    rateUnit: "/hr",
    startDate: today,
    endDate: oneYear,
    paymentTerms: "Net 30",
    activate: true,
  });
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const r = await fetch("/api/contractors", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create-contract", contractorId: contractor.id, ...form, rate: Math.round(Number(form.rate)) }),
    });
    const data = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) {
      toast.error(data.error || `Create failed (HTTP ${r.status})`);
      return;
    }
    toast.success(`Contract created for ${contractor.name}`);
    onDone();
    onClose();
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={submit} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900 dark:text-white">New contract — {contractor.name}</h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="sm:col-span-2 text-xs font-bold uppercase text-slate-500">Title
            <input required value={form.title} onChange={(e) => setForm((s) => ({...s, title: e.target.value}))} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
          </label>
          <label className="text-xs font-bold uppercase text-slate-500">Type
            <select value={form.type} onChange={(e) => setForm((s) => ({...s, type: e.target.value, rateUnit: e.target.value === "Hourly" ? "/hr" : "flat"}))} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white">
              <option>Hourly</option><option>Project</option><option>Retainer</option>
            </select>
          </label>
          <label className="text-xs font-bold uppercase text-slate-500">Rate ({form.rateUnit})
            <input required type="number" min={0} value={form.rate} onChange={(e) => setForm((s) => ({...s, rate: Number(e.target.value)}))} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
          </label>
          <label className="text-xs font-bold uppercase text-slate-500">Start date
            <input required type="date" value={form.startDate} onChange={(e) => setForm((s) => ({...s, startDate: e.target.value}))} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
          </label>
          <label className="text-xs font-bold uppercase text-slate-500">End date
            <input type="date" value={form.endDate} onChange={(e) => setForm((s) => ({...s, endDate: e.target.value}))} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
          </label>
          <label className="sm:col-span-2 text-xs font-bold uppercase text-slate-500">Payment terms
            <input value={form.paymentTerms} onChange={(e) => setForm((s) => ({...s, paymentTerms: e.target.value}))} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
          </label>
          <label className="sm:col-span-2 flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input type="checkbox" checked={form.activate} onChange={(e) => setForm((s) => ({...s, activate: e.target.checked}))} className="h-4 w-4 rounded border-slate-300" />
            Activate immediately (skip signature workflow)
          </label>
        </div>
        <button disabled={busy} type="submit" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-orange-700 disabled:opacity-50">
          {busy ? <Loader2 size={16} className="animate-spin" /> : <FilePlus2 size={16} />}
          {busy ? "Creating…" : "Create contract"}
        </button>
      </form>
    </div>
  );
}

/* ─── Main Dashboard ──────────────────────────────────────────── */

export default function ContractorsDashboard() {
  const [rows, setRows] = useState<ContractorRow[] | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [pending, setPending] = useState<PendingInvoice[]>([]);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [contractFor, setContractFor] = useState<ContractorRow | null>(null);

  const fmtMoney = (val: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(val);

  const load = useCallback(async () => {
    try {
      const [dashResp, invResp] = await Promise.all([
        fetch("/api/contractors?resource=dashboard", { cache: "no-store", credentials: "include" }),
        fetch("/api/contractors?resource=invoices&status=Pending", { cache: "no-store", credentials: "include" }),
      ]);
      if (!dashResp.ok) {
        setLoadErr(`Failed to load (HTTP ${dashResp.status})`);
        return;
      }
      const dash = await dashResp.json();
      setRows(dash.contractors ?? []);
      setStats(dash.stats ?? null);
      setLoadErr(null);
      if (invResp.ok) {
        const inv = await invResp.json();
        setPending(inv.invoices ?? []);
      }
    } catch {
      setLoadErr("Network error");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredContractors = useMemo(() => {
    if (!rows) return [];
    return rows.filter((c) => {
      const q = search.toLowerCase();
      const matchSearch =
        c.name.toLowerCase().includes(q) ||
        (c.businessName ?? "").toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q);
      const matchStatus = statusFilter === "All" || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [rows, search, statusFilter]);

  async function actOnInvoice(action: "approve-invoice" | "reject-invoice" | "request-revision", invoiceId: number) {
    const r = await fetch("/api/contractors", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, invoiceId }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      toast.error(data.error || `Action failed (HTTP ${r.status})`);
      return;
    }
    toast.success(action === "approve-invoice" ? "Invoice approved" : action === "reject-invoice" ? "Invoice rejected" : "Revision requested");
    void load();
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Users size={20} className="text-white" />
            </div>
            Contractor Hub
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 ml-[52px]">
            Manage 1099 contractors, contracts, invoices, and tax filings.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setInviteOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-orange-600/20 hover:shadow-orange-600/30"
          >
            <UserPlus size={16} /> Invite Contractor
          </button>
        </div>
      </div>

      <ContractorSubNav active="/contractors" />

      {loadErr && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">
          {loadErr}
        </div>
      )}

      {pending.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                <AlertTriangle size={18} className="text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-800 dark:text-amber-300">
                  {pending.length} invoice{pending.length > 1 ? "s" : ""} awaiting review
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Total: {fmtMoney(pending.reduce((s, i) => s + i.amount, 0))}
                </p>
              </div>
            </div>
            <Link href="/contractors/payments" className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-colors">
              Review Now
            </Link>
          </div>
          <div className="mt-3 divide-y divide-amber-200/50 dark:divide-amber-800/40 rounded-lg bg-white/60 dark:bg-slate-900/30">
            {pending.slice(0, 5).map((inv) => (
              <div key={inv.id} className="flex items-center justify-between px-3 py-2 text-sm">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-slate-500">{inv.invoiceNumber}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{inv.contractorName}</span>
                  <span className="text-slate-500">{inv.submittedDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white">{fmtMoney(inv.amount)}</span>
                  <button onClick={() => actOnInvoice("approve-invoice", inv.id)} className="rounded-md bg-emerald-600 px-2 py-1 text-xs font-bold text-white hover:bg-emerald-700" title="Approve"><CheckCheck size={12} className="inline" /> Approve</button>
                  <button onClick={() => actOnInvoice("request-revision", inv.id)} className="rounded-md bg-amber-500 px-2 py-1 text-xs font-bold text-white hover:bg-amber-600" title="Request revision">Revise</button>
                  <button onClick={() => actOnInvoice("reject-invoice", inv.id)} className="rounded-md bg-red-600 px-2 py-1 text-xs font-bold text-white hover:bg-red-700" title="Reject">Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} iconBg="bg-emerald-50 dark:bg-emerald-900/20" iconColor="text-emerald-600" label="Active Contractors" value={stats?.active ?? "—"} subtext="Currently engaged" href="/contractors" />
        <StatCard icon={FileWarning} iconBg="bg-amber-50 dark:bg-amber-900/20" iconColor="text-amber-600" label="Pending W-9s" value={stats?.pendingW9 ?? "—"} subtext="Needs attention" href="/contractors/onboarding" />
        <StatCard icon={DollarSign} iconBg="bg-blue-50 dark:bg-blue-900/20" iconColor="text-blue-600" label="Payments This Month" value={stats ? fmtMoney(stats.paymentsThisMonth) : "—"} subtext="Approved + Paid" href="/contractors/payments" />
        <StatCard icon={FileText} iconBg="bg-violet-50 dark:bg-violet-900/20" iconColor="text-violet-600" label="1099s Due" value={stats?.necs1099Due ?? "—"} subtext="Draft / Ready to file" href="/contractors/1099s" />
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">All Contractors</h3>
            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full text-[11px] font-bold">
              {filteredContractors.length}
            </span>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search contractors..." className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-slate-900 dark:text-white" />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500/50">
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Onboarding">Onboarding</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium tracking-wide">
              <tr>
                <th className="px-5 py-3.5">Contractor</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">W-9 Status</th>
                <th className="px-5 py-3.5 text-right">YTD Payments</th>
                <th className="px-5 py-3.5">Contract Expires</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {!rows && !loadErr && (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">Loading contractors…</td></tr>
              )}
              {filteredContractors.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 group">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                        {c.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white group-hover:text-orange-600 transition-colors">{c.name}</p>
                        <p className="text-xs text-slate-500">{c.businessName ?? c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4"><StatusBadge status={c.status} /></td>
                  <td className="px-5 py-4"><W9Badge status={c.w9Status} /></td>
                  <td className="px-5 py-4 text-right">
                    <span className={`font-bold ${(c.ytdPayments ?? 0) > 0 ? "text-slate-900 dark:text-white" : "text-slate-400"}`}>
                      {fmtMoney(c.ytdPayments ?? 0)}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {c.contract?.endDate ? (
                      <div>
                        <p className="text-sm text-slate-900 dark:text-white font-medium">{formatDate(c.contract.endDate)}</p>
                        {c.contract.daysUntilExpiry !== null && c.contract.daysUntilExpiry <= 30 && (
                          <p className="text-[10px] font-bold text-red-600 flex items-center gap-1 mt-0.5">
                            <AlertTriangle size={10} /> {c.contract.daysUntilExpiry} days left
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => setContractFor(c)} className="rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-2 py-1 text-xs font-bold text-slate-700 dark:text-slate-200" title="Create contract">
                        <FilePlus2 size={12} className="mr-1 inline" /> Contract
                      </button>
                      <Link href={`/contractors/onboarding?id=${c.id}`} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title="View Details">
                        <Eye size={16} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {rows && filteredContractors.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    {rows.length === 0 ? "No contractors yet. Click Invite Contractor to add one." : "No contractors match your search."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {inviteOpen && <InviteModal onClose={() => setInviteOpen(false)} onDone={load} />}
      {contractFor && <ContractModal contractor={contractFor} onClose={() => setContractFor(null)} onDone={load} />}
    </div>
  );
}
