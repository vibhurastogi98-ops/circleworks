"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarDays, Clock3, HeartPulse, TimerReset } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";

const timeTrend = [
  { week: "May 3", regular: 4380, overtime: 122, pto: 184 },
  { week: "May 10", regular: 4420, overtime: 138, pto: 171 },
  { week: "May 17", regular: 4368, overtime: 96, pto: 213 },
  { week: "May 24", regular: 4454, overtime: 154, pto: 166 },
  { week: "May 31", regular: 4472, overtime: 168, pto: 158 },
];

const leaveBalances = [
  { department: "Engineering", pto: 812, sick: 326, floating: 74 },
  { department: "Sales", pto: 486, sick: 190, floating: 42 },
  { department: "Support", pto: 392, sick: 144, floating: 36 },
  { department: "Product", pto: 344, sick: 131, floating: 30 },
  { department: "Finance", pto: 228, sick: 84, floating: 21 },
];

const attendanceRows = [
  { employee: "Robert Chen", department: "Engineering", absences: 0, missedPunches: 1, overtime: 8, risk: "Low" },
  { employee: "Maria Santos", department: "Engineering", absences: 1, missedPunches: 0, overtime: 12, risk: "Medium" },
  { employee: "Emily Park", department: "Product", absences: 0, missedPunches: 2, overtime: 4, risk: "Low" },
  { employee: "David Martinez", department: "Sales", absences: 2, missedPunches: 3, overtime: 16, risk: "High" },
  { employee: "Lisa Thompson", department: "Support", absences: 1, missedPunches: 1, overtime: 10, risk: "Medium" },
];

const fmlaCases = [
  { employee: "Aisha Johnson", leaveType: "Intermittent", usedHours: 96, remainingHours: 384, exhaustion: "2026-10-08" },
  { employee: "James Liu", leaveType: "Continuous", usedHours: 240, remainingHours: 240, exhaustion: "2026-08-21" },
  { employee: "Sarah Williams", leaveType: "Intermittent", usedHours: 72, remainingHours: 408, exhaustion: "2026-11-12" },
];

function wait(ms = 150) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getTimeAnalyticsData() {
  await wait();
  return {
    timeTrend,
    leaveBalances,
    attendanceRows,
    fmlaCases,
  };
}

function TimeAnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-24 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-32 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
        ))}
      </div>
      <div className="h-96 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
    </div>
  );
}

export default function TimeAnalyticsReportPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["reports", "time-analytics"],
    queryFn: getTimeAnalyticsData,
  });

  if (isLoading) return <TimeAnalyticsSkeleton />;

  if (isError || !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
        <h2 className="text-lg font-bold">Something went wrong</h2>
        <p className="mt-1 text-sm">Time Analytics could not be loaded.</p>
        <Button className="mt-4" onClick={() => refetch()}>
          Try Again
        </Button>
      </div>
    );
  }

  const overtime = data.timeTrend.reduce((total, week) => total + week.overtime, 0);
  const ptoUsed = data.timeTrend.reduce((total, week) => total + week.pto, 0);
  const missedPunches = data.attendanceRows.reduce((total, row) => total + row.missedPunches, 0);
  const activeFmla = data.fmlaCases.length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div className="flex items-start gap-3">
          <Link href="/reports" className="mt-1 rounded-lg p-2 transition hover:bg-slate-100 dark:hover:bg-slate-800">
            <ArrowLeft size={18} className="text-slate-500" />
          </Link>
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400">Time Reports</p>
            <h1 className="mt-1 flex items-center gap-2 text-3xl font-black text-slate-950 dark:text-white">
              <Clock3 size={28} className="text-blue-600" />
              Time Analytics Report
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Overtime, attendance, PTO usage, leave balances, and FMLA tracking in one operational report.
            </p>
          </div>
        </div>
        <Button onClick={() => window.print()}>Export PDF</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Overtime Hours" value={String(overtime)} icon={TimerReset} />
        <Metric label="PTO Used" value={String(ptoUsed)} icon={CalendarDays} />
        <Metric label="Missed Punches" value={String(missedPunches)} icon={Clock3} />
        <Metric label="Active FMLA" value={String(activeFmla)} icon={HeartPulse} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200 p-5 dark:border-slate-800">
            <h2 className="text-lg font-black text-slate-950 dark:text-white">Hours Trend</h2>
          </div>
          <div className="h-[320px] p-5">
            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
              <LineChart data={data.timeTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="week" tick={{ fontSize: 12, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} />
                <Tooltip />
                <Line type="monotone" dataKey="regular" name="Regular hours" stroke="#2563eb" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="overtime" name="Overtime" stroke="#f97316" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="pto" name="PTO" stroke="#16a34a" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200 p-5 dark:border-slate-800">
            <h2 className="text-lg font-black text-slate-950 dark:text-white">Leave Balances by Department</h2>
          </div>
          <div className="h-[320px] p-5">
            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
              <BarChart data={data.leaveBalances}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="department" tick={{ fontSize: 12, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} />
                <Tooltip />
                <Bar dataKey="pto" name="PTO" stackId="leave" fill="#2563eb" radius={[8, 8, 0, 0]} />
                <Bar dataKey="sick" name="Sick" stackId="leave" fill="#16a34a" radius={[8, 8, 0, 0]} />
                <Bar dataKey="floating" name="Floating" stackId="leave" fill="#7c3aed" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200 p-5 dark:border-slate-800">
            <h2 className="text-lg font-black text-slate-950 dark:text-white">Attendance Exceptions</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[660px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-800/60">
                <tr>
                  <th className="px-5 py-3">Employee</th>
                  <th className="px-5 py-3">Absences</th>
                  <th className="px-5 py-3">Missed Punches</th>
                  <th className="px-5 py-3">Overtime</th>
                  <th className="px-5 py-3">Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.attendanceRows.map((row) => (
                  <tr key={row.employee}>
                    <td className="px-5 py-4 font-bold text-slate-950 dark:text-white">{row.employee}</td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{row.absences}</td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{row.missedPunches}</td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{row.overtime}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                        {row.risk}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200 p-5 dark:border-slate-800">
            <h2 className="text-lg font-black text-slate-950 dark:text-white">FMLA Tracking</h2>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.fmlaCases.map((item) => (
              <div key={item.employee} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-black text-slate-950 dark:text-white">{item.employee}</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.leaveType} leave</p>
                  </div>
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                    Exhausts {item.exhaustion}
                  </span>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{ width: `${(item.usedHours / (item.usedHours + item.remainingHours)) * 100}%` }}
                  />
                </div>
                <p className="mt-2 text-xs font-bold text-slate-500">
                  {item.usedHours} hours used / {item.remainingHours} remaining
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Metric({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
        <Icon size={18} className="text-blue-600" />
      </div>
      <p className="mt-3 text-2xl font-black text-slate-950 dark:text-white">{value}</p>
    </div>
  );
}
