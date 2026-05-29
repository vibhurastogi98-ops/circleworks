import {
  employees as hrisEmployees,
  getEmployeeName,
} from "@/lib/hris-module-data";

type MockDepartment = {
  id: string;
  name: string;
  code: string;
  head: string;
  parent: string | null;
  employeeCount: number;
};

const employeeCountByLocation = (state: string) => hrisEmployees.filter((employee) => employee.address.state === state).length;
const employeeCountByDepartment = (department: string) => hrisEmployees.filter((employee) => employee.department === department).length;

export const mockCompanyProfile = {
  id: "comp_123",
  legalName: "CircleWorks Technologies Inc.",
  dba: "CircleWorks",
  ein: "**-***1234",
  entityType: "C-Corporation",
  fiscalYearEnd: "12-31",
  industry: "Technology",
  address: "123 Innovation Drive, Suite 400",
  city: "San Francisco",
  state: "CA",
  zip: "94107",
  logoUrl: "https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/www/public/og.png", // Using a cleaner placeholder for now
};

export const mockLocations = [
  { id: "loc_1", name: "SF Headquarters", address: "221 Mission St", state: "CA", timezone: "America/Los_Angeles", employeeCount: employeeCountByLocation("CA") },
  { id: "loc_2", name: "NY Office", address: "55 Water St", state: "NY", timezone: "America/New_York", employeeCount: employeeCountByLocation("NY") },
  { id: "loc_3", name: "Austin Hub", address: "908 Congress Ave", state: "TX", timezone: "America/Chicago", employeeCount: employeeCountByLocation("TX") },
];

export const mockDepartments: MockDepartment[] = [
  { id: "dept_1", name: "Executive", code: "EXE-100", head: getEmployeeName(hrisEmployees[0]), parent: null, employeeCount: employeeCountByDepartment("Executive") },
  { id: "dept_2", name: "Engineering", code: "ENG-100", head: getEmployeeName(hrisEmployees[1]), parent: null, employeeCount: employeeCountByDepartment("Engineering") },
  { id: "dept_3", name: "Payroll", code: "PAY-200", head: getEmployeeName(hrisEmployees[3]), parent: null, employeeCount: employeeCountByDepartment("Payroll") },
  { id: "dept_4", name: "People", code: "PEO-300", head: getEmployeeName(hrisEmployees[5]), parent: null, employeeCount: employeeCountByDepartment("People") },
];

export const mockUsers = [
  { id: "u_1", name: "Alex Admin", email: "alex@circleworks.co", role: "Super Admin", mfaState: "Enabled", lastLogin: "2026-04-05T08:30:00Z", status: "Active" },
  { id: "u_2", name: "Jamie HR", email: "jamie@circleworks.co", role: "HR Manager", mfaState: "Enabled", lastLogin: "2026-04-04T15:20:00Z", status: "Active" },
  { id: "u_3", name: "Taylor Finance", email: "taylor@circleworks.co", role: "Finance Admin", mfaState: "Pending", lastLogin: "2026-04-01T09:15:00Z", status: "Active" },
  { id: "u_4", name: "Jordan Ops", email: "jordan@circleworks.co", role: "Operations", mfaState: "Disabled", lastLogin: "2026-03-20T11:45:00Z", status: "Inactive" },
];

export const mockRoles = [
  { id: "r_1", name: "Super Admin", type: "Built-in", userCount: 2, description: "Full access to all systems and billing." },
  { id: "r_2", name: "HR Manager", type: "Built-in", userCount: 4, description: "Manage employees, benefits, compliance." },
  { id: "r_3", name: "Payroll Admin", type: "Built-in", userCount: 3, description: "Run payroll, manage tax filings, bank." },
  { id: "r_4", name: "Recruiter Only", type: "Custom", userCount: 5, description: "Access only to the ATS and onboarding." },
  { id: "r_5", name: "IT Provisoning", type: "Custom", userCount: 2, description: "Access to SSO, Integrations, and hardware." },
];

export const mockPaySchedules = [
  { id: "ps_1", name: "Salaried Bi-Weekly", frequency: "Bi-Weekly", nextPayDay: "2026-06-20", cutoff: "2026-06-17", cutoffHoursBeforeRun: 24, employees: hrisEmployees.filter((employee) => employee.payType === "Salary").length, default: true },
  { id: "ps_2", name: "Hourly Weekly", frequency: "Weekly", nextPayDay: "2026-06-13", cutoff: "2026-06-10", cutoffHoursBeforeRun: 24, employees: hrisEmployees.filter((employee) => employee.payType === "Hourly").length, default: false },
  { id: "ps_3", name: "Executive Monthly", frequency: "Monthly", nextPayDay: "2026-06-30", cutoff: "2026-06-25", cutoffHoursBeforeRun: 24, employees: employeeCountByDepartment("Executive"), default: false },
];

export const mockBankAccounts = [
  { id: "ba_1", name: "Chase Operating Account", type: "Checking", routing: "122000247", accountLast4: "8492", isPrimary: true, status: "Verified" },
  { id: "ba_2", name: "SVB Payroll Account", type: "Checking", routing: "121000358", accountLast4: "1032", isPrimary: false, status: "Pending Micro-deposits" },
];

export const mockIntegrations = [
  { id: "int_1", name: "Google Workspace", category: "Identity", status: "Connected", lastSync: "2 hours ago", icon: "mail" },
  { id: "int_2", name: "Slack", category: "Communication", status: "Connected", lastSync: "10 mins ago", icon: "message-square" },
  { id: "int_3", name: "QuickBooks Online", category: "Accounting", status: "Connected", lastSync: "1 day ago", icon: "book-open" },
  { id: "int_4", name: "NetSuite", category: "Accounting", status: "Available", lastSync: "-", icon: "briefcase" },
  { id: "int_5", name: "Greenhouse", category: "ATS", status: "Available", lastSync: "-", icon: "users" },
  { id: "int_6", name: "Guideline 401(k)", category: "Benefits", status: "Connected", lastSync: "3 days ago", icon: "piggy-bank" },
];

const notificationEvents = [
  ["Payroll", "Payroll Reminder"],
  ["Payroll", "Payroll Completed"],
  ["Payroll", "Payroll Failed"],
  ["Payroll", "Tax Filing Failed"],
  ["Payroll", "ACH Debit Scheduled"],
  ["Payroll", "Insufficient Funding"],
  ["Payroll", "Contractor Payment Sent"],
  ["Payroll", "Off-cycle Run Approved"],
  ["Employees", "New Hire Onboarding Complete"],
  ["Employees", "Employee Added"],
  ["Employees", "Employee Updated Bank Details"],
  ["Employees", "Compensation Changed"],
  ["Employees", "Offboarding Initiated"],
  ["Employees", "Termination Completed"],
  ["Employees", "Document Expiring"],
  ["Employees", "Birthday Reminder"],
  ["Hiring", "Candidate Applied"],
  ["Hiring", "Interview Scheduled"],
  ["Hiring", "Offer Sent"],
  ["Hiring", "Candidate Hired"],
  ["Time", "Timesheet Approval Reminder"],
  ["Time", "Missed Clock-out"],
  ["Time", "Overtime Threshold Reached"],
  ["Time", "PTO Request Submitted"],
  ["Time", "PTO Request Approved"],
  ["Benefits", "Open Enrollment Started"],
  ["Benefits", "Enrollment Completed"],
  ["Benefits", "Carrier Sync Failed"],
  ["Compliance", "I-9 Verification Due"],
  ["Compliance", "E-Verify Case Needs Action"],
  ["Compliance", "ACA Filing Due"],
  ["Compliance", "Labor Law Poster Updated"],
  ["Compliance", "Audit Export Completed"],
  ["Billing", "Invoice Available"],
  ["Billing", "Payment Failed"],
  ["Billing", "Usage Overage Warning"],
  ["Integrations", "Integration Connected"],
  ["Integrations", "Integration Sync Failed"],
  ["Integrations", "Webhook Delivery Failed"],
  ["System", "New Admin Login"],
  ["System", "MFA Disabled"],
  ["System", "API Key Created"],
  ["System", "SSO Certificate Expiring"],
] as const;

export const mockNotifications = notificationEvents.map(([category, event], index) => ({
  id: `n_${index + 1}`,
  category,
  event,
  email: true,
  inApp: true,
  slack: ["Payroll", "Hiring", "Time", "Integrations", "System"].includes(category),
  sms: event.includes("Failed") || event.includes("Insufficient") || event.includes("MFA"),
}));

export const mockBilling = {
  plan: "Pro Tier",
  status: "Active",
  pricePerUser: 12,
  baseFee: 49,
  activeEmployees: 246,
  estimatedNextInvoice: 3001, // (246 * 12) + 49
  renewalDate: "2026-05-01",
  paymentMethod: { type: "Visa", last4: "4242", expiry: "12/28" },
  invoices: [
    { id: "inv_04", date: "2026-04-01", amount: 2977, status: "Paid" },
    { id: "inv_03", date: "2026-03-01", amount: 2953, status: "Paid" },
    { id: "inv_02", date: "2026-02-01", amount: 2917, status: "Paid" },
  ]
};

export const mockApiKeys = [
  { id: "key_1", name: "Production API Key", prefix: "cw_live_8f92...", createdBy: "Alex Admin", createdAt: "2026-01-15", lastUsed: "2026-04-05", expiresAt: "Never", scopes: ["read:employees", "write:employees"] },
  { id: "key_2", name: "Staging Sync Key", prefix: "cw_test_4a1b...", createdBy: "Jamie HR", createdAt: "2026-03-20", lastUsed: "2026-04-02", expiresAt: "2027-03-20", scopes: ["read:all"] },
];

export const mockAuditLogs = [
  { id: "al_1", date: "2026-04-05T09:12:00Z", user: "Alex Admin", action: "Updated Settings", resource: "Company Profile", ip: "192.168.1.45", isAutomated: false },
  { id: "al_2", date: "2026-04-04T16:45:00Z", user: "Jamie HR", action: "Created User", resource: "Employee: Michael Chang", ip: "10.0.0.12", isAutomated: false },
  { id: "al_wf_1", date: "2026-04-05T08:47:00Z", user: "Workflow Automation", action: "update_field", resource: "Employee: Michael Chang — status: onboarding → active", ip: "Automation", isAutomated: true, workflowName: "New Hire Activation" },
  { id: "al_3", date: "2026-04-04T15:20:00Z", user: "Taylor Finance", action: "Approved Payroll", resource: "Pay Schedule: Salaried Bi-Weekly", ip: "172.16.254.1", isAutomated: false },
  { id: "al_wf_2", date: "2026-04-04T14:05:00Z", user: "Workflow Automation", action: "create_task", resource: "Onboarding: I-9 Verification — assigned to HR", ip: "Automation", isAutomated: true, workflowName: "Onboarding Checklist" },
  { id: "al_4", date: "2026-04-03T11:10:00Z", user: "System", action: "Tax Filing Submitted", resource: "Federal 941", ip: "Internal", isAutomated: false },
  { id: "al_wf_3", date: "2026-04-03T09:30:00Z", user: "Workflow Automation", action: "send_email", resource: "Employee: Sarah Connor — 30-day check-in email sent", ip: "Automation", isAutomated: true, workflowName: "Probation Period Follow-up" },
  { id: "al_5", date: "2026-04-02T08:05:00Z", user: "Jamie HR", action: "Deactivated User", resource: "Employee: Sarah Connor", ip: "10.0.0.12", isAutomated: false },
];

export const mockCustomFields = [
  { id: "cf_1", name: "T-Shirt Size", target: "Employee", type: "Dropdown", options: ["S", "M", "L", "XL", "XXL"], access: "All Managers" },
  { id: "cf_2", name: "Dietary Restrictions", target: "Employee", type: "Text", options: [], access: "All Managers" },
  { id: "cf_3", name: "External Cost Center", target: "Department", type: "Number", options: [], access: "HR Only" },
  { id: "cf_4", name: "Remote Working Agreement", target: "Employee", type: "File", options: [], access: "HR Only" },
];
