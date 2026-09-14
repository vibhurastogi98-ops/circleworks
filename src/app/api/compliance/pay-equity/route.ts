import { NextResponse, type NextRequest } from "next/server";
import { and, eq, isNotNull, ne } from "drizzle-orm";

import { db } from "@/db";
import { employees } from "@/db/schema";
import { getSession, resolveUserContext } from "@/lib/session";

export const dynamic = "force-dynamic";

/**
 * Internal pay-equity analysis over the tenant's own employee salary data.
 * No external submission — this is a statistical view of what the company
 * already knows about itself, computed on the fly rather than stored.
 *
 * Groups: by department, by job title, and workspace-wide.
 * Metric per group: count, min, max, mean, median.
 * A note on the median: computed in JS from the raw salaries rather than in
 * SQL, because Postgres percentile_cont works differently across versions
 * and the row count per group is small enough that in-process is fine.
 */

function stats(salaries: number[]) {
  if (salaries.length === 0) {
    return { count: 0, min: 0, max: 0, mean: 0, median: 0 };
  }
  const sorted = [...salaries].sort((a, b) => a - b);
  const sum = sorted.reduce((s, n) => s + n, 0);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 === 0 ? Math.round((sorted[mid - 1] + sorted[mid]) / 2) : sorted[mid];
  return {
    count: sorted.length,
    min: sorted[0],
    max: sorted[sorted.length - 1],
    mean: Math.round(sum / sorted.length),
    median,
  };
}

export async function GET(request: NextRequest) {
  const session = await getSession(request);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const ctx = await resolveUserContext(session);
  if (!ctx?.companyId) return NextResponse.json({ error: "no_company" }, { status: 400 });

  // Employees with a real salary on file, active or onboarding.
  const rows = await db
    .select({
      id: employees.id,
      department: employees.department,
      jobTitle: employees.jobTitle,
      salary: employees.salary,
      status: employees.status,
    })
    .from(employees)
    .where(and(
      eq(employees.companyId, ctx.companyId),
      isNotNull(employees.salary),
      ne(employees.status, "terminated"),
    ));

  const withSalary = rows.filter((r) => (r.salary ?? 0) > 0);

  const workspace = stats(withSalary.map((r) => r.salary as number));

  const byDeptMap = new Map<string, number[]>();
  for (const r of withSalary) {
    const key = r.department?.trim() || "Unassigned";
    const list = byDeptMap.get(key) ?? [];
    list.push(r.salary as number);
    byDeptMap.set(key, list);
  }
  const byDepartment = [...byDeptMap.entries()]
    .map(([department, salaries]) => ({ department, ...stats(salaries) }))
    .sort((a, b) => b.count - a.count);

  const byTitleMap = new Map<string, number[]>();
  for (const r of withSalary) {
    const key = r.jobTitle?.trim() || "Untitled";
    const list = byTitleMap.get(key) ?? [];
    list.push(r.salary as number);
    byTitleMap.set(key, list);
  }
  const byJobTitle = [...byTitleMap.entries()]
    .map(([jobTitle, salaries]) => ({ jobTitle, ...stats(salaries) }))
    .sort((a, b) => b.count - a.count);

  // A rough intra-title dispersion flag: if the same title has count >= 2
  // and (max - min) / min > 20%, surface it as a "review candidate."
  const alerts = byJobTitle
    .filter((r) => r.count >= 2 && r.min > 0 && (r.max - r.min) / r.min > 0.2)
    .map((r) => ({
      jobTitle: r.jobTitle,
      spreadPct: Math.round(((r.max - r.min) / r.min) * 100),
      range: { min: r.min, max: r.max, count: r.count },
    }))
    .slice(0, 20);

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    coverage: {
      totalEmployees: rows.length,
      withSalaryOnFile: withSalary.length,
      missingSalary: rows.length - withSalary.length,
    },
    workspace,
    byDepartment,
    byJobTitle,
    alerts,
  });
}
