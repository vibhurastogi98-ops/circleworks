"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ACTIVITY_FEED } from "@/data/dashboard";

export default function ActivityFeed() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl p-5 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Recent Activity
        </h3>
        <button className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 transition-colors">
          View full audit log
          <ArrowRight size={12} />
        </button>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-[19px] top-3 bottom-3 w-px bg-slate-100 dark:bg-slate-700/60" />

        <div className="flex flex-col">
          {ACTIVITY_FEED.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 + i * 0.04 }}
              className="flex items-start gap-3 py-2.5 relative group"
            >
              {/* Avatar */}
              <div className="w-[38px] h-[38px] rounded-full overflow-hidden flex-shrink-0 border-2 border-white dark:border-slate-800 shadow-sm z-10 bg-slate-100 dark:bg-slate-700">
                {event.avatarSeed === "System" ? (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white text-[11px] font-bold">SYS</span>
                  </div>
                ) : (
                  <img
                    src={`https://api.dicebear.com/7.x/notionists/svg?seed=${event.avatarSeed}&backgroundColor=transparent`}
                    alt={event.actor}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              <div className="flex-1 min-w-0 pt-1">
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-snug">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {event.actor}
                  </span>{" "}
                  {event.action}
                </p>
              </div>

              <span className="text-[11px] text-slate-400 dark:text-slate-500 whitespace-nowrap flex-shrink-0 pt-1.5 font-medium">
                {event.relativeTime}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
