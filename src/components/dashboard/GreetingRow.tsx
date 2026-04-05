"use client";

import { motion } from "framer-motion";
import { Calendar, Eye, Play, Loader2 } from "lucide-react";
import { CURRENT_USER, NEXT_PAYROLL } from "@/data/dashboard";
import { usePlatformStore } from "@/store/usePlatformStore";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function GreetingRow() {
  const { isPayrollRunning, setPayrollRunning } = usePlatformStore();

  return (
    <div className="flex flex-col lg:flex-row lg:items-start gap-4">
      {/* Greeting */}
      <div className="flex-1">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          {getGreeting()}, {CURRENT_USER.firstName}.
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Here&apos;s what&apos;s happening at Acme Corp today.
        </p>
      </div>

      {/* Next Payroll Card / Processing Card */}
      {isPayrollRunning ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-xl px-5 py-4 flex items-center gap-4 min-w-[340px]"
        >
          {/* Pulsing background */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-100/0 via-blue-100/60 dark:via-blue-800/20 to-blue-100/0 animate-pulse" />
          <div className="relative flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-800/40 flex items-center justify-center">
              <Loader2 size={20} className="text-blue-600 dark:text-blue-400 animate-spin" />
            </div>
            <div>
              <p className="text-sm font-bold text-blue-700 dark:text-blue-300">
                Payroll Processing
              </p>
              <p className="text-xs text-blue-600/80 dark:text-blue-400/70">
                {NEXT_PAYROLL.employeeCount} employees &middot; Est.{" "}
                ${NEXT_PAYROLL.estimatedTotal.toLocaleString()}
              </p>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl px-5 py-4 flex items-center gap-5 min-w-[340px] shadow-sm"
        >
          <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
            <Calendar size={20} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-slate-900 dark:text-white">
              Next Payroll: {NEXT_PAYROLL.date}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {NEXT_PAYROLL.daysAway} days away &middot; Est.{" "}
              ${NEXT_PAYROLL.estimatedTotal.toLocaleString()}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
              <Eye size={14} />
              Preview
            </button>
            <button
              onClick={() => setPayrollRunning(true)}
              className="h-8 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all hover:shadow-md"
            >
              <Play size={12} />
              Run Now
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
