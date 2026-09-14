-- compliance_filings — record-keeping for external govt submissions.
-- This app does not submit anything to the government; the row captures
-- what the tenant filed externally themselves + their real confirmation.

CREATE TABLE IF NOT EXISTS "compliance_filings" (
  "id" serial PRIMARY KEY NOT NULL,
  "company_id" integer NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
  "filing_type" text NOT NULL,
  "period" text NOT NULL,
  "status" text NOT NULL DEFAULT 'not_started',
  "external_confirmation_number" text,
  "filed_at" timestamp,
  "notes" text,
  "created_by" integer REFERENCES "users"("id") ON DELETE SET NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "compliance_filings_company_id_idx"
  ON "compliance_filings" ("company_id");
CREATE INDEX IF NOT EXISTS "compliance_filings_type_period_idx"
  ON "compliance_filings" ("company_id", "filing_type", "period");
