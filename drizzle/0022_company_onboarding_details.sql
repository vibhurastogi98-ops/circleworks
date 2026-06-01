CREATE TABLE IF NOT EXISTS "company_onboarding_details" (
  "account_id" integer PRIMARY KEY NOT NULL,
  "legal_name" text NOT NULL,
  "dba" text,
  "ein_masked" text,
  "entity_type" "public"."entity_type",
  "industry" text,
  "employee_count" integer,
  "work_states" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "bank_funding" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "tax_setup" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "pay_schedule" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "employee_invites" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "updated_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "company_onboarding_details_account_id_companies_id_fk"
    FOREIGN KEY ("account_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action
);
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'company_onboarding_details_account_id_companies_id_fk'
  ) THEN
    ALTER TABLE "company_onboarding_details"
      ADD CONSTRAINT "company_onboarding_details_account_id_companies_id_fk"
      FOREIGN KEY ("account_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "company_onboarding_details_updated_idx"
  ON "company_onboarding_details" ("updated_at");
