"use client";
import React, { useState, useEffect, useMemo } from "react";
import { 
  Settings2, Save, Wallet, AlertOctagon, TrendingUp, TrendingDown, 
  Download, AlertTriangle, Activity, FileText, Mail, Bell
} from "lucide-react";
import { toast } from "sonner";

type FundingStatus = "Funded" | "Pending" | "Insufficient Funds";

type FundingLedgerItem = {
  id: string;
  date: string;
  type: "Debit" | "Credit";
  amount: number;
  status: string;
  reference: string;
  payrollRun: string;
  note: string;
  matched: boolean;
};

function fmtMoney(amount = 0) {
  return amount.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function statusBadgeClass(status: FundingStatus) {
  if (status === "Funded") return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300";
  if (status === "Pending") return "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300";
  return "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300";
}

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
           <h3 className="text-xl font-bold mb-4 border-b border-slate-100 dark:border-slate-800 pb-3 text-slate-800 dark:text-slate-100">Check Date Calculation</h3>
           <div className="grid gap-4 md:grid-cols-2">
             <label className="rounded-xl border-2 border-blue-500 bg-blue-50 p-5 dark:bg-blue-900/10">
               <div className="flex items-center gap-2">
                 <input type="radio" name="check-date-method" defaultChecked className="text-blue-600" />
                 <span className="text-sm font-bold text-slate-900 dark:text-white">Use scheduled payday</span>
               </div>
               <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">If payday lands on a bank holiday or weekend, move to the prior business day.</p>
             </label>
             <label className="rounded-xl border border-slate-200 p-5 dark:border-slate-700">
               <div className="flex items-center gap-2">
                 <input type="radio" name="check-date-method" className="text-blue-600" />
                 <span className="text-sm font-bold text-slate-900 dark:text-white">Always pay after period close</span>
               </div>
               <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Calculate check dates from pay period end plus configured processing days.</p>
             </label>
           </div>
         </section>

         <section>
           <h3 className="text-xl font-bold mb-4 border-b border-slate-100 dark:border-slate-800 pb-3 text-slate-800 dark:text-slate-100">Payroll Bank Account</h3>
           <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800/50">
             <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
               <div>
                 <p className="text-sm font-black text-slate-900 dark:text-white">Operating Checking •••• 4821</p>
                 <p className="mt-1 text-sm text-slate-500">ACH debit account used for payroll funding and tax payments.</p>
               </div>
               <button className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                 Change account
               </button>
             </div>
           </div>
         </section>

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

         <section>
           <h3 className="text-xl font-bold mb-4 border-b border-slate-100 dark:border-slate-800 pb-3 text-slate-800 dark:text-slate-100">Notification Settings</h3>
           <div className="grid gap-3 md:grid-cols-3">
             {["Payroll draft ready", "Approval requested", "Payroll processed"].map((label) => (
               <label key={label} className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                 <input type="checkbox" defaultChecked className="h-5 w-5 rounded border-slate-300 text-blue-600" />
                 <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{label}</span>
               </label>
             ))}
           </div>
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
  const [startDate, setStartDate] = useState("2026-03-01");
  const [endDate, setEndDate] = useState("2026-04-30");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ startDate, endDate });
    Promise.all([
      fetch("/api/payroll/funding/balance").then(res => res.json()),
      fetch(`/api/payroll/funding/history?${params.toString()}`).then(res => res.json())
    ]).then(([balance, history]) => {
      setBalanceData(balance);
      setHistoryData(history);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [startDate, endDate]);

  const ledger: FundingLedgerItem[] = historyData?.ledger || [];
  const unmatchedCount = useMemo(() => ledger.filter((tx) => !tx.matched).length, [ledger]);
  const fundingStatus = (balanceData?.status || "Pending") as FundingStatus;

  const exportCsv = () => {
    const rows = [
      ["Date", "Type", "Amount", "Status", "Reference #", "Payroll Run"],
      ...ledger.map((tx) => [tx.date, tx.type, tx.amount, tx.status, tx.reference, tx.payrollRun]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `funding-history-${startDate}-to-${endDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportPdf = () => {
    toast.success("Funding history PDF export queued");
  };

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
            <p className="text-sm text-amber-800 dark:text-amber-200/70 mt-1">Your trust account balance ({fmtMoney(balanceData?.impoundBalance)}) has dropped below the required 2x upcoming payroll threshold ({fmtMoney((balanceData?.upcomingPayroll || 0) * 2)}). Email and in-app alerts are enabled for finance admins.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {(balanceData?.alerts || []).map((alert: any) => (
          <div key={alert.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-start gap-3 shadow-sm">
            {alert.channel === "email" ? <Mail size={17} className="text-blue-600 mt-0.5" /> : <Bell size={17} className="text-blue-600 mt-0.5" />}
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-slate-500">{alert.channel} alert</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1">{alert.message}</p>
            </div>
          </div>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-500 mb-1 flex items-center justify-between">
              Impound Balance
              <span className={`text-[10px] px-2 py-0.5 rounded uppercase tracking-wider font-bold ${statusBadgeClass(fundingStatus)}`}>{fundingStatus}</span>
            </h3>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">{fmtMoney(balanceData?.impoundBalance)}</p>
         </div>

         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-500 mb-1">Pending ACH Debits</h3>
            <p className="text-2xl font-bold text-slate-700 dark:text-slate-300 mt-3">{fmtMoney(balanceData?.pendingAchDebits)}</p>
         </div>

         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-500 mb-1">Last Funded Amount</h3>
            <p className="text-2xl font-bold text-slate-700 dark:text-slate-300 mt-3">{fmtMoney(balanceData?.lastFundedAmount)}</p>
            <p className="text-xs text-slate-400 mt-1">{new Date(balanceData?.lastFundedDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
         </div>

         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/10 dark:to-slate-900">
            <h3 className="text-sm font-bold text-slate-500 mb-1">Next Funding Date</h3>
            <p className="text-xl font-bold text-slate-900 dark:text-white mt-3">{new Date(balanceData?.nextFundingDate).toLocaleDateString("en-US", { month: "long", day: "numeric" })}</p>
            <p className="text-xs text-slate-500 mt-1">{new Date(balanceData?.nextFundingDate).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* TRUST ACCOUNT STATEMENT COL */}
        <div className="md:col-span-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
           <div className="flex items-center gap-2 text-slate-500 mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
             <Wallet size={20} />
             <h3 className="font-bold text-lg text-slate-900 dark:text-white">Trust Account Statement</h3>
           </div>
           
           <div className="space-y-4 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-slate-500">Statement Period</span>
                <span className="font-medium">{historyData?.statement.period}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Opening Balance</span>
                <span className="font-medium">{fmtMoney(historyData?.statement.openingBalance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-600 flex items-center gap-1"><TrendingUp size={14}/> Credits</span>
                <span className="font-bold text-emerald-600">+{fmtMoney(historyData?.statement.totalCredits)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 flex items-center gap-1"><TrendingDown size={14}/> Debits</span>
                <span className="font-bold">-{fmtMoney(historyData?.statement.totalDebits)}</span>
              </div>
              <div className="flex justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                <span className="font-bold text-slate-900 dark:text-white text-base">Closing Balance</span>
                <span className="font-black text-slate-900 dark:text-white text-lg">{fmtMoney(historyData?.statement.closingBalance)}</span>
              </div>
           </div>

           <div className="bg-amber-100/50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 rounded-lg p-3 text-xs flex gap-2">
              <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={14} />
              <p className="text-amber-800 dark:text-amber-500">{unmatchedCount} unmatched item{unmatchedCount === 1 ? "" : "s"} found. Match transactions against payroll runs for reconciliation.</p>
           </div>
        </div>

        {/* LEDGER HISTORY TABLE COL */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
           <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
             <h3 className="font-bold text-lg text-slate-900 dark:text-white">Funding History</h3>
             <div className="flex flex-wrap items-center gap-2">
               <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="px-2 py-1.5 border border-slate-200 dark:border-slate-700 rounded text-xs bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300" />
               <span className="text-xs text-slate-400">to</span>
               <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} className="px-2 py-1.5 border border-slate-200 dark:border-slate-700 rounded text-xs bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300" />
               <button onClick={exportCsv} className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded hover:bg-slate-200 transition-colors">
                 <Download size={14} /> CSV
               </button>
               <button onClick={exportPdf} className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded hover:bg-slate-200 transition-colors">
                 <FileText size={14} /> PDF
               </button>
             </div>
           </div>

           <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-sm">
                 <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
	                   <tr>
	                     <th className="px-4 py-3">Date</th>
	                     <th className="px-4 py-3">Type</th>
	                     <th className="px-4 py-3 text-right">Amount</th>
	                     <th className="px-4 py-3 text-center">Status</th>
	                     <th className="px-4 py-3 text-center">Reference #</th>
	                     <th className="px-4 py-3 text-center">Payroll Run</th>
	                   </tr>
	                 </thead>
	                 <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
	                    {ledger.map((tx) => {
	                      const isUnmatched = !tx.matched;
	                      return (
	                        <tr key={tx.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/30 ${isUnmatched ? 'bg-amber-50/30 dark:bg-amber-900/5' : ''}`}>
	                          <td className="px-4 py-3 whitespace-nowrap text-slate-500 text-xs">
	                             {new Date(tx.date).toLocaleDateString("en-US", {month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'})}
	                          </td>
	                          <td className={`px-4 py-3 font-medium ${isUnmatched ? 'text-amber-800 dark:text-amber-400' : 'text-slate-900 dark:text-slate-200'}`}>
	                             {tx.type}
                             <p className="text-[11px] text-slate-400 font-normal mt-0.5">{tx.note}</p>
	                          </td>
	                          <td className={`px-4 py-3 text-right font-bold ${tx.type === "Credit" ? "text-emerald-600" : "text-slate-700 dark:text-slate-300"}`}>
	                             {tx.type === "Credit" ? "+" : "-"}{fmtMoney(tx.amount)}
	                          </td>
	                          <td className="px-4 py-3 text-center">
                              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded ${tx.status === "Pending" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>{tx.status}</span>
                              {isUnmatched && <span className="inline-block ml-2 text-[10px] bg-amber-100 text-amber-700 px-1 py-0.5 rounded">Unmatched</span>}
                            </td>
	                          <td className="px-4 py-3 text-center text-xs font-mono text-slate-400">{tx.reference}</td>
	                          <td className="px-4 py-3 text-center">
	                             {isUnmatched ? (
	                               <button className="text-[10px] font-bold text-blue-600 border border-blue-200 px-2 py-0.5 rounded hover:bg-blue-50">Match Run</button>
                             ) : (
                               <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded">{tx.payrollRun}</span>
                             )}
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
