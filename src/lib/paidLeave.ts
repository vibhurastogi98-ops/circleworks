export interface PaidLeaveProgram {
  id: string;
  stateCode: string;
  stateName: string;
  programName: string;
  employeeRate: number;
  employerRate: number;
  wageBase: number | null;
  employerWageBase?: number | null;
  wageBaseLabel?: string;
  lastUpdated: string;
  alert?: string | null;
  rateNote?: string;
  eligibilityRules: string[];
  duration: string;
  maxBenefit: string;
  ptoBalance: string;
}

const socialSecurityWageBase2026 = 184500;

export const paidLeavePrograms: PaidLeaveProgram[] = [
  {
    id: "ca-sdi-pfl",
    stateCode: "CA",
    stateName: "California",
    programName: "SDI/PFL",
    employeeRate: 1.3,
    employerRate: 0,
    wageBase: null,
    wageBaseLabel: "No wage cap",
    lastUpdated: "2026-01-01",
    alert: "New 2026 CA SDI rate published — update required",
    eligibilityRules: [
      "Employee must have California wages subject to SDI.",
      "State Disability Insurance generally requires at least $300 in base-period wages.",
      "Paid Family Leave is available for bonding, caregiving, and qualifying family events.",
    ],
    duration: "SDI up to 52 weeks; PFL up to 8 weeks",
    maxBenefit: "State weekly benefit cap applies",
    ptoBalance: "Tracks SDI/PFL alongside PTO balances",
  },
  {
    id: "ny-dbl-pfl",
    stateCode: "NY",
    stateName: "New York",
    programName: "DBL/PFL",
    employeeRate: 0.432,
    employerRate: 0,
    wageBase: 95349.54,
    wageBaseLabel: "$411.91 annual PFL cap",
    lastUpdated: "2026-01-01",
    rateNote: "DBL premium is policy-rated; PFL employee deduction shown.",
    eligibilityRules: [
      "PFL generally applies after 26 consecutive weeks for regular schedules.",
      "Shorter schedules may qualify after 175 days worked.",
      "DBL and PFL cannot be taken simultaneously for the same period.",
    ],
    duration: "PFL up to 12 weeks",
    maxBenefit: "$1,228.53 weekly PFL cap",
    ptoBalance: "PFL bank tracked separately from PTO",
  },
  {
    id: "wa-pfml",
    stateCode: "WA",
    stateName: "Washington",
    programName: "PFML",
    employeeRate: 0.807,
    employerRate: 0.323,
    wageBase: socialSecurityWageBase2026,
    lastUpdated: "2026-01-01",
    rateNote: "1.13% total premium; 71.43% employee and 28.57% employer share.",
    eligibilityRules: [
      "Employee must work enough covered Washington hours to qualify.",
      "State benefits are claimed directly through Washington Paid Leave.",
      "PTO may reduce benefits unless designated as supplemental benefits.",
    ],
    duration: "Generally up to 12 weeks; more for combined events",
    maxBenefit: "$1,647 weekly cap",
    ptoBalance: "Concurrent PTO and state leave tracked",
  },
  {
    id: "ma-pfml",
    stateCode: "MA",
    stateName: "Massachusetts",
    programName: "PFML",
    employeeRate: 0.46,
    employerRate: 0.42,
    wageBase: socialSecurityWageBase2026,
    lastUpdated: "2026-01-01",
    rateNote: "Large-employer split; employers with fewer than 25 covered individuals may owe no employer share.",
    eligibilityRules: [
      "Most Massachusetts covered workers qualify after meeting financial eligibility.",
      "Family and medical leave contributions are remitted by employers.",
      "PTO can be used to top off state benefits where policy allows.",
    ],
    duration: "Up to 12 weeks family, 20 weeks medical, 26 weeks combined",
    maxBenefit: "$1,230.39 weekly cap",
    ptoBalance: "PFML usage reduces available statutory leave, not PTO unless top-off is elected",
  },
  {
    id: "co-famli",
    stateCode: "CO",
    stateName: "Colorado",
    programName: "FAMLI",
    employeeRate: 0.44,
    employerRate: 0.44,
    wageBase: socialSecurityWageBase2026,
    lastUpdated: "2026-01-01",
    rateNote: "0.88% total premium split equally for covered employers.",
    eligibilityRules: [
      "Most employees qualify after earning at least $2,500 in Colorado wages.",
      "Employers with fewer than 10 employees are not required to pay the employer share.",
      "FAMLI can run concurrently with FMLA and eligible PTO top-off.",
    ],
    duration: "Up to 12 weeks; additional weeks for qualifying complications",
    maxBenefit: "State weekly benefit cap applies",
    ptoBalance: "FAMLI leave tracked concurrently with PTO top-off",
  },
  {
    id: "or-pfml",
    stateCode: "OR",
    stateName: "Oregon",
    programName: "PFML",
    employeeRate: 0.6,
    employerRate: 0.4,
    wageBase: socialSecurityWageBase2026,
    lastUpdated: "2026-01-01",
    rateNote: "1% total contribution; small employers generally do not owe the employer share.",
    eligibilityRules: [
      "Employees working in Oregon are covered unless specifically excluded.",
      "Employees pay 60% of the total contribution rate.",
      "Paid leave can coordinate with employer PTO policies.",
    ],
    duration: "Up to 12 weeks; additional pregnancy-related weeks may apply",
    maxBenefit: "State weekly benefit cap applies",
    ptoBalance: "Concurrent PTO and state leave tracked",
  },
  {
    id: "nj-tdi-fli",
    stateCode: "NJ",
    stateName: "New Jersey",
    programName: "TDI/FLI",
    employeeRate: 0.42,
    employerRate: 0.5,
    wageBase: 171100,
    employerWageBase: 44800,
    wageBaseLabel: "EE $171,100 / ER DI $44,800",
    lastUpdated: "2026-01-01",
    rateNote: "Employee rate combines TDI 0.19% and FLI 0.23%; employer DI varies by plan/rate.",
    eligibilityRules: [
      "Employee must meet base-week or alternative earnings rules.",
      "2026 base week threshold is $310.",
      "TDI covers an employee's own non-work illness or injury; FLI covers family leave.",
    ],
    duration: "TDI and FLI durations vary by claim type",
    maxBenefit: "$1,119 weekly cap",
    ptoBalance: "TDI/FLI tracked alongside PTO and disability leave",
  },
];

const statePatterns: Record<string, RegExp> = {
  CA: /\b(ca|california|san francisco|los angeles|san diego|sacramento|oakland|san jose)\b/i,
  NY: /\b(ny|new york|brooklyn|manhattan|queens|albany|buffalo)\b/i,
  WA: /\b(wa|washington|seattle|spokane|tacoma|olympia)\b/i,
  MA: /\b(ma|massachusetts|boston|cambridge|worcester)\b/i,
  CO: /\b(co|colorado|denver|boulder|aurora|colorado springs)\b/i,
  OR: /\b(or|oregon|portland|salem|eugene|bend)\b/i,
  NJ: /\b(nj|new jersey|newark|jersey city|trenton|hoboken)\b/i,
};

export function inferPaidLeaveStateCode(location?: string | null): string | null {
  if (!location) return null;
  for (const [stateCode, pattern] of Object.entries(statePatterns)) {
    if (pattern.test(location)) return stateCode;
  }
  return null;
}

export function programsForLocation(location?: string | null) {
  const stateCode = inferPaidLeaveStateCode(location);
  if (!stateCode) return [];
  return paidLeavePrograms.filter((program) => program.stateCode === stateCode);
}

export function calculatePaidLeaveContribution(program: PaidLeaveProgram, payrollTotal: number) {
  const employeeTaxable = program.wageBase === null ? payrollTotal : Math.min(payrollTotal, program.wageBase);
  const employerBase = program.employerWageBase ?? program.wageBase;
  const employerTaxable = employerBase === null ? payrollTotal : Math.min(payrollTotal, employerBase);
  const employeeContribution = employeeTaxable * (program.employeeRate / 100);
  const employerContribution = employerTaxable * (program.employerRate / 100);

  return {
    employeeTaxable,
    employerTaxable,
    employeeContribution,
    employerContribution,
    totalDue: employeeContribution + employerContribution,
  };
}
