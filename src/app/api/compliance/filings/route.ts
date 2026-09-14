import { NextResponse, type NextRequest } from "next/server";
import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { complianceFilings } from "@/db/schema";
import { getSession, resolveUserContext } from "@/lib/session";

export const dynamic = "force-dynamic";

const FILING_TYPES = new Set(["federal_941", "federal_940", "w2", "everify", "osha_300a"]);
const STATUSES = new Set(["not_started", "in_progress", "filed_externally"]);

async function ctxOr401(request: NextRequest) {
  const session = await getSession(request);
  if (!session) return { error: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  const ctx = await resolveUserContext(session);
  if (!ctx?.companyId) return { error: NextResponse.json({ error: "no_company" }, { status: 400 }) };
  return { session, ctx };
}

export async function GET(request: NextRequest) {
  const gate = await ctxOr401(request);
  if ("error" in gate) return gate.error;

  const filingType = request.nextUrl.searchParams.get("filingType");
  const period = request.nextUrl.searchParams.get("period");
  const clauses = [eq(complianceFilings.companyId, gate.ctx.companyId)];
  if (filingType && FILING_TYPES.has(filingType)) clauses.push(eq(complianceFilings.filingType, filingType));
  if (period) clauses.push(eq(complianceFilings.period, period));

  const rows = await db
    .select()
    .from(complianceFilings)
    .where(and(...clauses))
    .orderBy(desc(complianceFilings.updatedAt));
  return NextResponse.json({ filings: rows });
}

export async function POST(request: NextRequest) {
  const gate = await ctxOr401(request);
  if ("error" in gate) return gate.error;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

  const filingType = typeof body.filingType === "string" ? body.filingType : "";
  const period = typeof body.period === "string" ? body.period.trim() : "";
  if (!FILING_TYPES.has(filingType)) return NextResponse.json({ error: "invalid_filing_type", allowed: [...FILING_TYPES] }, { status: 400 });
  if (!period) return NextResponse.json({ error: "period_required" }, { status: 400 });

  const status = typeof body.status === "string" && STATUSES.has(body.status) ? body.status : "not_started";
  const externalConfirmationNumber = typeof body.externalConfirmationNumber === "string" ? body.externalConfirmationNumber.trim() || null : null;
  const notes = typeof body.notes === "string" ? body.notes.trim() || null : null;

  // If a confirmation number is present the caller is recording that they've
  // filed externally, so bump the status and stamp filedAt.
  const effectiveStatus = externalConfirmationNumber ? "filed_externally" : status;
  const filedAt = effectiveStatus === "filed_externally" ? new Date() : null;

  const [row] = await db.insert(complianceFilings).values({
    companyId: gate.ctx.companyId,
    filingType,
    period,
    status: effectiveStatus,
    externalConfirmationNumber,
    filedAt,
    notes,
    createdBy: gate.session.userId,
  }).returning();
  return NextResponse.json({ ok: true, filing: row });
}

export async function PATCH(request: NextRequest) {
  const gate = await ctxOr401(request);
  if ("error" in gate) return gate.error;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const id = Number(body.id);
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: "invalid_id" }, { status: 400 });

  const [existing] = await db
    .select()
    .from(complianceFilings)
    .where(and(eq(complianceFilings.id, id), eq(complianceFilings.companyId, gate.ctx.companyId)))
    .limit(1);
  if (!existing) return NextResponse.json({ error: "not_found_or_not_yours" }, { status: 404 });

  const patch: Record<string, unknown> = { updatedAt: new Date() };
  if (typeof body.status === "string" && STATUSES.has(body.status)) {
    patch.status = body.status;
    if (body.status === "filed_externally" && !existing.filedAt) patch.filedAt = new Date();
    if (body.status !== "filed_externally") patch.filedAt = null;
  }
  if (typeof body.externalConfirmationNumber === "string") {
    const trimmed = body.externalConfirmationNumber.trim();
    patch.externalConfirmationNumber = trimmed || null;
    // If a caller just added a confirmation number, promote the status.
    if (trimmed && !patch.status) {
      patch.status = "filed_externally";
      if (!existing.filedAt) patch.filedAt = new Date();
    }
  }
  if (typeof body.notes === "string") patch.notes = body.notes.trim() || null;
  if (typeof body.period === "string" && body.period.trim()) patch.period = body.period.trim();

  const [row] = await db.update(complianceFilings).set(patch).where(eq(complianceFilings.id, id)).returning();
  return NextResponse.json({ ok: true, filing: row });
}

export async function DELETE(request: NextRequest) {
  const gate = await ctxOr401(request);
  if ("error" in gate) return gate.error;
  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: "invalid_id" }, { status: 400 });
  const [existing] = await db.select({ id: complianceFilings.id }).from(complianceFilings)
    .where(and(eq(complianceFilings.id, id), eq(complianceFilings.companyId, gate.ctx.companyId))).limit(1);
  if (!existing) return NextResponse.json({ error: "not_found_or_not_yours" }, { status: 404 });
  await db.delete(complianceFilings).where(eq(complianceFilings.id, id));
  return NextResponse.json({ ok: true });
}
