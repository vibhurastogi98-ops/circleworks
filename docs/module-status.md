# Module status — REAL vs MOCK vs MIXED

Single source of truth for "is this module actually wired to Postgres." Update every time a module gets promoted (real code merges) or demoted (regression / rollback).

Last updated: 2026-09-13 (after commit `50c511c`).

Legend:
- **REAL** — reads and writes hit Drizzle end-to-end
- **MIXED** — one part real, another mock; specifics called out
- **MOCK** — reads and writes are ephemeral (local state / hardcoded / `{ ok: true }` acks) and don't persist

## Creator (Solo) account type — Phases 1–9 wiring complete

Backend wired during commit `75eadd8` (Sep 13, 2026). Public invoice route later gained IP rate-limit and CLAUDE.md added migration-seed rule in commit `e3932a8`.

| Module | Status | Notes |
|--------|--------|-------|
| Pay Myself | **REAL** | Deterministic status lifecycle (pending → processing → paid) persisted to `payrolls` + `payroll_items` via `/api/pay-myself` |
| Contractors | **REAL** | Invite, contract, invoice approve/revise/reject via `/api/contractors`; approve bumps `contractors.ytdPayments` |
| Expenses | **REAL** | Reports + items via `/api/expenses`, `/api/expenses/[id]/approve` (status normalized to `Pending Payroll`) |
| Taxes | **REAL** | `tax_set_asides` per Q1..Q4/ANNUAL + `tax_estimator_inputs` (composite PK) via `/api/tax-set-asides` and `/api/tax-estimator` |
| Documents | **REAL** | Supabase Storage bucket `employee-documents`, 25MB cap, signed URLs 10-min TTL, DB row per file in `employee_documents` |
| Contractor onboarding + W-9 + 1099s | **REAL** | `/api/contractors` actions submit-w9, generate-1099s, mark-1099-filed, deliver-1099; TIN masked before storage; **1099-NEC threshold: $600 pre-2026, $2,000 from 2026+** (OBBBA) |
| Client invoicing (new module) | **REAL** | `client_invoices` + `client_invoice_items` (migration 0031), full CRUD, Postmark send, 192-bit-entropy public token view at `/i/[token]` with 20 req/hour IP+token rate-limit |
| Quarterly-tax deadline panel on `/app/taxes` | **REAL** | UI-only countdown to 2026 IRS 1040-ES dates (Apr 15, Jun 15, Sep 15, Jan 15 2027) — no scheduled email reminders yet (no cron infra) |

## Company account type — modules

Audited during "real-vs-mock audit" this session. Company hub + directory upgraded to real in commit `50c511c`.

| Module | Status | Real portion | Mock portion |
|--------|--------|--------------|--------------|
| Payroll | **MIXED** | Payroll hub (`/api/payroll/module?screen=hub`) — real via Drizzle: recent runs, employee count, YTD gross/taxes, next pay date from `pay_schedules`. "Run Payroll" (`/api/payroll/runs` POST) uses real `createPayrollRunWithEngine` writing to `payrolls`+`payroll_items`. Also real: `/api/payroll/runs/[id]/time-import`, `/api/payroll/unions`, `/api/payroll/supplemental-payments`, `/api/payroll/royalty-schedules` | Non-hub sub-screens (run/history/settings/etc.) still return `getPayrollModuleData()` mock. `applyPayrollAction()` (GL mapping, garnishments, tips, EWA, funding, off-cycle, reconciliation, year-end, bridge, settings save buttons) is an ack-only noop. |
| Employees | **MIXED** | Employees directory (`/api/employees/module?screen=directory`) — real Drizzle read of `employees` table. `/api/employees` (list, invite) — real. `/api/employees/[id]` (edit / detail) — real. `/api/employees/bulk`, `/api/employees/me/w4`, `/api/employees/me/bank-account`, `/api/employees/me/documents` — real. | Non-directory sub-screens (profile / compensation / benefits / time / documents / payroll / performance / activity / bulk / org-chart / new) still return `getHrisModuleData()` mock. `applyHrisAction()` remains an ack for UI-state updates; directory has no inline mutations so this is intentional. |
| Contractors (company-side) | **MOCK** | — | `/app/contractors` uses `ContractorsModuleScreen` reading in-memory `contractorsStore` in `contractor-module-data.ts`. Real `/api/contractors` route exists but only creator/agency pages consume it. |
| Hiring | **MOCK** (+1 real leaf) | Final "Hire" action (`/api/hiring/hire` POST) — real: inserts into `employees`, `onboardingCases`, updates `atsCandidates`/`atsOffers` | All 5 `/api/ats/*` list endpoints (overview, jobs, candidates, interviews, offers) return `getAts*()` from mock module. Stage moves, offer sends, interview scheduling — all noop. |
| Onboarding | **MOCK** | GET `/api/onboarding` has a Drizzle path but falls back to `mockOnboardingCases` on any error | No POST/PATCH routes exist for checklist/templates/documents — buttons are UI-only |
| Benefits | **MOCK** | — | `/api/benefits/module` returns `getBenefitsModuleData()`; `applyBenefitsAction()` is `{ok:true}`. `/api/benefits/enrollment` fabricates an enrollment ID without touching DB. |
| Time | **REAL** | Clock in/out, breaks, timesheets, admin overview — all Drizzle-backed | Breaks/kiosk/open-shifts/PTO-policies cosmetic screens still import mock |
| Expenses (company-side) | **MIXED** | Main reports list, submit, approve via `/api/expenses` and `/api/expenses/[id]/approve` — real (shared with creator) | Policies, mileage, per-report detail pages import `@/data/mockExpenses` and show a "Demo data" banner |
| Performance | **MOCK** | — | Every page's `useQuery` returns mock data directly with no fetch. No `/api/performance/*` routes exist. |
| Learning | **MOCK** | — | Only `/api/learning/certificates/[courseId]` route exists and returns mock. |
| Compliance | **MOCK** | — | 11 `/api/compliance/*` routes exist — every one reads from `@/data/complianceModule` or fabricates results. Filings, pay-equity analysis, OSHA exports, E-Verify submits are all synthetic acks. |
| Reports | **MOCK** | — | All 9 `/api/reports/*` routes read from `@/data/reportsAnalytics` or `@/data/complianceModule`. Every "Export" downloads a file with hardcoded rows. |
| Documents | **MIXED** | `/app/documents` (via creator work) — real Supabase Storage | `/me/documents`, `/onboarding/documents`, `/employees/[id]/documents` — mock |

## Company account type — settings pages

24 pages under `src/components/settings/pages/*.tsx`. Batch 1 completed this session (commit `e3932a8`).

| Page | Status | Notes |
|------|--------|-------|
| AnnouncementsSettings | **REAL** | `/api/announcements` full CRUD via Drizzle |
| NotificationsSettings | **REAL** | `/api/notifications/preferences` via `db.execute(sql`…`)` against `notification_preferences` |
| AssetsSettings | **REAL** | `/api/assets`, `/api/assets/[id]`, `/api/assets/assign` all Drizzle-backed; only enum constants imported from mock |
| ProfileSettings | **REAL** | `/api/profile` reads/writes real employee row (this session A1) |
| BillingSettings | **REAL** | `/api/billing/plan` joins `tenant_plans` + `plans` (this session B3) |
| AuditLogSettings | **REAL** | `/api/audit-log` reads `workspace_audit_logs` (this session B4) |
| PaySchedulesSettings | **REAL** | `/api/pay-schedules` full CRUD on `pay_schedules` (this session B5) |
| PayrollUnionsSettings | **REAL** | `/api/payroll/unions` (hardened) + `/api/payroll/unions/contracts` (this session B6) |
| RolesSettings | **REAL** | `custom_roles` table via `/api/custom-roles` (this session C7). Built-in roles still from `@/lib/rbac` — intentional. |
| UsersSettings | **REAL** | `pending_invites` table + `/api/users-admin` (this session C8) with Postmark invite emails |
| DepartmentsSettings | **REAL** | `departments` table + `/api/departments` (this session C9) |
| LocationsSettings | **REAL** | `company_locations` table + `/api/company-locations` (this session C10) — distinct from `time_clock_locations` |
| TimeSettings | **MIXED** | `/api/agency/projects`, `/api/agency/clients`, `/api/employees` real; project-allocation matrix still mock |
| WorkspaceSettings | **MIXED** | Only `/api/account-type/switch` is real; rest is local `useState` |
| BankSettings | **MOCK** | Demo banner added (A2). Real ACH build deferred. |
| BusinessProfileSettings | **MOCK** | Save writes to `localStorage` only |
| CustomFieldsSettings | **MOCK** | Field definitions ephemeral |
| IntegrationsSettings | **MOCK** | No OAuth handshake |
| ApiSettings | **MOCK** | Generated keys don't authenticate anything |
| WorkflowsSettings | **MOCK** | No `/api/workflows` route |
| WorkflowDetailSettings | **MOCK** | Builder edits don't persist |
| SsoSettings | **MOCK** | Fake SCIM token in `useState` |
| SecurityDevicesSettings | **MOCK** | Inline hardcoded device array; no `/api/sessions` |
| ImportSettings | **MOCK** | Static wizard shell, no `/api/import/*` |

## Agency account type

**Not yet audited.** Some pieces exist (agency clients / projects / billing) and appear real based on the module-audit spot-checks, but a systematic REAL/MOCK/MIXED pass has not been done. See [`../brain/pending-tasks.md`](../brain/pending-tasks.md).

## Platform admin panel

Fully **REAL** as of PR #3 (commit `bba321e`). Every write goes through `withPlatformAudit()`. See [`platform-admin-spec.md`](./platform-admin-spec.md) for the full breakdown of phase scope.

## Ground rules for updating this file

- If you wire a page/module to a real endpoint, flip the row **and** cite the commit hash in the notes column.
- If you find that something you thought was real is actually degraded (e.g. a fallback fires), demote it to MIXED and describe which path is broken.
- If a real endpoint exists but is not consumed by the module's page (like `contractors company-side`), it is **MOCK** for practical purposes — end-users don't see the real endpoint.
- Ambiguous cases go to MIXED with a note; never round up to REAL.
