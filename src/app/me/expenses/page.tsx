"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Receipt, Upload, DollarSign, CheckCircle2, Clock, XCircle, AlertCircle, Plus, X, Camera, Send } from "lucide-react";
import { mockExpenses, mockExpenseReports } from "@/data/mockEmployeePortal";
import { toast } from "sonner";

const statusStyles: Record<string, string> = {
  Draft: "bg-slate-100 dark:bg-slate-700/40 text-slate-600 dark:text-slate-300",
  Submitted: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
  Approved: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
  Processing: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
  Paid: "bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400",
  Rejected: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400",
};

const statusIcons: Record<string, React.ElementType> = {
  Draft: AlertCircle, Submitted: Clock, Approved: CheckCircle2, Processing: Clock, Paid: CheckCircle2, Rejected: XCircle,
};

export default function ExpensesPage() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ amount: "", date: "", merchant: "", category: "Meals", purpose: "" });
  const [activeTab, setActiveTab] = useState<"expenses" | "reports">("expenses");

  const handleSubmit = () => {
    if (!formData.amount || !formData.merchant || !formData.purpose) { toast.error("Please fill all required fields"); return; }
    toast.success("Expense added!");
    setShowForm(false);
    setFormData({ amount: "", date: "", merchant: "", category: "Meals", purpose: "" });
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Expenses</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Submit expenses and track reimbursements</p>
        </div>
        <button onClick={() => setShowForm(true)} className="h-10 px-5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-[13px] font-bold flex items-center gap-2 transition-colors shadow-sm w-fit">
          <Plus size={16} /> Add Expense
        </button>
      </div>

      {/* Tab Toggle */}
      <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800 w-fit">
        {(["expenses", "reports"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-md text-[13px] font-bold transition-all ${activeTab === tab ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700"}`}>
            {tab === "expenses" ? "Expenses" : "Reports"}
          </button>
        ))}
      </div>

      {activeTab === "expenses" ? (
        /* Individual Expenses */
        <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/40 overflow-hidden">
          <div className="hidden sm:grid grid-cols-[1fr_1fr_auto_1fr_auto] gap-4 px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-700/40 text-[12px] font-bold text-slate-500 uppercase tracking-wide">
            <span>Date / Merchant</span><span>Category</span><span>Amount</span><span>Purpose</span><span>Status</span>
          </div>
          {mockExpenses.map((exp, i) => {
            const StatusIcon = statusIcons[exp.status] || Clock;
            return (
              <motion.div key={exp.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto_1fr_auto] gap-2 sm:gap-4 px-4 py-3 border-b border-slate-100 dark:border-slate-700/30 hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors items-center">
                <div>
                  <p className="text-[13px] font-bold text-slate-900 dark:text-white">{exp.merchant}</p>
                  <p className="text-[11px] text-slate-500">{new Date(exp.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
                <span className="text-[13px] text-slate-600 dark:text-slate-300">{exp.category}</span>
                <span className="text-[13px] font-bold text-slate-900 dark:text-white">${exp.amount.toFixed(2)}</span>
                <span className="text-[12px] text-slate-500 dark:text-slate-400 truncate">{exp.purpose}</span>
                <span className={`px-2 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 w-fit ${statusStyles[exp.status]}`}>
                  <StatusIcon size={11} /> {exp.status}
                </span>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* Expense Reports */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockExpenseReports.map((report, i) => {
            const StatusIcon = statusIcons[report.status] || Clock;
            return (
              <motion.div key={report.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="p-5 rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/40 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
                    <Receipt size={18} className="text-violet-600 dark:text-violet-400" />
                  </div>
                  <span className={`px-2 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 ${statusStyles[report.status]}`}>
                    <StatusIcon size={11} /> {report.status}
                  </span>
                </div>
                <h3 className="text-[14px] font-bold text-slate-900 dark:text-white mb-1">{report.title}</h3>
                <div className="flex items-center gap-3 text-[12px] text-slate-500 dark:text-slate-400">
                  <span>{report.itemCount} items</span>
                  <span>·</span>
                  <span className="font-bold text-slate-900 dark:text-white">${report.totalAmount.toFixed(2)}</span>
                </div>
                {report.submittedDate && (
                  <p className="text-[11px] text-slate-400 mt-2">Submitted {new Date(report.submittedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Reimbursement Status */}
      <div>
        <h2 className="text-[15px] font-bold text-slate-900 dark:text-white mb-3">Reimbursement Pipeline</h2>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {["Submitted", "Approved", "Processing", "Paid"].map((step, i) => {
            const count = mockExpenseReports.filter(r => r.status === step).length;
            return (
              <React.Fragment key={step}>
                {i > 0 && <div className="w-8 h-0.5 bg-slate-200 dark:bg-slate-700 flex-shrink-0" />}
                <div className={`flex-shrink-0 px-4 py-3 rounded-xl border ${count > 0 ? "border-violet-200 dark:border-violet-800/40 bg-violet-50 dark:bg-violet-900/10" : "border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/40"}`}>
                  <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">{step}</p>
                  <p className="text-xl font-black text-slate-900 dark:text-white">{count}</p>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Add Expense Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} onClick={e => e.stopPropagation()} className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md">
              <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Add Expense</h2>
                <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"><X size={18} /></button>
              </div>
              <div className="p-5 space-y-4">
                {/* Receipt Upload */}
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 flex flex-col items-center gap-3 cursor-pointer hover:border-violet-400 dark:hover:border-violet-500 transition-colors" onClick={() => toast("AI receipt scanning coming soon!", { icon: <Camera className="w-4 h-4" /> })}>
                  <div className="w-12 h-12 rounded-full bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
                    <Camera size={20} className="text-violet-600 dark:text-violet-400" />
                  </div>
                  <p className="text-[13px] font-semibold text-slate-600 dark:text-slate-300">Upload Receipt</p>
                  <p className="text-[11px] text-slate-400">AI will auto-fill details from photo</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[12px] font-bold text-slate-600 dark:text-slate-300 mb-1 block">Amount *</label>
                    <input type="number" step="0.01" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[13px] text-slate-900 dark:text-white" placeholder="0.00" />
                  </div>
                  <div>
                    <label className="text-[12px] font-bold text-slate-600 dark:text-slate-300 mb-1 block">Date</label>
                    <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[13px] text-slate-900 dark:text-white" />
                  </div>
                </div>
                <div>
                  <label className="text-[12px] font-bold text-slate-600 dark:text-slate-300 mb-1 block">Merchant *</label>
                  <input value={formData.merchant} onChange={e => setFormData({ ...formData, merchant: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[13px] text-slate-900 dark:text-white" placeholder="e.g. Uber, Marriott..." />
                </div>
                <div>
                  <label className="text-[12px] font-bold text-slate-600 dark:text-slate-300 mb-1 block">Category</label>
                  <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[13px] text-slate-900 dark:text-white">
                    {["Meals", "Transportation", "Travel", "Lodging", "Office Supplies", "Other"].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[12px] font-bold text-slate-600 dark:text-slate-300 mb-1 block">Business Purpose *</label>
                  <textarea value={formData.purpose} onChange={e => setFormData({ ...formData, purpose: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[13px] text-slate-900 dark:text-white resize-none" placeholder="Explain the business reason..." />
                </div>
              </div>
              <div className="p-5 border-t border-slate-100 dark:border-slate-700">
                <button onClick={handleSubmit} className="w-full h-10 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-[13px] font-bold flex items-center justify-center gap-2 transition-colors shadow-sm">
                  <Send size={16} /> Submit Expense
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
