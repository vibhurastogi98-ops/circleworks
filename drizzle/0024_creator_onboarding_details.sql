CREATE TABLE IF NOT EXISTS "creator_onboarding_details" (
  "account_id" integer PRIMARY KEY NOT NULL,
  "legal_name" text NOT NULL,
  "business_name" text NOT NULL,
  "ein_masked" text,
  "entity_type" "public"."entity_type",
  "pay_self_as_owner" boolean DEFAULT false,
  "contractor_count" integer DEFAULT 0,
  "home_state" text,
  "work_state" text,
  "bank_funding" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "updated_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "creator_onboarding_details_account_id_companies_id_fk"
    FOREIGN KEY ("account_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action
);
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'creator_onboarding_details_account_id_companies_id_fk'
  ) THEN
    ALTER TABLE "creator_onboarding_details"
      ADD CONSTRAINT "creator_onboarding_details_account_id_companies_id_fk"
      FOREIGN KEY ("account_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "creator_onboarding_details_updated_idx"
  ON "creator_onboarding_details" ("updated_at");
