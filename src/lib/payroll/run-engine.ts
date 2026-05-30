import { db } from "@/db";
import { payrolls, payrollTimeImports } from "@/db/schema";
import { eq } from "drizzle-orm";

import { syncPayrollBenefitDeductionsForRun } from "@/lib/payroll/deductions";
import { getPayrollEwaRepayments } from "@/lib/payroll/ewa-repayments";
import { getTimesheetHoursImport } from "@/lib/payroll/timesheet-import";

export type PayrollRunEngineInput = {
  companyId: number;
  payPeriodStart: string;
  payPeriodEnd: string;
  checkDate: string;
  type?: string;
  timeImportMissingMode?: "continue" | "scheduled" | "wait";
  initialStatus?: "draft" | "pending";
  source?: "manual" | "autopilot";
  sourceConfigRunId?: string;
};

export type PayrollRunEngineResult =
  | {
      ok: true;
      status: number;
      run: {
        id: number;
        payPeriodStart: string;
        payPeriodEnd: string;
        checkDate: string;
        status: "draft" | "pending";
        type: string;
      };
      preflight: {
        hourlyEmployeeCount: number;
        approvedCount: number;
        missingCount: number;
        missingEmployees: string[];
        lateCount: number;
        cutoffHoursBeforeRun: number;
        periodStart: string;
        periodEnd: string;
        benefitDeductions: {
          lineCount: number;
          totalAmount: number;
          paySchedule: string | null;
        };
        ewaRepayments: {
          lineCount: number;
          totalAmount: number;
          blockedCount: number;
        };
      };
      auditTrailEntry?: {
        time: string;
        actor: string;
        action: string;
      };
    }
  | {
      ok: false;
      status: number;
      error: string;
      message: string;
      preflight: {
        hourlyEmployeeCount: number;
        approvedCount: number;
        missingCount: number;
        missingEmployees: string[];
        lateCount: number;
        cutoffHoursBeforeRun: number;
        periodStart: string;
        periodEnd: string;
      };
      options: {
        continueWithApproved: string;
        waitForRemaining: string;
        useScheduledHoursForMissing: string;
      };
    };

export async function createPayrollRunWithEngine(input: PayrollRunEngineInput): Promise<PayrollRunEngineResult> {
  const {
    companyId,
    payPeriodStart,
    payPeriodEnd,
    checkDate,
    type = "regular",
    timeImportMissingMode = "continue",
    initialStatus = "draft",
    source = "manual",
    sourceConfigRunId,
  } = input;

  const [run] = await db
    .insert(payrolls)
    .values({ companyId, payPeriodStart, payPeriodEnd, checkDate, status: initialStatus, type })
    .returning({ id: payrolls.id });

  const importResult = await getTimesheetHoursImport(String(run.id), {
    useScheduledHoursForMissing: timeImportMissingMode === "scheduled",
  });

  if (timeImportMissingMode === "wait" && importResult.summary.missingCount > 0) {
    await db.delete(payrolls).where(eq(payrolls.id, run.id));
    return {
      ok: false,
      status: 409,
      error: "TIMESHEETS_MISSING",
      message: `${importResult.summary.missingCount} employees missing timesheets`,
      preflight: importResult.summary,
      options: {
        continueWithApproved: `Continue with ${importResult.summary.approvedCount}`,
        waitForRemaining: `Wait for remaining ${importResult.summary.missingCount}`,
        useScheduledHoursForMissing: "Use scheduled hours for missing",
      },
    };
  }

  const importedAt = new Date();
  for (const line of importResult.imports) {
    await db.insert(payrollTimeImports).values({
      payrollId: run.id,
      employeeId: Number(line.employeeId),
      timesheetId: line.timesheetId ?? null,
      source: line.source,
      regularHours: line.regularHours,
      overtimeHours: line.overtimeHours,
      doubleTimeHours: line.doubleTimeHours,
      totalHours: line.totalHours,
      dailyBreakdown: JSON.stringify(line.days),
      lateWithinCutoff: line.lateWithinCutoff,
      partialPeriodReason: line.partialPeriodReason ?? null,
      manuallyOverridden: false,
      importedAt,
      updatedAt: importedAt,
    });
  }

  const deductionResult = await syncPayrollBenefitDeductionsForRun(run.id);
  const ewaResult = await getPayrollEwaRepayments(String(run.id));
  const auditTrailEntry =
    source === "autopilot"
      ? {
          time: new Date().toISOString(),
          actor: "AutoPilot",
          action: `Auto-ran payroll ${run.id} using last run config${sourceConfigRunId ? ` from ${sourceConfigRunId}` : ""}`,
        }
      : undefined;

  return {
    ok: true,
    status: 201,
    run: { id: run.id, payPeriodStart, payPeriodEnd, checkDate, status: initialStatus, type },
    preflight: {
      ...importResult.summary,
      benefitDeductions: {
        lineCount: deductionResult.deductions.length,
        totalAmount: deductionResult.deductions.reduce((sum, line) => sum + line.perPaycheckAmount, 0),
        paySchedule: deductionResult.paySchedule,
      },
      ewaRepayments: {
        lineCount: ewaResult.ewaRepayments.length,
        totalAmount: ewaResult.ewaRepayments
          .filter((line) => line.includeInThisRun && !line.deferToNextRun)
          .reduce((sum, line) => sum + line.deductionAmount, 0),
        blockedCount: ewaResult.ewaRepayments.filter(
          (line) => line.blockedByMinimumWage && line.includeInThisRun && !line.deferToNextRun,
        ).length,
      },
    },
    auditTrailEntry,
  };
}
