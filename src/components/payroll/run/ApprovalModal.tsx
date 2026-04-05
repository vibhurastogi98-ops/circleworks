"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  CheckCircle2,
  Clock,
  Send,
  Loader2,
  Rocket,
} from "lucide-react";
import { usePayrollRunStore } from "@/store/usePayrollRunStore";

export default function ApprovalModal() {
  const {
    showApprovalModal,
    setShowApprovalModal,
    approvers,
    approveApprover,
    setShowProcessing,
    setRunState,
  } = usePayrollRunStore();

  const allApproved = approvers.every((a) => a.status === "approved");
  const [sending, setSending] = React.useState(false);

  const handleSendForApproval = () => {
    setSending(true);
    // Simulate sending emails then auto-approve after delays
    setTimeout(() => {
      approveApprover(approvers[0]?.id);
      setTimeout(() => {
        approveApprover(approvers[1]?.id);
        setSending(false);
      }, 1500);
    }, 1500);
  };

  const handleRunNow = () => {
    setShowApprovalModal(false);
    setRunState("processing");
    setShowProcessing(true);
  };

  return (
    <AnimatePresence>
      {showApprovalModal && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setShowApprovalModal(false)}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[81] flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Submit for Approval
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Required approvers for this payroll run
                  </p>
                </div>
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Approvers List */}
              <div className="p-6 space-y-3">
                {approvers.map((approver) => (
                  <div
                    key={approver.id}
                    className={`flex items-center gap-3 p-4 rounded-xl border transition-colors ${
                      approver.status === "approved"
                        ? "bg-emerald-50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20"
                        : "bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700/50"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex-shrink-0 border border-slate-300 dark:border-slate-600">
                      <img
                        src={approver.avatar}
                        alt={approver.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {approver.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {approver.role}
                      </p>
                    </div>
                    <div>
                      {approver.status === "approved" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
                          <CheckCircle2 size={12} />
                          Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          <Clock size={12} />
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="px-6 pb-6 flex flex-col gap-2">
                {allApproved ? (
                  <button
                    onClick={handleRunNow}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                  >
                    <Rocket size={16} />
                    Run Payroll Now
                  </button>
                ) : (
                  <button
                    onClick={handleSendForApproval}
                    disabled={sending}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all disabled:cursor-not-allowed"
                  >
                    {sending ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Sending requests…
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Send for Approval
                      </>
                    )}
                  </button>
                )}
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="w-full px-6 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
