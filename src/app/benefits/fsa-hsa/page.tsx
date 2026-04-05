"use client";

import React, { useState } from "react";
import { Download, AlertTriangle, Wallet } from "lucide-react";
import { mockFsaHsaAccounts } from "@/data/mockBenefits";

export default function FsaHsaPage() {
  const [typeFilter, setTypeFilter] = useState<'All' | 'FSA' | 'HSA'>('All');
  const filtered = mockFsaHsaAccounts.filter(a => typeFilter === 'All' || a.accountType === typeFilter);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">FSA / HSA Accounts</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Track balances, elections, and contribution limits.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm">
          <Download size={16} /> Download for TPA
        </button>
      </div>

      <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          {(['All', 'FSA', 'HSA'] as const).map(t => (
            <button key={t} onClick={() => setTypeFilter(t)} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${typeFilter === t ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-600 dark:text-slate-400"}`}>{t}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((acct, i) => {
          const usagePct = Math.round((acct.ytdSpent / acct.annualElection) * 100);
          const contributionPct = Math.round((acct.ytdContributions / acct.annualElection) * 100);
          const isFsa = acct.accountType === 'FSA';
          const remainingToSpend = acct.annualElection - acct.ytdSpent;

          return (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isFsa ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-600' : 'bg-green-100 dark:bg-green-900/20 text-green-600'}`}>
                    <Wallet size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{acct.employeeName}</h3>
                    <span className={`text-xs font-bold uppercase tracking-wider ${isFsa ? 'text-orange-600' : 'text-green-600'}`}>{acct.accountType}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500">Balance</div>
                  <div className="text-xl font-black text-slate-900 dark:text-white">${acct.balance.toLocaleString()}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                  <div className="text-xs text-slate-500 mb-1">Annual Election</div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white">${acct.annualElection.toLocaleString()}</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                  <div className="text-xs text-slate-500 mb-1">YTD Contributed</div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white">${acct.ytdContributions.toLocaleString()}</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                  <div className="text-xs text-slate-500 mb-1">YTD Spent</div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white">${acct.ytdSpent.toLocaleString()}</div>
                </div>
              </div>

              {/* Usage bar */}
              <div>
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Funds Used</span>
                  <span>{usagePct}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${isFsa ? 'bg-orange-500' : 'bg-green-500'}`} style={{ width: `${usagePct}%` }} />
                </div>
              </div>

              {/* FSA use-it-or-lose-it warning */}
              {isFsa && remainingToSpend > 500 && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-lg text-xs">
                  <AlertTriangle size={14} className="text-amber-500 shrink-0" />
                  <span className="text-amber-800 dark:text-amber-300 font-medium">${remainingToSpend.toLocaleString()} remaining. FSA funds expire Dec 31 — use it or lose it!</span>
                </div>
              )}

              <div className="text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                IRS Limit: ${acct.irsLimit.toLocaleString()}/year
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
