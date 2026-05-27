import { NextResponse } from "next/server";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { atsJobs, atsOffers, employees } from "@/db/schema";
import { getSession, resolveUserContext } from "@/lib/session";

type ForecastView = "total" | "department" | "location";

type ForecastGroup = {
  id: string;
  label: string;
  avgSalary: number;
  currentHeadcount: number;
  historicalAttritionRate: number;
  budgetMaxHeadcount: number;
  atsPlannedHires: number[];
  actualMonthlyNet: number[];
};

type ForecastRow = {
  id: string;
  month: string;
  date: string;
  type: "actual" | "projected";
  groupId: string;
  groupLabel: string;
  startingHC: number;
  hires: number;
  attrition: number;
  endingHC: number;
  targetHC: number;
  budgetDelta: number;
  status: "On Track" | "Over Budget" | "Under Plan";
  actualHeadcount: number | null;
  projectedHeadcount: number | null;
  targetHeadcount: number;
  annualPayrollImpact: number;
  atsPlannedHires: number;
};

type EmployeeSnapshot = {
  id: number;
  department: string | null;
  location: string | null;
  salary: number | null;
  startDate: string | Date | null;
  terminationDate: string | Date | null;
  status: string | null;
};

type OpenRequisition = {
  id: number | string;
  title: string;
  department: string;
  location: string;
  expectedSalary: number;
  plannedMonthIndex: number;
  plannedMonth: string;
};

const DEPARTMENT_GROUPS: ForecastGroup[] = [
  {
    id: "eng",
    label: "Engineering",
    avgSalary: 148000,
    currentHeadcount: 62,
    historicalAttritionRate: 4.4,
    budgetMaxHeadcount: 68,
    atsPlannedHires: [2, 2, 1, 2, 1, 1, 0, 1, 1, 0, 1, 1],
    actualMonthlyNet: [1, 1, 2, -1, 1, 0, 1, 1, 0, 2, 1, 1],
  },
  {
    id: "sales",
    label: "Sales",
    avgSalary: 118000,
    currentHeadcount: 34,
    historicalAttritionRate: 7.2,
    budgetMaxHeadcount: 37,
    atsPlannedHires: [1, 1, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1],
    actualMonthlyNet: [0, 1, 0, 1, -1, 1, 1, 0, 0, 1, 0, 1],
  },
  {
    id: "ops",
    label: "Operations",
    avgSalary: 96000,
    currentHeadcount: 28,
    historicalAttritionRate: 5.6,
    budgetMaxHeadcount: 31,
    atsPlannedHires: [1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 0],
    actualMonthlyNet: [1, 0, 1, 0, 1, -1, 1, 0, 1, 0, 0, 1],
  },
  {
    id: "finance",
    label: "Finance",
    avgSalary: 132000,
    currentHeadcount: 16,
    historicalAttritionRate: 3.1,
    budgetMaxHeadcount: 18,
    atsPlannedHires: [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1],
    actualMonthlyNet: [0, 0, 1, 0, 0, 1, 0, -1, 0, 1, 0, 0],
  },
];

const LOCATION_GROUPS: ForecastGroup[] = [
  {
    id: "remote",
    label: "Remote",
    avgSalary: 121000,
    currentHeadcount: 58,
    historicalAttritionRate: 5.1,
    budgetMaxHeadcount: 64,
    atsPlannedHires: [2, 1, 1, 2, 1, 1, 1, 1, 0, 1, 1, 0],
    actualMonthlyNet: [1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1],
  },
  {
    id: "nyc",
    label: "New York",
    avgSalary: 141000,
    currentHeadcount: 32,
    historicalAttritionRate: 4.7,
    budgetMaxHeadcount: 35,
    atsPlannedHires: [1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0],
    actualMonthlyNet: [0, 1, 1, 0, -1, 1, 1, 0, 0, 1, 0, 1],
  },
  {
    id: "austin",
    label: "Austin",
    avgSalary: 112000,
    currentHeadcount: 29,
    historicalAttritionRate: 5.8,
    budgetMaxHeadcount: 33,
    atsPlannedHires: [1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1],
    actualMonthlyNet: [1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 0],
  },
  {
    id: "denver",
    label: "Denver",
    avgSalary: 98000,
    currentHeadcount: 21,
    historicalAttritionRate: 6.0,
    budgetMaxHeadcount: 24,
    atsPlannedHires: [0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0],
    actualMonthlyNet: [0, 0, 1, 1, 0, -1, 1, 0, 1, 0, 0, 1],
  },
];

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "unassigned";
}

function toDate(value: string | Date | null | undefined) {
  if (!value) return null;
  const parsed = value instanceof Date ? value : new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

function sumSeries(groups: ForecastGroup[]): ForecastGroup {
  const monthCount = 12;
  const atsPlannedHires = Array.from({ length: monthCount }, (_, index) =>
    groups.reduce((sum, group) => sum + (group.atsPlannedHires[index] ?? 0), 0),
  );
  const actualMonthlyNet = Array.from({ length: monthCount }, (_, index) =>
    groups.reduce((sum, group) => sum + (group.actualMonthlyNet[index] ?? 0), 0),
  );
  const currentHeadcount = groups.reduce((sum, group) => sum + group.currentHeadcount, 0);
  const weightedSalary =
    groups.reduce((sum, group) => sum + group.avgSalary * group.currentHeadcount, 0) /
    Math.max(1, currentHeadcount);
  const weightedAttrition =
    groups.reduce((sum, group) => sum + group.historicalAttritionRate * group.currentHeadcount, 0) /
    Math.max(1, currentHeadcount);

  return {
    id: "total",
    label: "Total Headcount",
    avgSalary: Math.round(weightedSalary || 100000),
    currentHeadcount,
    historicalAttritionRate: Number((weightedAttrition || 0).toFixed(1)),
    budgetMaxHeadcount: groups.reduce((sum, group) => sum + group.budgetMaxHeadcount, 0),
    atsPlannedHires,
    actualMonthlyNet,
  };
}

function getFallbackGroupsForView(view: ForecastView): ForecastGroup[] {
  if (view === "department") return DEPARTMENT_GROUPS;
  if (view === "location") return LOCATION_GROUPS;
  return [sumSeries(DEPARTMENT_GROUPS)];
}

function getStatus(endingHC: number, targetHC: number): ForecastRow["status"] {
  if (endingHC > targetHC) return "Over Budget";
  if (endingHC < targetHC - 2) return "Under Plan";
  return "On Track";
}

function buildRows(group: ForecastGroup, months: number): ForecastRow[] {
  const now = new Date();
  const pastMonths = Math.min(12, months);
  const futureMonths = Math.max(months - pastMonths, 0);
  const rows: ForecastRow[] = [];

  const actualStart = group.currentHeadcount - group.actualMonthlyNet.reduce((sum, delta) => sum + delta, 0);
  let actualHC = actualStart;

  for (let index = 0; index < pastMonths; index += 1) {
    const offset = pastMonths - index;
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const net = group.actualMonthlyNet[index] ?? 0;
    const hires = Math.max(net, 0) + (index % 3 === 0 ? 1 : 0);
    const attrition = Math.max(-net, 0) + (index % 4 === 0 ? 1 : 0);
    const endingHC = actualHC + hires - attrition;
    const targetHC = Math.max(group.currentHeadcount, group.budgetMaxHeadcount - Math.max(0, pastMonths - index - 6));

    rows.push({
      id: `${group.id}-actual-${index}`,
      month: monthLabel(date),
      date: date.toISOString(),
      type: "actual",
      groupId: group.id,
      groupLabel: group.label,
      startingHC: actualHC,
      hires,
      attrition,
      endingHC,
      targetHC,
      budgetDelta: 0,
      status: "On Track",
      actualHeadcount: endingHC,
      projectedHeadcount: null,
      targetHeadcount: targetHC,
      annualPayrollImpact: 0,
      atsPlannedHires: 0,
    });

    actualHC = endingHC;
  }

  let projectedHC = group.currentHeadcount;
  for (let index = 0; index < futureMonths; index += 1) {
    const date = new Date(now.getFullYear(), now.getMonth() + index, 1);
    const hires = group.atsPlannedHires[index] ?? 0;
    const attrition = Math.max(0, Math.round(projectedHC * (group.historicalAttritionRate / 100 / 12)));
    const endingHC = projectedHC + hires - attrition;
    const targetHC = group.budgetMaxHeadcount;
    const budgetDelta = (targetHC - endingHC) * (group.avgSalary / 12);
    const annualPayrollImpact = (endingHC - group.currentHeadcount) * group.avgSalary;

    rows.push({
      id: `${group.id}-forecast-${index}`,
      month: monthLabel(date),
      date: date.toISOString(),
      type: "projected",
      groupId: group.id,
      groupLabel: group.label,
      startingHC: projectedHC,
      hires,
      attrition,
      endingHC,
      targetHC,
      budgetDelta,
      status: getStatus(endingHC, targetHC),
      actualHeadcount: null,
      projectedHeadcount: endingHC,
      targetHeadcount: targetHC,
      annualPayrollImpact,
      atsPlannedHires: hires,
    });

    projectedHC = endingHC;
  }

  return rows;
}

function activeEmployees(rows: EmployeeSnapshot[]) {
  return rows.filter((employee) => (employee.status || "active").toLowerCase() !== "terminated");
}

function averageSalary(rows: EmployeeSnapshot[], fallback = 100000) {
  const salaries = rows.map((row) => row.salary).filter((value): value is number => Boolean(value && value > 0));
  if (!salaries.length) return fallback;
  return Math.round(salaries.reduce((sum, value) => sum + value, 0) / salaries.length);
}

function actualSeriesForGroup(rows: EmployeeSnapshot[], groupValue: string, field: "department" | "location") {
  const now = new Date();
  const months = Array.from({ length: 12 }, (_, index) => {
    const offset = 12 - index;
    return monthKey(new Date(now.getFullYear(), now.getMonth() - offset, 1));
  });

  return months.map((key) => {
    const hires = rows.filter((employee) => {
      const start = toDate(employee.startDate);
      return (employee[field] || "Unassigned") === groupValue && start && monthKey(start) === key;
    }).length;
    const terminations = rows.filter((employee) => {
      const termination = toDate(employee.terminationDate);
      return (employee[field] || "Unassigned") === groupValue && termination && monthKey(termination) === key;
    }).length;
    return hires - terminations;
  });
}

function plannedMonthIndex(jobIndex: number, futureMonths: number) {
  if (futureMonths <= 0) return 0;
  return Math.min(futureMonths - 1, jobIndex % Math.min(6, futureMonths));
}

async function ensureAtsSalaryColumns() {
  await db.execute(sql`
    ALTER TABLE ats_jobs
      ADD COLUMN IF NOT EXISTS salary_min integer,
      ADD COLUMN IF NOT EXISTS salary_max integer
  `);
}

async function buildDataDrivenGroups(view: ForecastView, months: number, companyId: number) {
  await ensureAtsSalaryColumns();

  const futureMonths = Math.max(months - 12, 0);
  const employeeRows = await db
    .select({
      id: employees.id,
      department: employees.department,
      location: employees.location,
      salary: employees.salary,
      startDate: employees.startDate,
      terminationDate: employees.terminationDate,
      status: employees.status,
    })
    .from(employees)
    .where(eq(employees.companyId, companyId));

  const currentEmployees = activeEmployees(employeeRows);
  if (!currentEmployees.length) {
    return null;
  }

  const [jobRows, offerRows] = await Promise.all([
    db
      .select({
        id: atsJobs.id,
        title: atsJobs.title,
        department: atsJobs.department,
        location: atsJobs.location,
        status: atsJobs.status,
        salaryMin: atsJobs.salaryMin,
        salaryMax: atsJobs.salaryMax,
        createdAt: atsJobs.createdAt,
      })
      .from(atsJobs)
      .where(and(eq(atsJobs.companyId, companyId), eq(atsJobs.status, "Active"))),
    db
      .select({
        jobId: atsOffers.jobId,
        salary: atsOffers.salary,
      })
      .from(atsOffers),
  ]);

  const salaryByJob = new Map<number, number>();
  offerRows.forEach((offer) => {
    if (!offer.jobId || !offer.salary) return;
    salaryByJob.set(offer.jobId, offer.salary);
  });

  const companyAvgSalary = averageSalary(currentEmployees);
  const openRequisitions: OpenRequisition[] = jobRows.map((job, index) => {
    const deptEmployees = currentEmployees.filter((employee) => employee.department === job.department);
    const locationEmployees = currentEmployees.filter((employee) => employee.location === job.location);
    const salaryFromPosting =
      job.salaryMin && job.salaryMax
        ? Math.round((job.salaryMin + job.salaryMax) / 2)
        : job.salaryMin || job.salaryMax || salaryByJob.get(job.id);
    const expectedSalary =
      salaryFromPosting ||
      averageSalary(deptEmployees, averageSalary(locationEmployees, companyAvgSalary));
    const monthIndex = plannedMonthIndex(index, futureMonths || 12);
    const date = new Date(new Date().getFullYear(), new Date().getMonth() + monthIndex, 1);

    return {
      id: job.id,
      title: job.title,
      department: job.department || "Unassigned",
      location: job.location || "Unassigned",
      expectedSalary,
      plannedMonthIndex: monthIndex,
      plannedMonth: monthLabel(date),
    };
  });

  const groupField: "department" | "location" = view === "location" ? "location" : "department";
  const groupLabels =
    view === "total"
      ? ["Total Headcount"]
      : Array.from(
          new Set([
            ...currentEmployees.map((employee) => employee[groupField] || "Unassigned"),
            ...openRequisitions.map((job) => (groupField === "department" ? job.department : job.location)),
          ]),
        ).sort((a, b) => a.localeCompare(b));

  const groups =
    view === "total"
      ? [
          buildGroupFromRows({
            id: "total",
            label: "Total Headcount",
            employees: currentEmployees,
            allEmployees: employeeRows,
            openRequisitions,
            futureMonths,
          }),
        ]
      : groupLabels.map((label) =>
          buildGroupFromRows({
            id: slugify(label),
            label,
            employees: currentEmployees.filter((employee) => (employee[groupField] || "Unassigned") === label),
            allEmployees: employeeRows,
            openRequisitions: openRequisitions.filter((job) =>
              groupField === "department" ? job.department === label : job.location === label,
            ),
            futureMonths,
            groupValue: label,
            groupField,
          }),
        );

  return {
    groups,
    openRequisitions,
    source: "company_data" as const,
  };
}

function buildGroupFromRows({
  id,
  label,
  employees: currentEmployees,
  allEmployees,
  openRequisitions,
  futureMonths,
  groupValue,
  groupField,
}: {
  id: string;
  label: string;
  employees: EmployeeSnapshot[];
  allEmployees: EmployeeSnapshot[];
  openRequisitions: OpenRequisition[];
  futureMonths: number;
  groupValue?: string;
  groupField?: "department" | "location";
}): ForecastGroup {
  const plannedHires = Array.from({ length: Math.max(12, futureMonths) }, () => 0);
  openRequisitions.forEach((job) => {
    plannedHires[job.plannedMonthIndex] = (plannedHires[job.plannedMonthIndex] || 0) + 1;
  });

  const relevantAllEmployees =
    groupValue && groupField
      ? allEmployees.filter((employee) => (employee[groupField] || "Unassigned") === groupValue)
      : allEmployees;
  const terminationsPastYear = relevantAllEmployees.filter((employee) => {
    const termination = toDate(employee.terminationDate);
    if (!termination) return false;
    const startWindow = new Date();
    startWindow.setMonth(startWindow.getMonth() - 12);
    return termination >= startWindow;
  }).length;
  const historicalAttritionRate = Number(
    ((terminationsPastYear / Math.max(1, currentEmployees.length || relevantAllEmployees.length)) * 100).toFixed(1),
  );
  const salaryBase = averageSalary(currentEmployees, 100000);
  const reqAvgSalary = openRequisitions.length
    ? Math.round(openRequisitions.reduce((sum, job) => sum + job.expectedSalary, 0) / openRequisitions.length)
    : salaryBase;
  const budgetBuffer = Math.max(2, Math.ceil(openRequisitions.length * 1.15));

  return {
    id,
    label,
    avgSalary: reqAvgSalary,
    currentHeadcount: currentEmployees.length,
    historicalAttritionRate,
    budgetMaxHeadcount: currentEmployees.length + budgetBuffer,
    atsPlannedHires: plannedHires,
    actualMonthlyNet: groupValue && groupField ? actualSeriesForGroup(relevantAllEmployees, groupValue, groupField) : actualSeriesForTotal(relevantAllEmployees),
  };
}

function actualSeriesForTotal(rows: EmployeeSnapshot[]) {
  const now = new Date();
  return Array.from({ length: 12 }, (_, index) => {
    const offset = 12 - index;
    const key = monthKey(new Date(now.getFullYear(), now.getMonth() - offset, 1));
    const hires = rows.filter((employee) => {
      const start = toDate(employee.startDate);
      return start && monthKey(start) === key;
    }).length;
    const terminations = rows.filter((employee) => {
      const termination = toDate(employee.terminationDate);
      return termination && monthKey(termination) === key;
    }).length;
    return hires - terminations;
  });
}

function buildFallbackOpenRequisitions(groups: ForecastGroup[], futureMonths: number): OpenRequisition[] {
  return groups.flatMap((group) =>
    group.atsPlannedHires.flatMap((count, monthIndex) =>
      Array.from({ length: count }, (_, index) => {
        const date = new Date(new Date().getFullYear(), new Date().getMonth() + monthIndex, 1);
        return {
          id: `${group.id}-${monthIndex}-${index}`,
          title: `${group.label} planned hire`,
          department: group.label === "Total Headcount" ? "Mixed" : group.label,
          location: "Mixed",
          expectedSalary: group.avgSalary,
          plannedMonthIndex: monthIndex,
          plannedMonth: monthLabel(date),
        };
      }),
    ),
  ).slice(0, Math.max(0, futureMonths * 4));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const months = Math.min(24, Math.max(12, Number.parseInt(searchParams.get("months") || "24", 10)));
  const requestedView = searchParams.get("view");
  const view: ForecastView =
    requestedView === "department" || requestedView === "location" ? requestedView : "total";
  const futureMonths = months - 12;

  let groups = getFallbackGroupsForView(view);
  let openRequisitions = buildFallbackOpenRequisitions(groups, futureMonths);
  let source: "company_data" | "demo_fallback" = "demo_fallback";

  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ctx = await resolveUserContext(session);
    if (!ctx) {
      return NextResponse.json({ error: "Employee record not found" }, { status: 404 });
    }

    const liveForecast = await buildDataDrivenGroups(view, months, ctx.companyId);
    if (liveForecast) {
      groups = liveForecast.groups;
      openRequisitions = liveForecast.openRequisitions;
      source = liveForecast.source;
    }
  } catch (error) {
    console.error("[Headcount Forecast GET fallback]", error);
  }

  const rows = groups.flatMap((group) => buildRows(group, months));
  const currentRunRate = groups.reduce(
    (sum, group) => sum + group.currentHeadcount * group.avgSalary,
    0,
  );
  const plannedHireCount = groups.reduce(
    (sum, group) => sum + group.atsPlannedHires.reduce((subTotal, hires) => subTotal + hires, 0),
    0,
  );
  const weightedAverageSalary =
    groups.reduce((sum, group) => sum + group.avgSalary * Math.max(1, group.currentHeadcount), 0) /
    Math.max(1, groups.reduce((sum, group) => sum + Math.max(1, group.currentHeadcount), 0));

  return NextResponse.json({
    meta: {
      view,
      months,
      pastMonths: 12,
      futureMonths,
      generatedAt: new Date().toISOString(),
      source,
    },
    groups: groups.map((group) => ({
      id: group.id,
      label: group.label,
      avgSalary: group.avgSalary,
      currentHeadcount: group.currentHeadcount,
      historicalAttritionRate: group.historicalAttritionRate,
      budgetMaxHeadcount: group.budgetMaxHeadcount,
    })),
    forecastInputs: {
      totalOpenRequisitions: openRequisitions.length,
      plannedHiresFromAts: plannedHireCount,
      historicalAttritionRate:
        Math.round(
          (groups.reduce((sum, group) => sum + group.historicalAttritionRate, 0) / Math.max(1, groups.length)) * 10,
        ) / 10,
      budgetConstraints: Object.fromEntries(
        groups.map((group) => [group.id, group.budgetMaxHeadcount]),
      ),
      openRequisitions,
    },
    budgetInfo: {
      currentRunRate,
      avgSalaryPerHire: Math.round(weightedAverageSalary),
      costPerPlannedHire: Math.round(weightedAverageSalary),
      projectedAnnualPayrollCost:
        currentRunRate + openRequisitions.reduce((sum, job) => sum + job.expectedSalary, 0),
    },
    data: rows,
  });
}
