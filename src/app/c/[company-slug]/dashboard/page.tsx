"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft, Building2, Users, DollarSign, BarChart3,
  Settings, Play, Calendar, TrendingUp, FileText,
  Shield, Clock, ChevronRight, ExternalLink, Receipt,
  UserPlus, Heart, AlertTriangle, CheckCircle2
} from "lucide-react";
import AppTopBar from "@/components/AppTopBar";
import AppSidebar from "@/components/AppSidebar";

interface ClientDetail {
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
  ein: string;
  monthlyPayrollVolume: number;
  pendingApprovals: number;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatShortDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const STATUS_STYLES = {
  on_time: {
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-400",
    dot: "bg-emerald-500",
    border: "border-emerald-200 dark:border-emerald-500/20",
    label: "Payroll On Time",
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
    label: "Issue Detected",
  },
};

const QUICK_NAV = [
  { label: "Run Payroll", icon: Play, color: "bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400", href: "/payroll/run" },
  { label: "Employees", icon: Users, color: "bg-violet-100 dark:bg-violet-500/15 text-violet-600 dark:text-violet-400", href: "/employees" },
  { label: "Reports", icon: BarChart3, color: "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400", href: "/reports" },
  { label: "Payroll History", icon: Clock, color: "bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400", href: "/payroll/history" },
  { label: "Benefits", icon: Heart, color: "bg-pink-100 dark:bg-pink-500/15 text-pink-600 dark:text-pink-400", href: "/benefits" },
  { label: "Compliance", icon: Shield, color: "bg-cyan-100 dark:bg-cyan-500/15 text-cyan-600 dark:text-cyan-400", href: "/compliance/dashboard" },
  { label: "Expenses", icon: Receipt, color: "bg-orange-100 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400", href: "/expenses" },
  { label: "Settings", icon: Settings, color: "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400", href: "/settings/company" },
];

export default function CompanyDashboardPage({ 
  params 
}: { 
  params: Promise<{ "company-slug": string }> 
}) {
  const resolvedParams = use(params);
  const companySlug = resolvedParams["company-slug"];
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/accountant/clients")
      .then((r) => r.json())
      .then((data) => {
        const found = (data.clients || []).find(
          (c: ClientDetail) => c.slug === companySlug
        );
        setClient(found || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [companySlug]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50 dark:bg-[#0B1120]">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 lg:ml-[72px] xl:ml-[240px]">
          <AppTopBar />
          <main className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
              <p className="text-sm font-medium text-slate-400 animate-pulse">Loading company...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex min-h-screen bg-slate-50 dark:bg-[#0B1120]">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 lg:ml-[72px] xl:ml-[240px]">
          <AppTopBar />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-[20px] font-bold text-slate-900 dark:text-white mb-2">Company not found</h2>
              <p className="text-[13px] text-slate-500 mb-4">The company &quot;{companySlug}&quot; could not be found.</p>
              <Link
                href="/accountant-portal"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-[13px] font-bold hover:bg-indigo-700 transition-colors"
              >
                <ArrowLeft size={14} />
                Back to All Clients
              </Link>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const statusStyle = STATUS_STYLES[client.status];

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#0B1120]">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-[72px] xl:ml-[240px]">
        {/* Custom Top Bar with breadcrumb */}
        <div className="sticky top-0 z-40 flex flex-col w-full shadow-sm">
          {/* Back to All Clients Banner */}
          <div className="h-10 bg-indigo-600 dark:bg-indigo-700 flex items-center px-4 lg:px-6">
            <Link
              href="/accountant-portal"
              className="flex items-center gap-2 text-white/90 hover:text-white transition-colors group"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-[12px] font-bold">Back to All Clients</span>
            </Link>
            <div className="flex items-center gap-2 ml-4">
              <span className="text-white/40 text-[12px]">/</span>
              <span className="text-white/90 text-[12px] font-medium">
                Accountant Portal
              </span>
              <span className="text-white/40 text-[12px]">/</span>
              <span className="text-white text-[12px] font-bold">
                {client.name}
              </span>
            </div>
          </div>
          <AppTopBar />
        </div>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
            {/* Company Header Card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 p-6"
            >
              <div className="absolute top-0 right-0 w-80 h-40 bg-gradient-to-bl from-indigo-500/5 via-blue-500/3 to-transparent rounded-bl-[80px]" />
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-2 border-slate-200 dark:border-slate-700 flex-shrink-0">
                  <img src={client.logoUrl} alt={client.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-[22px] font-extrabold text-slate-900 dark:text-white">
                      {client.name}
                    </h1>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                      {statusStyle.label}
                    </span>
                  </div>
                  <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">
                    {client.industry} · {client.state} · EIN: {client.ein} · {client.plan} Plan
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 sm:flex-shrink-0">
                  <button className="h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-bold shadow-sm hover:shadow-lg hover:shadow-indigo-500/20 transition-all flex items-center gap-2">
                    <Play size={14} />
                    Run Payroll
                  </button>
                  <button className="h-9 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-[13px] font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
                    <BarChart3 size={14} />
                    Reports
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-4"
            >
              <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Users size={16} className="text-blue-600 dark:text-blue-400" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Employees</span>
                </div>
                <p className="text-[28px] font-extrabold text-slate-900 dark:text-white leading-none">{client.employeeCount}</p>
                <p className="text-[11px] text-slate-400 mt-1">+{client.contractorCount} contractors</p>
              </div>
              <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar size={16} className="text-amber-600 dark:text-amber-400" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Next Payroll</span>
                </div>
                <p className="text-[20px] font-extrabold text-slate-900 dark:text-white leading-none">{formatShortDate(client.nextPayrollDate)}</p>
                <p className="text-[11px] text-slate-400 mt-1">{formatCurrency(client.nextPayrollAmount)}</p>
              </div>
              <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={16} className="text-emerald-600 dark:text-emerald-400" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Monthly Volume</span>
                </div>
                <p className="text-[28px] font-extrabold text-slate-900 dark:text-white leading-none">{formatCurrency(client.monthlyPayrollVolume)}</p>
              </div>
              <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 size={16} className="text-violet-600 dark:text-violet-400" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pending</span>
                </div>
                <p className="text-[28px] font-extrabold text-slate-900 dark:text-white leading-none">{client.pendingApprovals}</p>
                <p className="text-[11px] text-slate-400 mt-1">Approvals waiting</p>
              </div>
            </motion.div>

            {/* Quick Navigation Grid */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <h2 className="text-[15px] font-bold text-slate-900 dark:text-white mb-3">Quick Navigation</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {QUICK_NAV.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="group flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 hover:shadow-lg hover:shadow-indigo-500/5 hover:-translate-y-0.5 transition-all"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
                      <item.icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[13px] font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">
                        {item.label}
                      </span>
                    </div>
                    <ChevronRight size={14} className="text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Recent Activity placeholder */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 rounded-2xl overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700/50">
                <h2 className="text-[16px] font-bold text-slate-900 dark:text-white">Recent Activity</h2>
              </div>
              <div className="px-6 py-8 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                  <Clock size={20} className="text-slate-400" />
                </div>
                <p className="text-[13px] font-bold text-slate-700 dark:text-slate-300">Activity Timeline</p>
                <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
                  Real-time payroll, HR, and compliance events for {client.name} will appear here.
                </p>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
