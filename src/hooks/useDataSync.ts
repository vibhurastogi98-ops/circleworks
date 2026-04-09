"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { toast } from "sonner";

export function useDataSync() {
  const queryClient = useQueryClient();

  // Rule 1: After any payroll run completes, invalidate queries: ['payroll', 'employees', 'dashboard-stats', 'reports']
  const notifyPayrollComplete = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["payroll"] });
    await queryClient.invalidateQueries({ queryKey: ["employees"] });
    await queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    await queryClient.invalidateQueries({ queryKey: ["reports"] });
    console.log("🔄 Rule 1: Payroll Sync Complete");
  }, [queryClient]);

  // Rule 2: After employee hire/term, invalidate: ['employees', 'headcount', 'ats', 'onboarding', 'dashboard-stats']
  const notifyEmployeeChange = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["employees"] });
    await queryClient.invalidateQueries({ queryKey: ["headcount"] });
    await queryClient.invalidateQueries({ queryKey: ["ats"] });
    await queryClient.invalidateQueries({ queryKey: ["onboarding"] });
    await queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    console.log("🔄 Rule 2: Employee Sync Complete");
  }, [queryClient]);

  // Rule 3: After benefits enrollment, invalidate: ['benefits', 'payroll-deductions', 'employee-profile']
  const notifyBenefitsEnrollment = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["benefits"] });
    await queryClient.invalidateQueries({ queryKey: ["payroll-deductions"] });
    await queryClient.invalidateQueries({ queryKey: ["employee-profile"] });
    console.log("🔄 Rule 3: Benefits Sync Complete");
  }, [queryClient]);

  // Rule 4: After time entry approval, invalidate: ['time', 'payroll-preview', 'overtime-report']
  const notifyTimeEntryApproval = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["time"] });
    await queryClient.invalidateQueries({ queryKey: ["payroll-preview"] });
    await queryClient.invalidateQueries({ queryKey: ["overtime-report"] });
    console.log("🔄 Rule 4: Time Sync Complete");
  }, [queryClient]);

  // Rule 5: After expense approval, invalidate: ['expenses', 'payroll-preview', 'budget-reports']
  const notifyExpenseApproval = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["expenses"] });
    await queryClient.invalidateQueries({ queryKey: ["payroll-preview"] });
    await queryClient.invalidateQueries({ queryKey: ["budget-reports"] });
    console.log("🔄 Rule 5: Expense Sync Complete");
  }, [queryClient]);

  return {
    notifyPayrollComplete,
    notifyEmployeeChange,
    notifyBenefitsEnrollment,
    notifyTimeEntryApproval,
    notifyExpenseApproval,
  };
}
