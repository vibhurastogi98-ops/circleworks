import {
  employees,
  getEmployee,
  getEmployeeName,
  getHeadcountEmployees,
  type EmployeeRecord,
} from "@/lib/hris-module-data";

export type BenefitsModuleScreen =
  | "overview"
  | "plans"
  | "enrollment"
  | "oe"
  | "qle"
  | "401k"
  | "cobra"
  | "fsa-hsa"
  | "life-disability";

export type PlanCategory =
  | "Medical"
  | "Dental"
  | "Vision"
  | "401k"
  | "Life"
  | "HSA"
  | "FSA"
  | "Supplemental";

export type PlanStatus = "Active" | "Renewal Soon" | "Expired" | "Draft";
export type EnrollmentStatus = "Completed" | "In Progress" | "Not Started" | "Waived";
export type QleStatus = "Pending Review" | "Approved" | "Denied";

export type BenefitKpi = {
  label: string;
  value: string;
  detail: string;
  tone: "blue" | "emerald" | "amber" | "slate";
};

export type BenefitPlan = {
  id: string;
  category: PlanCategory;
  carrier: string;
  carrierLogo: string;
  name: string;
  type: string;
  deductible: number;
  outOfPocketMax: number;
  employerContribution: number;
  employeeCost: number;
  enrolledCount: number;
  eligibleCount: number;
  monthlyCost: number;
  status: PlanStatus;
  effectiveStart: string;
  effectiveEnd: string;
  renewalDate: string;
  contributionFormula: string;
  network: string;
  coveredHighlights: string[];
};

export type OpenEnrollmentWindow = {
  active: boolean;
  startDate: string;
  endDate: string;
  daysRemaining: number;
  employeesNotEnrolled: number;
};

export type BenefitsOverviewData = {
  companyId: string;
  kpis: BenefitKpi[];
  planSummaries: Array<{
    category: PlanCategory;
    carrier: string;
    planName: string;
    enrolledCount: number;
    monthlyCost: number;
    status: PlanStatus;
    href: string;
  }>;
  openEnrollment: OpenEnrollmentWindow;
  payrollDeductionPreview: Array<{
    plan: string;
    category: PlanCategory;
    employeeMonthly: number;
    employeePerPayPeriod: number;
    employerMonthly: number;
    taxTreatment: "Pre-tax" | "Post-tax";
  }>;
};

export type BenefitsPlansData = {
  categories: PlanCategory[];
  plans: BenefitPlan[];
  carrierOptions: string[];
  contributionModels: string[];
};

export type EnrollmentWizardData = {
  employee: Pick<EmployeeRecord, "id" | "firstName" | "lastName" | "title" | "department" | "salary">;
  dependents: Array<{ id: string; name: string; relationship: string; age: number }>;
  medicalPlans: BenefitPlan[];
  dentalPlans: BenefitPlan[];
  visionPlans: BenefitPlan[];
  lifeBase: {
    carrier: string;
    amount: number;
    employeeCost: number;
    employerCost: number;
  };
  supplementalOptions: Array<{
    id: string;
    name: string;
    carrier: string;
    monthlyCost: number;
    description: string;
  }>;
  currentSelection: {
    medicalPlanId: string;
    dentalPlanId: string;
    visionPlanId: string;
    supplementalIds: string[];
    lifeMultiplier: number;
  };
  payPeriodsPerMonth: number;
};

export type OpenEnrollmentData = {
  window: OpenEnrollmentWindow;
  completionRate: number;
  statusRows: Array<{
    employeeId: string;
    employee: string;
    department: string;
    enrolledPlans: string[];
    status: EnrollmentStatus;
    lastActivity: string;
  }>;
  carrierFiles: Array<{
    carrier: string;
    fileType: string;
    rows: number;
    status: "Ready" | "Needs Review";
  }>;
};

export type QleData = {
  events: Array<{
    id: string;
    employeeId: string;
    employee: string;
    eventType: "Marriage" | "Birth" | "Divorce" | "Loss of other coverage";
    eventDate: string;
    windowExpires: string;
    status: QleStatus;
    submittedAt: string;
    requestedChanges: string[];
  }>;
};

export type RetirementData = {
  provider: "Guideline" | "Human Interest";
  providerStatus: "Connected" | "Sync Needed";
  participationRate: number;
  annualLimit: number;
  rows: Array<{
    employeeId: string;
    employee: string;
    contributionRate: number;
    contributionType: "Traditional" | "Roth" | "Split";
    employerMatch: string;
    ytdEmployee: number;
    ytdEmployer: number;
    syncStatus: "Synced" | "Pending";
  }>;
  changeRequests: Array<{
    id: string;
    employee: string;
    requestedAt: string;
    change: string;
    status: "Queued" | "Synced";
  }>;
};

export type CobraData = {
  rows: Array<{
    id: string;
    employee: string;
    coverageType: string;
    qualifyingEvent: string;
    cobraStartDate: string;
    cobraEndDate: string;
    premium: number;
    paymentStatus: "Current" | "Past Due" | "Unpaid";
    noticeStatus: "Not Sent" | "Sent" | "Elected";
  }>;
  noticeTemplate: {
    name: string;
    source: string;
    delivery: string;
  };
};

export type FsaHsaData = {
  tpa: string;
  accounts: Array<{
    employeeId: string;
    employee: string;
    accountType: "FSA" | "HSA";
    annualElection: number;
    ytdContributions: number;
    ytdSpent: number;
    balance: number;
    irsLimit: number;
    status: "Healthy" | "Needs Review";
  }>;
};

export type LifeDisabilityData = {
  carrier: string;
  rows: Array<{
    employeeId: string;
    employee: string;
    lifeAmount: number;
    voluntaryLife: number;
    stdStatus: "Enrolled" | "Waived";
    ltdStatus: "Enrolled" | "Waived";
    voluntaryBenefits: string[];
    beneficiary: string;
    eoiStatus: "N/A" | "Pending" | "Approved" | "Denied";
  }>;
};

export type BenefitsModuleData =
  | BenefitsOverviewData
  | BenefitsPlansData
  | EnrollmentWizardData
  | OpenEnrollmentData
  | QleData
  | RetirementData
  | CobraData
  | FsaHsaData
  | LifeDisabilityData;

const headcount = getHeadcountEmployees();
const eligibleCount = headcount.filter((employee) => employee.employmentType !== "Contractor").length;
const employeeName = (index: number) => getEmployeeName(employees[index] || employees[0]);

const plans: BenefitPlan[] = [
  {
    id: "med-bronze",
    category: "Medical",
    carrier: "BlueCross BlueShield",
    carrierLogo: "BC",
    name: "Bronze HDHP 3500",
    type: "HDHP",
    deductible: 3500,
    outOfPocketMax: 7000,
    employerContribution: 420,
    employeeCost: 142,
    enrolledCount: 28,
    eligibleCount,
    monthlyCost: 15736,
    status: "Active",
    effectiveStart: "2026-01-01",
    effectiveEnd: "2026-12-31",
    renewalDate: "2026-10-15",
    contributionFormula: "Employer pays $420 per employee",
    network: "National PPO",
    coveredHighlights: ["Preventive care covered at 100%", "HSA eligible", "Virtual urgent care included"],
  },
  {
    id: "med-silver",
    category: "Medical",
    carrier: "BlueCross BlueShield",
    carrierLogo: "BC",
    name: "Silver PPO 1500",
    type: "PPO",
    deductible: 1500,
    outOfPocketMax: 5000,
    employerContribution: 610,
    employeeCost: 238,
    enrolledCount: 76,
    eligibleCount,
    monthlyCost: 64448,
    status: "Active",
    effectiveStart: "2026-01-01",
    effectiveEnd: "2026-12-31",
    renewalDate: "2026-10-15",
    contributionFormula: "Employer pays 72% of premium",
    network: "National PPO",
    coveredHighlights: ["Primary care copay", "Broad specialist network", "Prescription tier support"],
  },
  {
    id: "med-gold",
    category: "Medical",
    carrier: "Aetna",
    carrierLogo: "AE",
    name: "Gold HMO 500",
    type: "HMO",
    deductible: 500,
    outOfPocketMax: 3500,
    employerContribution: 720,
    employeeCost: 316,
    enrolledCount: 22,
    eligibleCount,
    monthlyCost: 22792,
    status: "Renewal Soon",
    effectiveStart: "2026-01-01",
    effectiveEnd: "2026-12-31",
    renewalDate: "2026-09-30",
    contributionFormula: "Tiered by employee coverage level",
    network: "Aetna Select",
    coveredHighlights: ["Low deductible", "Integrated care management", "No referral for urgent care"],
  },
  {
    id: "dental-core",
    category: "Dental",
    carrier: "Delta Dental",
    carrierLogo: "DD",
    name: "Delta Dental PPO",
    type: "PPO",
    deductible: 50,
    outOfPocketMax: 1500,
    employerContribution: 42,
    employeeCost: 16,
    enrolledCount: 118,
    eligibleCount,
    monthlyCost: 6844,
    status: "Active",
    effectiveStart: "2026-01-01",
    effectiveEnd: "2026-12-31",
    renewalDate: "2026-11-01",
    contributionFormula: "Employer pays 70% of employee-only premium",
    network: "Delta PPO",
    coveredHighlights: ["Two cleanings per year", "Orthodontia discount", "Major services after deductible"],
  },
  {
    id: "vision-core",
    category: "Vision",
    carrier: "VSP",
    carrierLogo: "VS",
    name: "VSP Choice",
    type: "Vision",
    deductible: 10,
    outOfPocketMax: 250,
    employerContribution: 11,
    employeeCost: 7,
    enrolledCount: 103,
    eligibleCount,
    monthlyCost: 1854,
    status: "Active",
    effectiveStart: "2026-01-01",
    effectiveEnd: "2026-12-31",
    renewalDate: "2026-11-01",
    contributionFormula: "Flat $11 employer contribution",
    network: "VSP Choice",
    coveredHighlights: ["Annual eye exam", "Frames allowance", "Contact lens allowance"],
  },
  {
    id: "retirement-guideline",
    category: "401k",
    carrier: "Guideline",
    carrierLogo: "GL",
    name: "Guideline 401(k)",
    type: "Safe Harbor",
    deductible: 0,
    outOfPocketMax: 0,
    employerContribution: 0,
    employeeCost: 0,
    enrolledCount: 96,
    eligibleCount,
    monthlyCost: 3290,
    status: "Active",
    effectiveStart: "2026-01-01",
    effectiveEnd: "2026-12-31",
    renewalDate: "2026-12-01",
    contributionFormula: "100% match on first 4%",
    network: "Guideline",
    coveredHighlights: ["Automatic payroll sync", "Roth and traditional", "Annual census export"],
  },
  {
    id: "life-basic",
    category: "Life",
    carrier: "MetLife",
    carrierLogo: "ML",
    name: "Basic Life and AD&D",
    type: "1x salary",
    deductible: 0,
    outOfPocketMax: 0,
    employerContribution: 24,
    employeeCost: 0,
    enrolledCount: eligibleCount,
    eligibleCount,
    monthlyCost: eligibleCount * 24,
    status: "Active",
    effectiveStart: "2026-01-01",
    effectiveEnd: "2026-12-31",
    renewalDate: "2026-11-15",
    contributionFormula: "Employer paid 1x salary",
    network: "MetLife",
    coveredHighlights: ["Auto-enrolled", "AD&D included", "Beneficiary tracking"],
  },
  {
    id: "supplemental-voluntary",
    category: "Supplemental",
    carrier: "Aflac",
    carrierLogo: "AF",
    name: "Voluntary Benefits Bundle",
    type: "Critical illness, accident, identity theft",
    deductible: 0,
    outOfPocketMax: 0,
    employerContribution: 0,
    employeeCost: 23,
    enrolledCount: 41,
    eligibleCount,
    monthlyCost: 943,
    status: "Active",
    effectiveStart: "2026-01-01",
    effectiveEnd: "2026-12-31",
    renewalDate: "2026-11-15",
    contributionFormula: "Employee paid voluntary elections",
    network: "Aflac",
    coveredHighlights: ["Guaranteed issue during OE", "Payroll deductions", "Carrier file export"],
  },
  {
    id: "hsa-lively",
    category: "HSA",
    carrier: "Lively",
    carrierLogo: "LY",
    name: "Lively HSA",
    type: "HSA",
    deductible: 0,
    outOfPocketMax: 0,
    employerContribution: 50,
    employeeCost: 0,
    enrolledCount: 28,
    eligibleCount,
    monthlyCost: 1400,
    status: "Active",
    effectiveStart: "2026-01-01",
    effectiveEnd: "2026-12-31",
    renewalDate: "2026-12-01",
    contributionFormula: "$50 employer seed monthly",
    network: "Lively",
    coveredHighlights: ["HDHP linked", "IRS limit checks", "Payroll sync"],
  },
  {
    id: "fsa-navia",
    category: "FSA",
    carrier: "Navia",
    carrierLogo: "NV",
    name: "Healthcare FSA",
    type: "FSA",
    deductible: 0,
    outOfPocketMax: 0,
    employerContribution: 0,
    employeeCost: 0,
    enrolledCount: 47,
    eligibleCount,
    monthlyCost: 0,
    status: "Active",
    effectiveStart: "2026-01-01",
    effectiveEnd: "2026-12-31",
    renewalDate: "2026-12-01",
    contributionFormula: "Employee election only",
    network: "Navia",
    coveredHighlights: ["Use-it-or-lose-it reminders", "Debit card tracking", "Carrier payroll file"],
  },
];

const openEnrollment: OpenEnrollmentWindow = {
  active: true,
  startDate: "2026-06-01",
  endDate: "2026-06-14",
  daysRemaining: 16,
  employeesNotEnrolled: 19,
};

const enrollmentStatuses: EnrollmentStatus[] = [
  "Completed",
  "Completed",
  "In Progress",
  "Not Started",
  "Completed",
  "Waived",
  "Not Started",
  "Completed",
];

function benefitKpis(): BenefitKpi[] {
  const enrolledEmployees = 126;
  const monthlyPremiumCost = plans
    .filter((plan) => ["Medical", "Dental", "Vision", "Life", "Supplemental"].includes(plan.category))
    .reduce((sum, plan) => sum + plan.monthlyCost, 0);

  return [
    { label: "Enrolled Employees", value: String(enrolledEmployees), detail: `${eligibleCount} benefit eligible`, tone: "blue" },
    { label: "Pending Enrollment", value: String(openEnrollment.employeesNotEnrolled), detail: "Due before June 14", tone: "amber" },
    { label: "Monthly Premium Cost", value: formatMoney(monthlyPremiumCost), detail: "Employer and employee premiums", tone: "emerald" },
    { label: "401k Participation", value: "76%", detail: "Guideline sync active", tone: "slate" },
  ];
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function getPlanById(planId: string) {
  return plans.find((plan) => plan.id === planId) || plans[0];
}

export function getBenefitsOverviewData(): BenefitsOverviewData {
  const categories: PlanCategory[] = ["Medical", "Dental", "Vision", "401k", "Life", "Supplemental"];

  return {
    companyId: "demo-company",
    kpis: benefitKpis(),
    planSummaries: categories.map((category) => {
      const categoryPlans = plans.filter((plan) => plan.category === category);
      const primary = categoryPlans[0];
      return {
        category,
        carrier: primary?.carrier || "Carrier pending",
        planName: primary?.name || "No plan configured",
        enrolledCount: categoryPlans.reduce((sum, plan) => Math.max(sum, plan.enrolledCount), 0),
        monthlyCost: categoryPlans.reduce((sum, plan) => sum + plan.monthlyCost, 0),
        status: primary?.status || "Draft",
        href: category === "401k" ? "/benefits/401k" : category === "Life" || category === "Supplemental" ? "/benefits/life-disability" : "/benefits/plans",
      };
    }),
    openEnrollment,
    payrollDeductionPreview: plans
      .filter((plan) => ["Medical", "Dental", "Vision", "Supplemental"].includes(plan.category))
      .map((plan) => ({
        plan: plan.name,
        category: plan.category,
        employeeMonthly: plan.employeeCost,
        employeePerPayPeriod: Math.round((plan.employeeCost / 2.167) * 100) / 100,
        employerMonthly: plan.employerContribution,
        taxTreatment: plan.category === "Supplemental" ? "Post-tax" : "Pre-tax",
      })),
  };
}

export function getBenefitsPlansData(): BenefitsPlansData {
  return {
    categories: ["Medical", "Dental", "Vision", "401k", "Life", "HSA", "FSA", "Supplemental"],
    plans,
    carrierOptions: ["BlueCross BlueShield", "Aetna", "Delta Dental", "VSP", "Guideline", "MetLife", "Aflac", "Lively", "Navia"],
    contributionModels: ["Flat amount", "% of premium", "Tiered by coverage tier", "Employee paid"],
  };
}

export function getEnrollmentWizardData(employeeId = "1"): EnrollmentWizardData {
  const employee = getEmployee(employeeId);

  return {
    employee: {
      id: employee.id,
      firstName: employee.firstName,
      lastName: employee.lastName,
      title: employee.title,
      department: employee.department,
      salary: employee.salary,
    },
    dependents: [
      { id: "dep-1", name: "Avery Patel", relationship: "Spouse", age: 34 },
      { id: "dep-2", name: "Nila Patel", relationship: "Child", age: 6 },
    ],
    medicalPlans: plans.filter((plan) => plan.category === "Medical"),
    dentalPlans: plans.filter((plan) => plan.category === "Dental"),
    visionPlans: plans.filter((plan) => plan.category === "Vision"),
    lifeBase: {
      carrier: "MetLife",
      amount: employee.salary,
      employeeCost: 0,
      employerCost: 24,
    },
    supplementalOptions: [
      { id: "critical-illness", name: "Critical illness", carrier: "Aflac", monthlyCost: 14, description: "Lump-sum coverage for covered diagnoses." },
      { id: "accident", name: "Accident", carrier: "Aflac", monthlyCost: 9, description: "Cash benefit for eligible accident treatment." },
      { id: "identity", name: "Identity theft", carrier: "Allstate", monthlyCost: 6, description: "Monitoring, recovery, and family coverage." },
    ],
    currentSelection: {
      medicalPlanId: "med-silver",
      dentalPlanId: "dental-core",
      visionPlanId: "vision-core",
      supplementalIds: ["critical-illness"],
      lifeMultiplier: 1,
    },
    payPeriodsPerMonth: 2.167,
  };
}

export function getOpenEnrollmentData(): OpenEnrollmentData {
  const rows = employees.slice(0, 8).map((employee, index) => ({
    employeeId: employee.id,
    employee: getEmployeeName(employee),
    department: employee.department,
    enrolledPlans:
      enrollmentStatuses[index] === "Waived"
        ? ["Waived medical", "Dental", "Vision"]
        : ["Medical", "Dental", "Vision", index % 2 === 0 ? "401k" : "Life"],
    status: enrollmentStatuses[index],
    lastActivity: index < 2 ? "Today" : index === 2 ? "Yesterday" : "May 24, 2026",
  }));
  const completed = rows.filter((row) => row.status === "Completed" || row.status === "Waived").length;

  return {
    window: openEnrollment,
    completionRate: Math.round((completed / rows.length) * 100),
    statusRows: rows,
    carrierFiles: [
      { carrier: "BlueCross BlueShield", fileType: "834 EDI census", rows: 126, status: "Ready" },
      { carrier: "Delta Dental", fileType: "Carrier census CSV", rows: 118, status: "Ready" },
      { carrier: "VSP", fileType: "Carrier census CSV", rows: 103, status: "Needs Review" },
      { carrier: "MetLife", fileType: "Life enrollment census", rows: 134, status: "Ready" },
    ],
  };
}

export function getQleData(): QleData {
  return {
    events: [
      {
        id: "qle-1",
        employeeId: employees[1].id,
        employee: employeeName(1),
        eventType: "Birth",
        eventDate: "2026-05-17",
        windowExpires: "2026-06-16",
        status: "Pending Review",
        submittedAt: "2026-05-20",
        requestedChanges: ["Add dependent", "Move to Silver PPO family tier"],
      },
      {
        id: "qle-2",
        employeeId: employees[3].id,
        employee: employeeName(3),
        eventType: "Marriage",
        eventDate: "2026-05-02",
        windowExpires: "2026-06-01",
        status: "Approved",
        submittedAt: "2026-05-05",
        requestedChanges: ["Add spouse to medical", "Add spouse to dental"],
      },
      {
        id: "qle-3",
        employeeId: employees[4].id,
        employee: employeeName(4),
        eventType: "Loss of other coverage",
        eventDate: "2026-05-11",
        windowExpires: "2026-06-10",
        status: "Pending Review",
        submittedAt: "2026-05-12",
        requestedChanges: ["Open mid-year enrollment", "Medical and vision election"],
      },
    ],
  };
}

export function getRetirementData(): RetirementData {
  return {
    provider: "Guideline",
    providerStatus: "Connected",
    participationRate: 76,
    annualLimit: 23000,
    rows: employees.slice(0, 6).map((employee, index) => ({
      employeeId: employee.id,
      employee: getEmployeeName(employee),
      contributionRate: [6, 10, 4, 12, 0, 8][index] || 5,
      contributionType: (["Traditional", "Roth", "Split", "Traditional", "Roth", "Split"] as const)[index] || "Traditional",
      employerMatch: index === 4 ? "Not eligible" : "100% of first 4%",
      ytdEmployee: [9200, 14500, 4200, 18800, 0, 7100][index] || 0,
      ytdEmployer: [6133, 5800, 4200, 6267, 0, 3550][index] || 0,
      syncStatus: index === 2 ? "Pending" : "Synced",
    })),
    changeRequests: [
      { id: "cr-1", employee: employeeName(2), requestedAt: "2026-05-28", change: "Increase contribution from 3% to 4%", status: "Queued" },
      { id: "cr-2", employee: employeeName(5), requestedAt: "2026-05-22", change: "Switch 50% Roth / 50% traditional", status: "Synced" },
    ],
  };
}

export function getCobraData(): CobraData {
  return {
    rows: [
      {
        id: "cobra-1",
        employee: employeeName(5),
        coverageType: "Medical + Dental",
        qualifyingEvent: "Voluntary resignation",
        cobraStartDate: "2026-06-01",
        cobraEndDate: "2027-11-30",
        premium: 1850,
        paymentStatus: "Unpaid",
        noticeStatus: "Sent",
      },
      {
        id: "cobra-2",
        employee: employeeName(6),
        coverageType: "Medical",
        qualifyingEvent: "Reduction in hours",
        cobraStartDate: "2026-06-15",
        cobraEndDate: "2027-12-14",
        premium: 1650,
        paymentStatus: "Unpaid",
        noticeStatus: "Not Sent",
      },
      {
        id: "cobra-3",
        employee: employeeName(7),
        coverageType: "Medical + Dental + Vision",
        qualifyingEvent: "Reduction in hours",
        cobraStartDate: "2026-04-01",
        cobraEndDate: "2027-09-30",
        premium: 1450,
        paymentStatus: "Current",
        noticeStatus: "Elected",
      },
    ],
    noticeTemplate: {
      name: "DOL model COBRA election notice",
      source: "Department of Labor template",
      delivery: "Email and PDF letter",
    },
  };
}

export function getFsaHsaData(): FsaHsaData {
  return {
    tpa: "Navia + Lively",
    accounts: employees.slice(0, 5).map((employee, index) => ({
      employeeId: employee.id,
      employee: getEmployeeName(employee),
      accountType: (index % 2 === 0 ? "HSA" : "FSA") as "FSA" | "HSA",
      annualElection: [4150, 2500, 4150, 3200, 3000][index],
      ytdContributions: [3113, 1667, 2075, 2133, 1500][index],
      ytdSpent: [650, 1400, 125, 2990, 800][index],
      balance: [8200, 267, 3500, 210, 1700][index],
      irsLimit: index % 2 === 0 ? 4150 : 3200,
      status: index === 3 ? "Needs Review" : "Healthy",
    })),
  };
}

export function getLifeDisabilityData(): LifeDisabilityData {
  return {
    carrier: "MetLife",
    rows: employees.slice(0, 6).map((employee, index) => ({
      employeeId: employee.id,
      employee: getEmployeeName(employee),
      lifeAmount: employee.salary,
      voluntaryLife: [0, 250000, 100000, 500000, 0, 150000][index],
      stdStatus: index === 4 ? "Waived" : "Enrolled",
      ltdStatus: index === 2 ? "Waived" : "Enrolled",
      voluntaryBenefits: index % 2 === 0 ? ["Critical illness", "Accident"] : ["Identity theft"],
      beneficiary: ["Spouse", "Spouse", "Parent", "Trust", "Sibling", "Spouse"][index],
      eoiStatus: (["N/A", "Approved", "N/A", "Pending", "N/A", "Approved"] as const)[index],
    })),
  };
}

export function getBenefitsModuleData(screen: BenefitsModuleScreen, employeeId?: string): BenefitsModuleData {
  if (screen === "plans") return getBenefitsPlansData();
  if (screen === "enrollment") return getEnrollmentWizardData(employeeId);
  if (screen === "oe") return getOpenEnrollmentData();
  if (screen === "qle") return getQleData();
  if (screen === "401k") return getRetirementData();
  if (screen === "cobra") return getCobraData();
  if (screen === "fsa-hsa") return getFsaHsaData();
  if (screen === "life-disability") return getLifeDisabilityData();
  return getBenefitsOverviewData();
}

export function applyBenefitsAction(action: string) {
  return {
    ok: true,
    action,
    updatedAt: new Date().toISOString(),
  };
}

export function getPlanForEnrollment(planId: string) {
  return getPlanById(planId);
}
