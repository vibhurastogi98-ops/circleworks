"use client";

import { motion } from "framer-motion";
import { NEW_HIRES } from "@/data/dashboard";
import { useDashboardData } from "@/hooks/useDashboardData";
import { UserPlus } from "lucide-react";

function OnboardingBadge({ percent }: { percent: number }) {
  const getColor = (p: number) => {
    if (p >= 80) return "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400";
    if (p >= 40) return "bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400";
    return "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400";
  };

  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            percent >= 80
              ? "bg-emerald-500"
              : percent >= 40
              ? "bg-amber-500"
              : "bg-slate-400"
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${getColor(percent)}`}>
        {percent}%
      </span>
    </div>
  );
}

export default function NewHires() {
  const { newHires } = useDashboardData();
  const isEmpty = newHires.length === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl p-5 shadow-sm h-full"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          New Hires This Month
        </h3>
        <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
          {newHires.length} new
        </span>
      </div>

      <div className="flex flex-col gap-1 min-h-[160px] justify-center">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center text-slate-400 mb-3">
              <UserPlus size={24} />
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">No new hires yet</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[200px]">
              When you add team members, they'll appear here.
            </p>
          </div>
        ) : (
          newHires.map((hire, i) => (
            <motion.div
              key={hire.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 + i * 0.07 }}
              className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
            >
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-600">
                <img
                  src={`https://api.dicebear.com/7.x/notionists/svg?seed=${hire.avatarSeed}&backgroundColor=transparent`}
                  alt={hire.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {hire.name}
                  </p>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {hire.title} &middot; Started {hire.startDate}
                </p>
              </div>

              <OnboardingBadge percent={hire.onboardingPercent} />
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
