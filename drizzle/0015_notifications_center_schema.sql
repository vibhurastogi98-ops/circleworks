ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "category" text DEFAULT 'system';--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "priority" text DEFAULT 'info';--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "action_label" text;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "metadata" text;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "read_at" timestamp;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "email_delivery_status" text DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "email_delivered_at" timestamp;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "sms_delivery_status" text DEFAULT 'not_sent';--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "sms_delivered_at" timestamp;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now();--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "notification_preferences" (
  "id" serial PRIMARY KEY NOT NULL,
  "company_id" integer,
  "user_id" integer NOT NULL,
  "notification_type" text NOT NULL,
  "category" text DEFAULT 'system',
  "in_app_enabled" boolean DEFAULT true,
  "email_enabled" boolean DEFAULT true,
  "sms_enabled" boolean DEFAULT false,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "notification_digest_preferences" (
  "id" serial PRIMARY KEY NOT NULL,
  "company_id" integer,
  "user_id" integer NOT NULL,
  "digest_enabled" boolean DEFAULT false,
  "digest_frequency" text DEFAULT 'realtime',
  "digest_time" text DEFAULT '08:00',
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);--> statement-breakpoint

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'notification_preferences_company_id_companies_id_fk') THEN
    ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'notification_preferences_user_id_users_id_fk') THEN
    ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'notification_digest_preferences_company_id_companies_id_fk') THEN
    ALTER TABLE "notification_digest_preferences" ADD CONSTRAINT "notification_digest_preferences_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'notification_digest_preferences_user_id_users_id_fk') THEN
    ALTER TABLE "notification_digest_preferences" ADD CONSTRAINT "notification_digest_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "idx_notifications_employee_created" ON "notifications" ("employee_id", "created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_notifications_company_category" ON "notifications" ("company_id", "category");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_notification_preferences_user_type" ON "notification_preferences" ("user_id", "notification_type");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_notification_digest_preferences_user" ON "notification_digest_preferences" ("user_id");--> statement-breakpoint
