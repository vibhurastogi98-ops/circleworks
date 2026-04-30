export type EwaAdvanceStatus = "outstanding" | "partial" | "repaid";

export interface EwaAdvanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  amount: number;
  issueDate: string;
  repaymentRunId: string | null;
  status: EwaAdvanceStatus;
  remainingBalance: number;
  stateMinimumWage: number;
}

export const mockEwaAdvances: EwaAdvanceRecord[] = [
  {
    id: "ewa-001",
    employeeId: "1",
    employeeName: "Sarah Smith",
    amount: 500,
    issueDate: "2026-03-28",
    repaymentRunId: null,
    status: "outstanding",
    remainingBalance: 500,
    stateMinimumWage: 16.5,
  },
  {
    id: "ewa-002",
    employeeId: "2",
    employeeName: "Michael Chen",
    amount: 350,
    issueDate: "2026-03-30",
    repaymentRunId: null,
    status: "outstanding",
    remainingBalance: 350,
    stateMinimumWage: 16.5,
  },
  {
    id: "ewa-003",
    employeeId: "3",
    employeeName: "Emma Watson",
    amount: 1800,
    issueDate: "2026-03-27",
    repaymentRunId: null,
    status: "outstanding",
    remainingBalance: 1800,
    stateMinimumWage: 16.5,
  },
];

export function getOutstandingEwaAdvances() {
  return mockEwaAdvances.filter((advance) => advance.status === "outstanding" || advance.status === "partial");
}

export function issueEwaAdvance(record: Omit<EwaAdvanceRecord, "id" | "remainingBalance" | "repaymentRunId" | "status">) {
  const id = `ewa-${String(mockEwaAdvances.length + 1).padStart(3, "0")}`;
  const advance: EwaAdvanceRecord = {
    id,
    employeeId: record.employeeId,
    employeeName: record.employeeName,
    amount: record.amount,
    issueDate: record.issueDate,
    repaymentRunId: null,
    status: "outstanding",
    remainingBalance: record.amount,
    stateMinimumWage: record.stateMinimumWage,
  };
  mockEwaAdvances.unshift(advance);
  return advance;
}

export function deferEwaAdvanceToNextRun(advanceId: string) {
  const advance = mockEwaAdvances.find((entry) => entry.id === advanceId);
  if (!advance) return null;
  advance.repaymentRunId = null;
  return advance;
}

export function applyEwaRepayment(
  advanceId: string,
  payrollRunId: string,
  repaidAmount: number
) {
  const advance = mockEwaAdvances.find((entry) => entry.id === advanceId);
  if (!advance) return null;

  const remainingBalance = Math.max(0, Math.round((advance.remainingBalance - repaidAmount) * 100) / 100);
  advance.remainingBalance = remainingBalance;
  advance.repaymentRunId = payrollRunId;
  advance.status = remainingBalance > 0 ? "partial" : "repaid";
  return advance;
}
