"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  GitBranch,
  TrendingDown,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ResponsiveContainer from "@/components/charts/MeasuredResponsiveContainer";

import { Button } from "@/components/ui/button";
import {
  demographicBreakdowns,
  departmentBreakdown,
  headcountTrend,
  orgTree,
  turnoverSummary,
} from "@/data/reportsAnalytics";

function wait(ms = 150) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getHeadcountReport() {
  await wait();
  return {
    trend: headcountTrend,
    turnover: turnoverSummary,
    demographics: demographicBreakdowns,
    departments: departmentBreakdown,
    org: orgTree,
  };
}

function HeadcountSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-80 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        <div className="h-80 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
      </div>
    </div>
  );
}

export default function HeadcountReportPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["reports", "headcount"],
    queryFn: getHeadcountReport,
  });

  if (isLoading) return <HeadcountSkeleton />;

  if (isError || !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
        <h2 className="text-lg font-bold">Something went wrong</h2>
        <p className="mt-1 text-sm">Headcount report could not be loaded.</p>
        <Button className="mt-4" onClick={() => refetch()}>
          Try Again
        </Button>
      </div>
    );
  }

  const terminations = data.turnover.voluntary + data.turnover.involuntary;
  const turnoverRate = Number(((terminations / data.turnover.averageHeadcount) * 100).toFixed(1));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-3">
        <Link href="/reports" className="mt-1 rounded-lg p-2 transition hover:bg-slate-100 dark:hover:bg-slate-800">
          <ArrowLeft size={18} className="text-slate-500" />
        </Link>
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400">People Reports</p>
          <h1 className="mt-1 flex items-center gap-2 text-3xl font-black text-slate-950 dark:text-white">
            <Users size={28} className="text-blue-600" />
            Headcount & Workforce Report
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Workforce movement, turnover rate, demographics, department distribution, and org structure.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Current Headcount" value={String(data.trend[data.trend.length - 1].headcount)} icon={Users} />
        <Metric label="Turnover Rate" value={`${turnoverRate}%`} icon={TrendingDown} />
        <Metric label="Hires YTD" value={String(data.trend.reduce((total, month) => total + month.hires, 0))} icon={UserPlus} />
        <Metric label="Terminations YTD" value={String(terminations)} icon={UserMinus} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200 p-5 dark:border-slate-800">
            <h2 className="text-lg font-black text-slate-950 dark:text-white">Headcount Over Time</h2>
          </div>
          <div className="h-[320px] p-5">
            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
              <LineChart data={data.trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} />
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "none", borderRadius: 8, color: "#fff" }} />
                <Line type="monotone" dataKey="headcount" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200 p-5 dark:border-slate-800">
            <h2 className="text-lg font-black text-slate-950 dark:text-white">Hires and Terminations</h2>
          </div>
          <div className="h-[320px] p-5">
            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
              <BarChart data={data.trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} />
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "none", borderRadius: 8, color: "#fff" }} />
                <Bar dataKey="hires" stackId="movement" fill="#16a34a" radius={[6, 6, 0, 0]} />
                <Bar dataKey="terminations" stackId="movement" fill="#ef4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="grid gap-4 lg:grid-cols-3">
        <Breakdown title="Gender Breakdown" rows={data.demographics.gender} />
        <Breakdown title="Race/Ethnicity Breakdown" rows={data.demographics.raceEthnicity} />
        <Breakdown title="Age Distribution" rows={data.demographics.ageDistribution.map((item) => ({ label: item.bucket, value: item.value }))} />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200 p-5 dark:border-slate-800">
            <h2 className="text-lg font-black text-slate-950 dark:text-white">Department Breakdown</h2>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.departments.map((department) => (
              <div key={department.department} className="grid grid-cols-[140px_1fr_48px] items-center gap-3 p-4">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{department.department}</span>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className="h-full rounded-full bg-blue-600" style={{ width: `${(department.headcount / 42) * 100}%` }} />
                </div>
                <span className="text-right text-sm font-black text-slate-950 dark:text-white">{department.headcount}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <GitBranch size={18} className="text-blue-600" />
            <h2 className="text-lg font-black text-slate-950 dark:text-white">Org Tree Visualization</h2>
          </div>
          <div className="mt-5 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
            <div className="mx-auto w-fit rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white">{data.org.name}</div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {data.org.children.map((node) => (
                <div key={node.name} className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-slate-950 dark:text-white">{node.name}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-black text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {node.count}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {node.children.map((child) => (
                      <span key={child} className="rounded-full bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                        {child}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function Metric({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Users }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2 text-slate-500">
        <Icon size={17} />
        <p className="text-xs font-bold uppercase tracking-wide">{label}</p>
      </div>
      <p className="mt-2 text-3xl font-black text-slate-950 dark:text-white">{value}</p>
    </div>
  );
}

function Breakdown({ title, rows }: { title: string; rows: Array<{ label: string; value: number }> }) {
  const max = Math.max(...rows.map((row) => row.value), 1);
  const colors = ["#2563eb", "#06b6d4", "#16a34a", "#f59e0b", "#ef4444", "#8b5cf6"];

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="font-black text-slate-950 dark:text-white">{title}</h2>
      <div className="mt-4 space-y-3">
        {rows.map((row, index) => (
          <div key={row.label}>
            <div className="flex justify-between gap-3 text-sm">
              <span className="text-slate-600 dark:text-slate-400">{row.label}</span>
              <span className="font-black text-slate-950 dark:text-white">{row.value}</span>
            </div>
            <div className="mt-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full"
                style={{ width: `${(row.value / max) * 100}%`, backgroundColor: colors[index % colors.length] }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
