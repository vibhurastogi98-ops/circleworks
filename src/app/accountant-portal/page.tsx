"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Building2, Users, DollarSign, Clock, AlertTriangle,
  TrendingUp, CalendarDays, ChevronRight, Play, BarChart3,
  Settings, CheckCircle2, ArrowUpRight, Shield, FileText,
  ExternalLink, Zap, CircleDot
} from "lucide-react";
import { formatDate } from "@/utils/formatDate";

interface Client {
  id: string;
  slug: string;
  name: string;
  logoUrl: string;
  industry: string;
  plan: string;
  employeeCount: number;
  contractorCount: number;
  status: "on_time" | "action_required" | "issue";
  statusLabel: string;
  nextPayrollDate: string;
  nextPayrollAmount: number;
  lastPayrollDate: string;
  state: string;
  monthlyPayrollVolume: number;
  pendingApprovals: number;
}

interface Summary {
  totalClients: number;
  activePayrollsThisWeek: number;
  pendingApprovals: number;
  taxDeadlines: number;
  totalEmployees: number;
  totalContractors: number;
  totalPayrollVolumeThisMonth: number;
  clientsByStatus: { on_time: number; action_required: number; issue: number };
  upcomingDeadlines: Array<{
    id: string;
    date: string;
    type: string;
    title: string;
    client: string;
    clientSlug: string;
    severity: string;
    description: string;
  }>;
}

const STATUS_STYLES = {
  on_time: {
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-400",
    dot: "bg-emerald-500",
    border: "border-emerald-200 dark:border-emerald-500/20",
    label: "On Time",
  },
  action_required: {
    bg: "bg-amber-50 dark:bg-amber-500/10",
    text: "text-amber-700 dark:text-amber-400",
    dot: "bg-amber-500",
    border: "border-amber-200 dark:border-amber-500/20",
    label: "Action Required",
  },
  issue: {
    bg: "bg-red-50 dark:bg-red-500/10",
    text: "text-red-700 dark:text-red-400",
    dot: "bg-red-500",
    border: "border-red-200 dark:border-red-500/20",
    label: "Issue",
  },
};

const SEVERITY_STYLES: Record<string, string> = {
  critical: "border-l-red-500 bg-red-50/50 dark:bg-red-500/5",
  warning: "border-l-amber-500 bg-amber-50/50 dark:bg-amber-500/5",
  normal: "border-l-indigo-500 bg-white dark:bg-slate-800/50",
};

const TYPE_ICONS: Record<string, React.ElementType> = {
  payroll: DollarSign,
  tax: FileText,
  compliance: Shield,
  benefits: Users,
};

const TYPE_COLORS: Record<string, string> = {
  payroll: "bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400",
  tax: "bg-violet-100 dark:bg-violet-500/15 text-violet-600 dark:text-violet-400",
  compliance: "bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400",
  benefits: "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatShortDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function daysFromNow(dateStr: string) {
  const now = new Date();
  const target = new Date(dateStr + "T00:00:00");
  const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff < 0) return `${Math.abs(diff)}d ago`;
  return `In ${diff} days`;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0, 0, 0.2, 1] as const } },
};

export default function AccountantPortalPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/accountant/clients").then((r) => r.json()),
      fetch("/api/accountant/clients/summary").then((r) => r.json()),
    ]).then(([clientsData, summaryData]) => {
      setClients(clientsData.clients || []);
      setSummary(summaryData);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading || !summary) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
          <p className="text-sm font-medium text-slate-400 animate-pulse">Loading portal...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6"
    >
      {/* ─── SUMMARY CARDS ─── */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Clients */}
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 p-5 group hover:shadow-lg hover:shadow-indigo-500/5 transition-all hover:-translate-y-0.5">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-bl-[60px]" />
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/15 flex items-center justify-center">
              <Building2 size={20} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <span className="text-[12px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Total Clients
            </span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[32px] font-extrabold text-slate-900 dark:text-white leading-none">
                {summary.totalClients}
              </p>
              <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-1">
                {summary.totalEmployees} employees · {summary.totalContractors} contractors
              </p>
            </div>
          </div>
        </div>

        {/* Active Payrolls This Week */}
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 p-5 group hover:shadow-lg hover:shadow-blue-500/5 transition-all hover:-translate-y-0.5">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-bl-[60px]" />
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center">
              <CalendarDays size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-[12px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Payrolls This Week
            </span>
          </div>
          <div>
            <p className="text-[32px] font-extrabold text-slate-900 dark:text-white leading-none">
              {summary.activePayrollsThisWeek}
            </p>
            <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-1">
              Across all managed companies
            </p>
          </div>
        </div>

        {/* Pending Approvals */}
        <Link href="/accountant-portal/approvals">
          <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 p-5 group hover:shadow-lg hover:shadow-amber-500/5 transition-all hover:-translate-y-0.5 cursor-pointer">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-bl-[60px]" />
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/15 flex items-center justify-center">
                <CheckCircle2 size={20} className="text-amber-600 dark:text-amber-400" />
              </div>
              <span className="text-[12px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Pending Approvals
              </span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[32px] font-extrabold text-slate-900 dark:text-white leading-none">
                  {summary.pendingApprovals}
                </p>
                <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-1">
                  Payroll runs awaiting review
                </p>
              </div>
              <ArrowUpRight size={18} className="text-slate-300 dark:text-slate-600 group-hover:text-amber-500 transition-colors mb-1" />
            </div>
          </div>
        </Link>

        {/* Total Payroll Volume */}
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 p-5 group hover:shadow-lg hover:shadow-emerald-500/5 transition-all hover:-translate-y-0.5">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-bl-[60px]" />
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/15 flex items-center justify-center">
              <TrendingUp size={20} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-[12px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Monthly Volume
            </span>
          </div>
          <div>
            <p className="text-[32px] font-extrabold text-slate-900 dark:text-white leading-none">
              {formatCurrency(summary.totalPayrollVolumeThisMonth)}
            </p>
            <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-1">
              Total payroll across all clients
            </p>
          </div>
        </div>
      </motion.div>

      {/* ─── CLIENT LIST TABLE + TIMELINE ─── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Client List Table — 2/3 */}
        <motion.div variants={itemVariants} className="xl:col-span-2">
          <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
              <div>
                <h2 className="text-[16px] font-bold text-slate-900 dark:text-white">All Clients</h2>
                <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">Manage and monitor all client companies</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-[11px] font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-slate-500">{summary.clientsByStatus.on_time}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-medium">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-slate-500">{summary.clientsByStatus.action_required}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-medium">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-slate-500">{summary.clientsByStatus.issue}</span>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/30">
                    <th className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-6 py-3">Company</th>
                    <th className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-4 py-3 hidden sm:table-cell">Plan</th>
                    <th className="text-center text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-4 py-3 hidden md:table-cell">Employees</th>
                    <th className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-4 py-3 hidden lg:table-cell">Next Payroll</th>
                    <th className="text-center text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-4 py-3">Status</th>
                    <th className="text-right text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {clients.map((client, i) => {
                    const statusStyle = STATUS_STYLES[client.status];
                    return (
                      <motion.tr
                        key={client.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04, duration: 0.3 }}
                        className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="px-6 py-3.5">
                          <Link href={`/c/${client.slug}/dashboard`} className="flex items-center gap-3 group/link">
                            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700 flex-shrink-0 group-hover/link:border-indigo-300 dark:group-hover/link:border-indigo-700 transition-colors">
                              <img src={client.logoUrl} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <span className="text-[13px] font-bold text-slate-800 dark:text-slate-200 group-hover/link:text-indigo-700 dark:group-hover/link:text-indigo-400 transition-colors">
                                {client.name}
                              </span>
                              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                                {client.industry} · {client.state}
                              </p>
                            </div>
                          </Link>
                        </td>
                        <td className="px-4 py-3.5 hidden sm:table-cell">
                          <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-bold ${
                            client.plan === "Premium"
                              ? "bg-violet-100 dark:bg-violet-500/15 text-violet-700 dark:text-violet-400"
                              : client.plan === "Growth"
                              ? "bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400"
                              : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                          }`}>
                            {client.plan}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center hidden md:table-cell">
                          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">
                            {client.employeeCount}
                          </span>
                          {client.contractorCount > 0 && (
                            <span className="text-[11px] text-slate-400 dark:text-slate-500 ml-1">
                              +{client.contractorCount}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 hidden lg:table-cell">
                          <div className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">
                            {formatShortDate(client.nextPayrollDate)}
                          </div>
                          <div className="text-[11px] text-slate-400 dark:text-slate-500">
                            {formatCurrency(client.nextPayrollAmount)}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                            {statusStyle.label}
                          </span>
                        </td>
                        <td className="px-6 py-3.5">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              href={`/c/${client.slug}/dashboard`}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 dark:hover:text-blue-400 transition-all"
                              title="Run Payroll"
                            >
                              <Play size={14} />
                            </Link>
                            <Link
                              href={`/c/${client.slug}/dashboard`}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400 transition-all"
                              title="View Reports"
                            >
                              <BarChart3 size={14} />
                            </Link>
                            <Link
                              href={`/c/${client.slug}/dashboard`}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 dark:hover:text-slate-300 transition-all"
                              title="Open Settings"
                            >
                              <Settings size={14} />
                            </Link>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* ─── UPCOMING DEADLINES TIMELINE — 1/3 ─── */}
        <motion.div variants={itemVariants} className="xl:col-span-1">
          <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700/50">
              <h2 className="text-[16px] font-bold text-slate-900 dark:text-white">Upcoming Deadlines</h2>
              <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">Next 30 days, all clients</p>
            </div>

            <div className="max-h-[620px] overflow-y-auto">
              <div className="px-4 py-3 flex flex-col gap-2">
                {summary.upcomingDeadlines.slice(0, 10).map((deadline, i) => {
                  const TypeIcon = TYPE_ICONS[deadline.type] || CalendarDays;
                  const severityClass = SEVERITY_STYLES[deadline.severity] || SEVERITY_STYLES.normal;
                  const typeColorClass = TYPE_COLORS[deadline.type] || TYPE_COLORS.payroll;
                  return (
                    <motion.div
                      key={deadline.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.3 }}
                      className={`relative border-l-[3px] rounded-xl p-3.5 border border-slate-100 dark:border-slate-700/40 hover:shadow-md transition-all group cursor-pointer ${severityClass}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${typeColorClass}`}>
                          <TypeIcon size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-bold text-slate-800 dark:text-slate-200 leading-tight">
                            {deadline.title}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                            {deadline.description}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                              {formatShortDate(deadline.date)}
                            </span>
                            <span className={`text-[10px] font-bold ${
                              deadline.severity === "critical" ? "text-red-600 dark:text-red-400" :
                              deadline.severity === "warning" ? "text-amber-600 dark:text-amber-400" :
                              "text-slate-400 dark:text-slate-500"
                            }`}>
                              {daysFromNow(deadline.date)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
