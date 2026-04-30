ALTER TABLE "expense_reports" ADD COLUMN "approved_by" integer;--> statement-breakpoint
ALTER TABLE "expense_reports" ADD COLUMN "payroll_run_id" integer;--> statement-breakpoint
ALTER TABLE "expense_reports" ADD COLUMN "reimbursed_at" timestamp;--> statement-breakpoint
ALTER TABLE "expense_reports" ADD CONSTRAINT "expense_reports_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense_reports" ADD CONSTRAINT "expense_reports_payroll_run_id_payrolls_id_fk" FOREIGN KEY ("payroll_run_id") REFERENCES "public"."payrolls"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
