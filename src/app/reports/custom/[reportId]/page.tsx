"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ArrowLeft, Download, Printer, Search, Send, Table2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  buildCustomRows,
  customReportFields,
  getSavedCustomReport,
  type CustomReportField,
  type ReportRow,
  type SavedCustomReport,
} from "@/data/reportsAnalytics";

function wait(ms = 150) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getSavedReportData(reportId: string) {
  await wait();
  const report = getSavedCustomReport(reportId);
  const fields = report.fields
    .map((fieldId) => customReportFields.find((field) => field.id === fieldId))
    .filter(Boolean) as CustomReportField[];
  return {
    report,
    fields,
    rows: buildCustomRows(report.fields, report.rowCount),
  };
}

function formatCell(value: string | number | undefined, type: CustomReportField["type"]) {
  if (value === undefined) return "";
  if (type === "currency") {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
      Number(value),
    );
  }
  if (type === "percentage") return `${value}%`;
  return String(value);
}

function ReportSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-28 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
      <div className="h-[620px] animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
    </div>
  );
}

export default function SavedCustomReportPage() {
  const params = useParams<{ reportId: string }>();
  const reportId = params.reportId;
  const parentRef = useRef<HTMLDivElement | null>(null);
  const [query, setQuery] = useState("");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["reports", "custom", reportId],
    queryFn: () => getSavedReportData(reportId),
  });

  const filteredRows = useMemo(() => {
    const rows = data?.rows ?? [];
    const normalized = query.trim().toLowerCase();
    if (!normalized) return rows;
    return rows.filter((row) =>
      Object.values(row).some((value) => String(value).toLowerCase().includes(normalized)),
    );
  }, [data?.rows, query]);

  const rowVirtualizer = useVirtualizer({
    count: filteredRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    overscan: 14,
  });

  if (isLoading) return <ReportSkeleton />;

  if (isError || !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
        <h2 className="text-lg font-bold">Something went wrong</h2>
        <p className="mt-1 text-sm">Saved custom report could not be loaded.</p>
        <Button className="mt-4" onClick={() => refetch()}>
          Try Again
        </Button>
      </div>
    );
  }

  return <SavedCustomReportView report={data.report} fields={data.fields} rows={filteredRows} rowVirtualizer={rowVirtualizer} parentRef={parentRef} query={query} setQuery={setQuery} />;
}

function SavedCustomReportView({
  report,
  fields,
  rows,
  rowVirtualizer,
  parentRef,
  query,
  setQuery,
}: {
  report: SavedCustomReport;
  fields: CustomReportField[];
  rows: ReportRow[];
  rowVirtualizer: ReturnType<typeof useVirtualizer<HTMLDivElement, Element>>;
  parentRef: React.MutableRefObject<HTMLDivElement | null>;
  query: string;
  setQuery: (query: string) => void;
}) {
  const gridTemplateColumns = `repeat(${fields.length}, minmax(180px, 1fr))`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div className="flex items-start gap-3">
          <Link href="/reports/custom" className="mt-1 rounded-lg p-2 transition hover:bg-slate-100 dark:hover:bg-slate-800">
            <ArrowLeft size={18} className="text-slate-500" />
          </Link>
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400">Saved Custom Report</p>
            <h1 className="mt-1 text-3xl font-black text-slate-950 dark:text-white">{report.name}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-400">{report.description}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer size={16} />
            Print
          </Button>
          <Link href={`/api/reports/custom/${report.id}/export?format=csv`}>
            <Button variant="outline">
              <Download size={16} />
              CSV
            </Button>
          </Link>
          <Link href={`/api/reports/custom/${report.id}/export?format=xlsx`}>
            <Button>
              <Download size={16} />
              Excel
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Rows" value={report.rowCount.toLocaleString()} />
        <Metric label="Entity" value={report.entity} />
        <Metric label="Schedule" value={report.schedule} />
        <Metric label="Recipients" value={String(report.recipients.length)} />
      </div>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 dark:border-slate-800 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-black text-slate-950 dark:text-white">
              <Table2 size={19} className="text-blue-600" />
              Report Results
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Virtualized table with search across all loaded rows.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative min-w-[280px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search results..." className="pl-9" />
            </div>
            <Button variant="outline">
              <Send size={16} />
              Schedule
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            <div
              className="grid border-b border-slate-200 bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-800/60"
              style={{ gridTemplateColumns }}
            >
              {fields.map((field) => (
                <div key={field.id} className="px-4 py-3">
                  {field.label}
                </div>
              ))}
            </div>
            <div ref={parentRef} className="h-[560px] overflow-auto">
              <div
                className="relative"
                style={{
                  height: rowVirtualizer.getTotalSize(),
                }}
              >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const row = rows[virtualRow.index];
                  return (
                    <div
                      key={virtualRow.key}
                      className="absolute left-0 grid w-full border-b border-slate-100 text-sm text-slate-700 dark:border-slate-800 dark:text-slate-300"
                      style={{
                        gridTemplateColumns,
                        height: virtualRow.size,
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                    >
                      {fields.map((field) => (
                        <div key={field.id} className="flex items-center px-4">
                          {formatCell(row?.[field.id], field.type)}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-black capitalize text-slate-950 dark:text-white">{value}</p>
    </div>
  );
}
