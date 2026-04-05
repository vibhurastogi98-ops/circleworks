// ─── COMPLIANCE DASHBOARD ────────────────────────────────────────────

export type AlertSeverity = "critical" | "warning" | "info";

export interface ComplianceAlert {
  id: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  deadline?: string;
  actionLabel: string;
  actionHref?: string;
}

export const complianceAlerts: ComplianceAlert[] = [
  {
    id: "ca-1",
    severity: "critical",
    title: "I-9 Expired for 2 Employees",
    description: "Maria Santos and James Liu have expired I-9 documents. Re-verification required immediately.",
    deadline: "2026-04-15",
    actionLabel: "Fix Now",
    actionHref: "/compliance/i9",
  },
  {
    id: "ca-2",
    severity: "critical",
    title: "EEO-1 Component 1 Filing Overdue",
    description: "The EEO-1 Component 1 report was due on March 31. Submit immediately to avoid penalties.",
    deadline: "2026-03-31",
    actionLabel: "File Now",
    actionHref: "/compliance/eeo",
  },
  {
    id: "ca-3",
    severity: "warning",
    title: "Form 941 Q2 Filing Due in 12 Days",
    description: "Quarterly federal tax return (Form 941) for Q2 2026 is due. Ensure all payroll data is finalized.",
    deadline: "2026-04-17",
    actionLabel: "Review",
    actionHref: "/compliance/tax-filings",
  },
  {
    id: "ca-4",
    severity: "warning",
    title: "3 Labor Posters Need Updates",
    description: "Federal OSHA poster and CA/NY state posters have new revisions effective April 1, 2026.",
    deadline: "2026-04-30",
    actionLabel: "Update",
    actionHref: "/compliance/posters",
  },
  {
    id: "ca-5",
    severity: "warning",
    title: "Employee Handbook Acknowledgment Pending",
    description: "12 employees have not signed the updated handbook (v4.2). Send reminders.",
    actionLabel: "Send Reminder",
    actionHref: "/compliance/handbook",
  },
  {
    id: "ca-6",
    severity: "info",
    title: "New CA Minimum Wage Effective Jan 1",
    description: "California minimum wage increases to $17.00/hr effective January 1, 2027. Review affected employees.",
    actionLabel: "Review",
  },
  {
    id: "ca-7",
    severity: "info",
    title: "WOTC Screening Completed for 5 New Hires",
    description: "3 of 5 recent hires are potentially eligible for Work Opportunity Tax Credits.",
    actionLabel: "View Results",
    actionHref: "/compliance/wotc",
  },
  {
    id: "ca-8",
    severity: "info",
    title: "ACA Annual Reporting Guidance Updated",
    description: "IRS released updated guidance for 2026 ACA reporting. Review changes for 1095-C preparation.",
    actionLabel: "Learn More",
    actionHref: "/compliance/aca",
  },
];

export interface CalendarEvent {
  id: string;
  name: string;
  formNumber: string;
  date: string; // ISO date
  type: "federal" | "state";
  state?: string;
  consequence: string;
  description: string;
}

export const complianceCalendar: CalendarEvent[] = [
  { id: "ev-1", name: "Form 941 — Q1", formNumber: "941", date: "2026-01-31", type: "federal", consequence: "5% penalty per month, up to 25% of unpaid tax", description: "Employer's Quarterly Federal Tax Return" },
  { id: "ev-2", name: "W-2 Filing Deadline", formNumber: "W-2", date: "2026-01-31", type: "federal", consequence: "$60 per form if filed within 30 days late; up to $310/form", description: "Annual Wage and Tax Statements to employees and SSA" },
  { id: "ev-3", name: "1099-NEC Filing", formNumber: "1099-NEC", date: "2026-01-31", type: "federal", consequence: "$60-$310 penalty per form depending on delay", description: "Nonemployee Compensation reporting" },
  { id: "ev-4", name: "CA DE-9 — Q1", formNumber: "DE-9", date: "2026-01-31", type: "state", state: "CA", consequence: "10% penalty on unpaid amount, minimum $50", description: "California Quarterly Contribution Return" },
  { id: "ev-5", name: "NY-45 — Q1", formNumber: "NY-45", date: "2026-01-31", type: "state", state: "NY", consequence: "5% penalty per month on unpaid tax", description: "New York Quarterly Combined Withholding Return" },
  { id: "ev-6", name: "1095-C Distribution", formNumber: "1095-C", date: "2026-03-02", type: "federal", consequence: "$310 per form penalty for failure to furnish", description: "ACA Employer-Provided Health Insurance Offer and Coverage" },
  { id: "ev-7", name: "EEO-1 Component 1", formNumber: "EEO-1", date: "2026-03-31", type: "federal", consequence: "Court enforcement, potential consent decree", description: "Employer Information Report" },
  { id: "ev-8", name: "Form 941 — Q2", formNumber: "941", date: "2026-04-30", type: "federal", consequence: "5% penalty per month, up to 25% of unpaid tax", description: "Employer's Quarterly Federal Tax Return" },
  { id: "ev-9", name: "CA DE-9 — Q2", formNumber: "DE-9", date: "2026-04-30", type: "state", state: "CA", consequence: "10% penalty on unpaid amount, minimum $50", description: "California Quarterly Contribution Return" },
  { id: "ev-10", name: "NY-45 — Q2", formNumber: "NY-45", date: "2026-04-30", type: "state", state: "NY", consequence: "5% penalty per month on unpaid tax", description: "New York Quarterly Combined Withholding Return" },
  { id: "ev-11", name: "TX TWC — Q2", formNumber: "C-3/C-4", date: "2026-04-30", type: "state", state: "TX", consequence: "Interest + penalty of 1.5% per month", description: "Texas Quarterly Tax and Wage Report" },
  { id: "ev-12", name: "Form 5500 (Large Plan)", formNumber: "5500", date: "2026-07-31", type: "federal", consequence: "$250/day penalty up to $150,000", description: "Annual Return/Report of Employee Benefit Plan" },
  { id: "ev-13", name: "Form 941 — Q3", formNumber: "941", date: "2026-07-31", type: "federal", consequence: "5% penalty per month, up to 25% of unpaid tax", description: "Employer's Quarterly Federal Tax Return" },
  { id: "ev-14", name: "CA DE-9 — Q3", formNumber: "DE-9", date: "2026-07-31", type: "state", state: "CA", consequence: "10% penalty on unpaid amount, minimum $50", description: "California Quarterly Contribution Return" },
  { id: "ev-15", name: "1094-C Electronic Filing", formNumber: "1094-C", date: "2026-03-31", type: "federal", consequence: "$310 per form penalty for failure to file", description: "Transmittal of ACA Information Returns" },
  { id: "ev-16", name: "Form 940", formNumber: "940", date: "2026-01-31", type: "federal", consequence: "5% penalty per month on unpaid tax", description: "Annual Federal Unemployment (FUTA) Tax Return" },
  { id: "ev-17", name: "Form 941 — Q4", formNumber: "941", date: "2026-10-31", type: "federal", consequence: "5% penalty per month, up to 25% of unpaid tax", description: "Employer's Quarterly Federal Tax Return" },
  { id: "ev-18", name: "NY-45 — Q3", formNumber: "NY-45", date: "2026-07-31", type: "state", state: "NY", consequence: "5% penalty per month on unpaid tax", description: "New York Quarterly Combined Withholding Return" },
];

export interface QuickStatusCard {
  id: string;
  label: string;
  icon: string;
  status: "compliant" | "attention" | "overdue" | "pending";
  statusLabel: string;
  lastUpdated: string;
  href: string;
}

export const quickStatusCards: QuickStatusCard[] = [
  { id: "qs-1", label: "I-9 Status", icon: "FileCheck", status: "attention", statusLabel: "2 Expired", lastUpdated: "2026-04-01", href: "/compliance/i9" },
  { id: "qs-2", label: "ACA Status", icon: "HeartPulse", status: "compliant", statusLabel: "Compliant", lastUpdated: "2026-03-15", href: "/compliance/aca" },
  { id: "qs-3", label: "EEO-1", icon: "Users", status: "overdue", statusLabel: "Filing Overdue", lastUpdated: "2026-03-31", href: "/compliance/eeo" },
  { id: "qs-4", label: "Labor Posters", icon: "FileText", status: "attention", statusLabel: "3 Need Update", lastUpdated: "2026-03-20", href: "/compliance/posters" },
  { id: "qs-5", label: "Handbook Version", icon: "BookOpen", status: "pending", statusLabel: "v4.2 Pending", lastUpdated: "2026-03-28", href: "/compliance/handbook" },
  { id: "qs-6", label: "New Hire Reports", icon: "UserPlus", status: "compliant", statusLabel: "All Filed", lastUpdated: "2026-04-03", href: "/compliance/wotc" },
];


// ─── TAX FILINGS ─────────────────────────────────────────────────────

export type TaxFilingStatus = "filed" | "upcoming" | "overdue";

export interface TaxFiling {
  id: string;
  formName: string;
  formNumber: string;
  jurisdiction: "federal" | string; // state abbreviation
  dueDate: string;
  status: TaxFilingStatus;
  filedDate?: string;
  confirmationNumber?: string;
  supportsFiling: boolean;
  amount?: number;
}

export const taxFilings: TaxFiling[] = [
  { id: "tf-1", formName: "Employer's Quarterly Federal Tax Return", formNumber: "941", jurisdiction: "federal", dueDate: "2026-01-31", status: "filed", filedDate: "2026-01-28", confirmationNumber: "FED-941-2026Q1-8847", supportsFiling: true, amount: 47250 },
  { id: "tf-2", formName: "Annual Wage and Tax Statements", formNumber: "W-2", jurisdiction: "federal", dueDate: "2026-01-31", status: "filed", filedDate: "2026-01-30", confirmationNumber: "SSA-W2-2025-44291", supportsFiling: false, amount: 0 },
  { id: "tf-3", formName: "Nonemployee Compensation", formNumber: "1099-NEC", jurisdiction: "federal", dueDate: "2026-01-31", status: "filed", filedDate: "2026-01-29", confirmationNumber: "IRS-1099-2025-33102", supportsFiling: false, amount: 0 },
  { id: "tf-4", formName: "Annual Federal Unemployment Tax", formNumber: "940", jurisdiction: "federal", dueDate: "2026-01-31", status: "filed", filedDate: "2026-01-31", confirmationNumber: "FED-940-2025-99431", supportsFiling: true, amount: 3480 },
  { id: "tf-5", formName: "Quarterly Contribution Return", formNumber: "DE-9", jurisdiction: "CA", dueDate: "2026-01-31", status: "filed", filedDate: "2026-01-28", confirmationNumber: "CA-DE9-2026Q1-1245", supportsFiling: true, amount: 12300 },
  { id: "tf-6", formName: "Quarterly Combined Withholding", formNumber: "NY-45", jurisdiction: "NY", dueDate: "2026-01-31", status: "filed", filedDate: "2026-01-29", confirmationNumber: "NY-45-2026Q1-5519", supportsFiling: true, amount: 8930 },
  { id: "tf-7", formName: "ACA Transmittal", formNumber: "1094-C", jurisdiction: "federal", dueDate: "2026-03-31", status: "filed", filedDate: "2026-03-28", confirmationNumber: "IRS-1094C-2025-77412", supportsFiling: false, amount: 0 },
  { id: "tf-8", formName: "ACA Employer Coverage", formNumber: "1095-C", jurisdiction: "federal", dueDate: "2026-03-02", status: "filed", filedDate: "2026-02-28", confirmationNumber: "IRS-1095C-2025-45120", supportsFiling: false, amount: 0 },
  { id: "tf-9", formName: "Employer's Quarterly Federal Tax Return — Q2", formNumber: "941", jurisdiction: "federal", dueDate: "2026-04-30", status: "upcoming", supportsFiling: true, amount: 49800 },
  { id: "tf-10", formName: "Quarterly Contribution Return — Q2", formNumber: "DE-9", jurisdiction: "CA", dueDate: "2026-04-30", status: "upcoming", supportsFiling: true, amount: 13100 },
  { id: "tf-11", formName: "Quarterly Combined Withholding — Q2", formNumber: "NY-45", jurisdiction: "NY", dueDate: "2026-04-30", status: "upcoming", supportsFiling: true, amount: 9200 },
  { id: "tf-12", formName: "Quarterly Tax and Wage Report — Q2", formNumber: "C-3/C-4", jurisdiction: "TX", dueDate: "2026-04-30", status: "upcoming", supportsFiling: true, amount: 5600 },
  { id: "tf-13", formName: "EEO-1 Component 1 Report", formNumber: "EEO-1", jurisdiction: "federal", dueDate: "2026-03-31", status: "overdue", supportsFiling: false, amount: 0 },
  { id: "tf-14", formName: "Annual Return of Employee Benefit Plan", formNumber: "5500", jurisdiction: "federal", dueDate: "2026-07-31", status: "upcoming", supportsFiling: false, amount: 0 },
];


// ─── I-9 RECORDS ─────────────────────────────────────────────────────

export type I9Status = "complete" | "pending" | "expiring" | "expired";

export interface I9Record {
  id: string;
  employeeName: string;
  employeeId: string;
  department: string;
  hireDate: string;
  i9Status: I9Status;
  expirationDate?: string;
  section3Complete: boolean;
  eVerifyStatus: "verified" | "pending" | "case_closed" | "referred" | "not_submitted";
  eVerifyCaseNumber?: string;
  documentType: string;
  lastAuditDate?: string;
}

export const i9Records: I9Record[] = [
  { id: "i9-1", employeeName: "Maria Santos", employeeId: "EMP-1042", department: "Engineering", hireDate: "2021-03-15", i9Status: "expired", expirationDate: "2026-03-01", section3Complete: false, eVerifyStatus: "verified", eVerifyCaseNumber: "EV-2021-38745", documentType: "Employment Authorization Document", lastAuditDate: "2025-12-01" },
  { id: "i9-2", employeeName: "James Liu", employeeId: "EMP-1063", department: "Finance", hireDate: "2022-06-20", i9Status: "expired", expirationDate: "2026-02-15", section3Complete: false, eVerifyStatus: "verified", eVerifyCaseNumber: "EV-2022-50128", documentType: "Employment Authorization Document", lastAuditDate: "2025-12-01" },
  { id: "i9-3", employeeName: "Aisha Johnson", employeeId: "EMP-1089", department: "Marketing", hireDate: "2023-01-10", i9Status: "expiring", expirationDate: "2026-05-10", section3Complete: false, eVerifyStatus: "verified", eVerifyCaseNumber: "EV-2023-12890", documentType: "Employment Authorization Document", lastAuditDate: "2025-12-01" },
  { id: "i9-4", employeeName: "Robert Chen", employeeId: "EMP-1012", department: "Engineering", hireDate: "2020-08-03", i9Status: "complete", eVerifyStatus: "verified", eVerifyCaseNumber: "EV-2020-44231", documentType: "US Passport", section3Complete: true, lastAuditDate: "2025-12-01" },
  { id: "i9-5", employeeName: "Sarah Williams", employeeId: "EMP-1098", department: "HR", hireDate: "2023-07-15", i9Status: "complete", eVerifyStatus: "verified", eVerifyCaseNumber: "EV-2023-67120", documentType: "US Passport Card", section3Complete: true, lastAuditDate: "2025-12-01" },
  { id: "i9-6", employeeName: "David Martinez", employeeId: "EMP-1105", department: "Sales", hireDate: "2024-01-08", i9Status: "complete", eVerifyStatus: "case_closed", eVerifyCaseNumber: "EV-2024-10032", documentType: "Driver's License + Social Security Card", section3Complete: true, lastAuditDate: "2025-12-01" },
  { id: "i9-7", employeeName: "Emily Park", employeeId: "EMP-1120", department: "Product", hireDate: "2024-09-20", i9Status: "complete", eVerifyStatus: "verified", eVerifyCaseNumber: "EV-2024-55210", documentType: "US Passport", section3Complete: true, lastAuditDate: "2025-12-01" },
  { id: "i9-8", employeeName: "Raj Patel", employeeId: "EMP-1135", department: "Engineering", hireDate: "2025-11-01", i9Status: "pending", eVerifyStatus: "pending", documentType: "Pending — Day 1 incomplete", section3Complete: false },
  { id: "i9-9", employeeName: "Lisa Thompson", employeeId: "EMP-1140", department: "Finance", hireDate: "2026-03-25", i9Status: "pending", eVerifyStatus: "not_submitted", documentType: "Pending — Awaiting documents", section3Complete: false },
  { id: "i9-10", employeeName: "Kevin O'Brien", employeeId: "EMP-1028", department: "Operations", hireDate: "2020-11-15", i9Status: "complete", eVerifyStatus: "verified", eVerifyCaseNumber: "EV-2020-78421", documentType: "Permanent Resident Card", section3Complete: true, lastAuditDate: "2025-12-01" },
  { id: "i9-11", employeeName: "Anna Kowalski", employeeId: "EMP-1075", department: "Legal", hireDate: "2022-09-12", i9Status: "expiring", expirationDate: "2026-06-30", section3Complete: false, eVerifyStatus: "verified", eVerifyCaseNumber: "EV-2022-89013", documentType: "Employment Authorization Document", lastAuditDate: "2025-12-01" },
  { id: "i9-12", employeeName: "Michael Brown", employeeId: "EMP-1001", department: "Executive", hireDate: "2019-01-15", i9Status: "complete", eVerifyStatus: "case_closed", eVerifyCaseNumber: "EV-2019-11023", documentType: "US Passport", section3Complete: true, lastAuditDate: "2025-12-01" },
];


// ─── ACA ──────────────────────────────────────────────────────────────

export interface ACAEmployee {
  id: string;
  employeeName: string;
  employeeId: string;
  status: "full-time" | "part-time" | "variable";
  hoursPerWeek: number;
  coverageOffered: boolean;
  affordable: boolean;
  minimumValue: boolean;
  form1095CCode: string;
  form1095CStatus: "generated" | "pending" | "distributed";
}

export const acaEmployees: ACAEmployee[] = [
  { id: "aca-1", employeeName: "Robert Chen", employeeId: "EMP-1012", status: "full-time", hoursPerWeek: 40, coverageOffered: true, affordable: true, minimumValue: true, form1095CCode: "1A", form1095CStatus: "distributed" },
  { id: "aca-2", employeeName: "Sarah Williams", employeeId: "EMP-1098", status: "full-time", hoursPerWeek: 40, coverageOffered: true, affordable: true, minimumValue: true, form1095CCode: "1A", form1095CStatus: "distributed" },
  { id: "aca-3", employeeName: "David Martinez", employeeId: "EMP-1105", status: "full-time", hoursPerWeek: 40, coverageOffered: true, affordable: true, minimumValue: true, form1095CCode: "1A", form1095CStatus: "distributed" },
  { id: "aca-4", employeeName: "Maria Santos", employeeId: "EMP-1042", status: "full-time", hoursPerWeek: 38, coverageOffered: true, affordable: true, minimumValue: true, form1095CCode: "1A", form1095CStatus: "distributed" },
  { id: "aca-5", employeeName: "Emily Park", employeeId: "EMP-1120", status: "full-time", hoursPerWeek: 40, coverageOffered: true, affordable: true, minimumValue: true, form1095CCode: "1A", form1095CStatus: "generated" },
  { id: "aca-6", employeeName: "James Liu", employeeId: "EMP-1063", status: "full-time", hoursPerWeek: 40, coverageOffered: true, affordable: true, minimumValue: true, form1095CCode: "1A", form1095CStatus: "generated" },
  { id: "aca-7", employeeName: "Kevin O'Brien", employeeId: "EMP-1028", status: "full-time", hoursPerWeek: 40, coverageOffered: true, affordable: true, minimumValue: true, form1095CCode: "1A", form1095CStatus: "distributed" },
  { id: "aca-8", employeeName: "Lisa Thompson", employeeId: "EMP-1140", status: "part-time", hoursPerWeek: 24, coverageOffered: false, affordable: false, minimumValue: false, form1095CCode: "1H", form1095CStatus: "pending" },
  { id: "aca-9", employeeName: "Raj Patel", employeeId: "EMP-1135", status: "variable", hoursPerWeek: 32, coverageOffered: true, affordable: true, minimumValue: true, form1095CCode: "1A", form1095CStatus: "pending" },
  { id: "aca-10", employeeName: "Anna Kowalski", employeeId: "EMP-1075", status: "full-time", hoursPerWeek: 40, coverageOffered: true, affordable: true, minimumValue: true, form1095CCode: "1A", form1095CStatus: "distributed" },
];

export interface FTEMonthlyData {
  month: string;
  ftCount: number;
  ptCount: number;
  totalFTE: number;
}

export const fteMonthlyData: FTEMonthlyData[] = [
  { month: "Jan", ftCount: 42, ptCount: 6, totalFTE: 45 },
  { month: "Feb", ftCount: 43, ptCount: 6, totalFTE: 46 },
  { month: "Mar", ftCount: 44, ptCount: 5, totalFTE: 46.5 },
  { month: "Apr", ftCount: 45, ptCount: 5, totalFTE: 47.5 },
  { month: "May", ftCount: 46, ptCount: 6, totalFTE: 49 },
  { month: "Jun", ftCount: 47, ptCount: 6, totalFTE: 50 },
  { month: "Jul", ftCount: 48, ptCount: 7, totalFTE: 51.5 },
  { month: "Aug", ftCount: 48, ptCount: 7, totalFTE: 51.5 },
  { month: "Sep", ftCount: 49, ptCount: 6, totalFTE: 52 },
  { month: "Oct", ftCount: 50, ptCount: 6, totalFTE: 53 },
  { month: "Nov", ftCount: 50, ptCount: 5, totalFTE: 52.5 },
  { month: "Dec", ftCount: 51, ptCount: 5, totalFTE: 53.5 },
];


// ─── EEO-1 ───────────────────────────────────────────────────────────

export type EEOJobCategory = 
  | "Executive/Senior Officials"
  | "First/Mid Officials & Managers"
  | "Professionals"
  | "Technicians"
  | "Sales Workers"
  | "Administrative Support"
  | "Craft Workers"
  | "Operatives"
  | "Laborers & Helpers"
  | "Service Workers";

export type EEORace =
  | "Hispanic/Latino"
  | "White"
  | "Black/African American"
  | "Native Hawaiian/Pacific Islander"
  | "Asian"
  | "American Indian/Alaska Native"
  | "Two or More Races";

export interface EEODataCell {
  jobCategory: EEOJobCategory;
  race: EEORace;
  gender: "male" | "female";
  count: number;
}

const eeoJobCategories: EEOJobCategory[] = [
  "Executive/Senior Officials",
  "First/Mid Officials & Managers",
  "Professionals",
  "Technicians",
  "Sales Workers",
  "Administrative Support",
  "Craft Workers",
  "Operatives",
  "Laborers & Helpers",
  "Service Workers",
];

const eeoRaces: EEORace[] = [
  "Hispanic/Latino",
  "White",
  "Black/African American",
  "Native Hawaiian/Pacific Islander",
  "Asian",
  "American Indian/Alaska Native",
  "Two or More Races",
];

// Generate EEO data grid
function generateEEOData(): EEODataCell[] {
  const data: EEODataCell[] = [];
  const counts: Record<string, number[]> = {
    "Executive/Senior Officials": [0,1,0,0,1,0,0, 0,1,0,0,0,0,0],
    "First/Mid Officials & Managers": [1,3,1,0,2,0,0, 0,2,1,0,1,0,0],
    "Professionals": [2,6,2,0,5,0,1, 1,4,2,0,3,0,1],
    "Technicians": [1,2,1,0,1,0,0, 0,1,0,0,1,0,0],
    "Sales Workers": [1,3,1,0,1,0,0, 1,2,1,0,0,0,0],
    "Administrative Support": [1,2,1,0,1,0,0, 2,3,2,0,1,0,1],
    "Craft Workers": [0,0,0,0,0,0,0, 0,0,0,0,0,0,0],
    "Operatives": [0,0,0,0,0,0,0, 0,0,0,0,0,0,0],
    "Laborers & Helpers": [0,0,0,0,0,0,0, 0,0,0,0,0,0,0],
    "Service Workers": [0,0,0,0,0,0,0, 0,0,0,0,0,0,0],
  };

  eeoJobCategories.forEach(cat => {
    const arr = counts[cat];
    eeoRaces.forEach((race, ri) => {
      data.push({ jobCategory: cat, race, gender: "male", count: arr[ri] });
      data.push({ jobCategory: cat, race, gender: "female", count: arr[ri + 7] });
    });
  });

  return data;
}

export const eeoData = generateEEOData();
export { eeoJobCategories, eeoRaces };

export interface EEOValidationError {
  id: string;
  field: string;
  message: string;
  severity: "error" | "warning";
}

export const eeoValidationErrors: EEOValidationError[] = [
  { id: "eeo-err-1", field: "Job Category Totals", message: "Total headcount (85) does not match HRIS active employee count (87). 2 employees may be uncategorized.", severity: "error" },
  { id: "eeo-err-2", field: "Establishment Info", message: "NAICS code has not been verified for the current reporting year.", severity: "warning" },
];


// ─── LABOR POSTERS ───────────────────────────────────────────────────

export type PosterStatus = "current" | "update_available" | "ordered" | "expired";

export interface LaborPoster {
  id: string;
  name: string;
  jurisdiction: "federal" | string;
  status: PosterStatus;
  lastUpdated: string;
  effectiveDate: string;
  category: string;
  digitalDistributed?: number;
  digitalTotal?: number;
}

export const laborPosters: LaborPoster[] = [
  // Federal
  { id: "lp-1", name: "OSHA Job Safety and Health", jurisdiction: "federal", status: "update_available", lastUpdated: "2025-06-01", effectiveDate: "2026-04-01", category: "Safety" },
  { id: "lp-2", name: "Fair Labor Standards Act (FLSA)", jurisdiction: "federal", status: "current", lastUpdated: "2024-07-01", effectiveDate: "2024-07-01", category: "Wage & Hour" },
  { id: "lp-3", name: "Family and Medical Leave Act (FMLA)", jurisdiction: "federal", status: "current", lastUpdated: "2024-04-01", effectiveDate: "2024-04-01", category: "Leave" },
  { id: "lp-4", name: "Equal Employment Opportunity (EEO)", jurisdiction: "federal", status: "current", lastUpdated: "2023-10-01", effectiveDate: "2023-10-01", category: "Anti-Discrimination" },
  { id: "lp-5", name: "Employee Polygraph Protection Act", jurisdiction: "federal", status: "current", lastUpdated: "2023-01-01", effectiveDate: "2023-01-01", category: "Employee Rights" },
  { id: "lp-6", name: "USERRA", jurisdiction: "federal", status: "current", lastUpdated: "2024-01-01", effectiveDate: "2024-01-01", category: "Military Leave" },
  // California
  { id: "lp-7", name: "CA Minimum Wage", jurisdiction: "CA", status: "update_available", lastUpdated: "2025-01-01", effectiveDate: "2026-01-01", category: "Wage & Hour" },
  { id: "lp-8", name: "CA Paid Sick Leave", jurisdiction: "CA", status: "current", lastUpdated: "2025-01-01", effectiveDate: "2025-01-01", category: "Leave" },
  { id: "lp-9", name: "CA DFEH Right to Know", jurisdiction: "CA", status: "current", lastUpdated: "2024-01-01", effectiveDate: "2024-01-01", category: "Anti-Discrimination" },
  { id: "lp-10", name: "CA Workers' Comp Notice", jurisdiction: "CA", status: "current", lastUpdated: "2024-07-01", effectiveDate: "2024-07-01", category: "Safety" },
  // New York
  { id: "lp-11", name: "NY Minimum Wage", jurisdiction: "NY", status: "update_available", lastUpdated: "2025-01-01", effectiveDate: "2026-01-01", category: "Wage & Hour" },
  { id: "lp-12", name: "NY Paid Family Leave", jurisdiction: "NY", status: "current", lastUpdated: "2025-01-01", effectiveDate: "2025-01-01", category: "Leave" },
  { id: "lp-13", name: "NY Sexual Harassment Prevention", jurisdiction: "NY", status: "current", lastUpdated: "2024-04-01", effectiveDate: "2024-04-01", category: "Anti-Discrimination" },
  // Texas
  { id: "lp-14", name: "TX Payday Law", jurisdiction: "TX", status: "current", lastUpdated: "2023-09-01", effectiveDate: "2023-09-01", category: "Wage & Hour" },
  { id: "lp-15", name: "TX Workers' Comp Notice", jurisdiction: "TX", status: "current", lastUpdated: "2024-01-01", effectiveDate: "2024-01-01", category: "Safety" },
];

export const remoteEmployeePosterTracking = [
  { employeeName: "Maria Santos", state: "CA", postersDistributed: true, lastDistributed: "2026-01-15", acknowledged: true },
  { employeeName: "James Liu", state: "NY", postersDistributed: true, lastDistributed: "2026-01-15", acknowledged: true },
  { employeeName: "Raj Patel", state: "TX", postersDistributed: true, lastDistributed: "2026-01-15", acknowledged: false },
  { employeeName: "Lisa Thompson", state: "CA", postersDistributed: false, lastDistributed: "", acknowledged: false },
  { employeeName: "Emily Park", state: "NY", postersDistributed: true, lastDistributed: "2026-01-15", acknowledged: true },
  { employeeName: "Kevin O'Brien", state: "TX", postersDistributed: true, lastDistributed: "2026-01-15", acknowledged: true },
];


// ─── HANDBOOK ─────────────────────────────────────────────────────────

export interface HandbookSection {
  id: string;
  title: string;
  order: number;
  stateSpecific: string[];
  lastModified: string;
  wordCount: number;
  content: string;
}

export const handbookSections: HandbookSection[] = [
  { id: "hb-1", title: "Welcome & Company Mission", order: 1, stateSpecific: [], lastModified: "2026-02-10", wordCount: 850, content: "Welcome to our company. Our mission is to..." },
  { id: "hb-2", title: "Equal Employment Opportunity", order: 2, stateSpecific: [], lastModified: "2026-01-15", wordCount: 1200, content: "We are committed to providing equal employment opportunities..." },
  { id: "hb-3", title: "Anti-Harassment Policy", order: 3, stateSpecific: ["CA", "NY"], lastModified: "2026-03-01", wordCount: 2100, content: "Our company strictly prohibits harassment of any kind..." },
  { id: "hb-4", title: "At-Will Employment", order: 4, stateSpecific: [], lastModified: "2025-12-01", wordCount: 450, content: "Your employment with the company is at-will..." },
  { id: "hb-5", title: "Compensation & Pay Practices", order: 5, stateSpecific: [], lastModified: "2026-01-20", wordCount: 1800, content: "Employees are compensated on a bi-weekly basis..." },
  { id: "hb-6", title: "Benefits Overview", order: 6, stateSpecific: [], lastModified: "2026-02-01", wordCount: 1500, content: "Eligible employees may participate in the following benefits..." },
  { id: "hb-7", title: "Paid Time Off (PTO)", order: 7, stateSpecific: ["CA"], lastModified: "2026-02-15", wordCount: 1100, content: "Full-time employees accrue PTO based on years of service..." },
  { id: "hb-8", title: "Leave Policies (FMLA/CFRA)", order: 8, stateSpecific: ["CA", "NY"], lastModified: "2026-03-10", wordCount: 2800, content: "Eligible employees may take unpaid, job-protected leave..." },
  { id: "hb-9", title: "Workplace Safety", order: 9, stateSpecific: [], lastModified: "2026-01-05", wordCount: 900, content: "The safety of our employees is our top priority..." },
  { id: "hb-10", title: "Remote Work Policy", order: 10, stateSpecific: [], lastModified: "2026-03-15", wordCount: 1300, content: "Employees approved for remote work must maintain..." },
  { id: "hb-11", title: "Expense Reimbursement", order: 11, stateSpecific: ["CA"], lastModified: "2026-01-25", wordCount: 750, content: "The company will reimburse reasonable business expenses..." },
  { id: "hb-12", title: "Termination & Separation", order: 12, stateSpecific: [], lastModified: "2025-11-20", wordCount: 1000, content: "Employment may be terminated by either party at any time..." },
];

export interface HandbookVersion {
  version: string;
  publishedDate: string;
  publishedBy: string;
  changeNotes: string;
  signedCount: number;
  totalEmployees: number;
}

export const handbookVersions: HandbookVersion[] = [
  { version: "4.2", publishedDate: "2026-03-15", publishedBy: "Sarah Williams", changeNotes: "Updated anti-harassment policy, added remote work section, CA expense reimbursement updates", signedCount: 39, totalEmployees: 51 },
  { version: "4.1", publishedDate: "2025-11-01", publishedBy: "Sarah Williams", changeNotes: "Annual review updates, PTO policy revisions", signedCount: 48, totalEmployees: 48 },
  { version: "4.0", publishedDate: "2025-06-15", publishedBy: "Michael Brown", changeNotes: "Major revision: restructured all sections, added CFRA leave policy", signedCount: 45, totalEmployees: 45 },
  { version: "3.5", publishedDate: "2025-01-10", publishedBy: "Michael Brown", changeNotes: "Updated minimum wage references, new COVID policies removed", signedCount: 42, totalEmployees: 42 },
];


// ─── WOTC ─────────────────────────────────────────────────────────────

export type WOTCTargetGroup =
  | "SNAP Recipient"
  | "Veteran"
  | "Ex-Felon"
  | "Long-term Unemployed"
  | "Empowerment Zone Resident"
  | "Summer Youth Employee"
  | "SSI Recipient"
  | "TANF Recipient"
  | "Not Eligible";

export type WOTCSubmissionStatus = "submitted" | "pending" | "approved" | "denied" | "not_applicable";

export interface WOTCScreening {
  id: string;
  employeeName: string;
  employeeId: string;
  hireDate: string;
  questionnaireComplete: boolean;
  eligible: boolean;
  targetGroup: WOTCTargetGroup;
  estimatedCredit: number;
  form8850Generated: boolean;
  submissionStatus: WOTCSubmissionStatus;
  submissionDate?: string;
  stateAgency: string;
}

export const wotcScreenings: WOTCScreening[] = [
  { id: "wotc-1", employeeName: "Raj Patel", employeeId: "EMP-1135", hireDate: "2025-11-01", questionnaireComplete: true, eligible: true, targetGroup: "Long-term Unemployed", estimatedCredit: 2400, form8850Generated: true, submissionStatus: "approved", submissionDate: "2025-11-10", stateAgency: "TX Workforce Commission" },
  { id: "wotc-2", employeeName: "Lisa Thompson", employeeId: "EMP-1140", hireDate: "2026-03-25", questionnaireComplete: true, eligible: true, targetGroup: "SNAP Recipient", estimatedCredit: 2400, form8850Generated: true, submissionStatus: "submitted", submissionDate: "2026-03-28", stateAgency: "CA EDD" },
  { id: "wotc-3", employeeName: "David Martinez", employeeId: "EMP-1105", hireDate: "2024-01-08", questionnaireComplete: true, eligible: true, targetGroup: "Veteran", estimatedCredit: 5600, form8850Generated: true, submissionStatus: "approved", submissionDate: "2024-01-15", stateAgency: "CA EDD" },
  { id: "wotc-4", employeeName: "Emily Park", employeeId: "EMP-1120", hireDate: "2024-09-20", questionnaireComplete: true, eligible: false, targetGroup: "Not Eligible", estimatedCredit: 0, form8850Generated: false, submissionStatus: "not_applicable", stateAgency: "NY DOL" },
  { id: "wotc-5", employeeName: "Anna Kowalski", employeeId: "EMP-1075", hireDate: "2022-09-12", questionnaireComplete: true, eligible: true, targetGroup: "Empowerment Zone Resident", estimatedCredit: 2400, form8850Generated: true, submissionStatus: "approved", submissionDate: "2022-09-20", stateAgency: "NY DOL" },
  { id: "wotc-6", employeeName: "Kevin O'Brien", employeeId: "EMP-1028", hireDate: "2020-11-15", questionnaireComplete: true, eligible: false, targetGroup: "Not Eligible", estimatedCredit: 0, form8850Generated: false, submissionStatus: "not_applicable", stateAgency: "TX Workforce Commission" },
  { id: "wotc-7", employeeName: "Michael Brown", employeeId: "EMP-1001", hireDate: "2019-01-15", questionnaireComplete: true, eligible: false, targetGroup: "Not Eligible", estimatedCredit: 0, form8850Generated: false, submissionStatus: "not_applicable", stateAgency: "CA EDD" },
  { id: "wotc-8", employeeName: "Aisha Johnson", employeeId: "EMP-1089", hireDate: "2023-01-10", questionnaireComplete: true, eligible: true, targetGroup: "TANF Recipient", estimatedCredit: 2400, form8850Generated: true, submissionStatus: "approved", submissionDate: "2023-01-18", stateAgency: "CA EDD" },
  { id: "wotc-9", employeeName: "Robert Chen", employeeId: "EMP-1012", hireDate: "2020-08-03", questionnaireComplete: false, eligible: false, targetGroup: "Not Eligible", estimatedCredit: 0, form8850Generated: false, submissionStatus: "not_applicable", stateAgency: "CA EDD" },
  { id: "wotc-10", employeeName: "Sarah Williams", employeeId: "EMP-1098", hireDate: "2023-07-15", questionnaireComplete: true, eligible: false, targetGroup: "Not Eligible", estimatedCredit: 0, form8850Generated: false, submissionStatus: "not_applicable", stateAgency: "CA EDD" },
];
