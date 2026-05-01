# WebSocket Real-time Sync Implementation

This document outlines the complete WebSocket implementation for real-time synchronization in CircleWorks HR platform.

## Backend Implementation

### WebSocket Server Setup

**Location**: `backend/src/modules/websockets/`

- **Gateway**: `events.gateway.ts` - Socket.io gateway with JWT authentication
- **Service**: `websockets.service.ts` - Service for emitting events to clients
- **Module**: `websockets.module.ts` - NestJS module configuration

**Features**:
- Namespace: `/`
- Rooms: `company:{companyId}`, `user:{userId}`
- JWT authentication via auth header or cookie
- Heartbeat: 25s ping, 60s timeout
- Automatic room joining on connect

### Integration Examples

**Payroll Module** (`backend/src/modules/payroll/`):
- `PayrollService` with WebSocket event emission
- Events: run status updates, completion, approval requirements, direct deposit confirmations

**Employees Module** (`backend/src/modules/employees/`):
- `EmployeesService` with WebSocket event emission
- Events: creation, updates, termination, clock in/out

## Frontend Implementation

### WebSocket Store

**Location**: `src/store/useSocketStore.ts`

**Features**:
- Zustand store for socket instance management
- Exponential backoff reconnection (1s → 2s → 4s → 8s... max 30s)
- Automatic TanStack Query refetch on reconnect
- Global socket access

### Event Handlers

**Location**: `src/hooks/useWebSocketEvents.ts`

**Registered Events**:
- **Payroll**: run status, completion, approval required, direct deposit sent
- **Employee**: created, updated, terminated, clocked in/out
- **Time**: PTO requested/approved/denied, overtime alerts
- **Hiring**: candidate applied, stage changed, offer signed
- **Expense**: submitted, approved, denied
- **Notification**: new notifications, batch updates
- **Compliance**: alerts
- **System**: maintenance, feature announcements

### Optimistic UI Updates

**Location**: `src/hooks/useOptimisticMutations.ts`

**Pattern**: (1) Update cache immediately, (2) Send API request, (3) Rollback on error

**Available Hooks**:
- `useOptimisticEmployeeUpdate()` - Employee profile changes
- `useOptimisticPtoApproval()` - PTO request approvals
- `useOptimisticExpenseApproval()` - Expense approvals
- `useOptimisticAtsStageChange()` - ATS candidate stage changes

### Socket Provider

**Location**: `src/components/SocketProvider.tsx`

**Features**:
- Connects on app mount with JWT token
- Registers all event handlers
- Provides connection status via context

## WebSocket Events Documentation

### Server → Client Events

#### Payroll Events
- `payroll.run.status_update` - `{ runId, status, progress }`
- `payroll.run.completed` - `{ runId, totalGross, employeeCount }`
- `payroll.approval.required` - `{ runId, approverIds }`
- `payroll.direct_deposit.sent` - `{ runId }`

#### Employee Events
- `employee.created` - `{ employee }`
- `employee.updated` - `{ employeeId, changedFields }`
- `employee.terminated` - `{ employeeId, lastDay }`
- `employee.clocked_in` - `{ employeeId, timestamp }`
- `employee.clocked_out` - `{ employeeId, timestamp, hoursWorked }`

#### Time Events
- `time.pto.requested` - `{ requestId, employeeId, dates }`
- `time.pto.approved` - `{ requestId }`
- `time.pto.denied` - `{ requestId }`
- `time.overtime.alert` - `{ employeeId, hoursThisWeek }`

#### Hiring Events
- `ats.candidate.applied` - `{ jobId, candidateId, candidateName }`
- `ats.candidate.stage_changed` - `{ candidateId, fromStage, toStage }`
- `ats.offer.signed` - `{ candidateId, jobId }`

#### Expense Events
- `expense.submitted` - `{ expenseId, employeeId, amount }`
- `expense.approved` - `{ expenseId }`
- `expense.denied` - `{ expenseId }`

#### Notification Events
- `notification.new` - `{ notification }`
- `notification.batch_update` - `{}`

#### Compliance Events
- `compliance.alert.new` - `{ alertId, severity, description }`

#### System Events
- `system.maintenance.scheduled` - `{ startAt, duration }`
- `feature.announcement` - `{ title, description, ctaUrl }`

## Usage Examples

### Backend - Emitting Events

```typescript
// In any service
constructor(private readonly websocketsService: WebsocketsService) {}

async createEmployee(companyId: string, employeeData: any) {
  // Create in database...

  // Emit real-time event
  this.websocketsService.emitEmployeeCreated(companyId, {
    employee: employeeData,
  });
}
```

### Frontend - Optimistic Updates

```typescript
const updateEmployee = useOptimisticEmployeeUpdate();

const handleUpdate = async (employeeId: string, data: any) => {
  await updateEmployee.mutateAsync({ employeeId, data });
  // Cache updated immediately, API called, rollback on error
};
```

### Frontend - Custom Event Handling

```typescript
import { useSocketStore } from '@/store/useSocketStore';

const { on } = useSocketStore();

useEffect(() => {
  const handleCustomEvent = (data) => {
    // Handle event
  };

  on('custom.event', handleCustomEvent);

  return () => {
    off('custom.event', handleCustomEvent);
  };
}, [on, off]);
```

## Environment Variables

**Backend**:
- `JWT_SECRET` - For token verification
- `FRONTEND_URL` - CORS origin (default: http://localhost:3000)

**Frontend**:
- `NEXT_PUBLIC_WS_URL` - WebSocket server URL (default: http://localhost:3001)

## Security

- JWT tokens required for connection
- Company-scoped rooms prevent cross-company data leaks
- User-specific rooms for personal notifications
- Automatic disconnection on invalid tokens

## Performance

- Efficient room-based broadcasting
- Heartbeat for connection health monitoring
- Exponential backoff for reconnection
- Automatic query refetch on reconnect to sync missed updates