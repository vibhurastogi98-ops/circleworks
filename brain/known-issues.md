# Known issues (deferred, not forgotten)

Consolidated deferred findings from the audits run this session. Every entry was flagged during a pre-merge audit and explicitly deferred rather than fixed inline. If you're about to work on the surrounding code, check whether the issue is still there and consider fixing it in the same PR.

Last updated: 2026-09-14.

---

## Creator / Solo module — Phases 1–6 regression audit

Ranked by severity as reported. Critical + High were fixed before merge; Medium and Low remain.

### Medium

- **M-1** · Expenses "Pending Payroll" is a dead-end status. `/api/expenses/[id]/approve` transitions Submitted → Pending Payroll, but nothing consumes that status to transition it to Paid. Approved reports stall there.
- **M-2** · `/api/tax-estimator` PUT silently clamps negative inputs to the prior stored value; the client sees "saved" and the value quietly reverts on refresh. No error surfaced.
- **M-3** · Safe-harbor bar on `/app/taxes` renders "on track" against defaults before the user enters any estimator inputs (row `exists:false`). Misleading for a fresh account.
- **M-4** · `Documents` page has a hardcoded "Jan 31" filing deadline (`src/app/app/documents/page.tsx`), not date-aware, not tenant-aware.
- **M-5** · `generate-1099s` uses `contractors.ytdPayments` for eligibility. That column is bumped by `approve-invoice` but never decremented on revision/rejection reversals — false-positive 1099 risk if an approved invoice is later voided.
- **M-6** · `/contractors/1099s` shows two visible buttons (PDF preview / download) that toast "not wired in this build." Consider hiding rather than showing-and-disclaiming.
- **M-7** · `tsconfig.tsbuildinfo` was previously tracked — **fixed** in commit `e3932a8` (added to `.gitignore`, `git rm --cached`).

### Low

- **L-1** · Pay-Myself status promoter (`pending → processing → paid`) only advances when the API is read. Runs stay `pending` in DB if the tab is closed. Cosmetic in demo mode.
- **L-2** · Expenses "Approve All" loops client-side; partial failures leave some approved, poor error surfacing (only the last error toast'd).
- **L-3** · Documents 25MB size cap is server-only; large files upload fully before returning 413.
- **L-4** · Documents delete uses `window.confirm()` inconsistent with the rest of the module (which uses toast/modal patterns).
- **L-5** · Documents `status` is only ever set to `Ready`; the `Draft` branch of `statusClasses()` is dead code.
- **L-6** · W-9 plaintext TIN transits Node process memory / request logs before masking. Fine for a demo build; a production build needs at-rest encryption or tokenization.
- **L-7** · Signed URLs are 10-min TTL. Long-open Documents pages incur a refetch on download after that window — already handled with a fallback refetch, just a small perf note.

---

## Company modules — mock-backed pages

Everything the module audit flagged as MOCK and left for a future wiring pass. Full detail in [`../docs/module-status.md`](../docs/module-status.md). Highlights:

- **Contractors (company-side)** — entire `/app/contractors` uses in-memory `contractorsStore`. Real `/api/contractors` route exists but only creator pages consume it. Wiring the company-side module to the real route is a straightforward follow-up.
- **Hiring / ATS** — all 5 list endpoints (candidates/jobs/interviews/offers/overview) and the stage-change endpoint are mock. Only final `/api/hiring/hire` is real.
- **Onboarding** — GET has a Drizzle path with mock fallback on any error. No POST/PATCH routes for checklists/templates/documents.
- **Benefits** — module data + enrollment endpoint fabricate `{ok:true}` with synthetic IDs.
- **Performance** — no `/api/performance/*` routes exist. Every page fakes async over mock.
- **Learning** — only certificates route; all list pages mock.
- **Compliance** — 11 routes, all read from `@/data/complianceModule`; every filing / analysis / export is synthetic.
- **Reports** — 9 routes, all read from `@/data/reportsAnalytics`; every export downloads fabricated rows.

**Where the user will notice**: filings that appear to submit but don't, exports that download data that doesn't match real employees, "Enroll in benefits" that returns success but doesn't create a real enrollment. Add "Demo data — not yet connected" banners on any page you touch that's in this list, following the pattern in `BankSettings.tsx`.

---

## Company settings — remaining MOCK pages (Batches 2 & 3)

From the settings audit:

- `BankSettings` — has a demo banner (A2). Real ACH build waits on payment-provider decision.
- `IntegrationsSettings` — no OAuth handshake wired.
- `WorkflowsSettings` + `WorkflowDetailSettings` — no `/api/workflows` route.
- `SsoSettings` — SCIM token in `useState`, no SAML/SCIM plumbing.
- `SecurityDevicesSettings` — inline hardcoded device array; no `/api/sessions`.
- `ImportSettings` — static wizard shell, no `/api/import/*`.
- `BusinessProfileSettings` — save writes to `localStorage`.
- `CustomFieldsSettings` — field definitions ephemeral.
- `ApiSettings` — generated keys don't authenticate anything.
- `TimeSettings` — real for project/client/employee endpoints; project-allocation matrix is mock.
- `WorkspaceSettings` — only `/api/account-type/switch` is real; rest is local `useState`.
- `RolesSettings` — custom roles real now (C7); user-count column ("N users") still returns 0 for every custom role because there's no join to users-by-role yet.

---

## Payroll hub — sub-screens

Only `/api/payroll/module?screen=hub` was wired to real Drizzle (commit `50c511c`). Every other screen (run, history, off-cycle, contractors, schedule, tax-setup, garnishments, EWA, bridge, settings, reports) still returns `getPayrollModuleData()` mock. `applyPayrollAction()` still returns `{ok:true}` acks for save buttons on those screens.

## Employees directory — sub-screens

Same pattern: `/api/employees/module?screen=directory` is real; every other sub-screen (profile / compensation / benefits / time / documents / payroll / performance / activity / bulk / org-chart / new) still returns `getHrisModuleData()` mock. The **/employees/new** flow does go through the real `/api/employees` POST, so invite creation is real even though the wizard page is a "mock screen" — worth flagging that this one page is misleading in the module-status table.

---

## Rate-limiting

`/api/public-invoice/[token]` and `/i/[token]` are rate-limited (20/hr per IP+token) via the platform-rate-limit helper. **No other public-facing endpoint is rate-limited.** Not urgent — the token entropy makes brute-force infeasible on the invoice endpoints, and the rest of the public surface is either marketing pages or noop routes — but a general-purpose middleware rate-limit would tighten things up.

---

## Superseded routes (dead code, safe to remove)

- **`src/app/api/onboarding/route.ts`** — the old case-list endpoint with a mock fallback path. Replaced by `/api/onboarding/cases` (session-scoped, real query, no mock fallback). The `useOnboarding` hook in `src/hooks/useOnboarding.ts` still points at the old route but the dashboard page no longer uses that hook, so the route can be deleted along with the hook in a future cleanup pass.

- **`src/app/api/ats/candidates/[id]/hire/route.ts`** — a fake ack endpoint that predates the real `/api/hiring/hire`. It has exactly one caller: `src/components/hiring/HiringModuleScreens.tsx:1101`, which fire-and-forget POSTs to it on the kanban drag-to-Hired action and then toasts "Pre-hire created" — a lie, because the endpoint returns a synthetic response and never touches the DB. The real hire path requires an accepted offer + `POST /api/hiring/hire`; the kanban drag doesn't have an offerId in hand. Cleanup options for a future pass: (a) delete both the endpoint and the caller — kanban drag to "Hired" without an accepted offer becomes a no-op that shows "Move a candidate through an offer first"; or (b) rewrite the caller to open the offer-review modal when a candidate is dragged to Hired without one on file. Not urgent — it's misleading UX, not a security issue.

- **`src/app/api/benefits/enrollment/route.ts`** (singular) — the old fake enrollment endpoint that returned `{ ok: true, enrollmentId: "ben-enr-<employeeId>-<timestamp>", payrollDeductionUpdate: "queued", carrierSync: "pending next nightly file" }` without touching the DB. Superseded by `/api/benefits/enrollments` (plural), which is real Drizzle-backed CRUD scoped to `resolveUserContext`. The old singular route may still be referenced by `submitBenefitsEnrollment` in `src/components/benefits/BenefitsModuleScreens.tsx:160` (called from the legacy multi-step enrollment wizard, which the new `/benefits/enrollment/[employeeId]` page no longer uses). Safe to delete alongside the wizard's `useEnrollmentSubmit` hook when the legacy wizard is retired. Same cleanup category as the `/api/onboarding` and `/api/ats/candidates/[id]/hire` entries above.

## Orphaned schema declarations (safe to remove)

Flagged during the Performance/Learning build (migration 0034): several table declarations in `src/db/schema.ts` have zero code consumers and correspond to orphaned tables:

- `employeeGoals` (`employee_goals`)
- `oneOnOneMeetings` (`one_on_one_meetings`)
- `performanceCycles` (`performance_cycles`)
- `academyPrograms` (if still present)

Not urgent — they're inert dead code. Safe to remove in a future cleanup pass with a migration that `DROP TABLE IF EXISTS` each one (all verified empty during the Performance batch). Bundle with any other schema-hygiene work.

## Documentation drift

- `README.md` has never been updated with anything real. Fixed in this pass — it now points to this `/docs`, `/runbooks`, `/brain` structure.
- Multiple modules refer to "Section N" or "Prompt N" naming conventions in older commits (`Section 26`, `Prompt 21`, `Sec. 17`) that no longer correspond to any current document. Ignore in new work — this predates the current architecture.
- **`Sec_35_API_Contract_Additions.md` and `backend/API_IMPLEMENTATION.md` are stale on `/api/v1/*` auth.** Both docs list the three batch endpoints (`/api/v1/employees/batch`, `/api/v1/documents/batch-send`, `/api/v1/payroll/batch-approve`) without mentioning that they now require `Authorization: Bearer <api-key>`. The endpoints previously had no real auth; a session-cookie + `body.companyId` fallback silently accepted any request. As of the API-keys batch (commit adding `api_keys` + `requireApiKey`), all three require a workspace-scoped bearer key minted from `/settings/*/api`. Not urgent, doesn't block anything at runtime — the grep audit before merge confirmed zero in-code callers. Just needs a docs pass eventually.

---

## Housekeeping for the next audit run

When the next audit sweep happens, this file should be the pre-work: everything listed here should be either (a) still true and getting fixed, or (b) already fixed but not deleted from the file — mark as `**Fixed in <commit>**` rather than removing, so the audit history stays legible.
