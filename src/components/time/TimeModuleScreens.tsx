"use client";

import React, { useEffect, useMemo, useState, type ElementType } from "react";
import Link from "next/link";
import {
  DndContext,
  type DragEndEvent,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Coffee,
  Copy,
  Download,
  Edit3,
  FileCheck,
  FileSpreadsheet,
  Gauge,
  GripVertical,
  Loader2,
  Mail,
  MapPin,
  MapPinned,
  Minus,
  Plus,
  Save,
  Search,
  Send,
  Settings,
  Shield,
  SlidersHorizontal,
  Smartphone,
  Timer,
  Users,
  Wifi,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockEmployeeClock, mockPtoRequests, mockShifts, mockTimesheets } from "@/data/mockTime";
import { getEmployeeProjectAllocations, projectSetups } from "@/data/mockProjectAllocation";
import {
  employees as hrisEmployees,
  getEmployeeName,
  type EmployeeRecord,
} from "@/lib/hris-module-data";
import { useSocketStore } from "@/store/useSocketStore";

type TimeEmployee = {
  id: string;
  name: string;
  department: string;
  title: string;
  location: string;
  hourlyRate: number;
};

type TimesheetCell = {
  date: string;
  day: string;
  hours: number;
  clockIn: string | null;
  clockOut: string | null;
  breakMinutes: number;
  projectCode: string;
  taskCode: string;
  notes: string;
};

type TimesheetRow = {
  employeeId: string;
  employeeName: string;
  department: string;
  status: "Draft" | "Submitted" | "Approved" | "Rejected";
  submittedAt: string | null;
  days: TimesheetCell[];
};

type PendingApproval = {
  id: string;
  employeeId: string;
  employee: string;
  date: string;
  hours: number;
  type: string;
  submitted: string;
  status: "Pending" | "Approved" | "Denied";
};

type PtoPolicy = {
  id: string;
  leaveType: string;
  accrualMethod: "Flat" | "Accrual";
  accrual: string;
  cap: string;
  carryover: string;
  appliesTo: string;
};

type PtoBalance = {
  employeeId: string;
  employee: string;
  department: string;
  vacation: number;
  sick: number;
  personal: number;
  usedYtd: number;
};

type PtoRequestRow = {
  id: string;
  employee: string;
  employeeId: string;
  department: string;
  leaveType: string;
  dates: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: "Pending" | "Approved" | "Denied";
  note: string;
};

type ScheduleShift = {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  day: string;
  date: string;
  startTime: string;
  endTime: string;
  role: string;
  location: string;
};

type TimeSettingsState = {
  workweekStart: string;
  overtimeThreshold: "40 hrs/week" | "8 hrs/day";
  roundingRule: "None" | "Nearest 5 min" | "Nearest 15 min";
  autoBreakDeduction: boolean;
  geofencing: boolean;
  ipRestriction: boolean;
  locations: Array<{ id: string; name: string; address: string; radius: number }>;
  ipWhitelist: string[];
};

const weekDays = [
  { day: "Mon", date: "2026-05-25", label: "May 25" },
  { day: "Tue", date: "2026-05-26", label: "May 26" },
  { day: "Wed", date: "2026-05-27", label: "May 27" },
  { day: "Thu", date: "2026-05-28", label: "May 28" },
  { day: "Fri", date: "2026-05-29", label: "May 29" },
  { day: "Sat", date: "2026-05-30", label: "May 30" },
  { day: "Sun", date: "2026-05-31", label: "May 31" },
] as const;

const dayHourMatrix = [
  [8.1, 8.0, 8.5, 8.2, 7.5, 0, 0],
  [7.8, 8.0, 8.0, 8.6, 8.4, 4.2, 0],
  [8.0, 8.0, 8.0, 8.0, 8.0, 0, 0],
  [9.0, 8.5, 8.7, 9.1, 8.2, 3.5, 0],
  [6.5, 7.5, 8.0, 7.8, 8.0, 0, 0],
  [8.0, 8.0, 8.4, 8.6, 8.3, 0, 0],
  [8.5, 8.2, 8.3, 8.7, 8.4, 2.0, 0],
  [9.0, 9.0, 8.8, 9.2, 8.7, 4.0, 0],
];

const departmentColors: Record<string, string> = {
  Executive: "border-violet-300 bg-violet-50 text-violet-800 dark:border-violet-400/30 dark:bg-violet-500/10 dark:text-violet-200",
  Engineering: "border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-400/30 dark:bg-blue-500/10 dark:text-blue-200",
  Operations: "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-200",
  Sales: "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-200",
  Marketing: "border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-400/30 dark:bg-rose-500/10 dark:text-rose-200",
  Finance: "border-cyan-300 bg-cyan-50 text-cyan-800 dark:border-cyan-400/30 dark:bg-cyan-500/10 dark:text-cyan-200",
  People: "border-fuchsia-300 bg-fuchsia-50 text-fuchsia-800 dark:border-fuchsia-400/30 dark:bg-fuchsia-500/10 dark:text-fuchsia-200",
  Support: "border-lime-300 bg-lime-50 text-lime-800 dark:border-lime-400/30 dark:bg-lime-500/10 dark:text-lime-200",
};

const ptoDepartmentColors: Record<string, string> = {
  Executive: "bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-200",
  Engineering: "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-200",
  Operations: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200",
  Sales: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200",
  Marketing: "bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-200",
  Finance: "bg-cyan-100 text-cyan-800 dark:bg-cyan-500/15 dark:text-cyan-200",
  People: "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-500/15 dark:text-fuchsia-200",
};

const ptoPolicies: PtoPolicy[] = [
  {
    id: "policy-vacation",
    leaveType: "Vacation",
    accrualMethod: "Accrual",
    accrual: "1.67 days per month",
    cap: "20 days",
    carryover: "5 days carry over, expires Mar 31",
    appliesTo: "All full-time employees",
  },
  {
    id: "policy-sick",
    leaveType: "Sick",
    accrualMethod: "Accrual",
    accrual: "1 hour per 30 hours worked",
    cap: "12 days",
    carryover: "Unlimited carryover up to cap",
    appliesTo: "All employees",
  },
  {
    id: "policy-personal",
    leaveType: "Personal",
    accrualMethod: "Flat",
    accrual: "3 days granted annually",
    cap: "3 days",
    carryover: "No carryover",
    appliesTo: "All employees",
  },
  {
    id: "policy-parental",
    leaveType: "Parental",
    accrualMethod: "Flat",
    accrual: "12 weeks after eligibility",
    cap: "12 weeks",
    carryover: "Event based, no carryover",
    appliesTo: "Employees after 6 months",
  },
  {
    id: "policy-bereavement",
    leaveType: "Bereavement",
    accrualMethod: "Flat",
    accrual: "5 days per event",
    cap: "5 days per event",
    carryover: "Event based, no carryover",
    appliesTo: "All employees",
  },
];

const defaultSettings: TimeSettingsState = {
  workweekStart: "Monday",
  overtimeThreshold: "40 hrs/week",
  roundingRule: "Nearest 15 min",
  autoBreakDeduction: true,
  geofencing: true,
  ipRestriction: true,
  locations: [
    { id: "loc-1", name: "San Francisco HQ", address: "221 Mission St, San Francisco, CA", radius: 150 },
    { id: "loc-2", name: "Denver Operations", address: "1801 Wewatta St, Denver, CO", radius: 250 },
  ],
  ipWhitelist: ["73.222.14.88", "104.18.22.16"],
};

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function hours(value: number) {
  return `${Number(value.toFixed(1))}h`;
}

function timeToMinutes(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

function minutesToTime(minutes: number) {
  const bounded = Math.max(0, Math.min(23 * 60 + 59, minutes));
  const hour = Math.floor(bounded / 60);
  const minute = bounded % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function shiftHours(shift: Pick<ScheduleShift, "startTime" | "endTime">) {
  return Math.max(0, (timeToMinutes(shift.endTime) - timeToMinutes(shift.startTime)) / 60);
}

function employeeFromRecord(employee: EmployeeRecord, index: number): TimeEmployee {
  return {
    id: employee.id,
    name: getEmployeeName(employee),
    department: employee.department,
    title: employee.title,
    location: employee.locationType === "Remote" ? "Remote" : employee.location,
    hourlyRate: employee.hourlyRate || Math.round(employee.salary / 2080) || 45 + index * 2,
  };
}

const timeEmployees = hrisEmployees.slice(0, 8).map(employeeFromRecord);
const departments = Array.from(new Set(timeEmployees.map((employee) => employee.department)));

function buildTimesheetRows(): TimesheetRow[] {
  return timeEmployees.map((employee, employeeIndex) => {
    const sourceTimesheet = mockTimesheets.find((timesheet) => timesheet.employeeId === employee.id);
    return {
      employeeId: employee.id,
      employeeName: employee.name,
      department: employee.department,
      status: sourceTimesheet?.status || (employeeIndex % 3 === 0 ? "Submitted" : "Draft"),
      submittedAt: sourceTimesheet?.submittedAt || (employeeIndex % 3 === 0 ? "2026-05-29T13:20:00Z" : null),
      days: weekDays.map((day, dayIndex) => {
        const project = projectSetups[(employeeIndex + dayIndex) % projectSetups.length];
        const value = dayHourMatrix[employeeIndex % dayHourMatrix.length][dayIndex] || 0;
        return {
          date: day.date,
          day: day.day,
          hours: value,
          clockIn: value > 0 ? (employeeIndex % 2 === 0 ? "08:00" : "08:30") : null,
          clockOut: value > 0 ? minutesToTime(timeToMinutes(employeeIndex % 2 === 0 ? "08:00" : "08:30") + Math.round(value * 60) + 30) : null,
          breakMinutes: value > 6 ? 30 : 0,
          projectCode: project.code,
          taskCode: dayIndex % 2 === 0 ? "Client delivery" : "Operations",
          notes: value > 0 ? `${project.name} - ${day.day} work log` : "No time logged",
        };
      }),
    };
  });
}

function buildPendingApprovals(rows = buildTimesheetRows()): PendingApproval[] {
  return rows
    .filter((row) => row.status === "Submitted")
    .flatMap((row, rowIndex) =>
      row.days
        .filter((day) => day.hours > 0)
        .slice(0, 2)
        .map((day, dayIndex) => ({
          id: `approval-${row.employeeId}-${day.date}`,
          employeeId: row.employeeId,
          employee: row.employeeName,
          date: day.date,
          hours: day.hours,
          type: day.hours > 8 ? "Overtime" : "Timesheet",
          submitted: row.submittedAt || `2026-05-29T1${rowIndex + dayIndex}:00:00Z`,
          status: "Pending" as const,
        })),
    )
    .slice(0, 8);
}

function buildPtoBalances(): PtoBalance[] {
  return timeEmployees.map((employee, index) => ({
    employeeId: employee.id,
    employee: employee.name,
    department: employee.department,
    vacation: Math.max(12, 96 - index * 6),
    sick: Math.max(16, 64 - index * 3),
    personal: Math.max(4, 24 - index * 2),
    usedYtd: 24 + index * 5,
  }));
}

function buildPtoRequests(): PtoRequestRow[] {
  const seeded = mockPtoRequests.map((request, index) => {
    const employee = timeEmployees.find((item) => item.id === request.employeeId) || timeEmployees[index % timeEmployees.length];
    return {
      id: request.id,
      employeeId: request.employeeId,
      employee: request.employeeName,
      department: employee.department,
      leaveType: request.type === "FMLA" ? "Parental" : request.type,
      dates: `${request.startDate} to ${request.endDate}`,
      startDate: request.startDate,
      endDate: request.endDate,
      days: request.totalDays,
      reason: request.note,
      status: request.status,
      note: request.approverNote,
    };
  });

  return [
    ...seeded,
    {
      id: "pto-parental-1",
      employeeId: timeEmployees[2].id,
      employee: timeEmployees[2].name,
      department: timeEmployees[2].department,
      leaveType: "Parental",
      dates: "2026-06-22 to 2026-07-17",
      startDate: "2026-06-22",
      endDate: "2026-07-17",
      days: 20,
      reason: "Parental bonding leave",
      status: "Pending",
      note: "",
    },
    {
      id: "pto-vacation-coverage",
      employeeId: timeEmployees[4].id,
      employee: timeEmployees[4].name,
      department: timeEmployees[4].department,
      leaveType: "Vacation",
      dates: "2026-06-16 to 2026-06-19",
      startDate: "2026-06-16",
      endDate: "2026-06-19",
      days: 4,
      reason: "Summer travel",
      status: "Approved",
      note: "Approved with coverage from Sales",
    },
  ];
}

function buildScheduleShifts(): ScheduleShift[] {
  const source = mockShifts.slice(0, 24).map((shift) => {
    const employee = timeEmployees.find((item) => item.id === shift.employeeId) || timeEmployees[0];
    return {
      id: shift.id,
      employeeId: shift.employeeId,
      employeeName: shift.employeeName,
      department: employee.department,
      day: shift.day,
      date: shift.date,
      startTime: shift.startTime,
      endTime: shift.endTime,
      role: shift.role,
      location: shift.location,
    };
  });

  return [
    ...source,
    {
      id: "sh-extra-sat",
      employeeId: timeEmployees[1].id,
      employeeName: timeEmployees[1].name,
      department: timeEmployees[1].department,
      day: "Sat",
      date: "2026-05-30",
      startTime: "09:00",
      endTime: "15:00",
      role: "Support Lead",
      location: "Remote",
    },
    {
      id: "sh-extra-sun",
      employeeId: timeEmployees[3].id,
      employeeName: timeEmployees[3].name,
      department: timeEmployees[3].department,
      day: "Sun",
      date: "2026-05-31",
      startTime: "10:00",
      endTime: "16:00",
      role: "Operations Lead",
      location: "Denver Operations",
    },
  ];
}

function buildOverviewData() {
  const rows = buildTimesheetRows();
  const pendingApprovals = buildPendingApprovals(rows);
  const overtimeThisWeek = rows.reduce((sum, row) => {
    const total = row.days.reduce((daySum, day) => daySum + day.hours, 0);
    return sum + Math.max(0, total - 40);
  }, 0);
  const weekTotalHours = rows.reduce((sum, row) => sum + row.days.reduce((daySum, day) => daySum + day.hours, 0), 0);
  const clockEmployees = mockEmployeeClock.slice(0, 8).map((employee, index) => ({
    ...employee,
    employeeId: String(employee.employeeId),
    id: String(employee.id),
    name: employee.name || timeEmployees[index]?.name || "Employee",
    department: employee.department || timeEmployees[index]?.department || "Operations",
    role: employee.role || timeEmployees[index]?.title || "Team member",
    location: employee.location || timeEmployees[index]?.location || "Remote",
  }));

  return {
    stats: {
      clockedInNow: clockEmployees.filter((employee) => employee.status === "clocked-in" || employee.status === "on-break").length,
      hoursThisWeek: weekTotalHours,
      overtimeThisWeek,
      pendingApprovals: pendingApprovals.length,
    },
    employees: clockEmployees,
    pendingApprovals,
  };
}

async function resolveTimeData<T>(builder: () => T) {
  return builder();
}

function useNow(refreshMs = 30000) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), refreshMs);
    return () => window.clearInterval(interval);
  }, [refreshMs]);

  return now;
}

function runningHours(clockIn: string | null, now: Date, fallback: number) {
  if (!clockIn) return fallback;
  const [hour, minute] = clockIn.split(":").map(Number);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return fallback;
  const start = new Date(now);
  start.setHours(hour, minute, 0, 0);
  const diff = Math.max(0, now.getTime() - start.getTime());
  return Math.max(fallback, diff / 3600000);
}

function downloadCsv(filename: string, rows: Array<Array<string | number>>) {
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function PageHeader({
  title,
  description,
  icon: Icon,
  backHref,
  backLabel = "Back to Time",
  actions,
}: {
  title: string;
  description: string;
  icon: ElementType;
  backHref?: string;
  backLabel?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        {backHref && (
          <Link
            href={backHref}
            className="mb-2 flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-300"
          >
            <ArrowLeft size={12} />
            {backLabel}
          </Link>
        )}
        <h1 className="flex items-center gap-3 text-2xl font-extrabold text-slate-950 dark:text-white">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
            <Icon size={22} />
          </span>
          {title}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 sm:ml-[52px]">{description}</p>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 sm:justify-end">{actions}</div>}
    </div>
  );
}

function MetricCard({
  label,
  value,
  sub,
  icon: Icon,
  tone = "slate",
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: ElementType;
  tone?: "slate" | "emerald" | "amber" | "red" | "blue" | "indigo";
}) {
  const toneClasses = {
    slate: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
    amber: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
    red: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300",
    blue: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
    indigo: "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300",
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</span>
        <span className={cx("flex h-9 w-9 items-center justify-center rounded-lg", toneClasses[tone])}>
          <Icon size={17} />
        </span>
      </div>
      <div className="mt-3 text-2xl font-black text-slate-950 dark:text-white">{value}</div>
      {sub && <div className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">{sub}</div>}
    </div>
  );
}

function LoadingState({ title }: { title: string }) {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      <p className="text-sm font-semibold">{title}</p>
    </div>
  );
}

type OverviewData = ReturnType<typeof buildOverviewData>;

export function TimeOverviewScreen() {
  const queryClient = useQueryClient();
  const now = useNow(15000);
  const { on, off } = useSocketStore();
  const { data, isLoading } = useQuery({
    queryKey: ["time", "overview"],
    queryFn: () => resolveTimeData(buildOverviewData),
    staleTime: 30000,
  });
  const [approvals, setApprovals] = useState<PendingApproval[]>([]);

  useEffect(() => {
    if (data?.pendingApprovals) setApprovals(data.pendingApprovals);
  }, [data?.pendingApprovals]);

  useEffect(() => {
    const handleClockIn = (payload: { employeeId?: string | number; timestamp?: string }) => {
      queryClient.setQueryData<OverviewData>(["time", "overview"], (current) => {
        const next = current || buildOverviewData();
        const employeeId = String(payload.employeeId || "");
        const timestamp = payload.timestamp ? new Date(payload.timestamp) : new Date();
        const clockIn = timestamp.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
        const employees = next.employees.map((employee) =>
          String(employee.employeeId) === employeeId || String(employee.id) === employeeId
            ? { ...employee, status: "clocked-in" as const, clockIn, clockOut: null, hoursToday: 0, missedPunch: false }
            : employee,
        );
        return {
          ...next,
          employees,
          stats: {
            ...next.stats,
            clockedInNow: employees.filter((employee) => employee.status === "clocked-in" || employee.status === "on-break").length,
          },
        };
      });
    };

    const handleClockOut = (payload: { employeeId?: string | number; timestamp?: string; hoursWorked?: number }) => {
      queryClient.setQueryData<OverviewData>(["time", "overview"], (current) => {
        const next = current || buildOverviewData();
        const employeeId = String(payload.employeeId || "");
        const timestamp = payload.timestamp ? new Date(payload.timestamp) : new Date();
        const clockOut = timestamp.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
        const employees = next.employees.map((employee) =>
          String(employee.employeeId) === employeeId || String(employee.id) === employeeId
            ? {
                ...employee,
                status: "clocked-out" as const,
                clockOut,
                hoursToday: payload.hoursWorked ?? employee.hoursToday,
              }
            : employee,
        );
        return {
          ...next,
          employees,
          stats: {
            ...next.stats,
            clockedInNow: employees.filter((employee) => employee.status === "clocked-in" || employee.status === "on-break").length,
          },
        };
      });
    };

    on("time.clockin", handleClockIn);
    on("time.clockout", handleClockOut);
    on("employee.clocked_in", handleClockIn);
    on("employee.clocked_out", handleClockOut);

    return () => {
      off("time.clockin", handleClockIn);
      off("time.clockout", handleClockOut);
      off("employee.clocked_in", handleClockIn);
      off("employee.clocked_out", handleClockOut);
    };
  }, [off, on, queryClient]);

  if (isLoading || !data) return <LoadingState title="Loading time overview" />;

  const handleApproval = (id: string, status: PendingApproval["status"]) => {
    setApprovals((current) => current.map((approval) => (approval.id === id ? { ...approval, status } : approval)));
    toast.success(`Timesheet ${status.toLowerCase()}`);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <PageHeader
        title="Time Overview"
        description="Live attendance, approvals, weekly hours, and overtime signals for May 25 - May 31, 2026."
        icon={Clock}
        actions={
          <>
            <Link href="/time/timesheets">
              <Button variant="outline" className="gap-2">
                <FileCheck size={16} />
                Timesheets
              </Button>
            </Link>
            <Link href="/time/schedule">
              <Button className="gap-2">
                <CalendarClock size={16} />
                Schedule
              </Button>
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Clocked In Now" value={data.stats.clockedInNow} sub="Includes active breaks" icon={Users} tone="emerald" />
        <MetricCard label="Hours This Week" value={hours(data.stats.hoursThisWeek)} sub="Company total" icon={Timer} tone="blue" />
        <MetricCard label="Overtime This Week" value={hours(data.stats.overtimeThisWeek)} sub="Above 40 hours" icon={AlertTriangle} tone="amber" />
        <MetricCard label="Pending Approvals" value={approvals.filter((approval) => approval.status === "Pending").length} sub="Manager action needed" icon={FileCheck} tone="indigo" />
      </div>

      <div className="flex flex-col gap-6">
        <section className="rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-2 border-b border-slate-200 p-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-950 dark:text-white">Live Who Is Clocked In</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Realtime updates listen for time.clockin and time.clockout events.</p>
            </div>
            <Badge variant="secondary">Updated {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</Badge>
          </div>
          <div className="grid grid-cols-1 gap-3 p-5 md:grid-cols-2 xl:grid-cols-4">
            {data.employees.map((employee) => {
              const active = employee.status === "clocked-in" || employee.status === "on-break";
              const activeHours = active ? runningHours(employee.clockIn, now, employee.hoursToday) : employee.hoursToday;
              return (
                <article
                  key={employee.id}
                  className={cx(
                    "rounded-lg border p-4 transition-colors",
                    active
                      ? "border-emerald-400 bg-emerald-50/60 dark:border-emerald-400/50 dark:bg-emerald-500/10"
                      : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-slate-950 dark:text-white">{employee.name}</h3>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        {employee.department} / {employee.location}
                      </p>
                    </div>
                    <span
                      className={cx(
                        "rounded-full px-2.5 py-1 text-xs font-bold",
                        active
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
                      )}
                    >
                      {active ? "In" : "Out"}
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="font-bold uppercase tracking-wide text-slate-400">Clock In</p>
                      <p className="mt-1 font-black text-slate-800 dark:text-slate-100">{employee.clockIn || "-"}</p>
                    </div>
                    <div>
                      <p className="font-bold uppercase tracking-wide text-slate-400">Running</p>
                      <p className={cx("mt-1 font-black", active ? "text-emerald-700 dark:text-emerald-300" : "text-slate-800 dark:text-slate-100")}>
                        {hours(activeHours)}
                      </p>
                    </div>
                    <div>
                      <p className="font-bold uppercase tracking-wide text-slate-400">Week</p>
                      <p className={cx("mt-1 font-black", employee.hoursThisWeek >= 40 ? "text-red-600" : employee.hoursThisWeek >= 36 ? "text-amber-600" : "text-slate-800 dark:text-slate-100")}>
                        {hours(employee.hoursThisWeek)}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200 p-5 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-950 dark:text-white">Pending Approvals</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Approve or deny submitted time entries.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-950/40">
                <tr>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Hours</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Submitted</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {approvals.map((approval) => (
                  <tr key={approval.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-bold text-slate-950 dark:text-white">{approval.employee}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{approval.date}</td>
                    <td className="px-4 py-3 text-right font-black text-slate-950 dark:text-white">{hours(approval.hours)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={approval.type === "Overtime" ? "default" : "secondary"}>{approval.type}</Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{new Date(approval.submitted).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      {approval.status === "Pending" ? (
                        <div className="flex justify-end gap-1">
                          <Button size="sm" className="gap-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => handleApproval(approval.id, "Approved")}>
                            <CheckCircle2 size={14} />
                            Approve
                          </Button>
                          <Button size="sm" variant="danger" className="gap-1" onClick={() => handleApproval(approval.id, "Denied")}>
                            <XCircle size={14} />
                            Deny
                          </Button>
                        </div>
                      ) : (
                        <div className="text-right">
                          <Badge variant={approval.status === "Approved" ? "default" : "secondary"}>{approval.status}</Badge>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

export function TimesheetsScreen() {
  const { data, isLoading } = useQuery({
    queryKey: ["time", "timesheets", "week", "2026-05-25"],
    queryFn: () => resolveTimeData(buildTimesheetRows),
  });
  const [rows, setRows] = useState<TimesheetRow[]>([]);
  const [department, setDepartment] = useState("All");
  const [employee, setEmployee] = useState("All");
  const [selectedCell, setSelectedCell] = useState<{ employeeId: string; date: string } | null>(null);

  useEffect(() => {
    if (data) setRows(data);
  }, [data]);

  const submitAll = useMutation({
    mutationFn: async () => ({ ok: true }),
    onSuccess: () => {
      setRows((current) =>
        current.map((row) => ({
          ...row,
          status: "Submitted",
          submittedAt: "2026-05-29T16:00:00Z",
        })),
      );
      toast.success("All weekly timesheets submitted for approval");
    },
  });

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (department !== "All" && row.department !== department) return false;
      if (employee !== "All" && row.employeeId !== employee) return false;
      return true;
    });
  }, [department, employee, rows]);

  const dailyTotals = weekDays.map((day) =>
    filteredRows.reduce((sum, row) => sum + (row.days.find((cell) => cell.date === day.date)?.hours || 0), 0),
  );
  const selectedRow = selectedCell ? rows.find((row) => row.employeeId === selectedCell.employeeId) : null;
  const selectedDay = selectedRow?.days.find((day) => day.date === selectedCell?.date);

  const updateCellHours = (employeeId: string, date: string, value: number) => {
    setRows((current) =>
      current.map((row) =>
        row.employeeId === employeeId
          ? {
              ...row,
              status: row.status === "Approved" ? row.status : "Draft",
              days: row.days.map((day) => (day.date === date ? { ...day, hours: Number.isNaN(value) ? 0 : value } : day)),
            }
          : row,
      ),
    );
  };

  const updateSelectedDay = (changes: Partial<TimesheetCell>) => {
    if (!selectedCell) return;
    setRows((current) =>
      current.map((row) =>
        row.employeeId === selectedCell.employeeId
          ? {
              ...row,
              days: row.days.map((day) => (day.date === selectedCell.date ? { ...day, ...changes } : day)),
            }
          : row,
      ),
    );
  };

  if (isLoading) return <LoadingState title="Loading weekly timesheets" />;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <PageHeader
        title="Timesheet Management"
        description="Week view for May 25 - May 31, 2026 with editable admin hours, project details, and overtime flags."
        icon={FileSpreadsheet}
        backHref="/time"
        actions={
          <Button className="gap-2" onClick={() => submitAll.mutate()} disabled={submitAll.isPending}>
            {submitAll.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send size={16} />}
            Submit All
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:grid-cols-[1fr_1fr_auto_auto]">
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Department</label>
          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger>
              <SelectValue placeholder="All departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All departments</SelectItem>
              {departments.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Employee</label>
          <Select value={employee} onValueChange={setEmployee}>
            <SelectTrigger>
              <span>{employee === "All" ? "All employees" : rows.find((row) => row.employeeId === employee)?.employeeName || "All employees"}</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All employees</SelectItem>
              {rows
                .filter((row) => department === "All" || row.department === department)
                .map((row) => (
                  <SelectItem key={row.employeeId} value={row.employeeId}>
                    {row.employeeName}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Week</label>
          <div className="flex h-11 items-center rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <button className="px-3 text-slate-500 hover:text-indigo-600" aria-label="Previous week">
              <ChevronLeft size={18} />
            </button>
            <Input type="date" defaultValue="2026-05-25" className="h-9 min-w-[150px] border-0 px-2 focus-visible:ring-0" />
            <button className="px-3 text-slate-500 hover:text-indigo-600" aria-label="Next week">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
        <div className="flex items-end">
          <Button variant="outline" className="w-full gap-2" onClick={() => toast.info("Filters refreshed")}>
            <SlidersHorizontal size={16} />
            Apply
          </Button>
        </div>
      </div>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-950/40">
              <tr>
                <th className="sticky left-0 z-10 w-56 bg-slate-50 px-4 py-3 dark:bg-slate-950">Employee</th>
                {weekDays.map((day) => (
                  <th key={day.date} className="px-3 py-3 text-center">
                    <div>{day.day}</div>
                    <div className="mt-0.5 text-[10px] normal-case tracking-normal text-slate-400">{day.label}</div>
                  </th>
                ))}
                <th className="px-4 py-3 text-right">Weekly Total</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredRows.map((row) => {
                const weeklyTotal = row.days.reduce((sum, day) => sum + day.hours, 0);
                return (
                  <tr key={row.employeeId} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="sticky left-0 z-10 bg-white px-4 py-3 dark:bg-slate-900">
                      <Link href={`/time/timesheets/${row.employeeId}`} className="font-bold text-slate-950 hover:text-indigo-600 dark:text-white">
                        {row.employeeName}
                      </Link>
                      <div className="text-xs text-slate-500">{row.department}</div>
                    </td>
                    {row.days.map((day) => (
                      <td key={day.date} className="px-2 py-2">
                        <button
                          type="button"
                          onClick={() => setSelectedCell({ employeeId: row.employeeId, date: day.date })}
                          className={cx(
                            "flex h-16 w-full flex-col items-center justify-center rounded-lg border p-1 text-center transition-colors",
                            day.hours > 8
                              ? "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-200"
                              : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-indigo-500/50 dark:hover:bg-indigo-500/10",
                          )}
                        >
                          <input
                            aria-label={`${row.employeeName} ${day.day} hours`}
                            type="number"
                            min="0"
                            step="0.25"
                            value={day.hours}
                            onClick={(event) => event.stopPropagation()}
                            onChange={(event) => updateCellHours(row.employeeId, day.date, Number(event.target.value))}
                            className="w-16 rounded-md border border-transparent bg-transparent text-center text-sm font-black text-inherit focus:border-indigo-300 focus:bg-white focus:outline-none dark:focus:bg-slate-900"
                          />
                          <span className="max-w-[92px] truncate text-[10px] font-semibold text-slate-500 dark:text-slate-400">{day.projectCode}</span>
                        </button>
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right">
                      <span className={cx("text-base font-black", weeklyTotal > 40 ? "text-amber-600" : "text-slate-950 dark:text-white")}>
                        {hours(weeklyTotal)}
                      </span>
                      {weeklyTotal > 40 && <div className="text-[10px] font-bold uppercase tracking-wide text-amber-600">Overtime</div>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={row.status === "Approved" ? "default" : row.status === "Submitted" ? "secondary" : "outline"}>{row.status}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="border-t-2 border-slate-200 bg-slate-50 font-black text-slate-950 dark:border-slate-700 dark:bg-slate-950/50 dark:text-white">
              <tr>
                <td className="sticky left-0 z-10 bg-slate-50 px-4 py-3 dark:bg-slate-950">Daily Totals</td>
                {dailyTotals.map((total, index) => (
                  <td key={weekDays[index].date} className="px-3 py-3 text-center">
                    <span className={total > filteredRows.length * 8 ? "text-amber-600" : ""}>{hours(total)}</span>
                  </td>
                ))}
                <td className="px-4 py-3 text-right">{hours(dailyTotals.reduce((sum, total) => sum + total, 0))}</td>
                <td className="px-4 py-3" />
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      <Dialog open={Boolean(selectedCell && selectedDay && selectedRow)} onOpenChange={(open) => !open && setSelectedCell(null)} contentClassName="max-w-xl">
        {selectedDay && selectedRow && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Time Entry Detail</DialogTitle>
              <DialogDescription>
                {selectedRow.employeeName} / {selectedDay.day} {selectedDay.date}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 p-6 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Project Code</label>
                <Input value={selectedDay.projectCode} onChange={(event) => updateSelectedDay({ projectCode: event.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Task Code</label>
                <Input value={selectedDay.taskCode} onChange={(event) => updateSelectedDay({ taskCode: event.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Clock In</label>
                <Input type="time" value={selectedDay.clockIn || ""} onChange={(event) => updateSelectedDay({ clockIn: event.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Clock Out</label>
                <Input type="time" value={selectedDay.clockOut || ""} onChange={(event) => updateSelectedDay({ clockOut: event.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Notes</label>
                <textarea
                  value={selectedDay.notes}
                  onChange={(event) => updateSelectedDay({ notes: event.target.value })}
                  className="min-h-24 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedCell(null)}>
                Cancel
              </Button>
              <Button className="gap-2" onClick={() => setSelectedCell(null)}>
                <Save size={16} />
                Save Entry
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}

export function IndividualTimesheetScreen({ employeeId }: { employeeId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["time", "timesheets", "week", "2026-05-25"],
    queryFn: () => resolveTimeData(buildTimesheetRows),
  });
  const [editDate, setEditDate] = useState<string | null>(null);
  const [editNote, setEditNote] = useState("");
  const sourceRow = data?.find((row) => row.employeeId === employeeId) || data?.[0];
  const [days, setDays] = useState<TimesheetCell[]>([]);

  useEffect(() => {
    if (sourceRow) setDays(sourceRow.days);
  }, [sourceRow]);

  if (isLoading || !sourceRow) return <LoadingState title="Loading employee timesheet" />;

  const totalHours = days.reduce((sum, day) => sum + day.hours, 0);
  const overtime = Math.max(0, totalHours - 40);
  const regular = Math.min(totalHours, 40);
  const totalBreak = days.reduce((sum, day) => sum + day.breakMinutes, 0);
  const employee = timeEmployees.find((item) => item.id === sourceRow.employeeId) || timeEmployees[0];
  const projectAllocations = getEmployeeProjectAllocations(sourceRow.employeeId, totalHours);

  const saveEdit = (date: string) => {
    setDays((current) =>
      current.map((day) =>
        day.date === date
          ? {
              ...day,
              notes: editNote || day.notes,
            }
          : day,
      ),
    );
    setEditDate(null);
    setEditNote("");
    toast.success("Timesheet entry updated");
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <PageHeader
        title={sourceRow.employeeName}
        description={`${sourceRow.department} / May 25 - May 31, 2026 individual timesheet`}
        icon={Clock}
        backHref="/time/timesheets"
        backLabel="Back to Timesheets"
        actions={
          <>
            <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
              <CheckCircle2 size={16} />
              Approve
            </Button>
            <Button variant="danger" className="gap-2">
              <XCircle size={16} />
              Deny
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Regular Hours" value={hours(regular)} icon={Clock} tone="blue" />
        <MetricCard label="Overtime" value={hours(overtime)} icon={AlertTriangle} tone={overtime > 0 ? "amber" : "slate"} />
        <MetricCard label="Total Hours" value={hours(totalHours)} icon={Timer} tone="indigo" />
        <MetricCard label="Break Time" value={`${totalBreak}m`} icon={Coffee} tone="emerald" />
        <MetricCard label="OT Cost" value={money(overtime * employee.hourlyRate * 1.5)} icon={Gauge} tone="red" />
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-950 dark:text-white">Project and Task Allocation</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Project codes flow through payroll and agency billing.</p>
          </div>
          <Badge variant={sourceRow.status === "Approved" ? "default" : "secondary"}>{sourceRow.status}</Badge>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {projectAllocations.map((project) => (
            <div key={project.projectId} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{project.code}</p>
              <p className="mt-1 text-lg font-black text-slate-950 dark:text-white">{hours(project.hours)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 p-5 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-950 dark:text-white">Day-by-Day Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-950/40">
              <tr>
                <th className="px-4 py-3">Day</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Clock In</th>
                <th className="px-4 py-3">Clock Out</th>
                <th className="px-4 py-3">Project / Task</th>
                <th className="px-4 py-3 text-right">Break</th>
                <th className="px-4 py-3 text-right">Hours</th>
                <th className="px-4 py-3 text-right">OT</th>
                <th className="px-4 py-3">Notes</th>
                <th className="px-4 py-3 text-right">Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {days.map((day) => {
                const dayOt = Math.max(0, day.hours - 8);
                return (
                  <React.Fragment key={day.date}>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-black text-slate-950 dark:text-white">{day.day}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{day.date}</td>
                      <td className="px-4 py-3">{day.clockIn || "-"}</td>
                      <td className="px-4 py-3">{day.clockOut || "-"}</td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900 dark:text-white">{day.projectCode}</div>
                        <div className="text-xs text-slate-500">{day.taskCode}</div>
                      </td>
                      <td className="px-4 py-3 text-right">{day.breakMinutes ? `${day.breakMinutes}m` : "-"}</td>
                      <td className="px-4 py-3 text-right font-black text-slate-950 dark:text-white">{day.hours ? hours(day.hours) : "-"}</td>
                      <td className="px-4 py-3 text-right font-black text-amber-600">{dayOt ? hours(dayOt) : "-"}</td>
                      <td className="max-w-[240px] truncate px-4 py-3 text-xs text-slate-500">{day.notes}</td>
                      <td className="px-4 py-3 text-right">
                        {day.hours > 0 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="gap-1"
                            onClick={() => {
                              setEditDate(editDate === day.date ? null : day.date);
                              setEditNote(day.notes);
                            }}
                          >
                            <Edit3 size={14} />
                            Edit
                          </Button>
                        )}
                      </td>
                    </tr>
                    {editDate === day.date && (
                      <tr>
                        <td colSpan={10} className="bg-slate-50 px-4 py-3 dark:bg-slate-950/40">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Reason / note</span>
                            <Input value={editNote} onChange={(event) => setEditNote(event.target.value)} className="flex-1" />
                            <Button size="sm" className="gap-1" onClick={() => saveEdit(day.date)}>
                              <Save size={14} />
                              Save
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditDate(null)}>
                              Cancel
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export function PtoManagementScreen() {
  const { data: balances = [] } = useQuery({
    queryKey: ["time", "pto", "balances"],
    queryFn: () => resolveTimeData(buildPtoBalances),
  });
  const { data: initialRequests = [] } = useQuery({
    queryKey: ["time", "pto", "requests"],
    queryFn: () => resolveTimeData(buildPtoRequests),
  });
  const [requests, setRequests] = useState<PtoRequestRow[]>([]);
  const [balanceDepartment, setBalanceDepartment] = useState("All");
  const [requestStatus, setRequestStatus] = useState("All");
  const [search, setSearch] = useState("");
  const [editPolicy, setEditPolicy] = useState<PtoPolicy | null>(null);
  const [approvalNotes, setApprovalNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialRequests.length) setRequests(initialRequests);
  }, [initialRequests]);

  const filteredBalances = balances.filter((balance) => balanceDepartment === "All" || balance.department === balanceDepartment);
  const filteredRequests = requests.filter((request) => {
    if (requestStatus !== "All" && request.status !== requestStatus) return false;
    if (search && !request.employee.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const calendarDays = Array.from({ length: 30 }, (_, index) => {
    const date = new Date(2026, 5, index + 1);
    const iso = date.toISOString().slice(0, 10);
    const dayRequests = requests.filter((request) => {
      if (request.status !== "Approved") return false;
      return iso >= request.startDate && iso <= request.endDate;
    });
    return {
      date,
      iso,
      day: date.getDate(),
      dayOfWeek: date.getDay(),
      requests: dayRequests,
      coverageGap: dayRequests.length >= 2,
    };
  });

  const updateRequest = (id: string, status: PtoRequestRow["status"]) => {
    setRequests((current) =>
      current.map((request) =>
        request.id === id
          ? {
              ...request,
              status,
              note: approvalNotes[id] || request.note,
            }
          : request,
      ),
    );
    toast.success(`PTO request ${status.toLowerCase()}`);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <PageHeader
        title="PTO Management"
        description="Policies, balances, approvals, and a team calendar for June 2026 coverage planning."
        icon={Coffee}
        backHref="/time"
        actions={
          <Button
            variant="outline"
            className="gap-2"
            onClick={() =>
              downloadCsv("pto-balances.csv", [
                ["Employee", "Department", "Vacation", "Sick", "Personal", "Used YTD"],
                ...filteredBalances.map((row) => [row.employee, row.department, row.vacation, row.sick, row.personal, row.usedYtd]),
              ])
            }
          >
            <Download size={16} />
            Export CSV
          </Button>
        }
      />

      <Tabs defaultValue="requests" className="flex flex-col gap-4">
        <TabsList className="w-full justify-start overflow-x-auto sm:w-fit">
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="balances">Balances</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="mt-0">
          <section className="rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-3 border-b border-slate-200 p-5 dark:border-slate-800 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-950 dark:text-white">PTO Requests</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Approve or deny incoming leave requests with optional manager notes.</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search employee" className="pl-9 sm:w-56" />
                </div>
                <Select value={requestStatus} onValueChange={setRequestStatus}>
                  <SelectTrigger className="sm:w-44">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    {["All", "Pending", "Approved", "Denied"].map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-950/40">
                  <tr>
                    <th className="px-4 py-3">Employee</th>
                    <th className="px-4 py-3">Leave Type</th>
                    <th className="px-4 py-3">Dates</th>
                    <th className="px-4 py-3 text-right">Days</th>
                    <th className="px-4 py-3">Reason</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Optional Note</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-950 dark:text-white">{request.employee}</div>
                        <div className="text-xs text-slate-500">{request.department}</div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={request.leaveType === "Parental" ? "default" : "secondary"}>{request.leaveType}</Badge>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-600 dark:text-slate-300">{request.dates}</td>
                      <td className="px-4 py-3 text-right font-black text-slate-950 dark:text-white">{request.days}</td>
                      <td className="max-w-[240px] truncate px-4 py-3 text-slate-500">{request.reason}</td>
                      <td className="px-4 py-3">
                        <Badge variant={request.status === "Approved" ? "default" : request.status === "Denied" ? "outline" : "secondary"}>{request.status}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          value={approvalNotes[request.id] ?? request.note}
                          onChange={(event) => setApprovalNotes((current) => ({ ...current, [request.id]: event.target.value }))}
                          placeholder="Manager note"
                          className="h-9 min-w-[180px]"
                        />
                      </td>
                      <td className="px-4 py-3">
                        {request.status === "Pending" ? (
                          <div className="flex justify-end gap-1">
                            <Button size="sm" className="gap-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => updateRequest(request.id, "Approved")}>
                              <CheckCircle2 size={14} />
                              Approve
                            </Button>
                            <Button size="sm" variant="danger" className="gap-1" onClick={() => updateRequest(request.id, "Denied")}>
                              <XCircle size={14} />
                              Deny
                            </Button>
                          </div>
                        ) : (
                          <p className="text-right text-xs font-bold text-slate-400">Reviewed</p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </TabsContent>

        <TabsContent value="policies" className="mt-0">
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {ptoPolicies.map((policy) => (
              <article key={policy.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Badge variant={policy.accrualMethod === "Accrual" ? "default" : "secondary"}>{policy.accrualMethod}</Badge>
                    <h2 className="mt-3 text-lg font-black text-slate-950 dark:text-white">{policy.leaveType}</h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{policy.appliesTo}</p>
                  </div>
                  <Button size="sm" variant="outline" className="gap-1" onClick={() => setEditPolicy(policy)}>
                    <Edit3 size={14} />
                    Edit
                  </Button>
                </div>
                <dl className="mt-5 grid gap-3 text-sm">
                  <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-950/50">
                    <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">Accrual</dt>
                    <dd className="mt-1 font-bold text-slate-900 dark:text-white">{policy.accrual}</dd>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-950/50">
                      <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">Cap</dt>
                      <dd className="mt-1 font-bold text-slate-900 dark:text-white">{policy.cap}</dd>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-950/50">
                      <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">Carryover</dt>
                      <dd className="mt-1 font-bold text-slate-900 dark:text-white">{policy.carryover}</dd>
                    </div>
                  </div>
                </dl>
              </article>
            ))}
          </section>
        </TabsContent>

        <TabsContent value="balances" className="mt-0">
          <section className="rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-3 border-b border-slate-200 p-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-950 dark:text-white">Employee Balances</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Vacation, sick, personal, and used year to date.</p>
              </div>
              <Select value={balanceDepartment} onValueChange={setBalanceDepartment}>
                <SelectTrigger className="sm:w-56">
                  <SelectValue placeholder="All departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All departments</SelectItem>
                  {departments.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-950/40">
                  <tr>
                    <th className="px-4 py-3">Employee</th>
                    <th className="px-4 py-3 text-right">Vacation</th>
                    <th className="px-4 py-3 text-right">Sick</th>
                    <th className="px-4 py-3 text-right">Personal</th>
                    <th className="px-4 py-3 text-right">Total Used YTD</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredBalances.map((balance) => (
                    <tr key={balance.employeeId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-950 dark:text-white">{balance.employee}</div>
                        <div className="text-xs text-slate-500">{balance.department}</div>
                      </td>
                      <td className="px-4 py-3 text-right font-black">{hours(balance.vacation)}</td>
                      <td className="px-4 py-3 text-right font-black">{hours(balance.sick)}</td>
                      <td className="px-4 py-3 text-right font-black">{hours(balance.personal)}</td>
                      <td className="px-4 py-3 text-right font-black text-slate-950 dark:text-white">{hours(balance.usedYtd)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </TabsContent>

        <TabsContent value="calendar" className="mt-0">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-950 dark:text-white">June 2026 PTO Calendar</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Approved PTO is color-coded by department. Red outline means a coverage gap.</p>
              </div>
              <Badge variant="secondary">{calendarDays.filter((day) => day.coverageGap).length} coverage gaps</Badge>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="py-2 text-center text-xs font-bold uppercase tracking-wide text-slate-500">
                  {day}
                </div>
              ))}
              {Array.from({ length: calendarDays[0].dayOfWeek }, (_, index) => (
                <div key={`empty-${index}`} className="min-h-28 rounded-lg border border-transparent" />
              ))}
              {calendarDays.map((day) => (
                <div
                  key={day.iso}
                  className={cx(
                    "min-h-28 rounded-lg border p-2",
                    day.coverageGap
                      ? "border-red-300 bg-red-50 dark:border-red-400/40 dark:bg-red-500/10"
                      : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-slate-950 dark:text-white">{day.day}</span>
                    {day.coverageGap && <AlertTriangle size={14} className="text-red-500" />}
                  </div>
                  <div className="mt-2 space-y-1">
                    {day.requests.slice(0, 3).map((request) => (
                      <div key={request.id} className={cx("truncate rounded-md px-2 py-1 text-[10px] font-bold", ptoDepartmentColors[request.department] || ptoDepartmentColors.Engineering)}>
                        {request.employee.split(" ")[0]} / {request.leaveType}
                      </div>
                    ))}
                    {day.requests.length > 3 && <div className="text-[10px] font-bold text-slate-500">+{day.requests.length - 3} more</div>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </TabsContent>
      </Tabs>

      <Dialog open={Boolean(editPolicy)} onOpenChange={(open) => !open && setEditPolicy(null)} contentClassName="max-w-lg">
        {editPolicy && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit PTO Policy</DialogTitle>
              <DialogDescription>{editPolicy.leaveType} policy details and carryover rules.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 p-6">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Accrual</label>
                <Input defaultValue={editPolicy.accrual} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Cap</label>
                <Input defaultValue={editPolicy.cap} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Carryover</label>
                <Input defaultValue={editPolicy.carryover} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditPolicy(null)}>
                Cancel
              </Button>
              <Button onClick={() => setEditPolicy(null)}>Save Policy</Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}

function DroppableScheduleCell({
  employee,
  day,
  children,
  onAdd,
}: {
  employee: TimeEmployee;
  day: (typeof weekDays)[number];
  children: React.ReactNode;
  onAdd: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `${employee.id}:${day.day}` });

  return (
    <td ref={setNodeRef} className="min-w-[160px] border-l border-slate-100 p-2 align-top dark:border-slate-800">
      <div
        className={cx(
          "flex min-h-24 flex-col gap-2 rounded-lg border border-dashed p-2 transition-colors",
          isOver
            ? "border-indigo-400 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-500/10"
            : "border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-950/40",
        )}
      >
        {children}
        <button
          type="button"
          onClick={onAdd}
          className="flex h-8 items-center justify-center rounded-md border border-dashed border-slate-300 text-slate-400 transition-colors hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-700"
          aria-label={`Add shift for ${employee.name} on ${day.day}`}
        >
          <Plus size={14} />
        </button>
      </div>
    </td>
  );
}

function DraggableShiftCard({
  shift,
  onResize,
}: {
  shift: ScheduleShift;
  onResize: (id: string, deltaMinutes: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: shift.id });
  const transformStyle = transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined;
  const color = departmentColors[shift.department] || departmentColors.Engineering;

  return (
    <div
      ref={setNodeRef}
      style={{ transform: transformStyle }}
      className={cx(
        "rounded-lg border p-2 text-left shadow-sm transition-shadow",
        color,
        isDragging && "relative z-30 shadow-xl ring-2 ring-indigo-400",
      )}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          className="mt-0.5 cursor-grab rounded p-0.5 text-current opacity-70 active:cursor-grabbing"
          aria-label="Drag shift"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={14} />
        </button>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-black">
            {shift.startTime}-{shift.endTime}
          </div>
          <div className="truncate text-[11px] font-bold">{shift.role}</div>
          <div className="mt-1 flex items-center gap-1 truncate text-[10px] font-semibold opacity-80">
            <MapPin size={10} />
            {shift.location}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => onResize(shift.id, 30)}
            className="rounded bg-white/70 p-1 text-current hover:bg-white dark:bg-slate-950/40"
            aria-label="Extend shift by 30 minutes"
          >
            <Plus size={11} />
          </button>
          <button
            type="button"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => onResize(shift.id, -30)}
            className="rounded bg-white/70 p-1 text-current hover:bg-white dark:bg-slate-950/40"
            aria-label="Shorten shift by 30 minutes"
          >
            <Minus size={11} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function ScheduleBuilderScreen() {
  const { data = [] } = useQuery({
    queryKey: ["time", "schedule", "2026-05-25"],
    queryFn: () => resolveTimeData(buildScheduleShifts),
  });
  const [shifts, setShifts] = useState<ScheduleShift[]>([]);
  const [publishedAt, setPublishedAt] = useState<string | null>(null);
  const [addShiftOpen, setAddShiftOpen] = useState(false);
  const [draftShift, setDraftShift] = useState({
    employeeId: timeEmployees[0].id,
    day: "Mon",
    startTime: "09:00",
    endTime: "17:00",
    role: "Team Member",
    location: "San Francisco HQ",
  });

  useEffect(() => {
    if (data.length) setShifts(data);
  }, [data]);

  const schedulerEmployees = timeEmployees.slice(0, 7);

  const openAddShift = (employeeId: string, day: string) => {
    const employee = schedulerEmployees.find((item) => item.id === employeeId) || schedulerEmployees[0];
    setDraftShift({
      employeeId,
      day,
      startTime: "09:00",
      endTime: "17:00",
      role: employee.title,
      location: employee.location,
    });
    setAddShiftOpen(true);
  };

  const addShift = () => {
    const employee = schedulerEmployees.find((item) => item.id === draftShift.employeeId) || schedulerEmployees[0];
    setShifts((current) => [
      ...current,
      {
        id: `shift-${Date.now()}`,
        employeeId: employee.id,
        employeeName: employee.name,
        department: employee.department,
        day: draftShift.day,
        date: weekDays.find((day) => day.day === draftShift.day)?.date || weekDays[0].date,
        startTime: draftShift.startTime,
        endTime: draftShift.endTime,
        role: draftShift.role,
        location: draftShift.location,
      },
    ]);
    setAddShiftOpen(false);
    toast.success("Shift added");
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const [employeeId, day] = String(over.id).split(":");
    const targetEmployee = schedulerEmployees.find((item) => item.id === employeeId);
    if (!targetEmployee) return;
    setShifts((current) =>
      current.map((shift) =>
        shift.id === active.id
          ? {
              ...shift,
              employeeId: targetEmployee.id,
              employeeName: targetEmployee.name,
              department: targetEmployee.department,
              day,
              date: weekDays.find((item) => item.day === day)?.date || shift.date,
              role: shift.role || targetEmployee.title,
              location: shift.location || targetEmployee.location,
            }
          : shift,
      ),
    );
  };

  const resizeShift = (id: string, deltaMinutes: number) => {
    setShifts((current) =>
      current.map((shift) => {
        if (shift.id !== id) return shift;
        const nextEnd = timeToMinutes(shift.endTime) + deltaMinutes;
        const minEnd = timeToMinutes(shift.startTime) + 60;
        return {
          ...shift,
          endTime: minutesToTime(Math.max(minEnd, nextEnd)),
        };
      }),
    );
  };

  const copyLastWeek = () => {
    setShifts(buildScheduleShifts().map((shift) => ({ ...shift, id: `${shift.id}-copy` })));
    toast.success("Last week copied into this schedule");
  };

  const publishSchedule = () => {
    setPublishedAt(new Date().toISOString());
    toast.success("Schedule published. SMS and email notifications queued.");
  };

  const coverageSlots = [
    { label: "06-10", start: 6 * 60, end: 10 * 60, needed: 2 },
    { label: "10-14", start: 10 * 60, end: 14 * 60, needed: 4 },
    { label: "14-18", start: 14 * 60, end: 18 * 60, needed: 4 },
    { label: "18-22", start: 18 * 60, end: 22 * 60, needed: 2 },
  ];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <PageHeader
        title="Schedule Builder"
        description="Drag shifts across the week, resize time ranges in 30-minute steps, and publish notifications."
        icon={CalendarDays}
        backHref="/time"
        actions={
          <>
            <Button variant="outline" className="gap-2" onClick={copyLastWeek}>
              <Copy size={16} />
              Copy Last Week
            </Button>
            <Button className="gap-2" onClick={publishSchedule}>
              <Send size={16} />
              Publish Schedule
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <MetricCard label="Scheduled Hours" value={hours(shifts.reduce((sum, shift) => sum + shiftHours(shift), 0))} icon={Timer} tone="indigo" />
        <MetricCard label="Assigned Shifts" value={shifts.length} icon={CalendarClock} tone="blue" />
        <MetricCard
          label="Notifications"
          value={publishedAt ? "Queued" : "Draft"}
          sub={publishedAt ? `Published ${new Date(publishedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "SMS and email on publish"}
          icon={Mail}
          tone={publishedAt ? "emerald" : "amber"}
        />
      </div>

      <DndContext onDragEnd={handleDragEnd}>
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-950/40">
                <tr>
                  <th className="sticky left-0 z-20 w-56 bg-slate-50 px-4 py-3 dark:bg-slate-950">Employee</th>
                  {weekDays.map((day) => (
                    <th key={day.date} className="min-w-[160px] px-3 py-3 text-center">
                      <div>{day.day}</div>
                      <div className="mt-0.5 text-[10px] normal-case tracking-normal text-slate-400">{day.label}</div>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {schedulerEmployees.map((employee) => {
                  const employeeShifts = shifts.filter((shift) => shift.employeeId === employee.id);
                  const total = employeeShifts.reduce((sum, shift) => sum + shiftHours(shift), 0);
                  return (
                    <tr key={employee.id}>
                      <td className="sticky left-0 z-10 bg-white px-4 py-3 align-top dark:bg-slate-900">
                        <div className="font-black text-slate-950 dark:text-white">{employee.name}</div>
                        <div className="text-xs text-slate-500">{employee.department}</div>
                        <div className="mt-2 text-[11px] font-bold text-slate-400">{employee.title}</div>
                      </td>
                      {weekDays.map((day) => (
                        <DroppableScheduleCell key={`${employee.id}-${day.day}`} employee={employee} day={day} onAdd={() => openAddShift(employee.id, day.day)}>
                          {employeeShifts
                            .filter((shift) => shift.day === day.day)
                            .map((shift) => (
                              <DraggableShiftCard key={shift.id} shift={shift} onResize={resizeShift} />
                            ))}
                        </DroppableScheduleCell>
                      ))}
                      <td className="px-4 py-3 text-right align-top">
                        <span className={cx("text-base font-black", total > 40 ? "text-red-600" : total > 35 ? "text-amber-600" : "text-slate-950 dark:text-white")}>
                          {hours(total)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </DndContext>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-950 dark:text-white">Coverage View</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Scheduled versus needed headcount by time slot.</p>
          </div>
          <Badge variant="secondary">Needed headcount</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800">
                <th className="px-3 py-2 text-left">Slot</th>
                {weekDays.map((day) => (
                  <th key={day.day} className="px-3 py-2 text-center">
                    {day.day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {coverageSlots.map((slot) => (
                <tr key={slot.label}>
                  <td className="px-3 py-3 font-black text-slate-950 dark:text-white">{slot.label}</td>
                  {weekDays.map((day) => {
                    const scheduled = shifts.filter((shift) => {
                      if (shift.day !== day.day) return false;
                      return timeToMinutes(shift.startTime) < slot.end && timeToMinutes(shift.endTime) > slot.start;
                    }).length;
                    const short = scheduled < slot.needed;
                    return (
                      <td key={`${slot.label}-${day.day}`} className="px-3 py-3 text-center">
                        <span
                          className={cx(
                            "inline-flex min-w-16 justify-center rounded-full px-2.5 py-1 text-xs font-black",
                            short
                              ? "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300"
                              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
                          )}
                        >
                          {scheduled}/{slot.needed}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Dialog open={addShiftOpen} onOpenChange={setAddShiftOpen} contentClassName="max-w-lg">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Shift</DialogTitle>
            <DialogDescription>Choose employee, day, time, role, and location.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 p-6 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Employee</label>
              <Select value={draftShift.employeeId} onValueChange={(value) => setDraftShift((current) => ({ ...current, employeeId: value }))}>
                <SelectTrigger>
                  <span>{schedulerEmployees.find((employee) => employee.id === draftShift.employeeId)?.name || "Employee"}</span>
                </SelectTrigger>
                <SelectContent>
                  {schedulerEmployees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Day</label>
              <Select value={draftShift.day} onValueChange={(value) => setDraftShift((current) => ({ ...current, day: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Day" />
                </SelectTrigger>
                <SelectContent>
                  {weekDays.map((day) => (
                    <SelectItem key={day.day} value={day.day}>
                      {day.day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Start Time</label>
              <Input type="time" value={draftShift.startTime} onChange={(event) => setDraftShift((current) => ({ ...current, startTime: event.target.value }))} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">End Time</label>
              <Input type="time" value={draftShift.endTime} onChange={(event) => setDraftShift((current) => ({ ...current, endTime: event.target.value }))} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Role</label>
              <Input value={draftShift.role} onChange={(event) => setDraftShift((current) => ({ ...current, role: event.target.value }))} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Location</label>
              <Input value={draftShift.location} onChange={(event) => setDraftShift((current) => ({ ...current, location: event.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddShiftOpen(false)}>
              Cancel
            </Button>
            <Button className="gap-2" onClick={addShift}>
              <Plus size={16} />
              Add Shift
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function OvertimeReportScreen() {
  const { data: rows = [] } = useQuery({
    queryKey: ["time", "overtime", "2026-05-25"],
    queryFn: () => resolveTimeData(buildTimesheetRows),
  });
  const [period, setPeriod] = useState("Current week");
  const [department, setDepartment] = useState("All");

  const reportRows = rows
    .filter((row) => department === "All" || row.department === department)
    .map((row) => {
      const employee = timeEmployees.find((item) => item.id === row.employeeId) || timeEmployees[0];
      const total = row.days.reduce((sum, day) => sum + day.hours, 0);
      const overtime = Math.max(0, total - 40);
      const regular = Math.min(total, 40);
      const otRate = employee.hourlyRate * 1.5;
      return {
        employee: row.employeeName,
        department: row.department,
        regular,
        overtime,
        current: total,
        otRate,
        otCost: overtime * otRate,
      };
    });

  const totalOt = reportRows.reduce((sum, row) => sum + row.overtime, 0);
  const totalCost = reportRows.reduce((sum, row) => sum + row.otCost, 0);
  const approaching = reportRows.filter((row) => row.current >= 36 && row.current < 40).length;
  const exceeded = reportRows.filter((row) => row.current >= 40).length;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <PageHeader
        title="Overtime Report"
        description="FLSA-aware weekly overtime report with cost impact and threshold flags."
        icon={Gauge}
        backHref="/time"
        actions={
          <Button
            variant="outline"
            className="gap-2"
            onClick={() =>
              downloadCsv("overtime-report.csv", [
                ["Employee", "Department", "Regular Hours", "Overtime Hours", "OT Rate", "OT Cost"],
                ...reportRows.map((row) => [row.employee, row.department, row.regular, row.overtime, row.otRate, row.otCost]),
              ])
            }
          >
            <Download size={16} />
            Export
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Overtime Hours" value={hours(totalOt)} icon={Timer} tone="amber" />
        <MetricCard label="OT Cost" value={money(totalCost)} icon={Gauge} tone="red" />
        <MetricCard label="Approaching 40h" value={approaching} icon={AlertTriangle} tone="amber" />
        <MetricCard label="At or Above 40h" value={exceeded} icon={Shield} tone="red" />
      </div>

      <div className="grid grid-cols-1 gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-[1fr_1fr_auto]">
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Period</label>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger>
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              {["Current week", "Previous week", "Current pay period", "Month to date"].map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Department</label>
          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger>
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All departments</SelectItem>
              {departments.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <Badge variant="secondary">{period}</Badge>
        </div>
      </div>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-950/40">
              <tr>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3 text-right">Regular Hours</th>
                <th className="px-4 py-3 text-right">Overtime Hours</th>
                <th className="px-4 py-3 text-right">OT Rate</th>
                <th className="px-4 py-3 text-right">OT Cost</th>
                <th className="px-4 py-3">FLSA Flag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {reportRows.map((row) => {
                const critical = row.current >= 40;
                const warning = row.current >= 36 && row.current < 40;
                return (
                  <tr key={row.employee} className={cx("hover:bg-slate-50 dark:hover:bg-slate-800/40", critical && "bg-red-50/60 dark:bg-red-500/5", warning && "bg-amber-50/60 dark:bg-amber-500/5")}>
                    <td className="px-4 py-3 font-bold text-slate-950 dark:text-white">{row.employee}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{row.department}</td>
                    <td className="px-4 py-3 text-right font-black">{hours(row.regular)}</td>
                    <td className="px-4 py-3 text-right font-black text-amber-600">{row.overtime ? hours(row.overtime) : "-"}</td>
                    <td className="px-4 py-3 text-right font-bold">{money(row.otRate)}/hr</td>
                    <td className="px-4 py-3 text-right font-black text-slate-950 dark:text-white">{row.otCost ? money(row.otCost) : "-"}</td>
                    <td className="px-4 py-3">
                      {critical ? (
                        <Badge variant="default" className="border-red-200 bg-red-100 text-red-700 dark:border-red-400/30 dark:bg-red-500/15 dark:text-red-300">
                          Overtime incurred
                        </Badge>
                      ) : warning ? (
                        <Badge variant="secondary" className="border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-400/30 dark:bg-amber-500/15 dark:text-amber-300">
                          Approaching 40h
                        </Badge>
                      ) : (
                        <Badge variant="outline">Compliant</Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export function TimeSettingsScreen() {
  const [settings, setSettings] = useState<TimeSettingsState>(defaultSettings);
  const [newLocation, setNewLocation] = useState({ name: "", address: "", radius: 150 });
  const [newIp, setNewIp] = useState("");

  const addLocation = () => {
    if (!newLocation.name.trim()) return;
    setSettings((current) => ({
      ...current,
      locations: [
        ...current.locations,
        {
          id: `loc-${Date.now()}`,
          name: newLocation.name,
          address: newLocation.address || "Address pending",
          radius: newLocation.radius,
        },
      ],
    }));
    setNewLocation({ name: "", address: "", radius: 150 });
  };

  const addIp = () => {
    if (!newIp.trim()) return;
    setSettings((current) => ({ ...current, ipWhitelist: [...current.ipWhitelist, newIp.trim()] }));
    setNewIp("");
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <PageHeader
        title="Time Settings"
        description="Company clock-in policy, overtime thresholds, rounding rules, geofencing, and IP restrictions."
        icon={Settings}
        backHref="/time"
        actions={
          <Button className="gap-2" onClick={() => toast.success("Time settings saved")}>
            <Save size={16} />
            Save Settings
          </Button>
        }
      />

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-5 flex items-center gap-3">
            <Clock className="h-5 w-5 text-indigo-600" />
            <div>
              <h2 className="font-bold text-slate-950 dark:text-white">Workweek and Overtime</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Rules used for timesheets and FLSA reporting.</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Workweek Start Day</label>
              <Select value={settings.workweekStart} onValueChange={(value) => setSettings((current) => ({ ...current, workweekStart: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Start day" />
                </SelectTrigger>
                <SelectContent>
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                    <SelectItem key={day} value={day}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Overtime Threshold</label>
              <Select
                value={settings.overtimeThreshold}
                onValueChange={(value) => setSettings((current) => ({ ...current, overtimeThreshold: value as TimeSettingsState["overtimeThreshold"] }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Threshold" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="40 hrs/week">40 hrs/week</SelectItem>
                  <SelectItem value="8 hrs/day">8 hrs/day</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Rounding Rules</label>
              <Select value={settings.roundingRule} onValueChange={(value) => setSettings((current) => ({ ...current, roundingRule: value as TimeSettingsState["roundingRule"] }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Rounding" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="None">None</SelectItem>
                  <SelectItem value="Nearest 5 min">Nearest 5 min</SelectItem>
                  <SelectItem value="Nearest 15 min">Nearest 15 min</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <label className="flex items-center justify-between rounded-lg border border-slate-200 p-3 dark:border-slate-800">
              <span>
                <span className="block text-sm font-bold text-slate-950 dark:text-white">Break Deduction</span>
                <span className="text-xs text-slate-500">Auto-deduct 30 min if shift is over 6 hours</span>
              </span>
              <input
                type="checkbox"
                checked={settings.autoBreakDeduction}
                onChange={(event) => setSettings((current) => ({ ...current, autoBreakDeduction: event.target.checked }))}
                className="h-5 w-5 rounded border-slate-300 text-indigo-600"
              />
            </label>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <MapPinned className="h-5 w-5 text-indigo-600" />
              <div>
                <h2 className="font-bold text-slate-950 dark:text-white">Geofencing</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Restrict clock-in to approved locations.</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.geofencing}
              onChange={(event) => setSettings((current) => ({ ...current, geofencing: event.target.checked }))}
              className="h-5 w-5 rounded border-slate-300 text-indigo-600"
            />
          </div>
          <div className="space-y-3">
            {settings.locations.map((location) => (
              <div key={location.id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-slate-950 dark:text-white">{location.name}</p>
                    <p className="text-xs text-slate-500">{location.address}</p>
                  </div>
                  <Badge variant="secondary">{location.radius}m</Badge>
                </div>
              </div>
            ))}
            <div className="grid gap-2 sm:grid-cols-[1fr_1fr_100px_auto]">
              <Input placeholder="Location name" value={newLocation.name} onChange={(event) => setNewLocation((current) => ({ ...current, name: event.target.value }))} />
              <Input placeholder="Address" value={newLocation.address} onChange={(event) => setNewLocation((current) => ({ ...current, address: event.target.value }))} />
              <Input
                type="number"
                min="50"
                value={newLocation.radius}
                onChange={(event) => setNewLocation((current) => ({ ...current, radius: Number(event.target.value) }))}
              />
              <Button variant="outline" className="gap-1" onClick={addLocation}>
                <Plus size={14} />
                Add
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Wifi className="h-5 w-5 text-indigo-600" />
              <div>
                <h2 className="font-bold text-slate-950 dark:text-white">IP Restriction</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Office WiFi IP whitelist for browser clock-in.</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.ipRestriction}
              onChange={(event) => setSettings((current) => ({ ...current, ipRestriction: event.target.checked }))}
              className="h-5 w-5 rounded border-slate-300 text-indigo-600"
            />
          </div>
          <div className="space-y-3">
            {settings.ipWhitelist.map((ip) => (
              <div key={ip} className="flex items-center justify-between rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                <span className="font-mono text-sm font-bold text-slate-950 dark:text-white">{ip}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSettings((current) => ({ ...current, ipWhitelist: current.ipWhitelist.filter((item) => item !== ip) }))}
                >
                  <X size={14} />
                </Button>
              </div>
            ))}
            <div className="flex gap-2">
              <Input placeholder="203.0.113.10" value={newIp} onChange={(event) => setNewIp(event.target.value)} />
              <Button variant="outline" className="gap-1" onClick={addIp}>
                <Plus size={14} />
                Add IP
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-5 flex items-center gap-3">
            <Smartphone className="h-5 w-5 text-indigo-600" />
            <div>
              <h2 className="font-bold text-slate-950 dark:text-white">Clock-In Experience</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Policy summary shown to administrators and payroll reviewers.</p>
            </div>
          </div>
          <div className="grid gap-3">
            {[
              ["Workweek", `Starts on ${settings.workweekStart}`],
              ["Overtime", settings.overtimeThreshold],
              ["Rounding", settings.roundingRule === "None" ? "No rounding" : settings.roundingRule.replace("min", "minutes")],
              ["Breaks", settings.autoBreakDeduction ? "Auto-deduct 30 minutes after 6 hours" : "Manual break entry"],
              ["Geofencing", settings.geofencing ? `${settings.locations.length} approved locations` : "Disabled"],
              ["IP restriction", settings.ipRestriction ? `${settings.ipWhitelist.length} whitelisted IPs` : "Disabled"],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-lg bg-slate-50 p-3 dark:bg-slate-950/50">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</span>
                <span className="text-sm font-black text-slate-950 dark:text-white">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
