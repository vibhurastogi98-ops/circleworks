"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BarChart2, Download, Calendar, Search, Play, Clock, Mail,
  Trash2, Edit3, Sparkles, TrendingUp, TrendingDown, ArrowRight,
  AlertTriangle, Info, Lightbulb, Plus, ChevronRight, FileText,
  DollarSign, Users, Shield, Heart, Briefcase, Receipt, Settings,
  BookOpen, Globe, PieChart, HeartPulse, Target, CheckCircle,
  Minus, Landmark, UserPlus, UserMinus, Cake, CalendarDays,
  CalendarX, Car, Building, Wallet, AreaChart
} from "lucide-react";
import {
  standardReports,
  reportCategories,
  scheduledReports,
  aiInsights,
  type ReportCategory,
  type StandardReport,
  type ScheduledReport,
} from "@/data/mockReports";

/* ─── Icon Resolver ───────────────────────────────────────────────── */
const iconMap: Record<string, React.ElementType> = {
  DollarSign, BookOpen, BarChart2, FileText, Minus, Landmark, Shield,
  Users, TrendingUp, AlertTriangle, Cake, UserPlus, UserMinus,
  Globe, PieChart, HeartPulse, Heart, Wallet, Clock, CalendarDays,
  CalendarX, Target, CheckCircle, Briefcase, Receipt, Car, Building,
  Settings, Info, AreaChart,
};

function getIcon(name: string): React.ElementType {
  return iconMap[name] || FileText;
}

/* ─── Date Range Picker ───────────────────────────────────────────── */
const PRESETS = [
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
  { label: "This Quarter", value: "quarter" },
  { label: "Year to Date", value: "ytd" },
  { label: "Last Year", value: "last_year" },
];

function DateRangePicker() {
  const [preset, setPreset] = useState("30d");
  const [showCustom, setShowCustom] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
        {PRESETS.map((p) => (
          <button
            key={p.value}
            onClick={() => { setPreset(p.value); setShowCustom(false); }}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
              preset === p.value && !showCustom
                ? "bg-blue-600 text-white"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            {p.label}
          </button>
        ))}
        <button
          onClick={() => setShowCustom(!showCustom)}
          className={`px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1 ${
            showCustom
              ? "bg-blue-600 text-white"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
        >
          <Calendar size={12} /> Custom
        </button>
      </div>
    </div>
  );
}

function ReportCard({ report }: { report: StandardReport }) {
  const Icon = getIcon(report.icon);
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-800 transition-all group flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
          <Icon size={18} />
        </div>
        {report.popular && (
          <span className="px-1.5 py-0.5 rounded text-[8px] font-black bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 uppercase tracking-wider">
            Popular
          </span>
        )}
      </div>
      <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 transition-colors">{report.name}</h4>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed flex-1">{report.description}</p>
      <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/50 flex flex-col gap-2">
        <div className="flex justify-between items-center w-full">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date Range</span>
          <select className="text-xs border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-1 outline-none focus:border-blue-500">
            <option value="30d">Last 30 days</option>
            <option value="quarter">This Quarter</option>
            <option value="ytd">Year to Date</option>
            <option value="last_year">Last Year</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>
        <Link
          href={
            report.id === "rpt-20b" ? `/reports/certified-payroll` :
            report.id === "rpt-9b" ? `/reports/headcount-forecast` :
            `/reports/viewer/${report.id}`
          }
          className="w-full flex justify-center items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
        >
          <Play size={12} /> Run Report
        </Link>
      </div>
    </div>
  );
}

/* ─── Scheduled Report Row ────────────────────────────────────────── */
function ScheduledRow({ sr }: { sr: ScheduledReport }) {
  return (
    <div className={`flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors ${!sr.active ? "opacity-50" : ""}`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">{sr.reportName}</h4>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500">{sr.frequency}</span>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">{sr.format}</span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          <Mail size={10} className="inline mr-1" />
          {sr.recipients.join(", ")}
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <div className="text-xs text-slate-500 dark:text-slate-400">
          Next: {new Date(sr.nextRun).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </div>
        <div className="text-[10px] text-slate-400">
          Last: {new Date(sr.lastRun).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-600">
          <Edit3 size={14} />
        </button>
        <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-red-500">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

/* ─── AI Insight Card ─────────────────────────────────────────────── */
function InsightCard({ insight }: { insight: typeof aiInsights[0] }) {
  const config = {
    warning: { bg: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900", icon: AlertTriangle, iconColor: "text-amber-500", deltaColor: "text-red-500" },
    opportunity: { bg: "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900", icon: Lightbulb, iconColor: "text-green-500", deltaColor: "text-green-500" },
    info: { bg: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900", icon: Info, iconColor: "text-blue-500", deltaColor: "text-blue-500" },
  }[insight.severity];
  const Icon = config.icon;

  return (
    <div className={`rounded-xl border ${config.bg} p-5 flex flex-col gap-3`}>
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-white dark:bg-slate-900 shadow-sm">
          <Sparkles size={16} className="text-purple-500" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">{insight.title}</h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{insight.description}</p>
        </div>
      </div>
      {insight.metric && (
        <div className="flex items-center gap-3">
          <span className="text-lg font-black text-slate-900 dark:text-white">{insight.metric}</span>
          {insight.metricDelta && (
            <span className={`text-xs font-bold ${config.deltaColor} flex items-center gap-0.5`}>
              {insight.metricDelta.startsWith("+") ? <TrendingUp size={12} /> : insight.metricDelta.startsWith("-") ? <TrendingDown size={12} /> : null}
              {insight.metricDelta}
            </span>
          )}
        </div>
      )}
      <Link
        href={insight.actionHref}
        className="self-start flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
      >
        {insight.actionLabel} <ArrowRight size={12} />
      </Link>
    </div>
  );
}

/* ─── Main Reports Page ───────────────────────────────────────────── */
export default function ReportsPage() {
  const [activeCategory, setActiveCategory] = useState<ReportCategory>("Payroll");
  const [search, setSearch] = useState("");

  const filteredReports = standardReports.filter((r) => {
    if (r.category !== activeCategory) return false;
    if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart2 size={24} className="text-blue-600" />
            Reports & Analytics
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Run, schedule, and build custom reports.</p>
        </div>
        <div className="flex items-center gap-3">
          <DateRangePicker />
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm">
            <Download size={16} /> Export All
          </button>
          <Link
            href="/reports/custom"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Plus size={16} /> Custom Report
          </Link>
        </div>
      </div>

      {/* Quick Launch Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        {/* Category Tabs */}
        <div className="border-b border-slate-200 dark:border-slate-800 px-6 pt-4">
          <div className="flex items-center gap-4 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200">
            {reportCategories.map((cat) => {
              const count = standardReports.filter((r) => r.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`pb-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeCategory === cat
                      ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                      : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  {cat}
                  <span className="ml-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search & Grid */}
        <div className="p-6">
          <div className="relative max-w-sm mb-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={`Search ${activeCategory} reports...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredReports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
            {filteredReports.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-500">
                No reports match your search.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scheduled Reports + AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scheduled Reports */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-slate-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Scheduled Reports</h3>
            </div>
            <button className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
              <Plus size={12} /> Add Schedule
            </button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {scheduledReports.map((sr) => (
              <ScheduledRow key={sr.id} sr={sr} />
            ))}
          </div>
        </div>

        {/* AI Insights */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 px-1">
            <Sparkles size={16} className="text-purple-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Circe Insights</h3>
          </div>
          {aiInsights.map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      </div>
    </div>
  );
}
