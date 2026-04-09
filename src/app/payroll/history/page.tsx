"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Download, Search, Calendar, FileText, Filter, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";

const HISTORY = [
  { id: "pr-001", date: "Mar 15, 2026", period: "Mar 1 – Mar 15", type: "Regular", status: "Paid", employees: 47, gross: 278420, net: 196315, taxes: 82105 },
  { id: "pr-002", date: "Feb 28, 2026", period: "Feb 16 – Feb 28", type: "Regular", status: "Paid", employees: 46, gross: 271880, net: 191710, taxes: 80170 },
  { id: "pr-003", date: "Feb 15, 2026", period: "Feb 1 – Feb 15", type: "Regular", status: "Paid", employees: 46, gross: 270100, net: 190450, taxes: 79650 },
  { id: "oc-001", date: "Feb 05, 2026", period: "Performance Bonus", type: "Off-cycle", status: "Paid", employees: 12, gross: 120000, net: 78000, taxes: 42000 },
];

function fmt(n: number) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(n); }

export default function HistoryPage() {
  const [search, setSearch] = useState("");
  const [exporting, setExporting] = useState(false);

  // Filter history by search query
  const filtered = HISTORY.filter((h) =>
    h.id.toLowerCase().includes(search.toLowerCase()) ||
    h.period.toLowerCase().includes(search.toLowerCase()) ||
    h.date.toLowerCase().includes(search.toLowerCase())
  );

  // Compute YTD totals dynamically from full history
  const ytdGross = HISTORY.reduce((s, h) => s + h.gross, 0);
  const ytdTaxes = HISTORY.reduce((s, h) => s + h.taxes, 0);
  const ytdNet = HISTORY.reduce((s, h) => s + h.net, 0);

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => setExporting(false), 1500);
  };
  return (
    <div className="flex flex-col gap-6 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center"><Calendar size={20} className="text-blue-600" /></div>
            Payroll History
          </h1>
          <p className="text-sm text-slate-500 mt-1 ml-[52px]">View all past payroll runs, export reports, and access historical data.</p>
        </div>
        <button onClick={handleExport} disabled={exporting} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-900 dark:text-white disabled:opacity-70 disabled:cursor-not-allowed">
          {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} 
          {exporting ? "Generating Excel..." : "Export to Excel"}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-2">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-400">Total Gross (YTD)</p>
          <p className="text-2xl font-extrabold mt-1 text-slate-900 dark:text-white">{fmt(ytdGross)}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-400">Total Taxes (YTD)</p>
          <p className="text-2xl font-extrabold mt-1 text-slate-900 dark:text-white">{fmt(ytdTaxes)}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-400">Total Net (YTD)</p>
          <p className="text-2xl font-extrabold mt-1 text-slate-900 dark:text-white">{fmt(ytdNet)}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex gap-4">
          <div className="relative w-72">
             <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
             <input
               type="text"
               placeholder="Search by ID or description..."
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"><Filter size={14}/> Filters</button>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 text-xs font-bold text-slate-400 uppercase">
              <th className="px-5 py-3">Run ID</th>
              <th className="px-5 py-3">Pay Period</th>
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3 text-right">Gross Pay</th>
              <th className="px-5 py-3 text-right">Taxes</th>
              <th className="px-5 py-3 text-right">Net Pay</th>
              <th className="px-5 py-3 text-center">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm border-t border-slate-200 dark:border-slate-800">
            {filtered.map((h) => (
              <tr key={h.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
                <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">{h.id}</td>
                <td className="px-5 py-4">
                  <p className="font-semibold text-slate-900 dark:text-white">{h.date}</p>
                  <p className="text-xs text-slate-500">{h.period}</p>
                </td>
                <td className="px-5 py-4"><span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${h.type === 'Regular' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>{h.type}</span></td>
                <td className="px-5 py-4 text-right font-bold text-slate-900 dark:text-white">{fmt(h.gross)}</td>
                <td className="px-5 py-4 text-right text-slate-500">{fmt(h.taxes)}</td>
                <td className="px-5 py-4 text-right font-bold text-slate-900 dark:text-white">{fmt(h.net)}</td>
                <td className="px-5 py-4 text-center"><span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-bold uppercase"><CheckCircle2 size={12}/> {h.status}</span></td>
                <td className="px-5 py-4 text-right">
                  <Link href={`/payroll/run/${h.id}`} className="text-blue-600 font-semibold hover:underline">View Details</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
