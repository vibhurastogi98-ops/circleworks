CREATE TYPE "public"."employment_type" AS ENUM('full-time', 'part-time', 'contractor');--> statement-breakpoint
CREATE TYPE "public"."payroll_status" AS ENUM('draft', 'pending', 'processed', 'paid', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."payroll_type" AS ENUM('regular', 'off-cycle', 'bonus');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('admin', 'hr', 'employee');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('active', 'onboarding', 'terminated');--> statement-breakpoint
CREATE TABLE "ats_candidates" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_id" integer,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text,
	"stage" text DEFAULT 'New',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ats_jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer,
	"title" text NOT NULL,
	"status" text DEFAULT 'Active',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "benefit_enrollments" (
	"id" serial PRIMARY KEY NOT NULL,
	"plan_id" integer,
	"employee_id" integer,
	"status" text DEFAULT 'Pending',
	"enrolled_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "benefit_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"carrier" text,
	"employee_premium" integer DEFAULT 0,
	"employer_premium" integer DEFAULT 0,
	"status" text DEFAULT 'Active',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"logo_url" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "employee_bank_accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" integer,
	"bank_name" text NOT NULL,
	"routing_number" text NOT NULL,
	"account_number_masked" text NOT NULL,
	"is_primary" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "employee_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" integer,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"file_url" text,
	"status" text DEFAULT 'Unread',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "employees" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"company_id" integer,
	"first_name" text NOT NULL,
	"last_name" text,
	"email" text,
	"avatar" text DEFAULT 'https://api.dicebear.com/7.x/notionists/svg?seed=Employee&backgroundColor=transparent',
	"job_title" text,
	"department" text,
	"salary" integer,
	"employment_type" text DEFAULT 'full-time',
	"location" text,
	"location_type" text DEFAULT 'On-Site',
	"start_date" date,
	"status" text DEFAULT 'active',
	"manager_id" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "expense_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"report_id" integer,
	"date" date NOT NULL,
	"merchant" text NOT NULL,
	"category" text NOT NULL,
	"amount" integer NOT NULL,
	"receipt_url" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "expense_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" integer,
	"company_id" integer,
	"title" text NOT NULL,
	"total_amount" integer DEFAULT 0,
	"status" text DEFAULT 'Draft',
	"submitted_at" timestamp,
	"approved_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "onboarding_cases" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" integer,
	"template_id" integer,
	"status" text DEFAULT 'Active',
	"start_date" date,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "onboarding_tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"template_id" integer,
	"title" text NOT NULL,
	"assignee_role" text DEFAULT 'HR',
	"due_offset_days" integer DEFAULT 0,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "onboarding_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer,
	"name" text NOT NULL,
	"type" text DEFAULT 'onboarding',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payroll_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"payroll_id" integer,
	"employee_id" integer,
	"gross" integer NOT NULL,
	"federal_tax" integer DEFAULT 0,
	"state_tax" integer DEFAULT 0,
	"fica_ss" integer DEFAULT 0,
	"fica_med" integer DEFAULT 0,
	"benefits" integer DEFAULT 0,
	"net" integer NOT NULL,
	"type" text DEFAULT 'regular'
);
--> statement-breakpoint
CREATE TABLE "payrolls" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer,
	"pay_period_start" date NOT NULL,
	"pay_period_end" date NOT NULL,
	"check_date" date NOT NULL,
	"total_gross" integer DEFAULT 0,
	"total_taxes" integer DEFAULT 0,
	"total_benefits" integer DEFAULT 0,
	"total_net" integer DEFAULT 0,
	"status" text DEFAULT 'draft',
	"type" text DEFAULT 'regular',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pto_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" integer,
	"company_id" integer,
	"type" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"status" text DEFAULT 'Pending',
	"approver_id" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "time_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" integer,
	"timesheet_id" integer,
	"clock_in" timestamp NOT NULL,
	"clock_out" timestamp,
	"entry_type" text DEFAULT 'Regular',
	"location_id" text,
	"status" text DEFAULT 'Approved',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "time_policies" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer,
	"name" text NOT NULL,
	"default_rest_break_mins" integer DEFAULT 15,
	"default_meal_break_mins" integer DEFAULT 30,
	"overtime_threshold_daily" integer DEFAULT 8,
	"overtime_threshold_weekly" integer DEFAULT 40,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "timesheets" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" integer,
	"company_id" integer,
	"period_start" date NOT NULL,
	"period_end" date NOT NULL,
	"total_regular_hours" real DEFAULT 0,
	"total_overtime_hours" real DEFAULT 0,
	"total_double_time_hours" real DEFAULT 0,
	"status" text DEFAULT 'Draft',
	"submitted_at" timestamp,
	"approved_at" timestamp,
	"approver_id" integer,
	"approver_note" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"clerk_user_id" text NOT NULL,
	"email" text NOT NULL,
	"role" text DEFAULT 'employee',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_clerk_user_id_unique" UNIQUE("clerk_user_id")
);
--> statement-breakpoint
ALTER TABLE "ats_candidates" ADD CONSTRAINT "ats_candidates_job_id_ats_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."ats_jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ats_jobs" ADD CONSTRAINT "ats_jobs_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "benefit_enrollments" ADD CONSTRAINT "benefit_enrollments_plan_id_benefit_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."benefit_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "benefit_enrollments" ADD CONSTRAINT "benefit_enrollments_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "benefit_plans" ADD CONSTRAINT "benefit_plans_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_bank_accounts" ADD CONSTRAINT "employee_bank_accounts_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_documents" ADD CONSTRAINT "employee_documents_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense_items" ADD CONSTRAINT "expense_items_report_id_expense_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."expense_reports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense_reports" ADD CONSTRAINT "expense_reports_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense_reports" ADD CONSTRAINT "expense_reports_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onboarding_cases" ADD CONSTRAINT "onboarding_cases_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onboarding_cases" ADD CONSTRAINT "onboarding_cases_template_id_onboarding_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."onboarding_templates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onboarding_tasks" ADD CONSTRAINT "onboarding_tasks_template_id_onboarding_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."onboarding_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onboarding_templates" ADD CONSTRAINT "onboarding_templates_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_items" ADD CONSTRAINT "payroll_items_payroll_id_payrolls_id_fk" FOREIGN KEY ("payroll_id") REFERENCES "public"."payrolls"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_items" ADD CONSTRAINT "payroll_items_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payrolls" ADD CONSTRAINT "payrolls_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pto_requests" ADD CONSTRAINT "pto_requests_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pto_requests" ADD CONSTRAINT "pto_requests_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pto_requests" ADD CONSTRAINT "pto_requests_approver_id_employees_id_fk" FOREIGN KEY ("approver_id") REFERENCES "public"."employees"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_timesheet_id_timesheets_id_fk" FOREIGN KEY ("timesheet_id") REFERENCES "public"."timesheets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_policies" ADD CONSTRAINT "time_policies_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timesheets" ADD CONSTRAINT "timesheets_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timesheets" ADD CONSTRAINT "timesheets_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timesheets" ADD CONSTRAINT "timesheets_approver_id_users_id_fk" FOREIGN KEY ("approver_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;