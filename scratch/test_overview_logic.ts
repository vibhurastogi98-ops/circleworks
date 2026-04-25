import { db } from "../src/db";
import { timeEntries, timeBreaks, employees, users, timesheets, shifts } from "../src/db/schema";
import { eq, and, isNull, gte, lt, desc, sql, or } from "drizzle-orm";
import dotenv from "dotenv";
dotenv.config();

const GUEST_CLERK_USER_ID = "user_2lI7hKq2Xy4Z6mN8sO1A3ZDRQRD";

async function test() {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const weekStart = new Date(now);
    const day = weekStart.getDay();
    const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1); // Monday
    weekStart.setDate(diff);
    weekStart.setHours(0, 0, 0, 0);

    console.log("Week Start:", weekStart.toISOString());

    const [userEmployee] = await db
      .select({ companyId: employees.companyId })
      .from(users)
      .innerJoin(employees, eq(users.id, employees.userId))
      .where(eq(users.clerkUserId, GUEST_CLERK_USER_ID));

    const companyId = userEmployee?.companyId ?? 1;
    console.log("Resolved Company ID:", companyId);

    const [allEmployees, weekEntries, pendingTimesheets, todayShifts, activeBreaks] = await Promise.all([
      db.select({
        id: employees.id,
        firstName: employees.firstName,
        lastName: employees.lastName,
        companyId: employees.companyId,
      })
      .from(employees)
      .where(eq(employees.companyId, companyId)),

      db.query.timeEntries.findMany({
        where: (te, { gte, isNull, and, or, eq }) => and(
          eq(te.companyId, companyId),
          or(
            gte(te.clockIn, weekStart),
            isNull(te.clockOut)
          )
        ),
        with: { breaks: true }
      }),

      db.query.timesheets.findMany({
        where: (ts, { eq, and }) => and(
          eq(ts.status, 'Submitted'),
          eq(ts.companyId, companyId)
        ),
      }),

      db.query.shifts.findMany({
        where: (s, { gte, eq, and }) => and(
          gte(s.startTime, todayStart),
          eq(s.companyId, companyId)
        ),
      }),

      db.query.timeBreaks.findMany({
        where: (tb, { isNull, gte, and }) => and(
          isNull(tb.breakEnd),
          gte(tb.breakStart, weekStart)
        ),
      })
    ]);

    console.log("All Employees Count:", allEmployees.length);
    console.log("Week Entries Count:", weekEntries.length);
    console.log("Pending Timesheets Count:", pendingTimesheets.length);
    console.log("Today Shifts Count:", todayShifts.length);
    console.log("Active Breaks Count:", activeBreaks.length);

    process.exit(0);
}

test();
