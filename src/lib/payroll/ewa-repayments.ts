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

export async function getPayrollEwaRepayments(_runId: string): Promise<PayrollEwaRepaymentResult> {
  const byEmployeeId = new Map(MOCK_EMPLOYEES.map((employee) => [employee.id, employee]));
  const ewaRepayments = getOutstandingEwaAdvances().map((advance) => {
    const employee = byEmployeeId.get(String(advance.employeeId));
    const hours = employee?.hours ?? employee?.timesheetImport?.totalHours ?? 80;
    const protectedNetFloor = roundCurrency(advance.stateMinimumWage * hours);
    const baseNetPay = employee?.netPay ?? 0;
    const availableNetAfterProtection = roundCurrency(Math.max(0, baseNetPay - protectedNetFloor));
    const deductionAmount = roundCurrency(advance.remainingBalance);
    const blockedByMinimumWage = deductionAmount > availableNetAfterProtection;

    return {
      advanceId: advance.id,
      employeeId: advance.employeeId,
      employeeName: advance.employeeName,
      amount: advance.amount,
      deductionAmount,
      remainingBalance: advance.remainingBalance,
      issueDate: advance.issueDate,
      repaymentRunId: advance.repaymentRunId,
      status: advance.status,
      includeInThisRun: true,
      deferToNextRun: false,
      stateMinimumWage: advance.stateMinimumWage,
      protectedNetFloor,
      availableNetAfterProtection,
      blockedByMinimumWage,
      tooltip: `EWA advance of ${formatCurrency(advance.remainingBalance)} issued ${formatDate(advance.issueDate)} — repaying via this run`,
    };
  });

  return { ewaRepayments };
}
