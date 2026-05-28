/**
 * POST /api/v1/documents/batch-send — Send a document to multiple employees
 *
 * Section 35: Batch Endpoints
 */

import { db } from "@/db";
import { employeeDocuments, employees } from "@/db/schema";
import { versionedResponse } from "@/lib/apiVersioning";
import { inArray } from "drizzle-orm";

const BATCH_SEND_LIMIT = 200;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { documentName, documentType, fileUrl, employeeIds } = body;

    if (!documentName || !documentType || !Array.isArray(employeeIds) || employeeIds.length === 0) {
      return versionedResponse(
        {
          error: "invalid_body",
          message: "Required fields: documentName, documentType, employeeIds (array).",
        },
        "v1",
        req,
        400
      );
    }

    if (employeeIds.length > BATCH_SEND_LIMIT) {
      return versionedResponse(
        { error: "batch_limit_exceeded", message: `Maximum ${BATCH_SEND_LIMIT} employees per batch-send request.` },
        "v1",
        req,
        400
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
      return versionedResponse(
        { error: "no_valid_employees", message: "None of the provided employee IDs exist.", invalidIds },
        "v1",
        req,
        422
      );
    }

    // Insert a document record for each valid employee
    const insertData = validIds.map((empId) => ({
      employeeId: empId,
      name: documentName,
      type: documentType,
      fileUrl: fileUrl || null,
      status: "Unread" as const,
    }));

    const sent = await db.insert(employeeDocuments).values(insertData).returning();

    console.log(`[Batch POST /documents/batch-send] Sent '${documentName}' to ${sent.length} employees`);

    return versionedResponse(
      {
        sent: sent.length,
        skipped: invalidIds.length,
        invalidIds,
        documentIds: sent.map((d) => d.id),
      },
      "v1",
      req,
      201
    );
  } catch (error: any) {
    console.error("[Batch POST /documents/batch-send]", error);
    return versionedResponse({ error: "internal_error", message: error.message }, "v1", req, 500);
  }
}
