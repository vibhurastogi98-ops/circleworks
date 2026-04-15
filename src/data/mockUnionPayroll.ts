// ─── Union Payroll Mock Data ─────────────────────────────────────────────────

export type UnionStatus = "Active" | "Inactive";
export type ContractStatus = "Active" | "Expired" | "Upcoming";
export type MembershipStatus = "Active" | "Inactive" | "On Leave";
export type ReportStatus = "Draft" | "Generated" | "Submitted" | "Confirmed";
export type ExportFormat = "SAG-AFTRA CSV" | "IATSE CSV" | "Generic CSV";

/* ─── Union Config ────────────────────────────────────────────── */

export type UnionConfig = {
  id: string;
  name: string;
  abbreviation: string;
  description: string;
  status: UnionStatus;
  memberCount: number;
  contractCount: number;
  color: string;
};

export const mockUnions: UnionConfig[] = [
  {
    id: "u-001",
    name: "Screen Actors Guild – American Federation of Television and Radio Artists",
    abbreviation: "SAG-AFTRA",
    description: "Primary union for performers in film, television, commercials, and new media.",
    status: "Active",
    memberCount: 8,
    contractCount: 2,
    color: "#6366F1",
  },
  {
    id: "u-002",
    name: "International Alliance of Theatrical Stage Employees",
    abbreviation: "IATSE",
    description: "Represents technicians, artisans, and craftspersons in entertainment and related industries.",
    status: "Active",
    memberCount: 12,
    contractCount: 3,
    color: "#0EA5E9",
  },
  {
    id: "u-003",
    name: "Writers Guild of America",
    abbreviation: "WGA",
    description: "Represents writers in the motion picture, broadcast, cable, and new media industries.",
    status: "Active",
    memberCount: 4,
    contractCount: 1,
    color: "#F59E0B",
  },
  {
    id: "u-004",
    name: "Directors Guild of America",
    abbreviation: "DGA",
    description: "Represents directors and members of the directorial team in film, television, and new media.",
    status: "Active",
    memberCount: 2,
    contractCount: 1,
    color: "#EF4444",
  },
];

/* ─── Union Contracts ─────────────────────────────────────────── */

export type UnionContract = {
  id: string;
  unionId: string;
  unionName: string;
  contractName: string;
  duesType: "percentage" | "flat";
  duesRate: number;
  pensionRate: number;
  healthWelfareRate: number;
  workDuesRate: number;
  effectiveDate: string;
  expirationDate: string;
  status: ContractStatus;
  fringeBenefits: FringeBenefit[];
};

export type FringeBenefit = {
  id: string;
  benefitName: string;
  rate: number;
  description: string;
};

export const mockUnionContracts: UnionContract[] = [
  {
    id: "uc-001",
    unionId: "u-001",
    unionName: "SAG-AFTRA",
    contractName: "SAG-AFTRA TV/Theatrical Agreement 2024-2027",
    duesType: "percentage",
    duesRate: 1.575,
    pensionRate: 17.0,
    healthWelfareRate: 1.0,
    workDuesRate: 1.0,
    effectiveDate: "2024-07-01",
    expirationDate: "2027-06-30",
    status: "Active",
    fringeBenefits: [
      { id: "fb-001", benefitName: "Vacation Accrual", rate: 5.5, description: "Annual vacation fund accrual" },
      { id: "fb-002", benefitName: "Holiday Pay", rate: 3.0, description: "Compensated holidays as per CBA" },
    ],
  },
  {
    id: "uc-002",
    unionId: "u-001",
    unionName: "SAG-AFTRA",
    contractName: "SAG-AFTRA Commercials Contract 2024",
    duesType: "percentage",
    duesRate: 1.575,
    pensionRate: 14.5,
    healthWelfareRate: 0.84,
    workDuesRate: 1.0,
    effectiveDate: "2024-01-01",
    expirationDate: "2025-12-31",
    status: "Active",
    fringeBenefits: [
      { id: "fb-003", benefitName: "Vacation Accrual", rate: 4.0, description: "Vacation fund for commercial talent" },
    ],
  },
  {
    id: "uc-003",
    unionId: "u-002",
    unionName: "IATSE",
    contractName: "IATSE Basic Agreement — Area Standards 2024",
    duesType: "percentage",
    duesRate: 2.0,
    pensionRate: 10.0,
    healthWelfareRate: 8.5,
    workDuesRate: 2.0,
    effectiveDate: "2024-01-01",
    expirationDate: "2026-12-31",
    status: "Active",
    fringeBenefits: [
      { id: "fb-004", benefitName: "Vacation Accrual", rate: 8.0, description: "Vacation/holiday pay as per IATSE CBA" },
      { id: "fb-005", benefitName: "Annuity", rate: 6.0, description: "Annuity fund contribution" },
      { id: "fb-006", benefitName: "Training", rate: 0.5, description: "CSATF training fund" },
    ],
  },
  {
    id: "uc-004",
    unionId: "u-002",
    unionName: "IATSE",
    contractName: "IATSE Low-Budget Sideletter 2024",
    duesType: "percentage",
    duesRate: 2.0,
    pensionRate: 8.0,
    healthWelfareRate: 7.0,
    workDuesRate: 2.0,
    effectiveDate: "2024-03-01",
    expirationDate: "2026-02-28",
    status: "Active",
    fringeBenefits: [
      { id: "fb-007", benefitName: "Vacation Accrual", rate: 6.0, description: "Low-budget vacation accrual" },
    ],
  },
  {
    id: "uc-005",
    unionId: "u-002",
    unionName: "IATSE",
    contractName: "IATSE New Media Agreement 2023",
    duesType: "percentage",
    duesRate: 2.0,
    pensionRate: 6.5,
    healthWelfareRate: 6.0,
    workDuesRate: 1.5,
    effectiveDate: "2023-07-01",
    expirationDate: "2025-06-30",
    status: "Active",
    fringeBenefits: [],
  },
  {
    id: "uc-006",
    unionId: "u-003",
    unionName: "WGA",
    contractName: "WGA 2023 MBA",
    duesType: "percentage",
    duesRate: 1.5,
    pensionRate: 8.5,
    healthWelfareRate: 8.5,
    workDuesRate: 1.0,
    effectiveDate: "2023-09-25",
    expirationDate: "2026-05-01",
    status: "Active",
    fringeBenefits: [
      { id: "fb-008", benefitName: "Vacation Accrual", rate: 4.0, description: "WGA vacation compensation" },
    ],
  },
  {
    id: "uc-007",
    unionId: "u-004",
    unionName: "DGA",
    contractName: "DGA Basic Agreement 2023-2026",
    duesType: "percentage",
    duesRate: 2.5,
    pensionRate: 13.0,
    healthWelfareRate: 7.5,
    workDuesRate: 0.5,
    effectiveDate: "2023-07-01",
    expirationDate: "2026-06-30",
    status: "Active",
    fringeBenefits: [
      { id: "fb-009", benefitName: "Vacation Accrual", rate: 5.0, description: "DGA vacation and holiday pay" },
    ],
  },
];

/* ─── Employee Union Memberships ──────────────────────────────── */

export type EmployeeUnionMembership = {
  id: string;
  employeeId: string;
  employeeName: string;
  avatar: string;
  department: string;
  unionId: string;
  unionAbbreviation: string;
  membershipNumber: string;
  joinDate: string;
  status: MembershipStatus;
};

export const mockEmployeeUnionMemberships: EmployeeUnionMembership[] = [
  { id: "eum-001", employeeId: "e-001", employeeName: "Sophia Park", avatar: "SP", department: "Talent", unionId: "u-001", unionAbbreviation: "SAG-AFTRA", membershipNumber: "SA-9274816", joinDate: "2019-05-12", status: "Active" },
  { id: "eum-002", employeeId: "e-001", employeeName: "Sophia Park", avatar: "SP", department: "Talent", unionId: "u-002", unionAbbreviation: "IATSE", membershipNumber: "IA-115823", joinDate: "2021-02-15", status: "Active" },
  { id: "eum-003", employeeId: "e-002", employeeName: "Elena Vasquez", avatar: "EV", department: "Talent", unionId: "u-001", unionAbbreviation: "SAG-AFTRA", membershipNumber: "SA-8150294", joinDate: "2017-09-20", status: "Active" },
  { id: "eum-004", employeeId: "e-003", employeeName: "David Chang", avatar: "DC", department: "Production", unionId: "u-001", unionAbbreviation: "SAG-AFTRA", membershipNumber: "SA-7693421", joinDate: "2020-01-10", status: "Active" },
  { id: "eum-005", employeeId: "e-003", employeeName: "David Chang", avatar: "DC", department: "Production", unionId: "u-004", unionAbbreviation: "DGA", membershipNumber: "DGA-48921", joinDate: "2022-06-01", status: "Active" },
  { id: "eum-006", employeeId: "e-004", employeeName: "Liam Foster", avatar: "LF", department: "Talent", unionId: "u-001", unionAbbreviation: "SAG-AFTRA", membershipNumber: "SA-9631047", joinDate: "2021-11-15", status: "Active" },
  { id: "eum-007", employeeId: "e-005", employeeName: "Nina Kowalski", avatar: "NK", department: "Talent", unionId: "u-001", unionAbbreviation: "SAG-AFTRA", membershipNumber: "SA-8847205", joinDate: "2018-03-28", status: "Active" },
  { id: "eum-008", employeeId: "e-006", employeeName: "Marcus Webb", avatar: "MW", department: "Writing", unionId: "u-003", unionAbbreviation: "WGA", membershipNumber: "WGA-W29184", joinDate: "2016-08-14", status: "Active" },
  { id: "eum-009", employeeId: "e-006", employeeName: "Marcus Webb", avatar: "MW", department: "Writing", unionId: "u-001", unionAbbreviation: "SAG-AFTRA", membershipNumber: "SA-6512830", joinDate: "2019-12-01", status: "Active" },
  { id: "eum-010", employeeId: "e-007", employeeName: "James Nakamura", avatar: "JN", department: "Production", unionId: "u-002", unionAbbreviation: "IATSE", membershipNumber: "IA-227614", joinDate: "2020-04-20", status: "Active" },
  { id: "eum-011", employeeId: "e-008", employeeName: "Alice Chen", avatar: "AC", department: "Writing", unionId: "u-003", unionAbbreviation: "WGA", membershipNumber: "WGA-W31502", joinDate: "2022-01-15", status: "Active" },
  { id: "eum-012", employeeId: "e-009", employeeName: "Tommy Lin", avatar: "TL", department: "Crew", unionId: "u-002", unionAbbreviation: "IATSE", membershipNumber: "IA-330491", joinDate: "2023-03-10", status: "Active" },
  { id: "eum-013", employeeId: "e-010", employeeName: "Diana Ross-Williams", avatar: "DR", department: "Production", unionId: "u-002", unionAbbreviation: "IATSE", membershipNumber: "IA-118902", joinDate: "2018-07-22", status: "Active" },
  { id: "eum-014", employeeId: "e-010", employeeName: "Diana Ross-Williams", avatar: "DR", department: "Production", unionId: "u-004", unionAbbreviation: "DGA", membershipNumber: "DGA-51093", joinDate: "2023-09-01", status: "Active" },
  { id: "eum-015", employeeId: "e-011", employeeName: "Carlos Mendez", avatar: "CM", department: "Crew", unionId: "u-002", unionAbbreviation: "IATSE", membershipNumber: "IA-445210", joinDate: "2022-11-05", status: "On Leave" },
  { id: "eum-016", employeeId: "e-012", employeeName: "Rachel Kim", avatar: "RK", department: "Writing", unionId: "u-003", unionAbbreviation: "WGA", membershipNumber: "WGA-W33870", joinDate: "2024-02-01", status: "Active" },
];

/* ─── Union Payroll Calculations (sample period) ──────────────── */

export type UnionPayrollCalc = {
  id: string;
  employeeName: string;
  unionAbbreviation: string;
  contractName: string;
  grossEarnings: number;
  duesDeduction: number;
  workDuesDeduction: number;
  pensionContribution: number;
  healthWelfareContribution: number;
  fringeContribution: number;
  totalEmployeeDeductions: number;
  totalEmployerContributions: number;
  hoursWorked: number;
  payPeriod: string;
};

export const mockUnionPayrollCalcs: UnionPayrollCalc[] = [
  { id: "upc-001", employeeName: "Sophia Park", unionAbbreviation: "SAG-AFTRA", contractName: "TV/Theatrical 2024-2027", grossEarnings: 8500, duesDeduction: 134, workDuesDeduction: 85, pensionContribution: 1445, healthWelfareContribution: 85, fringeContribution: 723, totalEmployeeDeductions: 219, totalEmployerContributions: 2253, hoursWorked: 40, payPeriod: "2025-04-01 to 2025-04-15" },
  { id: "upc-002", employeeName: "Sophia Park", unionAbbreviation: "IATSE", contractName: "Basic Agreement 2024", grossEarnings: 3200, duesDeduction: 64, workDuesDeduction: 64, pensionContribution: 320, healthWelfareContribution: 272, fringeContribution: 464, totalEmployeeDeductions: 128, totalEmployerContributions: 1056, hoursWorked: 16, payPeriod: "2025-04-01 to 2025-04-15" },
  { id: "upc-003", employeeName: "Elena Vasquez", unionAbbreviation: "SAG-AFTRA", contractName: "Commercials Contract 2024", grossEarnings: 6200, duesDeduction: 98, workDuesDeduction: 62, pensionContribution: 899, healthWelfareContribution: 52, fringeContribution: 248, totalEmployeeDeductions: 160, totalEmployerContributions: 1199, hoursWorked: 32, payPeriod: "2025-04-01 to 2025-04-15" },
  { id: "upc-004", employeeName: "David Chang", unionAbbreviation: "SAG-AFTRA", contractName: "TV/Theatrical 2024-2027", grossEarnings: 12000, duesDeduction: 189, workDuesDeduction: 120, pensionContribution: 2040, healthWelfareContribution: 120, fringeContribution: 1020, totalEmployeeDeductions: 309, totalEmployerContributions: 3180, hoursWorked: 60, payPeriod: "2025-04-01 to 2025-04-15" },
  { id: "upc-005", employeeName: "David Chang", unionAbbreviation: "DGA", contractName: "Basic Agreement 2023-2026", grossEarnings: 18500, duesDeduction: 463, workDuesDeduction: 93, pensionContribution: 2405, healthWelfareContribution: 1388, fringeContribution: 925, totalEmployeeDeductions: 556, totalEmployerContributions: 4718, hoursWorked: 80, payPeriod: "2025-04-01 to 2025-04-15" },
  { id: "upc-006", employeeName: "Marcus Webb", unionAbbreviation: "WGA", contractName: "WGA 2023 MBA", grossEarnings: 15000, duesDeduction: 225, workDuesDeduction: 150, pensionContribution: 1275, healthWelfareContribution: 1275, fringeContribution: 600, totalEmployeeDeductions: 375, totalEmployerContributions: 3150, hoursWorked: 0, payPeriod: "2025-04-01 to 2025-04-15" },
  { id: "upc-007", employeeName: "James Nakamura", unionAbbreviation: "IATSE", contractName: "Basic Agreement 2024", grossEarnings: 5800, duesDeduction: 116, workDuesDeduction: 116, pensionContribution: 580, healthWelfareContribution: 493, fringeContribution: 841, totalEmployeeDeductions: 232, totalEmployerContributions: 1914, hoursWorked: 45, payPeriod: "2025-04-01 to 2025-04-15" },
  { id: "upc-008", employeeName: "Tommy Lin", unionAbbreviation: "IATSE", contractName: "Low-Budget Sideletter 2024", grossEarnings: 3800, duesDeduction: 76, workDuesDeduction: 76, pensionContribution: 304, healthWelfareContribution: 266, fringeContribution: 228, totalEmployeeDeductions: 152, totalEmployerContributions: 798, hoursWorked: 32, payPeriod: "2025-04-01 to 2025-04-15" },
  { id: "upc-009", employeeName: "Diana Ross-Williams", unionAbbreviation: "IATSE", contractName: "Basic Agreement 2024", grossEarnings: 7200, duesDeduction: 144, workDuesDeduction: 144, pensionContribution: 720, healthWelfareContribution: 612, fringeContribution: 1044, totalEmployeeDeductions: 288, totalEmployerContributions: 2376, hoursWorked: 48, payPeriod: "2025-04-01 to 2025-04-15" },
  { id: "upc-010", employeeName: "Alice Chen", unionAbbreviation: "WGA", contractName: "WGA 2023 MBA", grossEarnings: 9500, duesDeduction: 143, workDuesDeduction: 95, pensionContribution: 808, healthWelfareContribution: 808, fringeContribution: 380, totalEmployeeDeductions: 238, totalEmployerContributions: 1996, hoursWorked: 0, payPeriod: "2025-04-01 to 2025-04-15" },
];

/* ─── Contribution Reports ────────────────────────────────────── */

export type UnionContributionReport = {
  id: string;
  unionName: string;
  unionAbbreviation: string;
  reportMonth: string;
  totalEarnings: number;
  totalDues: number;
  totalPension: number;
  totalHealthWelfare: number;
  totalFringe: number;
  employeeCount: number;
  totalHours: number;
  status: ReportStatus;
  exportFormat: ExportFormat;
};

export const mockContributionReports: UnionContributionReport[] = [
  { id: "ucr-001", unionName: "SAG-AFTRA", unionAbbreviation: "SAG-AFTRA", reportMonth: "2025-04", totalEarnings: 26700, totalDues: 421, totalPension: 4384, totalHealthWelfare: 257, totalFringe: 1991, employeeCount: 5, totalHours: 132, status: "Draft", exportFormat: "SAG-AFTRA CSV" },
  { id: "ucr-002", unionName: "IATSE", unionAbbreviation: "IATSE", reportMonth: "2025-04", totalEarnings: 20000, totalDues: 400, totalPension: 1924, totalHealthWelfare: 1643, totalFringe: 2577, employeeCount: 5, totalHours: 141, status: "Draft", exportFormat: "IATSE CSV" },
  { id: "ucr-003", unionName: "WGA", unionAbbreviation: "WGA", reportMonth: "2025-04", totalEarnings: 24500, totalDues: 368, totalPension: 2083, totalHealthWelfare: 2083, totalFringe: 980, employeeCount: 3, totalHours: 0, status: "Generated", exportFormat: "Generic CSV" },
  { id: "ucr-004", unionName: "DGA", unionAbbreviation: "DGA", reportMonth: "2025-04", totalEarnings: 18500, totalDues: 463, totalPension: 2405, totalHealthWelfare: 1388, totalFringe: 925, employeeCount: 2, totalHours: 80, status: "Generated", exportFormat: "Generic CSV" },
  { id: "ucr-005", unionName: "SAG-AFTRA", unionAbbreviation: "SAG-AFTRA", reportMonth: "2025-03", totalEarnings: 31200, totalDues: 491, totalPension: 5304, totalHealthWelfare: 312, totalFringe: 2340, employeeCount: 6, totalHours: 168, status: "Submitted", exportFormat: "SAG-AFTRA CSV" },
  { id: "ucr-006", unionName: "IATSE", unionAbbreviation: "IATSE", reportMonth: "2025-03", totalEarnings: 24800, totalDues: 496, totalPension: 2480, totalHealthWelfare: 2108, totalFringe: 3348, employeeCount: 6, totalHours: 196, status: "Confirmed", exportFormat: "IATSE CSV" },
  { id: "ucr-007", unionName: "WGA", unionAbbreviation: "WGA", reportMonth: "2025-03", totalEarnings: 28000, totalDues: 420, totalPension: 2380, totalHealthWelfare: 2380, totalFringe: 1120, employeeCount: 3, totalHours: 0, status: "Confirmed", exportFormat: "Generic CSV" },
  { id: "ucr-008", unionName: "DGA", unionAbbreviation: "DGA", reportMonth: "2025-03", totalEarnings: 15200, totalDues: 380, totalPension: 1976, totalHealthWelfare: 1140, totalFringe: 760, employeeCount: 2, totalHours: 72, status: "Confirmed", exportFormat: "Generic CSV" },
];

/* ─── Stats Helpers ───────────────────────────────────────────── */

export function getUnionPayrollStats() {
  const totalMembers = new Set(mockEmployeeUnionMemberships.filter(m => m.status === "Active").map(m => m.employeeId)).size;
  const totalMemberships = mockEmployeeUnionMemberships.filter(m => m.status === "Active").length;
  const currentMonthCalcs = mockUnionPayrollCalcs;

  const totalEmployeeDeductions = currentMonthCalcs.reduce((s, c) => s + c.totalEmployeeDeductions, 0);
  const totalEmployerContributions = currentMonthCalcs.reduce((s, c) => s + c.totalEmployerContributions, 0);
  const totalDues = currentMonthCalcs.reduce((s, c) => s + c.duesDeduction, 0);
  const totalPension = currentMonthCalcs.reduce((s, c) => s + c.pensionContribution, 0);
  const totalHW = currentMonthCalcs.reduce((s, c) => s + c.healthWelfareContribution, 0);
  const totalFringe = currentMonthCalcs.reduce((s, c) => s + c.fringeContribution, 0);

  const pendingReports = mockContributionReports.filter(r => r.status === "Draft" || r.status === "Generated").length;
  const submittedReports = mockContributionReports.filter(r => r.status === "Submitted" || r.status === "Confirmed").length;

  return {
    totalMembers,
    totalMemberships,
    activeUnions: mockUnions.filter(u => u.status === "Active").length,
    totalEmployeeDeductions,
    totalEmployerContributions,
    totalDues,
    totalPension,
    totalHW,
    totalFringe,
    pendingReports,
    submittedReports,
    currentPeriodGross: currentMonthCalcs.reduce((s, c) => s + c.grossEarnings, 0),
  };
}
