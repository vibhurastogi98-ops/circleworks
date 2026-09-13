import { NextResponse, type NextRequest } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { db } from "@/db";
import { employees, performanceReviews } from "@/db/schema";
import { getSession, resolveUserContext } from "@/lib/session";

export const dynamic = "force-dynamic";

const STATUSES = new Set(["draft", "submitted", "completed"]);

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

  const cyclePeriod = request.nextUrl.searchParams.get("cyclePeriod");
  const employeeIdParam = request.nextUrl.searchParams.get("employeeId");
  const employeeId = employeeIdParam ? Number(employeeIdParam) : null;

  const clauses = [eq(performanceReviews.companyId, gate.ctx.companyId)];
  if (cyclePeriod) clauses.push(eq(performanceReviews.cyclePeriod, cyclePeriod));
  if (employeeId) clauses.push(eq(performanceReviews.employeeId, employeeId));

  const reviewer = alias(employees, "reviewer");
  const rows = await db
    .select({
      id: performanceReviews.id,
      employeeId: performanceReviews.employeeId,
      reviewerId: performanceReviews.reviewerId,
      cyclePeriod: performanceReviews.cyclePeriod,
      status: performanceReviews.status,
      overallRating: performanceReviews.overallRating,
      comments: performanceReviews.comments,
      submittedAt: performanceReviews.submittedAt,
      createdAt: performanceReviews.createdAt,
      employeeFirst: employees.firstName,
      employeeLast: employees.lastName,
      reviewerFirst: reviewer.firstName,
      reviewerLast: reviewer.lastName,
    })
    .from(performanceReviews)
    .leftJoin(employees, eq(performanceReviews.employeeId, employees.id))
    .leftJoin(reviewer, eq(performanceReviews.reviewerId, reviewer.id))
    .where(and(...clauses))
    .orderBy(desc(performanceReviews.createdAt));

  return NextResponse.json({ reviews: rows });
}

export async function POST(request: NextRequest) {
  const gate = await ctxOr401(request);
  if ("error" in gate) return gate.error;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

  const employeeId = Number(body.employeeId);
  const cyclePeriod = typeof body.cyclePeriod === "string" ? body.cyclePeriod.trim() : "";
  const reviewerId = body.reviewerId !== undefined && body.reviewerId !== null ? Number(body.reviewerId) : null;

  if (!Number.isInteger(employeeId) || employeeId <= 0) return NextResponse.json({ error: "invalid_employee_id" }, { status: 400 });
  if (!cyclePeriod) return NextResponse.json({ error: "cycle_period_required" }, { status: 400 });
  if (!(await assertEmployeeInCompany(employeeId, gate.ctx.companyId))) {
    return NextResponse.json({ error: "employee_not_in_company" }, { status: 404 });
  }
  if (reviewerId !== null) {
    if (!Number.isInteger(reviewerId) || reviewerId <= 0) return NextResponse.json({ error: "invalid_reviewer_id" }, { status: 400 });
    if (!(await assertEmployeeInCompany(reviewerId, gate.ctx.companyId))) {
      return NextResponse.json({ error: "reviewer_not_in_company" }, { status: 404 });
    }
  }

  const [row] = await db.insert(performanceReviews).values({
    companyId: gate.ctx.companyId,
    employeeId,
    reviewerId,
    cyclePeriod,
    status: "draft",
  }).returning();
  return NextResponse.json({ ok: true, review: row });
}

export async function PATCH(request: NextRequest) {
  const gate = await ctxOr401(request);
  if ("error" in gate) return gate.error;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const id = Number(body.id);
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: "invalid_id" }, { status: 400 });

  const [existing] = await db
    .select()
    .from(performanceReviews)
    .where(and(eq(performanceReviews.id, id), eq(performanceReviews.companyId, gate.ctx.companyId)))
    .limit(1);
  if (!existing) return NextResponse.json({ error: "not_found_or_not_yours" }, { status: 404 });

  const patch: Record<string, unknown> = { updatedAt: new Date() };
  if (typeof body.status === "string" && STATUSES.has(body.status)) {
    patch.status = body.status;
    if (body.status === "submitted" && !existing.submittedAt) patch.submittedAt = new Date();
  }
  if (body.overallRating !== undefined) {
    const r = Number(body.overallRating);
    if (Number.isFinite(r) && r >= 1 && r <= 5) patch.overallRating = Math.round(r);
    else if (body.overallRating === null) patch.overallRating = null;
    else return NextResponse.json({ error: "overall_rating_must_be_1_to_5" }, { status: 400 });
  }
  if (typeof body.comments === "string") patch.comments = body.comments.trim() || null;

  const [row] = await db.update(performanceReviews).set(patch).where(eq(performanceReviews.id, id)).returning();
  return NextResponse.json({ ok: true, review: row });
}
