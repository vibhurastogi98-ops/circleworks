import { expect, test, type Page } from "@playwright/test";
import dotenv from "dotenv";
import postgres from "postgres";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local", quiet: true });
dotenv.config({ path: ".env", override: false, quiet: true });

type AccountType = "company" | "agency" | "creator";

type AccountFixture = {
  type: AccountType;
  email: string;
  clerkUserId: string;
  companyName: string;
  dashboard: string;
  sidebarVisible: string[];
  sidebarHidden: string[];
  widgets: string[];
  blockedPath: string;
};

const TEST_PASSWORD = "FX6verify!2026A";
const hasRequiredEnv = Boolean(
  process.env.DATABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY,
);

test.skip(!hasRequiredEnv, "FX-6 e2e requires DATABASE_URL and Supabase service-role env vars.");

const ACCOUNT_FIXTURES: AccountFixture[] = [
  {
    type: "company",
    email: "fx6-company@circleworks.test",
    clerkUserId: "fx6-company-user",
    companyName: "FX6 Company Workspace",
    dashboard: "/app/dashboard/company",
    sidebarVisible: ["Dashboard", "Payroll", "Employees", "Contractors"],
    sidebarHidden: ["Clients", "Pay Myself", "Taxes"],
    widgets: ["Headcount", "Next payroll run", "Pending HR/onboarding tasks"],
    blockedPath: "/app/pay-myself",
  },
  {
    type: "agency",
    email: "fx6-agency@circleworks.test",
    clerkUserId: "fx6-agency-user",
    companyName: "FX6 Agency Workspace",
    dashboard: "/app/dashboard/agency",
    sidebarVisible: ["Dashboard", "Clients", "Contractors", "Payroll"],
    sidebarHidden: ["Pay Myself", "Taxes"],
    widgets: ["Client margin", "Contractor payments", "Next mixed run"],
    blockedPath: "/app/taxes",
  },
  {
    type: "creator",
    email: "fx6-creator@circleworks.test",
    clerkUserId: "fx6-creator-user",
    companyName: "FX6 Creator Workspace",
    dashboard: "/app/dashboard/creator",
    sidebarVisible: ["Dashboard", "Pay Myself", "Contractors", "Taxes", "Expenses", "Documents"],
    sidebarHidden: ["Payroll", "Employees", "Clients"],
    widgets: ["Next pay-self", "Tax set-aside", "Contractor payments"],
    blockedPath: "/payroll/run",
  },
];

let sql: ReturnType<typeof postgres>;
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "missing",
  { auth: { autoRefreshToken: false, persistSession: false } },
);

function cleanConnectionString() {
  return (process.env.DATABASE_URL || "postgresql://notset@localhost:5432/circleworks")
    .replace(/[&?]channel_binding=require/g, "");
}

async function resetSqlConnection() {
  if (sql) {
    await sql.end({ timeout: 1 }).catch(() => undefined);
  }
  sql = postgres(cleanConnectionString(), {
    prepare: false,
    max: 1,
    connect_timeout: 30,
    idle_timeout: 20,
  });
}

function isTransientDbError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return /CONNECTION_ENDED|ECONNRESET|ETIMEDOUT|connection terminated|write connection|read etimedout/i.test(
    message,
  );
}

async function withDbRetry<T>(operation: () => Promise<T>) {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (!isTransientDbError(error) || attempt === 3) {
        throw error;
      }
      await resetSqlConnection();
    }
  }
  throw lastError;
}

async function ensureAuditTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS workspace_audit_logs (
      id serial PRIMARY KEY,
      company_id integer REFERENCES companies(id) ON DELETE cascade,
      actor_user_id integer REFERENCES users(id) ON DELETE set null,
      action text NOT NULL,
      resource text NOT NULL,
      metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
      ip_address text,
      user_agent text,
      created_at timestamp DEFAULT now()
    )
  `;
}

async function ensureSupabaseUser(account: AccountFixture) {
  const userMetadata = { role: "owner", accountType: account.type };
  const created = await supabaseAdmin.auth.admin.createUser({
    email: account.email,
    password: TEST_PASSWORD,
    email_confirm: true,
    user_metadata: userMetadata,
  });

  if (!created.error) return;
  if (!/already|registered|exists/i.test(created.error.message)) {
    throw created.error;
  }

  const users = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (users.error) throw users.error;

  const authUser = users.data.users.find(
    (user) => user.email?.toLowerCase() === account.email.toLowerCase(),
  );
  if (!authUser) throw created.error;

  const updated = await supabaseAdmin.auth.admin.updateUserById(authUser.id, {
    password: TEST_PASSWORD,
    email_confirm: true,
    user_metadata: userMetadata,
  });
  if (updated.error) throw updated.error;
}

async function ensureAppAccount(account: AccountFixture) {
  const companyRows = await sql<{ id: number }[]>`
    SELECT id FROM companies WHERE name = ${account.companyName} ORDER BY id LIMIT 1
  `;
  const companyId = companyRows[0]?.id ??
    (await sql<{ id: number }[]>`
      INSERT INTO companies (name, account_type, contractor_count)
      VALUES (${account.companyName}, ${account.type}::account_type, 3)
      RETURNING id
    `)[0]!.id;

  await sql`
    UPDATE companies
    SET account_type = ${account.type}::account_type,
        contractor_count = 3
    WHERE id = ${companyId}
  `;

  const [user] = await sql<{ id: number }[]>`
    INSERT INTO users (clerk_user_id, email, role)
    VALUES (${account.clerkUserId}, ${account.email}, 'owner')
    ON CONFLICT (clerk_user_id)
    DO UPDATE SET email = excluded.email, role = excluded.role
    RETURNING id
  `;

  await sql`DELETE FROM employees WHERE user_id = ${user!.id}`;
  await sql`
    INSERT INTO employees (
      user_id,
      company_id,
      first_name,
      last_name,
      email,
      status,
      employment_type,
      pay_type,
      salary
    )
    VALUES (
      ${user!.id},
      ${companyId},
      'FX6',
      ${account.type},
      ${account.email},
      'active',
      ${account.type === "creator" ? "contractor" : "full-time"},
      ${account.type === "creator" ? "contractor" : "salary"},
      120000
    )
  `;

  await sql`DELETE FROM pay_schedules WHERE company_id = ${companyId} AND name = 'FX6 default schedule'`;
  await sql`
    INSERT INTO pay_schedules (company_id, name, frequency, is_default)
    VALUES (${companyId}, 'FX6 default schedule', 'biweekly', true)
  `;

  await sql`
    DELETE FROM agency_client_assignments WHERE company_id = ${companyId}
  `;
  await sql`
    DELETE FROM agency_projects WHERE company_id = ${companyId}
  `;
  await sql`
    DELETE FROM agency_clients WHERE company_id = ${companyId}
  `;
  await sql`
    DELETE FROM contractors WHERE company_id = ${companyId} AND email LIKE 'fx6-%@circleworks.test'
  `;

  if (account.type === "agency") {
    const [client] = await sql<{ id: number }[]>`
      INSERT INTO agency_clients (company_id, name, email, contact_name)
      VALUES (${companyId}, 'FX6 Client', 'fx6-client@circleworks.test', 'FX6 Client Owner')
      RETURNING id
    `;
    const [project] = await sql<{ id: number }[]>`
      INSERT INTO agency_projects (company_id, client_id, name, status)
      VALUES (${companyId}, ${client!.id}, 'FX6 Margin Project', 'Active')
      RETURNING id
    `;
    await sql`
      INSERT INTO agency_client_assignments (
        company_id,
        client_id,
        project_id,
        worker_type,
        worker_name,
        worker_email,
        role,
        pay_rate,
        bill_rate,
        hours_per_month,
        status
      )
      VALUES (
        ${companyId},
        ${client!.id},
        ${project!.id},
        'contractor',
        'FX6 Contractor',
        'fx6-agency-contractor@circleworks.test',
        'Consultant',
        80,
        140,
        80,
        'Active'
      )
    `;
  }

  if (account.type === "agency" || account.type === "creator") {
    const [contractor] = await sql<{ id: number }[]>`
      INSERT INTO contractors (company_id, name, business_name, email, status, w9_status)
      VALUES (
        ${companyId},
        'FX6 Contractor',
        'FX6 Contractor LLC',
        ${`fx6-${account.type}-contractor@circleworks.test`},
        'Active',
        'Collected'
      )
      RETURNING id
    `;
    await sql`
      INSERT INTO contractor_invoices (
        contractor_id,
        invoice_number,
        amount,
        description,
        submitted_date,
        due_date,
        status
      )
      VALUES (
        ${contractor!.id},
        ${`FX6-${account.type.toUpperCase()}-001`},
        1800,
        'FX6 verification invoice',
        CURRENT_DATE,
        CURRENT_DATE + INTERVAL '7 days',
        'Pending'
      )
    `;
  }
}

async function resetSeededAccountTypes() {
  for (const account of ACCOUNT_FIXTURES) {
    await sql`
      UPDATE companies
      SET account_type = ${account.type}::account_type
      WHERE name = ${account.companyName}
    `;
  }
}

async function seedAccounts() {
  await ensureAuditTable();
  for (const account of ACCOUNT_FIXTURES) {
    await ensureSupabaseUser(account);
    await ensureAppAccount(account);
  }
}

async function dismissCookieBanner(page: Page) {
  const rejectButton = page.getByRole("button", { name: "Reject Non-Essential" });
  if (await rejectButton.isVisible().catch(() => false)) {
    await rejectButton.click();
  }
}

async function seedCookieConsent(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "circleworks_consent",
      JSON.stringify({
        mode: "reject-non-essential",
        preferences: {
          essential: true,
          analytics: false,
          marketing: false,
          personalization: false,
        },
        ccpaOptOut: true,
        savedAt: "2026-06-02T00:00:00.000Z",
        version: 1,
      }),
    );
  });
}

async function loginAs(page: Page, account: AccountFixture) {
  await seedCookieConsent(page);
  await page.goto("/login");
  await dismissCookieBanner(page);
  await page.getByLabel("Work email address").fill(account.email);
  await page.getByRole("textbox", { name: "Password" }).fill(TEST_PASSWORD);
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page).toHaveURL(new RegExp(`${account.dashboard}$`), { timeout: 30_000 });
  await expect(page.locator("#tour-dashboard")).toBeVisible({ timeout: 30_000 });
}

async function expectAccountExperience(page: Page, account: AccountFixture) {
  const sidebar = page.locator("#tour-sidebar");
  const dashboard = page.locator("#tour-dashboard");
  await expect(sidebar).toBeVisible();

  for (const label of account.sidebarVisible) {
    await expect(sidebar.getByText(label, { exact: true }).first()).toBeVisible();
  }

  for (const label of account.sidebarHidden) {
    await expect(sidebar.getByText(label, { exact: true })).toHaveCount(0);
  }

  for (const widget of account.widgets) {
    await expect(dashboard.getByText(widget).first()).toBeVisible();
  }
}

async function expectStoredAccountType(page: Page, accountType: AccountType) {
  const authMe = await page.evaluate(async () => {
    const response = await fetch("/api/auth/me", { credentials: "include" });
    return response.json();
  });
  expect(authMe.accountType).toBe(accountType);

  const userMe = await page.evaluate(async () => {
    const response = await fetch("/api/users/me", { credentials: "include" });
    return response.json();
  });
  expect(userMe.company.accountType).toBe(accountType);
}

test.describe("account type routing", () => {
  test.describe.configure({ mode: "serial" });
  test.setTimeout(120_000);

  test.beforeAll(async () => {
    await resetSqlConnection();
    await withDbRetry(seedAccounts);
  });

  test.beforeEach(async () => {
    await withDbRetry(resetSeededAccountTypes);
  });

  test.afterAll(async () => {
    await withDbRetry(resetSeededAccountTypes).catch(() => undefined);
    await sql?.end({ timeout: 1 });
  });

  for (const account of ACCOUNT_FIXTURES) {
    test(`${account.type} login lands on the right dashboard, sidebar, and widgets`, async ({ page }) => {
      await loginAs(page, account);
      await expectAccountExperience(page, account);
    });

    test(`${account.type} legacy dashboard and deep-link refresh stay typed`, async ({ page }) => {
      await loginAs(page, account);

      await page.goto("/dashboard");
      await expect(page).toHaveURL(new RegExp(`${account.dashboard}$`));
      await expectAccountExperience(page, account);

      await page.goto(account.dashboard);
      await page.reload();
      await expect(page).toHaveURL(new RegExp(`${account.dashboard}$`));
      await expectAccountExperience(page, account);
    });

    test(`${account.type} cannot open a disallowed module by URL`, async ({ page }) => {
      await loginAs(page, account);
      await page.goto(account.blockedPath);
      await expect(page).toHaveURL(/\/403$/);
      await expect(page.locator("#tour-dashboard")).toHaveCount(0);
    });
  }

  test("settings switch updates dashboard, sidebar, widgets, and preview keeps stored type", async ({ page }) => {
    const companyAccount = ACCOUNT_FIXTURES[0]!;
    const agencyAccount = ACCOUNT_FIXTURES[1]!;
    await loginAs(page, companyAccount);

    await page.goto("/settings/workspace");
    await expect(page.getByText("Current account type")).toBeVisible();
    await expect(page.getByTestId("account-type-card-company")).toContainText("Current");

    await page.getByTestId("account-type-card-creator").getByRole("button", { name: "Preview as" }).click();
    await expect(page).toHaveURL(new RegExp(`${companyAccount.dashboard}$`));
    await expect(page.getByTestId("dashboard-preview-banner")).toContainText("Previewing as Creator/Solo");
    await expect(page.locator("#tour-dashboard").getByText("Tax set-aside").first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Pay Myself" }).first()).toBeDisabled();
    await expectStoredAccountType(page, "company");

    const persistedStore = await page.evaluate(() => window.localStorage.getItem("platform-storage"));
    expect(persistedStore).not.toContain("dashboardPreviewAccountType");

    await page.getByTestId("dashboard-preview-banner").getByRole("button", { name: "Exit preview" }).click();
    await expect(page.getByTestId("dashboard-preview-banner")).toHaveCount(0);

    await page.goto("/settings/workspace");
    await page.getByTestId("account-type-card-agency").getByRole("button", { name: "Switch to Agency" }).click();
    await expect(page.getByRole("heading", { name: "Switch workspace type?" })).toBeVisible();
    await page.getByRole("button", { name: "Confirm switch" }).click();
    await expect(page).toHaveURL(new RegExp(`${agencyAccount.dashboard}$`), { timeout: 30_000 });
    await expectAccountExperience(page, agencyAccount);
    await expectStoredAccountType(page, "agency");

    await page.goto("/settings/workspace");
    await page.getByTestId("account-type-card-company").getByRole("button", { name: "Switch to Company" }).click();
    await page.getByRole("button", { name: "Confirm switch" }).click();
    await expect(page).toHaveURL(new RegExp(`${companyAccount.dashboard}$`), { timeout: 30_000 });
    await expectAccountExperience(page, companyAccount);
    await expectStoredAccountType(page, "company");
  });
});
