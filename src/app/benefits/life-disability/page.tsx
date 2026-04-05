"use client";

import React from "react";
import { Shield, Clock, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { mockLifeDisability } from "@/data/mockBenefits";

export default function LifeDisabilityPage() {
  const totalPremium = mockLifeDisability.reduce((s, r) => s + (r.lifeAmount * 0.0002), 0); // rough calc

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Life & Disability Insurance</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Life, AD&D, STD, and LTD enrollment status, beneficiaries, and EOI tracking.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <h4 className="text-sm font-medium text-slate-500 mb-1">Total Life Coverage</h4>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">${(mockLifeDisability.reduce((s, r) => s + r.lifeAmount, 0) / 1000000).toFixed(1)}M</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <h4 className="text-sm font-medium text-slate-500 mb-1">STD Enrolled</h4>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{mockLifeDisability.filter(r => r.stdStatus === 'Enrolled').length}/{mockLifeDisability.length}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <h4 className="text-sm font-medium text-slate-500 mb-1">LTD Enrolled</h4>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{mockLifeDisability.filter(r => r.ltdStatus === 'Enrolled').length}/{mockLifeDisability.length}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <h4 className="text-sm font-medium text-slate-500 mb-1">Pending EOI</h4>
          <div className="text-2xl font-bold text-amber-600">{mockLifeDisability.filter(r => r.eoiStatus === 'Pending').length}</div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Employee Detail</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-3">Employee</th>
                <th className="px-6 py-3 text-right">Life</th>
                <th className="px-6 py-3 text-right">AD&D</th>
                <th className="px-6 py-3 text-center">STD</th>
                <th className="px-6 py-3 text-center">LTD</th>
                <th className="px-6 py-3">Beneficiary</th>
                <th className="px-6 py-3 text-center">EOI Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {mockLifeDisability.map((rec, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{rec.employeeName}</td>
                  <td className="px-6 py-4 text-right font-medium text-slate-900 dark:text-white">${(rec.lifeAmount / 1000).toFixed(0)}k</td>
                  <td className="px-6 py-4 text-right text-slate-600 dark:text-slate-400">${(rec.addAmount / 1000).toFixed(0)}k</td>
                  <td className="px-6 py-4 text-center">
                    {rec.stdStatus === 'Enrolled' ? <CheckCircle2 size={16} className="text-green-500 mx-auto" /> : <XCircle size={16} className="text-slate-300 mx-auto" />}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {rec.ltdStatus === 'Enrolled' ? <CheckCircle2 size={16} className="text-green-500 mx-auto" /> : <XCircle size={16} className="text-slate-300 mx-auto" />}
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{rec.beneficiary}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold
                      ${rec.eoiStatus === 'Approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        rec.eoiStatus === 'Pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                        rec.eoiStatus === 'Denied' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                      {rec.eoiStatus === 'Pending' && <Clock size={10}/>}
                      {rec.eoiStatus === 'Approved' && <CheckCircle2 size={10}/>}
                      {rec.eoiStatus}
                    </span>
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
