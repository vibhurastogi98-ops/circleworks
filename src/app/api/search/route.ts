import { NextResponse } from "next/server";

import { standardReports } from "@/data/mockReports";

type SearchGroup =
  | "EMPLOYEES"
  | "RECENT PAYROLL RUNS"
  | "REPORTS"
  | "PAGES"
  | "ACTIONS"
  | "DOCUMENTS";

interface SearchRecord {
  type: SearchGroup;
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  url: string;
  keywords: string[];
}

const employees: SearchRecord[] = [
  {
    type: "EMPLOYEES",
    id: "emp_1",
    title: "Robert Chen",
    subtitle: "Engineering Manager · Engineering",
    icon: "User",
    url: "/employees/1",
    keywords: ["robert", "chen", "engineering", "manager", "employee"],
  },
  {
    type: "EMPLOYEES",
    id: "emp_2",
    title: "Sarah Williams",
    subtitle: "VP People · Human Resources",
    icon: "User",
    url: "/employees/2",
    keywords: ["sarah", "williams", "vp people", "hr", "human resources", "employee"],
  },
  {
    type: "EMPLOYEES",
    id: "emp_3",
    title: "David Martinez",
    subtitle: "Payroll Specialist · Finance",
    icon: "User",
    url: "/employees/3",
    keywords: ["david", "martinez", "payroll", "finance", "employee"],
  },
  {
    type: "EMPLOYEES",
    id: "emp_4",
    title: "Maria Santos",
    subtitle: "Benefits Manager · People Ops",
    icon: "User",
    url: "/employees/4",
    keywords: ["maria", "santos", "benefits", "people ops", "employee"],
  },
];

const payrollRuns: SearchRecord[] = [
  {
    type: "RECENT PAYROLL RUNS",
    id: "run_pr_2026_010",
    title: "May 1-15 Payroll",
    subtitle: "Paid May 20, 2026 · Paid",
    icon: "ReceiptText",
    url: "/payroll/run/pr-2026-010",
    keywords: ["may", "payroll", "run", "paid", "recent payroll"],
  },
  {
    type: "RECENT PAYROLL RUNS",
    id: "run_pr_2026_009",
    title: "Apr 16-30 Payroll",
    subtitle: "Paid May 5, 2026 · Paid",
    icon: "ReceiptText",
    url: "/payroll/run/pr-2026-009",
    keywords: ["april", "apr", "payroll", "run", "paid", "recent payroll"],
  },
  {
    type: "RECENT PAYROLL RUNS",
    id: "run_pr_2026_008",
    title: "Apr 1-15 Payroll",
    subtitle: "Paid Apr 20, 2026 · Paid",
    icon: "ReceiptText",
    url: "/payroll/run/pr-2026-008",
    keywords: ["april", "apr", "payroll", "run", "paid", "recent payroll"],
  },
];

const pages: SearchRecord[] = [
  {
    type: "PAGES",
    id: "page_dashboard",
    title: "Dashboard",
    subtitle: "Main overview and operational alerts",
    icon: "LayoutDashboard",
    url: "/dashboard",
    keywords: ["dashboard", "home", "overview"],
  },
  {
    type: "PAGES",
    id: "page_employee_directory",
    title: "Employee Directory",
    subtitle: "Browse and manage employees",
    icon: "Users",
    url: "/employees",
    keywords: ["employees", "people", "directory", "team"],
  },
  {
    type: "PAGES",
    id: "page_payroll_settings",
    title: "Payroll Settings",
    subtitle: "Configure payroll, taxes, and approvals",
    icon: "Settings",
    url: "/payroll/settings",
    keywords: ["settings", "payroll settings", "tax setup", "configuration"],
  },
  {
    type: "PAGES",
    id: "page_integrations_settings",
    title: "Integration Settings",
    subtitle: "Connect accounting, ATS, benefits, and HR tools",
    icon: "Settings",
    url: "/settings/integrations",
    keywords: ["settings", "integrations", "apps", "connect"],
  },
  {
    type: "PAGES",
    id: "page_reports",
    title: "Reports & Analytics",
    subtitle: "Run standard reports and build custom analytics",
    icon: "FileText",
    url: "/reports",
    keywords: ["reports", "analytics", "insights", "custom report"],
  },
  {
    type: "PAGES",
    id: "page_compliance",
    title: "Compliance Dashboard",
    subtitle: "Audit readiness, filings, and compliance actions",
    icon: "ShieldCheck",
    url: "/compliance",
    keywords: ["compliance", "audit", "filings", "dashboard"],
  },
];

const actions: SearchRecord[] = [
  {
    type: "ACTIONS",
    id: "action_run_payroll",
    title: "Run Payroll Now",
    subtitle: "Start the payroll workflow",
    icon: "PlayCircle",
    url: "/payroll/run",
    keywords: ["run payroll", "payroll now", "start payroll", "process payroll"],
  },
  {
    type: "ACTIONS",
    id: "action_add_employee",
    title: "Add New Employee",
    subtitle: "Create an employee profile",
    icon: "UserPlus",
    url: "/employees/new",
    keywords: ["add employee", "new employee", "hire employee", "create employee"],
  },
  {
    type: "ACTIONS",
    id: "action_compliance",
    title: "Open Compliance Dashboard",
    subtitle: "Review compliance tasks and alerts",
    icon: "ShieldCheck",
    url: "/compliance",
    keywords: ["compliance", "open compliance", "compliance dashboard"],
  },
];

const documents: SearchRecord[] = [
  {
    type: "DOCUMENTS",
    id: "doc_sarah_i9",
    title: "Sarah Williams I-9",
    subtitle: "Employee Document · Verification",
    icon: "File",
    url: "/employees/2/documents",
    keywords: ["sarah", "williams", "i-9", "i9", "document", "verification"],
  },
  {
    type: "DOCUMENTS",
    id: "doc_robert_offer",
    title: "Robert Chen Offer Letter",
    subtitle: "Employee Document · Signed",
    icon: "File",
    url: "/employees/1/documents",
    keywords: ["robert", "chen", "offer letter", "document", "signed"],
  },
  {
    type: "DOCUMENTS",
    id: "doc_policy_handbook",
    title: "Employee Handbook 2026",
    subtitle: "Company Document · Policy",
    icon: "File",
    url: "/settings/documents",
    keywords: ["handbook", "policy", "employee handbook", "documents"],
  },
  {
    type: "DOCUMENTS",
    id: "doc_payroll_register",
    title: "May Payroll Register",
    subtitle: "Payroll Document · PDF",
    icon: "File",
    url: "/payroll/history",
    keywords: ["payroll", "register", "may", "document", "pdf"],
  },
];

function reportRecords(): SearchRecord[] {
  return standardReports.map((report) => ({
    type: "REPORTS",
    id: `report_${report.id}`,
    title: report.name,
    subtitle: `${report.category} · ${report.description}`,
    icon: "FileText",
    url: `/reports/viewer/${report.id}`,
    keywords: [report.name, report.category, report.description, "report", "analytics"],
  }));
}

function matches(record: SearchRecord, query: string) {
  const haystack = [record.title, record.subtitle, ...record.keywords].join(" ").toLowerCase();
  return haystack.includes(query);
}

function score(record: SearchRecord, query: string) {
  const title = record.title.toLowerCase();
  if (title === query) return 0;
  if (title.startsWith(query)) return 1;
  if (record.keywords.some((keyword) => keyword.toLowerCase().startsWith(query))) return 2;
  if (title.includes(query)) return 3;
  return 4;
}

export async function GET(request: Request) {
  const startedAt = Date.now();
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") ?? "").trim().toLowerCase();
  const companyId = searchParams.get("companyId") ?? "current";

  if (!query) {
    return NextResponse.json({ companyId, tookMs: Date.now() - startedAt, results: [] });
  }

  const records = [
    ...employees,
    ...payrollRuns,
    ...reportRecords(),
    ...pages,
    ...actions,
    ...documents,
  ];

  const results = records
    .filter((record) => matches(record, query))
    .sort((a, b) => score(a, query) - score(b, query))
    .slice(0, 30)
    .map(({ keywords: _keywords, ...record }) => record);

  return NextResponse.json({
    companyId,
    tookMs: Date.now() - startedAt,
    results,
  });
}
