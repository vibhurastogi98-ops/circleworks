"use client";

import { useParams } from "next/navigation";

import { EmployeeActivityScreen } from "@/components/employees/EmployeesModuleScreens";

export default function EmployeeActivityPage() {
  const params = useParams<{ id: string }>();

  return <EmployeeActivityScreen employeeId={params.id} />;
}
