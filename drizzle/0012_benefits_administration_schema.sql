CREATE TABLE IF NOT EXISTS "cobra_cases" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" integer NOT NULL,
	"status" text DEFAULT 'Eligible',
	"qualifying_event" text,
	"notice_sent_date" date,
	"election_deadline" date,
	"premium_amount" integer DEFAULT 0,
	"payment_status" text DEFAULT 'Unpaid',
	"election_notice_pdf" text,
	"email_queued" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'cobra_cases_employee_id_employees_id_fk'
  ) THEN
    ALTER TABLE "cobra_cases"
      ADD CONSTRAINT "cobra_cases_employee_id_employees_id_fk"
      FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payroll_benefit_deductions" (
	"id" serial PRIMARY KEY NOT NULL,
	"payroll_id" integer,
	"employee_id" integer,
	"benefit_plan_id" integer,
	"plan_name" text NOT NULL,
	"monthly_premium" real DEFAULT 0,
	"employee_share" real DEFAULT 0,
	"per_paycheck_amount" real DEFAULT 0,
	"pretax_or_posttax" text DEFAULT 'pre_tax',
	"deduction_code" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'payroll_benefit_deductions_payroll_id_payrolls_id_fk'
  ) THEN
    ALTER TABLE "payroll_benefit_deductions"
      ADD CONSTRAINT "payroll_benefit_deductions_payroll_id_payrolls_id_fk"
      FOREIGN KEY ("payroll_id") REFERENCES "public"."payrolls"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'payroll_benefit_deductions_employee_id_employees_id_fk'
  ) THEN
    ALTER TABLE "payroll_benefit_deductions"
      ADD CONSTRAINT "payroll_benefit_deductions_employee_id_employees_id_fk"
      FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'payroll_benefit_deductions_benefit_plan_id_benefit_plans_id_fk'
  ) THEN
    ALTER TABLE "payroll_benefit_deductions"
      ADD CONSTRAINT "payroll_benefit_deductions_benefit_plan_id_benefit_plans_id_fk"
      FOREIGN KEY ("benefit_plan_id") REFERENCES "public"."benefit_plans"("id") ON DELETE set null ON UPDATE no action;
  END IF;
END $$;
--> statement-breakpoint
ALTER TABLE "benefit_plans" ADD COLUMN IF NOT EXISTS "category" text;
--> statement-breakpoint
ALTER TABLE "benefit_plans" ADD COLUMN IF NOT EXISTS "plan_code" text;
--> statement-breakpoint
ALTER TABLE "benefit_plans" ADD COLUMN IF NOT EXISTS "plan_type" text;
--> statement-breakpoint
ALTER TABLE "benefit_plans" ADD COLUMN IF NOT EXISTS "carrier_logo" text;
--> statement-breakpoint
ALTER TABLE "benefit_plans" ADD COLUMN IF NOT EXISTS "deductible" integer DEFAULT 0;
--> statement-breakpoint
ALTER TABLE "benefit_plans" ADD COLUMN IF NOT EXISTS "out_of_pocket_max" integer DEFAULT 0;
--> statement-breakpoint
ALTER TABLE "benefit_plans" ADD COLUMN IF NOT EXISTS "monthly_cost" integer DEFAULT 0;
--> statement-breakpoint
ALTER TABLE "benefit_plans" ADD COLUMN IF NOT EXISTS "enrolled_count" integer DEFAULT 0;
--> statement-breakpoint
ALTER TABLE "benefit_plans" ADD COLUMN IF NOT EXISTS "eligible_count" integer DEFAULT 0;
--> statement-breakpoint
ALTER TABLE "benefit_plans" ADD COLUMN IF NOT EXISTS "effective_start" date;
--> statement-breakpoint
ALTER TABLE "benefit_plans" ADD COLUMN IF NOT EXISTS "effective_end" date;
--> statement-breakpoint
ALTER TABLE "benefit_plans" ADD COLUMN IF NOT EXISTS "renewal_date" date;
--> statement-breakpoint
ALTER TABLE "benefit_plans" ADD COLUMN IF NOT EXISTS "contribution_formula" text;
--> statement-breakpoint
ALTER TABLE "benefit_plans" ADD COLUMN IF NOT EXISTS "network" text;
--> statement-breakpoint
ALTER TABLE "benefit_plans" ADD COLUMN IF NOT EXISTS "covered_highlights" text;
--> statement-breakpoint
ALTER TABLE "benefit_plans" ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now();
--> statement-breakpoint

ALTER TABLE "benefit_enrollments" ADD COLUMN IF NOT EXISTS "company_id" integer;
--> statement-breakpoint
ALTER TABLE "benefit_enrollments" ADD COLUMN IF NOT EXISTS "coverage_level" text;
--> statement-breakpoint
ALTER TABLE "benefit_enrollments" ADD COLUMN IF NOT EXISTS "employee_monthly_cost" integer DEFAULT 0;
--> statement-breakpoint
ALTER TABLE "benefit_enrollments" ADD COLUMN IF NOT EXISTS "employer_monthly_cost" integer DEFAULT 0;
--> statement-breakpoint
ALTER TABLE "benefit_enrollments" ADD COLUMN IF NOT EXISTS "per_pay_period_deduction" real DEFAULT 0;
--> statement-breakpoint
ALTER TABLE "benefit_enrollments" ADD COLUMN IF NOT EXISTS "dependents" text;
--> statement-breakpoint
ALTER TABLE "benefit_enrollments" ADD COLUMN IF NOT EXISTS "elections" text;
--> statement-breakpoint
ALTER TABLE "benefit_enrollments" ADD COLUMN IF NOT EXISTS "submitted_at" timestamp;
--> statement-breakpoint
ALTER TABLE "benefit_enrollments" ADD COLUMN IF NOT EXISTS "confirmed_at" timestamp;
--> statement-breakpoint
ALTER TABLE "benefit_enrollments" ADD COLUMN IF NOT EXISTS "payroll_deduction_status" text DEFAULT 'pending';
--> statement-breakpoint
ALTER TABLE "benefit_enrollments" ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now();
--> statement-breakpoint

ALTER TABLE "cobra_cases" ADD COLUMN IF NOT EXISTS "company_id" integer;
--> statement-breakpoint
ALTER TABLE "cobra_cases" ADD COLUMN IF NOT EXISTS "coverage_type" text;
--> statement-breakpoint
ALTER TABLE "cobra_cases" ADD COLUMN IF NOT EXISTS "cobra_start_date" date;
--> statement-breakpoint
ALTER TABLE "cobra_cases" ADD COLUMN IF NOT EXISTS "cobra_end_date" date;
--> statement-breakpoint
ALTER TABLE "cobra_cases" ADD COLUMN IF NOT EXISTS "notice_status" text DEFAULT 'Not Sent';
--> statement-breakpoint
ALTER TABLE "cobra_cases" ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now();
--> statement-breakpoint

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'benefit_enrollments_company_id_companies_id_fk'
  ) THEN
    ALTER TABLE "benefit_enrollments"
      ADD CONSTRAINT "benefit_enrollments_company_id_companies_id_fk"
      FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'cobra_cases_company_id_companies_id_fk'
  ) THEN
    ALTER TABLE "cobra_cases"
      ADD CONSTRAINT "cobra_cases_company_id_companies_id_fk"
      FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "benefit_dependents" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer,
	"employee_id" integer NOT NULL,
	"name" text NOT NULL,
	"relationship" text NOT NULL,
	"date_of_birth" date,
	"age" integer,
	"is_eligible" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "benefit_open_enrollment_windows" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer,
	"name" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"status" text DEFAULT 'Draft',
	"employees_not_enrolled" integer DEFAULT 0,
	"completion_rate" real DEFAULT 0,
	"reminder_count" integer DEFAULT 0,
	"created_by" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "benefit_open_enrollment_statuses" (
	"id" serial PRIMARY KEY NOT NULL,
	"window_id" integer,
	"employee_id" integer,
	"status" text DEFAULT 'Not Started',
	"enrolled_plans" text,
	"last_activity_at" timestamp,
	"reminder_sent_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "benefit_carrier_census_files" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer,
	"window_id" integer,
	"carrier" text NOT NULL,
	"file_type" text NOT NULL,
	"rows_count" integer DEFAULT 0,
	"status" text DEFAULT 'Ready',
	"file_url" text,
	"generated_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "benefit_qle_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer,
	"employee_id" integer NOT NULL,
	"event_type" text NOT NULL,
	"event_date" date NOT NULL,
	"window_expires" date,
	"status" text DEFAULT 'Pending Review',
	"description" text,
	"requested_changes" text,
	"reviewed_by" integer,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "benefit_retirement_accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer,
	"employee_id" integer NOT NULL,
	"provider" text DEFAULT 'Guideline',
	"contribution_rate" real DEFAULT 0,
	"contribution_type" text DEFAULT 'Traditional',
	"employer_match" text,
	"ytd_employee" integer DEFAULT 0,
	"ytd_employer" integer DEFAULT 0,
	"annual_limit" integer DEFAULT 23000,
	"sync_status" text DEFAULT 'Synced',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "benefit_retirement_change_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer,
	"retirement_account_id" integer,
	"employee_id" integer,
	"requested_change" text NOT NULL,
	"status" text DEFAULT 'Queued',
	"requested_at" timestamp DEFAULT now(),
	"synced_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "benefit_spending_accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer,
	"employee_id" integer NOT NULL,
	"account_type" text NOT NULL,
	"tpa" text,
	"annual_election" integer DEFAULT 0,
	"ytd_contributions" integer DEFAULT 0,
	"ytd_spent" integer DEFAULT 0,
	"balance" integer DEFAULT 0,
	"irs_limit" integer DEFAULT 0,
	"status" text DEFAULT 'Healthy',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "benefit_life_disability_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer,
	"employee_id" integer NOT NULL,
	"carrier" text,
	"life_amount" integer DEFAULT 0,
	"voluntary_life" integer DEFAULT 0,
	"std_status" text DEFAULT 'Enrolled',
	"ltd_status" text DEFAULT 'Enrolled',
	"voluntary_benefits" text,
	"beneficiary" text,
	"eoi_status" text DEFAULT 'N/A',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "benefit_workers_comp_policies" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer,
	"carrier" text NOT NULL,
	"policy_number" text,
	"state" text,
	"effective_start" date,
	"effective_end" date,
	"annual_premium" integer DEFAULT 0,
	"payroll_estimate" integer DEFAULT 0,
	"experience_mod" real DEFAULT 1,
	"status" text DEFAULT 'Active',
	"audit_due_date" date,
	"certificate_url" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "benefit_workers_comp_class_codes" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer,
	"policy_id" integer,
	"code" text NOT NULL,
	"description" text NOT NULL,
	"state" text,
	"rate" real DEFAULT 0,
	"payroll_estimate" integer DEFAULT 0,
	"employee_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "benefit_workers_comp_claims" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer,
	"policy_id" integer,
	"employee_id" integer,
	"claim_number" text,
	"incident_date" date,
	"reported_date" date,
	"status" text DEFAULT 'Open',
	"injury_type" text,
	"total_paid" integer DEFAULT 0,
	"reserves" integer DEFAULT 0,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "benefit_workers_comp_certificates" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer,
	"policy_id" integer,
	"certificate_holder" text NOT NULL,
	"file_url" text,
	"issued_at" timestamp,
	"expires_at" date,
	"status" text DEFAULT 'Active',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "benefit_workers_comp_audits" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer,
	"policy_id" integer,
	"audit_year" integer NOT NULL,
	"payroll_reported" integer DEFAULT 0,
	"premium_adjustment" integer DEFAULT 0,
	"status" text DEFAULT 'Draft',
	"export_url" text,
	"due_date" date,
	"submitted_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint

ALTER TABLE "benefit_dependents" ADD CONSTRAINT "benefit_dependents_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "benefit_dependents" ADD CONSTRAINT "benefit_dependents_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "benefit_open_enrollment_windows" ADD CONSTRAINT "benefit_open_enrollment_windows_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "benefit_open_enrollment_windows" ADD CONSTRAINT "benefit_open_enrollment_windows_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "benefit_open_enrollment_statuses" ADD CONSTRAINT "benefit_open_enrollment_statuses_window_id_benefit_open_enrollment_windows_id_fk" FOREIGN KEY ("window_id") REFERENCES "public"."benefit_open_enrollment_windows"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "benefit_open_enrollment_statuses" ADD CONSTRAINT "benefit_open_enrollment_statuses_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "benefit_carrier_census_files" ADD CONSTRAINT "benefit_carrier_census_files_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "benefit_carrier_census_files" ADD CONSTRAINT "benefit_carrier_census_files_window_id_benefit_open_enrollment_windows_id_fk" FOREIGN KEY ("window_id") REFERENCES "public"."benefit_open_enrollment_windows"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "benefit_qle_events" ADD CONSTRAINT "benefit_qle_events_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "benefit_qle_events" ADD CONSTRAINT "benefit_qle_events_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "benefit_qle_events" ADD CONSTRAINT "benefit_qle_events_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "benefit_retirement_accounts" ADD CONSTRAINT "benefit_retirement_accounts_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "benefit_retirement_accounts" ADD CONSTRAINT "benefit_retirement_accounts_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "benefit_retirement_change_requests" ADD CONSTRAINT "benefit_retirement_change_requests_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "benefit_retirement_change_requests" ADD CONSTRAINT "benefit_retirement_change_requests_retirement_account_id_benefit_retirement_accounts_id_fk" FOREIGN KEY ("retirement_account_id") REFERENCES "public"."benefit_retirement_accounts"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "benefit_retirement_change_requests" ADD CONSTRAINT "benefit_retirement_change_requests_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "benefit_spending_accounts" ADD CONSTRAINT "benefit_spending_accounts_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "benefit_spending_accounts" ADD CONSTRAINT "benefit_spending_accounts_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "benefit_life_disability_records" ADD CONSTRAINT "benefit_life_disability_records_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "benefit_life_disability_records" ADD CONSTRAINT "benefit_life_disability_records_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "benefit_workers_comp_policies" ADD CONSTRAINT "benefit_workers_comp_policies_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "benefit_workers_comp_class_codes" ADD CONSTRAINT "benefit_workers_comp_class_codes_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "benefit_workers_comp_class_codes" ADD CONSTRAINT "benefit_workers_comp_class_codes_policy_id_benefit_workers_comp_policies_id_fk" FOREIGN KEY ("policy_id") REFERENCES "public"."benefit_workers_comp_policies"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "benefit_workers_comp_claims" ADD CONSTRAINT "benefit_workers_comp_claims_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "benefit_workers_comp_claims" ADD CONSTRAINT "benefit_workers_comp_claims_policy_id_benefit_workers_comp_policies_id_fk" FOREIGN KEY ("policy_id") REFERENCES "public"."benefit_workers_comp_policies"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "benefit_workers_comp_claims" ADD CONSTRAINT "benefit_workers_comp_claims_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "benefit_workers_comp_certificates" ADD CONSTRAINT "benefit_workers_comp_certificates_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "benefit_workers_comp_certificates" ADD CONSTRAINT "benefit_workers_comp_certificates_policy_id_benefit_workers_comp_policies_id_fk" FOREIGN KEY ("policy_id") REFERENCES "public"."benefit_workers_comp_policies"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "benefit_workers_comp_audits" ADD CONSTRAINT "benefit_workers_comp_audits_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "benefit_workers_comp_audits" ADD CONSTRAINT "benefit_workers_comp_audits_policy_id_benefit_workers_comp_policies_id_fk" FOREIGN KEY ("policy_id") REFERENCES "public"."benefit_workers_comp_policies"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "idx_benefit_plans_company_category" ON "benefit_plans" ("company_id", "category");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_benefit_enrollments_company_employee" ON "benefit_enrollments" ("company_id", "employee_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_benefit_dependents_employee" ON "benefit_dependents" ("employee_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_benefit_oe_company_status" ON "benefit_open_enrollment_windows" ("company_id", "status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_benefit_oe_status_window_employee" ON "benefit_open_enrollment_statuses" ("window_id", "employee_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_benefit_carrier_files_window" ON "benefit_carrier_census_files" ("window_id", "carrier");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_benefit_qle_company_status" ON "benefit_qle_events" ("company_id", "status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_benefit_retirement_employee" ON "benefit_retirement_accounts" ("employee_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_benefit_spending_employee" ON "benefit_spending_accounts" ("employee_id", "account_type");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_benefit_life_employee" ON "benefit_life_disability_records" ("employee_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_benefit_workers_comp_policies_company" ON "benefit_workers_comp_policies" ("company_id", "status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_benefit_workers_comp_class_codes_policy" ON "benefit_workers_comp_class_codes" ("policy_id", "code");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_benefit_workers_comp_claims_company_status" ON "benefit_workers_comp_claims" ("company_id", "status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_benefit_workers_comp_claims_employee" ON "benefit_workers_comp_claims" ("employee_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_benefit_workers_comp_certificates_policy" ON "benefit_workers_comp_certificates" ("policy_id", "status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_benefit_workers_comp_audits_policy_year" ON "benefit_workers_comp_audits" ("policy_id", "audit_year");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_cobra_cases_company_status" ON "cobra_cases" ("company_id", "status");
