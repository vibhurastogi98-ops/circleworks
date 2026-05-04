import { db } from "@/db";
import { ewaAdvances, employees, payrolls } from "@/db/schema";
import { and, eq, inArray, or } from "drizzle-orm";
import { MOCK_EMPLOYEES } from "@/data/payrollRunMocks";
import { getOutstandingEwaAdvances } from "@/data/mockEwa";

export interface PayrollEwaRepaymentLine {
  advanceId: string;
  employeeId: string | number;
  employeeName: string;
  amount: number;
  deductionAmount: number;
  remainingBalance: number;
  issueDate: string;
  repaymentRunId: string | null;
  status: "outstanding" | "partial" | "repaid";
  includeInThisRun: boolean;
  deferToNextRun: boolean;
  stateMinimumWage: number;
  protectedNetFloor: number;
  availableNetAfterProtection: number;
  blockedByMinimumWage: boolean;
  tooltip: string;
  splitAcrossRuns?: boolean;
}

export interface PayrollEwaRepaymentResult {
  ewaRepayments: PayrollEwaRepaymentLine[];
}

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function buildRepaymentLine(
  advance: {
    id: string | number;
    employeeId: string | number;
    employeeName: string;
    amount: number;
    remainingBalance: number;
    issueDate: string;
    repaymentRunId: string | number | null;
    status: string;
    stateMinimumWage: number;
  },
  employeeNetPay: number,
  employeeHours: number
): PayrollEwaRepaymentLine {
  const protectedNetFloor = roundCurrency(advance.stateMinimumWage * employeeHours);
  const availableNetAfterProtection = roundCurrency(Math.max(0, employeeNetPay - protectedNetFloor));
  const deductionAmount = roundCurrency(advance.remainingBalance);
  const blockedByMinimumWage = deductionAmount > availableNetAfterProtection;

  return {
    advanceId: String(advance.id),
    employeeId: advance.employeeId,
    employeeName: advance.employeeName,
    amount: advance.amount,
    deductionAmount,
    remainingBalance: advance.remainingBalance,
    issueDate: advance.issueDate,
    repaymentRunId: advance.repaymentRunId !== null ? String(advance.repaymentRunId) : null,
    status: advance.status as "outstanding" | "partial" | "repaid",
    includeInThisRun: true,
    deferToNextRun: false,
    stateMinimumWage: advance.stateMinimumWage,
    protectedNetFloor,
    availableNetAfterProtection,
    blockedByMinimumWage,
    tooltip: `EWA advance of ${formatCurrency(advance.remainingBalance)} issued ${formatDate(advance.issueDate)} — repaying via this run`,
  };
}

async function getMockRepayments(): Promise<PayrollEwaRepaymentResult> {
  const byEmployeeId = new Map(MOCK_EMPLOYEES.map((employee) => [employee.id, employee]));
  const ewaRepayments = getOutstandingEwaAdvances().map((advance) => {
    const employee = byEmployeeId.get(String(advance.employeeId));
    const hours = employee?.hours ?? employee?.timesheetImport?.totalHours ?? 80;
    return buildRepaymentLine(
      {
        id: advance.id,
        employeeId: advance.employeeId,
        employeeName: advance.employeeName,
        amount: advance.amount,
        remainingBalance: advance.remainingBalance,
        issueDate: advance.issueDate,
        repaymentRunId: advance.repaymentRunId,
        status: advance.status,
        stateMinimumWage: advance.stateMinimumWage,
      },
      employee?.netPay ?? 0,
      hours
    );
  });
  return { ewaRepayments };
}

export async function getPayrollEwaRepayments(runId: string): Promise<PayrollEwaRepaymentResult> {
  if (!/^\d+$/.test(runId)) {
    return getMockRepayments();
  }

  const payrollId = Number(runId);
  const [run] = await db
    .select({ companyId: payrolls.companyId })
    .from(payrolls)
    .where(eq(payrolls.id, payrollId))
    .limit(1);

  if (!run) return getMockRepayments();

  // Fetch all hourly + salary employees in this company who have outstanding/partial advances.
  const employeeList = await db
    .select({
      id: employees.id,
      firstName: employees.firstName,
      lastName: employees.lastName,
      salary: employees.salary,
    })
    .from(employees)
    .where(eq(employees.companyId, run.companyId as number));

  if (employeeList.length === 0) return { ewaRepayments: [] };

  const employeeIds = employeeList.map((e) => e.id);
  const advances = await db
    .select()
    .from(ewaAdvances)
    .where(
      and(
        inArray(ewaAdvances.employeeId, employeeIds),
        or(eq(ewaAdvances.status, "outstanding"), eq(ewaAdvances.status, "partial"))
      )
    );

  if (advances.length === 0) return { ewaRepayments: [] };

  const employeeById = new Map(employeeList.map((e) => [e.id, e]));

  const ewaRepayments = advances.map((advance) => {
    const employee = employeeById.get(advance.employeeId);
    const fullName = employee
      ? `${employee.firstName} ${employee.lastName ?? ""}`.trim()
      : "Unknown";
    const monthlySalary = employee?.salary ?? 0;
    const biweeklyNet = roundCurrency((monthlySalary / 12) * (12 / 26) * 0.72);

    return buildRepaymentLine(
      {
        id: advance.id,
        employeeId: advance.employeeId,
        employeeName: fullName,
        amount: advance.amount,
        remainingBalance: advance.remainingBalance,
        issueDate: advance.issueDate,
        repaymentRunId: advance.repaymentRunId,
        status: advance.status ?? "outstanding",
        stateMinimumWage: advance.stateMinimumWage ?? 7.25,
      },
      biweeklyNet,
      80
    );
  });

  return { ewaRepayments };
}
