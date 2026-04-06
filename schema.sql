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

-- =============================================================================
-- 📈 PERFORMANCE MODULE
-- =============================================================================

-- 29. PERFORMANCE REVIEW CYCLES
CREATE TABLE IF NOT EXISTS perf_review_cycles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  type TEXT CHECK(type IN ('Annual','Quarterly','Probation','Project')) DEFAULT 'Quarterly',
  status TEXT CHECK(status IN ('Draft','Active','Completed','Cancelled')) DEFAULT 'Draft',
  period_start DATE,
  period_end DATE,
  deadline DATE,
  visibility_rules TEXT DEFAULT 'Manager Only', -- e.g. 'Manager + Admin', 'Shared with Employee'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 30. PERFORMANCE REVIEWS (Instances per cycle per employee)
CREATE TABLE IF NOT EXISTS perf_reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cycle_id INTEGER NOT NULL,
  employee_id INTEGER NOT NULL,
  manager_id INTEGER,
  status TEXT CHECK(status IN ('Not Started','In Progress','Submitted','Completed')) DEFAULT 'Not Started',
  overall_rating REAL, -- e.g. 1-5
  manager_comments TEXT,
  employee_self_comments TEXT,
  submitted_at DATETIME,
  completed_at DATETIME,
  FOREIGN KEY(cycle_id) REFERENCES perf_review_cycles(id) ON DELETE CASCADE,
  FOREIGN KEY(employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY(manager_id) REFERENCES employees(id) ON DELETE SET NULL
);

-- 31. PERFORMANCE GOALS (OKRs)
CREATE TABLE IF NOT EXISTS perf_goals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER, -- NULL if Company-wide
  company_id INTEGER,
  parent_goal_id INTEGER, -- For OKR tree (Company -> Team -> Individual)
  title TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK(type IN ('Company','Team','Individual')) DEFAULT 'Individual',
  status TEXT CHECK(status IN ('On Track','At Risk','Behind','Completed','Cancelled')) DEFAULT 'On Track',
  progress_percent INTEGER DEFAULT 0,
  due_date DATE,
  is_private BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY(parent_goal_id) REFERENCES perf_goals(id) ON DELETE SET NULL
);

-- 32. PERFORMANCE FEEDBACK REQUESTS (360 Feedback)
CREATE TABLE IF NOT EXISTS perf_feedback_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  requester_id INTEGER NOT NULL,
  provider_id INTEGER NOT NULL,
  subject_id INTEGER NOT NULL, -- The employee being reviewed
  status TEXT CHECK(status IN ('Pending','Declined','Submitted')) DEFAULT 'Pending',
  is_anonymous BOOLEAN DEFAULT 0,
  questions TEXT, -- JSON array of questions
  responses TEXT, -- JSON array of responses
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  submitted_at DATETIME,
  FOREIGN KEY(requester_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY(provider_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY(subject_id) REFERENCES employees(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_perf_reviews_cycle ON perf_reviews(cycle_id);
CREATE INDEX IF NOT EXISTS idx_perf_goals_parent ON perf_goals(parent_goal_id);

-- =============================================================================
-- 🎓 LEARNING MODULE (LMS)
-- =============================================================================

-- 33. LMS COURSES
CREATE TABLE IF NOT EXISTS lms_courses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  thumbnail_url TEXT,
  duration_mins INTEGER,
  is_mandatory BOOLEAN DEFAULT 0,
  status TEXT CHECK(status IN ('Draft','Published','Archived')) DEFAULT 'Draft',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 34. LMS MODULES
CREATE TABLE IF NOT EXISTS lms_modules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  type TEXT CHECK(type IN ('Video','PDF','Quiz','Text')) NOT NULL,
  content_url TEXT, -- URL to video or PDF
  body_text TEXT, -- For 'Text' type
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(course_id) REFERENCES lms_courses(id) ON DELETE CASCADE
);

-- 35. LMS ENROLLMENTS
CREATE TABLE IF NOT EXISTS lms_enrollments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER NOT NULL,
  employee_id INTEGER NOT NULL,
  status TEXT CHECK(status IN ('Not Started','In Progress','Completed')) DEFAULT 'Not Started',
  progress_percent INTEGER DEFAULT 0,
  started_at DATETIME,
  completed_at DATETIME,
  certificate_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(course_id) REFERENCES lms_courses(id) ON DELETE CASCADE,
  FOREIGN KEY(employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- 36. LMS ASSIGNMENTS
CREATE TABLE IF NOT EXISTS lms_assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER NOT NULL,
  assignee_id INTEGER NOT NULL, -- employee_id
  assigned_by_id INTEGER, -- HR or Manager user_id
  due_date DATE,
  remainder_sent_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(course_id) REFERENCES lms_courses(id) ON DELETE CASCADE,
  FOREIGN KEY(assignee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY(assigned_by_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_lms_modules_course ON lms_modules(course_id);
CREATE INDEX IF NOT EXISTS idx_lms_enrollments_emp ON lms_enrollments(employee_id);

-- =============================================================================
-- 🧑‍💼 EMPLOYEE SELF-SERVICE PORTAL
-- =============================================================================

-- 37. PTO REQUESTS
CREATE TABLE IF NOT EXISTS pto_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  company_id INTEGER,
  type TEXT CHECK(type IN ('Vacation','Sick','Personal','Bereavement','Jury Duty')) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  working_days INTEGER DEFAULT 1,
  note TEXT,
  status TEXT CHECK(status IN ('Pending','Approved','Denied','Cancelled')) DEFAULT 'Pending',
  approver_id INTEGER,
  approver_note TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY(approver_id) REFERENCES employees(id) ON DELETE SET NULL
);

-- 38. EMPLOYEE EXPENSE REPORTS (Self-Service)
CREATE TABLE IF NOT EXISTS employee_expense_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  company_id INTEGER,
  title TEXT NOT NULL,
  total_amount INTEGER DEFAULT 0,
  status TEXT CHECK(status IN ('Draft','Submitted','Approved','Processing','Paid','Rejected')) DEFAULT 'Draft',
  submitted_at DATETIME,
  approved_at DATETIME,
  paid_at DATETIME,
  rejection_note TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 39. EMPLOYEE EXPENSES (Line Items)
CREATE TABLE IF NOT EXISTS employee_expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  report_id INTEGER,
  employee_id INTEGER NOT NULL,
  date DATE NOT NULL,
  merchant TEXT NOT NULL,
  amount INTEGER NOT NULL,
  category TEXT NOT NULL,
  purpose TEXT NOT NULL,
  receipt_url TEXT,
  status TEXT CHECK(status IN ('Draft','Submitted','Approved','Rejected','Paid')) DEFAULT 'Draft',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(report_id) REFERENCES employee_expense_reports(id) ON DELETE SET NULL,
  FOREIGN KEY(employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- 40. EWA REQUESTS (Earned Wage Access)
CREATE TABLE IF NOT EXISTS ewa_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  fee INTEGER DEFAULT 0,
  status TEXT CHECK(status IN ('Processing','Completed','Failed','Cancelled')) DEFAULT 'Processing',
  repayment_date DATE,
  repayment_payroll_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY(repayment_payroll_id) REFERENCES payrolls(id) ON DELETE SET NULL
);

-- 41. EMPLOYEE REFERRALS
CREATE TABLE IF NOT EXISTS employee_referrals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  referrer_id INTEGER NOT NULL,
  company_id INTEGER,
  candidate_name TEXT NOT NULL,
  candidate_email TEXT,
  position TEXT NOT NULL,
  status TEXT CHECK(status IN ('Applied','Interviewing','Hired','Rejected')) DEFAULT 'Applied',
  bonus_amount INTEGER DEFAULT 0,
  bonus_status TEXT CHECK(bonus_status IN ('Pending','Paid','N/A')) DEFAULT 'N/A',
  referred_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(referrer_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 42. KUDOS / RECOGNITION
CREATE TABLE IF NOT EXISTS kudos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  from_employee_id INTEGER NOT NULL,
  to_employee_id INTEGER NOT NULL,
  message TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(from_employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY(to_employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- 43. COMPANY ANNOUNCEMENTS
CREATE TABLE IF NOT EXISTS company_announcements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  published_by_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY(published_by_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 44. EMPLOYEE DOCUMENTS (Self-Service)
CREATE TABLE IF NOT EXISTS employee_documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  company_id INTEGER,
  name TEXT NOT NULL,
  type TEXT CHECK(type IN ('Company Policy','Personal','Pay Stub','Tax Form','Signed Document')) NOT NULL,
  category TEXT,
  file_url TEXT,
  file_size TEXT,
  uploaded_by TEXT DEFAULT 'HR',
  status TEXT CHECK(status IN ('Signed','Pending Signature','Read','Unread')) DEFAULT 'Unread',
  signed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 45. EMPLOYEE BANK ACCOUNTS
CREATE TABLE IF NOT EXISTS employee_bank_accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  bank_name TEXT NOT NULL,
  routing_number TEXT NOT NULL,
  account_number_masked TEXT NOT NULL,
  account_type TEXT CHECK(account_type IN ('Checking','Savings')) DEFAULT 'Checking',
  is_primary BOOLEAN DEFAULT 1,
  verified BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- 46. PTO BALANCES
CREATE TABLE IF NOT EXISTS pto_balances (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  type TEXT CHECK(type IN ('Vacation','Sick','Personal','Bereavement')) NOT NULL,
  total_days REAL DEFAULT 0,
  used_days REAL DEFAULT 0,
  accrual_rate TEXT,
  year INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Indexes for Employee Portal
CREATE INDEX IF NOT EXISTS idx_pto_requests_emp ON pto_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_pto_requests_status ON pto_requests(status);
CREATE INDEX IF NOT EXISTS idx_employee_expenses_emp ON employee_expenses(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_expense_reports_emp ON employee_expense_reports(employee_id);
CREATE INDEX IF NOT EXISTS idx_ewa_requests_emp ON ewa_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_referrals_referrer ON employee_referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_kudos_to ON kudos(to_employee_id);
CREATE INDEX IF NOT EXISTS idx_company_announcements_company ON company_announcements(company_id);
CREATE INDEX IF NOT EXISTS idx_employee_documents_emp ON employee_documents(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_bank_accounts_emp ON employee_bank_accounts(employee_id);
CREATE INDEX IF NOT EXISTS idx_pto_balances_emp ON pto_balances(employee_id);

-- =============================================================================
-- 🔔 IN-APP NOTIFICATIONS MODULE
-- =============================================================================

-- 47. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER,
  employee_id INTEGER NOT NULL,
  type TEXT CHECK(type IN ('ALL','PAYROLL','HR','APPROVALS','ATS','ONBOARDING','BENEFITS','COMPLIANCE','SYSTEM','INFO')) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  link TEXT,
  status TEXT, -- Optional, used for approval states ('pending','approved','rejected')
  is_read BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY(employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notifications_emp ON notifications(employee_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
