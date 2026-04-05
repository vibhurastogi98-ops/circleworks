"use client";

import React, { useState } from "react";
import { Plus, Building, CheckCircle2, AlertCircle, RefreshCw, X, Landmark, ShieldCheck } from "lucide-react";
import { mockBankAccounts } from "@/data/mockSettings";
import { toast } from "sonner";

export default function BankSettingsPage() {
  const [accounts, setAccounts] = useState(mockBankAccounts);
  const [showModal, setShowModal] = useState(false);
  const [newBankName, setNewBankName] = useState("");
  const [newLast4, setNewLast4] = useState("");

  const handleLinkBank = () => {
    if (!newBankName || !newLast4) return;
    const newAccount = {
      id: Math.random().toString(36).substr(2, 9),
      name: newBankName,
      type: "Checking",
      accountLast4: newLast4,
      routing: "111000025",
      status: "Pending Micro-deposits",
      isPrimary: false
    };
    setAccounts([...accounts, newAccount]);
    setShowModal(false);
    setNewBankName("");
    setNewLast4("");
    toast.success(`${newBankName} account added.`, {
      description: "Micro-deposits have been initiated. Please check back in 1-2 business days."
    });
  };

  const verifyDeposits = (accName: string) => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: 'Verifying deposits...',
        success: () => {
           setAccounts(prev => prev.map(a => a.name === accName ? {...a, status: 'Verified'} : a));
           return 'Micro-deposits verified! Your account is now active.';
        },
        error: 'Verification failed.',
      }
    );
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-5xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Bank Accounts</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage corporate bank accounts used for payroll funding.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
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
                  <button 
                    onClick={() => verifyDeposits(acc.name)}
                    className="w-full mt-2 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={14} /> Verify Micro-deposits
                  </button>
                )}
            </div>
          </div>
        ))}

        <div 
          onClick={() => setShowModal(true)}
          className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center text-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors cursor-pointer min-h-[220px]"
        >
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Plus size={24} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Add Another Account</h3>
            <p className="text-xs text-slate-500 max-w-[200px] mx-auto">Link instantly with Plaid or verify via micro-deposits.</p>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Link Bank Account</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/30 flex items-start gap-3">
                <ShieldCheck className="text-blue-600 dark:text-blue-400 mt-0.5" size={20} />
                <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed font-medium">
                  CircleWorks uses bank-grade encryption to protect your data. We never store your login credentials.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Bank Name</label>
                <div className="relative">
                   <Landmark size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                   <input 
                    value={newBankName}
                    onChange={(e) => setNewBankName(e.target.value)}
                    placeholder="e.g. Chase, Wells Fargo" 
                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white" 
                   />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Account Number (Last 4)</label>
                <input 
                  value={newLast4}
                  onChange={(e) => setNewLast4(e.target.value)}
                  placeholder="••••" 
                  maxLength={4}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[16px] tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white" 
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">Cancel</button>
              <button 
                onClick={handleLinkBank}
                disabled={!newBankName || newLast4.length < 4}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-bold rounded-lg shadow-sm"
              >
                Add Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
