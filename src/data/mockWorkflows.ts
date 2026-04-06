import { Node, Edge } from '@xyflow/react';

export type WorkflowStatus = 'Active' | 'Paused' | 'Draft';

export type AppWorkflow = {
  id: string;
  name: string;
  description: string;
  triggerEvent: string;
  status: WorkflowStatus;
  lastRun?: string;
  runCount: number;
  template: boolean;
  nodes: Node[];
  edges: Edge[];
};

// Common initial position setup helper
const pos = (x: number, y: number) => ({ x, y });

export const MOCK_TEMPLATES: AppWorkflow[] = [
  {
    id: "tpl_1",
    name: "New Hire Welcome Sequence",
    description: "Send Welcome Email, wait 3 days, task to manager, wait 7 days check-in.",
    triggerEvent: "Employee Hired",
    status: "Draft",
    runCount: 0,
    template: true,
    nodes: [
      { id: "1", type: "trigger", position: pos(250, 50), data: { label: "Employee Hired" } },
      { id: "2", type: "action", position: pos(250, 150), data: { label: "Send Welcome Email", subtype: "email" } },
      { id: "3", type: "action", position: pos(250, 250), data: { label: "Wait 3 Days", subtype: "delay" } },
      { id: "4", type: "action", position: pos(250, 350), data: { label: "Create Manager Check-in Task", subtype: "task" } }
    ],
    edges: [
      { id: "e1-2", source: "1", target: "2" },
      { id: "e2-3", source: "2", target: "3" },
      { id: "e3-4", source: "3", target: "4" }
    ]
  },
  {
    id: "tpl_2",
    name: "Missing I-9 Reminder",
    description: "Send reminder every 3 days out of compliance.",
    triggerEvent: "I-9 Form Incomplete",
    status: "Draft",
    runCount: 0,
    template: true,
    nodes: [
      { id: "1", type: "trigger", position: pos(250, 50), data: { label: "I-9 Form Incomplete (Day 3)" } },
      { id: "2", type: "action", position: pos(250, 150), data: { label: "Send Slack Reminder", subtype: "slack" } }
    ],
    edges: [
      { id: "e1-2", source: "1", target: "2" }
    ]
  },
  {
    id: "tpl_3",
    name: "Benefits Enrollment Reminder",
    description: "Remind 3 days before deadline.",
    triggerEvent: "Benefits Deadline Approaching",
    status: "Draft",
    runCount: 0,
    template: true,
    nodes: [
      { id: "1", type: "trigger", position: pos(250, 50), data: { label: "3 days before benefits deadline" } },
      { id: "2", type: "condition", position: pos(250, 150), data: { label: "If Enrollment = Incomplete" } },
      { id: "3", type: "action", position: pos(100, 250), data: { label: "Send Email Reminder", subtype: "email" } },
    ],
    edges: [
      { id: "e1-2", source: "1", target: "2" },
      { id: "e2-3", source: "2", target: "3", sourceHandle: "true" }
    ]
  },
  {
    id: "tpl_4",
    name: "Work Anniversary Kudos",
    description: "Send a kudos card to employee + notify manager.",
    triggerEvent: "Work Anniversary",
    status: "Draft",
    runCount: 0,
    template: true,
    nodes: [
      { id: "1", type: "trigger", position: pos(250, 50), data: { label: "On Work Anniversary Date" } },
      { id: "2", type: "action", position: pos(150, 150), data: { label: "Send Anniversary Kudos", subtype: "kudos" } },
      { id: "3", type: "action", position: pos(350, 150), data: { label: "Slack Manager", subtype: "slack" } }
    ],
    edges: [
      { id: "e1-2", source: "1", target: "2" },
      { id: "e1-3", source: "1", target: "3" }
    ]
  },
  {
    id: "tpl_5",
    name: "90-Day Review Trigger",
    description: "Auto create a task for manager.",
    triggerEvent: "90 Days Since Hire",
    status: "Draft",
    runCount: 0,
    template: true,
    nodes: [],
    edges: []
  },
  {
    id: "tpl_6",
    name: "PTO Balance Expiry Warning",
    description: "Warn 30 days before carryover cutoff.",
    triggerEvent: "Date-based",
    status: "Draft",
    runCount: 0,
    template: true,
    nodes: [],
    edges: []
  },
  {
    id: "tpl_7",
    name: "FMLA Designation Reminder",
    description: "When leave > 3 days.",
    triggerEvent: "Time Off > 3 Days",
    status: "Draft",
    runCount: 0,
    template: true,
    nodes: [],
    edges: []
  },
  {
    id: "tpl_8",
    name: "Salary in New Pay Band Alert",
    description: "Notify HR when compensation changes significantly.",
    triggerEvent: "Compensation Change",
    status: "Draft",
    runCount: 0,
    template: true,
    nodes: [],
    edges: []
  },
  {
    id: "tpl_9",
    name: "Offboarding COBRA Notice",
    description: "Generate 14 days post-termination.",
    triggerEvent: "Employee Terminated",
    status: "Draft",
    runCount: 0,
    template: true,
    nodes: [],
    edges: []
  },
  {
    id: "tpl_10",
    name: "Timesheet Late Reminder",
    description: "If not submitted by Thursday 5pm.",
    triggerEvent: "Timesheet Deadline",
    status: "Draft",
    runCount: 0,
    template: true,
    nodes: [],
    edges: []
  },
  {
    id: "tpl_11",
    name: "Certification Expiry Warning",
    description: "Warn employees at 60, 30, 14 days out.",
    triggerEvent: "Certification Expiring",
    status: "Draft",
    runCount: 0,
    template: true,
    nodes: [],
    edges: []
  },
  {
    id: "tpl_12",
    name: "Employee Birthday Greeting",
    description: "Shoot a casual email on birth date.",
    triggerEvent: "Employee Birthday",
    status: "Draft",
    runCount: 0,
    template: true,
    nodes: [],
    edges: []
  }
];

// Combine templates with existing active ones
export const MOCK_ACTIVE_WORKFLOWS: AppWorkflow[] = [
  {
    id: "wf_1",
    name: "Engineering Onboarding",
    description: "Automated provisioning for dev team.",
    triggerEvent: "Employee Hired",
    status: "Active",
    lastRun: "2 days ago",
    runCount: 142,
    template: false,
    nodes: [
      { id: "1", type: "trigger", position: pos(250, 50), data: { label: "Employee Hired" } },
      { id: "2", type: "condition", position: pos(250, 150), data: { label: "If Dept = Engineering" } },
      { id: "3", type: "action", position: pos(100, 250), data: { label: "Trigger GitHub Provision webhook", subtype: "webhook" } },
      { id: "4", type: "action", position: pos(350, 250), data: { label: "Send equipment request to IT", subtype: "email" } },
    ],
    edges: [
      { id: "e1-2", source: "1", target: "2" },
      { id: "e2-3", source: "2", target: "3", sourceHandle: "true" },
      { id: "e2-4", source: "2", target: "4", sourceHandle: "true" }
    ]
  },
  {
    id: "wf_2",
    name: "Executive Title Change Alert",
    description: "If a highly sensitive title changes, notify legal.",
    triggerEvent: "Field Changed: Title",
    status: "Paused",
    lastRun: "3 months ago",
    runCount: 2,
    template: false,
    nodes: [],
    edges: []
  }
];
