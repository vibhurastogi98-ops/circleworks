"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  Shield, AlertTriangle, AlertCircle, Info, ChevronRight,
  FileCheck, HeartPulse, Users, FileText, BookOpen, UserPlus,
  Calendar, ExternalLink, X
} from "lucide-react";
import {
  complianceAlerts,
  complianceCalendar,
  quickStatusCards,
  type CalendarEvent,
} from "@/data/mockCompliance";

/* ─── Health Score Gauge ──────────────────────────────────────────── */

function HealthScoreGauge({ score }: { score: number }) {
  const radius = 88;
  const stroke = 10;
  const normalizedRadius = radius - stroke;
  const circumference = normalizedRadius * 2 * Math.PI;
  const progress = (score / 100) * circumference;

  const color =
    score > 80 ? "#22c55e" : score >= 60 ? "#eab308" : "#ef4444";
  const label = score > 80 ? "Good" : score >= 60 ? "Fair" : "At Risk";
  const bgRing = score > 80 ? "#dcfce7" : score >= 60 ? "#fef9c3" : "#fee2e2";

  return (
    <div className="flex flex-col items-center">
      <svg width={200} height={200} className="drop-shadow-lg">
        <circle
          cx={100}
          cy={100}
          r={normalizedRadius}
          fill="none"
          stroke={bgRing}
          strokeWidth={stroke}
          className="dark:opacity-20"
        />
        <circle
          cx={100}
          cy={100}
          r={normalizedRadius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={`${progress} ${circumference - progress}`}
          strokeDashoffset={circumference * 0.25}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{ filter: `drop-shadow(0 0 6px ${color}40)` }}
        />
        {/* Center text */}
        <text
          x="50%"
          y="46%"
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-slate-900 dark:fill-white"
          style={{ fontSize: "48px", fontWeight: 900, fontFamily: "Inter, system-ui, sans-serif" }}
        >
          {score}
        </text>
        <text
          x="50%"
          y="62%"
          textAnchor="middle"
          dominantBaseline="central"
          style={{ fontSize: "14px", fontWeight: 600, fill: color }}
        >
          {label}
        </text>
      </svg>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
        Compliance Health Score
      </p>
    </div>
  );
}

/* ─── Alert Card ──────────────────────────────────────────────────── */

function AlertCard({ alert }: { alert: typeof complianceAlerts[0] }) {
  const config = {
    critical: { border: "border-red-200 dark:border-red-900/50", bg: "bg-red-50 dark:bg-red-950/30", btn: "bg-red-600 hover:bg-red-700 text-white", icon: AlertCircle, iconColor: "text-red-500" },
    warning: { border: "border-amber-200 dark:border-amber-900/50", bg: "bg-amber-50 dark:bg-amber-950/30", btn: "bg-amber-600 hover:bg-amber-700 text-white", icon: AlertTriangle, iconColor: "text-amber-500" },
    info: { border: "border-blue-200 dark:border-blue-900/50", bg: "bg-blue-50 dark:bg-blue-950/30", btn: "bg-blue-600 hover:bg-blue-700 text-white", icon: Info, iconColor: "text-blue-500" },
  }[alert.severity];

  const Icon = config.icon;

  return (
    <div className={`rounded-xl border ${config.border} ${config.bg} p-4 flex flex-col gap-3`}>
      <div className="flex items-start gap-3">
        <Icon size={18} className={`${config.iconColor} mt-0.5 flex-shrink-0`} />
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{alert.title}</h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{alert.description}</p>
          {alert.deadline && (
            <p className="text-[10px] font-bold text-slate-500 mt-1.5 uppercase tracking-wider">
              Due: {new Date(alert.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
          )}
        </div>
      </div>
      <Link
        href={alert.actionHref || "#"}
        className={`self-start px-3 py-1.5 rounded-lg text-xs font-bold ${config.btn} transition-colors shadow-sm`}
      >
        {alert.actionLabel}
      </Link>
    </div>
  );
}

/* ─── Calendar Timeline ───────────────────────────────────────────── */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function CalendarTimeline() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{ event: CalendarEvent; x: number; y: number } | null>(null);
  const [drawerEvent, setDrawerEvent] = useState<CalendarEvent | null>(null);

  // Group events by month
  const eventsByMonth: Record<number, CalendarEvent[]> = {};
  complianceCalendar.forEach((ev) => {
    const m = new Date(ev.date).getMonth();
    if (!eventsByMonth[m]) eventsByMonth[m] = [];
    eventsByMonth[m].push(ev);
  });

  const currentMonth = new Date().getMonth();

  return (
    <>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-slate-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Compliance Calendar</h3>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Federal</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> State</span>
          </div>
        </div>
        <div ref={scrollRef} className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
          <div className="flex min-w-[1200px]">
            {MONTHS.map((month, mi) => (
              <div
                key={month}
                className={`flex-1 min-w-[100px] border-r border-slate-100 dark:border-slate-800 last:border-r-0 ${
                  mi === currentMonth ? "bg-blue-50/50 dark:bg-blue-950/20" : ""
                }`}
              >
                <div className={`text-center py-2 text-xs font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 ${
                  mi === currentMonth ? "text-blue-600 dark:text-blue-400" : "text-slate-500"
                }`}>
                  {month}
                  {mi === currentMonth && <span className="ml-1 text-[9px]">●</span>}
                </div>
                <div className="p-2 flex flex-col gap-1.5 min-h-[120px]">
                  {(eventsByMonth[mi] || []).map((ev) => (
                    <button
                      key={ev.id}
                      onClick={() => setDrawerEvent(ev)}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTooltip({ event: ev, x: rect.left + rect.width / 2, y: rect.top });
                      }}
                      onMouseLeave={() => setTooltip(null)}
                      className={`text-left text-[10px] font-bold px-2 py-1.5 rounded-md cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md truncate ${
                        ev.type === "federal"
                          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                          : "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                      }`}
                    >
                      {ev.formNumber}
                      {ev.state ? ` (${ev.state})` : ""}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-[100] pointer-events-none bg-slate-900 text-white rounded-lg px-3 py-2 text-xs shadow-xl max-w-[260px]"
          style={{ left: tooltip.x - 130, top: tooltip.y - 80 }}
        >
          <div className="font-bold mb-0.5">{tooltip.event.name}</div>
          <div className="text-slate-300 text-[10px] mb-1">Form {tooltip.event.formNumber}</div>
          <div className="text-red-300 text-[10px]">⚠ {tooltip.event.consequence}</div>
        </div>
      )}

      {/* Filing Detail Drawer */}
      {drawerEvent && (
        <div className="fixed inset-0 z-[200] flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setDrawerEvent(null)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Filing Detail</h3>
              <button onClick={() => setDrawerEvent(null)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                <X size={18} className="text-slate-500" />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-5">
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Filing Name</div>
                <div className="text-base font-bold text-slate-900 dark:text-white">{drawerEvent.name}</div>
              </div>
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Description</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">{drawerEvent.description}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Form Number</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">{drawerEvent.formNumber}</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Due Date</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {new Date(drawerEvent.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Type</div>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    drawerEvent.type === "federal"
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                  }`}>
                    {drawerEvent.type === "federal" ? "Federal" : drawerEvent.state}
                  </span>
                </div>
              </div>
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg p-4">
                <div className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <AlertTriangle size={12} /> Consequence of Missing
                </div>
                <div className="text-sm text-red-700 dark:text-red-300">{drawerEvent.consequence}</div>
              </div>
              <Link
                href="/compliance/tax-filings"
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-colors mt-2"
              >
                View in Tax Filings <ExternalLink size={14} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ─── Quick Status Grid ───────────────────────────────────────────── */

const iconMap: Record<string, React.ElementType> = {
  FileCheck, HeartPulse, Users, FileText, BookOpen, UserPlus,
};

function StatusCard({ card }: { card: typeof quickStatusCards[0] }) {
  const Icon = iconMap[card.icon] || Shield;

  const statusColors = {
    compliant: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
    attention: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    overdue: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
    pending: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  }[card.status];

  const iconBg = {
    compliant: "bg-green-50 dark:bg-green-900/20 text-green-500",
    attention: "bg-amber-50 dark:bg-amber-900/20 text-amber-500",
    overdue: "bg-red-50 dark:bg-red-900/20 text-red-500",
    pending: "bg-blue-50 dark:bg-blue-900/20 text-blue-500",
  }[card.status];

  return (
    <Link
      href={card.href}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-800 transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBg}`}>
          <Icon size={20} />
        </div>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColors}`}>
          {card.statusLabel}
        </span>
      </div>
      <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{card.label}</h4>
      <p className="text-[11px] text-slate-500 dark:text-slate-400">
        Updated {new Date(card.lastUpdated).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
      </p>
      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-2 inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        Review <ChevronRight size={12} />
      </span>
    </Link>
  );
}

/* ─── Main Dashboard ──────────────────────────────────────────────── */

export default function ComplianceDashboard() {
  // Compute health score
  const criticals = complianceAlerts.filter((a) => a.severity === "critical").length;
  const warnings = complianceAlerts.filter((a) => a.severity === "warning").length;
  const score = Math.max(0, Math.min(100, 100 - criticals * 10 - warnings * 3));

  const criticalAlerts = complianceAlerts.filter((a) => a.severity === "critical");
  const warningAlerts = complianceAlerts.filter((a) => a.severity === "warning");
  const infoAlerts = complianceAlerts.filter((a) => a.severity === "info");

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield size={24} className="text-blue-600" />
            Compliance Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Monitor compliance health, alerts, and upcoming deadlines.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/compliance/tax-filings" className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm">
            Tax Filings
          </Link>
          <Link href="/compliance/i9" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
            Run Audit
          </Link>
        </div>
      </div>

      {/* Health Score + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Health Score */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col items-center justify-center">
          <HealthScoreGauge score={score} />
        </div>

        {/* Alerts by Severity */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Critical */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 px-1">
              <AlertCircle size={14} className="text-red-500" />
              <span className="text-xs font-black text-red-600 dark:text-red-400 uppercase tracking-wider">
                Critical ({criticalAlerts.length})
              </span>
            </div>
            {criticalAlerts.map((a) => <AlertCard key={a.id} alert={a} />)}
          </div>
          {/* Warning */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 px-1">
              <AlertTriangle size={14} className="text-amber-500" />
              <span className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                Warnings ({warningAlerts.length})
              </span>
            </div>
            {warningAlerts.map((a) => <AlertCard key={a.id} alert={a} />)}
          </div>
          {/* Info */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 px-1">
              <Info size={14} className="text-blue-500" />
              <span className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                Info ({infoAlerts.length})
              </span>
            </div>
            {infoAlerts.map((a) => <AlertCard key={a.id} alert={a} />)}
          </div>
        </div>
      </div>

      {/* Calendar */}
      <CalendarTimeline />

      {/* Quick Status Grid */}
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Quick Status</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {quickStatusCards.map((card) => (
            <StatusCard key={card.id} card={card} />
          ))}
        </div>
      </div>
    </div>
  );
}
