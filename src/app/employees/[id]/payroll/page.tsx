"use client";

import { useParams } from "next/navigation";

import { EmployeePayrollScreen } from "@/components/employees/EmployeesModuleScreens";

export default function EmployeePayrollPage() {
  const params = useParams<{ id: string }>();

  return <EmployeePayrollScreen employeeId={params.id} />;
}
