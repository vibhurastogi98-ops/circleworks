import { NextResponse, type NextRequest } from "next/server";
import { and, desc, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { taxSetAsides } from "@/db/schema";
import { getSession, resolveUserContext } from "@/lib/session";

export const dynamic = "force-dynamic";

const VALID_PERIODS = new Set(["Q1", "Q2", "Q3", "Q4", "ANNUAL"]);

function currentTaxYear() {
  return new Date().getUTCFullYear();
}

async function requireContext(request: NextRequest) {
  const session = await getSession(request);
  if (!session) return { error: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  const context = await resolveUserContext(session);
  if (!context?.companyId) return { error: NextResponse.json({ error: "workspace_not_found" }, { status: 404 }) };
  return { session, context };
}

export async function GET(request: NextRequest) {
  const gate = await requireContext(request);
  if ("error" in gate) return gate.error;
  const { context } = gate;

  const url = new URL(request.url);
  const yearParam = url.searchParams.get("year");
  const taxYear = yearParam ? Number(yearParam) : currentTaxYear();

  const entries = await db
    .select({
      id: taxSetAsides.id,
      taxYear: taxSetAsides.taxYear,
      period: taxSetAsides.period,
      amount: taxSetAsides.amount,
      note: taxSetAsides.note,
      createdAt: taxSetAsides.createdAt,
      createdBy: taxSetAsides.createdBy,
    })
    .from(taxSetAsides)
    .where(and(eq(taxSetAsides.companyId, context.companyId), eq(taxSetAsides.taxYear, taxYear)))
    .orderBy(desc(taxSetAsides.createdAt))
    .limit(100);

  const byPeriodRows = await db
    .select({
      period: taxSetAsides.period,
      total: sql<number>`coalesce(sum(${taxSetAsides.amount}), 0)`,
    })
    .from(taxSetAsides)
    .where(and(eq(taxSetAsides.companyId, context.companyId), eq(taxSetAsides.taxYear, taxYear)))
    .groupBy(taxSetAsides.period);

  const byPeriod: Record<string, number> = { Q1: 0, Q2: 0, Q3: 0, Q4: 0, ANNUAL: 0 };
  let totalYtd = 0;
  for (const r of byPeriodRows) {
    byPeriod[r.period] = Number(r.total ?? 0);
    totalYtd += Number(r.total ?? 0);
  }

  return NextResponse.json({
    taxYear,
    totalYtd,
    byPeriod,
    entries,
  });
}

export async function POST(request: NextRequest) {
  const gate = await requireContext(request);
  if ("error" in gate) return gate.error;
  const { session, context } = gate;

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const period = String(body.period ?? "").toUpperCase();
  const amount = Math.round(Number(body.amount ?? 0));
  const note = typeof body.note === "string" ? body.note.trim() || null : null;
  const taxYear = Number.isInteger(Number(body.taxYear)) ? Number(body.taxYear) : currentTaxYear();

  if (!VALID_PERIODS.has(period)) {
    return NextResponse.json({ error: "invalid_period", allowed: [...VALID_PERIODS] }, { status: 400 });
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "invalid_amount" }, { status: 400 });
  }

  const [row] = await db
    .insert(taxSetAsides)
    .values({
      companyId: context.companyId,
      taxYear,
      period,
      amount,
      note,
      createdBy: session.userId,
    })
    .returning();

  return NextResponse.json({ ok: true, entry: row });
}

export async function DELETE(request: NextRequest) {
  const gate = await requireContext(request);
  if ("error" in gate) return gate.error;
  const { context } = gate;

  const url = new URL(request.url);
  const id = Number(url.searchParams.get("id"));
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "invalid_id" }, { status: 400 });
  }
  const result = await db
    .delete(taxSetAsides)
    .where(and(eq(taxSetAsides.id, id), eq(taxSetAsides.companyId, context.companyId)))
    .returning({ id: taxSetAsides.id });
  if (result.length === 0) {
    return NextResponse.json({ error: "not_found_or_not_yours" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
