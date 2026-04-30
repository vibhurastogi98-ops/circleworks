import { db } from "@/db";
import { employees, expenseReports, payrolls, users } from "@/db/schema";
import { mockExpenseReports } from "@/data/mockExpenses";
import { and, eq, isNull } from "drizzle-orm";

export interface PayrollReimbursementLine {
  expenseReportId: string | number;
  employeeId: string | number;
  employeeName: string;
  description: string;
  amount: number;
  approvedBy: string;
  approvedDate: string | null;
  includeInThisRun: boolean;
  deferToNextRun: boolean;
  nonTaxable: true;
  flags: Array<"terminated_manual_check" | "contractor_1099_consideration">;
}

export interface PayrollReimbursementResult {
  reimbursements: PayrollReimbursementLine[];
}

export function buildMockPayrollReimbursements(): PayrollReimbursementResult {
  const reimbursements = [
    {
      expenseReportId: "ER-002",
      employeeId: "emp-004",
      employeeName: "Jordan Brown",
      description: "WFH Equipment - March 2026",
      amount: 149.99,
      approvedBy: "Sarah Chen",
      approvedDate: "2026-03-30T14:25:00Z",
      includeInThisRun: true,
      deferToNextRun: false,
      nonTaxable: true as const,
      flags: [] as Array<"terminated_manual_check" | "contractor_1099_consideration">,
    },
    {
      expenseReportId: "ER-004",
      employeeId: "emp-019",
      employeeName: "Taylor Smith",
      description: "Field Visit Travel Reimbursement",
      amount: 212.4,
      approvedBy: "Sarah Chen",
      approvedDate: "2026-04-03T10:15:00Z",
      includeInThisRun: true,
      deferToNextRun: false,
      nonTaxable: true as const,
      flags: ["terminated_manual_check"] as Array<"terminated_manual_check" | "contractor_1099_consideration">,
    },
    {
      expenseReportId: "ER-005",
      employeeId: "emp-031",
      employeeName: "Alex Clark",
      description: "Production Equipment Rental",
      amount: 640.0,
      approvedBy: "Jamie HR",
      approvedDate: "2026-04-02T16:40:00Z",
      includeInThisRun: true,
      deferToNextRun: false,
      nonTaxable: true as const,
      flags: ["contractor_1099_consideration"] as Array<"terminated_manual_check" | "contractor_1099_consideration">,
    },
  ];

  return { reimbursements };
}

export async function getPayrollReimbursements(runId: string): Promise<PayrollReimbursementResult> {
  if (!/^\d+$/.test(runId)) {
    return buildMockPayrollReimbursements();
  }

  const payrollId = Number(runId);
  const [run] = await db.select().from(payrolls).where(eq(payrolls.id, payrollId)).limit(1);
  if (!run) return buildMockPayrollReimbursements();

  const rows = await db
    .select({
      expenseReportId: expenseReports.id,
      employeeId: employees.id,
      firstName: employees.firstName,
      lastName: employees.lastName,
      description: expenseReports.title,
      amount: expenseReports.totalAmount,
      approvedDate: expenseReports.approvedAt,
      approvedByName: users.email,
      status: expenseReports.status,
      payType: employees.payType,
      employeeStatus: employees.status,
    })
    .from(expenseReports)
    .innerJoin(employees, eq(expenseReports.employeeId, employees.id))
    .leftJoin(users, eq(expenseReports.approvedBy, users.id))
    .where(
      and(
        eq(expenseReports.companyId, run.companyId as number),
        eq(expenseReports.status, "pending_payroll"),
        isNull(expenseReports.payrollRunId)
      )
    );

  return {
    reimbursements: rows.map((row) => ({
      expenseReportId: row.expenseReportId,
      employeeId: row.employeeId,
      employeeName: `${row.firstName} ${row.lastName || ""}`.trim(),
      description: row.description,
      amount: (row.amount || 0) / 100,
      approvedBy: row.approvedByName || "Payroll Admin",
      approvedDate: row.approvedDate?.toISOString?.() || null,
      includeInThisRun: true,
      deferToNextRun: false,
      nonTaxable: true,
      flags: [
        ...(row.employeeStatus === "terminated" ? ["terminated_manual_check" as const] : []),
        ...(row.payType === "contractor" && (row.amount || 0) >= 60000 ? ["contractor_1099_consideration" as const] : []),
      ],
    })),
  };
}
