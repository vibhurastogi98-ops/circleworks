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

-- =============================================================================
-- 📄 YEAR-END & QUARTERLY TAX MODULE (SECTION 17)
-- =============================================================================

-- 48. W2 FORMS
CREATE TABLE IF NOT EXISTS w2_forms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL,
  employee_id INTEGER NOT NULL,
  tax_year INTEGER NOT NULL,
  box_1_wages INTEGER DEFAULT 0,
  box_2_fed_tax INTEGER DEFAULT 0,
  box_3_ss_wages INTEGER DEFAULT 0,
  box_4_ss_tax INTEGER DEFAULT 0,
  box_5_med_wages INTEGER DEFAULT 0,
  box_6_med_tax INTEGER DEFAULT 0,
  status TEXT CHECK(status IN ('Draft','Reviewed','Filed','Distributed')) DEFAULT 'Draft',
  xml_data TEXT, -- Optional XML generated for SSA filing
  pdf_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY(employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- 49. TAX RECONCILIATIONS (Form 941 / Quarterly)
CREATE TABLE IF NOT EXISTS tax_reconciliations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL,
  quarter INTEGER CHECK(quarter IN (1, 2, 3, 4)) NOT NULL,
  tax_year INTEGER NOT NULL,
  expected_deposits INTEGER DEFAULT 0,
  actual_deposits INTEGER DEFAULT 0,
  variance INTEGER DEFAULT 0,
  status TEXT CHECK(status IN ('Pending','Reconciled','Discrepancy')) DEFAULT 'Pending',
  worksheet_url TEXT, -- URL to generated 941 worksheet PDF
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_w2_forms_emp ON w2_forms(employee_id, tax_year);
CREATE INDEX IF NOT EXISTS idx_tax_reconciliations_company ON tax_reconciliations(company_id, tax_year, quarter);

-- =============================================================================
-- 🚀 PRE-BOARDING PORTAL (SECTION 20)
-- =============================================================================

-- 50. PRE-BOARDING INVITATIONS
CREATE TABLE IF NOT EXISTS preboarding_invitations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  status TEXT CHECK(status IN ('Pending','Completed','Expired')) DEFAULT 'Pending',
  start_date DATE NOT NULL,
  manager_id INTEGER,
  employee_id INTEGER, -- Filled once account is created
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY(manager_id) REFERENCES employees(id) ON DELETE SET NULL,
  FOREIGN KEY(employee_id) REFERENCES employees(id) ON DELETE SET NULL
);

-- 51. I9 VERIFICATIONS
CREATE TABLE IF NOT EXISTS i9_verifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL UNIQUE,
  citizenship_status TEXT,
  attested BOOLEAN DEFAULT 0,
  attested_at DATETIME,
  section_2_completed BOOLEAN DEFAULT 0,
  section_2_completed_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY(section_2_completed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 52. W4 FORMS
CREATE TABLE IF NOT EXISTS w4_forms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL UNIQUE,
  filing_status TEXT,
  multiple_jobs BOOLEAN DEFAULT 0,
  claim_dependents INTEGER DEFAULT 0,
  other_income INTEGER DEFAULT 0,
  deductions INTEGER DEFAULT 0,
  extra_withholding INTEGER DEFAULT 0,
  exempt BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_preboarding_invitations_token ON preboarding_invitations(token);
CREATE INDEX IF NOT EXISTS idx_i9_verifications_emp ON i9_verifications(employee_id);
CREATE INDEX IF NOT EXISTS idx_w4_forms_emp ON w4_forms(employee_id);

-- =============================================================================
-- 📊 REPORTS MODULE (SECTION 26)
-- =============================================================================

-- 53. SAVED CUSTOM REPORTS
--     Stores user-built custom report configurations.
CREATE TABLE IF NOT EXISTS saved_custom_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  data_source TEXT NOT NULL,         -- payroll | employees | time | benefits | expenses | ats
  fields TEXT NOT NULL,              -- JSON array of field IDs selected by the user
  visibility TEXT CHECK(visibility IN ('private','team','org')) DEFAULT 'private',
  created_by TEXT,                   -- Clerk user ID or display name
  last_run DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 54. HEADCOUNT FORECASTS
--     Month-by-month projected headcount, hire plans, and budget impact.
CREATE TABLE IF NOT EXISTS headcount_forecasts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL,
  month TEXT NOT NULL,               -- YYYY-MM format
  projected_count INTEGER NOT NULL,
  planned_hires INTEGER DEFAULT 0,
  attrition_rate REAL DEFAULT 0,     -- Decimal (e.g. 0.05 = 5%)
  budget_impact INTEGER DEFAULT 0,   -- Estimated cost delta in cents
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_saved_custom_reports_company ON saved_custom_reports(company_id);
CREATE INDEX IF NOT EXISTS idx_headcount_forecasts_company  ON headcount_forecasts(company_id, month);

-- =============================================================================
-- 🔗 WEBHOOKS MODULE (SECTION 35)
-- =============================================================================

-- 55. WEBHOOK REGISTRATIONS
--     Stores per-company webhook endpoint URLs, signing secrets, and delivery health.
--     Supported events:
--       employee.created | employee.terminated | payroll.completed |
--       document.signed  | candidate.hired
--
--     Delivery: POST to `url`, signature in X-CircleWorks-Signature (HMAC-SHA256).
CREATE TABLE IF NOT EXISTS webhook_registrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL,
  url TEXT NOT NULL,                      -- Customer-provided HTTPS endpoint
  secret TEXT NOT NULL,                   -- HMAC-SHA256 signing secret
  events TEXT NOT NULL,                   -- JSON array, e.g. '["employee.created","payroll.completed"]'
  description TEXT,                       -- Optional human-readable label
  active BOOLEAN DEFAULT 1,
  last_delivery_at DATETIME,              -- Timestamp of most recent delivery attempt
  last_delivery_status INTEGER,           -- HTTP status code of last delivery (200, 4xx, 5xx)
  failure_count INTEGER DEFAULT 0,        -- Consecutive delivery failures; auto-deactivate at threshold
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_webhook_registrations_company ON webhook_registrations(company_id);
CREATE INDEX IF NOT EXISTS idx_webhook_registrations_active  ON webhook_registrations(active);
-- =============================================================================
-- 🏗️ PROJECTS & BILLING
-- =============================================================================

CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER,
  name TEXT NOT NULL,
  client_name TEXT,
  code TEXT,
  billing_rate INTEGER,
  budget_hours INTEGER,
  is_billable BOOLEAN DEFAULT 1,
  status TEXT DEFAULT 'Active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS project_assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  employee_id INTEGER NOT NULL,
  assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY(employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_projects_company ON projects(company_id);
CREATE INDEX IF NOT EXISTS idx_project_assignments_project ON project_assignments(project_id);
CREATE INDEX IF NOT EXISTS idx_project_assignments_emp ON project_assignments(employee_id);

-- =============================================================================
-- 🧑‍💼 ATS OFFERS
-- =============================================================================

CREATE TABLE IF NOT EXISTS ats_offers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  candidate_id INTEGER NOT NULL,
  job_id INTEGER NOT NULL,
  salary INTEGER,
  signing_bonus INTEGER,
  equity TEXT,
  start_date DATE,
  title TEXT,
  department_id TEXT,
  location_id TEXT,
  employment_type TEXT DEFAULT 'full-time',
  status TEXT CHECK(status IN ('Pending','Accepted','Declined','Withdrawn')) DEFAULT 'Pending',
  sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  responded_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(candidate_id) REFERENCES ats_candidates(id) ON DELETE CASCADE,
  FOREIGN KEY(job_id) REFERENCES ats_jobs(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ats_offers_candidate ON ats_offers(candidate_id);

-- =============================================================================
-- 📢 ANNOUNCEMENTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS announcements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  audience TEXT DEFAULT 'All Employees',
  department TEXT,
  location TEXT,
  priority TEXT CHECK(priority IN ('Normal','Important','Urgent')) DEFAULT 'Normal',
  status TEXT CHECK(status IN ('Draft','Scheduled','Published','Expired')) DEFAULT 'Draft',
  publish_at DATETIME,
  expire_at DATETIME,
  is_pinned BOOLEAN DEFAULT 0,
  attachments TEXT,
  views_count INTEGER DEFAULT 0,
  unique_readers INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS announcement_reads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  announcement_id INTEGER NOT NULL,
  employee_id INTEGER NOT NULL,
  read_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(announcement_id) REFERENCES announcements(id) ON DELETE CASCADE,
  FOREIGN KEY(employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_announcements_company ON announcements(company_id);
CREATE INDEX IF NOT EXISTS idx_announcement_reads_ann ON announcement_reads(announcement_id);

-- =============================================================================
-- 💻 ASSETS & EQUIPMENT
-- =============================================================================

CREATE TABLE IF NOT EXISTS assets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'Laptop',
  serial_number TEXT,
  status TEXT CHECK(status IN ('Available','Assigned','In Repair','Retired')) DEFAULT 'Available',
  purchase_date DATE,
  value INTEGER,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS asset_assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  asset_id INTEGER NOT NULL,
  employee_id INTEGER NOT NULL,
  assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  returned_at DATETIME,
  assigned_by TEXT,
  status TEXT CHECK(status IN ('Active','Returned','Overdue')) DEFAULT 'Active',
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(asset_id) REFERENCES assets(id) ON DELETE CASCADE,
  FOREIGN KEY(employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_assets_company ON assets(company_id);
CREATE INDEX IF NOT EXISTS idx_asset_assignments_asset ON asset_assignments(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_assignments_emp ON asset_assignments(employee_id);

-- =============================================================================
-- 🤝 CONTRACTORS & 1099
-- =============================================================================

CREATE TABLE IF NOT EXISTS contractors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER,
  name TEXT NOT NULL,
  business_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  status TEXT CHECK(status IN ('Active','Onboarding','Pending','Inactive')) DEFAULT 'Onboarding',
  w9_status TEXT DEFAULT 'Not Submitted',
  tin_masked TEXT,
  tin_type TEXT,
  onboarding_step TEXT DEFAULT 'Invited',
  ytd_payments INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS contracts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contractor_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  rate INTEGER NOT NULL,
  rate_unit TEXT DEFAULT '/hr',
  start_date DATE NOT NULL,
  end_date DATE,
  payment_terms TEXT DEFAULT 'Net 30',
  status TEXT CHECK(status IN ('Draft','Pending Signature','Active','Expired','Terminated')) DEFAULT 'Draft',
  signed_by_admin BOOLEAN DEFAULT 0,
  signed_by_contractor BOOLEAN DEFAULT 0,
  signed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(contractor_id) REFERENCES contractors(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS contractor_invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contractor_id INTEGER NOT NULL,
  invoice_number TEXT NOT NULL,
  amount INTEGER NOT NULL,
  description TEXT,
  submitted_date DATE NOT NULL,
  due_date DATE NOT NULL,
  status TEXT CHECK(status IN ('Pending','Approved','Revision Requested','Rejected','Paid')) DEFAULT 'Pending',
  hours REAL,
  rate INTEGER,
  attachment_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(contractor_id) REFERENCES contractors(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS necs_1099 (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contractor_id INTEGER NOT NULL,
  tax_year INTEGER NOT NULL,
  box1_amount INTEGER NOT NULL,
  status TEXT CHECK(status IN ('Draft','Ready','Filed','Delivered')) DEFAULT 'Draft',
  delivery_method TEXT DEFAULT 'E-Delivery',
  tin TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(contractor_id) REFERENCES contractors(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_contractors_company ON contractors(company_id);
CREATE INDEX IF NOT EXISTS idx_contracts_contractor ON contracts(contractor_id);
CREATE INDEX IF NOT EXISTS idx_contractor_invoices_contractor ON contractor_invoices(contractor_id);
CREATE INDEX IF NOT EXISTS idx_necs_1099_contractor ON necs_1099(contractor_id, tax_year);

-- =============================================================================
-- 📋 TAX FILINGS & COMPLIANCE
-- =============================================================================

CREATE TABLE IF NOT EXISTS tax_filings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER,
  form_name TEXT NOT NULL,
  form_number TEXT NOT NULL,
  jurisdiction TEXT NOT NULL,
  due_date DATE NOT NULL,
  status TEXT CHECK(status IN ('filed','upcoming','overdue')) DEFAULT 'upcoming',
  filed_date DATE,
  confirmation_number TEXT,
  amount INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sui_rates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER,
  state TEXT NOT NULL,
  state_abbr TEXT NOT NULL,
  tax_year INTEGER NOT NULL,
  rate REAL NOT NULL,
  wage_base INTEGER NOT NULL,
  source TEXT DEFAULT 'State Portal',
  date_updated DATE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS i9_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  i9_status TEXT DEFAULT 'pending',
  expiration_date DATE,
  section3_complete BOOLEAN DEFAULT 0,
  e_verify_status TEXT DEFAULT 'not_submitted',
  e_verify_case_number TEXT,
  document_type TEXT,
  last_audit_date DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS aca_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  status TEXT NOT NULL,
  hours_per_week INTEGER,
  coverage_offered BOOLEAN DEFAULT 0,
  affordable BOOLEAN DEFAULT 0,
  minimum_value BOOLEAN DEFAULT 0,
  form_1095c_code TEXT,
  form_1095c_status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS labor_posters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER,
  name TEXT NOT NULL,
  jurisdiction TEXT NOT NULL,
  status TEXT CHECK(status IN ('current','update_available','ordered','expired')) DEFAULT 'current',
  last_updated DATE,
  effective_date DATE,
  category TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS handbook_versions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER,
  version TEXT NOT NULL,
  published_date DATE NOT NULL,
  published_by TEXT,
  change_notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS handbook_sections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER,
  title TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  state_specific TEXT,
  last_modified DATE,
  word_count INTEGER DEFAULT 0,
  content TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS wotc_screenings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  questionnaire_complete BOOLEAN DEFAULT 0,
  eligible BOOLEAN DEFAULT 0,
  target_group TEXT,
  estimated_credit INTEGER DEFAULT 0,
  form_8850_generated BOOLEAN DEFAULT 0,
  submission_status TEXT DEFAULT 'not_applicable',
  submission_date DATE,
  state_agency TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tax_filings_company ON tax_filings(company_id, due_date);
CREATE INDEX IF NOT EXISTS idx_sui_rates_company ON sui_rates(company_id, tax_year);
CREATE INDEX IF NOT EXISTS idx_i9_records_emp ON i9_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_aca_records_emp ON aca_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_wotc_screenings_emp ON wotc_screenings(employee_id);

-- =============================================================================
-- 💰 STATE PAID LEAVE & ACCOUNTING
-- =============================================================================

CREATE TABLE IF NOT EXISTS paid_leave_programs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  state_code TEXT NOT NULL,
  program_name TEXT NOT NULL,
  employee_rate REAL NOT NULL,
  employer_rate REAL NOT NULL,
  wage_base INTEGER NOT NULL,
  last_updated DATE,
  alert TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS company_paid_leave (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL,
  program_id INTEGER NOT NULL,
  custom_employer_rate REAL,
  status TEXT DEFAULT 'Active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY(program_id) REFERENCES paid_leave_programs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS accounting_firms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  logo_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS firm_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  firm_id INTEGER,
  role TEXT DEFAULT 'member',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(firm_id) REFERENCES accounting_firms(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS firm_clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  firm_id INTEGER,
  company_id INTEGER,
  status TEXT DEFAULT 'Active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(firm_id) REFERENCES accounting_firms(id) ON DELETE CASCADE,
  FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- =============================================================================
-- 🎯 PERFORMANCE & GOALS
-- =============================================================================

CREATE TABLE IF NOT EXISTS performance_cycles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT CHECK(status IN ('Draft','Active','Closed')) DEFAULT 'Draft',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS performance_reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cycle_id INTEGER,
  employee_id INTEGER,
  reviewer_id INTEGER,
  status TEXT CHECK(status IN ('Pending','In Progress','Submitted','Acknowledged')) DEFAULT 'Pending',
  rating INTEGER,
  feedback TEXT,
  submitted_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(cycle_id) REFERENCES performance_cycles(id) ON DELETE CASCADE,
  FOREIGN KEY(employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY(reviewer_id) REFERENCES employees(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS employee_goals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK(status IN ('On Track','At Risk','Off Track','Completed')) DEFAULT 'On Track',
  progress INTEGER DEFAULT 0,
  due_date DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS one_on_one_meetings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  manager_id INTEGER NOT NULL,
  date DATE NOT NULL,
  notes TEXT,
  action_items TEXT,
  status TEXT CHECK(status IN ('Scheduled','Completed','Cancelled')) DEFAULT 'Scheduled',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY(manager_id) REFERENCES employees(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_performance_cycles_company ON performance_cycles(company_id);
CREATE INDEX IF NOT EXISTS idx_performance_reviews_cycle ON performance_reviews(cycle_id);
CREATE INDEX IF NOT EXISTS idx_employee_goals_emp ON employee_goals(employee_id);
CREATE INDEX IF NOT EXISTS idx_one_on_one_emp ON one_on_one_meetings(employee_id);

-- =============================================================================
-- 🎓 COURSES (schema.ts courses — distinct from lms_courses)
-- =============================================================================

CREATE TABLE IF NOT EXISTS courses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  duration_mins INTEGER,
  status TEXT DEFAULT 'Active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS course_enrollments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER NOT NULL,
  employee_id INTEGER NOT NULL,
  status TEXT CHECK(status IN ('Not Started','In Progress','Completed')) DEFAULT 'Not Started',
  progress INTEGER DEFAULT 0,
  enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  FOREIGN KEY(course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY(employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_courses_company ON courses(company_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_emp ON course_enrollments(employee_id);

-- =============================================================================
-- 📒 GENERAL LEDGER
-- =============================================================================

CREATE TABLE IF NOT EXISTS chart_of_accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER,
  account_number TEXT NOT NULL,
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL,
  status TEXT DEFAULT 'Active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS journal_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER,
  payroll_id INTEGER,
  entry_date DATE NOT NULL,
  description TEXT,
  status TEXT CHECK(status IN ('Pending Sync','Synced','Failed')) DEFAULT 'Pending Sync',
  sync_date DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY(payroll_id) REFERENCES payrolls(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS journal_entry_lines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  journal_entry_id INTEGER NOT NULL,
  account_id INTEGER,
  amount INTEGER NOT NULL,
  type TEXT CHECK(type IN ('Debit','Credit')) NOT NULL,
  department TEXT,
  FOREIGN KEY(journal_entry_id) REFERENCES journal_entries(id) ON DELETE CASCADE,
  FOREIGN KEY(account_id) REFERENCES chart_of_accounts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_company ON chart_of_accounts(company_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_company ON journal_entries(company_id);
CREATE INDEX IF NOT EXISTS idx_journal_entry_lines_entry ON journal_entry_lines(journal_entry_id);

-- =============================================================================
-- 🎭 SUPPLEMENTAL PAYMENTS & ROYALTIES
-- =============================================================================

CREATE TABLE IF NOT EXISTS supplemental_payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER,
  employee_id INTEGER,
  contractor_id INTEGER,
  recipient_name TEXT NOT NULL,
  recipient_type TEXT NOT NULL,
  payment_type TEXT NOT NULL,
  description TEXT,
  amount INTEGER NOT NULL,
  tax_treatment TEXT,
  status TEXT DEFAULT 'Pending',
  scheduled_date DATE,
  paid_date DATE,
  project_title TEXT,
  notes TEXT,
  royalty_schedule_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY(employee_id) REFERENCES employees(id) ON DELETE SET NULL,
  FOREIGN KEY(contractor_id) REFERENCES contractors(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS royalty_schedules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER,
  employee_id INTEGER,
  contractor_id INTEGER,
  recipient_name TEXT NOT NULL,
  recipient_type TEXT NOT NULL,
  project_title TEXT NOT NULL,
  royalty_type TEXT NOT NULL,
  rate REAL NOT NULL,
  rate_unit TEXT,
  units_sold INTEGER DEFAULT 0,
  units_threshold INTEGER DEFAULT 0,
  frequency TEXT DEFAULT 'Quarterly',
  advance_balance INTEGER DEFAULT 0,
  total_recouped INTEGER DEFAULT 0,
  total_earned INTEGER DEFAULT 0,
  status TEXT CHECK(status IN ('Active','Paused','Completed','Draft')) DEFAULT 'Draft',
  next_payment_date DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY(employee_id) REFERENCES employees(id) ON DELETE SET NULL,
  FOREIGN KEY(contractor_id) REFERENCES contractors(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS residual_payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER,
  talent_name TEXT NOT NULL,
  show_title TEXT NOT NULL,
  network TEXT,
  reuse_type TEXT,
  scale TEXT,
  amount INTEGER NOT NULL,
  category_1099 TEXT DEFAULT '1099-MISC Box 2',
  payment_date DATE,
  status TEXT CHECK(status IN ('Imported','Verified','Paid','Disputed')) DEFAULT 'Imported',
  batch_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_supplemental_payments_company ON supplemental_payments(company_id);
CREATE INDEX IF NOT EXISTS idx_royalty_schedules_company ON royalty_schedules(company_id);
CREATE INDEX IF NOT EXISTS idx_residual_payments_company ON residual_payments(company_id);

-- =============================================================================
-- 🏛️ UNION PAYROLL
-- =============================================================================

CREATE TABLE IF NOT EXISTS unions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER,
  name TEXT NOT NULL,
  abbreviation TEXT,
  description TEXT,
  status TEXT CHECK(status IN ('Active','Inactive')) DEFAULT 'Active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS union_contracts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  union_id INTEGER NOT NULL,
  contract_name TEXT NOT NULL,
  dues_type TEXT DEFAULT 'percentage',
  dues_rate REAL NOT NULL,
  pension_rate REAL NOT NULL,
  health_welfare_rate REAL NOT NULL,
  work_dues_rate REAL DEFAULT 0,
  effective_date DATE NOT NULL,
  expiration_date DATE,
  status TEXT CHECK(status IN ('Active','Expired','Upcoming')) DEFAULT 'Active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(union_id) REFERENCES unions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS employee_union_memberships (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  union_id INTEGER NOT NULL,
  membership_number TEXT,
  join_date DATE,
  status TEXT CHECK(status IN ('Active','Inactive','On Leave')) DEFAULT 'Active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY(union_id) REFERENCES unions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS union_payroll_calculations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  payroll_id INTEGER,
  employee_id INTEGER,
  union_id INTEGER,
  contract_id INTEGER,
  gross_earnings INTEGER NOT NULL,
  dues_deduction INTEGER DEFAULT 0,
  work_dues_deduction INTEGER DEFAULT 0,
  pension_contribution INTEGER DEFAULT 0,
  health_welfare_contribution INTEGER DEFAULT 0,
  fringe_contribution INTEGER DEFAULT 0,
  total_employee_deductions INTEGER DEFAULT 0,
  total_employer_contributions INTEGER DEFAULT 0,
  hours_worked REAL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(payroll_id) REFERENCES payrolls(id) ON DELETE CASCADE,
  FOREIGN KEY(employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY(union_id) REFERENCES unions(id) ON DELETE CASCADE,
  FOREIGN KEY(contract_id) REFERENCES union_contracts(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS union_contribution_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER,
  union_id INTEGER,
  report_month TEXT NOT NULL,
  total_earnings INTEGER DEFAULT 0,
  total_dues INTEGER DEFAULT 0,
  total_pension INTEGER DEFAULT 0,
  total_health_welfare INTEGER DEFAULT 0,
  total_fringe INTEGER DEFAULT 0,
  employee_count INTEGER DEFAULT 0,
  total_hours REAL DEFAULT 0,
  status TEXT CHECK(status IN ('Draft','Generated','Submitted','Confirmed')) DEFAULT 'Draft',
  export_format TEXT,
  submitted_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY(union_id) REFERENCES unions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS union_fringe_benefits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contract_id INTEGER NOT NULL,
  benefit_name TEXT NOT NULL,
  rate REAL NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(contract_id) REFERENCES union_contracts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_unions_company ON unions(company_id);
CREATE INDEX IF NOT EXISTS idx_union_contracts_union ON union_contracts(union_id);
CREATE INDEX IF NOT EXISTS idx_employee_union_memberships_emp ON employee_union_memberships(employee_id);
CREATE INDEX IF NOT EXISTS idx_union_payroll_calc_payroll ON union_payroll_calculations(payroll_id);
CREATE INDEX IF NOT EXISTS idx_union_contribution_reports_company ON union_contribution_reports(company_id, report_month);

-- =============================================================================
-- 🏢 AGENCY CLIENT BILLING
-- =============================================================================

CREATE TABLE IF NOT EXISTS agency_clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER,
  name TEXT NOT NULL,
  email TEXT,
  contact_name TEXT,
  logo_url TEXT,
  billing_rate_type TEXT CHECK(billing_rate_type IN ('cost-plus','fixed','hourly')) DEFAULT 'cost-plus',
  markup_percentage REAL DEFAULT 0,
  fixed_fee INTEGER DEFAULT 0,
  hourly_rate INTEGER DEFAULT 0,
  billing_cycle TEXT CHECK(billing_cycle IN ('weekly','bi-weekly','monthly')) DEFAULT 'monthly',
  payment_terms TEXT DEFAULT 'Net 30',
  accounting_sync TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS agency_projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER,
  client_id INTEGER,
  name TEXT NOT NULL,
  description TEXT,
  budget INTEGER,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'Active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY(client_id) REFERENCES agency_clients(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS agency_invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER,
  company_id INTEGER,
  invoice_number TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT CHECK(status IN ('Draft','Approved','Sent','Paid')) DEFAULT 'Draft',
  due_date DATE NOT NULL,
  sent_at DATETIME,
  paid_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(client_id) REFERENCES agency_clients(id) ON DELETE CASCADE,
  FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS agency_invoice_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_id INTEGER NOT NULL,
  employee_id INTEGER,
  description TEXT NOT NULL,
  unit_price INTEGER DEFAULT 0,
  quantity REAL DEFAULT 1,
  cost INTEGER NOT NULL,
  markup INTEGER DEFAULT 0,
  total INTEGER NOT NULL,
  item_type TEXT DEFAULT 'labor',
  FOREIGN KEY(invoice_id) REFERENCES agency_invoices(id) ON DELETE CASCADE,
  FOREIGN KEY(employee_id) REFERENCES employees(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_agency_clients_company ON agency_clients(company_id);
CREATE INDEX IF NOT EXISTS idx_agency_invoices_client ON agency_invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_agency_invoice_items_invoice ON agency_invoice_items(invoice_id);
