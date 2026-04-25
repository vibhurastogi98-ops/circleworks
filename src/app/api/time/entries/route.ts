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
        orderBy: (te, { desc }) => [desc(te.clockIn)],
        with: {
          breaks: true,
        },
      });
      return NextResponse.json({ success: true, entries });
    }

    const entries = await db.query.timeEntries.findMany({
      where: (te, { eq }) => eq(te.employeeId, parseInt(employeeId)),
      orderBy: (te, { desc }) => [desc(te.clockIn)],
      with: {
        breaks: true,
      },
    });

    return NextResponse.json({ success: true, entries });
  } catch (error: any) {
    console.error("Error fetching time entries:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch time entries", details: error.message }, { status: 500 });
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
      where: (te, { eq, and, isNull }) => and(
        eq(te.employeeId, parseInt(employeeId)),
        isNull(te.clockOut)
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
  } catch (error: any) {
    console.error("Error processing kiosk entry:", error);
    return NextResponse.json({ success: false, error: "Failed to process clock-in/out", details: error.message }, { status: 500 });
  }
}
