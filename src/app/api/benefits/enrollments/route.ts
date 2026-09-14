import { NextResponse, type NextRequest } from "next/server";
import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { benefitEnrollments, benefitPlans, employees } from "@/db/schema";
import { getSession, resolveUserContext } from "@/lib/session";

export const dynamic = "force-dynamic";

const STATUSES = new Set(["Pending", "Enrolled", "Waived", "Cancelled"]);
const COVERAGE = new Set(["Employee", "Employee + Spouse", "Employee + Children", "Family"]);

async function ctxOr401(request: NextRequest) {
  const session = await getSession(request);
  if (!session) return { error: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  const ctx = await resolveUserContext(session);
  if (!ctx?.companyId) return { error: NextResponse.json({ error: "no_company" }, { status: 400 }) };
  return { session, ctx };
}

async function assertPlanInCompany(planId: number, companyId: number) {
  const [row] = await db
    .select()
    .from(benefitPlans)
    .where(and(eq(benefitPlans.id, planId), eq(benefitPlans.companyId, companyId)))
    .limit(1);
  return row ?? null;
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
  const planIdParam = request.nextUrl.searchParams.get("planId");
  const planId = planIdParam ? Number(planIdParam) : null;

  const clauses = [eq(benefitEnrollments.companyId, gate.ctx.companyId)];
  if (employeeId) clauses.push(eq(benefitEnrollments.employeeId, employeeId));
  if (planId) clauses.push(eq(benefitEnrollments.planId, planId));

  const rows = await db
    .select({
      id: benefitEnrollments.id,
      employeeId: benefitEnrollments.employeeId,
      planId: benefitEnrollments.planId,
      status: benefitEnrollments.status,
      coverageLevel: benefitEnrollments.coverageLevel,
      employeeMonthlyCost: benefitEnrollments.employeeMonthlyCost,
      employerMonthlyCost: benefitEnrollments.employerMonthlyCost,
      perPayPeriodDeduction: benefitEnrollments.perPayPeriodDeduction,
      enrolledAt: benefitEnrollments.enrolledAt,
      confirmedAt: benefitEnrollments.confirmedAt,
      // Real plan data joined in — no fabricated premium numbers.
      planName: benefitPlans.name,
      planType: benefitPlans.type,
      planCarrier: benefitPlans.carrier,
      planDeductible: benefitPlans.deductible,
      planOutOfPocketMax: benefitPlans.outOfPocketMax,
      // Employee display fields for the roster view.
      employeeFirst: employees.firstName,
      employeeLast: employees.lastName,
      employeeEmail: employees.email,
    })
    .from(benefitEnrollments)
    .leftJoin(benefitPlans, eq(benefitEnrollments.planId, benefitPlans.id))
    .leftJoin(employees, eq(benefitEnrollments.employeeId, employees.id))
    .where(and(...clauses))
    .orderBy(desc(benefitEnrollments.enrolledAt), desc(benefitEnrollments.id));
  return NextResponse.json({ enrollments: rows });
}

export async function POST(request: NextRequest) {
  const gate = await ctxOr401(request);
  if ("error" in gate) return gate.error;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

  const employeeId = Number(body.employeeId);
  const planId = Number(body.planId);
  if (!Number.isInteger(employeeId) || employeeId <= 0) return NextResponse.json({ error: "invalid_employee_id" }, { status: 400 });
  if (!Number.isInteger(planId) || planId <= 0) return NextResponse.json({ error: "invalid_plan_id" }, { status: 400 });

  if (!(await assertEmployeeInCompany(employeeId, gate.ctx.companyId))) {
    return NextResponse.json({ error: "employee_not_in_company" }, { status: 404 });
  }
  const plan = await assertPlanInCompany(planId, gate.ctx.companyId);
  if (!plan) return NextResponse.json({ error: "plan_not_in_company" }, { status: 404 });

  const coverageLevel = typeof body.coverageLevel === "string" && COVERAGE.has(body.coverageLevel)
    ? body.coverageLevel
    : "Employee";
  const status = typeof body.status === "string" && STATUSES.has(body.status) ? body.status : "Enrolled";

  // Reject a duplicate active enrollment in the same plan.
  const [dup] = await db
    .select({ id: benefitEnrollments.id })
    .from(benefitEnrollments)
    .where(and(
      eq(benefitEnrollments.employeeId, employeeId),
      eq(benefitEnrollments.planId, planId),
      eq(benefitEnrollments.status, "Enrolled"),
    ))
    .limit(1);
  if (dup && status !== "Waived") {
    return NextResponse.json({ error: "already_enrolled", enrollmentId: dup.id }, { status: 409 });
  }

  const now = new Date();
  const [row] = await db.insert(benefitEnrollments).values({
    companyId: gate.ctx.companyId,
    employeeId,
    planId,
    status,
    coverageLevel,
    // Pull cost from the plan — no fabrication.
    employeeMonthlyCost: plan.employeePremium ?? 0,
    employerMonthlyCost: plan.employerPremium ?? 0,
    perPayPeriodDeduction: (plan.employeePremium ?? 0) / 2, // biweekly assumption
    enrolledAt: now,
    submittedAt: now,
    confirmedAt: status === "Enrolled" ? now : null,
    payrollDeductionStatus: status === "Enrolled" ? "queued" : "n/a",
  }).returning();

  return NextResponse.json({ ok: true, enrollment: row });
}

export async function PATCH(request: NextRequest) {
  const gate = await ctxOr401(request);
  if ("error" in gate) return gate.error;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const id = Number(body.id);
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: "invalid_id" }, { status: 400 });

  const [existing] = await db
    .select()
    .from(benefitEnrollments)
    .where(and(eq(benefitEnrollments.id, id), eq(benefitEnrollments.companyId, gate.ctx.companyId)))
    .limit(1);
  if (!existing) return NextResponse.json({ error: "not_found_or_not_yours" }, { status: 404 });

  const patch: Record<string, unknown> = { updatedAt: new Date() };
  if (typeof body.status === "string" && STATUSES.has(body.status)) {
    patch.status = body.status;
    if (body.status === "Enrolled" && !existing.confirmedAt) patch.confirmedAt = new Date();
    if (body.status === "Waived" || body.status === "Cancelled") patch.confirmedAt = null;
  }
  if (typeof body.coverageLevel === "string" && COVERAGE.has(body.coverageLevel)) patch.coverageLevel = body.coverageLevel;

  // If plan is being changed, verify the new plan is in this company and
  // refresh the premium fields off it.
  if (body.planId !== undefined) {
    const newPlanId = Number(body.planId);
    if (!Number.isInteger(newPlanId) || newPlanId <= 0) return NextResponse.json({ error: "invalid_plan_id" }, { status: 400 });
    const newPlan = await assertPlanInCompany(newPlanId, gate.ctx.companyId);
    if (!newPlan) return NextResponse.json({ error: "plan_not_in_company" }, { status: 404 });
    patch.planId = newPlanId;
    patch.employeeMonthlyCost = newPlan.employeePremium ?? 0;
    patch.employerMonthlyCost = newPlan.employerPremium ?? 0;
    patch.perPayPeriodDeduction = (newPlan.employeePremium ?? 0) / 2;
  }

  const [row] = await db.update(benefitEnrollments).set(patch).where(eq(benefitEnrollments.id, id)).returning();
  return NextResponse.json({ ok: true, enrollment: row });
}
