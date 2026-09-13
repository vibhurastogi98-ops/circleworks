import { NextResponse, type NextRequest } from "next/server";
import { and, asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { clientInvoiceItems, clientInvoices } from "@/db/schema";
import { getSession, resolveUserContext } from "@/lib/session";

export const dynamic = "force-dynamic";

async function requireInvoice(request: NextRequest, id: number) {
  const session = await getSession(request);
  if (!session) return { error: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  const ctx = await resolveUserContext(session);
  if (!ctx?.companyId) return { error: NextResponse.json({ error: "no_company" }, { status: 400 }) };
  const [row] = await db
    .select()
    .from(clientInvoices)
    .where(and(eq(clientInvoices.id, id), eq(clientInvoices.companyId, ctx.companyId)))
    .limit(1);
  if (!row) return { error: NextResponse.json({ error: "not_found_or_not_yours" }, { status: 404 }) };
  return { session, ctx, invoice: row };
}

function toCents(n: unknown): number {
  const v = typeof n === "number" ? n : Number(n);
  return Number.isFinite(v) ? Math.round(v * 100) : 0;
}

function normalizeItems(raw: unknown) {
  if (!Array.isArray(raw)) return null;
  return raw
    .map((it, idx) => {
      const item = it as Record<string, unknown>;
      const description = typeof item.description === "string" ? item.description.trim() : "";
      if (!description) return null;
      const quantity = Number(item.quantity ?? 1);
      const qty = Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
      const rateCents = toCents(item.rate);
      return { description, quantity: qty, rateCents, amountCents: Math.round(qty * rateCents), position: idx };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: "invalid_id" }, { status: 400 });
  const gate = await requireInvoice(request, id);
  if ("error" in gate) return gate.error;

  const items = await db
    .select()
    .from(clientInvoiceItems)
    .where(eq(clientInvoiceItems.invoiceId, id))
    .orderBy(asc(clientInvoiceItems.position));

  return NextResponse.json({ invoice: gate.invoice, items });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: "invalid_id" }, { status: 400 });
  const gate = await requireInvoice(request, id);
  if ("error" in gate) return gate.error;

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const action = typeof body.action === "string" ? body.action : "update";

  if (action === "mark-paid") {
    const [row] = await db
      .update(clientInvoices)
      .set({ status: "Paid", paidAt: new Date(), updatedAt: new Date() })
      .where(eq(clientInvoices.id, id))
      .returning();
    return NextResponse.json({ ok: true, invoice: row });
  }
  if (action === "mark-overdue") {
    if (gate.invoice.status !== "Sent") {
      return NextResponse.json({ error: "only_sent_invoices_can_be_overdue" }, { status: 400 });
    }
    const [row] = await db
      .update(clientInvoices)
      .set({ status: "Overdue", updatedAt: new Date() })
      .where(eq(clientInvoices.id, id))
      .returning();
    return NextResponse.json({ ok: true, invoice: row });
  }
  if (action === "mark-draft") {
    const [row] = await db
      .update(clientInvoices)
      .set({ status: "Draft", updatedAt: new Date() })
      .where(eq(clientInvoices.id, id))
      .returning();
    return NextResponse.json({ ok: true, invoice: row });
  }

  // Default: general edit — client/dates/notes/items. Blocked once Paid.
  if (gate.invoice.status === "Paid") {
    return NextResponse.json({ error: "cannot_edit_paid_invoice" }, { status: 400 });
  }
  const patch: Record<string, unknown> = { updatedAt: new Date() };
  if (typeof body.clientName === "string" && body.clientName.trim()) patch.clientName = body.clientName.trim();
  if (typeof body.clientEmail === "string") patch.clientEmail = body.clientEmail.trim() || null;
  if (typeof body.issueDate === "string" && body.issueDate.trim()) patch.issueDate = body.issueDate;
  if (typeof body.dueDate === "string" && body.dueDate.trim()) patch.dueDate = body.dueDate;
  if (typeof body.notes === "string") patch.notes = body.notes.trim() || null;

  const newItems = normalizeItems(body.items);
  if (newItems !== null) {
    if (newItems.length === 0) return NextResponse.json({ error: "at_least_one_item" }, { status: 400 });
    patch.subtotalCents = newItems.reduce((s, it) => s + it.amountCents, 0);
  }

  const [row] = await db.update(clientInvoices).set(patch).where(eq(clientInvoices.id, id)).returning();
  if (newItems !== null) {
    await db.delete(clientInvoiceItems).where(eq(clientInvoiceItems.invoiceId, id));
    await db.insert(clientInvoiceItems).values(newItems.map((it) => ({ ...it, invoiceId: id })));
  }
  return NextResponse.json({ ok: true, invoice: row });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: "invalid_id" }, { status: 400 });
  const gate = await requireInvoice(request, id);
  if ("error" in gate) return gate.error;
  if (gate.invoice.status !== "Draft") {
    return NextResponse.json({ error: "only_drafts_can_be_deleted" }, { status: 400 });
  }
  await db.delete(clientInvoices).where(eq(clientInvoices.id, id));
  return NextResponse.json({ ok: true });
}
