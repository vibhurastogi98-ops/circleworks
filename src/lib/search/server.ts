import { and, desc, eq } from "drizzle-orm";

import { getAtsCandidates, getAtsJobs, getCandidateName } from "@/data/mockAts";
import { standardReports } from "@/data/mockReports";
import { db } from "@/db";
import {
  atsCandidates,
  atsJobs,
  employeeDocuments,
  employees,
  payrolls,
} from "@/db/schema";
import {
  employees as demoEmployees,
  getDocumentsData,
  getEmployeeName,
} from "@/lib/hris-module-data";
import type { SessionUser, UserContext } from "@/lib/session";
import type { SearchEntityType, SearchResult, SearchSection, SearchSource } from "@/lib/search/types";

type SearchableRecord = SearchResult & {
  keywords: string[];
  rawText: string;
};

const DEFAULT_TYPES: SearchEntityType[] = [
  "employees",
  "payroll",
  "documents",
  "reports",
  "jobs",
  "settings",
];

const SECTION_LIMITS: Record<SearchSection, number> = {
  EMPLOYEES: 5,
  "PAYROLL RUNS": 3,
  DOCUMENTS: 3,
  REPORTS: 3,
  "JOBS/CANDIDATES": 3,
  SETTINGS: 2,
};

const TYPE_BOOSTS: Record<SearchEntityType, number> = {
  employees: 3,
  payroll: 2,
  documents: 1,
  reports: 1,
  jobs: 1,
  candidates: 1,
  settings: 1.5,
};

const SEARCH_INDICES: Record<Exclude<SearchEntityType, "settings" | "candidates">, string> = {
  employees: "employees_idx",
  payroll: "payroll_runs_idx",
  documents: "documents_idx",
  reports: "reports_idx",
  jobs: "jobs_idx",
};

const SETTINGS_RECORDS: SearchableRecord[] = [
  makeRecord({
    id: "settings_notifications",
    entityType: "settings",
    section: "SETTINGS",
    title: "Notification Settings",
    subtitle: "In-app, email, SMS, and daily digest preferences",
    href: "/app/settings/notifications",
    icon: "Settings",
    keywords: ["notifications", "preferences", "email", "sms", "digest", "settings"],
  }),
  makeRecord({
    id: "settings_company",
    entityType: "settings",
    section: "SETTINGS",
    title: "Company Settings",
    subtitle: "Company profile, workspace, and account defaults",
    href: "/settings/company",
    icon: "Building2",
    keywords: ["company", "workspace", "settings", "profile"],
  }),
  makeRecord({
    id: "settings_integrations",
    entityType: "settings",
    section: "SETTINGS",
    title: "Integration Settings",
    subtitle: "Connect accounting, ATS, benefits, and HR tools",
    href: "/settings/integrations",
    icon: "Settings",
    keywords: ["integrations", "apps", "connect", "settings"],
  }),
  makeRecord({
    id: "settings_roles",
    entityType: "settings",
    section: "SETTINGS",
    title: "Roles & Permissions",
    subtitle: "Manage access by role and capability",
    href: "/settings/roles",
    icon: "ShieldCheck",
    keywords: ["roles", "permissions", "rbac", "security", "settings"],
  }),
  makeRecord({
    id: "settings_billing",
    entityType: "settings",
    section: "SETTINGS",
    title: "Billing Settings",
    subtitle: "Invoices, payment methods, and subscription details",
    href: "/settings/billing",
    icon: "CreditCard",
    keywords: ["billing", "invoice", "payment", "subscription", "settings"],
  }),
];

function normalize(value: string) {
  return value.toLowerCase().trim();
}

function compactText(values: Array<string | number | null | undefined>) {
  return values
    .filter((value): value is string | number => value !== null && value !== undefined && value !== "")
    .join(" ");
}

function formatDate(value: Date | string | null | undefined) {
  if (!value) return "Not set";
  const date = value instanceof Date ? value : new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function formatCurrency(centsOrDollars: number | null | undefined) {
  const value = centsOrDollars ?? 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function makeRecord(input: Omit<SearchableRecord, "rawText"> & { rawText?: string }): SearchableRecord {
  const rawText = input.rawText ?? compactText([
    input.title,
    input.subtitle,
    input.badge,
    ...input.keywords,
    ...Object.values(input.metadata ?? {}),
  ]);
  return {
    ...input,
    rawText: normalize(rawText),
  };
}

function parseTypes(rawTypes: string | null) {
  if (!rawTypes) return new Set(DEFAULT_TYPES);

  const requested = rawTypes
    .split(",")
    .map((type) => type.trim().toLowerCase())
    .filter(Boolean) as SearchEntityType[];

  const types = new Set<SearchEntityType>();
  requested.forEach((type) => {
    if (type === "payroll") types.add("payroll");
    if (type === "jobs") {
      types.add("jobs");
      types.add("candidates");
    }
    if (DEFAULT_TYPES.includes(type) || type === "candidates") types.add(type);
  });

  types.add("settings");
  return types.size ? types : new Set(DEFAULT_TYPES);
}

function canSeeCompanyData(session: SessionUser | null) {
  return ["admin", "hr", "accountant"].includes(session?.role ?? "");
}

function scoreRecord(record: SearchableRecord, normalizedQuery: string) {
  const title = normalize(record.title);
  const keywords = record.keywords.map(normalize);
  const terms = normalizedQuery.split(/\s+/).filter(Boolean);

  let score = TYPE_BOOSTS[record.entityType] * 10;
  if (title === normalizedQuery) score += 80;
  if (title.startsWith(normalizedQuery)) score += 52;
  if (keywords.some((keyword) => keyword.startsWith(normalizedQuery))) score += 42;
  if (title.includes(normalizedQuery)) score += 30;
  if (record.rawText.includes(normalizedQuery)) score += 18;
  if (terms.length > 1 && terms.every((term) => record.rawText.includes(term))) score += 14;

  return score;
}

function filterAndLimit(records: SearchableRecord[], query: string) {
  const normalizedQuery = normalize(query);
  const sectionCounts = new Map<SearchSection, number>();

  return records
    .map((record) => ({ ...record, score: scoreRecord(record, normalizedQuery) }))
    .filter((record) => record.rawText.includes(normalizedQuery) || (record.score ?? 0) >= 34)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0) || a.title.localeCompare(b.title))
    .filter((record) => {
      const count = sectionCounts.get(record.section) ?? 0;
      if (count >= SECTION_LIMITS[record.section]) return false;
      sectionCounts.set(record.section, count + 1);
      return true;
    })
    .map(({ keywords: _keywords, rawText: _rawText, ...record }) => record);
}

function buildDemoRecords(types: Set<SearchEntityType>, ownEmployeeId?: number): SearchableRecord[] {
  const visibleEmployees = ownEmployeeId
    ? demoEmployees.filter((employee) => Number(employee.id) === ownEmployeeId)
    : demoEmployees;

  const records: SearchableRecord[] = [];

  if (types.has("employees")) {
    records.push(
      ...visibleEmployees.map((employee) =>
        makeRecord({
          id: `employee_${employee.id}`,
          entityType: "employees",
          section: "EMPLOYEES",
          title: getEmployeeName(employee),
          subtitle: `${employee.title} · ${employee.department}`,
          href: `/employees/${employee.id}`,
          icon: "User",
          avatarUrl: `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(getEmployeeName(employee))}&backgroundColor=transparent`,
          badge: employee.status,
          metadata: {
            title: employee.title,
            department: employee.department,
            status: employee.status,
          },
          keywords: [
            employee.firstName,
            employee.lastName,
            employee.email,
            employee.title,
            employee.department,
            employee.location,
            employee.status,
            "employee",
          ],
        }),
      ),
    );
  }

  if (types.has("payroll") && !ownEmployeeId) {
    records.push(
      ...[
        ["payroll_2026_0515", "May 1-15, 2026", "May 20, 2026", "Paid", 348_250],
        ["payroll_2026_0430", "Apr 16-30, 2026", "May 5, 2026", "Paid", 335_800],
        ["payroll_2026_0415", "Apr 1-15, 2026", "Apr 20, 2026", "Processed", 329_400],
      ].map(([id, period, checkDate, status, gross]) =>
        makeRecord({
          id: String(id),
          entityType: "payroll",
          section: "PAYROLL RUNS",
          title: `${period} Payroll`,
          subtitle: `Check date ${checkDate} · ${status} · ${formatCurrency(Number(gross))} gross`,
          href: id === "payroll_2026_0515" ? "/payroll/run/pr-2026-0515" : "/payroll/history",
          icon: "ReceiptText",
          badge: String(status),
          metadata: { period: String(period), checkDate: String(checkDate), gross: formatCurrency(Number(gross)) },
          keywords: ["payroll", "run", String(period), String(checkDate), String(status), "gross"],
        }),
      ),
    );
  }

  if (types.has("documents")) {
    records.push(
      ...visibleEmployees.flatMap((employee) =>
        getDocumentsData(employee.id).documents.map((document) =>
          makeRecord({
            id: `document_${employee.id}_${document.id}`,
            entityType: "documents",
            section: "DOCUMENTS",
            title: document.filename,
            subtitle: `${getEmployeeName(employee)} · ${document.type}`,
            href: `/employees/${employee.id}/documents`,
            icon: "File",
            badge: document.status,
            metadata: { employeeName: getEmployeeName(employee), documentType: document.type },
            keywords: [document.filename, document.type, getEmployeeName(employee), employee.department, "document"],
          }),
        ),
      ),
    );
  }

  if (types.has("reports") && !ownEmployeeId) {
    records.push(
      ...standardReports.map((report, index) =>
        makeRecord({
          id: `report_${report.id}`,
          entityType: "reports",
          section: "REPORTS",
          title: report.name,
          subtitle: `Last generated ${formatDate(new Date(Date.UTC(2026, 4, 29 - (index % 12))))}`,
          href: `/reports/viewer/${report.id}`,
          icon: "FileText",
          metadata: { category: report.category, lastGenerated: `2026-05-${String(29 - (index % 12)).padStart(2, "0")}` },
          keywords: [report.name, report.category, report.description, "report", "analytics"],
        }),
      ),
    );
  }

  if ((types.has("jobs") || types.has("candidates")) && !ownEmployeeId) {
    records.push(
      ...getAtsJobs().map((job) =>
        makeRecord({
          id: `job_${job.id}`,
          entityType: "jobs",
          section: "JOBS/CANDIDATES",
          title: job.title,
          subtitle: `${job.department} · ${job.location} · ${job.status}`,
          href: `/hiring/jobs/${job.id}`,
          icon: "BriefcaseBusiness",
          badge: job.status,
          metadata: { department: job.department, location: job.location },
          keywords: [job.title, job.department, job.location, job.status, "job", "hiring", "ats"],
        }),
      ),
      ...getAtsCandidates().map((candidate) =>
        makeRecord({
          id: `candidate_${candidate.id}`,
          entityType: "candidates",
          section: "JOBS/CANDIDATES",
          title: getCandidateName(candidate),
          subtitle: `${candidate.currentTitle} · ${candidate.stage} · ${candidate.source}`,
          href: `/hiring/applicants/${candidate.id}`,
          icon: "User",
          badge: candidate.stage,
          metadata: { title: candidate.currentTitle, source: candidate.source },
          keywords: [
            candidate.firstName,
            candidate.lastName,
            candidate.email,
            candidate.currentTitle,
            candidate.stage,
            candidate.source,
            "candidate",
            "applicant",
            "ats",
          ],
        }),
      ),
    );
  }

  if (types.has("settings") && !ownEmployeeId) records.push(...SETTINGS_RECORDS);

  return records;
}

async function buildDatabaseRecords(types: Set<SearchEntityType>, session: SessionUser | null, ctx: UserContext | null) {
  if (!session || !ctx) return buildDemoRecords(types);

  const privileged = canSeeCompanyData(session);
  const records: SearchableRecord[] = [];

  if (types.has("employees")) {
    const employeeWhere = privileged
      ? eq(employees.companyId, ctx.companyId)
      : and(eq(employees.companyId, ctx.companyId), eq(employees.id, ctx.employeeId));
    const employeeRows = await db
      .select({
        id: employees.id,
        firstName: employees.firstName,
        lastName: employees.lastName,
        email: employees.email,
        avatar: employees.avatar,
        jobTitle: employees.jobTitle,
        department: employees.department,
        location: employees.location,
        status: employees.status,
      })
      .from(employees)
      .where(employeeWhere);

    records.push(
      ...employeeRows.map((employee) => {
        const fullName = `${employee.firstName} ${employee.lastName ?? ""}`.trim();
        return makeRecord({
          id: `employee_${employee.id}`,
          entityType: "employees",
          section: "EMPLOYEES",
          title: fullName,
          subtitle: `${employee.jobTitle ?? "Employee"} · ${employee.department ?? "No department"}`,
          href: privileged ? `/employees/${employee.id}` : "/me/profile",
          icon: "User",
          avatarUrl: employee.avatar,
          badge: employee.status ?? "active",
          metadata: {
            title: employee.jobTitle,
            department: employee.department,
            status: employee.status,
          },
          keywords: [
            fullName,
            employee.firstName,
            employee.lastName,
            employee.email,
            employee.jobTitle,
            employee.department,
            employee.location,
            employee.status,
            "employee",
          ].filter(Boolean) as string[],
        });
      }),
    );
  }

  if (types.has("payroll") && privileged) {
    const payrollRows = await db
      .select({
        id: payrolls.id,
        payPeriodStart: payrolls.payPeriodStart,
        payPeriodEnd: payrolls.payPeriodEnd,
        checkDate: payrolls.checkDate,
        totalGross: payrolls.totalGross,
        status: payrolls.status,
        type: payrolls.type,
      })
      .from(payrolls)
      .where(eq(payrolls.companyId, ctx.companyId))
      .orderBy(desc(payrolls.checkDate))
      .limit(100);

    records.push(
      ...payrollRows.map((run) => {
        const period = `${formatDate(run.payPeriodStart)} - ${formatDate(run.payPeriodEnd)}`;
        return makeRecord({
          id: `payroll_${run.id}`,
          entityType: "payroll",
          section: "PAYROLL RUNS",
          title: `${period} Payroll`,
          subtitle: `Check date ${formatDate(run.checkDate)} · ${run.status ?? "draft"} · ${formatCurrency(run.totalGross)} gross`,
          href: `/payroll/run/${run.id}`,
          icon: "ReceiptText",
          badge: run.status ?? "draft",
          metadata: {
            period,
            checkDate: formatDate(run.checkDate),
            gross: formatCurrency(run.totalGross),
          },
          keywords: [period, formatDate(run.checkDate), run.status, run.type, "payroll", "run"].filter(Boolean) as string[],
        });
      }),
    );
  }

  if (types.has("documents")) {
    const documentWhere = privileged
      ? eq(employees.companyId, ctx.companyId)
      : and(eq(employees.companyId, ctx.companyId), eq(employees.id, ctx.employeeId));
    const documentRows = await db
      .select({
        id: employeeDocuments.id,
        employeeId: employeeDocuments.employeeId,
        name: employeeDocuments.name,
        type: employeeDocuments.type,
        status: employeeDocuments.status,
        firstName: employees.firstName,
        lastName: employees.lastName,
        department: employees.department,
      })
      .from(employeeDocuments)
      .innerJoin(employees, eq(employeeDocuments.employeeId, employees.id))
      .where(documentWhere)
      .limit(200);

    records.push(
      ...documentRows.map((document) => {
        const employeeName = `${document.firstName} ${document.lastName ?? ""}`.trim();
        return makeRecord({
          id: `document_${document.id}`,
          entityType: "documents",
          section: "DOCUMENTS",
          title: document.name,
          subtitle: `${employeeName} · ${document.type}`,
          href: privileged ? `/employees/${document.employeeId}/documents` : "/me/documents",
          icon: "File",
          badge: document.status ?? "Unread",
          metadata: { employeeName, documentType: document.type },
          keywords: [document.name, document.type, document.status, employeeName, document.department, "document"].filter(Boolean) as string[],
        });
      }),
    );
  }

  if (types.has("reports") && privileged) {
    records.push(
      ...standardReports.map((report, index) =>
        makeRecord({
          id: `report_${report.id}`,
          entityType: "reports",
          section: "REPORTS",
          title: report.name,
          subtitle: `Last generated ${formatDate(new Date(Date.UTC(2026, 4, 29 - (index % 12))))}`,
          href: `/reports/viewer/${report.id}`,
          icon: "FileText",
          metadata: { category: report.category, lastGenerated: `2026-05-${String(29 - (index % 12)).padStart(2, "0")}` },
          keywords: [report.name, report.category, report.description, "report", "analytics"],
        }),
      ),
    );
  }

  if ((types.has("jobs") || types.has("candidates")) && privileged) {
    const jobRows = await db
      .select({
        id: atsJobs.id,
        title: atsJobs.title,
        department: atsJobs.department,
        location: atsJobs.location,
        status: atsJobs.status,
      })
      .from(atsJobs)
      .where(eq(atsJobs.companyId, ctx.companyId))
      .limit(100);

    const candidateRows = await db
      .select({
        id: atsCandidates.id,
        firstName: atsCandidates.firstName,
        lastName: atsCandidates.lastName,
        email: atsCandidates.email,
        stage: atsCandidates.stage,
        jobTitle: atsJobs.title,
        department: atsJobs.department,
      })
      .from(atsCandidates)
      .innerJoin(atsJobs, eq(atsCandidates.jobId, atsJobs.id))
      .where(eq(atsJobs.companyId, ctx.companyId))
      .limit(100);

    records.push(
      ...jobRows.map((job) =>
        makeRecord({
          id: `job_${job.id}`,
          entityType: "jobs",
          section: "JOBS/CANDIDATES",
          title: job.title,
          subtitle: `${job.department ?? "No department"} · ${job.location ?? "No location"} · ${job.status ?? "Active"}`,
          href: `/hiring/jobs/${job.id}`,
          icon: "BriefcaseBusiness",
          badge: job.status ?? "Active",
          metadata: { department: job.department, location: job.location },
          keywords: [job.title, job.department, job.location, job.status, "job", "hiring", "ats"].filter(Boolean) as string[],
        }),
      ),
      ...candidateRows.map((candidate) => {
        const candidateName = `${candidate.firstName} ${candidate.lastName}`.trim();
        return makeRecord({
          id: `candidate_${candidate.id}`,
          entityType: "candidates",
          section: "JOBS/CANDIDATES",
          title: candidateName,
          subtitle: `${candidate.jobTitle ?? "Candidate"} · ${candidate.stage ?? "New"}`,
          href: `/hiring/applicants/${candidate.id}`,
          icon: "User",
          badge: candidate.stage ?? "New",
          metadata: { title: candidate.jobTitle, department: candidate.department },
          keywords: [
            candidateName,
            candidate.email,
            candidate.jobTitle,
            candidate.department,
            candidate.stage,
            "candidate",
            "applicant",
            "ats",
          ].filter(Boolean) as string[],
        });
      }),
    );
  }

  if (types.has("settings") && privileged) records.push(...SETTINGS_RECORDS);

  if (records.length === 0) {
    return buildDemoRecords(types, privileged ? undefined : ctx.employeeId);
  }

  return records;
}

function indexNameFor(type: SearchEntityType) {
  if (type === "payroll") return SEARCH_INDICES.payroll;
  if (type === "employees") return SEARCH_INDICES.employees;
  if (type === "documents") return SEARCH_INDICES.documents;
  if (type === "reports") return SEARCH_INDICES.reports;
  if (type === "jobs" || type === "candidates") return SEARCH_INDICES.jobs;
  return null;
}

function mapElasticsearchHit(hit: any): SearchableRecord | null {
  const source = hit?._source ?? {};
  const entityType = (source.entityType ?? source.type) as SearchEntityType | undefined;
  const indexType = Object.entries(SEARCH_INDICES).find(([, index]) => index === hit?._index)?.[0] as SearchEntityType | undefined;
  const type = entityType ?? indexType;
  if (!type) return null;

  const section: SearchSection =
    type === "employees"
      ? "EMPLOYEES"
      : type === "payroll"
        ? "PAYROLL RUNS"
        : type === "documents"
          ? "DOCUMENTS"
          : type === "reports"
            ? "REPORTS"
            : type === "settings"
              ? "SETTINGS"
              : "JOBS/CANDIDATES";

  return makeRecord({
    id: String(source.id ?? hit._id),
    entityType: type,
    section,
    title: String(source.title ?? source.name ?? "Untitled result"),
    subtitle: String(source.subtitle ?? source.description ?? ""),
    href: String(source.href ?? source.url ?? "#"),
    icon: String(source.icon ?? (type === "employees" ? "User" : "FileText")),
    score: Number(hit._score ?? 0),
    avatarUrl: source.avatarUrl ?? null,
    badge: source.badge ?? source.status ?? null,
    metadata: source.metadata ?? {},
    keywords: Array.isArray(source.keywords) ? source.keywords.map(String) : [],
  });
}

async function searchElasticsearch(
  query: string,
  types: Set<SearchEntityType>,
  ctx: UserContext | null,
  session: SessionUser | null,
) {
  const endpoint = process.env.ELASTICSEARCH_URL;
  if (!endpoint || !ctx || !session) return null;

  const indices = Array.from(types)
    .map(indexNameFor)
    .filter((index): index is string => Boolean(index));
  if (!indices.length) return null;

  const privileged = canSeeCompanyData(session);
  const filters: any[] = [{ term: { companyId: ctx.companyId } }];
  if (!privileged) {
    filters.push({
      bool: {
        should: [
          { term: { employeeId: ctx.employeeId } },
          { term: { ownerEmployeeId: ctx.employeeId } },
          { term: { userId: session.userId } },
        ],
        minimum_should_match: 1,
      },
    });
  }

  const headers: Record<string, string> = { "content-type": "application/json" };
  if (process.env.ELASTICSEARCH_API_KEY) {
    headers.authorization = `ApiKey ${process.env.ELASTICSEARCH_API_KEY}`;
  } else if (process.env.ELASTICSEARCH_USERNAME && process.env.ELASTICSEARCH_PASSWORD) {
    headers.authorization = `Basic ${Buffer.from(`${process.env.ELASTICSEARCH_USERNAME}:${process.env.ELASTICSEARCH_PASSWORD}`).toString("base64")}`;
  }

  const response = await fetch(`${endpoint.replace(/\/$/, "")}/${indices.join(",")}/_search`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      size: 30,
      indices_boost: [
        { employees_idx: 3 },
        { payroll_runs_idx: 2 },
        { documents_idx: 1 },
        { reports_idx: 1 },
        { jobs_idx: 1 },
      ],
      query: {
        bool: {
          filter: filters,
          must: {
            multi_match: {
              query,
              type: "best_fields",
              fields: [
                "title^4",
                "name^4",
                "fullName^4",
                "period^3",
                "employeeName^3",
                "department^2",
                "status^2",
                "description",
                "keywords",
                "content",
              ],
              fuzziness: "AUTO",
            },
          },
        },
      },
    }),
    cache: "no-store",
  });

  if (!response.ok) return null;

  const payload = await response.json();
  const records = (payload?.hits?.hits ?? [])
    .map(mapElasticsearchHit)
    .filter((record: SearchableRecord | null): record is SearchableRecord => Boolean(record));

  return filterAndLimit(records, query);
}

export async function runGlobalSearch({
  query,
  rawTypes,
  session,
  ctx,
}: {
  query: string;
  rawTypes: string | null;
  session: SessionUser | null;
  ctx: UserContext | null;
}): Promise<{ source: SearchSource; results: SearchResult[] }> {
  const types = parseTypes(rawTypes);

  try {
    const elasticResults = await searchElasticsearch(query, types, ctx, session);
    if (elasticResults) return { source: "elasticsearch", results: elasticResults };
  } catch (error) {
    console.warn("Elasticsearch search failed; falling back to database search", error);
  }

  try {
    const records = await buildDatabaseRecords(types, session, ctx);
    return { source: session && ctx ? "database" : "mock", results: filterAndLimit(records, query) };
  } catch (error) {
    console.warn("Database search failed; falling back to demo records", error);
    return { source: "mock", results: filterAndLimit(buildDemoRecords(types), query) };
  }
}
