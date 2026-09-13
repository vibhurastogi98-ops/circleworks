import { NextResponse, type NextRequest } from "next/server";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { unionContracts, unions } from "@/db/schema";
import { getSession, resolveUserContext } from "@/lib/session";

export const dynamic = "force-dynamic";

async function ctxOr401(request: NextRequest) {
  const session = await getSession(request);
  if (!session) return { error: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  const ctx = await resolveUserContext(session);
  if (!ctx?.companyId) return { error: NextResponse.json({ error: "no_company" }, { status: 400 }) };
  return { ctx };
}

async function assertUnionInCompany(unionId: number, companyId: number) {
  const [row] = await db
    .select({ id: unions.id })
    .from(unions)
    .where(and(eq(unions.id, unionId), eq(unions.companyId, companyId)))
    .limit(1);
  return Boolean(row);
}

export async function POST(request: NextRequest) {
  const gate = await ctxOr401(request);
  if ("error" in gate) return gate.error;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const unionId = Number(body.unionId);
  const contractName = typeof body.contractName === "string" ? body.contractName.trim() : "";
  const duesType = body.duesType === "flat" ? "flat" : "percentage";
  const duesRate = Number(body.duesRate);
  const pensionRate = Number(body.pensionRate);
  const healthWelfareRate = Number(body.healthWelfareRate);
  const workDuesRate = Number(body.workDuesRate ?? 0);
  const effectiveDate = typeof body.effectiveDate === "string" && body.effectiveDate ? body.effectiveDate : new Date().toISOString().slice(0, 10);
  const expirationDate = typeof body.expirationDate === "string" && body.expirationDate ? body.expirationDate : null;

  if (!Number.isInteger(unionId) || unionId <= 0) return NextResponse.json({ error: "invalid_union_id" }, { status: 400 });
  if (!contractName) return NextResponse.json({ error: "contract_name_required" }, { status: 400 });
  if (!Number.isFinite(duesRate) || !Number.isFinite(pensionRate) || !Number.isFinite(healthWelfareRate)) {
    return NextResponse.json({ error: "rates_required" }, { status: 400 });
  }
  if (!(await assertUnionInCompany(unionId, gate.ctx.companyId))) {
    return NextResponse.json({ error: "union_not_in_company" }, { status: 404 });
  }

  const [row] = await db.insert(unionContracts).values({
    unionId, contractName, duesType, duesRate, pensionRate, healthWelfareRate, workDuesRate,
    effectiveDate, expirationDate,
  }).returning();
  return NextResponse.json({ ok: true, contract: row });
}

export async function DELETE(request: NextRequest) {
  const gate = await ctxOr401(request);
  if ("error" in gate) return gate.error;
  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: "invalid_id" }, { status: 400 });

  // Scope check via JOIN to unions.company_id
  const [existing] = await db
    .select({ id: unionContracts.id })
    .from(unionContracts)
    .innerJoin(unions, eq(unionContracts.unionId, unions.id))
    .where(and(eq(unionContracts.id, id), eq(unions.companyId, gate.ctx.companyId)))
    .limit(1);
  if (!existing) return NextResponse.json({ error: "not_found_or_not_yours" }, { status: 404 });

  await db.delete(unionContracts).where(eq(unionContracts.id, id));
  return NextResponse.json({ ok: true });
}
