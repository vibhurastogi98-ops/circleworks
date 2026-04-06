"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Banknote, Zap, CheckCircle2, Clock, AlertCircle, X, ArrowRight, ShieldCheck, Info } from "lucide-react";
import { mockEwaData } from "@/data/mockEmployeePortal";
import { toast } from "sonner";

export default function EwaPage() {
  const [showRequest, setShowRequest] = useState(false);
  const [requestAmount, setRequestAmount] = useState(100);
  const data = mockEwaData;

  const pctEarned = Math.round((data.availableAmount / data.maxPerPayPeriod) * 100);

  const handleRequest = () => {
    if (requestAmount < 25) { toast.error("Minimum request is $25"); return; }
    if (requestAmount > data.availableAmount) { toast.error("Amount exceeds available balance"); return; }
    toast.success(`$${requestAmount} early pay requested! ACH transfer initiated.`);
    setShowRequest(false);
  };

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Early Access Pay</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Access up to 50% of your earned wages before payday</p>
      </div>

      {/* Available Amount Hero */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 dark:from-violet-900/20 dark:via-slate-800/40 dark:to-fuchsia-900/10 p-6 md:p-8"
      >
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1">
            <p className="text-[13px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Available for Early Pay</p>
            <p className="text-4xl font-black text-slate-900 dark:text-white mb-2">
              ${data.availableAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <div className="w-full max-w-xs h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden mb-2">
              <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all" style={{ width: `${pctEarned}%` }} />
            </div>
            <p className="text-[12px] text-slate-500 dark:text-slate-400">
              ${data.earnedWages.toLocaleString('en-US', { minimumFractionDigits: 2 })} earned · 50% accessible · Next payday: {new Date(data.nextPayDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          </div>
          <button
            onClick={() => setShowRequest(true)}
            className="h-12 px-8 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white text-[14px] font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 w-fit"
          >
            <Zap size={18} /> Request Early Pay
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Request History */}
        <div className="lg:col-span-2">
          <h2 className="text-[15px] font-bold text-slate-900 dark:text-white mb-3">Request History</h2>
          <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/40 overflow-hidden">
            <div className="hidden sm:grid grid-cols-[1fr_auto_1fr_auto] gap-4 px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-700/40 text-[12px] font-bold text-slate-500 uppercase tracking-wide">
              <span>Date</span><span>Amount</span><span>Repayment</span><span>Status</span>
            </div>
            {data.requests.map((req, i) => (
              <motion.div key={req.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr_auto] gap-2 sm:gap-4 px-4 py-3 border-b border-slate-100 dark:border-slate-700/30 hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors items-center">
                <span className="text-[13px] text-slate-600 dark:text-slate-300">{new Date(req.requestedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                <span className="text-[14px] font-bold text-slate-900 dark:text-white">${req.amount.toFixed(2)}</span>
                <span className="text-[12px] text-slate-500">{new Date(req.repaymentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} (next payroll)</span>
                <span className="px-2 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold flex items-center gap-1 w-fit">
                  <CheckCircle2 size={11} /> {req.status}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Eligibility */}
        <div>
          <h2 className="text-[15px] font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-500" /> Eligibility
          </h2>
          <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/40 p-4 space-y-3">
            {data.eligibilityRequirements.map((req, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                <p className="text-[12px] text-slate-600 dark:text-slate-300">{req}</p>
              </div>
            ))}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-700/40">
              <div className="flex items-center gap-2">
                <Info size={14} className="text-blue-500" />
                <p className="text-[12px] text-blue-700 dark:text-blue-300 font-medium">Fee: $0 — CircleWorks covers all EWA fees</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Request Modal */}
      <AnimatePresence>
        {showRequest && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowRequest(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} onClick={e => e.stopPropagation()} className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-sm">
              <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Request Early Pay</h2>
                <button onClick={() => setShowRequest(false)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"><X size={18} /></button>
              </div>
              <div className="p-5 space-y-5">
                <div className="text-center">
                  <p className="text-[12px] text-slate-500 mb-1">Select Amount</p>
                  <p className="text-4xl font-black text-slate-900 dark:text-white mb-2">${requestAmount}</p>
                  <input
                    type="range"
                    min={25} max={Math.floor(data.availableAmount)} step={25}
                    value={requestAmount}
                    onChange={e => setRequestAmount(Number(e.target.value))}
                    className="w-full accent-violet-600"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                    <span>$25</span>
                    <span>${Math.floor(data.availableAmount)}</span>
                  </div>
                </div>
                {/* Quick Amounts */}
                <div className="flex gap-2 justify-center">
                  {[100, 250, 500].filter(a => a <= data.availableAmount).map(amt => (
                    <button key={amt} onClick={() => setRequestAmount(amt)} className={`px-4 py-2 rounded-lg text-[13px] font-bold transition-all ${requestAmount === amt ? "bg-violet-600 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"}`}>
                      ${amt}
                    </button>
                  ))}
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 space-y-1.5">
                  <div className="flex justify-between text-[12px]"><span className="text-slate-500">Transfer Method</span><span className="font-semibold text-slate-900 dark:text-white">Instant ACH</span></div>
                  <div className="flex justify-between text-[12px]"><span className="text-slate-500">Fee</span><span className="font-semibold text-emerald-600">$0.00</span></div>
                  <div className="flex justify-between text-[12px]"><span className="text-slate-500">Repayment</span><span className="font-semibold text-slate-900 dark:text-white">{new Date(data.nextPayDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span></div>
                </div>
              </div>
              <div className="p-5 border-t border-slate-100 dark:border-slate-700">
                <button onClick={handleRequest} className="w-full h-10 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white text-[13px] font-bold flex items-center justify-center gap-2 transition-all shadow-sm">
                  <Zap size={16} /> Confirm — ${requestAmount} via Instant ACH
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
