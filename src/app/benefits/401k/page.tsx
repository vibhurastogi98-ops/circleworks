"use client";

import React from "react";
import { Download, ExternalLink, CheckCircle2, AlertTriangle } from "lucide-react";
import { mockRetirementAccounts } from "@/data/mockBenefits";

export default function RetirementPage() {
  const totalYtdEE = mockRetirementAccounts.reduce((s, a) => s + a.ytdEmployee, 0);
  const totalYtdER = mockRetirementAccounts.reduce((s, a) => s + a.ytdEmployer, 0);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">401(k) & Retirement</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Monitor contribution rates, employer match, and IRS limits.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm">
          <Download size={16} /> Download Contribution File
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <h4 className="text-sm font-medium text-slate-500 mb-1">YTD Employee Contributions</h4>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">${totalYtdEE.toLocaleString()}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <h4 className="text-sm font-medium text-slate-500 mb-1">YTD Employer Match</h4>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">${totalYtdER.toLocaleString()}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <h4 className="text-sm font-medium text-slate-500 mb-1">Participation Rate</h4>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">78%</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex items-start justify-between">
          <div>
            <h4 className="text-sm font-medium text-slate-500 mb-1">Provider</h4>
            <div className="text-lg font-bold text-slate-900 dark:text-white">Guideline</div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 flex items-center gap-1"><CheckCircle2 size={10}/> Connected</span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Employee Contributions</h3>
          <span className="text-xs text-slate-500">2024 IRS Limit: $23,000</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-3">Employee</th>
                <th className="px-6 py-3 text-right">Rate</th>
                <th className="px-6 py-3 text-right">ER Match</th>
                <th className="px-6 py-3 text-right">YTD Employee</th>
                <th className="px-6 py-3 text-right">YTD Employer</th>
                <th className="px-6 py-3">IRS Limit Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {mockRetirementAccounts.map((acct, i) => {
                const limitPct = Math.round((acct.ytdEmployee / acct.irsLimit) * 100);
                const nearLimit = limitPct >= 85;
                return (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{acct.employeeName}</td>
                    <td className="px-6 py-4 text-right font-medium text-slate-900 dark:text-white">{acct.contributionRate}%</td>
                    <td className="px-6 py-4 text-right text-slate-600 dark:text-slate-400">{acct.employerMatch}%</td>
                    <td className="px-6 py-4 text-right font-medium text-slate-900 dark:text-white">${acct.ytdEmployee.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right text-slate-600 dark:text-slate-400">${acct.ytdEmployer.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${nearLimit ? 'bg-amber-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(100, limitPct)}%` }} />
                        </div>
                        <span className={`text-xs font-bold ${nearLimit ? 'text-amber-600' : 'text-slate-500'}`}>{limitPct}%</span>
                        {nearLimit && <AlertTriangle size={14} className="text-amber-500" />}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
