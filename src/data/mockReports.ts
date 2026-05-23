// ─── REPORT CATEGORIES & STANDARD REPORTS ────────────────────────────

export type ReportCategory =
  | "Payroll"
  | "HRIS"
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
  columns?: ReportColumn[];
  exportableFormats?: string[];
  dateRangeFilter?: boolean;
}

export interface ReportColumn {
  key: string;
  label: string;
  type: "text" | "currency" | "number" | "date" | "percentage";
  sortable: boolean;
}

const standardExports = ["CSV", "PDF", "Excel"];

const col = (
  key: string,
  label: string,
  type: ReportColumn["type"] = "text",
  sortable = true,
): ReportColumn => ({ key, label, type, sortable });

const standardReport = (report: StandardReport): StandardReport => ({
  exportableFormats: standardExports,
  dateRangeFilter: true,
  ...report,
});

export const standardReports: StandardReport[] = [
  // Payroll
  standardReport({
    id: "rpt-1",
    name: "Payroll Summary",
    description: "Period totals for gross pay, taxes, net pay, and department split.",
    category: "Payroll",
    icon: "BarChart2",
    popular: true,
    columns: [
      col("period", "Period"),
      col("totalGross", "Total Gross", "currency"),
      col("taxes", "Taxes", "currency"),
      col("netPay", "Net Pay", "currency"),
      col("deptSplit", "Dept Split"),
    ],
  }),
  standardReport({
    id: "rpt-2",
    name: "Payroll Detail",
    description: "Per-employee report for all earnings, deductions, taxes, and net pay.",
    category: "Payroll",
    icon: "DollarSign",
    popular: true,
    columns: [
      col("employee", "Employee"),
      col("regularEarnings", "Regular Earnings", "currency"),
      col("overtimeEarnings", "Overtime Earnings", "currency"),
      col("bonusEarnings", "Bonus Earnings", "currency"),
      col("preTaxDeductions", "Pre-Tax Deductions", "currency"),
      col("postTaxDeductions", "Post-Tax Deductions", "currency"),
      col("taxes", "Taxes", "currency"),
      col("netPay", "Net Pay", "currency"),
    ],
  }),
  standardReport({
    id: "rpt-3",
    name: "Tax Liability",
    description: "Payroll taxes by type, including FICA, FUTA, SUTA, federal, and state.",
    category: "Payroll",
    icon: "Landmark",
    columns: [
      col("taxType", "Tax Type"),
      col("jurisdiction", "Jurisdiction"),
      col("employeeTax", "Employee Tax", "currency"),
      col("employerTax", "Employer Tax", "currency"),
      col("totalLiability", "Total Liability", "currency"),
      col("dueDate", "Due Date", "date"),
    ],
  }),
  standardReport({
    id: "rpt-4",
    name: "GL Journal",
    description: "Accounting-system mapping for payroll GL sync.",
    category: "Payroll",
    icon: "BookOpen",
    columns: [
      col("glAccount", "GL Account"),
      col("accountName", "Account Name"),
      col("department", "Department"),
      col("debit", "Debit", "currency"),
      col("credit", "Credit", "currency"),
      col("payrollRun", "Payroll Run"),
      col("syncStatus", "Sync Status"),
    ],
  }),
  standardReport({
    id: "rpt-5",
    name: "Year-to-Date Earnings",
    description: "Employee x month x YTD cumulative earnings.",
    category: "Payroll",
    icon: "DollarSign",
    columns: [
      col("employee", "Employee"),
      col("month", "Month"),
      col("grossYtd", "Gross YTD", "currency"),
      col("taxYtd", "Tax YTD", "currency"),
      col("deductionYtd", "Deduction YTD", "currency"),
      col("netYtd", "Net YTD", "currency"),
    ],
  }),
  standardReport({
    id: "rpt-6",
    name: "New Hires Report",
    description: "All new hires in period for state new-hire reporting.",
    category: "Payroll",
    icon: "UserPlus",
    columns: [
      col("employee", "Employee"),
      col("hireDate", "Hire Date", "date"),
      col("state", "State"),
      col("department", "Department"),
      col("jobTitle", "Job Title"),
      col("manager", "Manager"),
      col("reportingStatus", "Reporting Status"),
    ],
  }),
  standardReport({
    id: "rpt-7",
    name: "Terminated Employees",
    description: "Terminations with final pay dates and final pay amounts.",
    category: "Payroll",
    icon: "UserMinus",
    columns: [
      col("employee", "Employee"),
      col("terminationDate", "Termination Date", "date"),
      col("reason", "Reason"),
      col("finalPayDate", "Final Pay Date", "date"),
      col("finalGross", "Final Gross", "currency"),
      col("finalNet", "Final Net", "currency"),
    ],
  }),

  // HRIS
  standardReport({
    id: "rpt-8",
    name: "Headcount",
    description: "Headcount by department, location, and employment type as of date.",
    category: "HRIS",
    icon: "Users",
    popular: true,
    columns: [
      col("asOfDate", "As Of Date", "date"),
      col("department", "Department"),
      col("location", "Location"),
      col("employmentType", "Employment Type"),
      col("headcount", "Headcount", "number"),
    ],
  }),
  standardReport({
    id: "rpt-9",
    name: "Turnover",
    description: "Attrition rate by department and period.",
    category: "HRIS",
    icon: "TrendingDown",
    columns: [
      col("period", "Period"),
      col("department", "Department"),
      col("startingHeadcount", "Starting Headcount", "number"),
      col("terminations", "Terminations", "number"),
      col("endingHeadcount", "Ending Headcount", "number"),
      col("attritionRate", "Attrition Rate", "percentage"),
    ],
  }),
  standardReport({
    id: "rpt-10",
    name: "Birthday/Anniversary List",
    description: "Upcoming birthdays and anniversaries in the next 30, 60, or 90 days.",
    category: "HRIS",
    icon: "Cake",
    columns: [
      col("employee", "Employee"),
      col("eventType", "Event Type"),
      col("eventDate", "Event Date", "date"),
      col("daysAway", "Days Away", "number"),
      col("department", "Department"),
      col("manager", "Manager"),
    ],
  }),
  standardReport({
    id: "rpt-11",
    name: "Org Chart Export",
    description: "Downloadable PNG/PDF org chart with employee, manager, and role data.",
    category: "HRIS",
    icon: "Users",
    exportableFormats: ["CSV", "PDF", "Excel", "PNG"],
    columns: [
      col("employee", "Employee"),
      col("manager", "Manager"),
      col("department", "Department"),
      col("jobTitle", "Job Title"),
      col("location", "Location"),
    ],
  }),
  standardReport({
    id: "rpt-12",
    name: "Demographics",
    description: "EEO-1 categories for EEO filing.",
    category: "HRIS",
    icon: "PieChart",
    columns: [
      col("eeoCategory", "EEO-1 Category"),
      col("raceEthnicity", "Race/Ethnicity"),
      col("gender", "Gender"),
      col("department", "Department"),
      col("location", "Location"),
      col("employeeCount", "Employee Count", "number"),
    ],
  }),
  // Tax & Compliance
  standardReport({ id: "rpt-15", name: "941 Quarterly Summary", description: "Quarterly federal tax return preparation summary.", category: "Tax & Compliance", icon: "FileCheck" }),
  standardReport({ id: "rpt-16", name: "State Tax Summary", description: "State-level withholding and unemployment tax summary.", category: "Tax & Compliance", icon: "Globe" }),
  standardReport({ id: "rpt-17", name: "W-2 Preview", description: "Preview W-2 data before year-end filing.", category: "Tax & Compliance", icon: "FileText" }),
  standardReport({ id: "rpt-18", name: "I-9 Audit Report", description: "I-9 compliance status for all employees with expiry tracking.", category: "Tax & Compliance", icon: "ShieldCheck" }),
  standardReport({ id: "rpt-19", name: "EEO-1 Summary", description: "Equal employment opportunity report data by category.", category: "Tax & Compliance", icon: "PieChart" }),
  standardReport({ id: "rpt-20", name: "ACA Eligibility", description: "ACA full-time equivalent tracking and coverage status.", category: "Tax & Compliance", icon: "HeartPulse" }),
  standardReport({ id: "rpt-20b", name: "Certified Payroll (Davis-Bacon)", description: "WH-347 prevailing wage compliance reporting for government contracts.", category: "Tax & Compliance", icon: "Shield" }),
  // Benefits
  standardReport({
    id: "rpt-21",
    name: "Benefits Enrollment",
    description: "Plan x enrolled/waived status per employee.",
    category: "Benefits",
    icon: "Heart",
    popular: true,
    columns: [
      col("employee", "Employee"),
      col("plan", "Plan"),
      col("planType", "Plan Type"),
      col("enrollmentStatus", "Enrolled/Waived"),
      col("coverageTier", "Coverage Tier"),
      col("effectiveDate", "Effective Date", "date"),
    ],
  }),
  standardReport({
    id: "rpt-22",
    name: "Benefits Cost",
    description: "Employer vs employee share per plan.",
    category: "Benefits",
    icon: "DollarSign",
    columns: [
      col("plan", "Plan"),
      col("planType", "Plan Type"),
      col("enrolledEmployees", "Enrolled Employees", "number"),
      col("employerShare", "Employer Share", "currency"),
      col("employeeShare", "Employee Share", "currency"),
      col("totalCost", "Total Cost", "currency"),
    ],
  }),
  standardReport({
    id: "rpt-24",
    name: "COBRA Enrollments",
    description: "Active COBRA participants and enrollment status.",
    category: "Benefits",
    icon: "Shield",
    columns: [
      col("participant", "Participant"),
      col("qualifyingEvent", "Qualifying Event"),
      col("coverageStart", "Coverage Start", "date"),
      col("coverageEnd", "Coverage End", "date"),
      col("status", "Status"),
      col("monthlyPremium", "Monthly Premium", "currency"),
    ],
  }),
  standardReport({ id: "rpt-23", name: "401(k) Contributions", description: "Employee and employer 401(k) contribution details.", category: "Benefits", icon: "PiggyBank" }),
  standardReport({ id: "rpt-25", name: "FSA/HSA Balances", description: "Current FSA and HSA balance details per employee.", category: "Benefits", icon: "Wallet" }),
  // Time & Attendance
  standardReport({
    id: "rpt-26",
    name: "Timesheet Summary",
    description: "Hours per employee per period.",
    category: "Time & Attendance",
    icon: "Clock",
    popular: true,
    columns: [
      col("employee", "Employee"),
      col("period", "Period"),
      col("regularHours", "Regular Hours", "number"),
      col("overtimeHours", "Overtime Hours", "number"),
      col("ptoHours", "PTO Hours", "number"),
      col("totalHours", "Total Hours", "number"),
    ],
  }),
  standardReport({
    id: "rpt-28",
    name: "Overtime",
    description: "Employees with OT hours and dollar cost.",
    category: "Time & Attendance",
    icon: "AlertTriangle",
    columns: [
      col("employee", "Employee"),
      col("department", "Department"),
      col("period", "Period"),
      col("overtimeHours", "OT Hours", "number"),
      col("overtimeRate", "OT Rate", "currency"),
      col("overtimeCost", "OT Dollar Cost", "currency"),
    ],
  }),
  standardReport({
    id: "rpt-27",
    name: "PTO Liability",
    description: "Accrued balance x hourly rate = dollar liability.",
    category: "Time & Attendance",
    icon: "CalendarDays",
    columns: [
      col("employee", "Employee"),
      col("department", "Department"),
      col("accruedBalance", "Accrued Balance", "number"),
      col("hourlyRate", "Hourly Rate", "currency"),
      col("dollarLiability", "Dollar Liability", "currency"),
    ],
  }),
  standardReport({ id: "rpt-29", name: "Attendance Summary", description: "Absences, tardiness, and patterns by employee.", category: "Time & Attendance", icon: "CalendarX" }),
  standardReport({ id: "rpt-30", name: "Schedule Variance", description: "Actual vs scheduled hours comparison.", category: "Time & Attendance", icon: "GitCompare" }),
  // Hiring
  standardReport({ id: "rpt-31", name: "Applicant Pipeline", description: "Candidates by stage — applied, screened, interviewed, offered.", category: "Hiring", icon: "Briefcase" }),
  standardReport({ id: "rpt-32", name: "Time to Fill", description: "Average days to fill open positions by department.", category: "Hiring", icon: "Clock" }),
  standardReport({ id: "rpt-33", name: "Source Effectiveness", description: "Hire source breakdown — job boards, referrals, direct.", category: "Hiring", icon: "Target" }),
  standardReport({ id: "rpt-34", name: "Offer Acceptance Rate", description: "Offer-to-acceptance conversion rates over time.", category: "Hiring", icon: "CheckCircle" }),
  standardReport({ id: "rpt-35", name: "Onboarding Status", description: "New hire onboarding task completion tracking.", category: "Hiring", icon: "ClipboardCheck" }),
  // Expenses
  standardReport({ id: "rpt-36", name: "Expense Summary", description: "Total expenses by category, department, and employee.", category: "Expenses", icon: "Receipt", popular: true }),
  standardReport({ id: "rpt-37", name: "Mileage Report", description: "Mileage logs and reimbursement amounts.", category: "Expenses", icon: "Car" }),
  standardReport({ id: "rpt-38", name: "Policy Violations", description: "Expense submissions flagged for policy violations.", category: "Expenses", icon: "AlertCircle" }),
  standardReport({ id: "rpt-39", name: "Vendor Spending", description: "Top vendors and spending patterns over time.", category: "Expenses", icon: "Building" }),
  standardReport({ id: "rpt-40", name: "Per Diem Report", description: "Per diem allocations and usage by employee.", category: "Expenses", icon: "CalendarDays" }),
  // Custom
  standardReport({ id: "rpt-41", name: "Custom: Dept Cost Center", description: "Employee costs allocated by cost center — custom build.", category: "Custom", icon: "Settings" }),
  standardReport({ id: "rpt-42", name: "Custom: Grant Allocation", description: "Hours and costs allocated to specific grants.", category: "Custom", icon: "Settings" }),
];

export const reportCategories: ReportCategory[] = [
  "Payroll",
  "HRIS",
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
  { id: "sr-1", reportName: "Payroll Summary", reportId: "rpt-1", frequency: "biweekly", recipients: ["sarah@company.com", "cfo@company.com"], format: "pdf", lastRun: "2026-03-28", nextRun: "2026-04-11", active: true },
  { id: "sr-2", reportName: "Headcount", reportId: "rpt-8", frequency: "monthly", recipients: ["hr@company.com"], format: "excel", lastRun: "2026-04-01", nextRun: "2026-05-01", active: true },
  { id: "sr-3", reportName: "Overtime", reportId: "rpt-28", frequency: "weekly", recipients: ["ops@company.com", "hr@company.com"], format: "csv", lastRun: "2026-04-04", nextRun: "2026-04-11", active: true },
  { id: "sr-4", reportName: "Expense Summary", reportId: "rpt-36", frequency: "monthly", recipients: ["finance@company.com"], format: "pdf", lastRun: "2026-04-01", nextRun: "2026-05-01", active: false },
  { id: "sr-5", reportName: "PTO Liability", reportId: "rpt-27", frequency: "quarterly", recipients: ["hr@company.com", "managers@company.com"], format: "excel", lastRun: "2026-01-01", nextRun: "2026-04-01", active: true },
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
    actionLabel: "View Overtime",
    actionHref: "/reports/viewer/rpt-28",
    severity: "warning",
    metric: "$18,400",
    metricDelta: "+23%",
  },
  {
    id: "ai-2",
    title: "Benefits cost per employee trending down",
    description: "Employer benefits cost per FTE decreased 4.2% after plan renegotiation. Projected annual savings: $38,000.",
    actionLabel: "View Benefits Cost",
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
  columns: ReportColumn[];
  rows: Record<string, string | number>[];
  totalRows: number;
  generatedAt: string;
}

export function generateReportData(reportId: string): ReportViewerData {
  const employees = ["Robert Chen", "Sarah Williams", "David Martinez", "Maria Santos", "Emily Park", "James Liu", "Kevin O'Brien", "Lisa Thompson", "Raj Patel", "Anna Kowalski", "Aisha Johnson", "Michael Brown"];
  const departments = ["Engineering", "HR", "Finance", "Marketing", "Sales", "Operations", "Product", "Legal"];
  const locations = ["Austin", "Denver", "New York", "Remote", "San Francisco"];
  const report = standardReports.find((r) => r.id === reportId);

  if (report?.columns?.length) {
    const sampleNames =
      reportId === "rpt-36"
        ? Array.from({ length: 120 }, (_, index) => employees[index % employees.length])
        : employees;
    const rows = sampleNames.map((name, i) => {
      const baseGross = 4200 + i * 375;
      const regular = 3600 + i * 240;
      const overtimeHours = (i % 4) * 2.5;
      const overtimeRate = 42 + i;
      const accruedBalance = 32 + i * 3;
      const hourlyRate = 28 + i * 2;
      const rowValues: Record<string, string | number> = {
        employee: name,
        participant: name,
        period: i % 2 === 0 ? "Apr 1-15, 2026" : "Apr 16-30, 2026",
        totalGross: baseGross * 8,
        grossYtd: baseGross * (i + 3),
        taxes: Math.round(baseGross * 0.24),
        taxYtd: Math.round(baseGross * (i + 3) * 0.24),
        deductionYtd: Math.round(baseGross * (i + 3) * 0.08),
        netYtd: Math.round(baseGross * (i + 3) * 0.68),
        netPay: Math.round(baseGross * 0.68),
        deptSplit: `${departments[i % departments.length]} ${55 + (i % 4) * 10}%`,
        regularEarnings: regular,
        overtimeEarnings: Math.round(overtimeHours * overtimeRate),
        bonusEarnings: i % 3 === 0 ? 750 : 0,
        preTaxDeductions: Math.round(baseGross * 0.05),
        postTaxDeductions: Math.round(baseGross * 0.03),
        taxType: ["FICA", "FUTA", "SUTA", "Federal", "State"][i % 5],
        jurisdiction: ["Federal", "CA", "NY", "TX", "CO"][i % 5],
        employeeTax: Math.round(baseGross * 0.13),
        employerTax: Math.round(baseGross * 0.09),
        totalLiability: Math.round(baseGross * 0.22),
        dueDate: `2026-05-${String(10 + (i % 10)).padStart(2, "0")}`,
        glAccount: `${6000 + i * 10}`,
        accountName: ["Wages Expense", "Payroll Taxes", "Benefits Payable", "Cash Clearing"][i % 4],
        department: departments[i % departments.length],
        debit: i % 2 === 0 ? baseGross : 0,
        credit: i % 2 === 0 ? 0 : baseGross,
        payrollRun: `PR-2026-${String(i + 1).padStart(3, "0")}`,
        syncStatus: i % 3 === 0 ? "Ready" : "Mapped",
        month: ["January", "February", "March", "April", "May", "June"][i % 6],
        hireDate: `2026-0${(i % 4) + 1}-${String(8 + i).padStart(2, "0")}`,
        state: ["CA", "NY", "TX", "CO", "WA"][i % 5],
        jobTitle: ["Engineer", "HR Partner", "Analyst", "Manager", "Sales Rep"][i % 5],
        manager: employees[(i + 2) % employees.length],
        reportingStatus: i % 3 === 0 ? "Filed" : "Due",
        terminationDate: `2026-0${(i % 4) + 1}-${String(12 + i).padStart(2, "0")}`,
        reason: ["Voluntary", "Involuntary", "End of contract"][i % 3],
        finalPayDate: `2026-0${(i % 4) + 1}-${String(15 + i).padStart(2, "0")}`,
        finalGross: baseGross,
        finalNet: Math.round(baseGross * 0.7),
        asOfDate: "2026-05-23",
        location: locations[i % locations.length],
        employmentType: ["Full-time", "Part-time", "Contractor"][i % 3],
        headcount: 8 + i * 2,
        startingHeadcount: 42 + i * 3,
        terminations: i % 4,
        endingHeadcount: 44 + i * 3,
        attritionRate: Math.round(((i % 4) / (42 + i * 3)) * 1000) / 10,
        eventType: i % 2 === 0 ? "Birthday" : "Anniversary",
        eventDate: `2026-06-${String(1 + i).padStart(2, "0")}`,
        daysAway: 7 + i * 4,
        eeoCategory: ["Professionals", "Managers", "Technicians", "Sales Workers"][i % 4],
        raceEthnicity: ["Hispanic or Latino", "Asian", "White", "Black or African American"][i % 4],
        gender: i % 2 === 0 ? "Female" : "Male",
        employeeCount: 4 + i,
        plan: ["Blue Choice PPO", "Dental Plus", "Vision Select", "Life Basic"][i % 4],
        planType: ["Medical", "Dental", "Vision", "Life"][i % 4],
        enrollmentStatus: i % 4 === 0 ? "Waived" : "Enrolled",
        coverageTier: ["Employee", "Employee + Spouse", "Family"][i % 3],
        effectiveDate: `2026-01-${String(1 + (i % 9)).padStart(2, "0")}`,
        enrolledEmployees: 12 + i,
        employerShare: 650 + i * 35,
        employeeShare: 180 + i * 15,
        totalCost: 830 + i * 50,
        qualifyingEvent: ["Termination", "Reduction in hours", "Divorce"][i % 3],
        coverageStart: `2026-0${(i % 4) + 1}-01`,
        coverageEnd: `2026-1${i % 2}-30`,
        status: i % 3 === 0 ? "Pending" : "Active",
        monthlyPremium: 720 + i * 28,
        regularHours: 72 + (i % 3) * 4,
        overtimeHours,
        ptoHours: i % 3 === 0 ? 8 : 0,
        totalHours: 72 + (i % 3) * 4 + overtimeHours,
        overtimeRate,
        overtimeCost: Math.round(overtimeHours * overtimeRate),
        accruedBalance,
        hourlyRate,
        dollarLiability: Math.round(accruedBalance * hourlyRate),
      };

      return report.columns!.reduce<Record<string, string | number>>((row, column) => {
        row[column.key] = rowValues[column.key] ?? fallbackValueForColumn(column, i);
        return row;
      }, {});
    });

    return {
      columns: report.columns,
      rows,
      totalRows: reportId === "rpt-36" ? 12540 : rows.length,
      generatedAt: new Date().toISOString(),
    };
  }

  // Payroll Register
  if (reportId === "rpt-1" || reportId === "rpt-3") {
    return {
      columns: [
        col("employee", "Employee"),
        col("department", "Department"),
        col("grossPay", "Gross Pay", "currency"),
        col("fedTax", "Federal Tax", "currency"),
        col("stateTax", "State Tax", "currency"),
        col("fica", "FICA", "currency"),
        col("deductions", "Deductions", "currency"),
        col("netPay", "Net Pay", "currency"),
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
        col("month", "Month"),
        col("startCount", "Start Count", "number"),
        col("hires", "Hires", "number"),
        col("terminations", "Terminations", "number"),
        col("endCount", "End Count", "number"),
        col("growthRate", "Growth Rate", "percentage"),
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
      col("employee", "Employee"),
      col("department", "Department"),
      col("value", "Value", "currency"),
      col("date", "Date", "date"),
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

function fallbackValueForColumn(column: ReportColumn, index: number): string | number {
  if (column.type === "currency") return 1000 + index * 275;
  if (column.type === "number") return 10 + index;
  if (column.type === "percentage") return Math.round((4.5 + index * 0.7) * 10) / 10;
  if (column.type === "date") return `2026-05-${String(1 + index).padStart(2, "0")}`;
  return `Sample ${column.label}`;
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
