import { NextResponse, type NextRequest } from "next/server";
import { and, asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { companyLocations } from "@/db/schema";
import { getSession, resolveUserContext } from "@/lib/session";

export const dynamic = "force-dynamic";

async function ctxOr401(request: NextRequest) {
  const session = await getSession(request);
  if (!session) return { error: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  const ctx = await resolveUserContext(session);
  if (!ctx?.companyId) return { error: NextResponse.json({ error: "no_company" }, { status: 400 }) };
  return { ctx };
}

export async function GET(request: NextRequest) {
  const gate = await ctxOr401(request);
  if ("error" in gate) return gate.error;
  const rows = await db.select().from(companyLocations).where(eq(companyLocations.companyId, gate.ctx.companyId)).orderBy(asc(companyLocations.name));
  return NextResponse.json({ locations: rows });
}

export async function POST(request: NextRequest) {
  const gate = await ctxOr401(request);
  if ("error" in gate) return gate.error;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) return NextResponse.json({ error: "name_required" }, { status: 400 });

  const isHeadquarters = Boolean(body.isHeadquarters);
  try {
    if (isHeadquarters) {
      await db.update(companyLocations).set({ isHeadquarters: false }).where(eq(companyLocations.companyId, gate.ctx.companyId));
    }
    const [row] = await db.insert(companyLocations).values({
      companyId: gate.ctx.companyId,
      name,
      address: typeof body.address === "string" ? body.address.trim() || null : null,
      timezone: typeof body.timezone === "string" ? body.timezone.trim() || null : null,
      isHeadquarters,
    }).returning();
    return NextResponse.json({ ok: true, location: row });
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
  const [existing] = await db.select({ id: companyLocations.id }).from(companyLocations).where(and(eq(companyLocations.id, id), eq(companyLocations.companyId, gate.ctx.companyId))).limit(1);
  if (!existing) return NextResponse.json({ error: "not_found_or_not_yours" }, { status: 404 });

  const patch: Record<string, unknown> = { updatedAt: new Date() };
  if (typeof body.name === "string" && body.name.trim()) patch.name = body.name.trim();
  if (typeof body.address === "string") patch.address = body.address.trim() || null;
  if (typeof body.timezone === "string") patch.timezone = body.timezone.trim() || null;
  if (typeof body.isHeadquarters === "boolean") {
    if (body.isHeadquarters) {
      await db.update(companyLocations).set({ isHeadquarters: false }).where(eq(companyLocations.companyId, gate.ctx.companyId));
    }
    patch.isHeadquarters = body.isHeadquarters;
  }

  const [row] = await db.update(companyLocations).set(patch).where(eq(companyLocations.id, id)).returning();
  return NextResponse.json({ ok: true, location: row });
}

export async function DELETE(request: NextRequest) {
  const gate = await ctxOr401(request);
  if ("error" in gate) return gate.error;
  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: "invalid_id" }, { status: 400 });
  const [existing] = await db.select({ id: companyLocations.id }).from(companyLocations).where(and(eq(companyLocations.id, id), eq(companyLocations.companyId, gate.ctx.companyId))).limit(1);
  if (!existing) return NextResponse.json({ error: "not_found_or_not_yours" }, { status: 404 });
  await db.delete(companyLocations).where(eq(companyLocations.id, id));
  return NextResponse.json({ ok: true });
}
