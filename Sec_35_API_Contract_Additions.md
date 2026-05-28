# Sec. 35 — API Contract Additions

## Webhook Event Payloads

All webhook events are delivered as `POST` requests to the customer-configured URL. Each request includes an HMAC-SHA256 signature in the `X-CircleWorks-Signature` header, calculated over the raw JSON request body with the customer's webhook signing secret.

| Event | Payload |
| --- | --- |
| `employee.created` | `{ id, firstName, lastName, email, startDate, departmentId, companyId, timestamp }` |
| `employee.terminated` | `{ id, terminationDate, terminationType, finalPayDate, companyId, timestamp }` |
| `payroll.completed` | `{ runId, payPeriodStart, payPeriodEnd, totalGross, totalNet, employeeCount }` |
| `document.signed` | `{ documentId, documentType, employeeId, signedAt, companyId }` |
| `candidate.hired` | `{ candidateId, employeeId, jobId, startDate, companyId, timestamp }` |

## API Versioning Strategy

- Current stable API: `/v1/`
- `/v1/` support policy: supported for at least 18 months after deprecation notice
- Next major API: `/v2/`, introduced alongside `/v1/` for breaking changes only
- Minor version header: `API-Version: 2025-01-01` for date-based minor versioning within `/v1/`
- Deprecation headers: `Deprecation: true` and `Sunset: [date]`

## Batch Endpoints

| Method | Endpoint | Contract |
| --- | --- | --- |
| `POST` | `/api/v1/employees/batch` | Create up to 100 employees in one request |
| `POST` | `/api/v1/payroll/batch-approve` | Approve multiple payroll runs for the accountant portal |
| `GET` | `/api/v1/employees/batch?ids=id1,id2,id3` | Fetch multiple employees by ID |
| `POST` | `/api/v1/documents/batch-send` | Send a document to multiple employees |

## File Upload Limits

| Upload type | Limit | Allowed types |
| --- | --- | --- |
| Employee documents | 25 MB | PDF, JPG, PNG, DOCX |
| CSV imports | 10 MB and 5,000 rows | CSV |
| Company logo | 2 MB | PNG, JPG, SVG |

When an uploaded file is too large, APIs return HTTP `413 Request Too Large`:

```json
{
  "error": "file_too_large",
  "max_size_mb": 25
}
```
