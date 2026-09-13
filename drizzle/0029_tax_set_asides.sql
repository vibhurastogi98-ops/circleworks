-- Creator tax set-aside tracking. See src/app/app/taxes/page.tsx.
-- Idempotent.
CREATE TABLE IF NOT EXISTS tax_set_asides (
  id SERIAL PRIMARY KEY,
  company_id INT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  tax_year INT NOT NULL,
  period TEXT NOT NULL,           -- 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'ANNUAL'
  amount INT NOT NULL,            -- whole dollars
  note TEXT,
  created_by INT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_tax_set_asides_company_year
  ON tax_set_asides (company_id, tax_year, period);
