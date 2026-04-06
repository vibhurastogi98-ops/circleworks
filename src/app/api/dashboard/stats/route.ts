import { NextResponse } from "next/server";
import { db } from "@/db";
import { employees, payrolls, ptoRequests, timesheets } from "@/db/schema";
import { desc, count, sum, sql, and, gte, or } from "drizzle-orm";

export async function GET() {
  try {
    // 1. Total Employee Count
    const [employeeStats] = await db.select({ value: count() }).from(employees);
    const totalEmployees = employeeStats?.value || 0;

    // 2. Recent Hires (Top 4)
    const recentHires = await db.query.employees.findMany({
      orderBy: [desc(employees.createdAt)],
      limit: 4,
    });

    // 3. Monthly Payroll Aggregation (Last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

    const [payrollStats] = await db
      .select({ total: sum(payrolls.totalNet) })
      .from(payrolls)
      .where(and(
        gte(payrolls.checkDate, thirtyDaysAgoStr),
        sql`${payrolls.status} = 'paid' OR ${payrolls.status} = 'processed'`
      ));
    
    const monthlyPayroll = Number(payrollStats?.total || 0);

    // 4. Pending Approvals (PTO + Timesheets)
    const [ptoPending] = await db
      .select({ value: count() })
      .from(ptoRequests)
      .where(sql`${ptoRequests.status} = 'Pending'`);

    const [timesheetPending] = await db
      .select({ value: count() })
      .from(timesheets)
      .where(or(
        sql`${timesheets.status} = 'Pending'`,
        sql`${timesheets.status} = 'Draft'`
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
