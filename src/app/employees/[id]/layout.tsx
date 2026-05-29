"use client";

import { useParams } from "next/navigation";

import { EmployeeProfileShell } from "@/components/employees/EmployeesModuleScreens";

export default function EmployeeProfileLayout({ children }: { children: React.ReactNode }) {
  const params = useParams<{ id: string }>();

  return (
    <EmployeeProfileShell employeeId={params.id}>
      {children}
    </EmployeeProfileShell>
  );
}
