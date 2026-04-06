"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Upload, Download, CheckCircle2, Clock, Eye, PenTool, FolderOpen } from "lucide-react";
import { mockEmployeeDocuments } from "@/data/mockEmployeePortal";
import { toast } from "sonner";

const statusStyles: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
  Signed: { bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-600 dark:text-emerald-400", icon: CheckCircle2 },
  "Pending Signature": { bg: "bg-amber-50 dark:bg-amber-900/20", text: "text-amber-600 dark:text-amber-400", icon: PenTool },
  Read: { bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-600 dark:text-blue-400", icon: Eye },
};

export default function DocumentsPage() {
  const [activeTab, setActiveTab] = useState<"company" | "personal">("company");

  const companyDocs = mockEmployeeDocuments.filter(d => d.type === "Company Policy" || d.type === "Signed Document");
  const personalDocs = mockEmployeeDocuments.filter(d => d.type === "Personal" || d.type === "Pay Stub" || d.type === "Tax Form");
  const pendingSign = mockEmployeeDocuments.filter(d => d.status === "Pending Signature");
  const docs = activeTab === "company" ? companyDocs : personalDocs;

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Documents</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">View, sign, and manage your documents</p>
        </div>
        <button onClick={() => toast("File upload modal coming soon")} className="h-10 px-5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-[13px] font-bold flex items-center gap-2 transition-colors shadow-sm w-fit">
          <Upload size={16} /> Upload Document
        </button>
      </div>

      {/* Pending Signatures */}
      {pendingSign.length > 0 && (
        <div className="rounded-xl border-2 border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-900/10 p-4">
          <h3 className="text-[13px] font-bold text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-2">
            <PenTool size={14} /> E-Signatures Required ({pendingSign.length})
          </h3>
          {pendingSign.map(doc => (
            <div key={doc.id} className="flex items-center gap-3 mt-2">
              <FileText size={14} className="text-amber-600 dark:text-amber-400" />
              <span className="text-[13px] font-semibold text-amber-900 dark:text-amber-200 flex-1">{doc.name}</span>
              <button onClick={() => toast.success(`Opened ${doc.name} for signing`)} className="text-[12px] font-bold text-amber-700 dark:text-amber-400 hover:underline">
                Sign Now →
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tab Toggle */}
      <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800 w-fit">
        {(["company", "personal"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-md text-[13px] font-bold transition-all ${activeTab === tab ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-slate-400"}`}>
            {tab === "company" ? "Company Documents" : "My Documents"}
          </button>
        ))}
      </div>

      {/* Documents List */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/40 overflow-hidden">
        {docs.map((doc, i) => {
          const statusInfo = doc.status ? statusStyles[doc.status] : null;
          const StatusIcon = statusInfo?.icon || FileText;
          return (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center gap-4 px-4 py-3 border-b border-slate-100 dark:border-slate-700/30 hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center flex-shrink-0">
                <FileText size={16} className="text-violet-600 dark:text-violet-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-slate-900 dark:text-white truncate">{doc.name}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {doc.category} · {doc.fileSize} · Uploaded by {doc.uploadedBy} on {new Date(doc.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              {statusInfo && (
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 flex-shrink-0 ${statusInfo.bg} ${statusInfo.text}`}>
                  <StatusIcon size={10} /> {doc.status}
                </span>
              )}
              <button onClick={() => toast.success(`Downloaded ${doc.name}`)} className="p-2 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-900/20 text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors flex-shrink-0">
                <Download size={16} />
              </button>
            </motion.div>
          );
        })}
      </div>
    </>
  );
}
