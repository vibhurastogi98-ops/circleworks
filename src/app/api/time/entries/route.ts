import { db } from "@/db";
import { timeEntries } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq, and, isNull, desc } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');

    if (!employeeId) {
      const entries = await db.query.timeEntries.findMany({
        orderBy: [desc(timeEntries.clockIn)],
      });
      return NextResponse.json({ success: true, entries });
    }

    const entries = await db.query.timeEntries.findMany({
      where: eq(timeEntries.employeeId, parseInt(employeeId)),
      orderBy: [desc(timeEntries.clockIn)],
    });

    return NextResponse.json({ success: true, entries });
  } catch (error) {
    console.error("Error fetching time entries:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch time entries" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { employeeId, pin, projectId, companyId } = body;

    if (!employeeId || !companyId || !pin) {
      return NextResponse.json({ success: false, error: "Employee ID, Company ID, and PIN are required" }, { status: 400 });
    }

    // Identify if there is an active (un-clocked-out) entry for this employee
    const activeEntry = await db.query.timeEntries.findFirst({
      where: and(
        eq(timeEntries.employeeId, parseInt(employeeId)),
        isNull(timeEntries.clockOut)
      ),
    });

    if (activeEntry) {
      // Clock Out
      const [updatedEntry] = await db
        .update(timeEntries)
        .set({ clockOut: new Date() })
        .where(eq(timeEntries.id, activeEntry.id))
        .returning();

      return NextResponse.json({ 
        success: true, 
        action: 'clock-out', 
        entry: updatedEntry 
      });
    } else {
      // Clock In
      const [newEntry] = await db
        .insert(timeEntries)
        .values({
          employeeId: parseInt(employeeId),
          companyId: parseInt(companyId),
          projectId: projectId ? parseInt(projectId) : null,
          clockIn: new Date(),
          status: 'Approved',
        })
        .returning();

      return NextResponse.json({ 
        success: true, 
        action: 'clock-in', 
        entry: newEntry 
      });
    }
  } catch (error) {
    console.error("Error processing kiosk entry:", error);
    return NextResponse.json({ success: false, error: "Failed to process clock-in/out" }, { status: 500 });
  }
}
