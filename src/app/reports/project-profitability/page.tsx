"use client";

import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell
} from 'recharts';
import { 
  Building2, Users, DollarSign, Download, ArrowRight, TrendingUp, TrendingDown,
  ChevronDown, ChevronRight, FileText, UploadCloud
} from 'lucide-react';

const MOCK_DATA = [
  {
    id: "p1",
    project: "Acme Rebrand",
    client: "Acme Corp",
    billableHours: 120,
    nonBillableHours: 15,
    laborCost: 6500,
    revenue: 18000,
    margin: 63.8,
    employees: [
      { name: "Alice Johnson", hours: 80, cost: 4000, role: "Senior Designer" },
      { name: "Charlie Davis", hours: 40, cost: 2500, role: "Developer" },
      { name: "Eve Smith", hours: 15, cost: 0, role: "Intern" } // Non-billable
    ]
  },
  {
    id: "p2",
    project: "Mobile App V2",
    client: "Global Tech",
    billableHours: 250,
    nonBillableHours: 30,
    laborCost: 15000,
    revenue: 30000,
    margin: 50.0,
    employees: [
      { name: "Bob Smith", hours: 150, cost: 9000, role: "Lead Engineer" },
      { name: "Charlie Davis", hours: 100, cost: 6000, role: "Developer" }
    ]
  },
  {
    id: "p3",
    project: "Marketing Campaign Q3",
    client: "Stark Industries",
    billableHours: 80,
    nonBillableHours: 5,
    laborCost: 5000,
    revenue: 8000,
    margin: 37.5,
    employees: [
      { name: "Alice Johnson", hours: 80, cost: 4000, role: "Senior Designer" },
      { name: "Diana Prince", hours: 5, cost: 1000, role: "Marketing Director" }
    ]
  }
];

const WATERFALL_DATA = [
  { name: 'Revenue', value: 56000, isTotal: true },
  { name: 'Labor Cost', value: -26500, isTotal: false },
  { name: 'Overhead', value: -4000, isTotal: false },
  { name: 'Margin', value: 25500, isTotal: true },
];

export default function ProjectProfitabilityPage() {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [billingPreview, setBillingPreview] = useState<string | null>(null);

  const toggleRow = (id: string) => {
    setExpandedRow(prev => prev === id ? null : id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-indigo-500" />
            Project Profitability
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Track labor cost allocation, revenue margins, and generate invoices.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", val: "$56,000", diff: "+12.5%", pos: true },
          { label: "Labor Costs", val: "$26,500", diff: "+4.2%", pos: false },
          { label: "Gross Margin", val: "$29,500", diff: "+18.3%", pos: true },
          { label: "Avg Margin %", val: "52.6%", diff: "+2.1%", pos: true },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">{kpi.label}</div>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-black text-slate-900 dark:text-white">{kpi.val}</div>
              <div className={`flex items-center gap-1 text-xs font-bold ${kpi.pos ? 'text-emerald-500' : 'text-red-500'}`}>
                {kpi.pos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {kpi.diff}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Waterfall Chart */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <h3 className="text-base font-bold mb-6 text-slate-800 dark:text-slate-100">Revenue Flow to Margin</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={WATERFALL_DATA} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(val) => `$${val/1000}k`} />
              <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }} formatter={(value: any) => `$${Math.abs(Number(value) || 0).toLocaleString()}`} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {WATERFALL_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.isTotal ? '#6366f1' : '#f43f5e'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Breakdown Table */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap pt-2">
            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-medium">
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
              {MOCK_DATA.map(row => (
                <React.Fragment key={row.id}>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition cursor-pointer" onClick={() => toggleRow(row.id)}>
                    <td className="px-4 py-4 w-10 text-center">
                      <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                        {expandedRow === row.id ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-bold text-slate-900 dark:text-white">{row.project}</div>
                      <div className="text-xs text-slate-500">{row.client}</div>
                    </td>
                    <td className="px-4 py-4 font-medium">{row.billableHours}h</td>
                    <td className="px-4 py-4 text-slate-500">{row.nonBillableHours}h</td>
                    <td className="px-4 py-4 font-semibold text-rose-600 dark:text-rose-400">
                      ${row.laborCost.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 font-bold text-emerald-600 dark:text-emerald-400">
                      ${row.revenue.toLocaleString()}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-md text-xs font-bold ${row.margin > 50 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'}`}>
                        {row.margin}%
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setBillingPreview(row.id); }}
                        className="px-3 py-1.5 text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-500/20"
                      >
                        Preview Draft Invoice
                      </button>
                    </td>
                  </tr>
                  
                  {/* Expanded Drill-down */}
                  {expandedRow === row.id && (
                    <tr className="bg-slate-50/50 dark:bg-slate-900/50">
                      <td colSpan={8} className="px-12 py-4">
                        <div className="border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 p-4 shadow-inner">
                          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Employee Cost Allocation</h4>
                          <table className="w-full text-left text-sm">
                            <thead className="text-slate-500 border-b border-slate-100 dark:border-slate-700">
                              <tr>
                                <th className="pb-2">Employee</th>
                                <th className="pb-2">Role</th>
                                <th className="pb-2">Hours Logged</th>
                                <th className="pb-2">Allocated Cost</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                              {row.employees.map((emp, i) => (
                                <tr key={i}>
                                  <td className="py-2 flex items-center gap-2 font-medium">
                                    <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold">
                                      {emp.name.charAt(0)}
                                    </div>
                                    {emp.name}
                                  </td>
                                  <td className="py-2 text-slate-500">{emp.role}</td>
                                  <td className="py-2">{emp.hours}h</td>
                                  <td className="py-2 font-medium">${emp.cost.toLocaleString()}</td>
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

      {/* Invoice Preview Modal */}
      {billingPreview && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 rounded-t-2xl">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Draft Invoice Preview</h2>
                <p className="text-sm text-slate-500">Review billable hours before pushing to accounting.</p>
              </div>
              <button onClick={() => setBillingPreview(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <div className="p-8">
              {(() => {
                const project = MOCK_DATA.find(p => p.id === billingPreview);
                if (!project) return null;
                const rate = project.revenue / project.billableHours;
                
                return (
                  <div className="space-y-8">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white text-xl">CircleWorks Inc.</div>
                        <div className="text-slate-500 text-sm mt-1">123 Tech Ave, Suite 400<br/>San Francisco, CA 94105</div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black text-slate-300 dark:text-slate-700">INVOICE</div>
                        <div className="text-sm font-medium mt-2">Date: {new Date().toLocaleDateString()}</div>
                        <div className="text-sm font-medium mt-1">Due: Net 30</div>
                      </div>
                    </div>

                    <div className="border border-slate-200 dark:border-slate-700 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/30">
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Bill To:</div>
                      <div className="font-bold text-lg text-slate-900 dark:text-white">{project.client}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Project: {project.project}</div>
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
                          <td className="py-4 font-medium text-slate-800 dark:text-slate-200">Professional Services - {project.project}</td>
                          <td className="py-4 text-right">{project.billableHours}</td>
                          <td className="py-4 text-right">${rate.toFixed(2)}/hr</td>
                          <td className="py-4 text-right font-bold">${project.revenue.toLocaleString()}</td>
                        </tr>
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan={3} className="pt-4 text-right font-bold text-slate-900 dark:text-white">Total Due:</td>
                          <td className="pt-4 text-right font-black text-xl text-indigo-600 dark:text-indigo-400">${project.revenue.toLocaleString()}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                );
              })()}
            </div>
            
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl">
              <button 
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-white dark:hover:bg-slate-700 transition"
              >
                Download PDF
              </button>
              <button 
                onClick={() => setBillingPreview(null)}
                className="px-4 py-2 bg-[#2ca01c] hover:bg-[#268c18] text-white rounded-lg text-sm font-medium transition flex items-center gap-2 shadow-sm"
              >
                <UploadCloud size={16} /> Push to QuickBooks
              </button>
              <button 
                onClick={() => setBillingPreview(null)}
                className="px-4 py-2 bg-[#13b5ea] hover:bg-[#10a0ce] text-white rounded-lg text-sm font-medium transition flex items-center gap-2 shadow-sm"
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
