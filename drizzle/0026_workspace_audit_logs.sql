CREATE TABLE IF NOT EXISTS "workspace_audit_logs" (
  "id" serial PRIMARY KEY NOT NULL,
  "company_id" integer REFERENCES "companies"("id") ON DELETE cascade,
  "actor_user_id" integer REFERENCES "users"("id") ON DELETE set null,
  "action" text NOT NULL,
  "resource" text NOT NULL,
  "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "ip_address" text,
  "user_agent" text,
  "created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "workspace_audit_logs_company_created_idx"
  ON "workspace_audit_logs" ("company_id", "created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "workspace_audit_logs_actor_created_idx"
  ON "workspace_audit_logs" ("actor_user_id", "created_at");
