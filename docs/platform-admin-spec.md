# CircleWorks Platform Admin Panel — Build Spec

**Status**: draft spec for review, no code yet.
**Author**: Claude Opus 4.7 in collaboration with the platform team.
**Date**: 2026-09-12.

Written for: engineers implementing the panel, plus whoever reviews the security posture before we ship it.

---

## 1. What this is (and what it explicitly is not)

A new top-level surface for **the application owner** (us) to run the CircleWorks *platform* — across every tenant of every account type — separately from anything a tenant can see or reach. It replaces the current pattern of "SSH into the DB when something goes wrong."

**It is not**:
- A tenant "super admin" role inside `/settings`. Platform admins never appear in the tenant `users` table.
- Reusing the existing `owner`/`admin` role hierarchy from `src/lib/rbac.ts`.
- Reusing the `cw_session` cookie or Supabase auth pool the tenant app uses.
- A place to hard-delete anything. Ever.

The mental model to hold: this is a **second application** that happens to share a Postgres cluster with the tenant app. It has its own auth, its own session cookie, its own middleware branch, its own DB tables, its own audit log, and its own login page. Nothing in `src/lib/capabilities.ts` / `src/lib/capability-routes.ts` / `src/lib/rbac.ts` is allowed to gate it, because a bug in tenant-side capability code must not become a bug in platform-admin access control.

---

## 2. How it fits our stack

Read cross-references from the existing codebase (verified before spec'ing):

- **Auth today**: `src/proxy.ts` reads a `cw_session` JWT (`SESSION_COOKIE = "cw_session"`, signed with `JWT_SECRET` via `jose`), falls back to Supabase middleware client, and calls `hasPermission(role, requiredPermission)` from `src/lib/rbac.ts` per pathname.
- **Roles today**: `builtInRoles` in `src/lib/rbac.ts` — `owner`, `admin`, `hr_manager`, `payroll_manager`, `finance`, `manager`, `employee`, `contractor`, `accountant`. **All tenant-scoped.**
- **Capabilities today**: `CAPABILITY_MATRIX` in `src/lib/capabilities.ts` — hardcoded per `AccountType`. Read at request-time by `getCapabilities(accountType)`. No DB backing.
- **Schema today**: `users` (id, email, `clerkUserId`, `passwordHash`, `role text`) — no direct `companyId` FK. Tenant membership is via `employees.userId` + `employees.companyId`. `workspaceAuditLogs` exists for tenant-scoped audit (`companyId`, `actorUserId`, `action`, `resource`, `metadata jsonb`) — we mirror its shape for platform audit but never share the table.
- **Money-movement surfaces** already exist in schema: `payrolls`, `payrollItems`, `contractorInvoices`. No ACH-return table yet — spec calls for adding one.
- **KYB inputs** already collected: `companyOnboardingDetails.einMasked`, `.taxSetup`, `.bankFunding` (and equivalents on `agencyOnboardingDetails` / `creatorOnboardingDetails`). No review workflow on top of them — spec calls for one.

We stay on Next.js App Router + Drizzle + Neon Postgres + Supabase. No new frameworks.

---

## 3. Bootstrap the first super admin (one-time, auditable)

The chicken-and-egg problem: platform admins can't log in until one exists, and we refuse to seed one in a migration (a seeded credential is a shared secret from the start).

**Mechanism** — `bootstrap_tokens` table + `POST /platform/bootstrap`:

1. An operator with DB access runs a CLI script (`npm run platform:bootstrap-token`) that inserts one row into `bootstrap_tokens`: `{ token_hash, allowed_email, created_at, created_by_note, used_at NULL, expires_at }`. Expires in 24h. The plaintext token is printed **once**, to stderr, and never stored.
2. The operator delivers the token to the future super admin out of band (Signal, physical device — not email/Slack).
3. First super admin visits `/platform/bootstrap`, submits `{ email, password, mfa_secret_setup, token }`. Server validates: token hash matches, not expired, not used, email matches, no `platform_admins` row exists with `role='super_admin'` yet.
4. On success: creates `platform_admins` row (`role='super_admin'`, MFA enrolled), marks the token `used_at`, writes to `platform_audit_logs` with actor `system:bootstrap`.
5. After first super_admin exists, `POST /platform/bootstrap` returns 410 Gone regardless of token validity. This is enforced by an explicit "exists any super_admin?" query in the handler, not a config flag — you can't re-enable it by editing an env var.

The bootstrap flow is a one-time gate, not a permanent onboarding path — subsequent platform admins are invited by an existing super_admin from within the panel (see §7).

---

## 4. Separate auth model

### Cookie & session
- New cookie: `cw_platform_session` (name distinct from `cw_session` so the two cannot leak into each other).
- Signed with a **separate** secret: `PLATFORM_JWT_SECRET`. Different from `JWT_SECRET`. Compromise of one must not compromise the other. Rotate independently.
- Short TTL: 30 minutes idle, 8 hours absolute. Sliding renewal on activity. On MFA step-up (see below), issue a scope-elevated variant valid for the elevated action's window only.
- `HttpOnly`, `Secure`, `SameSite=Strict`, `Path=/platform` (not `/`). Critical: scoping the cookie to `/platform` means tenant-side JS on `/app` cannot even see it exists.

### MFA (mandatory, no bypass)
- TOTP as the baseline (via `otplib`, already in the ecosystem). WebAuthn/passkey as Phase 2 upgrade path.
- No "remember this device" checkbox. Every login requires the OTP.
- Password itself uses Argon2id (via `@node-rs/argon2`), not bcrypt — align with the higher security posture of this panel vs tenant app.
- Failed-attempt tracking on `platform_admins.failed_attempts` with 15-minute lockouts after 5 failures. Notifies all `super_admin`s via email.

### Step-up auth for destructive actions
Some actions require a fresh MFA re-prompt within the last 5 minutes (server-tracks `platform_admin_sessions.last_mfa_at`):

- Starting impersonation.
- Suspending/reactivating a tenant.
- Changing plan/pricing on any tenant.
- Editing a platform admin's role.
- Force-releasing a held payroll run.
- Force MFA reset on any tenant user.

Non-destructive reads never step up.

### Login route
- `/platform/login` — the only entry point. Renders username + password + OTP in one screen (to prevent user enumeration via separate steps). Rate-limited to 5 attempts per IP per 15 min, 20 per email per hour.
- `/platform/logout` — clears cookie, revokes session.
- No SSO in MVP. Adding SSO later means our own SSO integration (WorkOS) scoped to platform admins only, never delegated to a tenant's IdP.

### IP allowlist (opt-in, Phase 2)
- Config: `PLATFORM_ADMIN_IP_ALLOWLIST=1.2.3.4/32,5.6.0.0/16` — if set, the middleware refuses requests originating outside that CIDR set. Off by default in MVP so we don't lock ourselves out during initial rollout.

---

## 5. Middleware integration — how `/platform/**` plugs into `src/proxy.ts`

The current proxy has one auth branch that resolves tenant identity, checks tenant permissions, and either lets the request through or redirects. We add a **strictly earlier** branch for platform routes:

```
proxy(request):
  pathname = request.nextUrl.pathname

  if pathname == '/platform/bootstrap':
    return next()   // page itself gates; DB check + rate-limit handled in handler

  if pathname == '/platform/login' or pathname == '/platform/logout':
    return next()   // pages handle their own logic

  if pathname.startsWith('/platform') or pathname.startsWith('/api/platform'):
    session = await getPlatformSession(request)
    if not session:
      return redirect('/platform/login?next=' + pathname)   // or 401 for /api/platform
    if pathname.startsWith('/api/platform') and !session.mfaVerified:
      return 401
    if session expired or revoked:
      return redirect('/platform/login')
    if IP allowlist set and !ipInAllowlist(request):
      return 403
    return next()

  ...existing tenant proxy logic below, UNCHANGED...
```

**Non-negotiable**: `getPlatformSession` reads *only* `cw_platform_session`. `hasPermission()` from `src/lib/rbac.ts` is not called for any `/platform` route. `getCapabilityRouteRedirect()` from `src/lib/capability-routes.ts` is not called for any `/platform` route. Platform authorization goes through a separate function `hasPlatformPermission(adminRole, action)` living in a new `src/lib/platform-rbac.ts`.

**Matcher**: extend the existing config matcher to include `/platform/:path*` and `/api/platform/:path*`. No change to what's excluded.

The above is a spec, not code — the tenant proxy path stays exactly what it is today.

---

## 6. Database additions

All additions are new tables. **Zero changes to existing tenant tables** in MVP. Tenant tables get `deletedAt` and `suspendedAt` columns added in Phase 2 (see §11).

### 6.1 Core auth tables (MVP)

```sql
-- 1. Platform admins (separate identity pool, NOT related to `users`)
CREATE TABLE platform_admins (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,               -- Argon2id
  role platform_admin_role NOT NULL,         -- enum, see 6.2
  mfa_secret_encrypted TEXT NOT NULL,        -- AES-GCM, key from env
  mfa_recovery_codes_hash JSONB NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'active',     -- 'active' | 'disabled' | 'locked'
  failed_attempts INT NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ,
  last_login_ip TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by BIGINT REFERENCES platform_admins(id),  -- NULL only for bootstrap super_admin
  disabled_at TIMESTAMPTZ,
  disabled_by BIGINT REFERENCES platform_admins(id),
  disabled_reason TEXT
);
CREATE UNIQUE INDEX ux_platform_admins_email_lower ON platform_admins (LOWER(email));

-- 2. Platform sessions (server-side revocable)
CREATE TABLE platform_admin_sessions (
  id BIGSERIAL PRIMARY KEY,
  admin_id BIGINT NOT NULL REFERENCES platform_admins(id) ON DELETE CASCADE,
  jti UUID NOT NULL UNIQUE,                  -- matches JWT jti claim; revoke by deleting row
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_mfa_at TIMESTAMPTZ NOT NULL,          -- step-up freshness
  expires_at TIMESTAMPTZ NOT NULL,           -- absolute 8h from issue
  ip_address TEXT,
  user_agent TEXT,
  revoked_at TIMESTAMPTZ,
  revoked_reason TEXT
);
CREATE INDEX ix_platform_admin_sessions_admin ON platform_admin_sessions (admin_id);

-- 3. Bootstrap tokens (one-time, self-destructing)
CREATE TABLE bootstrap_tokens (
  id BIGSERIAL PRIMARY KEY,
  token_hash TEXT NOT NULL UNIQUE,           -- SHA-256 of plaintext
  allowed_email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by_note TEXT NOT NULL,             -- who ran the CLI, why
  expires_at TIMESTAMPTZ NOT NULL,           -- 24h max
  used_at TIMESTAMPTZ,                       -- once set, row is dead
  used_from_ip TEXT
);

-- 4. Audit log (append-only, cross-tenant, retained forever)
CREATE TABLE platform_audit_logs (
  id BIGSERIAL PRIMARY KEY,
  actor_admin_id BIGINT REFERENCES platform_admins(id),  -- NULL for system:*
  actor_role platform_admin_role,            -- snapshotted for history
  action TEXT NOT NULL,                      -- enum-checked in app layer
  target_type TEXT NOT NULL,                 -- 'tenant' | 'tenant_user' | 'payroll_run' | 'platform_admin' | 'plan' | ...
  target_id TEXT NOT NULL,                   -- may be composite (e.g. 'company:33')
  reason_code TEXT,                          -- governed enum, see 6.4
  reason_notes TEXT,                         -- optional free text, sanitized
  before JSONB,                              -- state before mutation
  after JSONB,                               -- state after
  metadata JSONB NOT NULL DEFAULT '{}',      -- request context, correlation id
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX ix_platform_audit_actor ON platform_audit_logs (actor_admin_id, created_at DESC);
CREATE INDEX ix_platform_audit_target ON platform_audit_logs (target_type, target_id, created_at DESC);
CREATE INDEX ix_platform_audit_action ON platform_audit_logs (action, created_at DESC);
-- Append-only enforcement: revoke UPDATE/DELETE on this table for the app DB role;
-- migration includes REVOKE UPDATE, DELETE ON platform_audit_logs FROM <app_role>;
-- Only a dedicated 'platform_audit_writer' role can INSERT.
```

### 6.2 Roles

```sql
CREATE TYPE platform_admin_role AS ENUM (
  'super_admin',    -- everything, including managing other platform admins
  'ops',            -- tenant directory, impersonation, support tooling; no plan changes
  'risk_analyst',   -- KYB queue, payroll hold/release, ACH-return queue; read-only elsewhere
  'billing_ops',    -- plan/seat/invoice; no impersonation, no risk actions
  'read_only'       -- read every module; write nothing
);
```

Role → permission mapping lives in `src/lib/platform-rbac.ts` (new file, not extending `rbac.ts`). Explicit `PLATFORM_ROLE_PERMISSIONS: Record<Role, Set<Action>>` — no inheritance chains, no "admin gets everything" default. `super_admin` is the only role wired to `PLATFORM_ACTIONS_ALL`.

### 6.3 Impersonation sessions (MVP)

```sql
CREATE TABLE impersonation_sessions (
  id BIGSERIAL PRIMARY KEY,
  admin_id BIGINT NOT NULL REFERENCES platform_admins(id),
  admin_session_id BIGINT NOT NULL REFERENCES platform_admin_sessions(id),
  target_user_id INT NOT NULL REFERENCES users(id),
  target_company_id INT NOT NULL REFERENCES companies(id),
  reason_code TEXT NOT NULL,                 -- enum
  reason_notes TEXT NOT NULL,                -- required, min 20 chars
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,           -- started_at + 30 min hard cap
  ended_at TIMESTAMPTZ,
  ended_reason TEXT,                         -- 'expired' | 'admin_stopped' | 'target_logged_in' | 'admin_logged_out'
  ip_address TEXT,
  user_agent TEXT
);
CREATE INDEX ix_impersonation_active ON impersonation_sessions (admin_id) WHERE ended_at IS NULL;
```

**How impersonation actually works** (this is a design question, not a UI question):

- Starting impersonation issues a **separate** cookie `cw_impersonation` (again `HttpOnly`, `SameSite=Strict`) whose JWT contains: `impersonationId`, `adminId`, `targetUserId`, `targetCompanyId`, `expiresAt`. The tenant `cw_session` cookie is **not** minted — the tenant app doesn't get a fake tenant login.
- The tenant middleware (`src/proxy.ts` existing branch) checks: if `cw_impersonation` present AND valid AND not expired AND row not `ended_at`, synthesize the tenant session object from `target_user_id` for the duration of the request. This is a controlled shim, not a real login. It happens **after** the platform middleware validates the platform session — so an expired platform session invalidates impersonation immediately.
- Every DB write during an impersonated request goes through a wrapping helper `withImpersonationContext(handler)` that copies `impersonationId` into a request-scoped ALS (async_hooks). All tenant `workspaceAuditLogs.metadata` writes automatically include `{impersonatedByAdminId, impersonationId}`. All `platform_audit_logs` writes automatically include `{targetUserId, targetCompanyId, throughImpersonation: true}`.
- Server-enforced action scope: the RBAC layer for tenant actions gets a "during impersonation" filter that forbids irreversible actions even if the impersonated user has permission — e.g. Approve Payroll, Delete Employee, Change Bank. The forbid list is a hardcoded constant, not toggleable from the panel. Anything an admin should be able to do during support is either read-only or forces the admin to break impersonation and use a platform-panel action directly (which then audits under the admin's identity, not through impersonation).
- The persistent banner is a UI concern (rendered by `AppShell` when `cw_impersonation` present) — but the banner is **decoration**, not the enforcement. Enforcement is the middleware + write-guard above.
- Auto-end triggers: 30-min hard timer; if the real target user logs in from a different session (detected via `platform_admin_sessions` cross-check), impersonation ends immediately with `ended_reason='target_logged_in'`; if admin logs out or opens a new impersonation, prior one closes.

### 6.4 Reason enum (governed, not free text)

Every mutating admin action requires a `reason_code` from an enum. The enum lives in `src/lib/platform-audit-reasons.ts` and is compile-time closed:

```
'support_ticket'        (must include ticket ref in reason_notes)
'internal_investigation'
'ach_return_response'
'kyb_manual_review'
'billing_correction'
'security_incident'
'legal_request'         (must include reference)
'compliance_review'
'user_data_request'     (GDPR / DPA)
'system_maintenance'
'other'                 (requires super_admin approval on the same action — enforced server-side)
```

`reason_notes` is optional context, ≤2000 chars, HTML-sanitized on write, never rendered as raw HTML on read.

### 6.5 Phase 2 tables (feature flags, billing)

```sql
-- Per-tenant capability overrides layered over CAPABILITY_MATRIX
CREATE TABLE tenant_capability_overrides (
  company_id INT PRIMARY KEY REFERENCES companies(id) ON DELETE CASCADE,
  overrides JSONB NOT NULL DEFAULT '{}',     -- Partial<Capabilities> — only keys that override
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by BIGINT NOT NULL REFERENCES platform_admins(id)
);

-- Global kill switches (turn a capability off across ALL tenants)
CREATE TABLE platform_kill_switches (
  capability TEXT PRIMARY KEY,               -- one of CapabilityKey
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by BIGINT NOT NULL REFERENCES platform_admins(id),
  reason_code TEXT NOT NULL
);

-- Plan catalog + tenant plan assignment
CREATE TABLE plans (
  id TEXT PRIMARY KEY,                        -- 'starter', 'pro', 'enterprise', 'trial'
  name TEXT NOT NULL,
  base_price_cents INT NOT NULL,
  per_seat_price_cents INT NOT NULL,
  included_capabilities JSONB NOT NULL,       -- Partial<Capabilities>
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE tenant_plans (
  company_id INT PRIMARY KEY REFERENCES companies(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES plans(id),
  seat_count INT NOT NULL DEFAULT 0,
  trial_ends_at TIMESTAMPTZ,
  status TEXT NOT NULL,                       -- 'active' | 'past_due' | 'cancelled' | 'trial'
  effective_from TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Interaction with existing `capabilities.ts`** — replace `getCapabilities(accountType)` with `resolveCapabilities({ accountType, companyId })`:

```
resolveCapabilities({accountType, companyId}):
  base = CAPABILITY_MATRIX[normalizeAccountType(accountType)]     // hardcoded baseline
  plan = tenantPlans[companyId]?.plan?.included_capabilities ?? {} // plan-gated
  override = tenantCapabilityOverrides[companyId]?.overrides ?? {} // per-tenant override
  kill = platformKillSwitches (map: cap -> enabled)                // global switch

  for each cap in CapabilityKey:
    result[cap] = base[cap] && (plan[cap] ?? true) && (override[cap] ?? true) && kill[cap]
  return result
```

- **Off** in the matrix cannot be turned on by a plan or override (the hardcoded matrix is the security ceiling — an override cannot grant an account type a capability it should never have, e.g. `creator` cannot suddenly get `payroll`).
- **On** in the matrix can be turned off by either the plan (plan doesn't include it), the tenant override (we've toggled it off for this tenant), or the kill switch (we've disabled it platform-wide).

Migration path: `getCapabilities()` keeps working (returns just the matrix layer) for pages that haven't been updated, and gets deprecated. New callers use `resolveCapabilities()` with DB caching (in-memory 60s per companyId, invalidated on override write).

### 6.6 Phase 3 tables (risk ops)

```sql
-- ACH returns / failed transfers (aggregates data our payment provider webhooks give us)
CREATE TABLE ach_transfers (
  id BIGSERIAL PRIMARY KEY,
  company_id INT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL,                  -- 'payroll_run' | 'contractor_invoice' | 'refund'
  source_id BIGINT NOT NULL,
  amount_cents BIGINT NOT NULL,
  direction TEXT NOT NULL,                    -- 'debit' | 'credit'
  status TEXT NOT NULL,                       -- 'pending' | 'submitted' | 'settled' | 'returned' | 'failed'
  return_code TEXT,                           -- 'R01' etc.
  return_reason TEXT,
  provider_ref TEXT NOT NULL UNIQUE,          -- our payment processor's txn id
  submitted_at TIMESTAMPTZ,
  settled_at TIMESTAMPTZ,
  returned_at TIMESTAMPTZ
);
CREATE INDEX ix_ach_transfers_status ON ach_transfers (status, submitted_at DESC);
CREATE INDEX ix_ach_transfers_company ON ach_transfers (company_id, submitted_at DESC);

-- Payroll hold list (admin-set holds preventing a run from moving to 'processed')
CREATE TABLE payroll_holds (
  id BIGSERIAL PRIMARY KEY,
  payroll_id INT NOT NULL REFERENCES payrolls(id),
  company_id INT NOT NULL REFERENCES companies(id),
  admin_id BIGINT NOT NULL REFERENCES platform_admins(id),
  hold_reason_code TEXT NOT NULL,             -- risk enum
  hold_notes TEXT NOT NULL,
  held_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  released_at TIMESTAMPTZ,
  released_by BIGINT REFERENCES platform_admins(id),
  release_reason_code TEXT,
  release_notes TEXT,
  UNIQUE (payroll_id) WHERE released_at IS NULL   -- one active hold per run
);
```

`payrolls.status` transitions must consult `payroll_holds` — if an active hold exists, `status` cannot advance past `'pending'` from any caller (tenant or admin). This is enforced by a DB trigger, not just app code, because "trust the app layer" is the wrong posture for money movement.

```sql
-- KYB review queue
CREATE TABLE kyb_reviews (
  id BIGSERIAL PRIMARY KEY,
  company_id INT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',     -- 'pending' | 'in_review' | 'approved' | 'rejected' | 'needs_more_info'
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  assigned_to BIGINT REFERENCES platform_admins(id),
  reviewed_by BIGINT REFERENCES platform_admins(id),
  reviewed_at TIMESTAMPTZ,
  decision TEXT,                              -- 'approved' | 'rejected' | 'needs_more_info'
  decision_reason_code TEXT,
  decision_notes TEXT,
  ein_verified BOOLEAN,
  entity_type_verified BOOLEAN,
  bank_verified BOOLEAN,
  supporting_docs JSONB NOT NULL DEFAULT '[]' -- {type, url, uploaded_at, uploaded_by}
);
CREATE INDEX ix_kyb_queue ON kyb_reviews (status, submitted_at) WHERE status IN ('pending', 'in_review', 'needs_more_info');
```

**Trigger for auto-enqueue**: on `INSERT` into `companyOnboardingDetails` or `agencyOnboardingDetails` (creator accounts skip KYB in MVP — they're contractor-only), insert a `kyb_reviews` row with status `'pending'`. Until `status='approved'`, the tenant's `payroll` capability is force-off via a synthetic override in `resolveCapabilities()` — no new tenant can run real payroll before we've reviewed them.

### 6.7 Tenant table changes (Phase 2, small and additive)

```sql
ALTER TABLE companies ADD COLUMN suspended_at TIMESTAMPTZ;
ALTER TABLE companies ADD COLUMN suspended_by BIGINT REFERENCES platform_admins(id);
ALTER TABLE companies ADD COLUMN suspended_reason_code TEXT;
ALTER TABLE companies ADD COLUMN soft_deleted_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN soft_deleted_at TIMESTAMPTZ;
```

Middleware `src/proxy.ts` gains a check: if the resolved tenant `companies.suspended_at IS NOT NULL`, tenant users see a "Your workspace is suspended, contact support" page — no `/app` or `/settings` routes are accessible. Platform admins are unaffected. `soft_deleted_at` filters the tenant out of tenant-visible queries but leaves it recoverable from the panel. **No hard-delete UI ever.**

---

## 7. Route structure

App Router paths under `src/app/platform/**` and API under `src/app/api/platform/**`. Every server component checks the platform session server-side; no page assumes middleware is enough (defense in depth).

```
src/app/platform/
  bootstrap/page.tsx                         [PUBLIC, gated by DB "no super_admin exists"]
  login/page.tsx                             [PUBLIC]
  logout/route.ts                            [PUBLIC POST]
  layout.tsx                                 [wraps all admin routes; verifies session]

  page.tsx                                   [dashboard: activity, alerts, queues]

  tenants/
    page.tsx                                 [directory: list/search/filter tenants]
    [companyId]/
      page.tsx                               [tenant detail: overview + team + plan]
      settings/page.tsx                      [read-only view of their settings]
      users/page.tsx                         [tenant's users list]
      payroll/page.tsx                       [their payroll history]
      audit/page.tsx                         [tenant's workspace_audit_logs slice]
      suspend/page.tsx                       [POST → suspend action]
      impersonate/page.tsx                   [start impersonation form]

  admins/                                    [MVP, super_admin only]
    page.tsx                                 [list platform admins]
    invite/page.tsx                          [invite new admin]
    [adminId]/page.tsx                       [role, MFA reset, session revocation]

  audit/
    page.tsx                                 [filterable platform_audit_logs view]
    export/route.ts                          [CSV/JSON export, rate-limited]

  billing/                                   [Phase 2]
    page.tsx                                 [platform MRR/ARR overview]
    tenants/[companyId]/page.tsx             [change plan/seats]
    plans/page.tsx                           [manage plan catalog]

  flags/                                     [Phase 2]
    page.tsx                                 [per-tenant capability overrides]
    kill-switches/page.tsx                   [platform-wide]

  risk/                                      [Phase 3]
    page.tsx                                 [ops dashboard: holds, returns, KYB queue counts]
    payroll-runs/page.tsx                    [cross-tenant payroll view + hold/release]
    ach-returns/page.tsx                     [failed/returned transfer queue]
    kyb/page.tsx                             [KYB review queue]
    kyb/[reviewId]/page.tsx                  [review detail + decision]

  support/                                   [MVP-support]
    users/page.tsx                           [cross-tenant user search]
    users/[userId]/page.tsx                  [account state, actions]

  health/                                    [Phase 3]
    signup-funnel/page.tsx
    tax-filings/page.tsx

src/app/api/platform/
  auth/
    login/route.ts                           [POST]
    logout/route.ts                          [POST]
    mfa/verify/route.ts                      [POST — step-up]
  bootstrap/route.ts                         [POST — one-time]
  tenants/[companyId]/suspend/route.ts       [POST]
  tenants/[companyId]/reactivate/route.ts    [POST]
  impersonation/start/route.ts               [POST]
  impersonation/[id]/stop/route.ts           [POST]
  admins/route.ts                            [GET, POST]
  admins/[adminId]/route.ts                  [GET, PATCH, DELETE-soft]
  audit/export/route.ts                      [GET, streamed]
  flags/tenant/[companyId]/route.ts          [PUT]                              (Phase 2)
  flags/kill/[capability]/route.ts           [PUT]                              (Phase 2)
  billing/tenants/[companyId]/plan/route.ts  [PUT]                              (Phase 2)
  risk/payroll/[payrollId]/hold/route.ts     [POST]                             (Phase 3)
  risk/payroll/[payrollId]/release/route.ts  [POST]                             (Phase 3)
  risk/kyb/[reviewId]/decide/route.ts        [POST]                             (Phase 3)
```

Every route handler wraps its logic in `withPlatformAudit(action, targetType, targetId, reasonRequired, handler)` which: (1) enforces `hasPlatformPermission()`, (2) enforces step-up-fresh MFA where declared, (3) captures `before` state, (4) runs the handler in a transaction, (5) captures `after` state, (6) writes `platform_audit_logs` row atomically with the mutation. Rollback of the mutation rolls back the audit row too — but a **successful mutation without an audit row is impossible** (they commit together or not at all).

---

## 8. Rate limiting

- Global limiter on `/api/platform/**`: 60 req/min per admin session, 300 req/min per admin (across sessions).
- Login endpoint: 5/15min per IP + 20/hr per email (see §4).
- Impersonation start: 3/hour per admin.
- Audit export: 5/hour per admin, request size capped.
- Enforced via Redis (already used elsewhere per `bullmq-redis.ts` in the codebase).

---

## 9. UI notes (what the panel looks like, briefly)

Not a design doc — just the load-bearing pieces:

- Distinct visual identity from tenant app. Dark navy chrome, orange accent, a persistent "PLATFORM" badge in the top bar. Reason: nobody should ever be confused about which app they're in, especially during impersonation.
- **Impersonation banner**: fixed to top of viewport, sticky above the tenant `AppTopBar`, red background, shows "IMPERSONATING <target email> · <mm:ss remaining> · [End impersonation]". Rendered from tenant-side `AppShell` when `cw_impersonation` cookie present. The banner countdown is decoration — the timer that ends impersonation is server-side.
- **Every destructive form** has: (a) explicit reason-code dropdown, (b) required notes, (c) step-up MFA modal on submit, (d) two-click confirm ("I understand this will…"). No accidental payroll-release-on-double-click.
- No bulk destructive actions in MVP. If ops wants to hold 50 payroll runs, they hold them one at a time. Bulk is Phase 3 with dedicated safeguards.

---

## 10. Phased build

### MVP (weeks 1–3)
- Auth infra: `platform_admins`, `platform_admin_sessions`, `bootstrap_tokens`, `platform_audit_logs`, `impersonation_sessions` tables. `PLATFORM_JWT_SECRET`, `cw_platform_session` cookie, `getPlatformSession()`, `hasPlatformPermission()`, `src/lib/platform-rbac.ts`, `src/lib/platform-audit-reasons.ts`.
- Middleware branch in `src/proxy.ts` for `/platform` and `/api/platform`.
- Bootstrap CLI + `/platform/bootstrap` (one-time).
- `/platform/login`, `/platform/logout`, `/platform` dashboard shell.
- Modules: **Tenant directory** (read + suspend/reactivate + drill-in read-only), **Impersonation** (start/stop, banner, write-guard on impersonated writes, forbid-list), **Audit log** (view + filter + CSV export), **Admin RBAC** (invite/edit/disable admins, super_admin only).
- Rate limiting.
- Tests: (1) platform middleware refuses tenant-side sessions, (2) `hasPermission()` from tenant rbac never gates a `/platform` route, (3) impersonation write-guard blocks forbidden actions with 403, (4) audit row + mutation commit atomically, (5) bootstrap route returns 410 after first super_admin, (6) step-up MFA required for suspend/impersonate/admin-edit.

**Definition of done for MVP**: internal ops can find a tenant, look at their state, impersonate a user for support, suspend a bad-actor tenant, and see everything they did in the audit log. First super_admin was created via the bootstrap flow.

### Phase 2 (weeks 4–6)
- `plans`, `tenant_plans`, `tenant_capability_overrides`, `platform_kill_switches` tables.
- `resolveCapabilities()` replaces `getCapabilities()` at all call sites; add the DB-caching layer.
- Modules: **Billing & plans**, **Feature flags** (per-tenant + global kill), **Support tooling** (cross-tenant user search + password/MFA reset actions).
- `ALTER TABLE companies ADD suspended_at/soft_deleted_at`; middleware honors suspension.

### Phase 3 (weeks 7–10)
- `ach_transfers`, `payroll_holds`, `kyb_reviews` tables + DB trigger for hold enforcement + auto-KYB enqueue.
- Modules: **Payroll/money-movement risk ops** (cross-tenant runs view, hold/release, ACH-return queue), **KYB review queue**, **System/compliance health** (signup funnel, tax-filing status).
- Payment-provider webhook ingestion into `ach_transfers`.
- Bulk-action patterns (rare, guarded).

---

## 11. Security invariants (must survive every code change)

These are the checks a reviewer should verify are still true on every PR that touches `/platform`:

1. **`hasPermission()` from `src/lib/rbac.ts` is never called from any file under `src/app/platform/**` or `src/app/api/platform/**`.** Grep-enforced in CI (`.github/workflows` step: `if grep -rn 'hasPermission\|resolveBuiltInRole\|CAPABILITY_MATRIX' src/app/platform src/app/api/platform src/lib/platform-*; then fail; fi`).
2. **`cw_session` cookie is never read by any `/platform` handler.** Same grep-CI check.
3. **`PLATFORM_JWT_SECRET !== JWT_SECRET`** — asserted at boot.
4. **Every mutating `/api/platform/**` route uses `withPlatformAudit()`.** Grep check: any route file under `api/platform/**` that exports POST/PUT/PATCH/DELETE must include the string `withPlatformAudit`.
5. **`platform_audit_logs` has no UPDATE or DELETE grant** to the app DB role. Migration and a runtime probe test verify this.
6. **`resolveCapabilities()` cannot turn ON a capability that `CAPABILITY_MATRIX[type]` has OFF.** Unit test with the full cross-product.
7. **Impersonation writes cannot execute a forbidden action even if the impersonated user has permission.** Unit test per action in the forbid-list.
8. **No route ever hard-deletes from `companies`, `users`, `employees`, `payrolls`, `contractor_invoices`.** Grep check for `db.delete(`+those table names under `src/app/platform`.

---

## 12. Decisions

Recorded here so the build proceeds against a fixed target.

### Approved (2026-09-12)

2. **MFA storage** — **AES-GCM with the key held as `PLATFORM_MFA_SECRET_KEY` alongside `PLATFORM_JWT_SECRET`** (same distribution pattern, rotated independently). No external KMS in MVP; we can migrate to AWS KMS or Vercel-managed secrets later without a schema change since only the ciphertext column format needs to stay stable. Key rotation runbook is a follow-up chore, not a blocker.

3. **Session store for revocation** — **`platform_admin_sessions` in Postgres, indexed by `jti`**. The extra DB hit per request is acceptable (admin traffic is low — dozens of RPS peak, not thousands), and putting revocation state in the same store as the audit log means we can query "who was logged in when action X happened" with a single JOIN. Revisit if admin traffic ever grows past ~500 RPS.

4. **Impersonation banner fail-loud** — **hard-fail render when `cw_impersonation` is present but banner component didn't hydrate**. Server-side layout detects the cookie and refuses to send the tenant HTML shell without the banner mounted; falls back to a plain server-rendered HTML page reading "Impersonation session active — reload to continue in the app." Reason: the enforcement invariant (impersonation writes get double-audited and forbid-listed) does hold either way, but a UI failure that hides the session state creates the exact class of "the ops person forgot they were impersonating" incident this whole design exists to prevent.

5. **Read-only DB user for tenant drill-in** — **yes**. Add `platform_readonly` Postgres role with SELECT-only grants on tenant tables. All read-only tenant queries from `/platform/tenants/[companyId]/**` go through a separate Drizzle client bound to that role. A code bug that tries to write against this client fails at the DB layer with a permission error, not silently. Migration adds the role + grants; app config adds `DATABASE_URL_READONLY` env var (same host/db, different user). Same fallback pattern as `DATABASE_URL` in the migrate job — must be set before the panel ships.

6. **KYB scope for creators** — **yes, require KYB for creators before their first contractor payment**. Same `kyb_reviews` table shape. Trigger differs: for company/agency it's on onboarding-details insert (before any payroll); for creator it's on the first `contractor_invoices` insert per company. Until approved, the creator can create invoices in draft but the "Submit for payment" transition is gated. This is the same "hardcoded matrix as ceiling" pattern: creators still don't get `payroll`, but they do get `contractor_payment_submission` — and that submission requires KYB.

7. **Reason enum extensibility** — **no. One canonical enum in `platform-audit-reasons.ts`**. Adding a code requires a PR that both compliance and security review; there's no runtime path to introduce a new reason. Keeps our incident/legal review of the audit log tractable (a fixed vocabulary is auditable — free text is not).

### Deferred

1. **Payment provider** — **TBD, decide before Phase 3**. The `ach_transfers` schema in §6.6 assumes NACHA-style return codes; if we use Stripe Treasury / Modern Treasury / Increase / Column, the columns are similar (source ref, direction, status, return_code, return_reason) but exact naming and enum values differ. **MVP and Phase 2 have no hard dependency on this choice** — verified below.

   **MVP tables** (platform_admins, platform_admin_sessions, bootstrap_tokens, platform_audit_logs, impersonation_sessions) — none reference a payment provider or money movement.

   **MVP modules** (tenant directory, impersonation, audit log, admin RBAC) — read from the existing tenant tables (`companies`, `users`, `employees`, `workspaceAuditLogs`) and write only to the new platform tables. Impersonation touches tenant writes through the shim, but the payment integration is untouched — money-movement rows are viewed via existing `payrolls` / `contractor_invoices`, not new provider-shaped tables.

   **Phase 2 tables** (plans, tenant_plans, tenant_capability_overrides, platform_kill_switches, plus `companies.suspended_at/soft_deleted_at` columns) — none reference a payment provider. `plans` describes our own SaaS pricing (base + per-seat cents), not customer money movement. Billing Ops changing a tenant's plan is a DB update to `tenant_plans`, plus a downstream call to whichever billing system holds our AR (Stripe Billing today, presumably), but that call lives behind a `billingProvider.setPlan()` interface we already own — no schema tie.

   **Phase 2 modules** (billing/plans, feature flags, support tooling) — same story: they touch `plans`, `tenant_plans`, `tenant_capability_overrides`, `platform_kill_switches`, and existing tenant `users`. Zero calls into an ACH/money-movement layer.

   So the payment-provider decision can slip to the start of Phase 3 without stalling MVP or Phase 2. When the decision is made, the only migration is: rename/renumber the columns of `ach_transfers` before it exists (it's introduced in Phase 3), and pick the webhook ingestion shape. Nothing else moves.

---

## 13. What this spec deliberately doesn't cover

- **Marketing site admin, blog admin, docs CMS** — separate concern, not a "platform admin."
- **Data warehouse / analytics** — read-replica pipeline is a separate stack; the panel queries the OLTP DB directly and stays fast enough at our current scale.
- **Customer support ticket system integration** — the `reason_notes` field can hold a Zendesk/Linear URL, but we're not building a ticket viewer inside the panel in MVP.
- **Automated fraud detection** — the risk-ops module is human-driven review in Phase 3. ML/rules-based auto-flagging is a distinct future project.
- **Multi-region / data-residency splits** — future concern; assumes single-region Neon in MVP.

---

**End of spec. Awaiting review before starting on MVP.**
