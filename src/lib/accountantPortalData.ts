export type AccountantClientStatus = "on_time" | "action_required" | "issue";

export interface AccountantClient {
  id: string;
  slug: string;
  name: string;
  logoUrl: string;
  industry: string;
  plan: "Standard" | "Growth" | "Premium";
  employeeCount: number;
  contractorCount: number;
  status: AccountantClientStatus;
  statusLabel: string;
  nextPayrollDate: string;
  nextPayrollAmount: number;
  lastPayrollDate: string;
  state: string;
  ein: string;
  monthlyPayrollVolume: number;
  pendingApprovals: number;
  setupComplete: boolean;
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function isoDate(offsetDays: number) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

function isoDateTime(offsetDays: number, hour = 9, minute = 30) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

function daysUntil(dateStr: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${dateStr}T00:00:00`);
  return Math.ceil((target.getTime() - today.getTime()) / MS_PER_DAY);
}

export function getAccountantDemoClients(): AccountantClient[] {
  return [
  {
    id: "cl_001",
    slug: "pinnacle-tech",
    name: "Pinnacle Tech Solutions",
    logoUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=PinnacleTech&backgroundColor=1e293b",
    industry: "Software",
    plan: "Premium",
    employeeCount: 62,
    contractorCount: 12,
    status: "on_time",
    statusLabel: "Payroll On Time",
    nextPayrollDate: isoDate(2),
    nextPayrollAmount: 312000,
    lastPayrollDate: isoDate(-12),
    state: "CA",
    ein: "94-3812048",
    monthlyPayrollVolume: 1248000,
    pendingApprovals: 1,
    setupComplete: true,
  },
  {
    id: "cl_002",
    slug: "vertex-media",
    name: "Vertex Media Group",
    logoUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=VertexMedia&backgroundColor=0f766e",
    industry: "Media",
    plan: "Growth",
    employeeCount: 47,
    contractorCount: 8,
    status: "on_time",
    statusLabel: "Payroll On Time",
    nextPayrollDate: isoDate(3),
    nextPayrollAmount: 184500,
    lastPayrollDate: isoDate(-11),
    state: "CA",
    ein: "95-4071129",
    monthlyPayrollVolume: 738000,
    pendingApprovals: 0,
    setupComplete: true,
  },
  {
    id: "cl_003",
    slug: "nova-studios",
    name: "Nova Studios Inc.",
    logoUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=NovaStudios&backgroundColor=7c3aed",
    industry: "Design",
    plan: "Growth",
    employeeCount: 23,
    contractorCount: 8,
    status: "action_required",
    statusLabel: "Action Required",
    nextPayrollDate: isoDate(1),
    nextPayrollAmount: 94200,
    lastPayrollDate: isoDate(-13),
    state: "NY",
    ein: "13-7729011",
    monthlyPayrollVolume: 376800,
    pendingApprovals: 2,
    setupComplete: true,
  },
  {
    id: "cl_004",
    slug: "brightpath-edu",
    name: "BrightPath Education",
    logoUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=BrightPath&backgroundColor=ca8a04",
    industry: "Education",
    plan: "Standard",
    employeeCount: 19,
    contractorCount: 0,
    status: "action_required",
    statusLabel: "Action Required",
    nextPayrollDate: isoDate(4),
    nextPayrollAmount: 67800,
    lastPayrollDate: isoDate(-10),
    state: "MA",
    ein: "04-6621198",
    monthlyPayrollVolume: 271200,
    pendingApprovals: 1,
    setupComplete: false,
  },
  {
    id: "cl_005",
    slug: "coastal-eats",
    name: "Coastal Eats Co.",
    logoUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=CoastalEats&backgroundColor=0369a1",
    industry: "Hospitality",
    plan: "Standard",
    employeeCount: 34,
    contractorCount: 16,
    status: "on_time",
    statusLabel: "Payroll On Time",
    nextPayrollDate: isoDate(5),
    nextPayrollAmount: 75600,
    lastPayrollDate: isoDate(-9),
    state: "FL",
    ein: "59-4470832",
    monthlyPayrollVolume: 302400,
    pendingApprovals: 0,
    setupComplete: true,
  },
  {
    id: "cl_006",
    slug: "ironclad-construction",
    name: "Ironclad Construction",
    logoUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=Ironclad&backgroundColor=334155",
    industry: "Construction",
    plan: "Premium",
    employeeCount: 89,
    contractorCount: 34,
    status: "on_time",
    statusLabel: "Payroll On Time",
    nextPayrollDate: isoDate(6),
    nextPayrollAmount: 421000,
    lastPayrollDate: isoDate(-1),
    state: "WA",
    ein: "91-2288094",
    monthlyPayrollVolume: 1684000,
    pendingApprovals: 0,
    setupComplete: true,
  },
  {
    id: "cl_007",
    slug: "greenway-health",
    name: "Greenway Health Collective",
    logoUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=Greenway&backgroundColor=15803d",
    industry: "Healthcare",
    plan: "Growth",
    employeeCount: 11,
    contractorCount: 4,
    status: "issue",
    statusLabel: "Issue",
    nextPayrollDate: isoDate(8),
    nextPayrollAmount: 43800,
    lastPayrollDate: isoDate(-7),
    state: "OR",
    ein: "93-5512904",
    monthlyPayrollVolume: 175200,
    pendingApprovals: 0,
    setupComplete: false,
  },
  {
    id: "cl_008",
    slug: "northstar-retail",
    name: "Northstar Retail Labs",
    logoUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=Northstar&backgroundColor=be123c",
    industry: "Retail",
    plan: "Growth",
    employeeCount: 8,
    contractorCount: 8,
    status: "on_time",
    statusLabel: "Payroll On Time",
    nextPayrollDate: isoDate(12),
    nextPayrollAmount: 28600,
    lastPayrollDate: isoDate(-2),
    state: "IL",
    ein: "36-9027715",
    monthlyPayrollVolume: 114400,
    pendingApprovals: 0,
    setupComplete: true,
  },
  ];
}

export function buildAccountantSummary(clients: AccountantClient[] = getAccountantDemoClients()) {
  const upcomingDeadlines = [
    {
      id: "dl_001",
      date: isoDate(1),
      type: "payroll",
      title: "Payroll Run - Nova Studios Inc.",
      client: "Nova Studios Inc.",
      clientSlug: "nova-studios",
      severity: "warning",
      description: "Bi-weekly payroll has 2 pending items that need review.",
    },
    {
      id: "dl_002",
      date: isoDate(2),
      type: "payroll",
      title: "Payroll Run - Pinnacle Tech Solutions",
      client: "Pinnacle Tech Solutions",
      clientSlug: "pinnacle-tech",
      severity: "critical",
      description: "Bank debit required before the funding cutoff.",
    },
    {
      id: "dl_003",
      date: isoDate(3),
      type: "payroll",
      title: "Payroll Run - Vertex Media Group",
      client: "Vertex Media Group",
      clientSlug: "vertex-media",
      severity: "normal",
      description: "Semi-monthly payroll for 47 employees.",
    },
    {
      id: "dl_004",
      date: isoDate(4),
      type: "payroll",
      title: "Payroll Run - BrightPath Education",
      client: "BrightPath Education",
      clientSlug: "brightpath-edu",
      severity: "warning",
      description: "New hire onboarding is still pending.",
    },
    {
      id: "dl_005",
      date: isoDate(7),
      type: "tax",
      title: "State Withholding Deposit - Vertex Media",
      client: "Vertex Media Group",
      clientSlug: "vertex-media",
      severity: "normal",
      description: "California employer payroll tax deposit due.",
    },
    {
      id: "dl_006",
      date: isoDate(10),
      type: "compliance",
      title: "Quarterly Payroll Reconciliation",
      client: "All Clients",
      clientSlug: "",
      severity: "critical",
      description: "Reconcile payroll runs before quarter-end filings.",
    },
    {
      id: "dl_007",
      date: isoDate(14),
      type: "benefits",
      title: "Benefits Renewal Review - Pinnacle Tech",
      client: "Pinnacle Tech Solutions",
      clientSlug: "pinnacle-tech",
      severity: "normal",
      description: "Annual benefits renewal package review.",
    },
    {
      id: "dl_008",
      date: isoDate(18),
      type: "tax",
      title: "WA PFML Remittance - Ironclad",
      client: "Ironclad Construction",
      clientSlug: "ironclad-construction",
      severity: "normal",
      description: "Washington paid family and medical leave remittance.",
    },
    {
      id: "dl_009",
      date: isoDate(24),
      type: "compliance",
      title: "Multi-State Registration Review",
      client: "Greenway Health Collective",
      clientSlug: "greenway-health",
      severity: "warning",
      description: "Oregon registration issue needs follow-up.",
    },
    {
      id: "dl_010",
      date: isoDate(29),
      type: "tax",
      title: "Monthly Payroll Tax Package",
      client: "All Clients",
      clientSlug: "",
      severity: "normal",
      description: "Review EFTPS and state deposit confirmations.",
    },
  ].sort((a, b) => a.date.localeCompare(b.date));

  const pendingPayrollRuns = [
    {
      id: "pr_001",
      clientId: "cl_003",
      client: "Nova Studios Inc.",
      clientSlug: "nova-studios",
      payPeriod: "Current semi-monthly payroll",
      employeeCount: 23,
      grossAmount: 94200,
      netAmount: 67410,
      taxes: 18840,
      deductions: 7950,
      status: "awaiting_approval",
      submittedAt: isoDateTime(-1, 9, 30),
      submittedBy: "Sarah Chen",
      flags: ["New hire added", "OT detected for 2 employees"],
    },
    {
      id: "pr_002",
      clientId: "cl_003",
      client: "Nova Studios Inc.",
      clientSlug: "nova-studios",
      payPeriod: "Current contractor payroll",
      employeeCount: 8,
      grossAmount: 28400,
      netAmount: 28400,
      taxes: 0,
      deductions: 0,
      status: "awaiting_approval",
      submittedAt: isoDateTime(-1, 9, 45),
      submittedBy: "Sarah Chen",
      flags: ["1 new contractor onboarded"],
    },
    {
      id: "pr_003",
      clientId: "cl_001",
      client: "Pinnacle Tech Solutions",
      clientSlug: "pinnacle-tech",
      payPeriod: "Current bi-weekly payroll",
      employeeCount: 62,
      grossAmount: 312000,
      netAmount: 224640,
      taxes: 62400,
      deductions: 24960,
      status: "awaiting_approval",
      submittedAt: isoDateTime(-1, 10, 15),
      submittedBy: "Mike Davis",
      flags: ["Tax jurisdiction change for 1 employee"],
    },
    {
      id: "pr_004",
      clientId: "cl_004",
      client: "BrightPath Education",
      clientSlug: "brightpath-edu",
      payPeriod: "Current semi-monthly payroll",
      employeeCount: 19,
      grossAmount: 67800,
      netAmount: 48816,
      taxes: 13560,
      deductions: 5424,
      status: "awaiting_approval",
      submittedAt: isoDateTime(-1, 11, 0),
      submittedBy: "Lisa Park",
      flags: [],
    },
  ];

  const clientsByStatus = clients.reduce(
    (acc, client) => {
      acc[client.status] += 1;
      return acc;
    },
    { on_time: 0, action_required: 0, issue: 0 } as Record<AccountantClientStatus, number>
  );

  const activePayrollsThisWeek = clients.filter((client) => {
    const days = daysUntil(client.nextPayrollDate);
    return days >= 0 && days <= 7;
  }).length;

  return {
    totalClients: clients.length,
    activePayrollsThisWeek,
    pendingApprovals: pendingPayrollRuns.length,
    taxDeadlines: upcomingDeadlines.filter((deadline) => deadline.type === "tax").length,
    totalEmployees: clients.reduce((sum, client) => sum + client.employeeCount, 0),
    totalContractors: clients.reduce((sum, client) => sum + client.contractorCount, 0),
    totalPayrollVolumeThisMonth: clients.reduce((sum, client) => sum + client.monthlyPayrollVolume, 0),
    clientsByStatus,
    upcomingDeadlines,
    pendingPayrollRuns,
  };
}
