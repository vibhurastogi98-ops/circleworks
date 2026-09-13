import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { clientInvoiceItems, clientInvoices, companies } from "@/db/schema";
import { PrintButton } from "./PrintButton";

export const dynamic = "force-dynamic";

function fmt(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default async function PublicInvoicePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!token || token.length < 16 || token.length > 128) notFound();

  const [invoice] = await db
    .select()
    .from(clientInvoices)
    .where(eq(clientInvoices.publicToken, token))
    .limit(1);
  if (!invoice) notFound();

  const items = await db
    .select()
    .from(clientInvoiceItems)
    .where(eq(clientInvoiceItems.invoiceId, invoice.id))
    .orderBy(asc(clientInvoiceItems.position));

  const [company] = await db
    .select({ name: companies.name })
    .from(companies)
    .where(eq(companies.id, invoice.companyId))
    .limit(1);

  const today = new Date().toISOString().slice(0, 10);
  const status = invoice.status === "Sent" && invoice.dueDate < today ? "Overdue" : invoice.status;

  return (
    <div className="mx-auto max-w-3xl p-6 sm:p-10 print:p-0">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
        }
      `}</style>
      <header className="mb-8 flex items-start justify-between border-b border-slate-200 pb-6">
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-slate-500">Invoice</p>
          <h1 className="mt-1 text-3xl font-black text-slate-950">{invoice.invoiceNumber}</h1>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">From</p>
          <p className="font-black text-slate-950">{company?.name ?? ""}</p>
        </div>
      </header>

      <section className="mb-8 grid gap-6 sm:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Bill to</p>
          <p className="mt-1 font-black text-slate-950">{invoice.clientName}</p>
          {invoice.clientEmail && <p className="text-sm text-slate-500">{invoice.clientEmail}</p>}
        </div>
        <div className="sm:text-right">
          <p className="text-sm"><span className="text-slate-500">Issued:</span> <span className="font-bold text-slate-950">{invoice.issueDate}</span></p>
          <p className="text-sm"><span className="text-slate-500">Due:</span> <span className="font-bold text-slate-950">{invoice.dueDate}</span></p>
          <p className="mt-2 text-sm"><span className="text-slate-500">Status:</span> <span className={`font-black ${status === "Paid" ? "text-emerald-700" : status === "Overdue" ? "text-red-700" : "text-slate-950"}`}>{status}</span></p>
        </div>
      </section>

      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
          <tr>
            <th className="py-2">Description</th>
            <th className="py-2 text-right">Qty</th>
            <th className="py-2 text-right">Rate</th>
            <th className="py-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((it) => (
            <tr key={it.id}>
              <td className="py-3 text-slate-950">{it.description}</td>
              <td className="py-3 text-right text-slate-700">{it.quantity}</td>
              <td className="py-3 text-right text-slate-700">{fmt(it.rateCents)}</td>
              <td className="py-3 text-right font-bold text-slate-950">{fmt(it.amountCents)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3} className="pt-4 text-right text-sm font-bold text-slate-700">Total</td>
            <td className="pt-4 text-right text-lg font-black text-slate-950">{fmt(invoice.subtotalCents)}</td>
          </tr>
        </tfoot>
      </table>

      {invoice.notes && (
        <section className="mt-8 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Notes</p>
          <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">{invoice.notes}</p>
        </section>
      )}

      <footer className="no-print mt-10 flex items-center justify-between border-t border-slate-200 pt-6">
        <p className="text-xs text-slate-400">Please pay by the due date. Contact {company?.name} with any questions.</p>
        <PrintButton />
      </footer>
    </div>
  );
}
