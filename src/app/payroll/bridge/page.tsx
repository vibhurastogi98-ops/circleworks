"use client";
import React from "react";
import { HandCoins, ArrowRight, ShieldCheck } from "lucide-react";

export default function BridgePage() {
  return (
    <div className="flex flex-col gap-6 pb-24 max-w-4xl mx-auto items-center mt-12 text-center">
      <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
        <HandCoins size={40} />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">Payroll Bridge Eligibility</h1>
      <p className="text-lg text-slate-600 dark:text-slate-400 mt-2 max-w-2xl">
        Access up to a $150,000 line of credit to ensure your team always gets paid on time, even when your client invoices are delayed.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 w-full text-left">
         <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
           <ShieldCheck size={24} className="text-emerald-500 mb-4" />
           <h3 className="font-bold text-lg mb-2">No personal guarantee</h3>
           <p className="text-sm text-slate-500">Underwriting is based solely on your CircleWorks payroll history and connected business accounts.</p>
         </div>
         <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
           <ShieldCheck size={24} className="text-emerald-500 mb-4" />
           <h3 className="font-bold text-lg mb-2">Instant funding</h3>
           <p className="text-sm text-slate-500">Funds are deposited into your payroll holding account in seconds to cover any shortfalls.</p>
         </div>
         <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
           <ShieldCheck size={24} className="text-emerald-500 mb-4" />
           <h3 className="font-bold text-lg mb-2">Transparent flat fee</h3>
           <p className="text-sm text-slate-500">No compounding interest. Just a simple 2-4% fee auto-repaid over 4, 8, or 12 weeks.</p>
         </div>
      </div>

      <div className="mt-12 p-8 bg-indigo-50 border border-indigo-100 rounded-3xl w-full flex flex-col md:flex-row items-center justify-between text-left">
         <div>
           <p className="text-sm font-bold text-indigo-500 tracking-wider uppercase mb-2">Powered by Plaid & Parafin</p>
           <h3 className="text-2xl font-extrabold text-indigo-900 mb-2">See how much you qualify for.</h3>
           <p className="text-indigo-700">Checking your eligibility won't affect your credit score.</p>
         </div>
         <button className="mt-6 md:mt-0 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xl flex items-center gap-2 transition-transform hover:-translate-y-1">
           Connect Bank Account <ArrowRight size={20} />
         </button>
      </div>

      <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-2 border-b border-slate-100 pb-5 dark:border-slate-800 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Underwriting Snapshot</h2>
            <p className="text-sm text-slate-500">Based on payroll history, connected Plaid cash-flow data, and Parafin risk scoring.</p>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black uppercase text-emerald-700">Pre-qualified</span>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {[
            ["Payroll history", "18 successful runs"],
            ["Average run size", "$278,420"],
            ["Eligible credit line", "$150,000"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
              <p className="text-xs font-bold uppercase text-slate-400">{label}</p>
              <p className="mt-1 text-lg font-black text-slate-900 dark:text-white">{value}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-400 dark:bg-slate-800/50">
              <tr>
                <th className="px-4 py-3 text-left">Repayment Week</th>
                <th className="px-4 py-3 text-right">Principal</th>
                <th className="px-4 py-3 text-right">Flat Fee</th>
                <th className="px-4 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {[
                ["Week 1", "$18,750", "$750", "$19,500"],
                ["Week 2", "$18,750", "$750", "$19,500"],
                ["Week 3", "$18,750", "$750", "$19,500"],
                ["Week 4", "$18,750", "$750", "$19,500"],
              ].map(([week, principal, fee, total]) => (
                <tr key={week}>
                  <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{week}</td>
                  <td className="px-4 py-3 text-right font-mono">{principal}</td>
                  <td className="px-4 py-3 text-right font-mono">{fee}</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 dark:text-white">{total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
