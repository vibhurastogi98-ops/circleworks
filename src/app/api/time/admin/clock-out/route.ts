import { db } from "@/db";
import { timeEntries, timeBreaks } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { employeeId } = await req.json();

    if (!employeeId) {
      return NextResponse.json({ error: "employeeId is required" }, { status: 400 });
    }

    const now = new Date();

    const result = await db.update(timeEntries)
      .set({ clockOut: now })
      .where(
        and(
          eq(timeEntries.employeeId, employeeId),
          isNull(timeEntries.clockOut)
        )
      )
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: "No active clock-in found for this employee" }, { status: 400 });
    }

    // Also close any open breaks for these entries
    for (const entry of result) {
      await db
        .update(timeBreaks)
        .set({ breakEnd: now })
        .where(
          and(
            eq(timeBreaks.timeEntryId, entry.id),
            isNull(timeBreaks.breakEnd)
          )
        );
    }

    return NextResponse.json({ success: true, entry: result[0] });
  } catch (error: any) {
    console.error("[Admin Clock Out Error]:", error);
    return NextResponse.json({ error: "Failed to clock out" }, { status: 500 });
  }
}
