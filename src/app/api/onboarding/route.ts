import { NextResponse } from "next/server";
import { db } from "@/db";
import { onboardingCases, employees, users } from "@/db/schema";
import { desc, eq, and } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId } = await auth();
    
    // IF NOT LOGGED IN, RETURN MOCK ONBOARDING CASES (Remove Login Dependency)
    if (!userId) {
      return NextResponse.json([
        { id: "101", employeeId: 1, employeeName: "Sarah Smith", avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Sarah&backgroundColor=transparent", department: "Engineering", startDate: "2024-05-01", phase: "Pre-Hire", tasks: [ { status: "Complete" }, { status: "Pending" } ], onboardingPercent: 50 },
        { id: "102", employeeId: 2, employeeName: "Michael Chen", avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Michael&backgroundColor=transparent", department: "Design", startDate: "2024-05-15", phase: "Week 1", tasks: [ { status: "Complete" }, { status: "Complete" } ], onboardingPercent: 100 },
        { id: "103", employeeId: 3, employeeName: "Emma Watson", avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Emma&backgroundColor=transparent", department: "Marketing", startDate: "2024-06-01", phase: "Week 2", tasks: [ { status: "Pending" } ], onboardingPercent: 10 },
      ]);
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
