/**
 * lib/webhooks.ts — Section 35: Webhook Event Dispatcher
 *
 * All webhooks:
 *   - POST to customer-configured URL
 *   - HMAC-SHA256 signature in X-CircleWorks-Signature header
 *   - Payload is JSON-serialized event envelope
 *
 * Supported events:
 *   employee.created
 *   employee.terminated
 *   payroll.completed
 *   document.signed
 *   candidate.hired
 */

import crypto from "crypto";

// ─── Event Payload Types ──────────────────────────────────────────────────────

export interface EmployeeCreatedPayload {
  id: number | null;
  firstName: string;
  lastName: string | null;
  email: string | null;
  startDate: string | null;
  departmentId: string | null;
  companyId: number | null;
  timestamp: string;
}

export interface EmployeeTerminatedPayload {
  id: number;
  terminationDate: string;
  terminationType: "voluntary" | "involuntary" | "layoff" | "other";
  finalPayDate: string | null;
  companyId: number | null;
  timestamp: string;
}

export interface PayrollCompletedPayload {
  runId: number;
  payPeriodStart: string | null;
  payPeriodEnd: string | null;
  totalGross: number | null;
  totalNet: number | null;
  employeeCount: number | null;
}

export interface DocumentSignedPayload {
  documentId: number;
  documentType: string;
  employeeId: number | null;
  signedAt: string | null;
  companyId: number | null;
}

export interface CandidateHiredPayload {
  candidateId: number;
  employeeId: number | null;
  jobId: number | null;
  startDate: string | null;
  companyId: number | null;
  timestamp: string;
}

// ─── Event Map ────────────────────────────────────────────────────────────────

export type WebhookEventName =
  | "employee.created"
  | "employee.terminated"
  | "payroll.completed"
  | "document.signed"
  | "candidate.hired";

type WebhookPayloadMap = {
  "employee.created": EmployeeCreatedPayload;
  "employee.terminated": EmployeeTerminatedPayload;
  "payroll.completed": PayrollCompletedPayload;
  "document.signed": DocumentSignedPayload;
  "candidate.hired": CandidateHiredPayload;
};

// ─── Webhook Envelope ─────────────────────────────────────────────────────────

export interface WebhookEnvelope<T> {
  event: WebhookEventName;
  api_version: string;
  delivered_at: string;
  payload: T;
}

// ─── HMAC Signing ─────────────────────────────────────────────────────────────

/**
 * Signs the raw JSON body string with the company webhook secret using HMAC-SHA256.
 * Customers should verify: HMAC-SHA256(secret, rawBody) === X-CircleWorks-Signature header.
 */
export function signPayload(rawBody: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
}

// ─── Dispatcher ───────────────────────────────────────────────────────────────

/**
 * Dispatches a webhook event to the company's configured endpoint.
 *
 * In production, this would:
 *   1. Look up the company's registered webhook URL + secret from the DB.
 *   2. POST the signed envelope.
 *   3. Retry on failure (handled by BullMQ queue).
 *
 * For now, it logs and POSTs to the configured WEBHOOK_ENDPOINT env var (if set).
 */
export async function dispatchWebhook<E extends WebhookEventName>(
  event: E,
  payload: WebhookPayloadMap[E]
): Promise<void> {
  const webhookUrl = process.env.WEBHOOK_ENDPOINT_URL;
  const webhookSecret = process.env.WEBHOOK_SECRET ?? "dev-secret-change-in-production";

  const envelope: WebhookEnvelope<WebhookPayloadMap[E]> = {
    event,
    api_version: "2025-01-01",
    delivered_at: new Date().toISOString(),
    payload,
  };

  const rawBody = JSON.stringify(envelope);
  const signature = signPayload(rawBody, webhookSecret);

  if (!webhookUrl) {
    // In development without a configured endpoint, just log
    console.log(`[Webhook] ${event}`, envelope);
    return;
  }

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CircleWorks-Signature": signature,
      "X-CircleWorks-Event": event,
      "X-CircleWorks-Api-Version": "2025-01-01",
    },
    body: rawBody,
  });

  if (!res.ok) {
    throw new Error(`[Webhook] Delivery failed for '${event}': HTTP ${res.status}`);
  }

  console.log(`[Webhook] Delivered '${event}' → ${webhookUrl} (${res.status})`);
}
