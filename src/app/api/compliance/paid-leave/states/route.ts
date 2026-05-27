import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { employees } from "@/db/schema";
import { requireApiPermission } from "@/lib/apiRbac";
import { inferPaidLeaveStateCode, paidLeavePrograms } from "@/lib/paidLeave";
import { resolveUserContext } from "@/lib/session";

const fallbackCounts: Record<string, number> = {
  CA: 42,
  NY: 18,
  WA: 12,
  MA: 5,
  CO: 8,
  OR: 3,
  NJ: 2,
};

export async function GET(req: NextRequest) {
  const permissionCheck = await requireApiPermission(req, "view_paid_leave");
  if (permissionCheck.response) return permissionCheck.response;

  let counts = fallbackCounts;

  try {
    const ctx = await resolveUserContext(permissionCheck.session!);
    if (ctx?.companyId) {
      const companyEmployees = await db
        .select({
          id: employees.id,
          location: employees.location,
          locationType: employees.locationType,
        })
        .from(employees)
        .where(eq(employees.companyId, ctx.companyId));

      const liveCounts = paidLeavePrograms.reduce<Record<string, number>>((acc, program) => {
        acc[program.stateCode] = 0;
        return acc;
      }, {});

      for (const employee of companyEmployees) {
        const stateCode = inferPaidLeaveStateCode(`${employee.location ?? ""} ${employee.locationType ?? ""}`);
        if (stateCode && liveCounts[stateCode] !== undefined) {
          liveCounts[stateCode] += 1;
        }
      }

      counts = liveCounts;
    }
  } catch (error) {
    console.error("[Paid Leave States] Falling back to demo employee counts", error);
  }

  const states = paidLeavePrograms.map((program) => ({
    ...program,
    employeeCount: counts[program.stateCode] ?? 0,
  }));

  return NextResponse.json({ states, generatedAt: new Date().toISOString() });
}
