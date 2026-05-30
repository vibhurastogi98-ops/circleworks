import type { Edge, Node } from "@xyflow/react";

import type { WorkflowNodeData } from "@/data/mockWorkflows";

export type AutomationCategory =
  | "Onboarding"
  | "Offboarding"
  | "Payroll"
  | "Compliance"
  | "Hiring"
  | "Benefits"
  | "Time";

export type AutomationStatus = "Active" | "Paused" | "Draft";

export type AutomationTriggerType = "event" | "schedule" | "webhook";

export interface AutomationRecipe {
  id: string;
  title: string;
  description: string;
  category: AutomationCategory;
  trigger: string;
  triggerType: AutomationTriggerType;
  status: AutomationStatus;
  lastRun: string;
  runCount: number;
  runsThisMonth: number;
  timeSavedHours: number;
  errors: number;
  owner: string;
  mine: boolean;
  template: boolean;
  steps: string[];
  nodes: Node<WorkflowNodeData>[];
  edges: Edge[];
}

export type AutomationRunStatus = "Queued" | "Running" | "Success" | "Failed" | "Skipped";

export interface AutomationRunStep {
  id: string;
  label: string;
  type: string;
  status: AutomationRunStatus;
  durationMs: number;
  dataPassed: Record<string, unknown>;
  message?: string;
}

export interface AutomationRunRecord {
  id: string;
  automationId: string;
  timestamp: string;
  trigger: string;
  status: AutomationRunStatus;
  durationMs: number;
  affectedEntity: string;
  errorMessage?: string | null;
  stepResults: AutomationRunStep[];
}

export const AUTOMATION_CATEGORIES: AutomationCategory[] = [
  "Onboarding",
  "Offboarding",
  "Payroll",
  "Compliance",
  "Hiring",
  "Benefits",
  "Time",
];

export const EVENT_TRIGGERS = [
  "Employee Hired",
  "Employee Terminated",
  "Payroll Submitted",
  "Payroll Completed",
  "PTO Requested",
  "Expense Submitted",
  "Candidate Applied",
  "Offer Accepted",
  "I-9 Expiring",
  "Time Overdue",
];

export const SCHEDULE_TRIGGERS = ["Daily", "Weekly", "Monthly", "Custom CRON"];
export const WEBHOOK_TRIGGER = "Webhook POST";

export const ACTION_LIBRARY = [
  { id: "email", label: "Send Email", description: "Template picker, recipients, and variables." },
  { id: "slack", label: "Send Slack", description: "Channel and message template." },
  { id: "task", label: "Create Task", description: "Assignee, due date, and description." },
  { id: "update", label: "Update Employee Field", description: "Field select and new value." },
  { id: "notification", label: "Send Notification", description: "In-app notification to role or user." },
  { id: "http", label: "HTTP Request", description: "POST to an external webhook." },
  { id: "delay", label: "Wait / Delay", description: "Wait hours or days before continuing." },
  { id: "loop", label: "Loop", description: "Run nested steps for matching employees." },
] as const;

const position = (x: number, y: number) => ({ x, y });

function actionTypeFromStep(step: string) {
  const normalized = step.toLowerCase();
  if (normalized.includes("slack")) return "slack";
  if (normalized.includes("email") || normalized.includes("reminder")) return "email";
  if (normalized.includes("task") || normalized.includes("checkin") || normalized.includes("check-in")) return "task";
  if (normalized.includes("quickbooks") || normalized.includes("webhook") || normalized.includes("http")) return "http";
  if (normalized.includes("wait") || normalized.includes("delay")) return "delay";
  if (normalized.includes("loop") || normalized.includes("for each")) return "loop";
  if (normalized.includes("notification") || normalized.includes("notify")) return "notification";
  if (normalized.includes("update")) return "update";
  return "task";
}

function buildNodes(trigger: string, steps: string[], condition?: string): Node<WorkflowNodeData>[] {
  const nodes: Node<WorkflowNodeData>[] = [
    {
      id: "trigger-1",
      type: "trigger",
      position: position(80, 170),
      data: { label: trigger, triggerEvent: trigger },
    },
  ];

  if (condition) {
    nodes.push({
      id: "condition-1",
      type: "condition",
      position: position(370, 170),
      data: {
        label: condition,
        conditionLogic: "AND",
        field: condition.includes("PTO") ? "pto.days_requested" : "employee.department",
        operator: condition.includes("<") ? "less_than" : "equals",
        value: condition.includes("<3") ? "3" : "Engineering",
      },
    });
  }

  steps.forEach((step, index) => {
    nodes.push({
      id: `action-${index + 1}`,
      type: "action",
      position: position((condition ? 680 : 370) + index * 280, 170 + (index % 2) * 120),
      data: {
        label: step,
        actionType: actionTypeFromStep(step),
        template: step.includes("email") || step.includes("reminder") ? "Standard HR template" : undefined,
        recipients: step.includes("manager") ? "manager" : step.includes("HR") ? "role:hr" : "employee",
        channel: step.includes("Slack") ? "#people-ops" : undefined,
        message: step.includes("Slack") ? "{{automation.title}} ran for {{employee.full_name}}" : undefined,
        dueOffset: step.includes("check") || step.includes("task") ? "+3 days" : undefined,
        url: step.includes("QuickBooks") || step.includes("webhook") ? "https://api.example.com/webhooks/circleworks" : undefined,
        payload: step.includes("QuickBooks") || step.includes("webhook") ? '{"employeeId":"{{employee.id}}"}' : undefined,
      },
    });
  });

  return nodes;
}

function buildEdges(stepCount: number, hasCondition: boolean): Edge[] {
  if (hasCondition) {
    return [
      { id: "e-trigger-condition", source: "trigger-1", target: "condition-1", animated: true },
      { id: "e-condition-action-1", source: "condition-1", sourceHandle: "true", target: "action-1", label: "THEN" },
      ...Array.from({ length: Math.max(0, stepCount - 1) }, (_, index) => ({
        id: `e-action-${index + 1}-${index + 2}`,
        source: `action-${index + 1}`,
        target: `action-${index + 2}`,
      })),
    ];
  }

  return Array.from({ length: stepCount }, (_, index) => ({
    id: index === 0 ? "e-trigger-action-1" : `e-action-${index}-${index + 1}`,
    source: index === 0 ? "trigger-1" : `action-${index}`,
    target: `action-${index + 1}`,
    animated: index === 0,
  }));
}

function recipe(input: Omit<AutomationRecipe, "nodes" | "edges"> & { condition?: string }): AutomationRecipe {
  const nodes = buildNodes(input.trigger, input.steps, input.condition);
  const edges = buildEdges(input.steps.length, Boolean(input.condition));
  const { condition: _condition, ...base } = input;
  return { ...base, nodes, edges };
}

export const AUTOMATION_TEMPLATES: AutomationRecipe[] = [
  recipe({
    id: "template-new-hire-it",
    title: "New hire IT setup + welcome sequence",
    description: "When employee is hired, assign IT equipment, create accounts, send welcome email, and schedule 30-60-90 checkins.",
    category: "Onboarding",
    trigger: "Employee Hired",
    triggerType: "event",
    status: "Draft",
    lastRun: "Never",
    runCount: 0,
    runsThisMonth: 0,
    timeSavedHours: 0,
    errors: 0,
    owner: "CircleWorks",
    mine: false,
    template: true,
    steps: ["Assign IT equipment", "Create SaaS accounts", "Send welcome email", "Schedule 30-60-90 checkins"],
  }),
  recipe({ id: "template-payroll-finance-sync", title: "Payroll submitted finance sync", description: "When payroll is submitted, notify Finance Slack channel and update QuickBooks.", category: "Payroll", trigger: "Payroll Submitted", triggerType: "event", status: "Draft", lastRun: "Never", runCount: 0, runsThisMonth: 0, timeSavedHours: 0, errors: 0, owner: "CircleWorks", mine: false, template: true, steps: ["Send Slack to #finance", "HTTP Request update QuickBooks", "Create approval task"] }),
  recipe({ id: "template-i9-expiring-30", title: "I-9 expires in 30 days", description: "Notify HR and send a reminder to the employee when I-9 documentation expires soon.", category: "Compliance", trigger: "I-9 Expiring", triggerType: "event", status: "Draft", lastRun: "Never", runCount: 0, runsThisMonth: 0, timeSavedHours: 0, errors: 0, owner: "CircleWorks", mine: false, template: true, steps: ["Send notification to HR", "Send reminder email to employee", "Create I-9 review task"] }),
  recipe({ id: "template-pto-coverage-auto-approve", title: "PTO coverage + auto-approve", description: "When PTO is requested, notify manager, check coverage, and auto-approve if under 3 days with sufficient balance.", category: "Time", trigger: "PTO Requested", triggerType: "event", status: "Draft", lastRun: "Never", runCount: 0, runsThisMonth: 0, timeSavedHours: 0, errors: 0, owner: "CircleWorks", mine: false, template: true, condition: "IF PTO days <3 and balance sufficient", steps: ["Send notification to manager", "HTTP Request check coverage", "Update PTO request approved"] }),
  recipe({ id: "template-offboarding-access", title: "Offboarding access removal", description: "Close accounts, alert payroll, and schedule asset recovery when an employee is terminated.", category: "Offboarding", trigger: "Employee Terminated", triggerType: "event", status: "Draft", lastRun: "Never", runCount: 0, runsThisMonth: 0, timeSavedHours: 0, errors: 0, owner: "CircleWorks", mine: false, template: true, steps: ["Create access removal task", "Send Slack to IT", "Create asset recovery task", "Send final pay notification"] }),
  recipe({ id: "template-cobra-notice", title: "COBRA notice follow-up", description: "Wait 14 days after termination, then send COBRA notice and log compliance proof.", category: "Benefits", trigger: "Employee Terminated", triggerType: "event", status: "Draft", lastRun: "Never", runCount: 0, runsThisMonth: 0, timeSavedHours: 0, errors: 0, owner: "CircleWorks", mine: false, template: true, steps: ["Wait 14 days", "Send COBRA notice email", "Create compliance audit task"] }),
  recipe({ id: "template-candidate-applied", title: "Candidate applied screen", description: "Route new applicants to recruiters, create screening task, and notify hiring manager.", category: "Hiring", trigger: "Candidate Applied", triggerType: "event", status: "Draft", lastRun: "Never", runCount: 0, runsThisMonth: 0, timeSavedHours: 0, errors: 0, owner: "CircleWorks", mine: false, template: true, steps: ["Create recruiter screen task", "Send notification to hiring manager", "Send Slack to #recruiting"] }),
  recipe({ id: "template-offer-accepted", title: "Offer accepted to onboarding", description: "Move accepted offers into onboarding and send pre-hire documents.", category: "Hiring", trigger: "Offer Accepted", triggerType: "event", status: "Draft", lastRun: "Never", runCount: 0, runsThisMonth: 0, timeSavedHours: 0, errors: 0, owner: "CircleWorks", mine: false, template: true, steps: ["Update candidate stage to hired", "Send prehire email", "Create onboarding checklist"] }),
  recipe({ id: "template-timesheet-overdue", title: "Overdue timesheet escalation", description: "Notify employee, manager, and payroll when time is overdue.", category: "Time", trigger: "Time Overdue", triggerType: "event", status: "Draft", lastRun: "Never", runCount: 0, runsThisMonth: 0, timeSavedHours: 0, errors: 0, owner: "CircleWorks", mine: false, template: true, steps: ["Send reminder email to employee", "Wait 4 hours", "Send notification to manager", "Send Slack to payroll"] }),
  recipe({ id: "template-expense-policy", title: "Expense over-policy review", description: "Route high-risk expense reports for manager review and finance audit.", category: "Payroll", trigger: "Expense Submitted", triggerType: "event", status: "Draft", lastRun: "Never", runCount: 0, runsThisMonth: 0, timeSavedHours: 0, errors: 0, owner: "CircleWorks", mine: false, template: true, condition: "IF expense.amount greater_than policy limit", steps: ["Create manager review task", "Send notification to Finance", "HTTP Request sync receipt"] }),
  recipe({ id: "template-benefits-open", title: "Open enrollment nudges", description: "Send benefit enrollment reminders until employees complete elections.", category: "Benefits", trigger: "Weekly", triggerType: "schedule", status: "Draft", lastRun: "Never", runCount: 0, runsThisMonth: 0, timeSavedHours: 0, errors: 0, owner: "CircleWorks", mine: false, template: true, steps: ["Loop for each incomplete employee", "Send reminder email", "Send notification to employee"] }),
  recipe({ id: "template-payroll-completed", title: "Payroll completed announcements", description: "When payroll completes, notify employees and export reports.", category: "Payroll", trigger: "Payroll Completed", triggerType: "event", status: "Draft", lastRun: "Never", runCount: 0, runsThisMonth: 0, timeSavedHours: 0, errors: 0, owner: "CircleWorks", mine: false, template: true, steps: ["Send notification to employees", "HTTP Request export payroll report", "Send Slack to Finance"] }),
  recipe({ id: "template-new-hire-benefits", title: "New hire benefits enrollment", description: "Create benefit enrollment task and remind employee before deadline.", category: "Benefits", trigger: "Employee Hired", triggerType: "event", status: "Draft", lastRun: "Never", runCount: 0, runsThisMonth: 0, timeSavedHours: 0, errors: 0, owner: "CircleWorks", mine: false, template: true, steps: ["Create benefits enrollment task", "Wait 5 days", "Send enrollment reminder email"] }),
  recipe({ id: "template-equipment-webhook", title: "External IT ticket webhook", description: "Receive a webhook and create employee equipment tasks.", category: "Onboarding", trigger: WEBHOOK_TRIGGER, triggerType: "webhook", status: "Draft", lastRun: "Never", runCount: 0, runsThisMonth: 0, timeSavedHours: 0, errors: 0, owner: "CircleWorks", mine: false, template: true, steps: ["HTTP Request validate payload", "Create IT equipment task", "Send Slack to IT"] }),
  recipe({ id: "template-daily-new-hire-digest", title: "Daily new hire digest", description: "Send a daily digest of upcoming starts to People Ops.", category: "Onboarding", trigger: "Daily", triggerType: "schedule", status: "Draft", lastRun: "Never", runCount: 0, runsThisMonth: 0, timeSavedHours: 0, errors: 0, owner: "CircleWorks", mine: false, template: true, steps: ["Loop for each upcoming starter", "Send Slack to People Ops", "Create manager prep task"] }),
  recipe({ id: "template-monthly-cert-audit", title: "Monthly certification audit", description: "Find expiring certifications and create manager review tasks.", category: "Compliance", trigger: "Monthly", triggerType: "schedule", status: "Draft", lastRun: "Never", runCount: 0, runsThisMonth: 0, timeSavedHours: 0, errors: 0, owner: "CircleWorks", mine: false, template: true, steps: ["Loop for each expiring certification", "Create compliance task", "Send manager notification"] }),
  recipe({ id: "template-pay-band-change", title: "Pay band change alert", description: "Notify HR when employee compensation or department changes.", category: "Compliance", trigger: "Employee Hired", triggerType: "event", status: "Draft", lastRun: "Never", runCount: 0, runsThisMonth: 0, timeSavedHours: 0, errors: 0, owner: "CircleWorks", mine: false, template: true, condition: "IF employee.department equals Engineering", steps: ["Send Slack to compensation team", "Create pay band review task"] }),
  recipe({ id: "template-onboarding-day1", title: "Day 1 approaching checklist", description: "Two days before start date, verify accounts and manager welcome plan.", category: "Onboarding", trigger: "Daily", triggerType: "schedule", status: "Draft", lastRun: "Never", runCount: 0, runsThisMonth: 0, timeSavedHours: 0, errors: 0, owner: "CircleWorks", mine: false, template: true, steps: ["Loop for each starter in 2 days", "Create manager welcome task", "Send notification to IT"] }),
  recipe({ id: "template-manager-change", title: "Manager change notifications", description: "Notify old and new managers when reporting lines change.", category: "Onboarding", trigger: "Employee Hired", triggerType: "event", status: "Draft", lastRun: "Never", runCount: 0, runsThisMonth: 0, timeSavedHours: 0, errors: 0, owner: "CircleWorks", mine: false, template: true, steps: ["Send notification to new manager", "Send Slack to People Ops", "Update employee field manager_confirmed"] }),
  recipe({ id: "template-termination-final-pay", title: "Termination final pay workflow", description: "Create final pay review and notify payroll before termination date.", category: "Offboarding", trigger: "Employee Terminated", triggerType: "event", status: "Draft", lastRun: "Never", runCount: 0, runsThisMonth: 0, timeSavedHours: 0, errors: 0, owner: "CircleWorks", mine: false, template: true, steps: ["Create final pay task", "Send notification to payroll", "HTTP Request lock payroll changes"] }),
  recipe({ id: "template-pto-blackout", title: "PTO blackout date guardrail", description: "Check PTO requests against blackout dates before routing.", category: "Time", trigger: "PTO Requested", triggerType: "event", status: "Draft", lastRun: "Never", runCount: 0, runsThisMonth: 0, timeSavedHours: 0, errors: 0, owner: "CircleWorks", mine: false, template: true, condition: "IF pto.overlaps_blackout equals true", steps: ["Send notification to manager", "Send email to employee", "Update PTO request needs_review"] }),
  recipe({ id: "template-weekly-overtime", title: "Weekly overtime threshold alert", description: "Notify managers when employees are approaching overtime.", category: "Time", trigger: "Weekly", triggerType: "schedule", status: "Draft", lastRun: "Never", runCount: 0, runsThisMonth: 0, timeSavedHours: 0, errors: 0, owner: "CircleWorks", mine: false, template: true, steps: ["Loop for each employee over 36 hours", "Send notification to manager", "Send Slack to scheduling"] }),
  recipe({ id: "template-new-job-posted", title: "New job posted distribution", description: "Post new roles to recruiting Slack and create interview plan task.", category: "Hiring", trigger: "Candidate Applied", triggerType: "event", status: "Draft", lastRun: "Never", runCount: 0, runsThisMonth: 0, timeSavedHours: 0, errors: 0, owner: "CircleWorks", mine: false, template: true, steps: ["Send Slack to recruiting", "Create interview plan task", "Send notification to hiring manager"] }),
  recipe({ id: "template-aca-monthly", title: "ACA monthly review", description: "Run monthly ACA eligibility checks and notify benefits admin.", category: "Compliance", trigger: "Monthly", triggerType: "schedule", status: "Draft", lastRun: "Never", runCount: 0, runsThisMonth: 0, timeSavedHours: 0, errors: 0, owner: "CircleWorks", mine: false, template: true, steps: ["Loop for each eligible employee", "Create ACA review task", "Send notification to benefits admin"] }),
  recipe({ id: "template-webhook-background-check", title: "Background check webhook", description: "Receive background check completion and update candidate status.", category: "Hiring", trigger: WEBHOOK_TRIGGER, triggerType: "webhook", status: "Draft", lastRun: "Never", runCount: 0, runsThisMonth: 0, timeSavedHours: 0, errors: 0, owner: "CircleWorks", mine: false, template: true, steps: ["HTTP Request verify signature", "Update candidate field background_check_status", "Send notification to recruiter"] }),
];

export const ACTIVE_AUTOMATIONS: AutomationRecipe[] = [
  recipe({ id: "automation-new-hire-it", title: "New hire IT setup", description: "Provision equipment and access for every new hire.", category: "Onboarding", trigger: "Employee Hired", triggerType: "event", status: "Active", lastRun: "2 hours ago", runCount: 184, runsThisMonth: 28, timeSavedHours: 42, errors: 0, owner: "Vibhu Rastogi", mine: true, template: false, steps: ["Assign IT equipment", "Send Slack to IT", "HTTP Request provisioning webhook"] }),
  recipe({ id: "automation-pto-auto-approve", title: "PTO auto-approval under 3 days", description: "Approves low-risk PTO requests after manager coverage check.", category: "Time", trigger: "PTO Requested", triggerType: "event", status: "Active", lastRun: "Today 09:12", runCount: 73, runsThisMonth: 19, timeSavedHours: 16, errors: 1, owner: "Vibhu Rastogi", mine: true, template: false, condition: "IF PTO days <3 and balance sufficient", steps: ["Send notification to manager", "HTTP Request check coverage", "Update PTO request approved"] }),
  recipe({ id: "automation-i9-reminder", title: "I-9 30-day expiration reminder", description: "Escalates expiring I-9 documents to HR and employees.", category: "Compliance", trigger: "I-9 Expiring", triggerType: "event", status: "Active", lastRun: "Yesterday", runCount: 41, runsThisMonth: 7, timeSavedHours: 9, errors: 0, owner: "People Ops", mine: false, template: false, steps: ["Send notification to HR", "Send reminder email to employee", "Create I-9 review task"] }),
  recipe({ id: "automation-payroll-finance", title: "Payroll submitted finance sync", description: "Notifies Finance and updates QuickBooks on payroll submit.", category: "Payroll", trigger: "Payroll Submitted", triggerType: "event", status: "Paused", lastRun: "May 24, 2026", runCount: 38, runsThisMonth: 4, timeSavedHours: 11, errors: 2, owner: "Finance", mine: false, template: false, steps: ["Send Slack to #finance", "HTTP Request update QuickBooks", "Create approval task"] }),
  recipe({ id: "automation-offboarding-access", title: "Offboarding access removal", description: "Creates access removal and asset recovery tasks.", category: "Offboarding", trigger: "Employee Terminated", triggerType: "event", status: "Active", lastRun: "May 28, 2026", runCount: 22, runsThisMonth: 3, timeSavedHours: 14, errors: 0, owner: "IT Ops", mine: false, template: false, steps: ["Create access removal task", "Send Slack to IT", "Create asset recovery task"] }),
];

export const ALL_AUTOMATION_RECIPES = [...ACTIVE_AUTOMATIONS, ...AUTOMATION_TEMPLATES];

function mockSteps(recipeItem: AutomationRecipe, status: AutomationRunStatus): AutomationRunStep[] {
  return recipeItem.nodes.map((node, index) => ({
    id: node.id,
    label: typeof node.data.label === "string" ? node.data.label : `Step ${index + 1}`,
    type: node.type ?? "action",
    status: status === "Failed" && index === Math.min(2, recipeItem.nodes.length - 1) ? "Failed" : status === "Skipped" && index > 0 ? "Skipped" : "Success",
    durationMs: 160 + index * 90,
    dataPassed: {
      automationId: recipeItem.id,
      trigger: recipeItem.trigger,
      stepIndex: index + 1,
      entity: index % 2 === 0 ? "Maya Patel" : "Avery Johnson",
    },
    message:
      status === "Failed" && index === Math.min(2, recipeItem.nodes.length - 1)
        ? "External action returned 500 and queued an admin alert."
        : "Step completed with expected data.",
  }));
}

export const MOCK_AUTOMATION_RUNS: Record<string, AutomationRunRecord[]> = Object.fromEntries(
  ACTIVE_AUTOMATIONS.map((recipeItem, recipeIndex) => [
    recipeItem.id,
    [
      {
        id: `${recipeItem.id}-run-1`,
        automationId: recipeItem.id,
        timestamp: "2026-05-29T14:12:00.000Z",
        trigger: recipeItem.trigger,
        status: recipeItem.errors > 0 ? "Failed" : "Success",
        durationMs: 2200 + recipeIndex * 260,
        affectedEntity: recipeIndex % 2 === 0 ? "Maya Patel" : "Noah Kim",
        errorMessage: recipeItem.errors > 0 ? "Coverage API failed after retry window." : null,
        stepResults: mockSteps(recipeItem, recipeItem.errors > 0 ? "Failed" : "Success"),
      },
      {
        id: `${recipeItem.id}-run-2`,
        automationId: recipeItem.id,
        timestamp: "2026-05-28T18:35:00.000Z",
        trigger: recipeItem.trigger,
        status: "Success",
        durationMs: 1840 + recipeIndex * 180,
        affectedEntity: recipeIndex % 2 === 0 ? "Elena Ruiz" : "Chris Wong",
        errorMessage: null,
        stepResults: mockSteps(recipeItem, "Success"),
      },
      {
        id: `${recipeItem.id}-run-3`,
        automationId: recipeItem.id,
        timestamp: "2026-05-27T09:02:00.000Z",
        trigger: recipeItem.trigger,
        status: recipeItem.category === "Compliance" ? "Skipped" : "Success",
        durationMs: 1200 + recipeIndex * 120,
        affectedEntity: recipeItem.category === "Compliance" ? "No matching expiring document" : "Priya Shah",
        errorMessage: null,
        stepResults: mockSteps(recipeItem, recipeItem.category === "Compliance" ? "Skipped" : "Success"),
      },
    ],
  ]),
);

export function findAutomationRecipe(id?: string | null) {
  if (!id) return null;
  return ALL_AUTOMATION_RECIPES.find((recipeItem) => recipeItem.id === id) ?? null;
}

export function automationKpis() {
  return {
    activeAutomations: ACTIVE_AUTOMATIONS.filter((item) => item.status === "Active").length,
    runsThisMonth: ACTIVE_AUTOMATIONS.reduce((sum, item) => sum + item.runsThisMonth, 0),
    timeSavedHours: ACTIVE_AUTOMATIONS.reduce((sum, item) => sum + item.timeSavedHours, 0),
    errors: ACTIVE_AUTOMATIONS.reduce((sum, item) => sum + item.errors, 0),
  };
}
