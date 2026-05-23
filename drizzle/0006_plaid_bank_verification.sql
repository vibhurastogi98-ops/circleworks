ALTER TABLE "employee_bank_accounts" ADD COLUMN IF NOT EXISTS "account_type" text DEFAULT 'checking';--> statement-breakpoint
ALTER TABLE "employee_bank_accounts" ADD COLUMN IF NOT EXISTS "verification_status" text DEFAULT 'Pending';--> statement-breakpoint
ALTER TABLE "employee_bank_accounts" ADD COLUMN IF NOT EXISTS "bank_logo_url" text;--> statement-breakpoint
ALTER TABLE "employee_bank_accounts" ADD COLUMN IF NOT EXISTS "plaid_account_id" text;--> statement-breakpoint
ALTER TABLE "employee_bank_accounts" ADD COLUMN IF NOT EXISTS "plaid_processor_token" text;--> statement-breakpoint
ALTER TABLE "employee_bank_accounts" ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now();
