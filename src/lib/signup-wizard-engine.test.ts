import { describe, expect, it } from "vitest";

import { getCapabilities } from "@/lib/capabilities";
import { normalizeAccountType, normalizeEntityType } from "@/lib/account-types";
import {
  completeWizardStep,
  getWizardStepIds,
  resolveWizardState,
} from "@/lib/signup-wizard-engine";

describe("account type foundation", () => {
  it("normalizes legacy signup aliases to canonical enum values", () => {
    expect(normalizeAccountType("creator_solo")).toBe("creator");
    expect(normalizeAccountType("creator-solo")).toBe("creator");
    expect(normalizeEntityType("sole-prop")).toBe("sole_prop");
    expect(normalizeEntityType("s-corp")).toBe("s_corp");
    expect(normalizeEntityType("llc")).toBe("smllc");
  });

  it("uses account-specific wizard step sequences", () => {
    expect(getWizardStepIds("company")).toEqual([
      "account_type",
      "credentials",
      "company_profile",
      "payroll_setup",
      "first_employee",
      "complete",
    ]);
    expect(getWizardStepIds("agency")).toContain("agency_profile");
    expect(getWizardStepIds("creator")).toEqual([
      "account_type",
      "credentials",
      "creator_profile",
      "complete",
    ]);
  });

  it("resumes numeric progress from the current signup endpoint payload", () => {
    const progress = resolveWizardState({
      accountType: "creator_solo",
      stepIndex: 2,
    });

    expect(progress).toEqual({
      accountType: "creator",
      currentStep: "creator_profile",
      completedSteps: ["account_type", "credentials"],
      status: "in_progress",
    });
  });

  it("advances to complete when the terminal step is reached", () => {
    const progress = resolveWizardState({
      accountType: "company",
      currentStep: "first_employee",
    });
    const next = completeWizardStep(progress);

    expect(next.currentStep).toBe("complete");
    expect(next.status).toBe("complete");
    expect(next.completedSteps).toContain("first_employee");
  });

  it("returns the account capability matrix", () => {
    expect(getCapabilities("agency").clients).toBe(true);
    expect(getCapabilities("company").clients).toBe(false);
    expect(getCapabilities("creator").employees).toBe(false);
    expect(getCapabilities("creator").ownerPayroll).toBe(true);
  });
});
