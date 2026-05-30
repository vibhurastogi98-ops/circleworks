"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Download, Scale, ShieldAlert } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import { payEquityFactors, payEquityRows, type PayEquityRow } from "@/data/reportsAnalytics";

function wait(ms = 150) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getPayEquityData() {
  await wait();
  return {
    rows: payEquityRows,
    factors: payEquityFactors,
  };
}

function PayEquitySkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
      <div className="h-96 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
    </div>
  );
}

export default function PayEquityReportPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["reports", "pay-equity"],
    queryFn: getPayEquityData,
  });

  if (isLoading) return <PayEquitySkeleton />;

  if (isError || !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
        <h2 className="text-lg font-bold">Something went wrong</h2>
        <p className="mt-1 text-sm">Pay equity data could not be loaded.</p>
        <Button className="mt-4" onClick={() => refetch()}>
          Try Again
        </Button>
      </div>
    );
  }

  const significantRows = data.rows.filter((row) => row.significant);
  const genderRows = data.rows.filter((row) => row.segment === "Gender");
  const raceRows = data.rows.filter((row) => row.segment === "Race/Ethnicity");
  const departmentRows = data.rows.filter((row) => row.segment === "Department");
  const levelRows = data.rows.filter((row) => row.segment === "Level");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div className="flex items-start gap-3">
          <Link href="/reports" className="mt-1 rounded-lg p-2 transition hover:bg-slate-100 dark:hover:bg-slate-800">
            <ArrowLeft size={18} className="text-slate-500" />
          </Link>
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400">People Reports</p>
            <h1 className="mt-1 flex items-center gap-2 text-3xl font-black text-slate-950 dark:text-white">
              <Scale size={28} className="text-blue-600" />
              Pay Equity Analysis
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Controlled and uncontrolled pay gap calculations by gender, race/ethnicity, department, and level.
            </p>
          </div>
        </div>
        <a href="/api/reports/pay-equity/export">
          <Button>
            <Download size={16} />
            Export Pay Equity Report
          </Button>
        </a>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Segments analyzed" value={String(data.rows.length)} />
        <Metric label="Significant gaps" value={String(significantRows.length)} danger={significantRows.length > 0} />
        <Metric label="Controlled gap median" value="-1.1%" />
        <Metric label="Auditor packet" value="Ready" />
      </div>

      {significantRows.length > 0 && (
        <section className="rounded-xl border border-orange-200 bg-orange-50 p-5 text-orange-800 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-200">
          <div className="flex gap-3">
            <ShieldAlert size={18} className="mt-0.5 shrink-0" />
            <div>
              <h2 className="font-black">Statistically significant gaps flagged</h2>
              <p className="mt-1 text-sm leading-6">
                Review Support and Black or African American segments for compensation remediation planning and legal review.
              </p>
            </div>
          </div>
        </section>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200 p-5 dark:border-slate-800">
            <h2 className="text-lg font-black text-slate-950 dark:text-white">Controlled vs Uncontrolled Gap</h2>
          </div>
          <div className="h-[360px] p-5">
            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
              <BarChart data={data.rows} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 12, fill: "#94a3b8" }} />
                <YAxis type="category" dataKey="group" width={110} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "none", borderRadius: 8, color: "#fff" }} />
                <Bar dataKey="uncontrolledGap" fill="#94a3b8" radius={[0, 6, 6, 0]} />
                <Bar dataKey="controlledGap" fill="#2563eb" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-black text-slate-950 dark:text-white">Controlled Model Factors</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Share of variance explained by each compensation factor.
          </p>
          <div className="mt-5 space-y-4">
            {data.factors.map((factor) => (
              <div key={factor.factor}>
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-slate-700 dark:text-slate-300">{factor.factor}</span>
                  <span className="font-black text-slate-950 dark:text-white">{factor.impact}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className="h-full rounded-full bg-blue-600" style={{ width: `${factor.impact}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <SegmentTable title="Pay equity by gender" rows={genderRows} />
      <SegmentTable title="Pay equity by race/ethnicity" rows={raceRows} />
      <div className="grid gap-6 xl:grid-cols-2">
        <SegmentTable title="By department" rows={departmentRows} />
        <SegmentTable title="By level" rows={levelRows} />
      </div>
    </div>
  );
}

function Metric({ label, value, danger = false }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-2 text-3xl font-black ${danger ? "text-orange-600" : "text-slate-950 dark:text-white"}`}>{value}</p>
    </div>
  );
}

function SegmentTable({ title, rows }: { title: string; rows: PayEquityRow[] }) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-200 p-5 dark:border-slate-800">
        <h2 className="text-lg font-black text-slate-950 dark:text-white">{title}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-800/50">
            <tr>
              <th className="px-5 py-3">Group</th>
              <th className="px-5 py-3">Comparison</th>
              <th className="px-5 py-3">Uncontrolled Gap</th>
              <th className="px-5 py-3">Controlled Gap</th>
              <th className="px-5 py-3">Sample</th>
              <th className="px-5 py-3">Flag</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.map((row) => (
              <tr key={`${row.segment}-${row.group}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="px-5 py-4 font-black text-slate-950 dark:text-white">{row.group}</td>
                <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{row.comparison}</td>
                <GapCell value={row.uncontrolledGap} />
                <GapCell value={row.controlledGap} />
                <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{row.sampleSize}</td>
                <td className="px-5 py-4">
                  <span
                    className={
                      row.significant
                        ? "rounded-full bg-orange-100 px-2 py-1 text-xs font-black text-orange-700 dark:bg-orange-500/15 dark:text-orange-300"
                        : "rounded-full bg-green-100 px-2 py-1 text-xs font-black text-green-700 dark:bg-green-500/15 dark:text-green-300"
                    }
                  >
                    {row.significant ? "Review" : "No flag"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function GapCell({ value }: { value: number }) {
  const negative = value < 0;
  return (
    <td className={`px-5 py-4 font-black ${negative ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>
      {value > 0 ? "+" : ""}
      {value}%
    </td>
  );
}
