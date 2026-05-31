CREATE TABLE IF NOT EXISTS "agency_client_assignments" (
  "id" serial PRIMARY KEY NOT NULL,
  "company_id" integer REFERENCES "companies"("id") ON DELETE cascade,
  "client_id" integer NOT NULL REFERENCES "agency_clients"("id") ON DELETE cascade,
  "project_id" integer NOT NULL REFERENCES "agency_projects"("id") ON DELETE cascade,
  "employee_id" integer REFERENCES "employees"("id") ON DELETE set null,
  "contractor_id" integer REFERENCES "contractors"("id") ON DELETE set null,
  "worker_type" text NOT NULL DEFAULT 'Employee',
  "worker_name" text NOT NULL,
  "worker_email" text,
  "role" text,
  "pay_rate" real NOT NULL DEFAULT 0,
  "bill_rate" real NOT NULL DEFAULT 0,
  "hours_per_month" real NOT NULL DEFAULT 0,
  "status" text NOT NULL DEFAULT 'Active',
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "agency_client_assignments_client_idx"
  ON "agency_client_assignments" ("client_id");

CREATE INDEX IF NOT EXISTS "agency_client_assignments_project_idx"
  ON "agency_client_assignments" ("project_id");
