import { NextResponse, type NextRequest } from "next/server";
import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { employees, performanceGoals } from "@/db/schema";
import { getSession, resolveUserContext } from "@/lib/session";

export const dynamic = "force-dynamic";

const STATUSES = new Set(["on_track", "at_risk", "completed"]);

async function ctxOr401(request: NextRequest) {
  const session = await getSession(request);
  if (!session) return { error: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  const ctx = await resolveUserContext(session);
  if (!ctx?.companyId) return { error: NextResponse.json({ error: "no_company" }, { status: 400 }) };
  return { session, ctx };
}

async function assertEmployeeInCompany(employeeId: number, companyId: number): Promise<boolean> {
  const [row] = await db
    .select({ id: employees.id })
    .from(employees)
    .where(and(eq(employees.id, employeeId), eq(employees.companyId, companyId)))
    .limit(1);
  return Boolean(row);
}

export async function GET(request: NextRequest) {
  const gate = await ctxOr401(request);
  if ("error" in gate) return gate.error;
  const employeeIdParam = request.nextUrl.searchParams.get("employeeId");
  const employeeId = employeeIdParam ? Number(employeeIdParam) : null;

  const where = employeeId
    ? and(eq(performanceGoals.companyId, gate.ctx.companyId), eq(performanceGoals.employeeId, employeeId))
    : eq(performanceGoals.companyId, gate.ctx.companyId);

  const rows = await db
    .select({
      id: performanceGoals.id,
      employeeId: performanceGoals.employeeId,
      title: performanceGoals.title,
      description: performanceGoals.description,
      targetDate: performanceGoals.targetDate,
      status: performanceGoals.status,
      progressPct: performanceGoals.progressPct,
      createdAt: performanceGoals.createdAt,
      updatedAt: performanceGoals.updatedAt,
      firstName: employees.firstName,
      lastName: employees.lastName,
    })
    .from(performanceGoals)
    .leftJoin(employees, eq(performanceGoals.employeeId, employees.id))
    .where(where)
    .orderBy(desc(performanceGoals.updatedAt));

  return NextResponse.json({ goals: rows });
}

export async function POST(request: NextRequest) {
  const gate = await ctxOr401(request);
  if ("error" in gate) return gate.error;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

  const employeeId = Number(body.employeeId);
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() || null : null;
  const targetDate = typeof body.targetDate === "string" && body.targetDate ? body.targetDate : null;
  const status = typeof body.status === "string" && STATUSES.has(body.status) ? body.status : "on_track";
  const progressPct = Number.isFinite(Number(body.progressPct)) ? Math.max(0, Math.min(100, Math.round(Number(body.progressPct)))) : 0;

  if (!Number.isInteger(employeeId) || employeeId <= 0) return NextResponse.json({ error: "invalid_employee_id" }, { status: 400 });
  if (!title) return NextResponse.json({ error: "title_required" }, { status: 400 });
  if (!(await assertEmployeeInCompany(employeeId, gate.ctx.companyId))) {
    return NextResponse.json({ error: "employee_not_in_company" }, { status: 404 });
  }

  const [row] = await db.insert(performanceGoals).values({
    companyId: gate.ctx.companyId,
    employeeId,
    title,
    description,
    targetDate,
    status,
    progressPct,
    createdBy: gate.session.userId,
  }).returning();
  return NextResponse.json({ ok: true, goal: row });
}

export async function PATCH(request: NextRequest) {
  const gate = await ctxOr401(request);
  if ("error" in gate) return gate.error;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const id = Number(body.id);
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: "invalid_id" }, { status: 400 });

  const [existing] = await db
    .select({ id: performanceGoals.id })
    .from(performanceGoals)
    .where(and(eq(performanceGoals.id, id), eq(performanceGoals.companyId, gate.ctx.companyId)))
    .limit(1);
  if (!existing) return NextResponse.json({ error: "not_found_or_not_yours" }, { status: 404 });

  const patch: Record<string, unknown> = { updatedAt: new Date() };
  if (typeof body.title === "string" && body.title.trim()) patch.title = body.title.trim();
  if (typeof body.description === "string") patch.description = body.description.trim() || null;
  if (typeof body.targetDate === "string") patch.targetDate = body.targetDate || null;
  if (typeof body.status === "string" && STATUSES.has(body.status)) patch.status = body.status;
  if (body.progressPct !== undefined) {
    const p = Number(body.progressPct);
    if (Number.isFinite(p)) patch.progressPct = Math.max(0, Math.min(100, Math.round(p)));
  }
  // Auto-flip status when progress hits 100 unless caller passed one explicitly.
  if (patch.progressPct === 100 && !patch.status) patch.status = "completed";

  const [row] = await db.update(performanceGoals).set(patch).where(eq(performanceGoals.id, id)).returning();
  return NextResponse.json({ ok: true, goal: row });
}

export async function DELETE(request: NextRequest) {
  const gate = await ctxOr401(request);
  if ("error" in gate) return gate.error;
  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: "invalid_id" }, { status: 400 });
  const [existing] = await db
    .select({ id: performanceGoals.id })
    .from(performanceGoals)
    .where(and(eq(performanceGoals.id, id), eq(performanceGoals.companyId, gate.ctx.companyId)))
    .limit(1);
  if (!existing) return NextResponse.json({ error: "not_found_or_not_yours" }, { status: 404 });
  await db.delete(performanceGoals).where(eq(performanceGoals.id, id));
  return NextResponse.json({ ok: true });
}
