"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock, FileText, Loader2, Plus, Receipt, Send } from "lucide-react";
import { toast } from "sonner";

type Invoice = {
  id: number;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string | null;
  issueDate: string;
  dueDate: string;
  status: string;
  subtotalCents: number;
  publicToken: string | null;
  sentAt: string | null;
  paidAt: string | null;
};

function fmt(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function statusChip(status: string) {
  const base = "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black";
  switch (status) {
    case "Paid": return `${base} bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300`;
    case "Sent": return `${base} bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300`;
    case "Overdue": return `${base} bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300`;
    default: return `${base} bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300`;
  }
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[] | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/client-invoices", { cache: "no-store", credentials: "include" });
      if (r.status === 401) { setLoadErr("Please sign in."); return; }
      if (!r.ok) { setLoadErr(`Failed (HTTP ${r.status})`); return; }
      const data = await r.json();
      setInvoices(data.invoices ?? []);
      setLoadErr(null);
    } catch { setLoadErr("Network error"); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const totals = useMemo(() => {
    const list = invoices ?? [];
    return {
      outstanding: list.filter((i) => i.status === "Sent" || i.status === "Overdue").reduce((s, i) => s + i.subtotalCents, 0),
      paid: list.filter((i) => i.status === "Paid").reduce((s, i) => s + i.subtotalCents, 0),
      count: list.length,
    };
  }, [invoices]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-bold text-blue-600 dark:text-blue-300">Client invoicing</p>
            <h1 className="mt-1 text-2xl font-black text-slate-950 dark:text-white">Invoices</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Bill your own clients. Online payment collection is not wired — record status by hand once you're paid.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-black text-white transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" /> New invoice
          </button>
        </div>
      </section>

      {loadErr && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">{loadErr}</div>
      )}

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard icon={<Receipt className="h-5 w-5 text-blue-600 dark:text-blue-300" />} label="Total invoices" value={String(totals.count)} />
        <StatCard icon={<Clock className="h-5 w-5 text-amber-600 dark:text-amber-300" />} label="Outstanding" value={fmt(totals.outstanding)} />
        <StatCard icon={<CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />} label="Paid" value={fmt(totals.paid)} />
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-100 p-5 dark:border-slate-800">
          <h2 className="text-base font-black text-slate-950 dark:text-white">All invoices</h2>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {!invoices && !loadErr && (<p className="p-5 text-sm text-slate-500">Loading…</p>)}
          {invoices?.length === 0 && (
            <p className="p-5 text-sm text-slate-500">No invoices yet. Click New invoice to create one.</p>
          )}
          {invoices?.map((inv) => (
            <Link
              key={inv.id}
              href={`/invoices/${inv.id}`}
              className="grid gap-3 p-5 transition hover:bg-slate-50 dark:hover:bg-slate-800/40 md:grid-cols-[minmax(0,1fr)_140px_140px_120px_120px] md:items-center"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                  <FileText className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-black text-slate-950 dark:text-white">{inv.clientName}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{inv.invoiceNumber}</p>
                </div>
              </div>
              <span className={statusChip(inv.status)}>{inv.status}</span>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{fmt(inv.subtotalCents)}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Due {inv.dueDate}</p>
              <p className="text-xs text-slate-400">{inv.sentAt ? "Sent" : "Draft"}</p>
            </Link>
          ))}
        </div>
      </section>

      {showCreate && <CreateModal onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); void load(); }} />}
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {icon}
      <p className="mt-4 text-2xl font-black text-slate-950 dark:text-white">{value}</p>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}

type ItemRow = { description: string; quantity: string; rate: string };

function CreateModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const today = new Date().toISOString().slice(0, 10);
  const in30 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [issueDate, setIssueDate] = useState(today);
  const [dueDate, setDueDate] = useState(in30);
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<ItemRow[]>([{ description: "", quantity: "1", rate: "0" }]);
  const [busy, setBusy] = useState(false);

  const total = items.reduce((s, it) => s + (Number(it.quantity) || 0) * (Number(it.rate) || 0), 0);

  async function submit() {
    setBusy(true);
    const r = await fetch("/api/client-invoices", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientName, clientEmail: clientEmail || null, issueDate, dueDate, notes,
        items: items.map((it) => ({ description: it.description, quantity: Number(it.quantity), rate: Number(it.rate) })),
      }),
    });
    setBusy(false);
    const data = await r.json().catch(() => ({}));
    if (!r.ok) { toast.error(data.error || `create_failed_${r.status}`); return; }
    toast.success(`Invoice ${data.invoice?.invoiceNumber ?? ""} created`);
    onCreated();
  }

  return (
    <div className="fixed inset-0 z-[200] flex justify-end bg-black/40" onClick={onClose}>
      <div className="flex h-full w-full max-w-2xl flex-col bg-white dark:bg-slate-950" onClick={(e) => e.stopPropagation()}>
        <div className="border-b border-slate-200 p-5 dark:border-slate-800">
          <h2 className="text-lg font-black text-slate-950 dark:text-white">New invoice</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          <Field label="Client name">
            <input value={clientName} onChange={(e) => setClientName(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Client email (needed to send)">
            <input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} className={inputCls} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Issue date"><input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} className={inputCls} /></Field>
            <Field label="Due date"><input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputCls} /></Field>
          </div>

          <div>
            <p className="mb-2 text-sm font-black text-slate-950 dark:text-white">Line items</p>
            <div className="flex flex-col gap-2">
              {items.map((it, i) => (
                <div key={i} className="grid grid-cols-[minmax(0,1fr)_80px_100px_100px_32px] gap-2">
                  <input placeholder="Description" value={it.description} onChange={(e) => setItems((xs) => xs.map((x, j) => j === i ? { ...x, description: e.target.value } : x))} className={inputCls} />
                  <input type="number" step="0.01" min="0" value={it.quantity} onChange={(e) => setItems((xs) => xs.map((x, j) => j === i ? { ...x, quantity: e.target.value } : x))} className={inputCls} />
                  <input type="number" step="0.01" min="0" value={it.rate} onChange={(e) => setItems((xs) => xs.map((x, j) => j === i ? { ...x, rate: e.target.value } : x))} className={inputCls} />
                  <div className="flex items-center justify-end text-sm font-bold text-slate-700 dark:text-slate-200">{fmt(Math.round((Number(it.quantity) || 0) * (Number(it.rate) || 0) * 100))}</div>
                  <button type="button" onClick={() => setItems((xs) => xs.filter((_, j) => j !== i))} className="text-slate-400 hover:text-red-600" aria-label="Remove line">×</button>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setItems((xs) => [...xs, { description: "", quantity: "1", rate: "0" }])} className="mt-2 text-sm font-black text-blue-600 hover:underline">+ Add line</button>
            <div className="mt-4 flex justify-end text-lg font-black text-slate-950 dark:text-white">Total: {fmt(Math.round(total * 100))}</div>
          </div>

          <Field label="Notes (optional)">
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className={inputCls} />
          </Field>
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-200 p-5 dark:border-slate-800">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">Cancel</button>
          <button onClick={submit} disabled={busy || !clientName || items.every((it) => !it.description)} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-black text-white hover:bg-blue-700 disabled:opacity-50">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Save as Draft
          </button>
        </div>
      </div>
    </div>
  );
}

const inputCls = "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-white";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{label}</span>
      {children}
    </label>
  );
}
