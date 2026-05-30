ALTER TABLE "saved_custom_reports" ADD COLUMN IF NOT EXISTS "report_key" text;--> statement-breakpoint
ALTER TABLE "saved_custom_reports" ADD COLUMN IF NOT EXISTS "entity" text;--> statement-breakpoint
ALTER TABLE "saved_custom_reports" ADD COLUMN IF NOT EXISTS "filters_json" text;--> statement-breakpoint
ALTER TABLE "saved_custom_reports" ADD COLUMN IF NOT EXISTS "filter_logic" text DEFAULT 'AND';--> statement-breakpoint
ALTER TABLE "saved_custom_reports" ADD COLUMN IF NOT EXISTS "group_by_field" text;--> statement-breakpoint
ALTER TABLE "saved_custom_reports" ADD COLUMN IF NOT EXISTS "aggregate_field" text;--> statement-breakpoint
ALTER TABLE "saved_custom_reports" ADD COLUMN IF NOT EXISTS "aggregate_function" text;--> statement-breakpoint
ALTER TABLE "saved_custom_reports" ADD COLUMN IF NOT EXISTS "created_by_user_id" integer;--> statement-breakpoint
ALTER TABLE "saved_custom_reports" ADD COLUMN IF NOT EXISTS "schedule_enabled" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "saved_custom_reports" ADD COLUMN IF NOT EXISTS "schedule_frequency" text;--> statement-breakpoint
ALTER TABLE "saved_custom_reports" ADD COLUMN IF NOT EXISTS "schedule_recipients" text;--> statement-breakpoint
ALTER TABLE "saved_custom_reports" ADD COLUMN IF NOT EXISTS "schedule_format" text DEFAULT 'xlsx';--> statement-breakpoint
ALTER TABLE "saved_custom_reports" ADD COLUMN IF NOT EXISTS "next_run_at" timestamp;--> statement-breakpoint
ALTER TABLE "saved_custom_reports" ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now();--> statement-breakpoint

UPDATE "saved_custom_reports"
SET
  "report_key" = regexp_replace(lower(coalesce(nullif("name", ''), 'custom-report')), '[^a-z0-9]+', '-', 'g') || '-' || "id",
  "entity" = coalesce("entity", "data_source")
WHERE "report_key" IS NULL OR "entity" IS NULL;--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "report_schedules" (
  "id" serial PRIMARY KEY NOT NULL,
  "company_id" integer,
  "saved_report_id" integer,
  "report_key" text NOT NULL,
  "report_type" text DEFAULT 'custom',
  "name" text NOT NULL,
  "frequency" text DEFAULT 'weekly',
  "recipients" text NOT NULL,
  "export_format" text DEFAULT 'xlsx',
  "filters_json" text,
  "is_active" boolean DEFAULT true,
  "next_run_at" timestamp,
  "last_run_at" timestamp,
  "created_by_user_id" integer,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "report_runs" (
  "id" serial PRIMARY KEY NOT NULL,
  "company_id" integer,
  "saved_report_id" integer,
  "report_key" text NOT NULL,
  "report_type" text DEFAULT 'custom',
  "report_name" text,
  "status" text DEFAULT 'completed',
  "row_count" integer DEFAULT 0,
  "export_format" text,
  "filters_json" text,
  "file_url" text,
  "requested_by_user_id" integer,
  "started_at" timestamp DEFAULT now(),
  "completed_at" timestamp,
  "duration_ms" integer,
  "error_message" text
);--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "report_favorites" (
  "id" serial PRIMARY KEY NOT NULL,
  "company_id" integer,
  "user_id" integer,
  "report_key" text NOT NULL,
  "report_type" text DEFAULT 'prebuilt',
  "created_at" timestamp DEFAULT now()
);--> statement-breakpoint

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'saved_custom_reports_created_by_user_id_users_id_fk') THEN
    ALTER TABLE "saved_custom_reports" ADD CONSTRAINT "saved_custom_reports_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'report_schedules_company_id_companies_id_fk') THEN
    ALTER TABLE "report_schedules" ADD CONSTRAINT "report_schedules_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'report_schedules_saved_report_id_saved_custom_reports_id_fk') THEN
    ALTER TABLE "report_schedules" ADD CONSTRAINT "report_schedules_saved_report_id_saved_custom_reports_id_fk" FOREIGN KEY ("saved_report_id") REFERENCES "public"."saved_custom_reports"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'report_schedules_created_by_user_id_users_id_fk') THEN
    ALTER TABLE "report_schedules" ADD CONSTRAINT "report_schedules_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'report_runs_company_id_companies_id_fk') THEN
    ALTER TABLE "report_runs" ADD CONSTRAINT "report_runs_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'report_runs_saved_report_id_saved_custom_reports_id_fk') THEN
    ALTER TABLE "report_runs" ADD CONSTRAINT "report_runs_saved_report_id_saved_custom_reports_id_fk" FOREIGN KEY ("saved_report_id") REFERENCES "public"."saved_custom_reports"("id") ON DELETE set null ON UPDATE no action;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'report_runs_requested_by_user_id_users_id_fk') THEN
    ALTER TABLE "report_runs" ADD CONSTRAINT "report_runs_requested_by_user_id_users_id_fk" FOREIGN KEY ("requested_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'report_favorites_company_id_companies_id_fk') THEN
    ALTER TABLE "report_favorites" ADD CONSTRAINT "report_favorites_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'report_favorites_user_id_users_id_fk') THEN
    ALTER TABLE "report_favorites" ADD CONSTRAINT "report_favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;--> statement-breakpoint

CREATE UNIQUE INDEX IF NOT EXISTS "idx_saved_custom_reports_company_key" ON "saved_custom_reports" ("company_id", "report_key") WHERE "report_key" IS NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_saved_custom_reports_company_entity" ON "saved_custom_reports" ("company_id", "entity");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_report_schedules_company_next_run" ON "report_schedules" ("company_id", "next_run_at") WHERE "is_active" = true;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_report_runs_company_started" ON "report_runs" ("company_id", "started_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_report_runs_saved_report_started" ON "report_runs" ("saved_report_id", "started_at");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_report_favorites_user_report" ON "report_favorites" ("company_id", "user_id", "report_type", "report_key");--> statement-breakpoint
