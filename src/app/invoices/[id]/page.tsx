"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, ExternalLink, Loader2, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Item = { id?: number; description: string; quantity: number; rateCents: number; amountCents: number };
type Invoice = {
  id: number;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string | null;
  issueDate: string;
  dueDate: string;
  status: string;
  notes: string | null;
  subtotalCents: number;
  publicToken: string | null;
  sentAt: string | null;
  paidAt: string | null;
};

function fmt(cents: number) { return `$${(cents / 100).toFixed(2)}`; }

export default function InvoiceDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = Number(params.id);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [rows, setRows] = useState<{ description: string; quantity: string; rate: string }[]>([]);

  const load = useCallback(async () => {
    const r = await fetch(`/api/client-invoices/${id}`, { cache: "no-store", credentials: "include" });
    if (!r.ok) { setErr(`Failed (${r.status})`); return; }
    const data = await r.json();
    setInvoice(data.invoice);
    setItems(data.items);
    setClientName(data.invoice.clientName);
    setClientEmail(data.invoice.clientEmail ?? "");
    setIssueDate(data.invoice.issueDate);
    setDueDate(data.invoice.dueDate);
    setNotes(data.invoice.notes ?? "");
    setRows(data.items.map((it: Item) => ({ description: it.description, quantity: String(it.quantity), rate: String(it.rateCents / 100) })));
  }, [id]);

  useEffect(() => { void load(); }, [load]);

  async function patch(body: object, label: string) {
    setBusy(label);
    const r = await fetch(`/api/client-invoices/${id}`, {
      method: "PATCH", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusy(null);
    const data = await r.json().catch(() => ({}));
    if (!r.ok) { toast.error(data.error || `${label}_failed`); return false; }
    return true;
  }

  async function saveEdits() {
    const ok = await patch({
      clientName, clientEmail: clientEmail || null, issueDate, dueDate, notes,
      items: rows.map((it) => ({ description: it.description, quantity: Number(it.quantity), rate: Number(it.rate) })),
    }, "save");
    if (ok) { toast.success("Saved"); void load(); }
  }

  async function send() {
    setBusy("send");
    const r = await fetch(`/api/client-invoices/${id}/send`, { method: "POST", credentials: "include" });
    setBusy(null);
    const data = await r.json().catch(() => ({}));
    if (!r.ok) { toast.error(data.error || "send_failed"); return; }
    toast.success(data.emailSent ? "Sent." : "Marked as Sent (Postmark not configured — link ready).", {
      description: data.publicUrl,
    });
    void load();
  }

  async function markPaid() { if (await patch({ action: "mark-paid" }, "mark-paid")) { toast.success("Marked Paid"); void load(); } }
  async function markOverdue() { if (await patch({ action: "mark-overdue" }, "mark-overdue")) { toast.success("Marked Overdue"); void load(); } }
  async function markDraft() { if (await patch({ action: "mark-draft" }, "mark-draft")) { toast.success("Reverted to Draft"); void load(); } }

  async function remove() {
    if (!confirm("Delete this draft invoice?")) return;
    setBusy("delete");
    const r = await fetch(`/api/client-invoices/${id}`, { method: "DELETE", credentials: "include" });
    setBusy(null);
    if (!r.ok) { const data = await r.json().catch(() => ({})); toast.error(data.error || "delete_failed"); return; }
    toast.success("Deleted");
    router.push("/invoices");
  }

  if (err) return <p className="p-8 text-sm text-red-600">{err}</p>;
  if (!invoice) return <p className="p-8 text-sm text-slate-500">Loading…</p>;

  const isPaid = invoice.status === "Paid";
  const isDraft = invoice.status === "Draft";
  const publicUrl = invoice.publicToken
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/i/${invoice.publicToken}`
    : null;
  const total = rows.reduce((s, it) => s + (Number(it.quantity) || 0) * (Number(it.rate) || 0), 0);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <Link href="/invoices" className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 hover:underline"><ArrowLeft className="h-4 w-4" /> Back</Link>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-bold text-blue-600 dark:text-blue-300">{invoice.invoiceNumber}</p>
            <h1 className="mt-1 text-2xl font-black text-slate-950 dark:text-white">{invoice.clientName}</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Status: <span className="font-black">{invoice.status}</span></p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {isDraft && (
              <button onClick={send} disabled={!invoice.clientEmail || busy === "send"} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-black text-white hover:bg-blue-700 disabled:opacity-50">
                {busy === "send" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Send
              </button>
            )}
            {(invoice.status === "Sent" || invoice.status === "Overdue") && (
              <>
                <button onClick={markPaid} disabled={!!busy} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-black text-white hover:bg-emerald-700 disabled:opacity-50">
                  <CheckCircle2 className="h-4 w-4" /> Mark Paid
                </button>
                {invoice.status === "Sent" && (
                  <button onClick={markOverdue} disabled={!!busy} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-black text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 disabled:opacity-50">
                    Mark Overdue
                  </button>
                )}
              </>
            )}
            {isDraft && (
              <button onClick={remove} disabled={!!busy} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-black text-red-600 hover:bg-red-50 dark:border-slate-700 dark:hover:bg-red-950/30 disabled:opacity-50">
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            )}
            {isPaid && (
              <button onClick={markDraft} disabled={!!busy} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-black text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 disabled:opacity-50">
                Revert to Draft
              </button>
            )}
          </div>
        </div>
        {publicUrl && (
          <p className="mt-4 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            Public link: <a href={publicUrl} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-blue-600 hover:underline">{publicUrl} <ExternalLink className="h-3 w-3" /></a>
          </p>
        )}
        <p className="mt-2 text-xs text-slate-500">
          Online payment collection is not wired in this build — the client sees a read-only view and pays out-of-band; use Mark Paid once you receive the money.
        </p>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-base font-black text-slate-950 dark:text-white">Details</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Client name"><input disabled={isPaid} value={clientName} onChange={(e) => setClientName(e.target.value)} className={inputCls(isPaid)} /></Field>
          <Field label="Client email"><input disabled={isPaid} type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} className={inputCls(isPaid)} /></Field>
          <Field label="Issue date"><input disabled={isPaid} type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} className={inputCls(isPaid)} /></Field>
          <Field label="Due date"><input disabled={isPaid} type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputCls(isPaid)} /></Field>
        </div>

        <div className="mt-6">
          <p className="mb-2 text-sm font-black text-slate-950 dark:text-white">Line items</p>
          <div className="flex flex-col gap-2">
            {rows.map((it, i) => (
              <div key={i} className="grid grid-cols-[minmax(0,1fr)_80px_100px_100px_32px] gap-2">
                <input disabled={isPaid} placeholder="Description" value={it.description} onChange={(e) => setRows((xs) => xs.map((x, j) => j === i ? { ...x, description: e.target.value } : x))} className={inputCls(isPaid)} />
                <input disabled={isPaid} type="number" step="0.01" min="0" value={it.quantity} onChange={(e) => setRows((xs) => xs.map((x, j) => j === i ? { ...x, quantity: e.target.value } : x))} className={inputCls(isPaid)} />
                <input disabled={isPaid} type="number" step="0.01" min="0" value={it.rate} onChange={(e) => setRows((xs) => xs.map((x, j) => j === i ? { ...x, rate: e.target.value } : x))} className={inputCls(isPaid)} />
                <div className="flex items-center justify-end text-sm font-bold text-slate-700 dark:text-slate-200">{fmt(Math.round((Number(it.quantity) || 0) * (Number(it.rate) || 0) * 100))}</div>
                <button disabled={isPaid} type="button" onClick={() => setRows((xs) => xs.filter((_, j) => j !== i))} className="text-slate-400 hover:text-red-600 disabled:opacity-30" aria-label="Remove">×</button>
              </div>
            ))}
          </div>
          {!isPaid && (
            <button type="button" onClick={() => setRows((xs) => [...xs, { description: "", quantity: "1", rate: "0" }])} className="mt-2 text-sm font-black text-blue-600 hover:underline">+ Add line</button>
          )}
          <div className="mt-4 flex justify-end text-lg font-black text-slate-950 dark:text-white">Total: {fmt(Math.round(total * 100))}</div>
        </div>

        <div className="mt-6">
          <Field label="Notes"><textarea disabled={isPaid} value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className={inputCls(isPaid)} /></Field>
        </div>

        {!isPaid && (
          <div className="mt-6 flex justify-end">
            <button onClick={saveEdits} disabled={busy === "save"} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-black text-white hover:bg-blue-700 disabled:opacity-50">
              {busy === "save" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Save changes
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

function inputCls(disabled = false) {
  return `h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-white ${disabled ? "opacity-60 cursor-not-allowed" : ""}`;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{label}</span>
      {children}
    </label>
  );
}
