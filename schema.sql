CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  role TEXT CHECK(role IN ('admin','hr','employee')) DEFAULT 'employee',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE companies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE employees (
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

CREATE TABLE compensation_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  old_salary INTEGER,
  new_salary INTEGER NOT NULL,
  effective_date DATE NOT NULL,
  type TEXT CHECK(type IN ('promotion','adjustment','correction')) DEFAULT 'adjustment',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

CREATE TABLE payrolls (
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

CREATE TABLE payroll_items (
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

CREATE TABLE tax_liabilities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  payroll_id INTEGER,
  agency TEXT NOT NULL, -- e.g. 'IRS', 'CA EDD'
  type TEXT NOT NULL,   -- e.g. 'Federal IT', 'FICA', 'State IT'
  amount INTEGER NOT NULL,
  status TEXT CHECK(status IN ('pending','paid')) DEFAULT 'pending',
  FOREIGN KEY(payroll_id) REFERENCES payrolls(id) ON DELETE CASCADE
);

CREATE TABLE approvals (
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

CREATE TABLE contact_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
