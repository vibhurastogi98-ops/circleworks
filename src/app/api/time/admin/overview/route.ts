import { db } from "@/db";
import { timeEntries, timeBreaks, employees, users, timesheets, shifts } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq, and, isNull, gte, lt, desc, sql, or } from "drizzle-orm";
import { getSession } from "@/lib/session";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const weekStart = new Date(now);
    const day = weekStart.getDay();
    const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1); // Monday
    weekStart.setDate(diff);
    weekStart.setHours(0, 0, 0, 0);

    const session = await getSession();
    const userId = session?.userId ?? null;

    const [userEmployee] = userId
      ? await db
          .select({ companyId: employees.companyId })
          .from(users)
          .innerJoin(employees, eq(users.id, employees.userId))
          .where(eq(users.id, userId))
      : [];

    const companyId = userEmployee?.companyId ?? 1;

    // 1. Parallelize data fetching to reduce total latency
    const [allEmployees, weekEntries, pendingTimesheets, todayShifts, activeBreaks] = await Promise.all([
      db.select({
        id: employees.id,
        firstName: employees.firstName,
        lastName: employees.lastName,
        department: employees.department,
        location: employees.location,
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
        where: (tb, { isNull, gte, and, exists }) => and(
          isNull(tb.breakEnd),
          gte(tb.breakStart, weekStart)
          // Note: Filtering by company for breaks usually goes through the time entry relation
        ),
      })
    ]);

    // 2. Pre-process and group data using Maps for O(1) lookup
    const totalEmployees = allEmployees.length;
    const weekEntriesByEmp = new Map<number, any[]>();
    const todayEntries: any[] = [];
    
    weekEntries.forEach(e => {
      const empId = e.employeeId!;
      if (!weekEntriesByEmp.has(empId)) weekEntriesByEmp.set(empId, []);
      weekEntriesByEmp.get(empId)!.push(e);
      
      const clockInDate = new Date(e.clockIn);
      const isToday = clockInDate >= todayStart;
      const isActive = e.clockOut === null;

      if (isToday || isActive) {
        todayEntries.push(e);
      }
    });

    const todayEntriesByEmp = new Map<number, any[]>();
    todayEntries.forEach(e => {
      const empId = e.employeeId!;
      if (!todayEntriesByEmp.has(empId)) todayEntriesByEmp.set(empId, []);
      todayEntriesByEmp.get(empId)!.push(e);
    });

    const activeEntries = todayEntries.filter(e => e.clockOut === null);
    console.log(`[Admin Overview] Found ${allEmployees.length} total employees, ${weekEntries.length} week entries, ${todayEntries.length} today entries, ${activeEntries.length} active entries`);
    
    const shiftByEmp = new Map<number, any>();
    todayShifts.forEach(s => shiftByEmp.set(s.employeeId!, s));

    // 3. Calculate stats efficiently
    const clockedInCount = activeEntries.length;
    const onBreakCount = activeBreaks.length;

    // Calculate Week Hours and Overtime Risks
    const empWeekHours: Record<number, number> = {};
    let totalWeekSeconds = 0;
    
    weekEntriesByEmp.forEach((entries, empId) => {
      let empTotalMs = 0;
      entries.forEach(e => {
        const end = e.clockOut ? new Date(e.clockOut) : now;
        const entryMs = end.getTime() - new Date(e.clockIn).getTime();
        const breakMs = e.breaks.reduce((bAcc: number, b: any) => {
          const bEnd = b.breakEnd ? new Date(b.breakEnd) : (e.clockOut ? null : now);
          return bEnd ? bAcc + (bEnd.getTime() - new Date(b.breakStart).getTime()) : bAcc;
        }, 0);
        empTotalMs += (entryMs - breakMs);
      });
      const hours = empTotalMs / 3600000;
      empWeekHours[empId] = hours;
      totalWeekSeconds += (empTotalMs / 1000);
    });

    const weekTotalHours = parseFloat((totalWeekSeconds / 3600).toFixed(1));
    const weekAvgHours = totalEmployees > 0 ? parseFloat((weekTotalHours / totalEmployees).toFixed(1)) : 0;
    const overtimeRisks = Object.values(empWeekHours).filter(h => h >= 38).length;

    // 4. Calculate Missed Punches
    let missedPunches = 0;
    activeEntries.forEach(entry => {
      const shift = shiftByEmp.get(entry.employeeId!);
      if ((shift?.endTime && new Date(shift.endTime) < now) || 
          (!shift && (now.getTime() - new Date(entry.clockIn).getTime()) > 12 * 3600000)) {
        missedPunches++;
      }
    });

    // 5. Build Employee List
    const todayEmpIds = new Set(todayEntries.map(e => e.employeeId));
    const employeeStatusList = allEmployees
      .map(emp => {
        const empTodayEntries = todayEntriesByEmp.get(emp.id) || [];
        const activeEntry = empTodayEntries.find(e => e.clockOut === null);
        
        const todayTotalMs = empTodayEntries.reduce((acc, e) => {
          const end = e.clockOut ? new Date(e.clockOut) : now;
          const entryMs = end.getTime() - new Date(e.clockIn).getTime();
          const breakMs = e.breaks.reduce((bAcc: number, b: any) => {
            const bEnd = b.breakEnd ? new Date(b.breakEnd) : (e.clockOut ? null : now);
            return bEnd ? bAcc + (bEnd.getTime() - new Date(b.breakStart).getTime()) : bAcc;
          }, 0);
          return acc + (entryMs - breakMs);
        }, 0);

        const todayBreakMs = empTodayEntries.reduce((acc, e) => {
          return acc + e.breaks.reduce((bAcc: number, b: any) => {
            const bEnd = b.breakEnd ? new Date(b.breakEnd) : now;
            return bAcc + (bEnd.getTime() - new Date(b.breakStart).getTime());
          }, 0);
        }, 0);

        const shift = shiftByEmp.get(emp.id);
        const isMissedPunch = activeEntry && (
          (shift?.endTime && new Date(shift.endTime) < now) || 
          (!shift && (now.getTime() - new Date(activeEntry.clockIn).getTime()) > 12 * 3600000)
        );

        let status = activeEntry 
          ? (activeEntry.breaks.some((b: any) => b.breakEnd === null) ? 'on-break' : 'clocked-in')
          : 'clocked-out';
        if (isMissedPunch) status = 'no-show';

        return {
          id: emp.id,
          name: `${emp.firstName} ${emp.lastName}`,
          department: emp.department,
          location: emp.location,
          status,
          clockIn: empTodayEntries[0] ? new Date(empTodayEntries[0].clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
          hoursToday: parseFloat((todayTotalMs / 3600000).toFixed(1)),
          hoursThisWeek: parseFloat((empWeekHours[emp.id] || 0).toFixed(1)),
          breakMinutes: Math.round(todayBreakMs / 60000),
          missedPunch: !!isMissedPunch,
          overtimeRisk: (empWeekHours[emp.id] || 0) >= 38,
        };
      });

    return NextResponse.json({
      success: true,
      stats: {
        clockedIn: clockedInCount,
        totalEmployees,
        overtimeRisks,
        pendingTimesheets: pendingTimesheets.length,
        missedPunches,
        weekTotalHours,
        weekAvgHours,
        onBreak: onBreakCount,
      },
      employees: employeeStatusList,
    });
  } catch (error: any) {
    console.error("[Admin Time Overview Error]:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch admin overview", details: error.message }, { status: 500 });
  }
}
