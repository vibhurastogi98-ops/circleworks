# Decisions log

Key architectural / product decisions and why. Append-only: never edit an entry. If a decision is reversed, add a new entry that supersedes it and link back.

Entry format:
```
## <ID> — <short title>  (<date>)
**Context**: what problem
**Decision**: what we chose
**Rationale**: why this, not the alternatives
**Consequences**: what it commits us to
**Supersedes**: <id> if applicable
```

---

## D-001 — Platform admin panel has fully separate auth from tenant auth  (2026-09-12)

**Context**: Building the platform admin surface (`/platform/*`) that lets us (the app owner) run operations across every tenant. The existing tenant auth stack — `cw_session` JWT, `hasPermission()` from `src/lib/rbac.ts`, `owner`/`admin` role hierarchy — already exists and could plausibly be extended with a `super_platform_admin` role.

**Decision**: Do not extend tenant auth. The platform panel gets its own JWT secret (`PLATFORM_JWT_SECRET`), its own cookie (`cw_platform_session`), its own MFA secret key, its own admin table (`platform_admins`), its own session table, its own login page, and its own middleware branch. Platform admins never appear in the tenant `users` table.

**Rationale**: A bug in tenant-side capability code (`capabilities.ts`, `capability-routes.ts`, `rbac.ts`) must not become a bug in platform-admin access control. The two threat models are different — a tenant-side privilege escalation shouldn't cross into platform ops. This is enforced with CI grep invariants (see [`../docs/platform-admin-spec.md`](../docs/platform-admin-spec.md) §11) that fail the build if `/platform` code imports tenant RBAC helpers or reads `cw_session`.

**Consequences**: Every platform-panel feature has to be implemented separately from the tenant equivalent (login, session refresh, MFA enrollment, RBAC, audit log). Two auth stacks to maintain, but any tenant-side compromise is contained.

---

## D-002 — CAPABILITY_MATRIX is the security ceiling; no downstream layer can raise it  (2026-09-13)

**Context**: Platform Phase 2 built the capability-resolver layering: base matrix → plan (`plans.included_capabilities`) → per-tenant override (`tenant_capability_overrides`) → kill-switch. Question: can a plan or override turn on a capability that the base matrix has as `false` for that account type?

**Decision**: No. `CAPABILITY_MATRIX` in `src/lib/capabilities.ts` is the ceiling. Plans and overrides can only turn `true` capabilities `false` for a specific tenant; they cannot turn `false` capabilities `true`. Implemented in `src/lib/platform-capability-resolver.ts:61` — the resolver starts from `{ ...CAPABILITY_MATRIX[normalized] }` and each layer only ANDs against it, never ORs.

**Rationale**: This means a compromised or misconfigured `tenant_capability_overrides` row can never leak agency-only features to a creator, or platform-owner features to a tenant. The security surface for capability escalation is confined to code review of `capabilities.ts`, not the DB. The tradeoff is that turning a capability on for a new account type requires a code change + deploy, not a DB update — but that's the intended flow anyway.

**Consequences**: Adding a new module to an existing account type = flip a boolean in `CAPABILITY_MATRIX`, ship it. Adding a genuinely new capability type = add the key to `CapabilityKey` union, add rows to all three account types in the matrix, add a route mapping to `capability-routes.ts`. Kill-switches can globally turn off any capability regardless of plan/override — that's the escape hatch for incidents.

---

## D-003 — Payment-provider decision deferred; MVP and Phase 2 must not depend on it  (2026-09-12)

**Context**: The platform admin spec (docs/platform-admin-spec.md) originally raised 7 open questions. Q1 was payment provider for real ACH — candidates are Modern Treasury, Adyen for Platforms, Stripe Treasury/Financial Connections, or direct-ACH via Column.

**Decision**: Defer the choice; explicitly scope MVP (PR #2) and Phase 2 (PR #3) to work without a real payment provider. Q1 is marked "TBD — decide before Phase 3." Phase 3 is the only work that requires the provider.

**Rationale**: The provider choice has long-term consequences (rev-share, dispute handling, KYB flow, webhook contracts) and shouldn't be rushed. Meanwhile there's plenty of platform-admin work that doesn't touch money movement (tenant management, feature flags, impersonation, audit log, support tooling). Building those first lets the provider decision be informed by real ops experience rather than up-front speculation.

**Consequences**: Phase 3 is blocked (see [`pending-tasks.md`](./pending-tasks.md)). Every "process a payroll for real" surface in the app is deliberately a demo — the deterministic status lifecycle in the creator Pay Myself module (`pending → processing → paid`), the "Mark Paid" button on client invoices, the ACH-return handling in `BankSettings` (which is why it has a demo banner). Users see honest labeling wherever this matters.

**Supersedes**: none.

---

## D-004 — Custom RBAC roles persist to DB, built-in roles stay in code  (2026-09-13)

**Context**: `RolesSettings` used to persist custom roles to `window.localStorage`. During the settings-wiring pass, we needed to decide: promote all roles (built-in + custom) to a `roles` DB table, or persist only custom ones and keep built-in roles as source code.

**Decision**: Persist only custom roles. Built-in roles (`owner`, `admin`, `hr_manager`, `payroll_manager`, `finance`, `manager`, `employee`, `contractor`, `accountant`) stay in `src/lib/rbac.ts` and continue to be the authorization ceiling. `custom_roles` table (migration 0032) stores tenant-defined additions with a name-unique-per-company constraint.

**Rationale**: Built-in roles are the security-critical set — they're what `hasPermission()` checks against in the middleware. Making them mutable via DB would mean an attacker who compromises a tenant could grant themselves permissions they shouldn't have. Custom roles are additive UX for tenants who want more granularity, but they can only bundle existing permission slugs from `allPermissions`; they can't invent new permissions or elevate above `owner`.

**Consequences**: Adding a permission requires a code change (adding a slug to `allPermissions` and wiring the route guards). Adding a role is either a code change (built-in, for everyone) or a DB write (custom, for one tenant). Two paths, deliberately.

---

## D-005 — Client invoicing public view uses 192-bit random tokens + IP rate-limit, not tenant auth  (2026-09-13)

**Context**: Creator client invoicing (Phase 8) needs a way for the invoiced client — who has no CircleWorks account — to view the invoice.

**Decision**: Every invoice, on first send, mints a 24-byte (192-bit) random token stored in `client_invoices.public_token`. The public view at `/i/[token]` and `/api/public-invoice/[token]` looks up the invoice by token, no auth. Rate-limited at 20 req/hour per (IP, token) via the platform-rate-limit helper.

**Rationale**: Token-based public URLs are how Stripe, QuickBooks, and every other SMB invoicing tool solve this. 192 bits of entropy makes guessing infeasible. Rate-limit protects against enumeration and DoS on the endpoint. Alternative was requiring the client to create an account — rejected because it kills invoice-open rates.

**Consequences**: The token in the URL is the only credential. If a client forwards the invoice URL to someone else, that person can view it — accepted, matches user expectation for "I got a link, I can see the invoice." Tokens are stable across resends (same URL keeps working) but there's no revocation flow yet; if the invoice needs to be un-shared, the row must be deleted from the DB manually. Future work: token revocation UI.

---

## D-006 — 1099-NEC threshold is $600 pre-2026, $2,000 from tax year 2026+ (OBBBA)  (2026-09-13)

**Context**: The OBBBA (One Big Beautiful Bill Act) raised the 1099-NEC reporting threshold from $600 to $2,000, effective for payments made in tax years 2026 and after.

**Decision**: `generate-1099s` in `/api/contractors` computes the threshold as `taxYear >= 2026 ? 2000 : 600`. UI copy on `/contractors/1099s` derives the label from the selected tax year. Prior-year forms (2025 and earlier) keep the $600 threshold to match what was in effect when those payments happened.

**Rationale**: We can't apply a single threshold across years — the historical rule for 2024 filings needs the $600 threshold; changing it retroactively would mis-report. Split-by-year is the only correct answer.

**Consequences**: The threshold constant is not global; it's a function of tax year. Any new code that filters contractors by 1099 eligibility must use the same year-conditional. Grep for `THRESHOLD = 2000` or `>= 2000` to find all sites if the rule changes again (e.g. inflation indexing).

---

## D-007 — Migrations are forward-only; never edit an applied migration file to add data  (2026-09-13)

**Context**: We added a seed of the plan catalog (trial/starter/pro/enterprise) to `drizzle/0028_platform_admin_phase2.sql` after that migration had already been applied to Neon. The seed silently never landed — Drizzle tracks migrations by filename in `__drizzle_migrations` and won't re-run one whose hash is already recorded. Broke the tenant-facing Billing page.

**Decision**: Never add `INSERT` / `COPY` / `UPDATE` statements to a migration file that has already been merged. Always put new seed data in a fresh migration file. Documented in CLAUDE.md.

**Rationale**: The failure mode is silent — the file *looks* correct in git, but the data isn't in the DB. Anyone building a new environment from scratch would see the seed, but existing environments would silently miss it. The only reliable pattern is one-migration-one-write.

**Consequences**: Seed changes are a new file, not an edit. Slight file-count inflation, worth it. Also documented as a runbook rule in [`../runbooks/database-migrations.md`](../runbooks/database-migrations.md).
