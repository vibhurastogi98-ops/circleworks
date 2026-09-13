import { NextResponse, type NextRequest } from "next/server";
import { and, asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { departments } from "@/db/schema";
import { getSession, resolveUserContext } from "@/lib/session";

export const dynamic = "force-dynamic";

async function ctxOr401(request: NextRequest) {
  const session = await getSession(request);
  if (!session) return { error: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  const ctx = await resolveUserContext(session);
  if (!ctx?.companyId) return { error: NextResponse.json({ error: "no_company" }, { status: 400 }) };
  return { ctx };
}

function toCents(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? Math.max(0, Math.round(n * 100)) : 0;
}

export async function GET(request: NextRequest) {
  const gate = await ctxOr401(request);
  if ("error" in gate) return gate.error;
  const rows = await db.select().from(departments).where(eq(departments.companyId, gate.ctx.companyId)).orderBy(asc(departments.name));
  return NextResponse.json({ departments: rows });
}

export async function POST(request: NextRequest) {
  const gate = await ctxOr401(request);
  if ("error" in gate) return gate.error;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) return NextResponse.json({ error: "name_required" }, { status: 400 });
  try {
    const [row] = await db.insert(departments).values({
      companyId: gate.ctx.companyId,
      name,
      head: typeof body.head === "string" ? body.head.trim() || null : null,
      budgetCents: body.budget !== undefined ? toCents(body.budget) : (Number.isFinite(Number(body.budgetCents)) ? Number(body.budgetCents) : 0),
    }).returning();
    return NextResponse.json({ ok: true, department: row });
  } catch (e) {
    if (/unique|duplicate/i.test((e as Error).message)) return NextResponse.json({ error: "name_in_use" }, { status: 409 });
    throw e;
  }
}

export async function PATCH(request: NextRequest) {
  const gate = await ctxOr401(request);
  if ("error" in gate) return gate.error;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const id = Number(body.id);
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: "invalid_id" }, { status: 400 });
  const [existing] = await db.select({ id: departments.id }).from(departments).where(and(eq(departments.id, id), eq(departments.companyId, gate.ctx.companyId))).limit(1);
  if (!existing) return NextResponse.json({ error: "not_found_or_not_yours" }, { status: 404 });

  const patch: Record<string, unknown> = { updatedAt: new Date() };
  if (typeof body.name === "string" && body.name.trim()) patch.name = body.name.trim();
  if (typeof body.head === "string") patch.head = body.head.trim() || null;
  if (body.budget !== undefined) patch.budgetCents = toCents(body.budget);
  else if (Number.isFinite(Number(body.budgetCents))) patch.budgetCents = Number(body.budgetCents);

  const [row] = await db.update(departments).set(patch).where(eq(departments.id, id)).returning();
  return NextResponse.json({ ok: true, department: row });
}

export async function DELETE(request: NextRequest) {
  const gate = await ctxOr401(request);
  if ("error" in gate) return gate.error;
  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: "invalid_id" }, { status: 400 });
  const [existing] = await db.select({ id: departments.id }).from(departments).where(and(eq(departments.id, id), eq(departments.companyId, gate.ctx.companyId))).limit(1);
  if (!existing) return NextResponse.json({ error: "not_found_or_not_yours" }, { status: 404 });
  await db.delete(departments).where(eq(departments.id, id));
  return NextResponse.json({ ok: true });
}
