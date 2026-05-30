ALTER TABLE "companies"
  ADD COLUMN IF NOT EXISTS "account_type" text NOT NULL DEFAULT 'company',
  ADD COLUMN IF NOT EXISTS "creator_entity_type" text,
  ADD COLUMN IF NOT EXISTS "pay_self_as_owner" boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS "contractor_count" integer DEFAULT 0;
