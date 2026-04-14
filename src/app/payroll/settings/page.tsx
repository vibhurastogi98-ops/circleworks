"use client";
import React, { useState, useEffect } from "react";
import { 
  Settings2, Save, Wallet, AlertOctagon, TrendingUp, TrendingDown, 
  Download, Filter, AlertTriangle, ArrowRight, Activity 
} from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"general" | "funding">("general");

  return (
    <div className="flex flex-col gap-6 pb-24 max-w-6xl mx-auto animate-in fade-in">
       <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
             <Settings2 size={28} className="text-blue-600" />
            Payroll Settings & Funding
          </h1>
          <p className="text-sm text-slate-500 mt-2">Configure payroll autopilot, approval chains, and monitor your trust account impound balances.</p>
        </div>
        {activeTab === "general" && (
          <button 
            onClick={() => toast.success("Settings Saved!")}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md flex items-center gap-2 transition-all"
          >
            <Save size={16} /> Save Settings
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-xl w-max">
        <button
          onClick={() => setActiveTab("general")}
          className={`px-5 py-2 text-sm font-bold rounded-lg transition-all ${
            activeTab === "general"
              ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          General Workflow Settings
        </button>
        <button
          onClick={() => setActiveTab("funding")}
          className={`px-5 py-2 text-sm font-bold rounded-lg transition-all ${
            activeTab === "funding"
              ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          Funding & Trust Reconciliation
        </button>
      </div>

      {activeTab === "general" && <GeneralSettingsTab />}
      {activeTab === "funding" && <FundingReconciliationTab />}
    </div>
  );
}

// ------------------------------------------
// GENERAL SETTINGS TAB (Original UI Ported)
// ------------------------------------------
function GeneralSettingsTab() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 space-y-10 animate-in slide-in-from-bottom-4 shadow-sm">
         <section>
           <h3 className="text-xl font-bold mb-4 border-b border-slate-100 dark:border-slate-800 pb-3 text-slate-800 dark:text-slate-100">Funding Timing</h3>
           <div className="grid grid-cols-2 gap-4">
             <div className="p-5 flex flex-col justify-between border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/10 rounded-xl cursor-pointer">
                <div className="flex items-center gap-2 mb-3">
                  <input type="radio" name="funding" defaultChecked className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">2-Day ACH (Default)</h4>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Submit payroll by Wednesday 5PM PT to pay employees on Friday. Zero outbound fees.</p>
             </div>
             <div className="p-5 flex flex-col justify-between border border-slate-200 dark:border-slate-700 rounded-xl opacity-60">
                <div className="flex items-center gap-2 mb-3">
                  <input type="radio" name="funding" disabled className="w-4 h-4" />
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">Next-Day Expedited ACH <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest font-black">Locked</span></h4>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Submit payroll by Thursday 5PM PT. Requires additional automated underwriting approval to unlock.</p>
             </div>
           </div>
         </section>

         <section>
           <h3 className="text-xl font-bold mb-4 border-b border-slate-100 dark:border-slate-800 pb-3 text-slate-800 dark:text-slate-100">Payroll Approver Chain</h3>
           <div className="space-y-4">
             <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Select who must mathematically approve payroll before ACH debit requests are issued.</p>
             
             <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
               <span className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-black text-slate-700 dark:text-slate-300 shadow-sm">1</span>
               <select className="flex-1 max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none">
                 <option>Sarah Chen (Finance Manager)</option>
               </select>
             </div>
             
             <div className="flex items-center justify-center h-4 w-8 border-r-2 border-slate-200 dark:border-slate-700" />
             
             <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
               <span className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-black text-slate-700 dark:text-slate-300 shadow-sm">2</span>
               <select className="flex-1 max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none">
                 <option>Michael Torres (HR Director)</option>
               </select>
             </div>
             
             <button className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-4 px-2">
               + Add Sequential Step
             </button>
           </div>
         </section>

         <section>
           <h3 className="text-xl font-bold mb-4 border-b border-slate-100 dark:border-slate-800 pb-3 text-slate-800 dark:text-slate-100">Autopilot Services</h3>
           <label className="flex items-start gap-4 p-5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer transition-colors">
             <input type="checkbox" className="mt-1 w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
             <div>
               <h4 className="font-bold text-slate-900 dark:text-white">Enable AutoPayroll Processing</h4>
               <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">Automatically batch and run scheduled payroll for designated Autopilot salaried employees 2 days before deadline. You will still receive a preview exception-report email 24 hours prior to funds capture.</p>
             </div>
           </label>
         </section>
    </div>
  );
}

// ------------------------------------------
// FUNDING RECONCILIATION TAB (New logic)
// ------------------------------------------
function FundingReconciliationTab() {
  const [balanceData, setBalanceData] = useState<any>(null);
  const [historyData, setHistoryData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/payroll/funding/balance").then(res => res.json()),
      fetch("/api/payroll/funding/history").then(res => res.json())
    ]).then(([balance, history]) => {
      setBalanceData(balance);
      setHistoryData(history);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <Activity className="animate-spin text-slate-400" size={32} />
      </div>
    );
  }

  return (
    <div className="animate-in slide-in-from-bottom-4 space-y-6">
      
      {/* 2X IMPound Warning Banner */}
      {balanceData?.isBelowWarningThreshold && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-xl flex items-start gap-4">
          <AlertOctagon className="text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-bold text-amber-900 dark:text-amber-100">Low Escrow Impound Balance</h4>
            <p className="text-sm text-amber-800 dark:text-amber-200/70 mt-1">Your trust account balance (${(balanceData?.impoundBalance || 0).toLocaleString()}) has dropped below our recommended 2x upcoming payroll threshold (${((balanceData?.upcomingPayroll || 0) * 2).toLocaleString()}). Consider wiring additional pre-funds to avoid direct debit delays.</p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-500 mb-1 flex items-center justify-between">
              Impound Balance
              {balanceData?.status === 'Funded' 
                 ? <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded uppercase tracking-wider font-bold">Funded</span>
                 : <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded uppercase tracking-wider font-bold">Insufficient</span>}
            </h3>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">${(balanceData?.impoundBalance || 0).toLocaleString()}</p>
         </div>

         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-500 mb-1">Upcoming PR Target</h3>
            <p className="text-2xl font-bold text-slate-700 dark:text-slate-300 mt-3">${(balanceData?.upcomingPayroll || 0).toLocaleString()}</p>
         </div>

         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-500 mb-1">Late Pending ACH Debits</h3>
            <p className="text-2xl font-bold text-red-600 mt-3">${(balanceData?.pendingAchDebits || 0).toLocaleString()}</p>
         </div>

         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/10 dark:to-slate-900">
            <h3 className="text-sm font-bold text-slate-500 mb-1">Next Expected Funding</h3>
            <p className="text-xl font-bold text-slate-900 dark:text-white mt-3">April 12th, 12PM</p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* TRUST ACCOUNT STATEMENT COL */}
        <div className="md:col-span-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
           <div className="flex items-center gap-2 text-slate-500 mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
             <Wallet size={20} />
             <h3 className="font-bold text-lg text-slate-900 dark:text-white">Trust Statement</h3>
           </div>
           
           <div className="space-y-4 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-slate-500">Statement Period</span>
                <span className="font-medium">{historyData?.statement.period}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Opening Balance</span>
                <span className="font-medium">${historyData?.statement.openingBalance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-600 flex items-center gap-1"><TrendingUp size={14}/> Deposits (In)</span>
                <span className="font-bold text-emerald-600">+${historyData?.statement.totalCredits.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 flex items-center gap-1"><TrendingDown size={14}/> Withdrawals (Out)</span>
                <span className="font-bold">-${historyData?.statement.totalDebits.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                <span className="font-bold text-slate-900 dark:text-white text-base">Closing Balance</span>
                <span className="font-black text-slate-900 dark:text-white text-lg">${historyData?.statement.closingBalance.toLocaleString()}</span>
              </div>
           </div>

           <div className="bg-amber-100/50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 rounded-lg p-3 text-xs flex gap-2">
              <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={14} />
              <p className="text-amber-800 dark:text-amber-500">1 Unmatched debit/credit found. Please reconcile manual transactions below with payroll run IDs.</p>
           </div>
        </div>

        {/* LEDGER HISTORY TABLE COL */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
           <div className="p-4 border-b border-slate-100 flex items-center justify-between">
             <h3 className="font-bold text-lg text-slate-900 dark:text-white">Funding History</h3>
             <div className="flex gap-2">
               <button className="p-1.5 border border-slate-200 rounded text-slate-500 hover:bg-slate-50"><Filter size={16}/></button>
               <button className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded hover:bg-slate-200 transition-colors">
                 <Download size={14} /> Export
               </button>
             </div>
           </div>

           <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-sm">
                 <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                   <tr>
                     <th className="px-4 py-3">Date</th>
                     <th className="px-4 py-3">Description</th>
                     <th className="px-4 py-3 text-center">Reference</th>
                     <th className="px-4 py-3 text-center">Payroll ID</th>
                     <th className="px-4 py-3 text-right">Credit (In)</th>
                     <th className="px-4 py-3 text-right">Debit (Out)</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {historyData?.ledger.map((tx: any) => {
                      const isUnmatched = tx.payrollRun === "-"; // trigger amber warning row
                      return (
                        <tr key={tx.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/30 ${isUnmatched ? 'bg-amber-50/30 dark:bg-amber-900/5' : ''}`}>
                          <td className="px-4 py-3 whitespace-nowrap text-slate-500 text-xs">
                             {new Date(tx.date).toLocaleDateString("en-US", {month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'})}
                          </td>
                          <td className={`px-4 py-3 font-medium ${isUnmatched ? 'text-amber-800 dark:text-amber-400' : 'text-slate-900 dark:text-slate-200'}`}>
                             {tx.note} {isUnmatched && <span className="inline-block ml-2 text-[10px] bg-amber-100 text-amber-700 px-1 py-0.5 rounded">Unmatched</span>}
                          </td>
                          <td className="px-4 py-3 text-center text-xs font-mono text-slate-400">{tx.reference}</td>
                          <td className="px-4 py-3 text-center">
                             {isUnmatched ? (
                               <button className="text-[10px] font-bold text-blue-600 border border-blue-200 px-2 py-0.5 rounded hover:bg-blue-50">Match Run</button>
                             ) : (
                               <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded">{tx.payrollRun}</span>
                             )}
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-emerald-600">
                             {tx.type === 'Credit' ? `+$${tx.amount.toLocaleString()}` : ''}
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-slate-700 dark:text-slate-300">
                             {tx.type === 'Debit' ? `-$${tx.amount.toLocaleString()}` : ''}
                          </td>
                        </tr>
                      );
                    })}
                 </tbody>
              </table>
           </div>
        </div>
      </div>

    </div>
  );
}
