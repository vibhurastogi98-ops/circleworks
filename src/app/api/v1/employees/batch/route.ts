/**
 * POST /api/v1/employees/batch — Create up to 100 employees in one request
 * GET  /api/v1/employees/batch?ids=id1,id2,id3 — Fetch multiple employees by ID
 *
 * Section 35: Batch Endpoints
 */

import { NextResponse } from "next/server";
import { db } from "@/db";
import { employees, onboardingCases, users } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { dispatchWebhook } from "../../../../../lib/webhooks";

const BATCH_CREATE_LIMIT = 100;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const idsParam = searchParams.get("ids");

    if (!idsParam) {
      return NextResponse.json(
        { error: "missing_parameter", message: "Query param 'ids' is required (comma-separated)." },
        { status: 400 }
      );
    }

    const ids = idsParam
      .split(",")
      .map((id) => parseInt(id.trim(), 10))
      .filter((id) => !isNaN(id));

    if (ids.length === 0) {
      return NextResponse.json(
        { error: "invalid_ids", message: "No valid numeric IDs provided." },
        { status: 400 }
      );
    }

    if (ids.length > BATCH_CREATE_LIMIT) {
      return NextResponse.json(
        { error: "batch_limit_exceeded", message: `Maximum ${BATCH_CREATE_LIMIT} IDs per request.` },
        { status: 400 }
      );
    }

    const results = await db
      .select()
      .from(employees)
      .where(inArray(employees.id, ids));

    return NextResponse.json({
      data: results,
      count: results.length,
      requested: ids.length,
    });
  } catch (error: any) {
    console.error("[Batch GET /employees/batch]", error);
    return NextResponse.json({ error: "internal_error", message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate top-level structure
    if (!Array.isArray(body.employees)) {
      return NextResponse.json(
        { error: "invalid_body", message: "Body must contain an 'employees' array." },
        { status: 400 }
      );
    }

    const records: typeof body.employees = body.employees;

    if (records.length === 0) {
      return NextResponse.json(
        { error: "empty_batch", message: "Employees array must not be empty." },
        { status: 400 }
      );
    }

    if (records.length > BATCH_CREATE_LIMIT) {
      return NextResponse.json(
        { error: "batch_limit_exceeded", message: `Maximum ${BATCH_CREATE_LIMIT} employees per batch request.` },
        { status: 400 }
      );
    }

    // Validate each record has required fields
    const validationErrors: { index: number; error: string }[] = [];
    records.forEach((emp: any, i: number) => {
      if (!emp.firstName) validationErrors.push({ index: i, error: "firstName is required" });
      if (!emp.email) validationErrors.push({ index: i, error: "email is required" });
    });

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: "validation_failed", validationErrors },
        { status: 422 }
      );
    }

    // Resolve companyId — default guest mode
    const userId = "user_2lI7hKq2Xy4Z6mN8sO1A3ZDRQRD";
    const [userEmployee] = await db
      .select({ companyId: employees.companyId })
      .from(employees)
      .leftJoin(users, eq(employees.userId, users.id))
      .where(eq(users.clerkUserId, userId));

    const companyId = userEmployee?.companyId || body.companyId;
    if (!companyId) {
      return NextResponse.json(
        { error: "company_not_found", message: "Could not resolve company for this user." },
        { status: 400 }
      );
    }

    // Build insert payloads
    const insertData = records.map((emp: any) => ({
      firstName: emp.firstName,
      lastName: emp.lastName || null,
      email: emp.email,
      companyId,
      jobTitle: emp.jobTitle || null,
      department: emp.department || null,
      departmentId: emp.departmentId || null,
      location: emp.location || null,
      locationType: emp.locationType || "On-Site",
      startDate: emp.startDate || null,
      salary: emp.salary || null,
      employmentType: emp.employmentType || "full-time",
      managerId: emp.managerId || null,
      status: "onboarding" as const,
      avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${emp.firstName}&backgroundColor=transparent`,
    }));

    const created = await db.insert(employees).values(insertData).returning();

    // Create onboarding cases for each new employee
    const onboardingData = created.map((emp) => ({
      employeeId: emp.id,
      status: "Active",
      startDate: emp.startDate || null,
    }));
    await db.insert(onboardingCases).values(onboardingData);

    // Fire 'employee.created' webhook for each new employee (non-blocking)
    created.forEach((emp) => {
      dispatchWebhook("employee.created", {
        id: emp.id,
        firstName: emp.firstName,
        lastName: emp.lastName,
        email: emp.email,
        startDate: emp.startDate,
        departmentId: emp.departmentId,
        companyId: emp.companyId,
        timestamp: new Date().toISOString(),
      }).catch((err: any) => console.error("[Webhook] employee.created failed", err));
    });

    console.log(`[Batch POST /employees/batch] Created ${created.length} employees for company ${companyId}`);

    return NextResponse.json(
      {
        created: created.length,
        data: created,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[Batch POST /employees/batch]", error);
    return NextResponse.json({ error: "internal_error", message: error.message }, { status: 500 });
  }
}
