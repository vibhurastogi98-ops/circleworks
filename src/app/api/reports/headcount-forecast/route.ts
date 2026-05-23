import { NextResponse } from "next/server";

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

function sumSeries(groups: ForecastGroup[]): ForecastGroup {
  const monthCount = 12;
  const atsPlannedHires = Array.from({ length: monthCount }, (_, index) =>
    groups.reduce((sum, group) => sum + group.atsPlannedHires[index], 0),
  );
  const actualMonthlyNet = Array.from({ length: monthCount }, (_, index) =>
    groups.reduce((sum, group) => sum + group.actualMonthlyNet[index], 0),
  );
  const currentHeadcount = groups.reduce((sum, group) => sum + group.currentHeadcount, 0);
  const weightedSalary =
    groups.reduce((sum, group) => sum + group.avgSalary * group.currentHeadcount, 0) / currentHeadcount;
  const weightedAttrition =
    groups.reduce((sum, group) => sum + group.historicalAttritionRate * group.currentHeadcount, 0) / currentHeadcount;

  return {
    id: "total",
    label: "Total Headcount",
    avgSalary: Math.round(weightedSalary),
    currentHeadcount,
    historicalAttritionRate: Number(weightedAttrition.toFixed(1)),
    budgetMaxHeadcount: groups.reduce((sum, group) => sum + group.budgetMaxHeadcount, 0),
    atsPlannedHires,
    actualMonthlyNet,
  };
}

function getGroupsForView(view: ForecastView): ForecastGroup[] {
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
    const hires = Math.max(group.actualMonthlyNet[index], 0) + (index % 3 === 0 ? 1 : 0);
    const attrition = Math.max(-group.actualMonthlyNet[index], 0) + (index % 4 === 0 ? 1 : 0);
    const endingHC = actualHC + hires - attrition;
    const targetHC = group.budgetMaxHeadcount - Math.max(0, pastMonths - index - 6);

    rows.push({
      id: `${group.id}-actual-${index}`,
      month: date.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
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
    const attrition = Math.max(1, Math.round(projectedHC * (group.historicalAttritionRate / 100 / 12)));
    const endingHC = projectedHC + hires - attrition;
    const targetHC = group.budgetMaxHeadcount;
    const budgetDelta = (targetHC - endingHC) * (group.avgSalary / 12);
    const annualPayrollImpact = (endingHC - group.currentHeadcount) * group.avgSalary;

    rows.push({
      id: `${group.id}-forecast-${index}`,
      month: date.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const months = Math.min(24, Math.max(12, Number.parseInt(searchParams.get("months") || "24", 10)));
  const requestedView = searchParams.get("view");
  const view: ForecastView =
    requestedView === "department" || requestedView === "location" ? requestedView : "total";
  const groups = getGroupsForView(view);
  const rows = groups.flatMap((group) => buildRows(group, months));

  const currentRunRate = groups.reduce(
    (sum, group) => sum + group.currentHeadcount * group.avgSalary,
    0,
  );
  const plannedHireCount = groups.reduce(
    (sum, group) => sum + group.atsPlannedHires.reduce((subTotal, hires) => subTotal + hires, 0),
    0,
  );
  const averageSalary =
    groups.reduce((sum, group) => sum + group.avgSalary * group.currentHeadcount, 0) /
    groups.reduce((sum, group) => sum + group.currentHeadcount, 0);

  return NextResponse.json({
    meta: {
      view,
      months,
      pastMonths: 12,
      futureMonths: months - 12,
      generatedAt: new Date().toISOString(),
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
      totalOpenRequisitions: plannedHireCount,
      plannedHiresFromAts: plannedHireCount,
      historicalAttritionRate:
        Math.round(
          (groups.reduce((sum, group) => sum + group.historicalAttritionRate, 0) / groups.length) * 10,
        ) / 10,
      budgetConstraints: Object.fromEntries(
        groups.map((group) => [group.id, group.budgetMaxHeadcount]),
      ),
    },
    budgetInfo: {
      currentRunRate,
      avgSalaryPerHire: Math.round(averageSalary),
      costPerPlannedHire: Math.round(averageSalary),
      projectedAnnualPayrollCost:
        currentRunRate + groups.reduce((sum, group) => sum + group.atsPlannedHires.reduce((a, b) => a + b, 0) * group.avgSalary, 0),
    },
    data: rows,
  });
}
