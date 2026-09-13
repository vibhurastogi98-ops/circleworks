import { NextResponse, type NextRequest } from "next/server";
import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { paySchedules } from "@/db/schema";
import { getSession, resolveUserContext } from "@/lib/session";

export const dynamic = "force-dynamic";

const FREQUENCIES = new Set(["weekly", "biweekly", "semi-monthly", "monthly"]);

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
  const rows = await db
    .select()
    .from(paySchedules)
    .where(eq(paySchedules.companyId, gate.ctx.companyId))
    .orderBy(desc(paySchedules.isDefault), desc(paySchedules.createdAt));
  return NextResponse.json({ schedules: rows });
}

export async function POST(request: NextRequest) {
  const gate = await ctxOr401(request);
  if ("error" in gate) return gate.error;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const frequency = typeof body.frequency === "string" ? body.frequency.trim() : "";
  const cutoffHoursBeforeRun = Number.isFinite(Number(body.cutoffHoursBeforeRun)) ? Number(body.cutoffHoursBeforeRun) : 24;
  const isDefault = Boolean(body.isDefault);
  if (!name) return NextResponse.json({ error: "name_required" }, { status: 400 });
  if (!FREQUENCIES.has(frequency)) return NextResponse.json({ error: "invalid_frequency", allowed: [...FREQUENCIES] }, { status: 400 });

  if (isDefault) {
    await db.update(paySchedules).set({ isDefault: false }).where(eq(paySchedules.companyId, gate.ctx.companyId));
  }
  const [row] = await db.insert(paySchedules).values({
    companyId: gate.ctx.companyId, name, frequency, cutoffHoursBeforeRun, isDefault,
  }).returning();
  return NextResponse.json({ ok: true, schedule: row });
}

export async function PATCH(request: NextRequest) {
  const gate = await ctxOr401(request);
  if ("error" in gate) return gate.error;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const id = Number(body.id);
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: "invalid_id" }, { status: 400 });

  const [existing] = await db.select().from(paySchedules).where(and(eq(paySchedules.id, id), eq(paySchedules.companyId, gate.ctx.companyId))).limit(1);
  if (!existing) return NextResponse.json({ error: "not_found_or_not_yours" }, { status: 404 });

  const patch: Record<string, unknown> = { updatedAt: new Date() };
  if (typeof body.name === "string" && body.name.trim()) patch.name = body.name.trim();
  if (typeof body.frequency === "string" && FREQUENCIES.has(body.frequency)) patch.frequency = body.frequency;
  if (Number.isFinite(Number(body.cutoffHoursBeforeRun))) patch.cutoffHoursBeforeRun = Number(body.cutoffHoursBeforeRun);
  if (typeof body.isDefault === "boolean") {
    if (body.isDefault) {
      await db.update(paySchedules).set({ isDefault: false }).where(eq(paySchedules.companyId, gate.ctx.companyId));
    }
    patch.isDefault = body.isDefault;
  }

  const [row] = await db.update(paySchedules).set(patch).where(eq(paySchedules.id, id)).returning();
  return NextResponse.json({ ok: true, schedule: row });
}

export async function DELETE(request: NextRequest) {
  const gate = await ctxOr401(request);
  if ("error" in gate) return gate.error;
  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: "invalid_id" }, { status: 400 });

  const [existing] = await db.select().from(paySchedules).where(and(eq(paySchedules.id, id), eq(paySchedules.companyId, gate.ctx.companyId))).limit(1);
  if (!existing) return NextResponse.json({ error: "not_found_or_not_yours" }, { status: 404 });
  await db.delete(paySchedules).where(eq(paySchedules.id, id));
  return NextResponse.json({ ok: true });
}
