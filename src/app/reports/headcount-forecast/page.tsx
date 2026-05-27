"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Briefcase,
  Calendar,
  ChevronLeft,
  Download,
  FileText,
  Landmark,
  Settings,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";

type ForecastView = "total" | "department" | "location";

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

type ForecastGroup = {
  id: string;
  label: string;
  avgSalary: number;
  currentHeadcount: number;
  historicalAttritionRate: number;
  budgetMaxHeadcount: number;
};

type ForecastResponse = {
  meta: {
    view: ForecastView;
    months: number;
    pastMonths: number;
    futureMonths: number;
    generatedAt: string;
    source?: "company_data" | "demo_fallback";
  };
  groups: ForecastGroup[];
  forecastInputs: {
    totalOpenRequisitions: number;
    plannedHiresFromAts: number;
    historicalAttritionRate: number;
    budgetConstraints: Record<string, number>;
    openRequisitions?: Array<{
      id: number | string;
      title: string;
      department: string;
      location: string;
      expectedSalary: number;
      plannedMonth: string;
      plannedMonthIndex: number;
    }>;
  };
  budgetInfo: {
    currentRunRate: number;
    avgSalaryPerHire: number;
    costPerPlannedHire: number;
    projectedAnnualPayrollCost: number;
  };
  data: ForecastRow[];
};

type AdjustmentMap = Record<string, number>;

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCompactCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function exportCsv(filename: string, rows: Array<Array<string | number>>) {
  const csv = rows
    .map((row) =>
      row
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(","),
    )
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ color?: string; name?: string; value?: number | null }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="min-w-[220px] rounded-xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-900">
      <p className="mb-2 text-sm font-bold text-slate-900 dark:text-white">{label}</p>
      <div className="space-y-1.5 text-xs">
        {payload
          .filter((entry) => entry.value !== null && entry.value !== undefined)
          .map((entry) => (
            <div key={entry.name} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-300">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span>{entry.name}</span>
              </div>
              <span className="font-bold text-slate-900 dark:text-white">{entry.value}</span>
            </div>
          ))}
      </div>
    </div>
  );
};

export default function HeadcountForecastPage() {
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ForecastView>("total");
  const [payload, setPayload] = useState<ForecastResponse | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState("total");
  const [attritionOverride, setAttritionOverride] = useState(0);
  const [budgetConstraint, setBudgetConstraint] = useState(0);
  const [manualAdjustments, setManualAdjustments] = useState<AdjustmentMap>({});

  useEffect(() => {
    let cancelled = false;

    async function fetchForecast() {
      setLoading(true);
      try {
        const response = await fetch(`/api/reports/headcount-forecast?months=24&view=${view}`);
        const result = (await response.json()) as ForecastResponse;
        if (cancelled) return;

        setPayload(result);
        const defaultGroup = result.groups[0];
        setSelectedGroupId(defaultGroup?.id || "total");
        setAttritionOverride(defaultGroup?.historicalAttritionRate || result.forecastInputs.historicalAttritionRate);
        setBudgetConstraint(defaultGroup?.budgetMaxHeadcount || 0);
        setManualAdjustments({});
      } catch (error) {
        console.error("Failed to load headcount forecast", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchForecast();
    return () => {
      cancelled = true;
    };
  }, [view]);

  const selectedGroup = useMemo(
    () => payload?.groups.find((group) => group.id === selectedGroupId) ?? payload?.groups[0] ?? null,
    [payload, selectedGroupId],
  );

  useEffect(() => {
    if (selectedGroup) {
      setAttritionOverride(selectedGroup.historicalAttritionRate);
      setBudgetConstraint(selectedGroup.budgetMaxHeadcount);
      setManualAdjustments({});
    }
  }, [selectedGroup]);

  const groupRows = useMemo(() => {
    if (!payload || !selectedGroup) return [];
    return payload.data.filter((row) => row.groupId === selectedGroup.id);
  }, [payload, selectedGroup]);

  const futureRows = useMemo(
    () => groupRows.filter((row) => row.type === "projected"),
    [groupRows],
  );
  const requisitionsForGroup = useMemo(() => {
    if (!payload || !selectedGroup) return [];
    const openRequisitions = payload.forecastInputs.openRequisitions || [];
    if (view === "total") return openRequisitions;
    return openRequisitions.filter((req) => {
      const key = view === "department" ? req.department : req.location;
      return key === selectedGroup.label;
    });
  }, [payload, selectedGroup, view]);

  const editableMonths = useMemo(() => futureRows.slice(0, 6), [futureRows]);

  const computedRows = useMemo(() => {
    if (!selectedGroup) return [];

    let rollingHC = selectedGroup.currentHeadcount;
    return groupRows.map((row) => {
      if (row.type === "actual") {
        return {
          ...row,
          targetLine: row.targetHeadcount,
        };
      }

      const adjustment = manualAdjustments[row.id] ?? 0;
      const monthlyAttrition = Math.max(
        0,
        Math.round(rollingHC * (attritionOverride / 100 / 12)),
      );
      const endingHC = rollingHC + row.atsPlannedHires + adjustment - monthlyAttrition;
      const budgetDelta = (budgetConstraint - endingHC) * (selectedGroup.avgSalary / 12);
      const annualPayrollImpact = (endingHC - selectedGroup.currentHeadcount) * selectedGroup.avgSalary;
      const status =
        endingHC > budgetConstraint
          ? "Over Budget"
          : endingHC < budgetConstraint - 2
            ? "Under Plan"
            : "On Track";

      const nextRow = {
        ...row,
        startingHC: rollingHC,
        hires: row.atsPlannedHires + Math.max(adjustment, 0),
        attrition: monthlyAttrition + Math.max(-adjustment, 0),
        endingHC,
        budgetDelta,
        annualPayrollImpact,
        status,
        projectedHeadcount: endingHC,
        targetHC: budgetConstraint,
        targetHeadcount: budgetConstraint,
        targetLine: budgetConstraint,
      };
      rollingHC = endingHC;
      return nextRow;
    });
  }, [attritionOverride, budgetConstraint, groupRows, manualAdjustments, selectedGroup]);

  const projectionTableRows = computedRows.filter((row) => row.type === "projected");
  const currentHeadcount = selectedGroup?.currentHeadcount ?? 0;
  const endingHeadcount =
    projectionTableRows[projectionTableRows.length - 1]?.endingHC ?? currentHeadcount;
  const projectedPayroll =
    (payload?.budgetInfo.currentRunRate ?? 0) + (endingHeadcount - currentHeadcount) * (selectedGroup?.avgSalary ?? 0);
  const hireCostImpact =
    (selectedGroup?.avgSalary ?? 0) * (payload?.forecastInputs.plannedHiresFromAts ?? 0);
  const todayDividerLabel = projectionTableRows[0]?.month;

  const handleAdjustmentChange = (rowId: string, value: number) => {
    setManualAdjustments((current) => ({
      ...current,
      [rowId]: value,
    }));
  };

  const handleExportCsv = () => {
    exportCsv(
      `headcount-forecast-${view}-${selectedGroup?.id || "total"}.csv`,
      [
        [
          "Month",
          "Starting HC",
          "Hires",
          "Attrition",
          "Ending HC",
          "Budget Delta",
          "Status",
        ],
        ...projectionTableRows.map((row) => [
          row.month,
          row.startingHC,
          row.hires,
          row.attrition,
          row.endingHC,
          row.budgetDelta,
          row.status,
        ]),
      ],
    );
  };

  const handleExportPdf = () => {
    window.print();
  };

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Link
            href="/reports"
            className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            <ChevronLeft size={16} /> Back to Reports
          </Link>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
            <Users size={24} className="text-blue-600" />
            Headcount Forecasting
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Actual vs projected headcount for the last 12 months and next 12 months.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
            {(["total", "department", "location"] as ForecastView[]).map((option) => (
              <button
                key={option}
                onClick={() => setView(option)}
                className={`rounded-md px-3 py-1.5 text-xs font-bold capitalize transition-colors ${
                  view === option
                    ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                By {option}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Download size={16} /> CSV data
          </button>
          <button
            onClick={handleExportPdf}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            <FileText size={16} /> PDF report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
        <div className="space-y-5 xl:col-span-1">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
              <Settings size={18} className="text-blue-600" />
              <h2 className="text-sm font-bold">Forecast Inputs</h2>
            </div>

            {view !== "total" && payload?.groups?.length ? (
              <div className="mb-4">
                <label className="mb-1.5 block text-xs font-bold text-slate-500 dark:text-slate-400">
                  Focus {view}
                </label>
                <select
                  value={selectedGroup?.id || ""}
                  onChange={(event) => setSelectedGroupId(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                >
                  {payload.groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            <div className="space-y-5">
              <div>
                <label className="mb-1.5 flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                  <span>Planned hires from ATS</span>
                  <span className="rounded bg-blue-50 px-1.5 py-0.5 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    {payload?.forecastInputs.totalOpenRequisitions ?? 0} open reqs
                  </span>
                </label>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                      <Briefcase size={14} className="text-slate-400" />
                      ATS hires over forecast
                    </div>
                    <span className="text-lg font-black text-blue-600 dark:text-blue-400">
                      {futureRows.reduce((sum, row) => sum + row.atsPlannedHires, 0)}
                    </span>
                  </div>
                  <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                    Auto-pulled from open requisitions and used as the baseline monthly hire plan.
                  </p>
                  <div className="mt-3 space-y-2">
                    {requisitionsForGroup.slice(0, 4).map((req) => (
                      <div key={req.id} className="rounded-lg bg-white p-2 text-xs dark:bg-slate-900">
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-semibold text-slate-800 dark:text-slate-100">{req.title}</span>
                          <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                            {req.plannedMonth}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                          <span>{view === "location" ? req.department : req.location}</span>
                          <span>{formatCompactCurrency(req.expectedSalary)}</span>
                        </div>
                      </div>
                    ))}
                    {requisitionsForGroup.length > 4 && (
                      <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        +{requisitionsForGroup.length - 4} more requisitions included
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1.5 flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                  <span>Planned attrition rate</span>
                  <span>Historical avg {selectedGroup?.historicalAttritionRate ?? 0}%</span>
                </label>
                <div className="relative">
                  <TrendingDown className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    type="number"
                    step="0.1"
                    value={attritionOverride}
                    onChange={(event) => setAttritionOverride(Number(event.target.value))}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-500 dark:text-slate-400">
                  Budget constraint
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    type="number"
                    value={budgetConstraint}
                    onChange={(event) => setBudgetConstraint(Number(event.target.value))}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  Max headcount for {selectedGroup?.label || "this scope"} before the forecast turns red.
                </p>
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                  <Calendar size={12} />
                  Manual adjustments by month
                </label>
                <div className="space-y-2">
                  {editableMonths.map((row) => (
                    <div
                      key={row.id}
                      className="grid grid-cols-[1fr_92px] items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-700 dark:bg-slate-950"
                    >
                      <div>
                        <p className="text-xs font-semibold text-slate-900 dark:text-white">{row.month}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {selectedGroup?.label || "Total"} net headcount delta
                        </p>
                      </div>
                      <input
                        type="number"
                        value={manualAdjustments[row.id] ?? 0}
                        onChange={(event) => handleAdjustmentChange(row.id, Number(event.target.value))}
                        className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-right text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                  Use positive numbers for extra hiring and negative numbers for planned cuts or freezes.
                </p>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-5 text-white shadow-md">
            <div className="absolute -right-6 -top-6 opacity-10">
              <Landmark size={120} />
            </div>
            <div className="relative z-10">
              <h3 className="text-sm font-bold text-blue-100">Budget Impact</h3>
              <p className="mt-1 text-3xl font-black">{formatCompactCurrency(projectedPayroll)}/yr</p>
              <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-xs text-blue-100">
                <TrendingUp size={12} />
                Current run rate {formatCompactCurrency(payload?.budgetInfo.currentRunRate ?? 0)}
              </p>

              <div className="mt-4 space-y-2 text-xs text-blue-100">
                <div className="flex items-center justify-between border-b border-white/20 pb-1">
                  <span>Cost per planned hire</span>
                  <span className="font-bold">
                    {formatCompactCurrency(selectedGroup?.avgSalary ?? payload?.budgetInfo.costPerPlannedHire ?? 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-white/20 pb-1">
                  <span>Projected ending HC</span>
                  <span className="font-bold">{endingHeadcount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Annual hire impact</span>
                  <span className="font-bold">{formatCompactCurrency(hireCostImpact)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 xl:col-span-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Forecast Chart</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedGroup?.label || "Total"} headcount across the last 12 months and next 12 months.
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <span className="h-0.5 w-4 rounded bg-blue-600" /> Actual
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-0.5 w-4 border-t-2 border-dashed border-indigo-500" /> Projected
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-0.5 w-4 border-t-2 border-dotted border-emerald-500" /> Target
                </span>
              </div>
            </div>

            <div className="h-[360px] w-full">
              {loading ? (
                <div className="flex h-full items-center justify-center text-slate-400">
                  Loading forecast...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={computedRows} margin={{ top: 12, right: 24, left: -18, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: "12px" }} />
                    <Line
                      type="monotone"
                      dataKey="actualHeadcount"
                      name="Actual headcount"
                      stroke="#2563eb"
                      strokeWidth={3}
                      dot={{ r: 2 }}
                      connectNulls
                    />
                    <Line
                      type="monotone"
                      dataKey="projectedHeadcount"
                      name="Projected"
                      stroke="#6366f1"
                      strokeWidth={3}
                      strokeDasharray="6 6"
                      dot={{ r: 2 }}
                      connectNulls
                    />
                    <Line
                      type="monotone"
                      dataKey="targetLine"
                      name="Target"
                      stroke="#10b981"
                      strokeWidth={2}
                      strokeDasharray="2 4"
                      dot={false}
                    />
                    {todayDividerLabel ? (
                      <ReferenceLine
                        x={todayDividerLabel}
                        stroke="#94a3b8"
                        strokeDasharray="3 3"
                        label={{ value: "Today", position: "top", fontSize: 10, fill: "#94a3b8" }}
                      />
                    ) : null}
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-slate-800">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Projection Table</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Month-by-month starting headcount, hires, attrition, ending headcount, and budget status.
                </p>
              </div>
              <div className="rounded bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                GET /api/reports/headcount-forecast?months=24
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-xs text-slate-500 dark:bg-slate-800/40 dark:text-slate-400">
                    <th className="border-b border-slate-200 px-4 py-3 font-bold dark:border-slate-800">Month</th>
                    <th className="border-b border-slate-200 px-4 py-3 text-right font-bold dark:border-slate-800">Starting HC</th>
                    <th className="border-b border-slate-200 px-4 py-3 text-right font-bold dark:border-slate-800">Hires</th>
                    <th className="border-b border-slate-200 px-4 py-3 text-right font-bold dark:border-slate-800">Attrition</th>
                    <th className="border-b border-slate-200 px-4 py-3 text-right font-bold dark:border-slate-800">Ending HC</th>
                    <th className="border-b border-slate-200 px-4 py-3 text-right font-bold dark:border-slate-800">Budget Delta</th>
                    <th className="border-b border-slate-200 px-4 py-3 text-right font-bold dark:border-slate-800">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {projectionTableRows.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{row.month}</td>
                      <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">{row.startingHC}</td>
                      <td className="px-4 py-3 text-right font-medium text-green-600 dark:text-green-400">+{row.hires}</td>
                      <td className="px-4 py-3 text-right font-medium text-red-600 dark:text-red-400">-{row.attrition}</td>
                      <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-white">{row.endingHC}</td>
                      <td className="px-4 py-3 text-right text-sm">
                        <span className={row.budgetDelta >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                          {formatCompactCurrency(row.budgetDelta)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={`inline-flex rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
                            row.status === "On Track"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : row.status === "Over Budget"
                                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Current Run Rate
              </p>
              <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
                {formatCompactCurrency(payload?.budgetInfo.currentRunRate ?? 0)}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Cost Per Planned Hire
              </p>
              <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
                {formatCurrency(selectedGroup?.avgSalary ?? payload?.budgetInfo.costPerPlannedHire ?? 0)}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Net Headcount Change
              </p>
              <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
                {endingHeadcount - currentHeadcount >= 0 ? "+" : ""}
                {endingHeadcount - currentHeadcount}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
