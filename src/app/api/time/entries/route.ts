import { db } from "@/db";
import { timeEntries, employees, users } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq, and, isNull, desc } from "drizzle-orm";

// Guest Mode: hardcoded Clerk user ID
const GUEST_CLERK_USER_ID = "user_2lI7hKq2Xy4Z6mN8sO1A3ZDRQRD";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let employeeId = searchParams.get('employeeId');

    // If no employeeId provided, try to resolve from guest user
    if (!employeeId) {
      const [userEmployee] = await db
        .select({ employeeId: employees.id })
        .from(users)
        .innerJoin(employees, eq(users.id, employees.userId))
        .where(eq(users.clerkUserId, GUEST_CLERK_USER_ID));
      
      employeeId = userEmployee?.employeeId?.toString() ?? '1';
    }

    const entries = await db.query.timeEntries.findMany({
      where: (te, { eq }) => eq(te.employeeId, parseInt(employeeId!)),
      orderBy: (te, { desc }) => [desc(te.clockIn)],
      limit: 50, // Limit to recent 50 entries for performance
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
