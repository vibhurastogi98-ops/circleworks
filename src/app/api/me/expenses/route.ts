import { NextResponse } from "next/server";
import { db } from "@/db";
import { expenseReports, employees, payrolls, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [userEmployee] = await db
      .select({ id: employees.id, companyId: employees.companyId })
      .from(employees)
      .leftJoin(users, eq(employees.userId, users.id))
      .where(eq(users.id, session.userId))
      .limit(1);

    if (!userEmployee) {
      return NextResponse.json([]);
    }

    const reports = await db
      .select({
        id: expenseReports.id,
        title: expenseReports.title,
        totalAmount: expenseReports.totalAmount,
        status: expenseReports.status,
        submittedAt: expenseReports.submittedAt,
        approvedAt: expenseReports.approvedAt,
        reimbursedAt: expenseReports.reimbursedAt,
        payrollRunId: expenseReports.payrollRunId,
        payrollCheckDate: payrolls.checkDate,
      })
      .from(expenseReports)
      .leftJoin(payrolls, eq(expenseReports.payrollRunId, payrolls.id))
      .where(eq(expenseReports.employeeId, userEmployee.id))
      .orderBy(desc(expenseReports.submittedAt));

    return NextResponse.json(
      reports.map((r) => ({
        id: r.id,
        title: r.title,
        totalAmount: (r.totalAmount || 0) / 100,
        status: r.status,
        submittedAt: r.submittedAt?.toISOString() ?? null,
        approvedAt: r.approvedAt?.toISOString() ?? null,
        reimbursedAt: r.reimbursedAt?.toISOString() ?? null,
        payrollRunId: r.payrollRunId,
        payrollRunLabel: r.payrollCheckDate
          ? `Reimbursed via Payroll ${new Date(r.payrollCheckDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
          : r.status === "pending_payroll"
          ? "Queued for next payroll run"
          : null,
      }))
    );
  } catch (error: any) {
    console.error("[Me Expenses GET Error]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
