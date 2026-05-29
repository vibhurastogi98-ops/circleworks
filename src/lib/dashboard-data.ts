import {
  employees,
  getEmployeeName,
  getHeadcountEmployees,
  getMonthlyGrossPayroll,
} from "@/lib/hris-module-data";

export type PayrollStatus = "NONE" | "DRAFT" | "PENDING" | "PROCESSING";

export type DashboardKpi = {
  id: "headcount" | "monthlyGross" | "taxLiability" | "openPositions";
  label: string;
  value: string;
  detail: string;
  delta: string;
  tone: "blue" | "emerald" | "amber" | "violet";
  href: string;
};

export type DashboardActivityType =
  | "payroll.run.completed"
  | "employee.hired"
  | "employee.terminated"
  | "benefit.enrolled"
  | "time.approved"
  | "compliance.alert"
  | "expense.approved";

export type DashboardActivity = {
  id: string;
  type: DashboardActivityType;
  description: string;
  actor: string;
  timeAgo: string;
  timestamp: string;
};

export type DashboardOverview = {
  companyId: string;
  kpis: DashboardKpi[];
  activePayrollRun: {
    status: PayrollStatus;
    period: string;
    payDate: string;
    employeeCount: number;
    estimatedGross: number;
    progress: number;
  };
  nextPayroll: {
    date: string;
    employeeCount: number;
    estimatedGross: number;
  };
  quickModules: Array<{
    id: string;
    title: string;
    primary: string;
    secondary: string;
    href: string;
    actionLabel: string;
    tone: "blue" | "emerald" | "amber" | "violet" | "rose" | "cyan";
  }>;
  activity: DashboardActivity[];
  alerts: {
    compliance: Array<{ id: string; title: string; detail: string; severity: "critical" | "warning" }>;
    missingDocuments: Array<{ id: string; title: string; detail: string }>;
  };
};

export type PayrollTrendPoint = {
  month: string;
  gross: number;
};

export type HeadcountBreakdownPoint = {
  name: "Full-time" | "Part-time" | "Contractor";
  value: number;
};

const monthlyGrossPayroll = getMonthlyGrossPayroll();
const headcountEmployees = getHeadcountEmployees();
const payrollTrendFactors = [0.82, 0.84, 0.86, 0.88, 0.9, 0.93, 0.95, 0.96, 0.98, 1, 1.01, 1];

const payrollTrend: PayrollTrendPoint[] = [
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
].map((month, index) => ({
  month,
  gross: Math.round(monthlyGrossPayroll * payrollTrendFactors[index]),
}));

const headcountBreakdown: HeadcountBreakdownPoint[] = [
  { name: "Full-time", value: headcountEmployees.filter((employee) => employee.employmentType === "Full-time").length },
  { name: "Part-time", value: headcountEmployees.filter((employee) => employee.employmentType === "Part-time").length },
  { name: "Contractor", value: headcountEmployees.filter((employee) => employee.employmentType === "Contractor").length },
];

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function getPayrollTrend(months = 12) {
  return payrollTrend.slice(Math.max(0, payrollTrend.length - months));
}

export function getHeadcountBreakdown() {
  return headcountBreakdown;
}

export function getDashboardOverview(companyId: string): DashboardOverview {
  const headcount = headcountEmployees.length;
  const monthlyGross = monthlyGrossPayroll;
  const previousMonthlyGross = payrollTrend[payrollTrend.length - 2]?.gross || monthlyGross;
  const monthlyDelta = previousMonthlyGross
    ? `${(((monthlyGross - previousMonthlyGross) / previousMonthlyGross) * 100).toFixed(1)}% vs last month`
    : "Current month";
  const quarterlyTaxLiability = Math.round(monthlyGross * 0.6);
  const hourlyEmployees = employees.filter((employee) => employee.payType === "Hourly");
  const onboardingEmployees = employees.filter((employee) => employee.status === "Onboarding");
  const missingDocumentCount = onboardingEmployees.length + 1;

  return {
    companyId,
    kpis: [
      {
        id: "headcount",
        label: "Active Employees",
        value: String(headcount),
        detail: "Active Employees",
        delta: `${onboardingEmployees.length} onboarding`,
        tone: "blue",
        href: "/employees",
      },
      {
        id: "monthlyGross",
        label: "Monthly Gross Payroll",
        value: money(monthlyGross),
        detail: "Monthly Gross Payroll",
        delta: monthlyDelta,
        tone: "emerald",
        href: "/payroll/history",
      },
      {
        id: "taxLiability",
        label: "Quarterly Tax Liability",
        value: money(quarterlyTaxLiability),
        detail: "Quarterly Tax Liability",
        delta: "Next filing: June 15",
        tone: "amber",
        href: "/compliance",
      },
      {
        id: "openPositions",
        label: "Active Requisitions",
        value: "7",
        detail: "Active Requisitions",
        delta: "3 offers pending",
        tone: "violet",
        href: "/hiring",
      },
    ],
    activePayrollRun: {
      status: "DRAFT",
      period: "May 16-31, 2026",
      payDate: "June 5, 2026",
      employeeCount: headcount,
      estimatedGross: monthlyGross,
      progress: 54,
    },
    nextPayroll: {
      date: "June 5, 2026",
      employeeCount: headcount,
      estimatedGross: monthlyGross,
    },
    quickModules: [
      {
        id: "time",
        title: "Time & Attendance",
        primary: `${Math.max(1, headcount - 3)} employees clocked in now`,
        secondary: `${hourlyEmployees.length} pending approvals`,
        href: "/time",
        actionLabel: "View Time",
        tone: "blue",
      },
      {
        id: "benefits",
        title: "Benefits",
        primary: "Open enrollment: June 1",
        secondary: `${missingDocumentCount} employees not enrolled`,
        href: "/benefits",
        actionLabel: "Manage",
        tone: "emerald",
      },
      {
        id: "hiring",
        title: "Hiring",
        primary: "7 active jobs",
        secondary: "19 new applications today",
        href: "/hiring",
        actionLabel: "Review",
        tone: "violet",
      },
      {
        id: "compliance",
        title: "Compliance",
        primary: "2 Alerts",
        secondary: "Next deadline: June 15",
        href: "/compliance",
        actionLabel: "View",
        tone: "amber",
      },
      {
        id: "expenses",
        title: "Expenses",
        primary: "16 pending approvals",
        secondary: "$18,420 pending",
        href: "/expenses",
        actionLabel: "Review",
        tone: "rose",
      },
      {
        id: "onboarding",
        title: "Onboarding",
        primary: `${onboardingEmployees.length} pre-hire this week`,
        secondary: `${onboardingEmployees.length * 5} tasks pending`,
        href: "/onboarding",
        actionLabel: "View",
        tone: "cyan",
      },
    ],
    activity: [
      {
        id: "act-1",
        type: "payroll.run.completed",
        description: "Payroll run completed for May 1-15",
        actor: "Maya Patel",
        timeAgo: "8m ago",
        timestamp: "2026-05-29T08:22:00.000Z",
      },
      {
        id: "act-2",
        type: "employee.hired",
        description: `${getEmployeeName(employees[4])} was hired as ${employees[4].title}`,
        actor: getEmployeeName(employees[0]),
        timeAgo: "22m ago",
        timestamp: "2026-05-29T08:08:00.000Z",
      },
      {
        id: "act-3",
        type: "benefit.enrolled",
        description: `${getEmployeeName(employees[1])} enrolled in medical benefits`,
        actor: "Benefits Admin",
        timeAgo: "41m ago",
        timestamp: "2026-05-29T07:49:00.000Z",
      },
      {
        id: "act-4",
        type: "time.approved",
        description: `${hourlyEmployees.length} time cards approved for hourly team`,
        actor: getEmployeeName(employees[5]),
        timeAgo: "1h ago",
        timestamp: "2026-05-29T07:10:00.000Z",
      },
      {
        id: "act-5",
        type: "compliance.alert",
        description: "California meal break exception flagged",
        actor: "CircleWorks Compliance",
        timeAgo: "2h ago",
        timestamp: "2026-05-29T06:18:00.000Z",
      },
      {
        id: "act-6",
        type: "expense.approved",
        description: "$1,284 travel expense approved",
        actor: getEmployeeName(employees[3]),
        timeAgo: "3h ago",
        timestamp: "2026-05-29T05:32:00.000Z",
      },
      {
        id: "act-7",
        type: "employee.terminated",
        description: `Final pay workflow opened for ${getEmployeeName(employees[5])}`,
        actor: "People Ops",
        timeAgo: "Yesterday",
        timestamp: "2026-05-28T20:32:00.000Z",
      },
    ],
    alerts: {
      compliance: [
        {
          id: "ca-meal-break",
          title: "California meal break exception",
          detail: "3 employees have unresolved meal break attestations.",
          severity: "critical",
        },
        {
          id: "941-filing",
          title: "941 filing due soon",
          detail: "Quarterly tax filing package needs approval by June 15.",
          severity: "warning",
        },
      ],
      missingDocuments: [
        {
          id: "missing-i9",
          title: `${missingDocumentCount} employees missing I-9 verification`,
          detail: "Complete section 2 before the payroll approval checkpoint.",
        },
        {
          id: "missing-w4",
          title: `${onboardingEmployees.length} employee missing W-4 forms`,
          detail: "Federal withholding setup is incomplete for new hires.",
        },
      ],
    },
  };
}
