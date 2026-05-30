"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowUpDown,
  Download,
  FileSpreadsheet,
  Printer,
  Search,
  WalletCards,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ResponsiveContainer from "@/components/charts/MeasuredResponsiveContainer";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getPayrollByDepartment,
  getPayrollSummaryTotals,
  payrollSummaryComparisons,
  payrollSummaryRows,
  type PayrollSummaryRow,
} from "@/data/reportsAnalytics";

type SortKey = keyof Pick<
  PayrollSummaryRow,
  "employee" | "gross" | "federalTax" | "fica" | "stateTax" | "otherDeductions" | "netPay"
>;

function wait(ms = 150) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getPayrollSummaryData() {
  await wait();
  return payrollSummaryRows;
}

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function PayrollSummarySkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-32 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        ))}
      </div>
      <div className="h-96 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
    </div>
  );
}

function SummaryCard({
  label,
  value,
  delta,
}: {
  label: string;
  value: number;
  delta: number;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-black text-slate-950 dark:text-white">{money(value)}</p>
      <p className="mt-2 text-sm font-bold text-green-600 dark:text-green-400">+{delta}% vs prior period</p>
    </div>
  );
}

export default function PayrollSummaryReportPage() {
  const [payPeriod, setPayPeriod] = useState("2026-05-15");
  const [department, setDepartment] = useState("All");
  const [employeeType, setEmployeeType] = useState("All");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("employee");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["reports", "payroll-summary", payPeriod],
    queryFn: getPayrollSummaryData,
  });

  const filteredRows = useMemo(() => {
    const rows = data ?? [];
    return rows
      .filter((row) => department === "All" || row.department === department)
      .filter((row) => employeeType === "All" || row.employeeType === employeeType)
      .filter((row) => row.employee.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => {
        const aValue = a[sortKey];
        const bValue = b[sortKey];
        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortDir === "asc" ? aValue - bValue : bValue - aValue;
        }
        return sortDir === "asc"
          ? String(aValue).localeCompare(String(bValue))
          : String(bValue).localeCompare(String(aValue));
      });
  }, [data, department, employeeType, query, sortDir, sortKey]);

  const totals = useMemo(() => getPayrollSummaryTotals(filteredRows), [filteredRows]);
  const byDepartment = useMemo(() => getPayrollByDepartment(filteredRows), [filteredRows]);
  const departments = useMemo(() => ["All", ...Array.from(new Set((data ?? []).map((row) => row.department)))], [data]);
  const employeeTypes = ["All", "Full-time", "Part-time", "Contractor"];

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir("asc");
  };

  if (isLoading) return <PayrollSummarySkeleton />;

  if (isError || !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
        <h2 className="text-lg font-bold">Something went wrong</h2>
        <p className="mt-1 text-sm">Payroll Summary could not be loaded.</p>
        <Button className="mt-4" onClick={() => refetch()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div className="flex items-start gap-3">
          <Link href="/reports" className="mt-1 rounded-lg p-2 transition hover:bg-slate-100 dark:hover:bg-slate-800">
            <ArrowLeft size={18} className="text-slate-500" />
          </Link>
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400">Payroll Reports</p>
            <h1 className="mt-1 flex items-center gap-2 text-3xl font-black text-slate-950 dark:text-white">
              <WalletCards size={28} className="text-blue-600" />
              Payroll Summary Report
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Payroll totals, tax detail, net pay, department variance, and employee-level register detail.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href="/api/reports/payroll-summary/export?format=xlsx">
            <Button>
              <FileSpreadsheet size={16} />
              Export Excel
            </Button>
          </a>
          <a href="/api/reports/payroll-summary/export?format=csv">
            <Button variant="outline">
              <Download size={16} />
              Export CSV
            </Button>
          </a>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer size={16} />
            Export PDF
          </Button>
        </div>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-3 lg:grid-cols-4">
          <label className="grid gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
            Date range
            <select
              value={payPeriod}
              onChange={(event) => setPayPeriod(event.target.value)}
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              <option value="2026-05-15">Pay period ending May 15, 2026</option>
              <option value="2026-05-30">Pay period ending May 30, 2026</option>
              <option value="custom">Custom range</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
            Department
            <select
              value={department}
              onChange={(event) => setDepartment(event.target.value)}
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              {departments.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
            Employee type
            <select
              value={employeeType}
              onChange={(event) => setEmployeeType(event.target.value)}
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              {employeeTypes.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
            Search
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} className="pl-9" placeholder="Employee name" />
            </div>
          </label>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-4">
        <SummaryCard label="Total Gross" value={totals.totalGross} delta={payrollSummaryComparisons.gross} />
        <SummaryCard label="Total Net" value={totals.totalNet} delta={payrollSummaryComparisons.net} />
        <SummaryCard label="Total Taxes" value={totals.totalTaxes} delta={payrollSummaryComparisons.taxes} />
        <SummaryCard label="Employer Cost" value={totals.employerCost} delta={payrollSummaryComparisons.employerCost} />
      </div>

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 p-5 dark:border-slate-800">
          <h2 className="text-lg font-black text-slate-950 dark:text-white">Gross Payroll by Department</h2>
        </div>
        <div className="h-[320px] p-5">
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
            <BarChart data={byDepartment}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="department" tick={{ fontSize: 12, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} />
              <Tooltip
                formatter={(value) => money(Number(value))}
                contentStyle={{ backgroundColor: "#0f172a", border: "none", borderRadius: 8, color: "#fff" }}
              />
              <Bar dataKey="gross" fill="#2563eb" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 p-5 dark:border-slate-800">
          <h2 className="text-lg font-black text-slate-950 dark:text-white">Employee Table</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{filteredRows.length} employees in current filter.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-800/50">
              <tr>
                <SortableHead label="Employee" field="employee" sortKey={sortKey} onSort={toggleSort} />
                <th className="px-5 py-3">Department</th>
                <SortableHead label="Gross" field="gross" sortKey={sortKey} onSort={toggleSort} />
                <SortableHead label="Federal Tax" field="federalTax" sortKey={sortKey} onSort={toggleSort} />
                <SortableHead label="FICA" field="fica" sortKey={sortKey} onSort={toggleSort} />
                <SortableHead label="State Tax" field="stateTax" sortKey={sortKey} onSort={toggleSort} />
                <SortableHead label="Other Deductions" field="otherDeductions" sortKey={sortKey} onSort={toggleSort} />
                <SortableHead label="Net Pay" field="netPay" sortKey={sortKey} onSort={toggleSort} />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredRows.map((row) => (
                <tr key={row.employee} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-5 py-4">
                    <p className="font-black text-slate-950 dark:text-white">{row.employee}</p>
                    <p className="text-xs text-slate-500">{row.employeeType}</p>
                  </td>
                  <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{row.department}</td>
                  <MoneyCell value={row.gross} />
                  <MoneyCell value={row.federalTax} />
                  <MoneyCell value={row.fica} />
                  <MoneyCell value={row.stateTax} />
                  <MoneyCell value={row.otherDeductions} />
                  <MoneyCell value={row.netPay} strong />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function SortableHead({
  label,
  field,
  sortKey,
  onSort,
}: {
  label: string;
  field: SortKey;
  sortKey: SortKey;
  onSort: (field: SortKey) => void;
}) {
  return (
    <th className="px-5 py-3">
      <button type="button" onClick={() => onSort(field)} className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-white">
        {label}
        <ArrowUpDown size={12} className={sortKey === field ? "text-blue-600" : "text-slate-300"} />
      </button>
    </th>
  );
}

function MoneyCell({ value, strong = false }: { value: number; strong?: boolean }) {
  return (
    <td className={`px-5 py-4 text-right ${strong ? "font-black text-slate-950 dark:text-white" : "text-slate-600 dark:text-slate-300"}`}>
      {money(value)}
    </td>
  );
}
