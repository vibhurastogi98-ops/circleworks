# FLOW DIAGNOSIS: Account Type Wiring

Date: 2026-06-02

Scope: diagnostic only. No code paths were changed.

## Summary Verdict

I did not find a separate "Section 1" root-cause document in this repo, so this maps the four requested checks to the likely root-cause set:

| Root cause | Present? | Diagnosis |
| --- | --- | --- |
| 1. `companies` lacks an account type column or values | No | `companies.account_type` exists as enum `account_type`; live values are present. |
| 2. Account type is missing from login/session/global identity | Partially yes | Login and `cw_session` do not include account type. AuthContext also ignores it. The global platform store is later hydrated from `/api/users/me`, but only after an async shell fetch. |
| 3. Dashboard variant is not chosen from account type | No, with timing risk | `/dashboard` chooses creator/agency/company variants from normalized store account type. However, children render before `/api/users/me` hydration completes, so the first render can use the persisted/default `"company"` value. |
| 4. Sidebar nav does not depend on account type | No, with same timing risk | Sidebar nav blueprint and capability filtering depend on normalized account type. It has the same default-before-hydration exposure as the dashboard. |

## 1. Account Type Storage

`src/db/schema.ts` defines an account type enum and a nullable `companies.accountType` column:

```ts
export const accountTypeEnum = pgEnum('account_type', ['company', 'agency', 'creator']);

export const companies = pgTable('companies', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  accountType: accountTypeEnum('account_type'),
```

`drizzle/0021_account_type_foundation.sql` confirms the intended enum values and migration of legacy aliases:

```sql
CREATE TYPE "public"."account_type" AS ENUM ('company', 'agency', 'creator');
...
ALTER TABLE "companies" ADD COLUMN "account_type" "public"."account_type";
...
WHEN 'company' THEN 'company'::"public"."account_type"
WHEN 'agency' THEN 'agency'::"public"."account_type"
WHEN 'creator' THEN 'creator'::"public"."account_type"
```

Live DB aggregate check:

| `companies.account_type` | Count |
| --- | ---: |
| `agency` | 2 |
| `company` | 14 |
| `creator` | 1 |

The live column metadata is `USER-DEFINED`, `udt_name = account_type`, nullable, with no default.

Signup writes the selected account type onto `companies`:

```ts
const accountType = normalizeAccountType(account?.accountType);
...
const [company] = await tx
  .insert(companies)
  .values({
    name: accountName,
    accountType,
```

## 2. Login, Session, and Global Store Flow

After login, `src/app/api/auth/login/route.ts` loads the app user from the `users` table only:

```ts
const [appUser] = await db
  .select({ id: users.id, role: users.role, email: users.email })
  .from(users)
  .where(eq(users.email, normalizedEmail));
```

It then loads only `employees.companyId` for cache warming:

```ts
const [empRow] = await db
  .select({ companyId: employees.companyId })
  .from(employees)
  .where(eq(employees.userId, appUser.id))
    .limit(1);
```

The custom session token includes only `userId`, `email`, and `role`:

```ts
const sessionToken = await createSessionToken(
  {
    userId: appUser.id,
    email: appUser.email,
    role: appUser.role ?? "employee",
  },
  Boolean(rememberMe)
);
```

`src/lib/session.ts` confirms the session shape:

```ts
export interface SessionUser {
  userId: number;
  email: string;
  role: string;
}

export async function createSessionToken(user: SessionUser, rememberMe = false): Promise<string> {
  return new SignJWT({ userId: user.userId, email: user.email, role: user.role })
```

`src/context/AuthContext.tsx` also excludes account type:

```ts
export interface AuthUser {
  userId: string;
  email: string;
  role: string;
}

function mapSupabaseUser(supabaseUser: User | null): AuthUser | null {
  if (!supabaseUser) return null;
  return {
    userId: supabaseUser.id,
    email: supabaseUser.email ?? "",
    role: (supabaseUser.user_metadata?.role as string) ?? "employee",
  };
}
```

The richer user/company record is loaded later by `src/app/api/users/me/route.ts`, which does include `companies.accountType`:

```ts
companyId: companies.id,
companyName: companies.name,
companyAccountType: companies.accountType,
entityType: companies.entityType,
```

and returns it in both `user` and `company`:

```ts
user: {
  id: session.userId.toString(),
  email: session.email,
  role: session.role || "employee",
  accountType: currentUserEmployee.companyAccountType || "company",
```

```ts
company: {
  id: currentUserEmployee.companyId?.toString() ?? "",
  name: currentUserEmployee.companyName || "Workspace",
  accountType: currentUserEmployee.companyAccountType || "company",
```

`src/components/app/AppShell.tsx` hydrates the global store from `/api/users/me`:

```ts
const response = await fetch("/api/users/me", {
  credentials: "include",
  cache: "no-store",
});
...
const resolvedAccountType = normalizeAccountType(data.company?.accountType ?? data.user?.accountType ?? accountType);
setAccountType(resolvedAccountType);
...
setCurrentCompany({
  id: String(data.company.id ?? "creator-company"),
  name: data.company.name || "Creator Studio",
...
  accountType: resolvedAccountType,
```

The store default is company:

```ts
currentCompany: DEFAULT_COMPANIES[0],
companies: DEFAULT_COMPANIES,
accountType: DEFAULT_COMPANIES[0].accountType ?? "company",
```

and persisted state stores `accountType` and `currentCompany`:

```ts
partialize: (state) => ({
  sidebarCollapsed: state.sidebarCollapsed,
  accountType: state.accountType,
  currentCompany: state.currentCompany,
}),
```

Important timing note: `AppShell` tracks `companyContextHydrated`, but it still renders `{children}` while hydration is in flight:

```tsx
<main
  id="main-content"
  className={`h-full overflow-y-auto overflow-x-hidden bg-[var(--surface-subtle)] ${
    renderedComplianceCritical > 0 ? "pt-[104px]" : "pt-16"
  }`}
>
  {children}
</main>
```

## 3. Dashboard Routes and Variant Selection

Dashboard files under `src/app`:

- `src/app/dashboard/page.tsx`
- `src/app/dashboard/layout.tsx`
- `src/app/compliance/dashboard/page.tsx`
- `src/app/c/[company-slug]/dashboard/page.tsx`
- API routes: `src/app/api/dashboard/stats/route.ts`, `src/app/api/dashboard/overview/route.ts`

The main platform dashboard, `src/app/dashboard/page.tsx`, chooses the variant from normalized global store account type:

```ts
const {
  currentCompany,
  currentUser,
  accountType,
  payrollRunInProgress,
  setPayrollRunning,
} = usePlatformStore();
...
const normalizedAccountType = normalizeAccountType(currentCompany.accountType ?? accountType);
```

Header copy and primary actions branch on that value:

```tsx
const isCreator = accountType === "creator";
const isAgency = accountType === "agency";
...
{isCreator
  ? "Owner pay, contractor payments, taxes, expenses, and documents in one focused view."
  : isAgency
    ? "Client margin, contractor payments, team payroll, and operating alerts in one view."
    : "Company health, payroll readiness, team activity, and alerts in one operational view."}
```

Widgets branch on `accountType`:

```ts
function getDefaultDashboardWidgets(
  accountType: string,
  overview: DashboardOverview,
): DefaultDashboardWidget[] {
  if (accountType === "creator") {
    return [
...
  if (accountType === "agency") {
    return [
```

Quick modules branch on `accountType` and capability filtering:

```ts
function getQuickModulesForAccountType(accountType: string, overview: DashboardOverview): QuickModule[] {
  const capabilities = getCapabilities(accountType);
  const allowedOverviewModules = overview.quickModules.filter((module) => {
    const capability = QUICK_MODULE_CAPABILITIES[module.id];
    return !capability || capabilities[capability];
  });

  if (accountType === "creator") {
    return [
...
  if (accountType === "agency") {
    return [
```

Render branch:

```tsx
<PageHeader
  firstName={firstName}
  accountType={normalizedAccountType}
...
<DefaultDashboardWidgets accountType={normalizedAccountType} overview={overview} />
...
{normalizedAccountType === "creator" ? (
  <CreatorPaySelfStatusCard />
) : (
  <PayrollStatusCard
```

`src/app/compliance/dashboard/page.tsx` is a fixed compliance dashboard. It does not reference `accountType`, `usePlatformStore`, `normalizeAccountType`, or capability functions.

`src/app/c/[company-slug]/dashboard/page.tsx` is a client company dashboard for the accountant portal. It fetches clients by slug and does not reference account type:

```ts
fetch("/api/accountant/clients")
  .then((r) => r.json())
  .then((data) => {
    const found = (data.clients || []).find(
      (c: ClientDetail) => c.slug === companySlug
    );
    setClient(found || null);
```

## 4. Sidebar Nav Definition and Account Type Dependency

Sidebar nav is defined in `src/components/app/AppSidebar.tsx`; `src/components/AppSidebar.tsx` only re-exports it.

Base nav items:

```ts
const DASHBOARD_NAV_ITEM: NavItem = {
  label: "Dashboard",
  icon: LayoutDashboard,
  capability: "dashboard",
  href: "/dashboard",
};
...
const NAV_ITEMS: NavItem[] = [
  DASHBOARD_NAV_ITEM,
  {
    label: "Payroll",
```

Creator-specific nav:

```ts
const CREATOR_NAV_ITEMS: NavItem[] = [
  DASHBOARD_NAV_ITEM,
  PAY_MYSELF_NAV_ITEM,
  { label: "Contractors", icon: Handshake, capability: "contractors", href: "/app/contractors" },
  CREATOR_TAXES_NAV_ITEM,
  { label: "Expenses", icon: Receipt, capability: "expenses", href: "/expenses" },
  DOCUMENTS_NAV_ITEM,
];
```

Agency-specific nav:

```ts
const COMPANY_NAV_ITEMS = NAV_ITEMS;

const AGENCY_NAV_ITEMS: NavItem[] = [
  DASHBOARD_NAV_ITEM,
  CLIENTS_NAV_ITEM,
  AGENCY_CONTRACTORS_NAV_ITEM,
  ...NAV_ITEMS.filter((item) => item.label !== "Dashboard" && item.label !== "Contractors"),
];
```

Runtime choice depends on normalized account type:

```ts
const normalizedAccountType = normalizeAccountType(currentCompany.accountType ?? accountType);
const creatorMode = normalizedAccountType === "creator";
const capabilities = useMemo(() => getCapabilities(normalizedAccountType), [normalizedAccountType]);
const navBlueprint = useMemo(
  () => {
    if (normalizedAccountType === "creator") return CREATOR_NAV_ITEMS;
    if (normalizedAccountType === "agency") return AGENCY_NAV_ITEMS;
    return COMPANY_NAV_ITEMS;
  },
  [normalizedAccountType],
);
const baseNavItems = useMemo(
  () => filterNavItemsByCapabilities(navBlueprint, capabilities),
  [capabilities, navBlueprint],
);
```

Capability filtering removes unsupported modules:

```ts
function filterNavItemsByCapabilities(items: NavItem[], capabilities: Capabilities) {
  return items
    .map((item) => {
      if (item.divider) return item;
      if (item.capability && !capabilities[item.capability]) return null;

      const children = item.children?.filter((child) => !child.capability || capabilities[child.capability]);
      return children ? { ...item, children } : item;
    })
    .filter((item): item is NavItem => Boolean(item));
}
```

Capability matrix in `src/lib/capabilities.ts` differentiates `company`, `agency`, and `creator`, for example:

```ts
creator: {
  dashboard: true,
  payroll: false,
  ownerPayroll: true,
  ownerTaxes: true,
  employees: false,
  contractors: true,
  contractorOnboarding: false,
  clients: false,
```

## Final Finding

The persistent data layer and the dashboard/sidebar variant logic are present. The main gap is identity propagation timing:

- `accountType` is not included in `cw_session`, `/api/auth/me`, or `AuthContext`.
- `accountType` is eventually loaded into the global store by `AppShell` through `/api/users/me`.
- `AppShell` renders dashboard children before that company-context fetch completes, so first render can use the store's default or persisted account type, which defaults to `"company"`.
