import { db } from "@/db";
import { timeEntries, employees, users, timeBreaks } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq, and, isNull, gte } from "drizzle-orm";

// Guest Mode: hardcoded Clerk user ID
const GUEST_CLERK_USER_ID = "user_2lI7hKq2Xy4Z6mN8sO1A3ZDRQRD";

export async function GET() {
  try {
    // Resolve employee from guest user
    const [userEmployee] = await db
      .select({ employeeId: employees.id, companyId: employees.companyId })
      .from(users)
      .innerJoin(employees, eq(users.id, employees.userId))
      .where(eq(users.clerkUserId, GUEST_CLERK_USER_ID));

    const employeeId = userEmployee?.employeeId ?? 1;

    // 1. Check for currently open entry (clocked in, not yet clocked out)
    const openEntry = await db.query.timeEntries.findFirst({
      where: (te, { eq, and, isNull }) => and(
        eq(te.employeeId, employeeId),
        isNull(te.clockOut)
      ),
      with: {
        breaks: true,
      }
    });

    // 2. Check for open break
    const openBreak = openEntry?.breaks?.find((b: any) => b.breakEnd === null) || null;

    // 3. Get all of today's entries to compute total hours worked
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEntries = await db.query.timeEntries.findMany({
      where: (te, { eq, and, gte }) => and(
        eq(te.employeeId, employeeId),
        gte(te.clockIn, todayStart)
      ),
      with: {
        breaks: true,
      }
    });

    // Sum hours from completed (clocked-out) entries only, subtracting breaks
    const todayTotalSeconds = todayEntries
      .filter((e) => e.clockOut !== null)
      .reduce((acc: number, e: any) => {
        const entryMs = new Date(e.clockOut!).getTime() - new Date(e.clockIn).getTime();
        const breakMs = e.breaks.reduce((bAcc: number, b: any) => {
          if (b.breakEnd) {
            return bAcc + (new Date(b.breakEnd).getTime() - new Date(b.breakStart).getTime());
          }
          return bAcc;
        }, 0);
        return acc + (entryMs - breakMs) / 1000;
      }, 0);

    const todayTotalHours = parseFloat((todayTotalSeconds / 3600).toFixed(2));

    return NextResponse.json({
      success: true,
      isClocked: !!openEntry,
      openEntry: openEntry ?? null,
      openBreak: openBreak,
      todayTotalHours,
      todayEntryCount: todayEntries.length,
    });
  } catch (error: any) {
    console.error("[Time Status API Exception]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch time status", details: error.message },
      { status: 500 }
    );
  }
}
