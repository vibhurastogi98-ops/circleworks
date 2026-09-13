-- Phase 8: creator client invoicing.
-- Distinct from agency_invoices (staff billing) — this is a creator billing
-- their own end customers.

CREATE TABLE IF NOT EXISTS "client_invoices" (
  "id" serial PRIMARY KEY NOT NULL,
  "company_id" integer NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
  "invoice_number" text NOT NULL,
  "client_name" text NOT NULL,
  "client_email" text,
  "issue_date" date NOT NULL,
  "due_date" date NOT NULL,
  "status" text NOT NULL DEFAULT 'Draft',
  "notes" text,
  "subtotal_cents" integer NOT NULL DEFAULT 0,
  "public_token" text,
  "sent_at" timestamp,
  "paid_at" timestamp,
  "created_by" integer REFERENCES "users"("id") ON DELETE SET NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "client_invoices_company_id_idx"
  ON "client_invoices" ("company_id");
CREATE UNIQUE INDEX IF NOT EXISTS "client_invoices_public_token_idx"
  ON "client_invoices" ("public_token") WHERE "public_token" IS NOT NULL;

CREATE TABLE IF NOT EXISTS "client_invoice_items" (
  "id" serial PRIMARY KEY NOT NULL,
  "invoice_id" integer NOT NULL REFERENCES "client_invoices"("id") ON DELETE CASCADE,
  "description" text NOT NULL,
  "quantity" real NOT NULL DEFAULT 1,
  "rate_cents" integer NOT NULL DEFAULT 0,
  "amount_cents" integer NOT NULL DEFAULT 0,
  "position" integer NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS "client_invoice_items_invoice_id_idx"
  ON "client_invoice_items" ("invoice_id");
