-- Performance goals + reviews, Learning courses + enrollments.
-- Note: `performance_reviews`, `courses`, and `course_enrollments` existed
-- from an older migration with a different, unused schema. Verified empty
-- before this migration ran; dropping is safe and gives us the shape the
-- new /api/performance/* and /api/learning/* routes expect.

DROP TABLE IF EXISTS "course_enrollments";
DROP TABLE IF EXISTS "courses";
DROP TABLE IF EXISTS "performance_reviews";

CREATE TABLE IF NOT EXISTS "performance_goals" (
  "id" serial PRIMARY KEY NOT NULL,
  "company_id" integer NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
  "employee_id" integer NOT NULL REFERENCES "employees"("id") ON DELETE CASCADE,
  "title" text NOT NULL,
  "description" text,
  "target_date" date,
  "status" text NOT NULL DEFAULT 'on_track',
  "progress_pct" integer NOT NULL DEFAULT 0,
  "created_by" integer REFERENCES "users"("id") ON DELETE SET NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "performance_goals_company_id_idx" ON "performance_goals" ("company_id");
CREATE INDEX IF NOT EXISTS "performance_goals_employee_id_idx" ON "performance_goals" ("employee_id");

CREATE TABLE "performance_reviews" (
  "id" serial PRIMARY KEY NOT NULL,
  "company_id" integer NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
  "employee_id" integer NOT NULL REFERENCES "employees"("id") ON DELETE CASCADE,
  "reviewer_id" integer REFERENCES "employees"("id") ON DELETE SET NULL,
  "cycle_period" text NOT NULL,
  "status" text NOT NULL DEFAULT 'draft',
  "overall_rating" integer,
  "comments" text,
  "submitted_at" timestamp,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "performance_reviews_company_id_idx" ON "performance_reviews" ("company_id");
CREATE INDEX IF NOT EXISTS "performance_reviews_cycle_idx" ON "performance_reviews" ("company_id", "cycle_period");

CREATE TABLE "courses" (
  "id" serial PRIMARY KEY NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "provider" text,
  "duration_minutes" integer,
  "created_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE "course_enrollments" (
  "id" serial PRIMARY KEY NOT NULL,
  "company_id" integer NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
  "employee_id" integer NOT NULL REFERENCES "employees"("id") ON DELETE CASCADE,
  "course_id" integer NOT NULL REFERENCES "courses"("id") ON DELETE CASCADE,
  "status" text NOT NULL DEFAULT 'enrolled',
  "progress_pct" integer NOT NULL DEFAULT 0,
  "enrolled_at" timestamp NOT NULL DEFAULT now(),
  "completed_at" timestamp,
  "updated_at" timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "course_enrollments_company_id_idx" ON "course_enrollments" ("company_id");
CREATE INDEX IF NOT EXISTS "course_enrollments_employee_id_idx" ON "course_enrollments" ("employee_id");
CREATE UNIQUE INDEX IF NOT EXISTS "course_enrollments_unique_idx"
  ON "course_enrollments" ("employee_id", "course_id");
