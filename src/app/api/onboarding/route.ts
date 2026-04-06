import { NextResponse } from "next/server";
import { db } from "@/db";
import { onboardingCases, employees } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  try {
    const cases = await db.query.onboardingCases.findMany({
      with: {
        employee: true,
      },
      orderBy: [desc(onboardingCases.createdAt)],
    });

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
