import { describe, expect, it } from "vitest";

import {
  getAppNavItems,
  getBreadcrumbItemsForPath,
  getRouteTitleForPath,
  navItemMatchesPath,
} from "@/lib/app-navigation";

function visibleLabels(accountType: string) {
  return getAppNavItems(accountType)
    .filter((item) => !item.divider)
    .map((item) => item.label);
}

describe("app navigation", () => {
  it("renders the simplified creator module list from capabilities", () => {
    expect(visibleLabels("creator")).toEqual([
      "Dashboard",
      "Pay Myself",
      "Contractors",
      "Taxes",
      "Expenses",
      "Documents",
    ]);

    const contractors = getAppNavItems("creator").find((item) => item.label === "Contractors");
    expect(contractors?.href).toBe("/app/contractors");
    expect(contractors?.children).toBeUndefined();
  });

  it("adds agency clients and contractor operations without creator-only modules", () => {
    const labels = visibleLabels("agency");

    expect(labels.slice(0, 4)).toEqual(["Dashboard", "Clients", "Contractors", "Payroll"]);
    expect(labels).toContain("Employees");
    expect(labels).toContain("Documents");
    expect(labels).not.toContain("Pay Myself");
    expect(labels).not.toContain("Taxes");
  });

  it("keeps company navigation on the full employer shell", () => {
    const labels = visibleLabels("company");

    expect(labels.slice(0, 4)).toEqual(["Dashboard", "Payroll", "Employees", "Contractors"]);
    expect(labels).toContain("Hiring");
    expect(labels).toContain("Compliance");
    expect(labels).toContain("Settings");
    expect(labels).not.toContain("Clients");
    expect(labels).not.toContain("Pay Myself");
  });

  it("uses type-filtered navigation for active-state and breadcrumbs", () => {
    const agencyClients = getAppNavItems("agency").find((item) => item.label === "Clients");
    const creatorContractors = getAppNavItems("creator").find((item) => item.label === "Contractors");

    expect(agencyClients && navItemMatchesPath(agencyClients, "/agency/profitability")).toBe(true);
    expect(creatorContractors && navItemMatchesPath(creatorContractors, "/contractors/payments")).toBe(false);
    expect(getBreadcrumbItemsForPath("agency", "/agency/profitability")).toEqual([
      { label: "Clients", href: "/app/clients" },
      { label: "Profitability", href: undefined },
    ]);
    expect(getRouteTitleForPath("creator", "/app/pay-myself")).toBe("Pay Myself");
  });
});
