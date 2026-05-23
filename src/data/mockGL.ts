export interface GLAccount {
  id: string;
  code: string;
  name: string;
  type: "Asset" | "Liability" | "Equity" | "Revenue" | "Expense";
  status: "active" | "inactive";
}

export const mockGLAccounts: GLAccount[] = [
  { id: "gl-1", code: "1000", name: "Operating Payroll Bank", type: "Asset", status: "active" },
  { id: "gl-2", code: "2100", name: "Payroll Liabilities: Net Pay", type: "Liability", status: "active" },
  { id: "gl-3", code: "2110", name: "Payroll Liabilities: Federal Taxes", type: "Liability", status: "active" },
  { id: "gl-4", code: "2120", name: "Payroll Liabilities: State Taxes", type: "Liability", status: "active" },
  { id: "gl-5", code: "2130", name: "Payroll Liabilities: Benefits", type: "Liability", status: "active" },
  { id: "gl-6", code: "6000", name: "Salaries and Wages Expense", type: "Expense", status: "active" },
  { id: "gl-7", code: "6010", name: "Payroll Tax Expense (Employer)", type: "Expense", status: "active" },
  { id: "gl-8", code: "6020", name: "Benefits Expense (Employer)", type: "Expense", status: "active" }
];

export interface PayrollComponent {
  id: string;
  category: "Earnings" | "Deductions" | "Taxes" | "Employer Contributions";
  previewGroup: "Gross Pay" | "Tax Liabilities" | "Net Pay" | "Employer Costs";
  name: string;
  defaultEntryType: "Debit" | "Credit";
  assignedGlId: string | null;
  deptSplit: "None" | "Employee Department" | "Project Code" | "Location";
}

export const mockPayrollComponents: PayrollComponent[] = [
  { id: "comp-1", category: "Earnings", previewGroup: "Gross Pay", name: "Regular Earnings", defaultEntryType: "Debit", assignedGlId: "gl-6", deptSplit: "Employee Department" },
  { id: "comp-2", category: "Earnings", previewGroup: "Gross Pay", name: "Overtime Earnings", defaultEntryType: "Debit", assignedGlId: "gl-6", deptSplit: "Employee Department" },
  { id: "comp-3", category: "Earnings", previewGroup: "Gross Pay", name: "Bonus/Commission", defaultEntryType: "Debit", assignedGlId: "gl-6", deptSplit: "Project Code" },
  
  { id: "comp-4", category: "Employer Contributions", previewGroup: "Employer Costs", name: "FICA Match (SS & Med)", defaultEntryType: "Debit", assignedGlId: "gl-7", deptSplit: "Employee Department" },
  { id: "comp-5", category: "Employer Contributions", previewGroup: "Employer Costs", name: "FUTA / SUTA", defaultEntryType: "Debit", assignedGlId: "gl-7", deptSplit: "Employee Department" },
  { id: "comp-12", category: "Employer Contributions", previewGroup: "Employer Costs", name: "Employer Benefits Contribution", defaultEntryType: "Debit", assignedGlId: "gl-8", deptSplit: "Employee Department" },
  
  { id: "comp-6", category: "Taxes", previewGroup: "Tax Liabilities", name: "Federal Income Tax", defaultEntryType: "Credit", assignedGlId: "gl-3", deptSplit: "None" },
  { id: "comp-7", category: "Taxes", previewGroup: "Tax Liabilities", name: "State Income Tax", defaultEntryType: "Credit", assignedGlId: "gl-4", deptSplit: "None" },
  { id: "comp-8", category: "Taxes", previewGroup: "Tax Liabilities", name: "FICA (Employee portion)", defaultEntryType: "Credit", assignedGlId: "gl-3", deptSplit: "None" },
  
  { id: "comp-9", category: "Deductions", previewGroup: "Net Pay", name: "Health Insurance (Pre-tax)", defaultEntryType: "Credit", assignedGlId: "gl-5", deptSplit: "None" },
  { id: "comp-10", category: "Deductions", previewGroup: "Net Pay", name: "401(k) Contributions", defaultEntryType: "Credit", assignedGlId: "gl-5", deptSplit: "None" },
  
  { id: "comp-11", category: "Deductions", previewGroup: "Net Pay", name: "Net Direct Deposits", defaultEntryType: "Credit", assignedGlId: "gl-2", deptSplit: "None" }
];
