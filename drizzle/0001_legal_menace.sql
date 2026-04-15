CREATE TYPE "public"."agency_invoice_status" AS ENUM('Draft', 'Approved', 'Sent', 'Paid');--> statement-breakpoint
CREATE TYPE "public"."asset_status" AS ENUM('Available', 'Assigned', 'In Repair', 'Retired');--> statement-breakpoint
CREATE TYPE "public"."asset_type" AS ENUM('Laptop', 'Monitor', 'Phone', 'Keyboard', 'Badge', 'Parking Pass', 'Other');--> statement-breakpoint
CREATE TYPE "public"."billing_cycle" AS ENUM('weekly', 'bi-weekly', 'monthly');--> statement-breakpoint
CREATE TYPE "public"."billing_rate_type" AS ENUM('cost-plus', 'fixed', 'hourly');--> statement-breakpoint
CREATE TYPE "public"."contract_status" AS ENUM('Draft', 'Pending Signature', 'Active', 'Expired', 'Terminated');--> statement-breakpoint
CREATE TYPE "public"."contractor_status" AS ENUM('Active', 'Onboarding', 'Pending', 'Inactive');--> statement-breakpoint
CREATE TYPE "public"."invoice_status" AS ENUM('Pending', 'Approved', 'Revision Requested', 'Rejected', 'Paid');--> statement-breakpoint
CREATE TYPE "public"."supplemental_payment_status" AS ENUM('Pending', 'Approved', 'Paid', 'Held', 'Recouping');--> statement-breakpoint
CREATE TYPE "public"."supplemental_payment_type" AS ENUM('Royalty', 'Residual', 'Advance', 'Commission', 'Signing Bonus');--> statement-breakpoint
ALTER TYPE "public"."role" ADD VALUE 'accountant';--> statement-breakpoint
CREATE TABLE "aca_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" integer,
	"status" text NOT NULL,
	"hours_per_week" integer,
	"coverage_offered" boolean DEFAULT false,
	"affordable" boolean DEFAULT false,
	"minimum_value" boolean DEFAULT false,
	"form_1095c_code" text,
	"form_1095c_status" text DEFAULT 'pending',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "accounting_firms" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"logo_url" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "agency_clients" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer,
	"name" text NOT NULL,
	"email" text,
	"contact_name" text,
	"logo_url" text,
	"billing_rate_type" text DEFAULT 'cost-plus',
	"markup_percentage" real DEFAULT 0,
	"fixed_fee" integer DEFAULT 0,
	"hourly_rate" integer DEFAULT 0,
	"billing_cycle" text DEFAULT 'monthly',
	"payment_terms" text DEFAULT 'Net 30',
	"accounting_sync" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "agency_invoice_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"invoice_id" integer,
	"employee_id" integer,
	"description" text NOT NULL,
	"unit_price" integer DEFAULT 0,
	"quantity" real DEFAULT 1,
	"cost" integer NOT NULL,
	"markup" integer DEFAULT 0,
	"total" integer NOT NULL,
	"item_type" text DEFAULT 'labor'
);
--> statement-breakpoint
CREATE TABLE "agency_invoices" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer,
	"company_id" integer,
	"invoice_number" text NOT NULL,
	"period_start" date NOT NULL,
	"period_end" date NOT NULL,
	"amount" integer NOT NULL,
	"status" text DEFAULT 'Draft',
	"due_date" date NOT NULL,
	"sent_at" timestamp,
	"paid_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "agency_projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer,
	"client_id" integer,
	"name" text NOT NULL,
	"description" text,
	"budget" integer,
	"start_date" date,
	"end_date" date,
	"status" text DEFAULT 'Active',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "announcement_reads" (
	"id" serial PRIMARY KEY NOT NULL,
	"announcement_id" integer,
	"employee_id" integer,
	"read_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "announcements" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"audience" text DEFAULT 'All Employees',
	"department" text,
	"location" text,
	"priority" text DEFAULT 'Normal',
	"status" text DEFAULT 'Draft',
	"publish_at" timestamp,
	"expire_at" timestamp,
	"is_pinned" boolean DEFAULT false,
	"attachments" text,
	"views_count" integer DEFAULT 0,
	"unique_readers" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "asset_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"asset_id" integer,
	"employee_id" integer,
	"assigned_at" timestamp DEFAULT now(),
	"returned_at" timestamp,
	"assigned_by" text,
	"status" text DEFAULT 'Active',
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "assets" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer,
	"name" text NOT NULL,
	"type" text DEFAULT 'Laptop',
	"serial_number" text,
	"status" text DEFAULT 'Available',
	"purchase_date" date,
	"value" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ats_offers" (
	"id" serial PRIMARY KEY NOT NULL,
	"candidate_id" integer,
	"job_id" integer,
	"salary" integer,
	"signing_bonus" integer,
	"equity" text,
	"start_date" date,
	"title" text,
	"department_id" text,
	"location_id" text,
	"employment_type" text DEFAULT 'full-time',
	"status" text DEFAULT 'Pending',
	"sent_at" timestamp DEFAULT now(),
	"responded_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "chart_of_accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer,
	"account_number" text NOT NULL,
	"account_name" text NOT NULL,
	"account_type" text NOT NULL,
	"status" text DEFAULT 'Active',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "company_paid_leave" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer,
	"program_id" integer,
	"custom_employer_rate" real,
	"status" text DEFAULT 'Active',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "contractor_invoices" (
	"id" serial PRIMARY KEY NOT NULL,
	"contractor_id" integer,
	"invoice_number" text NOT NULL,
	"amount" integer NOT NULL,
	"description" text,
	"submitted_date" date NOT NULL,
	"due_date" date NOT NULL,
	"status" text DEFAULT 'Pending',
	"hours" real,
	"rate" integer,
	"attachment_url" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "contractors" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer,
	"name" text NOT NULL,
	"business_name" text,
	"email" text NOT NULL,
	"phone" text,
	"status" text DEFAULT 'Onboarding',
	"w9_status" text DEFAULT 'Not Submitted',
	"tin_masked" text,
	"tin_type" text,
	"onboarding_step" text DEFAULT 'Invited',
	"ytd_payments" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "contracts" (
	"id" serial PRIMARY KEY NOT NULL,
	"contractor_id" integer,
	"title" text NOT NULL,
	"type" text NOT NULL,
	"rate" integer NOT NULL,
	"rate_unit" text DEFAULT '/hr',
	"start_date" date NOT NULL,
	"end_date" date,
	"payment_terms" text DEFAULT 'Net 30',
	"status" text DEFAULT 'Draft',
	"signed_by_admin" boolean DEFAULT false,
	"signed_by_contractor" boolean DEFAULT false,
	"signed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "course_enrollments" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_id" integer,
	"employee_id" integer,
	"status" text DEFAULT 'Not Started',
	"progress" integer DEFAULT 0,
	"enrolled_at" timestamp DEFAULT now(),
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer,
	"title" text NOT NULL,
	"description" text,
	"category" text,
	"duration_mins" integer,
	"status" text DEFAULT 'Active',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "employee_goals" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" integer,
	"title" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'On Track',
	"progress" integer DEFAULT 0,
	"due_date" date,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "employee_union_memberships" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" integer,
	"union_id" integer,
	"membership_number" text,
	"join_date" date,
	"status" text DEFAULT 'Active',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "firm_clients" (
	"id" serial PRIMARY KEY NOT NULL,
	"firm_id" integer,
	"company_id" integer,
	"status" text DEFAULT 'Active',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "firm_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"firm_id" integer,
	"role" text DEFAULT 'member',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "handbook_sections" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer,
	"title" text NOT NULL,
	"sort_order" integer DEFAULT 0,
	"state_specific" text,
	"last_modified" date,
	"word_count" integer DEFAULT 0,
	"content" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "handbook_versions" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer,
	"version" text NOT NULL,
	"published_date" date NOT NULL,
	"published_by" text,
	"change_notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "headcount_forecasts" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer,
	"month" text NOT NULL,
	"projected_count" integer NOT NULL,
	"planned_hires" integer DEFAULT 0,
	"attrition_rate" real DEFAULT 0,
	"budget_impact" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "i9_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" integer,
	"i9_status" text DEFAULT 'pending',
	"expiration_date" date,
	"section3_complete" boolean DEFAULT false,
	"e_verify_status" text DEFAULT 'not_submitted',
	"e_verify_case_number" text,
	"document_type" text,
	"last_audit_date" date,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "journal_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer,
	"payroll_id" integer,
	"entry_date" date NOT NULL,
	"description" text,
	"status" text DEFAULT 'Pending Sync',
	"sync_date" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "journal_entry_lines" (
	"id" serial PRIMARY KEY NOT NULL,
	"journal_entry_id" integer,
	"account_id" integer,
	"amount" integer NOT NULL,
	"type" text NOT NULL,
	"department" text
);
--> statement-breakpoint
CREATE TABLE "labor_posters" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer,
	"name" text NOT NULL,
	"jurisdiction" text NOT NULL,
	"status" text DEFAULT 'current',
	"last_updated" date,
	"effective_date" date,
	"category" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "necs_1099" (
	"id" serial PRIMARY KEY NOT NULL,
	"contractor_id" integer,
	"tax_year" integer NOT NULL,
	"box1_amount" integer NOT NULL,
	"status" text DEFAULT 'Draft',
	"delivery_method" text DEFAULT 'E-Delivery',
	"tin" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "one_on_one_meetings" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" integer,
	"manager_id" integer,
	"date" date NOT NULL,
	"notes" text,
	"action_items" text,
	"status" text DEFAULT 'Scheduled',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "paid_leave_programs" (
	"id" serial PRIMARY KEY NOT NULL,
	"state_code" text NOT NULL,
	"program_name" text NOT NULL,
	"employee_rate" real NOT NULL,
	"employer_rate" real NOT NULL,
	"wage_base" integer NOT NULL,
	"last_updated" date,
	"alert" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "performance_cycles" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer,
	"name" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"status" text DEFAULT 'Draft',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "performance_reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"cycle_id" integer,
	"employee_id" integer,
	"reviewer_id" integer,
	"status" text DEFAULT 'Pending',
	"rating" integer,
	"feedback" text,
	"submitted_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "project_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer,
	"employee_id" integer,
	"assigned_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer,
	"name" text NOT NULL,
	"client_name" text,
	"code" text,
	"billing_rate" integer,
	"budget_hours" integer,
	"is_billable" boolean DEFAULT true,
	"status" text DEFAULT 'Active',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "residual_payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer,
	"talent_name" text NOT NULL,
	"show_title" text NOT NULL,
	"network" text,
	"reuse_type" text,
	"scale" text,
	"amount" integer NOT NULL,
	"category_1099" text DEFAULT '1099-MISC Box 2',
	"payment_date" date,
	"status" text DEFAULT 'Imported',
	"batch_id" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "royalty_schedules" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer,
	"employee_id" integer,
	"contractor_id" integer,
	"recipient_name" text NOT NULL,
	"recipient_type" text NOT NULL,
	"project_title" text NOT NULL,
	"royalty_type" text NOT NULL,
	"rate" real NOT NULL,
	"rate_unit" text,
	"units_sold" integer DEFAULT 0,
	"units_threshold" integer DEFAULT 0,
	"frequency" text DEFAULT 'Quarterly',
	"advance_balance" integer DEFAULT 0,
	"total_recouped" integer DEFAULT 0,
	"total_earned" integer DEFAULT 0,
	"status" text DEFAULT 'Draft',
	"next_payment_date" date,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "saved_custom_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer,
	"name" text NOT NULL,
	"description" text,
	"data_source" text NOT NULL,
	"fields" text NOT NULL,
	"visibility" text DEFAULT 'private',
	"created_by" text,
	"last_run" date,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sui_rates" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer,
	"state" text NOT NULL,
	"state_abbr" text NOT NULL,
	"tax_year" integer NOT NULL,
	"rate" real NOT NULL,
	"wage_base" integer NOT NULL,
	"source" text DEFAULT 'State Portal',
	"date_updated" date NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "supplemental_payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer,
	"employee_id" integer,
	"contractor_id" integer,
	"recipient_name" text NOT NULL,
	"recipient_type" text NOT NULL,
	"payment_type" text NOT NULL,
	"description" text,
	"amount" integer NOT NULL,
	"tax_treatment" text,
	"status" text DEFAULT 'Pending',
	"scheduled_date" date,
	"paid_date" date,
	"project_title" text,
	"notes" text,
	"royalty_schedule_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tax_filings" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer,
	"form_name" text NOT NULL,
	"form_number" text NOT NULL,
	"jurisdiction" text NOT NULL,
	"due_date" date NOT NULL,
	"status" text DEFAULT 'upcoming',
	"filed_date" date,
	"confirmation_number" text,
	"amount" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "union_contracts" (
	"id" serial PRIMARY KEY NOT NULL,
	"union_id" integer,
	"contract_name" text NOT NULL,
	"dues_type" text DEFAULT 'percentage',
	"dues_rate" real NOT NULL,
	"pension_rate" real NOT NULL,
	"health_welfare_rate" real NOT NULL,
	"work_dues_rate" real DEFAULT 0,
	"effective_date" date NOT NULL,
	"expiration_date" date,
	"status" text DEFAULT 'Active',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "union_contribution_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer,
	"union_id" integer,
	"report_month" text NOT NULL,
	"total_earnings" integer DEFAULT 0,
	"total_dues" integer DEFAULT 0,
	"total_pension" integer DEFAULT 0,
	"total_health_welfare" integer DEFAULT 0,
	"total_fringe" integer DEFAULT 0,
	"employee_count" integer DEFAULT 0,
	"total_hours" real DEFAULT 0,
	"status" text DEFAULT 'Draft',
	"export_format" text,
	"submitted_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "union_fringe_benefits" (
	"id" serial PRIMARY KEY NOT NULL,
	"contract_id" integer,
	"benefit_name" text NOT NULL,
	"rate" real NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "union_payroll_calculations" (
	"id" serial PRIMARY KEY NOT NULL,
	"payroll_id" integer,
	"employee_id" integer,
	"union_id" integer,
	"contract_id" integer,
	"gross_earnings" integer NOT NULL,
	"dues_deduction" integer DEFAULT 0,
	"work_dues_deduction" integer DEFAULT 0,
	"pension_contribution" integer DEFAULT 0,
	"health_welfare_contribution" integer DEFAULT 0,
	"fringe_contribution" integer DEFAULT 0,
	"total_employee_deductions" integer DEFAULT 0,
	"total_employer_contributions" integer DEFAULT 0,
	"hours_worked" real DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "unions" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer,
	"name" text NOT NULL,
	"abbreviation" text,
	"description" text,
	"status" text DEFAULT 'Active',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wotc_screenings" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" integer,
	"questionnaire_complete" boolean DEFAULT false,
	"eligible" boolean DEFAULT false,
	"target_group" text,
	"estimated_credit" integer DEFAULT 0,
	"form_8850_generated" boolean DEFAULT false,
	"submission_status" text DEFAULT 'not_applicable',
	"submission_date" date,
	"state_agency" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "ats_candidates" ADD COLUMN "phone" text;--> statement-breakpoint
ALTER TABLE "ats_jobs" ADD COLUMN "department" text;--> statement-breakpoint
ALTER TABLE "ats_jobs" ADD COLUMN "location" text;--> statement-breakpoint
ALTER TABLE "ats_jobs" ADD COLUMN "employment_type" text DEFAULT 'Full-Time';--> statement-breakpoint
ALTER TABLE "ats_jobs" ADD COLUMN "manager_id" integer;--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "personal_email" text;--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "personal_phone" text;--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "department_id" text;--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "location_id" text;--> statement-breakpoint
ALTER TABLE "onboarding_cases" ADD COLUMN "candidate_id" integer;--> statement-breakpoint
ALTER TABLE "time_entries" ADD COLUMN "company_id" integer;--> statement-breakpoint
ALTER TABLE "time_entries" ADD COLUMN "project_id" integer;--> statement-breakpoint
ALTER TABLE "aca_records" ADD CONSTRAINT "aca_records_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agency_clients" ADD CONSTRAINT "agency_clients_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agency_invoice_items" ADD CONSTRAINT "agency_invoice_items_invoice_id_agency_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."agency_invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agency_invoice_items" ADD CONSTRAINT "agency_invoice_items_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agency_invoices" ADD CONSTRAINT "agency_invoices_client_id_agency_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."agency_clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agency_invoices" ADD CONSTRAINT "agency_invoices_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agency_projects" ADD CONSTRAINT "agency_projects_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agency_projects" ADD CONSTRAINT "agency_projects_client_id_agency_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."agency_clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "announcement_reads" ADD CONSTRAINT "announcement_reads_announcement_id_announcements_id_fk" FOREIGN KEY ("announcement_id") REFERENCES "public"."announcements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "announcement_reads" ADD CONSTRAINT "announcement_reads_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_assignments" ADD CONSTRAINT "asset_assignments_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_assignments" ADD CONSTRAINT "asset_assignments_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ats_offers" ADD CONSTRAINT "ats_offers_candidate_id_ats_candidates_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."ats_candidates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ats_offers" ADD CONSTRAINT "ats_offers_job_id_ats_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."ats_jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chart_of_accounts" ADD CONSTRAINT "chart_of_accounts_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_paid_leave" ADD CONSTRAINT "company_paid_leave_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_paid_leave" ADD CONSTRAINT "company_paid_leave_program_id_paid_leave_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."paid_leave_programs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contractor_invoices" ADD CONSTRAINT "contractor_invoices_contractor_id_contractors_id_fk" FOREIGN KEY ("contractor_id") REFERENCES "public"."contractors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contractors" ADD CONSTRAINT "contractors_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_contractor_id_contractors_id_fk" FOREIGN KEY ("contractor_id") REFERENCES "public"."contractors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_goals" ADD CONSTRAINT "employee_goals_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_union_memberships" ADD CONSTRAINT "employee_union_memberships_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_union_memberships" ADD CONSTRAINT "employee_union_memberships_union_id_unions_id_fk" FOREIGN KEY ("union_id") REFERENCES "public"."unions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "firm_clients" ADD CONSTRAINT "firm_clients_firm_id_accounting_firms_id_fk" FOREIGN KEY ("firm_id") REFERENCES "public"."accounting_firms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "firm_clients" ADD CONSTRAINT "firm_clients_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "firm_users" ADD CONSTRAINT "firm_users_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "firm_users" ADD CONSTRAINT "firm_users_firm_id_accounting_firms_id_fk" FOREIGN KEY ("firm_id") REFERENCES "public"."accounting_firms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "handbook_sections" ADD CONSTRAINT "handbook_sections_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "handbook_versions" ADD CONSTRAINT "handbook_versions_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "headcount_forecasts" ADD CONSTRAINT "headcount_forecasts_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "i9_records" ADD CONSTRAINT "i9_records_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_payroll_id_payrolls_id_fk" FOREIGN KEY ("payroll_id") REFERENCES "public"."payrolls"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal_entry_lines" ADD CONSTRAINT "journal_entry_lines_journal_entry_id_journal_entries_id_fk" FOREIGN KEY ("journal_entry_id") REFERENCES "public"."journal_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal_entry_lines" ADD CONSTRAINT "journal_entry_lines_account_id_chart_of_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."chart_of_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "labor_posters" ADD CONSTRAINT "labor_posters_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "necs_1099" ADD CONSTRAINT "necs_1099_contractor_id_contractors_id_fk" FOREIGN KEY ("contractor_id") REFERENCES "public"."contractors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "one_on_one_meetings" ADD CONSTRAINT "one_on_one_meetings_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "one_on_one_meetings" ADD CONSTRAINT "one_on_one_meetings_manager_id_employees_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "performance_cycles" ADD CONSTRAINT "performance_cycles_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "performance_reviews" ADD CONSTRAINT "performance_reviews_cycle_id_performance_cycles_id_fk" FOREIGN KEY ("cycle_id") REFERENCES "public"."performance_cycles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "performance_reviews" ADD CONSTRAINT "performance_reviews_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "performance_reviews" ADD CONSTRAINT "performance_reviews_reviewer_id_employees_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."employees"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_assignments" ADD CONSTRAINT "project_assignments_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_assignments" ADD CONSTRAINT "project_assignments_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "residual_payments" ADD CONSTRAINT "residual_payments_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "royalty_schedules" ADD CONSTRAINT "royalty_schedules_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "royalty_schedules" ADD CONSTRAINT "royalty_schedules_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "royalty_schedules" ADD CONSTRAINT "royalty_schedules_contractor_id_contractors_id_fk" FOREIGN KEY ("contractor_id") REFERENCES "public"."contractors"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_custom_reports" ADD CONSTRAINT "saved_custom_reports_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sui_rates" ADD CONSTRAINT "sui_rates_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplemental_payments" ADD CONSTRAINT "supplemental_payments_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplemental_payments" ADD CONSTRAINT "supplemental_payments_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplemental_payments" ADD CONSTRAINT "supplemental_payments_contractor_id_contractors_id_fk" FOREIGN KEY ("contractor_id") REFERENCES "public"."contractors"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tax_filings" ADD CONSTRAINT "tax_filings_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "union_contracts" ADD CONSTRAINT "union_contracts_union_id_unions_id_fk" FOREIGN KEY ("union_id") REFERENCES "public"."unions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "union_contribution_reports" ADD CONSTRAINT "union_contribution_reports_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "union_contribution_reports" ADD CONSTRAINT "union_contribution_reports_union_id_unions_id_fk" FOREIGN KEY ("union_id") REFERENCES "public"."unions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "union_fringe_benefits" ADD CONSTRAINT "union_fringe_benefits_contract_id_union_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."union_contracts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "union_payroll_calculations" ADD CONSTRAINT "union_payroll_calculations_payroll_id_payrolls_id_fk" FOREIGN KEY ("payroll_id") REFERENCES "public"."payrolls"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "union_payroll_calculations" ADD CONSTRAINT "union_payroll_calculations_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "union_payroll_calculations" ADD CONSTRAINT "union_payroll_calculations_union_id_unions_id_fk" FOREIGN KEY ("union_id") REFERENCES "public"."unions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "union_payroll_calculations" ADD CONSTRAINT "union_payroll_calculations_contract_id_union_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."union_contracts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "unions" ADD CONSTRAINT "unions_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wotc_screenings" ADD CONSTRAINT "wotc_screenings_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;