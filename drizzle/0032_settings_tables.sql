-- Phase A/B/C settings-section wiring:
--   custom_roles, departments, company_locations, pending_invites.

CREATE TABLE IF NOT EXISTS "custom_roles" (
  "id" serial PRIMARY KEY NOT NULL,
  "company_id" integer NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "description" text,
  "based_on" text,
  "permissions" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "created_by" integer REFERENCES "users"("id") ON DELETE SET NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "custom_roles_company_id_idx" ON "custom_roles" ("company_id");
CREATE UNIQUE INDEX IF NOT EXISTS "custom_roles_company_name_idx" ON "custom_roles" ("company_id", "name");

CREATE TABLE IF NOT EXISTS "departments" (
  "id" serial PRIMARY KEY NOT NULL,
  "company_id" integer NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "head" text,
  "budget_cents" integer NOT NULL DEFAULT 0,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "departments_company_id_idx" ON "departments" ("company_id");
CREATE UNIQUE INDEX IF NOT EXISTS "departments_company_name_idx" ON "departments" ("company_id", "name");

CREATE TABLE IF NOT EXISTS "company_locations" (
  "id" serial PRIMARY KEY NOT NULL,
  "company_id" integer NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "address" text,
  "timezone" text,
  "is_headquarters" boolean NOT NULL DEFAULT false,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "company_locations_company_id_idx" ON "company_locations" ("company_id");
CREATE UNIQUE INDEX IF NOT EXISTS "company_locations_company_name_idx" ON "company_locations" ("company_id", "name");

CREATE TABLE IF NOT EXISTS "pending_invites" (
  "id" serial PRIMARY KEY NOT NULL,
  "company_id" integer NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
  "email" text NOT NULL,
  "role" text NOT NULL DEFAULT 'employee',
  "invited_by" integer REFERENCES "users"("id") ON DELETE SET NULL,
  "token" text NOT NULL,
  "status" text NOT NULL DEFAULT 'pending',
  "accepted_at" timestamp,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "expires_at" timestamp NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "pending_invites_token_idx" ON "pending_invites" ("token");
CREATE INDEX IF NOT EXISTS "pending_invites_company_email_idx" ON "pending_invites" ("company_id", "email");
