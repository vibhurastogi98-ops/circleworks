"use client";

import React, { useState } from "react";
import { Plus, Building, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { mockBankAccounts } from "@/data/mockSettings";

export default function BankSettingsPage() {
  const [accounts] = useState(mockBankAccounts);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-5xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Bank Accounts</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage corporate bank accounts used for payroll funding.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
          <Plus size={16} /> Link Bank Account
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {accounts.map((acc) => (
          <div key={acc.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                    <Building size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{acc.name}</h3>
                    <p className="text-xs font-medium text-slate-500">{acc.type} •••• {acc.accountLast4}</p>
                  </div>
                </div>
                {acc.status === "Verified" ? (
                  <span className="flex items-center gap-1 text-green-600 dark:text-green-400 text-xs font-bold bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
                    <CheckCircle2 size={12} /> Verified
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 text-xs font-bold bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded">
                    <AlertCircle size={12} /> Pending
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg mb-4">
                 <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Routing Number</span>
                    <span className="font-mono text-sm text-slate-900 dark:text-white">{acc.routing}</span>
                 </div>
                 <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Account Number</span>
                    <span className="font-mono text-sm text-slate-900 dark:text-white">•••• {acc.accountLast4}</span>
                 </div>
              </div>

               {acc.isPrimary && (
                 <div className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded flex items-center gap-2">
                   <CheckCircle2 size={14} /> Primary payroll funding account
                 </div>
               )}
               {!acc.isPrimary && acc.status === "Pending Micro-deposits" && (
                 <button className="w-full mt-2 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-center gap-2">
                   <RefreshCw size={14} /> Verify Micro-deposits
                 </button>
               )}
            </div>
          </div>
        ))}

        <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center text-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors cursor-pointer min-h-[220px]">
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Plus size={24} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Add Another Account</h3>
            <p className="text-xs text-slate-500 max-w-[200px] mx-auto">Link instantly with Plaid or verify via micro-deposits.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
