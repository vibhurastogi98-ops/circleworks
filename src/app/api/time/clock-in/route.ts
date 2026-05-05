import { db } from "@/db";
import { timeEntries } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { getSession, resolveUserContext } from "@/lib/session";

export async function POST() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const ctx = await resolveUserContext(session);
    if (!ctx) {
      return NextResponse.json({ success: false, error: "Employee record not found" }, { status: 404 });
    }

    const { employeeId, companyId } = ctx;

    // Prevent double clock-in
    const existingOpen = await db.query.timeEntries.findFirst({
      where: and(
        eq(timeEntries.employeeId, employeeId),
        isNull(timeEntries.clockOut)
      ),
    });

    if (existingOpen) {
      return NextResponse.json(
        { success: false, error: "Already clocked in", entry: existingOpen },
        { status: 409 }
      );
    }

    const [newEntry] = await db
      .insert(timeEntries)
      .values({
        employeeId,
        companyId,
        clockIn: new Date(),
        entryType: "Regular",
        status: "Approved",
      })
      .returning();

    return NextResponse.json({ success: true, action: "clock-in", entry: newEntry });
  } catch (error: any) {
    console.error("[Time Clock-In Error]", error);
    return NextResponse.json(
      { success: false, error: "Failed to clock in" },
      { status: 500 }
    );
  }
}
