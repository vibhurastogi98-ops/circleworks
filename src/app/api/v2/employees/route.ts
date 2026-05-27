import { NextResponse } from "next/server";
import { and, asc, count, desc, eq, sql } from "drizzle-orm";
import type { NextRequest } from "next/server";

import { db } from "@/db";
import { employees, users } from "@/db/schema";
import {
  createCursorPaginationEnvelope,
  DEFAULT_CURSOR_LIMITS,
  parseCursorPagination,
} from "@/lib/cursorPagination";
import { applyEmployeeFieldVisibility } from "@/lib/fieldVisibility";
import { requireApiPermission } from "@/lib/apiRbac";
import { versionedResponse } from "@/lib/apiVersioning";

const fallbackEmployees = [
  { id: "1", firstName: "Sarah", lastName: "Smith", email: "sarah.smith@example.com", jobTitle: "Lead Engineer", department: "Engineering", employmentType: "full-time", status: "active", location: "New York, NY", locationType: "On-Site", avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Sarah&backgroundColor=transparent", startDate: "2022-03-15", salary: 150000, personalPhone: "(555) 123-4567", createdAt: "2026-01-06T00:00:00.000Z" },
  { id: "2", firstName: "Michael", lastName: "Chen", email: "m.chen@example.com", jobTitle: "Product Designer", department: "Design", employmentType: "full-time", status: "active", location: "San Francisco, CA", locationType: "Remote", avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Michael&backgroundColor=transparent", startDate: "2023-01-10", salary: 125000, personalPhone: "(555) 234-5678", createdAt: "2026-01-05T00:00:00.000Z" },
  { id: "3", firstName: "Emma", lastName: "Watson", email: "emma.w@example.com", jobTitle: "Marketing Manager", department: "Marketing", employmentType: "full-time", status: "onboarding", location: "London, UK", locationType: "Hybrid", avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Emma&backgroundColor=transparent", startDate: "2024-04-01", salary: 110000, personalPhone: "(555) 345-6789", createdAt: "2026-01-04T00:00:00.000Z" },
  { id: "4", firstName: "David", lastName: "Lee", email: "d.lee@example.com", jobTitle: "Sales Director", department: "Sales", employmentType: "full-time", status: "active", location: "Austin, TX", locationType: "On-Site", avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=David&backgroundColor=transparent", startDate: "2021-11-20", salary: 135000, personalPhone: "(555) 456-7890", createdAt: "2026-01-03T00:00:00.000Z" },
  { id: "5", firstName: "Jessica", lastName: "Rivera", email: "j.rivera@example.com", jobTitle: "HR Manager", department: "Human Resources", employmentType: "full-time", status: "active", location: "Denver, CO", locationType: "Hybrid", avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Jessica&backgroundColor=transparent", startDate: "2023-06-15", salary: 95000, personalPhone: "(555) 567-8901", createdAt: "2026-01-02T00:00:00.000Z" },
  { id: "6", firstName: "James", lastName: "Patterson", email: "j.patterson@example.com", jobTitle: "Finance Manager", department: "Finance", employmentType: "full-time", status: "active", location: "Chicago, IL", locationType: "On-Site", avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=James&backgroundColor=transparent", startDate: "2022-08-22", salary: 120000, personalPhone: "(555) 678-9012", createdAt: "2026-01-01T00:00:00.000Z" },
];

export async function GET(req: NextRequest) {
  try {
    const permissionCheck = await requireApiPermission(req, "view_employees");
    if (permissionCheck.response) return permissionCheck.response;
    const session = permissionCheck.session;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const pagination = parseCursorPagination(req.nextUrl.searchParams, DEFAULT_CURSOR_LIMITS.employees);
    if (pagination instanceof NextResponse) return pagination;

    const [userEmployee] = await db
      .select({ companyId: employees.companyId, role: users.role, requesterEmployeeId: employees.id })
      .from(employees)
      .leftJoin(users, eq(employees.userId, users.id))
      .where(eq(users.id, session.userId));

    if (!userEmployee?.companyId) {
      const data = fallbackEmployees
        .slice(0, pagination.limit)
        .map((employee) =>
          applyEmployeeFieldVisibility(employee, {
            requesterRole: "employee",
            isSelf: false,
            isManager: false,
          }),
        );

      return versionedResponse(
        createCursorPaginationEnvelope(data, {
          totalCount: fallbackEmployees.length,
          hasNextPage: fallbackEmployees.length > pagination.limit,
          hasPreviousPage: false,
          getCursorPayload: (employee) => ({
            id: String(employee.id),
            sort_field: String(employee.createdAt),
          }),
        }),
        "v2",
        req,
      );
    }

    const cursorId = pagination.cursor ? Number.parseInt(pagination.cursor.id, 10) : null;
    const cursorDate = pagination.cursor ? new Date(pagination.cursor.sort_field) : null;

    if (pagination.cursor && (!cursorDate || Number.isNaN(cursorDate.getTime()) || !cursorId)) {
      return NextResponse.json(
        { error: "invalid_cursor", message: "Cursor sort_field must be an ISO date and id must be numeric." },
        { status: 400 },
      );
    }

    const cursorPredicate = cursorDate && cursorId
      ? pagination.direction === "next"
        ? sql`(${employees.createdAt}, ${employees.id}) < (${cursorDate}, ${cursorId})`
        : sql`(${employees.createdAt}, ${employees.id}) > (${cursorDate}, ${cursorId})`
      : undefined;
    const where = and(
      eq(employees.companyId, userEmployee.companyId),
      cursorPredicate,
    );

    const [{ totalCount }] = await db
      .select({ totalCount: count() })
      .from(employees)
      .where(eq(employees.companyId, userEmployee.companyId));

    const rows = await db.query.employees.findMany({
      where,
      orderBy: pagination.direction === "next"
        ? [desc(employees.createdAt), desc(employees.id)]
        : [asc(employees.createdAt), asc(employees.id)],
      limit: pagination.limit + 1,
    });

    const hasMore = rows.length > pagination.limit;
    const pageRows = rows.slice(0, pagination.limit);
    const orderedRows = pagination.direction === "prev" ? [...pageRows].reverse() : pageRows;
    const requesterRole = userEmployee.role || "employee";
    const requesterEmployeeId = userEmployee.requesterEmployeeId;
    const data = orderedRows.map((employee) => {
      const isSelf = requesterEmployeeId === employee.id;
      const isManager = requesterEmployeeId === employee.managerId;

      return applyEmployeeFieldVisibility(employee, {
        requesterRole,
        isSelf,
        isManager,
      });
    });

    return versionedResponse(
      createCursorPaginationEnvelope(data, {
        totalCount,
        hasNextPage: pagination.direction === "next" ? hasMore : Boolean(pagination.cursor),
        hasPreviousPage: pagination.direction === "prev" ? hasMore : Boolean(pagination.cursor),
        getCursorPayload: (employee) => ({
          id: String(employee.id),
          sort_field: new Date(String(employee.createdAt)).toISOString(),
        }),
      }),
      "v2",
      req,
    );
  } catch (error) {
    console.error("[Employees v2 GET Error]", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to fetch employees." },
      { status: 500 },
    );
  }
}
