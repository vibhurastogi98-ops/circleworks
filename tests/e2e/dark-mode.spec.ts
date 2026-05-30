import fs from "node:fs";
import { test, expect, type BrowserContext } from "@playwright/test";
import { SignJWT } from "jose";

const PLATFORM_SCREENS = [
  { name: "dashboard", path: "/dashboard" },
  { name: "payroll", path: "/payroll" },
  { name: "employees", path: "/employees" },
  { name: "hiring", path: "/hiring" },
  { name: "onboarding", path: "/onboarding" },
  { name: "benefits", path: "/benefits" },
  { name: "time", path: "/time" },
  { name: "expenses", path: "/expenses" },
  { name: "performance", path: "/performance" },
  { name: "learning", path: "/learning" },
  { name: "compliance", path: "/compliance/dashboard" },
  { name: "reports", path: "/reports" },
  { name: "settings", path: "/settings/company" },
] as const;

function readJwtSecret() {
  const envText = fs.existsSync(".env.local") ? fs.readFileSync(".env.local", "utf8") : "";
  return envText.match(/^JWT_SECRET=(.*)$/m)?.[1]?.trim() || "circleworks-dev-secret-change-in-production";
}

async function createSessionToken() {
  return new SignJWT({ userId: 1, email: "admin@circleworks.com", role: "owner" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(new TextEncoder().encode(readJwtSecret()));
}

async function addDarkModeSession(context: BrowserContext, baseURL: string) {
  await context.addCookies([
    {
      name: "cw_session",
      value: await createSessionToken(),
      url: baseURL,
      sameSite: "Lax",
      httpOnly: true,
      secure: false,
    },
  ]);
}

test.describe("platform dark mode", () => {
  test.beforeEach(async ({ context, page, baseURL }) => {
    await addDarkModeSession(context, baseURL!);
    await page.goto("/");
    await page.evaluate(() => {
      window.localStorage.setItem("theme", "dark");
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
          savedAt: new Date().toISOString(),
          version: 1,
        }),
      );
    });
  });

  for (const screen of PLATFORM_SCREENS) {
    test(`${screen.name} renders with dark theme`, async ({ page }, testInfo) => {
      await page.goto(screen.path);
      await expect(page.locator("html")).toHaveClass(/dark/);
      await expect(page.locator("body")).not.toContainText("Page not found");
      await expect(page.locator("body")).not.toContainText("Something went wrong on our end");

      await page.screenshot({
        path: testInfo.outputPath(`${screen.name}-dark.png`),
        fullPage: false,
      });
    });
  }
});
