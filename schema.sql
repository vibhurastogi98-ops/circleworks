-- =============================================================================
-- 🛡️ CIRCLEWORKS DATABASE SCHEMA (Production Safe)
-- =============================================================================

-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  role TEXT CHECK(role IN ('admin','hr','employee')) DEFAULT 'employee',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. COMPANIES
CREATE TABLE IF NOT EXISTS companies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. EMPLOYEES
CREATE TABLE IF NOT EXISTS employees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  company_id INTEGER,
  name TEXT NOT NULL,
  email TEXT,
  job_title TEXT,
  department TEXT,
  salary INTEGER, -- Annual base salary
  employment_type TEXT CHECK(employment_type IN ('full-time','part-time','contractor')) DEFAULT 'full-time',
  start_date DATE,
  status TEXT CHECK(status IN ('active','onboarding','terminated')) DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 4. COMPENSATION HISTORY (For Retro Pay)
CREATE TABLE IF NOT EXISTS compensation_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  old_salary INTEGER,
  new_salary INTEGER NOT NULL,
  effective_date DATE NOT NULL,
  type TEXT CHECK(type IN ('promotion','adjustment','correction')) DEFAULT 'adjustment',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- 5. PAYROLLS
CREATE TABLE IF NOT EXISTS payrolls (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER,
  pay_period_start DATE NOT NULL,
  pay_period_end DATE NOT NULL,
  check_date DATE NOT NULL,
  total_gross INTEGER DEFAULT 0,
  total_taxes INTEGER DEFAULT 0,
  total_benefits INTEGER DEFAULT 0,
  total_net INTEGER DEFAULT 0,
  status TEXT CHECK(status IN ('draft','pending','processed','paid','cancelled')) DEFAULT 'draft',
  type TEXT CHECK(type IN ('regular','off-cycle','bonus')) DEFAULT 'regular',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 6. PAYROLL ITEMS
CREATE TABLE IF NOT EXISTS payroll_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  payroll_id INTEGER,
  employee_id INTEGER,
  gross INTEGER NOT NULL,
  federal_tax INTEGER DEFAULT 0,
  state_tax INTEGER DEFAULT 0,
  fica_ss INTEGER DEFAULT 0,
  fica_med INTEGER DEFAULT 0,
  benefits INTEGER DEFAULT 0,
  net INTEGER NOT NULL,
  type TEXT CHECK(type IN ('regular','bonus','retro','correction','severance')) DEFAULT 'regular',
  FOREIGN KEY(payroll_id) REFERENCES payrolls(id) ON DELETE CASCADE,
  FOREIGN KEY(employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- 7. TAX LIABILITIES
CREATE TABLE IF NOT EXISTS tax_liabilities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  payroll_id INTEGER,
  agency TEXT NOT NULL, -- e.g. 'IRS', 'CA EDD'
  type TEXT NOT NULL,   -- e.g. 'Federal IT', 'FICA', 'State IT'
  amount INTEGER NOT NULL,
  status TEXT CHECK(status IN ('pending','paid')) DEFAULT 'pending',
  FOREIGN KEY(payroll_id) REFERENCES payrolls(id) ON DELETE CASCADE
);

-- 8. APPROVALS
CREATE TABLE IF NOT EXISTS approvals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT CHECK(type IN ('leave','payroll','timesheet','off-cycle')),
  entity_id INTEGER, -- Related ID (e.g. payroll_id)
  status TEXT CHECK(status IN ('pending','approved','rejected')) DEFAULT 'pending',
  requested_by_user_id INTEGER,
  approved_by_user_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(requested_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY(approved_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 9. CONTACT MESSAGES
CREATE TABLE IF NOT EXISTS contact_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 🚀 MIGRATIONS (Handling Updates to Existing Tables)
-- Note: These may error if columns already exist, which is expected by D1.
-- =============================================================================

-- Add new columns to EMPLOYEES if they don't exist
ALTER TABLE employees ADD COLUMN job_title TEXT;
ALTER TABLE employees ADD COLUMN employment_type TEXT CHECK(employment_type IN ('full-time','part-time','contractor')) DEFAULT 'full-time';
ALTER TABLE employees ADD COLUMN start_date DATE;
ALTER TABLE employees ADD COLUMN status TEXT CHECK(status IN ('active','onboarding','terminated')) DEFAULT 'active';

-- Add new columns to PAYROLLS (Transitioning from old schema)
ALTER TABLE payrolls ADD COLUMN pay_period_start DATE;
ALTER TABLE payrolls ADD COLUMN pay_period_end DATE;
ALTER TABLE payrolls ADD COLUMN check_date DATE;
ALTER TABLE payrolls ADD COLUMN total_gross INTEGER DEFAULT 0;
ALTER TABLE payrolls ADD COLUMN total_taxes INTEGER DEFAULT 0;
ALTER TABLE payrolls ADD COLUMN total_benefits INTEGER DEFAULT 0;
ALTER TABLE payrolls ADD COLUMN total_net INTEGER DEFAULT 0;
ALTER TABLE payrolls ADD COLUMN type TEXT CHECK(type IN ('regular','off-cycle','bonus')) DEFAULT 'regular';

-- Add new columns to PAYROLL_ITEMS
ALTER TABLE payroll_items ADD COLUMN federal_tax INTEGER DEFAULT 0;
ALTER TABLE payroll_items ADD COLUMN state_tax INTEGER DEFAULT 0;
ALTER TABLE payroll_items ADD COLUMN fica_ss INTEGER DEFAULT 0;
ALTER TABLE payroll_items ADD COLUMN fica_med INTEGER DEFAULT 0;
ALTER TABLE payroll_items ADD COLUMN benefits INTEGER DEFAULT 0;
ALTER TABLE payroll_items ADD COLUMN type TEXT CHECK(type IN ('regular','bonus','retro','correction','severance')) DEFAULT 'regular';

-- Add new columns to APPROVALS
ALTER TABLE approvals ADD COLUMN entity_id INTEGER;
ALTER TABLE approvals ADD COLUMN requested_by_user_id INTEGER;
ALTER TABLE approvals ADD COLUMN approved_by_user_id INTEGER;

-- =============================================================================
-- 🎯 ATS & HIRING MODULE
-- =============================================================================

-- 10. ATS JOBS
CREATE TABLE IF NOT EXISTS ats_jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER,
  title TEXT NOT NULL,
  department TEXT,
  location TEXT,
  employment_type TEXT,
  status TEXT CHECK(status IN ('Draft','Active','Paused','Closed')) DEFAULT 'Draft',
  salary_min INTEGER,
  salary_max INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 11. ATS CANDIDATES (Applicants)
CREATE TABLE IF NOT EXISTS ats_candidates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_id INTEGER NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  source TEXT, -- e.g., 'LinkedIn', 'Referral'
  stage TEXT DEFAULT 'New', -- Mapped to kanban columns
  ai_score INTEGER,
  rating INTEGER,
  resume_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(job_id) REFERENCES ats_jobs(id) ON DELETE CASCADE
);

-- 12. ATS INTERVIEWS
CREATE TABLE IF NOT EXISTS ats_interviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  candidate_id INTEGER NOT NULL,
  scheduled_at DATETIME NOT NULL,
  status TEXT CHECK(status IN ('Scheduled','Completed','Cancelled')) DEFAULT 'Scheduled',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(candidate_id) REFERENCES ats_candidates(id) ON DELETE CASCADE
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_ats_candidates_job_id ON ats_candidates(job_id);
CREATE INDEX IF NOT EXISTS idx_ats_interviews_candidate_id ON ats_interviews(candidate_id);

-- =============================================================================
-- 🚀 ONBOARDING & OFFBOARDING MODULE
-- =============================================================================

-- 13. ONBOARDING TEMPLATES
CREATE TABLE IF NOT EXISTS onboarding_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER,
  name TEXT NOT NULL,
  type TEXT CHECK(type IN ('onboarding','offboarding')) DEFAULT 'onboarding',
  department TEXT, -- optional department rule
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 14. ONBOARDING TASKS (belongs to template)
CREATE TABLE IF NOT EXISTS onboarding_tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  template_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  assignee_role TEXT CHECK(assignee_role IN ('HR','Manager','IT','Employee')) DEFAULT 'HR',
  due_offset_days INTEGER DEFAULT 0, -- e.g. -3 = 3 days before start
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(template_id) REFERENCES onboarding_templates(id) ON DELETE CASCADE
);

-- 15. ONBOARDING CASES (instance per employee)
CREATE TABLE IF NOT EXISTS onboarding_cases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  template_id INTEGER,
  type TEXT CHECK(type IN ('onboarding','offboarding')) DEFAULT 'onboarding',
  status TEXT CHECK(status IN ('Active','Completed','Cancelled')) DEFAULT 'Active',
  start_date DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY(template_id) REFERENCES onboarding_templates(id) ON DELETE SET NULL
);

-- 16. ONBOARDING CASE TASKS (instance per task per case)
CREATE TABLE IF NOT EXISTS onboarding_case_tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  case_id INTEGER NOT NULL,
  task_id INTEGER,
  title TEXT NOT NULL,
  assignee_role TEXT DEFAULT 'HR',
  status TEXT CHECK(status IN ('Pending','Complete','Skipped')) DEFAULT 'Pending',
  due_date DATE,
  completed_at DATETIME,
  FOREIGN KEY(case_id) REFERENCES onboarding_cases(id) ON DELETE CASCADE,
  FOREIGN KEY(task_id) REFERENCES onboarding_tasks(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_onboarding_cases_employee ON onboarding_cases(employee_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_case_tasks_case ON onboarding_case_tasks(case_id);

-- =============================================================================
-- 📊 BENEFITS MODULE
-- =============================================================================

-- 17. BENEFIT PLANS
CREATE TABLE IF NOT EXISTS benefit_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER,
  name TEXT NOT NULL,
  type TEXT CHECK(type IN ('Medical','Dental','Vision','Life','AD&D','STD','LTD','FSA','HSA','401k','WC')) NOT NULL,
  carrier TEXT,
  employee_premium INTEGER DEFAULT 0,
  employer_premium INTEGER DEFAULT 0,
  effective_start DATE,
  effective_end DATE,
  eligibility TEXT DEFAULT 'All',
  status TEXT CHECK(status IN ('Active','Inactive','Pending')) DEFAULT 'Active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 18. BENEFIT ENROLLMENTS
CREATE TABLE IF NOT EXISTS benefit_enrollments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plan_id INTEGER NOT NULL,
  employee_id INTEGER NOT NULL,
  status TEXT CHECK(status IN ('Enrolled','Waived','Pending','Terminated')) DEFAULT 'Pending',
  enrolled_at DATETIME,
  coverage_level TEXT, -- e.g. 'Employee Only', 'Employee + Spouse'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(plan_id) REFERENCES benefit_plans(id) ON DELETE CASCADE,
  FOREIGN KEY(employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- 19. COBRA CASES
CREATE TABLE IF NOT EXISTS cobra_cases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  status TEXT CHECK(status IN ('Eligible','Notified','Elected','Declined','Active','Terminated')) DEFAULT 'Eligible',
  qualifying_event TEXT,
  notice_sent_date DATE,
  election_deadline DATE,
  premium_amount INTEGER DEFAULT 0,
  payment_status TEXT CHECK(payment_status IN ('Current','Past Due','Unpaid')) DEFAULT 'Unpaid',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_benefit_enrollments_plan ON benefit_enrollments(plan_id);
CREATE INDEX IF NOT EXISTS idx_benefit_enrollments_emp ON benefit_enrollments(employee_id);
CREATE INDEX IF NOT EXISTS idx_cobra_cases_emp ON cobra_cases(employee_id);

-- =============================================================================
-- ⏱️ TIME & SCHEDULING MODULE
-- =============================================================================

-- 20. TIME POLICIES
CREATE TABLE IF NOT EXISTS time_policies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER,
  name TEXT NOT NULL,
  default_rest_break_mins INTEGER DEFAULT 15,
  default_meal_break_mins INTEGER DEFAULT 30,
  overtime_threshold_daily INTEGER DEFAULT 8,
  overtime_threshold_weekly INTEGER DEFAULT 40,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 21. TIMESHEETS
CREATE TABLE IF NOT EXISTS timesheets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  company_id INTEGER,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_regular_hours REAL DEFAULT 0,
  total_overtime_hours REAL DEFAULT 0,
  total_double_time_hours REAL DEFAULT 0,
  status TEXT CHECK(status IN ('Draft','Submitted','Approved','Rejected')) DEFAULT 'Draft',
  submitted_at DATETIME,
  approved_at DATETIME,
  approver_id INTEGER,
  approver_note TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY(approver_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 22. TIME ENTRIES (Clock In/Out)
CREATE TABLE IF NOT EXISTS time_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  timesheet_id INTEGER,
  clock_in DATETIME NOT NULL,
  clock_out DATETIME,
  entry_type TEXT CHECK(entry_type IN ('Regular','PTO','Sick','Holiday')) DEFAULT 'Regular',
  location_id TEXT, -- e.g. "HQ", "Remote", Kiosk ID
  device_info TEXT, -- e.g. "Kiosk-1" or "Mobile App"
  created_by_id INTEGER, -- If manager manually entered
  status TEXT CHECK(status IN ('Pending','Approved','Rejected')) DEFAULT 'Approved',
  edited_reason TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY(timesheet_id) REFERENCES timesheets(id) ON DELETE SET NULL
);

-- 23. TIME BREAKS
CREATE TABLE IF NOT EXISTS time_breaks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  time_entry_id INTEGER NOT NULL,
  break_start DATETIME NOT NULL,
  break_end DATETIME,
  break_type TEXT CHECK(break_type IN ('Meal','Rest')) DEFAULT 'Meal',
  paid BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(time_entry_id) REFERENCES time_entries(id) ON DELETE CASCADE
);

-- 24. SHIFTS (Schedules)
CREATE TABLE IF NOT EXISTS shifts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER,
  employee_id INTEGER, -- NULL if Open Shift
  shift_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  role TEXT,
  location TEXT,
  status TEXT CHECK(status IN ('Scheduled','Published','Open','Claimed','Completed')) DEFAULT 'Scheduled',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY(employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Indexes for Time Module
CREATE INDEX IF NOT EXISTS idx_timesheets_emp ON timesheets(employee_id);
CREATE INDEX IF NOT EXISTS idx_timesheets_period ON timesheets(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_time_entries_emp ON time_entries(employee_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_clock_in ON time_entries(clock_in);
CREATE INDEX IF NOT EXISTS idx_shifts_emp ON shifts(employee_id);
CREATE INDEX IF NOT EXISTS idx_shifts_date ON shifts(shift_date);

-- =============================================================================
-- 💸 EXPENSES & MILEAGE MODULE
-- =============================================================================

-- 25. EXPENSE REPORTS
CREATE TABLE IF NOT EXISTS expense_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  company_id INTEGER,
  title TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  total_amount INTEGER DEFAULT 0,
  status TEXT CHECK(status IN ('Draft','Submitted','Approved','Rejected','Paid')) DEFAULT 'Draft',
  sync_status TEXT CHECK(sync_status IN ('Synced','Pending','Error','N/A')) DEFAULT 'N/A',
  submitted_at DATETIME,
  approved_at DATETIME,
  paid_at DATETIME,
  rejection_note TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 26. EXPENSE ITEMS
CREATE TABLE IF NOT EXISTS expense_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  report_id INTEGER NOT NULL,
  date DATE NOT NULL,
  merchant TEXT NOT NULL,
  category TEXT NOT NULL,
  amount INTEGER NOT NULL,
  description TEXT,
  receipt_url TEXT,
  policy_status TEXT CHECK(policy_status IN ('Pass','Warn','Flag','Block')) DEFAULT 'Pass',
  policy_note TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(report_id) REFERENCES expense_reports(id) ON DELETE CASCADE
);

-- 27. EXPENSE POLICIES
CREATE TABLE IF NOT EXISTS expense_policies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER,
  category TEXT NOT NULL,
  limit_amount INTEGER NOT NULL,
  period TEXT CHECK(period IN ('Per Day','Per Trip','Per Month','Per Expense')) DEFAULT 'Per Expense',
  receipt_threshold INTEGER DEFAULT 0,
  pre_approval_threshold INTEGER,
  violation_action TEXT CHECK(violation_action IN ('Warn','Block','Flag')) DEFAULT 'Warn',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 28. MILEAGE LOGS
CREATE TABLE IF NOT EXISTS mileage_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  company_id INTEGER,
  date DATE NOT NULL,
  from_location TEXT NOT NULL,
  to_location TEXT NOT NULL,
  miles REAL NOT NULL,
  purpose TEXT,
  rate_per_mile REAL DEFAULT 0.67,
  calculated_reimbursement REAL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Indexes for Expense Module
CREATE INDEX IF NOT EXISTS idx_expense_reports_emp ON expense_reports(employee_id);
CREATE INDEX IF NOT EXISTS idx_expense_items_report ON expense_items(report_id);
CREATE INDEX IF NOT EXISTS idx_mileage_logs_emp ON mileage_logs(employee_id);
CREATE INDEX IF NOT EXISTS idx_expense_policies_company ON expense_policies(company_id);
