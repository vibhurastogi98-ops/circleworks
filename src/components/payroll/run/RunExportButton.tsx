"use client";

import React, { useState } from "react";
import { Download, Loader2 } from "lucide-react";

export default function RunExportButton() {
  const [exporting, setExporting] = useState(false);

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => setExporting(false), 1500);
  };

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
    >
      {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
      {exporting ? "Generating CSV..." : "Download Journal Entry (CSV)"}
    </button>
  );
}
