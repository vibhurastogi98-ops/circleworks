CREATE TABLE IF NOT EXISTS "search_analytics" (
  "id" serial PRIMARY KEY NOT NULL,
  "company_id" integer,
  "user_id" integer,
  "query" text NOT NULL,
  "result_count" integer DEFAULT 0,
  "selected_result_type" text,
  "selected_result_id" text,
  "selected_result_title" text,
  "time_to_selection_ms" integer,
  "source" text DEFAULT 'command_palette',
  "created_at" timestamp DEFAULT now()
);--> statement-breakpoint

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'search_analytics_company_id_companies_id_fk') THEN
    ALTER TABLE "search_analytics" ADD CONSTRAINT "search_analytics_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'search_analytics_user_id_users_id_fk') THEN
    ALTER TABLE "search_analytics" ADD CONSTRAINT "search_analytics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  END IF;
END $$;--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "idx_search_analytics_company_created" ON "search_analytics" ("company_id", "created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_search_analytics_query" ON "search_analytics" ("query");--> statement-breakpoint
