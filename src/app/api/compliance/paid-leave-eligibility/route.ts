import { NextResponse, type NextRequest } from "next/server";
import { and, eq, gte, ne, sql } from "drizzle-orm";

import { db } from "@/db";
import { employees, timesheets } from "@/db/schema";
import { getSession, resolveUserContext } from "@/lib/session";
import { programsForLocation } from "@/lib/paidLeave";

export const dynamic = "force-dynamic";

/**
 * Workspace-wide paid-leave eligibility rollup.
 * Pure internal calculation over real employee tenure + 12-month timesheet
 * hours — no external submission. Federal FMLA baseline is ≥ 12 months of
 * tenure AND ≥ 1250 hours in the last 12 months; state programs layer on
 * per work location.
 */

const FMLA_MIN_TENURE_MONTHS = 12;
const FMLA_MIN_HOURS_12MO = 1250;

function monthsBetween(from: Date, to: Date): number {
  const yearDiff = to.getUTCFullYear() - from.getUTCFullYear();
  const monthDiff = to.getUTCMonth() - from.getUTCMonth();
  return yearDiff * 12 + monthDiff;
}

export async function GET(request: NextRequest) {
  const session = await getSession(request);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const ctx = await resolveUserContext(session);
  if (!ctx?.companyId) return NextResponse.json({ error: "no_company" }, { status: 400 });

  // All non-terminated employees with a start date on file.
  const emps = await db
    .select({
      id: employees.id,
      firstName: employees.firstName,
      lastName: employees.lastName,
      location: employees.location,
      startDate: employees.startDate,
    })
    .from(employees)
    .where(and(eq(employees.companyId, ctx.companyId), ne(employees.status, "terminated")));

  const now = new Date();
  const twelveMonthsAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  // Aggregate last-12-month hours per employee from timesheets.
  const hoursRows = emps.length
    ? await db
        .select({
          employeeId: timesheets.employeeId,
          totalHours: sql<number>`coalesce(sum(coalesce(${timesheets.totalRegularHours},0) + coalesce(${timesheets.totalOvertimeHours},0) + coalesce(${timesheets.totalDoubleTimeHours},0)), 0)::float`,
        })
        .from(timesheets)
        .where(and(
          eq(timesheets.companyId, ctx.companyId),
          gte(timesheets.periodStart, twelveMonthsAgo),
        ))
        .groupBy(timesheets.employeeId)
    : [];
  const hoursByEmployee = new Map<number, number>();
  for (const r of hoursRows) if (r.employeeId !== null) hoursByEmployee.set(r.employeeId, r.totalHours);

  const rows = emps.map((e) => {
    const startDate = e.startDate ? new Date(`${e.startDate}T00:00:00`) : null;
    const tenureMonths = startDate ? monthsBetween(startDate, now) : 0;
    const hoursLast12mo = hoursByEmployee.get(e.id) ?? 0;
    const fmlaEligible = tenureMonths >= FMLA_MIN_TENURE_MONTHS && hoursLast12mo >= FMLA_MIN_HOURS_12MO;
    const statePrograms = programsForLocation(e.location ?? "");
    const primaryState = statePrograms[0]?.stateCode ?? null;
    return {
      employeeId: e.id,
      name: `${e.firstName ?? ""} ${e.lastName ?? ""}`.trim() || `Employee ${e.id}`,
      location: e.location ?? "Unassigned",
      startDate: e.startDate,
      tenureMonths,
      hoursLast12mo: Math.round(hoursLast12mo),
      fmlaEligible,
      fmlaGap: fmlaEligible ? null : {
        tenureShortBy: Math.max(0, FMLA_MIN_TENURE_MONTHS - tenureMonths),
        hoursShortBy: Math.max(0, FMLA_MIN_HOURS_12MO - hoursLast12mo),
      },
      stateProgramCount: statePrograms.length,
      primaryStateProgram: primaryState,
    };
  });

  const summary = {
    totalEmployees: rows.length,
    fmlaEligible: rows.filter((r) => r.fmlaEligible).length,
    tenureUnder12mo: rows.filter((r) => r.tenureMonths < FMLA_MIN_TENURE_MONTHS).length,
    hoursUnder1250: rows.filter((r) => r.hoursLast12mo < FMLA_MIN_HOURS_12MO).length,
  };

  return NextResponse.json({
    generatedAt: now.toISOString(),
    thresholds: { fmlaTenureMonths: FMLA_MIN_TENURE_MONTHS, fmlaHoursLast12mo: FMLA_MIN_HOURS_12MO },
    summary,
    rows,
  });
}
