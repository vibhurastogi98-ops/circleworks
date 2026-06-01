import { describe, expect, it } from "vitest";

import {
  CHECKLIST_DISMISSED_STEP,
  getOnboardingChecklistState,
  getOnboardingChecklistTasks,
  toChecklistStepId,
} from "@/lib/onboarding-checklist";

describe("post-signup onboarding checklist", () => {
  it("builds company tasks in the requested order", () => {
    expect(getOnboardingChecklistTasks("company").map((task) => task.title)).toEqual([
      "Verify business",
      "Add employees",
      "Set pay schedule",
      "Run first payroll",
      "Set up benefits",
      "Configure time tracking",
    ]);
  });

  it("builds agency tasks in the requested order", () => {
    expect(getOnboardingChecklistTasks("agency").map((task) => task.title)).toEqual([
      "Verify business",
      "Add internal team",
      "Add a client + project",
      "Add contractors",
      "Set bill vs pay rates",
      "Run first mixed payroll",
    ]);
  });

  it("only adds the owner salary task for S-Corp creators", () => {
    expect(getOnboardingChecklistTasks("creator", { entityType: "sole_prop" }).map((task) => task.id)).not.toContain(
      "creator_set_owner_salary",
    );

    expect(getOnboardingChecklistTasks("creator", { entityType: "s_corp" }).map((task) => task.id)).toEqual([
      "creator_verify_identity_business",
      "creator_set_owner_salary",
      "creator_add_contractors",
      "creator_run_first_payment",
      "creator_tax_set_aside",
    ]);
  });

  it("derives completion percentage and next resume task from persisted progress", () => {
    const state = getOnboardingChecklistState({
      accountType: "company",
      completedSteps: [
        "account_type",
        toChecklistStepId("company_verify_business"),
        toChecklistStepId("company_add_employees"),
      ],
    });

    expect(state.completedCount).toBe(2);
    expect(state.percentComplete).toBe(33);
    expect(state.currentTaskId).toBe("company_set_pay_schedule");
    expect(state.currentStep).toBe(toChecklistStepId("company_set_pay_schedule"));
    expect(state.status).toBe("in_progress");
  });

  it("tracks dismissal separately from task completion", () => {
    const state = getOnboardingChecklistState({
      accountType: "creator",
      completedSteps: [CHECKLIST_DISMISSED_STEP],
    });

    expect(state.dismissed).toBe(true);
    expect(state.percentComplete).toBe(0);
    expect(state.status).toBe("in_progress");
  });
});

