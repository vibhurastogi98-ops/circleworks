ALTER TABLE "employees" ADD COLUMN "pay_type" text DEFAULT 'salary';--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "termination_date" date;--> statement-breakpoint
CREATE TABLE "pay_schedules" (
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
CREATE TABLE "payroll_time_imports" (
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
ALTER TABLE "pay_schedules" ADD CONSTRAINT "pay_schedules_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_time_imports" ADD CONSTRAINT "payroll_time_imports_payroll_id_payrolls_id_fk" FOREIGN KEY ("payroll_id") REFERENCES "public"."payrolls"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_time_imports" ADD CONSTRAINT "payroll_time_imports_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_time_imports" ADD CONSTRAINT "payroll_time_imports_timesheet_id_timesheets_id_fk" FOREIGN KEY ("timesheet_id") REFERENCES "public"."timesheets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
