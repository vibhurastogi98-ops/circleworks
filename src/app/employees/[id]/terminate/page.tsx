"use client";

import { useParams } from "next/navigation";

import { EmployeeTerminateScreen } from "@/components/employees/EmployeesModuleScreens";

export default function TerminateEmployeePage() {
  const params = useParams<{ id: string }>();

  return <EmployeeTerminateScreen employeeId={params.id} />;
}
