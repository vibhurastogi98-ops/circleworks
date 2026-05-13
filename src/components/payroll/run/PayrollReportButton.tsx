"use client";

import React, { useState } from "react";
import { Download, Loader2, FileCheck2 } from "lucide-react";
import { toast } from "sonner";

export default function PayrollReportButton({ runId }: { runId?: string }) {
  const [exporting, setExporting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleExport = async () => {
    if (!runId) return;
    setExporting(true);
    setSuccess(false);
    try {
      const res = await fetch(`/api/payroll/runs/${encodeURIComponent(runId)}/report-pdf`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || res.statusText);
      }
      const jobId = res.headers.get("X-Pdf-Job-Id");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `payroll-run-${runId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      if (jobId) {
        toast.success("Payroll report downloaded", {
          description: `Queued on pdf-generation (job ${jobId}).`,
        });
      } else {
        toast.success("Payroll report downloaded", {
          description: "PDF generated; add REDIS_URL to enqueue BullMQ jobs.",
        });
      }
    } catch (e) {
      toast.error("Could not generate report", {
        description: e instanceof Error ? e.message : "Unknown error",
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      type="button"
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
        ? "Generating PDF…"
        : success
          ? "Downloaded"
          : "Download Payroll Report"}
    </button>
  );
}
