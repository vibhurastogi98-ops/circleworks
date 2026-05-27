# Sec. 02 — Shared Architecture

## Database Indexing Strategy

Primary PostgreSQL indexes must be created for high-volume HRIS, payroll, time,
audit, and ATS lookup paths. Migration SQL must use `IF NOT EXISTS` or guarded
DDL so indexes can be applied safely across existing environments.

### Primary Table Indexes

```sql
CREATE INDEX idx_employees_company ON employees(company_id, status);
CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_employees_manager ON employees(manager_id);
CREATE INDEX idx_employees_dept ON employees(department_id, status);

CREATE INDEX idx_payroll_company ON payroll_runs(company_id, status);
CREATE INDEX idx_payroll_period ON payroll_runs(company_id, period_end DESC);

CREATE INDEX idx_time_emp_date ON time_entries(employee_id, date DESC);
CREATE INDEX idx_time_company ON time_entries(company_id, period_start, period_end);

CREATE INDEX idx_audit_company ON audit_logs(company_id, created_at DESC);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);

CREATE INDEX idx_candidates_job ON candidates(job_id, stage);
```

The current migration also supports existing schema aliases used in the app
today, including `payrolls(pay_period_end)`, `ats_candidates(job_id, stage)`,
`time_entries(company_id, date)`, and `audit_logs(resource_type, resource_id)`.

### Query Optimization

- Enable slow query logging and run `EXPLAIN ANALYZE` for any query over 100ms.
- Add a partial index for active employee lists:

```sql
CREATE INDEX idx_active_employees ON employees(company_id)
WHERE status = 'active';
```

- Enable `pg_stat_statements` in production to identify recurring slow queries,
  high-total-time queries, and missing-index candidates.
- Review index usage quarterly and before any high-volume module launch.

## Redis Caching Strategy

Our Redis caching strategy is designed to minimize database load and ensure high performance.

- **Cache key patterns**:
  - `'company:{id}:employees'` -> TTL: 5 min, invalidated on any employee change
  - `'company:{id}:payroll:active'` -> TTL: 30s, WS event invalidation
  - `'company:{id}:dashboard'` -> TTL: 5 min (Rule 7)
  - `'employee:{id}:profile'` -> TTL: 10 min, invalidated on profile edit
  - `'company:{id}:benefits:plans'` -> TTL: 1 hour

- **Invalidation**: WS event invalidation is preferred over TTL expiry wherever possible.
- **Cache warming**: Pre-populate dashboard cache on user login.

## CDN & Asset Optimization

### Image Optimization

- Use `next/image` for product and marketing imagery wherever the source can be
  handled by the Next image pipeline.
- Hero imagery must use `priority={true}`, a stable `sizes` value, and a
  `blurDataURL` placeholder to avoid LCP and CLS regressions.
- Below-the-fold imagery should use `loading="lazy"`.
- Supported optimized formats: AVIF and WebP.
- Hero responsive widths: `640w`, `1024w`, `1280w`, and `1920w` via
  `images.deviceSizes`.

### Font Optimization

- Use Inter through `next/font/google`, not a Google Fonts CDN `<link>`.
- Subset to `latin`.
- Use `display: "swap"` to prevent invisible text during font load.

### Code Splitting

- App Router provides automatic route-level splitting.
- Heavy client components should be loaded with `next/dynamic`; components that
  depend on browser-only charting or canvas libraries should set `ssr: false`.
- Target: no App Router route bundle over `200KB` gzipped. Release CI runs the
  route bundle budget check after bundle analysis.

### Vercel Edge CDN

- Marketing pages should remain static/ISR-friendly so HTML and assets can be
  served from Vercel Edge.
- Static assets are served with `Cache-Control: public, max-age=31536000, immutable`.

### Performance Targets

- Marketing homepage: LCP `<2.5s`, CLS `<0.1`, INP `<200ms`.
- Lighthouse CI runs on every pull request against the homepage.

## BullMQ Queue System (Background Jobs)

We use BullMQ for reliable background job processing, ensuring robust task execution for payroll and other critical systems.

- **Queues**:
  - `'payroll-processing'`: concurrency: 2/company, high priority
  - `'email-delivery'`: concurrency: 50
  - `'pdf-generation'`: concurrency: 10
  - `'sync-accounting'`: concurrency: 5 (GL sync to QuickBooks/Xero)
  - `'ats-scoring'`: concurrency: 20 (AI candidate scoring)

- **Retry Strategy**: All queues have 3 retry attempts with exponential backoff (1s, 5s, 30s).
- **Dead Letter Queue**: Jobs that fail after 3 retries are moved to a dead letter queue, triggering an admin alert.

## WebSocket Reconnection Error Handling

To maintain real-time capabilities with graceful degradation, our WebSocket connection strategy includes:

- **Backoff**: Reconnection attempts follow a backoff schedule of 1s, 2s, 4s, 8s, 16s, 32s (max 6 attempts).
- **Failure State**: After 6 failures, display a `'Real-time sync paused — click to reconnect'` banner.
- **State Recovery**: On reconnect, issue `GET /api/events?since={timestamp}` to catch missed events (REST fallback).
- **Stale Data Indicator**: If the WS is disconnected for >30s, display a subtle `'Data may be outdated'` badge on stale views.
