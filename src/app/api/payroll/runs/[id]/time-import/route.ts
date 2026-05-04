import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { payrollTimeImports } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getTimesheetHoursImport } from "@/lib/payroll/timesheet-import";
import { getSession } from "@/lib/session";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const useScheduledHoursForMissing = searchParams.get("missing") === "scheduled";
    const result = await getTimesheetHoursImport(id, { useScheduledHoursForMissing });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[Payroll Time Import API Error]", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Persist the approved import result to payroll_time_imports rows.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const payrollId = parseInt(id);
    if (isNaN(payrollId)) {
      return NextResponse.json({ error: "Invalid payroll run ID" }, { status: 400 });
    }

    const body = await req.json();
    const { imports } = body as {
      imports: Array<{
        employeeId: number;
        timesheetId?: number | null;
        source: "timesheet" | "scheduled" | "manual";
        regularHours: number;
        overtimeHours: number;
        doubleTimeHours: number;
        totalHours: number;
        lateWithinCutoff: boolean;
        partialPeriodReason?: "new_hire" | "termination" | null;
        days: Array<{ date: string; regularHours: number; overtimeHours: number; doubleTimeHours: number }>;
        manuallyOverridden?: boolean;
        overrideOriginalHours?: number | null;
        overrideHours?: number | null;
        overrideReason?: string | null;
      }>;
    };

    if (!Array.isArray(imports) || imports.length === 0) {
      return NextResponse.json({ error: "No imports provided" }, { status: 400 });
    }

    let upserted = 0;
    for (const line of imports) {
      const existing = await db.query.payrollTimeImports.findFirst({
        where: and(
          eq(payrollTimeImports.payrollId, payrollId),
          eq(payrollTimeImports.employeeId, line.employeeId)
        ),
      });

      const values = {
        payrollId,
        employeeId: line.employeeId,
        timesheetId: line.timesheetId ?? null,
        source: line.source,
        regularHours: line.regularHours,
        overtimeHours: line.overtimeHours,
        doubleTimeHours: line.doubleTimeHours,
        totalHours: line.totalHours,
        dailyBreakdown: JSON.stringify(line.days),
        lateWithinCutoff: line.lateWithinCutoff,
        partialPeriodReason: line.partialPeriodReason ?? null,
        manuallyOverridden: line.manuallyOverridden ?? false,
        overrideOriginalHours: line.overrideOriginalHours ?? null,
        overrideHours: line.overrideHours ?? null,
        overrideReason: line.overrideReason ?? null,
        overriddenAt: line.manuallyOverridden ? new Date() : null,
        importedAt: new Date(),
        updatedAt: new Date(),
      };

      if (existing) {
        await db
          .update(payrollTimeImports)
          .set(values)
          .where(eq(payrollTimeImports.id, existing.id));
      } else {
        await db.insert(payrollTimeImports).values(values);
      }

      upserted++;
    }

    console.log(`[Time Import POST] Persisted ${upserted} import rows for payroll run ${payrollId}`);
    return NextResponse.json({ success: true, upserted });
  } catch (error: any) {
    console.error("[Payroll Time Import POST Error]", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
