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

## Documentation drift

- `README.md` has never been updated with anything real. Fixed in this pass — it now points to this `/docs`, `/runbooks`, `/brain` structure.
- Multiple modules refer to "Section N" or "Prompt N" naming conventions in older commits (`Section 26`, `Prompt 21`, `Sec. 17`) that no longer correspond to any current document. Ignore in new work — this predates the current architecture.

---

## Housekeeping for the next audit run

When the next audit sweep happens, this file should be the pre-work: everything listed here should be either (a) still true and getting fixed, or (b) already fixed but not deleted from the file — mark as `**Fixed in <commit>**` rather than removing, so the audit history stays legible.
