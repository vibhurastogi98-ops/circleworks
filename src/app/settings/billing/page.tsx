"use client";

import React, { useState } from "react";
import { CreditCard, Download, Zap, TrendingUp } from "lucide-react";
import { mockBilling } from "@/data/mockSettings";

export default function BillingSettingsPage() {
  const [billing] = useState(mockBilling);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-5xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Billing & Plans</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage your subscription, payment methods, and invoices.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Current Plan Overview */}
        <div className="md:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 dark:from-blue-950 dark:to-slate-900 rounded-xl p-6 shadow-sm text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Zap size={120} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1 block">Current Plan</span>
                <h2 className="text-3xl font-black">{billing.plan}</h2>
              </div>
              <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full uppercase tracking-wider border border-green-500/30">
                {billing.status}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
               <div>
                 <span className="text-slate-400 text-xs block mb-1">Active Employees</span>
                 <span className="text-xl font-bold">{billing.activeEmployees}</span>
               </div>
               <div>
                 <span className="text-slate-400 text-xs block mb-1">Per User / Mo</span>
                 <span className="text-xl font-bold">${billing.pricePerUser}</span>
               </div>
               <div>
                 <span className="text-slate-400 text-xs block mb-1">Base Fee / Mo</span>
                 <span className="text-xl font-bold">${billing.baseFee}</span>
               </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-700 pt-6">
              <div>
                <span className="text-slate-400 text-xs block mb-1">Next Payment Date</span>
                <span className="text-sm font-bold">{new Date(billing.renewalDate).toLocaleDateString()}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 text-xs block mb-1">Estimated Total</span>
                <span className="text-2xl font-black text-blue-400">${billing.estimatedNextInvoice}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="md:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Payment Method</h3>
            <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
              <CreditCard size={24} className="text-slate-500" />
              <div>
                <div className="font-bold text-slate-900 dark:text-white text-sm">{billing.paymentMethod.type} ending in {billing.paymentMethod.last4}</div>
                <div className="text-xs text-slate-500">Expires {billing.paymentMethod.expiry}</div>
              </div>
            </div>
          </div>
          <button className="w-full mt-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm rounded-lg transition-colors">
            Update Method
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
             Invoice History
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-3">Invoice ID</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {billing.invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <td className="px-6 py-4 font-mono font-medium text-slate-700 dark:text-slate-300">{inv.id}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{new Date(inv.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">${inv.amount}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-blue-600 transition-colors inline-block">
                      <Download size={16} />
                    </button>
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
