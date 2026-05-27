// --- Mock Data for Agency Client Billing ---

export type BillingRateType = 'cost-plus' | 'fixed' | 'hourly';
export type BillingCycle = 'weekly' | 'bi-weekly' | 'monthly';
export type AgencyInvoiceStatus = 'Draft' | 'Approved' | 'Sent' | 'Paid';
export type AccountingSyncProvider = 'QuickBooks' | 'Xero' | 'None';

export interface AgencyClient {
  id: number;
  name: string;
  email: string;
  contactName: string;
  logoUrl?: string;
  invoiceTemplateCompanyName: string;
  invoiceTemplateLogoUrl?: string;
  billingRateType: BillingRateType;
  markupPercentage: number;
  fixedFee: number;
  hourlyRate: number;
  billingCycle: BillingCycle;
  paymentTerms: string;
  accountingSync?: AccountingSyncProvider;
  stripePaymentLink?: string;
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
  reimbursableExpenses: number;
  paymentLink: string;
  reminders: {
    sevenDaysBeforeDue: boolean;
    onDueDate: boolean;
    threeDaysOverdue: boolean;
  };
}

export interface AgencyInvoiceItem {
  id: number;
  invoiceId: number;
  employeeName: string;
  payPeriod: string;
  hoursOrSalary: string;
  cost: number;
  markup: number;
  total: number;
  itemType: 'labor' | 'expense';
  description: string;
}

export const mockAgencyClients: AgencyClient[] = [
  {
    id: 1,
    name: "Nebula Tech Solutions",
    email: "billing@nebulatech.com",
    contactName: "Sarah Connor",
    logoUrl: "https://ui-avatars.com/api/?name=Nebula+Tech&background=4f46e5&color=fff",
    invoiceTemplateCompanyName: "Nebula Tech Solutions",
    invoiceTemplateLogoUrl: "https://ui-avatars.com/api/?name=Nebula+Tech&background=4f46e5&color=fff",
    billingRateType: 'cost-plus',
    markupPercentage: 15,
    fixedFee: 0,
    hourlyRate: 0,
    billingCycle: 'monthly',
    paymentTerms: 'Net 30',
    accountingSync: 'QuickBooks',
    stripePaymentLink: 'https://pay.stripe.com/demo-nebula'
  },
  {
    id: 2,
    name: "Apex Creative Agency",
    email: "accounts@apexcreative.io",
    contactName: "Don Draper",
    logoUrl: "https://ui-avatars.com/api/?name=Apex+Creative&background=0f766e&color=fff",
    invoiceTemplateCompanyName: "Apex Creative Agency",
    invoiceTemplateLogoUrl: "https://ui-avatars.com/api/?name=Apex+Creative&background=0f766e&color=fff",
    billingRateType: 'hourly',
    markupPercentage: 0,
    fixedFee: 0,
    hourlyRate: 15000,
    billingCycle: 'bi-weekly',
    paymentTerms: 'Net 15',
    accountingSync: 'None',
    stripePaymentLink: 'https://pay.stripe.com/demo-apex'
  },
  {
    id: 3,
    name: "Starlight Retail",
    email: "payables@starlight.co",
    contactName: "Gwen Stacy",
    logoUrl: "https://ui-avatars.com/api/?name=Starlight+Retail&background=f59e0b&color=fff",
    invoiceTemplateCompanyName: "Starlight Retail",
    invoiceTemplateLogoUrl: "https://ui-avatars.com/api/?name=Starlight+Retail&background=f59e0b&color=fff",
    billingRateType: 'fixed',
    markupPercentage: 0,
    fixedFee: 500000,
    hourlyRate: 0,
    billingCycle: 'monthly',
    paymentTerms: 'Net 30',
    accountingSync: 'Xero',
    stripePaymentLink: 'https://pay.stripe.com/demo-starlight'
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
    amount: 1150000,
    status: 'Paid',
    dueDate: "2025-04-30",
    sentAt: "2025-04-01",
    paidAt: "2025-04-10",
    reimbursableExpenses: 0,
    paymentLink: "https://pay.stripe.com/demo-nebula-inv-001",
    reminders: {
      sevenDaysBeforeDue: true,
      onDueDate: true,
      threeDaysOverdue: true,
    }
  },
  {
    id: 2,
    invoiceNumber: "INV-2025-002",
    clientId: 2,
    clientName: "Apex Creative Agency",
    periodStart: "2025-04-01",
    periodEnd: "2025-04-15",
    amount: 792500,
    status: 'Sent',
    dueDate: "2025-04-30",
    sentAt: "2025-04-16",
    reimbursableExpenses: 12500,
    paymentLink: "https://pay.stripe.com/demo-apex-inv-002",
    reminders: {
      sevenDaysBeforeDue: true,
      onDueDate: true,
      threeDaysOverdue: true,
    }
  },
  {
    id: 3,
    invoiceNumber: "INV-2025-003",
    clientId: 1,
    clientName: "Nebula Tech Solutions",
    periodStart: "2025-04-01",
    periodEnd: "2025-04-30",
    amount: 1270000,
    status: 'Draft',
    dueDate: "2025-05-30",
    reimbursableExpenses: 120000,
    paymentLink: "https://pay.stripe.com/demo-nebula-inv-003",
    reminders: {
      sevenDaysBeforeDue: true,
      onDueDate: true,
      threeDaysOverdue: true,
    }
  },
  {
    id: 4,
    invoiceNumber: "INV-2025-004",
    clientId: 3,
    clientName: "Starlight Retail",
    periodStart: "2025-04-01",
    periodEnd: "2025-04-30",
    amount: 500000,
    status: 'Approved',
    dueDate: "2025-05-15",
    reimbursableExpenses: 0,
    paymentLink: "https://pay.stripe.com/demo-starlight-inv-004",
    reminders: {
      sevenDaysBeforeDue: true,
      onDueDate: true,
      threeDaysOverdue: true,
    }
  }
];

export const mockAgencyInvoiceItems: AgencyInvoiceItem[] = [
  {
    id: 1,
    invoiceId: 1,
    employeeName: "Alice Chen",
    payPeriod: "Mar 1-31, 2025",
    hoursOrSalary: "Salary allocation",
    cost: 800000, // $8000.00
    markup: 120000,
    total: 920000,
    itemType: 'labor',
    description: "Cloud Architecture - March",
  },
  {
    id: 2,
    invoiceId: 1,
    employeeName: "Bob Smith",
    payPeriod: "Mar 1-31, 2025",
    hoursOrSalary: "80 hrs",
    cost: 200000,
    markup: 30000,
    total: 230000,
    itemType: 'labor',
    description: "DevOps Support",
  },
  {
    id: 3,
    invoiceId: 2,
    employeeName: "Charlie Brown",
    payPeriod: "Apr 1-15, 2025",
    hoursOrSalary: "52 hrs",
    cost: 500000,
    markup: 280000,
    total: 780000,
    itemType: 'labor',
    description: "Brand Identity Workshop",
  },
  {
    id: 4,
    invoiceId: 2,
    employeeName: "Reimbursable Expenses",
    payPeriod: "Apr 1-15, 2025",
    hoursOrSalary: "Travel kit",
    cost: 12500,
    markup: 0,
    total: 12500,
    itemType: 'expense',
    description: "Client-approved production expenses",
  },
  {
    id: 5,
    invoiceId: 3,
    employeeName: "Alice Chen",
    payPeriod: "Apr 1-30, 2025",
    hoursOrSalary: "Salary allocation",
    cost: 820000,
    markup: 123000,
    total: 943000,
    itemType: 'labor',
    description: "Cloud Architecture - April",
  },
  {
    id: 6,
    invoiceId: 3,
    employeeName: "Bob Smith",
    payPeriod: "Apr 1-30, 2025",
    hoursOrSalary: "72 hrs",
    cost: 180000,
    markup: 27000,
    total: 207000,
    itemType: 'labor',
    description: "DevOps Support",
  },
  {
    id: 7,
    invoiceId: 3,
    employeeName: "Reimbursable Expenses",
    payPeriod: "Apr 1-30, 2025",
    hoursOrSalary: "Software licenses",
    cost: 120000,
    markup: 0,
    total: 120000,
    itemType: 'expense',
    description: "Approved cloud software pass-through",
  },
  {
    id: 8,
    invoiceId: 4,
    employeeName: "Retail Ops Team",
    payPeriod: "Apr 1-30, 2025",
    hoursOrSalary: "Fixed fee",
    cost: 500000,
    markup: 0,
    total: 500000,
    itemType: 'labor',
    description: "Monthly HR operations retainer",
  }
];

export function getInvoiceItems(invoiceId: number) {
  return mockAgencyInvoiceItems.filter((item) => item.invoiceId === invoiceId);
}

export function calculateInvoiceTotals(invoiceId: number) {
  const items = getInvoiceItems(invoiceId);
  const laborCost = items
    .filter((item) => item.itemType === 'labor')
    .reduce((sum, item) => sum + item.cost, 0);
  const markup = items.reduce((sum, item) => sum + item.markup, 0);
  const reimbursableExpenses = items
    .filter((item) => item.itemType === 'expense')
    .reduce((sum, item) => sum + item.total, 0);

  return {
    laborCost,
    markup,
    reimbursableExpenses,
    total: laborCost + markup + reimbursableExpenses,
  };
}

export const agencyAutoInvoicePreview = {
  payrollRunId: "PAY-2026-05-27-001",
  trigger: "Payroll run complete",
  generatedAt: "2026-05-27T09:30:00.000Z",
  draftCount: 3,
  description:
    "After each completed payroll run, CircleWorks creates one draft invoice per agency client using that client's rate model, template, payment terms, and accounting sync preference.",
};
