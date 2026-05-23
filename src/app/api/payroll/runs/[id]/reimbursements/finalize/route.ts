import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { expenseReports, payrolls } from "@/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { getSession } from "@/lib/session";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const payrollId = parseInt(id);
    if (isNaN(payrollId)) {
      return NextResponse.json({ error: "Invalid payroll run ID" }, { status: 400 });
    }

    const [run] = await db
      .select({ id: payrolls.id, checkDate: payrolls.checkDate, companyId: payrolls.companyId })
      .from(payrolls)
      .where(eq(payrolls.id, payrollId))
      .limit(1);

    if (!run) {
      return NextResponse.json({ error: "Payroll run not found" }, { status: 404 });
    }

    const body = await req.json();
    const { reimbursements } = body as {
      reimbursements: Array<{
        expenseReportId: number | string;
        includeInThisRun: boolean;
        deferToNextRun: boolean;
      }>;
    };

    if (!Array.isArray(reimbursements) || reimbursements.length === 0) {
      return NextResponse.json({ error: "No reimbursements provided" }, { status: 400 });
    }

    const now = new Date();
    const included = reimbursements.filter((r) => r.includeInThisRun && !r.deferToNextRun);
    const deferred = reimbursements.filter((r) => r.deferToNextRun);

    let reimbursedCount = 0;

    if (included.length > 0) {
      const includedIds = included.map((r) => Number(r.expenseReportId));

      await db
        .update(expenseReports)
        .set({
          status: "reimbursed",
          payrollRunId: payrollId,
          reimbursedAt: now,
        })
        .where(
          and(
            inArray(expenseReports.id, includedIds),
            eq(expenseReports.companyId, run.companyId as number)
          )
        );

      reimbursedCount = includedIds.length;
    }

    // Deferred reports stay as pending_payroll with no payrollRunId — picked up in the next run.
    // No DB update needed for deferred items.

    console.log(
      `[Reimbursements Finalize] Run ${payrollId}: ${reimbursedCount} reimbursed, ${deferred.length} deferred`
    );

    return NextResponse.json({
      success: true,
      reimbursedCount,
      deferredCount: deferred.length,
      message: `${reimbursedCount} expense report(s) marked as Reimbursed via Payroll ${run.checkDate}.`,
    });
  } catch (error: any) {
    console.error("[Reimbursements Finalize Error]", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
