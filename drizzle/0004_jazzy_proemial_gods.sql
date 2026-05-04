CREATE TABLE "contact_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"company_size" text,
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "i9_verifications" (
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
CREATE TABLE "preboarding_invitations" (
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
CREATE TABLE "shifts" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" integer,
	"company_id" integer,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"status" text DEFAULT 'Scheduled',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "time_breaks" (
	"id" serial PRIMARY KEY NOT NULL,
	"time_entry_id" integer,
	"break_start" timestamp NOT NULL,
	"break_end" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "w4_forms" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" integer,
	"filing_status" text,
	"multiple_jobs" boolean DEFAULT false,
	"claim_dependents" integer DEFAULT 0,
	"other_income" integer DEFAULT 0,
	"deductions" integer DEFAULT 0,
	"extra_withholding" integer DEFAULT 0,
	"exempt" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "w4_forms_employee_id_unique" UNIQUE("employee_id")
);
--> statement-breakpoint
CREATE TABLE "webhook_registrations" (
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
ALTER TABLE "users" ALTER COLUMN "clerk_user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password_hash" text;--> statement-breakpoint
ALTER TABLE "i9_verifications" ADD CONSTRAINT "i9_verifications_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "i9_verifications" ADD CONSTRAINT "i9_verifications_section_2_completed_by_users_id_fk" FOREIGN KEY ("section_2_completed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "preboarding_invitations" ADD CONSTRAINT "preboarding_invitations_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "preboarding_invitations" ADD CONSTRAINT "preboarding_invitations_manager_id_employees_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."employees"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "preboarding_invitations" ADD CONSTRAINT "preboarding_invitations_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_breaks" ADD CONSTRAINT "time_breaks_time_entry_id_time_entries_id_fk" FOREIGN KEY ("time_entry_id") REFERENCES "public"."time_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "w4_forms" ADD CONSTRAINT "w4_forms_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhook_registrations" ADD CONSTRAINT "webhook_registrations_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense_reports" ADD CONSTRAINT "expense_reports_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense_reports" ADD CONSTRAINT "expense_reports_payroll_run_id_payrolls_id_fk" FOREIGN KEY ("payroll_run_id") REFERENCES "public"."payrolls"("id") ON DELETE set null ON UPDATE no action;