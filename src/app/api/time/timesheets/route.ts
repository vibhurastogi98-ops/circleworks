import { db } from "@/db";
import { timesheets, employees } from "@/db/schema";
import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const data = await db.query.timesheets.findMany({
      with: {
        employee: true,
      },
      orderBy: [desc(timesheets.periodStart)],
    });

    return NextResponse.json({
      success: true,
      timesheets: data,
    });
  } catch (error) {
    console.error("Error fetching timesheets:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch timesheets from database" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      employeeId, 
      companyId, 
      periodStart, 
      periodEnd, 
      status 
    } = body;

    if (!employeeId || !companyId || !periodStart || !periodEnd) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const [newTimesheet] = await db
      .insert(timesheets)
      .values({
        employeeId: Number(employeeId),
        companyId: Number(companyId),
        periodStart: periodStart,
        periodEnd: periodEnd,
        status: status || 'Draft',
      })
      .returning();

    return NextResponse.json({
      success: true,
      timesheet: newTimesheet,
    });
  } catch (error) {
    console.error("Error creating timesheet:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create timesheet" },
      { status: 500 }
    );
  }
}
