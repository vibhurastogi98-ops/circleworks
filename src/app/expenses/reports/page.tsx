"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Search, 
  Filter, 
  Download, 
  MoreHorizontal, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  BadgeDollarSign,
  ArrowUpDown,
  ExternalLink
} from "lucide-react";
import { mockExpenseReports, ExpenseStatus } from "@/data/mockExpenses";
import { formatDate } from "@/utils/formatDate";

const STATUS_STYLING: Record<ExpenseStatus, string> = {
  Draft: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400",
  Submitted: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Approved: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  "Pending Payroll": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  Reimbursed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Paid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
};

export default function ExpenseReportsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ExpenseStatus | "All">("All");

  const filteredReports = useMemo(() => {
    return mockExpenseReports.filter(report => {
      const matchesSearch = report.employeeName.toLowerCase().includes(search.toLowerCase()) || 
                             report.id.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "All" || report.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Expense Reports</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
             Review and process employee reimbursement requests.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
        <div className="relative flex-1 w-full">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by employee or report ID..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
        
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg w-full lg:w-auto overflow-x-auto">
          {(["All", "Submitted", "Approved", "Pending Payroll", "Reimbursed", "Paid", "Rejected", "Draft"] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all whitespace-nowrap ${
                statusFilter === s 
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" 
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Report Details</th>
                <th className="px-6 py-4">Period</th>
                <th className="px-6 py-4 text-right">Items</th>
                <th className="px-6 py-4 text-right">Total</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Sync</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700 uppercase">
                          {report.employeeName.charAt(0)}
                       </div>
                       <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">{report.employeeName}</span>
                          <span className="text-xs text-slate-500">{report.department}</span>
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-slate-900 dark:text-white">#{report.id}</div>
                    <div className="text-xs text-slate-500">Submitted {report.submittedAt ? formatDate(report.submittedAt) : "—"}</div>
                  </td>
                  <td className="px-6 py-4">
                     <div className="text-sm text-slate-600 dark:text-slate-400">
                        {formatDate(report.startDate)} - {formatDate(report.endDate)}
                     </div>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium text-slate-600 dark:text-slate-400">
                    {report.itemCount} Items
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-black text-slate-900 dark:text-white">${report.totalAmount.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                       <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-transparent ${STATUS_STYLING[report.status]}`}>
                          {report.status}
                       </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center items-center gap-1">
                       {report.syncStatus === "Synced" ? (
                         <CheckCircle2 size={16} className="text-emerald-500" />
                       ) : report.syncStatus === "Pending" ? (
                         <Clock size={16} className="text-blue-500" />
                       ) : report.syncStatus === "Error" ? (
                         <XCircle size={16} className="text-red-500" />
                       ) : (
                         <span className="text-xs text-slate-400">—</span>
                       )}
                       <span className="text-xs font-semibold text-slate-500">{report.syncStatus !== "N/A" ? report.syncStatus : ""}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/expenses/reports/${report.id}`} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all inline-block">
                       <ExternalLink size={18} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredReports.length === 0 && (
          <div className="p-12 text-center">
            <BadgeDollarSign size={48} className="mx-auto text-slate-200 mb-2" />
            <p className="text-slate-500 text-sm">No expense reports found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
