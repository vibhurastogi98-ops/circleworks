ALTER TABLE "ats_jobs" ADD COLUMN IF NOT EXISTS "salary_min" integer;--> statement-breakpoint
ALTER TABLE "ats_jobs" ADD COLUMN IF NOT EXISTS "salary_max" integer;
