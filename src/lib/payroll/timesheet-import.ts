import { db } from "@/db";
import { employees, payrolls, timesheets } from "@/db/schema";
import { MOCK_EMPLOYEES, PAY_PERIOD } from "@/data/payrollRunMocks";
import { and, eq } from "drizzle-orm";

export interface TimesheetHoursDay {
  date: string;
  regularHours: number;
  overtimeHours: number;
  doubleTimeHours: number;
}

export interface TimesheetHoursImportLine {
  employeeId: number | string;
  employeeName: string;
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

  const hourlyEmployees = await db
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
    );

  const approvedTimesheets = await db
    .select({
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
    );

  const sheetsByEmployee = new Map(approvedTimesheets.map((sheet) => [sheet.employeeId, sheet]));
  const cutoffStart = new Date(run.checkDate);
  cutoffStart.setHours(cutoffStart.getHours() - DEFAULT_CUTOFF_HOURS_BEFORE_RUN);
  const importedAt = new Date().toISOString();
  const missingEmployees: string[] = [];

  const imports = hourlyEmployees.flatMap((employee) => {
    const fullName = `${employee.firstName} ${employee.lastName || ""}`.trim();
    const sheet = sheetsByEmployee.get(employee.id);

    if (!sheet) {
      missingEmployees.push(fullName);
      if (!options.useScheduledHoursForMissing) return [];
    }

    const regularHours = roundHours(sheet?.regularHours || 80);
    const overtimeHours = roundHours(sheet?.overtimeHours || 0);
    const doubleTimeHours = roundHours(sheet?.doubleTimeHours || 0);
    const totalHours = roundHours(regularHours + overtimeHours + doubleTimeHours);

    return [{
      employeeId: employee.id,
      employeeName: fullName,
      source: sheet ? "timesheet" as const : "scheduled" as const,
      regularHours,
      overtimeHours,
      doubleTimeHours,
      totalHours,
      importedAt,
      lateWithinCutoff: Boolean(sheet?.approvedAt && sheet.approvedAt >= cutoffStart),
      partialPeriodReason: employee.startDate && employee.startDate > run.payPeriodStart
        ? "new_hire" as const
        : employee.terminationDate && employee.terminationDate < run.payPeriodEnd
          ? "termination" as const
          : undefined,
      days: distributeHours(totalHours, run.payPeriodStart, run.payPeriodEnd),
    }];
  });

  return {
    summary: {
      hourlyEmployeeCount: hourlyEmployees.length,
      approvedCount: approvedTimesheets.length,
      missingCount: missingEmployees.length,
      missingEmployees,
      lateCount: imports.filter((line) => line.lateWithinCutoff).length,
      cutoffHoursBeforeRun: DEFAULT_CUTOFF_HOURS_BEFORE_RUN,
      periodStart: run.payPeriodStart,
      periodEnd: run.payPeriodEnd,
    },
    imports,
  };
}
