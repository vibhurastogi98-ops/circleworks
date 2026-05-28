import { NextResponse } from "next/server";
import { Queue } from "bullmq";
import { QUEUE_PDF_GENERATION, bullmqConnectionFromEnv } from "@/lib/bullmq-redis";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body?.employeeId || !body?.email || !body?.signedDocuments?.length) {
      return NextResponse.json({ error: "Missing pre-boarding completion details" }, { status: 400 });
    }

    const conn = bullmqConnectionFromEnv();
    let jobId: string | undefined;

    if (conn) {
      const queue = new Queue(QUEUE_PDF_GENERATION, { connection: conn });
      try {
        const job = await queue.add(
          "new-hire-packet",
          {
            type: "new-hire-packet",
            employeeId: body.employeeId,
            email: body.email,
            employeeName: body.employeeName,
            companyName: body.companyName,
            startDate: body.startDate,
            officeLocation: body.officeLocation,
            hrContactEmail: body.hrContactEmail,
            hrContactPhone: body.hrContactPhone,
            signedDocuments: body.signedDocuments,
            documentFolder: body.documentFolder,
          },
          { removeOnComplete: 100 }
        );
        jobId = job.id != null ? String(job.id) : undefined;
      } finally {
        await queue.close();
      }
    }

    return NextResponse.json({
      completed: true,
      pdf_queue: conn ? "queued" : "skipped-no-redis",
      packet_job_id: jobId,
      documents_saved_to: body.documentFolder,
    });
  } catch (error) {
    console.error("[POST /api/preboarding/complete]", error);
    return NextResponse.json({ error: "Failed to complete pre-boarding" }, { status: 500 });
  }
}
