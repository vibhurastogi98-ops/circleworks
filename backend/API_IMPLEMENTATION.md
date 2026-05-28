# API Implementation Guide

## Overview

This document outlines the complete API backend architecture for CircleWorks platform.

## Technology Stack

| Component  | Technology                           | Version |
| ---------- | ------------------------------------ | ------- |
| Runtime    | Node.js                              | 18+     |
| Framework  | NestJS                               | 10.3+   |
| Language   | TypeScript                           | 5.3+    |
| Database   | PostgreSQL                           | 14+     |
| ORM        | Prisma                               | 5.8+    |
| Cache      | Redis                                | 7+      |
| Queue      | BullMQ (`bullmq` + `@nestjs/bullmq`) | 5.x     |
| Search     | Elasticsearch                        | 8.10+   |
| Storage    | AWS S3                               | -       |
| Auth       | JWT + Bcrypt                         | -       |
| Monitoring | Sentry + Winston                     | -       |

## Architecture Layers

### 1. Controller Layer

- HTTP request handlers
- Request validation (DTOs + class-validator)
- Response formatting
- Error handling

### 2. Service Layer

- Business logic implementation
- Database operations via Prisma
- External API integrations
- Cache management

### 3. Database Layer

- Prisma ORM for type-safe queries
- PostgreSQL for persistence
- Redis for caching
- Elasticsearch for full-text search

### 4. Cross-Cutting Concerns

- JWT authentication & authorization
- Rate limiting & throttling
- Request logging & monitoring (Sentry)
- CORS & security headers

## Module Structure

Each module follows this pattern:

```
module/
├── controllers/          # HTTP handlers
│   └── module.controller.ts
├── services/            # Business logic
│   └── module.service.ts
├── dtos/               # Data Transfer Objects
│   └── create-module.dto.ts
├── interfaces/         # Type definitions
├── module.module.ts    # Module definition
└── module.spec.ts      # Tests
```

## Authentication Flow

### Registration

1. User submits email + password
2. Validate email format, password strength
3. Hash password with bcrypt (10 rounds)
4. Store in database
5. Send verification email
6. Return success message

### Login

1. Validate email + password
2. Query user by email
3. Compare password with bcrypt
4. Check MFA requirement
5. Generate JWT access token (15 min)
6. Generate opaque refresh token
7. Store refresh session in Redis
8. Set refresh token in an httpOnly cookie
9. Return access token and session metadata

### Refresh Token

1. Client sends refresh token from the httpOnly cookie
2. Look up opaque token in Redis
3. Rotate refresh token by deleting the used token and issuing a new one
4. Update session `lastActive`
5. Generate new 15-minute JWT access token
6. Return access token and set the new refresh cookie

### Section 13/35 Addendum: Session Management

Token configuration:

- Access token: JWT, expires in 15 minutes
- Refresh token: opaque random token, stored in Redis, expires in 7 days
- Remember Me: refresh token/session extends to 30 days
- Token rotation: every refresh consumes the current refresh token and issues a new opaque token

Client storage:

- `access_token`: memory only; do not write to `localStorage`
- `refresh_token`: httpOnly cookie with `Secure` in production and `SameSite=Strict`

Redis session payload:

```json
{
  "userId": "user_123",
  "deviceId": "device_abc",
  "createdAt": "2026-05-23T10:00:00.000Z",
  "lastActive": "2026-05-23T10:12:00.000Z",
  "deviceInfo": {
    "type": "Desktop",
    "browser": "Chrome",
    "os": "macOS",
    "location": "203.0.113.10"
  }
}
```

Redis keys:

- `auth:session:{sessionId}` — session JSON
- `auth:refresh:{sha256(refreshToken)}` — opaque refresh token lookup
- `auth:user_sessions:{userId}` — sorted set for concurrent-session enforcement

Concurrent sessions:

- Default maximum: 5 sessions per user
- 6th login returns `Session limit reached`
- Supported options: `sign_out_oldest`, `sign_out_others`, or `cancel`

Password change revocation:

- On password reset/change, all Redis refresh sessions for the user are deleted
- Other devices lose access on their next refresh attempt
- `POST /auth/change-password` requires the current password, writes the new bcrypt hash, clears the current refresh cookie, and revokes every Redis refresh session for the user
- Email event: `Password changed — all other sessions signed out`

Device management:

- `GET /auth/sessions` lists device type, browser, OS, location/IP, and last active time
- `DELETE /auth/sessions/:id` signs out one session
- `POST /auth/sessions/revoke-others` signs out all other sessions
- UI route: `/settings/security/devices`
- New device login alert email: `New sign-in from [device] in [location]`

### MFA (TOTP)

1. User enables MFA during account setup
2. Generate TOTP secret with speakeasy
3. Generate QR code for authenticator apps
4. User scans QR code in Google Authenticator/Authy
5. User verifies by entering 6-digit code
6. Store secret in encrypted form
7. Generate backup codes
8. On login, require MFA code if enabled

## Database Relationships

### User & Company

- Many-to-many through UserCompany junction table
- Tracks user role and permissions per company
- Users can belong to multiple companies

### Employee & User

- One-to-one relationship
- Some system users don't have employee records (e.g., contractors)

### Payroll Hierarchy

- Company → PayrollSchedules (frequency config)
- Company → PayrollRuns (processing batches)
- PayrollRun → PayStubs (individual checks)

### HRIS Hierarchy

- Company → Departments
- Company → Positions
- Department → Employees
- Employees → CompensationHistory

### Benefits

- Company → BenefitPlans (Health, 401k, etc.)
- BenefitPlans → BenefitEnrollments
- Employee → Enrollments (selected plans)

## API Pagination

All list endpoints use cursor-based pagination. Do not use offset/page pagination
for new endpoints.

Query parameters:

```http
GET /api/v2/employees?cursor={opaque_cursor}&limit=25&direction=next
```

Parameters:

- `cursor`: opaque base64-encoded cursor from the previous response
- `limit`: positive integer; defaults are `employees=25`, `payroll_runs=20`, and `audit_logs=50`
- `direction`: `next` or `prev`
- Maximum `limit`: `100`; larger values return `400`

Response envelope:

```json
{
  "data": [...],
  "pagination": {
    "cursor_next": "base64_encoded_cursor",
    "cursor_prev": "base64_encoded_cursor",
    "has_next": true,
    "has_prev": false,
    "total_count": 1247
  }
}
```

Cursor payload:

```json
{ "id": "lastItemId", "sort_field": "lastItemSortValue" }
```

The cursor is base64 encoded, not encrypted. For `created_at DESC, id DESC`
lists, SQL should use the tuple pattern:

```sql
WHERE (created_at, id) < (cursor.created_at, cursor.id)
```

Frontend lists should use TanStack Query `useInfiniteQuery` with a `Load More`
button or infinite-scroll trigger. Status text should use the returned
`total_count`, for example: `Showing 25 of 1,247 employees`.

Migration path: `/v1/employees` offset pagination is deprecated. Use
`/v2/employees` cursor pagination.

## Error Handling

### Validation Errors (400)

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "BAD_REQUEST",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## Section 34: ATS-to-Onboarding Data Mapping

The canonical ATS hire conversion lives in `AtsService` in the backend. When a candidate stage update targets `Hired`, the service runs the auto-employee creation flow instead of treating the move as a simple stage change.

Canonical field mapping:

| ATS source                                   | Employee target                            |
| -------------------------------------------- | ------------------------------------------ |
| `candidate.firstName` + `candidate.lastName` | `employee.firstName` + `employee.lastName` |
| `candidate.email`                            | `employee.personalEmail`                   |
| `candidate.phone`                            | `employee.personalPhone`                   |
| `offer.salary`                               | `employee.compensation.annualSalary`       |
| `offer.startDate`                            | `employee.startDate`                       |
| `offer.title`                                | `employee.jobTitle`                        |
| `offer.departmentId`                         | `employee.departmentId`                    |
| `offer.locationId`                           | `employee.locationId`                      |
| `offer.employmentType`                       | `employee.employmentType`                  |
| `job.managerId`                              | `employee.managerId`                       |

Auto-employee creation flow:

1. Trigger when `candidate.stage` changes to `Hired` after offer acceptance.
2. Check for duplicates by candidate email. If found, return `Employee with this email exists — merge or create new?`.
3. Run the canonical field map and create the employee with `status = pre_boarding`.
4. Emit `employee.auto_created_from_ats` with `{ employeeId, candidateId }`.
5. Create an onboarding case from the first available onboarding template.
6. Queue the pre-boarding invitation email using the pre-boarding invitation template payload.
7. Return the toast text: `Employee created and pre-boarding invitation sent to [email]`.

Pre-flight checklist:

- Required: name and email.
- Warnings: missing phone and unconfirmed start date.
- Missing required fields return `PRE_FLIGHT_REQUIRED_FIELDS_MISSING` with the modal-ready checklist payload.

### Benefits-to-Payroll Deduction Sync

Deduction calculation:

```txt
per_paycheck = (monthly_premium x employee_share_%) / pay_periods_per_month
```

Pay periods per month:

| Schedule     | Periods |
| ------------ | ------- |
| Semi-monthly | 2       |
| Biweekly     | 2.167   |
| Weekly       | 4.333   |

API endpoint:

```http
GET /api/payroll/runs/:id/deductions
```

Returns:

```json
[
  {
    "employeeId": "123",
    "benefitPlanId": "456",
    "planName": "Medical (BCBS PPO)",
    "monthlyPremium": 900,
    "employeeShare": 35,
    "perPaycheckAmount": 145.23,
    "pretaxOrPosttax": "pre_tax",
    "deductionCode": "MED_PRE"
  }
]
```

Payroll creation flow:

1. On draft run creation, fetch every active benefit enrollment for employees in the company.
2. Calculate per-paycheck deductions using the run pay schedule.
3. Persist each result as a `payroll_benefit_deductions` line item.
4. The payroll run screen shows total deductions in the row cell. Hover details group pre-tax and post-tax lines separately and include the total.
5. If current benefits differ from the persisted draft lines, return `X-Benefits-Changed-Employees` so the UI can show `Benefits changed for 3 employees since draft — recalculate?`.

### Timesheet-to-Payroll Auto-Import

Auto-import trigger:

- When a payroll run is created for a pay period, query approved time entries joined to approved timesheets where `timesheet.period_end = payroll.period_end`.
- Include only hourly employees.
- Auto-populate regular, overtime, double-time, total hours, and daily breakdown rows into `payroll_time_imports`.
- If older approved timesheets have totals but no entry rows, use the approved timesheet totals as the fallback source.

Payroll run creation pre-flight:

- Response summary includes approved, missing, late, cutoff, period start, and period end counts.
- UI copy follows: `47 of 52 hourly employees have approved timesheets`.
- Missing employees are listed by name.
- Supported choices are `Continue with 47`, `Wait for remaining 5`, and `Use scheduled hours for missing`.
- Passing `timeImportMissingMode = wait` returns `TIMESHEETS_MISSING` with the summary instead of creating a draft when timesheets are missing.
- Passing `timeImportMissingMode = scheduled` fills missing hourly employees from scheduled hours.

Payroll run screen:

- `[T]` icon marks hours auto-imported from timesheets.
- Clicking `[T]` expands the row and shows daily hours breakdown.
- Edit icon allows manual override and sets the override audit flag.
- `Import Hours` refreshes from the latest approved time entries.
- A warning banner appears when any employee hours were manually overridden.

Cutoff timing:

- Configured in `/settings/payroll/schedule`.
- Default is 24 hours before the run date.
- Late approvals inside the cutoff window show `Submitted within cutoff window — may miss run`.

Partial periods:

- New hire mid-period prorates scheduled hours based on start date when scheduled fallback is used.
- Termination mid-period includes scheduled hours only through the termination date when scheduled fallback is used.
- Approved time-entry imports use the actual approved entries in the pay period.

### Expense-to-Payroll Reimbursement Sync

Expense approval trigger:

- On expense report approval, set `expense_report.status = pending_payroll`.
- Pending payroll reports are the reimbursement queue for the next payroll run.
- Emit `expense.approved` with the report id, employee id, and amount.
- The frontend invalidates `expenses`, `payroll-preview`, and `budget-reports` per Rule 5.

Payroll run reimbursements:

- `GET /api/payroll/runs/:id/reimbursements` returns pending approved reports for the run company.
- The payroll run screen shows a collapsible `Reimbursements` section below earnings and deductions.
- Each employee row can expand to show report id, description, amount, approver, approval date, and flags.
- Each report has an include checkbox. Approved expenses default to included and can be deferred to the next run.
- Reimbursements are non-taxable and are added to net pay separately from gross wages.

Pay stub display:

- Pay stubs show an `Expense Reimbursements` section separate from gross wages and deductions.
- Each report appears as one line with description and amount.
- Total reimbursements are shown as non-taxable.

Status updates after run:

- Included reports are updated to `expense_report.status = reimbursed`.
- `expense_report.payroll_run_id` stores the payroll run for traceability.
- `expense_report.reimbursed_at` records the reimbursement timestamp.
- Employee expense history displays `Reimbursed via Payroll [date]`.
- Deferred reports remain `pending_payroll` with no payroll run id and are picked up next run.

Edge cases:

- Terminated employee before reimbursement is flagged `Requires manual check`.
- Contractor reimbursement over `$600` is flagged for `1099 consideration`.

### Comp Change Mid-Period Payroll Sync

Mid-period detection:

- When an admin saves a compensation change, compare the effective date to the current payroll period.
- If the effective date is within the current pay period, show `This rate change is mid-period. How should this be handled?`.
- Modal options are `Apply to full period`, `Prorate`, and `Apply starting next period only`.
- If the effective date is in a past period, redirect to retro-pay at `/payroll/off-cycle?mode=retro`.
- Future-dated changes are stored as `next_period_only` and do not alter the current run.

Prorate calculation:

```txt
old_earnings = old_period_earnings x (days_before / period_days)
new_earnings = new_period_earnings x (days_after / period_days)
total = old_earnings + new_earnings
```

Implementation notes:

- Salary rates convert annual pay to period earnings before proration.
- Hourly rates use period hours from payroll/timesheet data before proration.
- `full_period` uses the new rate for the entire run.
- `next_period_only` returns no current-run payroll adjustment.

Payroll run display:

- A rate-change icon appears beside the employee name when the run has a compensation change.
- The tooltip follows `Rate changed from $X to $Y effective [date] — prorated` for prorated changes.
- Gross pay shows the calculated prorated amount.
- Prorated rows show a `Prorated` badge below gross pay.

Draft payroll protection:

- Payroll drafts store their draft-created timestamp.
- Changes saved after the draft and effective within the draft period show `3 employees have rate changes since draft — recalculate?`.
- `Recalculate Affected` reruns gross, tax, net-pay, and compensation-rate calculations only for employees with qualifying mid-period changes.

### EWA Repayment Deduction Sync

EWA advance record:

- On advance issuance, create an `ewa_advances` record with `employeeId`, `amount`, `issueDate`, `repaymentRunId = null`, `status = outstanding`, and `remainingBalance = amount`.
- Partial repayments keep the same advance record and reduce `remainingBalance`.

Payroll run auto-deduction:

- When a payroll run is created, query outstanding and partial EWA advances for employees in the run company.
- Each qualifying advance becomes a deduction line labeled `EWA Repayment: -$X.XX`.
- The run creation preflight includes EWA repayment line count, total amount, and minimum-wage block count.
- EWA deductions stay tied to the advance until run completion, when repayment status is finalized.

Payroll run screen:

- Employee rows show an `EWA` badge with the total repayment amount.
- Badge hover text follows `EWA advance of $[amount] issued [date] — repaying via this run`.
- The deductions tooltip lists `EWA Repayment` separately from benefits.
- The `EWA Repayments` section lets admins review every queued advance.
- Admins can choose `Defer to next run`, which opens a confirmation modal before removing the deduction from the current run.

Net pay protection:

- Before submission, calculate net pay after the EWA deduction.
- If net pay is below `minimum wage x hours`, block run submission with `EWA repayment for [Employee] would bring net pay below state minimum`.
- Resolution options are `Reduce repayment`, `Split across 2 runs`, and `Contact employee`.
- Reduced or split repayments carry any remaining balance to a future payroll run.

Pay stub display:

- Pay stubs show `EWA Repayment` as a separate deduction line item.

Status updates:

- On run completion, included advances update to `status = repaid` and set `repaymentRunId`.
- Partial repayments update to `status = partial`, set `repaymentRunId`, and persist the reduced `remainingBalance`.
- Deferred advances remain outstanding or partial with `repaymentRunId = null`.

### Workflow Action WS Events

New websocket event:

```txt
workflow.action.executed
```

Payload:

```json
{
  "workflowId": "workflow-new-hire-it",
  "workflowName": "New Hire IT Setup",
  "triggeredBy": "automation",
  "actionType": "update_field",
  "entityType": "employee",
  "entityId": "123",
  "changedFields": [
    { "field": "status", "oldValue": "onboarding", "newValue": "active" }
  ],
  "timestamp": "2026-05-23T10:30:00.000Z"
}
```

Allowed values:

- `actionType`: `update_field`, `create_task`, `send_email`, `change_status`.
- `entityType`: `employee`, `task`, `job`, `onboarding`.
- `triggeredBy`: always `automation`.

Activity feed:

- Activity feed copy follows `[Workflow Name] automatically updated [field]` when a changed field is present.
- Automated workflow entries use a purple `Automated` badge to distinguish them from manual changes.
- If no changed field is present, the fallback copy is `[Workflow Name] performed [action type]`.

Audit log:

- Author displays as `Workflow Automation` with the workflow name stored in metadata.
- Workflow audit metadata includes `workflowId`, `workflowName`, `changedFields`, `executedAt`, and `immutable = true`.
- Workflow automation audit entries are immutable and cannot be manually edited or deleted.

### Employee Termination Cascade

Termination confirmation executes as one backend transaction through the employee termination cascade service. If any write fails, the cascade rolls back and no partial termination state is committed.

Step 1 - PTO / leave:

- Cancel pending PTO requests by setting `status = cancelled_termination`.
- Notify the employee with `Your pending PTO requests have been cancelled`.
- Calculate final PTO payout by state law.
- California uses mandatory cash payout. Other states use company policy unless configured otherwise.

Step 2 - Payroll:

- If the employee is already in a draft payroll run, mark their payroll item with `Terminating - verify final pay`.
- Calculate final pay as prorated salary or wages through the last day.
- Add PTO payout as a separate earnings line when applicable.
- Create or attach the final paycheck according to state timing:
  - `CA` and `MT`: same day, off-cycle.
  - `CO` and `ND`: next scheduled pay date.
  - Other states: state deadline varies; default target is seven days.

Step 3 - Benefits:

- Set benefit coverage to end on the last day of the termination month.
- Create a COBRA eligibility case and queue the election notice PDF/email.
- COBRA notice due date is 14 days after termination.
- Notify the 401(k) record keeper of the termination date.

Step 4 - System access:

- On the termination effective date, set `employee.status = terminated` and persist `employee.terminationDate`.
- Revoke platform access by invalidating sessions/login state.
- Create the IT task `Revoke system access for [Name] - terminated [date]`.
- Asset return tasks are generated from active asset assignments.

Step 5 - Offboarding:

- Start an offboarding case from `/onboarding/templates/offboarding`.
- Assign offboarding tasks to HR, IT, and the employee's direct manager.
- Include asset return tasks in the offboarding task set.

WS events emitted:

- `employee.termination.initiated`
- `employee.access.revoked`
- `employee.cobra.triggered`

### Authentication Errors (401)

```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "UNAUTHORIZED"
}
```

### Authorization Errors (403)

```json
{
  "statusCode": 403,
  "message": "You don't have permission to access this resource",
  "error": "FORBIDDEN"
}
```

### Not Found (404)

```json
{
  "statusCode": 404,
  "message": "Employee not found",
  "error": "NOT_FOUND"
}
```

### Conflict (409)

```json
{
  "statusCode": 409,
  "message": "Email already registered",
  "error": "CONFLICT"
}
```

### Rate Limit (429)

```json
{
  "error": "rate_limit_exceeded",
  "limit": 100,
  "reset_at": "2026-05-13T12:30:00.000Z",
  "retry_after_seconds": 30
}
```

## Section 35: API Rate Limiting

All `api.circleworks.com/v1` endpoints are protected by Redis-backed rate limits using `rate-limiter-flexible`.
The limiter runs as a global Nest middleware before route handlers and emits rate-limit metadata headers on API responses.

### Storage and Algorithm

- Package: `rate-limiter-flexible`
- Storage: Redis via `REDIS_URL`
- Fallback: in-memory limiter for local development when Redis is not configured
- Window model: Redis-backed sliding window per endpoint category and identity scope

### Rate Limit Tiers

| Endpoint type                                                                   | Scope         | Limit                   |
| ------------------------------------------------------------------------------- | ------------- | ----------------------- |
| Auth endpoints (`/auth/login`, `/auth/signup`, `/auth/register`)                | IP            | 5 requests / minute     |
| Auth sensitive (`/auth/forgot-password`, `/auth/reset-password`, `/auth/mfa/*`) | IP            | 3 requests / 15 minutes |
| General authenticated API                                                       | User          | 100 requests / minute   |
| Payroll processing writes                                                       | Company       | 5 requests / minute     |
| Bulk operations (`/batch`, `/bulk`, `/import`)                                  | Company       | 10 requests / hour      |
| Report generation/export writes                                                 | User          | 20 requests / hour      |
| Company aggregate                                                               | Company       | 1,000 requests / minute |
| Public API developer keys (`x-api-key`)                                         | Developer key | 60 requests / minute    |

### Redis Key Patterns

- IP-based: `rl:ip:{ip}`
- User-based: `rl:user:{userId}`
- Company-based: `rl:company:{companyId}`
- Public API key-based: `rl:key:{apiKey}`

Rule identifiers are appended internally so independent tiers do not consume the same Redis bucket.

### Response Headers

Every limited API response includes the most constrained active quota:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 74
X-RateLimit-Reset: 1778675400
```

When a request is rejected, the response also includes:

```http
Retry-After: 30
```

### 429 Response Body

```json
{
  "error": "rate_limit_exceeded",
  "limit": 100,
  "reset_at": "2026-05-13T12:30:00.000Z",
  "retry_after_seconds": 30
}
```

## Section 25/35 Addendum: PII Masking in Audit Logs

The `/compliance/audit-log` route returns immutable compliance audit events. Audit logs must never persist full SSNs, tax IDs, bank numbers, compensation amounts for non-HR actors, or password values.

### Write-Time Masking

Masking is applied before `audit_logs` insertion through `AuditLogService.createAuditLog`.
Full sensitive values are never written to PostgreSQL, even in encrypted form.

- Masking service: `maskPIIForAuditLog(fieldName, value, userRole)`
- Sensitive field registry: `PII_FIELDS`
- Sensitive fields: `ssn`, `tax_id`, `bank_routing`, `bank_account`, `salary`, `compensation`, `payRate`, `baseSalary`, `password`
- Encrypted storage: masked audit values are encrypted with AES-256-GCM in `oldValueEncrypted`, `newValueEncrypted`, and `displayValueEncrypted`
- Production configuration: `AUDIT_LOG_ENCRYPTION_KEY` is required

### Field Masking Rules

| Field type                            | Stored audit value                                |
| ------------------------------------- | ------------------------------------------------- |
| SSN / Tax ID                          | `***-**-1234` with only the last 4 digits visible |
| Bank routing number                   | `***6789` with only the last 4 digits visible     |
| Bank account number                   | `***4821` with only the last 4 digits visible     |
| Salary / compensation, HR/Admin actor | `Updated from $X to $Y`                           |
| Salary / compensation, non-HR actor   | `Compensation updated`                            |
| Password                              | `Password changed`                                |

### Audit Log Display

The API performs a second display-time guard for `/compliance/audit-log` responses:

| Viewer role | Sensitive field display                                       |
| ----------- | ------------------------------------------------------------- |
| HR/Admin    | Masked value only, such as `***-**-1234`                      |
| Non-HR      | `[Sensitive field — masked]` for SSN, bank, and salary fields |

### Storage Contract

The `audit_logs` table stores audit-safe encrypted text only:

- `oldValueEncrypted`
- `newValueEncrypted`
- `displayValueEncrypted`
- `metadata`

Application code must write audit events through `AuditLogService.createAuditLog` rather than writing directly to `audit_logs`.

## Webhook Implementation

### Registration

```
POST /api/v1/webhooks
{
  "url": "https://your-domain.com/webhook",
  "events": ["payroll.completed", "employee.created"],
  "secret": "optional-secret"
}
```

### Delivery

All webhook events are delivered as `POST` requests to the customer-configured URL.
Each request includes an HMAC-SHA256 signature in the `X-CircleWorks-Signature` header.

```
POST https://your-domain.com/webhook
Headers:
  Content-Type: application/json
  X-CircleWorks-Signature: <hmac-sha256-hex>
  X-CircleWorks-Event: payroll.completed
  X-CircleWorks-Api-Version: 2025-01-01

Body:
{
  "event": "payroll.completed",
  "api_version": "2025-01-01",
  "delivered_at": "2026-05-23T03:30:00.000Z",
  "payload": {
    "runId": 123,
    "payPeriodStart": "2026-05-01",
    "payPeriodEnd": "2026-05-15",
    "totalGross": 125000,
    "totalNet": 92000,
    "employeeCount": 42
  }
}
```

### Webhook Event Payloads

| Event                 | Payload                                                                             |
| --------------------- | ----------------------------------------------------------------------------------- |
| `employee.created`    | `{ id, firstName, lastName, email, startDate, departmentId, companyId, timestamp }` |
| `employee.terminated` | `{ id, terminationDate, terminationType, finalPayDate, companyId, timestamp }`      |
| `payroll.completed`   | `{ runId, payPeriodStart, payPeriodEnd, totalGross, totalNet, employeeCount }`      |
| `document.signed`     | `{ documentId, documentType, employeeId, signedAt, companyId }`                     |
| `candidate.hired`     | `{ candidateId, employeeId, jobId, startDate, companyId, timestamp }`               |

### Signature Verification

```javascript
const crypto = require('crypto');

const payload = req.rawBody; // Raw request body
const signature = req.headers['x-circleworks-signature'];
const secret = process.env.WEBHOOK_SECRET;

const hmac = crypto.createHmac('sha256', secret).update(payload).digest('hex');

const expectedSignature = hmac;
const isValid = signature === expectedSignature;
```

## API Versioning Strategy

- Current stable major version: `/v1/`
- Stability policy: `/v1/` is supported for at least 18 months after a deprecation notice
- Next major version: `/v2/`, introduced alongside `/v1/` for breaking changes only
- Minor version header: `API-Version: 2025-01-01` for date-based minor versioning within `/v1/`
- Deprecation headers: `Deprecation: true` and `Sunset: [date]`

## Cursor-Based Pagination Standard

All list endpoints use cursor-based pagination instead of offset pagination.

### Request Contract

```http
GET /api/v2/employees?cursor={opaque_cursor}&limit={n}&direction=next
```

| Query param | Description                                              |
| ----------- | -------------------------------------------------------- |
| `cursor`    | Opaque base64 cursor from `cursor_next` or `cursor_prev` |
| `limit`     | Positive integer page size                               |
| `direction` | `next` or `prev`                                         |

Default limits:

| Resource       | Default |
| -------------- | ------: |
| `employees`    |      25 |
| `payroll_runs` |      20 |
| `audit_logs`   |      50 |

Maximum limit: `100`. Requests above `100` return HTTP `400`.

```json
{
  "error": "limit_exceeded",
  "max_limit": 100
}
```

### Response Envelope

```json
{
  "data": [],
  "pagination": {
    "cursor_next": "base64_encoded_cursor",
    "cursor_prev": "base64_encoded_cursor",
    "has_next": true,
    "has_prev": false,
    "total_count": 1247
  }
}
```

### Cursor Encoding

Cursors are base64 encoded JSON payloads, not encrypted values.

```json
{
  "id": "lastItemId",
  "sort_field": "lastItemSortValue"
}
```

Database queries use deterministic tuple comparisons:

```sql
WHERE (created_at, id) < (cursor.created_at, cursor.id)
```

### Frontend Standard

- Use TanStack Query `useInfiniteQuery` for list views.
- Trigger loading with a `Load More` button or infinite scroll sentinel.
- Show visible count status text, for example: `Showing 25 of 1,247 employees`.

### Migration

`/v1/employees` offset pagination is deprecated. Use `/v2/employees` cursor pagination for all new integrations.

## CDN & Asset Optimization

### Image Optimization

- Use `next/image` for application and marketing images.
- Serve optimized formats in this order: AVIF, then WebP.
- Hero imagery uses responsive widths of `640w`, `1024w`, `1280w`, and `1920w`.
- Above-the-fold hero images set `priority={true}`.
- Below-fold images use lazy loading.
- Hero images include `blurDataURL` placeholders to reduce layout shift.

### Font Optimization

- Inter is loaded through `next/font/google`, not a runtime Google Fonts stylesheet.
- Font subsetting is limited to `latin`.
- Font display is `swap` to avoid invisible text during font load.

### Code Splitting

- App Router provides automatic route-level splitting.
- Heavy client-only components use dynamic imports with Suspense-style fallbacks.

```ts
const PayrollChart = dynamic(() => import('./PayrollChart'), { ssr: false });
```

- Target route bundle size: no route bundle over `200KB` gzipped.
- Run bundle analysis with `ANALYZE=true next build`; CI uploads bundle analyzer artifacts on every published release.

### CDN Configuration

- Marketing pages use Vercel Edge/CDN delivery with static rendering or ISR where possible.
- Static assets are served with immutable cache headers:

```http
Cache-Control: public, max-age=31536000, immutable
```

### Performance Targets

Lighthouse CI runs on pull requests with these targets:

| Metric        |   Target |
| ------------- | -------: |
| LCP           |  `<2.5s` |
| CLS           |   `<0.1` |
| INP/TBT proxy | `<200ms` |

## Batch Endpoints

| Method | Endpoint                                  | Contract                                                |
| ------ | ----------------------------------------- | ------------------------------------------------------- |
| `POST` | `/api/v1/employees/batch`                 | Create up to 100 employees in one request               |
| `GET`  | `/api/v1/employees/batch?ids=id1,id2,id3` | Fetch multiple employees by ID                          |
| `POST` | `/api/v1/payroll/batch-approve`           | Approve multiple payroll runs for the accountant portal |
| `POST` | `/api/v1/documents/batch-send`            | Send a document to multiple employees                   |

## File Upload Limits

| Upload type        | Limit                | Allowed types       |
| ------------------ | -------------------- | ------------------- |
| Employee documents | 25 MB                | PDF, JPG, PNG, DOCX |
| CSV imports        | 10 MB and 5,000 rows | CSV                 |
| Company logo       | 2 MB                 | PNG, JPG, SVG       |

When an uploaded file is too large, APIs return:

```json
{
  "error": "file_too_large",
  "max_size_mb": 25
}
```

HTTP status: `413 Request Too Large`.

## Caching Strategy

### Cache Keys

- `user:{userId}` - User profile (5 min TTL)
- `company:{companyId}:employees` - Employee list (10 min)
- `payroll:schedules:{companyId}` - Pay schedules (30 min)
- `auth:refresh-token:{token}` - Refresh token validation (7 days)

### Cache Invalidation

- Update operations invalidate relevant keys
- Webhooks trigger cache purging for downstream systems
- Scheduled jobs clean stale cache entries

### Section 02: Workflow Action Cache Invalidation

On `workflow.action.executed`:

- If `entityType === employee`, invalidate `['employees', entityId]`.
- If `entityType === task`, invalidate `['tasks']` and `['onboarding-tasks']`.
- If `actionType === change_status`, invalidate `['dashboard', entityType]`.
- Always invalidate `['activity-feed']`.
- The dashboard activity feed also prepends `[Workflow Name] automatically updated [field]` with a purple `Automated` badge.

## Security Best Practices

✅ **Implemented:**

- JWT with short expiration (15 min access, 7 days refresh)
- Password hashing with bcrypt (10 rounds)
- CORS to specific origin (app.circleworks.com)
- Rate limiting (100 req/min per API key)
- Input validation & sanitization
- SQL injection prevention (Prisma)
- XSS protection via Content-Security-Policy
- HTTPS enforcement in production
- API key rotation support
- MFA support (TOTP)
- Webhook signature verification

## Testing Strategy

### Unit Tests

- Service layer business logic
- Validation & error handling
- Utility functions

### Integration Tests

- Controller ↔ Service ↔ Database
- Authentication & authorization
- Webhook delivery

### E2E Tests

- Complete user flows
- Multi-step workflows (e.g., payroll processing)
- Third-party integrations

Run tests:

```bash
npm test                    # All tests
npm run test:watch         # Watch mode
npm run test:cov          # Coverage report
npm run test:e2e          # E2E tests
```

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Redis cache running
- [ ] Elasticsearch cluster ready
- [ ] S3 bucket created with policies
- [ ] CORS origin configured
- [ ] JWT secrets generated and secured
- [ ] Sentry project created
- [ ] SSL/TLS certificate installed
- [ ] Health checks configured
- [ ] Monitoring & alerting enabled
- [ ] Backup strategy in place
- [ ] Rate limiting configured
- [ ] Webhook endpoints tested

## Performance Optimization

### Database

- Indexed fields: `userId`, `companyId`, `email`, `status`, etc.
- Query optimization with Prisma's `select` & `include`
- Pagination for large datasets
- Connection pooling via PgBouncer

### Caching

- Redis cache for hot data
- Cache-aside pattern
- TTL-based expiration

### API

- Compression (gzip)
- Load balancing
- CDN for static assets
- Async processing for slow operations (BullMQ queues)

## Monitoring & Observability

### Metrics

- Response times by endpoint
- Error rates & types
- Database query performance
- Cache hit rates

### Logging

- Winston for structured logging
- Request ID tracking for debugging
- Error stack traces to Sentry

### Alerts

- API response time > 1s
- Error rate > 1%
- Database connection pool exhaustion
- Redis memory usage > 80%

## Scaling Strategy

### Horizontal

- Deploy multiple API instances behind load balancer
- Use managed PostgreSQL (RDS, Supabase)
- Use managed Redis (ElastiCache, Redis Cloud)
- CDN for static assets

### Vertical

- Increase server resources
- Optimize slow queries
- Implement aggressive caching
- Separate read replicas

## Roadmap

### Phase 1 (Current)

- ✅ Auth module with JWT
- ✅ Core CRUD modules
- ✅ Payroll processing
- ✅ Employee management
- Database schema & migrations

### Phase 2

- Webhook system
- Elasticsearch integration
- Real-time updates (WebSockets)
- File upload to S3
- Email notifications

### Phase 3

- Advanced reporting
- Tax compliance automation
- ATS pipeline management
- Benefits enrollment flows
- Performance review cycles

### Phase 4

- Mobile app API
- Third-party integrations
- Custom workflows engine
- Multi-tenant isolation
- Analytics & insights

## Support & Contact

- **Documentation:** https://api.circleworks.com/docs
- **Issues:** support@circleworks.com
- **Status:** https://status.circleworks.com
