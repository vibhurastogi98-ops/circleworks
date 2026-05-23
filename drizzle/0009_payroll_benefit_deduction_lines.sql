CREATE TABLE "payroll_benefit_deductions" (
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
ALTER TABLE "payroll_benefit_deductions" ADD CONSTRAINT "payroll_benefit_deductions_payroll_id_payrolls_id_fk" FOREIGN KEY ("payroll_id") REFERENCES "public"."payrolls"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "payroll_benefit_deductions" ADD CONSTRAINT "payroll_benefit_deductions_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "payroll_benefit_deductions" ADD CONSTRAINT "payroll_benefit_deductions_benefit_plan_id_benefit_plans_id_fk" FOREIGN KEY ("benefit_plan_id") REFERENCES "public"."benefit_plans"("id") ON DELETE set null ON UPDATE no action;
