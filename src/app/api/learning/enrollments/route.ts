import { NextResponse, type NextRequest } from "next/server";
import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { courseEnrollments, courses, employees } from "@/db/schema";
import { getSession, resolveUserContext } from "@/lib/session";

export const dynamic = "force-dynamic";

const STATUSES = new Set(["enrolled", "in_progress", "completed"]);

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

  const clauses = [eq(courseEnrollments.companyId, gate.ctx.companyId)];
  if (employeeId) clauses.push(eq(courseEnrollments.employeeId, employeeId));

  const rows = await db
    .select({
      id: courseEnrollments.id,
      employeeId: courseEnrollments.employeeId,
      courseId: courseEnrollments.courseId,
      status: courseEnrollments.status,
      progressPct: courseEnrollments.progressPct,
      enrolledAt: courseEnrollments.enrolledAt,
      completedAt: courseEnrollments.completedAt,
      courseTitle: courses.title,
      courseProvider: courses.provider,
      courseDurationMinutes: courses.durationMinutes,
      employeeFirst: employees.firstName,
      employeeLast: employees.lastName,
    })
    .from(courseEnrollments)
    .innerJoin(courses, eq(courseEnrollments.courseId, courses.id))
    .leftJoin(employees, eq(courseEnrollments.employeeId, employees.id))
    .where(and(...clauses))
    .orderBy(desc(courseEnrollments.enrolledAt));
  return NextResponse.json({ enrollments: rows });
}

/**
 * Enroll an employee in a course. If already enrolled, returns the existing
 * row (idempotent). Unique index on (employee_id, course_id) enforces this
 * at the DB layer too.
 */
export async function POST(request: NextRequest) {
  const gate = await ctxOr401(request);
  if ("error" in gate) return gate.error;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

  const employeeId = Number(body.employeeId);
  const courseId = Number(body.courseId);
  if (!Number.isInteger(employeeId) || employeeId <= 0) return NextResponse.json({ error: "invalid_employee_id" }, { status: 400 });
  if (!Number.isInteger(courseId) || courseId <= 0) return NextResponse.json({ error: "invalid_course_id" }, { status: 400 });

  if (!(await assertEmployeeInCompany(employeeId, gate.ctx.companyId))) {
    return NextResponse.json({ error: "employee_not_in_company" }, { status: 404 });
  }

  const [existingCourse] = await db.select({ id: courses.id }).from(courses).where(eq(courses.id, courseId)).limit(1);
  if (!existingCourse) return NextResponse.json({ error: "course_not_found" }, { status: 404 });

  // Idempotent enroll — return the existing row if we already have one.
  const [existing] = await db
    .select()
    .from(courseEnrollments)
    .where(and(eq(courseEnrollments.employeeId, employeeId), eq(courseEnrollments.courseId, courseId)))
    .limit(1);
  if (existing) return NextResponse.json({ ok: true, enrollment: existing, existed: true });

  const [row] = await db.insert(courseEnrollments).values({
    companyId: gate.ctx.companyId,
    employeeId,
    courseId,
    status: "enrolled",
    progressPct: 0,
  }).returning();
  return NextResponse.json({ ok: true, enrollment: row, existed: false });
}

/**
 * Update progress or mark complete. Progress 100 auto-flips status to
 * completed and sets completedAt; explicit status='completed' does the same.
 */
export async function PATCH(request: NextRequest) {
  const gate = await ctxOr401(request);
  if ("error" in gate) return gate.error;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const id = Number(body.id);
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: "invalid_id" }, { status: 400 });

  const [existing] = await db
    .select()
    .from(courseEnrollments)
    .where(and(eq(courseEnrollments.id, id), eq(courseEnrollments.companyId, gate.ctx.companyId)))
    .limit(1);
  if (!existing) return NextResponse.json({ error: "not_found_or_not_yours" }, { status: 404 });

  const patch: Record<string, unknown> = { updatedAt: new Date() };
  let newStatus: string | undefined;
  let newProgress: number | undefined;
  if (typeof body.status === "string" && STATUSES.has(body.status)) newStatus = body.status;
  if (body.progressPct !== undefined) {
    const p = Number(body.progressPct);
    if (!Number.isFinite(p) || p < 0 || p > 100) return NextResponse.json({ error: "progress_out_of_range" }, { status: 400 });
    newProgress = Math.round(p);
  }

  if (newProgress !== undefined) patch.progressPct = newProgress;
  if (newStatus) patch.status = newStatus;

  // Auto-transition: if progress hits 100 without an explicit status, mark
  // completed. If status becomes completed, snap progress to 100 and set
  // completedAt if not already set.
  const finalProgress = newProgress ?? existing.progressPct;
  const finalStatus = newStatus ?? existing.status;
  if (finalProgress === 100 && finalStatus !== "completed" && !newStatus) {
    patch.status = "completed";
  }
  if ((patch.status ?? finalStatus) === "completed") {
    patch.progressPct = 100;
    if (!existing.completedAt) patch.completedAt = new Date();
  }
  if (finalProgress > 0 && finalProgress < 100 && !newStatus && existing.status === "enrolled") {
    patch.status = "in_progress";
  }

  const [row] = await db.update(courseEnrollments).set(patch).where(eq(courseEnrollments.id, id)).returning();
  return NextResponse.json({ ok: true, enrollment: row });
}
