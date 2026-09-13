import { NextResponse, type NextRequest } from "next/server";
import { randomBytes } from "node:crypto";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { clientInvoices, companies } from "@/db/schema";
import { getSession, resolveUserContext } from "@/lib/session";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

function makeToken() {
  return randomBytes(24).toString("base64url");
}

function fmtMoney(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: "invalid_id" }, { status: 400 });

  const session = await getSession(request);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const ctx = await resolveUserContext(session);
  if (!ctx?.companyId) return NextResponse.json({ error: "no_company" }, { status: 400 });

  const [invoice] = await db
    .select()
    .from(clientInvoices)
    .where(and(eq(clientInvoices.id, id), eq(clientInvoices.companyId, ctx.companyId)))
    .limit(1);
  if (!invoice) return NextResponse.json({ error: "not_found_or_not_yours" }, { status: 404 });
  if (!invoice.clientEmail) return NextResponse.json({ error: "client_email_required" }, { status: 400 });

  // Mint the public token on first send; keep it stable across resends so
  // an already-shared link stays valid.
  const publicToken = invoice.publicToken ?? makeToken();
  const [updated] = await db
    .update(clientInvoices)
    .set({
      status: "Sent",
      publicToken,
      sentAt: invoice.sentAt ?? new Date(),
      updatedAt: new Date(),
    })
    .where(eq(clientInvoices.id, id))
    .returning();

  const [company] = await db
    .select({ name: companies.name })
    .from(companies)
    .where(eq(companies.id, ctx.companyId))
    .limit(1);
  const fromName = company?.name ?? "CircleWorks";

  const base = process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_APP_BASE_URL || "http://localhost:3000";
  const link = `${base.replace(/\/$/, "")}/i/${publicToken}`;

  const subject = `Invoice ${invoice.invoiceNumber} from ${fromName}`;
  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0f172a">
      <h2 style="margin:0 0 12px">Invoice ${invoice.invoiceNumber}</h2>
      <p>Hi ${invoice.clientName},</p>
      <p>${fromName} has sent you an invoice for <strong>${fmtMoney(invoice.subtotalCents)}</strong>, due <strong>${invoice.dueDate}</strong>.</p>
      <p><a href="${link}" style="display:inline-block;background:#2563eb;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;font-weight:700">View invoice</a></p>
      <p style="color:#64748b;font-size:12px;margin-top:24px">Or copy and paste this link into your browser:<br>${link}</p>
    </div>`;
  const text = `Invoice ${invoice.invoiceNumber} from ${fromName}\nAmount: ${fmtMoney(invoice.subtotalCents)}\nDue: ${invoice.dueDate}\n\nView: ${link}\n`;

  const sent = await sendEmail({
    to: invoice.clientEmail,
    subject,
    html,
    text,
  });

  return NextResponse.json({
    ok: true,
    invoice: updated,
    emailSent: sent,
    publicUrl: link,
  });
}
