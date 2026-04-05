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
  category: "Gross Pay" | "Taxes (Employee)" | "Taxes (Employer)" | "Deductions" | "Net Pay";
  name: string;
  defaultEntryType: "Debit" | "Credit";
  assignedGlId: string | null;
}

export const mockPayrollComponents: PayrollComponent[] = [
  { id: "comp-1", category: "Gross Pay", name: "Regular Earnings", defaultEntryType: "Debit", assignedGlId: "gl-6" },
  { id: "comp-2", category: "Gross Pay", name: "Overtime Earnings", defaultEntryType: "Debit", assignedGlId: "gl-6" },
  { id: "comp-3", category: "Gross Pay", name: "Bonus/Commission", defaultEntryType: "Debit", assignedGlId: "gl-6" },
  
  { id: "comp-4", category: "Taxes (Employer)", name: "FICA Match (SS & Med)", defaultEntryType: "Debit", assignedGlId: "gl-7" },
  { id: "comp-5", category: "Taxes (Employer)", name: "FUTA / SUTA", defaultEntryType: "Debit", assignedGlId: "gl-7" },
  
  { id: "comp-6", category: "Taxes (Employee)", name: "Federal Income Tax", defaultEntryType: "Credit", assignedGlId: "gl-3" },
  { id: "comp-7", category: "Taxes (Employee)", name: "State Income Tax", defaultEntryType: "Credit", assignedGlId: "gl-4" },
  { id: "comp-8", category: "Taxes (Employee)", name: "FICA (Employee portion)", defaultEntryType: "Credit", assignedGlId: "gl-3" },
  
  { id: "comp-9", category: "Deductions", name: "Health Insurance (Pre-tax)", defaultEntryType: "Credit", assignedGlId: "gl-5" },
  { id: "comp-10", category: "Deductions", name: "401(k) Contributions", defaultEntryType: "Credit", assignedGlId: "gl-5" },
  
  { id: "comp-11", category: "Net Pay", name: "Net Direct Deposits", defaultEntryType: "Credit", assignedGlId: "gl-2" }
];
