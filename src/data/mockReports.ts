// ─── REPORT CATEGORIES & STANDARD REPORTS ────────────────────────────

export type ReportCategory =
  | "Payroll"
  | "Employees"
  | "Tax & Compliance"
  | "Benefits"
  | "Time & Attendance"
  | "Hiring"
  | "Expenses"
  | "Custom";

export interface StandardReport {
  id: string;
  name: string;
  description: string;
  category: ReportCategory;
  icon: string;
  popular?: boolean;
}

export const standardReports: StandardReport[] = [
  // Payroll
  { id: "rpt-1", name: "Payroll Register", description: "Complete payroll run details — gross, deductions, net pay per employee.", category: "Payroll", icon: "DollarSign", popular: true },
  { id: "rpt-2", name: "Payroll Journal", description: "General-ledger-ready journal entries for each payroll run.", category: "Payroll", icon: "BookOpen" },
  { id: "rpt-3", name: "Payroll Summary", description: "High-level totals by pay period — wages, taxes, deductions.", category: "Payroll", icon: "BarChart2", popular: true },
  { id: "rpt-4", name: "Check Register", description: "All issued paychecks with amounts and check/ACH numbers.", category: "Payroll", icon: "FileText" },
  { id: "rpt-5", name: "Deduction Report", description: "Breakdown of all employee deductions by type.", category: "Payroll", icon: "Minus" },
  { id: "rpt-6", name: "Employer Tax Liability", description: "Federal and state employer tax obligations by period.", category: "Payroll", icon: "Landmark" },
  { id: "rpt-7", name: "Workers' Comp Summary", description: "Work-comp premium amounts by class code per payroll.", category: "Payroll", icon: "Shield" },
  // Employees
  { id: "rpt-8", name: "Employee Directory", description: "Full active employee roster with contact info and department.", category: "Employees", icon: "Users", popular: true },
  { id: "rpt-9", name: "Headcount Report", description: "Total headcount over time — hires, terminations, and net change.", category: "Employees", icon: "TrendingUp" },
  { id: "rpt-10", name: "Turnover Analysis", description: "Voluntary vs involuntary turnover rates by department and period.", category: "Employees", icon: "ActivitySquare" },
  { id: "rpt-11", name: "Compensation Summary", description: "Salary bands, averages, and distributions by department/role.", category: "Employees", icon: "DollarSign" },
  { id: "rpt-12", name: "Anniversary & Birthday", description: "Upcoming work anniversaries and employee birthdays.", category: "Employees", icon: "Cake" },
  { id: "rpt-13", name: "New Hire Report", description: "All new hires within date range — start date, department, manager.", category: "Employees", icon: "UserPlus", popular: true },
  { id: "rpt-14", name: "Termination Report", description: "Terminated employees with reason codes and last day worked.", category: "Employees", icon: "UserMinus" },
  // Tax & Compliance
  { id: "rpt-15", name: "941 Quarterly Summary", description: "Quarterly federal tax return preparation summary.", category: "Tax & Compliance", icon: "FileCheck" },
  { id: "rpt-16", name: "State Tax Summary", description: "State-level withholding and unemployment tax summary.", category: "Tax & Compliance", icon: "Globe" },
  { id: "rpt-17", name: "W-2 Preview", description: "Preview W-2 data before year-end filing.", category: "Tax & Compliance", icon: "FileText" },
  { id: "rpt-18", name: "I-9 Audit Report", description: "I-9 compliance status for all employees with expiry tracking.", category: "Tax & Compliance", icon: "ShieldCheck" },
  { id: "rpt-19", name: "EEO-1 Summary", description: "Equal employment opportunity report data by category.", category: "Tax & Compliance", icon: "PieChart" },
  { id: "rpt-20", name: "ACA Eligibility", description: "ACA full-time equivalent tracking and coverage status.", category: "Tax & Compliance", icon: "HeartPulse" },
  // Benefits
  { id: "rpt-21", name: "Benefits Enrollment", description: "Employee enrollment status across all benefit plans.", category: "Benefits", icon: "Heart", popular: true },
  { id: "rpt-22", name: "Benefits Cost Analysis", description: "Employer vs employee cost breakdown by plan and period.", category: "Benefits", icon: "DollarSign" },
  { id: "rpt-23", name: "401(k) Contributions", description: "Employee and employer 401(k) contribution details.", category: "Benefits", icon: "PiggyBank" },
  { id: "rpt-24", name: "COBRA Tracking", description: "Active COBRA participants with payment status.", category: "Benefits", icon: "Shield" },
  { id: "rpt-25", name: "FSA/HSA Balances", description: "Current FSA and HSA balance details per employee.", category: "Benefits", icon: "Wallet" },
  // Time & Attendance
  { id: "rpt-26", name: "Timesheet Summary", description: "Hours worked summary by employee, period, and project.", category: "Time & Attendance", icon: "Clock", popular: true },
  { id: "rpt-27", name: "PTO Balances", description: "Current PTO/vacation accruals and balances.", category: "Time & Attendance", icon: "CalendarDays" },
  { id: "rpt-28", name: "Overtime Report", description: "Employees with overtime hours — weekly breakdown.", category: "Time & Attendance", icon: "AlertTriangle" },
  { id: "rpt-29", name: "Attendance Summary", description: "Absences, tardiness, and patterns by employee.", category: "Time & Attendance", icon: "CalendarX" },
  { id: "rpt-30", name: "Schedule Variance", description: "Actual vs scheduled hours comparison.", category: "Time & Attendance", icon: "GitCompare" },
  // Hiring
  { id: "rpt-31", name: "Applicant Pipeline", description: "Candidates by stage — applied, screened, interviewed, offered.", category: "Hiring", icon: "Briefcase" },
  { id: "rpt-32", name: "Time to Fill", description: "Average days to fill open positions by department.", category: "Hiring", icon: "Clock" },
  { id: "rpt-33", name: "Source Effectiveness", description: "Hire source breakdown — job boards, referrals, direct.", category: "Hiring", icon: "Target" },
  { id: "rpt-34", name: "Offer Acceptance Rate", description: "Offer-to-acceptance conversion rates over time.", category: "Hiring", icon: "CheckCircle" },
  { id: "rpt-35", name: "Onboarding Status", description: "New hire onboarding task completion tracking.", category: "Hiring", icon: "ClipboardCheck" },
  // Expenses
  { id: "rpt-36", name: "Expense Summary", description: "Total expenses by category, department, and employee.", category: "Expenses", icon: "Receipt", popular: true },
  { id: "rpt-37", name: "Mileage Report", description: "Mileage logs and reimbursement amounts.", category: "Expenses", icon: "Car" },
  { id: "rpt-38", name: "Policy Violations", description: "Expense submissions flagged for policy violations.", category: "Expenses", icon: "AlertCircle" },
  { id: "rpt-39", name: "Vendor Spending", description: "Top vendors and spending patterns over time.", category: "Expenses", icon: "Building" },
  { id: "rpt-40", name: "Per Diem Report", description: "Per diem allocations and usage by employee.", category: "Expenses", icon: "CalendarDays" },
  // Custom
  { id: "rpt-41", name: "Custom: Dept Cost Center", description: "Employee costs allocated by cost center — custom build.", category: "Custom", icon: "Settings" },
  { id: "rpt-42", name: "Custom: Grant Allocation", description: "Hours and costs allocated to specific grants.", category: "Custom", icon: "Settings" },
];

export const reportCategories: ReportCategory[] = [
  "Payroll",
  "Employees",
  "Tax & Compliance",
  "Benefits",
  "Time & Attendance",
  "Hiring",
  "Expenses",
  "Custom",
];


// ─── SCHEDULED REPORTS ───────────────────────────────────────────────

export interface ScheduledReport {
  id: string;
  reportName: string;
  reportId: string;
  frequency: "daily" | "weekly" | "biweekly" | "monthly" | "quarterly";
  recipients: string[];
  format: "csv" | "pdf" | "excel";
  lastRun: string;
  nextRun: string;
  active: boolean;
}

export const scheduledReports: ScheduledReport[] = [
  { id: "sr-1", reportName: "Payroll Register", reportId: "rpt-1", frequency: "biweekly", recipients: ["sarah@company.com", "cfo@company.com"], format: "pdf", lastRun: "2026-03-28", nextRun: "2026-04-11", active: true },
  { id: "sr-2", reportName: "Headcount Report", reportId: "rpt-9", frequency: "monthly", recipients: ["hr@company.com"], format: "excel", lastRun: "2026-04-01", nextRun: "2026-05-01", active: true },
  { id: "sr-3", reportName: "Overtime Report", reportId: "rpt-28", frequency: "weekly", recipients: ["ops@company.com", "hr@company.com"], format: "csv", lastRun: "2026-04-04", nextRun: "2026-04-11", active: true },
  { id: "sr-4", reportName: "Expense Summary", reportId: "rpt-36", frequency: "monthly", recipients: ["finance@company.com"], format: "pdf", lastRun: "2026-04-01", nextRun: "2026-05-01", active: false },
  { id: "sr-5", reportName: "PTO Balances", reportId: "rpt-27", frequency: "quarterly", recipients: ["hr@company.com", "managers@company.com"], format: "excel", lastRun: "2026-01-01", nextRun: "2026-04-01", active: true },
];


// ─── AI INSIGHTS ─────────────────────────────────────────────────────

export interface AIInsight {
  id: string;
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
  severity: "info" | "warning" | "opportunity";
  metric?: string;
  metricDelta?: string;
}

export const aiInsights: AIInsight[] = [
  {
    id: "ai-1",
    title: "Overtime costs up 23% this quarter",
    description: "Engineering and Operations departments are driving 78% of overtime. Consider adjusting staffing levels or schedules.",
    actionLabel: "View Overtime Report",
    actionHref: "/reports/viewer/rpt-28",
    severity: "warning",
    metric: "$18,400",
    metricDelta: "+23%",
  },
  {
    id: "ai-2",
    title: "Benefits cost per employee trending down",
    description: "Employer benefits cost per FTE decreased 4.2% after plan renegotiation. Projected annual savings: $38,000.",
    actionLabel: "View Benefits Cost Analysis",
    actionHref: "/reports/viewer/rpt-22",
    severity: "opportunity",
    metric: "$1,240/mo",
    metricDelta: "-4.2%",
  },
  {
    id: "ai-3",
    title: "Time-to-fill increasing for Engineering roles",
    description: "Average time to fill Engineering positions is now 47 days, up from 32 days last quarter. Review sourcing strategy.",
    actionLabel: "View Time to Fill",
    actionHref: "/reports/viewer/rpt-32",
    severity: "info",
    metric: "47 days",
    metricDelta: "+15 days",
  },
];


// ─── CUSTOM REPORT BUILDER ───────────────────────────────────────────

export type DataSource = "payroll" | "employees" | "time" | "benefits" | "expenses" | "ats";

export interface ReportField {
  id: string;
  name: string;
  dataSource: DataSource;
  group: string;
  type: "text" | "number" | "date" | "currency" | "percentage" | "boolean";
}

export const availableFields: ReportField[] = [
  // Payroll
  { id: "f-1", name: "Employee Name", dataSource: "payroll", group: "Employee Info", type: "text" },
  { id: "f-2", name: "Employee ID", dataSource: "payroll", group: "Employee Info", type: "text" },
  { id: "f-3", name: "Department", dataSource: "payroll", group: "Employee Info", type: "text" },
  { id: "f-4", name: "Job Title", dataSource: "payroll", group: "Employee Info", type: "text" },
  { id: "f-5", name: "Pay Date", dataSource: "payroll", group: "Pay Details", type: "date" },
  { id: "f-6", name: "Pay Period Start", dataSource: "payroll", group: "Pay Details", type: "date" },
  { id: "f-7", name: "Pay Period End", dataSource: "payroll", group: "Pay Details", type: "date" },
  { id: "f-8", name: "Gross Pay", dataSource: "payroll", group: "Pay Details", type: "currency" },
  { id: "f-9", name: "Net Pay", dataSource: "payroll", group: "Pay Details", type: "currency" },
  { id: "f-10", name: "Federal Tax", dataSource: "payroll", group: "Taxes", type: "currency" },
  { id: "f-11", name: "State Tax", dataSource: "payroll", group: "Taxes", type: "currency" },
  { id: "f-12", name: "FICA - SS", dataSource: "payroll", group: "Taxes", type: "currency" },
  { id: "f-13", name: "FICA - Medicare", dataSource: "payroll", group: "Taxes", type: "currency" },
  { id: "f-14", name: "Total Deductions", dataSource: "payroll", group: "Deductions", type: "currency" },
  { id: "f-15", name: "401(k) Deduction", dataSource: "payroll", group: "Deductions", type: "currency" },
  { id: "f-16", name: "Health Insurance", dataSource: "payroll", group: "Deductions", type: "currency" },
  // Employees
  { id: "f-17", name: "Full Name", dataSource: "employees", group: "Personal Info", type: "text" },
  { id: "f-18", name: "Email", dataSource: "employees", group: "Personal Info", type: "text" },
  { id: "f-19", name: "Phone", dataSource: "employees", group: "Personal Info", type: "text" },
  { id: "f-20", name: "Hire Date", dataSource: "employees", group: "Employment", type: "date" },
  { id: "f-21", name: "Termination Date", dataSource: "employees", group: "Employment", type: "date" },
  { id: "f-22", name: "Employment Status", dataSource: "employees", group: "Employment", type: "text" },
  { id: "f-23", name: "Manager", dataSource: "employees", group: "Employment", type: "text" },
  { id: "f-24", name: "Location", dataSource: "employees", group: "Employment", type: "text" },
  { id: "f-25", name: "Annual Salary", dataSource: "employees", group: "Compensation", type: "currency" },
  { id: "f-26", name: "Hourly Rate", dataSource: "employees", group: "Compensation", type: "currency" },
  { id: "f-27", name: "Pay Type", dataSource: "employees", group: "Compensation", type: "text" },
  // Time
  { id: "f-28", name: "Date", dataSource: "time", group: "Time Entry", type: "date" },
  { id: "f-29", name: "Regular Hours", dataSource: "time", group: "Time Entry", type: "number" },
  { id: "f-30", name: "Overtime Hours", dataSource: "time", group: "Time Entry", type: "number" },
  { id: "f-31", name: "Break Duration", dataSource: "time", group: "Time Entry", type: "number" },
  { id: "f-32", name: "Total Hours", dataSource: "time", group: "Time Entry", type: "number" },
  { id: "f-33", name: "PTO Used", dataSource: "time", group: "Leave", type: "number" },
  { id: "f-34", name: "PTO Balance", dataSource: "time", group: "Leave", type: "number" },
  { id: "f-35", name: "Sick Days Used", dataSource: "time", group: "Leave", type: "number" },
  // Benefits
  { id: "f-36", name: "Plan Name", dataSource: "benefits", group: "Enrollment", type: "text" },
  { id: "f-37", name: "Plan Type", dataSource: "benefits", group: "Enrollment", type: "text" },
  { id: "f-38", name: "Coverage Level", dataSource: "benefits", group: "Enrollment", type: "text" },
  { id: "f-39", name: "Employee Premium", dataSource: "benefits", group: "Costs", type: "currency" },
  { id: "f-40", name: "Employer Contribution", dataSource: "benefits", group: "Costs", type: "currency" },
  { id: "f-41", name: "Enrollment Date", dataSource: "benefits", group: "Enrollment", type: "date" },
  // Expenses
  { id: "f-42", name: "Expense Date", dataSource: "expenses", group: "Expense Details", type: "date" },
  { id: "f-43", name: "Category", dataSource: "expenses", group: "Expense Details", type: "text" },
  { id: "f-44", name: "Amount", dataSource: "expenses", group: "Expense Details", type: "currency" },
  { id: "f-45", name: "Vendor", dataSource: "expenses", group: "Expense Details", type: "text" },
  { id: "f-46", name: "Approval Status", dataSource: "expenses", group: "Workflow", type: "text" },
  { id: "f-47", name: "Reimbursement Status", dataSource: "expenses", group: "Workflow", type: "text" },
  // ATS
  { id: "f-48", name: "Candidate Name", dataSource: "ats", group: "Candidate Info", type: "text" },
  { id: "f-49", name: "Position", dataSource: "ats", group: "Candidate Info", type: "text" },
  { id: "f-50", name: "Stage", dataSource: "ats", group: "Pipeline", type: "text" },
  { id: "f-51", name: "Applied Date", dataSource: "ats", group: "Pipeline", type: "date" },
  { id: "f-52", name: "Source", dataSource: "ats", group: "Pipeline", type: "text" },
  { id: "f-53", name: "Recruiter", dataSource: "ats", group: "Pipeline", type: "text" },
];

export const dataSourceLabels: Record<DataSource, string> = {
  payroll: "Payroll",
  employees: "Employees",
  time: "Time & Attendance",
  benefits: "Benefits",
  expenses: "Expenses",
  ats: "ATS / Hiring",
};

export type FilterOperator = "equals" | "not_equals" | "contains" | "greater_than" | "less_than" | "between" | "is_empty" | "is_not_empty";

export const filterOperators: { value: FilterOperator; label: string }[] = [
  { value: "equals", label: "Equals" },
  { value: "not_equals", label: "Does not equal" },
  { value: "contains", label: "Contains" },
  { value: "greater_than", label: "Greater than" },
  { value: "less_than", label: "Less than" },
  { value: "between", label: "Between" },
  { value: "is_empty", label: "Is empty" },
  { value: "is_not_empty", label: "Is not empty" },
];

export type VisualizationType = "table" | "table_bar" | "table_line" | "table_pie";

export const visualizationOptions: { value: VisualizationType; label: string; icon: string }[] = [
  { value: "table", label: "Table Only", icon: "Table" },
  { value: "table_bar", label: "Table + Bar Chart", icon: "BarChart" },
  { value: "table_line", label: "Table + Line Chart", icon: "LineChart" },
  { value: "table_pie", label: "Table + Pie Chart", icon: "PieChart" },
];


// ─── REPORT VIEWER SAMPLE DATA ───────────────────────────────────────

export interface ReportViewerData {
  columns: { key: string; label: string; type: "text" | "currency" | "number" | "date" | "percentage" }[];
  rows: Record<string, string | number>[];
  totalRows: number;
  generatedAt: string;
}

export function generateReportData(reportId: string): ReportViewerData {
  const employees = ["Robert Chen", "Sarah Williams", "David Martinez", "Maria Santos", "Emily Park", "James Liu", "Kevin O'Brien", "Lisa Thompson", "Raj Patel", "Anna Kowalski", "Aisha Johnson", "Michael Brown"];
  const departments = ["Engineering", "HR", "Finance", "Marketing", "Sales", "Operations", "Product", "Legal"];

  // Payroll Register
  if (reportId === "rpt-1" || reportId === "rpt-3") {
    return {
      columns: [
        { key: "employee", label: "Employee", type: "text" },
        { key: "department", label: "Department", type: "text" },
        { key: "grossPay", label: "Gross Pay", type: "currency" },
        { key: "fedTax", label: "Federal Tax", type: "currency" },
        { key: "stateTax", label: "State Tax", type: "currency" },
        { key: "fica", label: "FICA", type: "currency" },
        { key: "deductions", label: "Deductions", type: "currency" },
        { key: "netPay", label: "Net Pay", type: "currency" },
      ],
      rows: employees.map((name, i) => {
        const gross = 3500 + Math.floor(Math.random() * 5000);
        const fed = Math.round(gross * 0.18);
        const state = Math.round(gross * 0.05);
        const fica = Math.round(gross * 0.0765);
        const ded = Math.round(gross * 0.08);
        return { employee: name, department: departments[i % departments.length], grossPay: gross, fedTax: fed, stateTax: state, fica, deductions: ded, netPay: gross - fed - state - fica - ded };
      }),
      totalRows: employees.length,
      generatedAt: new Date().toISOString(),
    };
  }

  // Headcount
  if (reportId === "rpt-9") {
    return {
      columns: [
        { key: "month", label: "Month", type: "text" },
        { key: "startCount", label: "Start Count", type: "number" },
        { key: "hires", label: "Hires", type: "number" },
        { key: "terminations", label: "Terminations", type: "number" },
        { key: "endCount", label: "End Count", type: "number" },
        { key: "growthRate", label: "Growth Rate", type: "percentage" },
      ],
      rows: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((m, i) => {
        const start = 42 + i * 2;
        const hires = Math.floor(Math.random() * 4) + 1;
        const terms = Math.floor(Math.random() * 2);
        const end = start + hires - terms;
        return { month: m, startCount: start, hires, terminations: terms, endCount: end, growthRate: Math.round(((end - start) / start) * 100 * 10) / 10 };
      }),
      totalRows: 6,
      generatedAt: new Date().toISOString(),
    };
  }

  // Default
  return {
    columns: [
      { key: "employee", label: "Employee", type: "text" },
      { key: "department", label: "Department", type: "text" },
      { key: "value", label: "Value", type: "currency" },
      { key: "date", label: "Date", type: "date" },
    ],
    rows: employees.map((name, i) => ({
      employee: name,
      department: departments[i % departments.length],
      value: 1000 + Math.floor(Math.random() * 5000),
      date: `2026-0${(i % 4) + 1}-${10 + i}`,
    })),
    totalRows: employees.length,
    generatedAt: new Date().toISOString(),
  };
}

// Sample data for custom report preview
export function generatePreviewData(fieldIds: string[]): Record<string, string | number>[] {
  const names = ["Robert Chen", "Sarah Williams", "David Martinez", "Maria Santos", "Emily Park"];
  return names.map((name, i) => {
    const row: Record<string, string | number> = {};
    fieldIds.forEach((fid) => {
      const field = availableFields.find((f) => f.id === fid);
      if (!field) return;
      if (field.type === "text") row[field.name] = field.name.includes("Name") ? name : field.name.includes("Department") ? ["Engineering", "HR", "Finance", "Marketing", "Sales"][i] : `Sample ${field.name}`;
      else if (field.type === "currency") row[field.name] = 1000 + Math.floor(Math.random() * 8000);
      else if (field.type === "number") row[field.name] = Math.floor(Math.random() * 50);
      else if (field.type === "date") row[field.name] = `2026-0${(i % 4) + 1}-${10 + i}`;
      else if (field.type === "percentage") row[field.name] = Math.floor(Math.random() * 100);
      else if (field.type === "boolean") row[field.name] = i % 2 === 0 ? "Yes" : "No";
    });
    return row;
  });
}

// Saved custom reports
export interface SavedCustomReport {
  id: string;
  name: string;
  description: string;
  dataSource: DataSource;
  fields: string[];
  visibility: "private" | "team" | "org";
  createdBy: string;
  createdAt: string;
  lastRun?: string;
}

export const savedCustomReports: SavedCustomReport[] = [
  { id: "cr-1", name: "Dept Cost Center Allocation", description: "Employee labor costs by cost center per pay period.", dataSource: "payroll", fields: ["f-1", "f-3", "f-8", "f-9"], visibility: "team", createdBy: "Sarah Williams", createdAt: "2026-02-15", lastRun: "2026-04-01" },
  { id: "cr-2", name: "Grant Hours Report", description: "Hours billed to specific grant codes.", dataSource: "time", fields: ["f-17", "f-28", "f-29", "f-32"], visibility: "private", createdBy: "Michael Brown", createdAt: "2026-03-10", lastRun: "2026-03-28" },
];
