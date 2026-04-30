import { create } from "zustand";

/* ─── Types ─── */
export type VerifyStatus = "verified" | "flagged" | "error" | "pending";
export type PayType = "salary" | "hourly" | "contractor";

export interface TaxBreakdown {
  federalIT: number;
  ficaSS: number;
  ficaMed: number;
  stateIT: number;
  localIT: number;
}

export interface BenefitDeductionLine {
  employeeId: string | number;
  benefitPlanId: string | number;
  planName: string;
  monthlyPremium: number;
  employeeShare: number;
  perPaycheckAmount: number;
  pretaxOrPosttax: "pre_tax" | "post_tax";
  deductionCode: string;
}

export interface TimesheetHoursDay {
  date: string;
  regularHours: number;
  overtimeHours: number;
  doubleTimeHours: number;
}

export interface TimesheetHoursImport {
  source: "timesheet" | "scheduled" | "manual";
  regularHours: number;
  overtimeHours: number;
  doubleTimeHours: number;
  totalHours: number;
  importedAt: string;
  lateWithinCutoff: boolean;
  partialPeriodReason?: "new_hire" | "termination";
  days: TimesheetHoursDay[];
}

export interface PayrollReimbursementLine {
  expenseReportId: string | number;
  employeeId: string | number;
  employeeName: string;
  description: string;
  amount: number;
  approvedBy: string;
  approvedDate: string | null;
  includeInThisRun: boolean;
  deferToNextRun: boolean;
  nonTaxable: true;
  flags: Array<"terminated_manual_check" | "contractor_1099_consideration">;
}

export type MidPeriodHandlingOption = "full_period" | "prorate" | "next_period_only";

export interface PayrollCompensationChange {
  employeeId: string;
  employeeName: string;
  oldRate: number;
  newRate: number;
  effectiveDate: string;
  handling: MidPeriodHandlingOption;
  savedAt: string;
  daysBefore: number;
  daysAfter: number;
  periodDays: number;
  grossPay: number;
  oldEarnings: number;
  newEarnings: number;
  tooltip: string;
}

export interface PayrollEmployee {
  id: string;
  name: string;
  title: string;
  department: string;
  avatar: string;
  payType: PayType;
  compensationRate: number;
  compensationRateUnit: "year" | "hour";
  hours: number | null; // null for salary
  grossPay: number;
  deductions: number;
  netPay: number;
  taxes: TaxBreakdown;
  benefitDeductions?: BenefitDeductionLine[];
  timesheetImport?: TimesheetHoursImport;
  reimbursements?: PayrollReimbursementLine[];
  hoursManuallyOverridden?: boolean;
  hoursOverrideAudit?: {
    overriddenAt: string;
    originalHours: number | null;
    overrideHours: number;
    reason: string;
  };
  verifyStatus: VerifyStatus;
  flagReason?: string;
  errorMessage?: string;
  compensationChange?: PayrollCompensationChange;
}

export type ApproverStatus = "pending" | "approved" | "rejected";

export interface Approver {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: ApproverStatus;
}

export type ProcessingStep =
  | "calculating"
  | "submitting_ach"
  | "generating_stubs"
  | "notifying"
  | "complete";

export type RunState =
  | "draft"
  | "review"
  | "approval"
  | "processing"
  | "complete";

/* ─── Store ─── */
interface PayrollRunState {
  runState: RunState;
  setRunState: (s: RunState) => void;

  employees: PayrollEmployee[];
  setEmployees: (e: PayrollEmployee[]) => void;
  updateEmployee: (id: string, patch: Partial<PayrollEmployee>) => void;

  selectedIds: Set<string>;
  toggleSelect: (id: string) => void;
  selectAll: () => void;
  deselectAll: () => void;

  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filterDepartment: string;
  setFilterDepartment: (d: string) => void;
  filterPayType: string;
  setFilterPayType: (p: string) => void;
  filterStatus: string;
  setFilterStatus: (s: string) => void;
  showFlaggedOnly: boolean;
  setShowFlaggedOnly: (v: boolean) => void;

  approvers: Approver[];
  setApprovers: (a: Approver[]) => void;
  approveApprover: (id: string) => void;

  processingStep: ProcessingStep;
  setProcessingStep: (s: ProcessingStep) => void;

  showApprovalModal: boolean;
  setShowApprovalModal: (v: boolean) => void;
  showProcessing: boolean;
  setShowProcessing: (v: boolean) => void;
  showBreakdownModal: string | null; // card key or null
  setShowBreakdownModal: (k: string | null) => void;
  showFlagModal: string | null; // employee id or null
  setShowFlagModal: (id: string | null) => void;

  expandedRows: Set<string>;
  toggleExpandRow: (id: string) => void;
}

export const usePayrollRunStore = create<PayrollRunState>()((set, get) => ({
  runState: "draft",
  setRunState: (s) => set({ runState: s }),

  employees: [],
  setEmployees: (e) => set({ employees: e }),
  updateEmployee: (id, patch) =>
    set((s) => ({
      employees: s.employees.map((emp) =>
        emp.id === id ? { ...emp, ...patch } : emp
      ),
    })),

  selectedIds: new Set(),
  toggleSelect: (id) =>
    set((s) => {
      const next = new Set(s.selectedIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { selectedIds: next };
    }),
  selectAll: () =>
    set((s) => ({
      selectedIds: new Set(s.employees.map((e) => e.id)),
    })),
  deselectAll: () => set({ selectedIds: new Set() }),

  searchQuery: "",
  setSearchQuery: (q) => set({ searchQuery: q }),
  filterDepartment: "all",
  setFilterDepartment: (d) => set({ filterDepartment: d }),
  filterPayType: "all",
  setFilterPayType: (p) => set({ filterPayType: p }),
  filterStatus: "all",
  setFilterStatus: (s) => set({ filterStatus: s }),
  showFlaggedOnly: false,
  setShowFlaggedOnly: (v) => set({ showFlaggedOnly: v }),

  approvers: [],
  setApprovers: (a) => set({ approvers: a }),
  approveApprover: (id) =>
    set((s) => ({
      approvers: s.approvers.map((a) =>
        a.id === id ? { ...a, status: "approved" } : a
      ),
    })),

  processingStep: "calculating",
  setProcessingStep: (s) => set({ processingStep: s }),

  showApprovalModal: false,
  setShowApprovalModal: (v) => set({ showApprovalModal: v }),
  showProcessing: false,
  setShowProcessing: (v) => set({ showProcessing: v }),
  showBreakdownModal: null,
  setShowBreakdownModal: (k) => set({ showBreakdownModal: k }),
  showFlagModal: null,
  setShowFlagModal: (id) => set({ showFlagModal: id }),

  expandedRows: new Set(),
  toggleExpandRow: (id) =>
    set((s) => {
      const next = new Set(s.expandedRows);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { expandedRows: next };
    }),
}));
