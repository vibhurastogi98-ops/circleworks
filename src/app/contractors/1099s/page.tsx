"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  FileText, Send, Building2, Search, CheckCircle2, Clock, 
  AlertTriangle, Eye, Download, Info, HardDriveUpload
} from "lucide-react";
import { mock1099s, type NEC1099 } from "@/data/mockContractors";
import { ContractorSubNav } from "../page";
import { formatDate } from "@/utils/formatDate";
import { toast } from "sonner";

export default function NEC1099Page() {
  const [taxYear, setTaxYear] = useState(new Date().getFullYear());
  const [search, setSearch] = useState("");
  const [isEfiling, setIsEfiling] = useState(false);

  const fmtMoney = (val: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(val);

  const filtered1099s = useMemo(() => {
    return mock1099s.filter((n) => {
      const matchYear = n.taxYear === taxYear;
      const matchSearch = n.contractorName.toLowerCase().includes(search.toLowerCase());
      return matchYear && matchSearch;
    });
  }, [taxYear, search]);

  const totals = useMemo(() => {
    const readyOrDraft = filtered1099s.filter(n => n.status === "Draft" || n.status === "Ready").length;
    const filedOrDelivered = filtered1099s.filter(n => n.status === "Filed" || n.status === "Delivered").length;
    const totalBox1 = filtered1099s.reduce((sum, n) => sum + n.box1Amount, 0);
    return { readyOrDraft, filedOrDelivered, totalBox1 };
  }, [filtered1099s]);

  const handleEFileSelectAll = async () => {
    setIsEfiling(true);
    await new Promise(r => setTimeout(r, 2000));
    toast.success(`E-filed ${totals.readyOrDraft} forms to IRS`, { description: "Forms are also queued for delivery to contractors." });
    setIsEfiling(false);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center shadow-lg shadow-red-500/20">
              <Building2 size={20} className="text-white" />
            </div>
            1099-NEC Generation
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 ml-[52px]">
            Auto-generate, e-file to the IRS, and deliver 1099-NEC forms for contractors paid $600+.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={taxYear}
            onChange={(e) => setTaxYear(Number(e.target.value))}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500/50"
          >
            <option value={2025}>2025 Tax Year</option>
            <option value={2024}>2024 Tax Year</option>
            <option value={2023}>2023 Tax Year</option>
          </select>
          <button 
            onClick={handleEFileSelectAll}
            disabled={totals.readyOrDraft === 0 || isEfiling}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEfiling ? <Clock size={16} className="animate-spin" /> : <HardDriveUpload size={16} />}
            E-File {totals.readyOrDraft} Ready Forms
          </button>
        </div>
      </div>

      <ContractorSubNav active="/contractors/1099s" />

      {/* Info Banner */}
      {taxYear === new Date().getFullYear() && (
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-start gap-3">
          <Info size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-blue-800 dark:text-blue-300">
              Current Tax Year ({taxYear}) Preview
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              These amounts are estimates based on YTD payments. Forms cannot be filed until January of the following year. 
              Contractors who do not reach the $600 reporting threshold will not generate a form.
            </p>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Box 1 (Nonemployee Comp)</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{fmtMoney(totals.totalBox1)}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Ready / Draft Forms</p>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-500">{totals.readyOrDraft}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Filed & Delivered</p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-500">{totals.filedOrDelivered}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
           <div className="relative flex-1 max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                 type="text" 
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 placeholder="Search by contractor name..." 
                 className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 dark:text-white"
              />
           </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium tracking-wide">
              <tr>
                <th className="px-5 py-3.5">Contractor</th>
                <th className="px-5 py-3.5">TIN</th>
                <th className="px-5 py-3.5 text-right">Box 1 Amount</th>
                <th className="px-5 py-3.5">Delivery Status</th>
                <th className="px-5 py-3.5">IRS Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered1099s.map((nec) => (
                <tr key={nec.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 group">
                  <td className="px-5 py-4">
                    <p className="font-bold text-slate-900 dark:text-white">{nec.contractorName}</p>
                  </td>
                  <td className="px-5 py-4 text-slate-600 dark:text-slate-400 font-mono text-xs">{nec.tin || "—"}</td>
                  <td className="px-5 py-4 text-right">
                    <span className="font-bold text-slate-900 dark:text-white">{fmtMoney(nec.box1Amount)}</span>
                  </td>
                  <td className="px-5 py-4">
                    {nec.status === "Delivered" ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                        <CheckCircle2 size={14} /> Delivered ({nec.deliveryMethod})
                      </span>
                    ) : nec.status === "Filed" ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-bold">
                        <Clock size={14} /> Pending Delivery
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-bold">
                        Not Sent
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                       nec.status === "Filed" || nec.status === "Delivered" 
                         ? "bg-emerald-100 border-emerald-200 text-emerald-700 dark:bg-emerald-500/20 dark:border-emerald-800 dark:text-emerald-400"
                         : "bg-amber-100 border-amber-200 text-amber-700 dark:bg-amber-500/20 dark:border-amber-800 dark:text-amber-400"
                    }`}>
                      {nec.status === "Filed" || nec.status === "Delivered" ? "Accepted" : "Draft / Ready"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-1.5">
                       <button className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title="View Form">
                          <Eye size={16} />
                       </button>
                       <button className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors" title="Download PDF">
                          <Download size={16} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered1099s.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No 1099-NEC forms found for this tax year.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
