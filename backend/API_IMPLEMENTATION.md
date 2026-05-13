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
All webhook payloads include HMAC signature:

```
POST https://your-domain.com/webhook
Headers:
  X-Signature: sha256=<hmac-signature>
  X-Event-Type: payroll.run.processed
  X-Delivery-ID: uuid

Body:
{
  "event": "payroll.run.processed",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "runId": "123",
    "status": "processed",
    ...
  }
}
```

### Signature Verification
```javascript
const crypto = require('crypto');

const payload = req.rawBody; // Raw request body
const signature = req.headers['x-signature'];
const secret = process.env.WEBHOOK_SECRET;

const hmac = crypto
  .createHmac('sha256', secret)
  .update(payload)
  .digest('base64');

const expectedSignature = `sha256=${hmac}`;
const isValid = signature === expectedSignature;
```

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
