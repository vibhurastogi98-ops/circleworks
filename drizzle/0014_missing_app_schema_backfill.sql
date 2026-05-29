CREATE TABLE IF NOT EXISTS "pay_schedules" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer,
	"name" text NOT NULL,
	"frequency" text NOT NULL,
	"cutoff_hours_before_run" integer DEFAULT 24,
	"is_default" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pay_schedules_company_id_companies_id_fk') THEN
    ALTER TABLE "pay_schedules" ADD CONSTRAINT "pay_schedules_company_id_companies_id_fk"
      FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payroll_time_imports" (
	"id" serial PRIMARY KEY NOT NULL,
	"payroll_id" integer,
	"employee_id" integer,
	"timesheet_id" integer,
	"source" text DEFAULT 'timesheet',
	"regular_hours" real DEFAULT 0,
	"overtime_hours" real DEFAULT 0,
	"double_time_hours" real DEFAULT 0,
	"total_hours" real DEFAULT 0,
	"daily_breakdown" text,
	"late_within_cutoff" boolean DEFAULT false,
	"partial_period_reason" text,
	"manually_overridden" boolean DEFAULT false,
	"override_original_hours" real,
	"override_hours" real,
	"override_reason" text,
	"overridden_at" timestamp,
	"imported_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payroll_time_imports_payroll_id_payrolls_id_fk') THEN
    ALTER TABLE "payroll_time_imports" ADD CONSTRAINT "payroll_time_imports_payroll_id_payrolls_id_fk"
      FOREIGN KEY ("payroll_id") REFERENCES "public"."payrolls"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payroll_time_imports_employee_id_employees_id_fk') THEN
    ALTER TABLE "payroll_time_imports" ADD CONSTRAINT "payroll_time_imports_employee_id_employees_id_fk"
      FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payroll_time_imports_timesheet_id_timesheets_id_fk') THEN
    ALTER TABLE "payroll_time_imports" ADD CONSTRAINT "payroll_time_imports_timesheet_id_timesheets_id_fk"
      FOREIGN KEY ("timesheet_id") REFERENCES "public"."timesheets"("id") ON DELETE set null ON UPDATE no action;
  END IF;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer,
	"employee_id" integer NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"link" text,
	"status" text,
	"is_read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'notifications_company_id_companies_id_fk') THEN
    ALTER TABLE "notifications" ADD CONSTRAINT "notifications_company_id_companies_id_fk"
      FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'notifications_employee_id_employees_id_fk') THEN
    ALTER TABLE "notifications" ADD CONSTRAINT "notifications_employee_id_employees_id_fk"
      FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "preboarding_invitations" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer,
	"email" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"token" text NOT NULL,
	"status" text DEFAULT 'Pending',
	"start_date" date NOT NULL,
	"manager_id" integer,
	"employee_id" integer,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "preboarding_invitations_token_unique" UNIQUE("token")
);
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'preboarding_invitations_company_id_companies_id_fk') THEN
    ALTER TABLE "preboarding_invitations" ADD CONSTRAINT "preboarding_invitations_company_id_companies_id_fk"
      FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'preboarding_invitations_manager_id_employees_id_fk') THEN
    ALTER TABLE "preboarding_invitations" ADD CONSTRAINT "preboarding_invitations_manager_id_employees_id_fk"
      FOREIGN KEY ("manager_id") REFERENCES "public"."employees"("id") ON DELETE set null ON UPDATE no action;
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'preboarding_invitations_employee_id_employees_id_fk') THEN
    ALTER TABLE "preboarding_invitations" ADD CONSTRAINT "preboarding_invitations_employee_id_employees_id_fk"
      FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE set null ON UPDATE no action;
  END IF;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "i9_verifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" integer,
	"citizenship_status" text,
	"attested" boolean DEFAULT false,
	"attested_at" timestamp,
	"section_2_completed" boolean DEFAULT false,
	"section_2_completed_by" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "i9_verifications_employee_id_unique" UNIQUE("employee_id")
);
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'i9_verifications_employee_id_employees_id_fk') THEN
    ALTER TABLE "i9_verifications" ADD CONSTRAINT "i9_verifications_employee_id_employees_id_fk"
      FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'i9_verifications_section_2_completed_by_users_id_fk') THEN
    ALTER TABLE "i9_verifications" ADD CONSTRAINT "i9_verifications_section_2_completed_by_users_id_fk"
      FOREIGN KEY ("section_2_completed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  END IF;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "w4_forms" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" integer,
	"filing_status" text,
	"multiple_jobs" boolean DEFAULT false,
	"claim_dependents" integer DEFAULT 0,
	"other_income" integer DEFAULT 0,
	"deductions" integer DEFAULT 0,
	"extra_withholding" integer DEFAULT 0,
	"exempt" boolean DEFAULT false,
	"ssn_encrypted" text,
	"signature" text,
	"signed_at" timestamp,
	"status" text DEFAULT 'Pending',
	"document_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "w4_forms_employee_id_unique" UNIQUE("employee_id")
);
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'w4_forms_employee_id_employees_id_fk') THEN
    ALTER TABLE "w4_forms" ADD CONSTRAINT "w4_forms_employee_id_employees_id_fk"
      FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'w4_forms_document_id_employee_documents_id_fk') THEN
    ALTER TABLE "w4_forms" ADD CONSTRAINT "w4_forms_document_id_employee_documents_id_fk"
      FOREIGN KEY ("document_id") REFERENCES "public"."employee_documents"("id") ON DELETE set null ON UPDATE no action;
  END IF;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "webhook_registrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer,
	"url" text NOT NULL,
	"secret" text NOT NULL,
	"events" text NOT NULL,
	"description" text,
	"active" boolean DEFAULT true,
	"last_delivery_at" timestamp,
	"last_delivery_status" integer,
	"failure_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'webhook_registrations_company_id_companies_id_fk') THEN
    ALTER TABLE "webhook_registrations" ADD CONSTRAINT "webhook_registrations_company_id_companies_id_fk"
      FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ewa_advances" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" integer NOT NULL,
	"company_id" integer,
	"amount" integer NOT NULL,
	"remaining_balance" integer NOT NULL,
	"issue_date" date NOT NULL,
	"repayment_run_id" integer,
	"status" text DEFAULT 'outstanding',
	"state_minimum_wage" real DEFAULT 7.25,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ewa_advances_employee_id_employees_id_fk') THEN
    ALTER TABLE "ewa_advances" ADD CONSTRAINT "ewa_advances_employee_id_employees_id_fk"
      FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ewa_advances_company_id_companies_id_fk') THEN
    ALTER TABLE "ewa_advances" ADD CONSTRAINT "ewa_advances_company_id_companies_id_fk"
      FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ewa_advances_repayment_run_id_payrolls_id_fk') THEN
    ALTER TABLE "ewa_advances" ADD CONSTRAINT "ewa_advances_repayment_run_id_payrolls_id_fk"
      FOREIGN KEY ("repayment_run_id") REFERENCES "public"."payrolls"("id") ON DELETE set null ON UPDATE no action;
  END IF;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "contact_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"company_size" text,
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_pay_schedules_company" ON "pay_schedules" ("company_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_payroll_time_imports_payroll" ON "payroll_time_imports" ("payroll_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_payroll_time_imports_employee" ON "payroll_time_imports" ("employee_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_notifications_emp" ON "notifications" ("employee_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_notifications_type" ON "notifications" ("type");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_preboarding_invitations_token" ON "preboarding_invitations" ("token");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_i9_verifications_emp" ON "i9_verifications" ("employee_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_w4_forms_emp" ON "w4_forms" ("employee_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_webhook_registrations_company" ON "webhook_registrations" ("company_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_webhook_registrations_active" ON "webhook_registrations" ("active");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_ewa_advances_employee" ON "ewa_advances" ("employee_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_ewa_advances_company_status" ON "ewa_advances" ("company_id", "status");
