"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft, Download, Printer, Share2, ArrowUpDown,
  ChevronLeft, ChevronRight, Loader2, FileText, Clock
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { standardReports, generateReportData, type ReportViewerData } from "@/data/mockReports";

const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4", "#f97316", "#ec4899"];
const PAGE_SIZE = 20;

export default function ReportViewer() {
  const params = useParams();
  const reportId = params.id as string;

  const report = standardReports.find((r) => r.id === reportId);
  const reportName = report?.name || "Custom Report";

  const [sortKey, setSortKey] = useState<string>("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);
  const [chartType, setChartType] = useState<"bar" | "line" | "pie">("bar");
  const [showChart, setShowChart] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const data: ReportViewerData = useMemo(() => generateReportData(reportId), [reportId]);

  const totalRows = data.totalRows;
  const isLarge = totalRows > 10000;

  // Sort
  const sortedRows = useMemo(() => {
    if (!sortKey) return data.rows;
    return [...data.rows].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }
      return sortDir === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [data.rows, sortKey, sortDir]);

  // Paginate
  const totalPages = Math.ceil(sortedRows.length / PAGE_SIZE);
  const pagedRows = sortedRows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  // Chart data — aggregate by first text column
  const chartData = useMemo(() => {
    const textCol = data.columns.find((c) => c.type === "text");
    const numCol = data.columns.find((c) => c.type === "currency" || c.type === "number");
    if (!textCol || !numCol) return [];
    return data.rows.map((row) => ({
      name: String(row[textCol.key]),
      value: Number(row[numCol.key]),
    }));
  }, [data]);

  const handleExport = (format: string) => {
    setIsExporting(true);
    setTimeout(() => setIsExporting(false), 1500);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link href="/reports" className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <ArrowLeft size={18} className="text-slate-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{reportName}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Clock size={12} />
              Generated {new Date(data.generatedAt).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}
              <span className="text-slate-300 dark:text-slate-600">·</span>
              {totalRows.toLocaleString()} rows
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
            <button onClick={() => handleExport("csv")} className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex items-center gap-1">
              <Download size={12} /> CSV
            </button>
            <button onClick={() => handleExport("excel")} className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border-r border-slate-200 dark:border-slate-700">
              Excel
            </button>
            <button onClick={() => handleExport("pdf")} className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800">
              PDF
            </button>
          </div>
          <button className="p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700">
            <Printer size={16} />
          </button>
          <button className="p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700">
            <Share2 size={16} />
          </button>
        </div>
      </div>

      {/* Exporting indicator */}
      {isExporting && (
        <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-xl text-blue-700 dark:text-blue-300 text-sm font-medium">
          <Loader2 size={16} className="animate-spin" /> Preparing download...
        </div>
      )}

      {/* Large report warning */}
      {isLarge && (
        <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl text-amber-700 dark:text-amber-300 text-sm font-medium">
          <Loader2 size={16} className="animate-spin" /> Processing large report ({totalRows.toLocaleString()} rows)... Results are paginated.
        </div>
      )}

      {/* Chart */}
      {showChart && chartData.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {(["bar", "line", "pie"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setChartType(type)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-colors ${
                    chartType === type
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
            <button onClick={() => setShowChart(false)} className="text-xs font-medium text-slate-500 hover:text-slate-700">
              Hide Chart
            </button>
          </div>
          <div className="p-6 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "bar" ? (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "none", borderRadius: "8px", fontSize: "12px", color: "#fff" }} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              ) : chartType === "line" ? (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "none", borderRadius: "8px", fontSize: "12px", color: "#fff" }} />
                  <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4, fill: "#3b82f6" }} />
                </LineChart>
              ) : (
                <PieChart>
                  <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={(entry) => entry.name}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "none", borderRadius: "8px", fontSize: "12px", color: "#fff" }} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {!showChart && (
        <button onClick={() => setShowChart(true)} className="self-start text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
          Show Chart
        </button>
      )}

      {/* Data Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              <tr>
                {data.columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => toggleSort(col.key)}
                    className="px-6 py-3 font-medium text-slate-500 cursor-pointer hover:text-slate-700 dark:hover:text-slate-300 select-none"
                  >
                    <span className="flex items-center gap-1">
                      {col.label}
                      <ArrowUpDown size={12} className={sortKey === col.key ? "text-blue-500" : "text-slate-300"} />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {pagedRows.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  {data.columns.map((col) => (
                    <td key={col.key} className={`px-6 py-4 ${col.type === "currency" ? "text-right font-medium" : ""} ${col.key === data.columns[0]?.key ? "font-bold text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400"}`}>
                      {col.type === "currency"
                        ? `$${Number(row[col.key]).toLocaleString()}`
                        : col.type === "percentage"
                        ? `${row[col.key]}%`
                        : String(row[col.key])
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Showing {page * PAGE_SIZE + 1} - {Math.min((page + 1) * PAGE_SIZE, sortedRows.length)} of {sortedRows.length} rows
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 text-slate-500"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 text-slate-500"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
