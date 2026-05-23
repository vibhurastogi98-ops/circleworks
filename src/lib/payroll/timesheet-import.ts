import { db } from "@/db";
import { employees, payrolls, timesheets, paySchedules, timeEntries } from "@/db/schema";
import { MOCK_EMPLOYEES, PAY_PERIOD } from "@/data/payrollRunMocks";
import { and, eq, gte, lte, sql } from "drizzle-orm";

export interface TimesheetHoursDay {
  date: string;
  regularHours: number;
  overtimeHours: number;
  doubleTimeHours: number;
}

export interface TimesheetHoursImportLine {
  employeeId: number | string;
  employeeName: string;
  timesheetId?: number | null;
  source: "timesheet" | "scheduled" | "manual";
  regularHours: number;
  overtimeHours: number;
  doubleTimeHours: number;
  totalHours: number;
  importedAt: string;
  lateWithinCutoff: boolean;
  partialPeriodReason?: "new_hire" | "termination";
  days: TimesheetHoursDay[];
}

export interface TimesheetImportSummary {
  hourlyEmployeeCount: number;
  approvedCount: number;
  missingCount: number;
  missingEmployees: string[];
  lateCount: number;
  cutoffHoursBeforeRun: number;
  periodStart: string;
  periodEnd: string;
}

export interface TimesheetImportResult {
  summary: TimesheetImportSummary;
  imports: TimesheetHoursImportLine[];
}

const DEFAULT_CUTOFF_HOURS_BEFORE_RUN = 24;

function roundHours(value: number) {
  return Math.round(value * 100) / 100;
}

function toDateString(date: Date) {
  return date.toISOString().slice(0, 10);
}

function enumerateDays(startDate: string, endDate: string) {
  const days: string[] = [];
  const current = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  while (current <= end) {
    days.push(toDateString(current));
    current.setDate(current.getDate() + 1);
  }

  return days;
}

function daysBetweenInclusive(a: string, b: string): number {
  const start = new Date(`${a}T00:00:00`);
  const end = new Date(`${b}T00:00:00`);
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1);
}

function prorateForPartialPeriod(
  hours: number,
  periodStart: string,
  periodEnd: string,
  startDate: string | null | undefined,
  terminationDate: string | null | undefined
): number {
  const effectiveStart = startDate && startDate > periodStart ? startDate : periodStart;
  const effectiveEnd = terminationDate && terminationDate < periodEnd ? terminationDate : periodEnd;
  const totalDays = daysBetweenInclusive(periodStart, periodEnd);
  const workedDays = daysBetweenInclusive(effectiveStart, effectiveEnd);
  if (totalDays === 0) return hours;
  return roundHours(hours * workedDays / totalDays);
}

function distributeHours(totalHours: number, periodStart: string, periodEnd: string): TimesheetHoursDay[] {
  const weekdays = enumerateDays(periodStart, periodEnd).filter((date) => {
    const day = new Date(`${date}T00:00:00`).getDay();
    return day !== 0 && day !== 6;
  });
  const daily = weekdays.length > 0 ? roundHours(totalHours / weekdays.length) : totalHours;

  return weekdays.map((date, index) => {
    const isLast = index === weekdays.length - 1;
    const usedHours = daily * index;
    const regularHours = isLast ? roundHours(totalHours - usedHours) : daily;

    return {
      date,
      regularHours,
      overtimeHours: 0,
      doubleTimeHours: 0,
    };
  });
}

function emptyDay(date: string): TimesheetHoursDay {
  return {
    date,
    regularHours: 0,
    overtimeHours: 0,
    doubleTimeHours: 0,
  };
}

function entryBucket(entryType?: string | null) {
  const normalized = entryType?.toLowerCase() || "";
  if (normalized.includes("double")) return "doubleTimeHours" as const;
  if (normalized.includes("overtime")) return "overtimeHours" as const;
  return "regularHours" as const;
}

function calculateEntryHours(clockIn: Date, clockOut: Date | null) {
  if (!clockOut) return 0;
  return Math.max(0, (clockOut.getTime() - clockIn.getTime()) / 3_600_000);
}

function buildMockTimesheetImport(useScheduledHoursForMissing = false): TimesheetImportResult {
  const hourlyEmployees = MOCK_EMPLOYEES.filter((employee) => employee.payType === "hourly");
  const approvedCount = Math.max(0, hourlyEmployees.length - 5);
  const approvedEmployees = hourlyEmployees.slice(0, approvedCount);
  const missingEmployees = hourlyEmployees.slice(approvedCount);
  const importedAt = new Date().toISOString();

  const imports: TimesheetHoursImportLine[] = approvedEmployees.map((employee, index) => {
    const totalHours = employee.hours || 80;
    const overtimeHours = Math.max(0, totalHours - 80);
    const regularHours = totalHours - overtimeHours;

    return {
      employeeId: employee.id,
      employeeName: employee.name,
      source: "timesheet",
      regularHours,
      overtimeHours,
      doubleTimeHours: 0,
      totalHours,
      importedAt,
      lateWithinCutoff: index < 2,
      partialPeriodReason: index === 0 ? "new_hire" : index === 1 ? "termination" : undefined,
      days: distributeHours(totalHours, PAY_PERIOD.start, PAY_PERIOD.end),
    };
  });

  if (useScheduledHoursForMissing) {
    missingEmployees.forEach((employee) => {
      const totalHours = employee.hours || 80;
      imports.push({
        employeeId: employee.id,
        employeeName: employee.name,
        source: "scheduled",
        regularHours: totalHours,
        overtimeHours: 0,
        doubleTimeHours: 0,
        totalHours,
        importedAt,
        lateWithinCutoff: false,
        days: distributeHours(totalHours, PAY_PERIOD.start, PAY_PERIOD.end),
      });
    });
  }

  return {
    summary: {
      hourlyEmployeeCount: hourlyEmployees.length,
      approvedCount,
      missingCount: missingEmployees.length,
      missingEmployees: missingEmployees.map((employee) => employee.name),
      lateCount: imports.filter((line) => line.lateWithinCutoff).length,
      cutoffHoursBeforeRun: DEFAULT_CUTOFF_HOURS_BEFORE_RUN,
      periodStart: PAY_PERIOD.start,
      periodEnd: PAY_PERIOD.end,
    },
    imports,
  };
}

export async function getTimesheetHoursImport(
  runId: string,
  options: { useScheduledHoursForMissing?: boolean } = {}
): Promise<TimesheetImportResult> {
  if (!/^\d+$/.test(runId)) {
    return buildMockTimesheetImport(options.useScheduledHoursForMissing);
  }

  const payrollId = Number(runId);
  const [run] = await db.select().from(payrolls).where(eq(payrolls.id, payrollId)).limit(1);
  if (!run) return buildMockTimesheetImport(options.useScheduledHoursForMissing);

  const periodStartDate = new Date(`${run.payPeriodStart}T00:00:00`);
  const periodEndDate = new Date(`${run.payPeriodEnd}T23:59:59.999`);

  const [hourlyEmployees, approvedTimesheets, approvedEntries, defaultSchedule] = await Promise.all([
    db
      .select({
        id: employees.id,
        firstName: employees.firstName,
        lastName: employees.lastName,
        startDate: employees.startDate,
        terminationDate: employees.terminationDate,
        status: employees.status,
      })
      .from(employees)
      .where(
        and(
          eq(employees.companyId, run.companyId as number),
          eq(employees.payType, "hourly")
        )
      ),

    db
      .select({
        id: timesheets.id,
        employeeId: timesheets.employeeId,
        regularHours: timesheets.totalRegularHours,
        overtimeHours: timesheets.totalOvertimeHours,
        doubleTimeHours: timesheets.totalDoubleTimeHours,
        approvedAt: timesheets.approvedAt,
      })
      .from(timesheets)
      .where(
        and(
          eq(timesheets.companyId, run.companyId as number),
          eq(timesheets.periodEnd, run.payPeriodEnd),
          eq(timesheets.status, "Approved")
        )
      ),

    db
      .select({
        id: timeEntries.id,
        employeeId: timeEntries.employeeId,
        timesheetId: timeEntries.timesheetId,
        clockIn: timeEntries.clockIn,
        clockOut: timeEntries.clockOut,
        entryType: timeEntries.entryType,
        approvedAt: timesheets.approvedAt,
        periodEnd: timesheets.periodEnd,
      })
      .from(timeEntries)
      .innerJoin(timesheets, eq(timeEntries.timesheetId, timesheets.id))
      .innerJoin(employees, eq(timeEntries.employeeId, employees.id))
      .where(
        and(
          eq(timeEntries.companyId, run.companyId as number),
          eq(employees.payType, "hourly"),
          eq(timeEntries.status, "Approved"),
          eq(timesheets.status, "Approved"),
          eq(timesheets.periodEnd, run.payPeriodEnd),
          gte(timeEntries.clockIn, periodStartDate),
          lte(timeEntries.clockIn, periodEndDate),
          sql`${timeEntries.clockOut} is not null`
        )
      ),

    db
      .select({ cutoffHours: paySchedules.cutoffHoursBeforeRun })
      .from(paySchedules)
      .where(
        and(
          eq(paySchedules.companyId, run.companyId as number),
          eq(paySchedules.isDefault, true)
        )
      )
      .limit(1),
  ]);

  const cutoffHours = defaultSchedule[0]?.cutoffHours ?? DEFAULT_CUTOFF_HOURS_BEFORE_RUN;
  const sheetsByEmployee = new Map(approvedTimesheets.map((sheet) => [sheet.employeeId, sheet]));
  const entriesByEmployee = new Map<number, typeof approvedEntries>();
  approvedEntries.forEach((entry) => {
    if (!entry.employeeId) return;
    const entries = entriesByEmployee.get(entry.employeeId) || [];
    entries.push(entry);
    entriesByEmployee.set(entry.employeeId, entries);
  });
  const cutoffStart = new Date(run.checkDate);
  cutoffStart.setHours(cutoffStart.getHours() - cutoffHours);
  const importedAt = new Date().toISOString();
  const missingEmployees: string[] = [];

  const imports = hourlyEmployees.flatMap((employee) => {
    const fullName = `${employee.firstName} ${employee.lastName || ""}`.trim();
    const sheet = sheetsByEmployee.get(employee.id);
    const entries = entriesByEmployee.get(employee.id) || [];

    if (!sheet && entries.length === 0) {
      missingEmployees.push(fullName);
      if (!options.useScheduledHoursForMissing) return [];
    }

    const partialPeriodReason: "new_hire" | "termination" | undefined =
      employee.startDate && employee.startDate > run.payPeriodStart
        ? "new_hire"
        : employee.terminationDate && employee.terminationDate < run.payPeriodEnd
          ? "termination"
          : undefined;

    const daysByDate = new Map<string, TimesheetHoursDay>();
    entries.forEach((entry) => {
      const clockIn = entry.clockIn instanceof Date ? entry.clockIn : new Date(entry.clockIn);
      const clockOut = entry.clockOut instanceof Date || entry.clockOut === null ? entry.clockOut : new Date(entry.clockOut);
      const date = toDateString(clockIn);
      const bucket = entryBucket(entry.entryType);
      const day = daysByDate.get(date) || emptyDay(date);
      day[bucket] = roundHours(day[bucket] + calculateEntryHours(clockIn, clockOut));
      daysByDate.set(date, day);
    });

    let days = Array.from(daysByDate.values()).sort((a, b) => a.date.localeCompare(b.date));
    let regularHours = roundHours(days.reduce((sum, day) => sum + day.regularHours, 0));
    let overtimeHours = roundHours(days.reduce((sum, day) => sum + day.overtimeHours, 0));
    let doubleTimeHours = roundHours(days.reduce((sum, day) => sum + day.doubleTimeHours, 0));

    if (entries.length === 0 && sheet) {
      regularHours = roundHours(sheet.regularHours || 0);
      overtimeHours = roundHours(sheet.overtimeHours || 0);
      doubleTimeHours = roundHours(sheet.doubleTimeHours || 0);
    }

    if (!sheet && entries.length === 0) {
      regularHours = 80;
      overtimeHours = 0;
      doubleTimeHours = 0;
    }

    // Prorate scheduled hours for partial periods (approved timesheets already reflect actual days).
    if (!sheet && entries.length === 0 && partialPeriodReason) {
      const scheduledTotal = roundHours(regularHours + overtimeHours + doubleTimeHours);
      const prorated = prorateForPartialPeriod(
        scheduledTotal,
        run.payPeriodStart,
        run.payPeriodEnd,
        employee.startDate,
        employee.terminationDate
      );
      regularHours = prorated;
      overtimeHours = 0;
      doubleTimeHours = 0;
    }

    const totalHours = roundHours(regularHours + overtimeHours + doubleTimeHours);
    if (days.length === 0) {
      days = distributeHours(totalHours, run.payPeriodStart, run.payPeriodEnd);
    }

    return [{
      employeeId: employee.id,
      employeeName: fullName,
      timesheetId: sheet?.id ?? null,
      source: sheet || entries.length > 0 ? "timesheet" as const : "scheduled" as const,
      regularHours,
      overtimeHours,
      doubleTimeHours,
      totalHours,
      importedAt,
      lateWithinCutoff: Boolean(
        (sheet?.approvedAt && sheet.approvedAt >= cutoffStart) ||
        entries.some((entry) => entry.approvedAt && entry.approvedAt >= cutoffStart)
      ),
      partialPeriodReason,
      days,
    }];
  });

  const approvedEmployeeIds = new Set(
    hourlyEmployees
      .filter((employee) => sheetsByEmployee.has(employee.id) || (entriesByEmployee.get(employee.id) || []).length > 0)
      .map((employee) => employee.id)
  );

  return {
    summary: {
      hourlyEmployeeCount: hourlyEmployees.length,
      approvedCount: approvedEmployeeIds.size,
      missingCount: missingEmployees.length,
      missingEmployees,
      lateCount: imports.filter((line) => line.lateWithinCutoff).length,
      cutoffHoursBeforeRun: cutoffHours,
      periodStart: run.payPeriodStart,
      periodEnd: run.payPeriodEnd,
    },
    imports,
  };
}
