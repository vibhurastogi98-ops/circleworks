// ─── Supplemental Payment Types & Royalty/Residual Mock Data ─────────────────

export type SupplementalPaymentType = "Royalty" | "Residual" | "Advance" | "Commission" | "Signing Bonus";
export type PaymentFrequency = "Monthly" | "Quarterly" | "Per Event" | "One-Time";
export type RecipientType = "W-2 Employee" | "1099 Contractor";
export type ScheduleStatus = "Active" | "Paused" | "Completed" | "Draft";
export type PaymentStatus = "Pending" | "Approved" | "Paid" | "Held" | "Recouping";

/* ─── Supplemental Payments ───────────────────────────────────── */

export type SupplementalPayment = {
  id: string;
  recipientName: string;
  recipientType: RecipientType;
  paymentType: SupplementalPaymentType;
  description: string;
  amount: number;
  taxTreatment: string;
  status: PaymentStatus;
  scheduledDate: string;
  paidDate?: string;
  projectTitle?: string;
  notes?: string;
};

export const mockSupplementalPayments: SupplementalPayment[] = [
  {
    id: "sp-001",
    recipientName: "Alice Chen",
    recipientType: "W-2 Employee",
    paymentType: "Royalty",
    description: "Q1 2025 Book Royalties — 'Design Systems at Scale'",
    amount: 4250,
    taxTreatment: "Supplemental flat rate (22%)",
    status: "Approved",
    scheduledDate: "2025-04-15",
    projectTitle: "Design Systems at Scale",
  },
  {
    id: "sp-002",
    recipientName: "Marco Reynolds",
    recipientType: "1099 Contractor",
    paymentType: "Royalty",
    description: "Music licensing royalty — March streams",
    amount: 12800,
    taxTreatment: "1099-MISC Box 2",
    status: "Paid",
    scheduledDate: "2025-04-01",
    paidDate: "2025-04-03",
    projectTitle: "Summer Vibes EP",
  },
  {
    id: "sp-003",
    recipientName: "Sophia Park",
    recipientType: "W-2 Employee",
    paymentType: "Residual",
    description: "SAG-AFTRA residual — Network rerun S3E12",
    amount: 1875,
    taxTreatment: "Supplemental flat rate (22%)",
    status: "Pending",
    scheduledDate: "2025-04-20",
    projectTitle: "City Lights (TV)",
  },
  {
    id: "sp-004",
    recipientName: "James Nakamura",
    recipientType: "1099 Contractor",
    paymentType: "Advance",
    description: "Advance against future royalties — podcast series",
    amount: 15000,
    taxTreatment: "Non-taxable (unrecouped advance)",
    status: "Paid",
    scheduledDate: "2025-01-15",
    paidDate: "2025-01-17",
    projectTitle: "Tech Unplugged Podcast",
    notes: "Recoupment begins when earned royalties exceed $15,000",
  },
  {
    id: "sp-005",
    recipientName: "Diana Ross-Williams",
    recipientType: "W-2 Employee",
    paymentType: "Commission",
    description: "Q1 sales commission — Tier 2 ($250K-$500K)",
    amount: 8750,
    taxTreatment: "Supplemental flat rate (22%)",
    status: "Approved",
    scheduledDate: "2025-04-10",
    notes: "8% on revenue $250K-$500K; 12% above $500K",
  },
  {
    id: "sp-006",
    recipientName: "Tommy Lin",
    recipientType: "W-2 Employee",
    paymentType: "Signing Bonus",
    description: "New hire signing bonus — 12-month repayment clause",
    amount: 25000,
    taxTreatment: "Supplemental flat rate (22%)",
    status: "Paid",
    scheduledDate: "2025-02-01",
    paidDate: "2025-02-03",
    notes: "Repayable pro-rata if tenure < 12 months",
  },
  {
    id: "sp-007",
    recipientName: "Elena Vasquez",
    recipientType: "1099 Contractor",
    paymentType: "Residual",
    description: "SAG-AFTRA residual — Streaming reuse Season 1",
    amount: 3420,
    taxTreatment: "1099-MISC Box 2",
    status: "Pending",
    scheduledDate: "2025-04-22",
    projectTitle: "Ocean Drive (Film)",
  },
  {
    id: "sp-008",
    recipientName: "Marcus Webb",
    recipientType: "W-2 Employee",
    paymentType: "Royalty",
    description: "Patent royalty — Q4 2024 licensing fees",
    amount: 6300,
    taxTreatment: "Supplemental flat rate (22%)",
    status: "Paid",
    scheduledDate: "2025-03-01",
    paidDate: "2025-03-05",
    projectTitle: "FlexiGrip Patent #US10234567",
  },
];

/* ─── Royalty Schedules ───────────────────────────────────────── */

export type RoyaltySchedule = {
  id: string;
  recipientName: string;
  recipientType: RecipientType;
  projectTitle: string;
  royaltyType: "Percentage" | "Flat Per Unit";
  rate: number;
  rateUnit: string;
  unitsSold: number;
  unitsThreshold: number;
  frequency: PaymentFrequency;
  advanceBalance: number;
  totalRecouped: number;
  totalEarned: number;
  status: ScheduleStatus;
  nextPaymentDate: string;
  createdDate: string;
};

export const mockRoyaltySchedules: RoyaltySchedule[] = [
  {
    id: "rs-001",
    recipientName: "Alice Chen",
    recipientType: "W-2 Employee",
    projectTitle: "Design Systems at Scale",
    royaltyType: "Percentage",
    rate: 12,
    rateUnit: "% of net sales",
    unitsSold: 14250,
    unitsThreshold: 1000,
    frequency: "Quarterly",
    advanceBalance: 0,
    totalRecouped: 20000,
    totalEarned: 28500,
    status: "Active",
    nextPaymentDate: "2025-07-01",
    createdDate: "2023-06-15",
  },
  {
    id: "rs-002",
    recipientName: "Marco Reynolds",
    recipientType: "1099 Contractor",
    projectTitle: "Summer Vibes EP",
    royaltyType: "Flat Per Unit",
    rate: 0.004,
    rateUnit: "per stream",
    unitsSold: 8450000,
    unitsThreshold: 100000,
    frequency: "Monthly",
    advanceBalance: 0,
    totalRecouped: 25000,
    totalEarned: 33800,
    status: "Active",
    nextPaymentDate: "2025-05-01",
    createdDate: "2024-03-01",
  },
  {
    id: "rs-003",
    recipientName: "James Nakamura",
    recipientType: "1099 Contractor",
    projectTitle: "Tech Unplugged Podcast",
    royaltyType: "Percentage",
    rate: 15,
    rateUnit: "% of ad revenue",
    unitsSold: 0,
    unitsThreshold: 0,
    frequency: "Monthly",
    advanceBalance: 15000,
    totalRecouped: 6200,
    totalEarned: 6200,
    status: "Active",
    nextPaymentDate: "2025-05-01",
    createdDate: "2025-01-15",
  },
  {
    id: "rs-004",
    recipientName: "Marcus Webb",
    recipientType: "W-2 Employee",
    projectTitle: "FlexiGrip Patent #US10234567",
    royaltyType: "Percentage",
    rate: 5,
    rateUnit: "% of licensing fees",
    unitsSold: 0,
    unitsThreshold: 0,
    frequency: "Quarterly",
    advanceBalance: 0,
    totalRecouped: 0,
    totalEarned: 18900,
    status: "Active",
    nextPaymentDate: "2025-07-01",
    createdDate: "2022-11-01",
  },
  {
    id: "rs-005",
    recipientName: "Kira Johnson",
    recipientType: "1099 Contractor",
    projectTitle: "Mindful Mornings (Book)",
    royaltyType: "Percentage",
    rate: 10,
    rateUnit: "% of net sales",
    unitsSold: 3200,
    unitsThreshold: 500,
    frequency: "Quarterly",
    advanceBalance: 8000,
    totalRecouped: 4800,
    totalEarned: 4800,
    status: "Active",
    nextPaymentDate: "2025-07-01",
    createdDate: "2024-09-01",
  },
];

/* ─── Residual Payments (Entertainment) ───────────────────────── */

export type ResidualPayment = {
  id: string;
  talentName: string;
  showTitle: string;
  network: string;
  reuseType: string;
  scale: string;
  amount: number;
  category1099: string;
  paymentDate: string;
  status: "Imported" | "Verified" | "Paid" | "Disputed";
  batchId?: string;
};

export const mockResidualPayments: ResidualPayment[] = [
  {
    id: "res-001",
    talentName: "Sophia Park",
    showTitle: "City Lights",
    network: "HBO",
    reuseType: "Network Rerun",
    scale: "SAG-AFTRA Scale",
    amount: 1875,
    category1099: "1099-MISC Box 2",
    paymentDate: "2025-04-20",
    status: "Verified",
    batchId: "BATCH-2025-04",
  },
  {
    id: "res-002",
    talentName: "Elena Vasquez",
    showTitle: "Ocean Drive",
    network: "Netflix",
    reuseType: "Streaming — Initial Period",
    scale: "SAG-AFTRA Scale",
    amount: 3420,
    category1099: "1099-MISC Box 2",
    paymentDate: "2025-04-22",
    status: "Verified",
    batchId: "BATCH-2025-04",
  },
  {
    id: "res-003",
    talentName: "David Chang",
    showTitle: "Night Shift",
    network: "ABC",
    reuseType: "Cable Rerun",
    scale: "SAG-AFTRA Overscale",
    amount: 950,
    category1099: "1099-MISC Box 2",
    paymentDate: "2025-03-15",
    status: "Paid",
    batchId: "BATCH-2025-03",
  },
  {
    id: "res-004",
    talentName: "Sophia Park",
    showTitle: "City Lights",
    network: "Hulu",
    reuseType: "Streaming — Subsequent Use",
    scale: "SAG-AFTRA Scale",
    amount: 1250,
    category1099: "1099-MISC Box 2",
    paymentDate: "2025-03-15",
    status: "Paid",
    batchId: "BATCH-2025-03",
  },
  {
    id: "res-005",
    talentName: "Liam Foster",
    showTitle: "Downtown Blues",
    network: "CBS",
    reuseType: "Network Rerun",
    scale: "SAG-AFTRA Scale",
    amount: 2100,
    category1099: "1099-MISC Box 2",
    paymentDate: "2025-04-25",
    status: "Imported",
    batchId: "BATCH-2025-04",
  },
  {
    id: "res-006",
    talentName: "Nina Kowalski",
    showTitle: "Electric Dreams",
    network: "Amazon Prime",
    reuseType: "Streaming — Initial Period",
    scale: "SAG-AFTRA Scale",
    amount: 4600,
    category1099: "1099-MISC Box 2",
    paymentDate: "2025-04-25",
    status: "Imported",
    batchId: "BATCH-2025-04",
  },
];

/* ─── Stats Helper ─────────────────────────────────────────────── */

export function getSupplementalStats() {
  const pending = mockSupplementalPayments.filter(p => p.status === "Pending");
  const approved = mockSupplementalPayments.filter(p => p.status === "Approved");
  const paid = mockSupplementalPayments.filter(p => p.status === "Paid");

  const activeSchedules = mockRoyaltySchedules.filter(s => s.status === "Active");
  const unrecouperTotal = mockRoyaltySchedules.reduce((sum, s) => sum + Math.max(0, s.advanceBalance - s.totalRecouped), 0);

  return {
    pendingCount: pending.length,
    pendingTotal: pending.reduce((s, p) => s + p.amount, 0),
    approvedCount: approved.length,
    approvedTotal: approved.reduce((s, p) => s + p.amount, 0),
    paidCount: paid.length,
    paidTotal: paid.reduce((s, p) => s + p.amount, 0),
    activeSchedules: activeSchedules.length,
    unrecoupedAdvances: unrecouperTotal,
    residualsPending: mockResidualPayments.filter(r => r.status === "Imported" || r.status === "Verified").length,
  };
}
