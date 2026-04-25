import { db } from "@/db";
import { timeEntries, timeBreaks, employees, users } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";

// Guest Mode: hardcoded Clerk user ID
const GUEST_CLERK_USER_ID = "user_2lI7hKq2Xy4Z6mN8sO1A3ZDRQRD";

export async function POST() {
  try {
    // Resolve employee from guest user
    const [userEmployee] = await db
      .select({ employeeId: employees.id })
      .from(users)
      .innerJoin(employees, eq(users.id, employees.userId))
      .where(eq(users.clerkUserId, GUEST_CLERK_USER_ID));

    const employeeId = userEmployee?.employeeId ?? 1;

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
