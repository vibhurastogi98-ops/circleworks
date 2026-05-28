"use client";

import React, { useState } from "react";
import { Calculator, AlertCircle, FileText, CheckCircle2, Loader2 } from "lucide-react";

type QuarterKey = 1 | 2 | 3 | 4;

type TaxLine = {
  taxType: string;
  form941Line: string;
  expected: number;
  actual: number;
};

const QUARTERS: { key: QuarterKey; label: string; range: string; rows: TaxLine[] }[] = [
  {
    key: 1,
    label: "Q1 2026",
    range: "Jan 1 – Mar 31, 2026",
    rows: [
      { taxType: "Federal income tax withheld", form941Line: "Line 3", expected: 125_400, actual: 125_400 },
      { taxType: "Social Security tax", form941Line: "Line 5a", expected: 78_250, actual: 78_250 },
      { taxType: "Medicare tax", form941Line: "Line 5c", expected: 18_300, actual: 18_300 },
      { taxType: "State income tax (CA)", form941Line: "State deposit register", expected: 45_600, actual: 45_200 },
    ],
  },
  {
    key: 2,
    label: "Q2 2026",
    range: "Apr 1 – Jun 30, 2026",
    rows: [
      { taxType: "Federal income tax withheld", form941Line: "Line 3", expected: 128_100, actual: 128_100 },
      { taxType: "Social Security tax", form941Line: "Line 5a", expected: 79_800, actual: 79_800 },
      { taxType: "Medicare tax", form941Line: "Line 5c", expected: 18_650, actual: 18_650 },
      { taxType: "State income tax (CA)", form941Line: "State deposit register", expected: 46_200, actual: 46_200 },
    ],
  },
  {
    key: 3,
    label: "Q3 2026",
    range: "Jul 1 – Sep 30, 2026",
    rows: [
      { taxType: "Federal income tax withheld", form941Line: "Line 3", expected: 129_400, actual: 129_400 },
      { taxType: "Social Security tax", form941Line: "Line 5a", expected: 80_100, actual: 80_050 },
      { taxType: "Medicare tax", form941Line: "Line 5c", expected: 18_900, actual: 18_900 },
      { taxType: "State income tax (CA)", form941Line: "State deposit register", expected: 46_500, actual: 46_500 },
    ],
  },
  {
    key: 4,
    label: "Q4 2026",
    range: "Oct 1 – Dec 31, 2026",
    rows: [
      { taxType: "Federal income tax withheld", form941Line: "Line 3", expected: 130_200, actual: 130_200 },
      { taxType: "Social Security tax", form941Line: "Line 5a", expected: 80_400, actual: 80_400 },
      { taxType: "Medicare tax", form941Line: "Line 5c", expected: 19_050, actual: 19_050 },
      { taxType: "State income tax (CA)", form941Line: "State deposit register", expected: 46_800, actual: 46_800 },
    ],
  },
];

function money(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function csvCell(value: string | number) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

export default function QuarterlyReconciliationPage() {
  const [activeQ, setActiveQ] = useState<QuarterKey>(1);
  const [reconcileBusy, setReconcileBusy] = useState<QuarterKey | null>(null);
  const [reconciled, setReconciled] = useState<Record<QuarterKey, boolean>>({
    1: false,
    2: false,
    3: false,
    4: false,
  });
  const [worksheetBusy, setWorksheetBusy] = useState(false);
  const [worksheetDone, setWorksheetDone] = useState(false);

  const quarter = QUARTERS.find((q) => q.key === activeQ)!;

  const handleReconcile = (q: QuarterKey) => {
    setReconcileBusy(q);
    setTimeout(() => {
      setReconcileBusy(null);
      setReconciled((prev) => ({ ...prev, [q]: true }));
    }, 1600);
  };

  const handleWorksheet = () => {
    setWorksheetBusy(true);
    setTimeout(() => {
      setWorksheetBusy(false);
      setWorksheetDone(true);
      const worksheetRows = quarter.rows.map((row) => {
        const variance = row.actual - row.expected;
        return [
          row.taxType,
          row.form941Line,
          row.expected.toFixed(2),
          row.actual.toFixed(2),
          variance.toFixed(2),
          Math.abs(variance) > 0.009 ? "Discrepancy" : "Matched",
        ].map(csvCell).join(",");
      });
      const body = [
        ["CircleWorks 941 reconciliation worksheet"].map(csvCell).join(","),
        ["Quarter", quarter.label].map(csvCell).join(","),
        ["Period", quarter.range].map(csvCell).join(","),
        "",
        ["Tax type", "941 mapping", "Expected deposits", "Actual deposits", "Variance", "Status"].map(csvCell).join(","),
        ...worksheetRows,
        "",
        ["Quarter total", "", totals.expected.toFixed(2), totals.actual.toFixed(2), variance.toFixed(2), Math.abs(variance) > 0.009 ? "Discrepancy" : "Matched"].map(csvCell).join(","),
        ["Review note", "Attach payroll liability register and deposit confirmations before filing Form 941."].map(csvCell).join(","),
      ].join("\n");
      const blob = new Blob([body], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `941-reconciliation-${quarter.label.replace(/\s+/g, "-").toLowerCase()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setTimeout(() => setWorksheetDone(false), 2500);
    }, 1200);
  };

  const totals = quarter.rows.reduce(
    (a, r) => ({
      expected: a.expected + r.expected,
      actual: a.actual + r.actual,
    }),
    { expected: 0, actual: 0 }
  );
  const variance = totals.actual - totals.expected;

  return (
    <div className="flex flex-col gap-6 pb-24">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Calculator size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            Quarterly tax reconciliation
          </h1>
          <p className="text-sm text-slate-500 mt-1 ml-[52px]">
            Compare expected deposits (from payroll calculations) to actual deposits (from bank / agency records). Discrepancies
            highlight Form 941 risk.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleWorksheet}
            disabled={worksheetBusy || worksheetDone}
            className={`px-5 py-2.5 text-sm font-bold rounded-xl shadow-sm transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed ${
              worksheetDone
                ? "bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800"
                : "bg-white border border-slate-200 text-slate-700 dark:text-slate-200 dark:bg-slate-800 dark:border-slate-700 hover:bg-slate-50"
            }`}
          >
            {worksheetBusy ? <Loader2 size={16} className="animate-spin" /> : worksheetDone ? <CheckCircle2 size={16} /> : <FileText size={16} />}
            {worksheetBusy ? "Generating…" : worksheetDone ? "Downloaded" : `Generate 941 worksheet (${quarter.label})`}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {QUARTERS.map((q) => (
          <button
            key={q.key}
            type="button"
            onClick={() => setActiveQ(q.key)}
            className={`px-4 py-2 rounded-xl text-sm font-bold border transition-colors ${
              activeQ === q.key
                ? "bg-blue-600 text-white border-blue-600 shadow-md"
                : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            {q.label}
            {reconciled[q.key] ? " · reconciled" : ""}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">{quarter.label} tax deposits</h3>
            <span className="text-sm text-slate-500">{quarter.range}</span>
          </div>
          <button
            type="button"
            onClick={() => handleReconcile(quarter.key)}
            disabled={reconcileBusy === quarter.key || reconciled[quarter.key]}
            className={`px-5 py-2.5 text-white text-sm font-bold rounded-xl shadow-md flex items-center gap-2 justify-center disabled:opacity-70 disabled:cursor-not-allowed transition-colors ${
              reconciled[quarter.key] ? "bg-emerald-600 hover:bg-emerald-700" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {reconcileBusy === quarter.key ? <Loader2 size={16} className="animate-spin" /> : reconciled[quarter.key] ? <CheckCircle2 size={16} /> : null}
            {reconcileBusy === quarter.key
              ? "Reconciling…"
              : reconciled[quarter.key]
                ? `Reconciled ${quarter.label}`
                : `Reconcile ${quarter.label} taxes`}
          </button>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                <th className="text-left px-4 py-3 font-semibold">Tax type</th>
                <th className="text-left px-4 py-3 font-semibold">941 mapping</th>
                <th className="text-right px-4 py-3 font-semibold">Expected (calc)</th>
                <th className="text-right px-4 py-3 font-semibold">Actual (records)</th>
                <th className="text-right px-4 py-3 font-semibold">Variance</th>
                <th className="text-center px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-900 dark:text-slate-300">
              {quarter.rows.map((row) => {
                const v = row.actual - row.expected;
                const bad = Math.abs(v) > 0.009;
                return (
                  <tr key={row.taxType} className={bad ? "bg-red-50/50 dark:bg-red-900/10" : undefined}>
                    <td className={`px-4 py-3 font-medium ${bad ? "text-red-900 dark:text-red-400" : ""}`}>{row.taxType}</td>
                    <td className={`px-4 py-3 ${bad ? "text-red-900 dark:text-red-400" : "text-slate-500 dark:text-slate-400"}`}>{row.form941Line}</td>
                    <td className={`px-4 py-3 text-right font-mono ${bad ? "text-red-900 dark:text-red-400" : ""}`}>{money(row.expected)}</td>
                    <td className={`px-4 py-3 text-right font-mono ${bad ? "text-red-900 dark:text-red-400" : ""}`}>{money(row.actual)}</td>
                    <td className={`px-4 py-3 text-right font-mono font-bold ${bad ? "text-red-600" : "text-slate-500"}`}>{money(v)}</td>
                    <td className="px-4 py-3 text-center">
                      {bad ? (
                        <span className="inline-flex items-center gap-1 text-red-600 text-xs font-bold bg-red-50 dark:bg-red-500/10 px-2 py-1 rounded">
                          <AlertCircle size={12} /> Discrepancy
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded">
                          <CheckCircle2 size={12} /> Matched
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-50 dark:bg-slate-800/80 font-bold border-t-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
              <tr>
                <td className="px-4 py-3">Quarter total</td>
                <td className="px-4 py-3 text-slate-500">Form 941 worksheet</td>
                <td className="px-4 py-3 text-right font-mono">{money(totals.expected)}</td>
                <td className="px-4 py-3 text-right font-mono">{money(totals.actual)}</td>
                <td className={`px-4 py-3 text-right font-mono ${Math.abs(variance) > 0.009 ? "text-red-600" : "text-slate-500"}`}>
                  {money(variance)}
                </td>
                <td className="px-4 py-3 text-center" />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
