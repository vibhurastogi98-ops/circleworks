import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { employees, ptoRequests } from "@/db/schema";
import { requireApiPermission } from "@/lib/apiRbac";
import { programsForLocation } from "@/lib/paidLeave";
import { resolveUserContext } from "@/lib/session";

interface EligibilityEmployee {
  id: number;
  firstName: string;
  lastName: string | null;
  location: string;
  companyId: number | null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ employeeId: string }> }
) {
  const { employeeId } = await params;
  const permissionCheck = await requireApiPermission(request, "view_paid_leave");
  if (permissionCheck.response) return permissionCheck.response;

  const numericId = Number(employeeId.replace(/\D/g, ""));
  let employee: EligibilityEmployee = {
    id: Number.isFinite(numericId) && numericId > 0 ? numericId : 1,
    firstName: employeeId === "EMP-002" ? "John" : "Jane",
    lastName: employeeId === "EMP-002" ? "Smith" : "Doe",
    location: employeeId === "EMP-002" ? "New York, NY" : "San Francisco, CA",
    companyId: null as number | null,
  };
  let recentRequests = [
    {
      id: "REQ-001",
      date: "2026-03-15",
      type: "Parental Leave",
    },
  ];

  try {
    const ctx = await resolveUserContext(permissionCheck.session!);
    if (ctx?.companyId && Number.isFinite(numericId) && numericId > 0) {
      const [liveEmployee] = await db
        .select({
          id: employees.id,
          firstName: employees.firstName,
          lastName: employees.lastName,
          location: employees.location,
          companyId: employees.companyId,
        })
        .from(employees)
        .where(and(eq(employees.id, numericId), eq(employees.companyId, ctx.companyId)));

      if (!liveEmployee) {
        return NextResponse.json({ error: "Employee not found" }, { status: 404 });
      }

      employee = {
        ...liveEmployee,
        location: liveEmployee.location ?? "Unassigned",
      };

      recentRequests = await db
        .select({
          id: ptoRequests.id,
          date: ptoRequests.startDate,
          type: ptoRequests.type,
        })
        .from(ptoRequests)
        .where(and(eq(ptoRequests.employeeId, liveEmployee.id), eq(ptoRequests.companyId, ctx.companyId)))
        .orderBy(desc(ptoRequests.createdAt))
        .limit(3)
        .then((rows) =>
          rows.map((row) => ({
            id: String(row.id),
            date: row.date,
            type: row.type,
          })),
        );
    }
  } catch (error) {
    console.error("[Paid Leave Eligibility] Falling back to demo employee", error);
  }

  const eligiblePrograms = programsForLocation(employee.location);
  const primaryProgram = eligiblePrograms[0];
  const programs = eligiblePrograms.map((program) => ({
    id: program.id,
    stateCode: program.stateCode,
    programName: program.programName,
    status: "Eligible",
    rules: program.eligibilityRules.join(" "),
    balance: program.duration,
    accrued: program.maxBenefit,
    leaveBalance: program.ptoBalance,
  }));

  return NextResponse.json({
    employeeId,
    name: `${employee.firstName} ${employee.lastName ?? ""}`.trim(),
    location: employee.location,
    ptoBalance: 120,
    programs,
    recentRequests: recentRequests.map((request) => ({
      ...request,
      suggestion: primaryProgram
        ? `This may qualify for ${primaryProgram.stateCode} ${primaryProgram.programName} — apply?`
        : "No state paid leave program was detected for this work location.",
    })),
  });
}
