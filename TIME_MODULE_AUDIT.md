# Time Module Audit Report - 2026-04-25

## Overview
This document summarizes the findings of a read-only audit of the CircleWorks Time & Attendance module (Next.js + Drizzle ORM + Neon PostgreSQL).

## Identified Bugs & Inconsistencies

1. **Data Leak in Admin Overview**
   - **File**: `src/app/api/time/admin/overview/route.ts`
   - **Issue**: The `activeBreaks` query lacks a `companyId` filter.
   - **Impact**: The "On Break Now" count on the admin dashboard reflects employees from all companies in the database, not just the user's company.

2. **Brittle Guest Mode Fallbacks**
   - **Files**: 
     - `src/app/api/time/status/route.ts`
     - `src/app/api/time/clock-in/route.ts`
     - `src/app/api/time/entries/route.ts`
   - **Issue**: All these routes use a hardcoded `GUEST_CLERK_USER_ID`. If the lookup fails, they default to `employeeId = 1` or `companyId = 1`.
   - **Impact**: Inconsistent data display if the guest user record is missing or if IDs don't match the environment (e.g., Guest is Employee 31 in Company 6).

3. **Frontend Silencing of API Errors**
   - **File**: `src/app/time/page.tsx`
   - **Issue**: If the API returns `success: false`, the `data` state is not updated.
   - **Impact**: The UI displays fallback zeros for all statistics without informing the user that a fetch error occurred.

4. **Timezone Inconsistency in Weekly Summary**
   - **File**: `src/app/me/time/page.tsx`
   - **Issue**: `getWeekStart()` uses client-side local time, while the database stores UTC timestamps.
   - **Impact**: Potential for missing or misaligned entries at the start/end of the week depending on the user's timezone.

5. **Missing Database-Level Constraints**
   - **File**: `src/db/schema.ts`
   - **Issue**: No unique constraint or validation to prevent overlapping `time_entries` for the same employee.
   - **Impact**: Could lead to double-counting hours if multiple entries are created for the same period.

## Diagnostic Summary
- **Database Connection**: Verified. Tables `time_entries`, `time_breaks`, `timesheets`, `shifts`, and `time_policies` exist.
- **Data Status**: 
  - 14 employees exist across 6 companies. 
  - Guest user is assigned to **Company 6** (1 employee).
  - `shifts` and `timesheets` tables are currently **empty**, which is why those specific KPIs show zero.
- **API Status**: All Time module API routes tested (`/api/time/admin/overview`, `/api/time/status`, `/api/time/entries`) are returning valid JSON responses.

## Audit Scripts Created
- `scratch/audit_time_tables.ts`: Verifies table existence and record counts.
- `scratch/test_overview_logic.ts`: Tests the core logic of the admin overview API.
