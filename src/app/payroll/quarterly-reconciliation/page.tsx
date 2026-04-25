"use client";

import React, { useState } from 'react';
import { Calculator, AlertCircle, FileText, CheckCircle2, Loader2 } from 'lucide-react';

export default function QuarterlyReconciliationPage() {
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const [reconciling, setReconciling] = useState(false);
  const [reconciled, setReconciled] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
      setTimeout(() => setGenerated(false), 3000);
    }, 1500);
  };

  const handleReconcile = () => {
    setReconciling(true);
    setTimeout(() => {
      setReconciling(false);
      setReconciled(true);
    }, 2000);
  };

  return (
    <div className="flex flex-col gap-6 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Calculator size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            Quarterly Tax Reconciliation
          </h1>
          <p className="text-sm text-slate-500 mt-1 ml-[52px]">Reconcile expected deposits vs. actual deposits to prepare for Form 941.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleGenerate}
            disabled={generating || generated}
            className={`px-5 py-2.5 text-sm font-bold rounded-xl shadow-sm transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed ${
              generated ? "bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800" : "bg-white border border-slate-200 text-slate-700 dark:text-slate-200 dark:bg-slate-800 dark:border-slate-700 hover:bg-slate-50"
            }`}
          >
            {generating ? <Loader2 size={16} className="animate-spin" /> : generated ? <CheckCircle2 size={16} /> : <FileText size={16} />}
            {generating ? "Generating..." : generated ? "Downloaded!" : "Generate 941 Worksheet"}
          </button>
          <button 
            onClick={handleReconcile}
            disabled={reconciling || reconciled}
            className={`px-5 py-2.5 text-white text-sm font-bold rounded-xl shadow-md flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transition-colors ${
              reconciled ? "bg-emerald-600 hover:bg-emerald-700" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {reconciling ? <Loader2 size={16} className="animate-spin" /> : reconciled ? <CheckCircle2 size={16} /> : null}
            {reconciling ? "Reconciling..." : reconciled ? "Reconciled Q1" : "Reconcile Q1 Taxes"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
            <h3 className="font-bold text-slate-900 dark:text-white">Q1 2026 Tax Deposits</h3>
            <span className="text-sm text-slate-500">Jan 1 - Mar 31, 2026</span>
          </div>
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  <th className="text-left px-4 py-3 font-semibold">Tax Type</th>
                  <th className="text-right px-4 py-3 font-semibold">Expected Deposits (Calc)</th>
                  <th className="text-right px-4 py-3 font-semibold">Actual Deposits (Records)</th>
                  <th className="text-right px-4 py-3 font-semibold">Variance</th>
                  <th className="text-center px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-900 dark:text-slate-300">
                <tr>
                  <td className="px-4 py-3 font-medium">Federal Income Tax</td>
                  <td className="px-4 py-3 text-right font-mono">$125,400.00</td>
                  <td className="px-4 py-3 text-right font-mono">$125,400.00</td>
                  <td className="px-4 py-3 text-right font-mono text-slate-500">$0.00</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded">
                      <CheckCircle2 size={12} /> Matched
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium">Social Security Tax</td>
                  <td className="px-4 py-3 text-right font-mono">$78,250.00</td>
                  <td className="px-4 py-3 text-right font-mono">$78,250.00</td>
                  <td className="px-4 py-3 text-right font-mono text-slate-500">$0.00</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded">
                      <CheckCircle2 size={12} /> Matched
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium">Medicare Tax</td>
                  <td className="px-4 py-3 text-right font-mono">$18,300.00</td>
                  <td className="px-4 py-3 text-right font-mono">$18,300.00</td>
                  <td className="px-4 py-3 text-right font-mono text-slate-500">$0.00</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded">
                      <CheckCircle2 size={12} /> Matched
                    </span>
                  </td>
                </tr>
                <tr className="bg-red-50/50 dark:bg-red-900/10">
                  <td className="px-4 py-3 font-medium text-red-900 dark:text-red-400">State Income Tax (CA)</td>
                  <td className="px-4 py-3 text-right font-mono text-red-900 dark:text-red-400">$45,600.00</td>
                  <td className="px-4 py-3 text-right font-mono text-red-900 dark:text-red-400">$45,200.00</td>
                  <td className="px-4 py-3 text-right font-mono text-red-600 font-bold">-$400.00</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1 text-red-600 text-xs font-bold bg-red-50 dark:bg-red-500/10 px-2 py-1 rounded">
                      <AlertCircle size={12} /> Discrepancy
                    </span>
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-slate-50 dark:bg-slate-800/80 font-bold border-t-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                <tr>
                  <td className="px-4 py-3">Total</td>
                  <td className="px-4 py-3 text-right font-mono">$267,550.00</td>
                  <td className="px-4 py-3 text-right font-mono">$267,150.00</td>
                  <td className="px-4 py-3 text-right font-mono text-red-600">-$400.00</td>
                  <td className="px-4 py-3 text-center"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
