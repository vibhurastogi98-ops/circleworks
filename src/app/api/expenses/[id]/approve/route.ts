import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { expenseReports, employees, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireApiPermission } from "@/lib/apiRbac";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { session, response } = await requireApiPermission(_req, "approve_expenses");
    if (response) return response;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const reportId = parseInt(id);
    if (isNaN(reportId)) {
      return NextResponse.json({ error: "Invalid expense report ID" }, { status: 400 });
    }

    const [report] = await db
      .select()
      .from(expenseReports)
      .where(eq(expenseReports.id, reportId))
      .limit(1);

    if (!report) {
      return NextResponse.json({ error: "Expense report not found" }, { status: 404 });
    }

    if (report.status !== "Submitted") {
      return NextResponse.json(
        { error: `Cannot approve a report with status '${report.status}'` },
        { status: 409 }
      );
    }

    const [updated] = await db
      .update(expenseReports)
      .set({
        status: "pending_payroll",
        approvedAt: new Date(),
        approvedBy: session.userId,
      })
      .where(eq(expenseReports.id, reportId))
      .returning();

    // Emit WebSocket event to invalidate payroll preview cache (Rule 5)
    // @ts-ignore - global.io attached by custom server
    if (global.io) {
      const [approvingEmployee] = await db
        .select({ companyId: employees.companyId })
        .from(employees)
        .leftJoin(users, eq(employees.userId, users.id))
        .where(eq(users.id, session.userId))
        .limit(1);

      if (approvingEmployee?.companyId) {
        // @ts-ignore
        global.io.to(`company:${approvingEmployee.companyId}`).emit("expense.approved", {
          expenseId: String(reportId),
          amount: (updated.totalAmount || 0) / 100,
          employeeId: updated.employeeId,
        });
      }
    }

    console.log(`[Expense Approve] Report ${reportId} → pending_payroll by user ${session.userId}`);

    return NextResponse.json({
      success: true,
      expenseReportId: reportId,
      status: "pending_payroll",
      message: "Expense report approved and queued for next payroll run.",
    });
  } catch (error: any) {
    console.error("[Expense Approve Error]", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
