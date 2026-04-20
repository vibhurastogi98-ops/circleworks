import { NextResponse } from "next/server";
import { db } from "@/db";
import { employees, payrolls, ptoRequests, timesheets, users, companies } from "@/db/schema";
import { desc, count, sum, sql, and, gte, or, eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    // Get current authenticated user
    const { userId } = await auth();
    
    // IF NOT LOGGED IN, RETURN MOCK STATS (Remove Login Dependency)
    if (!userId) {
      return NextResponse.json({
        totalEmployees: 42,
        monthlyPayroll: 125000,
        pendingApprovals: 5,
        recentHires: [
          { id: "1", name: "Alex Rivera", title: "Senior Designer", startDate: "Apr 12", onboardingPercent: 85, avatarSeed: "Alex" },
          { id: "2", name: "Jordan Smith", title: "DevOps Engineer", startDate: "Apr 15", onboardingPercent: 40, avatarSeed: "Jordan" },
          { id: "3", name: "Sam Wilson", title: "Success Manager", startDate: "Apr 18", onboardingPercent: 10, avatarSeed: "Sam" }
        ]
      });
    }

    // Find the user's employee record to get their company
    const [userEmployee] = await db
      .select({ 
        companyId: employees.companyId,
        role: users.role 
      })
      .from(employees)
      .leftJoin(users, eq(employees.userId, users.id))
      .where(eq(users.clerkUserId, userId));

    if (!userEmployee || !userEmployee.companyId) {
      return NextResponse.json({ 
        totalEmployees: 0,
        monthlyPayroll: 0,
        pendingApprovals: 0,
        recentHires: []
      });
    }

    // 1. Total Employee Count (filtered by company)
    const [employeeStats] = await db
      .select({ value: count() })
      .from(employees)
      .where(eq(employees.companyId, userEmployee.companyId));
    const totalEmployees = employeeStats?.value || 0;

    // 2. Recent Hires (Top 4, filtered by company)
    const recentHires = await db.query.employees.findMany({
      where: eq(employees.companyId, userEmployee.companyId),
      orderBy: [desc(employees.createdAt)],
      limit: 4,
    });

    // 3. Monthly Payroll Aggregation (Last 30 days, filtered by company)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

    const [payrollStats] = await db
      .select({ total: sum(payrolls.totalNet) })
      .from(payrolls)
      .where(and(
        eq(payrolls.companyId, userEmployee.companyId),
        gte(payrolls.checkDate, thirtyDaysAgoStr),
        sql`${payrolls.status} = 'paid' OR ${payrolls.status} = 'processed'`
      ));
    
    const monthlyPayroll = Number(payrollStats?.total || 0);

    // 4. Pending Approvals (PTO + Timesheets, filtered by company)
    const [ptoPending] = await db
      .select({ value: count() })
      .from(ptoRequests)
      .where(and(
        eq(ptoRequests.companyId, userEmployee.companyId),
        sql`${ptoRequests.status} = 'Pending'`
      ));

    const [timesheetPending] = await db
      .select({ value: count() })
      .from(timesheets)
      .where(and(
        eq(timesheets.companyId, userEmployee.companyId),
        or(
          sql`${timesheets.status} = 'Pending'`,
          sql`${timesheets.status} = 'Draft'`
        )
      ));

    const pendingApprovals = (ptoPending?.value || 0) + (timesheetPending?.value || 0);

    // 5. Construct Live Data
    return NextResponse.json({
      totalEmployees,
      monthlyPayroll,
      pendingApprovals,
      recentHires: recentHires.map((emp: typeof employees.$inferSelect) => ({
        id: emp.id.toString(),
        name: `${emp.firstName} ${emp.lastName || ""}`.trim(),
        title: emp.jobTitle || "Team Member",
        startDate: emp.startDate ? new Date(emp.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "Recently",
        onboardingPercent: emp.status === 'active' ? 100 : 25, // Default for new hires
        avatarSeed: emp.firstName,
      })),
    });
  } catch (error: any) {
    console.error("[Dashboard Stats GET Error]", error);
    return NextResponse.json({ error: "Failed to fetch dashboard statistics" }, { status: 500 });
  }
}
