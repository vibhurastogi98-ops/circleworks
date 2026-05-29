"use client";

import { useParams } from "next/navigation";

import { CompletedRunDetailScreen } from "@/components/payroll/PayrollModuleScreens";

export default function PayrollRunDetailPage() {
  const params = useParams<{ runId: string }>();
  return <CompletedRunDetailScreen runId={params.runId} />;
}
