# Sec. 02 — Shared Architecture

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
