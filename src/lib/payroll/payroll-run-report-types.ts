export interface PayrollRunReportEmployeeRow {
  name: string;
  gross: number;
  taxes: number;
  deductions: number;
  net: number;
}

export interface PayrollRunReportGlLine {
  account: string;
  description: string;
  debit: number;
  credit: number;
}

export interface PayrollRunReportData {
  companyName: string;
  runIdLabel: string;
  payPeriodLabel: string;
  runDateLabel: string;
  totalPayroll: number;
  totalGross: number;
  totalTaxes: number;
  totalDeductions: number;
  totalNet: number;
  employerFica: number;
  employerFuta: number;
  employerSuta: number;
  employerBenefits: number;
  employees: PayrollRunReportEmployeeRow[];
  glMappingConfigured: boolean;
  journalLines: PayrollRunReportGlLine[];
}
