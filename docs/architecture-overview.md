# CircleWorks architecture overview

A one-page mental model of the system. Deep dives live elsewhere — this file exists so someone new can orient in five minutes.

## The two applications sharing one Postgres

CircleWorks is deliberately built as two independent apps that happen to share a Postgres cluster:

1. **Tenant app** — everything under `src/app/(marketing)`, `src/app/app`, `src/app/settings`, `src/app/payroll`, etc. Uses the `cw_session` JWT cookie (`JWT_SECRET`), Supabase for auth flows, and `hasPermission()` from `src/lib/rbac.ts` for authorization. This is what customers see.
2. **Platform admin panel** — everything under `src/app/platform` and `src/app/api/platform`. Uses a **separate** cookie (`cw_platform_session`), a separate secret (`PLATFORM_JWT_SECRET`), its own MFA (`PLATFORM_MFA_SECRET_KEY`), its own audit log (`platform_audit_logs`), and its own admin table (`platform_admins`). Platform admins never appear in the tenant `users` table.

CI grep invariants in `.github/workflows/node.js.yml` enforce the separation: platform code is not allowed to import `@/lib/rbac`, `@/lib/capabilities`, `@/lib/capability-routes`, or read the `cw_session` cookie. Full details in [`platform-admin-spec.md`](./platform-admin-spec.md).

## Account types

A tenant workspace is one of three types, chosen at signup via `signup/complete`:

| Type | Signup path | Who it's for | Onboarding wizard |
|------|-------------|--------------|-------------------|
| `company` | `/signup/company` | Traditional employer with W-2 employees | [`companyOnboardingDetails`](../src/db/schema.ts) |
| `agency` | `/signup/agency` | Staffing / creative agency billing clients for staff labor | [`agencyOnboardingDetails`](../src/db/schema.ts) |
| `creator` | `/signup/creator` | Solo creator or one-person business paying themselves + contractors | [`creatorOnboardingDetails`](../src/db/schema.ts) |

Enum in DB: `accountTypeEnum` in [src/db/schema.ts](../src/db/schema.ts). Set once on the `companies` row; also mirrored on the JWT session so route-guarding doesn't require a DB hit.

## Capability system

Every module/page is gated by a **capability key** (e.g. `payroll`, `ownerTaxes`, `contractorOnboarding`, `clientInvoicing`, `settings`). The type is `CapabilityKey` in [src/lib/capabilities.ts](../src/lib/capabilities.ts).

**Layering**, in order of precedence (implemented in [`src/lib/platform-capability-resolver.ts`](../src/lib/platform-capability-resolver.ts)):

1. **Base matrix** (`CAPABILITY_MATRIX` in `capabilities.ts`) — hardcoded true/false per (account_type, capability). This is the **security ceiling**: a capability that's `false` here can never be turned on by any downstream layer. That means a bug in the plan/override tables can never leak agency-only features to a creator, or platform-owner features to a tenant.
2. **Plan** (`plans.included_capabilities` jsonb, via `tenant_plans.plan_id`) — a plan can turn on any base-`true` capability. It cannot turn on a base-`false` one.
3. **Per-tenant override** (`tenant_capability_overrides.overrides` jsonb) — for one-off "give this tenant early access to X." Same ceiling rule.
4. **Kill-switch** (`platform_kill_switches`) — flips a capability to `false` globally regardless of plan/override. Used for incident response.

The resolver is called at request time by route guards; the CI invariants also grep for anyone re-importing `CAPABILITY_MATRIX` under `/platform` to prevent accidental bypass.

Route → capability mapping lives in [`src/lib/capability-routes.ts`](../src/lib/capability-routes.ts) (`CAPABILITY_ROUTE_RULES`).

## Settings section (per account type)

Settings pages are shared components (in `src/components/settings/pages/*.tsx`) but the routes are **partitioned per account type**:

- `/settings/company/*`
- `/settings/agency/*`
- `/settings/creator/*`

Enforced by `SETTINGS_CATEGORY_PREFIXES` in [capability-routes.ts](../src/lib/capability-routes.ts) — cross-category access redirects to `/settings/<your-type>`. Rationale: a creator viewing the company settings sidebar sees company-only concepts (bank accounts, unions, benefits plans) which shouldn't be reachable from their workspace.

Which pages appear in each sidebar is defined in `src/config/settingsNavigation.ts` (`COMPANY_/AGENCY_/CREATOR_SETTINGS_NAV_ITEMS`).

## Platform admin panel (in one paragraph)

The panel lives at `/platform/*`. Login is via `/platform/login` (email + password + TOTP). First super_admin is minted via `scripts/platform-bootstrap-token.ts` — see [`../runbooks/platform-admin-bootstrap.md`](../runbooks/platform-admin-bootstrap.md). The full design (RBAC roles, audit reason-code enum, impersonation model, rate-limit, kill-switch semantics, MVP vs Phase 2 vs Phase 3 scope) is in [`platform-admin-spec.md`](./platform-admin-spec.md). Phase 3 (real payment collection: ACH-return handling, KYB, payroll holds) is currently blocked on a payment-provider decision — see [`../brain/decisions-log.md`](../brain/decisions-log.md).

## What talks to what

```
        Browser ────────► Vercel edge ────► Next.js route handlers
                                                │
       (cw_session)                             ├──► /api/* — tenant routes
       (cw_platform_session)                    │      • Drizzle → Neon Postgres (pooled)
                                                │      • Supabase (Storage buckets, Auth flows)
                                                │      • Postmark (transactional email)
                                                │
                                                └──► /api/platform/* — platform admin routes
                                                       • separate JWT, separate MFA, separate cookie
                                                       • all writes through withPlatformAudit()
                                                       • Redis rate-limit if REDIS_URL set,
                                                         else in-memory sliding window
```

## Where to look next

- **Is X wired to real data or still mock?** → [`module-status.md`](./module-status.md)
- **How do I run a migration?** → [`../runbooks/database-migrations.md`](../runbooks/database-migrations.md)
- **How do I stand up a new super_admin?** → [`../runbooks/platform-admin-bootstrap.md`](../runbooks/platform-admin-bootstrap.md)
- **What's next on the backlog?** → [`../brain/pending-tasks.md`](../brain/pending-tasks.md)
- **Why is X the way it is?** → [`../brain/decisions-log.md`](../brain/decisions-log.md)
- **Known bugs/limitations?** → [`../brain/known-issues.md`](../brain/known-issues.md)
- **Platform panel deep-dive** → [`platform-admin-spec.md`](./platform-admin-spec.md)
- **Pre-Phase-2 audit findings** → [`audit-report.md`](./audit-report.md)
