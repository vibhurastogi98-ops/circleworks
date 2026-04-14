/**
 * Mock data for the 1099 Contractor Management Hub.
 * Provides contractors, contracts, invoices, W-9 records, and 1099-NEC data.
 */

export type ContractorStatus = "Active" | "Pending" | "Inactive" | "Onboarding";
export type W9Status = "Collected" | "Pending" | "Expired" | "Not Submitted";
export type ContractType = "Hourly" | "Project" | "Retainer";
export type InvoiceStatus = "Pending" | "Approved" | "Rejected" | "Revision Requested" | "Paid";
export type OnboardingStep = "Invited" | "Signed Up" | "W-9 Submitted" | "Bank Added" | "Activated";

export interface Contractor {
  id: string;
  name: string;
  businessName: string;
  email: string;
  phone: string;
  status: ContractorStatus;
  w9Status: W9Status;
  taxClassification: string;
  tin: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  ytdPayments: number;
  avatarSeed: string;
  onboardingStep: OnboardingStep;
  onboardedDate: string | null;
  bankConnected: boolean;
  bankMethod: "Plaid" | "Manual" | null;
  bankLast4: string | null;
  documents: ContractorDocument[];
}

export interface ContractorDocument {
  id: string;
  name: string;
  type: "W-9" | "Contract" | "Invoice" | "1099-NEC" | "NDA" | "Other";
  uploadedAt: string;
  size: string;
}

export interface ContractRecord {
  id: string;
  contractorId: string;
  contractorName: string;
  type: ContractType;
  title: string;
  startDate: string;
  endDate: string;
  rate: number;
  rateUnit: string;
  paymentTerms: string;
  status: "Active" | "Expired" | "Pending Signature" | "Draft";
  signedByContractor: boolean;
  signedByAdmin: boolean;
  signedAt: string | null;
  daysUntilExpiry: number;
}

export interface Invoice {
  id: string;
  contractorId: string;
  contractorName: string;
  invoiceNumber: string;
  amount: number;
  submittedDate: string;
  dueDate: string;
  status: InvoiceStatus;
  description: string;
  hours?: number;
  rate?: number;
  attachmentName?: string;
}

export interface NEC1099 {
  id: string;
  contractorId: string;
  contractorName: string;
  taxYear: number;
  tin: string;
  address: string;
  box1Amount: number;
  status: "Draft" | "Ready" | "Filed" | "Delivered" | "Corrected";
  filedDate: string | null;
  deliveredDate: string | null;
  deliveryMethod: "Email" | "Portal" | "Mail" | null;
}

/* ─── Contractors ──────────────────────────────────────────────── */

export const mockContractors: Contractor[] = [
  {
    id: "ctr-001",
    name: "Alice Chen",
    businessName: "Alice Design Studio LLC",
    email: "alice@designstudio.co",
    phone: "(415) 555-0101",
    status: "Active",
    w9Status: "Collected",
    taxClassification: "LLC - Single Member",
    tin: "***-**-4521",
    address: "1234 Market St, Suite 200",
    city: "San Francisco",
    state: "CA",
    zip: "94103",
    ytdPayments: 42500,
    avatarSeed: "alice-chen",
    onboardingStep: "Activated",
    onboardedDate: "2025-03-15",
    bankConnected: true,
    bankMethod: "Plaid",
    bankLast4: "8834",
    documents: [
      { id: "doc-001", name: "W-9_AliceChen_2025.pdf", type: "W-9", uploadedAt: "2025-03-15", size: "128 KB" },
      { id: "doc-002", name: "Design_Contract_2025.pdf", type: "Contract", uploadedAt: "2025-03-15", size: "342 KB" },
    ],
  },
  {
    id: "ctr-002",
    name: "Bob Martinez",
    businessName: "Martinez Development LLC",
    email: "bob@martinezdev.io",
    phone: "(512) 555-0202",
    status: "Active",
    w9Status: "Collected",
    taxClassification: "LLC - C Corp",
    tin: "***-**-7832",
    address: "4567 Congress Ave",
    city: "Austin",
    state: "TX",
    zip: "78701",
    ytdPayments: 67800,
    avatarSeed: "bob-martinez",
    onboardingStep: "Activated",
    onboardedDate: "2025-01-10",
    bankConnected: true,
    bankMethod: "Manual",
    bankLast4: "2291",
    documents: [
      { id: "doc-003", name: "W-9_BobMartinez_2025.pdf", type: "W-9", uploadedAt: "2025-01-10", size: "115 KB" },
    ],
  },
  {
    id: "ctr-003",
    name: "Carol Washington",
    businessName: "CW Content Strategy",
    email: "carol@cwcontent.net",
    phone: "(212) 555-0303",
    status: "Active",
    w9Status: "Collected",
    taxClassification: "Sole Proprietor",
    tin: "***-**-1155",
    address: "789 Broadway, 5th Fl",
    city: "New York",
    state: "NY",
    zip: "10003",
    ytdPayments: 18200,
    avatarSeed: "carol-washington",
    onboardingStep: "Activated",
    onboardedDate: "2025-02-20",
    bankConnected: true,
    bankMethod: "Plaid",
    bankLast4: "4410",
    documents: [
      { id: "doc-004", name: "W-9_CarolW_2025.pdf", type: "W-9", uploadedAt: "2025-02-20", size: "108 KB" },
    ],
  },
  {
    id: "ctr-004",
    name: "David Kim",
    businessName: "Kim Consulting Group",
    email: "david@kimconsulting.com",
    phone: "(206) 555-0404",
    status: "Pending",
    w9Status: "Pending",
    taxClassification: "S Corporation",
    tin: "",
    address: "321 Pike St",
    city: "Seattle",
    state: "WA",
    zip: "98101",
    ytdPayments: 0,
    avatarSeed: "david-kim",
    onboardingStep: "Signed Up",
    onboardedDate: null,
    bankConnected: false,
    bankMethod: null,
    bankLast4: null,
    documents: [],
  },
  {
    id: "ctr-005",
    name: "Elena Volkov",
    businessName: "Volkov Analytics",
    email: "elena@volkovanalytics.com",
    phone: "(305) 555-0505",
    status: "Onboarding",
    w9Status: "Not Submitted",
    taxClassification: "",
    tin: "",
    address: "",
    city: "Miami",
    state: "FL",
    zip: "33101",
    ytdPayments: 0,
    avatarSeed: "elena-volkov",
    onboardingStep: "Invited",
    onboardedDate: null,
    bankConnected: false,
    bankMethod: null,
    bankLast4: null,
    documents: [],
  },
  {
    id: "ctr-006",
    name: "Frank Okafor",
    businessName: "Okafor Engineering",
    email: "frank@okaforeng.com",
    phone: "(404) 555-0606",
    status: "Active",
    w9Status: "Expired",
    taxClassification: "LLC - Partnership",
    tin: "***-**-9921",
    address: "555 Peachtree St NE",
    city: "Atlanta",
    state: "GA",
    zip: "30308",
    ytdPayments: 31400,
    avatarSeed: "frank-okafor",
    onboardingStep: "Activated",
    onboardedDate: "2024-06-01",
    bankConnected: true,
    bankMethod: "Manual",
    bankLast4: "1772",
    documents: [
      { id: "doc-005", name: "W-9_FrankO_2024.pdf", type: "W-9", uploadedAt: "2024-06-01", size: "121 KB" },
    ],
  },
  {
    id: "ctr-007",
    name: "Grace Liu",
    businessName: "Liu UX Lab",
    email: "grace@liuuxlab.design",
    phone: "(312) 555-0707",
    status: "Inactive",
    w9Status: "Collected",
    taxClassification: "Sole Proprietor",
    tin: "***-**-3348",
    address: "222 Michigan Ave",
    city: "Chicago",
    state: "IL",
    zip: "60601",
    ytdPayments: 4500,
    avatarSeed: "grace-liu",
    onboardingStep: "Activated",
    onboardedDate: "2024-09-15",
    bankConnected: true,
    bankMethod: "Plaid",
    bankLast4: "6654",
    documents: [
      { id: "doc-006", name: "W-9_GraceLiu_2024.pdf", type: "W-9", uploadedAt: "2024-09-15", size: "118 KB" },
    ],
  },
  {
    id: "ctr-008",
    name: "Henry Patel",
    businessName: "Patel DevOps Solutions",
    email: "henry@pateldevops.io",
    phone: "(720) 555-0808",
    status: "Onboarding",
    w9Status: "Pending",
    taxClassification: "LLC - Single Member",
    tin: "",
    address: "888 Colfax Ave",
    city: "Denver",
    state: "CO",
    zip: "80204",
    ytdPayments: 0,
    avatarSeed: "henry-patel",
    onboardingStep: "W-9 Submitted",
    onboardedDate: null,
    bankConnected: false,
    bankMethod: null,
    bankLast4: null,
    documents: [
      { id: "doc-007", name: "W-9_HenryP_2025.pdf", type: "W-9", uploadedAt: "2025-04-10", size: "112 KB" },
    ],
  },
];

/* ─── Contracts ────────────────────────────────────────────────── */

export const mockContracts: ContractRecord[] = [
  {
    id: "con-001",
    contractorId: "ctr-001",
    contractorName: "Alice Chen",
    type: "Retainer",
    title: "UI/UX Design Services Agreement",
    startDate: "2025-03-15",
    endDate: "2026-03-14",
    rate: 8500,
    rateUnit: "/month",
    paymentTerms: "Net 15",
    status: "Active",
    signedByContractor: true,
    signedByAdmin: true,
    signedAt: "2025-03-14",
    daysUntilExpiry: 335,
  },
  {
    id: "con-002",
    contractorId: "ctr-002",
    contractorName: "Bob Martinez",
    type: "Hourly",
    title: "Full-Stack Development Contract",
    startDate: "2025-01-10",
    endDate: "2025-12-31",
    rate: 175,
    rateUnit: "/hour",
    paymentTerms: "Net 30",
    status: "Active",
    signedByContractor: true,
    signedByAdmin: true,
    signedAt: "2025-01-09",
    daysUntilExpiry: 261,
  },
  {
    id: "con-003",
    contractorId: "ctr-003",
    contractorName: "Carol Washington",
    type: "Project",
    title: "Q2 Content Strategy Deliverables",
    startDate: "2025-04-01",
    endDate: "2025-06-30",
    rate: 12000,
    rateUnit: "/project",
    paymentTerms: "50% upfront, 50% on delivery",
    status: "Active",
    signedByContractor: true,
    signedByAdmin: true,
    signedAt: "2025-03-28",
    daysUntilExpiry: 77,
  },
  {
    id: "con-004",
    contractorId: "ctr-006",
    contractorName: "Frank Okafor",
    type: "Hourly",
    title: "Infrastructure Security Audit",
    startDate: "2025-02-01",
    endDate: "2025-05-15",
    rate: 200,
    rateUnit: "/hour",
    paymentTerms: "Net 15",
    status: "Active",
    signedByContractor: true,
    signedByAdmin: true,
    signedAt: "2025-01-30",
    daysUntilExpiry: 31,
  },
  {
    id: "con-005",
    contractorId: "ctr-007",
    contractorName: "Grace Liu",
    type: "Project",
    title: "Mobile App Redesign",
    startDate: "2024-09-15",
    endDate: "2025-01-31",
    rate: 25000,
    rateUnit: "/project",
    paymentTerms: "Milestone-based",
    status: "Expired",
    signedByContractor: true,
    signedByAdmin: true,
    signedAt: "2024-09-14",
    daysUntilExpiry: -73,
  },
  {
    id: "con-006",
    contractorId: "ctr-004",
    contractorName: "David Kim",
    type: "Retainer",
    title: "Strategic Consulting Engagement",
    startDate: "2025-05-01",
    endDate: "2026-04-30",
    rate: 15000,
    rateUnit: "/month",
    paymentTerms: "Net 30",
    status: "Pending Signature",
    signedByContractor: false,
    signedByAdmin: true,
    signedAt: null,
    daysUntilExpiry: 382,
  },
];

/* ─── Invoices ─────────────────────────────────────────────────── */

export const mockInvoices: Invoice[] = [
  {
    id: "inv-001",
    contractorId: "ctr-001",
    contractorName: "Alice Chen",
    invoiceNumber: "ADS-2025-042",
    amount: 8500,
    submittedDate: "2025-04-01",
    dueDate: "2025-04-15",
    status: "Approved",
    description: "April 2025 Retainer — UI/UX Design Services",
    attachmentName: "ADS-2025-042.pdf",
  },
  {
    id: "inv-002",
    contractorId: "ctr-002",
    contractorName: "Bob Martinez",
    invoiceNumber: "MDL-2025-018",
    amount: 12250,
    submittedDate: "2025-04-05",
    dueDate: "2025-05-05",
    status: "Pending",
    description: "March 28 – April 4: 70 hours full-stack development",
    hours: 70,
    rate: 175,
    attachmentName: "MDL-2025-018.pdf",
  },
  {
    id: "inv-003",
    contractorId: "ctr-003",
    contractorName: "Carol Washington",
    invoiceNumber: "CW-2025-007",
    amount: 6000,
    submittedDate: "2025-04-10",
    dueDate: "2025-04-25",
    status: "Pending",
    description: "Content strategy deliverables — Phase 1 (50% milestone)",
    attachmentName: "CW-2025-007.pdf",
  },
  {
    id: "inv-004",
    contractorId: "ctr-006",
    contractorName: "Frank Okafor",
    invoiceNumber: "OE-2025-011",
    amount: 7600,
    submittedDate: "2025-04-08",
    dueDate: "2025-04-22",
    status: "Revision Requested",
    description: "Security audit — 38 hours (needs supporting timesheet)",
    hours: 38,
    rate: 200,
  },
  {
    id: "inv-005",
    contractorId: "ctr-001",
    contractorName: "Alice Chen",
    invoiceNumber: "ADS-2025-041",
    amount: 8500,
    submittedDate: "2025-03-01",
    dueDate: "2025-03-15",
    status: "Paid",
    description: "March 2025 Retainer — UI/UX Design Services",
    attachmentName: "ADS-2025-041.pdf",
  },
  {
    id: "inv-006",
    contractorId: "ctr-002",
    contractorName: "Bob Martinez",
    invoiceNumber: "MDL-2025-017",
    amount: 14000,
    submittedDate: "2025-03-05",
    dueDate: "2025-04-04",
    status: "Paid",
    description: "February 24 – March 2: 80 hours full-stack development",
    hours: 80,
    rate: 175,
  },
  {
    id: "inv-007",
    contractorId: "ctr-006",
    contractorName: "Frank Okafor",
    invoiceNumber: "OE-2025-010",
    amount: 9800,
    submittedDate: "2025-03-10",
    dueDate: "2025-03-24",
    status: "Paid",
    description: "Security audit — 49 hours cloud infrastructure review",
    hours: 49,
    rate: 200,
  },
];

/* ─── 1099-NEC Records ────────────────────────────────────────── */

export const mock1099s: NEC1099[] = [
  {
    id: "nec-001",
    contractorId: "ctr-001",
    contractorName: "Alice Chen",
    taxYear: 2024,
    tin: "***-**-4521",
    address: "1234 Market St, Suite 200, San Francisco, CA 94103",
    box1Amount: 78000,
    status: "Filed",
    filedDate: "2025-01-28",
    deliveredDate: "2025-01-28",
    deliveryMethod: "Email",
  },
  {
    id: "nec-002",
    contractorId: "ctr-002",
    contractorName: "Bob Martinez",
    taxYear: 2024,
    tin: "***-**-7832",
    address: "4567 Congress Ave, Austin, TX 78701",
    box1Amount: 92400,
    status: "Filed",
    filedDate: "2025-01-28",
    deliveredDate: "2025-01-29",
    deliveryMethod: "Portal",
  },
  {
    id: "nec-003",
    contractorId: "ctr-006",
    contractorName: "Frank Okafor",
    taxYear: 2024,
    tin: "***-**-9921",
    address: "555 Peachtree St NE, Atlanta, GA 30308",
    box1Amount: 48200,
    status: "Delivered",
    filedDate: "2025-01-28",
    deliveredDate: "2025-01-30",
    deliveryMethod: "Email",
  },
  {
    id: "nec-004",
    contractorId: "ctr-007",
    contractorName: "Grace Liu",
    taxYear: 2024,
    tin: "***-**-3348",
    address: "222 Michigan Ave, Chicago, IL 60601",
    box1Amount: 25000,
    status: "Delivered",
    filedDate: "2025-01-28",
    deliveredDate: "2025-01-31",
    deliveryMethod: "Portal",
  },
  {
    id: "nec-005",
    contractorId: "ctr-003",
    contractorName: "Carol Washington",
    taxYear: 2025,
    tin: "***-**-1155",
    address: "789 Broadway, 5th Fl, New York, NY 10003",
    box1Amount: 18200,
    status: "Draft",
    filedDate: null,
    deliveredDate: null,
    deliveryMethod: null,
  },
  {
    id: "nec-006",
    contractorId: "ctr-001",
    contractorName: "Alice Chen",
    taxYear: 2025,
    tin: "***-**-4521",
    address: "1234 Market St, Suite 200, San Francisco, CA 94103",
    box1Amount: 42500,
    status: "Draft",
    filedDate: null,
    deliveredDate: null,
    deliveryMethod: null,
  },
  {
    id: "nec-007",
    contractorId: "ctr-002",
    contractorName: "Bob Martinez",
    taxYear: 2025,
    tin: "***-**-7832",
    address: "4567 Congress Ave, Austin, TX 78701",
    box1Amount: 67800,
    status: "Draft",
    filedDate: null,
    deliveredDate: null,
    deliveryMethod: null,
  },
  {
    id: "nec-008",
    contractorId: "ctr-006",
    contractorName: "Frank Okafor",
    taxYear: 2025,
    tin: "***-**-9921",
    address: "555 Peachtree St NE, Atlanta, GA 30308",
    box1Amount: 31400,
    status: "Draft",
    filedDate: null,
    deliveredDate: null,
    deliveryMethod: null,
  },
];

/* ─── Summary Helpers ─────────────────────────────────────────── */

export function getContractorStats() {
  const active = mockContractors.filter(c => c.status === "Active").length;
  const pendingW9 = mockContractors.filter(c => c.w9Status === "Pending" || c.w9Status === "Not Submitted").length;
  const paymentsThisMonth = mockInvoices
    .filter(inv => inv.status === "Approved" || inv.status === "Paid")
    .filter(inv => {
      const d = new Date(inv.submittedDate);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, inv) => sum + inv.amount, 0);
  const necs1099Due = mock1099s.filter(n => n.status === "Draft" || n.status === "Ready").length;

  return { active, pendingW9, paymentsThisMonth, necs1099Due };
}
