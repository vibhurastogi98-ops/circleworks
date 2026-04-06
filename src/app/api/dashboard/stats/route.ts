import { NextResponse } from "next/server";
import { db } from "@/db";
import { employees } from "@/db/schema";
import { desc, count } from "drizzle-orm";

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

    // 3. Construct Live Data
    return NextResponse.json({
      totalEmployees,
      recentHires: recentHires.map((emp: typeof employees.$inferSelect) => ({
        id: emp.id.toString(),
        name: `${emp.firstName} ${emp.lastName || ""}`.trim(),
        title: emp.jobTitle || "Team Member",
        startDate: emp.startDate ? new Date(emp.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "Recently",
        onboardingPercent: emp.status === 'active' ? 100 : 25, // Default for new hires
        avatarSeed: emp.firstName,
      })),
      // Placeholder for financial stats (could be extended later)
      monthlyPayroll: 0,
      pendingApprovals: 0,
    });
  } catch (error: any) {
    console.error("[Dashboard Stats GET Error]", error);
    return NextResponse.json({ error: "Failed to fetch dashboard statistics" }, { status: 500 });
  }
}
