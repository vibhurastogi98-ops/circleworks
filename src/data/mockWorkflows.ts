import type { Edge, Node } from "@xyflow/react";

export type WorkflowStatus = "Active" | "Paused" | "Draft";

export type WorkflowNodeData = {
  [key: string]: unknown;
  label: string;
  triggerEvent?: string;
  actionType?: string;
  conditionLogic?: "AND" | "OR";
  field?: string;
  operator?: string;
  value?: string;
  template?: string;
  recipients?: string;
  channel?: string;
  message?: string;
  dueOffset?: string;
  url?: string;
  payload?: string;
  delayAmount?: string;
  delayUnit?: "hours" | "days";
};

export type AppWorkflow = {
  id: string;
  name: string;
  description: string;
  triggerEvent: string;
  status: WorkflowStatus;
  lastRun?: string;
  runCount: number;
  template: boolean;
  nodes: Node<WorkflowNodeData>[];
  edges: Edge[];
};

const pos = (x: number, y: number) => ({ x, y });

function workflowNodes(triggerLabel: string, actions: Array<{ label: string; actionType: string; x?: number; y?: number }>, condition?: string) {
  const nodes: Node<WorkflowNodeData>[] = [
    {
      id: "trigger-1",
      type: "trigger",
      position: pos(80, 180),
      data: { label: triggerLabel, triggerEvent: triggerLabel },
    },
  ];

  if (condition) {
    nodes.push({
      id: "condition-1",
      type: "condition",
      position: pos(380, 180),
      data: { label: condition, conditionLogic: "AND", field: "work_state", operator: "equals", value: "California" },
    });
  }

  actions.forEach((action, index) => {
    nodes.push({
      id: `action-${index + 1}`,
      type: "action",
      position: pos(action.x ?? (condition ? 700 + index * 280 : 380 + index * 280), action.y ?? 180),
      data: { label: action.label, actionType: action.actionType },
    });
  });

  return nodes;
}

function workflowEdges(actionCount: number, hasCondition = false): Edge[] {
  if (hasCondition) {
    return [
      { id: "e-trigger-condition", source: "trigger-1", target: "condition-1", animated: true },
      { id: "e-condition-action-1", source: "condition-1", sourceHandle: "true", target: "action-1", label: "THEN" },
      ...Array.from({ length: Math.max(0, actionCount - 1) }, (_, index) => ({
        id: `e-action-${index + 1}-${index + 2}`,
        source: `action-${index + 1}`,
        target: `action-${index + 2}`,
      })),
    ];
  }

  return Array.from({ length: actionCount }, (_, index) => ({
    id: index === 0 ? "e-trigger-action-1" : `e-action-${index}-${index + 1}`,
    source: index === 0 ? "trigger-1" : `action-${index}`,
    target: `action-${index + 1}`,
    animated: index === 0,
  }));
}

function makeWorkflow(input: Omit<AppWorkflow, "nodes" | "edges"> & { actions: Array<{ label: string; actionType: string }>; condition?: string }): AppWorkflow {
  return {
    ...input,
    nodes: workflowNodes(input.triggerEvent, input.actions, input.condition),
    edges: workflowEdges(input.actions.length, !!input.condition),
  };
}

export const MOCK_TEMPLATES: AppWorkflow[] = [
  makeWorkflow({
    id: "template-new-hire-welcome",
    name: "New hire welcome sequence",
    description: "Email day 0, 3, 7, and 30 with onboarding nudges and manager context.",
    triggerEvent: "Employee hired",
    status: "Draft",
    lastRun: undefined,
    runCount: 0,
    template: true,
    actions: [
      { label: "Send day 0 welcome email", actionType: "email" },
      { label: "Wait 3 days", actionType: "delay" },
      { label: "Send week-one check-in", actionType: "email" },
      { label: "Create 30-day manager task", actionType: "task" },
    ],
  }),
  makeWorkflow({ id: "template-i9-reminder", name: "Missing I-9 reminder", description: "Remind employee and HR every 3 days, up to 3 times.", triggerEvent: "Employee hired", status: "Draft", runCount: 0, template: true, actions: [{ label: "Wait 3 days", actionType: "delay" }, { label: "Send I-9 reminder", actionType: "email" }, { label: "Create HR follow-up task", actionType: "task" }] }),
  makeWorkflow({ id: "template-benefits-reminder", name: "Benefits enrollment reminder", description: "Notify employees 3 days before enrollment deadline.", triggerEvent: "Date-based: X days before certification expiry", status: "Draft", runCount: 0, template: true, actions: [{ label: "Send enrollment email", actionType: "email" }, { label: "Send push notification", actionType: "push" }] }),
  makeWorkflow({ id: "template-anniversary-kudos", name: "Work anniversary kudos + manager notification", description: "Send kudos and notify managers on hire anniversary.", triggerEvent: "Date-based: X days before hire anniversary", status: "Draft", runCount: 0, template: true, actions: [{ label: "Send kudos card", actionType: "push" }, { label: "Notify manager in Slack", actionType: "slack" }] }),
  makeWorkflow({ id: "template-90-day-review", name: "90-day review trigger", description: "Create review task for manager after employee reaches 90 days.", triggerEvent: "Review due", status: "Draft", runCount: 0, template: true, actions: [{ label: "Create manager review task", actionType: "task" }] }),
  makeWorkflow({ id: "template-pto-expiry", name: "PTO balance expiry warning", description: "Warn employees 30 days before carryover cutoff.", triggerEvent: "Date-based: X days before hire anniversary", status: "Draft", runCount: 0, template: true, actions: [{ label: "Send PTO balance email", actionType: "email" }, { label: "Send push notification", actionType: "push" }] }),
  makeWorkflow({ id: "template-fmla-designation", name: "FMLA designation reminder", description: "Create HR task when leave exceeds 3 days.", triggerEvent: "PTO request submitted", status: "Draft", runCount: 0, template: true, condition: "IF leave_days > 3", actions: [{ label: "Create FMLA designation task", actionType: "task" }] }),
  makeWorkflow({ id: "template-pay-band-alert", name: "Salary in new pay band alert", description: "Notify HR when compensation changes into a new band.", triggerEvent: "Field changed: When employee department changes", status: "Draft", runCount: 0, template: true, actions: [{ label: "Notify HR compensation channel", actionType: "slack" }] }),
  makeWorkflow({ id: "template-cobra-notice", name: "Offboarding COBRA notice", description: "Auto-generate COBRA notice 14 days post-termination.", triggerEvent: "Employee terminated", status: "Draft", runCount: 0, template: true, actions: [{ label: "Wait 14 days", actionType: "delay" }, { label: "Call COBRA notice webhook", actionType: "webhook" }] }),
  makeWorkflow({ id: "template-late-timesheet", name: "Timesheet late reminder", description: "If not submitted by Thursday 5pm, send reminders.", triggerEvent: "Timesheet submitted", status: "Draft", runCount: 0, template: true, condition: "IF submitted_at is empty", actions: [{ label: "Send Slack DM", actionType: "slack" }, { label: "Notify manager", actionType: "email" }] }),
  makeWorkflow({ id: "template-cert-expiry", name: "Certification expiry warning", description: "Warn employees and managers 60, 30, and 14 days out.", triggerEvent: "Date-based: X days before certification expiry", status: "Draft", runCount: 0, template: true, actions: [{ label: "Send 60-day warning", actionType: "email" }, { label: "Wait 30 days", actionType: "delay" }, { label: "Send manager task", actionType: "task" }] }),
  makeWorkflow({ id: "template-birthday", name: "Employee birthday greeting", description: "Send a kudos card on employee birthday.", triggerEvent: "Date-based: X days before hire anniversary", status: "Draft", runCount: 0, template: true, actions: [{ label: "Send birthday kudos card", actionType: "push" }] }),
];

export const FEATURED_WORKFLOW_TEMPLATES = [
  "New hire IT setup",
  "PTO reminder 30 days before expiry",
  "Anniversary kudos",
  "90-day review trigger",
];

export const MOCK_ACTIVE_WORKFLOWS: AppWorkflow[] = [
  makeWorkflow({
    id: "workflow-new-hire-it",
    name: "New hire IT setup",
    description: "Create IT tasks, Slack notices, and access provisioning steps for every new hire.",
    triggerEvent: "Employee hired",
    status: "Active",
    lastRun: "2 hours ago",
    runCount: 184,
    template: false,
    actions: [
      { label: "Create laptop task", actionType: "task" },
      { label: "Send Slack message to IT", actionType: "slack" },
      { label: "Call provisioning webhook", actionType: "webhook" },
    ],
  }),
  makeWorkflow({
    id: "workflow-pto-expiry",
    name: "PTO reminder 30 days before expiry",
    description: "Warn employees before PTO carryover cutoff.",
    triggerEvent: "Date-based: X days before hire anniversary",
    status: "Active",
    lastRun: "Yesterday",
    runCount: 52,
    template: false,
    actions: [{ label: "Send PTO reminder email", actionType: "email" }],
  }),
  makeWorkflow({
    id: "workflow-anniversary",
    name: "Anniversary kudos",
    description: "Send kudos and notify managers.",
    triggerEvent: "Date-based: X days before hire anniversary",
    status: "Paused",
    lastRun: "May 12, 2026",
    runCount: 96,
    template: false,
    actions: [{ label: "Send kudos card", actionType: "push" }, { label: "Notify manager", actionType: "slack" }],
  }),
];
