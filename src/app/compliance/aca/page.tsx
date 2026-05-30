"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calculator, CheckCircle2, Download, FileText, HeartPulse } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  aca1095CEmployees,
  acaEmployerSummary1094C,
  acaFteMonths,
  calculateAverageFte,
  type ACA1095CEmployee,
} from "@/data/complianceModule";

function wait(ms = 150) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getACAData() {
  await wait();
  return {
    employees: aca1095CEmployees,
    months: acaFteMonths,
    summary: acaEmployerSummary1094C,
  };
}

function ACASkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
      <div className="h-96 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
    </div>
  );
}

export default function ACAPage() {
  const [fullTime, setFullTime] = useState(53);
  const [partTimeHours, setPartTimeHours] = useState(160);
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["compliance", "aca"],
    queryFn: getACAData,
  });

  const averageFte = useMemo(() => calculateAverageFte(data?.months ?? acaFteMonths), [data?.months]);
  const calculatorFte = Number((fullTime + partTimeHours / 120).toFixed(1));
  const isALE = averageFte >= 50;

  if (isLoading) return <ACASkeleton />;

  if (isError || !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
        <h2 className="text-lg font-bold">Something went wrong</h2>
        <p className="mt-1 text-sm">ACA data could not be loaded.</p>
        <Button className="mt-4" onClick={() => refetch()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400">Compliance</p>
          <h1 className="mt-1 flex items-center gap-2 text-3xl font-black text-slate-950 dark:text-white">
            <HeartPulse size={26} className="text-blue-600" />
            ACA Reporting
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            ALE determination, FTE calculator, 1095-C lines, and 1094-C employer summary.
          </p>
        </div>
        <a href="/api/compliance/aca/export">
          <Button>
            <Download size={16} />
            Export IRS File
          </Button>
        </a>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section
          className={`rounded-xl border p-6 shadow-sm ${
            isALE
              ? "border-blue-500 bg-blue-600 text-white"
              : "border-green-200 bg-green-50 text-green-800 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-200"
          }`}
        >
          <p className={`text-xs font-black uppercase tracking-wide ${isALE ? "text-blue-100" : "text-green-700"}`}>
            ALE Determination
          </p>
          <p className="mt-2 text-4xl font-black">{averageFte}</p>
          <p className={`mt-2 text-sm ${isALE ? "text-blue-100" : "text-green-700"}`}>
            Average full-time equivalent employees. Threshold: 50 FTE.
          </p>
          <p className="mt-4 inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-black">
            {isALE ? "Applicable Large Employer" : "Below ALE threshold"}
          </p>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <Calculator size={18} className="text-blue-600" />
            <h2 className="font-black text-slate-950 dark:text-white">FTE Calculator</h2>
          </div>
          <div className="mt-4 grid gap-3">
            <label className="grid gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
              Full-time employees
              <Input type="number" value={fullTime} onChange={(event) => setFullTime(Number(event.target.value))} />
            </label>
            <label className="grid gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
              Part-time monthly hours
              <Input
                type="number"
                value={partTimeHours}
                onChange={(event) => setPartTimeHours(Number(event.target.value))}
              />
            </label>
          </div>
          <p className="mt-4 text-2xl font-black text-slate-950 dark:text-white">{calculatorFte} FTE</p>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-blue-600" />
            <h2 className="font-black text-slate-950 dark:text-white">1094-C Employer Summary</h2>
          </div>
          <div className="mt-4 grid gap-3 text-sm">
            <SummaryLine label="Employer" value={data.summary.employer} />
            <SummaryLine label="EIN" value={data.summary.ein} />
            <SummaryLine label="1095-C forms" value={String(data.summary.total1095CForms)} />
            <SummaryLine label="Full-time count" value={String(data.summary.fullTimeEmployeeCount)} />
            <SummaryLine label="Deadline" value={data.summary.filingDeadline} />
          </div>
        </section>
      </div>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 p-5 dark:border-slate-800">
          <h2 className="text-lg font-black text-slate-950 dark:text-white">1095-C Generation</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Lines 14, 15, and 16 are auto-calculated from benefits enrollment and hours data.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-800/50">
              <tr>
                <th className="px-5 py-3">Employee</th>
                <th className="px-5 py-3">Coverage Months</th>
                <th className="px-5 py-3">Line 14</th>
                <th className="px-5 py-3">Line 15</th>
                <th className="px-5 py-3">Line 16</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.employees.map((employee: ACA1095CEmployee) => (
                <tr key={employee.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-5 py-4">
                    <p className="font-black text-slate-950 dark:text-white">{employee.employee}</p>
                    <p className="text-xs text-slate-500">{employee.employeeId}</p>
                  </td>
                  <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{employee.coverageMonths}</td>
                  <td className="px-5 py-4 font-mono text-xs text-slate-600 dark:text-slate-300">{employee.line14}</td>
                  <td className="px-5 py-4 font-mono text-xs text-slate-600 dark:text-slate-300">{employee.line15}</td>
                  <td className="px-5 py-4 font-mono text-xs text-slate-600 dark:text-slate-300">{employee.line16}</td>
                  <td className="px-5 py-4">
                    <span
                      className={
                        employee.status === "Ready"
                          ? "inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-[11px] font-black text-green-700 dark:bg-green-500/15 dark:text-green-300"
                          : "inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-1 text-[11px] font-black text-orange-700 dark:bg-orange-500/15 dark:text-orange-300"
                      }
                    >
                      {employee.status === "Ready" && <CheckCircle2 size={12} />}
                      {employee.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Button size="sm" variant="outline">
                      Preview
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-black text-slate-950 dark:text-white">Monthly FTE History</h2>
        <div className="mt-4 grid gap-2 md:grid-cols-6 xl:grid-cols-12">
          {data.months.map((month) => (
            <div key={month.month} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
              <p className="text-xs font-bold uppercase text-slate-500">{month.month}</p>
              <p className="mt-1 text-lg font-black text-slate-950 dark:text-white">{month.fte}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <span className="font-black text-slate-950 dark:text-white">{value}</span>
    </div>
  );
}
