ALTER TABLE "w4_forms" ADD COLUMN IF NOT EXISTS "ssn_encrypted" text;--> statement-breakpoint
ALTER TABLE "w4_forms" ADD COLUMN IF NOT EXISTS "signature" text;--> statement-breakpoint
ALTER TABLE "w4_forms" ADD COLUMN IF NOT EXISTS "signed_at" timestamp;--> statement-breakpoint
ALTER TABLE "w4_forms" ADD COLUMN IF NOT EXISTS "status" text DEFAULT 'Pending';--> statement-breakpoint
ALTER TABLE "w4_forms" ADD COLUMN IF NOT EXISTS "document_id" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "w4_forms" ADD CONSTRAINT "w4_forms_document_id_employee_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."employee_documents"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
