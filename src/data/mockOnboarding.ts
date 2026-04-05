export type OnboardingPhase = 'Pre-Hire' | 'Week 1' | 'Week 2' | '30-60-90 Day';
export type TaskStatus = 'Pending' | 'Complete' | 'Skipped';
export type CaseType = 'onboarding' | 'offboarding';
export type AssigneeRole = 'HR' | 'Manager' | 'IT' | 'Employee';

export interface OnboardingTask {
  id: string;
  title: string;
  assignee: AssigneeRole;
  status: TaskStatus;
  dueDate: string;
  phase: OnboardingPhase;
}

export interface OnboardingCase {
  id: string;
  employeeId: string;
  employeeName: string;
  avatar: string;
  department: string;
  startDate: string;
  type: CaseType;
  phase: OnboardingPhase;
  tasks: OnboardingTask[];
}

export interface OnboardingTemplate {
  id: string;
  name: string;
  type: CaseType;
  department: string | null;
  taskCount: number;
  lastUsed: string;
}

export interface OffboardingCase {
  id: string;
  employeeName: string;
  department: string;
  terminationDate: string;
  reason: string;
  tasks: { id: string; title: string; status: TaskStatus; assignee: AssigneeRole }[];
}

export interface DocumentTemplate {
  id: string;
  name: string;
  type: string;
  category: string;
  lastUpdated: string;
  esignStatus: 'Not Sent' | 'Pending Signature' | 'Signed' | 'Expired';
  assignedTemplates: string[];
}

// ---------- MOCK DATA ----------

export const mockOnboardingCases: OnboardingCase[] = [
  {
    id: 'obc-1', employeeId: 'emp-new-1', employeeName: 'Priya Sharma', avatar: 'https://i.pravatar.cc/150?u=priya', department: 'Engineering', startDate: '2024-10-01', type: 'onboarding', phase: 'Pre-Hire',
    tasks: [
      { id: 't1', title: 'Send welcome email', assignee: 'HR', status: 'Complete', dueDate: '2024-09-25', phase: 'Pre-Hire' },
      { id: 't2', title: 'Ship laptop & peripherals', assignee: 'IT', status: 'Complete', dueDate: '2024-09-26', phase: 'Pre-Hire' },
      { id: 't3', title: 'Create Google Workspace account', assignee: 'IT', status: 'Complete', dueDate: '2024-09-27', phase: 'Pre-Hire' },
      { id: 't4', title: 'Sign offer letter', assignee: 'Employee', status: 'Complete', dueDate: '2024-09-20', phase: 'Pre-Hire' },
      { id: 't5', title: 'Complete I-9 verification', assignee: 'HR', status: 'Pending', dueDate: '2024-09-30', phase: 'Pre-Hire' },
      { id: 't6', title: 'Day 1 orientation session', assignee: 'HR', status: 'Pending', dueDate: '2024-10-01', phase: 'Week 1' },
      { id: 't7', title: 'Meet team & manager intro', assignee: 'Manager', status: 'Pending', dueDate: '2024-10-01', phase: 'Week 1' },
      { id: 't8', title: 'Set up dev environment', assignee: 'Employee', status: 'Pending', dueDate: '2024-10-02', phase: 'Week 1' },
      { id: 't9', title: 'Complete security training', assignee: 'Employee', status: 'Pending', dueDate: '2024-10-07', phase: 'Week 2' },
      { id: 't10', title: '30-day check-in with manager', assignee: 'Manager', status: 'Pending', dueDate: '2024-10-30', phase: '30-60-90 Day' },
    ],
  },
  {
    id: 'obc-2', employeeId: 'emp-new-2', employeeName: 'Marcus Chen', avatar: 'https://i.pravatar.cc/150?u=marcus', department: 'Product', startDate: '2024-10-07', type: 'onboarding', phase: 'Pre-Hire',
    tasks: [
      { id: 't11', title: 'Send welcome email', assignee: 'HR', status: 'Complete', dueDate: '2024-10-01', phase: 'Pre-Hire' },
      { id: 't12', title: 'Ship laptop & peripherals', assignee: 'IT', status: 'Pending', dueDate: '2024-10-03', phase: 'Pre-Hire' },
      { id: 't13', title: 'Create accounts', assignee: 'IT', status: 'Pending', dueDate: '2024-10-04', phase: 'Pre-Hire' },
      { id: 't14', title: 'Sign offer letter', assignee: 'Employee', status: 'Complete', dueDate: '2024-09-25', phase: 'Pre-Hire' },
      { id: 't15', title: 'Day 1 orientation', assignee: 'HR', status: 'Pending', dueDate: '2024-10-07', phase: 'Week 1' },
    ],
  },
  {
    id: 'obc-3', employeeId: 'emp-new-3', employeeName: 'Keiko Tanaka', avatar: 'https://i.pravatar.cc/150?u=keiko', department: 'Marketing', startDate: '2024-09-15', type: 'onboarding', phase: 'Week 2',
    tasks: [
      { id: 't16', title: 'Send welcome email', assignee: 'HR', status: 'Complete', dueDate: '2024-09-10', phase: 'Pre-Hire' },
      { id: 't17', title: 'Ship laptop', assignee: 'IT', status: 'Complete', dueDate: '2024-09-12', phase: 'Pre-Hire' },
      { id: 't18', title: 'Complete I-9', assignee: 'HR', status: 'Complete', dueDate: '2024-09-14', phase: 'Pre-Hire' },
      { id: 't19', title: 'Day 1 orientation', assignee: 'HR', status: 'Complete', dueDate: '2024-09-15', phase: 'Week 1' },
      { id: 't20', title: 'Complete brand voice training', assignee: 'Employee', status: 'Pending', dueDate: '2024-09-22', phase: 'Week 2' },
      { id: 't21', title: '30-day review', assignee: 'Manager', status: 'Pending', dueDate: '2024-10-15', phase: '30-60-90 Day' },
    ],
  },
];

export const mockOffboardingCases: OffboardingCase[] = [
  {
    id: 'off-1', employeeName: 'Derek Lawson', department: 'Sales', terminationDate: '2024-10-15', reason: 'Voluntary Resignation',
    tasks: [
      { id: 'ot1', title: 'Calculate final pay', assignee: 'HR', status: 'Complete' },
      { id: 'ot2', title: 'Terminate benefits', assignee: 'HR', status: 'Complete' },
      { id: 'ot3', title: 'Send COBRA notice', assignee: 'HR', status: 'Pending' },
      { id: 'ot4', title: 'Equipment return', assignee: 'IT', status: 'Pending' },
      { id: 'ot5', title: 'Revoke IT access', assignee: 'IT', status: 'Pending' },
      { id: 'ot6', title: 'Send exit survey', assignee: 'HR', status: 'Pending' },
    ],
  },
  {
    id: 'off-2', employeeName: 'Felicia Grant', department: 'Engineering', terminationDate: '2024-10-30', reason: 'End of Contract',
    tasks: [
      { id: 'ot7', title: 'Calculate final pay', assignee: 'HR', status: 'Pending' },
      { id: 'ot8', title: 'Terminate benefits', assignee: 'HR', status: 'Pending' },
      { id: 'ot9', title: 'Send COBRA notice', assignee: 'HR', status: 'Pending' },
      { id: 'ot10', title: 'Equipment return', assignee: 'IT', status: 'Pending' },
      { id: 'ot11', title: 'Revoke IT access', assignee: 'IT', status: 'Pending' },
      { id: 'ot12', title: 'Send exit survey', assignee: 'HR', status: 'Pending' },
    ],
  },
];

export const mockOnboardingTemplates: OnboardingTemplate[] = [
  { id: 'tmpl-1', name: 'Standard Engineering Onboarding', type: 'onboarding', department: 'Engineering', taskCount: 12, lastUsed: '2024-09-15' },
  { id: 'tmpl-2', name: 'General New Hire', type: 'onboarding', department: null, taskCount: 8, lastUsed: '2024-09-20' },
  { id: 'tmpl-3', name: 'Sales Team Ramp-Up', type: 'onboarding', department: 'Sales', taskCount: 15, lastUsed: '2024-08-30' },
  { id: 'tmpl-4', name: 'Standard Offboarding', type: 'offboarding', department: null, taskCount: 6, lastUsed: '2024-09-25' },
];

export const mockDocumentTemplates: DocumentTemplate[] = [
  { id: 'doc-1', name: 'Standard Offer Letter', type: 'Offer Letter', category: 'Hiring', lastUpdated: '2024-09-01', esignStatus: 'Signed', assignedTemplates: ['tmpl-1', 'tmpl-2'] },
  { id: 'doc-2', name: 'Employee NDA', type: 'NDA', category: 'Legal', lastUpdated: '2024-08-15', esignStatus: 'Pending Signature', assignedTemplates: ['tmpl-1', 'tmpl-2', 'tmpl-3'] },
  { id: 'doc-3', name: 'Non-Compete Agreement', type: 'Non-Compete', category: 'Legal', lastUpdated: '2024-07-20', esignStatus: 'Not Sent', assignedTemplates: [] },
  { id: 'doc-4', name: 'Equity Grant Agreement', type: 'Equity', category: 'Compensation', lastUpdated: '2024-06-10', esignStatus: 'Signed', assignedTemplates: ['tmpl-1'] },
  { id: 'doc-5', name: 'Remote Work Policy', type: 'Policy', category: 'HR', lastUpdated: '2024-09-10', esignStatus: 'Not Sent', assignedTemplates: ['tmpl-2'] },
];

export const getCaseById = (id: string) => mockOnboardingCases.find(c => c.id === id);
