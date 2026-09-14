import { NextResponse, type NextRequest } from "next/server";
import { and, asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { benefitPlans } from "@/db/schema";
import { getSession, resolveUserContext } from "@/lib/session";

export const dynamic = "force-dynamic";

const TYPES = new Set(["medical", "dental", "vision", "life", "disability", "hsa", "fsa", "401k", "cobra"]);

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

  const rows = await db
    .select()
    .from(benefitPlans)
    .where(eq(benefitPlans.companyId, gate.ctx.companyId))
    .orderBy(asc(benefitPlans.type), asc(benefitPlans.name));
  return NextResponse.json({ plans: rows });
}

export async function POST(request: NextRequest) {
  const gate = await ctxOr401(request);
  if ("error" in gate) return gate.error;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const type = typeof body.type === "string" ? body.type.trim().toLowerCase() : "";
  if (!name) return NextResponse.json({ error: "name_required" }, { status: 400 });
  if (!TYPES.has(type)) return NextResponse.json({ error: "invalid_type", allowed: [...TYPES] }, { status: 400 });

  const [row] = await db.insert(benefitPlans).values({
    companyId: gate.ctx.companyId,
    name,
    type,
    category: typeof body.category === "string" ? body.category.trim() || null : null,
    carrier: typeof body.carrier === "string" ? body.carrier.trim() || null : null,
    planType: typeof body.planType === "string" ? body.planType.trim() || null : null,
    employeePremium: Number.isFinite(Number(body.employeePremium)) ? Math.round(Number(body.employeePremium)) : 0,
    employerPremium: Number.isFinite(Number(body.employerPremium)) ? Math.round(Number(body.employerPremium)) : 0,
    deductible: Number.isFinite(Number(body.deductible)) ? Math.round(Number(body.deductible)) : 0,
    outOfPocketMax: Number.isFinite(Number(body.outOfPocketMax)) ? Math.round(Number(body.outOfPocketMax)) : 0,
    monthlyCost: Number.isFinite(Number(body.monthlyCost)) ? Math.round(Number(body.monthlyCost)) :
      (Number.isFinite(Number(body.employeePremium)) && Number.isFinite(Number(body.employerPremium))
        ? Math.round(Number(body.employeePremium) + Number(body.employerPremium))
        : 0),
    effectiveStart: typeof body.effectiveStart === "string" ? body.effectiveStart || null : null,
    effectiveEnd: typeof body.effectiveEnd === "string" ? body.effectiveEnd || null : null,
  }).returning();
  return NextResponse.json({ ok: true, plan: row });
}

export async function PATCH(request: NextRequest) {
  const gate = await ctxOr401(request);
  if ("error" in gate) return gate.error;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const id = Number(body.id);
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: "invalid_id" }, { status: 400 });

  const [existing] = await db.select({ id: benefitPlans.id }).from(benefitPlans)
    .where(and(eq(benefitPlans.id, id), eq(benefitPlans.companyId, gate.ctx.companyId))).limit(1);
  if (!existing) return NextResponse.json({ error: "not_found_or_not_yours" }, { status: 404 });

  const patch: Record<string, unknown> = { updatedAt: new Date() };
  if (typeof body.name === "string" && body.name.trim()) patch.name = body.name.trim();
  if (typeof body.type === "string" && TYPES.has(body.type.toLowerCase())) patch.type = body.type.toLowerCase();
  if (typeof body.category === "string") patch.category = body.category.trim() || null;
  if (typeof body.carrier === "string") patch.carrier = body.carrier.trim() || null;
  if (typeof body.planType === "string") patch.planType = body.planType.trim() || null;
  if (Number.isFinite(Number(body.employeePremium))) patch.employeePremium = Math.round(Number(body.employeePremium));
  if (Number.isFinite(Number(body.employerPremium))) patch.employerPremium = Math.round(Number(body.employerPremium));
  if (Number.isFinite(Number(body.deductible))) patch.deductible = Math.round(Number(body.deductible));
  if (Number.isFinite(Number(body.outOfPocketMax))) patch.outOfPocketMax = Math.round(Number(body.outOfPocketMax));
  if (Number.isFinite(Number(body.monthlyCost))) patch.monthlyCost = Math.round(Number(body.monthlyCost));
  if (typeof body.effectiveStart === "string") patch.effectiveStart = body.effectiveStart || null;
  if (typeof body.effectiveEnd === "string") patch.effectiveEnd = body.effectiveEnd || null;

  const [row] = await db.update(benefitPlans).set(patch).where(eq(benefitPlans.id, id)).returning();
  return NextResponse.json({ ok: true, plan: row });
}

export async function DELETE(request: NextRequest) {
  const gate = await ctxOr401(request);
  if ("error" in gate) return gate.error;
  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: "invalid_id" }, { status: 400 });
  const [existing] = await db.select({ id: benefitPlans.id }).from(benefitPlans)
    .where(and(eq(benefitPlans.id, id), eq(benefitPlans.companyId, gate.ctx.companyId))).limit(1);
  if (!existing) return NextResponse.json({ error: "not_found_or_not_yours" }, { status: 404 });
  await db.delete(benefitPlans).where(eq(benefitPlans.id, id));
  return NextResponse.json({ ok: true });
}
