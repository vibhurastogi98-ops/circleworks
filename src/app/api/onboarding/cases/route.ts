import { NextResponse, type NextRequest } from "next/server";
import { and, desc, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  employees,
  onboardingCases,
  onboardingTaskCompletions,
  onboardingTasks,
  onboardingTemplates,
} from "@/db/schema";
import { getSession, resolveUserContext } from "@/lib/session";

export const dynamic = "force-dynamic";

/**
 * Active onboarding cases in this workspace, with the employee + template
 * joined and a per-case task count / completed count so the dashboard can
 * render a real progress bar.
 */
export async function GET(request: NextRequest) {
  const session = await getSession(request);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const ctx = await resolveUserContext(session);
  if (!ctx?.companyId) return NextResponse.json({ error: "no_company" }, { status: 400 });

  const rows = await db
    .select({
      id: onboardingCases.id,
      employeeId: onboardingCases.employeeId,
      templateId: onboardingCases.templateId,
      candidateId: onboardingCases.candidateId,
      status: onboardingCases.status,
      startDate: onboardingCases.startDate,
      createdAt: onboardingCases.createdAt,
      firstName: employees.firstName,
      lastName: employees.lastName,
      email: employees.email,
      avatar: employees.avatar,
      department: employees.department,
      jobTitle: employees.jobTitle,
      templateName: onboardingTemplates.name,
    })
    .from(onboardingCases)
    .innerJoin(employees, eq(onboardingCases.employeeId, employees.id))
    .leftJoin(onboardingTemplates, eq(onboardingCases.templateId, onboardingTemplates.id))
    .where(eq(employees.companyId, ctx.companyId))
    .orderBy(desc(onboardingCases.createdAt));

  if (rows.length === 0) return NextResponse.json({ cases: [] });

  // Per-case task totals (from the template).
  const templateIds = Array.from(new Set(rows.map((r) => r.templateId).filter((id): id is number => id !== null)));
  const taskCounts = templateIds.length
    ? await db
        .select({ templateId: onboardingTasks.templateId, n: sql<number>`count(*)::int` })
        .from(onboardingTasks)
        .where(sql`${onboardingTasks.templateId} IN ${templateIds}`)
        .groupBy(onboardingTasks.templateId)
    : [];
  const totalByTemplate = new Map<number, number>();
  for (const t of taskCounts) if (t.templateId !== null) totalByTemplate.set(t.templateId, t.n);

  // Per-case completion counts.
  const caseIds = rows.map((r) => r.id);
  const completions = caseIds.length
    ? await db
        .select({ caseId: onboardingTaskCompletions.caseId, n: sql<number>`count(*)::int` })
        .from(onboardingTaskCompletions)
        .where(sql`${onboardingTaskCompletions.caseId} IN ${caseIds}`)
        .groupBy(onboardingTaskCompletions.caseId)
    : [];
  const completedByCase = new Map<number, number>();
  for (const c of completions) completedByCase.set(c.caseId, c.n);

  const cases = rows.map((r) => {
    const total = r.templateId ? totalByTemplate.get(r.templateId) ?? 0 : 0;
    const done = completedByCase.get(r.id) ?? 0;
    const employeeName = `${r.firstName ?? ""} ${r.lastName ?? ""}`.trim() || "—";
    const percent = total > 0 ? Math.round((done / total) * 100) : 0;
    return {
      id: r.id,
      employeeId: r.employeeId,
      templateId: r.templateId,
      templateName: r.templateName,
      candidateId: r.candidateId,
      status: r.status,
      startDate: r.startDate,
      createdAt: r.createdAt,
      employeeName,
      email: r.email,
      avatar: r.avatar,
      department: r.department,
      jobTitle: r.jobTitle,
      taskTotal: total,
      taskCompleted: done,
      percent,
    };
  });

  return NextResponse.json({ cases });
}
