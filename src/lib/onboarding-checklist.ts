import {
  normalizeAccountType,
  normalizeEntityType,
  type AccountType,
  type EntityType,
} from "@/lib/account-types";

export const CHECKLIST_STEP_PREFIX = "checklist:";
export const CHECKLIST_DISMISSED_STEP = "checklist:dismissed";

export type OnboardingChecklistTaskId =
  | "company_verify_business"
  | "company_add_employees"
  | "company_set_pay_schedule"
  | "company_run_first_payroll"
  | "company_setup_benefits"
  | "company_configure_time_tracking"
  | "agency_verify_business"
  | "agency_add_internal_team"
  | "agency_add_client_project"
  | "agency_add_contractors"
  | "agency_set_bill_pay_rates"
  | "agency_run_mixed_payroll"
  | "creator_verify_identity_business"
  | "creator_set_owner_salary"
  | "creator_add_contractors"
  | "creator_run_first_payment"
  | "creator_tax_set_aside";

export type OnboardingChecklistTask = {
  id: OnboardingChecklistTaskId;
  title: string;
  description: string;
  href: string;
};

export type OnboardingChecklistItem = OnboardingChecklistTask & {
  completed: boolean;
};

export type OnboardingChecklistState = {
  accountType: AccountType;
  tasks: OnboardingChecklistItem[];
  completedCount: number;
  totalCount: number;
  percentComplete: number;
  currentTaskId: OnboardingChecklistTaskId | null;
  currentStep: string;
  status: "in_progress" | "complete";
  dismissed: boolean;
};

type ChecklistOptions = {
  entityType?: EntityType | string | null;
  creatorEntityType?: string | null;
};

const COMPANY_TASKS: OnboardingChecklistTask[] = [
  {
    id: "company_verify_business",
    title: "Verify business",
    description: "Confirm legal details, EIN, and work states.",
    href: "/settings/company",
  },
  {
    id: "company_add_employees",
    title: "Add employees",
    description: "Invite or import your team before payroll.",
    href: "/employees/bulk",
  },
  {
    id: "company_set_pay_schedule",
    title: "Set pay schedule",
    description: "Choose frequency, periods, and first pay date.",
    href: "/settings/pay-schedules",
  },
  {
    id: "company_run_first_payroll",
    title: "Run first payroll",
    description: "Review payroll, taxes, and submit your first run.",
    href: "/payroll/run",
  },
  {
    id: "company_setup_benefits",
    title: "Set up benefits",
    description: "Configure benefit plans and enrollment windows.",
    href: "/benefits/plans",
  },
  {
    id: "company_configure_time_tracking",
    title: "Configure time tracking",
    description: "Turn on time rules, approvals, and PTO settings.",
    href: "/time/settings",
  },
];

const AGENCY_TASKS: OnboardingChecklistTask[] = [
  {
    id: "agency_verify_business",
    title: "Verify business",
    description: "Confirm agency identity, EIN, and tax setup.",
    href: "/settings/company",
  },
  {
    id: "agency_add_internal_team",
    title: "Add internal team",
    description: "Invite W-2 staff who run agency operations.",
    href: "/employees/new",
  },
  {
    id: "agency_add_client_project",
    title: "Add a client + project",
    description: "Create your first client workspace and project.",
    href: "/app/clients",
  },
  {
    id: "agency_add_contractors",
    title: "Add contractors",
    description: "Invite contract talent and collect payment details.",
    href: "/app/contractors",
  },
  {
    id: "agency_set_bill_pay_rates",
    title: "Set bill vs pay rates",
    description: "Map worker pay rates to client billing rates.",
    href: "/agency/profitability",
  },
  {
    id: "agency_run_mixed_payroll",
    title: "Run first mixed payroll",
    description: "Submit one run for staff and contractor payments.",
    href: "/payroll/run",
  },
];

const CREATOR_TASKS_BASE: OnboardingChecklistTask[] = [
  {
    id: "creator_verify_identity_business",
    title: "Verify identity/business",
    description: "Confirm your legal name, business name, and state.",
    href: "/settings/profile",
  },
  {
    id: "creator_add_contractors",
    title: "Add contractors",
    description: "Add editors, VAs, designers, or other collaborators.",
    href: "/app/contractors",
  },
  {
    id: "creator_run_first_payment",
    title: "Run first payment",
    description: "Send your first owner or contractor payment.",
    href: "/app/pay-myself",
  },
  {
    id: "creator_tax_set_aside",
    title: "Turn on tax set-aside",
    description: "Create a reserve for quarterly tax payments.",
    href: "/app/taxes",
  },
];

const CREATOR_OWNER_SALARY_TASK: OnboardingChecklistTask = {
  id: "creator_set_owner_salary",
  title: "Set owner salary",
  description: "Add a reasonable-salary target for S-Corp payroll.",
  href: "/app/pay-myself",
};

function isCreatorSCorp(options: ChecklistOptions) {
  const entityType = normalizeEntityType(options.entityType);
  const legacyCreatorEntityType = (options.creatorEntityType ?? "")
    .trim()
    .toLowerCase()
    .replace(/[/-]+/g, "_")
    .replace(/\s+/g, "_");

  return entityType === "s_corp" || legacyCreatorEntityType === "s_corp" || legacyCreatorEntityType === "scorp";
}

export function toChecklistStepId(taskId: OnboardingChecklistTaskId) {
  return `${CHECKLIST_STEP_PREFIX}${taskId}`;
}

function normalizeCompletedChecklistIds(completedSteps: string[], tasks: OnboardingChecklistTask[]) {
  const validTaskIds = new Set(tasks.map((task) => task.id));

  return new Set(
    completedSteps
      .map((step) => step.startsWith(CHECKLIST_STEP_PREFIX) ? step.slice(CHECKLIST_STEP_PREFIX.length) : step)
      .filter((step): step is OnboardingChecklistTaskId => validTaskIds.has(step as OnboardingChecklistTaskId)),
  );
}

export function getOnboardingChecklistTasks(
  accountType?: string | null,
  options: ChecklistOptions = {},
): OnboardingChecklistTask[] {
  const normalizedAccountType = normalizeAccountType(accountType);

  if (normalizedAccountType === "agency") return AGENCY_TASKS;
  if (normalizedAccountType === "creator") {
    const [verifyTask, ...remainingTasks] = CREATOR_TASKS_BASE;
    return isCreatorSCorp(options)
      ? [verifyTask, CREATOR_OWNER_SALARY_TASK, ...remainingTasks]
      : CREATOR_TASKS_BASE;
  }

  return COMPANY_TASKS;
}

export function getOnboardingChecklistState({
  accountType,
  completedSteps = [],
  options = {},
}: {
  accountType?: string | null;
  completedSteps?: string[] | null;
  options?: ChecklistOptions;
}): OnboardingChecklistState {
  const normalizedAccountType = normalizeAccountType(accountType);
  const tasks = getOnboardingChecklistTasks(normalizedAccountType, options);
  const completedIds = normalizeCompletedChecklistIds(completedSteps ?? [], tasks);
  const checklistItems = tasks.map((task) => ({
    ...task,
    completed: completedIds.has(task.id),
  }));
  const completedCount = checklistItems.filter((task) => task.completed).length;
  const totalCount = checklistItems.length;
  const currentTask = checklistItems.find((task) => !task.completed) ?? null;
  const status = totalCount > 0 && completedCount === totalCount ? "complete" : "in_progress";

  return {
    accountType: normalizedAccountType,
    tasks: checklistItems,
    completedCount,
    totalCount,
    percentComplete: totalCount ? Math.round((completedCount / totalCount) * 100) : 100,
    currentTaskId: currentTask?.id ?? null,
    currentStep: currentTask ? toChecklistStepId(currentTask.id) : "complete",
    status,
    dismissed: (completedSteps ?? []).includes(CHECKLIST_DISMISSED_STEP),
  };
}

export function buildInitialOnboardingChecklistProgress(
  accountType: string | null | undefined,
  options: ChecklistOptions = {},
  preservedCompletedSteps: string[] = [],
) {
  const state = getOnboardingChecklistState({
    accountType,
    completedSteps: preservedCompletedSteps,
    options,
  });

  return {
    currentStep: state.currentStep,
    completedSteps: Array.from(new Set(preservedCompletedSteps)),
    status: state.status,
  };
}

