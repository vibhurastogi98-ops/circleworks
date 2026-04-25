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

    // Find the active time entry for this employee
    const activeEntry = await db.query.timeEntries.findFirst({
      where: (te, { and, eq, isNull }) => and(
        eq(te.employeeId, employeeId),
        isNull(te.clockOut)
      ),
      with: {
        breaks: true,
      }
    });

    if (!activeEntry) {
      return NextResponse.json({ error: "No active clock-in found for this employee" }, { status: 400 });
    }

    // Find the active break for this entry
    const activeBreak = activeEntry.breaks.find((b: any) => b.breakEnd === null);

    if (!activeBreak) {
      return NextResponse.json({ error: "No active break found for this employee" }, { status: 400 });
    }

    const result = await db.update(timeBreaks)
      .set({ breakEnd: now })
      .where(eq(timeBreaks.id, activeBreak.id))
      .returning();

    return NextResponse.json({ success: true, entry: result[0] });
  } catch (error: any) {
    console.error("[Admin End Break Error]:", error);
    return NextResponse.json({ error: "Failed to end break" }, { status: 500 });
  }
}
