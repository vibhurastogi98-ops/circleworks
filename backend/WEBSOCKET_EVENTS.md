# CircleWorks WebSocket Events

Socket.io namespace: `/`

Connection rooms:

- Company room: `company:{companyId}`
- Personal room: `user:{userId}`

Authentication:

- Client sends JWT with `auth.token`, `Authorization: Bearer <token>`, or an auth cookie such as `access_token`, `token`, or `cw_session`.
- Server verifies the JWT before joining rooms.
- On reconnect, the client emits `join` with the company room and user room, then refetches active TanStack Query caches to cover missed updates.

Heartbeat:

- Ping interval: 25 seconds
- Ping timeout: 60 seconds

## Payroll

| Event | Room | Payload |
| --- | --- | --- |
| `payroll.run.status_update` | `company:{companyId}` | `{ runId, status, progress }` |
| `payroll.run.completed` | `company:{companyId}` | `{ runId, totalGross, employeeCount }` |
| `payroll.approval.required` | `company:{companyId}` | `{ runId, approverIds }` |
| `payroll.direct_deposit.sent` | `company:{companyId}` | `{ runId }` |

## Employees

| Event | Room | Payload |
| --- | --- | --- |
| `employee.created` | `company:{companyId}` | `{ employee }` |
| `employee.updated` | `company:{companyId}` | `{ employeeId, changedFields }` |
| `employee.terminated` | `company:{companyId}` | `{ employeeId, lastDay }` |
| `employee.clocked_in` | `company:{companyId}` | `{ employeeId, timestamp }` |
| `employee.clocked_out` | `company:{companyId}` | `{ employeeId, timestamp, hoursWorked }` |

## Time

| Event | Room | Payload |
| --- | --- | --- |
| `time.pto.requested` | `company:{companyId}` | `{ requestId, employeeId, dates }` |
| `time.pto.approved` | `company:{companyId}` | `{ requestId }` |
| `time.pto.denied` | `company:{companyId}` | `{ requestId }` |
| `time.overtime.alert` | `company:{companyId}` | `{ employeeId, hoursThisWeek }` |

## Hiring

| Event | Room | Payload |
| --- | --- | --- |
| `ats.candidate.applied` | `company:{companyId}` | `{ jobId, candidateId, candidateName }` |
| `ats.candidate.stage_changed` | `company:{companyId}` | `{ candidateId, fromStage, toStage }` |
| `ats.offer.signed` | `company:{companyId}` | `{ candidateId, jobId }` |

## Expenses

| Event | Room | Payload |
| --- | --- | --- |
| `expense.submitted` | `company:{companyId}` | `{ expenseId, employeeId, amount }` |
| `expense.approved` | `company:{companyId}` | `{ expenseId }` |
| `expense.denied` | `company:{companyId}` | `{ expenseId }` |

## Notifications

| Event | Room | Payload |
| --- | --- | --- |
| `notification.new` | `user:{userId}` | `{ notification }` |
| `notification.batch_update` | `user:{userId}` | `{ unreadCount?, ids?, all? }` |

## Compliance

| Event | Room | Payload |
| --- | --- | --- |
| `compliance.alert.new` | `company:{companyId}` | `{ alertId, severity, description }` |

## System

| Event | Room | Payload |
| --- | --- | --- |
| `system.maintenance.scheduled` | `company:{companyId}` | `{ startAt, duration }` |
| `feature.announcement` | `company:{companyId}` | `{ title, description, ctaUrl? }` |
