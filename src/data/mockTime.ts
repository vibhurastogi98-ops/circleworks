import {
  employees as hrisEmployees,
  getEmployeeName,
} from "@/lib/hris-module-data";

// =============================================================================
// MOCK DATA - Time & Scheduling Module
// =============================================================================

/* ---------- Types ---------- */

export type ClockStatus = "clocked-in" | "clocked-out" | "on-break" | "no-show";
export type TimesheetStatus = "Submitted" | "Approved" | "Rejected" | "Draft";
export type ShiftSwapStatus = "Pending" | "Approved" | "Denied";
export type PtoType = "Vacation" | "Sick" | "Personal" | "Bereavement" | "FMLA" | "Jury Duty";
export type PtoStatus = "Pending" | "Approved" | "Denied";
export type BreakViolationType = "Missed Meal" | "Late Meal" | "Short Rest" | "Missed Rest";

/* ---------- Employee Time Card ---------- */

export interface EmployeeClockEntry {
  id: string;
  employeeId: string;
  name: string;
  department: string;
  status: ClockStatus;
  clockIn: string | null;   // ISO time
  clockOut: string | null;
  hoursToday: number;
  hoursThisWeek: number;
  overtimeRisk: boolean;
  missedPunch: boolean;
  location: string;
  role: string;
}

export interface Timesheet {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  periodStart: string;
  periodEnd: string;
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
  status: TimesheetStatus;
  submittedAt: string | null;
  approverNote: string;
}

export interface TimesheetDay {
  date: string;       // "2026-03-30"
  dayLabel: string;   // "Mon"
  clockIn: string | null;
  clockOut: string | null;
  breakMinutes: number;
  regularHours: number;
  overtimeHours: number;
  totalHours: number;
  edited: boolean;
  editReason: string;
  breakCompliant: boolean;
}

export interface Shift {
  id: string;
  employeeId: string;
  employeeName: string;
  day: string;          // "Mon" | "Tue" ...
  date: string;
  startTime: string;    // "09:00"
  endTime: string;      // "17:00"
  role: string;
  location: string;
  color: string;
}

export interface OpenShift {
  id: string;
  date: string;
  day: string;
  startTime: string;
  endTime: string;
  role: string;
  location: string;
  claimedBy: string | null;
  claimStatus: "open" | "claimed" | "approved";
  autoApprove: boolean;
}

export interface ShiftSwapRequest {
  id: string;
  requesterName: string;
  targetName: string;
  originalShift: string;
  requestedShift: string;
  status: ShiftSwapStatus;
  requestedAt: string;
}

export interface PtoRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: PtoType;
  startDate: string;
  endDate: string;
  totalDays: number;
  status: PtoStatus;
  note: string;
  approverNote: string;
  requestedAt: string;
  isFmla: boolean;
}

export interface PtoPolicy {
  id: string;
  name: string;
  leaveType: PtoType;
  accrualRate: string;      // e.g. "1.25 days/month"
  accrualFrequency: string; // e.g. "Monthly"
  maxAccrual: number;       // days
  carryoverLimit: number;   // days
  waitingPeriod: string;    // e.g. "90 days"
  payoutOnTermination: boolean;
  assignedTo: string;       // department or "All"
}

export interface BreakViolation {
  id: string;
  employeeId: string;
  employeeName: string;
  violationType: BreakViolationType;
  scheduledBreak: string;
  actualBreak: string | null;
  state: string;
  premiumPayApplied: boolean;
  date: string;
  time: string;
}

export interface OvertimeEmployee {
  id: string;
  name: string;
  department: string;
  hoursThisWeek: number;
  projectedHours: number;
  otHoursThisWeek: number;
  projectedOtHours: number;
  otCost: number;
  riskLevel: "safe" | "warning" | "critical";
}

export interface OtMonthlyTrend {
  month: string;
  otHours: number;
  otCost: number;
  budget: number;
}

/* ---------- MOCK DATA ---------- */

const clockStatuses: ClockStatus[] = ["clocked-in", "on-break", "clocked-in", "clocked-out", "no-show", "clocked-in", "clocked-in", "clocked-in"];
const timesheetStatuses: TimesheetStatus[] = ["Submitted", "Submitted", "Approved", "Submitted", "Rejected", "Submitted", "Approved", "Submitted"];

export const mockEmployeeClock: EmployeeClockEntry[] = hrisEmployees.map((employee, index) => {
  const status = clockStatuses[index % clockStatuses.length];
  const hoursThisWeek = [34, 38, 32, 42, 24, 37, 30, 39][index] || 32;

  return {
    id: `tc-${employee.id}`,
    employeeId: employee.id,
    name: getEmployeeName(employee),
    department: employee.department,
    status,
    clockIn: status === "no-show" ? null : ["08:02", "07:45", "08:30", "06:00", "09:00", "08:15", "07:00", "09:30"][index] || "09:00",
    clockOut: status === "clocked-out" ? "14:30" : null,
    hoursToday: status === "no-show" ? 0 : [6.5, 7.2, 5.8, 8, 0, 5, 6.2, 7.5][index] || 6,
    hoursThisWeek,
    overtimeRisk: hoursThisWeek >= 38,
    missedPunch: status === "no-show",
    location: employee.locationType === "Remote" ? "Remote" : employee.location,
    role: employee.title,
  };
});

export const mockTimesheets: Timesheet[] = hrisEmployees.map((employee, index) => {
  const totalHours = [42, 44, 40, 46, 38, 41, 40, 48][index] || 40;
  const overtimeHours = Math.max(0, totalHours - 40);
  const status = timesheetStatuses[index % timesheetStatuses.length];

  return {
    id: `ts-${employee.id}`,
    employeeId: employee.id,
    employeeName: getEmployeeName(employee),
    department: employee.department,
    periodStart: "2026-05-18",
    periodEnd: "2026-05-24",
    totalHours,
    regularHours: Math.min(totalHours, 40),
    overtimeHours,
    status,
    submittedAt: status === "Draft" ? null : "2026-05-25T09:00:00Z",
    approverNote: status === "Rejected" ? "Missing Thursday entry" : status === "Approved" ? "Approved" : "",
  };
});

export const mockTimesheetDays: TimesheetDay[] = [
  { date: "2026-03-23", dayLabel: "Mon", clockIn: "08:02", clockOut: "17:15", breakMinutes: 30, regularHours: 8, overtimeHours: 0.75, totalHours: 8.75, edited: false, editReason: "", breakCompliant: true },
  { date: "2026-03-24", dayLabel: "Tue", clockIn: "07:55", clockOut: "17:00", breakMinutes: 30, regularHours: 8, overtimeHours: 0.5, totalHours: 8.5, edited: false, editReason: "", breakCompliant: true },
  { date: "2026-03-25", dayLabel: "Wed", clockIn: "08:00", clockOut: "16:30", breakMinutes: 30, regularHours: 8, overtimeHours: 0, totalHours: 8.0, edited: true, editReason: "Left early for doctor appointment", breakCompliant: true },
  { date: "2026-03-26", dayLabel: "Thu", clockIn: "08:10", clockOut: "17:30", breakMinutes: 30, regularHours: 8, overtimeHours: 0.83, totalHours: 8.83, edited: false, editReason: "", breakCompliant: true },
  { date: "2026-03-27", dayLabel: "Fri", clockIn: "08:00", clockOut: "16:00", breakMinutes: 30, regularHours: 7.5, overtimeHours: 0, totalHours: 7.5, edited: false, editReason: "", breakCompliant: false },
  { date: "2026-03-28", dayLabel: "Sat", clockIn: null, clockOut: null, breakMinutes: 0, regularHours: 0, overtimeHours: 0, totalHours: 0, edited: false, editReason: "", breakCompliant: true },
  { date: "2026-03-29", dayLabel: "Sun", clockIn: null, clockOut: null, breakMinutes: 0, regularHours: 0, overtimeHours: 0, totalHours: 0, edited: false, editReason: "", breakCompliant: true },
];

const SHIFT_COLORS = [
  "bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-300",
  "bg-emerald-100 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300",
  "bg-violet-100 dark:bg-violet-900/30 border-violet-300 dark:border-violet-700 text-violet-800 dark:text-violet-300",
  "bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300",
  "bg-rose-100 dark:bg-rose-900/30 border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-300",
];

export const mockShifts: Shift[] = hrisEmployees.slice(0, 5).flatMap((employee, employeeIndex) =>
  ["Mon", "Tue", "Wed", "Thu", "Fri"].map((day, dayIndex) => ({
    id: `sh-${employee.id}-${day}`,
    employeeId: employee.id,
    employeeName: getEmployeeName(employee),
    day,
    date: `2026-06-${String(1 + dayIndex).padStart(2, "0")}`,
    startTime: employee.payType === "Hourly" ? "08:00" : "09:00",
    endTime: employee.payType === "Hourly" ? "16:00" : "17:00",
    role: employee.title,
    location: employee.locationType === "Remote" ? "Remote" : employee.location,
    color: SHIFT_COLORS[employeeIndex % SHIFT_COLORS.length],
  })),
);

export const mockOpenShifts: OpenShift[] = [
  { id: "os-1", date: "2026-04-04", day: "Sat", startTime: "08:00", endTime: "16:00", role: "Support Agent", location: "HQ - Floor 1", claimedBy: null, claimStatus: "open", autoApprove: false },
  { id: "os-2", date: "2026-04-04", day: "Sat", startTime: "14:00", endTime: "22:00", role: "Warehouse Associate", location: "Warehouse A", claimedBy: null, claimStatus: "open", autoApprove: true },
  { id: "os-3", date: "2026-06-05", day: "Fri", startTime: "10:00", endTime: "18:00", role: "Support Agent", location: "Remote", claimedBy: getEmployeeName(hrisEmployees[7]), claimStatus: "claimed", autoApprove: false },
  { id: "os-4", date: "2026-04-06", day: "Mon", startTime: "06:00", endTime: "14:00", role: "Shift Supervisor", location: "Warehouse B", claimedBy: null, claimStatus: "open", autoApprove: false },
  { id: "os-5", date: "2026-06-07", day: "Sun", startTime: "09:00", endTime: "17:00", role: "Engineer", location: "Remote", claimedBy: getEmployeeName(hrisEmployees[5]), claimStatus: "approved", autoApprove: true },
];

export const mockShiftSwaps: ShiftSwapRequest[] = [
  { id: "sw-1", requesterName: getEmployeeName(hrisEmployees[7]), targetName: getEmployeeName(hrisEmployees[4]), originalShift: "Mon Jun 1, 8AM-4PM", requestedShift: "Tue Jun 2, 8AM-4PM", status: "Pending", requestedAt: "2026-05-28T14:00:00Z" },
  { id: "sw-2", requesterName: getEmployeeName(hrisEmployees[5]), targetName: getEmployeeName(hrisEmployees[2]), originalShift: "Wed Jun 3, 9AM-5PM", requestedShift: "Thu Jun 4, 9AM-5PM", status: "Approved", requestedAt: "2026-05-27T09:00:00Z" },
];

export const mockPtoRequests: PtoRequest[] = [
  { id: "pto-1", employeeId: hrisEmployees[0].id, employeeName: getEmployeeName(hrisEmployees[0]), type: "Vacation", startDate: "2026-06-14", endDate: "2026-06-18", totalDays: 5, status: "Pending", note: "Family trip", approverNote: "", requestedAt: "2026-05-20T10:00:00Z", isFmla: false },
  { id: "pto-2", employeeId: hrisEmployees[1].id, employeeName: getEmployeeName(hrisEmployees[1]), type: "Sick", startDate: "2026-06-07", endDate: "2026-06-07", totalDays: 1, status: "Approved", note: "Doctor appointment", approverNote: "Approved", requestedAt: "2026-05-21T08:00:00Z", isFmla: false },
  { id: "pto-3", employeeId: hrisEmployees[6].id, employeeName: getEmployeeName(hrisEmployees[6]), type: "FMLA", startDate: "2026-06-10", endDate: "2026-07-10", totalDays: 22, status: "Pending", note: "Medical leave", approverNote: "", requestedAt: "2026-05-25T11:00:00Z", isFmla: true },
  { id: "pto-4", employeeId: hrisEmployees[7].id, employeeName: getEmployeeName(hrisEmployees[7]), type: "Personal", startDate: "2026-06-11", endDate: "2026-06-11", totalDays: 1, status: "Denied", note: "Moving day", approverNote: "Conflicts with team deadline", requestedAt: "2026-05-28T14:30:00Z", isFmla: false },
];

export const mockPtoPolicies: PtoPolicy[] = [
  { id: "pol-1", name: "Standard Vacation", leaveType: "Vacation", accrualRate: "1.25 days/month", accrualFrequency: "Monthly", maxAccrual: 20, carryoverLimit: 5, waitingPeriod: "90 days", payoutOnTermination: true, assignedTo: "All Departments" },
  { id: "pol-2", name: "Sick Leave", leaveType: "Sick", accrualRate: "1 day/month", accrualFrequency: "Monthly", maxAccrual: 12, carryoverLimit: 12, waitingPeriod: "None", payoutOnTermination: false, assignedTo: "All Departments" },
  { id: "pol-3", name: "Personal Days", leaveType: "Personal", accrualRate: "3 days/year", accrualFrequency: "Annually", maxAccrual: 3, carryoverLimit: 0, waitingPeriod: "30 days", payoutOnTermination: false, assignedTo: "All Departments" },
  { id: "pol-4", name: "Bereavement Leave", leaveType: "Bereavement", accrualRate: "5 days/event", accrualFrequency: "Per Event", maxAccrual: 5, carryoverLimit: 0, waitingPeriod: "None", payoutOnTermination: false, assignedTo: "All Departments" },
  { id: "pol-5", name: "Executive Vacation", leaveType: "Vacation", accrualRate: "2 days/month", accrualFrequency: "Monthly", maxAccrual: 30, carryoverLimit: 10, waitingPeriod: "None", payoutOnTermination: true, assignedTo: "Engineering" },
];

export const mockBreakViolations: BreakViolation[] = [
  { id: "bv-1", employeeId: hrisEmployees[7].id, employeeName: getEmployeeName(hrisEmployees[7]), violationType: "Missed Meal", scheduledBreak: "12:00 PM", actualBreak: null, state: "CO", premiumPayApplied: true, date: "2026-06-05", time: "12:00 PM" },
  { id: "bv-2", employeeId: hrisEmployees[4].id, employeeName: getEmployeeName(hrisEmployees[4]), violationType: "Late Meal", scheduledBreak: "11:00 AM", actualBreak: "12:45 PM", state: "MA", premiumPayApplied: true, date: "2026-06-05", time: "11:00 AM" },
  { id: "bv-3", employeeId: hrisEmployees[5].id, employeeName: getEmployeeName(hrisEmployees[5]), violationType: "Short Rest", scheduledBreak: "10:00 AM", actualBreak: "10:00 AM (5 min)", state: "WA", premiumPayApplied: false, date: "2026-06-05", time: "10:00 AM" },
];

export const mockOvertimeEmployees: OvertimeEmployee[] = mockEmployeeClock.map((entry) => {
  const projectedHours = entry.hoursThisWeek + (entry.overtimeRisk ? 5 : 3);
  const projectedOtHours = Math.max(0, projectedHours - 40);
  const riskLevel: OvertimeEmployee["riskLevel"] = projectedOtHours >= 6 ? "critical" : projectedOtHours > 0 ? "warning" : "safe";

  return {
    id: entry.employeeId,
    name: entry.name,
    department: entry.department,
    hoursThisWeek: entry.hoursThisWeek,
    projectedHours,
    otHoursThisWeek: Math.max(0, entry.hoursThisWeek - 40),
    projectedOtHours,
    otCost: Math.round(projectedOtHours * 45),
    riskLevel,
  };
});

export const mockOtMonthlyTrend: OtMonthlyTrend[] = [
  { month: "Oct", otHours: 120, otCost: 5400, budget: 6000 },
  { month: "Nov", otHours: 145, otCost: 6525, budget: 6000 },
  { month: "Dec", otHours: 180, otCost: 8100, budget: 6000 },
  { month: "Jan", otHours: 110, otCost: 4950, budget: 6000 },
  { month: "Feb", otHours: 95, otCost: 4275, budget: 6000 },
  { month: "Mar", otHours: 130, otCost: 5850, budget: 6000 },
];

/* ---------- Summary helpers ---------- */

export function getTimeOverviewStats() {
  const totalEmployees = mockEmployeeClock.length;
  const clockedIn = mockEmployeeClock.filter(e => e.status === "clocked-in" || e.status === "on-break").length;
  const onBreak = mockEmployeeClock.filter(e => e.status === "on-break").length;
  const clockedOut = mockEmployeeClock.filter(e => e.status === "clocked-out").length;
  const missedPunches = mockEmployeeClock.filter(e => e.missedPunch).length;
  const overtimeRisks = mockEmployeeClock.filter(e => e.overtimeRisk).length;
  const pendingTimesheets = mockTimesheets.filter(ts => ts.status === "Submitted").length;
  const weekTotalHours = mockEmployeeClock.reduce((s, e) => s + e.hoursThisWeek, 0);
  const weekAvgHours = Math.round(weekTotalHours / totalEmployees * 10) / 10;

  return {
    totalEmployees,
    clockedIn,
    onBreak,
    clockedOut,
    missedPunches,
    overtimeRisks,
    pendingTimesheets,
    weekTotalHours,
    weekAvgHours,
  };
}
