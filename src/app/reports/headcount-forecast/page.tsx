"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, ReferenceLine
} from "recharts";
import {
  Download, ChevronLeft, Calendar, FileText, Settings, Users,
  TrendingUp, TrendingDown, Landmark, Filter, Edit3, Save, Share2, Briefcase
} from "lucide-react";

type DataPoint = {
  id: string;
  month: string;
  date: string;
  type: "actual" | "projected";
  startingHC: number;
  hires: number;
  attrition: number;
  endingHC: number;
  targetHC: number;
  budgetDelta: number;
  status: string;
};

// Tooltip for Recharts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 shadow-xl">
        <p className="font-bold text-slate-900 dark:text-white mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 mb-1 text-sm text-slate-700 dark:text-slate-300">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="capitalize">{entry.name}:</span>
            <span className="font-bold">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function HeadcountForecastPage() {
  const [data, setData] = useState<DataPoint[]>([]);
  const [baseRunRate, setBaseRunRate] = useState(0);
  const [avgSalary, setAvgSalary] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters & State
  const [view, setView] = useState("total"); // total, department, location
  
  // Forecast Inputs
  const [plannedHires, setPlannedHires] = useState(5);
  const [attritionRate, setAttritionRate] = useState(5); // %
  const [manualAdjustment, setManualAdjustment] = useState(0);
  const [budgetLimit, setBudgetLimit] = useState(180);

  useEffect(() => {
    const fetchBaseData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/reports/headcount-forecast?months=24&view=${view}`);
        const result = await res.json();
        setData(result.data || []);
        if (result.budgetInfo) {
          setBaseRunRate(result.budgetInfo.currentRunRate);
          setAvgSalary(result.budgetInfo.avgSalaryPerHire);
        }
      } catch (e) {
        console.error("Failed to fetch forecast", e);
      } finally {
        setLoading(false);
      }
    };
    fetchBaseData();
  }, [view]);

  // Compute actuals vs projection internally based on user overrides
  const computedData = useMemo(() => {
    if (!data.length) return [];
    
    let currentHC = data.find(d => d.type === "projected")?.startingHC || 150;
    
    return data.map((d) => {
      if (d.type === "actual") {
        return {
          ...d,
          actualLine: d.endingHC,
          projectedLine: null,
          targetLine: d.targetHC
        };
      } else {
        // Apply overrides to projected
        const monthlyAttritionRate = (attritionRate / 100) / 12;
        const attritionNum = Math.round(currentHC * monthlyAttritionRate);
        const netChange = plannedHires - attritionNum + manualAdjustment;
        
        const endHC = currentHC + netChange;
        
        const budgetDelta = (budgetLimit - endHC) * (avgSalary / 12);
        let status = "On Track";
        if (endHC > budgetLimit) status = "Over Budget";
        else if (endHC < budgetLimit - 10) status = "Under Plan";

        const point = {
          ...d,
          startingHC: currentHC,
          hires: plannedHires,
          attrition: attritionNum,
          endingHC: endHC,
          actualLine: null,
          projectedLine: endHC,
          targetLine: budgetLimit,
          budgetDelta,
          status
        };
        currentHC = endHC;
        return point;
      }
    });
  }, [data, plannedHires, attritionRate, manualAdjustment, budgetLimit, avgSalary]);

  const currentHC = computedData.find(d => d.type === "projected")?.startingHC || 0;
  const endProjectedHC = computedData.length > 0 ? computedData[computedData.length - 1].endingHC : 0;
  
  const projectedRunRate = baseRunRate + ((endProjectedHC - currentHC) * avgSalary);

  const handleExportPDF = () => {
    window.print();
  };

  const handleExportCSV = () => {
    // Generate simple csv
    const header = "Month,Starting HC,Hires,Attrition,Ending HC,Target HC,Status\n";
    const rows = computedData.map(d => `${d.month},${d.startingHC},${d.hires},${d.attrition},${d.endingHC},${d.type === 'actual' ? d.targetHC : budgetLimit},${d.status}`);
    const csvContent = "data:text/csv;charset=utf-8," + header + rows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "headcount_forecast.csv");
    document.body.appendChild(link); // Required for FF
    link.click();
    link.remove();
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Link href="/reports" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 mb-2">
            <ChevronLeft size={16} /> Back to Reports
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users size={24} className="text-blue-600" />
            Headcount Forecasting
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Model planned hires, attrition, and budget impact over 24 months.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            {["total", "department", "location"].map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 text-xs font-bold rounded-md capitalize transition-colors ${
                  view === v
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-colors">
            <Download size={16} /> CSV
          </button>
          <button onClick={handleExportPDF} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
            <FileText size={16} /> Export PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* Left Column: Forecast Configuration Sidebar */}
        <div className="xl:col-span-1 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-slate-900 dark:text-white">
              <Settings size={18} className="text-blue-600" />
              <h2 className="font-bold text-sm">Forecast Inputs</h2>
            </div>

            <div className="space-y-5">
              <div>
                <label className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                  <span>Planned Hires /mo</span>
                  <span className="text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">ATS: 12 Open</span>
                </label>
                <div className="relative">
                  <Briefcase size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    value={plannedHires}
                    onChange={(e) => setPlannedHires(Number(e.target.value))}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                  <span>Annual Attrition Rate (%)</span>
                  <span className="text-slate-400 text-[10px]">Hist avg: 4.8%</span>
                </label>
                <div className="relative">
                  <TrendingDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    step="0.1"
                    value={attritionRate}
                    onChange={(e) => setAttritionRate(Number(e.target.value))}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">Manual Adjustments (Net Delta)</label>
                <div className="relative">
                  <Edit3 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    value={manualAdjustment}
                    onChange={(e) => setManualAdjustment(Number(e.target.value))}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <p className="mt-1 text-[10px] text-slate-500 leading-tight">Adjust external shifts (e.g., M&A, org restructuring) affecting net output per month.</p>
              </div>

              <div>
                <label className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                  <span>Budget Constraint (Max HC)</span>
                </label>
                <div className="relative">
                  <Users size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    value={budgetLimit}
                    onChange={(e) => setBudgetLimit(Number(e.target.value))}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
               <button className="w-full flex items-center justify-center gap-2 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-bold transition-all shadow-sm">
                  <Share2 size={14} /> Compare Scenarios
               </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-5 rounded-xl text-white shadow-md relative overflow-hidden">
            <div className="absolute -right-6 -top-6 opacity-10">
               <Landmark size={120} />
            </div>
            <div className="relative z-10">
              <h3 className="text-sm font-bold text-blue-100 mb-1">Budget Impact</h3>
              <p className="text-2xl font-black mb-1">${(projectedRunRate / 1000000).toFixed(2)}M /yr</p>
              <p className="text-xs text-blue-200 mb-4 inline-flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-full">
                <TrendingUp size={12} /> {(endProjectedHC - currentHC) > 0 ? "Up" : "Down"} {(Math.abs(((projectedRunRate - baseRunRate) / baseRunRate)) * 100).toFixed(1)}% vs Current Run Rate
              </p>
              
              <div className="text-xs text-blue-100 space-y-1 block mt-2">
                 <div className="flex justify-between border-b border-white/20 pb-1">
                    <span>Base Payroll:</span>
                    <span className="font-bold">${(baseRunRate / 1000000).toFixed(2)}M</span>
                 </div>
                 <div className="flex justify-between pt-1">
                    <span>Impact of Hires:</span>
                    <span className="font-bold whitespace-nowrap">+${(((endProjectedHC - currentHC) * avgSalary) / 1000000).toFixed(2)}M</span>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Visuals & Tables */}
        <div className="xl:col-span-3 space-y-6">
          
          {/* Chart Section */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Headcount Trend</h2>
              <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-0.5 bg-blue-600 rounded"></div> Actual
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-0.5 border-t-2 border-dashed border-indigo-500 rounded"></div> Projected
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-0.5 border-t-2 border-dotted border-red-500 rounded"></div> Target
                </div>
              </div>
            </div>
            
            <div className="h-[350px] w-full">
              {loading ? (
                <div className="h-full flex items-center justify-center text-slate-400">Loading forecast...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={computedData} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 11, fill: '#64748b' }} 
                      axisLine={false} 
                      tickLine={false} 
                      dy={10}
                      minTickGap={20}
                    />
                    <YAxis 
                      tick={{ fontSize: 11, fill: '#64748b' }} 
                      axisLine={false} 
                      tickLine={false} 
                      dx={-10}
                      domain={['auto', 'auto']}
                    />
                    <RechartsTooltip content={<CustomTooltip />} />
                    
                    <Line 
                      type="monotone" 
                      dataKey="actualLine" 
                      name="Actual HC" 
                      stroke="#2563eb" 
                      strokeWidth={3} 
                      dot={{ r: 3, fill: '#2563eb', strokeWidth: 0 }}
                      activeDot={{ r: 5, strokeWidth: 0 }}
                      connectNulls
                    />
                    
                    <Line 
                      type="monotone" 
                      dataKey="projectedLine" 
                      name="Projected HC" 
                      stroke="#6366f1" 
                      strokeWidth={3} 
                      strokeDasharray="5 5"
                      dot={{ r: 3, fill: '#6366f1', strokeWidth: 0 }}
                      activeDot={{ r: 5, strokeWidth: 0 }}
                      connectNulls
                    />
                    
                    <Line 
                      type="step" 
                      dataKey="targetLine" 
                      name="Target Limit" 
                      stroke="#ef4444" 
                      strokeWidth={2} 
                      strokeDasharray="2 2"
                      dot={false}
                    />

                    {/* Divider Line for Today */}
                    <ReferenceLine x={computedData.find(d => d.type === 'projected')?.month} stroke="#94a3b8" strokeDasharray="3 3" label={{ position: 'top', value: 'Today', fill: '#94a3b8', fontSize: 10 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Table Section */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Projection Details</h2>
              <div className="flex bg-slate-100 dark:bg-slate-800 rounded px-2 py-1 items-center gap-2">
                 <Filter size={12} className="text-slate-400" />
                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Historical vs Forecast</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 dark:text-slate-400">
                    <th className="py-3 px-4 font-bold border-b border-slate-200 dark:border-slate-800">Month</th>
                    <th className="py-3 px-4 font-bold border-b border-slate-200 dark:border-slate-800 text-right">Start HC</th>
                    <th className="py-3 px-4 font-bold border-b border-slate-200 dark:border-slate-800 text-right">Hires</th>
                    <th className="py-3 px-4 font-bold border-b border-slate-200 dark:border-slate-800 text-right">Attrition</th>
                    <th className="py-3 px-4 font-bold border-b border-slate-200 dark:border-slate-800 text-right bg-slate-100/50 dark:bg-slate-800">End HC</th>
                    <th className="py-3 px-4 font-bold border-b border-slate-200 dark:border-slate-800 text-right">Budget Delta</th>
                    <th className="py-3 px-4 font-bold border-b border-slate-200 dark:border-slate-800 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {computedData.map((row) => (
                    <tr key={row.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors ${row.type === 'actual' ? 'opacity-80' : ''}`}>
                      <td className="py-3 px-4 text-slate-900 dark:text-white font-medium flex items-center gap-2">
                        {row.type === 'actual' ? (
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" title="Historical Actual" />
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" title="Projected" />
                        )}
                        {row.month}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap">{row.startingHC}</td>
                      <td className="py-3 px-4 text-right text-green-600 dark:text-green-400 font-medium whitespace-nowrap">+{row.hires}</td>
                      <td className="py-3 px-4 text-right text-red-600 dark:text-red-400 font-medium whitespace-nowrap">-{row.attrition}</td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/50 whitespace-nowrap">{row.endingHC}</td>
                      <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap text-xs">
                        {row.type === 'projected' ? (
                          row.budgetDelta >= 0 ? (
                            <span className="text-green-500 font-medium">+${(row.budgetDelta / 1000).toFixed(0)}k</span>
                          ) : (
                            <span className="text-red-500 font-medium">-${(Math.abs(row.budgetDelta) / 1000).toFixed(0)}k</span>
                          )
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {row.type === 'projected' ? (
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider inline-flex ${
                            row.status === 'On Track' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                            row.status === 'Over Budget' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                            'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          }`}>
                            {row.status}
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded text-[10px] font-medium text-slate-400">Actuals</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
