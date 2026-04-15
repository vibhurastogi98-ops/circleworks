export const mockAgencyClients = [
  {
    id: 1,
    name: "TechNova Solutions",
    email: "billing@technova.com",
    contactName: "Sarah Jenkins",
    logoUrl: "https://api.dicebear.com/7.x/initials/svg?seed=TN&backgroundColor=003366",
    billingRateType: "cost-plus",
    markupPercentage: 15,
    billingCycle: "bi-weekly",
    paymentTerms: "Net 30",
    accountingSync: "QuickBooks",
  },
  {
    id: 2,
    name: "Global Creative Agency",
    email: "finance@globalcreative.com",
    contactName: "Michael Chen",
    logoUrl: "https://api.dicebear.com/7.x/initials/svg?seed=GC&backgroundColor=cc0000",
    billingRateType: "hourly",
    hourlyRate: 12500, // $125.00/hr
    billingCycle: "monthly",
    paymentTerms: "Net 15",
    accountingSync: "Xero",
  },
  {
    id: 3,
    name: "Stellar Logistics",
    email: "ap@stellar.com",
    contactName: "Robert Miller",
    logoUrl: "https://api.dicebear.com/7.x/initials/svg?seed=SL&backgroundColor=006600",
    billingRateType: "fixed",
    fixedFee: 500000, // $5,000.00
    billingCycle: "monthly",
    paymentTerms: "Net 45",
    accountingSync: "None",
  },
];

export const mockAgencyInvoices = [
  {
    id: 1,
    clientId: 1,
    clientName: "TechNova Solutions",
    invoiceNumber: "INV-2024-001",
    periodStart: "2024-04-01",
    periodEnd: "2024-04-15",
    amount: 1450000, // $14,500.00
    status: "Sent",
    dueDate: "2024-05-15",
    createdAt: "2024-04-16T10:00:00Z",
  },
  {
    id: 2,
    clientId: 2,
    clientName: "Global Creative Agency",
    invoiceNumber: "INV-2024-002",
    periodStart: "2024-03-01",
    periodEnd: "2024-03-31",
    amount: 875000, // $8,750.00
    status: "Paid",
    dueDate: "2024-04-15",
    createdAt: "2024-04-01T09:00:00Z",
    paidAt: "2024-04-10T14:30:00Z",
  },
  {
    id: 3,
    clientId: 3,
    clientName: "Stellar Logistics",
    invoiceNumber: "INV-2024-003",
    periodStart: "2024-04-01",
    periodEnd: "2024-04-30",
    amount: 500000, // $5,000.00
    status: "Draft",
    dueDate: "2024-05-30",
    createdAt: "2024-05-01T08:00:00Z",
  },
];

export const mockAgencyInvoiceItems = [
  {
    id: 1,
    invoiceId: 1,
    employeeName: "Alice Walker",
    description: "Software Engineer - Pay Period April 1-15",
    cost: 500000,
    markup: 75000, // 15%
    total: 575000,
  },
  {
    id: 2,
    invoiceId: 1,
    employeeName: "Bob Smith",
    description: "UI/UX Designer - Pay Period April 1-15",
    cost: 450000,
    markup: 67500, // 15%
    total: 517500,
  },
  {
    id: 3,
    invoiceId: 1,
    employeeName: "Charlie Brown",
    description: "Project Manager - Pay Period April 1-15",
    cost: 300000,
    markup: 45000, // 15%
    total: 345000,
  },
  {
    id: 4,
    invoiceId: 1,
    employeeName: "Alice Walker",
    description: "Travel Reimbursement - Client On-site",
    cost: 15000,
    markup: 0,
    total: 15000,
    itemType: "expense",
  },
];
