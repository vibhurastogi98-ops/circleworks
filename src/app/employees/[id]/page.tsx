"use client";

import { useParams } from "next/navigation";

import { EmployeeOverviewScreen } from "@/components/employees/EmployeesModuleScreens";

export default function EmployeeOverviewPage() {
  const params = useParams<{ id: string }>();

  return <EmployeeOverviewScreen employeeId={params.id} />;
}
