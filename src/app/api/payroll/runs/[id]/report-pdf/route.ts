import React, { type ReactElement } from "react";
import { NextRequest, NextResponse } from "next/server";
import { Queue } from "bullmq";
import { type DocumentProps, renderToBuffer } from "@react-pdf/renderer";
import { eq } from "drizzle-orm";
import { requireApiPermission } from "@/lib/apiRbac";
import { QUEUE_PDF_GENERATION, bullmqConnectionFromEnv } from "@/lib/bullmq-redis";
import { db } from "@/db";
import { employees, users } from "@/db/schema";
import { buildPayrollRunReportData } from "@/lib/payroll/build-payroll-run-report-data";
import { PayrollRunReportPdf } from "@/lib/payroll/PayrollRunReportPdf";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { session, response } = await requireApiPermission(req, "view_payroll");
    if (response) return response;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const [userEmployee] = await db
      .select({ companyId: employees.companyId })
      .from(employees)
      .innerJoin(users, eq(employees.userId, users.id))
      .where(eq(users.id, session.userId));

    if (!userEmployee?.companyId) {
      return NextResponse.json({ error: "Employee record not found" }, { status: 404 });
    }

    const companyId = userEmployee.companyId;

    const data = await buildPayrollRunReportData(id, companyId);
    if (!data) {
      return NextResponse.json({ error: "Payroll run not found" }, { status: 404 });
    }

    const conn = bullmqConnectionFromEnv();
    let jobId: string | undefined;
    if (conn) {
      const queue = new Queue(QUEUE_PDF_GENERATION, { connection: conn });
      try {
        const job = await queue.add(
          "payroll-run-report",
          {
            type: "payroll-run-report",
            runId: id,
            companyId,
            requestedBy: session.userId,
            runLabel: data.runIdLabel,
          },
          { removeOnComplete: 100 }
        );
        jobId = job.id != null ? String(job.id) : undefined;
      } finally {
        await queue.close();
      }
    }

    const buffer = await renderToBuffer(
      React.createElement(PayrollRunReportPdf, { data }) as ReactElement<DocumentProps>
    );

    const headers = new Headers();
    headers.set("Content-Type", "application/pdf");
    headers.set("Content-Disposition", `attachment; filename="payroll-run-${id.replace(/[^a-zA-Z0-9-_]/g, "_")}.pdf"`);
    if (jobId) headers.set("X-Pdf-Job-Id", jobId);
    if (!conn) headers.set("X-Pdf-Queue", "skipped-no-redis");

    return new NextResponse(new Uint8Array(buffer), { status: 200, headers });
  } catch (error: unknown) {
    console.error("[POST /api/payroll/runs/.../report-pdf]", error);
    const message = error instanceof Error ? error.message : "Failed to generate report";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
