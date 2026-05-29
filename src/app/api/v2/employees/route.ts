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
import { getEmployeeApiFallback } from "@/lib/hris-module-data";
import { versionedResponse } from "@/lib/apiVersioning";

const fallbackEmployees = getEmployeeApiFallback();

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
