"use client";

import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell
} from 'recharts';
import { 
  Building2, Users, DollarSign, Download, ArrowRight, TrendingUp, TrendingDown,
  ChevronDown, ChevronRight, FileText, UploadCloud, Briefcase
} from 'lucide-react';
import { formatDate } from "@/utils/formatDate";

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
  }
];

const WATERFALL_DATA = [
  { name: 'Revenue', value: 56000, isTotal: true },
  { name: 'Labor Cost', value: -26500, isTotal: false },
  { name: 'Overhead', value: -4000, isTotal: false },
  { name: 'Margin', value: 25500, isTotal: true },
];

export default function AgencyProfitabilityPage() {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [billingPreview, setBillingPreview] = useState<string | null>(null);
  const [projects, setProjects] = useState<any[]>(MOCK_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch("/api/agency/projects");
        const data = await res.json();
        if (data.success && data.projects?.length > 0) {
          const baseData = data.projects.map((p: any) => ({
            id: p.id,
            project: p.name,
            client: p.client?.name || 'Unknown Client',
            billableHours: Math.floor(Math.random() * 100 + 50),
            nonBillableHours: Math.floor(Math.random() * 20),
            laborCost: Math.floor(Math.random() * 5000 + 2000),
            revenue: Math.floor(Math.random() * 15000 + 5000),
            margin: 0,
            employees: [
              { name: "Alice Johnson", hours: 40, cost: 2000, role: "Senior Designer" },
              { name: "Bob Smith", hours: 20, cost: 1500, role: "Lead Engineer" }
            ]
          })).map((p: any) => ({
             ...p,
             margin: Number(((p.revenue - p.laborCost) / p.revenue * 100).toFixed(1))
          }));
          setProjects(baseData);
        }
      } catch (error) {
        console.error("Failed to load projects:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  const toggleRow = (id: string) => {
    setExpandedRow(prev => prev === id ? null : id);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 underline decoration-indigo-500 underline-offset-8">Agency Profitability</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Detailed labor cost breakdown and realized margins across your staffing portfolios.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-900 transition-all">
            <Download className="w-4 h-4 text-indigo-600" /> Export CSV
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total Asset Revenue", val: "$56,000", diff: "+12.5%", pos: true, icon: DollarSign, color: "blue" },
          { label: "Labor Resources", val: "$26,500", diff: "+4.2%", pos: false, icon: Users, color: "rose" },
          { label: "Net Portfolio Margin", val: "$29,500", diff: "+18.3%", pos: true, icon: TrendingUp, color: "emerald" },
          { label: "Avg Placement ROI", val: "52.6%", diff: "+2.1%", pos: true, icon: Briefcase, color: "violet" },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-${kpi.color}-500/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110`} />
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg bg-${kpi.color}-50 dark:bg-${kpi.color}-950/20`}>
                <kpi.icon className={`w-4 h-4 text-${kpi.color}-600`} />
              </div>
              <div className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">{kpi.label}</div>
            </div>
            <div className="flex items-end justify-between">
              <div className="text-2xl font-black text-slate-900 dark:text-white leading-none">{kpi.val}</div>
              <div className={`flex items-center gap-1 text-[10px] font-black px-1.5 py-0.5 rounded-full ${kpi.pos ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                {kpi.pos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {kpi.diff}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Waterfall Chart */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-black uppercase tracking-wider mb-8 text-slate-500">Margin Breakdown</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={WATERFALL_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.4} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }} />
                <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
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
        <div className="lg:col-span-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-black tracking-widest text-slate-400">
                <tr>
                  <th className="px-6 py-4"></th>
                  <th className="px-6 py-4">Resource Portfolio</th>
                  <th className="px-6 py-4">Billable</th>
                  <th className="px-6 py-4">Costs</th>
                  <th className="px-6 py-4">Revenue</th>
                  <th className="px-6 py-4">Net Yield</th>
                  <th className="px-6 py-4 text-right">Drafting</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {projects.map(row => (
                  <React.Fragment key={row.id}>
                    <tr className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all cursor-pointer" onClick={() => toggleRow(row.id)}>
                      <td className="px-6 py-5 w-10 text-center">
                        <div className={`p-1 rounded-md transition-colors ${expandedRow === row.id ? 'bg-indigo-50 text-indigo-600' : 'text-slate-300 group-hover:text-slate-500'}`}>
                          {expandedRow === row.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="font-bold text-slate-900 dark:text-white">{row.project}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">{row.client}</div>
                      </td>
                      <td className="px-6 py-5 text-xs font-bold text-slate-500">{row.billableHours}h <span className="text-[10px] opacity-40">/ {row.nonBillableHours}h</span></td>
                      <td className="px-6 py-5 font-black text-rose-500">${row.laborCost.toLocaleString()}</td>
                      <td className="px-6 py-5 font-black text-indigo-600">${row.revenue.toLocaleString()}</td>
                      <td className="px-6 py-5 text-right">
                         <div className={`inline-flex px-2 py-1 rounded-lg text-[10px] font-black ${row.margin > 50 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                           {row.margin}%
                         </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setBillingPreview(row.id); }}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                    
                    {expandedRow === row.id && (
                      <tr className="bg-slate-50/30 dark:bg-slate-950">
                        <td colSpan={8} className="px-10 py-0 overflow-hidden">
                          <div className="border-x border-b border-slate-100 dark:border-slate-800 rounded-b-xl bg-white/50 dark:bg-slate-900 p-6 mb-4 shadow-inner">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Resource Allocation Breakdown</h4>
                            <table className="w-full text-left text-xs">
                              <thead className="text-slate-400 border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                  <th className="pb-2 font-black uppercase">Associate</th>
                                  <th className="pb-2 font-black uppercase">Deployment Role</th>
                                  <th className="pb-2 font-black uppercase">Utilization</th>
                                  <th className="pb-2 font-black uppercase text-right">Burdened Cost</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                {row.employees.map((emp: { name: string, role: string, hours: number, cost: number }, i: number) => (
                                  <tr key={i} className="group/row hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                    <td className="py-3 flex items-center gap-3 font-bold text-slate-700 dark:text-slate-300">
                                      <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center text-[10px] font-black border border-slate-200 dark:border-slate-700">
                                        {emp.name.charAt(0)}
                                      </div>
                                      {emp.name}
                                    </td>
                                    <td className="py-3 text-slate-500 font-medium">{emp.role}</td>
                                    <td className="py-3 font-bold text-slate-400">{emp.hours}h</td>
                                    <td className="py-3 text-right font-black text-slate-900 dark:text-white">${emp.cost.toLocaleString()}</td>
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
      </div>

      {/* Invoice Preview Modal */}
      {billingPreview && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[32px] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Draft Revenue Realization</h2>
                <p className="text-sm text-slate-500 font-medium mt-1">Reviewing portfolio performance vs billing targets.</p>
              </div>
              <button onClick={() => setBillingPreview(null)} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-10">
              {(() => {
                const project = projects.find(p => p.id === billingPreview);
                if (!project) return null;
                const rate = project.revenue / project.billableHours;
                
                return (
                  <div className="space-y-10">
                    <div className="flex justify-between items-start">
                      <div className="space-y-4">
                        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                           <Building2 className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <div className="font-black text-slate-900 dark:text-white text-2xl tracking-tighter uppercase">CircleWorks Agency</div>
                          <div className="text-slate-400 text-xs font-bold tracking-widest mt-1 uppercase">HQ: San Francisco, CA</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-5xl font-black text-slate-100 dark:text-slate-800 uppercase tracking-tighter leading-none">Yield</div>
                        <div className="text-[10px] font-black text-slate-500 tracking-[0.2em] mt-4 uppercase">Project Revenue Projection</div>
                      </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border-2 border-indigo-100 dark:border-indigo-900 flex justify-between items-center group">
                      <div>
                        <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Portfolio Account:</div>
                        <div className="font-black text-xl text-slate-900 dark:text-white">{project.client}</div>
                      </div>
                      <div className="text-right">
                         <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Placement:</div>
                         <div className="font-bold text-slate-700 dark:text-slate-300">{project.project}</div>
                      </div>
                    </div>

                    <table className="w-full text-left text-sm">
                      <thead className="border-b-4 border-slate-900 dark:border-slate-100">
                        <tr>
                          <th className="pb-4 font-black uppercase text-slate-900 dark:text-white">Service Matrix</th>
                          <th className="pb-4 text-right font-black uppercase text-slate-900 dark:text-white">Cap</th>
                          <th className="pb-4 text-right font-black uppercase text-slate-900 dark:text-white">Net</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y-2 divide-slate-100 dark:divide-slate-800">
                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                          <td className="py-6">
                             <div className="font-black text-slate-900 dark:text-white">Professional Deployment Services</div>
                             <div className="text-xs text-slate-400 font-medium">Standardized Project Rate: ${rate.toFixed(2)}/hr</div>
                          </td>
                          <td className="py-6 text-right font-black text-slate-500">{project.billableHours}h</td>
                          <td className="py-6 text-right font-black text-indigo-600 text-lg">${project.revenue.toLocaleString()}</td>
                        </tr>
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan={2} className="pt-8 text-right font-black text-slate-400 uppercase tracking-widest">Aggregate Value</td>
                          <td className="pt-8 text-right font-black text-4xl text-slate-900 dark:text-white tracking-tighter leading-none">${project.revenue.toLocaleString()}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                );
              })()}
            </div>
            
            <div className="p-8 bg-slate-50 dark:bg-slate-900 flex flex-wrap justify-end gap-3 rounded-b-[32px] border-t">
              <button 
                className="px-6 py-3 border-2 border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white dark:hover:bg-slate-800 transition-all active:scale-95"
              >
                Download PDF
              </button>
              <button 
                onClick={() => setBillingPreview(null)}
                className="px-6 py-3 bg-[#2ca01c] hover:bg-[#268c18] text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                <UploadCloud size={14} /> QuickBooks
              </button>
              <button 
                onClick={() => setBillingPreview(null)}
                className="px-6 py-3 bg-[#13b5ea] hover:bg-[#10a0ce] text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-cyan-500/20"
              >
                <UploadCloud size={14} /> Xero Realize
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

const XCircle = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
);
