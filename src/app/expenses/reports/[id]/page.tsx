"use client";

import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ChevronLeft, 
  Download, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  AlertTriangle, 
  Calendar, 
  Tag, 
  MoreVertical,
  ImageIcon,
  ShieldCheck,
  MessageSquare
} from "lucide-react";
import { approveExpenseReportForPayroll, getExpenseReportById, ExpenseReport, ExpenseItem } from "@/data/mockExpenses";
import { toast } from "sonner";
import { formatDate } from "@/utils/formatDate";

export default function ExpenseReportDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const report = useMemo(() => getExpenseReportById(id as string), [id]);
  
  const [rejectionNote, setRejectionNote] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  if (!report) return <div className="p-12 text-center text-slate-500">Expense report not found.</div>;

  const handleApprove = () => {
    approveExpenseReportForPayroll(id as string, "Sarah Chen");
    toast.success("Expense report approved and queued for payroll!");
    router.push("/expenses/reports");
  };

  const handleReject = () => {
    if (!rejectionNote) {
       toast.error("Rejection note is required.");
       return;
    }
    toast.error(`Report rejected. Employee notified: "${rejectionNote}"`);
    setShowRejectModal(false);
    router.push("/expenses/reports");
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-6xl mx-auto w-full">
      
      {/* Header & Breadcrumb */}
      <div className="flex flex-col gap-2">
        <Link href="/expenses/reports" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors w-fit">
          <ChevronLeft size={16} /> Back to Reports
        </Link>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-2">
          <div className="flex items-center gap-4">
             <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-xl shadow-inner border border-indigo-200/50 dark:border-indigo-800/50">
                {report.employeeName.charAt(0)}
             </div>
             <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                   Expense Report <span className="text-slate-400 font-normal">#{report.id}</span>
                </h1>
                <p className="text-sm text-slate-500 font-medium">
                   {report.employeeName} • {report.title} • {report.department}
                </p>
             </div>
          </div>
          
          <div className="flex items-center gap-3">
             {report.status === "Submitted" && (
                <>
                  <button 
                    onClick={() => setShowRejectModal(true)}
                    className="px-4 py-2 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20 rounded-xl text-sm font-bold hover:bg-red-100 dark:hover:bg-red-950/40 transition-all shadow-sm"
                  >
                    Reject Report
                  </button>
                  <button 
                    onClick={handleApprove}
                    className="px-6 py-2 bg-indigo-600 border border-indigo-500 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                  >
                    Approve & Queue for Payroll
                  </button>
                </>
             )}
             <button className="p-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                <Download size={20} />
             </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Column: Line Items */}
        <div className="lg:col-span-3 flex flex-col gap-6">
           
           {/* Summary Stats */}
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
                 <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Amount</div>
                 <div className="text-xl font-black text-slate-900 dark:text-white">${report.totalAmount.toLocaleString()}</div>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
                 <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Items</div>
                 <div className="text-xl font-black text-slate-900 dark:text-white">{report.itemCount}</div>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
                 <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Status</div>
                 <div className="text-xl font-black text-indigo-600 dark:text-indigo-400">{report.status}</div>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
                 <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Payroll Sync</div>
                 <div className="text-xl font-black text-emerald-500">{report.syncStatus}</div>
              </div>
           </div>

           {/* Items Table */}
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 font-bold text-slate-900 dark:text-white">
                 Line Items
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="px-5 py-3 w-12"></th>
                        <th className="px-5 py-3">Receipt / Date</th>
                        <th className="px-5 py-3">Merchant / Description</th>
                        <th className="px-5 py-3">Category</th>
                        <th className="px-5 py-3 text-right">Amount</th>
                        <th className="px-5 py-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                       {report.items?.map((item) => (
                         <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                           <td className="px-5 py-4">
                              {item.receiptUrl ? (
                                <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 flex items-center justify-center cursor-pointer border border-indigo-100 dark:border-indigo-800/50">
                                   <ImageIcon size={18} />
                                </div>
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-slate-400 flex items-center justify-center border border-dashed border-slate-300 dark:border-slate-700">
                                   <FileText size={18} />
                                </div>
                              )}
                           </td>
                           <td className="px-5 py-4">
                              <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">{formatDate(item.date)}</div>
                              <div className="text-[10px] text-slate-500">ID: {item.id}</div>
                           </td>
                           <td className="px-5 py-4">
                              <div className="text-sm font-bold text-slate-900 dark:text-white">{item.merchant}</div>
                              <div className="text-xs text-slate-500 italic max-w-xs">{item.description}</div>
                           </td>
                           <td className="px-5 py-4">
                              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-800 w-fit">
                                 <Tag size={10} className="text-indigo-500" />
                                 <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">{item.category}</span>
                              </div>
                           </td>
                           <td className="px-5 py-4 text-right">
                              <span className="text-sm font-black text-slate-900 dark:text-white">${item.amount.toLocaleString()}</span>
                           </td>
                           <td className="px-5 py-4">
                              <div className="flex justify-center">
                                 {item.policyStatus === "Pass" ? (
                                   <ShieldCheck size={20} className="text-emerald-500" />
                                 ) : item.policyStatus === "Warn" ? (
                                   <span title={item.policyNote || ""}>
                                     <AlertTriangle size={20} className="text-amber-500" />
                                   </span>
                                 ) : (
                                   <span title={item.policyNote || ""}>
                                     <XCircle size={20} className="text-red-500" />
                                   </span>
                                 )}
                              </div>
                           </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>

        </div>

        {/* Right Column: Sidebar info */}
        <div className="flex flex-col gap-6">
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
             <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2 uppercase tracking-widest text-[10px] text-slate-400">
                Timeline
             </h3>
             <div className="flex flex-col gap-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
                <div className="flex items-start gap-4 relative">
                   <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center z-10 border border-white dark:border-slate-950 shadow-sm shadow-indigo-500">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                   </div>
                   <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Report Created</div>
                      <div className="text-[10px] text-slate-500">{formatDate(report.startDate)}</div>
                   </div>
                </div>
                <div className="flex items-start gap-4 relative">
                   <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center z-10 border border-white dark:border-slate-950">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                   </div>
                   <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Submitted for Approval</div>
                      <div className="text-[10px] text-slate-500">{report.submittedAt ? new Date(report.submittedAt).toLocaleString() : "Pending"}</div>
                   </div>
                </div>
                <div className="flex items-start gap-4 relative opacity-50">
                   <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center z-10 border border-white dark:border-slate-950">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                   </div>
                   <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Payroll Queue</div>
                      <div className="text-[10px] text-slate-500">
                        {report.status === "Pending Payroll" ? "Queued for next payroll run" : "Awaiting approval"}
                      </div>
                   </div>
                </div>
             </div>
           </div>

           <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-5 shadow-sm">
             <h3 className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-2">
                <AlertTriangle size={14} /> Audit Trail
             </h3>
             <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 leading-relaxed font-medium">
                Receipt verification is required for all "Warn" and "Flag" items. Please ensure thumbnails match the merchant data.
             </p>
           </div>
        </div>
        
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl scale-in-center">
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 flex items-center justify-center">
                    <XCircle size={24} />
                 </div>
                 <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">Reject Report</h2>
                    <p className="text-sm text-slate-500 font-medium">Explain why this report is being rejected.</p>
                 </div>
              </div>
              
              <div className="flex flex-col gap-4">
                 <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">Rejection Note (Employee will see this)</label>
                    <textarea 
                      placeholder="e.g. Missing receipt for airport parking on Sep 10th..."
                      value={rejectionNote}
                      onChange={(e) => setRejectionNote(e.target.value)}
                      className="w-full min-h-[120px] rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none placeholder:text-slate-400"
                    />
                 </div>
                 
                 <div className="flex gap-3">
                    <button 
                       onClick={() => setShowRejectModal(false)}
                       className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                    >
                       Cancel
                    </button>
                    <button 
                       onClick={handleReject}
                       className="flex-1 px-4 py-3 bg-red-600 text-white rounded-2xl font-bold text-sm hover:bg-red-700 transition-all shadow-lg shadow-red-500/20 active:scale-95"
                    >
                       Confirm Rejection
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}
