import {
  getEmployeeName,
  getHeadcountEmployees,
  getMonthlyGrossPayroll,
} from "@/lib/hris-module-data";
import { getOutstandingEwaAdvances } from "@/data/mockEwa";
import {
  calculateEwaAvailability,
  getEwaProvider,
  type EwaProviderConfig,
} from "@/lib/ewa/providers";

export type PayrollRunStatus = "Draft" | "Pending" | "Processing" | "Paid" | "Failed";
export type PayrollLineStatus = "Verified" | "Flagged" | "Error";
export type PayType = "Salary" | "Hourly" | "Contractor";
export type WorkerType = "Employee" | "Contractor";
export type PayrollScheduleFrequency = "Weekly" | "Biweekly" | "Semi-monthly";

export type PayrollRunSummary = {
  id: string;
  payPeriod: string;
  checkDate: string;
  employees: number;
  gross: number;
  taxes: number;
  net: number;
  status: PayrollRunStatus;
  type: "Regular" | "Off-cycle" | "Contractor";
};

export type PayrollEmployeeLine = {
  id: string;
  name: string;
  title: string;
  department: string;
  workerType: WorkerType;
  scheduleId: string;
  scheduleName: string;
  scheduleFrequency: PayrollScheduleFrequency;
  checkDate: string;
  payType: PayType;
  taxForm: "W-2" | "1099-NEC";
  contractorCompany?: string;
  hours: number;
  grossPay: number;
  deductions: number;
  netPay: number;
  status: PayrollLineStatus;
  issue?: string;
  taxes: {
    federalIT: number;
    ficaSS: number;
    ficaMed: number;
    stateIT: number;
    localIT: number;
  };
};

export type PayrollRunScheduleSummary = {
  id: string;
  name: string;
  frequency: PayrollScheduleFrequency;
  checkDate: string;
  workerCount: number;
  employeeGross: number;
  contractorGross: number;
  totalGross: number;
};

export type PayrollApprover = {
  id: string;
  name: string;
  role: string;
  status: "Required" | "Sent" | "Approved";
};

export type PayrollAutoPilotSchedule = {
  id: string;
  name: string;
  frequency: string;
  enabled: boolean;
  status: "On" | "Paused" | "Off";
  nextRunDate: string;
  nextRunLabel: string;
  autoSubmitDate: string;
  autoSubmitInDays: number;
  notificationWindowHours: number;
  reminderStatus: "Queued" | "Sent" | "Not scheduled";
  lastRunId: string;
  lastRunConfig: string;
  reviewHref: string;
  pauseHref: string;
};

export type PayrollAutoPilotBanner = {
  enabled: boolean;
  scheduleId: string;
  scheduleName: string;
  nextRunLabel: string;
  autoSubmitInDays: number;
  notificationWindowHours: number;
  lastRunId: string;
  lastRunConfig: string;
  reviewHref: string;
  pauseHref: string;
};

export type PayrollAuditTrailEntry = {
  time: string;
  actor: string;
  action: string;
};

export type PayrollHubData = {
  kpis: Array<{ label: string; value: string; detail: string; href?: string }>;
  quickLinks: Array<{ label: string; href: string; detail: string }>;
  activeRuns: PayrollRunSummary[];
  autoPilot: PayrollAutoPilotBanner | null;
};

export type PayrollRunData = {
  runId: string;
  payPeriod: string;
  checkDate: string;
  status: PayrollRunStatus;
  totals: {
    gross: number;
    taxes: number;
    net: number;
    employerCost: number;
    employeeGross: number;
    contractorGross: number;
    totalGross: number;
    employeeTaxes: number;
    employeeCount: number;
    contractorCount: number;
  };
  schedules: PayrollRunScheduleSummary[];
  employees: PayrollEmployeeLine[];
  approvers: PayrollApprover[];
};

export type CompletedRunData = {
  run: PayrollRunSummary;
  lineItems: PayrollEmployeeLine[];
  journalEntries: Array<{ account: string; debit: number; credit: number; memo: string }>;
  auditTrail: PayrollAuditTrailEntry[];
};

export type PaystubData = {
  runId: string;
  stubs: Array<{ id: string; employee: string; title: string; gross: number; taxes: number; net: number; pdfUrl: string }>;
};

export type PayrollHistoryData = {
  runs: PayrollRunSummary[];
};

export type ContractorPaymentData = {
  contractors: Array<{ id: string; name: string; company: string; ytdPaid: number; amount: number; thresholdStatus: string }>;
};

export type PayrollScheduleData = {
  schedules: Array<{
    id: string;
    name: string;
    frequency: string;
    anchorDate: string;
    nextCheckDate: string;
    employees: number;
    autoPilotEnabled: boolean;
  }>;
  upcomingDates: Array<{ date: string; label: string; schedule: string }>;
};

export type PayrollTaxSetupData = {
  federalEin: string;
  eftpsStatus: "Enrolled" | "Pending" | "Not started";
  states: Array<{ state: string; accountNumber: string; sutaRate: string; form: string; status: string }>;
};

export type GarnishmentData = {
  orders: Array<{ id: string; employee: string; type: string; amount: string; priority: number; effectiveDate: string; courtOrder: string; status: string }>;
};

export type EwaData = {
  provider: EwaProviderConfig;
  employees: Array<{
    id: string;
    name: string;
    earnedWages: number;
    currentPeriodGross: number;
    available: number;
    percent: number;
    nextPayDate: string;
  }>;
  advances: Array<{
    id: string;
    employeeId: string;
    employee: string;
    amount: number;
    remainingBalance: number;
    issuedAt: string;
    provider: string;
    status: string;
    repaymentRunId: string | null;
  }>;
  requests: Array<{ id: string; employee: string; amount: number; status: string; requestedAt: string; provider: string }>;
  repayments: Array<{ id: string; employee: string; amount: number; remainingBalance: number; nextRun: string; status: string }>;
};

export type BridgeData = {
  underwriting: Array<{ label: string; value: string; status: string }>;
  repaymentSchedule: Array<{ date: string; amount: number; status: string }>;
};

export type PayrollSettingsData = {
  checkDateCalculation: "Business days" | "Calendar days";
  bankAccount: string;
  achTiming: "2-day" | "Next-day";
  approvalChain: PayrollApprover[];
  notifications: Array<{ label: string; enabled: boolean }>;
  autoPilotSchedules: PayrollAutoPilotSchedule[];
  autoPilotAuditTrail: PayrollAuditTrailEntry[];
};

export type PayrollReportsData = {
  reports: Array<{ id: string; name: string; description: string; format: "Excel" | "CSV"; lastRun: string; href: string }>;
};

export type OffCycleData = {
  employees: Array<{ id: string; name: string; title: string; selected: boolean; amount: number }>;
  taxPreview: { gross: number; taxes: number; net: number };
};

export type PayrollModuleScreen =
  | "hub"
  | "run"
  | "completed-run"
  | "paystubs"
  | "off-cycle"
  | "history"
  | "contractors"
  | "schedule"
  | "tax-setup"
  | "garnishments"
  | "ewa"
  | "bridge"
  | "settings"
  | "reports";

export type PayrollModuleData =
  | PayrollHubData
  | PayrollRunData
  | CompletedRunData
  | PaystubData
  | OffCycleData
  | PayrollHistoryData
  | ContractorPaymentData
  | PayrollScheduleData
  | PayrollTaxSetupData
  | GarnishmentData
  | EwaData
  | BridgeData
  | PayrollSettingsData
  | PayrollReportsData;

const hrisEmployees = getHeadcountEmployees();

const payrollRunSchedules = [
  { id: "weekly-hourly", name: "Weekly Hourly", frequency: "Weekly", checkDate: "Jun 13, 2026" },
  { id: "biweekly-salaried", name: "Biweekly Salaried", frequency: "Biweekly", checkDate: "Jun 20, 2026" },
  { id: "semi-monthly-mixed", name: "Semi-monthly Mixed", frequency: "Semi-monthly", checkDate: "Jun 15, 2026" },
] satisfies Array<{
  id: string;
  name: string;
  frequency: PayrollScheduleFrequency;
  checkDate: string;
}>;

function buildTaxes(grossPay: number) {
  return {
    federalIT: Math.round(grossPay * 0.12),
    ficaSS: Math.round(grossPay * 0.062),
    ficaMed: Math.round(grossPay * 0.0145),
    stateIT: Math.round(grossPay * 0.052),
    localIT: Math.round(grossPay * 0.006),
  };
}

function buildZeroTaxes() {
  return {
    federalIT: 0,
    ficaSS: 0,
    ficaMed: 0,
    stateIT: 0,
    localIT: 0,
  };
}

function getScheduleForEmployee(payType: PayType, paySchedule?: string) {
  if (paySchedule?.includes("Semimonthly")) return payrollRunSchedules[2];
  if (payType === "Hourly") return payrollRunSchedules[0];
  if (payType === "Contractor") return payrollRunSchedules[2];
  return payrollRunSchedules[1];
}

function salaryPeriodsForFrequency(frequency: PayrollScheduleFrequency) {
  if (frequency === "Weekly") return 52;
  if (frequency === "Biweekly") return 26;
  return 24;
}

const employeeLines: PayrollEmployeeLine[] = hrisEmployees.map((employee, index) => {
  const payType = employee.employmentType === "Contractor" ? "Contractor" : employee.payType;
  const schedule = getScheduleForEmployee(payType, employee.paySchedule);
  const hours = employee.payType === "Hourly" ? [82, 80, 76, 40][index % 4] : 80;
  const grossPay = Math.round(
    employee.payType === "Hourly" ? (employee.hourlyRate || 0) * hours : employee.salary / salaryPeriodsForFrequency(schedule.frequency),
  );
  const taxes = buildTaxes(grossPay);
  const taxTotal = Object.values(taxes).reduce((sum, value) => sum + value, 0);
  const deductions = Math.round(grossPay * (employee.employmentType === "Part-time" ? 0.025 : 0.055));
  const status: PayrollLineStatus =
    employee.bankAccount === "Not connected" ? "Error" : employee.status === "On Leave" ? "Flagged" : "Verified";

  return {
    id: employee.id,
    name: getEmployeeName(employee),
    title: employee.title,
    department: employee.department,
    workerType: "Employee",
    scheduleId: schedule.id,
    scheduleName: schedule.name,
    scheduleFrequency: schedule.frequency,
    checkDate: schedule.checkDate,
    payType,
    taxForm: "W-2",
    hours,
    grossPay,
    deductions,
    netPay: Math.max(0, grossPay - taxTotal - deductions),
    status,
    issue:
      status === "Error"
        ? "Missing direct deposit account."
        : status === "Flagged"
          ? "Employee is currently on leave. Review pay eligibility."
          : undefined,
    taxes,
  };
});

const contractorLines: PayrollEmployeeLine[] = [
  {
    id: "con-1",
    name: "Alex Rivera",
    title: "Brand Design Contractor",
    department: "Design",
    workerType: "Contractor",
    scheduleId: payrollRunSchedules[2].id,
    scheduleName: payrollRunSchedules[2].name,
    scheduleFrequency: payrollRunSchedules[2].frequency,
    checkDate: payrollRunSchedules[2].checkDate,
    payType: "Contractor",
    taxForm: "1099-NEC",
    contractorCompany: "Rivera Creative LLC",
    hours: 0,
    grossPay: 1800,
    deductions: 0,
    netPay: 1800,
    status: "Verified",
    taxes: buildZeroTaxes(),
  },
  {
    id: "con-2",
    name: "Morgan Fields",
    title: "Agency Strategy Consultant",
    department: "Marketing",
    workerType: "Contractor",
    scheduleId: payrollRunSchedules[2].id,
    scheduleName: payrollRunSchedules[2].name,
    scheduleFrequency: payrollRunSchedules[2].frequency,
    checkDate: payrollRunSchedules[2].checkDate,
    payType: "Contractor",
    taxForm: "1099-NEC",
    contractorCompany: "Fields Advisory",
    hours: 0,
    grossPay: 400,
    deductions: 0,
    netPay: 400,
    status: "Flagged",
    issue: "W-9 is pending before contractor payment.",
    taxes: buildZeroTaxes(),
  },
  {
    id: "con-3",
    name: "Jamie Chen",
    title: "Technical Content Contractor",
    department: "Engineering",
    workerType: "Contractor",
    scheduleId: payrollRunSchedules[2].id,
    scheduleName: payrollRunSchedules[2].name,
    scheduleFrequency: payrollRunSchedules[2].frequency,
    checkDate: payrollRunSchedules[2].checkDate,
    payType: "Contractor",
    taxForm: "1099-NEC",
    contractorCompany: "Independent",
    hours: 0,
    grossPay: 3200,
    deductions: 0,
    netPay: 3200,
    status: "Verified",
    taxes: buildZeroTaxes(),
  },
];

const employees: PayrollEmployeeLine[] = [...employeeLines, ...contractorLines];

const payrollRunGross = employees.reduce((sum, employee) => sum + employee.grossPay, 0);
const payrollRunTaxes = employees.reduce((sum, employee) => sum + Object.values(employee.taxes).reduce((a, b) => a + b, 0), 0);
const payrollRunNet = employees.reduce((sum, employee) => sum + employee.netPay, 0);
const monthlyGrossPayroll = getMonthlyGrossPayroll();
const hourlyPayrollEmployees = employees.filter((employee) => employee.payType === "Hourly");
const salariedPayrollEmployees = employees.filter((employee) => employee.payType === "Salary");

function formatMoney(value: number) {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

const activeRuns: PayrollRunSummary[] = [
  { id: "draft-preview", payPeriod: "Jun 1-15, 2026", checkDate: "Jun 20, 2026", employees: employees.length, gross: payrollRunGross, taxes: payrollRunTaxes, net: payrollRunNet, status: "Draft", type: "Regular" },
  { id: "pr-2026-0529", payPeriod: "May 16-31, 2026", checkDate: "Jun 5, 2026", employees: employees.length, gross: Math.round(payrollRunGross * 0.98), taxes: Math.round(payrollRunTaxes * 0.98), net: Math.round(payrollRunNet * 0.98), status: "Pending", type: "Regular" },
  { id: "oc-2026-0528", payPeriod: "Commission true-up", checkDate: "May 30, 2026", employees: 2, gross: 6500, taxes: 1950, net: 4550, status: "Processing", type: "Off-cycle" },
];

const historyRuns: PayrollRunSummary[] = [
  ...activeRuns,
  { id: "pr-2026-0515", payPeriod: "May 1-15, 2026", checkDate: "May 20, 2026", employees: employees.length, gross: Math.round(payrollRunGross * 0.96), taxes: Math.round(payrollRunTaxes * 0.96), net: Math.round(payrollRunNet * 0.96), status: "Paid", type: "Regular" },
  { id: "pr-2026-0430", payPeriod: "Apr 16-30, 2026", checkDate: "May 5, 2026", employees: employees.length - 1, gross: Math.round(payrollRunGross * 0.93), taxes: Math.round(payrollRunTaxes * 0.93), net: Math.round(payrollRunNet * 0.93), status: "Paid", type: "Regular" },
  { id: "oc-2026-0418", payPeriod: "Termination Pay", checkDate: "Apr 18, 2026", employees: 1, gross: 12400, taxes: 3720, net: 8680, status: "Paid", type: "Off-cycle" },
];

const approvers: PayrollApprover[] = [
  { id: "apr-1", name: "Riley Finance", role: "Finance Admin", status: "Required" },
  { id: "apr-2", name: "Sam People", role: "People Ops Lead", status: "Required" },
  { id: "apr-3", name: "Taylor CFO", role: "Final Approver", status: "Required" },
];

const autoPilotSchedules: PayrollAutoPilotSchedule[] = [
  {
    id: "sch-1",
    name: "Salaried Biweekly",
    frequency: "Biweekly",
    enabled: true,
    status: "On",
    nextRunDate: "2026-06-15",
    nextRunLabel: "Jun 15",
    autoSubmitDate: "2026-06-13",
    autoSubmitInDays: 2,
    notificationWindowHours: 48,
    reminderStatus: "Queued",
    lastRunId: "pr-2026-0529",
    lastRunConfig: "82 salaried employees, standard deductions, 2-day ACH, finance approval chain",
    reviewHref: "/payroll/run?autopilot=review&schedule=sch-1",
    pauseHref: "/payroll/settings?autopilot=pause&schedule=sch-1",
  },
  {
    id: "sch-2",
    name: "Hourly Weekly",
    frequency: "Weekly",
    enabled: false,
    status: "Off",
    nextRunDate: "2026-06-13",
    nextRunLabel: "Jun 13",
    autoSubmitDate: "2026-06-11",
    autoSubmitInDays: 0,
    notificationWindowHours: 48,
    reminderStatus: "Not scheduled",
    lastRunId: "pr-2026-0522",
    lastRunConfig: "Hourly lines require timesheet import review before submission",
    reviewHref: "/payroll/run?autopilot=review&schedule=sch-2",
    pauseHref: "/payroll/settings?autopilot=pause&schedule=sch-2",
  },
];

const activeAutoPilot = autoPilotSchedules.find((schedule) => schedule.enabled && schedule.status === "On");

const autoPilotAuditTrail: PayrollAuditTrailEntry[] = [
  {
    time: "May 29, 2026 6:08 AM",
    actor: "AutoPilot",
    action: "Captured last successful run config from pr-2026-0529 for Salaried Biweekly",
  },
  {
    time: "Jun 13, 2026 6:00 AM",
    actor: "AutoPilot",
    action: "Queued 48-hour review notification before Salaried Biweekly auto-submit",
  },
  {
    time: "Jun 15, 2026 6:00 AM",
    actor: "AutoPilot",
    action: "Scheduled auto-run using last run config for Salaried Biweekly",
  },
];

export function getPayrollRunData(runId = "draft-preview"): PayrollRunData {
  const totals = employees.reduce(
    (sum, employee) => {
      const employeeTaxes = Object.values(employee.taxes).reduce((a, b) => a + b, 0);
      sum.gross += employee.grossPay;
      sum.taxes += employeeTaxes;
      sum.net += employee.netPay;
      if (employee.workerType === "Contractor") {
        sum.contractorGross += employee.grossPay;
        sum.contractorCount += 1;
      } else {
        sum.employeeGross += employee.grossPay;
        sum.employeeTaxes += employeeTaxes;
        sum.employeeCount += 1;
      }
      return sum;
    },
    {
      gross: 0,
      taxes: 0,
      net: 0,
      employerCost: 0,
      employeeGross: 0,
      contractorGross: 0,
      totalGross: 0,
      employeeTaxes: 0,
      employeeCount: 0,
      contractorCount: 0,
    },
  );
  totals.totalGross = totals.employeeGross + totals.contractorGross;
  totals.employerCost = totals.gross + totals.taxes * 0.42;
  const schedules = payrollRunSchedules.map((schedule) => {
    const lines = employees.filter((employee) => employee.scheduleId === schedule.id);
    const employeeGross = lines
      .filter((employee) => employee.workerType === "Employee")
      .reduce((sum, employee) => sum + employee.grossPay, 0);
    const contractorGross = lines
      .filter((employee) => employee.workerType === "Contractor")
      .reduce((sum, employee) => sum + employee.grossPay, 0);

    return {
      ...schedule,
      workerCount: lines.length,
      employeeGross,
      contractorGross,
      totalGross: employeeGross + contractorGross,
    };
  });

  return {
    runId,
    payPeriod: "Jun mixed schedules",
    checkDate: "Jun 13-20, 2026",
    status: "Draft",
    totals,
    schedules,
    employees,
    approvers,
  };
}

export function getCompletedRunData(runId = "pr-2026-0515"): CompletedRunData {
  const run = historyRuns.find((item) => item.id === runId) || historyRuns[3];
  return {
    run,
    lineItems: employees.map((employee) => ({ ...employee, status: "Verified" })),
    journalEntries: [
      { account: "6000 Wages Expense", debit: run.gross, credit: 0, memo: "Gross wages" },
      { account: "2100 Payroll Tax Payable", debit: 0, credit: run.taxes, memo: "Employee taxes" },
      { account: "1000 Payroll Clearing", debit: 0, credit: run.net, memo: "Net pay ACH" },
      { account: "6100 Employer Payroll Tax", debit: Math.round(run.taxes * 0.42), credit: 0, memo: "Employer taxes" },
    ],
    auditTrail: [
      { time: "May 19, 2026 9:12 AM", actor: "Maya Patel", action: "Submitted payroll for approval" },
      { time: "May 19, 2026 10:44 AM", actor: "Taylor CFO", action: "Approved payroll" },
      { time: "May 20, 2026 6:05 AM", actor: "CircleWorks", action: "Submitted ACH file and generated pay stubs" },
      { time: "May 20, 2026 6:06 AM", actor: "AutoPilot", action: "Stored final run config for future auto-run reuse" },
    ],
  };
}

export function getPayrollModuleData(screen: PayrollModuleScreen, runId?: string): PayrollModuleData {
  if (screen === "hub") {
    return {
      kpis: [
        { label: "Active Runs", value: "3", detail: "1 draft, 1 pending, 1 processing", href: "/payroll/history" },
        { label: "Next Pay Date", value: "Jun 20", detail: "Regular biweekly payroll", href: "/payroll/schedule" },
        { label: "YTD Payroll", value: formatMoney(monthlyGrossPayroll * 5), detail: "Gross wages processed", href: "/payroll/history" },
        { label: "YTD Tax Filed", value: formatMoney(monthlyGrossPayroll * 5 * 0.2), detail: "Federal, state, and local", href: "/payroll/tax-setup" },
      ],
      quickLinks: [
        { label: "Off-cycle", href: "/payroll/off-cycle", detail: "Bonus, correction, termination pay" },
        { label: "Contractors", href: "/payroll/contractors", detail: "1099 payment runs" },
        { label: "Schedules", href: "/payroll/schedule", detail: "Pay calendars and check dates" },
        { label: "Tax Setup", href: "/payroll/tax-setup", detail: "EIN, state accounts, EFTPS" },
      ],
      activeRuns,
      autoPilot: activeAutoPilot
        ? {
            enabled: true,
            scheduleId: activeAutoPilot.id,
            scheduleName: activeAutoPilot.name,
            nextRunLabel: activeAutoPilot.nextRunLabel,
            autoSubmitInDays: activeAutoPilot.autoSubmitInDays,
            notificationWindowHours: activeAutoPilot.notificationWindowHours,
            lastRunId: activeAutoPilot.lastRunId,
            lastRunConfig: activeAutoPilot.lastRunConfig,
            reviewHref: activeAutoPilot.reviewHref,
            pauseHref: activeAutoPilot.pauseHref,
          }
        : null,
    } satisfies PayrollHubData;
  }

  if (screen === "run") return getPayrollRunData(runId);
  if (screen === "completed-run") return getCompletedRunData(runId);

  if (screen === "paystubs") {
    return {
      runId: runId || "pr-2026-0515",
      stubs: employees.map((employee) => ({
        id: `stub-${employee.id}`,
        employee: employee.name,
        title: employee.title,
        gross: employee.grossPay,
        taxes: Object.values(employee.taxes).reduce((a, b) => a + b, 0),
        net: employee.netPay || employee.grossPay * 0.72,
        pdfUrl: "#",
      })),
    } satisfies PaystubData;
  }

  if (screen === "off-cycle") {
    return {
      employees: employees.slice(0, 4).map((employee, index) => ({
        id: employee.id,
        name: employee.name,
        title: employee.title,
        selected: index < 2,
        amount: index < 2 ? 2500 + index * 750 : 0,
      })),
      taxPreview: { gross: 5750, taxes: 1782, net: 3968 },
    } satisfies OffCycleData;
  }

  if (screen === "history") return { runs: historyRuns } satisfies PayrollHistoryData;

  if (screen === "contractors") {
    return {
      contractors: [
        { id: "con-1", name: "Alex Rivera", company: "Rivera Creative LLC", ytdPaid: 5420, amount: 1800, thresholdStatus: "1099 tracked" },
        { id: "con-2", name: "Morgan Fields", company: "Fields Advisory", ytdPaid: 580, amount: 400, thresholdStatus: "Approaching $600" },
        { id: "con-3", name: "Jamie Chen", company: "Independent", ytdPaid: 12400, amount: 3200, thresholdStatus: "1099 required" },
      ],
    } satisfies ContractorPaymentData;
  }

  if (screen === "schedule") {
    return {
      schedules: [
        { id: "sch-1", name: "Salaried Biweekly", frequency: "Biweekly", anchorDate: "2026-06-05", nextCheckDate: "2026-06-20", employees: salariedPayrollEmployees.length, autoPilotEnabled: true },
        { id: "sch-2", name: "Hourly Weekly", frequency: "Weekly", anchorDate: "2026-06-06", nextCheckDate: "2026-06-13", employees: hourlyPayrollEmployees.length, autoPilotEnabled: false },
      ],
      upcomingDates: [
        { date: "Jun 13", label: "Hourly", schedule: "Hourly Weekly" },
        { date: "Jun 20", label: "Regular", schedule: "Salaried Biweekly" },
        { date: "Jun 27", label: "Hourly", schedule: "Hourly Weekly" },
        { date: "Jul 3", label: "Regular", schedule: "Salaried Biweekly" },
        { date: "Jul 10", label: "Hourly", schedule: "Hourly Weekly" },
        { date: "Jul 17", label: "Regular", schedule: "Salaried Biweekly" },
      ],
    } satisfies PayrollScheduleData;
  }

  if (screen === "tax-setup") {
    return {
      federalEin: "12-3456789",
      eftpsStatus: "Enrolled",
      states: [
        { state: "CA", accountNumber: "CA-482910", sutaRate: "3.4%", form: "DE 9 / DE 9C", status: "Verified" },
        { state: "NY", accountNumber: "NY-193024", sutaRate: "4.1%", form: "NYS-45", status: "Verified" },
        { state: "TX", accountNumber: "TX-884201", sutaRate: "1.9%", form: "C-3", status: "Pending" },
      ],
    } satisfies PayrollTaxSetupData;
  }

  if (screen === "garnishments") {
    return {
      orders: [
        { id: "gar-1", employee: "Avery Johnson", type: "Child Support", amount: "$420 / pay", priority: 1, effectiveDate: "Jun 1, 2026", courtOrder: "CA-CS-28491", status: "Active" },
        { id: "gar-2", employee: "Chris Wong", type: "IRS Levy", amount: "15% net", priority: 2, effectiveDate: "May 15, 2026", courtOrder: "IRS-90021", status: "Review" },
      ],
    } satisfies GarnishmentData;
  }

  if (screen === "ewa") {
    const provider = getEwaProvider("dailypay");
    const outstandingAdvances = getOutstandingEwaAdvances();

    return {
      provider,
      employees: hourlyPayrollEmployees.map((employee, index) => {
        const earnedWages = Math.round(employee.grossPay * 0.62);
        const availability = calculateEwaAvailability({
          earnedWages,
          accessiblePercent: index === 0 ? 0.5 : 0.4,
          maxPerPayPeriod: 2500,
        });

        return {
          id: employee.id,
          name: employee.name,
          earnedWages,
          currentPeriodGross: employee.grossPay,
          available: availability.availableAmount,
          percent: availability.percentOfEarnedAccessible,
          nextPayDate: employee.checkDate,
        };
      }),
      advances: outstandingAdvances.map((advance) => ({
        id: advance.id,
        employeeId: advance.employeeId,
        employee: advance.employeeName,
        amount: advance.amount,
        remainingBalance: advance.remainingBalance,
        issuedAt: advance.issueDate,
        provider: provider.displayName,
        status: advance.status === "partial" ? "Pending" : "Active",
        repaymentRunId: advance.repaymentRunId,
      })),
      requests: [
        { id: "ewa-1", employee: hourlyPayrollEmployees[0]?.name || "Priya Shah", amount: 300, status: "Approved", requestedAt: "Today 9:14 AM", provider: provider.displayName },
        { id: "ewa-2", employee: hourlyPayrollEmployees[1]?.name || "Jordan Lee", amount: 225, status: "Pending", requestedAt: "Today 10:42 AM", provider: provider.displayName },
      ],
      repayments: outstandingAdvances.map((advance) => ({
        id: `repay-${advance.id}`,
        employee: advance.employeeName,
        amount: advance.remainingBalance,
        remainingBalance: advance.remainingBalance,
        nextRun: "Jun 20, 2026",
        status: advance.remainingBalance < advance.amount ? "Partial" : "Pending",
      })),
    } satisfies EwaData;
  }

  if (screen === "bridge") {
    return {
      underwriting: [
        { label: "Payroll history", value: "24 successful runs", status: "Strong" },
        { label: "Average monthly payroll", value: formatMoney(monthlyGrossPayroll), status: "Eligible" },
        { label: "Connected bank", value: "Plaid required", status: "Action needed" },
        { label: "Provider", value: "Parafin / Capchase", status: "Ready" },
      ],
      repaymentSchedule: [
        { date: "Jul 5, 2026", amount: 18500, status: "Scheduled" },
        { date: "Aug 5, 2026", amount: 18500, status: "Scheduled" },
        { date: "Sep 5, 2026", amount: 18500, status: "Scheduled" },
      ],
    } satisfies BridgeData;
  }

  if (screen === "settings") {
    return {
      checkDateCalculation: "Business days",
      bankAccount: "Chase Payroll Operating **** 1932",
      achTiming: "2-day",
      approvalChain: approvers,
      notifications: [
        { label: "Payroll draft ready", enabled: true },
        { label: "Approval requested", enabled: true },
        { label: "Payroll processed", enabled: true },
        { label: "AutoPilot 48-hour review", enabled: true },
        { label: "Tax filing failed", enabled: true },
      ],
      autoPilotSchedules,
      autoPilotAuditTrail,
    } satisfies PayrollSettingsData;
  }

  return {
    reports: [
      { id: "payroll-summary", name: "Payroll Summary", description: "Gross, net, taxes, and employer costs by run.", format: "Excel", lastRun: "May 29, 2026", href: "/reports/viewer/payroll-summary" },
      { id: "tax-liability", name: "Tax Liability", description: "Federal, state, local, FUTA, and SUTA balances.", format: "CSV", lastRun: "May 28, 2026", href: "/reports/viewer/tax-liability" },
      { id: "deductions", name: "Deductions", description: "Benefit, garnishment, EWA, and voluntary deductions.", format: "Excel", lastRun: "May 27, 2026", href: "/reports/viewer/deductions" },
      { id: "journal-entries", name: "Journal Entries", description: "QBO-ready payroll journal entry export.", format: "CSV", lastRun: "May 26, 2026", href: "/reports/viewer/journal-entries" },
    ],
  } satisfies PayrollReportsData;
}

export function applyPayrollAction(action: string, payload?: Record<string, unknown>) {
  const scheduleName =
    typeof payload?.scheduleName === "string"
      ? payload.scheduleName
      : autoPilotSchedules.find((schedule) => schedule.id === payload?.scheduleId)?.name;
  const autoPilotAudit = action.startsWith("payroll.autopilot")
    ? {
        time: new Date().toISOString(),
        actor: "AutoPilot",
        action:
          action === "payroll.autopilot.pause"
            ? `Paused ${scheduleName || "pay schedule"} auto-run`
            : action === "payroll.autopilot.enable"
              ? `Enabled ${scheduleName || "pay schedule"} auto-run using last successful run config`
              : action === "payroll.autopilot.review-window"
                ? `Sent 48-hour AutoPilot review notification for ${scheduleName || "pay schedule"}`
                : `Recorded AutoPilot action for ${scheduleName || "pay schedule"}`,
      }
    : undefined;

  return {
    ok: true,
    action,
    autoPilotAudit,
    updatedAt: new Date().toISOString(),
  };
}
