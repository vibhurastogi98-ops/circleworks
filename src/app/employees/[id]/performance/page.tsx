"use client";

import { useParams } from "next/navigation";

import { EmployeePerformanceScreen } from "@/components/employees/EmployeesModuleScreens";

export default function EmployeePerformancePage() {
  const params = useParams<{ id: string }>();

  return <EmployeePerformanceScreen employeeId={params.id} />;
}
