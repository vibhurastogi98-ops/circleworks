import { normalizeAccountType, type AccountType } from "@/lib/account-types";

export const ONBOARDING_PROGRESS_STATUSES = ["in_progress", "complete"] as const;
export type OnboardingProgressStatus = (typeof ONBOARDING_PROGRESS_STATUSES)[number];

export type WizardStepId =
  | "account_type"
  | "credentials"
  | "business_details"
  | "admin_account"
  | "bank_funding"
  | "tax_setup"
  | "pay_schedule"
  | "invite_employees"
  | "review_finish"
  | "company_profile"
  | "agency_profile"
  | "agency_details"
  | "payroll_setup"
  | "first_employee"
  | "first_client"
  | "pay_schedules"
  | "creator_profile"
  | "complete";

export type WizardStep = {
  id: WizardStepId;
  title: string;
  detail: string;
  skippable?: boolean;
  terminal?: boolean;
};

export type WizardProgressState = {
  accountType: AccountType;
  currentStep: WizardStepId;
  completedSteps: WizardStepId[];
  status: OnboardingProgressStatus;
};

export const SIGNUP_WIZARD_STEPS = {
  company: [
    { id: "account_type", title: "Type", detail: "Choose workspace" },
    { id: "business_details", title: "Business", detail: "Company details" },
    { id: "admin_account", title: "Admin", detail: "Owner account" },
    { id: "bank_funding", title: "Bank", detail: "Funding source" },
    { id: "tax_setup", title: "Taxes", detail: "Federal & state" },
    { id: "pay_schedule", title: "Schedule", detail: "Pay calendar" },
    { id: "invite_employees", title: "Invite", detail: "Employees", skippable: true },
    { id: "review_finish", title: "Review", detail: "Finish setup" },
    { id: "complete", title: "Ready", detail: "Company dashboard", terminal: true },
  ],
  agency: [
    { id: "account_type", title: "Type", detail: "Choose workspace" },
    { id: "agency_details", title: "Agency", detail: "Agency details" },
    { id: "admin_account", title: "Admin", detail: "Owner account" },
    { id: "bank_funding", title: "Bank", detail: "Funding source" },
    { id: "tax_setup", title: "Taxes", detail: "Federal & state" },
    { id: "first_client", title: "Client", detail: "First project", skippable: true },
    { id: "pay_schedules", title: "Schedules", detail: "Worker pay" },
    { id: "review_finish", title: "Review", detail: "Finish setup" },
    { id: "complete", title: "Ready", detail: "Agency dashboard", terminal: true },
  ],
  creator: [
    { id: "account_type", title: "Type", detail: "Choose workspace" },
    { id: "credentials", title: "Account", detail: "Create login" },
    { id: "creator_profile", title: "Creator", detail: "Entity setup" },
    { id: "complete", title: "Ready", detail: "Launch CircleWorks", terminal: true },
  ],
} as const satisfies Record<AccountType, readonly WizardStep[]>;

function uniqueSteps(steps: WizardStepId[]) {
  return Array.from(new Set(steps));
}

export function getWizardSteps(accountType?: string | null): readonly WizardStep[] {
  return SIGNUP_WIZARD_STEPS[normalizeAccountType(accountType)];
}

export function getWizardStepIds(accountType?: string | null): WizardStepId[] {
  return getWizardSteps(accountType).map((step) => step.id);
}

export function isWizardStepId(accountType: string | null | undefined, value: unknown): value is WizardStepId {
  return typeof value === "string" && getWizardStepIds(accountType).includes(value as WizardStepId);
}

export function getWizardStepByIndex(accountType: string | null | undefined, index: number) {
  const steps = getWizardSteps(accountType);
  return steps[Math.max(0, Math.min(index, steps.length - 1))];
}

export function getWizardStepIndex(accountType: string | null | undefined, stepId: string) {
  return getWizardStepIds(accountType).indexOf(stepId as WizardStepId);
}

export function getInitialWizardState(accountType?: string | null): WizardProgressState {
  const normalizedAccountType = normalizeAccountType(accountType);
  const firstStep = SIGNUP_WIZARD_STEPS[normalizedAccountType][0];

  return {
    accountType: normalizedAccountType,
    currentStep: firstStep.id,
    completedSteps: [],
    status: "in_progress",
  };
}

export function getCompletedStepsBefore(accountType: string | null | undefined, currentStep: WizardStepId) {
  const stepIds = getWizardStepIds(accountType);
  const currentIndex = stepIds.indexOf(currentStep);
  return currentIndex > 0 ? stepIds.slice(0, currentIndex) : [];
}

export function normalizeCompletedSteps(
  accountType: string | null | undefined,
  completedSteps: unknown,
  currentStep?: WizardStepId,
) {
  const validStepIds = new Set(getWizardStepIds(accountType));
  const fromInput = Array.isArray(completedSteps)
    ? completedSteps.filter((step): step is WizardStepId => typeof step === "string" && validStepIds.has(step as WizardStepId))
    : [];

  const inferred = currentStep ? getCompletedStepsBefore(accountType, currentStep) : [];
  return uniqueSteps([...inferred, ...fromInput]).filter((step) => step !== "complete");
}

export function resolveWizardState(input: {
  accountType?: string | null;
  currentStep?: string | null;
  stepIndex?: number | null;
  completedSteps?: unknown;
  status?: string | null;
}): WizardProgressState {
  const accountType = normalizeAccountType(input.accountType);
  const indexedStep =
    typeof input.stepIndex === "number" && Number.isInteger(input.stepIndex)
      ? getWizardStepByIndex(accountType, input.stepIndex)
      : null;
  const currentStep =
    input.currentStep && isWizardStepId(accountType, input.currentStep)
      ? input.currentStep
      : indexedStep?.id ?? getInitialWizardState(accountType).currentStep;
  const step = getWizardSteps(accountType).find((candidate) => candidate.id === currentStep);
  const completedSteps = normalizeCompletedSteps(accountType, input.completedSteps, currentStep);
  const status =
    input.status === "complete" || step?.terminal
      ? "complete"
      : "in_progress";

  return {
    accountType,
    currentStep,
    completedSteps,
    status,
  };
}

export function completeWizardStep(
  progress: WizardProgressState,
  completedStep: WizardStepId = progress.currentStep,
): WizardProgressState {
  const steps = getWizardSteps(progress.accountType);
  const stepIds = steps.map((step) => step.id);
  const completedIndex = stepIds.indexOf(completedStep);

  if (completedIndex === -1) {
    return progress;
  }

  const nextStep = steps[completedIndex + 1] ?? steps[completedIndex];
  const completedSteps = normalizeCompletedSteps(
    progress.accountType,
    [...progress.completedSteps, completedStep],
    nextStep.id,
  );

  return {
    accountType: progress.accountType,
    currentStep: nextStep.id,
    completedSteps,
    status: nextStep.terminal ? "complete" : "in_progress",
  };
}
