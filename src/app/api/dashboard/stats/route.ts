import { NextResponse } from "next/server";
import { db } from "@/db";
import { employees, payrolls, ptoRequests, timesheets, users, companies } from "@/db/schema";
import { desc, count, sum, sql, and, gte, or, eq } from "drizzle-orm";

export async function GET() {
  try {
    // Guest Mode: Allow unrestricted access to dashboard stats
    const userId = "user_2lI7hKq2Xy4Z6mN8sO1A3ZDRQRD";

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

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

    // Run independent stats queries in parallel
    const [
      [employeeStats],
      recentHires,
      [payrollStats],
      [ptoPending],
      [timesheetPending]
    ] = await Promise.all([
      // 1. Total Employee Count
      db
        .select({ value: count() })
        .from(employees)
        .where(eq(employees.companyId, userEmployee.companyId)),

      // 2. Recent Hires
      db.query.employees.findMany({
        where: eq(employees.companyId, userEmployee.companyId),
        orderBy: [desc(employees.createdAt)],
        limit: 4,
      }),

      // 3. Monthly Payroll Aggregation
      db
        .select({ total: sum(payrolls.totalNet) })
        .from(payrolls)
        .where(and(
          eq(payrolls.companyId, userEmployee.companyId),
          gte(payrolls.checkDate, thirtyDaysAgoStr),
          sql`${payrolls.status} = 'paid' OR ${payrolls.status} = 'processed'`
        )),

      // 4. Pending PTO
      db
        .select({ value: count() })
        .from(ptoRequests)
        .where(and(
          eq(ptoRequests.companyId, userEmployee.companyId),
          sql`${ptoRequests.status} = 'Pending'`
        )),

      // 5. Pending Timesheets
      db
        .select({ value: count() })
        .from(timesheets)
        .where(and(
          eq(timesheets.companyId, userEmployee.companyId),
          or(
            sql`${timesheets.status} = 'Pending'`,
            sql`${timesheets.status} = 'Draft'`
          )
        ))
    ]);

    const totalEmployees = employeeStats?.value || 0;
    const monthlyPayroll = Number(payrollStats?.total || 0);
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
