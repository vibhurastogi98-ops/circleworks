// =============================================================================
// 🕐 MOCK DATA — Time & Scheduling Module
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

const DEPARTMENTS = ["Engineering", "Operations", "Sales", "Marketing", "Support", "Finance"];

export const mockEmployeeClock: EmployeeClockEntry[] = [
  { id: "tc-1", employeeId: "emp-1", name: "Sarah Johnson", department: "Engineering", status: "clocked-in", clockIn: "08:02", clockOut: null, hoursToday: 6.5, hoursThisWeek: 34, overtimeRisk: false, missedPunch: false, location: "HQ - Floor 3", role: "Sr. Engineer" },
  { id: "tc-2", employeeId: "emp-2", name: "Mike Chen", department: "Engineering", status: "on-break", clockIn: "07:45", clockOut: null, hoursToday: 7.2, hoursThisWeek: 38, overtimeRisk: true, missedPunch: false, location: "HQ - Floor 3", role: "Tech Lead" },
  { id: "tc-3", employeeId: "emp-3", name: "Amy Park", department: "Operations", status: "clocked-in", clockIn: "08:30", clockOut: null, hoursToday: 5.8, hoursThisWeek: 32, overtimeRisk: false, missedPunch: false, location: "Warehouse A", role: "Ops Manager" },
  { id: "tc-4", employeeId: "emp-4", name: "Carlos Diaz", department: "Sales", status: "clocked-out", clockIn: "06:00", clockOut: "14:30", hoursToday: 8.0, hoursThisWeek: 42, overtimeRisk: true, missedPunch: false, location: "Remote", role: "Sales Rep" },
  { id: "tc-5", employeeId: "emp-5", name: "Jessica Williams", department: "Support", status: "no-show", clockIn: null, clockOut: null, hoursToday: 0, hoursThisWeek: 24, overtimeRisk: false, missedPunch: true, location: "HQ - Floor 1", role: "Support Lead" },
  { id: "tc-6", employeeId: "emp-6", name: "David Kim", department: "Engineering", status: "clocked-in", clockIn: "09:00", clockOut: null, hoursToday: 5.0, hoursThisWeek: 37, overtimeRisk: true, missedPunch: false, location: "HQ - Floor 3", role: "Engineer" },
  { id: "tc-7", employeeId: "emp-7", name: "Rachel Torres", department: "Marketing", status: "clocked-in", clockIn: "08:15", clockOut: null, hoursToday: 6.2, hoursThisWeek: 30, overtimeRisk: false, missedPunch: false, location: "HQ - Floor 2", role: "Marketing Coord" },
  { id: "tc-8", employeeId: "emp-8", name: "Brandon Lee", department: "Operations", status: "clocked-in", clockIn: "07:00", clockOut: null, hoursToday: 7.5, hoursThisWeek: 39, overtimeRisk: true, missedPunch: false, location: "Warehouse B", role: "Shift Supervisor" },
  { id: "tc-9", employeeId: "emp-9", name: "Nina Patel", department: "Finance", status: "clocked-out", clockIn: "08:00", clockOut: "16:00", hoursToday: 8.0, hoursThisWeek: 40, overtimeRisk: false, missedPunch: false, location: "HQ - Floor 4", role: "Accountant" },
  { id: "tc-10", employeeId: "emp-10", name: "Tom Rivera", department: "Support", status: "clocked-in", clockIn: "09:30", clockOut: null, hoursToday: 4.5, hoursThisWeek: 28, overtimeRisk: false, missedPunch: false, location: "Remote", role: "Support Agent" },
  { id: "tc-11", employeeId: "emp-11", name: "Lisa Morgan", department: "Sales", status: "clocked-in", clockIn: "08:00", clockOut: null, hoursToday: 6.0, hoursThisWeek: 36, overtimeRisk: false, missedPunch: false, location: "Field Office", role: "Account Exec" },
  { id: "tc-12", employeeId: "emp-12", name: "James Foster", department: "Engineering", status: "no-show", clockIn: null, clockOut: null, hoursToday: 0, hoursThisWeek: 16, overtimeRisk: false, missedPunch: true, location: "HQ - Floor 3", role: "Junior Dev" },
];

export const mockTimesheets: Timesheet[] = [
  { id: "ts-1", employeeId: "emp-1", employeeName: "Sarah Johnson", department: "Engineering", periodStart: "2026-03-23", periodEnd: "2026-03-29", totalHours: 42, regularHours: 40, overtimeHours: 2, status: "Submitted", submittedAt: "2026-03-30T09:00:00Z", approverNote: "" },
  { id: "ts-2", employeeId: "emp-2", employeeName: "Mike Chen", department: "Engineering", periodStart: "2026-03-23", periodEnd: "2026-03-29", totalHours: 44, regularHours: 40, overtimeHours: 4, status: "Submitted", submittedAt: "2026-03-30T08:45:00Z", approverNote: "" },
  { id: "ts-3", employeeId: "emp-3", employeeName: "Amy Park", department: "Operations", periodStart: "2026-03-23", periodEnd: "2026-03-29", totalHours: 40, regularHours: 40, overtimeHours: 0, status: "Approved", submittedAt: "2026-03-29T17:00:00Z", approverNote: "Looks good" },
  { id: "ts-4", employeeId: "emp-4", employeeName: "Carlos Diaz", department: "Sales", periodStart: "2026-03-23", periodEnd: "2026-03-29", totalHours: 46, regularHours: 40, overtimeHours: 6, status: "Submitted", submittedAt: "2026-03-30T10:00:00Z", approverNote: "" },
  { id: "ts-5", employeeId: "emp-5", employeeName: "Jessica Williams", department: "Support", periodStart: "2026-03-23", periodEnd: "2026-03-29", totalHours: 38, regularHours: 38, overtimeHours: 0, status: "Rejected", submittedAt: "2026-03-30T07:00:00Z", approverNote: "Missing Thursday entry" },
  { id: "ts-6", employeeId: "emp-6", employeeName: "David Kim", department: "Engineering", periodStart: "2026-03-23", periodEnd: "2026-03-29", totalHours: 41, regularHours: 40, overtimeHours: 1, status: "Submitted", submittedAt: "2026-03-30T11:00:00Z", approverNote: "" },
  { id: "ts-7", employeeId: "emp-7", employeeName: "Rachel Torres", department: "Marketing", periodStart: "2026-03-23", periodEnd: "2026-03-29", totalHours: 40, regularHours: 40, overtimeHours: 0, status: "Approved", submittedAt: "2026-03-29T16:30:00Z", approverNote: "Approved" },
  { id: "ts-8", employeeId: "emp-8", employeeName: "Brandon Lee", department: "Operations", periodStart: "2026-03-23", periodEnd: "2026-03-29", totalHours: 48, regularHours: 40, overtimeHours: 8, status: "Submitted", submittedAt: "2026-03-30T06:00:00Z", approverNote: "" },
];

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

export const mockShifts: Shift[] = [
  // Sarah Johnson
  { id: "sh-1", employeeId: "emp-1", employeeName: "Sarah Johnson", day: "Mon", date: "2026-03-30", startTime: "08:00", endTime: "16:00", role: "Sr. Engineer", location: "HQ", color: SHIFT_COLORS[0] },
  { id: "sh-2", employeeId: "emp-1", employeeName: "Sarah Johnson", day: "Tue", date: "2026-03-31", startTime: "08:00", endTime: "16:00", role: "Sr. Engineer", location: "HQ", color: SHIFT_COLORS[0] },
  { id: "sh-3", employeeId: "emp-1", employeeName: "Sarah Johnson", day: "Wed", date: "2026-04-01", startTime: "08:00", endTime: "16:00", role: "Sr. Engineer", location: "HQ", color: SHIFT_COLORS[0] },
  { id: "sh-4", employeeId: "emp-1", employeeName: "Sarah Johnson", day: "Thu", date: "2026-04-02", startTime: "08:00", endTime: "16:00", role: "Sr. Engineer", location: "HQ", color: SHIFT_COLORS[0] },
  { id: "sh-5", employeeId: "emp-1", employeeName: "Sarah Johnson", day: "Fri", date: "2026-04-03", startTime: "08:00", endTime: "16:00", role: "Sr. Engineer", location: "HQ", color: SHIFT_COLORS[0] },
  // Mike Chen
  { id: "sh-6", employeeId: "emp-2", employeeName: "Mike Chen", day: "Mon", date: "2026-03-30", startTime: "09:00", endTime: "18:00", role: "Tech Lead", location: "HQ", color: SHIFT_COLORS[1] },
  { id: "sh-7", employeeId: "emp-2", employeeName: "Mike Chen", day: "Tue", date: "2026-03-31", startTime: "09:00", endTime: "18:00", role: "Tech Lead", location: "HQ", color: SHIFT_COLORS[1] },
  { id: "sh-8", employeeId: "emp-2", employeeName: "Mike Chen", day: "Wed", date: "2026-04-01", startTime: "09:00", endTime: "18:00", role: "Tech Lead", location: "HQ", color: SHIFT_COLORS[1] },
  { id: "sh-9", employeeId: "emp-2", employeeName: "Mike Chen", day: "Thu", date: "2026-04-02", startTime: "09:00", endTime: "18:00", role: "Tech Lead", location: "HQ", color: SHIFT_COLORS[1] },
  { id: "sh-10", employeeId: "emp-2", employeeName: "Mike Chen", day: "Fri", date: "2026-04-03", startTime: "09:00", endTime: "17:00", role: "Tech Lead", location: "HQ", color: SHIFT_COLORS[1] },
  // Brandon Lee
  { id: "sh-11", employeeId: "emp-8", employeeName: "Brandon Lee", day: "Mon", date: "2026-03-30", startTime: "06:00", endTime: "14:00", role: "Shift Supervisor", location: "Warehouse B", color: SHIFT_COLORS[2] },
  { id: "sh-12", employeeId: "emp-8", employeeName: "Brandon Lee", day: "Tue", date: "2026-03-31", startTime: "06:00", endTime: "14:00", role: "Shift Supervisor", location: "Warehouse B", color: SHIFT_COLORS[2] },
  { id: "sh-13", employeeId: "emp-8", employeeName: "Brandon Lee", day: "Wed", date: "2026-04-01", startTime: "06:00", endTime: "14:00", role: "Shift Supervisor", location: "Warehouse B", color: SHIFT_COLORS[2] },
  { id: "sh-14", employeeId: "emp-8", employeeName: "Brandon Lee", day: "Thu", date: "2026-04-02", startTime: "06:00", endTime: "14:00", role: "Shift Supervisor", location: "Warehouse B", color: SHIFT_COLORS[2] },
  { id: "sh-15", employeeId: "emp-8", employeeName: "Brandon Lee", day: "Fri", date: "2026-04-03", startTime: "06:00", endTime: "14:00", role: "Shift Supervisor", location: "Warehouse B", color: SHIFT_COLORS[2] },
  // Amy Park
  { id: "sh-16", employeeId: "emp-3", employeeName: "Amy Park", day: "Mon", date: "2026-03-30", startTime: "08:00", endTime: "17:00", role: "Ops Manager", location: "Warehouse A", color: SHIFT_COLORS[3] },
  { id: "sh-17", employeeId: "emp-3", employeeName: "Amy Park", day: "Tue", date: "2026-03-31", startTime: "08:00", endTime: "17:00", role: "Ops Manager", location: "Warehouse A", color: SHIFT_COLORS[3] },
  { id: "sh-18", employeeId: "emp-3", employeeName: "Amy Park", day: "Wed", date: "2026-04-01", startTime: "08:00", endTime: "17:00", role: "Ops Manager", location: "Warehouse A", color: SHIFT_COLORS[3] },
  { id: "sh-19", employeeId: "emp-3", employeeName: "Amy Park", day: "Thu", date: "2026-04-02", startTime: "08:00", endTime: "17:00", role: "Ops Manager", location: "Warehouse A", color: SHIFT_COLORS[3] },
  { id: "sh-20", employeeId: "emp-3", employeeName: "Amy Park", day: "Fri", date: "2026-04-03", startTime: "08:00", endTime: "17:00", role: "Ops Manager", location: "Warehouse A", color: SHIFT_COLORS[3] },
  // Carlos Diaz
  { id: "sh-21", employeeId: "emp-4", employeeName: "Carlos Diaz", day: "Mon", date: "2026-03-30", startTime: "06:00", endTime: "14:00", role: "Sales Rep", location: "Remote", color: SHIFT_COLORS[4] },
  { id: "sh-22", employeeId: "emp-4", employeeName: "Carlos Diaz", day: "Tue", date: "2026-03-31", startTime: "06:00", endTime: "14:00", role: "Sales Rep", location: "Remote", color: SHIFT_COLORS[4] },
  { id: "sh-23", employeeId: "emp-4", employeeName: "Carlos Diaz", day: "Wed", date: "2026-04-01", startTime: "06:00", endTime: "15:00", role: "Sales Rep", location: "Remote", color: SHIFT_COLORS[4] },
  { id: "sh-24", employeeId: "emp-4", employeeName: "Carlos Diaz", day: "Thu", date: "2026-04-02", startTime: "06:00", endTime: "15:00", role: "Sales Rep", location: "Remote", color: SHIFT_COLORS[4] },
  { id: "sh-25", employeeId: "emp-4", employeeName: "Carlos Diaz", day: "Fri", date: "2026-04-03", startTime: "06:00", endTime: "14:00", role: "Sales Rep", location: "Remote", color: SHIFT_COLORS[4] },
];

export const mockOpenShifts: OpenShift[] = [
  { id: "os-1", date: "2026-04-04", day: "Sat", startTime: "08:00", endTime: "16:00", role: "Support Agent", location: "HQ - Floor 1", claimedBy: null, claimStatus: "open", autoApprove: false },
  { id: "os-2", date: "2026-04-04", day: "Sat", startTime: "14:00", endTime: "22:00", role: "Warehouse Associate", location: "Warehouse A", claimedBy: null, claimStatus: "open", autoApprove: true },
  { id: "os-3", date: "2026-04-05", day: "Sun", startTime: "10:00", endTime: "18:00", role: "Support Agent", location: "Remote", claimedBy: "Tom Rivera", claimStatus: "claimed", autoApprove: false },
  { id: "os-4", date: "2026-04-06", day: "Mon", startTime: "06:00", endTime: "14:00", role: "Shift Supervisor", location: "Warehouse B", claimedBy: null, claimStatus: "open", autoApprove: false },
  { id: "os-5", date: "2026-04-07", day: "Tue", startTime: "09:00", endTime: "17:00", role: "Engineer", location: "HQ - Floor 3", claimedBy: "David Kim", claimStatus: "approved", autoApprove: true },
];

export const mockShiftSwaps: ShiftSwapRequest[] = [
  { id: "sw-1", requesterName: "Sarah Johnson", targetName: "David Kim", originalShift: "Mon Mar 30, 8AM-4PM", requestedShift: "Tue Mar 31, 9AM-6PM", status: "Pending", requestedAt: "2026-03-28T14:00:00Z" },
  { id: "sw-2", requesterName: "Brandon Lee", targetName: "Amy Park", originalShift: "Wed Apr 1, 6AM-2PM", requestedShift: "Wed Apr 1, 8AM-5PM", status: "Approved", requestedAt: "2026-03-27T09:00:00Z" },
];

export const mockPtoRequests: PtoRequest[] = [
  { id: "pto-1", employeeId: "emp-1", employeeName: "Sarah Johnson", type: "Vacation", startDate: "2026-04-14", endDate: "2026-04-18", totalDays: 5, status: "Pending", note: "Family trip", approverNote: "", requestedAt: "2026-03-20T10:00:00Z", isFmla: false },
  { id: "pto-2", employeeId: "emp-2", employeeName: "Mike Chen", type: "Sick", startDate: "2026-04-07", endDate: "2026-04-07", totalDays: 1, status: "Approved", note: "Doctor appointment", approverNote: "Approved", requestedAt: "2026-04-01T08:00:00Z", isFmla: false },
  { id: "pto-3", employeeId: "emp-5", employeeName: "Jessica Williams", type: "FMLA", startDate: "2026-04-10", endDate: "2026-05-10", totalDays: 22, status: "Pending", note: "Medical leave - surgery recovery", approverNote: "", requestedAt: "2026-03-25T11:00:00Z", isFmla: true },
  { id: "pto-4", employeeId: "emp-7", employeeName: "Rachel Torres", type: "Personal", startDate: "2026-04-11", endDate: "2026-04-11", totalDays: 1, status: "Denied", note: "Moving day", approverNote: "Conflicts with team deadline", requestedAt: "2026-03-28T14:30:00Z", isFmla: false },
  { id: "pto-5", employeeId: "emp-4", employeeName: "Carlos Diaz", type: "Vacation", startDate: "2026-04-21", endDate: "2026-04-25", totalDays: 5, status: "Pending", note: "Road trip", approverNote: "", requestedAt: "2026-03-30T09:00:00Z", isFmla: false },
  { id: "pto-6", employeeId: "emp-9", employeeName: "Nina Patel", type: "Bereavement", startDate: "2026-04-02", endDate: "2026-04-04", totalDays: 3, status: "Approved", note: "Family bereavement", approverNote: "Deepest condolences. Approved.", requestedAt: "2026-04-01T07:00:00Z", isFmla: false },
  { id: "pto-7", employeeId: "emp-10", employeeName: "Tom Rivera", type: "Jury Duty", startDate: "2026-04-15", endDate: "2026-04-17", totalDays: 3, status: "Pending", note: "Jury service notice", approverNote: "", requestedAt: "2026-03-29T16:00:00Z", isFmla: false },
];

export const mockPtoPolicies: PtoPolicy[] = [
  { id: "pol-1", name: "Standard Vacation", leaveType: "Vacation", accrualRate: "1.25 days/month", accrualFrequency: "Monthly", maxAccrual: 20, carryoverLimit: 5, waitingPeriod: "90 days", payoutOnTermination: true, assignedTo: "All Departments" },
  { id: "pol-2", name: "Sick Leave", leaveType: "Sick", accrualRate: "1 day/month", accrualFrequency: "Monthly", maxAccrual: 12, carryoverLimit: 12, waitingPeriod: "None", payoutOnTermination: false, assignedTo: "All Departments" },
  { id: "pol-3", name: "Personal Days", leaveType: "Personal", accrualRate: "3 days/year", accrualFrequency: "Annually", maxAccrual: 3, carryoverLimit: 0, waitingPeriod: "30 days", payoutOnTermination: false, assignedTo: "All Departments" },
  { id: "pol-4", name: "Bereavement Leave", leaveType: "Bereavement", accrualRate: "5 days/event", accrualFrequency: "Per Event", maxAccrual: 5, carryoverLimit: 0, waitingPeriod: "None", payoutOnTermination: false, assignedTo: "All Departments" },
  { id: "pol-5", name: "Executive Vacation", leaveType: "Vacation", accrualRate: "2 days/month", accrualFrequency: "Monthly", maxAccrual: 30, carryoverLimit: 10, waitingPeriod: "None", payoutOnTermination: true, assignedTo: "Engineering" },
];

export const mockBreakViolations: BreakViolation[] = [
  { id: "bv-1", employeeId: "emp-4", employeeName: "Carlos Diaz", violationType: "Missed Meal", scheduledBreak: "12:00 PM", actualBreak: null, state: "CA", premiumPayApplied: true, date: "2026-04-05", time: "12:00 PM" },
  { id: "bv-2", employeeId: "emp-8", employeeName: "Brandon Lee", violationType: "Late Meal", scheduledBreak: "11:00 AM", actualBreak: "12:45 PM", state: "CA", premiumPayApplied: true, date: "2026-04-05", time: "11:00 AM" },
  { id: "bv-3", employeeId: "emp-6", employeeName: "David Kim", violationType: "Short Rest", scheduledBreak: "10:00 AM", actualBreak: "10:00 AM (5 min)", state: "CA", premiumPayApplied: true, date: "2026-04-05", time: "10:00 AM" },
  { id: "bv-4", employeeId: "emp-3", employeeName: "Amy Park", violationType: "Missed Rest", scheduledBreak: "3:00 PM", actualBreak: null, state: "WA", premiumPayApplied: false, date: "2026-04-05", time: "3:00 PM" },
  { id: "bv-5", employeeId: "emp-10", employeeName: "Tom Rivera", violationType: "Late Meal", scheduledBreak: "12:30 PM", actualBreak: "2:00 PM", state: "OR", premiumPayApplied: false, date: "2026-04-05", time: "12:30 PM" },
];

export const mockOvertimeEmployees: OvertimeEmployee[] = [
  { id: "emp-4", name: "Carlos Diaz", department: "Sales", hoursThisWeek: 42, projectedHours: 48, otHoursThisWeek: 2, projectedOtHours: 8, otCost: 360, riskLevel: "critical" },
  { id: "emp-8", name: "Brandon Lee", department: "Operations", hoursThisWeek: 39, projectedHours: 46, otHoursThisWeek: 0, projectedOtHours: 6, otCost: 270, riskLevel: "critical" },
  { id: "emp-2", name: "Mike Chen", department: "Engineering", hoursThisWeek: 38, projectedHours: 43, otHoursThisWeek: 0, projectedOtHours: 3, otCost: 225, riskLevel: "warning" },
  { id: "emp-6", name: "David Kim", department: "Engineering", hoursThisWeek: 37, projectedHours: 42, otHoursThisWeek: 0, projectedOtHours: 2, otCost: 140, riskLevel: "warning" },
  { id: "emp-1", name: "Sarah Johnson", department: "Engineering", hoursThisWeek: 34, projectedHours: 40, otHoursThisWeek: 0, projectedOtHours: 0, otCost: 0, riskLevel: "safe" },
  { id: "emp-3", name: "Amy Park", department: "Operations", hoursThisWeek: 32, projectedHours: 40, otHoursThisWeek: 0, projectedOtHours: 0, otCost: 0, riskLevel: "safe" },
  { id: "emp-7", name: "Rachel Torres", department: "Marketing", hoursThisWeek: 30, projectedHours: 38, otHoursThisWeek: 0, projectedOtHours: 0, otCost: 0, riskLevel: "safe" },
  { id: "emp-9", name: "Nina Patel", department: "Finance", hoursThisWeek: 40, projectedHours: 40, otHoursThisWeek: 0, projectedOtHours: 0, otCost: 0, riskLevel: "safe" },
  { id: "emp-10", name: "Tom Rivera", department: "Support", hoursThisWeek: 28, projectedHours: 35, otHoursThisWeek: 0, projectedOtHours: 0, otCost: 0, riskLevel: "safe" },
];

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
