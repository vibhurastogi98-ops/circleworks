"use client";

import { useParams } from "next/navigation";

import { PaystubsScreen } from "@/components/payroll/PayrollModuleScreens";

export default function PayrollRunPaystubsPage() {
  const params = useParams<{ runId: string }>();
  return <PaystubsScreen runId={params.runId} />;
}
