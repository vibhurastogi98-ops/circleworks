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
ALTER TABLE "ewa_advances" ADD CONSTRAINT "ewa_advances_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "ewa_advances" ADD CONSTRAINT "ewa_advances_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "ewa_advances" ADD CONSTRAINT "ewa_advances_repayment_run_id_payrolls_id_fk" FOREIGN KEY ("repayment_run_id") REFERENCES "public"."payrolls"("id") ON DELETE set null ON UPDATE no action;
