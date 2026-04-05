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
  salary INTEGER,
  department TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE payrolls (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER,
  month TEXT NOT NULL,
  total_amount INTEGER,
  status TEXT CHECK(status IN ('pending','processed','paid')) DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE payroll_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  payroll_id INTEGER,
  employee_id INTEGER,
  gross INTEGER,
  tax INTEGER,
  net INTEGER,
  FOREIGN KEY(payroll_id) REFERENCES payrolls(id) ON DELETE CASCADE,
  FOREIGN KEY(employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

CREATE TABLE approvals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT CHECK(type IN ('leave','payroll','timesheet')),
  status TEXT CHECK(status IN ('pending','approved','rejected')) DEFAULT 'pending',
  user_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE contact_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
