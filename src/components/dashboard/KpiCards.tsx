"use client";

import { motion } from "framer-motion";
import {
  Users,
  DollarSign,
  ClipboardCheck,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { KPI_CARDS, KpiCard } from "@/data/dashboard";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

const ICON_MAP: Record<string, React.ElementType> = {
  Users,
  DollarSign,
  ClipboardCheck,
  ShieldCheck,
};

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const chartData = data.map((v, i) => ({ v, i }));
  return (
    <div className="w-[72px] h-[32px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
          <defs>
            <linearGradient id={`spark-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={2}
            fill={`url(#spark-${color})`}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function ComplianceGauge({ score }: { score: number }) {
  const getColor = (s: number) => {
    if (s < 60) return { ring: "#EF4444", bg: "bg-red-50 dark:bg-red-900/20", text: "text-red-600 dark:text-red-400" };
    if (s < 80) return { ring: "#F59E0B", bg: "bg-amber-50 dark:bg-amber-900/20", text: "text-amber-600 dark:text-amber-400" };
    return { ring: "#10B981", bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-600 dark:text-emerald-400" };
  };
  const c = getColor(score);
  const circumference = 2 * Math.PI * 18;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-12 h-12">
      <svg viewBox="0 0 40 40" className="w-full h-full -rotate-90">
        <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="3" className="text-slate-100 dark:text-slate-700" />
        <circle
          cx="20"
          cy="20"
          r="18"
          fill="none"
          stroke={c.ring}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s ease-out" }}
        />
      </svg>
      <span className={`absolute inset-0 flex items-center justify-center text-[11px] font-bold ${c.text}`}>
        {score}
      </span>
    </div>
  );
}

function KpiCardComponent({ card, index }: { card: KpiCard; index: number }) {
  const Icon = ICON_MAP[card.icon] || Users;
  const isPositive = card.trend >= 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;
  const isComplianceScore = card.format === "score";
  const isPendingApprovals = card.id === "pending-approvals";

  const iconBgMap: Record<string, string> = {
    Users: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
    DollarSign: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
    ClipboardCheck: "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400",
    ShieldCheck: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
  };

  const sparkColorMap: Record<string, string> = {
    Users: "#3B82F6",
    DollarSign: "#10B981",
    ClipboardCheck: "#F97316",
    ShieldCheck: "#8B5CF6",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow group cursor-default"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBgMap[card.icon] || "bg-slate-100 text-slate-600"}`}>
          <Icon size={20} />
        </div>
        {isComplianceScore ? (
          <ComplianceGauge score={Number(card.value)} />
        ) : (
          <MiniSparkline data={card.sparklineData} color={sparkColorMap[card.icon] || "#3B82F6"} />
        )}
      </div>

      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
          {card.label}
        </p>
        <div className="flex items-end gap-3">
          <span className="text-2xl font-bold text-slate-900 dark:text-white leading-none">
            {isComplianceScore ? `${card.value}/100` : card.value}
          </span>
          {isPendingApprovals && Number(card.value) > 0 ? (
            <span className="text-xs font-semibold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-2 py-0.5 rounded-full">
              Needs attention
            </span>
          ) : (
            <span className={`flex items-center gap-0.5 text-xs font-semibold ${isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}>
              <TrendIcon size={12} />
              {card.trendLabel}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function KpiCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {KPI_CARDS.map((card, i) => (
        <KpiCardComponent key={card.id} card={card} index={i} />
      ))}
    </div>
  );
}
