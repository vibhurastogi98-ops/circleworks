"use client";

import { motion } from "framer-motion";
import { TEAM_CALENDAR } from "@/data/dashboard";
import { useDashboardData } from "@/hooks/useDashboardData";
import Link from "next/link";

export default function TeamCalendar() {
  const { teamCalendar } = useDashboardData();
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl p-5 shadow-sm h-full"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Team Calendar This Week
        </h3>
        <Link href="/time" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
          View full
        </Link>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {teamCalendar.map((day, i) => (
          <motion.div
            key={day.day}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.05 }}
            className={`flex flex-col items-center rounded-xl p-3 transition-colors ${
              day.isToday
                ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 ring-1 ring-blue-200 dark:ring-blue-800/40"
                : "bg-slate-50 dark:bg-slate-700/30 border border-transparent"
            }`}
          >
            <span
              className={`text-[11px] font-bold uppercase tracking-wider ${
                day.isToday
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-slate-400 dark:text-slate-500"
              }`}
            >
              {day.day}
            </span>
            <span
              className={`text-lg font-bold mt-1 ${
                day.isToday
                  ? "text-blue-700 dark:text-blue-300"
                  : "text-slate-700 dark:text-slate-300"
              }`}
            >
              {day.date}
            </span>

            <div className="mt-2 flex flex-col items-center gap-1 min-h-[40px]">
              {day.events.length === 0 ? (
                <span className="text-[10px] text-slate-300 dark:text-slate-600 mt-2">—</span>
              ) : (
                day.events.map((ev, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1"
                    title={`${ev.name} — ${ev.type.toUpperCase()}`}
                  >
                    <div className="w-5 h-5 rounded-full overflow-hidden border border-white dark:border-slate-600 shadow-sm flex-shrink-0">
                      <img
                        src={`https://api.dicebear.com/7.x/notionists/svg?seed=${ev.avatarSeed}&backgroundColor=transparent`}
                        alt={ev.name}
                        className="w-full h-full"
                      />
                    </div>
                    <span
                      className={`text-[9px] font-semibold px-1 py-0.5 rounded ${
                        ev.type === "pto"
                          ? "bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400"
                          : ev.type === "birthday"
                          ? "bg-pink-100 dark:bg-pink-900/20 text-pink-700 dark:text-pink-400"
                          : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {ev.type === "pto" ? "PTO" : ev.type === "birthday" ? "🎂" : ev.type}
                    </span>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
