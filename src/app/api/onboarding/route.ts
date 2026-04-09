import { NextResponse } from "next/server";
import { db } from "@/db";
import { onboardingCases, employees, users } from "@/db/schema";
import { desc, eq, and } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the user's company
    const [userEmployee] = await db
      .select({ companyId: employees.companyId })
      .from(employees)
      .leftJoin(users, eq(employees.userId, users.id))
      .where(eq(users.clerkUserId, userId));

    if (!userEmployee || !userEmployee.companyId) {
      return NextResponse.json([]);
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
    return NextResponse.json({ error: "Failed to fetch onboarding cases" }, { status: 500 });
  }
}
