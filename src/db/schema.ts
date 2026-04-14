import { pgTable, serial, text, integer, timestamp, date, boolean, real, pgEnum, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// --- ENUMS ---
export const roleEnum = pgEnum('role', ['admin', 'hr', 'employee']);
export const employmentTypeEnum = pgEnum('employment_type', ['full-time', 'part-time', 'contractor']);
export const statusEnum = pgEnum('status', ['active', 'onboarding', 'terminated']);
export const payrollStatusEnum = pgEnum('payroll_status', ['draft', 'pending', 'processed', 'paid', 'cancelled']);
export const payrollTypeEnum = pgEnum('payroll_type', ['regular', 'off-cycle', 'bonus']);
export const assetTypeEnum = pgEnum('asset_type', ['Laptop', 'Monitor', 'Phone', 'Keyboard', 'Badge', 'Parking Pass', 'Other']);
export const assetStatusEnum = pgEnum('asset_status', ['Available', 'Assigned', 'In Repair', 'Retired']);

// --- TABLES ---

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  clerkUserId: text('clerk_user_id').unique().notNull(),
  email: text('email').notNull(),
  role: text('role').default('employee'), // admin, hr, employee
  createdAt: timestamp('created_at').defaultNow(),
});

export const companies = pgTable('companies', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  logoUrl: text('logo_url'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const employees = pgTable('employees', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  companyId: integer('company_id').references(() => companies.id, { onDelete: 'cascade' }),
  firstName: text('first_name').notNull(),
  lastName: text('last_name'),
  email: text('email'),
  avatar: text('avatar').default('https://api.dicebear.com/7.x/notionists/svg?seed=Employee&backgroundColor=transparent'),
  jobTitle: text('job_title'),
  department: text('department'),
  salary: integer('salary'),
  employmentType: text('employment_type').default('full-time'),
  location: text('location'),
  locationType: text('location_type').default('On-Site'), // Remote, Hybrid, On-Site
  startDate: date('start_date'),
  status: text('status').default('active'),
  managerId: integer('manager_id'), // Self-reference for Org Chart
  createdAt: timestamp('created_at').defaultNow(),
});

export const payrolls = pgTable('payrolls', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id, { onDelete: 'cascade' }),
  payPeriodStart: date('pay_period_start').notNull(),
  payPeriodEnd: date('pay_period_end').notNull(),
  checkDate: date('check_date').notNull(),
  totalGross: integer('total_gross').default(0),
  totalTaxes: integer('total_taxes').default(0),
  totalBenefits: integer('total_benefits').default(0),
  totalNet: integer('total_net').default(0),
  status: text('status').default('draft'),
  type: text('type').default('regular'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const payrollItems = pgTable('payroll_items', {
  id: serial('id').primaryKey(),
  payrollId: integer('payroll_id').references(() => payrolls.id, { onDelete: 'cascade' }),
  employeeId: integer('employee_id').references(() => employees.id, { onDelete: 'cascade' }),
  gross: integer('gross').notNull(),
  federalTax: integer('federal_tax').default(0),
  stateTax: integer('state_tax').default(0),
  ficaSs: integer('fica_ss').default(0),
  ficaMed: integer('fica_med').default(0),
  benefits: integer('benefits').default(0),
  net: integer('net').notNull(),
  type: text('type').default('regular'),
});

// --- TIME & ATTENDANCE ---

export const timePolicies = pgTable('time_policies', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  defaultRestBreakMins: integer('default_rest_break_mins').default(15),
  defaultMealBreakMins: integer('default_meal_break_mins').default(30),
  overtimeThresholdDaily: integer('overtime_threshold_daily').default(8),
  overtimeThresholdWeekly: integer('overtime_threshold_weekly').default(40),
  createdAt: timestamp('created_at').defaultNow(),
});

export const timesheets = pgTable('timesheets', {
  id: serial('id').primaryKey(),
  employeeId: integer('employee_id').references(() => employees.id, { onDelete: 'cascade' }),
  companyId: integer('company_id').references(() => companies.id, { onDelete: 'cascade' }),
  periodStart: date('period_start').notNull(),
  periodEnd: date('period_end').notNull(),
  totalRegularHours: real('total_regular_hours').default(0),
  totalOvertimeHours: real('total_overtime_hours').default(0),
  totalDoubleTimeHours: real('total_double_time_hours').default(0),
  status: text('status').default('Draft'),
  submittedAt: timestamp('submitted_at'),
  approvedAt: timestamp('approved_at'),
  approverId: integer('approver_id').references(() => users.id, { onDelete: 'set null' }),
  approverNote: text('approver_note'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const timeEntries = pgTable('time_entries', {
  id: serial('id').primaryKey(),
  employeeId: integer('employee_id').references(() => employees.id, { onDelete: 'cascade' }),
  timesheetId: integer('timesheet_id').references(() => timesheets.id, { onDelete: 'set null' }),
  clockIn: timestamp('clock_in').notNull(),
  clockOut: timestamp('clock_out'),
  entryType: text('entry_type').default('Regular'),
  locationId: text('location_id'),
  status: text('status').default('Approved'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// --- ATS & HIRING ---

export const atsJobs = pgTable('ats_jobs', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  status: text('status').default('Active'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const atsCandidates = pgTable('ats_candidates', {
  id: serial('id').primaryKey(),
  jobId: integer('job_id').references(() => atsJobs.id, { onDelete: 'cascade' }),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email'),
  stage: text('stage').default('New'),
  createdAt: timestamp('created_at').defaultNow(),
});

// --- ONBOARDING & OFFBOARDING ---

export const onboardingTemplates = pgTable('onboarding_templates', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  type: text('type').default('onboarding'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const onboardingTasks = pgTable('onboarding_tasks', {
  id: serial('id').primaryKey(),
  templateId: integer('template_id').references(() => onboardingTemplates.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  assigneeRole: text('assignee_role').default('HR'),
  dueOffsetDays: integer('due_offset_days').default(0),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

export const onboardingCases = pgTable('onboarding_cases', {
  id: serial('id').primaryKey(),
  employeeId: integer('employee_id').references(() => employees.id, { onDelete: 'cascade' }),
  templateId: integer('template_id').references(() => onboardingTemplates.id, { onDelete: 'set null' }),
  status: text('status').default('Active'),
  startDate: date('start_date'),
  createdAt: timestamp('created_at').defaultNow(),
});

// --- BENEFITS ---

export const benefitPlans = pgTable('benefit_plans', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  type: text('type').notNull(),
  carrier: text('carrier'),
  employeePremium: integer('employee_premium').default(0),
  employerPremium: integer('employer_premium').default(0),
  status: text('status').default('Active'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const benefitEnrollments = pgTable('benefit_enrollments', {
  id: serial('id').primaryKey(),
  planId: integer('plan_id').references(() => benefitPlans.id, { onDelete: 'cascade' }),
  employeeId: integer('employee_id').references(() => employees.id, { onDelete: 'cascade' }),
  status: text('status').default('Pending'),
  enrolledAt: timestamp('enrolled_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// --- EXPENSES ---

export const expenseReports = pgTable('expense_reports', {
  id: serial('id').primaryKey(),
  employeeId: integer('employee_id').references(() => employees.id, { onDelete: 'cascade' }),
  companyId: integer('company_id').references(() => companies.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  totalAmount: integer('total_amount').default(0),
  status: text('status').default('Draft'),
  submittedAt: timestamp('submitted_at'),
  approvedAt: timestamp('approved_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const expenseItems = pgTable('expense_items', {
  id: serial('id').primaryKey(),
  reportId: integer('report_id').references(() => expenseReports.id, { onDelete: 'cascade' }),
  date: date('date').notNull(),
  merchant: text('merchant').notNull(),
  category: text('category').notNull(),
  amount: integer('amount').notNull(),
  receiptUrl: text('receipt_url'),
  createdAt: timestamp('created_at').defaultNow(),
});

// --- PTO & LEAVE ---

export const ptoRequests = pgTable('pto_requests', {
  id: serial('id').primaryKey(),
  employeeId: integer('employee_id').references(() => employees.id, { onDelete: 'cascade' }),
  companyId: integer('company_id').references(() => companies.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  status: text('status').default('Pending'),
  approverId: integer('approver_id').references(() => employees.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow(),
});

// --- DOCUMENTS & BANK ---

export const employeeDocuments = pgTable('employee_documents', {
  id: serial('id').primaryKey(),
  employeeId: integer('employee_id').references(() => employees.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  type: text('type').notNull(),
  fileUrl: text('file_url'),
  status: text('status').default('Unread'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const employeeBankAccounts = pgTable('employee_bank_accounts', {
  id: serial('id').primaryKey(),
  employeeId: integer('employee_id').references(() => employees.id, { onDelete: 'cascade' }),
  bankName: text('bank_name').notNull(),
  routingNumber: text('routing_number').notNull(),
  accountNumberMasked: text('account_number_masked').notNull(),
  isPrimary: boolean('is_primary').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// --- ANNOUNCEMENTS ---

export const announcements = pgTable('announcements', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  body: text('body').notNull(),
  audience: text('audience').default('All Employees'), // All Employees, By Department, By Location, Custom Group
  department: text('department'), // If audience is By Department
  location: text('location'), // If audience is By Location
  priority: text('priority').default('Normal'), // Normal, Important, Urgent
  status: text('status').default('Draft'), // Draft, Scheduled, Published, Expired
  publishAt: timestamp('publish_at'),
  expireAt: timestamp('expire_at'),
  isPinned: boolean('is_pinned').default(false),
  attachments: text('attachments'), // JSON array of urls or single url
  viewsCount: integer('views_count').default(0),
  uniqueReaders: integer('unique_readers').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const announcementReads = pgTable('announcement_reads', {
  id: serial('id').primaryKey(),
  announcementId: integer('announcement_id').references(() => announcements.id, { onDelete: 'cascade' }),
  employeeId: integer('employee_id').references(() => employees.id, { onDelete: 'cascade' }),
  readAt: timestamp('read_at').defaultNow(),
});

// --- ASSETS & EQUIPMENT ---

export const assets = pgTable('assets', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  type: text('type').default('Laptop'), // Laptop, Monitor, Phone, Keyboard, Badge, Parking Pass, Other
  serialNumber: text('serial_number'),
  status: text('status').default('Available'), // Available, Assigned, In Repair, Retired
  purchaseDate: date('purchase_date'),
  value: integer('value'), // in cents
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const assetAssignments = pgTable('asset_assignments', {
  id: serial('id').primaryKey(),
  assetId: integer('asset_id').references(() => assets.id, { onDelete: 'cascade' }),
  employeeId: integer('employee_id').references(() => employees.id, { onDelete: 'cascade' }),
  assignedAt: timestamp('assigned_at').defaultNow(),
  returnedAt: timestamp('returned_at'),
  assignedBy: text('assigned_by'), // clerk user id who made assignment
  status: text('status').default('Active'), // Active, Returned, Overdue
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// --- RELATIONS ---

export const usersRelations = relations(users, ({ many }) => ({
  employees: many(employees),
}));

export const companiesRelations = relations(companies, ({ many }) => ({
  employees: many(employees),
  payrolls: many(payrolls),
}));

export const employeesRelations = relations(employees, ({ one, many }) => ({
  user: one(users, { fields: [employees.userId], references: [users.id] }),
  company: one(companies, { fields: [employees.companyId], references: [companies.id] }),
  timesheets: many(timesheets),
  onboardingCases: many(onboardingCases),
  benefitEnrollments: many(benefitEnrollments),
  expenseReports: many(expenseReports),
  ptoRequests: many(ptoRequests),
  documents: many(employeeDocuments),
  bankAccounts: many(employeeBankAccounts),
  payrollItems: many(payrollItems),
  manager: one(employees, { fields: [employees.managerId], references: [employees.id], relationName: 'subordinates' }),
  subordinates: many(employees, { relationName: 'subordinates' }),
  announcementReads: many(announcementReads),
  assetAssignments: many(assetAssignments),
}));

export const announcementsRelations = relations(announcements, ({ one, many }) => ({
  company: one(companies, { fields: [announcements.companyId], references: [companies.id] }),
  reads: many(announcementReads),
}));

export const announcementReadsRelations = relations(announcementReads, ({ one }) => ({
  announcement: one(announcements, { fields: [announcementReads.announcementId], references: [announcements.id] }),
  employee: one(employees, { fields: [announcementReads.employeeId], references: [employees.id] }),
}));

export const onboardingCasesRelations = relations(onboardingCases, ({ one }) => ({
  employee: one(employees, { fields: [onboardingCases.employeeId], references: [employees.id] }),
  template: one(onboardingTemplates, { fields: [onboardingCases.templateId], references: [onboardingTemplates.id] }),
}));

export const expenseReportsRelations = relations(expenseReports, ({ one, many }) => ({
  employee: one(employees, { fields: [expenseReports.employeeId], references: [employees.id] }),
  items: many(expenseItems),
}));

export const expenseItemsRelations = relations(expenseItems, ({ one }) => ({
  report: one(expenseReports, { fields: [expenseItems.reportId], references: [expenseReports.id] }),
}));

export const assetsRelations = relations(assets, ({ one, many }) => ({
  company: one(companies, { fields: [assets.companyId], references: [companies.id] }),
  assignments: many(assetAssignments),
}));

export const assetAssignmentsRelations = relations(assetAssignments, ({ one }) => ({
  asset: one(assets, { fields: [assetAssignments.assetId], references: [assets.id] }),
  employee: one(employees, { fields: [assetAssignments.employeeId], references: [employees.id] }),
}));


