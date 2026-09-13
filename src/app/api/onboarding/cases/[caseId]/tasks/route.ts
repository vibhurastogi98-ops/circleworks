import { NextResponse, type NextRequest } from "next/server";
import { and, asc, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  employees,
  onboardingCases,
  onboardingTaskCompletions,
  onboardingTasks,
} from "@/db/schema";
import { getSession, resolveUserContext } from "@/lib/session";

export const dynamic = "force-dynamic";

/**
 * Loads a case, then asserts it belongs to the caller's company. Every
 * caseId-scoped operation goes through this so a caller can't peek at
 * another tenant's case.
 */
async function loadCaseForCompany(caseId: number, companyId: number) {
  const [row] = await db
    .select({
      id: onboardingCases.id,
      templateId: onboardingCases.templateId,
      employeeId: onboardingCases.employeeId,
      status: onboardingCases.status,
      startDate: onboardingCases.startDate,
    })
    .from(onboardingCases)
    .innerJoin(employees, eq(onboardingCases.employeeId, employees.id))
    .where(and(eq(onboardingCases.id, caseId), eq(employees.companyId, companyId)))
    .limit(1);
  return row ?? null;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ caseId: string }> }) {
  const session = await getSession(request);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const ctx = await resolveUserContext(session);
  if (!ctx?.companyId) return NextResponse.json({ error: "no_company" }, { status: 400 });

  const { caseId: caseIdStr } = await params;
  const caseId = Number(caseIdStr);
  if (!Number.isInteger(caseId) || caseId <= 0) return NextResponse.json({ error: "invalid_case_id" }, { status: 400 });

  const kase = await loadCaseForCompany(caseId, ctx.companyId);
  if (!kase) return NextResponse.json({ error: "not_found_or_not_yours" }, { status: 404 });
  if (!kase.templateId) return NextResponse.json({ case: kase, tasks: [] });

  const templateTasks = await db
    .select()
    .from(onboardingTasks)
    .where(eq(onboardingTasks.templateId, kase.templateId))
    .orderBy(asc(onboardingTasks.sortOrder), asc(onboardingTasks.id));

  const completedRows = await db
    .select({ taskId: onboardingTaskCompletions.taskId, completedAt: onboardingTaskCompletions.completedAt })
    .from(onboardingTaskCompletions)
    .where(eq(onboardingTaskCompletions.caseId, caseId));
  const completedById = new Map<number, Date>();
  for (const r of completedRows) if (r.taskId !== null) completedById.set(r.taskId, r.completedAt);

  const tasks = templateTasks.map((t) => ({
    id: t.id,
    title: t.title,
    assigneeRole: t.assigneeRole,
    dueOffsetDays: t.dueOffsetDays,
    sortOrder: t.sortOrder,
    completed: completedById.has(t.id),
    completedAt: completedById.get(t.id) ?? null,
  }));

  return NextResponse.json({ case: kase, tasks });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ caseId: string }> }) {
  const session = await getSession(request);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const ctx = await resolveUserContext(session);
  if (!ctx?.companyId) return NextResponse.json({ error: "no_company" }, { status: 400 });

  const { caseId: caseIdStr } = await params;
  const caseId = Number(caseIdStr);
  if (!Number.isInteger(caseId) || caseId <= 0) return NextResponse.json({ error: "invalid_case_id" }, { status: 400 });

  const body = (await request.json().catch(() => ({}))) as { taskId?: unknown; completed?: unknown };
  const taskId = Number(body.taskId);
  const completed = Boolean(body.completed);
  if (!Number.isInteger(taskId) || taskId <= 0) return NextResponse.json({ error: "invalid_task_id" }, { status: 400 });

  const kase = await loadCaseForCompany(caseId, ctx.companyId);
  if (!kase) return NextResponse.json({ error: "not_found_or_not_yours" }, { status: 404 });

  // Assert the task actually belongs to this case's template — otherwise a
  // caller could "complete" a task on their case that came from someone
  // else's template.
  const [task] = await db
    .select({ id: onboardingTasks.id, templateId: onboardingTasks.templateId })
    .from(onboardingTasks)
    .where(eq(onboardingTasks.id, taskId))
    .limit(1);
  if (!task || task.templateId !== kase.templateId) {
    return NextResponse.json({ error: "task_not_in_case_template" }, { status: 400 });
  }

  if (completed) {
    // Idempotent — unique (case_id, task_id) at the DB layer + ON CONFLICT
    // in the insert so multiple mark-complete clicks in the UI don't 500.
    await db
      .insert(onboardingTaskCompletions)
      .values({ caseId, taskId, completedBy: session.userId })
      .onConflictDoNothing();
  } else {
    await db
      .delete(onboardingTaskCompletions)
      .where(and(
        eq(onboardingTaskCompletions.caseId, caseId),
        eq(onboardingTaskCompletions.taskId, taskId),
      ));
  }

  return NextResponse.json({ ok: true, taskId, completed });
}
