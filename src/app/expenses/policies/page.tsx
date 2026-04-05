"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ChevronLeft, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Edit3, 
  AlertCircle, 
  Receipt,
  Zap,
  ArrowRight
} from "lucide-react";
import { mockExpensePolicies, ExpensePolicy } from "@/data/mockExpenses";
import { toast } from "sonner";

export default function ExpensePoliciesPage() {
  const [policies, setPolicies] = useState<ExpensePolicy[]>(mockExpensePolicies);

  const handleDelete = (id: string) => {
    setPolicies(prev => prev.filter(p => p.id !== id));
    toast.error("Policy deleted successfully.");
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-5xl mx-auto w-full">
      
      {/* Header */}
      <div className="flex flex-col gap-2">
         <Link href="/expenses" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors w-fit">
            <ChevronLeft size={16} /> Back to Overview
         </Link>
         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-2">
            <div>
               <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  Business Expense Policies
               </h1>
               <p className="text-sm text-slate-500 font-medium capitalize">
                  Configure corporate spending rules and automatic validation thresholds.
               </p>
            </div>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-95">
               <Plus size={18} /> New Policy
            </button>
         </div>
      </div>

      {/* Info Banner */}
      <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/50 rounded-2xl p-5 flex items-start gap-4 shadow-sm shadow-indigo-500/10">
         <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Zap size={20} />
         </div>
         <div>
            <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-200">Smart Policy Enforcement</h3>
            <p className="text-xs text-indigo-700 dark:text-indigo-300/80 leading-relaxed max-w-2xl mt-1">
               System applies these rules automatically during report submission. **"Block"** rules prevent submission, while **"Warn"** and **"Flag"** allow submission with an audit notice.
            </p>
         </div>
      </div>

      {/* Policies Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden border-b-4 border-b-slate-100 dark:border-b-slate-800">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                     <th className="px-6 py-4">Expense Category</th>
                     <th className="px-6 py-4">Limit & Period</th>
                     <th className="px-6 py-4">Receipt Requirement</th>
                     <th className="px-6 py-4">Pre-Approval</th>
                     <th className="px-6 py-4">Action</th>
                     <th className="px-6 py-4"></th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {policies.map((policy) => (
                    <tr key={policy.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-5">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center">
                               <ShieldCheck size={16} />
                            </div>
                            <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">{policy.category}</span>
                         </div>
                      </td>
                      <td className="px-6 py-5">
                         <div className="text-sm font-bold text-slate-900 dark:text-white">${policy.limit.toLocaleString()}</div>
                         <div className="text-[10px] text-slate-500 font-medium tracking-tight uppercase">{policy.period}</div>
                      </td>
                      <td className="px-6 py-5">
                         <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                            <Receipt size={14} className="text-indigo-500" />
                            Over ${policy.receiptThreshold}
                         </div>
                      </td>
                      <td className="px-6 py-5">
                         <div className="text-xs font-bold text-slate-600 dark:text-slate-400">
                            {policy.preApprovalThreshold ? `Over $${policy.preApprovalThreshold.toLocaleString()}` : "Not required"}
                         </div>
                      </td>
                      <td className="px-6 py-5">
                         <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-transparent ${
                            policy.violationAction === "Block" 
                               ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                               : policy.violationAction === "Flag"
                               ? "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
                               : "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                         }`}>
                            {policy.violationAction}
                         </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                         <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white dark:hover:bg-slate-800 rounded-lg shadow-sm">
                               <Edit3 size={16} />
                            </button>
                            <button 
                              onClick={() => handleDelete(policy.id)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-white dark:hover:bg-slate-800 rounded-lg shadow-sm"
                            >
                               <Trash2 size={16} />
                            </button>
                         </div>
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
