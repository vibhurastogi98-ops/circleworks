import { db } from "@/db";
import { timeEntries, timeBreaks, employees, users } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";

// Guest Mode: hardcoded Clerk user ID
const GUEST_CLERK_USER_ID = "user_2lI7hKq2Xy4Z6mN8sO1A3ZDRQRD";

export async function POST() {
  try {
    const [userEmployee] = await db
      .select({ employeeId: employees.id })
      .from(users)
      .innerJoin(employees, eq(users.id, employees.userId))
      .where(eq(users.clerkUserId, GUEST_CLERK_USER_ID));

    const employeeId = userEmployee?.employeeId ?? 1;

    // Find active entry
    const openEntry = await db.query.timeEntries.findFirst({
      where: and(
        eq(timeEntries.employeeId, employeeId),
        isNull(timeEntries.clockOut)
      ),
    });

    if (!openEntry) {
      return NextResponse.json(
        { success: false, error: "Not currently clocked in" },
        { status: 409 }
      );
    }

    // Find active break
    const openBreak = await db.query.timeBreaks.findFirst({
      where: and(
        eq(timeBreaks.timeEntryId, openEntry.id),
        isNull(timeBreaks.breakEnd)
      ),
    });

    if (!openBreak) {
      return NextResponse.json(
        { success: false, error: "No active break found" },
        { status: 404 }
      );
    }

    const [updatedBreak] = await db.update(timeBreaks).set({
      breakEnd: new Date(),
      updatedAt: new Date(),
    }).where(eq(timeBreaks.id, openBreak.id)).returning();

    return NextResponse.json({
      success: true,
      action: "break-end",
      entryId: openEntry.id,
      break: updatedBreak,
    });
  } catch (error: any) {
    console.error("[Time Break-End Error]", error);
    return NextResponse.json(
      { success: false, error: "Failed to end break" },
      { status: 500 }
    );
  }
}
