import { db } from "@/db";
import { timeEntries, employees, users } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { getSession } from "@/lib/session";

export async function POST() {
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

    console.log("[Clock-In API] Resolved UserEmployee:", userEmployee);
    const employeeId = userEmployee?.employeeId ?? 1;
    const companyId = userEmployee?.companyId ?? 1;
    console.log("[Clock-In API] Using EmployeeId:", employeeId);

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
