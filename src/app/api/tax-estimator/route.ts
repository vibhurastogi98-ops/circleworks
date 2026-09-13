import { NextResponse, type NextRequest } from "next/server";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { taxEstimatorInputs } from "@/db/schema";
import { getSession, resolveUserContext } from "@/lib/session";

export const dynamic = "force-dynamic";

const DEFAULTS = { annualRevenue: 240000, businessExpenses: 72000, ownerSalary: 96000, withholding: 18000 };

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

function sanitizeAmount(raw: unknown, fallback: number): number {
  const n = Math.round(Number(raw));
  if (!Number.isFinite(n) || n < 0) return fallback;
  if (n > 1_000_000_000) return 1_000_000_000; // sanity cap
  return n;
}

export async function GET(request: NextRequest) {
  const gate = await requireContext(request);
  if ("error" in gate) return gate.error;
  const { context } = gate;
  const taxYear = Number(new URL(request.url).searchParams.get("year")) || currentTaxYear();

  const [row] = await db
    .select()
    .from(taxEstimatorInputs)
    .where(and(eq(taxEstimatorInputs.companyId, context.companyId), eq(taxEstimatorInputs.taxYear, taxYear)))
    .limit(1);

  return NextResponse.json({
    taxYear,
    exists: !!row,
    inputs: row
      ? {
          annualRevenue: row.annualRevenue,
          businessExpenses: row.businessExpenses,
          ownerSalary: row.ownerSalary,
          withholding: row.withholding,
          updatedAt: row.updatedAt?.toISOString() ?? null,
        }
      : { ...DEFAULTS, updatedAt: null },
  });
}

export async function PUT(request: NextRequest) {
  const gate = await requireContext(request);
  if ("error" in gate) return gate.error;
  const { session, context } = gate;

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const taxYear = Number.isInteger(Number(body.taxYear)) ? Number(body.taxYear) : currentTaxYear();

  // Merge into whatever's stored so a partial PUT doesn't zero out the other fields.
  const [existing] = await db
    .select()
    .from(taxEstimatorInputs)
    .where(and(eq(taxEstimatorInputs.companyId, context.companyId), eq(taxEstimatorInputs.taxYear, taxYear)))
    .limit(1);

  const values = {
    annualRevenue: sanitizeAmount(body.annualRevenue, existing?.annualRevenue ?? DEFAULTS.annualRevenue),
    businessExpenses: sanitizeAmount(body.businessExpenses, existing?.businessExpenses ?? DEFAULTS.businessExpenses),
    ownerSalary: sanitizeAmount(body.ownerSalary, existing?.ownerSalary ?? DEFAULTS.ownerSalary),
    withholding: sanitizeAmount(body.withholding, existing?.withholding ?? DEFAULTS.withholding),
  };

  const now = new Date();
  const [row] = await db
    .insert(taxEstimatorInputs)
    .values({ companyId: context.companyId, taxYear, ...values, updatedAt: now, updatedBy: session.userId })
    .onConflictDoUpdate({
      target: [taxEstimatorInputs.companyId, taxEstimatorInputs.taxYear],
      set: { ...values, updatedAt: now, updatedBy: session.userId },
    })
    .returning();

  return NextResponse.json({
    ok: true,
    taxYear,
    inputs: {
      annualRevenue: row!.annualRevenue,
      businessExpenses: row!.businessExpenses,
      ownerSalary: row!.ownerSalary,
      withholding: row!.withholding,
      updatedAt: row!.updatedAt?.toISOString() ?? null,
    },
  });
}
