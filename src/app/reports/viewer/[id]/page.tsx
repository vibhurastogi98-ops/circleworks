"use client";

import { useParams } from "next/navigation";

import { ReportViewerContent } from "@/components/reports/ReportViewerContent";

export default function ReportViewerPage() {
  const params = useParams();
  const reportId = params.id as string;

  return <ReportViewerContent reportId={reportId} />;
}
