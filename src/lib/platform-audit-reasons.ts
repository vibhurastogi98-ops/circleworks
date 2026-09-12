/**
 * Governed reason codes for every mutating platform-admin action.
 * Closed at compile time — adding a code requires a PR reviewed by compliance
 * and security. See docs/platform-admin-spec.md §6.4.
 *
 * `'other'` is intentionally last-resort and requires super_admin approval on
 * the same action (server-enforced in `withPlatformAudit`).
 */
export const PLATFORM_AUDIT_REASONS = [
  "support_ticket",
  "internal_investigation",
  "ach_return_response",
  "kyb_manual_review",
  "billing_correction",
  "security_incident",
  "legal_request",
  "compliance_review",
  "user_data_request",
  "system_maintenance",
  "other",
] as const;

export type PlatformAuditReason = (typeof PLATFORM_AUDIT_REASONS)[number];

const REASON_SET = new Set<string>(PLATFORM_AUDIT_REASONS);

export function isPlatformAuditReason(value: unknown): value is PlatformAuditReason {
  return typeof value === "string" && REASON_SET.has(value);
}

export const PLATFORM_AUDIT_REASON_LABELS: Record<PlatformAuditReason, string> = {
  support_ticket: "Support ticket",
  internal_investigation: "Internal investigation",
  ach_return_response: "ACH return response",
  kyb_manual_review: "KYB manual review",
  billing_correction: "Billing correction",
  security_incident: "Security incident",
  legal_request: "Legal request",
  compliance_review: "Compliance review",
  user_data_request: "User data request (GDPR / DPA)",
  system_maintenance: "System maintenance",
  other: "Other (requires super_admin approval)",
};

/** Reasons that require an external reference in `reasonNotes`. */
export const REASONS_REQUIRING_REFERENCE = new Set<PlatformAuditReason>([
  "support_ticket",
  "legal_request",
]);
