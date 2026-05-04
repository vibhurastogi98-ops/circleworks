import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { ewaAdvances, payrolls } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/session";

// Called when a payroll run is approved/completed. Persists EWA repayment
// status changes: outstanding/partial advances that were included become
// 'repaid' or 'partial'; deferred advances are left unchanged.
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
      .select({ id: payrolls.id, checkDate: payrolls.checkDate })
      .from(payrolls)
      .where(eq(payrolls.id, payrollId))
      .limit(1);

    if (!run) {
      return NextResponse.json({ error: "Payroll run not found" }, { status: 404 });
    }

    const body = await req.json();
    const { repayments } = body as {
      repayments: Array<{
        advanceId: number;
        deductionAmount: number;
        deferToNextRun: boolean;
      }>;
    };

    if (!Array.isArray(repayments) || repayments.length === 0) {
      return NextResponse.json({ error: "No repayments provided" }, { status: 400 });
    }

    const now = new Date();
    let repaidCount = 0;
    let partialCount = 0;
    let deferredCount = 0;

    for (const line of repayments) {
      if (line.deferToNextRun) {
        deferredCount++;
        continue;
      }

      const [advance] = await db
        .select({ id: ewaAdvances.id, remainingBalance: ewaAdvances.remainingBalance })
        .from(ewaAdvances)
        .where(eq(ewaAdvances.id, line.advanceId))
        .limit(1);

      if (!advance) continue;

      const applied = Math.min(line.deductionAmount, advance.remainingBalance);
      const newBalance = Math.max(0, Math.round((advance.remainingBalance - applied) * 100) / 100);
      const newStatus = newBalance > 0 ? "partial" : "repaid";

      await db
        .update(ewaAdvances)
        .set({
          remainingBalance: newBalance,
          repaymentRunId: payrollId,
          status: newStatus,
          updatedAt: now,
        })
        .where(eq(ewaAdvances.id, advance.id));

      if (newStatus === "repaid") repaidCount++;
      else partialCount++;
    }

    console.log(
      `[EWA Finalize] Run ${payrollId}: ${repaidCount} repaid, ${partialCount} partial, ${deferredCount} deferred`
    );

    return NextResponse.json({
      success: true,
      repaidCount,
      partialCount,
      deferredCount,
      message: `EWA finalized for payroll run ${run.checkDate}: ${repaidCount} fully repaid, ${partialCount} partial.`,
    });
  } catch (error: any) {
    console.error("[EWA Finalize Error]", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
