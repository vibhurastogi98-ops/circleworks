"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Download, FileText, Clock, CheckCircle2, ToggleLeft, ToggleRight } from "lucide-react";
import { useEmployeeSelfService } from "@/hooks/useEmployeePortal";
import { toast } from "sonner";

export default function TaxFormsPage() {
  const { data } = useEmployeeSelfService();
  const years = [2025, 2024, 2023, 2022, 2021];
  const [selectedYear, setSelectedYear] = useState<number>(years[0]);
  const [paperlessConsent, setPaperlessConsent] = useState(true);

  const form = data.taxForms.find(f => f.year === selectedYear);
  const isAvailable = form?.status === 'Available';
  const availableDate = form ? new Date(form.availableDate) : null;
  const now = new Date();
  const daysUntil = availableDate ? Math.max(0, Math.ceil((availableDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 0;

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tax Forms</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">View and download your W-2 and other tax documents</p>
      </div>

      {/* Year Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {years.map(year => (
          <button
            key={year}
            onClick={() => setSelectedYear(year)}
            className={`px-4 py-2 rounded-lg text-[13px] font-bold transition-all ${
              selectedYear === year
                ? "bg-violet-600 text-white shadow-md"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
            }`}
          >
            {year}
          </button>
        ))}
      </div>

      {/* W-2 Card */}
      {form && (
        <motion.div
          key={form.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/40 overflow-hidden"
        >
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
                <FileText size={24} className="text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">W-2 — {selectedYear}</h2>
                <p className="text-[12px] text-slate-500 dark:text-slate-400">Wage and Tax Statement</p>
              </div>
              {isAvailable ? (
                <span className="ml-auto px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold flex items-center gap-1">
                  <CheckCircle2 size={12} /> Available
                </span>
              ) : (
                <span className="ml-auto px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-[11px] font-bold flex items-center gap-1">
                  <Clock size={12} /> Available in {daysUntil} days
                </span>
              )}
            </div>

            {isAvailable && form.wagesBoxes && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                  { label: "Box 1 — Wages", value: form.wagesBoxes.box1 },
                  { label: "Box 2 — Federal Tax", value: form.wagesBoxes.box2 },
                  { label: "Box 4 — SS Tax", value: form.wagesBoxes.box4 },
                  { label: "Box 6 — Medicare Tax", value: form.wagesBoxes.box6 },
                ].map(box => (
                  <div key={box.label} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                    <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">{box.label}</p>
                    <p className="text-[15px] font-bold text-slate-900 dark:text-white">${box.value.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}

            {isAvailable ? (
              <button
                onClick={() => toast.success(`W-2 for ${selectedYear} downloaded`)}
                className="h-10 px-5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-[13px] font-bold flex items-center gap-2 transition-colors shadow-sm"
              >
                <Download size={16} /> Download W-2 PDF
              </button>
            ) : (
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30">
                <p className="text-[13px] text-amber-800 dark:text-amber-300 font-medium">
                  Your W-2 for {selectedYear} will be available on{" "}
                  <span className="font-bold">{availableDate?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>.
                  You'll receive a notification when it's ready.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { type: "1099-NEC", copy: "Only shown when you are paid as a contractor." },
          { type: "W-2c", copy: "Corrected W-2 forms appear here if issued." },
        ].map((item) => (
          <div key={item.type} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700/60 dark:bg-slate-800/40">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700">
                <FileText size={18} className="text-slate-500 dark:text-slate-300" />
              </div>
              <div>
                <h3 className="text-[14px] font-bold text-slate-900 dark:text-white">{item.type}</h3>
                <p className="text-[12px] text-slate-500 dark:text-slate-400">{item.copy}</p>
              </div>
              <span className="ml-auto rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500 dark:bg-slate-700 dark:text-slate-300">
                Not issued
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Paperless Consent */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/40 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[14px] font-bold text-slate-900 dark:text-white">Paperless Delivery</h3>
            <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-1">
              Receive your tax forms electronically instead of by mail. Required for immediate e-delivery.
            </p>
          </div>
          <button
            onClick={() => { setPaperlessConsent(!paperlessConsent); toast.success(paperlessConsent ? "Paperless delivery disabled" : "Paperless delivery enabled"); }}
            className="flex-shrink-0"
          >
            {paperlessConsent ? (
              <ToggleRight size={36} className="text-violet-600 dark:text-violet-400" />
            ) : (
              <ToggleLeft size={36} className="text-slate-400" />
            )}
          </button>
        </div>
      </div>
    </>
  );
}
