"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Loader2,
  Printer,
  Share2,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  generateReportData,
  standardReports,
  type ReportViewerData,
} from "@/data/mockReports";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4", "#f97316", "#ec4899"];
const PAGE_SIZE = 20;

function fetchReportData(reportId: string) {
  return new Promise<ReportViewerData>((resolve) => {
    setTimeout(() => resolve(generateReportData(reportId)), 350);
  });
}

function formatCell(value: string | number, type: string) {
  if (type === "currency") return `$${Number(value).toLocaleString()}`;
  if (type === "percentage") return `${value}%`;
  if (type === "number") return Number(value).toLocaleString();
  return String(value);
}

export function ReportViewerContent({
  reportId,
  compact = false,
}: {
  reportId: string;
  compact?: boolean;
}) {
  const report = standardReports.find((item) => item.id === reportId);
  const reportName = report?.name || "Custom Report";

  const [sortKey, setSortKey] = useState<string>("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);
  const [chartType, setChartType] = useState<"bar" | "line" | "pie">("bar");
  const [showChart, setShowChart] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["report-viewer", reportId],
    queryFn: () => fetchReportData(reportId),
  });

  const exportFormats = report?.exportableFormats ?? ["CSV", "PDF", "Excel"];

  const sortedRows = useMemo(() => {
    if (!data || !sortKey) return data?.rows ?? [];

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
  }, [data, sortDir, sortKey]);

  const totalRows = data?.totalRows ?? 0;
  const isLarge = totalRows > 10000;
  const totalPages = Math.max(1, Math.ceil(sortedRows.length / PAGE_SIZE));
  const pagedRows = sortedRows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const chartData = useMemo(() => {
    if (!data) return [];

    const textCol = data.columns.find((column) => column.type === "text");
    const numCol = data.columns.find((column) => column.type === "currency" || column.type === "number");
    if (!textCol || !numCol) return [];

    return data.rows.slice(0, 12).map((row) => ({
      name: String(row[textCol.key]),
      value: Number(row[numCol.key]),
    }));
  }, [data]);

  const toggleSort = (key: string) => {
    const column = data?.columns.find((item) => item.key === key);
    if (column && !column.sortable) return;

    if (sortKey === key) {
      setSortDir((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDir("asc");
  };

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => setIsExporting(false), 1200);
  };

  if (isLoading || !data) {
    return (
      <div className="flex min-h-[360px] items-center justify-center rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading report preview...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {!compact && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link href="/reports" className="rounded-lg p-1.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800">
              <ArrowLeft size={18} className="text-slate-500" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{reportName}</h1>
              <p className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Clock size={12} />
                Generated {new Date(data.generatedAt).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
                <span className="text-slate-300 dark:text-slate-600">·</span>
                {totalRows.toLocaleString()} rows
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
              {exportFormats.map((format, index) => (
                <button
                  key={format}
                  type="button"
                  onClick={handleExport}
                  className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800 ${
                    index < exportFormats.length - 1 ? "border-r border-slate-200 dark:border-slate-700" : ""
                  }`}
                >
                  {index === 0 ? <Download size={12} /> : null}
                  {format}
                </button>
              ))}
            </div>
            <button className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700">
              <Printer size={16} />
            </button>
            <button className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700">
              <Share2 size={16} />
            </button>
          </div>
        </div>
      )}

      {compact && (
        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
            {totalRows.toLocaleString()} rows generated from sample data.
          </p>
          <div className="flex gap-2">
            {exportFormats.map((format) => (
              <button
                key={format}
                type="button"
                onClick={handleExport}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                {format}
              </button>
            ))}
          </div>
        </div>
      )}

      {isExporting && (
        <div className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300">
          <Loader2 size={16} className="animate-spin" /> Preparing download...
        </div>
      )}

      {isLarge && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
          <Loader2 size={16} className="animate-spin" /> Processing large report ({totalRows.toLocaleString()} rows)... Results are paginated.
        </div>
      )}

      {showChart && chartData.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800">
            <div className="flex items-center gap-2">
              {(["bar", "line", "pie"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setChartType(type)}
                  className={`rounded-lg px-3 py-1 text-xs font-bold capitalize transition-colors ${
                    chartType === type
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setShowChart(false)} className="text-xs font-medium text-slate-500 hover:text-slate-700">
              Hide Chart
            </button>
          </div>
          <div className="h-[300px] p-6">
            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
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
                    {chartData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
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
        <button type="button" onClick={() => setShowChart(true)} className="self-start text-xs font-bold text-blue-600 hover:underline dark:text-blue-400">
          Show Chart
        </button>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <Table>
          <TableHeader>
            <TableRow>
              {data.columns.map((column) => (
                <TableHead
                  key={column.key}
                  onClick={() => toggleSort(column.key)}
                  className={column.sortable ? "cursor-pointer select-none hover:text-slate-700 dark:hover:text-slate-300" : "cursor-default"}
                >
                  <span className="flex items-center gap-1">
                    {column.label}
                    {column.sortable ? (
                      <ArrowUpDown size={12} className={sortKey === column.key ? "text-blue-500" : "text-slate-300"} />
                    ) : null}
                  </span>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagedRows.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {data.columns.map((column) => (
                  <TableCell
                    key={column.key}
                    className={`${column.type === "currency" ? "text-right font-medium" : ""} ${
                      column.key === data.columns[0]?.key ? "font-bold text-slate-900 dark:text-white" : ""
                    }`}
                  >
                    {formatCell(row[column.key], column.type)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 px-6 py-3 dark:border-slate-800">
            <span className="text-xs text-slate-500">
              Showing {page * PAGE_SIZE + 1} - {Math.min((page + 1) * PAGE_SIZE, sortedRows.length)} of {sortedRows.length} rows
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 disabled:opacity-30 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {page + 1} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 disabled:opacity-30 dark:border-slate-700 dark:hover:bg-slate-800"
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
