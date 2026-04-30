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
  { id: "loc_1", name: "SF Headquarters", address: "123 Innovation Drive", state: "CA", timezone: "America/Los_Angeles", employeeCount: 142 },
  { id: "loc_2", name: "NY Office", address: "456 Broadway Ave", state: "NY", timezone: "America/New_York", employeeCount: 64 },
  { id: "loc_3", name: "Austin Hub", address: "789 Tech Boulevard", state: "TX", timezone: "America/Chicago", employeeCount: 28 },
];

export const mockDepartments = [
  { id: "dept_1", name: "Engineering", code: "ENG-100", head: "Robert Martinez", parent: null, employeeCount: 84 },
  { id: "dept_2", name: "Frontend", code: "ENG-101", head: "Sarah Lee", parent: "Engineering", employeeCount: 30 },
  { id: "dept_3", name: "Backend", code: "ENG-102", head: "James Wilson", parent: "Engineering", employeeCount: 45 },
  { id: "dept_4", name: "Sales", code: "SAL-200", head: "Amanda Smith", parent: null, employeeCount: 42 },
  { id: "dept_5", name: "Marketing", code: "MKT-300", head: "Kevin Chang", parent: null, employeeCount: 18 },
  { id: "dept_6", name: "Human Resources", code: "HR-400", head: "Jessica Davis", parent: null, employeeCount: 6 },
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
  { id: "ps_1", name: "Salaried Bi-Weekly", frequency: "Bi-Weekly", nextPayDay: "2026-04-10", cutoff: "2026-04-06", cutoffHoursBeforeRun: 24, employees: 185, default: true },
  { id: "ps_2", name: "Hourly Weekly", frequency: "Weekly", nextPayDay: "2026-04-08", cutoff: "2026-04-05", cutoffHoursBeforeRun: 24, employees: 49, default: false },
  { id: "ps_3", name: "Executive Monthly", frequency: "Monthly", nextPayDay: "2026-04-30", cutoff: "2026-04-25", cutoffHoursBeforeRun: 24, employees: 12, default: false },
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

export const mockNotifications = [
  { id: "n_1", category: "Payroll", event: "Payroll Reminder", email: true, inApp: true, slack: true, sms: false },
  { id: "n_2", category: "Payroll", event: "Payroll Completed", email: true, inApp: true, slack: true, sms: false },
  { id: "n_3", category: "Payroll", event: "Tax Filing Failed", email: true, inApp: true, slack: true, sms: true },
  { id: "n_4", category: "Employees", event: "New Hire Onboarding Complete", email: true, inApp: true, slack: true, sms: false },
  { id: "n_5", category: "Employees", event: "Offboarding Initiated", email: true, inApp: true, slack: false, sms: false },
  { id: "n_6", category: "Time", event: "Timesheet Approval Reminder", email: true, inApp: true, slack: true, sms: false },
  { id: "n_7", category: "System", event: "New Admin Login", email: true, inApp: true, slack: false, sms: false },
];

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
  { id: "al_1", date: "2026-04-05T09:12:00Z", user: "Alex Admin", action: "Updated Settings", resource: "Company Profille", ip: "192.168.1.45" },
  { id: "al_2", date: "2026-04-04T16:45:00Z", user: "Jamie HR", action: "Created User", resource: "Employee: Michael Chang", ip: "10.0.0.12" },
  { id: "al_3", date: "2026-04-04T15:20:00Z", user: "Taylor Finance", action: "Approved Payroll", resource: "Pay Schedule: Salaried Bi-Weekly", ip: "172.16.254.1" },
  { id: "al_4", date: "2026-04-03T11:10:00Z", user: "System", action: "Tax Filing Submitted", resource: "Federal 941", ip: "Internal" },
  { id: "al_5", date: "2026-04-02T08:05:00Z", user: "Jamie HR", action: "Deactivated User", resource: "Employee: Sarah Connor", ip: "10.0.0.12" },
];

export const mockCustomFields = [
  { id: "cf_1", name: "T-Shirt Size", target: "Employee", type: "Dropdown", options: ["S", "M", "L", "XL", "XXL"], access: "All Managers" },
  { id: "cf_2", name: "Dietary Restrictions", target: "Employee", type: "Text", options: [], access: "All Managers" },
  { id: "cf_3", name: "External Cost Center", target: "Department", type: "Number", options: [], access: "HR Only" },
  { id: "cf_4", name: "Remote Working Agreement", target: "Employee", type: "File", options: [], access: "HR Only" },
];
