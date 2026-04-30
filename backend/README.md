# CircleWorks API Backend

Complete REST API backend for the CircleWorks HR & Payroll platform built with NestJS.

## Overview

**Framework:** NestJS (Node.js + TypeScript)  
**Database:** PostgreSQL via Prisma ORM  
**Cache:** Redis  
**Queue:** BullMQ on Redis  
**Search:** Elasticsearch  
**Storage:** AWS S3  
**Auth:** JWT + Refresh tokens  
**Realtime:** Socket.io  
**Deployment:** Railway or AWS ECS  
**Domain:** api.circleworks.com

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis
- npm or yarn

### Installation

```bash
cd backend
npm install
```

### Environment Setup

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

### Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database (optional)
npm run db:seed
```

### Running the API

**Development:**
```bash
npm run start:dev
```

**Production:**
```bash
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3001`  
Swagger docs at `http://localhost:3001/docs`

## API Architecture

### API Versioning

All endpoints use the `/api/v1` prefix.

```
POST /api/v1/auth/login
GET /api/v1/employees
POST /api/v1/payroll/runs
```

### Authentication

- **JWT Bearer Token** (15-minute expiration)
- **Refresh Token** (7-day expiration)
- **API Key** (for third-party integrations)

Include token in Authorization header:
```
Authorization: Bearer <access_token>
```

### Rate Limiting

- **100 requests per minute** per API key (configurable)
- Returns `429 Too Many Requests` when exceeded

### Error Handling

All errors follow a consistent format:

```json
{
  "statusCode": 400,
  "message": "Invalid email address",
  "error": "BAD_REQUEST",
  "requestId": "uuid-here",
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/v1/auth/register"
}
```

**Status Codes:**
- `200` OK
- `201` Created
- `400` Bad Request (validation errors)
- `401` Unauthorized (invalid credentials)
- `403` Forbidden (insufficient permissions)
- `404` Not Found
- `409` Conflict (resource exists)
- `422` Unprocessable Entity
- `429` Too Many Requests (rate limit)
- `500` Internal Server Error

## API Endpoints

### Authentication (`/auth`)

```
POST   /auth/register              Create account
POST   /auth/login                 Login & get tokens
POST   /auth/refresh               Exchange refresh token
POST   /auth/logout                Invalidate tokens
POST   /auth/forgot-password       Send password reset email
POST   /auth/reset-password        Reset password with token
POST   /auth/verify-email          Verify email address
POST   /auth/mfa/enable            Enable 2FA (TOTP)
POST   /auth/mfa/verify            Verify MFA setup
POST   /auth/mfa/disable           Disable 2FA
GET    /auth/me                    Current user info
```

### Users (`/users`)

```
GET    /users/me                   Current user profile
PUT    /users/me                   Update profile
GET    /users/me/preferences       User preferences
PUT    /users/me/tour              Update tour status
DELETE /users/me                   Delete account
```

### Companies (`/companies`)

```
GET    /companies/{id}             Get company details
POST   /companies                  Create company
PUT    /companies/{id}             Update company
GET    /companies/{id}/users       List team members
POST   /companies/{id}/invitations Invite user to company
POST   /companies/switch           Switch active company
```

### Employees (`/employees`)

```
GET    /employees                  List employees (paginated, filterable)
POST   /employees                  Create employee
GET    /employees/{id}             Get employee profile
PUT    /employees/{id}             Update employee
DELETE /employees/{id}             Terminate employee (soft delete)
GET    /employees/{id}/compensation-history  Compensation history
POST   /employees/{id}/compensation-change   Request pay change
GET    /employees/{id}/documents   Employee documents
POST   /employees/{id}/documents   Upload document
GET    /employees/org-chart        Organization chart (tree)
GET    /employees/bulk-template    CSV import template
POST   /employees/bulk-import      Bulk import employees
```

### Payroll (`/payroll`)

```
POST   /payroll/runs               Create payroll run
GET    /payroll/runs               List payroll runs
GET    /payroll/runs/{runId}       Get run details
PUT    /payroll/runs/{runId}       Edit payroll run
POST   /payroll/runs/{runId}/submit  Submit for approval
POST   /payroll/runs/{runId}/approve  Approve run
POST   /payroll/runs/{runId}/process  Process & trigger ACH
GET    /payroll/runs/{runId}/paystubs  Get paystubs
GET    /payroll/runs/{runId}/paystubs/{employeeId}  Employee paystub
GET    /payroll/schedules          List pay schedules
POST   /payroll/schedules          Create schedule
PUT    /payroll/schedules/{id}     Update schedule
GET    /payroll/tax-accounts       List tax accounts
POST   /payroll/tax-accounts       Create tax account
GET    /payroll/garnishments       List garnishments
POST   /payroll/garnishments       Add garnishment
GET    /payroll/history            Completed payroll runs
```

### HRIS (`/employees`, `/departments`, `/positions`)

```
GET    /employees                  (see above)
GET    /departments                List departments
POST   /departments                Create department
GET    /departments/{id}           Get department
PUT    /departments/{id}           Update department
DELETE /departments/{id}           Delete department
GET    /positions                  List positions
POST   /positions                  Create position
GET    /positions/{id}             Get position
PUT    /positions/{id}             Update position
DELETE /positions/{id}             Delete position
```

### ATS (`/jobs`, `/candidates`, `/interviews`, `/offers`)

```
GET    /jobs                       List job openings
POST   /jobs                       Create job opening
GET    /jobs/{id}                  Get job details
PUT    /jobs/{id}                  Update job
DELETE /jobs/{id}                  Close job
GET    /jobs/{id}/candidates       List candidates for job
GET    /candidates                 List all candidates
GET    /candidates/{id}            Get candidate profile
PUT    /candidates/{id}            Update candidate
PUT    /candidates/{id}/stage      Move to next stage
GET    /interviews                 List interviews
POST   /interviews                 Schedule interview
GET    /interviews/{id}            Get interview details
PUT    /interviews/{id}            Update interview
POST   /offers                     Create offer
GET    /offers/{id}                Get offer
PUT    /offers/{id}                Update offer status
```

### Onboarding (`/onboarding`)

```
GET    /onboarding/prehires        List pre-hires
POST   /onboarding/prehires        Create pre-hire
GET    /onboarding/templates       List templates
POST   /onboarding/templates       Create template
GET    /onboarding/tasks           List tasks
POST   /onboarding/tasks           Create task
PUT    /onboarding/tasks/{id}      Update task
DELETE /onboarding/tasks/{id}      Delete task
```

### Benefits (`/benefits`)

```
GET    /benefits/plans             List benefit plans
POST   /benefits/plans             Create plan
PUT    /benefits/plans/{id}        Update plan
GET    /benefits/enrollments       List enrollments
POST   /benefits/enrollments       Enroll employee
PUT    /benefits/enrollments/{id}  Update enrollment
GET    /benefits/oe                Open enrollment
POST   /benefits/qle               Life event
GET    /benefits/cobra             COBRA info
```

### Time & Attendance (`/time`)

```
GET    /time/entries               List time entries
POST   /time/entries               Create entry
PUT    /time/entries/{id}          Update entry
DELETE /time/entries/{id}          Delete entry
GET    /time/timesheets            List timesheets
POST   /time/timesheets            Submit timesheet
GET    /time/schedules             List schedules
POST   /time/schedules             Create schedule
GET    /time/pto/policies          List PTO policies
POST   /time/pto/requests          Request time off
PUT    /time/pto/requests/{id}     Approve/deny request
```

### Expenses (`/expenses`)

```
GET    /expenses                   List expense reports
POST   /expenses                   Create report
PUT    /expenses/{id}              Update report
DELETE /expenses/{id}              Delete report
POST   /expenses/{id}/approve      Approve report
GET    /expenses/policies          Expense policies
```

### Performance (`/performance`)

```
GET    /performance/reviews        List reviews
POST   /performance/reviews        Create review
PUT    /performance/reviews/{id}   Update review
GET    /performance/goals          List goals
POST   /performance/goals          Create goal
PUT    /performance/goals/{id}     Update goal
GET    /performance/feedback       List feedback
POST   /performance/feedback       Give feedback
```

### Compliance (`/compliance`)

```
GET    /compliance/alerts          List alerts
GET    /compliance/filings         List filings
POST   /compliance/filings         File document
GET    /compliance/i9              I-9 verifications
POST   /compliance/i9              Verify employee
```

### Reports (`/reports`)

```
GET    /reports/payroll-summary    Payroll summary
GET    /reports/headcount          Headcount report
GET    /reports/tax-liability      Tax liability
GET    /reports/custom             Custom reports
POST   /reports/custom             Create custom report
```

### Notifications (`/notifications`)

```
GET    /notifications              List notifications
PUT    /notifications/{id}/read    Mark as read
PUT    /notifications/preferences  Update preferences
```

### Search (`/search`)

```
GET    /search?q=<query>           Multi-entity search (via Elasticsearch)
```

### Automations (`/automations`)

```
GET    /automations                List automations
POST   /automations                Create automation
PUT    /automations/{id}           Update automation
DELETE /automations/{id}           Delete automation
GET    /automations/{id}/runs      Automation runs
```

### Webhooks (`/webhooks`)

```
POST   /webhooks                   Register webhook
GET    /webhooks                   List webhooks
DELETE /webhooks/{id}              Delete webhook
GET    /webhooks/{id}/deliveries   Webhook deliveries
```

## Webhook Events

POST requests to registered webhook URLs include HMAC signature in `X-Signature` header.

**Event Types:**
- `payroll.run.created`
- `payroll.run.approved`
- `payroll.run.processed`
- `employee.created`
- `employee.updated`
- `employee.terminated`
- `benefit.enrolled`
- `approval.requested`
- `approval.approved`

## Database Schema

The Prisma schema (`prisma/schema.prisma`) defines all data models:

- **Users** - System users with JWT auth
- **Companies** - Organizations
- **Employees** - Staff records
- **PayrollRuns** - Payroll processing
- **PayStubs** - Individual paychecks
- **BenefitPlans** - Health & retirement plans
- **TimeEntries** - Hours & attendance
- **Candidates** - ATS pipeline
- **PerformanceReviews** - 360 feedback
- **Expenses** - Expense reports
- **Automations** - Workflow triggers

## Project Structure

```
backend/
├── src/
│   ├── main.ts                 Entry point
│   ├── app.module.ts           Root module
│   ├── app.controller.ts       Health check
│   ├── app.service.ts
│   ├── common/                 Shared utilities
│   │   └── filters/            Exception filters
│   ├── prisma/                 Database
│   │   ├── prisma.service.ts
│   │   └── prisma.module.ts
│   └── modules/                Feature modules
│       ├── auth/               Authentication
│       ├── users/              User management
│       ├── companies/          Company management
│       ├── employees/          Employee records
│       ├── payroll/            Payroll processing
│       ├── ats/                Applicant tracking
│       ├── onboarding/         Employee onboarding
│       ├── benefits/           Benefits management
│       ├── time/               Time & attendance
│       ├── expenses/           Expense management
│       ├── performance/        Performance reviews
│       ├── compliance/         Compliance tracking
│       ├── reports/            Reporting & analytics
│       ├── notifications/      Notifications
│       ├── search/             Full-text search
│       ├── automations/        Workflow automations
│       └── webhooks/           Webhook system
├── prisma/
│   └── schema.prisma           Database schema
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## Development

### Running Tests

```bash
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:cov          # Coverage report
npm run test:e2e          # End-to-end tests
```

### Code Quality

```bash
npm run lint              # ESLint
npm run format            # Prettier
```

### Database Commands

```bash
npm run db:generate       # Generate Prisma client
npm run db:push           # Push schema to database
npm run db:migrate dev --name "migration-name"  # Create migration
npm run db:seed           # Seed database
```

## Deployment

### Docker

```dockerfile
# Build
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3001
CMD ["node", "dist/main"]
```

### Environment Variables

Configure in your deployment platform:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing key
- `REDIS_URL` - Redis connection string
- `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` - AWS credentials
- `SENTRY_DSN` - Error tracking
- `CORS_ORIGIN` - Allowed frontend origins

### Monitoring

- **Sentry** - Error tracking & monitoring
- **Winston** - Application logging
- **Health Check** - `GET /health`

## Security

- ✅ JWT authentication with refresh tokens
- ✅ Password hashing with bcrypt
- ✅ CORS restrictions to app.circleworks.com
- ✅ Rate limiting (100 req/min per API key)
- ✅ Webhook HMAC signatures
- ✅ Input validation with class-validator
- ✅ Error handling with Sentry integration
- ✅ Database soft deletes for data retention
- ✅ MFA support (TOTP)

## Support

For issues, feature requests, or documentation updates, please contact support@circleworks.com

## License

MIT
