CREATE TABLE IF NOT EXISTS "agency_onboarding_details" (
  "account_id" integer PRIMARY KEY NOT NULL,
  "legal_name" text NOT NULL,
  "ein_masked" text,
  "agency_type" text,
  "internal_staff_count" integer,
  "contractor_count" integer,
  "bank_funding" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "tax_setup" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "first_client" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "pay_schedules" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "updated_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "agency_onboarding_details_account_id_companies_id_fk"
    FOREIGN KEY ("account_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action
);
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'agency_onboarding_details_account_id_companies_id_fk'
  ) THEN
    ALTER TABLE "agency_onboarding_details"
      ADD CONSTRAINT "agency_onboarding_details_account_id_companies_id_fk"
      FOREIGN KEY ("account_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "agency_onboarding_details_updated_idx"
  ON "agency_onboarding_details" ("updated_at");
