DO $$ BEGIN
  CREATE TYPE "public"."account_type" AS ENUM ('company', 'agency', 'creator');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE TYPE "public"."entity_type" AS ENUM ('sole_prop', 'smllc', 'mmllc', 's_corp', 'c_corp', 'none');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE TYPE "public"."onboarding_progress_status" AS ENUM ('in_progress', 'complete');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'companies' AND column_name = 'account_type'
  ) THEN
    ALTER TABLE "companies" ADD COLUMN "account_type" "public"."account_type";
  ELSE
    ALTER TABLE "companies" ALTER COLUMN "account_type" DROP DEFAULT;
    ALTER TABLE "companies" ALTER COLUMN "account_type" DROP NOT NULL;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'companies'
        AND column_name = 'account_type'
        AND udt_name <> 'account_type'
    ) THEN
      ALTER TABLE "companies"
        ALTER COLUMN "account_type" TYPE "public"."account_type"
        USING (
          CASE regexp_replace(lower(trim("account_type"::text)), '[[:space:]/-]+', '_', 'g')
            WHEN 'company' THEN 'company'::"public"."account_type"
            WHEN 'agency' THEN 'agency'::"public"."account_type"
            WHEN 'creator' THEN 'creator'::"public"."account_type"
            WHEN 'creator_solo' THEN 'creator'::"public"."account_type"
            WHEN 'creator_solo_account' THEN 'creator'::"public"."account_type"
            WHEN 'creator_solo_business' THEN 'creator'::"public"."account_type"
            WHEN 'creator_solo_studio' THEN 'creator'::"public"."account_type"
            WHEN 'solo' THEN 'creator'::"public"."account_type"
            WHEN 'solo_creator' THEN 'creator'::"public"."account_type"
            WHEN 'contractor_payer' THEN 'creator'::"public"."account_type"
            ELSE NULL
          END
        );
    END IF;
  END IF;
END $$;
--> statement-breakpoint
ALTER TABLE "companies" ALTER COLUMN "account_type" DROP DEFAULT;
--> statement-breakpoint
ALTER TABLE "companies" ALTER COLUMN "account_type" DROP NOT NULL;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'companies' AND column_name = 'entity_type'
  ) THEN
    ALTER TABLE "companies" ADD COLUMN "entity_type" "public"."entity_type";
  ELSE
    ALTER TABLE "companies" ALTER COLUMN "entity_type" DROP DEFAULT;
    ALTER TABLE "companies" ALTER COLUMN "entity_type" DROP NOT NULL;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'companies'
        AND column_name = 'entity_type'
        AND udt_name <> 'entity_type'
    ) THEN
      ALTER TABLE "companies"
        ALTER COLUMN "entity_type" TYPE "public"."entity_type"
        USING (
          CASE regexp_replace(lower(trim("entity_type"::text)), '[[:space:]/-]+', '_', 'g')
            WHEN 'sole_prop' THEN 'sole_prop'::"public"."entity_type"
            WHEN 'sole_proprietor' THEN 'sole_prop'::"public"."entity_type"
            WHEN 'llc' THEN 'smllc'::"public"."entity_type"
            WHEN 'smllc' THEN 'smllc'::"public"."entity_type"
            WHEN 'single_member_llc' THEN 'smllc'::"public"."entity_type"
            WHEN 'mmllc' THEN 'mmllc'::"public"."entity_type"
            WHEN 'multi_member_llc' THEN 'mmllc'::"public"."entity_type"
            WHEN 's_corp' THEN 's_corp'::"public"."entity_type"
            WHEN 'c_corp' THEN 'c_corp'::"public"."entity_type"
            WHEN 'none' THEN 'none'::"public"."entity_type"
            ELSE NULL
          END
        );
    END IF;
  END IF;
END $$;
--> statement-breakpoint
ALTER TABLE "companies" ALTER COLUMN "entity_type" DROP DEFAULT;
--> statement-breakpoint
ALTER TABLE "companies" ALTER COLUMN "entity_type" DROP NOT NULL;
--> statement-breakpoint
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'companies' AND column_name = 'creator_entity_type'
  ) THEN
    UPDATE "companies"
    SET "entity_type" = (
      CASE regexp_replace(lower(trim("creator_entity_type"::text)), '[[:space:]/-]+', '_', 'g')
        WHEN 'sole_prop' THEN 'sole_prop'::"public"."entity_type"
        WHEN 'sole_proprietor' THEN 'sole_prop'::"public"."entity_type"
        WHEN 'llc' THEN 'smllc'::"public"."entity_type"
        WHEN 'smllc' THEN 'smllc'::"public"."entity_type"
        WHEN 'single_member_llc' THEN 'smllc'::"public"."entity_type"
        WHEN 'mmllc' THEN 'mmllc'::"public"."entity_type"
        WHEN 'multi_member_llc' THEN 'mmllc'::"public"."entity_type"
        WHEN 's_corp' THEN 's_corp'::"public"."entity_type"
        WHEN 'c_corp' THEN 'c_corp'::"public"."entity_type"
        WHEN 'none' THEN 'none'::"public"."entity_type"
        ELSE NULL
      END
    )
    WHERE "entity_type" IS NULL AND "creator_entity_type" IS NOT NULL;
  END IF;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "onboarding_progress" (
  "account_id" integer PRIMARY KEY NOT NULL,
  "current_step" text NOT NULL,
  "completed_steps" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "status" "public"."onboarding_progress_status" NOT NULL DEFAULT 'in_progress',
  "updated_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "onboarding_progress_account_id_companies_id_fk"
    FOREIGN KEY ("account_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action
);
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'onboarding_progress_account_id_companies_id_fk'
  ) THEN
    ALTER TABLE "onboarding_progress"
      ADD CONSTRAINT "onboarding_progress_account_id_companies_id_fk"
      FOREIGN KEY ("account_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "onboarding_progress_status_updated_idx"
  ON "onboarding_progress" ("status", "updated_at");
