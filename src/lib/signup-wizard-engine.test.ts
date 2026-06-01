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
      "business_details",
      "admin_account",
      "bank_funding",
      "tax_setup",
      "pay_schedule",
      "invite_employees",
      "review_finish",
      "complete",
    ]);
    expect(getWizardStepIds("agency")).toEqual([
      "account_type",
      "agency_details",
      "admin_account",
      "bank_funding",
      "tax_setup",
      "first_client",
      "pay_schedules",
      "review_finish",
      "complete",
    ]);
    expect(getWizardStepIds("creator")).toEqual([
      "account_type",
      "credentials",
      "creator_profile",
      "creator_identity",
      "bank_funding",
      "review_finish",
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
      currentStep: "review_finish",
    });
    const next = completeWizardStep(progress);

    expect(next.currentStep).toBe("complete");
    expect(next.status).toBe("complete");
    expect(next.completedSteps).toContain("review_finish");
  });

  it("returns the account capability matrix", () => {
    expect(getCapabilities("agency").clients).toBe(true);
    expect(getCapabilities("company").clients).toBe(false);
    expect(getCapabilities("creator").employees).toBe(false);
    expect(getCapabilities("creator").ownerPayroll).toBe(true);
  });
});
