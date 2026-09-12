-- Platform Admin Panel MVP tables. See docs/platform-admin-spec.md.
-- Idempotent (safe to re-run). All references are additive to existing tenant tables.

DO $$ BEGIN
  CREATE TYPE platform_admin_role AS ENUM ('super_admin', 'ops', 'risk_analyst', 'billing_ops', 'read_only');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE platform_admin_status AS ENUM ('active', 'disabled', 'locked');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS platform_admins (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role platform_admin_role NOT NULL,
  mfa_secret_encrypted TEXT NOT NULL,
  mfa_recovery_codes_hash JSONB NOT NULL DEFAULT '[]'::jsonb,
  status platform_admin_status NOT NULL DEFAULT 'active',
  failed_attempts INT NOT NULL DEFAULT 0,
  locked_until TIMESTAMP,
  last_login_at TIMESTAMP,
  last_login_ip TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by INT REFERENCES platform_admins(id),
  disabled_at TIMESTAMP,
  disabled_by INT REFERENCES platform_admins(id),
  disabled_reason TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_platform_admins_email_lower
  ON platform_admins (LOWER(email));

CREATE TABLE IF NOT EXISTS platform_admin_sessions (
  id SERIAL PRIMARY KEY,
  admin_id INT NOT NULL REFERENCES platform_admins(id) ON DELETE CASCADE,
  jti TEXT NOT NULL UNIQUE,
  issued_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_mfa_at TIMESTAMP NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  revoked_at TIMESTAMP,
  revoked_reason TEXT
);
CREATE INDEX IF NOT EXISTS ix_platform_admin_sessions_admin
  ON platform_admin_sessions (admin_id);

CREATE TABLE IF NOT EXISTS bootstrap_tokens (
  id SERIAL PRIMARY KEY,
  token_hash TEXT NOT NULL UNIQUE,
  allowed_email TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by_note TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  used_from_ip TEXT
);

CREATE TABLE IF NOT EXISTS platform_audit_logs (
  id SERIAL PRIMARY KEY,
  actor_admin_id INT REFERENCES platform_admins(id),
  actor_role platform_admin_role,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  reason_code TEXT,
  reason_notes TEXT,
  before JSONB,
  after JSONB,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_platform_audit_actor
  ON platform_audit_logs (actor_admin_id, created_at DESC);
CREATE INDEX IF NOT EXISTS ix_platform_audit_target
  ON platform_audit_logs (target_type, target_id, created_at DESC);
CREATE INDEX IF NOT EXISTS ix_platform_audit_action
  ON platform_audit_logs (action, created_at DESC);

CREATE TABLE IF NOT EXISTS impersonation_sessions (
  id SERIAL PRIMARY KEY,
  admin_id INT NOT NULL REFERENCES platform_admins(id),
  admin_session_id INT NOT NULL REFERENCES platform_admin_sessions(id),
  target_user_id INT NOT NULL REFERENCES users(id),
  target_company_id INT NOT NULL REFERENCES companies(id),
  reason_code TEXT NOT NULL,
  reason_notes TEXT NOT NULL,
  started_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  ended_at TIMESTAMP,
  ended_reason TEXT,
  ip_address TEXT,
  user_agent TEXT
);
CREATE INDEX IF NOT EXISTS ix_impersonation_active
  ON impersonation_sessions (admin_id) WHERE ended_at IS NULL;

-- Additive tenant columns for suspend / soft-delete.
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS suspended_by INT,
  ADD COLUMN IF NOT EXISTS suspended_reason_code TEXT,
  ADD COLUMN IF NOT EXISTS soft_deleted_at TIMESTAMP;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS soft_deleted_at TIMESTAMP;

-- Hardening (DB-level enforcement) is intentionally deferred to a follow-up
-- migration co-owned with DBA:
--   REVOKE UPDATE, DELETE ON platform_audit_logs FROM <app_role>;
--   CREATE ROLE platform_readonly WITH ...
-- Until then, append-only + read-only-drill-in are enforced in the app layer
-- (see src/lib/platform-audit.ts and the read-only Drizzle client TODO).
