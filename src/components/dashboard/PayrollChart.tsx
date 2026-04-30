"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { CalendarDays, ArrowRight } from "lucide-react";
import Link from "next/link";
import { PAYROLL_TREND } from "@/data/dashboard";
import { useDashboardData } from "@/hooks/useDashboardData";

const DATE_RANGES = ["3 months", "6 months", "12 months"] as const;

function formatCurrency(val: number) {
  if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
  return `$${val}`;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-4 min-w-[180px]">
      <p className="text-sm font-bold text-slate-900 dark:text-white mb-2">
        {label} 2026
      </p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center justify-between gap-4 py-1">
          <div className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">
              {entry.name}
            </span>
          </div>
          <span className="text-xs font-bold text-slate-900 dark:text-white">
            ${entry.value.toLocaleString()}
          </span>
        </div>
      ))}
      <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700 flex justify-between">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total</span>
        <span className="text-xs font-bold text-slate-900 dark:text-white">
          ${payload.reduce((sum: number, p: any) => sum + p.value, 0).toLocaleString()}
        </span>
      </div>
    </div>
  );
}

export default function PayrollChart() {
  const [mounted, setMounted] = useState(false);
  const [range, setRange] = useState<(typeof DATE_RANGES)[number]>("6 months");
  const { payrollTrend } = useDashboardData();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl p-5 shadow-sm h-full flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Payroll Cost Trend
          </h3>
          <Link href="/payroll/history" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 mt-0.5">
            View history <ArrowRight size={10} />
          </Link>
        </div>
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700/50 rounded-lg p-1">
          {DATE_RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                range === r
                  ? "bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              {r}
            </button>
          ))}
          <button className="px-2 py-1.5 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
            <CalendarDays size={14} />
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-[300px] w-full relative overflow-hidden" style={{ minWidth: 0 }}>
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={payrollTrend} barGap={2} barCategoryGap="20%">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="currentColor"
                className="text-slate-100 dark:text-slate-700/50"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fontWeight: 600, fill: "#94A3B8" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#94A3B8" }}
                tickFormatter={formatCurrency}
                width={50}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ paddingBottom: 8, fontSize: 12, fontWeight: 600 }}
              />
              <Bar dataKey="gross" name="Gross" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="taxes" name="Taxes" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              <Bar dataKey="benefits" name="Benefits" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full bg-slate-50/50 dark:bg-slate-900/50 animate-pulse rounded-lg" />
        )}
      </div>
    </motion.div>
  );
}
