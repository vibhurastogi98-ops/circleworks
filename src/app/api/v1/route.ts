/**
 * GET /api/v1 — API version contract & discovery endpoint
 *
 * Returns versioning strategy, supported events, batch endpoints, and upload limits.
 * Section 35: API Versioning Strategy
 */

import { NextResponse } from "next/server";
import { getVersionContract, versionedResponse } from "@/lib/apiVersioning";
import { getUploadLimitsSummary } from "@/lib/uploadLimits";

export async function GET(req: Request) {
  const contract = getVersionContract();
  const uploadLimits = getUploadLimitsSummary();

  const body = {
    ...contract,
    webhook_events: [
      {
        event: "employee.created",
        payload: ["id", "firstName", "lastName", "email", "startDate", "departmentId", "companyId", "timestamp"],
      },
      {
        event: "employee.terminated",
        payload: ["id", "terminationDate", "terminationType", "finalPayDate", "companyId", "timestamp"],
      },
      {
        event: "payroll.completed",
        payload: ["runId", "payPeriodStart", "payPeriodEnd", "totalGross", "totalNet", "employeeCount"],
      },
      {
        event: "document.signed",
        payload: ["documentId", "documentType", "employeeId", "signedAt", "companyId"],
      },
      {
        event: "candidate.hired",
        payload: ["candidateId", "employeeId", "jobId", "startDate", "companyId", "timestamp"],
      },
    ],
    webhook_security: {
      method: "HMAC-SHA256",
      header: "X-CircleWorks-Signature",
      docs: "https://docs.circleworks.io/api/webhooks",
    },
    batch_endpoints: [
      { method: "POST", path: "/api/v1/employees/batch", description: "Create up to 100 employees", limit: 100 },
      { method: "GET",  path: "/api/v1/employees/batch?ids=...", description: "Fetch multiple employees by ID", limit: 100 },
      { method: "POST", path: "/api/v1/payroll/batch-approve", description: "Approve multiple payroll runs", limit: 50 },
      { method: "POST", path: "/api/v1/documents/batch-send", description: "Send document to multiple employees", limit: 200 },
    ],
    upload_limits: uploadLimits,
  };

  return versionedResponse(body, "v1", req, 200);
}
