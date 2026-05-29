"use client";

import { useParams } from "next/navigation";

import { EmployeeEditScreen } from "@/components/employees/EmployeesModuleScreens";

export default function EditEmployeePage() {
  const params = useParams<{ id: string }>();

  return <EmployeeEditScreen employeeId={params.id} />;
}
