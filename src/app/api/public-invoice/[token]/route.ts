import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { clientInvoiceItems, clientInvoices, companies } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!token || token.length < 16 || token.length > 128) {
    return NextResponse.json({ error: "invalid_token" }, { status: 400 });
  }

  const [invoice] = await db
    .select()
    .from(clientInvoices)
    .where(eq(clientInvoices.publicToken, token))
    .limit(1);
  if (!invoice) return NextResponse.json({ error: "not_found" }, { status: 404 });

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

  // Never expose companyId, createdBy, or the token itself in the response.
  return NextResponse.json({
    invoice: {
      invoiceNumber: invoice.invoiceNumber,
      clientName: invoice.clientName,
      clientEmail: invoice.clientEmail,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      status,
      notes: invoice.notes,
      subtotalCents: invoice.subtotalCents,
      sentAt: invoice.sentAt,
      paidAt: invoice.paidAt,
    },
    items: items.map((it) => ({
      description: it.description,
      quantity: it.quantity,
      rateCents: it.rateCents,
      amountCents: it.amountCents,
    })),
    from: { name: company?.name ?? "" },
  });
}
