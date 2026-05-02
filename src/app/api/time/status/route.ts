import { db } from "@/db";
import { timeEntries, employees, users, timeBreaks } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq, and, isNull, gte } from "drizzle-orm";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getSession();
    const userId = session?.userId ?? null;

    const [userEmployee] = userId
      ? await db
          .select({ employeeId: employees.id, companyId: employees.companyId })
          .from(users)
          .innerJoin(employees, eq(users.id, employees.userId))
          .where(eq(users.id, userId))
      : [];

    const employeeId = userEmployee?.employeeId ?? 1;
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    // 1. Fetch data in parallel
    const [openEntry, todayEntries] = await Promise.all([
      db.query.timeEntries.findFirst({
        where: (te, { eq, and, isNull }) => and(
          eq(te.employeeId, employeeId),
          isNull(te.clockOut)
        ),
        with: { breaks: true }
      }),
      db.query.timeEntries.findMany({
        where: (te, { eq, and, gte }) => and(
          eq(te.employeeId, employeeId),
          gte(te.clockIn, todayStart)
        ),
        with: { breaks: true }
      })
    ]);

    // 2. Check for open break in the open entry
    const openBreak = openEntry?.breaks?.find((b: any) => b.breakEnd === null) || null;

    // 3. Sum hours from completed entries + active entry (up to now)
    const todayTotalSeconds = todayEntries.reduce((acc: number, e: any) => {
      const end = e.clockOut ? new Date(e.clockOut) : now;
      const entryMs = end.getTime() - new Date(e.clockIn).getTime();
      const breakMs = e.breaks.reduce((bAcc: number, b: any) => {
        const bEnd = b.breakEnd ? new Date(b.breakEnd) : (e.clockOut ? null : now);
        return bEnd ? bAcc + (bEnd.getTime() - new Date(b.breakStart).getTime()) : bAcc;
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
