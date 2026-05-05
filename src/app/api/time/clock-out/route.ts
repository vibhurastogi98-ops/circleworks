import { db } from "@/db";
import { timeEntries, timeBreaks, employees, users } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { getSession } from "@/lib/session";

export async function POST() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const [userEmployee] = await db
      .select({ employeeId: employees.id })
      .from(users)
      .innerJoin(employees, eq(users.id, employees.userId))
      .where(eq(users.id, session.userId));

    if (!userEmployee) {
      return NextResponse.json({ success: false, error: "Employee record not found" }, { status: 404 });
    }

    const employeeId = userEmployee.employeeId;

    // Close ALL currently open entries for this employee
    const now = new Date();
    const updated = await db
      .update(timeEntries)
      .set({ clockOut: now, updatedAt: now })
      .where(
        and(
          eq(timeEntries.employeeId, employeeId),
          isNull(timeEntries.clockOut)
        )
      )
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { success: false, error: "No active clock-in found" },
        { status: 404 }
      );
    }

    // Also close any open breaks for these entries
    for (const entry of updated) {
      await db
        .update(timeBreaks)
        .set({ breakEnd: now, updatedAt: now })
        .where(
          and(
            eq(timeBreaks.timeEntryId, entry.id),
            isNull(timeBreaks.breakEnd)
          )
        );
    }

    return NextResponse.json({ 
      success: true, 
      action: "clock-out", 
      count: updated.length,
      entry: updated[0] 
    });
  } catch (error: any) {
    console.error("[Time Clock-Out Error]", error);
    return NextResponse.json(
      { success: false, error: "Failed to clock out" },
      { status: 500 }
    );
  }
}
