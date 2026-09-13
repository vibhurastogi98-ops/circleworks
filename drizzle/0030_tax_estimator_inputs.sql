-- Persisted state for the /app/taxes estimator form.
-- One row per (companyId, taxYear). All monetary values are whole dollars.
CREATE TABLE IF NOT EXISTS tax_estimator_inputs (
  company_id INT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  tax_year INT NOT NULL,
  annual_revenue INT NOT NULL DEFAULT 0,
  business_expenses INT NOT NULL DEFAULT 0,
  owner_salary INT NOT NULL DEFAULT 0,
  withholding INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_by INT REFERENCES users(id) ON DELETE SET NULL,
  PRIMARY KEY (company_id, tax_year)
);
