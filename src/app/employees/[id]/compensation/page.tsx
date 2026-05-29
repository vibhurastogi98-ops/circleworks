"use client";

import { useParams } from "next/navigation";

import { EmployeeCompensationScreen } from "@/components/employees/EmployeesModuleScreens";

export default function EmployeeCompensationPage() {
  const params = useParams<{ id: string }>();

  return <EmployeeCompensationScreen employeeId={params.id} />;
}
