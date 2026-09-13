-- Per-case onboarding task completion. onboarding_tasks holds the template
-- task definitions; this table records which of those tasks are done for a
-- given onboarding_cases row.

CREATE TABLE IF NOT EXISTS "onboarding_task_completions" (
  "id" serial PRIMARY KEY NOT NULL,
  "case_id" integer NOT NULL REFERENCES "onboarding_cases"("id") ON DELETE CASCADE,
  "task_id" integer NOT NULL REFERENCES "onboarding_tasks"("id") ON DELETE CASCADE,
  "completed_at" timestamp NOT NULL DEFAULT now(),
  "completed_by" integer REFERENCES "users"("id") ON DELETE SET NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "onboarding_task_completions_uniq_idx"
  ON "onboarding_task_completions" ("case_id", "task_id");
CREATE INDEX IF NOT EXISTS "onboarding_task_completions_case_id_idx"
  ON "onboarding_task_completions" ("case_id");
