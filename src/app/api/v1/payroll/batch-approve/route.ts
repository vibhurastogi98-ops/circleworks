/**
 * POST /api/v1/payroll/batch-approve — Approve multiple payroll runs (accountant portal)
 *
 * Section 35: Batch Endpoints
 */

import { NextResponse } from "next/server";
import { db } from "@/db";
import { payrolls } from "@/db/schema";
import { inArray, eq } from "drizzle-orm";
import { dispatchWebhook } from "../../../../../lib/webhooks";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!Array.isArray(body.runIds) || body.runIds.length === 0) {
      return NextResponse.json(
        { error: "invalid_body", message: "Body must contain a non-empty 'runIds' array." },
        { status: 400 }
      );
    }

    const runIds: number[] = body.runIds.map(Number).filter((id: number) => !isNaN(id));

    if (runIds.length > 50) {
      return NextResponse.json(
        { error: "batch_limit_exceeded", message: "Maximum 50 payroll runs per batch-approve request." },
        { status: 400 }
      );
    }

    // Fetch runs to be approved — only approve 'pending' runs
    const runsToApprove = await db
      .select()
      .from(payrolls)
      .where(inArray(payrolls.id, runIds));

    const pendingRuns = runsToApprove.filter((r) => r.status === "pending");
    const skipped = runsToApprove.filter((r) => r.status !== "pending").map((r) => r.id);
    const notFound = runIds.filter((id) => !runsToApprove.find((r) => r.id === id));

    if (pendingRuns.length === 0) {
      return NextResponse.json(
        {
          error: "no_approvable_runs",
          message: "None of the provided run IDs are in 'pending' status.",
          skipped,
          notFound,
        },
        { status: 422 }
      );
    }

    // Approve each pending run
    const pendingIds = pendingRuns.map((r) => r.id);
    await db
      .update(payrolls)
      .set({ status: "processed" })
      .where(inArray(payrolls.id, pendingIds));

    // Fire 'payroll.completed' webhook for each approved run (non-blocking)
    pendingRuns.forEach((run) => {
      dispatchWebhook("payroll.completed", {
        runId: run.id,
        payPeriodStart: run.payPeriodStart,
        payPeriodEnd: run.payPeriodEnd,
        totalGross: run.totalGross,
        totalNet: run.totalNet,
        employeeCount: null, // computed separately if needed
      }).catch((err: any) => console.error("[Webhook] payroll.completed failed", err));
    });

    console.log(`[Batch POST /payroll/batch-approve] Approved ${pendingRuns.length} runs`);

    return NextResponse.json({
      approved: pendingRuns.length,
      approvedIds: pendingIds,
      skipped,
      notFound,
    });
  } catch (error: any) {
    console.error("[Batch POST /payroll/batch-approve]", error);
    return NextResponse.json({ error: "internal_error", message: error.message }, { status: 500 });
  }
}
