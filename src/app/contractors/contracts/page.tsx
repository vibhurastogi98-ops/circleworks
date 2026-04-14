"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  FileText, Clock, AlertTriangle, CheckCircle2, PenTool, Calendar,
  DollarSign, MoreHorizontal, Plus, X, Send, Eye, Filter
} from "lucide-react";
import { mockContracts, type ContractRecord, type ContractType } from "@/data/mockContractors";
import { ContractorSubNav } from "../page";
import { formatDate } from "@/utils/formatDate";
import { toast } from "sonner";

/* ─── Contract Detail Drawer ──────────────────────────────────── */

function ContractDrawer({ contract, onClose }: { contract: ContractRecord; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[200] flex justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300 overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-10">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Contract Details</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-6">
          {/* Title */}
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Contract Title</div>
            <div className="text-base font-bold text-slate-900 dark:text-white">{contract.title}</div>
          </div>

          {/* Contractor */}
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Contractor</div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white text-xs font-bold">
                {contract.contractorName.split(" ").map(n => n[0]).join("")}
              </div>
              <span className="font-semibold text-slate-900 dark:text-white">{contract.contractorName}</span>
            </div>
          </div>

          {/* Grid Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Type</div>
              <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-bold">
                {contract.type}
              </span>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Rate</div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                ${contract.rate.toLocaleString()}{contract.rateUnit}
              </div>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Start Date</div>
              <div className="text-sm text-slate-900 dark:text-white font-medium">{formatDate(contract.startDate)}</div>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">End Date</div>
              <div className="text-sm text-slate-900 dark:text-white font-medium">{formatDate(contract.endDate)}</div>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Payment Terms</div>
              <div className="text-sm text-slate-900 dark:text-white font-medium">{contract.paymentTerms}</div>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Status</div>
              <ContractStatusBadge status={contract.status} />
            </div>
          </div>

          {/* Signatures */}
          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">E-Signatures</div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700 dark:text-slate-300">Admin</span>
                {contract.signedByAdmin ? (
                  <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
                    <CheckCircle2 size={14} /> Signed
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-600 text-xs font-bold">
                    <Clock size={14} /> Pending
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700 dark:text-slate-300">Contractor</span>
                {contract.signedByContractor ? (
                  <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
                    <CheckCircle2 size={14} /> Signed
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-600 text-xs font-bold">
                    <Clock size={14} /> Pending
                  </span>
                )}
              </div>
              {contract.signedAt && (
                <p className="text-[10px] text-slate-400 mt-1">Fully executed on {formatDate(contract.signedAt)}</p>
              )}
            </div>
          </div>

          {/* Expiry Alert */}
          {contract.daysUntilExpiry > 0 && contract.daysUntilExpiry <= 30 && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-red-700 dark:text-red-400">
                  Contract expires in {contract.daysUntilExpiry} days
                </p>
                <p className="text-xs text-red-600 dark:text-red-400/80 mt-0.5">
                  Consider renewing or extending this contract before expiration.
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            {!contract.signedByContractor && contract.status === "Pending Signature" && (
              <button
                onClick={() => {
                  toast.success("Signature request sent", { description: `Reminder sent to ${contract.contractorName}` });
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold rounded-lg transition-colors"
              >
                <Send size={14} /> Request Signature
              </button>
            )}
            <button
              onClick={() => toast.info("Download started")}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Contract Status Badge ───────────────────────────────────── */

function ContractStatusBadge({ status }: { status: ContractRecord["status"] }) {
  const config: Record<string, string> = {
    Active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    Expired: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border-red-200 dark:border-red-800",
    "Pending Signature": "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    Draft: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${config[status]}`}>
      {status}
    </span>
  );
}

/* ─── Main Page ───────────────────────────────────────────────── */

export default function ContractsPage() {
  const [selectedContract, setSelectedContract] = useState<ContractRecord | null>(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  const filteredContracts = useMemo(() => {
    return mockContracts.filter((c) => {
      const matchStatus = statusFilter === "All" || c.status === statusFilter;
      const matchType = typeFilter === "All" || c.type === typeFilter;
      return matchStatus && matchType;
    });
  }, [statusFilter, typeFilter]);

  // Expiry alerts
  const expiringContracts = mockContracts.filter(
    (c) => c.status === "Active" && c.daysUntilExpiry > 0 && c.daysUntilExpiry <= 30
  );

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <FileText size={20} className="text-white" />
            </div>
            Contract Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 ml-[52px]">
            Manage contractor agreements, track expirations, and collect e-signatures.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-600/20">
          <Plus size={16} /> New Contract
        </button>
      </div>

      <ContractorSubNav active="/contractors/contracts" />

      {/* Expiry Alerts */}
      {expiringContracts.length > 0 && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-red-500" />
            <h4 className="text-sm font-bold text-red-700 dark:text-red-400">Expiry Alerts</h4>
          </div>
          <div className="flex flex-wrap gap-3">
            {expiringContracts.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedContract(c)}
                className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-red-200 dark:border-red-800 rounded-lg text-sm hover:shadow-md transition-all"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white text-[10px] font-bold">
                  {c.contractorName.split(" ").map(n => n[0]).join("")}
                </div>
                <span className="font-bold text-slate-900 dark:text-white">{c.contractorName}</span>
                <span className="text-xs text-red-600 font-bold">{c.daysUntilExpiry}d left</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Expired">Expired</option>
          <option value="Pending Signature">Pending Signature</option>
          <option value="Draft">Draft</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        >
          <option value="All">All Types</option>
          <option value="Hourly">Hourly</option>
          <option value="Project">Project</option>
          <option value="Retainer">Retainer</option>
        </select>
      </div>

      {/* Contracts Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium tracking-wide">
              <tr>
                <th className="px-5 py-3.5">Contract</th>
                <th className="px-5 py-3.5">Contractor</th>
                <th className="px-5 py-3.5">Type</th>
                <th className="px-5 py-3.5">Rate</th>
                <th className="px-5 py-3.5">Dates</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Signatures</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredContracts.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 group cursor-pointer" onClick={() => setSelectedContract(c)}>
                  <td className="px-5 py-4">
                    <p className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-indigo-600 transition-colors max-w-[200px] truncate">{c.title}</p>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white text-[10px] font-bold">
                        {c.contractorName.split(" ").map(n => n[0]).join("")}
                      </div>
                      <span className="font-medium text-slate-700 dark:text-slate-300">{c.contractorName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md text-xs font-bold">
                      {c.type}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">
                    ${c.rate.toLocaleString()}<span className="text-slate-400 font-medium text-xs">{c.rateUnit}</span>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-xs text-slate-600 dark:text-slate-400">{formatDate(c.startDate)}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      → {formatDate(c.endDate)}
                      {c.daysUntilExpiry > 0 && c.daysUntilExpiry <= 30 && (
                        <AlertTriangle size={10} className="text-red-500" />
                      )}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <ContractStatusBadge status={c.status} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      {c.signedByAdmin && <CheckCircle2 size={14} className="text-emerald-500" />}
                      {c.signedByContractor && <CheckCircle2 size={14} className="text-emerald-500" />}
                      {(!c.signedByAdmin || !c.signedByContractor) && <Clock size={14} className="text-amber-500" />}
                      <span className="text-xs text-slate-500 ml-1">
                        {c.signedByAdmin && c.signedByContractor ? "Complete" : "Pending"}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredContracts.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                    No contracts found matching the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contract Drawer */}
      {selectedContract && (
        <ContractDrawer contract={selectedContract} onClose={() => setSelectedContract(null)} />
      )}
    </div>
  );
}
