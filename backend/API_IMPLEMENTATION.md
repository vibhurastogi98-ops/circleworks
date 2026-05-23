# API Implementation Guide

## Overview

This document outlines the complete API backend architecture for CircleWorks platform.

## Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Runtime | Node.js | 18+ |
| Framework | NestJS | 10.3+ |
| Language | TypeScript | 5.3+ |
| Database | PostgreSQL | 14+ |
| ORM | Prisma | 5.8+ |
| Cache | Redis | 7+ |
| Queue | BullMQ (`bullmq` + `@nestjs/bullmq`) | 5.x |
| Search | Elasticsearch | 8.10+ |
| Storage | AWS S3 | - |
| Auth | JWT + Bcrypt | - |
| Monitoring | Sentry + Winston | - |

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
6. Generate refresh token (7 days)
7. Store refresh token in database
8. Return tokens

### Refresh Token
1. Client sends refresh token
2. Verify token signature & expiration
3. Check if token is not revoked
4. Generate new access token
5. Return new token

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

For list endpoints, use query parameters:

```
GET /api/v1/employees?page=1&limit=20&sort=name&order=asc&status=ACTIVE&dept=sales
```

Response format:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

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
- Window model: Redis-backed sliding-window style counters per endpoint category and identity scope

### Rate Limit Tiers

| Endpoint type | Scope | Limit |
| --- | --- | --- |
| Auth endpoints (`/auth/login`, `/auth/signup`, `/auth/register`) | IP | 5 requests / minute |
| Auth sensitive (`/auth/forgot-password`, `/auth/reset-password`, `/auth/mfa/*`) | IP | 3 requests / 15 minutes |
| General authenticated API | User | 100 requests / minute |
| Payroll processing writes | Company | 5 requests / minute |
| Bulk operations (`/batch`, `/bulk`, `/import`) | Company | 10 requests / hour |
| Report generation/export writes | User | 20 requests / hour |
| Company aggregate | Company | 1,000 requests / minute |
| Public API developer keys (`x-api-key`) | Key | 60 requests / minute |

### Redis Key Patterns

- IP-based: `rl:ip:{ip}:{rule}`
- User-based: `rl:user:{userId}:{rule}`
- Company-based: `rl:company:{companyId}:{rule}`
- Public API key-based: `rl:key:{apiKey}:{rule}`

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

| Field type | Stored audit value |
| --- | --- |
| SSN / Tax ID | `***-**-1234` with only the last 4 digits visible |
| Bank routing number | `***6789` with only the last 4 digits visible |
| Bank account number | `***4821` with only the last 4 digits visible |
| Salary / compensation, HR/Admin actor | `Updated from $X to $Y` |
| Salary / compensation, non-HR actor | `Compensation updated` |
| Password | `Password changed` |

### Audit Log Display

The API performs a second display-time guard for `/compliance/audit-log` responses:

| Viewer role | Sensitive field display |
| --- | --- |
| HR/Admin | Masked value only, such as `***-**-1234` |
| Non-HR | `[Sensitive field — masked]` for SSN, bank, and salary fields |

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
  "events": ["payroll.run.processed", "employee.created"],
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

| Event | Payload |
| --- | --- |
| `employee.created` | `{ id, firstName, lastName, email, startDate, departmentId, companyId, timestamp }` |
| `employee.terminated` | `{ id, terminationDate, terminationType, finalPayDate, companyId, timestamp }` |
| `payroll.completed` | `{ runId, payPeriodStart, payPeriodEnd, totalGross, totalNet, employeeCount }` |
| `document.signed` | `{ documentId, documentType, employeeId, signedAt, companyId }` |
| `candidate.hired` | `{ candidateId, employeeId, jobId, startDate, companyId, timestamp }` |

### Signature Verification
```javascript
const crypto = require('crypto');

const payload = req.rawBody; // Raw request body
const signature = req.headers['x-circleworks-signature'];
const secret = process.env.WEBHOOK_SECRET;

const hmac = crypto
  .createHmac('sha256', secret)
  .update(payload)
  .digest('hex');

const expectedSignature = hmac;
const isValid = signature === expectedSignature;
```

## API Versioning Strategy

- Current stable major version: `/v1/`
- Stability policy: `/v1/` is supported for at least 18 months after a deprecation notice
- Next major version: `/v2/`, introduced alongside `/v1/` for breaking changes only
- Minor version header: `API-Version: 2025-01-01` for date-based minor versioning within `/v1/`
- Deprecation headers: `Deprecation: true` and `Sunset: [date]`

## Batch Endpoints

| Method | Endpoint | Contract |
| --- | --- | --- |
| `POST` | `/api/v1/employees/batch` | Create up to 100 employees in one request |
| `GET` | `/api/v1/employees/batch?ids=id1,id2,id3` | Fetch multiple employees by ID |
| `POST` | `/api/v1/payroll/batch-approve` | Approve multiple payroll runs for the accountant portal |
| `POST` | `/api/v1/documents/batch-send` | Send a document to multiple employees |

## File Upload Limits

| Upload type | Limit | Allowed types |
| --- | --- | --- |
| Employee documents | 25 MB | PDF, JPG, PNG, DOCX |
| CSV imports | 10 MB and 5,000 rows | CSV |
| Company logo | 2 MB | PNG, JPG, SVG |

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
