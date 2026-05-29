import { NextResponse } from "next/server";
import { db } from "@/db";
import { onboardingCases, employees, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { mockOnboardingCases } from "@/data/mockOnboarding";

function mockOnboardingResponse() {
  return NextResponse.json(mockOnboardingCases.map((onboardingCase) => {
    const total = onboardingCase.tasks.length || 1;
    const completed = onboardingCase.tasks.filter((task) => task.status === "Complete").length;

    return {
      ...onboardingCase,
      onboardingPercent: Math.round((completed / total) * 100),
    };
  }));
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return mockOnboardingResponse();
    }

    const [userEmployee] = await db
      .select({ companyId: employees.companyId })
      .from(employees)
      .leftJoin(users, eq(employees.userId, users.id))
      .where(eq(users.id, session.userId));

    if (!userEmployee?.companyId) {
      return mockOnboardingResponse();
    }

    const cases = await db
      .select({
        id: onboardingCases.id,
        employeeId: onboardingCases.employeeId,
        startDate: onboardingCases.startDate,
        createdAt: onboardingCases.createdAt,
        employee: employees
      })
      .from(onboardingCases)
      .innerJoin(employees, eq(onboardingCases.employeeId, employees.id))
      .where(eq(employees.companyId, userEmployee.companyId))
      .orderBy(desc(onboardingCases.createdAt));

    if (cases.length === 0) {
      return mockOnboardingResponse();
    }

    // Format for the dashboard UI
    return NextResponse.json(cases.map((c: any) => ({
      id: c.id.toString(),
      employeeId: c.employeeId,
      employeeName: `${c.employee?.firstName} ${c.employee?.lastName || ""}`.trim(),
      avatar: c.employee?.avatar,
      department: c.employee?.department || "General",
      startDate: c.startDate || c.employee?.startDate || "TBD",
      phase: "Pre-Hire", // Default for now
      tasks: [], // We haven't implemented task persistence yet
      onboardingPercent: 0,
    })));
  } catch (error: any) {
    console.error("[Onboarding API Error]", error);
    return mockOnboardingResponse();
  }
}
