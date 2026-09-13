-- Platform Admin Panel — Phase 2 (billing/plans, feature flags).
-- See docs/platform-admin-spec.md §6.5.
-- Idempotent (safe to re-run).

DO $$ BEGIN
  CREATE TYPE platform_plan_status AS ENUM ('trial', 'active', 'past_due', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  base_price_cents INT NOT NULL,
  per_seat_price_cents INT NOT NULL,
  included_capabilities JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tenant_plans (
  company_id INT PRIMARY KEY REFERENCES companies(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES plans(id),
  seat_count INT NOT NULL DEFAULT 0,
  trial_ends_at TIMESTAMP,
  status platform_plan_status NOT NULL DEFAULT 'active',
  effective_from TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_by INT
);

CREATE TABLE IF NOT EXISTS tenant_capability_overrides (
  company_id INT PRIMARY KEY REFERENCES companies(id) ON DELETE CASCADE,
  overrides JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_by INT NOT NULL
);

CREATE TABLE IF NOT EXISTS platform_kill_switches (
  capability TEXT PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_by INT NOT NULL,
  reason_code TEXT NOT NULL
);

-- Seed the initial plan catalog. Idempotent via ON CONFLICT.
INSERT INTO plans (id, name, base_price_cents, per_seat_price_cents, included_capabilities)
VALUES
  ('trial',      'Trial',      0,     0,     '{}'::jsonb),
  ('starter',    'Starter',    4900,  800,   '{"dashboard":true,"payroll":true,"employees":true,"contractors":true,"time":true,"documents":true,"reports":true,"settings":true}'::jsonb),
  ('pro',        'Pro',        14900, 1200,  '{}'::jsonb),
  ('enterprise', 'Enterprise', 49900, 2000,  '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;
