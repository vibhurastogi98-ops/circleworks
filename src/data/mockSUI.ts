/* ─────────────────────────────────────────────────────────────────────────────
 *  Mock data for State Unemployment Insurance (SUI) Rate Management
 * ───────────────────────────────────────────────────────────────────────────── */

// ── Types ────────────────────────────────────────────────────────────────────

export interface SUIRateRecord {
  id: string;
  taxYear: number;
  rate: number;           // percentage, e.g. 3.4
  wageBase: number;       // e.g. 7000
  annualMaximum: number;  // rate * wageBase per employee
  dateUpdated: string;
  source: "Rate Notice" | "Manual Entry" | "OCR Import" | "State Portal";
}

export interface ExperienceRating {
  state: string;
  stateAbbr: string;
  reserveAccountBalance: number;
  benefitRatio: number;
  currentRateTier: string;
  yearsOfExperience: number;
  claimsHistory: { year: number; claims: number; premiums: number }[];
  projectedNextRate: number;
  projectedRateTier: string;
}

export interface VoluntaryContributionResult {
  contributionAmount: number;
  currentRate: number;
  currentTier: string;
  projectedNewRate: number;
  projectedNewTier: string;
  estimatedAnnualSavings: number;
  roiBreakevenMonths: number;
  totalEmployees: number;
  wageBase: number;
}

export interface SUIAlert {
  id: string;
  type: "rate_notice_expected" | "rate_not_updated" | "rate_change" | "info";
  severity: "warning" | "critical" | "info" | "success";
  state: string;
  stateAbbr: string;
  title: string;
  message: string;
  date: string;
  actionLabel?: string;
  dismissed?: boolean;
}

export interface MultiStateEntry {
  state: string;
  stateAbbr: string;
  currentRate: number;
  wageBase: number;
  employeeCount: number;
  annualLiability: number;
  dueDate: string;
  status: "current" | "needs_update" | "overdue";
  lastUpdated: string;
}

// ── California Rate History ─────────────────────────────────────────────────

export const CA_RATE_HISTORY: SUIRateRecord[] = [
  {
    id: "ca-2026",
    taxYear: 2026,
    rate: 3.4,
    wageBase: 7000,
    annualMaximum: 238,
    dateUpdated: "2025-12-18",
    source: "Rate Notice",
  },
  {
    id: "ca-2025",
    taxYear: 2025,
    rate: 3.4,
    wageBase: 7000,
    annualMaximum: 238,
    dateUpdated: "2024-12-12",
    source: "Rate Notice",
  },
  {
    id: "ca-2024",
    taxYear: 2024,
    rate: 2.9,
    wageBase: 7000,
    annualMaximum: 203,
    dateUpdated: "2023-12-20",
    source: "OCR Import",
  },
  {
    id: "ca-2023",
    taxYear: 2023,
    rate: 2.5,
    wageBase: 7000,
    annualMaximum: 175,
    dateUpdated: "2022-12-15",
    source: "Manual Entry",
  },
  {
    id: "ca-2022",
    taxYear: 2022,
    rate: 2.1,
    wageBase: 7000,
    annualMaximum: 147,
    dateUpdated: "2021-12-09",
    source: "State Portal",
  },
];

// ── New York Rate History ───────────────────────────────────────────────────

export const NY_RATE_HISTORY: SUIRateRecord[] = [
  {
    id: "ny-2026",
    taxYear: 2026,
    rate: 4.1,
    wageBase: 12500,
    annualMaximum: 512.5,
    dateUpdated: "2025-12-20",
    source: "Rate Notice",
  },
  {
    id: "ny-2025",
    taxYear: 2025,
    rate: 3.8,
    wageBase: 12300,
    annualMaximum: 467.4,
    dateUpdated: "2024-12-14",
    source: "Rate Notice",
  },
  {
    id: "ny-2024",
    taxYear: 2024,
    rate: 3.5,
    wageBase: 12000,
    annualMaximum: 420,
    dateUpdated: "2023-12-18",
    source: "Manual Entry",
  },
  {
    id: "ny-2023",
    taxYear: 2023,
    rate: 3.2,
    wageBase: 12000,
    annualMaximum: 384,
    dateUpdated: "2022-12-12",
    source: "State Portal",
  },
];

// ── Texas Rate History ──────────────────────────────────────────────────────

export const TX_RATE_HISTORY: SUIRateRecord[] = [
  {
    id: "tx-2026",
    taxYear: 2026,
    rate: 2.7,
    wageBase: 9000,
    annualMaximum: 243,
    dateUpdated: "2025-11-30",
    source: "Rate Notice",
  },
  {
    id: "tx-2025",
    taxYear: 2025,
    rate: 2.7,
    wageBase: 9000,
    annualMaximum: 243,
    dateUpdated: "2024-11-28",
    source: "OCR Import",
  },
  {
    id: "tx-2024",
    taxYear: 2024,
    rate: 2.3,
    wageBase: 9000,
    annualMaximum: 207,
    dateUpdated: "2023-11-25",
    source: "Rate Notice",
  },
];

// ── All Rate Histories ──────────────────────────────────────────────────────

export const ALL_RATE_HISTORIES: Record<string, SUIRateRecord[]> = {
  CA: CA_RATE_HISTORY,
  NY: NY_RATE_HISTORY,
  TX: TX_RATE_HISTORY,
};

// ── Experience Ratings ──────────────────────────────────────────────────────

export const EXPERIENCE_RATINGS: ExperienceRating[] = [
  {
    state: "California",
    stateAbbr: "CA",
    reserveAccountBalance: 48_250,
    benefitRatio: 0.032,
    currentRateTier: "D (3.4%)",
    yearsOfExperience: 6,
    claimsHistory: [
      { year: 2021, claims: 12400, premiums: 32100 },
      { year: 2022, claims: 8600, premiums: 34800 },
      { year: 2023, claims: 15200, premiums: 36500 },
      { year: 2024, claims: 6800, premiums: 38200 },
      { year: 2025, claims: 9100, premiums: 39800 },
      { year: 2026, claims: 3200, premiums: 15600 },
    ],
    projectedNextRate: 3.1,
    projectedRateTier: "C (3.1%)",
  },
  {
    state: "New York",
    stateAbbr: "NY",
    reserveAccountBalance: 31_800,
    benefitRatio: 0.048,
    currentRateTier: "E (4.1%)",
    yearsOfExperience: 4,
    claimsHistory: [
      { year: 2023, claims: 18200, premiums: 22400 },
      { year: 2024, claims: 14500, premiums: 24800 },
      { year: 2025, claims: 11200, premiums: 26100 },
      { year: 2026, claims: 4800, premiums: 10200 },
    ],
    projectedNextRate: 3.6,
    projectedRateTier: "D (3.6%)",
  },
  {
    state: "Texas",
    stateAbbr: "TX",
    reserveAccountBalance: 52_100,
    benefitRatio: 0.021,
    currentRateTier: "B (2.7%)",
    yearsOfExperience: 8,
    claimsHistory: [
      { year: 2021, claims: 5200, premiums: 28400 },
      { year: 2022, claims: 3800, premiums: 30100 },
      { year: 2023, claims: 7100, premiums: 31500 },
      { year: 2024, claims: 4200, premiums: 32800 },
      { year: 2025, claims: 5500, premiums: 34100 },
      { year: 2026, claims: 1800, premiums: 12200 },
    ],
    projectedNextRate: 2.4,
    projectedRateTier: "B (2.4%)",
  },
];

// ── Annual Rate Change Alerts ───────────────────────────────────────────────

export const SUI_ALERTS: SUIAlert[] = [
  {
    id: "alert-1",
    type: "rate_not_updated",
    severity: "critical",
    state: "New York",
    stateAbbr: "NY",
    title: "NY SUI Rate Not Updated for 2026",
    message:
      "It has been over 30 days since January 1, 2026 and the New York SUI rate has not been confirmed. Please verify and update the rate to ensure accurate payroll tax calculations.",
    date: "2026-02-01",
    actionLabel: "Update Rate Now",
  },
  {
    id: "alert-2",
    type: "rate_notice_expected",
    severity: "warning",
    state: "California",
    stateAbbr: "CA",
    title: "Q4 SUI Rate Notice Expected — California",
    message:
      "California EDD typically mails SUI rate notices (DE 2088) in November/December. Watch for your 2027 rate notice and update rates before January 1.",
    date: "2026-11-01",
    actionLabel: "Set Reminder",
  },
  {
    id: "alert-3",
    type: "rate_change",
    severity: "info",
    state: "Texas",
    stateAbbr: "TX",
    title: "Texas SUI Rate Confirmed for 2026",
    message:
      "Texas Workforce Commission rate of 2.7% has been verified and applied. Wage base remains $9,000.",
    date: "2025-12-05",
  },
  {
    id: "alert-4",
    type: "rate_notice_expected",
    severity: "warning",
    state: "Texas",
    stateAbbr: "TX",
    title: "Q4 SUI Rate Notice Expected — Texas",
    message:
      "Texas Workforce Commission typically sends rate notices in October/November. Watch for your 2027 rate notice.",
    date: "2026-10-15",
    actionLabel: "Set Reminder",
  },
];

// ── Multi-State Overview ────────────────────────────────────────────────────

export const MULTI_STATE_VIEW: MultiStateEntry[] = [
  {
    state: "California",
    stateAbbr: "CA",
    currentRate: 3.4,
    wageBase: 7000,
    employeeCount: 28,
    annualLiability: 6664,
    dueDate: "Apr 30, 2026",
    status: "current",
    lastUpdated: "Dec 18, 2025",
  },
  {
    state: "New York",
    stateAbbr: "NY",
    currentRate: 4.1,
    wageBase: 12500,
    employeeCount: 12,
    annualLiability: 6150,
    dueDate: "Apr 30, 2026",
    status: "needs_update",
    lastUpdated: "Dec 20, 2025",
  },
  {
    state: "Texas",
    stateAbbr: "TX",
    currentRate: 2.7,
    wageBase: 9000,
    employeeCount: 7,
    annualLiability: 1701,
    dueDate: "Apr 30, 2026",
    status: "current",
    lastUpdated: "Nov 30, 2025",
  },
];

// ── Voluntary Contribution Helper ───────────────────────────────────────────

/** Simulate a voluntary contribution calculation for a given state. */
export function calculateVoluntaryContribution(
  stateAbbr: string,
  contributionAmount: number
): VoluntaryContributionResult | null {
  const experience = EXPERIENCE_RATINGS.find(
    (e) => e.stateAbbr === stateAbbr
  );
  const multiState = MULTI_STATE_VIEW.find((s) => s.stateAbbr === stateAbbr);
  if (!experience || !multiState) return null;

  const currentRate = multiState.currentRate;
  const wageBase = multiState.wageBase;
  const employees = multiState.employeeCount;

  // Simulate: every $1,000 voluntary contribution reduces rate by ~0.1%
  const rateReduction = Math.min(
    currentRate - 0.5,
    (contributionAmount / 1000) * 0.1
  );
  const projectedRate = Math.max(0.5, +(currentRate - rateReduction).toFixed(2));
  const currentAnnualCost = currentRate / 100 * wageBase * employees;
  const projectedAnnualCost = projectedRate / 100 * wageBase * employees;
  const annualSavings = Math.round(currentAnnualCost - projectedAnnualCost);
  const breakeven =
    annualSavings > 0
      ? +((contributionAmount / annualSavings) * 12).toFixed(1)
      : 0;

  // Map projected rate to tier names
  const tierMap = (rate: number): string => {
    if (rate <= 1.0) return "A";
    if (rate <= 2.0) return "B";
    if (rate <= 3.0) return "C";
    if (rate <= 4.0) return "D";
    return "E";
  };

  return {
    contributionAmount,
    currentRate,
    currentTier: `${tierMap(currentRate)} (${currentRate}%)`,
    projectedNewRate: projectedRate,
    projectedNewTier: `${tierMap(projectedRate)} (${projectedRate}%)`,
    estimatedAnnualSavings: annualSavings,
    roiBreakevenMonths: breakeven,
    totalEmployees: employees,
    wageBase,
  };
}
