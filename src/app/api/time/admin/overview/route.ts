import { db } from "@/db";
import { timeEntries, timeBreaks, employees, users, timesheets } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq, and, isNull, gte, desc, sql } from "drizzle-orm";

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

    // 1. Fetch all employees
    const allEmployees = await db.query.employees.findMany({
      with: {
        user: true,
      }
    });

    // 2. Fetch active entries (Clocked In)
    const activeEntries = await db.query.timeEntries.findMany({
      where: (te, { isNull }) => isNull(te.clockOut),
      with: {
        employee: true,
        breaks: true,
      }
    });

    // 3. Fetch today's entries
    const todayEntries = await db.query.timeEntries.findMany({
      where: (te, { gte }) => gte(te.clockIn, todayStart),
      with: {
        employee: true,
        breaks: true,
      }
    });

    // 4. Fetch this week's entries
    const weekEntries = await db.query.timeEntries.findMany({
      where: (te, { gte }) => gte(te.clockIn, weekStart),
      with: {
        breaks: true,
      }
    });

    // 5. Pending Timesheets
    const pendingTimesheets = await db.query.timesheets.findMany({
      where: (ts, { eq }) => eq(ts.status, 'Submitted'),
    });

    // Calculate stats
    const clockedInCount = activeEntries.length;
    const onBreakCount = activeEntries.filter(e => e.breaks.some((b: any) => b.breakEnd === null)).length;
    const totalEmployees = allEmployees.length;

    // Week Total Hours
    const totalWeekSeconds = weekEntries.reduce((acc: number, e: any) => {
      const end = e.clockOut ? new Date(e.clockOut) : new Date();
      const entryMs = end.getTime() - new Date(e.clockIn).getTime();
      const breakMs = e.breaks.reduce((bAcc: number, b: any) => {
        const bEnd = b.breakEnd ? new Date(b.breakEnd) : (e.clockOut ? null : new Date());
        if (bEnd) {
          return bAcc + (bEnd.getTime() - new Date(b.breakStart).getTime());
        }
        return bAcc;
      }, 0);
      return acc + (entryMs - breakMs) / 1000;
    }, 0);

    const weekTotalHours = parseFloat((totalWeekSeconds / 3600).toFixed(1));
    const weekAvgHours = totalEmployees > 0 ? parseFloat((weekTotalHours / totalEmployees).toFixed(1)) : 0;

    // Missed Punches (employees with no entries today)
    const employeesWithPunchesToday = new Set(todayEntries.map(e => e.employeeId));
    const missedPunches = allEmployees.filter(e => !employeesWithPunchesToday.has(e.id)).length;

    // Overtime Risks (week hours > 35)
    const empWeekHours: Record<number, number> = {};
    weekEntries.forEach((e: any) => {
      const end = e.clockOut ? new Date(e.clockOut) : new Date();
      const entryMs = end.getTime() - new Date(e.clockIn).getTime();
      const breakMs = e.breaks.reduce((bAcc: number, b: any) => {
        const bEnd = b.breakEnd ? new Date(b.breakEnd) : (e.clockOut ? null : new Date());
        if (bEnd) {
          return bAcc + (bEnd.getTime() - new Date(b.breakStart).getTime());
        }
        return bAcc;
      }, 0);
      const hours = (entryMs - breakMs) / 3600000;
      if (e.employeeId) {
        empWeekHours[e.employeeId] = (empWeekHours[e.employeeId] || 0) + hours;
      }
    });

    const overtimeRisks = Object.values(empWeekHours).filter(h => h > 35).length;

    // Employee List with status
    const employeeStatusList = allEmployees.map(emp => {
      const activeEntry = activeEntries.find(e => e.employeeId === emp.id);
      const todayTotalSec = todayEntries
        .filter(e => e.employeeId === emp.id)
        .reduce((acc: number, e: any) => {
           const end = e.clockOut ? new Date(e.clockOut) : new Date();
           const entryMs = end.getTime() - new Date(e.clockIn).getTime();
           const breakMs = e.breaks.reduce((bAcc: number, b: any) => {
             const bEnd = b.breakEnd ? new Date(b.breakEnd) : (e.clockOut ? null : new Date());
             if (bEnd) return bAcc + (bEnd.getTime() - new Date(b.breakStart).getTime());
             return bAcc;
           }, 0);
           return acc + (entryMs - breakMs) / 1000;
        }, 0);

      const status = activeEntry 
        ? (activeEntry.breaks.some((b: any) => b.breakEnd === null) ? 'on-break' : 'clocked-in')
        : (todayEntries.some(e => e.employeeId === emp.id) ? 'clocked-out' : 'no-show');

      return {
        id: emp.id,
        name: `${emp.firstName} ${emp.lastName}`,
        department: emp.department,
        location: emp.location,
        status,
        clockIn: activeEntry ? new Date(activeEntry.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
        hoursToday: parseFloat((todayTotalSec / 3600).toFixed(1)),
        hoursThisWeek: parseFloat((empWeekHours[emp.id] || 0).toFixed(1)),
        missedPunch: status === 'no-show',
        overtimeRisk: (empWeekHours[emp.id] || 0) > 35,
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
