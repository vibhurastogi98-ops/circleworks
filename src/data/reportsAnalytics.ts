import {
  BarChart3,
  Calculator,
  CalendarDays,
  Clock3,
  FileSpreadsheet,
  FileText,
  HeartPulse,
  Landmark,
  PieChart,
  Receipt,
  Scale,
  ShieldAlert,
  Star,
  TrendingDown,
  UserMinus,
  UserPlus,
  Users,
  WalletCards,
  type LucideIcon,
} from "lucide-react";

export type ReportSectionId = "payroll" | "people" | "time" | "expenses" | "custom";

export interface AnalyticsReportCard {
  id: string;
  section: ReportSectionId;
  name: string;
  description: string;
  lastRun: string;
  href: string;
  icon: LucideIcon;
  favorite?: boolean;
}

export interface AnalyticsReportSection {
  id: ReportSectionId;
  title: string;
  description: string;
}

export const analyticsReportSections: AnalyticsReportSection[] = [
  {
    id: "payroll",
    title: "Payroll Reports",
    description: "Payroll cost, liability, register, journal, and year-end previews.",
  },
  {
    id: "people",
    title: "People Reports",
    description: "Workforce movement, demographics, compensation, and equity reporting.",
  },
  {
    id: "time",
    title: "Time Reports",
    description: "Attendance, overtime, PTO, leave, and FMLA operational views.",
  },
  {
    id: "expenses",
    title: "Expenses Reports",
    description: "Spend, policy, category, and employee reimbursement reporting.",
  },
  {
    id: "custom",
    title: "Custom Reports",
    description: "Saved reports and a builder for finance and people operations.",
  },
];

export const analyticsReportCards: AnalyticsReportCard[] = [
  {
    id: "payroll-summary",
    section: "payroll",
    name: "Payroll Summary",
    description: "Gross, net, tax, and employer cost by employee and department.",
    lastRun: "2026-05-29",
    href: "/reports/payroll-summary",
    icon: BarChart3,
    favorite: true,
  },
  {
    id: "tax-liability",
    section: "payroll",
    name: "Tax Liability",
    description: "Federal, FICA, SUTA, and state tax liabilities by due date.",
    lastRun: "2026-05-27",
    href: "/reports/viewer/rpt-3",
    icon: Landmark,
  },
  {
    id: "deductions-summary",
    section: "payroll",
    name: "Deductions Summary",
    description: "Pre-tax, post-tax, retirement, health, and garnishment deductions.",
    lastRun: "2026-05-25",
    href: "/reports/viewer/rpt-2",
    icon: Calculator,
  },
  {
    id: "payroll-register",
    section: "payroll",
    name: "Payroll Register",
    description: "Employee-level payroll register with earnings, taxes, and net pay.",
    lastRun: "2026-05-24",
    href: "/reports/viewer/rpt-2",
    icon: FileSpreadsheet,
  },
  {
    id: "journal-entry-export",
    section: "payroll",
    name: "Journal Entry Export",
    description: "Accounting-ready payroll journal mapped to GL accounts.",
    lastRun: "2026-05-20",
    href: "/reports/viewer/rpt-4",
    icon: FileText,
  },
  {
    id: "w2-preview",
    section: "payroll",
    name: "W-2 Preview",
    description: "Preview W-2 wages, taxes, and employee year-end data.",
    lastRun: "2026-05-17",
    href: "/reports/viewer/rpt-17",
    icon: FileText,
  },
  {
    id: "headcount",
    section: "people",
    name: "Headcount",
    description: "Headcount over time, movement, demographics, and departments.",
    lastRun: "2026-05-30",
    href: "/reports/headcount",
    icon: Users,
    favorite: true,
  },
  {
    id: "turnover",
    section: "people",
    name: "Turnover Report",
    description: "Voluntary and involuntary turnover by department and month.",
    lastRun: "2026-05-28",
    href: "/reports/headcount",
    icon: TrendingDown,
  },
  {
    id: "new-hires",
    section: "people",
    name: "New Hires",
    description: "New hires by department, location, manager, and start date.",
    lastRun: "2026-05-26",
    href: "/reports/viewer/rpt-6",
    icon: UserPlus,
  },
  {
    id: "terminations",
    section: "people",
    name: "Terminations",
    description: "Terminations, reasons, final pay dates, and final pay amounts.",
    lastRun: "2026-05-26",
    href: "/reports/viewer/rpt-7",
    icon: UserMinus,
  },
  {
    id: "diversity-eeo1",
    section: "people",
    name: "Diversity (EEO-1)",
    description: "EEO-1 workforce composition by category and demographic group.",
    lastRun: "2026-05-23",
    href: "/compliance/eeo1",
    icon: PieChart,
  },
  {
    id: "pay-equity",
    section: "people",
    name: "Pay Equity",
    description: "Controlled and uncontrolled pay gap analysis for auditors.",
    lastRun: "2026-05-22",
    href: "/reports/pay-equity",
    icon: Scale,
    favorite: true,
  },
  {
    id: "comp-distribution",
    section: "people",
    name: "Compensation Distribution",
    description: "Salary distribution by department, level, job family, and location.",
    lastRun: "2026-05-21",
    href: "/reports/pay-equity",
    icon: WalletCards,
  },
  {
    id: "overtime",
    section: "time",
    name: "Overtime",
    description: "Overtime hours, overtime cost, and employees driving variance.",
    lastRun: "2026-05-29",
    href: "/reports/viewer/rpt-28",
    icon: Clock3,
  },
  {
    id: "attendance",
    section: "time",
    name: "Attendance",
    description: "Absences, tardiness, missed punches, and attendance patterns.",
    lastRun: "2026-05-27",
    href: "/reports/viewer/rpt-29",
    icon: CalendarDays,
  },
  {
    id: "pto-usage",
    section: "time",
    name: "PTO Usage",
    description: "PTO hours used by employee, department, manager, and policy.",
    lastRun: "2026-05-24",
    href: "/reports/viewer/rpt-27",
    icon: CalendarDays,
  },
  {
    id: "leave-balances",
    section: "time",
    name: "Leave Balances",
    description: "Accrued leave balances and liability exposure.",
    lastRun: "2026-05-24",
    href: "/reports/viewer/rpt-27",
    icon: WalletCards,
  },
  {
    id: "fmla-tracking",
    section: "time",
    name: "FMLA Tracking",
    description: "FMLA usage, open cases, eligibility, and upcoming exhaustion dates.",
    lastRun: "2026-05-19",
    href: "/reports/time-analytics",
    icon: HeartPulse,
  },
  {
    id: "expense-summary",
    section: "expenses",
    name: "Expense Summary",
    description: "Expense totals by category, department, employee, and status.",
    lastRun: "2026-05-28",
    href: "/reports/expense-summary",
    icon: Receipt,
  },
  {
    id: "expense-category",
    section: "expenses",
    name: "By Category",
    description: "Travel, meals, software, mileage, and office spend by category.",
    lastRun: "2026-05-25",
    href: "/reports/expense-summary",
    icon: PieChart,
  },
  {
    id: "expense-employee",
    section: "expenses",
    name: "By Employee",
    description: "Employee-level reimbursable spend and pending approvals.",
    lastRun: "2026-05-25",
    href: "/reports/expense-summary",
    icon: Users,
  },
  {
    id: "policy-violations",
    section: "expenses",
    name: "Policy Violations",
    description: "Out-of-policy spend, missing receipts, and duplicate submissions.",
    lastRun: "2026-05-20",
    href: "/reports/expense-summary",
    icon: ShieldAlert,
  },
  {
    id: "custom-builder",
    section: "custom",
    name: "Build Your Own",
    description: "Create a report from employees, payroll, time, expenses, or benefits.",
    lastRun: "Never",
    href: "/reports/custom",
    icon: Star,
    favorite: true,
  },
  {
    id: "custom-department-cost",
    section: "custom",
    name: "Department Cost Center",
    description: "Saved custom report for payroll cost allocation by department.",
    lastRun: "2026-05-29",
    href: "/reports/custom/department-cost-center",
    icon: FileSpreadsheet,
  },
];

export interface PayrollSummaryRow {
  employee: string;
  department: string;
  employeeType: "Full-time" | "Part-time" | "Contractor";
  gross: number;
  federalTax: number;
  fica: number;
  stateTax: number;
  otherDeductions: number;
  netPay: number;
}

export const payrollSummaryRows: PayrollSummaryRow[] = [
  { employee: "Robert Chen", department: "Engineering", employeeType: "Full-time", gross: 9800, federalTax: 1960, fica: 749, stateTax: 720, otherDeductions: 540, netPay: 5831 },
  { employee: "Maria Santos", department: "Engineering", employeeType: "Full-time", gross: 9200, federalTax: 1840, fica: 704, stateTax: 690, otherDeductions: 510, netPay: 5456 },
  { employee: "Emily Park", department: "Product", employeeType: "Full-time", gross: 8700, federalTax: 1740, fica: 666, stateTax: 620, otherDeductions: 480, netPay: 5194 },
  { employee: "James Liu", department: "Finance", employeeType: "Full-time", gross: 8400, federalTax: 1680, fica: 643, stateTax: 605, otherDeductions: 450, netPay: 5022 },
  { employee: "Sarah Williams", department: "People", employeeType: "Full-time", gross: 7900, federalTax: 1580, fica: 604, stateTax: 560, otherDeductions: 420, netPay: 4736 },
  { employee: "David Martinez", department: "Sales", employeeType: "Full-time", gross: 7600, federalTax: 1520, fica: 581, stateTax: 540, otherDeductions: 390, netPay: 4569 },
  { employee: "Aisha Johnson", department: "Marketing", employeeType: "Full-time", gross: 7100, federalTax: 1420, fica: 543, stateTax: 500, otherDeductions: 360, netPay: 4277 },
  { employee: "Lisa Thompson", department: "Support", employeeType: "Full-time", gross: 5200, federalTax: 910, fica: 398, stateTax: 330, otherDeductions: 260, netPay: 3302 },
  { employee: "Raj Patel", department: "Product", employeeType: "Part-time", gross: 4200, federalTax: 650, fica: 321, stateTax: 250, otherDeductions: 160, netPay: 2819 },
  { employee: "Kevin O'Brien", department: "Operations", employeeType: "Contractor", gross: 6100, federalTax: 0, fica: 0, stateTax: 0, otherDeductions: 0, netPay: 6100 },
];

export const payrollSummaryComparisons = {
  gross: 7.4,
  net: 6.8,
  taxes: 8.1,
  employerCost: 5.2,
};

export function getPayrollSummaryTotals(rows = payrollSummaryRows) {
  const totalGross = rows.reduce((total, row) => total + row.gross, 0);
  const totalNet = rows.reduce((total, row) => total + row.netPay, 0);
  const totalTaxes = rows.reduce((total, row) => total + row.federalTax + row.fica + row.stateTax, 0);
  const employerCost = Math.round(totalGross * 1.137);
  return { totalGross, totalNet, totalTaxes, employerCost };
}

export function getPayrollByDepartment(rows = payrollSummaryRows) {
  const byDepartment = rows.reduce<Record<string, number>>((groups, row) => {
    groups[row.department] = (groups[row.department] ?? 0) + row.gross;
    return groups;
  }, {});

  return Object.entries(byDepartment).map(([department, gross]) => ({ department, gross }));
}

export const headcountTrend = [
  { month: "Jun", headcount: 118, hires: 4, terminations: 2 },
  { month: "Jul", headcount: 121, hires: 5, terminations: 2 },
  { month: "Aug", headcount: 124, hires: 4, terminations: 1 },
  { month: "Sep", headcount: 126, hires: 3, terminations: 1 },
  { month: "Oct", headcount: 128, hires: 4, terminations: 2 },
  { month: "Nov", headcount: 131, hires: 5, terminations: 2 },
  { month: "Dec", headcount: 132, hires: 3, terminations: 2 },
  { month: "Jan", headcount: 136, hires: 6, terminations: 2 },
  { month: "Feb", headcount: 138, hires: 4, terminations: 2 },
  { month: "Mar", headcount: 140, hires: 5, terminations: 3 },
  { month: "Apr", headcount: 141, hires: 3, terminations: 2 },
  { month: "May", headcount: 142, hires: 4, terminations: 3 },
];

export const turnoverSummary = {
  voluntary: 14,
  involuntary: 8,
  averageHeadcount: 132,
};

export const demographicBreakdowns = {
  gender: [
    { label: "Women", value: 68 },
    { label: "Men", value: 70 },
    { label: "Non-binary", value: 2 },
    { label: "Not disclosed", value: 2 },
  ],
  raceEthnicity: [
    { label: "Asian", value: 39 },
    { label: "Black or African American", value: 18 },
    { label: "Hispanic or Latino", value: 24 },
    { label: "White", value: 49 },
    { label: "Two or More Races", value: 6 },
    { label: "Not disclosed", value: 6 },
  ],
  ageDistribution: [
    { bucket: "18-24", value: 9 },
    { bucket: "25-34", value: 54 },
    { bucket: "35-44", value: 47 },
    { bucket: "45-54", value: 22 },
    { bucket: "55+", value: 10 },
  ],
};

export const departmentBreakdown = [
  { department: "Engineering", headcount: 42 },
  { department: "Sales", headcount: 25 },
  { department: "Product", headcount: 18 },
  { department: "Support", headcount: 20 },
  { department: "Finance", headcount: 11 },
  { department: "People", headcount: 9 },
  { department: "Marketing", headcount: 12 },
  { department: "Operations", headcount: 5 },
];

export const orgTree = {
  name: "CEO",
  children: [
    { name: "Engineering", count: 42, children: ["Platform", "Product Eng", "Infrastructure"] },
    { name: "Revenue", count: 37, children: ["Sales", "Marketing", "Customer Success"] },
    { name: "G&A", count: 25, children: ["Finance", "People", "Legal"] },
    { name: "Operations", count: 38, children: ["Support", "Facilities", "Compliance"] },
  ],
};

export interface PayEquityRow {
  segment: string;
  group: string;
  comparison: string;
  uncontrolledGap: number;
  controlledGap: number;
  sampleSize: number;
  significant: boolean;
}

export const payEquityRows: PayEquityRow[] = [
  { segment: "Gender", group: "Women", comparison: "Men", uncontrolledGap: -4.8, controlledGap: -1.2, sampleSize: 68, significant: false },
  { segment: "Gender", group: "Non-binary", comparison: "All employees", uncontrolledGap: -3.1, controlledGap: -0.8, sampleSize: 2, significant: false },
  { segment: "Race/Ethnicity", group: "Black or African American", comparison: "White", uncontrolledGap: -6.4, controlledGap: -2.9, sampleSize: 18, significant: true },
  { segment: "Race/Ethnicity", group: "Hispanic or Latino", comparison: "White", uncontrolledGap: -3.7, controlledGap: -1.6, sampleSize: 24, significant: false },
  { segment: "Race/Ethnicity", group: "Asian", comparison: "White", uncontrolledGap: 1.9, controlledGap: 0.7, sampleSize: 39, significant: false },
  { segment: "Department", group: "Engineering", comparison: "Company", uncontrolledGap: 12.4, controlledGap: 1.8, sampleSize: 42, significant: false },
  { segment: "Department", group: "Support", comparison: "Company", uncontrolledGap: -8.2, controlledGap: -3.4, sampleSize: 20, significant: true },
  { segment: "Level", group: "L4", comparison: "All levels", uncontrolledGap: -2.2, controlledGap: -0.9, sampleSize: 34, significant: false },
  { segment: "Level", group: "L5", comparison: "All levels", uncontrolledGap: 3.4, controlledGap: 1.1, sampleSize: 29, significant: false },
];

export const payEquityFactors = [
  { factor: "Job level", impact: 42 },
  { factor: "Job family", impact: 28 },
  { factor: "Location", impact: 13 },
  { factor: "Tenure", impact: 10 },
  { factor: "Performance rating", impact: 7 },
];

export type CustomEntity = "Employees" | "Payroll" | "Time" | "Expenses" | "Benefits";
export type CustomFieldType = "text" | "number" | "currency" | "date" | "percentage";

export interface CustomReportField {
  id: string;
  label: string;
  entity: CustomEntity;
  type: CustomFieldType;
}

export const customReportEntities: Array<{ entity: CustomEntity; description: string; icon: LucideIcon }> = [
  { entity: "Employees", description: "Profile, job, demographic, and compensation fields.", icon: Users },
  { entity: "Payroll", description: "Earnings, deductions, taxes, net pay, and employer costs.", icon: WalletCards },
  { entity: "Time", description: "Hours, schedules, PTO, leave, and attendance records.", icon: Clock3 },
  { entity: "Expenses", description: "Expense reports, categories, reimbursements, and violations.", icon: Receipt },
  { entity: "Benefits", description: "Plans, enrollments, costs, and coverage details.", icon: HeartPulse },
];

export const customReportFields: CustomReportField[] = [
  { id: "employee_name", label: "Employee Name", entity: "Employees", type: "text" },
  { id: "employee_id", label: "Employee ID", entity: "Employees", type: "text" },
  { id: "department", label: "Department", entity: "Employees", type: "text" },
  { id: "location", label: "Location", entity: "Employees", type: "text" },
  { id: "manager", label: "Manager", entity: "Employees", type: "text" },
  { id: "hire_date", label: "Hire Date", entity: "Employees", type: "date" },
  { id: "gender", label: "Gender", entity: "Employees", type: "text" },
  { id: "race_ethnicity", label: "Race/Ethnicity", entity: "Employees", type: "text" },
  { id: "annual_salary", label: "Annual Salary", entity: "Employees", type: "currency" },
  { id: "gross_pay", label: "Gross Pay", entity: "Payroll", type: "currency" },
  { id: "net_pay", label: "Net Pay", entity: "Payroll", type: "currency" },
  { id: "federal_tax", label: "Federal Tax", entity: "Payroll", type: "currency" },
  { id: "state_tax", label: "State Tax", entity: "Payroll", type: "currency" },
  { id: "deductions", label: "Deductions", entity: "Payroll", type: "currency" },
  { id: "regular_hours", label: "Regular Hours", entity: "Time", type: "number" },
  { id: "overtime_hours", label: "Overtime Hours", entity: "Time", type: "number" },
  { id: "pto_balance", label: "PTO Balance", entity: "Time", type: "number" },
  { id: "fmla_hours", label: "FMLA Hours", entity: "Time", type: "number" },
  { id: "expense_amount", label: "Expense Amount", entity: "Expenses", type: "currency" },
  { id: "expense_category", label: "Expense Category", entity: "Expenses", type: "text" },
  { id: "policy_violation", label: "Policy Violation", entity: "Expenses", type: "text" },
  { id: "plan_name", label: "Plan Name", entity: "Benefits", type: "text" },
  { id: "coverage_tier", label: "Coverage Tier", entity: "Benefits", type: "text" },
  { id: "employer_cost", label: "Employer Cost", entity: "Benefits", type: "currency" },
];

export interface SavedCustomReport {
  id: string;
  name: string;
  description: string;
  entity: CustomEntity;
  fields: string[];
  lastRun: string;
  rowCount: number;
  schedule: "daily" | "weekly" | "monthly";
  recipients: string[];
}

export const savedCustomReports: SavedCustomReport[] = [
  {
    id: "department-cost-center",
    name: "Department Cost Center",
    description: "Payroll, benefits, and expense cost allocation by department.",
    entity: "Payroll",
    fields: ["employee_name", "department", "gross_pay", "deductions", "net_pay"],
    lastRun: "2026-05-29",
    rowCount: 1250,
    schedule: "weekly",
    recipients: ["finance@circleworks.com", "people@circleworks.com"],
  },
  {
    id: "remote-expense-audit",
    name: "Remote Expense Audit",
    description: "Remote employee expenses with category and policy violation status.",
    entity: "Expenses",
    fields: ["employee_name", "department", "expense_category", "expense_amount", "policy_violation"],
    lastRun: "2026-05-24",
    rowCount: 684,
    schedule: "monthly",
    recipients: ["finance@circleworks.com"],
  },
];

const sampleEmployees = [
  "Robert Chen",
  "Maria Santos",
  "Emily Park",
  "James Liu",
  "Sarah Williams",
  "David Martinez",
  "Aisha Johnson",
  "Lisa Thompson",
  "Raj Patel",
  "Kevin O'Brien",
];

const sampleDepartments = ["Engineering", "Product", "Finance", "People", "Sales", "Marketing", "Support", "Operations"];
const sampleLocations = ["San Francisco", "New York", "Austin", "Remote"];
const sampleCategories = ["Travel", "Meals", "Software", "Mileage", "Office"];
const samplePlans = ["Gold PPO", "Silver HMO", "Dental Plus", "Vision Base"];

export type ReportCell = string | number;
export type ReportRow = Record<string, ReportCell>;

export function buildCustomRows(fields: string[], count = 240): ReportRow[] {
  const selected = fields
    .map((fieldId) => customReportFields.find((field) => field.id === fieldId))
    .filter(Boolean) as CustomReportField[];

  return Array.from({ length: count }, (_, index) => {
    const employee = sampleEmployees[index % sampleEmployees.length];
    const department = sampleDepartments[index % sampleDepartments.length];
    const row: ReportRow = {};

    selected.forEach((field) => {
      switch (field.id) {
        case "employee_name":
          row[field.id] = employee;
          break;
        case "employee_id":
          row[field.id] = `EMP-${String(1000 + index).padStart(4, "0")}`;
          break;
        case "department":
          row[field.id] = department;
          break;
        case "location":
          row[field.id] = sampleLocations[index % sampleLocations.length];
          break;
        case "manager":
          row[field.id] = sampleEmployees[(index + 3) % sampleEmployees.length];
          break;
        case "hire_date":
          row[field.id] = `202${index % 6}-0${(index % 9) + 1}-15`;
          break;
        case "gender":
          row[field.id] = ["Women", "Men", "Non-binary", "Not disclosed"][index % 4];
          break;
        case "race_ethnicity":
          row[field.id] = demographicBreakdowns.raceEthnicity[index % demographicBreakdowns.raceEthnicity.length].label;
          break;
        case "annual_salary":
          row[field.id] = 68000 + (index % 20) * 4200;
          break;
        case "gross_pay":
          row[field.id] = 4200 + (index % 18) * 360;
          break;
        case "net_pay":
          row[field.id] = 2900 + (index % 18) * 240;
          break;
        case "federal_tax":
          row[field.id] = 720 + (index % 12) * 55;
          break;
        case "state_tax":
          row[field.id] = 260 + (index % 9) * 34;
          break;
        case "deductions":
          row[field.id] = 180 + (index % 11) * 28;
          break;
        case "regular_hours":
          row[field.id] = 72 + (index % 9);
          break;
        case "overtime_hours":
          row[field.id] = index % 5 === 0 ? 6 + (index % 4) : index % 3;
          break;
        case "pto_balance":
          row[field.id] = 18 + (index % 40);
          break;
        case "fmla_hours":
          row[field.id] = index % 11 === 0 ? 24 + (index % 5) * 8 : 0;
          break;
        case "expense_amount":
          row[field.id] = 80 + (index % 16) * 42;
          break;
        case "expense_category":
          row[field.id] = sampleCategories[index % sampleCategories.length];
          break;
        case "policy_violation":
          row[field.id] = index % 13 === 0 ? "Missing receipt" : index % 17 === 0 ? "Over limit" : "None";
          break;
        case "plan_name":
          row[field.id] = samplePlans[index % samplePlans.length];
          break;
        case "coverage_tier":
          row[field.id] = ["Employee", "Employee + spouse", "Family"][index % 3];
          break;
        case "employer_cost":
          row[field.id] = 380 + (index % 12) * 45;
          break;
        default:
          row[field.id] = "";
      }
    });

    return row;
  });
}

export function getSavedCustomReport(reportId: string) {
  return savedCustomReports.find((report) => report.id === reportId) ?? savedCustomReports[0];
}

export function toCsv(headers: string[], rows: Array<Array<string | number>>) {
  return [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");
}
