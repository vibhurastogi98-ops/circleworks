"use client";

import React from "react";
import Link from "next/link";
import { 
  BarChart3, 
  Wallet, 
  AlertTriangle, 
  ArrowRight, 
  CheckCircle2, 
  Download, 
  Settings,
  Plus,
  ArrowUpRight
} from "lucide-react";
import { getExpenseSummaryStats } from "@/data/mockExpenses";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend 
} from "recharts";

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f97316', '#eab308', '#22c55e'];

export default function ExpensesOverview() {
  const stats = getExpenseSummaryStats();

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Wallet size={22} className="text-white" />
            </div>
            Expenses Overview
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 ml-[52px]">
            Manage employee reimbursements and corporate spend policies.
          </p>
        </div>
        <div className="flex items-center gap-3 ml-[52px] sm:ml-0 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto">
          <button className="flex-shrink-0 flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">
            <Download size={16} /> Export Report
          </button>
          <Link href="/expenses/policies" className="flex-shrink-0 flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">
            <Settings size={16} /> Policies
          </Link>
          <button className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-indigo-600 border border-indigo-500 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/20 active:scale-95">
            <CheckCircle2 size={16} /> Approve All
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Pending Approvals */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Clock size={20} />
            </div>
            <Link href="/expenses/reports?status=Submitted" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5">
              View All <ArrowRight size={12} />
            </Link>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">{stats.pendingReports}</div>
          <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">Reports Pending Approval</div>
        </div>

        {/* Pending Amount */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <BarChart3 size={20} />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">${stats.pendingAmount.toLocaleString()}</div>
          <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">Pending Reimbursement</div>
        </div>

        {/* Policy Violations */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden border-l-4 border-l-amber-500">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <AlertTriangle size={20} />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-600 dark:text-amber-400 mb-1">{stats.violationCount}</div>
          <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">Policy Violations Detected</div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Category Breakdown (Pie Chart) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500" />
            Category Distribution
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {stats.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                   itemStyle={{ color: '#fff' }}
                />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Links & Info */}
        <div className="flex flex-col gap-6">
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 shadow-lg shadow-indigo-500/20 text-white overflow-hidden relative">
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-2">Automate Your Expenses</h3>
              <p className="text-indigo-100 text-sm mb-6 max-w-xs">Set up smart policies to automatically flag or block non-compliant spend before it reaches your desk.</p>
              <Link href="/expenses/policies" className="inline-flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all border border-white">
                Configure Policies <Plus size={16} />
              </Link>
            </div>
            <Wallet size={120} className="absolute bottom-0 right-0 -mb-8 -mr-8 text-white/5 opacity-20 transform -rotate-12" />
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Reimbursement Quick Tasks</h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
               <Link href="/expenses/reports" className="flex items-center justify-between py-3 group">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">Review Reports</span>
                    <span className="text-xs text-slate-500">{stats.pendingReports} submissions waiting</span>
                  </div>
                  <ArrowUpRight size={18} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
               </Link>
               <Link href="/expenses/mileage" className="flex items-center justify-between py-3 group">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">Mileage Log</span>
                    <span className="text-xs text-slate-500">Track and reimburse commute/travel</span>
                  </div>
                  <ArrowUpRight size={18} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
               </Link>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

function Clock(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}
