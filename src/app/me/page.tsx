"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  DollarSign, Clock, Receipt, CreditCard, FileText, Star,
  CalendarDays, AlertCircle, ChevronRight, Megaphone, Gift,
  Plane, Thermometer, User as UserIcon
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import {
  mockPtoBalances, mockPendingTasks, mockAnnouncements, mockKudos, mockPayStubs,
} from "@/data/mockEmployeePortal";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

const quickActions = [
  { label: "Request Time Off", icon: Plane, href: "/me/time-off", color: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" },
  { label: "Submit Expense", icon: Receipt, href: "/me/expenses", color: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" },
  { label: "Update Bank Info", icon: CreditCard, href: "/me/profile", color: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400" },
  { label: "View Pay Stub", icon: DollarSign, href: "/me/paystubs", color: "bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400" },
];

const ptoIcons: Record<string, React.ElementType> = {
  Vacation: Plane,
  Sick: Thermometer,
  Personal: UserIcon,
};

export default function EmployeeHomePage() {
  const { user } = useUser();
  const firstName = user?.firstName || "there";
  const latestStub = mockPayStubs[0];
  const nextPayDate = new Date(latestStub.payDate);
  nextPayDate.setDate(nextPayDate.getDate() + 14);

  return (
    <>
      {/* Greeting Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-500 p-6 md:p-8 text-white shadow-lg"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9zdmc+')] opacity-40" />
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold">
            {getGreeting()}, {firstName}! 👋
          </h1>
          <p className="mt-2 text-white/80 text-[15px]">
            Next paycheck: <span className="font-bold text-white">${latestStub.netPay.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span> on{" "}
            <span className="font-bold text-white">{nextPayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </p>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-[15px] font-bold text-slate-900 dark:text-white mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((action, i) => (
            <motion.div key={action.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link
                href={action.href}
                className="flex flex-col items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/40 hover:shadow-md hover:-translate-y-0.5 transition-all group"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${action.color}`}>
                  <action.icon size={20} />
                </div>
                <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 text-center group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                  {action.label}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* PTO Balances */}
      <div>
        <h2 className="text-[15px] font-bold text-slate-900 dark:text-white mb-3">PTO Balances</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {mockPtoBalances.map((pto) => {
            const Icon = ptoIcons[pto.type] || CalendarDays;
            const pct = Math.round((pto.used / pto.total) * 100);
            return (
              <motion.div
                key={pto.type}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/40"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
                    <Icon size={16} className="text-violet-600 dark:text-violet-400" />
                  </div>
                  <span className="text-[13px] font-bold text-slate-900 dark:text-white">{pto.type}</span>
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">{pto.balance} <span className="text-sm font-medium text-slate-400">days</span></div>
                <div className="mt-2 w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{pto.used} used of {pto.total}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Tasks */}
        <div>
          <h2 className="text-[15px] font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <AlertCircle size={16} className="text-amber-500" /> Pending Tasks
          </h2>
          <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/40 divide-y divide-slate-100 dark:divide-slate-700/40">
            {mockPendingTasks.map(task => (
              <Link key={task.id} href={task.link} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                <div className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-slate-900 dark:text-white truncate group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">{task.title}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Due {new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                </div>
                <ChevronRight size={14} className="text-slate-400" />
              </Link>
            ))}
          </div>
        </div>

        {/* Kudos */}
        <div>
          <h2 className="text-[15px] font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <Star size={16} className="text-yellow-500" /> Kudos Received
          </h2>
          <div className="flex flex-col gap-3">
            {mockKudos.map(kudo => (
              <motion.div
                key={kudo.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/40"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 flex items-center justify-center text-white text-[11px] font-bold">
                    {kudo.from.charAt(0)}
                  </div>
                  <span className="text-[13px] font-bold text-slate-900 dark:text-white">{kudo.from}</span>
                  <span className="text-[11px] text-slate-400 ml-auto">{new Date(kudo.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
                <p className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">{kudo.message}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Announcements */}
      <div>
        <h2 className="text-[15px] font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <Megaphone size={16} className="text-blue-500" /> Recent Announcements
        </h2>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/40 divide-y divide-slate-100 dark:divide-slate-700/40">
          {mockAnnouncements.map(ann => (
            <div key={ann.id} className="px-4 py-3">
              <div className="flex items-center gap-2">
                <h3 className="text-[13px] font-bold text-slate-900 dark:text-white">{ann.title}</h3>
                <span className="text-[11px] text-slate-400 ml-auto flex-shrink-0">{new Date(ann.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </div>
              <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{ann.preview}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
