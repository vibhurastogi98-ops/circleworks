DO $$ BEGIN
  CREATE TYPE "public"."account_type" AS ENUM ('company', 'agency', 'creator');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'companies'
      AND column_name = 'account_type'
  ) THEN
    ALTER TABLE "companies"
      ADD COLUMN "account_type" "public"."account_type" DEFAULT 'company' NOT NULL;
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'companies'
      AND column_name = 'account_type'
      AND udt_name <> 'account_type'
  ) THEN
    ALTER TABLE "companies" ALTER COLUMN "account_type" DROP DEFAULT;
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
          ELSE 'company'::"public"."account_type"
        END
      );
  END IF;
END $$;
--> statement-breakpoint
UPDATE "companies"
SET "account_type" = 'company'::"public"."account_type"
WHERE "account_type" IS NULL;
--> statement-breakpoint
ALTER TABLE "companies" ALTER COLUMN "account_type" SET DEFAULT 'company';
--> statement-breakpoint
ALTER TABLE "companies" ALTER COLUMN "account_type" SET NOT NULL;
