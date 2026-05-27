DO $$
BEGIN
  IF to_regclass('public.employees') IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'employees' AND column_name IN ('company_id', 'status')
      GROUP BY table_name HAVING count(*) = 2
    ) THEN
      CREATE INDEX IF NOT EXISTS idx_employees_company ON public.employees(company_id, status);
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'employees' AND column_name = 'email'
    ) THEN
      CREATE INDEX IF NOT EXISTS idx_employees_email ON public.employees(email);
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'employees' AND column_name = 'manager_id'
    ) THEN
      CREATE INDEX IF NOT EXISTS idx_employees_manager ON public.employees(manager_id);
    ELSIF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'employees' AND column_name = 'reporting_manager_id'
    ) THEN
      CREATE INDEX IF NOT EXISTS idx_employees_manager ON public.employees(reporting_manager_id);
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'employees' AND column_name IN ('department_id', 'status')
      GROUP BY table_name HAVING count(*) = 2
    ) THEN
      CREATE INDEX IF NOT EXISTS idx_employees_dept ON public.employees(department_id, status);
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'employees' AND column_name IN ('company_id', 'status')
      GROUP BY table_name HAVING count(*) = 2
    ) THEN
      CREATE INDEX IF NOT EXISTS idx_active_employees ON public.employees(company_id) WHERE status = 'active';
    END IF;
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF to_regclass('public.payroll_runs') IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'payroll_runs' AND column_name IN ('company_id', 'status')
      GROUP BY table_name HAVING count(*) = 2
    ) THEN
      CREATE INDEX IF NOT EXISTS idx_payroll_company ON public.payroll_runs(company_id, status);
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'payroll_runs' AND column_name IN ('company_id', 'period_end')
      GROUP BY table_name HAVING count(*) = 2
    ) THEN
      CREATE INDEX IF NOT EXISTS idx_payroll_period ON public.payroll_runs(company_id, period_end DESC);
    END IF;
  ELSIF to_regclass('public.payrolls') IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'payrolls' AND column_name IN ('company_id', 'status')
      GROUP BY table_name HAVING count(*) = 2
    ) THEN
      CREATE INDEX IF NOT EXISTS idx_payroll_company ON public.payrolls(company_id, status);
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'payrolls' AND column_name IN ('company_id', 'pay_period_end')
      GROUP BY table_name HAVING count(*) = 2
    ) THEN
      CREATE INDEX IF NOT EXISTS idx_payroll_period ON public.payrolls(company_id, pay_period_end DESC);
    END IF;
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF to_regclass('public.time_entries') IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'time_entries' AND column_name IN ('employee_id', 'date')
      GROUP BY table_name HAVING count(*) = 2
    ) THEN
      CREATE INDEX IF NOT EXISTS idx_time_emp_date ON public.time_entries(employee_id, date DESC);
    ELSIF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'time_entries' AND column_name IN ('employee_id', 'clock_in')
      GROUP BY table_name HAVING count(*) = 2
    ) THEN
      CREATE INDEX IF NOT EXISTS idx_time_emp_date ON public.time_entries(employee_id, clock_in DESC);
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'time_entries' AND column_name IN ('company_id', 'period_start', 'period_end')
      GROUP BY table_name HAVING count(*) = 3
    ) THEN
      CREATE INDEX IF NOT EXISTS idx_time_company ON public.time_entries(company_id, period_start, period_end);
    ELSIF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'time_entries' AND column_name IN ('company_id', 'date')
      GROUP BY table_name HAVING count(*) = 2
    ) THEN
      CREATE INDEX IF NOT EXISTS idx_time_company ON public.time_entries(company_id, date);
    END IF;
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF to_regclass('public.audit_logs') IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name IN ('company_id', 'created_at')
      GROUP BY table_name HAVING count(*) = 2
    ) THEN
      CREATE INDEX IF NOT EXISTS idx_audit_company ON public.audit_logs(company_id, created_at DESC);
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name IN ('entity_type', 'entity_id')
      GROUP BY table_name HAVING count(*) = 2
    ) THEN
      CREATE INDEX IF NOT EXISTS idx_audit_entity ON public.audit_logs(entity_type, entity_id);
    ELSIF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name IN ('resource_type', 'resource_id')
      GROUP BY table_name HAVING count(*) = 2
    ) THEN
      CREATE INDEX IF NOT EXISTS idx_audit_entity ON public.audit_logs(resource_type, resource_id);
    END IF;
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF to_regclass('public.candidates') IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'candidates' AND column_name IN ('job_id', 'stage')
      GROUP BY table_name HAVING count(*) = 2
    ) THEN
      CREATE INDEX IF NOT EXISTS idx_candidates_job ON public.candidates(job_id, stage);
    END IF;
  ELSIF to_regclass('public.ats_candidates') IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'ats_candidates' AND column_name IN ('job_id', 'stage')
      GROUP BY table_name HAVING count(*) = 2
    ) THEN
      CREATE INDEX IF NOT EXISTS idx_candidates_job ON public.ats_candidates(job_id, stage);
    END IF;
  END IF;
END $$;
