"use client";

import React, { useState } from 'react';
import { FileText, AlertCircle, CheckCircle2, Download, Send, ArrowRight, Loader2 } from 'lucide-react';

export default function YearEndW2Page() {
  const [efiling, setEfiling] = useState(false);
  const [efiled, setEfiled] = useState(false);

  const [distributing, setDistributing] = useState(false);
  const [distributed, setDistributed] = useState(false);

  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleEfile = () => {
    setEfiling(true);
    setTimeout(() => {
      setEfiling(false);
      setEfiled(true);
    }, 2000);
  };

  const handleDistribute = () => {
    setDistributing(true);
    setTimeout(() => {
      setDistributing(false);
      setDistributed(true);
    }, 1500);
  };

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    }, 1500);
  };

  return (
    <div className="flex flex-col gap-6 pb-24">
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-start gap-4">
        <AlertCircle className="text-amber-600 dark:text-amber-500 mt-0.5" size={20} />
        <div>
          <h3 className="font-bold text-amber-900 dark:text-amber-400">W-2s due January 31 — review and file</h3>
          <p className="text-sm text-amber-800 dark:text-amber-500 mt-1">Review employee W-2 data, correct errors, and file with the SSA before the deadline.</p>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Year-End W-2 Processing</h1>
        <p className="text-sm text-slate-500 mt-1">Manage and distribute end-of-year tax documents.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 dark:text-white">Step 1: Review W-2 Data</h3>
              <button className="text-sm text-blue-600 font-bold hover:underline">Edit Data</button>
            </div>
            <div className="p-0 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                    <th className="text-left px-4 py-3 font-semibold">Employee</th>
                    <th className="text-right px-4 py-3 font-semibold">Box 1 (Wages)</th>
                    <th className="text-right px-4 py-3 font-semibold">Box 2 (Fed Tax)</th>
                    <th className="text-right px-4 py-3 font-semibold">Boxes 3-6 (FICA)</th>
                    <th className="text-center px-4 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-900 dark:text-slate-300">
                  <tr>
                    <td className="px-4 py-3 font-medium">Alex Johnson</td>
                    <td className="px-4 py-3 text-right font-mono">$85,000.00</td>
                    <td className="px-4 py-3 text-right font-mono">$12,400.00</td>
                    <td className="px-4 py-3 text-right font-mono">$6,502.50</td>
                    <td className="px-4 py-3 text-center"><span className="text-emerald-600 text-xs font-bold bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded">Reviewed</span></td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium">Maria Garcia</td>
                    <td className="px-4 py-3 text-right font-mono">$92,500.00</td>
                    <td className="px-4 py-3 text-right font-mono">$14,100.00</td>
                    <td className="px-4 py-3 text-right font-mono">$7,076.25</td>
                    <td className="px-4 py-3 text-center"><span className="text-amber-600 text-xs font-bold bg-amber-50 dark:bg-amber-500/10 px-2 py-1 rounded">Pending</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
              <h3 className="font-bold text-slate-900 dark:text-white">Filing & Distribution</h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Step 2: E-file via SSA</h4>
                  <p className="text-sm text-slate-500 mt-1">Submit electronically via SSA Business Services Online or generate XML.</p>
                </div>
                <button 
                  onClick={handleEfile}
                  disabled={efiling || efiled}
                  className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed ${
                    efiled ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800"
                  }`}
                >
                  {efiling ? <Loader2 size={16} className="animate-spin" /> : efiled ? <CheckCircle2 size={16} /> : <Send size={16} />}
                  {efiling ? "Filing..." : efiled ? "Filed Successfully" : "E-File Now"}
                </button>
              </div>
              <hr className="border-slate-100 dark:border-slate-800" />
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Step 3: Distribute to Employees</h4>
                  <p className="text-sm text-slate-500 mt-1">Email PDF copies and make available in employee portal.</p>
                </div>
                <button 
                  onClick={handleDistribute}
                  disabled={distributing || distributed}
                  className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed ${
                    distributed ? "bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800" : "bg-white border border-slate-200 text-slate-700 dark:text-slate-200 dark:bg-slate-800 dark:border-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {distributing ? <Loader2 size={16} className="animate-spin" /> : distributed ? <CheckCircle2 size={16} /> : <ArrowRight size={16} />}
                  {distributing ? "Distributing..." : distributed ? "Distributed" : "Distribute"}
                </button>
              </div>
              <hr className="border-slate-100 dark:border-slate-800" />
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Step 4: W-3 Transmittal</h4>
                  <p className="text-sm text-slate-500 mt-1">Auto-generated from your W-2 totals.</p>
                </div>
                <button 
                  onClick={handleDownload}
                  disabled={downloading || downloaded}
                  className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed ${
                    downloaded ? "bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800" : "bg-white border border-slate-200 text-slate-700 dark:text-slate-200 dark:bg-slate-800 dark:border-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {downloading ? <Loader2 size={16} className="animate-spin" /> : downloaded ? <CheckCircle2 size={16} /> : <Download size={16} />}
                  {downloading ? "Generating PDF..." : downloaded ? "Downloaded" : "Download W-3"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Deadlines</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="text-emerald-500 mt-0.5" size={16} />
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Jan 31</p>
                  <p className="text-xs text-slate-500">W-2s to employees</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="text-emerald-500 mt-0.5" size={16} />
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Jan 31</p>
                  <p className="text-xs text-slate-500">SSA filing deadline</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
