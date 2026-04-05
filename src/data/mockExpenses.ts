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
export const mockExpensePolicies: ExpensePolicy[] = [
  { id: "pol-1", category: "Meals", limit: 50, period: "Per Day", receiptThreshold: 25, preApprovalThreshold: null, violationAction: "Warn" },
  { id: "pol-2", category: "Airfare", limit: 1000, period: "Per Trip", receiptThreshold: 0, preApprovalThreshold: 750, violationAction: "Flag" },
  { id: "pol-3", category: "Hotels", limit: 300, period: "Per Day", receiptThreshold: 0, preApprovalThreshold: 250, violationAction: "Warn" },
  { id: "pol-4", category: "Parking/Tolls", limit: 40, period: "Per Day", receiptThreshold: 25, preApprovalThreshold: null, violationAction: "Warn" },
];

// ---------------------------
// Mock Expense Items
// ---------------------------
export const mockExpenseItems: ExpenseItem[] = [
  { id: "item-1", reportId: "rep-1", date: "2024-09-10", merchant: "Delta Air Lines", category: "Airfare", amount: 450, description: "Flight to conference", receiptUrl: "/receipt-delta.jpg", policyStatus: "Pass", policyNote: null },
  { id: "item-2", reportId: "rep-1", date: "2024-09-12", merchant: "Marriott Hotels", category: "Hotels", amount: 840, description: "3-night stay", receiptUrl: "/receipt-marriott.jpg", policyStatus: "Pass", policyNote: null },
  { id: "item-3", reportId: "rep-1", date: "2024-09-10", merchant: "Airport Parking", category: "Parking/Tolls", amount: 65, description: "4-day parking", receiptUrl: "/receipt-parking.jpg", policyStatus: "Warn", policyNote: "Over $40 daily limit" },
  { id: "item-4", reportId: "rep-2", date: "2024-10-01", merchant: "Office Depot", category: "Supplies", amount: 125, description: "Laser toner", receiptUrl: null, policyStatus: "Warn", policyNote: "Receipt required for expenses over $25" },
];

// ---------------------------
// Mock Expense Reports
// ---------------------------
export const mockExpenseReports: ExpenseReport[] = [
  { 
    id: "rep-1", employeeId: "emp-1", employeeName: "Sarah Johnson", department: "Engineering", title: "Sr. Engineer",
    startDate: "2024-09-10", endDate: "2024-09-13", totalAmount: 1355, itemCount: 3, status: "Submitted", syncStatus: "Pending", submittedAt: "2024-09-15T10:00:00Z", approvedAt: null, paidAt: null
  },
  { 
    id: "rep-2", employeeId: "emp-2", employeeName: "Mike Chen", department: "Engineering", title: "Tech Lead",
    startDate: "2024-10-01", endDate: "2024-10-01", totalAmount: 125, itemCount: 1, status: "Approved", syncStatus: "Synced", submittedAt: "2024-10-02T14:00:00Z", approvedAt: "2024-10-02T16:00:00Z", paidAt: null
  },
  { 
    id: "rep-3", employeeId: "emp-4", employeeName: "Carlos Diaz", department: "Sales", title: "Sales Rep",
    startDate: "2024-09-01", endDate: "2024-09-30", totalAmount: 2450, itemCount: 8, status: "Paid", syncStatus: "Synced", submittedAt: "2024-10-01T09:00:00Z", approvedAt: "2024-10-01T15:00:00Z", paidAt: "2024-10-05T00:00:00Z"
  },
  { 
    id: "rep-4", employeeId: "emp-5", employeeName: "Jessica Williams", department: "Support", title: "Support Lead",
    startDate: "2024-10-10", endDate: "2024-10-10", totalAmount: 75, itemCount: 1, status: "Draft", syncStatus: "N/A", submittedAt: null, approvedAt: null, paidAt: null
  },
];

// ---------------------------
// Mock Mileage Log
// ---------------------------
export const IRS_MILEAGE_RATE = 0.67;

export const mockMileageEntries: MileageEntry[] = [
  { id: "mil-1", employeeId: "emp-4", employeeName: "Carlos Diaz", date: "2024-10-01", fromLocation: "San Francisco Office", toLocation: "Client Site - Mountain View", miles: 38, purpose: "Sales presentation", ratePerMile: IRS_MILEAGE_RATE, calculatedReimbursement: 25.46 },
  { id: "mil-2", employeeId: "emp-4", employeeName: "Carlos Diaz", date: "2024-10-03", fromLocation: "Client Site - Mountain View", toLocation: "San Francisco Office", miles: 38, purpose: "Sales presentation return", ratePerMile: IRS_MILEAGE_RATE, calculatedReimbursement: 25.46 },
  { id: "mil-3", employeeId: "emp-8", employeeName: "Brandon Lee", date: "2024-10-05", fromLocation: "Warehouse A", toLocation: "Warehouse B", miles: 12, purpose: "Parts transfer", ratePerMile: IRS_MILEAGE_RATE, calculatedReimbursement: 8.04 },
];

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
