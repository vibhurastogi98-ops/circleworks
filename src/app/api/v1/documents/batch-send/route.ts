/**
 * POST /api/v1/documents/batch-send — Send a document to multiple employees
 *
 * Section 35: Batch Endpoints
 */

import { NextResponse } from "next/server";
import { db } from "@/db";
import { employeeDocuments, employees } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { dispatchWebhook } from "../../../../../lib/webhooks";

const BATCH_SEND_LIMIT = 200;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { documentName, documentType, fileUrl, employeeIds, companyId } = body;

    if (!documentName || !documentType || !Array.isArray(employeeIds) || employeeIds.length === 0) {
      return NextResponse.json(
        {
          error: "invalid_body",
          message: "Required fields: documentName, documentType, employeeIds (array).",
        },
        { status: 400 }
      );
    }

    if (employeeIds.length > BATCH_SEND_LIMIT) {
      return NextResponse.json(
        { error: "batch_limit_exceeded", message: `Maximum ${BATCH_SEND_LIMIT} employees per batch-send request.` },
        { status: 400 }
      );
    }

    const numericIds: number[] = employeeIds.map(Number).filter((id: number) => !isNaN(id));

    // Verify employees exist
    const validEmployees = await db
      .select({ id: employees.id, companyId: employees.companyId })
      .from(employees)
      .where(inArray(employees.id, numericIds));

    const validIds = validEmployees.map((e) => e.id);
    const invalidIds = numericIds.filter((id) => !validIds.includes(id));

    if (validIds.length === 0) {
      return NextResponse.json(
        { error: "no_valid_employees", message: "None of the provided employee IDs exist.", invalidIds },
        { status: 422 }
      );
    }

    // Insert a document record for each valid employee
    const now = new Date().toISOString();
    const insertData = validIds.map((empId) => ({
      employeeId: empId,
      name: documentName,
      type: documentType,
      fileUrl: fileUrl || null,
      status: "Unread" as const,
    }));

    const sent = await db.insert(employeeDocuments).values(insertData).returning();

    // Fire 'document.signed' webhook placeholder (non-blocking) — fires when each doc is eventually signed
    // For batch-send we fire a batch_document_sent event instead
    sent.forEach((doc) => {
      dispatchWebhook("document.signed", {
        documentId: doc.id,
        documentType: doc.type,
        employeeId: doc.employeeId,
        signedAt: null, // will be updated when employee signs
        companyId: companyId || validEmployees.find((e) => e.id === doc.employeeId)?.companyId || null,
      }).catch((err: any) => console.error("[Webhook] document.signed (batch-send) failed", err));
    });

    console.log(`[Batch POST /documents/batch-send] Sent '${documentName}' to ${sent.length} employees`);

    return NextResponse.json(
      {
        sent: sent.length,
        skipped: invalidIds.length,
        invalidIds,
        documentIds: sent.map((d) => d.id),
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[Batch POST /documents/batch-send]", error);
    return NextResponse.json({ error: "internal_error", message: error.message }, { status: 500 });
  }
}
