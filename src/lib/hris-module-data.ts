export type EmployeeStatus = "Active" | "Inactive" | "On Leave" | "Onboarding" | "Terminated";
export type EmploymentType = "Full-time" | "Part-time" | "Contractor";
export type PayType = "Salary" | "Hourly";
export type HrisModuleScreen =
  | "directory"
  | "new"
  | "profile"
  | "compensation"
  | "benefits"
  | "time"
  | "documents"
  | "payroll"
  | "performance"
  | "activity"
  | "bulk"
  | "org-chart";

export type EmployeeRecord = {
  id: string;
  firstName: string;
  lastName: string;
  preferredName: string;
  pronouns?: string;
  email: string;
  personalEmail: string;
  phone: string;
  dateOfBirth: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  title: string;
  department: string;
  employmentType: EmploymentType;
  status: EmployeeStatus;
  payType: PayType;
  location: string;
  locationType: "Remote" | "Hybrid" | "Office";
  officeAddress?: string;
  startDate: string;
  managerId?: string;
  manager: string;
  avatarSeed: string;
  salary: number;
  hourlyRate?: number;
  paySchedule: string;
  directReports: string[];
  ssnMasked: string;
  filingStatus: string;
  stateTaxId: string;
  bankAccount: string;
  birthday: string;
  workAnniversary: string;
};

export type DirectoryData = {
  employees: EmployeeRecord[];
  counts: {
    all: number;
    active: number;
    inactive: number;
  };
  filters: {
    departments: string[];
    statuses: EmployeeStatus[];
    payTypes: PayType[];
    locations: string[];
    managers: string[];
  };
};

export type NewEmployeeData = {
  departments: string[];
  managers: Array<{ id: string; name: string; title: string }>;
  locations: Array<{ label: string; address: string }>;
  paySchedules: string[];
  companyDomain: string;
};

export type ProfileData = {
  employee: EmployeeRecord;
  manager?: EmployeeRecord;
  directReports: EmployeeRecord[];
  keyDates: Array<{ label: string; date: string; detail: string }>;
};

export type CompensationData = {
  employee: EmployeeRecord;
  current: {
    payType: PayType;
    rate: number;
    frequency: string;
    effectiveDate: string;
    paySchedule: string;
  };
  history: Array<{
    id: string;
    oldRate: number;
    newRate: number;
    effectiveDate: string;
    changedBy: string;
    reason: string;
  }>;
  payBand: {
    min: number;
    midpoint: number;
    max: number;
    employeeRate: number;
  };
};

export type DocumentData = {
  employee: EmployeeRecord;
  documents: Array<{
    id: string;
    type: string;
    filename: string;
    uploadedAt: string;
    expiresAt?: string;
    status: "Valid" | "Expiring Soon" | "Expired";
  }>;
  i9: {
    section1: string;
    section2: string;
    reverifyDate: string;
  };
};

export type ActivityData = {
  employee: EmployeeRecord;
  events: Array<{
    id: string;
    date: string;
    actor: string;
    type: string;
    field: string;
    oldValue: string;
    newValue: string;
  }>;
};

export type BulkImportData = {
  templateFields: Array<{ field: string; required: boolean; notes: string }>;
  csvColumns: string[];
  mappedFields: Array<{ column: string; field: string; confidence: "High" | "Medium" | "Needs review" }>;
  validationRows: Array<{ row: number; employee: string; field: string; issue: string; severity: "Error" | "Warning" }>;
  lastImport: {
    id: string;
    importedAt: string;
    rows: number;
    errors: number;
  };
};

export type OrgChartData = {
  employees: EmployeeRecord[];
  departments: string[];
};

export type BenefitsTabData = {
  employee: EmployeeRecord;
  enrollments: Array<{ plan: string; coverage: string; employeeCost: number; employerCost: number; status: string }>;
  openEnrollment: string;
};

export type TimeTabData = {
  employee: EmployeeRecord;
  pto: {
    balance: number;
    used: number;
    scheduled: number;
  };
  recentTimesheets: Array<{ period: string; regularHours: number; overtimeHours: number; status: string }>;
};

export type PayrollTabData = {
  employee: EmployeeRecord;
  ytdGross: number;
  ytdTaxes: number;
  ytdNet: number;
  paystubs: Array<{ id: string; date: string; gross: number; net: number; status: string }>;
};

export type PerformanceTabData = {
  employee: EmployeeRecord;
  reviews: Array<{ cycle: string; rating: string; reviewer: string; completedAt: string }>;
  goals: Array<{ title: string; progress: number; status: string }>;
};

export type HrisModuleData =
  | DirectoryData
  | NewEmployeeData
  | ProfileData
  | CompensationData
  | DocumentData
  | ActivityData
  | BulkImportData
  | OrgChartData
  | BenefitsTabData
  | TimeTabData
  | PayrollTabData
  | PerformanceTabData;

export const employees: EmployeeRecord[] = [
  {
    id: "1",
    firstName: "Maya",
    lastName: "Patel",
    preferredName: "Maya",
    pronouns: "she/her",
    email: "maya.patel@circleworks.com",
    personalEmail: "maya.patel@example.com",
    phone: "(555) 210-8842",
    dateOfBirth: "1990-08-19",
    address: { street: "221 Mission St", city: "San Francisco", state: "CA", zip: "94105" },
    title: "Chief People Officer",
    department: "Executive",
    employmentType: "Full-time",
    status: "Active",
    payType: "Salary",
    location: "San Francisco, CA",
    locationType: "Hybrid",
    officeAddress: "221 Mission St, San Francisco, CA",
    startDate: "2021-02-01",
    manager: "Board of Directors",
    avatarSeed: "Maya Patel",
    salary: 242000,
    paySchedule: "Executive Semimonthly",
    directReports: ["2", "4", "6"],
    ssnMasked: "***-**-4129",
    filingStatus: "Married filing jointly",
    stateTaxId: "CA-PT-4921",
    bankAccount: "Chase **** 8821",
    birthday: "Aug 19",
    workAnniversary: "Feb 1",
  },
  {
    id: "2",
    firstName: "Avery",
    lastName: "Johnson",
    preferredName: "Avery",
    pronouns: "they/them",
    email: "avery.johnson@circleworks.com",
    personalEmail: "avery.j@example.com",
    phone: "(555) 901-1177",
    dateOfBirth: "1989-11-03",
    address: { street: "55 Water St", city: "New York", state: "NY", zip: "10004" },
    title: "Engineering Manager",
    department: "Engineering",
    employmentType: "Full-time",
    status: "Active",
    payType: "Salary",
    location: "New York, NY",
    locationType: "Office",
    officeAddress: "55 Water St, New York, NY",
    startDate: "2022-04-18",
    managerId: "1",
    manager: "Maya Patel",
    avatarSeed: "Avery Johnson",
    salary: 184000,
    paySchedule: "Biweekly Salaried",
    directReports: ["3", "7"],
    ssnMasked: "***-**-2338",
    filingStatus: "Single",
    stateTaxId: "NY-AJ-1940",
    bankAccount: "Bank of America **** 1876",
    birthday: "Nov 3",
    workAnniversary: "Apr 18",
  },
  {
    id: "3",
    firstName: "Elena",
    lastName: "Ruiz",
    preferredName: "Elena",
    pronouns: "she/her",
    email: "elena.ruiz@circleworks.com",
    personalEmail: "elena.r@example.com",
    phone: "(555) 222-9100",
    dateOfBirth: "1994-03-28",
    address: { street: "908 Congress Ave", city: "Austin", state: "TX", zip: "78701" },
    title: "Senior Frontend Engineer",
    department: "Engineering",
    employmentType: "Full-time",
    status: "Active",
    payType: "Salary",
    location: "Austin, TX",
    locationType: "Remote",
    startDate: "2023-01-09",
    managerId: "2",
    manager: "Avery Johnson",
    avatarSeed: "Elena Ruiz",
    salary: 156000,
    paySchedule: "Biweekly Salaried",
    directReports: [],
    ssnMasked: "***-**-8162",
    filingStatus: "Head of household",
    stateTaxId: "TX-ER-0202",
    bankAccount: "Wells Fargo **** 4482",
    birthday: "Mar 28",
    workAnniversary: "Jan 9",
  },
  {
    id: "4",
    firstName: "Noah",
    lastName: "Kim",
    preferredName: "Noah",
    email: "noah.kim@circleworks.com",
    personalEmail: "noah.kim@example.com",
    phone: "(555) 710-1340",
    dateOfBirth: "1987-06-11",
    address: { street: "440 W Lake St", city: "Chicago", state: "IL", zip: "60606" },
    title: "Payroll Operations Lead",
    department: "Payroll",
    employmentType: "Full-time",
    status: "Active",
    payType: "Salary",
    location: "Chicago, IL",
    locationType: "Hybrid",
    officeAddress: "440 W Lake St, Chicago, IL",
    startDate: "2021-09-13",
    managerId: "1",
    manager: "Maya Patel",
    avatarSeed: "Noah Kim",
    salary: 132000,
    paySchedule: "Biweekly Salaried",
    directReports: ["5"],
    ssnMasked: "***-**-6610",
    filingStatus: "Single",
    stateTaxId: "IL-NK-3020",
    bankAccount: "Citi **** 5719",
    birthday: "Jun 11",
    workAnniversary: "Sep 13",
  },
  {
    id: "5",
    firstName: "Priya",
    lastName: "Shah",
    preferredName: "Priya",
    pronouns: "she/her",
    email: "priya.shah@circleworks.com",
    personalEmail: "priya.s@example.com",
    phone: "(555) 303-4455",
    dateOfBirth: "1996-12-04",
    address: { street: "77 Summer St", city: "Boston", state: "MA", zip: "02110" },
    title: "Payroll Specialist",
    department: "Payroll",
    employmentType: "Full-time",
    status: "Onboarding",
    payType: "Hourly",
    location: "Boston, MA",
    locationType: "Remote",
    startDate: "2026-06-03",
    managerId: "4",
    manager: "Noah Kim",
    avatarSeed: "Priya Shah",
    salary: 74880,
    hourlyRate: 36,
    paySchedule: "Weekly Hourly",
    directReports: [],
    ssnMasked: "***-**-9033",
    filingStatus: "Single",
    stateTaxId: "MA-PS-9421",
    bankAccount: "Not connected",
    birthday: "Dec 4",
    workAnniversary: "Jun 3",
  },
  {
    id: "6",
    firstName: "Chris",
    lastName: "Wong",
    preferredName: "Chris",
    pronouns: "he/him",
    email: "chris.wong@circleworks.com",
    personalEmail: "chris.w@example.com",
    phone: "(555) 611-5004",
    dateOfBirth: "1991-01-22",
    address: { street: "120 Pine St", city: "Seattle", state: "WA", zip: "98101" },
    title: "People Ops Manager",
    department: "People",
    employmentType: "Full-time",
    status: "Active",
    payType: "Salary",
    location: "Seattle, WA",
    locationType: "Hybrid",
    startDate: "2022-11-07",
    managerId: "1",
    manager: "Maya Patel",
    avatarSeed: "Chris Wong",
    salary: 118000,
    paySchedule: "Biweekly Salaried",
    directReports: ["8"],
    ssnMasked: "***-**-7120",
    filingStatus: "Married filing separately",
    stateTaxId: "WA-CW-3019",
    bankAccount: "Capital One **** 3342",
    birthday: "Jan 22",
    workAnniversary: "Nov 7",
  },
  {
    id: "7",
    firstName: "Samira",
    lastName: "Ndiaye",
    preferredName: "Samira",
    pronouns: "she/her",
    email: "samira.ndiaye@circleworks.com",
    personalEmail: "samira.n@example.com",
    phone: "(555) 449-8822",
    dateOfBirth: "1993-05-16",
    address: { street: "88 Peachtree St", city: "Atlanta", state: "GA", zip: "30303" },
    title: "Backend Engineer",
    department: "Engineering",
    employmentType: "Full-time",
    status: "On Leave",
    payType: "Salary",
    location: "Atlanta, GA",
    locationType: "Remote",
    startDate: "2024-03-04",
    managerId: "2",
    manager: "Avery Johnson",
    avatarSeed: "Samira Ndiaye",
    salary: 142000,
    paySchedule: "Biweekly Salaried",
    directReports: [],
    ssnMasked: "***-**-4851",
    filingStatus: "Single",
    stateTaxId: "GA-SN-8172",
    bankAccount: "SoFi **** 1009",
    birthday: "May 16",
    workAnniversary: "Mar 4",
  },
  {
    id: "8",
    firstName: "Jordan",
    lastName: "Lee",
    preferredName: "Jordan",
    pronouns: "he/him",
    email: "jordan.lee@circleworks.com",
    personalEmail: "jordan.l@example.com",
    phone: "(555) 818-0021",
    dateOfBirth: "1998-09-30",
    address: { street: "515 Broadway", city: "Denver", state: "CO", zip: "80203" },
    title: "HR Coordinator",
    department: "People",
    employmentType: "Part-time",
    status: "Active",
    payType: "Hourly",
    location: "Denver, CO",
    locationType: "Office",
    officeAddress: "515 Broadway, Denver, CO",
    startDate: "2025-07-21",
    managerId: "6",
    manager: "Chris Wong",
    avatarSeed: "Jordan Lee",
    salary: 49920,
    hourlyRate: 24,
    paySchedule: "Weekly Hourly",
    directReports: [],
    ssnMasked: "***-**-0284",
    filingStatus: "Single",
    stateTaxId: "CO-JL-5501",
    bankAccount: "US Bank **** 6712",
    birthday: "Sep 30",
    workAnniversary: "Jul 21",
  },
];

export function getEmployee(employeeId = "1") {
  return employees.find((employee) => employee.id === employeeId) || employees[0];
}

export function getEmployeeName(employee: EmployeeRecord) {
  return `${employee.firstName} ${employee.lastName}`;
}

export function getHeadcountEmployees() {
  return employees.filter((employee) => employee.status !== "Inactive" && employee.status !== "Terminated");
}

export function getMonthlyGrossPayroll() {
  return Math.round(getHeadcountEmployees().reduce((sum, employee) => sum + employee.salary, 0) / 12);
}

export function getEmployeeApiFallback() {
  return employees.map((employee, index) => ({
    id: employee.id,
    firstName: employee.firstName,
    lastName: employee.lastName,
    email: employee.email,
    personalEmail: employee.personalEmail,
    jobTitle: employee.title,
    department: employee.department,
    employmentType: employee.employmentType.toLowerCase(),
    status: employee.status.toLowerCase().replace(/\s+/g, "-"),
    location: employee.location,
    locationType: employee.locationType === "Office" ? "On-Site" : employee.locationType,
    avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(getEmployeeName(employee))}&backgroundColor=transparent`,
    startDate: employee.startDate,
    salary: employee.salary,
    payType: employee.payType.toLowerCase(),
    managerId: employee.managerId || null,
    personalPhone: employee.phone,
    createdAt: `2026-01-${String(employees.length - index).padStart(2, "0")}T00:00:00.000Z`,
  }));
}

export function getDirectoryData(): DirectoryData {
  const active = employees.filter((employee) => employee.status === "Active" || employee.status === "Onboarding").length;
  const inactive = employees.filter((employee) => employee.status === "Inactive" || employee.status === "Terminated").length;
  return {
    employees,
    counts: { all: employees.length, active, inactive },
    filters: {
      departments: Array.from(new Set(employees.map((employee) => employee.department))),
      statuses: ["Active", "Inactive", "On Leave", "Onboarding", "Terminated"],
      payTypes: ["Salary", "Hourly"],
      locations: Array.from(new Set(employees.map((employee) => employee.location))),
      managers: Array.from(new Set(employees.map((employee) => employee.manager).filter(Boolean))),
    },
  };
}

export function getNewEmployeeData(): NewEmployeeData {
  return {
    departments: ["Engineering", "Payroll", "People", "Finance", "Sales", "Marketing", "Design", "Executive"],
    managers: employees.map((employee) => ({ id: employee.id, name: `${employee.firstName} ${employee.lastName}`, title: employee.title })),
    locations: [
      { label: "Remote", address: "Remote - United States" },
      { label: "San Francisco HQ", address: "221 Mission St, San Francisco, CA" },
      { label: "New York Office", address: "55 Water St, New York, NY" },
      { label: "Chicago Office", address: "440 W Lake St, Chicago, IL" },
    ],
    paySchedules: ["Biweekly Salaried", "Weekly Hourly", "Executive Semimonthly", "Contractor Monthly"],
    companyDomain: "circleworks.com",
  };
}

export function getProfileData(employeeId?: string): ProfileData {
  const employee = getEmployee(employeeId);
  const manager = employee.managerId ? getEmployee(employee.managerId) : undefined;
  const directReports = employee.directReports.map((id) => getEmployee(id));
  return {
    employee,
    manager,
    directReports,
    keyDates: [
      { label: "Hire date", date: employee.startDate, detail: `${employee.workAnniversary} anniversary` },
      { label: "Birthday", date: employee.birthday, detail: "Private visibility" },
      { label: "Next review", date: "Aug 15, 2026", detail: "Mid-year performance cycle" },
    ],
  };
}

export function getCompensationData(employeeId?: string): CompensationData {
  const employee = getEmployee(employeeId);
  return {
    employee,
    current: {
      payType: employee.payType,
      rate: employee.payType === "Hourly" ? employee.hourlyRate || 0 : employee.salary,
      frequency: employee.payType === "Hourly" ? "per hour" : "per year",
      effectiveDate: "Jan 1, 2026",
      paySchedule: employee.paySchedule,
    },
    history: [
      { id: "comp-3", oldRate: employee.salary - 12000, newRate: employee.salary, effectiveDate: "Jan 1, 2026", changedBy: "Maya Patel", reason: "Annual merit adjustment" },
      { id: "comp-2", oldRate: employee.salary - 24000, newRate: employee.salary - 12000, effectiveDate: "Jan 1, 2025", changedBy: "People Ops", reason: "Promotion calibration" },
      { id: "comp-1", oldRate: employee.salary - 36000, newRate: employee.salary - 24000, effectiveDate: employee.startDate, changedBy: "Recruiting", reason: "Initial offer" },
    ],
    payBand: {
      min: Math.round(employee.salary * 0.78),
      midpoint: Math.round(employee.salary * 0.94),
      max: Math.round(employee.salary * 1.18),
      employeeRate: employee.salary,
    },
  };
}

export function getDocumentsData(employeeId?: string): DocumentData {
  const employee = getEmployee(employeeId);
  return {
    employee,
    documents: [
      { id: "doc-1", type: "I-9", filename: `${employee.lastName}_i9.pdf`, uploadedAt: "Feb 2, 2026", expiresAt: "Feb 2, 2029", status: "Valid" },
      { id: "doc-2", type: "W-4", filename: `${employee.lastName}_w4_2026.pdf`, uploadedAt: "Jan 8, 2026", status: "Valid" },
      { id: "doc-3", type: "Offer Letter", filename: `${employee.lastName}_offer_signed.pdf`, uploadedAt: employee.startDate, status: "Valid" },
      { id: "doc-4", type: "Performance Review", filename: `${employee.lastName}_midyear_review.pdf`, uploadedAt: "Aug 15, 2025", expiresAt: "Aug 15, 2026", status: "Expiring Soon" },
    ],
    i9: {
      section1: employee.status === "Onboarding" ? "Pending employee" : "Complete",
      section2: employee.status === "Onboarding" ? "Pending employer review" : "Complete",
      reverifyDate: "Feb 2, 2029",
    },
  };
}

export function getActivityData(employeeId?: string): ActivityData {
  const employee = getEmployee(employeeId);
  return {
    employee,
    events: [
      { id: "act-1", date: "May 28, 2026 10:42 AM", actor: "Chris Wong", type: "Employment", field: "Manager", oldValue: "Maya Patel", newValue: employee.manager },
      { id: "act-2", date: "May 21, 2026 2:14 PM", actor: "Payroll Sync", type: "Payroll", field: "Pay schedule", oldValue: "Weekly Hourly", newValue: employee.paySchedule },
      { id: "act-3", date: "Apr 30, 2026 9:05 AM", actor: "Noah Kim", type: "Compensation", field: "Base pay", oldValue: "$132,000", newValue: `$${employee.salary.toLocaleString()}` },
      { id: "act-4", date: "Mar 11, 2026 4:38 PM", actor: employee.firstName, type: "Personal", field: "Address", oldValue: "Previous address", newValue: `${employee.address.city}, ${employee.address.state}` },
    ],
  };
}

export function getBulkImportData(): BulkImportData {
  return {
    templateFields: [
      { field: "first_name", required: true, notes: "Legal first name" },
      { field: "last_name", required: true, notes: "Legal last name" },
      { field: "personal_email", required: true, notes: "Invite destination" },
      { field: "job_title", required: true, notes: "Shown in directory" },
      { field: "department", required: true, notes: "Existing or new department" },
      { field: "manager_email", required: false, notes: "Used for org chart mapping" },
      { field: "start_date", required: true, notes: "YYYY-MM-DD" },
      { field: "pay_type", required: true, notes: "Salary or Hourly" },
    ],
    csvColumns: ["First Name", "Last Name", "Email", "Department", "Title", "Manager", "Start Date", "Salary"],
    mappedFields: [
      { column: "First Name", field: "first_name", confidence: "High" },
      { column: "Last Name", field: "last_name", confidence: "High" },
      { column: "Email", field: "personal_email", confidence: "High" },
      { column: "Title", field: "job_title", confidence: "High" },
      { column: "Manager", field: "manager_email", confidence: "Medium" },
      { column: "Salary", field: "base_pay", confidence: "Needs review" },
    ],
    validationRows: [
      { row: 7, employee: "Taylor Stone", field: "personal_email", issue: "Email domain appears misspelled", severity: "Warning" },
      { row: 12, employee: "Morgan Field", field: "start_date", issue: "Start date is missing", severity: "Error" },
      { row: 18, employee: "Lee Carter", field: "department", issue: "Department will be created", severity: "Warning" },
    ],
    lastImport: {
      id: "imp-2026-0528",
      importedAt: "May 28, 2026 3:14 PM",
      rows: 42,
      errors: 0,
    },
  };
}

export function getBenefitsData(employeeId?: string): BenefitsTabData {
  const employee = getEmployee(employeeId);
  return {
    employee,
    openEnrollment: "Nov 1-15, 2026",
    enrollments: [
      { plan: "Medical PPO", coverage: "Employee + spouse", employeeCost: 228, employerCost: 742, status: "Enrolled" },
      { plan: "Dental", coverage: "Employee only", employeeCost: 18, employerCost: 44, status: "Enrolled" },
      { plan: "401(k)", coverage: "6% contribution", employeeCost: 0, employerCost: 312, status: "Active" },
    ],
  };
}

export function getTimeData(employeeId?: string): TimeTabData {
  const employee = getEmployee(employeeId);
  return {
    employee,
    pto: { balance: 96, used: 24, scheduled: 16 },
    recentTimesheets: [
      { period: "May 16-31, 2026", regularHours: employee.payType === "Hourly" ? 78 : 80, overtimeHours: employee.payType === "Hourly" ? 2 : 0, status: "Approved" },
      { period: "May 1-15, 2026", regularHours: 80, overtimeHours: 0, status: "Approved" },
      { period: "Apr 16-30, 2026", regularHours: 76, overtimeHours: 0, status: "Submitted" },
    ],
  };
}

export function getPayrollData(employeeId?: string): PayrollTabData {
  const employee = getEmployee(employeeId);
  return {
    employee,
    ytdGross: Math.round(employee.salary * 0.42),
    ytdTaxes: Math.round(employee.salary * 0.095),
    ytdNet: Math.round(employee.salary * 0.31),
    paystubs: [
      { id: "stub-0520", date: "May 20, 2026", gross: Math.round(employee.salary / 26), net: Math.round(employee.salary / 26 * 0.72), status: "Paid" },
      { id: "stub-0505", date: "May 5, 2026", gross: Math.round(employee.salary / 26), net: Math.round(employee.salary / 26 * 0.72), status: "Paid" },
      { id: "stub-0420", date: "Apr 20, 2026", gross: Math.round(employee.salary / 26), net: Math.round(employee.salary / 26 * 0.71), status: "Paid" },
    ],
  };
}

export function getPerformanceData(employeeId?: string): PerformanceTabData {
  const employee = getEmployee(employeeId);
  return {
    employee,
    reviews: [
      { cycle: "2026 Mid-Year", rating: "Exceeds expectations", reviewer: employee.manager, completedAt: "Aug 15, 2026" },
      { cycle: "2025 Annual", rating: "Strong performance", reviewer: employee.manager, completedAt: "Jan 12, 2026" },
    ],
    goals: [
      { title: "Improve employee self-service completion", progress: 72, status: "On track" },
      { title: "Document team operating model", progress: 48, status: "At risk" },
      { title: "Mentor peer group", progress: 90, status: "On track" },
    ],
  };
}

export function getOrgChartData(): OrgChartData {
  return {
    employees,
    departments: Array.from(new Set(employees.map((employee) => employee.department))),
  };
}

export function getHrisModuleData(screen: HrisModuleScreen, employeeId?: string): HrisModuleData {
  if (screen === "new") return getNewEmployeeData();
  if (screen === "profile") return getProfileData(employeeId);
  if (screen === "compensation") return getCompensationData(employeeId);
  if (screen === "benefits") return getBenefitsData(employeeId);
  if (screen === "time") return getTimeData(employeeId);
  if (screen === "documents") return getDocumentsData(employeeId);
  if (screen === "payroll") return getPayrollData(employeeId);
  if (screen === "performance") return getPerformanceData(employeeId);
  if (screen === "activity") return getActivityData(employeeId);
  if (screen === "bulk") return getBulkImportData();
  if (screen === "org-chart") return getOrgChartData();
  return getDirectoryData();
}

export function applyHrisAction(action: string) {
  return {
    ok: true,
    action,
    updatedAt: new Date().toISOString(),
  };
}
