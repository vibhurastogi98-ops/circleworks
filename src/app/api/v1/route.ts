/**
 * GET /api/v1 — API version contract & discovery endpoint
 *
 * Returns versioning strategy, pagination standard, supported events, batch endpoints, and upload limits.
 * Section 35: API Versioning Strategy
 */

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
        payload: {
          id: "number",
          firstName: "string",
          lastName: "string | null",
          email: "string | null",
          startDate: "YYYY-MM-DD | null",
          departmentId: "string | null",
          companyId: "number | null",
          timestamp: "ISO8601",
        },
      },
      {
        event: "employee.terminated",
        payload: {
          id: "number",
          terminationDate: "YYYY-MM-DD",
          terminationType: "voluntary | involuntary | layoff | other",
          finalPayDate: "YYYY-MM-DD | null",
          companyId: "number | null",
          timestamp: "ISO8601",
        },
      },
      {
        event: "payroll.completed",
        payload: {
          runId: "number",
          payPeriodStart: "YYYY-MM-DD | null",
          payPeriodEnd: "YYYY-MM-DD | null",
          totalGross: "number | null",
          totalNet: "number | null",
          employeeCount: "number | null",
        },
      },
      {
        event: "document.signed",
        payload: {
          documentId: "number",
          documentType: "string",
          employeeId: "number | null",
          signedAt: "ISO8601",
          companyId: "number | null",
        },
      },
      {
        event: "candidate.hired",
        payload: {
          candidateId: "number",
          employeeId: "number | null",
          jobId: "number | null",
          startDate: "YYYY-MM-DD | null",
          companyId: "number | null",
          timestamp: "ISO8601",
        },
      },
    ],
    webhook_security: {
      delivery_method: "POST",
      method: "HMAC-SHA256",
      header: "X-CircleWorks-Signature",
      signed_content: "raw JSON request body",
      docs: "https://docs.circleworks.io/api/webhooks",
    },
    batch_endpoints: [
      { method: "POST", path: "/api/v1/employees/batch", description: "Create up to 100 employees", limit: 100 },
      { method: "GET",  path: "/api/v1/employees/batch?ids=id1,id2,id3", description: "Fetch multiple employees by ID", limit: 100 },
      { method: "POST", path: "/api/v1/payroll/batch-approve", description: "Approve multiple payroll runs for the accountant portal", limit: 50 },
      { method: "POST", path: "/api/v1/documents/batch-send", description: "Send document to multiple employees", limit: 200 },
    ],
    file_upload_error: {
      status: 413,
      reason: "Request Too Large",
      body: { error: "file_too_large", max_size_mb: 25 },
    },
    upload_limits: uploadLimits,
  };

  return versionedResponse(body, "v1", req, 200);
}
