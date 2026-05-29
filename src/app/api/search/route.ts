import { NextResponse } from "next/server";

import { standardReports } from "@/data/mockReports";
import {
  employees as hrisEmployees,
  getEmployeeName,
} from "@/lib/hris-module-data";
import { getAtsCandidates, getAtsJobs, getCandidateName } from "@/data/mockAts";

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

const employees: SearchRecord[] = hrisEmployees.map((employee) => {
  const title = getEmployeeName(employee);

  return {
    type: "EMPLOYEES",
    id: `emp_${employee.id}`,
    title,
    subtitle: `${employee.title} · ${employee.department}`,
    icon: "User",
    url: `/employees/${employee.id}`,
    keywords: [
      employee.firstName,
      employee.lastName,
      title,
      employee.title,
      employee.department,
      employee.email,
      employee.location,
      "employee",
    ].map((keyword) => keyword.toLowerCase()),
  };
});

const payrollRuns: SearchRecord[] = [
  {
    type: "RECENT PAYROLL RUNS",
    id: "run_pr_2026_010",
    title: "May 1-15 Payroll",
    subtitle: "Paid May 20, 2026 · Paid",
    icon: "ReceiptText",
    url: "/payroll/run/pr-2026-0515",
    keywords: ["may", "payroll", "run", "paid", "recent payroll"],
  },
  {
    type: "RECENT PAYROLL RUNS",
    id: "run_pr_2026_009",
    title: "Apr 16-30 Payroll",
    subtitle: "Paid May 5, 2026 · Paid",
    icon: "ReceiptText",
    url: "/payroll/run/pr-2026-0430",
    keywords: ["april", "apr", "payroll", "run", "paid", "recent payroll"],
  },
  {
    type: "RECENT PAYROLL RUNS",
    id: "run_pr_2026_008",
    title: "Apr 1-15 Payroll",
    subtitle: "Paid Apr 20, 2026 · Paid",
    icon: "ReceiptText",
    url: "/payroll/history",
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
    id: "page_hiring",
    title: "Hiring ATS",
    subtitle: "Jobs, candidates, interviews, and offers",
    icon: "BriefcaseBusiness",
    url: "/hiring",
    keywords: ["hiring", "ats", "recruiting", "jobs", "candidates", "interviews", "offers"],
  },
  {
    type: "PAGES",
    id: "page_hiring_candidates",
    title: "ATS Candidates",
    subtitle: "All candidates across open jobs",
    icon: "Users",
    url: "/hiring/candidates",
    keywords: ["candidate", "candidates", "applicants", "ats", "hiring"],
  },
  {
    type: "PAGES",
    id: "page_hiring_interviews",
    title: "Interview Calendar",
    subtitle: "Recruiting calendar and scorecards",
    icon: "CalendarClock",
    url: "/hiring/interviews",
    keywords: ["interview", "calendar", "schedule", "ats", "hiring"],
  },
  {
    type: "PAGES",
    id: "page_benefits",
    title: "Benefits",
    subtitle: "Plans, enrollment, 401k, COBRA, and carrier files",
    icon: "HeartPulse",
    url: "/benefits",
    keywords: ["benefits", "health", "medical", "dental", "vision", "401k", "cobra", "enrollment"],
  },
  {
    type: "PAGES",
    id: "page_benefits_plans",
    title: "Benefits Plan Management",
    subtitle: "Manage medical, dental, vision, life, HSA, FSA, and supplemental plans",
    icon: "HeartPulse",
    url: "/benefits/plans",
    keywords: ["benefits", "plans", "carrier", "broker", "medical", "dental", "vision", "life"],
  },
  {
    type: "PAGES",
    id: "page_benefits_oe",
    title: "Open Enrollment",
    subtitle: "Track enrollment status, reminders, and carrier census files",
    icon: "CalendarClock",
    url: "/benefits/oe",
    keywords: ["open enrollment", "benefits enrollment", "carrier files", "census", "oe"],
  },
  {
    type: "PAGES",
    id: "page_benefits_qle",
    title: "Qualifying Life Events",
    subtitle: "Review life events and approve mid-year enrollment",
    icon: "ShieldCheck",
    url: "/benefits/qle",
    keywords: ["qle", "life event", "marriage", "birth", "benefits"],
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
    id: "action_create_job",
    title: "Create Job Posting",
    subtitle: "Open the ATS job wizard",
    icon: "BriefcaseBusiness",
    url: "/hiring/jobs/new",
    keywords: ["create job", "new job", "job posting", "hiring", "ats"],
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

const atsJobs: SearchRecord[] = getAtsJobs().map((job) => ({
  type: "PAGES",
  id: `ats_job_${job.id}`,
  title: job.title,
  subtitle: `${job.department} · ${job.location} · ${job.applicantsCount} applicants`,
  icon: "BriefcaseBusiness",
  url: `/hiring/jobs/${job.id}`,
  keywords: [job.title, job.department, job.location, job.status, "job", "pipeline", "ats", "hiring"].map((keyword) => keyword.toLowerCase()),
}));

const atsCandidates: SearchRecord[] = getAtsCandidates().map((candidate) => ({
  type: "PAGES",
  id: `ats_candidate_${candidate.id}`,
  title: getCandidateName(candidate),
  subtitle: `${candidate.currentTitle} · ${candidate.stage} · ${candidate.source}`,
  icon: "User",
  url: `/hiring/applicants/${candidate.id}`,
  keywords: [
    candidate.firstName,
    candidate.lastName,
    getCandidateName(candidate),
    candidate.email,
    candidate.currentTitle,
    candidate.stage,
    candidate.source,
    "candidate",
    "applicant",
    "ats",
  ].map((keyword) => keyword.toLowerCase()),
}));

const documents: SearchRecord[] = [
  {
    type: "DOCUMENTS",
    id: "doc_maya_i9",
    title: `${getEmployeeName(hrisEmployees[0])} I-9`,
    subtitle: "Employee Document · Verification",
    icon: "File",
    url: `/employees/${hrisEmployees[0].id}/documents`,
    keywords: [hrisEmployees[0].firstName, hrisEmployees[0].lastName, "i-9", "i9", "document", "verification"].map((keyword) => keyword.toLowerCase()),
  },
  {
    type: "DOCUMENTS",
    id: "doc_avery_offer",
    title: `${getEmployeeName(hrisEmployees[1])} Offer Letter`,
    subtitle: "Employee Document · Signed",
    icon: "File",
    url: `/employees/${hrisEmployees[1].id}/documents`,
    keywords: [hrisEmployees[1].firstName, hrisEmployees[1].lastName, "offer letter", "document", "signed"].map((keyword) => keyword.toLowerCase()),
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
    ...atsJobs,
    ...atsCandidates,
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
