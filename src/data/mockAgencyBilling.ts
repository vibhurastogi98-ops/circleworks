// --- Mock Data for Agency Client Billing ---

export type BillingRateType = 'cost-plus' | 'fixed' | 'hourly';
export type BillingCycle = 'weekly' | 'bi-weekly' | 'monthly';
export type AgencyInvoiceStatus = 'Draft' | 'Approved' | 'Sent' | 'Paid';

export interface AgencyClient {
  id: number;
  name: string;
  email: string;
  contactName: string;
  logoUrl?: string;
  billingRateType: BillingRateType;
  markupPercentage: number;
  fixedFee: number;
  hourlyRate: number;
  billingCycle: BillingCycle;
  paymentTerms: string;
  accountingSync?: string;
}

export interface AgencyInvoice {
  id: number;
  invoiceNumber: string;
  clientId: number;
  clientName: string;
  periodStart: string;
  periodEnd: string;
  amount: number;
  status: AgencyInvoiceStatus;
  dueDate: string;
  sentAt?: string;
  paidAt?: string;
}

export const mockAgencyClients: AgencyClient[] = [
  {
    id: 1,
    name: "Nebula Tech Solutions",
    email: "billing@nebulatech.com",
    contactName: "Sarah Connor",
    billingRateType: 'cost-plus',
    markupPercentage: 15,
    fixedFee: 0,
    hourlyRate: 0,
    billingCycle: 'monthly',
    paymentTerms: 'Net 30',
    accountingSync: 'QuickBooks'
  },
  {
    id: 2,
    name: "Apex Creative Agency",
    email: "accounts@apexcreative.io",
    contactName: "Don Draper",
    billingRateType: 'hourly',
    markupPercentage: 0,
    fixedFee: 0,
    hourlyRate: 150,
    billingCycle: 'bi-weekly',
    paymentTerms: 'Net 15'
  },
  {
    id: 3,
    name: "Starlight Retail",
    email: "payables@starlight.co",
    contactName: "Gwen Stacy",
    billingRateType: 'fixed',
    markupPercentage: 0,
    fixedFee: 5000,
    hourlyRate: 0,
    billingCycle: 'monthly',
    paymentTerms: 'Net 30',
    accountingSync: 'Xero'
  }
];

export const mockAgencyInvoices: AgencyInvoice[] = [
  {
    id: 1,
    invoiceNumber: "INV-2025-001",
    clientId: 1,
    clientName: "Nebula Tech Solutions",
    periodStart: "2025-03-01",
    periodEnd: "2025-03-31",
    amount: 12500,
    status: 'Paid',
    dueDate: "2025-04-30",
    sentAt: "2025-04-01",
    paidAt: "2025-04-10"
  },
  {
    id: 2,
    invoiceNumber: "INV-2025-002",
    clientId: 2,
    clientName: "Apex Creative Agency",
    periodStart: "2025-04-01",
    periodEnd: "2025-04-15",
    amount: 8400,
    status: 'Sent',
    dueDate: "2025-04-30",
    sentAt: "2025-04-16"
  },
  {
    id: 3,
    invoiceNumber: "INV-2025-003",
    clientId: 1,
    clientName: "Nebula Tech Solutions",
    periodStart: "2025-04-01",
    periodEnd: "2025-04-30",
    amount: 13200,
    status: 'Draft',
    dueDate: "2025-05-30"
  }
];

export const mockAgencyInvoiceItems = [
  {
    id: 1,
    invoiceId: 1,
    description: "Cloud Architecture - March",
    employeeName: "Alice Chen",
    cost: 800000, // $8000.00
    markup: 120000,
    total: 920000
  },
  {
    id: 2,
    invoiceId: 1,
    description: "DevOps Support",
    employeeName: "Bob Smith",
    cost: 200000,
    markup: 30000,
    total: 230000
  },
  {
    id: 3,
    invoiceId: 2,
    description: "Brand Identity Workshop",
    employeeName: "Charlie Brown",
    cost: 500000,
    markup: 150000,
    total: 650000
  }
];
