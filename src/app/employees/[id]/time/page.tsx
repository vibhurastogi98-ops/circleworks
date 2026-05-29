"use client";

import { useParams } from "next/navigation";

import { EmployeeTimeScreen } from "@/components/employees/EmployeesModuleScreens";

export default function EmployeeTimePage() {
  const params = useParams<{ id: string }>();

  return <EmployeeTimeScreen employeeId={params.id} />;
}
