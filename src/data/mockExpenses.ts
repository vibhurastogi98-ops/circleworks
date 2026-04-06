// =============================================================================
// 💰 MOCK DATA — Expenses & Mileage Module
// =============================================================================

export type ExpenseStatus = "Draft" | "Submitted" | "Approved" | "Rejected" | "Paid";
export type PayrollSyncStatus = "Synced" | "Pending" | "Error" | "N/A";
export type PolicyViolationStatus = "Pass" | "Warn" | "Flag" | "Block";

export interface ExpenseItem {
  id: string;
  reportId: string;
  date: string;
  merchant: string;
  category: string;
  amount: number;
  description: string;
  receiptUrl: string | null;
  policyStatus: PolicyViolationStatus;
  policyNote: string | null;
}

export interface ExpenseReport {
  id: string;
  employeeId: string;
  employeeName: string;
  avatar?: string;
  department: string;
  title: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
   itemCount: number;
  status: ExpenseStatus;
  syncStatus: PayrollSyncStatus;
  submittedAt: string | null;
  approvedAt: string | null;
  paidAt: string | null;
  rejectionNote?: string;
  items?: ExpenseItem[];
}

export interface ExpensePolicy {
  id: string;
  category: string;
  limit: number;
  period: "Per Day" | "Per Trip" | "Per Month" | "Per Expense";
  receiptThreshold: number;
  preApprovalThreshold: number | null;
  violationAction: "Warn" | "Block" | "Flag";
}

export interface MileageEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  fromLocation: string;
  toLocation: string;
  miles: number;
  purpose: string;
  ratePerMile: number;
  calculatedReimbursement: number;
}

// ---------------------------
// Mock Policies
// ---------------------------
export const mockExpensePolicies: ExpensePolicy[] = [];

// ---------------------------
// Mock Expense Items
// ---------------------------
export const mockExpenseItems: ExpenseItem[] = [];

// ---------------------------
// Mock Expense Reports
// ---------------------------
export const mockExpenseReports: ExpenseReport[] = [];

// ---------------------------
// Mock Mileage Log
// ---------------------------
export const IRS_MILEAGE_RATE = 0.67;

export const mockMileageEntries: MileageEntry[] = [];

/**
 * Summary Stats Helper for Dashboard
 */
export function getExpenseSummaryStats() {
  const pendingReports = mockExpenseReports.filter(r => r.status === "Submitted");
  const pendingAmount = pendingReports.reduce((sum, r) => sum + r.totalAmount, 0);
  const violationCount = mockExpenseItems.filter(i => i.policyStatus === "Warn" || i.policyStatus === "Flag" || i.policyStatus === "Block").length;
  
  // Category Breakdown for Pie Chart
  const categories = ["Airfare", "Hotels", "Meals", "Supplies", "Parking/Tolls", "Other"];
  const categoryData = categories.map(cat => ({
    name: cat,
    value: mockExpenseItems.filter(i => i.category === cat).reduce((sum, i) => sum + i.amount, 0)
  })).filter(d => d.value > 0);

  return {
    pendingReports: pendingReports.length,
    pendingAmount: pendingAmount,
    violationCount: violationCount,
    categoryData: categoryData,
  };
}

/**
 * Helper to get report by ID with items
 */
export function getExpenseReportById(id: string): ExpenseReport | null {
  const report = mockExpenseReports.find(r => r.id === id);
  if (!report) return null;
  
  return {
    ...report,
    items: mockExpenseItems.filter(i => i.reportId === id)
  };
}
