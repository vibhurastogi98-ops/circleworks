"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  DollarSign, CheckCircle2, Clock, AlertTriangle, X, Eye,
  ThumbsUp, ThumbsDown, MessageSquare, FileText, Download,
  TrendingUp, ArrowUpRight, Loader2, RotateCcw
} from "lucide-react";
import { mockInvoices, type Invoice, type InvoiceStatus } from "@/data/mockContractors";
import { ContractorSubNav } from "../page";
import { formatDate } from "@/utils/formatDate";
import { toast } from "sonner";

/* ─── Invoice Status Badge ────────────────────────────────────── */

function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const config: Record<InvoiceStatus, { bg: string; icon: React.ElementType }> = {
    Pending: { bg: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-800", icon: Clock },
    Approved: { bg: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200 dark:border-blue-800", icon: ThumbsUp },
    Rejected: { bg: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border-red-200 dark:border-red-800", icon: ThumbsDown },
    "Revision Requested": { bg: "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400 border-orange-200 dark:border-orange-800", icon: MessageSquare },
    Paid: { bg: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800", icon: CheckCircle2 },
  };

  const c = config[status];
  const Icon = c.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${c.bg}`}>
      <Icon size={10} />
      {status}
    </span>
  );
}

/* ─── Invoice Detail Drawer ───────────────────────────────────── */

function InvoiceDrawer({ invoice, onClose, onAction }: {
  invoice: Invoice;
  onClose: () => void;
  onAction: (id: string, action: string) => void;
}) {
  const [revisionNote, setRevisionNote] = useState("");

  return (
    <div className="fixed inset-0 z-[200] flex justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300 overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-10">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Invoice Details</h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{invoice.invoiceNumber}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-6">
          {/* Amount */}
          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase mb-1">Amount</div>
              <div className="text-3xl font-black text-slate-900 dark:text-white">
                ${invoice.amount.toLocaleString()}
              </div>
            </div>
            <InvoiceStatusBadge status={invoice.status} />
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Contractor</div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white text-[10px] font-bold">
                  {invoice.contractorName.split(" ").map(n => n[0]).join("")}
                </div>
                <span className="font-semibold text-sm text-slate-900 dark:text-white">{invoice.contractorName}</span>
              </div>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Submitted</div>
              <div className="text-sm font-medium text-slate-900 dark:text-white">{formatDate(invoice.submittedDate)}</div>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Due Date</div>
              <div className="text-sm font-medium text-slate-900 dark:text-white">{formatDate(invoice.dueDate)}</div>
            </div>
            {invoice.hours && (
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Hours × Rate</div>
                <div className="text-sm font-medium text-slate-900 dark:text-white">{invoice.hours}h × ${invoice.rate}/hr</div>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Description</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{invoice.description}</p>
          </div>

          {/* Attachment */}
          {invoice.attachmentName && (
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
              <FileText size={18} className="text-slate-400" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex-1">{invoice.attachmentName}</span>
              <button className="text-blue-600 hover:text-blue-700 text-xs font-bold flex items-center gap-1">
                <Download size={12} /> Download
              </button>
            </div>
          )}

          {/* Revision Note */}
          {invoice.status === "Pending" && (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Note (for revision requests)</label>
              <textarea
                value={revisionNote}
                onChange={(e) => setRevisionNote(e.target.value)}
                placeholder="Add a note explaining what needs to be revised..."
                rows={3}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white resize-none"
              />
            </div>
          )}

          {/* Actions */}
          {invoice.status === "Pending" && (
            <div className="flex gap-3">
              <button
                onClick={() => onAction(invoice.id, "approve")}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition-colors"
              >
                <ThumbsUp size={14} /> Approve
              </button>
              <button
                onClick={() => onAction(invoice.id, "revision")}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold rounded-lg transition-colors"
              >
                <MessageSquare size={14} /> Request Revision
              </button>
              <button
                onClick={() => onAction(invoice.id, "reject")}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition-colors"
              >
                <ThumbsDown size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────────────────── */

export default function PaymentsPage() {
  const [invoices, setInvoices] = useState(mockInvoices);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [statusFilter, setStatusFilter] = useState("All");

  const fmtMoney = (val: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(val);

  const filteredInvoices = useMemo(() => {
    return statusFilter === "All"
      ? invoices
      : invoices.filter((inv) => inv.status === statusFilter);
  }, [invoices, statusFilter]);

  const totals = useMemo(() => ({
    pending: invoices.filter(i => i.status === "Pending").reduce((s, i) => s + i.amount, 0),
    approved: invoices.filter(i => i.status === "Approved").reduce((s, i) => s + i.amount, 0),
    paid: invoices.filter(i => i.status === "Paid").reduce((s, i) => s + i.amount, 0),
    pendingCount: invoices.filter(i => i.status === "Pending").length,
  }), [invoices]);

  const handleAction = (id: string, action: string) => {
    const newStatus: InvoiceStatus =
      action === "approve" ? "Approved" :
      action === "reject" ? "Rejected" : "Revision Requested";

    setInvoices(prev => prev.map(inv =>
      inv.id === id ? { ...inv, status: newStatus } : inv
    ));

    const messages: Record<string, string> = {
      approve: "Invoice approved — queued for payment in /payroll/contractors",
      reject: "Invoice rejected",
      revision: "Revision request sent to contractor",
    };

    toast.success(messages[action]);
    setSelectedInvoice(null);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <DollarSign size={20} className="text-white" />
            </div>
            Invoice & Payments
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 ml-[52px]">
            Review, approve, and track contractor invoices. Approved invoices auto-queue to payroll.
          </p>
        </div>
      </div>

      <ContractorSubNav active="/contractors/payments" />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Pending Review</span>
            <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-xs font-bold">
              {totals.pendingCount}
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{fmtMoney(totals.pending)}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Approved / Queued</span>
            <ArrowUpRight size={14} className="text-blue-400" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{fmtMoney(totals.approved)}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Auto-queued to /payroll/contractors</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Paid This Period</span>
            <TrendingUp size={14} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{fmtMoney(totals.paid)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        {["All", "Pending", "Approved", "Revision Requested", "Rejected", "Paid"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              statusFilter === s
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Invoice Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium tracking-wide">
              <tr>
                <th className="px-5 py-3.5">Invoice</th>
                <th className="px-5 py-3.5">Contractor</th>
                <th className="px-5 py-3.5 text-right">Amount</th>
                <th className="px-5 py-3.5">Submitted</th>
                <th className="px-5 py-3.5">Due</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 group cursor-pointer" onClick={() => setSelectedInvoice(inv)}>
                  <td className="px-5 py-4">
                    <p className="font-bold text-slate-900 dark:text-white font-mono text-xs group-hover:text-emerald-600 transition-colors">{inv.invoiceNumber}</p>
                    <p className="text-xs text-slate-500 mt-0.5 max-w-[200px] truncate">{inv.description}</p>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white text-[10px] font-bold">
                        {inv.contractorName.split(" ").map(n => n[0]).join("")}
                      </div>
                      <span className="font-medium text-slate-700 dark:text-slate-300">{inv.contractorName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className="font-bold text-slate-900 dark:text-white">{fmtMoney(inv.amount)}</span>
                  </td>
                  <td className="px-5 py-4 text-slate-600 dark:text-slate-400">{formatDate(inv.submittedDate)}</td>
                  <td className="px-5 py-4 text-slate-600 dark:text-slate-400">{formatDate(inv.dueDate)}</td>
                  <td className="px-5 py-4">
                    <InvoiceStatusBadge status={inv.status} />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                      {inv.status === "Pending" && (
                        <>
                          <button
                            onClick={() => handleAction(inv.id, "approve")}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                            title="Approve"
                          >
                            <ThumbsUp size={15} />
                          </button>
                          <button
                            onClick={() => handleAction(inv.id, "revision")}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                            title="Request Revision"
                          >
                            <RotateCcw size={15} />
                          </button>
                          <button
                            onClick={() => handleAction(inv.id, "reject")}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="Reject"
                          >
                            <ThumbsDown size={15} />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        title="View Details"
                      >
                        <Eye size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No invoices found for the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Drawer */}
      {selectedInvoice && (
        <InvoiceDrawer
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onAction={handleAction}
        />
      )}
    </div>
  );
}
