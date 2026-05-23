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
ALTER TABLE "cobra_cases" ADD CONSTRAINT "cobra_cases_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;
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
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;
