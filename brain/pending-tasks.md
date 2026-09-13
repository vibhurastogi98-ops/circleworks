# Pending tasks

Single place to check "what's left." Update as things get done or added.

Last updated: 2026-09-14.

## Legend

- **In progress** — actively being worked on
- **Ready to pick up** — scoped, no blockers, next in line
- **Backlogged** — scoped but deprioritized
- **Blocked** — waiting on an external decision or dependency
- **Not scoped** — noted, but the work required hasn't been broken down

---

## Company account type

### Batch 2 — real Bank / ACH build — **Backlogged**

`BankSettings.tsx` currently displays a "Demo data — not yet connected" banner (commit `e3932a8`). The real build needs:

- Schema: `bank_accounts` table (companyId, nickname, routing masked, account masked, status: Verified/Pending/Failed, provider, provider_ref).
- Plaid integration: link token → public token → item → account. Existing `PLAID_CLIENT_ID` / `PLAID_ENV` env vars are wired in code but not yet exercised for ACH funding.
- Micro-deposit verification path (needed when Plaid isn't available for a bank).
- Payment-provider decision (see below — this is on the critical path for actual money movement, but Plaid-only bank *verification* can ship without it).

### Batch 3 — Integrations / Workflows / SSO — **Backlogged**

Three settings pages remain mock:
- `IntegrationsSettings` — needs OAuth handshake per integration (Slack, QuickBooks, etc.). Substantial per-integration work.
- `WorkflowsSettings` + `WorkflowDetailSettings` — needs `workflows` + `workflow_runs` tables and a real executor. Considerable design work up front.
- `SsoSettings` — SAML / SCIM. Requires per-IDP metadata upload, cert rotation, JIT provisioning rules. Enterprise-only until there's demand.

Order suggestion: SSO first (biggest customer ask), then Integrations, then Workflows.

### Company Tier 3 — module wiring — **Not scoped**

Modules still fully MOCK on the company side (see [`../docs/module-status.md`](../docs/module-status.md)). None of these have been scoped:

- **Hiring / ATS** — 5 list endpoints + candidate stage/hire actions all return mock. The final `/api/hiring/hire` is real. Real DB tables `atsCandidates`, `atsOffers`, `atsJobs` exist but aren't queried by the module screens.
- **Onboarding** — GET has a Drizzle path with mock fallback; no real POST/PATCH routes exist.
- **Benefits** — `getBenefitsModuleData()` mock; enrollment fabricates IDs.
- **Performance** — 0 API routes exist; every page fakes async over mock data.
- **Learning** — only certificates route; all list pages mock.
- **Compliance** — 11 routes, all read from `@/data/complianceModule`; every filing / analysis / export is synthetic.
- **Reports** — 9 routes, all read from `@/data/reportsAnalytics`; every export downloads fabricated rows.

Priority order should probably follow module usage frequency (Compliance and Reports are broadly requested by finance/legal; Learning and Performance are lower-priority polish).

### Employees / Payroll — remaining sub-screens — **Ready to pick up (small)**

The hub and directory are real (commit `50c511c`), but the sub-screens are still `getPayrollModuleData()` / `getHrisModuleData()` mock:

- Payroll: `run`, `completed-run`, `paystubs`, `history`, `off-cycle`, `contractors`, `schedule`, `tax-setup`, `garnishments`, `ewa`, `bridge`, `settings`, `reports`.
- Employees: `profile`, `compensation`, `benefits`, `time`, `documents`, `payroll`, `performance`, `activity`, `bulk`, `org-chart`, `new`.

Each is a per-screen wiring task following the same pattern used for hub/directory. Employees `new` is already covered by `/api/employees` POST, so the sub-screen just needs its `useMutation` swapped over.

---

## Agency account type

### Systematic REAL/MOCK/MIXED audit — **Ready to pick up**

Not yet run. Spot-checks during the company audit showed:
- `/api/agency/clients` — real (Drizzle-backed)
- `/api/agency/projects` — GET has multi-line Drizzle query (initially miscounted as `db=0`); real
- Agency billing (`agencyInvoices`, `agencyInvoiceItems`) — schema exists, needs verification of coverage

A dedicated audit pass covering every `/agency/*` route and `AGENCY_SETTINGS_NAV_ITEMS` page should mirror the company + creator audit format ([`../docs/module-status.md`](../docs/module-status.md)).

---

## Platform admin panel

### Phase 3 — payment collection — **Blocked**

Blocked on the payment-provider decision (see [`decisions-log.md`](./decisions-log.md)). Phase 3 scope:

- Real ACH funding / return handling
- KYB (know-your-business) verification per tenant
- Payroll holds (funding shortfall → pause payroll instead of failing mid-run)
- Provider webhook receivers with signature verification

None of this can start until the provider is chosen (candidates: Modern Treasury, Adyen for Platforms, Stripe Treasury / Financial Connections, direct ACH via Column).

### Phase 2.5 quality-of-life — **Ready to pick up**

Smaller items that came up during Phase 2 build:
- Kill-switch UI still hardcodes the capability list at read time; if a new capability is added to `CAPABILITY_MATRIX`, the kill-switch page needs manual update. Read from the matrix instead.
- Audit-log export cursor pagination is currently offset-based; switch to keyset for consistency at high row counts.

---

## Cross-cutting

### Deferred audit findings — **Backlogged**

Everything in [`known-issues.md`](./known-issues.md) that wasn't fixed at merge time. Not urgent, but worth clearing before another audit runs to avoid noise.

### Documentation upkeep — **Ongoing**

This `/brain` and `/runbooks` structure only helps if we keep it current. Rules:
- Every PR that changes module wiring updates [`../docs/module-status.md`](../docs/module-status.md).
- Every architectural decision that reverses a prior one gets a new entry in [`decisions-log.md`](./decisions-log.md), never editing the old one.
- Every deferred finding lands in [`known-issues.md`](./known-issues.md) rather than being lost in a conversation.
