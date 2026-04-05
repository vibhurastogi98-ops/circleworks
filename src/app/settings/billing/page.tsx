"use client";

import React from "react";
import { motion } from "framer-motion";
import { CreditCard, Check, Zap, ArrowUpRight, DollarSign, Clock } from "lucide-react";

export default function BillingPage() {
  const plans = [
    { name: "Starter", price: "$39/mo", features: ["Up to 10 employees", "Manual Payroll", "Basic HR Tools"], current: false },
    { name: "Professional", price: "$99/mo", features: ["Up to 50 employees", "Auto Payroll", "Health Benefits", "Custom Reports"], current: true },
    { name: "Enterprise", price: "Custom", features: ["Unlimited employees", "Dedicated Support", "API Access", "SSO Integration"], current: false },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="flex flex-col gap-1 mb-8">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Billing & Subscription
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          Manage your plan, payment methods, and view your billing history.
        </p>
      </div>

      {/* Plan Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.name} className={`bg-white dark:bg-slate-900 border ${plan.current ? 'border-blue-500 ring-4 ring-blue-500/10' : 'border-slate-200 dark:border-slate-800'} rounded-2xl p-6 shadow-sm flex flex-col`}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">{plan.name}</h3>
              {plan.current && <span className="px-2 py-1 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-200 dark:border-blue-500/30">Current Plan</span>}
            </div>
            <div className="mb-6">
              <span className="text-3xl font-black text-slate-900 dark:text-white">{plan.price}</span>
            </div>
            <ul className="space-y-3 mb-8 flex-grow">
              {plan.features.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                  <Check size={14} className="text-blue-500" /> {f}
                </li>
              ))}
            </ul>
            <button className={`w-full py-3 rounded-xl font-bold transition-all ${plan.current ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20'}`}>
              {plan.current ? "Current Plan" : "Upgrade Plan"}
            </button>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Payment Method */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
           <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-2">
            <CreditCard size={18} className="text-blue-600" />
            <h3 className="font-bold text-slate-800 dark:text-slate-200">Payment Method</h3>
          </div>
          <div className="p-6">
             <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl mb-4">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-6 bg-slate-200 rounded flex items-center justify-center font-bold text-[10px] text-slate-500 uppercase">Visa</div>
                   <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">•••• 4242</p>
                      <p className="text-xs text-slate-500 font-medium">Expires 12/26</p>
                   </div>
                </div>
                <button className="text-sm font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest text-[10px]">Edit</button>
             </div>
             <button className="w-full py-3 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-slate-500 font-bold hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-sm">
               + Add New Card
             </button>
          </div>
        </div>

        {/* Invoice History */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
           <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-2">
            <Clock size={18} className="text-blue-600" />
            <h3 className="font-bold text-slate-800 dark:text-slate-200">Billing History</h3>
          </div>
          <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
                   <tr>
                      <th className="px-6 py-3 text-[10px] font-black uppercase text-slate-400 tracking-widest">Date</th>
                      <th className="px-6 py-3 text-[10px] font-black uppercase text-slate-400 tracking-widest">Description</th>
                      <th className="px-6 py-3 text-[10px] font-black uppercase text-slate-400 tracking-widest">Amount</th>
                      <th className="px-6 py-3 text-[10px] font-black uppercase text-slate-400 tracking-widest">Status</th>
                      <th className="px-6 py-4"></th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                   {[
                      { date: "Apr 1, 2026", desc: "Professional Plan — Monthly", amount: "$99.00", status: "Paid" },
                      { date: "Mar 1, 2026", desc: "Professional Plan — Monthly", amount: "$99.00", status: "Paid" },
                   ].map((inv) => (
                      <tr key={inv.date} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                         <td className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">{inv.date}</td>
                         <td className="px-6 py-4 text-sm font-medium text-slate-500 dark:text-slate-400">{inv.desc}</td>
                         <td className="px-6 py-4 text-sm font-black text-slate-900 dark:text-white">{inv.amount}</td>
                         <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] font-black uppercase tracking-widest rounded-md border border-green-200 dark:border-green-500/30">
                               {inv.status}
                            </span>
                         </td>
                         <td className="px-6 py-4 text-right">
                            <button className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-500/10 p-2 rounded-lg transition-colors">
                               <ArrowUpRight size={18} />
                            </button>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
