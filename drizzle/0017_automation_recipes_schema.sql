CREATE TABLE IF NOT EXISTS "automation_recipes" (
  "id" serial PRIMARY KEY NOT NULL,
  "company_id" integer,
  "owner_user_id" integer,
  "title" text NOT NULL,
  "description" text,
  "category" text DEFAULT 'Onboarding',
  "trigger_type" text DEFAULT 'event',
  "trigger_key" text NOT NULL,
  "trigger_label" text NOT NULL,
  "status" text DEFAULT 'Draft',
  "is_template" boolean DEFAULT false,
  "is_system_template" boolean DEFAULT false,
  "template_id" text,
  "run_count" integer DEFAULT 0,
  "last_run_at" timestamp,
  "estimated_minutes_saved" integer DEFAULT 0,
  "nodes_json" text NOT NULL,
  "edges_json" text NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "automation_runs" (
  "id" serial PRIMARY KEY NOT NULL,
  "company_id" integer,
  "automation_id" integer,
  "status" text DEFAULT 'queued',
  "trigger_event" text,
  "context_json" text,
  "affected_entity_type" text,
  "affected_entity_id" text,
  "affected_entity_label" text,
  "steps_json" text,
  "queue_job_id" text,
  "admin_notified_at" timestamp,
  "started_at" timestamp DEFAULT now(),
  "completed_at" timestamp,
  "duration_ms" integer,
  "error_message" text
);--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "automation_webhook_events" (
  "id" serial PRIMARY KEY NOT NULL,
  "company_id" integer,
  "automation_id" integer,
  "payload_json" text NOT NULL,
  "headers_json" text,
  "status" text DEFAULT 'received',
  "received_at" timestamp DEFAULT now(),
  "processed_at" timestamp
);--> statement-breakpoint

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'automation_recipes_company_id_companies_id_fk') THEN
    ALTER TABLE "automation_recipes" ADD CONSTRAINT "automation_recipes_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'automation_recipes_owner_user_id_users_id_fk') THEN
    ALTER TABLE "automation_recipes" ADD CONSTRAINT "automation_recipes_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'automation_runs_company_id_companies_id_fk') THEN
    ALTER TABLE "automation_runs" ADD CONSTRAINT "automation_runs_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'automation_runs_automation_id_automation_recipes_id_fk') THEN
    ALTER TABLE "automation_runs" ADD CONSTRAINT "automation_runs_automation_id_automation_recipes_id_fk" FOREIGN KEY ("automation_id") REFERENCES "public"."automation_recipes"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'automation_webhook_events_company_id_companies_id_fk') THEN
    ALTER TABLE "automation_webhook_events" ADD CONSTRAINT "automation_webhook_events_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'automation_webhook_events_automation_id_fk') THEN
    ALTER TABLE "automation_webhook_events" ADD CONSTRAINT "automation_webhook_events_automation_id_fk" FOREIGN KEY ("automation_id") REFERENCES "public"."automation_recipes"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;--> statement-breakpoint

ALTER TABLE "automation_runs" ADD COLUMN IF NOT EXISTS "affected_entity_type" text;--> statement-breakpoint
ALTER TABLE "automation_runs" ADD COLUMN IF NOT EXISTS "affected_entity_id" text;--> statement-breakpoint
ALTER TABLE "automation_runs" ADD COLUMN IF NOT EXISTS "affected_entity_label" text;--> statement-breakpoint
ALTER TABLE "automation_runs" ADD COLUMN IF NOT EXISTS "steps_json" text;--> statement-breakpoint
ALTER TABLE "automation_runs" ADD COLUMN IF NOT EXISTS "queue_job_id" text;--> statement-breakpoint
ALTER TABLE "automation_runs" ADD COLUMN IF NOT EXISTS "admin_notified_at" timestamp;--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "idx_automation_recipes_company_status" ON "automation_recipes" ("company_id", "status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_automation_recipes_company_template" ON "automation_recipes" ("company_id", "is_template");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_automation_runs_automation_started" ON "automation_runs" ("automation_id", "started_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_automation_webhook_events_automation_received" ON "automation_webhook_events" ("automation_id", "received_at");--> statement-breakpoint
