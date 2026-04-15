import { pgTable, serial, text, integer, timestamp, date, boolean, real, pgEnum, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// --- ENUMS ---
export const roleEnum = pgEnum('role', ['admin', 'hr', 'employee', 'accountant']);
export const employmentTypeEnum = pgEnum('employment_type', ['full-time', 'part-time', 'contractor']);
export const statusEnum = pgEnum('status', ['active', 'onboarding', 'terminated']);
export const payrollStatusEnum = pgEnum('payroll_status', ['draft', 'pending', 'processed', 'paid', 'cancelled']);
export const payrollTypeEnum = pgEnum('payroll_type', ['regular', 'off-cycle', 'bonus']);
export const assetTypeEnum = pgEnum('asset_type', ['Laptop', 'Monitor', 'Phone', 'Keyboard', 'Badge', 'Parking Pass', 'Other']);
export const assetStatusEnum = pgEnum('asset_status', ['Available', 'Assigned', 'In Repair', 'Retired']);
export const contractorStatusEnum = pgEnum('contractor_status', ['Active', 'Onboarding', 'Pending', 'Inactive']);
export const contractStatusEnum = pgEnum('contract_status', ['Draft', 'Pending Signature', 'Active', 'Expired', 'Terminated']);
export const invoiceStatusEnum = pgEnum('invoice_status', ['Pending', 'Approved', 'Revision Requested', 'Rejected', 'Paid']);
export const agencyInvoiceStatusEnum = pgEnum('agency_invoice_status', ['Draft', 'Approved', 'Sent', 'Paid']);
export const billingRateTypeEnum = pgEnum('billing_rate_type', ['cost-plus', 'fixed', 'hourly']);
export const billingCycleEnum = pgEnum('billing_cycle', ['weekly', 'bi-weekly', 'monthly']);

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
  companyId: integer('company_id').references(() => companies.id, { onDelete: 'cascade' }),
  timesheetId: integer('timesheet_id').references(() => timesheets.id, { onDelete: 'set null' }),
  projectId: integer('project_id'), // Will define reference below to avoid circular errors if before projects
  clockIn: timestamp('clock_in').notNull(),
  clockOut: timestamp('clock_out'),
  entryType: text('entry_type').default('Regular'),
  locationId: text('location_id'),
  status: text('status').default('Approved'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// --- PROJECTS & BILLING ---

export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  clientName: text('client_name'),
  code: text('code'),
  billingRate: integer('billing_rate'), // in cents/hr
  budgetHours: integer('budget_hours'),
  isBillable: boolean('is_billable').default(true),
  status: text('status').default('Active'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const projectAssignments = pgTable('project_assignments', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  employeeId: integer('employee_id').references(() => employees.id, { onDelete: 'cascade' }),
  assignedAt: timestamp('assigned_at').defaultNow(),
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
  agencyClients: many(agencyClients),
  agencyInvoices: many(agencyInvoices),
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
  projectAssignments: many(projectAssignments),
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

export const projectsRelations = relations(projects, ({ one, many }) => ({
  company: one(companies, { fields: [projects.companyId], references: [companies.id] }),
  assignments: many(projectAssignments),
  timeEntries: many(timeEntries),
}));

export const projectAssignmentsRelations = relations(projectAssignments, ({ one }) => ({
  project: one(projects, { fields: [projectAssignments.projectId], references: [projects.id] }),
  employee: one(employees, { fields: [projectAssignments.employeeId], references: [employees.id] }),
}));

export const timeEntriesRelations = relations(timeEntries, ({ one }) => ({
  employee: one(employees, { fields: [timeEntries.employeeId], references: [employees.id] }),
  company: one(companies, { fields: [timeEntries.companyId], references: [companies.id] }),
  timesheet: one(timesheets, { fields: [timeEntries.timesheetId], references: [timesheets.id] }),
  project: one(projects, { fields: [timeEntries.projectId], references: [projects.id] }),
}));

// --- CONTRACTORS ---

export const contractors = pgTable('contractors', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  businessName: text('business_name'),
  email: text('email').notNull(),
  phone: text('phone'),
  status: text('status').default('Onboarding'), // Active, Onboarding, Pending, Inactive
  w9Status: text('w9_status').default('Not Submitted'), // Collected, Pending, Not Submitted, Expired
  tinMasked: text('tin_masked'),
  tinType: text('tin_type'), // SSN, EIN
  onboardingStep: text('onboarding_step').default('Invited'),
  ytdPayments: integer('ytd_payments').default(0), // stored in cents or whole dollars
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const contracts = pgTable('contracts', {
  id: serial('id').primaryKey(),
  contractorId: integer('contractor_id').references(() => contractors.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  type: text('type').notNull(), // Hourly, Project, Retainer
  rate: integer('rate').notNull(),
  rateUnit: text('rate_unit').default('/hr'),
  startDate: date('start_date').notNull(),
  endDate: date('end_date'), // Optional for ongoing contracts
  paymentTerms: text('payment_terms').default('Net 30'),
  status: text('status').default('Draft'), // Draft, Pending Signature, Active, Expired
  signedByAdmin: boolean('signed_by_admin').default(false),
  signedByContractor: boolean('signed_by_contractor').default(false),
  signedAt: timestamp('signed_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const contractorInvoices = pgTable('contractor_invoices', {
  id: serial('id').primaryKey(),
  contractorId: integer('contractor_id').references(() => contractors.id, { onDelete: 'cascade' }),
  invoiceNumber: text('invoice_number').notNull(),
  amount: integer('amount').notNull(),
  description: text('description'),
  submittedDate: date('submitted_date').notNull(),
  dueDate: date('due_date').notNull(),
  status: text('status').default('Pending'), // Pending, Approved, Revision Requested, Rejected, Paid
  hours: real('hours'),
  rate: integer('rate'),
  attachmentUrl: text('attachment_url'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const necs1099 = pgTable('necs_1099', {
  id: serial('id').primaryKey(),
  contractorId: integer('contractor_id').references(() => contractors.id, { onDelete: 'cascade' }),
  taxYear: integer('tax_year').notNull(),
  box1Amount: integer('box1_amount').notNull(),
  status: text('status').default('Draft'), // Draft, Ready, Filed, Delivered
  deliveryMethod: text('delivery_method').default('E-Delivery'),
  tin: text('tin'), // Explicit field if capturing snapshot for filing
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// --- CONTRACTOR RELATIONS ---

export const contractorsRelations = relations(contractors, ({ one, many }) => ({
  company: one(companies, { fields: [contractors.companyId], references: [companies.id] }),
  contracts: many(contracts),
  invoices: many(contractorInvoices),
  necs1099: many(necs1099),
}));

export const contractsRelations = relations(contracts, ({ one }) => ({
  contractor: one(contractors, { fields: [contracts.contractorId], references: [contractors.id] }),
}));

export const contractorInvoicesRelations = relations(contractorInvoices, ({ one }) => ({
  contractor: one(contractors, { fields: [contractorInvoices.contractorId], references: [contractors.id] }),
}));

export const necs1099Relations = relations(necs1099, ({ one }) => ({
  contractor: one(contractors, { fields: [necs1099.contractorId], references: [contractors.id] }),
}));

// --- TAX FILINGS & SUI ---

export const taxFilings = pgTable('tax_filings', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id, { onDelete: 'cascade' }),
  formName: text('form_name').notNull(),
  formNumber: text('form_number').notNull(),
  jurisdiction: text('jurisdiction').notNull(),
  dueDate: date('due_date').notNull(),
  status: text('status').default('upcoming'), // filed, upcoming, overdue
  filedDate: date('filed_date'),
  confirmationNumber: text('confirmation_number'),
  amount: integer('amount').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const suiRates = pgTable('sui_rates', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id, { onDelete: 'cascade' }),
  state: text('state').notNull(),
  stateAbbr: text('state_abbr').notNull(),
  taxYear: integer('tax_year').notNull(),
  rate: real('rate').notNull(),
  wageBase: integer('wage_base').notNull(),
  source: text('source').default('State Portal'), // Rate Notice, Manual Entry, OCR Import, State Portal
  dateUpdated: date('date_updated').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const complianceRelations = relations(companies, ({ many }) => ({
  taxFilings: many(taxFilings),
  suiRates: many(suiRates),
  laborPosters: many(laborPosters),
  handbookVersions: many(handbookVersions),
  handbookSections: many(handbookSections),
}));

export const employeeComplianceRelations = relations(employees, ({ many }) => ({
  i9Records: many(i9Records),
  acaRecords: many(acaRecords),
  wotcScreenings: many(wotcScreenings),
}));

// --- DEEPER COMPLIANCE & HR ---

export const i9Records = pgTable('i9_records', {
  id: serial('id').primaryKey(),
  employeeId: integer('employee_id').references(() => employees.id, { onDelete: 'cascade' }),
  i9Status: text('i9_status').default('pending'), // complete, pending, expiring, expired
  expirationDate: date('expiration_date'),
  section3Complete: boolean('section3_complete').default(false),
  eVerifyStatus: text('e_verify_status').default('not_submitted'), // verified, pending, case_closed, referred, not_submitted
  eVerifyCaseNumber: text('e_verify_case_number'),
  documentType: text('document_type'),
  lastAuditDate: date('last_audit_date'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const acaRecords = pgTable('aca_records', {
  id: serial('id').primaryKey(),
  employeeId: integer('employee_id').references(() => employees.id, { onDelete: 'cascade' }),
  status: text('status').notNull(), // full-time, part-time, variable
  hoursPerWeek: integer('hours_per_week'),
  coverageOffered: boolean('coverage_offered').default(false),
  affordable: boolean('affordable').default(false),
  minimumValue: boolean('minimum_value').default(false),
  form1095CCode: text('form_1095c_code'),
  form1095CStatus: text('form_1095c_status').default('pending'), // generated, pending, distributed
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const laborPosters = pgTable('labor_posters', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  jurisdiction: text('jurisdiction').notNull(), // federal, CA, NY, TX
  status: text('status').default('current'), // current, update_available, ordered, expired
  lastUpdated: date('last_updated'),
  effectiveDate: date('effective_date'),
  category: text('category'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const handbookVersions = pgTable('handbook_versions', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id, { onDelete: 'cascade' }),
  version: text('version').notNull(),
  publishedDate: date('published_date').notNull(),
  publishedBy: text('published_by'),
  changeNotes: text('change_notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const handbookSections = pgTable('handbook_sections', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  sortOrder: integer('sort_order').default(0),
  stateSpecific: text('state_specific'), // Array or JSON string
  lastModified: date('last_modified'),
  wordCount: integer('word_count').default(0),
  content: text('content'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const wotcScreenings = pgTable('wotc_screenings', {
  id: serial('id').primaryKey(),
  employeeId: integer('employee_id').references(() => employees.id, { onDelete: 'cascade' }),
  questionnaireComplete: boolean('questionnaire_complete').default(false),
  eligible: boolean('eligible').default(false),
  targetGroup: text('target_group'),
  estimatedCredit: integer('estimated_credit').default(0),
  form8850Generated: boolean('form_8850_generated').default(false),
  submissionStatus: text('submission_status').default('not_applicable'), // submitted, pending, approved, denied, not_applicable
  submissionDate: date('submission_date'),
  stateAgency: text('state_agency'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const headcountForecasts = pgTable('headcount_forecasts', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id, { onDelete: 'cascade' }),
  month: text('month').notNull(), // YYYY-MM
  projectedCount: integer('projected_count').notNull(),
  plannedHires: integer('planned_hires').default(0),
  attritionRate: real('attrition_rate').default(0),
  budgetImpact: integer('budget_impact').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

export const savedCustomReports = pgTable('saved_custom_reports', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  dataSource: text('data_source').notNull(),
  fields: text('fields').notNull(), // JSON string array
  visibility: text('visibility').default('private'), // private, team, org
  createdBy: text('created_by'),
  lastRun: date('last_run'),
  createdAt: timestamp('created_at').defaultNow(),
});

// --- STATE PAID LEAVE ---

export const paidLeavePrograms = pgTable('paid_leave_programs', {
  id: serial('id').primaryKey(),
  stateCode: text('state_code').notNull(),
  programName: text('program_name').notNull(),
  employeeRate: real('employee_rate').notNull(),
  employerRate: real('employer_rate').notNull(),
  wageBase: integer('wage_base').notNull(),
  lastUpdated: date('last_updated'),
  alert: text('alert'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const companyPaidLeave = pgTable('company_paid_leave', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id, { onDelete: 'cascade' }),
  programId: integer('program_id').references(() => paidLeavePrograms.id, { onDelete: 'cascade' }),
  customEmployerRate: real('custom_employer_rate'), // For voluntary plans or specialized rates
  status: text('status').default('Active'),
  createdAt: timestamp('created_at').defaultNow(),
});

// --- ACCOUNTANT & PARTNERS ---

export const accountingFirms = pgTable('accounting_firms', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  logoUrl: text('logo_url'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const firmUsers = pgTable('firm_users', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  firmId: integer('firm_id').references(() => accountingFirms.id, { onDelete: 'cascade' }),
  role: text('role').default('member'), // admin, member
  createdAt: timestamp('created_at').defaultNow(),
});

export const firmClients = pgTable('firm_clients', {
  id: serial('id').primaryKey(),
  firmId: integer('firm_id').references(() => accountingFirms.id, { onDelete: 'cascade' }),
  companyId: integer('company_id').references(() => companies.id, { onDelete: 'cascade' }),
  status: text('status').default('Active'),
  createdAt: timestamp('created_at').defaultNow(),
});

// --- PERFORMANCE MANAGEMENT ---

export const performanceCycles = pgTable('performance_cycles', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  status: text('status').default('Draft'), // Draft, Active, Closed
  createdAt: timestamp('created_at').defaultNow(),
});

export const performanceReviews = pgTable('performance_reviews', {
  id: serial('id').primaryKey(),
  cycleId: integer('cycle_id').references(() => performanceCycles.id, { onDelete: 'cascade' }),
  employeeId: integer('employee_id').references(() => employees.id, { onDelete: 'cascade' }),
  reviewerId: integer('reviewer_id').references(() => employees.id, { onDelete: 'set null' }),
  status: text('status').default('Pending'), // Pending, In Progress, Submitted, Acknowledged
  rating: integer('rating'), // e.g. 1-5
  feedback: text('feedback'),
  submittedAt: timestamp('submitted_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const employeeGoals = pgTable('employee_goals', {
  id: serial('id').primaryKey(),
  employeeId: integer('employee_id').references(() => employees.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status').default('On Track'), // On Track, At Risk, Off Track, Completed
  progress: integer('progress').default(0), // 0-100
  dueDate: date('due_date'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const oneOnOneMeetings = pgTable('one_on_one_meetings', {
  id: serial('id').primaryKey(),
  employeeId: integer('employee_id').references(() => employees.id, { onDelete: 'cascade' }),
  managerId: integer('manager_id').references(() => employees.id, { onDelete: 'cascade' }),
  date: date('date').notNull(),
  notes: text('notes'),
  actionItems: text('action_items'),
  status: text('status').default('Scheduled'), // Scheduled, Completed, Cancelled
  createdAt: timestamp('created_at').defaultNow(),
});

// --- LEARNING & DEVELOPMENT ---

export const courses = pgTable('courses', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category'), // Compliance, Skills, Leadership
  durationMins: integer('duration_mins'),
  status: text('status').default('Active'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const courseEnrollments = pgTable('course_enrollments', {
  id: serial('id').primaryKey(),
  courseId: integer('course_id').references(() => courses.id, { onDelete: 'cascade' }),
  employeeId: integer('employee_id').references(() => employees.id, { onDelete: 'cascade' }),
  status: text('status').default('Not Started'), // Not Started, In Progress, Completed
  progress: integer('progress').default(0), // 0-100
  enrolledAt: timestamp('enrolled_at').defaultNow(),
  completedAt: timestamp('completed_at'),
});

// --- GENERAL LEDGER ---

export const chartOfAccounts = pgTable('chart_of_accounts', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id, { onDelete: 'cascade' }),
  accountNumber: text('account_number').notNull(),
  accountName: text('account_name').notNull(),
  accountType: text('account_type').notNull(), // Asset, Liability, Equity, Revenue, Expense
  status: text('status').default('Active'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const journalEntries = pgTable('journal_entries', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id, { onDelete: 'cascade' }),
  payrollId: integer('payroll_id').references(() => payrolls.id, { onDelete: 'set null' }),
  entryDate: date('entry_date').notNull(),
  description: text('description'),
  status: text('status').default('Pending Sync'), // Pending Sync, Synced, Failed
  syncDate: timestamp('sync_date'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const journalEntryLines = pgTable('journal_entry_lines', {
  id: serial('id').primaryKey(),
  journalEntryId: integer('journal_entry_id').references(() => journalEntries.id, { onDelete: 'cascade' }),
  accountId: integer('account_id').references(() => chartOfAccounts.id, { onDelete: 'cascade' }),
  amount: integer('amount').notNull(), // in cents
  type: text('type').notNull(), // Debit, Credit
  department: text('department'), // for class tracking
});

// --- SUPPLEMENTAL PAYMENTS & ROYALTIES ---

export const supplementalPaymentTypeEnum = pgEnum('supplemental_payment_type', ['Royalty', 'Residual', 'Advance', 'Commission', 'Signing Bonus']);
export const supplementalPaymentStatusEnum = pgEnum('supplemental_payment_status', ['Pending', 'Approved', 'Paid', 'Held', 'Recouping']);

export const supplementalPayments = pgTable('supplemental_payments', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id, { onDelete: 'cascade' }),
  employeeId: integer('employee_id').references(() => employees.id, { onDelete: 'set null' }),
  contractorId: integer('contractor_id').references(() => contractors.id, { onDelete: 'set null' }),
  recipientName: text('recipient_name').notNull(),
  recipientType: text('recipient_type').notNull(), // W-2 Employee, 1099 Contractor
  paymentType: text('payment_type').notNull(), // Royalty, Residual, Advance, Commission, Signing Bonus
  description: text('description'),
  amount: integer('amount').notNull(), // in cents
  taxTreatment: text('tax_treatment'), // Supplemental flat rate (22%), 1099-MISC Box 2, Non-taxable (unrecouped advance)
  status: text('status').default('Pending'),
  scheduledDate: date('scheduled_date'),
  paidDate: date('paid_date'),
  projectTitle: text('project_title'),
  notes: text('notes'),
  royaltyScheduleId: integer('royalty_schedule_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const royaltySchedules = pgTable('royalty_schedules', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id, { onDelete: 'cascade' }),
  employeeId: integer('employee_id').references(() => employees.id, { onDelete: 'set null' }),
  contractorId: integer('contractor_id').references(() => contractors.id, { onDelete: 'set null' }),
  recipientName: text('recipient_name').notNull(),
  recipientType: text('recipient_type').notNull(),
  projectTitle: text('project_title').notNull(),
  royaltyType: text('royalty_type').notNull(), // Percentage, Flat Per Unit
  rate: real('rate').notNull(),
  rateUnit: text('rate_unit'),
  unitsSold: integer('units_sold').default(0),
  unitsThreshold: integer('units_threshold').default(0),
  frequency: text('frequency').default('Quarterly'), // Monthly, Quarterly, Per Event, One-Time
  advanceBalance: integer('advance_balance').default(0), // in cents
  totalRecouped: integer('total_recouped').default(0),
  totalEarned: integer('total_earned').default(0),
  status: text('status').default('Draft'), // Active, Paused, Completed, Draft
  nextPaymentDate: date('next_payment_date'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const residualPayments = pgTable('residual_payments', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id, { onDelete: 'cascade' }),
  talentName: text('talent_name').notNull(),
  showTitle: text('show_title').notNull(),
  network: text('network'),
  reuseType: text('reuse_type'), // Network Rerun, Streaming, Cable Rerun
  scale: text('scale'), // SAG-AFTRA Scale, SAG-AFTRA Overscale
  amount: integer('amount').notNull(),
  category1099: text('category_1099').default('1099-MISC Box 2'),
  paymentDate: date('payment_date'),
  status: text('status').default('Imported'), // Imported, Verified, Paid, Disputed
  batchId: text('batch_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const supplementalPaymentsRelations = relations(supplementalPayments, ({ one }) => ({
  company: one(companies, { fields: [supplementalPayments.companyId], references: [companies.id] }),
  employee: one(employees, { fields: [supplementalPayments.employeeId], references: [employees.id] }),
  contractor: one(contractors, { fields: [supplementalPayments.contractorId], references: [contractors.id] }),
}));

export const royaltySchedulesRelations = relations(royaltySchedules, ({ one, many }) => ({
  company: one(companies, { fields: [royaltySchedules.companyId], references: [companies.id] }),
  employee: one(employees, { fields: [royaltySchedules.employeeId], references: [employees.id] }),
  contractor: one(contractors, { fields: [royaltySchedules.contractorId], references: [contractors.id] }),
  payments: many(supplementalPayments),
}));

// --- UNION PAYROLL ---

export const unions = pgTable('unions', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id, { onDelete: 'cascade' }),
  name: text('name').notNull(), // SAG-AFTRA, IATSE, WGA, DGA, etc.
  abbreviation: text('abbreviation'),
  description: text('description'),
  status: text('status').default('Active'), // Active, Inactive
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const unionContracts = pgTable('union_contracts', {
  id: serial('id').primaryKey(),
  unionId: integer('union_id').references(() => unions.id, { onDelete: 'cascade' }),
  contractName: text('contract_name').notNull(),
  duesType: text('dues_type').default('percentage'), // percentage, flat
  duesRate: real('dues_rate').notNull(), // % of earnings or flat amount in cents
  pensionRate: real('pension_rate').notNull(), // employer pension contribution %
  healthWelfareRate: real('health_welfare_rate').notNull(), // employer H&W contribution %
  workDuesRate: real('work_dues_rate').default(0), // employee-side deduction %
  effectiveDate: date('effective_date').notNull(),
  expirationDate: date('expiration_date'),
  status: text('status').default('Active'), // Active, Expired, Upcoming
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const employeeUnionMemberships = pgTable('employee_union_memberships', {
  id: serial('id').primaryKey(),
  employeeId: integer('employee_id').references(() => employees.id, { onDelete: 'cascade' }),
  unionId: integer('union_id').references(() => unions.id, { onDelete: 'cascade' }),
  membershipNumber: text('membership_number'),
  joinDate: date('join_date'),
  status: text('status').default('Active'), // Active, Inactive, On Leave
  createdAt: timestamp('created_at').defaultNow(),
});

export const unionPayrollCalculations = pgTable('union_payroll_calculations', {
  id: serial('id').primaryKey(),
  payrollId: integer('payroll_id').references(() => payrolls.id, { onDelete: 'cascade' }),
  employeeId: integer('employee_id').references(() => employees.id, { onDelete: 'cascade' }),
  unionId: integer('union_id').references(() => unions.id, { onDelete: 'cascade' }),
  contractId: integer('contract_id').references(() => unionContracts.id, { onDelete: 'set null' }),
  grossEarnings: integer('gross_earnings').notNull(), // in cents
  duesDeduction: integer('dues_deduction').default(0), // employee side
  workDuesDeduction: integer('work_dues_deduction').default(0), // employee side
  pensionContribution: integer('pension_contribution').default(0), // employer side
  healthWelfareContribution: integer('health_welfare_contribution').default(0), // employer side
  fringeContribution: integer('fringe_contribution').default(0), // employer side
  totalEmployeeDeductions: integer('total_employee_deductions').default(0),
  totalEmployerContributions: integer('total_employer_contributions').default(0),
  hoursWorked: real('hours_worked').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

export const unionContributionReports = pgTable('union_contribution_reports', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id, { onDelete: 'cascade' }),
  unionId: integer('union_id').references(() => unions.id, { onDelete: 'cascade' }),
  reportMonth: text('report_month').notNull(), // YYYY-MM
  totalEarnings: integer('total_earnings').default(0),
  totalDues: integer('total_dues').default(0),
  totalPension: integer('total_pension').default(0),
  totalHealthWelfare: integer('total_health_welfare').default(0),
  totalFringe: integer('total_fringe').default(0),
  employeeCount: integer('employee_count').default(0),
  totalHours: real('total_hours').default(0),
  status: text('status').default('Draft'), // Draft, Generated, Submitted, Confirmed
  exportFormat: text('export_format'), // SAG-AFTRA CSV, IATSE CSV, Generic CSV
  submittedAt: timestamp('submitted_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const unionFringeBenefits = pgTable('union_fringe_benefits', {
  id: serial('id').primaryKey(),
  contractId: integer('contract_id').references(() => unionContracts.id, { onDelete: 'cascade' }),
  benefitName: text('benefit_name').notNull(), // Vacation Accrual, Holiday Pay, etc.
  rate: real('rate').notNull(), // % of earnings
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
});

// --- UNION RELATIONS ---

export const unionsRelations = relations(unions, ({ one, many }) => ({
  company: one(companies, { fields: [unions.companyId], references: [companies.id] }),
  contracts: many(unionContracts),
  memberships: many(employeeUnionMemberships),
  reports: many(unionContributionReports),
}));

export const unionContractsRelations = relations(unionContracts, ({ one, many }) => ({
  union: one(unions, { fields: [unionContracts.unionId], references: [unions.id] }),
  fringeBenefits: many(unionFringeBenefits),
  calculations: many(unionPayrollCalculations),
}));

export const employeeUnionMembershipsRelations = relations(employeeUnionMemberships, ({ one }) => ({
  employee: one(employees, { fields: [employeeUnionMemberships.employeeId], references: [employees.id] }),
  union: one(unions, { fields: [employeeUnionMemberships.unionId], references: [unions.id] }),
}));

export const unionPayrollCalculationsRelations = relations(unionPayrollCalculations, ({ one }) => ({
  payroll: one(payrolls, { fields: [unionPayrollCalculations.payrollId], references: [payrolls.id] }),
  employee: one(employees, { fields: [unionPayrollCalculations.employeeId], references: [employees.id] }),
  union: one(unions, { fields: [unionPayrollCalculations.unionId], references: [unions.id] }),
  contract: one(unionContracts, { fields: [unionPayrollCalculations.contractId], references: [unionContracts.id] }),
}));

export const unionContributionReportsRelations = relations(unionContributionReports, ({ one }) => ({
  company: one(companies, { fields: [unionContributionReports.companyId], references: [companies.id] }),
  union: one(unions, { fields: [unionContributionReports.unionId], references: [unions.id] }),
}));

export const unionFringeBenefitsRelations = relations(unionFringeBenefits, ({ one }) => ({
  contract: one(unionContracts, { fields: [unionFringeBenefits.contractId], references: [unionContracts.id] }),
}));


// --- AGENCY CLIENT BILLING ---

export const agencyClients = pgTable('agency_clients', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  email: text('email'),
  contactName: text('contact_name'),
  logoUrl: text('logo_url'),
  billingRateType: text('billing_rate_type').default('cost-plus'), // cost-plus, fixed, hourly
  markupPercentage: real('markup_percentage').default(0),
  fixedFee: integer('fixed_fee').default(0),
  hourlyRate: integer('hourly_rate').default(0),
  billingCycle: text('billing_cycle').default('monthly'), // weekly, bi-weekly, monthly
  paymentTerms: text('payment_terms').default('Net 30'), // Net 15, Net 30, Net 45
  accountingSync: text('accounting_sync'), // QuickBooks, Xero
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const agencyProjects = pgTable('agency_projects', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id, { onDelete: 'cascade' }),
  clientId: integer('client_id').references(() => agencyClients.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  budget: integer('budget'), // in cents
  startDate: date('start_date'),
  endDate: date('end_date'),
  status: text('status').default('Active'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const agencyInvoices = pgTable('agency_invoices', {
  id: serial('id').primaryKey(),
  clientId: integer('client_id').references(() => agencyClients.id, { onDelete: 'cascade' }),
  companyId: integer('company_id').references(() => companies.id, { onDelete: 'cascade' }),
  invoiceNumber: text('invoice_number').notNull(),
  periodStart: date('period_start').notNull(),
  periodEnd: date('period_end').notNull(),
  amount: integer('amount').notNull(),
  status: text('status').default('Draft'), // Draft, Approved, Sent, Paid
  dueDate: date('due_date').notNull(),
  sentAt: timestamp('sent_at'),
  paidAt: timestamp('paid_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const agencyInvoiceItems = pgTable('agency_invoice_items', {
  id: serial('id').primaryKey(),
  invoiceId: integer('invoice_id').references(() => agencyInvoices.id, { onDelete: 'cascade' }),
  employeeId: integer('employee_id').references(() => employees.id, { onDelete: 'set null' }),
  description: text('description').notNull(), // e.g., "Software Engineer - Jan 1-15"
  unitPrice: integer('unit_price').default(0), // hourly rate or salary portion
  quantity: real('quantity').default(1), // hours or 1 for fixed
  cost: integer('cost').notNull(), // original cost to agency
  markup: integer('markup').default(0), // markup amount
  total: integer('total').notNull(), // cost + markup
  itemType: text('item_type').default('labor'), // labor, expense, other
});

// --- AGENCY RELATIONS ---

export const agencyClientsRelations = relations(agencyClients, ({ one, many }) => ({
  company: one(companies, { fields: [agencyClients.companyId], references: [companies.id] }),
  invoices: many(agencyInvoices),
  projects: many(agencyProjects),
}));

export const agencyProjectsRelations = relations(agencyProjects, ({ one }) => ({
  client: one(agencyClients, { fields: [agencyProjects.clientId], references: [agencyClients.id] }),
  company: one(companies, { fields: [agencyProjects.companyId], references: [companies.id] }),
}));

export const agencyInvoicesRelations = relations(agencyInvoices, ({ one, many }) => ({
  client: one(agencyClients, { fields: [agencyInvoices.clientId], references: [agencyClients.id] }),
  company: one(companies, { fields: [agencyInvoices.companyId], references: [companies.id] }),
  items: many(agencyInvoiceItems),
}));

export const agencyInvoiceItemsRelations = relations(agencyInvoiceItems, ({ one }) => ({
  invoice: one(agencyInvoices, { fields: [agencyInvoiceItems.invoiceId], references: [agencyInvoices.id] }),
  employee: one(employees, { fields: [agencyInvoiceItems.employeeId], references: [employees.id] }),
}));
