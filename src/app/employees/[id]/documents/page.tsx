"use client";

import { useParams } from "next/navigation";

import { EmployeeDocumentsScreen } from "@/components/employees/EmployeesModuleScreens";

export default function EmployeeDocumentsPage() {
  const params = useParams<{ id: string }>();

  return <EmployeeDocumentsScreen employeeId={params.id} />;
}
