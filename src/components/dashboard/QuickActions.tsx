"use client";

import { motion } from "framer-motion";
import {
  UserPlus,
  ClipboardCheck,
  Heart,
  CalendarDays,
  BarChart3,
  ChevronRight,
} from "lucide-react";
import { QUICK_ACTIONS, QuickAction } from "@/data/dashboard";

const ICON_MAP: Record<string, React.ElementType> = {
  UserPlus,
  ClipboardCheck,
  Heart,
  CalendarDays,
  BarChart3,
};

const ICON_COLORS: Record<string, string> = {
  UserPlus: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
  ClipboardCheck: "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400",
  Heart: "bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400",
  CalendarDays: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
  BarChart3: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
};

function ActionButton({ action, index }: { action: QuickAction; index: number }) {
  const Icon = ICON_MAP[action.icon] || UserPlus;

  return (
    <motion.button
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 + index * 0.06 }}
      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors group"
    >
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${ICON_COLORS[action.icon] || "bg-slate-100 text-slate-600"}`}>
        <Icon size={18} />
      </div>
      <div className="flex-1 text-left min-w-0">
        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
          {action.label}
        </span>
        {action.badge && (
          <span className="ml-2 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-blue-100 dark:bg-blue-800/40 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
            {action.badge}
          </span>
        )}
      </div>
      <ChevronRight
        size={16}
        className="text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-colors flex-shrink-0"
      />
    </motion.button>
  );
}

export default function QuickActions() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl p-5 shadow-sm h-full flex flex-col"
    >
      <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">
        Quick Actions
      </h3>
      <div className="flex flex-col gap-1 flex-1">
        {QUICK_ACTIONS.map((action, i) => (
          <ActionButton key={action.id} action={action} index={i} />
        ))}
      </div>
    </motion.div>
  );
}
