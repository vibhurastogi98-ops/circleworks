"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Eye, X, DollarSign, TrendingUp, ChevronDown } from "lucide-react";
import { mockPayStubs, type PayStub } from "@/data/mockEmployeePortal";
import { useEmployeePortal } from "@/hooks/useEmployeePortal";
import { toast } from "sonner";

export default function PayStubsPage() {
  const { data } = useEmployeePortal();
  const payStubs = data?.payStubs?.length ? data.payStubs : mockPayStubs;
  const years = [...new Set(payStubs.map(s => s.year))].sort((a, b) => b - a);
  const [selectedYear, setSelectedYear] = useState<number>(years[0]);
  const [selectedStub, setSelectedStub] = useState<PayStub | null>(null);

  const filtered = payStubs.filter(s => s.year === selectedYear);

  // YTD summary
  const ytdStubs = payStubs.filter(s => s.year === new Date().getFullYear());
  const ytdGross = ytdStubs.reduce((sum, s) => sum + s.grossPay, 0);
  const ytdTaxes = ytdStubs.reduce((sum, s) => sum + s.federalTax + s.stateTax + s.socialSecurity + s.medicare, 0);
  const ytdNet = ytdStubs.reduce((sum, s) => sum + s.netPay, 0);

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pay Stubs</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">View and download your pay history</p>
        </div>
        <div className="relative">
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(Number(e.target.value))}
            className="h-10 px-4 pr-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[14px] font-semibold text-slate-900 dark:text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* YTD Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: "YTD Gross", value: ytdGross, icon: DollarSign, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
          { label: "YTD Taxes", value: ytdTaxes, icon: TrendingUp, color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/20" },
          { label: "YTD Net", value: ytdNet, icon: DollarSign, color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-900/20" },
        ].map(card => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/40"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center`}>
                <card.icon size={16} className={card.color} />
              </div>
              <span className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{card.label}</span>
            </div>
            <p className="text-xl font-black text-slate-900 dark:text-white">
              ${card.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Pay Stubs List */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/40 overflow-hidden">
        <div className="hidden sm:grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-4 px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-700/40 text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
          <span>Pay Date</span><span>Period</span><span>Gross</span><span>Net Pay</span><span>Actions</span>
        </div>
        {filtered.map((stub, i) => (
          <motion.div
            key={stub.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.03 }}
            className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2 sm:gap-4 px-4 py-3 border-b border-slate-100 dark:border-slate-700/30 hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors items-center"
          >
            <div>
              <p className="text-[13px] font-bold text-slate-900 dark:text-white">{new Date(stub.payDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              <p className="sm:hidden text-[11px] text-slate-500">{new Date(stub.periodStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(stub.periodEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
            </div>
            <span className="hidden sm:block text-[13px] text-slate-600 dark:text-slate-300">
              {new Date(stub.periodStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {new Date(stub.periodEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
            <span className="text-[13px] font-semibold text-slate-900 dark:text-white">${stub.grossPay.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            <span className="text-[13px] font-bold text-emerald-600 dark:text-emerald-400">${stub.netPay.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setSelectedStub(stub)} className="p-2 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-900/20 text-slate-500 hover:text-violet-600 dark:hover:text-violet-400 transition-colors" title="View Details">
                <Eye size={16} />
              </button>
              <button onClick={() => toast.success("Pay stub PDF downloaded")} className="p-2 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-900/20 text-slate-500 hover:text-violet-600 dark:hover:text-violet-400 transition-colors" title="Download PDF">
                <Download size={16} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pay Stub Detail Modal */}
      <AnimatePresence>
        {selectedStub && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedStub(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-lg max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Pay Stub Details</h2>
                  <p className="text-[12px] text-slate-500 mt-0.5">
                    {new Date(selectedStub.periodStart).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} – {new Date(selectedStub.periodEnd).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <button onClick={() => setSelectedStub(null)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors">
                  <X size={18} />
                </button>
              </div>
              <div className="p-5 space-y-5">
                {/* Earnings */}
                <div>
                  <h3 className="text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Earnings</h3>
                  <div className="space-y-1.5">
                    {[
                      { label: "Regular Pay", value: selectedStub.grossPay - selectedStub.overtimePay - selectedStub.bonusPay },
                      ...(selectedStub.overtimePay > 0 ? [{ label: `Overtime (${selectedStub.overtimeHours} hrs)`, value: selectedStub.overtimePay }] : []),
                      ...(selectedStub.bonusPay > 0 ? [{ label: "Bonus", value: selectedStub.bonusPay }] : []),
                    ].map(item => (
                      <div key={item.label} className="flex justify-between text-[13px]">
                        <span className="text-slate-600 dark:text-slate-300">{item.label}</span>
                        <span className="font-semibold text-slate-900 dark:text-white">${item.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-[13px] font-bold pt-1.5 border-t border-slate-100 dark:border-slate-700">
                      <span className="text-slate-900 dark:text-white">Gross Pay</span>
                      <span className="text-emerald-600 dark:text-emerald-400">${selectedStub.grossPay.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
                {/* Taxes */}
                <div>
                  <h3 className="text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Taxes</h3>
                  <div className="space-y-1.5">
                    {[
                      { label: "Federal Income Tax", value: selectedStub.federalTax },
                      { label: "State Income Tax", value: selectedStub.stateTax },
                      { label: "Social Security", value: selectedStub.socialSecurity },
                      { label: "Medicare", value: selectedStub.medicare },
                    ].map(item => (
                      <div key={item.label} className="flex justify-between text-[13px]">
                        <span className="text-slate-600 dark:text-slate-300">{item.label}</span>
                        <span className="font-semibold text-red-600 dark:text-red-400">-${item.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Deductions */}
                <div>
                  <h3 className="text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Deductions</h3>
                  <div className="space-y-1.5">
                    {[
                      { label: "Health Insurance", value: selectedStub.healthInsurance },
                      { label: "Dental Insurance", value: selectedStub.dentalInsurance },
                      { label: "Vision Insurance", value: selectedStub.visionInsurance },
                      { label: "401(k) Contribution", value: selectedStub.retirement401k },
                      { label: "FSA Contribution", value: selectedStub.fsaContribution },
                    ].map(item => (
                      <div key={item.label} className="flex justify-between text-[13px]">
                        <span className="text-slate-600 dark:text-slate-300">{item.label}</span>
                        <span className="font-semibold text-slate-900 dark:text-white">-${item.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Net Pay */}
                <div className="flex justify-between items-center pt-3 border-t-2 border-slate-200 dark:border-slate-700">
                  <span className="text-[15px] font-black text-slate-900 dark:text-white">Net Pay</span>
                  <span className="text-xl font-black text-violet-600 dark:text-violet-400">${selectedStub.netPay.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
              <div className="p-5 border-t border-slate-100 dark:border-slate-700">
                <button
                  onClick={() => { toast.success("Pay stub PDF downloaded"); setSelectedStub(null); }}
                  className="w-full h-10 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-[13px] font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <Download size={16} /> Download PDF
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
