ALTER TABLE "time_policies" ADD COLUMN IF NOT EXISTS "workweek_start_day" text DEFAULT 'Monday';--> statement-breakpoint
ALTER TABLE "time_policies" ADD COLUMN IF NOT EXISTS "timezone" text DEFAULT 'America/New_York';--> statement-breakpoint
ALTER TABLE "time_policies" ADD COLUMN IF NOT EXISTS "rounding_rule" text DEFAULT 'none';--> statement-breakpoint
ALTER TABLE "time_policies" ADD COLUMN IF NOT EXISTS "break_deduction_enabled" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "time_policies" ADD COLUMN IF NOT EXISTS "auto_break_threshold_hours" real DEFAULT 6;--> statement-breakpoint
ALTER TABLE "time_policies" ADD COLUMN IF NOT EXISTS "auto_break_minutes" integer DEFAULT 30;--> statement-breakpoint
ALTER TABLE "time_policies" ADD COLUMN IF NOT EXISTS "geofencing_enabled" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "time_policies" ADD COLUMN IF NOT EXISTS "ip_restriction_enabled" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "time_policies" ADD COLUMN IF NOT EXISTS "clock_in_ip_whitelist" text;--> statement-breakpoint
ALTER TABLE "time_policies" ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now();--> statement-breakpoint

ALTER TABLE "time_entries" ADD COLUMN IF NOT EXISTS "work_date" date;--> statement-breakpoint
ALTER TABLE "time_entries" ADD COLUMN IF NOT EXISTS "project_code" text;--> statement-breakpoint
ALTER TABLE "time_entries" ADD COLUMN IF NOT EXISTS "task_code" text;--> statement-breakpoint
ALTER TABLE "time_entries" ADD COLUMN IF NOT EXISTS "notes" text;--> statement-breakpoint
ALTER TABLE "time_entries" ADD COLUMN IF NOT EXISTS "regular_hours" real DEFAULT 0;--> statement-breakpoint
ALTER TABLE "time_entries" ADD COLUMN IF NOT EXISTS "overtime_hours" real DEFAULT 0;--> statement-breakpoint
ALTER TABLE "time_entries" ADD COLUMN IF NOT EXISTS "double_time_hours" real DEFAULT 0;--> statement-breakpoint
ALTER TABLE "time_entries" ADD COLUMN IF NOT EXISTS "manually_edited" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "time_entries" ADD COLUMN IF NOT EXISTS "edited_by" integer;--> statement-breakpoint
ALTER TABLE "time_entries" ADD COLUMN IF NOT EXISTS "edited_at" timestamp;--> statement-breakpoint
ALTER TABLE "time_entries" ADD COLUMN IF NOT EXISTS "approval_status" text DEFAULT 'Approved';--> statement-breakpoint
ALTER TABLE "time_entries" ADD COLUMN IF NOT EXISTS "reviewed_by" integer;--> statement-breakpoint
ALTER TABLE "time_entries" ADD COLUMN IF NOT EXISTS "reviewed_at" timestamp;--> statement-breakpoint
ALTER TABLE "time_entries" ADD COLUMN IF NOT EXISTS "review_note" text;--> statement-breakpoint
ALTER TABLE "time_entries" ADD COLUMN IF NOT EXISTS "clock_in_source" text DEFAULT 'web';--> statement-breakpoint
ALTER TABLE "time_entries" ADD COLUMN IF NOT EXISTS "clock_out_source" text;--> statement-breakpoint
ALTER TABLE "time_entries" ADD COLUMN IF NOT EXISTS "clock_in_ip" text;--> statement-breakpoint
ALTER TABLE "time_entries" ADD COLUMN IF NOT EXISTS "clock_out_ip" text;--> statement-breakpoint
ALTER TABLE "time_entries" ADD COLUMN IF NOT EXISTS "clock_in_latitude" real;--> statement-breakpoint
ALTER TABLE "time_entries" ADD COLUMN IF NOT EXISTS "clock_in_longitude" real;--> statement-breakpoint
ALTER TABLE "time_entries" ADD COLUMN IF NOT EXISTS "clock_out_latitude" real;--> statement-breakpoint
ALTER TABLE "time_entries" ADD COLUMN IF NOT EXISTS "clock_out_longitude" real;--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "shift_publish_batches" (
  "id" serial PRIMARY KEY NOT NULL,
  "company_id" integer,
  "week_start" date NOT NULL,
  "week_end" date NOT NULL,
  "channels" text,
  "status" text DEFAULT 'Draft',
  "published_by" integer,
  "published_at" timestamp,
  "notifications_sent" integer DEFAULT 0,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);--> statement-breakpoint

ALTER TABLE "shifts" ADD COLUMN IF NOT EXISTS "role" text;--> statement-breakpoint
ALTER TABLE "shifts" ADD COLUMN IF NOT EXISTS "position" text;--> statement-breakpoint
ALTER TABLE "shifts" ADD COLUMN IF NOT EXISTS "location" text;--> statement-breakpoint
ALTER TABLE "shifts" ADD COLUMN IF NOT EXISTS "department" text;--> statement-breakpoint
ALTER TABLE "shifts" ADD COLUMN IF NOT EXISTS "notes" text;--> statement-breakpoint
ALTER TABLE "shifts" ADD COLUMN IF NOT EXISTS "is_open_shift" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "shifts" ADD COLUMN IF NOT EXISTS "needed_headcount" integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE "shifts" ADD COLUMN IF NOT EXISTS "coverage_slot" text;--> statement-breakpoint
ALTER TABLE "shifts" ADD COLUMN IF NOT EXISTS "publish_batch_id" integer;--> statement-breakpoint
ALTER TABLE "shifts" ADD COLUMN IF NOT EXISTS "published_at" timestamp;--> statement-breakpoint
ALTER TABLE "shifts" ADD COLUMN IF NOT EXISTS "published_by" integer;--> statement-breakpoint
ALTER TABLE "shifts" ADD COLUMN IF NOT EXISTS "notification_status" text DEFAULT 'not_sent';--> statement-breakpoint
ALTER TABLE "shifts" ADD COLUMN IF NOT EXISTS "copied_from_shift_id" integer;--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "schedule_coverage_requirements" (
  "id" serial PRIMARY KEY NOT NULL,
  "company_id" integer,
  "day_of_week" integer NOT NULL,
  "start_time" text NOT NULL,
  "end_time" text NOT NULL,
  "role" text,
  "location" text,
  "department" text,
  "needed_headcount" integer DEFAULT 1,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "time_clock_locations" (
  "id" serial PRIMARY KEY NOT NULL,
  "company_id" integer,
  "policy_id" integer,
  "name" text NOT NULL,
  "address" text,
  "latitude" real,
  "longitude" real,
  "radius_meters" integer DEFAULT 150,
  "ip_whitelist" text,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "pto_policies" (
  "id" serial PRIMARY KEY NOT NULL,
  "company_id" integer,
  "leave_type" text NOT NULL,
  "accrual_method" text DEFAULT 'flat',
  "annual_allowance_days" real DEFAULT 0,
  "accrual_rate_per_period" real DEFAULT 0,
  "cap_days" real DEFAULT 0,
  "carryover_rule" text,
  "carryover_cap_days" real DEFAULT 0,
  "requires_approval" boolean DEFAULT true,
  "color" text DEFAULT '#2563eb',
  "is_active" boolean DEFAULT true,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "pto_balances" (
  "id" serial PRIMARY KEY NOT NULL,
  "company_id" integer,
  "employee_id" integer NOT NULL,
  "policy_id" integer,
  "balance_days" real DEFAULT 0,
  "accrued_days" real DEFAULT 0,
  "used_days_ytd" real DEFAULT 0,
  "scheduled_days" real DEFAULT 0,
  "carryover_days" real DEFAULT 0,
  "last_accrued_at" timestamp,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);--> statement-breakpoint

ALTER TABLE "pto_requests" ADD COLUMN IF NOT EXISTS "policy_id" integer;--> statement-breakpoint
ALTER TABLE "pto_requests" ADD COLUMN IF NOT EXISTS "days_requested" real DEFAULT 0;--> statement-breakpoint
ALTER TABLE "pto_requests" ADD COLUMN IF NOT EXISTS "reason" text;--> statement-breakpoint
ALTER TABLE "pto_requests" ADD COLUMN IF NOT EXISTS "reviewer_id" integer;--> statement-breakpoint
ALTER TABLE "pto_requests" ADD COLUMN IF NOT EXISTS "review_note" text;--> statement-breakpoint
ALTER TABLE "pto_requests" ADD COLUMN IF NOT EXISTS "submitted_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "pto_requests" ADD COLUMN IF NOT EXISTS "reviewed_at" timestamp;--> statement-breakpoint
ALTER TABLE "pto_requests" ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now();--> statement-breakpoint

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'time_entries_edited_by_users_id_fk') THEN
    ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_edited_by_users_id_fk" FOREIGN KEY ("edited_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'time_entries_reviewed_by_users_id_fk') THEN
    ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'shifts_published_by_users_id_fk') THEN
    ALTER TABLE "shifts" ADD CONSTRAINT "shifts_published_by_users_id_fk" FOREIGN KEY ("published_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'shift_publish_batches_company_id_companies_id_fk') THEN
    ALTER TABLE "shift_publish_batches" ADD CONSTRAINT "shift_publish_batches_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'shift_publish_batches_published_by_users_id_fk') THEN
    ALTER TABLE "shift_publish_batches" ADD CONSTRAINT "shift_publish_batches_published_by_users_id_fk" FOREIGN KEY ("published_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'schedule_coverage_requirements_company_id_companies_id_fk') THEN
    ALTER TABLE "schedule_coverage_requirements" ADD CONSTRAINT "schedule_coverage_requirements_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'time_clock_locations_company_id_companies_id_fk') THEN
    ALTER TABLE "time_clock_locations" ADD CONSTRAINT "time_clock_locations_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'time_clock_locations_policy_id_time_policies_id_fk') THEN
    ALTER TABLE "time_clock_locations" ADD CONSTRAINT "time_clock_locations_policy_id_time_policies_id_fk" FOREIGN KEY ("policy_id") REFERENCES "public"."time_policies"("id") ON DELETE set null ON UPDATE no action;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pto_policies_company_id_companies_id_fk') THEN
    ALTER TABLE "pto_policies" ADD CONSTRAINT "pto_policies_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pto_balances_company_id_companies_id_fk') THEN
    ALTER TABLE "pto_balances" ADD CONSTRAINT "pto_balances_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pto_balances_employee_id_employees_id_fk') THEN
    ALTER TABLE "pto_balances" ADD CONSTRAINT "pto_balances_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pto_balances_policy_id_pto_policies_id_fk') THEN
    ALTER TABLE "pto_balances" ADD CONSTRAINT "pto_balances_policy_id_pto_policies_id_fk" FOREIGN KEY ("policy_id") REFERENCES "public"."pto_policies"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pto_requests_policy_id_pto_policies_id_fk') THEN
    ALTER TABLE "pto_requests" ADD CONSTRAINT "pto_requests_policy_id_pto_policies_id_fk" FOREIGN KEY ("policy_id") REFERENCES "public"."pto_policies"("id") ON DELETE set null ON UPDATE no action;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pto_requests_reviewer_id_users_id_fk') THEN
    ALTER TABLE "pto_requests" ADD CONSTRAINT "pto_requests_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  END IF;
END $$;--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "idx_time_entries_company_work_date" ON "time_entries" ("company_id", "work_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_time_entries_timesheet" ON "time_entries" ("timesheet_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_shifts_company_start" ON "shifts" ("company_id", "start_time");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_shift_publish_batches_company_week" ON "shift_publish_batches" ("company_id", "week_start");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_pto_policies_company_type" ON "pto_policies" ("company_id", "leave_type");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_pto_balances_employee_policy" ON "pto_balances" ("employee_id", "policy_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_pto_requests_company_status" ON "pto_requests" ("company_id", "status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_schedule_coverage_company_day" ON "schedule_coverage_requirements" ("company_id", "day_of_week");--> statement-breakpoint
