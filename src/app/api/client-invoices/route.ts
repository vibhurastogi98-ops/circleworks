import { NextResponse, type NextRequest } from "next/server";
import { and, desc, eq, sql as dsql } from "drizzle-orm";

import { db } from "@/db";
import { clientInvoiceItems, clientInvoices } from "@/db/schema";
import { getSession, resolveUserContext } from "@/lib/session";

export const dynamic = "force-dynamic";

type ItemIn = { description?: unknown; quantity?: unknown; rate?: unknown };

function toCents(n: unknown): number {
  const v = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(v)) return 0;
  return Math.round(v * 100);
}

function normalizeItems(raw: unknown): { description: string; quantity: number; rateCents: number; amountCents: number; position: number }[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((it, idx) => {
      const item = it as ItemIn;
      const description = typeof item.description === "string" ? item.description.trim() : "";
      const quantity = Number(item.quantity ?? 1);
      const rateCents = toCents(item.rate);
      if (!description) return null;
      const qty = Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
      return {
        description,
        quantity: qty,
        rateCents,
        amountCents: Math.round(qty * rateCents),
        position: idx,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);
}

async function nextInvoiceNumber(companyId: number): Promise<string> {
  const [row] = await db
    .select({ n: dsql<number>`count(*)::int` })
    .from(clientInvoices)
    .where(eq(clientInvoices.companyId, companyId));
  const year = new Date().getUTCFullYear();
  const seq = String((row?.n ?? 0) + 1).padStart(4, "0");
  return `INV-${year}-${seq}`;
}

export async function GET(request: NextRequest) {
  const session = await getSession(request);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const ctx = await resolveUserContext(session);
  if (!ctx?.companyId) return NextResponse.json({ error: "no_company" }, { status: 400 });

  const rows = await db
    .select()
    .from(clientInvoices)
    .where(eq(clientInvoices.companyId, ctx.companyId))
    .orderBy(desc(clientInvoices.createdAt))
    .limit(500);

  // Derive Overdue on read (does not mutate) — a Sent invoice past due_date reads as Overdue.
  const today = new Date().toISOString().slice(0, 10);
  const invoices = rows.map((r) => ({
    ...r,
    status: r.status === "Sent" && r.dueDate < today ? "Overdue" : r.status,
  }));

  return NextResponse.json({ invoices });
}

export async function POST(request: NextRequest) {
  const session = await getSession(request);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const ctx = await resolveUserContext(session);
  if (!ctx?.companyId) return NextResponse.json({ error: "no_company" }, { status: 400 });

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const clientName = typeof body.clientName === "string" ? body.clientName.trim() : "";
  const clientEmail = typeof body.clientEmail === "string" ? body.clientEmail.trim() : null;
  const issueDate = typeof body.issueDate === "string" && body.issueDate.trim() ? body.issueDate : new Date().toISOString().slice(0, 10);
  const dueDate = typeof body.dueDate === "string" && body.dueDate.trim() ? body.dueDate : issueDate;
  const notes = typeof body.notes === "string" ? body.notes.trim() : null;
  const items = normalizeItems(body.items);

  if (!clientName) return NextResponse.json({ error: "client_name_required" }, { status: 400 });
  if (items.length === 0) return NextResponse.json({ error: "at_least_one_item" }, { status: 400 });

  const subtotalCents = items.reduce((s, it) => s + it.amountCents, 0);
  const invoiceNumber = typeof body.invoiceNumber === "string" && body.invoiceNumber.trim()
    ? body.invoiceNumber.trim()
    : await nextInvoiceNumber(ctx.companyId);

  const [invoice] = await db
    .insert(clientInvoices)
    .values({
      companyId: ctx.companyId,
      invoiceNumber,
      clientName,
      clientEmail,
      issueDate,
      dueDate,
      status: "Draft",
      notes,
      subtotalCents,
      createdBy: session.userId,
    })
    .returning();

  await db.insert(clientInvoiceItems).values(items.map((it) => ({ ...it, invoiceId: invoice.id })));

  return NextResponse.json({ ok: true, invoice });
}
