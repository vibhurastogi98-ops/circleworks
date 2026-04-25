"use client";

import React, { useState } from "react";
import { Download, Loader2, FileCheck2 } from "lucide-react";

export default function PayrollReportButton({ runId }: { runId?: string }) {
  const [exporting, setExporting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleExport = () => {
    setExporting(true);
    // Simulate enqueueing to BullMQ 'pdf-generation' queue
    setTimeout(() => {
      setExporting(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 1500);
  };

  return (
    <button
      onClick={handleExport}
      disabled={exporting || success}
      className={`px-5 py-2.5 text-white text-sm font-bold rounded-xl shadow-md flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transition-colors ${
        success ? "bg-emerald-600 hover:bg-emerald-700" : "bg-blue-600 hover:bg-blue-700"
      }`}
    >
      {exporting ? (
        <Loader2 size={16} className="animate-spin" />
      ) : success ? (
        <FileCheck2 size={16} />
      ) : (
        <Download size={16} />
      )}
      {exporting
        ? "Generating PDF via queue..."
        : success
        ? "PDF Generated!"
        : "Download Payroll Report"}
    </button>
  );
}
