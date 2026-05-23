"use client";

import { useQuery } from "@tanstack/react-query";
import {
  mockAnnouncements,
  mockBenefitCards,
  mockCourses,
  mockDependents,
  mockEmployeeDocuments,
  mockEmployeeProfile,
  mockEwaData,
  mockExpenseReports,
  mockExpenses,
  mockGoals,
  mockKudos,
  mockPayStubs,
  mockPendingTasks,
  mockPtoBalances,
  mockPtoRequests,
  mockReferralData,
  mockTaxForms,
  mockTeamCalendar,
} from "@/data/mockEmployeePortal";

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
    bankLogoUrl?: string | null;
    routingNumber: string;
    accountNumber: string;
    mask?: string;
    accountType: string;
    verificationStatus?: string;
    verified?: boolean;
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
      const response = await fetch("/api/users/me", { credentials: "include" });
      if (!response.ok) {
        throw new Error("Failed to load employee portal data");
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}

export type EmployeeSelfServiceData = {
  profile: typeof mockEmployeeProfile;
  payStubs: typeof mockPayStubs;
  taxForms: typeof mockTaxForms;
  ptoBalances: typeof mockPtoBalances;
  ptoRequests: typeof mockPtoRequests;
  teamCalendar: typeof mockTeamCalendar;
  expenses: typeof mockExpenses;
  expenseReports: typeof mockExpenseReports;
  benefits: typeof mockBenefitCards;
  dependents: typeof mockDependents;
  documents: typeof mockEmployeeDocuments;
  courses: typeof mockCourses;
  goals: typeof mockGoals;
  ewa: typeof mockEwaData;
  referrals: typeof mockReferralData;
  pendingTasks: typeof mockPendingTasks;
  announcements: typeof mockAnnouncements;
  kudos: typeof mockKudos;
};

const employeeSelfServiceData: EmployeeSelfServiceData = {
  profile: mockEmployeeProfile,
  payStubs: mockPayStubs,
  taxForms: mockTaxForms,
  ptoBalances: mockPtoBalances,
  ptoRequests: mockPtoRequests,
  teamCalendar: mockTeamCalendar,
  expenses: mockExpenses,
  expenseReports: mockExpenseReports,
  benefits: mockBenefitCards,
  dependents: mockDependents,
  documents: mockEmployeeDocuments,
  courses: mockCourses,
  goals: mockGoals,
  ewa: mockEwaData,
  referrals: mockReferralData,
  pendingTasks: mockPendingTasks,
  announcements: mockAnnouncements,
  kudos: mockKudos,
};

export function useEmployeeSelfService() {
  return useQuery<EmployeeSelfServiceData>({
    queryKey: ["employee-self-service"],
    queryFn: async () => employeeSelfServiceData,
    initialData: employeeSelfServiceData,
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });
}
