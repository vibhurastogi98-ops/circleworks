"use client";

import React from "react";
import Link from "next/link";
import { Heart, Shield, Eye, Clock, Settings, AlertTriangle, ChevronRight, DollarSign } from "lucide-react";
import { mockBenefitPlans } from "@/data/mockBenefits";

export default function BenefitsOverview() {
  const totalEnrolled = mockBenefitPlans.reduce((sum, p) => sum + p.enrolled, 0);
  const totalEligible = mockBenefitPlans.reduce((sum, p) => sum + p.eligible, 0);
  const enrollmentPct = Math.round((totalEnrolled / totalEligible) * 100);

  // Group plans by type for the summary
  const planTypes = Array.from(new Set(mockBenefitPlans.map(p => p.type)));

  // Open enrollment countdown (mock: 18 days away)
  const daysToEnrollment = 18;

  // Payroll deduction preview — biweekly schedule
  const PAY_PERIODS_BIWEEKLY = 2.167;
  const pretaxTypes = new Set(["Medical", "Dental", "Vision", "FSA", "HSA", "401k"]);
  const plansWithEePremium = mockBenefitPlans.filter(p => p.status === "Active" && p.employeePremium > 0);
  const payrollPreviewRows = plansWithEePremium.map(p => ({
    ...p,
    perPaycheck: Math.round((p.employeePremium / PAY_PERIODS_BIWEEKLY) * 100) / 100,
    isPretax: pretaxTypes.has(p.type),
  }));

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Benefits Administration</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage employee benefits, enrollment, and compliance.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/benefits/plans" className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm">
            Manage Plans
          </Link>
          <Link href="/benefits/enrollment" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
            Start Enrollment
          </Link>
        </div>
      </div>

      {/* Enrollment Donut + Open Enrollment Countdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col items-center justify-center">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Enrollment Status</h3>
          <div className="relative w-40 h-40">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e2e8f0" strokeWidth="3" className="dark:stroke-slate-800" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#3b82f6" strokeWidth="3" strokeDasharray={`${enrollmentPct}, 100`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-slate-900 dark:text-white">{enrollmentPct}%</span>
              <span className="text-xs text-slate-500">Enrolled</span>
            </div>
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400 mt-4">{totalEnrolled} of {totalEligible} eligible employees</div>
        </div>

        {/* Open Enrollment Countdown */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-6 shadow-sm text-white relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full" />
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full" />
          <div className="relative z-10">
            <h3 className="text-sm font-bold text-blue-200 uppercase tracking-wider mb-2">Open Enrollment</h3>
            <div className="text-5xl font-black mb-1">{daysToEnrollment}</div>
            <div className="text-blue-200 text-sm font-medium">days until enrollment opens</div>
          </div>
          <div className="relative z-10 mt-6">
            <div className="text-xs text-blue-200 mb-1">Nov 1 – Nov 15, 2024</div>
            <Link href="/benefits/enrollment" className="inline-flex items-center gap-1 text-sm font-bold text-white hover:underline mt-2">
              Configure Enrollment <ChevronRight size={14} />
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col gap-3">
          {[
            { label: 'COBRA Administration', href: '/benefits/cobra', icon: Shield, color: 'text-red-500 bg-red-50 dark:bg-red-900/20' },
            { label: '401(k) & Retirement', href: '/benefits/401k', icon: Settings, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
            { label: 'FSA / HSA Accounts', href: '/benefits/fsa-hsa', icon: Heart, color: 'text-green-500 bg-green-50 dark:bg-green-900/20' },
            { label: 'Life & Disability', href: '/benefits/life-disability', icon: Eye, color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20' },
            { label: 'Workers\' Compensation', href: '/benefits/workers-comp', icon: AlertTriangle, color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' },
          ].map(action => (
            <Link key={action.href} href={action.href} className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-800 transition-all group">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${action.color}`}>
                <action.icon size={18} />
              </div>
              <span className="font-medium text-sm text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors flex-1">{action.label}</span>
              <ChevronRight size={16} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
            </Link>
          ))}
        </div>
      </div>

      {/* Payroll Deduction Preview */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
              <DollarSign size={15} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Payroll Deduction Preview</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Per paycheck · Biweekly schedule · Employee share only</p>
            </div>
          </div>
          <Link
            href="/payroll/run"
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 shrink-0"
          >
            View in Payroll Run <ChevronRight size={12} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-2.5 text-left text-xs font-semibold text-slate-500">Plan</th>
                <th className="px-6 py-2.5 text-left text-xs font-semibold text-slate-500">Carrier</th>
                <th className="px-6 py-2.5 text-right text-xs font-semibold text-slate-500">Monthly EE Premium</th>
                <th className="px-6 py-2.5 text-right text-xs font-semibold text-slate-500">Per Paycheck</th>
                <th className="px-6 py-2.5 text-center text-xs font-semibold text-slate-500">Tax Treatment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {payrollPreviewRows.map(row => (
                <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <td className="px-6 py-3 font-medium text-slate-900 dark:text-white">
                    <span className="inline-flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">{row.type}</span>
                      {row.name}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-slate-500 dark:text-slate-400">{row.carrier}</td>
                  <td className="px-6 py-3 text-right font-mono text-slate-700 dark:text-slate-300">${row.employeePremium.toFixed(2)}/mo</td>
                  <td className="px-6 py-3 text-right font-bold font-mono text-red-600 dark:text-red-400">-${row.perPaycheck.toFixed(2)}</td>
                  <td className="px-6 py-3 text-center">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      row.isPretax
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                        : "bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400"
                    }`}>
                      {row.isPretax ? "Pre-tax" : "Post-tax"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 flex items-center justify-between">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Enrollment changes apply to the next scheduled payroll run. 401(k) amounts vary by employee contribution rate.
          </p>
          <Link
            href="/payroll/run"
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 whitespace-nowrap ml-4"
          >
            Preview employee deductions <ChevronRight size={11} />
          </Link>
        </div>
      </div>

      {/* Plans Summary Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Active Plans Summary</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-3">Plan Name</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Carrier</th>
                <th className="px-6 py-3 text-right">EE Premium</th>
                <th className="px-6 py-3 text-right">ER Premium</th>
                <th className="px-6 py-3 text-center">Enrolled</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {mockBenefitPlans.map(plan => (
                <tr key={plan.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{plan.name}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">{plan.type}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{plan.carrier}</td>
                  <td className="px-6 py-4 text-right text-slate-900 dark:text-white font-medium">${plan.employeePremium}/mo</td>
                  <td className="px-6 py-4 text-right text-slate-900 dark:text-white font-medium">${plan.employerPremium}/mo</td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-bold text-slate-900 dark:text-white">{plan.enrolled}</span>
                    <span className="text-slate-400">/{plan.eligible}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
