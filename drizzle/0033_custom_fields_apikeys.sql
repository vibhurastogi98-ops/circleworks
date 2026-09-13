-- Batch: Custom Fields, Import (no schema), API Keys.

CREATE TABLE IF NOT EXISTS "custom_field_definitions" (
  "id" serial PRIMARY KEY NOT NULL,
  "company_id" integer NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "field_type" text NOT NULL,
  "options" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "applies_to" text NOT NULL,
  "required" boolean NOT NULL DEFAULT false,
  "created_by" integer REFERENCES "users"("id") ON DELETE SET NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "custom_field_definitions_company_id_idx"
  ON "custom_field_definitions" ("company_id");
CREATE UNIQUE INDEX IF NOT EXISTS "custom_field_definitions_company_name_applies_idx"
  ON "custom_field_definitions" ("company_id", "name", "applies_to");

CREATE TABLE IF NOT EXISTS "custom_field_values" (
  "id" serial PRIMARY KEY NOT NULL,
  "definition_id" integer NOT NULL REFERENCES "custom_field_definitions"("id") ON DELETE CASCADE,
  "entity_id" integer NOT NULL,
  "value" text,
  "updated_at" timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "custom_field_values_definition_entity_idx"
  ON "custom_field_values" ("definition_id", "entity_id");
CREATE UNIQUE INDEX IF NOT EXISTS "custom_field_values_definition_entity_uniq_idx"
  ON "custom_field_values" ("definition_id", "entity_id");

CREATE TABLE IF NOT EXISTS "api_keys" (
  "id" serial PRIMARY KEY NOT NULL,
  "company_id" integer NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
  "label" text NOT NULL,
  "key_prefix" text NOT NULL,
  "hashed_key" text NOT NULL,
  "created_by" integer REFERENCES "users"("id") ON DELETE SET NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "last_used_at" timestamp,
  "revoked_at" timestamp
);
CREATE INDEX IF NOT EXISTS "api_keys_company_id_idx" ON "api_keys" ("company_id");
CREATE UNIQUE INDEX IF NOT EXISTS "api_keys_hashed_idx" ON "api_keys" ("hashed_key");
