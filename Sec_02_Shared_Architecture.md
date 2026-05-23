# Sec. 02 — Shared Architecture

## Database Indexing Strategy

Primary PostgreSQL indexes must be created for high-volume HRIS, payroll, time,
audit, and ATS lookup paths.

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
