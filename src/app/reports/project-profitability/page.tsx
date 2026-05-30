"use client";

import React, { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import ResponsiveContainer from "@/components/charts/MeasuredResponsiveContainer";
import {
  Building2,
  ChevronDown,
  ChevronRight,
  Download,
  TrendingDown,
  TrendingUp,
  UploadCloud,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/utils/formatDate";
import {
  buildProjectProfitabilityRows,
  buildProjectWaterfall,
  exportProjectProfitabilityCsv,
  type ProjectProfitabilityRow,
} from "@/data/mockProjectAllocation";

function money(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function downloadTextFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function ProjectProfitabilityPage() {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [billingPreview, setBillingPreview] = useState<string | null>(null);
  const projects = useMemo(() => buildProjectProfitabilityRows(), []);
  const waterfallData = useMemo(() => buildProjectWaterfall(projects), [projects]);
  const selectedProject = projects.find((project) => project.id === billingPreview);

  const totalRevenue = projects.reduce((sum, project) => sum + project.revenue, 0);
  const totalLaborCost = projects.reduce((sum, project) => sum + project.laborCost, 0);
  const grossMargin = totalRevenue - totalLaborCost;
  const averageMargin = totalRevenue > 0 ? (grossMargin / totalRevenue) * 100 : 0;

  const toggleRow = (id: string) => {
    setExpandedRow((current) => (current === id ? null : id));
  };

  const handleCsvExport = () => {
    downloadTextFile("project-profitability.csv", exportProjectProfitabilityCsv(projects), "text/csv;charset=utf-8");
    toast.success("Project profitability CSV downloaded");
  };

  const handleInvoicePdf = (project: ProjectProfitabilityRow) => {
    toast.success("PDF invoice export queued", {
      description: `${project.client} draft invoice for ${money(project.revenue)} is ready to review.`,
    });
  };

  const handleAccountingPush = (provider: "QuickBooks" | "Xero", project: ProjectProfitabilityRow) => {
    setBillingPreview(null);
    toast.success(`Draft invoice pushed to ${provider}`, {
      description: `${project.billableHours} billable hours at ${money(project.billingRate)}/hr.`,
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
            <Building2 className="h-6 w-6 text-indigo-500" />
            Project Profitability
          </h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Allocate payroll cost from logged project hours and preview client billing.
          </p>
        </div>
        <button
          onClick={handleCsvExport}
          className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
        >
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {[
          { label: "Total Revenue", val: money(totalRevenue), diff: "+12.5%", pos: true },
          { label: "Labor Costs", val: money(totalLaborCost), diff: "+4.2%", pos: false },
          { label: "Gross Margin", val: money(grossMargin), diff: "+18.3%", pos: true },
          { label: "Avg Margin %", val: `${averageMargin.toFixed(1)}%`, diff: "+2.1%", pos: true },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="mb-1 text-sm font-semibold text-slate-500 dark:text-slate-400">{kpi.label}</div>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-black text-slate-900 dark:text-white">{kpi.val}</div>
              <div className={`flex items-center gap-1 text-xs font-bold ${kpi.pos ? "text-emerald-500" : "text-red-500"}`}>
                {kpi.pos ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {kpi.diff}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h3 className="mb-6 text-base font-bold text-slate-800 dark:text-slate-100">Revenue to Labor to Margin</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
            <BarChart data={waterfallData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} tickFormatter={(value) => `$${Number(value) / 1000}k`} />
              <RechartsTooltip
                cursor={{ fill: "transparent" }}
                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)" }}
                formatter={(value: unknown) => money(Math.abs(Number(value) || 0))}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {waterfallData.map((entry) => (
                  <Cell key={entry.name} fill={entry.isTotal ? "#6366f1" : "#f43f5e"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap pt-2 text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-800">
              <tr>
                <th className="px-4 py-3"></th>
                <th className="px-4 py-3">Project / Client</th>
                <th className="px-4 py-3">Billable Hrs</th>
                <th className="px-4 py-3">Non-Billable</th>
                <th className="px-4 py-3">Labor Cost</th>
                <th className="px-4 py-3">Revenue</th>
                <th className="px-4 py-3">Margin %</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {projects.map((row) => (
                <React.Fragment key={row.id}>
                  <tr className="cursor-pointer transition hover:bg-slate-50 dark:hover:bg-slate-700/30" onClick={() => toggleRow(row.id)}>
                    <td className="w-10 px-4 py-4 text-center">
                      <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                        {expandedRow === row.id ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-bold text-slate-900 dark:text-white">{row.project}</div>
                      <div className="text-xs text-slate-500">{row.client} / {row.code}</div>
                    </td>
                    <td className="px-4 py-4 font-medium">{row.billableHours}h</td>
                    <td className="px-4 py-4 text-slate-500">{row.nonBillableHours}h</td>
                    <td className="px-4 py-4 font-semibold text-rose-600 dark:text-rose-400">{money(row.laborCost)}</td>
                    <td className="px-4 py-4 font-bold text-emerald-600 dark:text-emerald-400">{money(row.revenue)}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-md px-2 py-1 text-xs font-bold ${row.margin > 50 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"}`}>
                        {row.margin}%
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          setBillingPreview(row.id);
                        }}
                        className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/20"
                      >
                        Preview Draft Invoice
                      </button>
                    </td>
                  </tr>

                  {expandedRow === row.id && (
                    <tr className="bg-slate-50/50 dark:bg-slate-900/50">
                      <td colSpan={8} className="px-12 py-4">
                        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-inner dark:border-slate-700 dark:bg-slate-800">
                          <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Employee Cost Allocation</h4>
                          <table className="w-full text-left text-sm">
                            <thead className="border-b border-slate-100 text-slate-500 dark:border-slate-700">
                              <tr>
                                <th className="pb-2">Employee</th>
                                <th className="pb-2">Role</th>
                                <th className="pb-2">Hours</th>
                                <th className="pb-2">Allocated Cost</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                              {row.employees.map((employee) => (
                                <tr key={employee.employeeId}>
                                  <td className="flex items-center gap-2 py-2 font-medium">
                                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700">
                                      {employee.name.charAt(0)}
                                    </div>
                                    {employee.name}
                                  </td>
                                  <td className="py-2 text-slate-500">{employee.role}</td>
                                  <td className="py-2">{employee.hours}h</td>
                                  <td className="py-2 font-medium">{money(employee.cost)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between rounded-t-2xl border-b border-slate-100 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-800/50">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Draft Invoice Preview</h2>
                <p className="text-sm text-slate-500">Billable hours x billing rate = invoice amount.</p>
              </div>
              <button onClick={() => setBillingPreview(null)} className="rounded-full p-2 text-slate-400 transition hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-700">
                <X size={20} />
              </button>
            </div>

            <div className="p-8">
              <div className="space-y-8">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xl font-bold text-slate-900 dark:text-white">CircleWorks Inc.</div>
                    <div className="mt-1 text-sm text-slate-500">123 Tech Ave, Suite 400<br />San Francisco, CA 94105</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-slate-300 dark:text-slate-700">INVOICE</div>
                    <div className="mt-2 text-sm font-medium">Date: {formatDate(new Date())}</div>
                    <div className="mt-1 text-sm font-medium">Due: Net 30</div>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/30">
                  <div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Bill To:</div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white">{selectedProject.client}</div>
                  <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">Project: {selectedProject.project}</div>
                </div>

                <table className="w-full text-left text-sm">
                  <thead className="border-b-2 border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="pb-3 text-slate-900 dark:text-white">Description</th>
                      <th className="pb-3 text-right text-slate-900 dark:text-white">Hours</th>
                      <th className="pb-3 text-right text-slate-900 dark:text-white">Rate</th>
                      <th className="pb-3 text-right text-slate-900 dark:text-white">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr>
                      <td className="py-4 font-medium text-slate-800 dark:text-slate-200">Professional Services - {selectedProject.project}</td>
                      <td className="py-4 text-right">{selectedProject.billableHours}</td>
                      <td className="py-4 text-right">{money(selectedProject.billingRate)}/hr</td>
                      <td className="py-4 text-right font-bold">{money(selectedProject.revenue)}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3} className="pt-4 text-right font-bold text-slate-900 dark:text-white">Total Due:</td>
                      <td className="pt-4 text-right text-xl font-black text-indigo-600 dark:text-indigo-400">{money(selectedProject.revenue)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="flex justify-end gap-3 rounded-b-2xl border-t border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
              <button
                onClick={() => handleInvoicePdf(selectedProject)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium transition hover:bg-white dark:border-slate-600 dark:hover:bg-slate-700"
              >
                Download PDF
              </button>
              <button
                onClick={() => handleAccountingPush("QuickBooks", selectedProject)}
                className="flex items-center gap-2 rounded-lg bg-[#2ca01c] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#268c18]"
              >
                <UploadCloud size={16} /> Push to QuickBooks
              </button>
              <button
                onClick={() => handleAccountingPush("Xero", selectedProject)}
                className="flex items-center gap-2 rounded-lg bg-[#13b5ea] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#10a0ce]"
              >
                <UploadCloud size={16} /> Push to Xero
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
