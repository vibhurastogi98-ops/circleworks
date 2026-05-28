/**
 * POST /api/v1/payroll/batch-approve — Approve multiple payroll runs (accountant portal)
 *
 * Section 35: Batch Endpoints
 */

import { db } from "@/db";
import { payrolls } from "@/db/schema";
import { versionedResponse } from "@/lib/apiVersioning";
import { inArray } from "drizzle-orm";
import { dispatchWebhook } from "../../../../../lib/webhooks";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!Array.isArray(body.runIds) || body.runIds.length === 0) {
      return versionedResponse(
        { error: "invalid_body", message: "Body must contain a non-empty 'runIds' array." },
        "v1",
        req,
        400
      );
    }

    const runIds: number[] = body.runIds.map(Number).filter((id: number) => !isNaN(id));

    if (runIds.length > 50) {
      return versionedResponse(
        { error: "batch_limit_exceeded", message: "Maximum 50 payroll runs per batch-approve request." },
        "v1",
        req,
        400
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
      return versionedResponse(
        {
          error: "no_approvable_runs",
          message: "None of the provided run IDs are in 'pending' status.",
          skipped,
          notFound,
        },
        "v1",
        req,
        422
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

    return versionedResponse({
      approved: pendingRuns.length,
      approvedIds: pendingIds,
      skipped,
      notFound,
    }, "v1", req);
  } catch (error: any) {
    console.error("[Batch POST /payroll/batch-approve]", error);
    return versionedResponse({ error: "internal_error", message: error.message }, "v1", req, 500);
  }
}
