import { describe, expect, it } from "vitest";

import { getCapabilities } from "@/lib/capabilities";
import {
  getCapabilityRouteRedirect,
  getRequiredCapabilityForPath,
  isCapabilityRouteAllowed,
} from "@/lib/capability-routes";
import { getAccountTypeRouteRedirect } from "@/lib/creator-mode";

describe("capability route gating", () => {
  it("keeps creator shell modules limited to owner payroll, taxes, contractors, expenses, and documents", () => {
    const creatorCapabilities = getCapabilities("creator");

    expect(creatorCapabilities.dashboard).toBe(true);
    expect(creatorCapabilities.ownerPayroll).toBe(true);
    expect(creatorCapabilities.ownerTaxes).toBe(true);
    expect(creatorCapabilities.contractors).toBe(true);
    expect(creatorCapabilities.expenses).toBe(true);
    expect(creatorCapabilities.documents).toBe(true);
    expect(creatorCapabilities.payroll).toBe(false);
    expect(creatorCapabilities.employees).toBe(false);
    expect(creatorCapabilities.benefits).toBe(false);
    expect(creatorCapabilities.contractorOnboarding).toBe(false);
    expect(creatorCapabilities.settings).toBe(false);
  });

  it("blocks direct navigation to hidden creator modules", () => {
    expect(isCapabilityRouteAllowed("creator", "/payroll/run")).toBe(false);
    expect(isCapabilityRouteAllowed("creator", "/payroll/contractors")).toBe(false);
    expect(isCapabilityRouteAllowed("creator", "/employees")).toBe(false);
    expect(isCapabilityRouteAllowed("creator", "/contractors/onboarding")).toBe(false);
    expect(isCapabilityRouteAllowed("creator", "/contractors/payments")).toBe(false);
    expect(isCapabilityRouteAllowed("creator", "/settings/profile")).toBe(false);
    expect(isCapabilityRouteAllowed("creator", "/settings/workspace")).toBe(true);
    expect(getCapabilityRouteRedirect("creator", "/payroll/run")).toBe("/403");
    expect(getCapabilityRouteRedirect("creator", "/payroll/contractors")).toBe("/403");
    expect(getCapabilityRouteRedirect("creator", "/settings/profile")).toBe("/403");
    expect(getCapabilityRouteRedirect("creator", "/settings/workspace")).toBeNull();
  });

  it("allows the simplified creator contractor module without opening the full contractor hub", () => {
    expect(isCapabilityRouteAllowed("creator", "/app/contractors")).toBe(true);
    expect(getCapabilityRouteRedirect("creator", "/app/contractors")).toBeNull();
    expect(getRequiredCapabilityForPath("/app/contractors")).toBe("contractors");
    expect(getRequiredCapabilityForPath("/contractors/payments")).toBe("contractorOnboarding");
  });

  it("keeps company and agency full-shell settings available", () => {
    expect(getCapabilities("company").settings).toBe(true);
    expect(getCapabilities("agency").settings).toBe(true);
    expect(isCapabilityRouteAllowed("company", "/settings/company")).toBe(true);
    expect(isCapabilityRouteAllowed("agency", "/settings/company")).toBe(true);
  });

  it("routes app shell entry through account-type dashboards", () => {
    expect(getCapabilityRouteRedirect("company", "/app")).toBe("/app/dashboard/company");
    expect(getCapabilityRouteRedirect("agency", "/app")).toBe("/app/dashboard/agency");
    expect(getCapabilityRouteRedirect("creator", "/app")).toBe("/app/dashboard/creator");
    expect(getCapabilityRouteRedirect("agency", "/dashboard")).toBe("/app/dashboard/agency");
    expect(getCapabilityRouteRedirect("creator", "/app/dashboard/company")).toBe("/app/dashboard/creator");
    expect(getCapabilityRouteRedirect("company", "/app/dashboard/company")).toBeNull();
    expect(getCapabilityRouteRedirect(null, "/app")).toBe("/app/choose-type");
    expect(getCapabilityRouteRedirect(null, "/app/choose-type")).toBeNull();
    expect(getAccountTypeRouteRedirect(null, "/app")).toBe("/app/choose-type");
    expect(getRequiredCapabilityForPath("/app/dashboard/agency")).toBe("dashboard");
  });

  it("keeps creator-only app routes unavailable to company and agency accounts", () => {
    expect(getRequiredCapabilityForPath("/app/pay-myself")).toBe("ownerPayroll");
    expect(getRequiredCapabilityForPath("/app/taxes")).toBe("ownerTaxes");
    expect(isCapabilityRouteAllowed("company", "/app/pay-myself")).toBe(false);
    expect(isCapabilityRouteAllowed("agency", "/app/taxes")).toBe(false);
  });

  it("allows agency client routes and blocks them for companies", () => {
    expect(isCapabilityRouteAllowed("agency", "/app/clients")).toBe(true);
    expect(isCapabilityRouteAllowed("agency", "/agency/profitability")).toBe(true);
    expect(isCapabilityRouteAllowed("agency", "/settings/agency/clients")).toBe(true);
    expect(isCapabilityRouteAllowed("company", "/app/clients")).toBe(false);
    expect(isCapabilityRouteAllowed("company", "/settings/agency/clients")).toBe(false);
  });
});
