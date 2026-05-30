"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Download, FileWarning, Receipt, Search, WalletCards } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ResponsiveContainer from "@/components/charts/MeasuredResponsiveContainer";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const categorySpend = [
  { category: "Travel", amount: 18420, color: "#2563eb" },
  { category: "Meals", amount: 9120, color: "#16a34a" },
  { category: "Software", amount: 14280, color: "#7c3aed" },
  { category: "Mileage", amount: 4680, color: "#f97316" },
  { category: "Office", amount: 3720, color: "#0f766e" },
];

const employeeSpend = [
  { employee: "Robert Chen", department: "Engineering", amount: 4320, status: "Approved", violation: "None" },
  { employee: "Maria Santos", department: "Engineering", amount: 3890, status: "Pending", violation: "Missing receipt" },
  { employee: "Emily Park", department: "Product", amount: 3120, status: "Approved", violation: "None" },
  { employee: "James Liu", department: "Finance", amount: 2840, status: "Rejected", violation: "Duplicate submission" },
  { employee: "Sarah Williams", department: "People", amount: 2380, status: "Approved", violation: "None" },
  { employee: "Aisha Johnson", department: "Marketing", amount: 2210, status: "Pending", violation: "Over meal limit" },
  { employee: "David Martinez", department: "Sales", amount: 5190, status: "Approved", violation: "None" },
];

const monthlyTrend = [
  { month: "Jan", submitted: 22100, reimbursed: 19800 },
  { month: "Feb", submitted: 24800, reimbursed: 22500 },
  { month: "Mar", submitted: 27400, reimbursed: 25100 },
  { month: "Apr", submitted: 26200, reimbursed: 23900 },
  { month: "May", submitted: 30220, reimbursed: 27840 },
];

function wait(ms = 150) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getExpenseSummaryData() {
  await wait();
  return {
    categorySpend,
    employeeSpend,
    monthlyTrend,
  };
}

function money(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function ExpenseSummarySkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-24 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-32 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
        ))}
      </div>
      <div className="h-96 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
    </div>
  );
}

export default function ExpenseSummaryReportPage() {
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState("All");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["reports", "expense-summary"],
    queryFn: getExpenseSummaryData,
  });

  const filteredEmployees = useMemo(() => {
    const rows = data?.employeeSpend ?? [];
    const normalizedQuery = query.trim().toLowerCase();
    return rows
      .filter((row) => department === "All" || row.department === department)
      .filter((row) => !normalizedQuery || row.employee.toLowerCase().includes(normalizedQuery));
  }, [data?.employeeSpend, department, query]);

  const departments = useMemo(
    () => ["All", ...Array.from(new Set((data?.employeeSpend ?? []).map((row) => row.department)))],
    [data?.employeeSpend],
  );

  if (isLoading) return <ExpenseSummarySkeleton />;

  if (isError || !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
        <h2 className="text-lg font-bold">Something went wrong</h2>
        <p className="mt-1 text-sm">Expense Summary could not be loaded.</p>
        <Button className="mt-4" onClick={() => refetch()}>
          Try Again
        </Button>
      </div>
    );
  }

  const totalSubmitted = data.categorySpend.reduce((total, item) => total + item.amount, 0);
  const totalReimbursed = data.monthlyTrend[data.monthlyTrend.length - 1].reimbursed;
  const pendingAmount = data.employeeSpend
    .filter((row) => row.status === "Pending")
    .reduce((total, row) => total + row.amount, 0);
  const violations = data.employeeSpend.filter((row) => row.violation !== "None");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div className="flex items-start gap-3">
          <Link href="/reports" className="mt-1 rounded-lg p-2 transition hover:bg-slate-100 dark:hover:bg-slate-800">
            <ArrowLeft size={18} className="text-slate-500" />
          </Link>
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400">Expenses Reports</p>
            <h1 className="mt-1 flex items-center gap-2 text-3xl font-black text-slate-950 dark:text-white">
              <Receipt size={28} className="text-blue-600" />
              Expense Summary Report
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Expense totals by category, employee, department, reimbursement status, and policy exception.
            </p>
          </div>
        </div>
        <Button onClick={() => window.print()}>
          <Download size={16} />
          Export PDF
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Submitted" value={money(totalSubmitted)} icon={Receipt} />
        <Metric label="Reimbursed" value={money(totalReimbursed)} icon={WalletCards} />
        <Metric label="Pending Approval" value={money(pendingAmount)} icon={FileWarning} />
        <Metric label="Policy Violations" value={String(violations.length)} icon={FileWarning} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200 p-5 dark:border-slate-800">
            <h2 className="text-lg font-black text-slate-950 dark:text-white">Monthly Submitted vs Reimbursed</h2>
          </div>
          <div className="h-[320px] p-5">
            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
              <BarChart data={data.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} tickFormatter={(value) => `$${Number(value) / 1000}k`} />
                <Tooltip formatter={(value) => money(Number(value))} />
                <Bar dataKey="submitted" name="Submitted" fill="#2563eb" radius={[8, 8, 0, 0]} />
                <Bar dataKey="reimbursed" name="Reimbursed" fill="#16a34a" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200 p-5 dark:border-slate-800">
            <h2 className="text-lg font-black text-slate-950 dark:text-white">Spend by Category</h2>
          </div>
          <div className="h-[320px] p-5">
            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
              <PieChart>
                <Pie data={data.categorySpend} dataKey="amount" nameKey="category" innerRadius={72} outerRadius={112} paddingAngle={3}>
                  {data.categorySpend.map((item) => (
                    <Cell key={item.category} fill={item.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => money(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 dark:border-slate-800 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-950 dark:text-white">By Employee</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Search, filter, and review policy exceptions.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <select
              value={department}
              onChange={(event) => setDepartment(event.target.value)}
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              {departments.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <div className="relative min-w-[260px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search employees..." className="pl-9" />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-800/60">
              <tr>
                <th className="px-5 py-3">Employee</th>
                <th className="px-5 py-3">Department</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Policy Violation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredEmployees.map((row) => (
                <tr key={`${row.employee}-${row.amount}`}>
                  <td className="px-5 py-4 font-bold text-slate-950 dark:text-white">{row.employee}</td>
                  <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{row.department}</td>
                  <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{money(row.amount)}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                      {row.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{row.violation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
        <Icon size={18} className="text-blue-600" />
      </div>
      <p className="mt-3 text-2xl font-black text-slate-950 dark:text-white">{value}</p>
    </div>
  );
}
