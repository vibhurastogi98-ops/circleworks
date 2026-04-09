"use client";

import { useQuery } from "@tanstack/react-query";

export type EmployeeProfile = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  jobTitle?: string;
  department?: string;
  startDate?: string;
  employeeType?: string;
  location?: string;
  locationType?: string;
  avatarUrl?: string;
  status?: string;
  bankAccount?: {
    bankName: string;
    routingNumber: string;
    accountNumber: string;
    accountType: string;
    lastUpdated: string;
  } | null;
};

export type PayStub = {
  id: string;
  payDate: string;
  periodStart: string;
  periodEnd: string;
  grossPay: number;
  federalTax: number;
  stateTax: number;
  socialSecurity: number;
  medicare: number;
  healthInsurance: number;
  dentalInsurance: number;
  visionInsurance: number;
  retirement401k: number;
  fsaContribution: number;
  otherDeductions: number;
  netPay: number;
  hoursWorked: number;
  overtimeHours: number;
  overtimePay: number;
  bonusPay: number;
  year: number;
};

export type EmployeePortalData = {
  profile: EmployeeProfile;
  payStubs: PayStub[];
};

export function useEmployeePortal() {
  return useQuery<EmployeePortalData>({
    queryKey: ["employee-portal"],
    queryFn: async () => {
      const response = await fetch("/api/users/me");
      if (!response.ok) {
        throw new Error("Failed to load employee portal data");
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}
