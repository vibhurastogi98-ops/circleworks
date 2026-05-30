import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { employees, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireApiPermission } from "@/lib/apiRbac";
import { createPayrollRunWithEngine } from "@/lib/payroll/run-engine";

export async function POST(req: NextRequest) {
  try {
    const { session, response } = await requireApiPermission(req, "run_payroll");
    if (response) return response;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [userEmployee] = await db
      .select({ companyId: employees.companyId })
      .from(employees)
      .innerJoin(users, eq(employees.userId, users.id))
      .where(eq(users.id, session.userId));

    if (!userEmployee?.companyId) {
      return NextResponse.json({ error: "Employee record not found" }, { status: 404 });
    }

    const companyId = userEmployee.companyId;

    const body = await req.json().catch(() => ({}));
    const { payPeriodStart, payPeriodEnd, checkDate, type = "regular", timeImportMissingMode = "continue" } = body;

    if (!payPeriodStart || !payPeriodEnd || !checkDate) {
      return NextResponse.json(
        { error: "payPeriodStart, payPeriodEnd, and checkDate are required" },
        { status: 400 }
      );
    }

    const result = await createPayrollRunWithEngine({
      companyId,
      payPeriodStart,
      payPeriodEnd,
      checkDate,
      type,
      timeImportMissingMode,
    });

    if (!result.ok) {
      return NextResponse.json(
        {
          error: result.error,
          message: result.message,
          preflight: result.preflight,
          options: result.options,
        },
        { status: result.status }
      );
    }

    return NextResponse.json({ run: result.run, preflight: result.preflight }, { status: result.status });
  } catch (error: any) {
    console.error("[POST /api/payroll/runs]", error);
    return NextResponse.json(
      { error: error.message || "Failed to create payroll run" },
      { status: 500 }
    );
  }
}
