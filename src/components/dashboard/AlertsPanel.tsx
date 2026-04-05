"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  AlertCircle,
  Info,
  X,
  ChevronRight,
} from "lucide-react";
import { ALERTS, AlertItem, AlertSeverity } from "@/data/dashboard";

const SEVERITY_STYLES: Record<
  AlertSeverity,
  { border: string; bg: string; iconBg: string; iconColor: string; Icon: React.ElementType; actionBg: string; actionText: string }
> = {
  critical: {
    border: "border-red-300 dark:border-red-700/60",
    bg: "bg-red-50/60 dark:bg-red-900/10",
    iconBg: "bg-red-100 dark:bg-red-900/30",
    iconColor: "text-red-600 dark:text-red-400",
    Icon: AlertTriangle,
    actionBg: "bg-red-600 hover:bg-red-700",
    actionText: "text-white",
  },
  warning: {
    border: "border-orange-300 dark:border-orange-700/60",
    bg: "bg-orange-50/60 dark:bg-orange-900/10",
    iconBg: "bg-orange-100 dark:bg-orange-900/30",
    iconColor: "text-orange-600 dark:text-orange-400",
    Icon: AlertCircle,
    actionBg: "bg-orange-600 hover:bg-orange-700",
    actionText: "text-white",
  },
  info: {
    border: "border-blue-300 dark:border-blue-700/60",
    bg: "bg-blue-50/60 dark:bg-blue-900/10",
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
    Icon: Info,
    actionBg: "bg-blue-600 hover:bg-blue-700",
    actionText: "text-white",
  },
};

function AlertCard({ alert, onDismiss }: { alert: AlertItem; onDismiss: (id: string) => void }) {
  const style = SEVERITY_STYLES[alert.severity];
  const SeverityIcon = style.Icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, x: -20 }}
      className={`relative flex-shrink-0 w-[300px] rounded-xl border-l-4 ${style.border} ${style.bg} p-4 flex flex-col gap-3 group`}
    >
      {/* Dismiss */}
      <button
        onClick={() => onDismiss(alert.id)}
        className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-700/60 opacity-0 group-hover:opacity-100 transition-all"
      >
        <X size={14} />
      </button>

      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${style.iconBg}`}>
          <SeverityIcon size={16} className={style.iconColor} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 dark:text-white leading-snug">
            {alert.title}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
            {alert.description}
          </p>
        </div>
      </div>

      <button
        className={`self-start h-7 px-3 rounded-lg text-xs font-bold ${style.actionBg} ${style.actionText} flex items-center gap-1 transition-colors shadow-sm`}
      >
        {alert.actionLabel}
        <ChevronRight size={12} />
      </button>
    </motion.div>
  );
}

export default function AlertsPanel() {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const visibleAlerts = ALERTS.filter((a) => !dismissedIds.has(a.id));

  if (visibleAlerts.length === 0) return null;

  return (
    <div>
      <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
        <AlertCircle size={18} className="text-orange-500" />
        Needs your attention
        <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
          ({visibleAlerts.length})
        </span>
      </h3>

      <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
        <AnimatePresence mode="popLayout">
          {visibleAlerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onDismiss={(id) =>
                setDismissedIds((prev) => new Set([...prev, id]))
              }
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
