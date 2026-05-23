import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { payrolls, payrollTimeImports, employees, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getTimesheetHoursImport } from "@/lib/payroll/timesheet-import";
import { syncPayrollBenefitDeductionsForRun } from "@/lib/payroll/deductions";
import { getPayrollEwaRepayments } from "@/lib/payroll/ewa-repayments";
import { requireApiPermission } from "@/lib/apiRbac";

export async function POST(req: NextRequest) {
  try {
    const { session, response } = await requireApiPermission(req, "run_payroll");
    if (response) return response;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [userEmployee] = await db
      .select({ companyId: employees.companyId })
      .from(employees)
      .innerJoin(users, eq(employees.userId, users.id))
      .where(eq(users.id, session.userId));

    if (!userEmployee?.companyId) {
      return NextResponse.json({ error: "Employee record not found" }, { status: 404 });
    }

    const companyId = userEmployee.companyId;

    const body = await req.json().catch(() => ({}));
    const { payPeriodStart, payPeriodEnd, checkDate, type = "regular", timeImportMissingMode = "continue" } = body;

    if (!payPeriodStart || !payPeriodEnd || !checkDate) {
      return NextResponse.json(
        { error: "payPeriodStart, payPeriodEnd, and checkDate are required" },
        { status: 400 }
      );
    }

    const [run] = await db
      .insert(payrolls)
      .values({ companyId, payPeriodStart, payPeriodEnd, checkDate, status: "draft", type })
      .returning({ id: payrolls.id });

    // Auto-import approved time entries for all hourly employees in the pay period.
    const importResult = await getTimesheetHoursImport(String(run.id), {
      useScheduledHoursForMissing: timeImportMissingMode === "scheduled",
    });

    if (timeImportMissingMode === "wait" && importResult.summary.missingCount > 0) {
      await db.delete(payrolls).where(eq(payrolls.id, run.id));
      return NextResponse.json(
        {
          error: "TIMESHEETS_MISSING",
          message: `${importResult.summary.missingCount} employees missing timesheets`,
          preflight: importResult.summary,
          options: {
            continueWithApproved: `Continue with ${importResult.summary.approvedCount}`,
            waitForRemaining: `Wait for remaining ${importResult.summary.missingCount}`,
            useScheduledHoursForMissing: "Use scheduled hours for missing",
          },
        },
        { status: 409 }
      );
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

    // Auto-sync active benefit enrollments into deduction line items for the draft.
    const deductionResult = await syncPayrollBenefitDeductionsForRun(run.id);
    const ewaResult = await getPayrollEwaRepayments(String(run.id));

    return NextResponse.json(
      {
        run: { id: run.id, payPeriodStart, payPeriodEnd, checkDate, status: "draft", type },
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
              (line) => line.blockedByMinimumWage && line.includeInThisRun && !line.deferToNextRun
            ).length,
          },
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[POST /api/payroll/runs]", error);
    return NextResponse.json(
      { error: error.message || "Failed to create payroll run" },
      { status: 500 }
    );
  }
}
