"use client";

import { useParams } from "next/navigation";

import { EmployeeBenefitsScreen } from "@/components/employees/EmployeesModuleScreens";

export default function EmployeeBenefitsPage() {
  const params = useParams<{ id: string }>();

  return <EmployeeBenefitsScreen employeeId={params.id} />;
}
