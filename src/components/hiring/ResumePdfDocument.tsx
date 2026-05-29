"use client";

import { Document, Page, pdfjs } from "react-pdf";

if (typeof window !== "undefined") {
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
}

export function ResumePdfDocument({ file }: { file: string }) {
  return (
    <Document file={file} loading={<div className="p-6 text-sm text-slate-500">Loading resume...</div>}>
      <Page pageNumber={1} width={360} />
    </Document>
  );
}
