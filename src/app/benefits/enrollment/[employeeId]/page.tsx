"use client";

import { useParams } from "next/navigation";

import { BenefitsEnrollmentWizardScreen } from "@/components/benefits/BenefitsModuleScreens";

export default function BenefitsEmployeeEnrollmentPage() {
  const params = useParams<{ employeeId: string }>();
  return <BenefitsEnrollmentWizardScreen employeeId={params.employeeId || "1"} />;
}
