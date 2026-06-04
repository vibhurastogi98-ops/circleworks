import { describe, expect, it } from "vitest";

import { CHOOSE_ACCOUNT_TYPE_ROUTE, resolveDashboard } from "@/lib/dashboard-resolver";

describe("resolveDashboard", () => {
  it("maps each account type to the correct dashboard target", () => {
    expect(resolveDashboard("company")).toBe("/app/dashboard/company");
    expect(resolveDashboard("agency")).toBe("/app/dashboard/agency");
    expect(resolveDashboard("creator")).toBe("/app/dashboard/creator");
  });

  it("routes missing legacy account types to choose-type", () => {
    expect(resolveDashboard(null)).toBe(CHOOSE_ACCOUNT_TYPE_ROUTE);
    expect(resolveDashboard("")).toBe(CHOOSE_ACCOUNT_TYPE_ROUTE);
  });
});
