-- =============================================================================
-- ⏱️ TIME & SCHEDULING MODULE - ISOLATED MIGRATION
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
