# Pre-push app audit — 2026-09-12

Fresh test accounts used (created via `/api/auth/signup/complete` earlier in this session):

| Type    | Email pattern                                  |
|---------|------------------------------------------------|
| company | `company-verify-<ts>@circleworks.test`         |
| agency  | `agency-verify-<ts>@circleworks.test`          |
| creator | `creator-verify-<ts>@circleworks.test`         |

(Passwords redacted; accounts were created via `/api/auth/signup/complete` during the audit session and remain in the dev database.)

**Method**: navigated each account's sidebar/topbar routes via a headless-Chrome sweep, capturing URL, primary `<h1>`, body-text length, skeleton count, and screenshot per page; toggled dark mode on a sample; probed cross-category settings redirects.

**Coverage caveat (worth flagging up-front)**: this was a URL/render sweep, not a deep interaction test. Every module hub for every account type was visited, every settings page in each category was visited, and dark mode was spot-checked. But **I did not click through every button on every page** — the scale (~140 nav hrefs × 3 accounts + interactions) exceeds a single-session interactive audit. Any "button doesn't do anything" bug that requires actually clicking a button — outside the ones I sampled — is not covered here. If you want that coverage, we'd need to script it (Playwright with per-page interaction-scanning heuristics) or narrow the scope.

---

## Critical

### C-1 · `/settings/*/billing` redirects to the account's dashboard on all 3 account types
- **Reproduce**: any account, visit `/settings/company/billing` / `/settings/agency/billing` / `/settings/creator/billing`.
- **Observed**: browser lands on `/app/dashboard/{type}` (h1 "Dashboard"). Confirmed for creator, company, agency.
- **Expected**: render the `BillingSettings` component (extracted to `src/components/settings/pages/BillingSettings.tsx` during the recent settings refactor; the underlying page still works via other entry points but the nested route bounces).
- **Impact**: "Billing" is a link in every category's settings sidebar (`COMPANY_/AGENCY_/CREATOR_SETTINGS_NAV_ITEMS`). Clicking it from the sidebar throws the user out of settings entirely. Payment-critical surface — this is the "cannot pay us" flow.
- **Likely cause**: probably a stray `redirect()` inside `BillingSettings.tsx` or the route wrapper, hitting on server render before the client mounts. Worth checking whether the old flat `/settings/billing` (SettingsLegacyRedirect) got imported instead of the extracted component in the new route files.

---

## High

### H-1 · Creator sidebar has **no** Settings link at all
- **Where**: `src/lib/app-navigation.ts` line 97, `MODULE_ORDER.creator = ["dashboard","ownerPayroll","contractors","ownerTaxes","expenses","documents"]` — omits `"settings"` and `"help"`.
- **Observed**: creator's left sidebar only shows Dashboard / Pay Myself / Contractors / Taxes / Expenses / Documents. No Settings, no Help.
- **Expected**: creator has 8 settings pages defined (`CREATOR_SETTINGS_NAV_ITEMS`) and `capabilities.settings === true` (we flipped it during the refactor). Those pages are reachable only via manual URL entry today.
- **Fix hint**: append `"settings"` (and probably `"help"`) to `MODULE_ORDER.creator`. AppSidebar already uses the account-typed `href` for Settings — no other change needed.

### H-2 · `/settings/creator/notifications` stays stuck on "Loading preferences…" forever
- **Reproduce**: creator account, click Notifications in settings sidebar (or `/settings/creator/notifications`).
- **Observed**: h1 "Notification Preferences" renders, top row shows "Daily summary email at 8am" toggle, but the main table renders "Loading preferences..." and never resolves. No console error captured, no failed network request captured (creator has no writable prefs endpoint?).
- **Not-yet-checked**: same page for company (loaded OK — showed the same "Loading preferences..." placeholder briefly, then resolved). Worth checking whether the preferences fetch is gated on a company-role prerequisite creator accounts don't satisfy.

---

## Medium

### M-1 · Creator has **no billing settings page even if it loaded** — reserved settings slugs may not have implementations for creator
Related to C-1: creator's settings nav lists "Billing" (`/settings/creator/billing`), and the route file exists (`src/app/settings/creator/billing/page.tsx` re-exports `BillingSettings`). But the redirect in C-1 means creator users can't reach billing at all. Even fixing C-1 should verify the `BillingSettings` component renders sensibly for creator (currently it looks company-centric). If billing is intentionally company-only, the item shouldn't be in `CREATOR_SETTINGS_NAV_ITEMS`.

### M-2 · `/agency/profitability` h1 has an unintended underline (both light and dark mode)
- Screenshot shows "Agency Profitability" text with a bright underline that reads visually like a link, but it's not clickable. Same in dark mode.
- Cosmetic but distracting — likely a stray `underline` utility or a leftover `<a>` wrapping the h1.

### M-3 · Slow first-compile stalls the renderer badly enough that screenshots time out
- Hit twice during the sweep: `/employees` (company) and `/app/clients` (agency) took ~8s to fully render on first navigation. During that window, `computer.screenshot` calls to that tab timed out at 30s (renderer frozen from CDP's perspective). Recovered by opening a fresh tab.
- Not a production bug per se — this is Next.js dev-mode compile behavior. Flagging because it will bite anyone testing locally and it made the audit noticeably harder.

### M-4 · Signup ignores the company/agency name we sent in the payload
- Company and agency accounts created in this session both got the fallback name **"My Company"** in the `companies` table, even though the payload included `business.companyName: "Verify Co Inc"` / `agencyDetails.agencyName: "Verify Agency LLC"`.
- Confirmed in DB: `companies.id in (31,32)` both named "My Company"; only the creator got its real name ("Verify Creator Studio").
- Not blocking (the wizard uses richer nested keys the endpoint reads correctly), but the endpoint should either (a) accept the flat `companyName` key we passed or (b) reject the request rather than silently using a default. Not a signup-flow blocker for real users using the wizard.

---

## Low / observation

### L-1 · "1099" numeric badge on the agency Contractors nav item is confusable
- The Contractors sidebar row shows the label "Contractors" plus a badge that reads "1099". Because 1099 is also the tax-form name that lives inside Contractors, this reads as a category label rather than a count. Consider adding a leading `#` or moving the count out of the label position.

### L-2 · Cross-category settings redirect works, but silently
- Confirmed: as agency, visiting `/settings/company/business` → bounces to `/settings/agency/business`. As agency, `/settings/creator/business` → same. Behavior is correct per the recent refactor.
- Observation: there's no toast/hint telling the user their URL was redirected. If a user hand-types or bookmarks the wrong category, they'll get silently teleported. Non-blocking; UX call.

### L-3 · Dark-mode dashboards flash blank before content paints
- Agency `/app/dashboard/agency` in dark mode: first screenshot at t=4s showed a completely empty main area (skeletons had already cleared but content hadn't painted). Second capture at t=8s was fine. Same pattern noted earlier on `/settings/creator/billing` (skeletons visible, then redirect). Suggests a race between the hydration and the first-render for the dashboard resolver on some pages.

### L-4 · Onboarding tour beacon re-arms every login
- Each login as a fresh account triggered the react-joyride onboarding tour beacon at `#tour-sidebar`. Fine for first-run, but the beacon reappeared even after `localStorage.tour_completed = "true"` was set on a previous visit (localStorage is per-origin, so this is expected across incognito/new-user; noting for the record). Not a bug — flagging so nobody chases it later.

### L-5 · `main-content` scrollbar is 6px wide with hardcoded dark-navy track (already fixed this session)
Included for completeness: this was fixed in the previous task by rewriting `::-webkit-scrollbar-*` in `globals.css`. Verified as gone during this audit.

---

## What was NOT audited (deliberate)

To keep this pass tractable, the following was intentionally skipped and should be a follow-up:

- **Deep click-testing** — pagination, sort, filter, modal Save/Cancel flows, "View" buttons on every list row. I visited hubs only.
- **Every subpage of every module** — payroll has ~20 subpages, employees has ~13, hiring has ~9. I hit hubs + spot-checked a few high-signal ones (roles, workflows, audit-log, api). A full sub-page sweep is another ~120 URL visits.
- **Form submissions** — Save/Update on any settings page.
- **Downloads/exports** — "Export CSV", "Export Excel", "Export packet", "Download all" buttons all visible; none were clicked.
- **Contractor portal / accountant portal / /me** — not in any of the 3 primary account types' sidebars.
- **Multi-language, keyboard shortcuts, mobile viewport** — out of scope for this pass.

Recommend triaging C-1 and H-1/H-2 first (they break real, discoverable user paths from the sidebar), then deciding whether to invest in scripted button-level coverage before push or accept the risk.
