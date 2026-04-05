"use client";
import React, { useState } from "react";
import { 
  Calculator, FileText, Settings, Users, Upload, 
  Download, AlertTriangle, ArrowRight, CheckCircle2 
} from "lucide-react";
import { mockTipRecords, mockTipPools, mockForm8027Data, type TipRecord } from "@/data/mockTips";

export default function TipsPage() {
  const [activeTab, setActiveTab] = useState<"reporting" | "8846" | "8027" | "pools">("reporting");
  const [tips, setTips] = useState<TipRecord[]>(mockTipRecords);

  const calculateTipCompliance = (declared: number, hours: number) => {
    const ficaRate = 0.0765;
    const minWageOffset = 5.15;
    const ficaOnTips = declared * ficaRate;
    const creditEligibleTips = Math.max(0, declared - (hours * minWageOffset));
    const netTipCredit = creditEligibleTips * ficaRate;
    return { ficaOnTips, netTipCredit };
  };

  const handleDeclaredTipChange = (id: string, newAmount: string) => {
    const val = parseFloat(newAmount) || 0;
    setTips(tips.map(t => {
      if (t.id !== id) return t;
      const { ficaOnTips, netTipCredit } = calculateTipCompliance(val + t.allocatedTips, t.hoursWorked);
      return { 
        ...t, 
        declaredTips: val, 
        totalTips: val + t.allocatedTips,
        ficaOnTips,
        netTipCredit
      };
    }));
  };

  const totalDeclared = tips.reduce((sum, t) => sum + t.declaredTips, 0);
  const totalFICA = tips.reduce((sum, t) => sum + t.ficaOnTips, 0);
  const totalNetCredit = tips.reduce((sum, t) => sum + t.netTipCredit, 0);

  const [allocMethod, setAllocMethod] = useState("hours");
  const [isLargeEstablishment, setIsLargeEstablishment] = useState(false);
  const [evaluating8027, setEvaluating8027] = useState(false);
  const [allocStatus, setAllocStatus] = useState<any>(null);

  const handleRunEvaluator = async () => {
    setEvaluating8027(true);
    try {
      const res = await fetch("/api/payroll/tips/8027-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tips,
          grossReceipts: mockForm8027Data.grossReceipts,
          allocMethod
        })
      });
      const data = await res.json();
      if (data.success) {
        const enrichedAllocated = data.allocatedTips.map((t: any) => {
          const { ficaOnTips, netTipCredit } = calculateTipCompliance(t.totalTips, t.hoursWorked);
          return { ...t, ficaOnTips, netTipCredit };
        });
        setTips(enrichedAllocated);
        setAllocStatus(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setEvaluating8027(false);
    }
  };

  // Tip Pool status
  const [pools, setPools] = useState(mockTipPools);

  return (
    <div className="max-w-6xl mx-auto pb-24 animate-in fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Tip Reporting & Compliance</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Manage tip pools, calculate FICA Form 8846 credits, and generate Form 8027 allocations.</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-xl w-max mb-8">
        {[
          { id: "reporting", label: "Tip Reporting", icon: FileText },
          { id: "8846", label: "FICA Tip Credit (8846)", icon: Calculator },
          { id: "8027", label: "Form 8027", icon: AlertTriangle },
          { id: "pools", label: "Tip Pools", icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-lg transition-all ${
                isActive
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <Icon size={16} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab: Reporting */}
      {activeTab === "reporting" && (
        <div className="animate-in slide-in-from-right-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Pay Period Tip Declarations</h2>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white rounded-lg text-sm font-medium hover:bg-slate-50 shadow-sm transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200">
                <Upload size={16} /> Import POS Data (CSV)
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-blue-700 transition-all">
                Publish to Payroll
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden mb-8">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium">
                  <tr>
                    <th className="px-6 py-3">Employee</th>
                    <th className="px-6 py-3">Role</th>
                    <th className="px-6 py-3 text-right">Hours</th>
                    <th className="px-6 py-3 text-right">Declared Tips</th>
                    <th className="px-6 py-3 text-right text-slate-400">Allocated (8027)</th>
                    <th className="px-6 py-3 text-right">Total Tips</th>
                    <th className="px-6 py-3 text-right">FICA on Tips</th>
                    <th className="px-6 py-3 text-right text-emerald-600">Net Tip Credit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {tips.map((tip) => (
                    <tr key={tip.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{tip.name}</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{tip.role}</td>
                      <td className="px-6 py-4 text-right text-slate-600">{tip.hoursWorked}</td>
                      <td className="px-6 py-4 text-right">
                        <input 
                          type="number"
                          value={tip.declaredTips}
                          onChange={(e) => handleDeclaredTipChange(tip.id, e.target.value)}
                          className="w-24 text-right border border-slate-200 rounded px-2 py-1 bg-white font-mono hover:border-blue-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 text-right text-slate-400 font-mono">${tip.allocatedTips.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right font-bold text-slate-700 font-mono">${tip.totalTips.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right text-red-500 font-mono">-${tip.ficaOnTips.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right font-bold text-emerald-600 font-mono">+${tip.netTipCredit.toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 dark:bg-slate-800/50 font-bold border-t-2 border-slate-200 dark:border-slate-700">
                    <td colSpan={3} className="px-6 py-4 text-right">PAY PERIOD TOTALS:</td>
                    <td className="px-6 py-4 text-right">${totalDeclared.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right text-slate-400">$0.00</td>
                    <td className="px-6 py-4 text-right">${totalDeclared.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right text-red-500">-${totalFICA.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right text-emerald-600">+${totalNetCredit.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Form 8846 */}
      {activeTab === "8846" && (
        <div className="animate-in slide-in-from-right-4 max-w-3xl">
          <h2 className="text-xl font-bold mb-6">Form 8846: Credit for Employer Social Security and Medicare Taxes</h2>
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 mb-6 shadow-sm">
            <div className="flex items-start justify-between mb-8 pb-8 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">YTD Estimated FICA Tip Credit</h3>
                <p className="text-sm text-slate-500 mt-1">Calculated on tips exceeding the federal minimum wage offset ($5.15/hr).</p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-black text-emerald-600">$4,382.90</p>
                <p className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded inline-block mt-2 uppercase tracking-wider">Eligible Credit</p>
              </div>
            </div>

            <div className="space-y-4 text-sm">
               <div className="flex justify-between">
                 <span className="text-slate-600">Total Tips Received by Employees (YTD)</span>
                 <span className="font-bold">$68,450.00</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-slate-600">Tips Used to Meet Minimum Wage</span>
                 <span className="font-bold text-slate-400">-$11,205.00</span>
               </div>
               <div className="flex justify-between border-t border-slate-100 pt-4">
                 <span className="font-bold text-slate-800">Creditable Tips (Line 3)</span>
                 <span className="font-bold">$57,245.00</span>
               </div>
               <div className="flex justify-between pt-2">
                 <span className="text-slate-600">Current FICA Rate (7.65%)</span>
                 <span className="font-bold text-blue-600">x 0.0765</span>
               </div>
               <div className="flex justify-between border-t-2 border-slate-200 pt-4 text-lg">
                 <span className="font-black text-slate-900">Total Form 8846 Credit (Line 6)</span>
                 <span className="font-black text-emerald-600">$4,379.24*</span>
               </div>
               <p className="text-xs text-slate-400 italic text-right mt-2">*Subject to slight rounding adjustments on final tax return.</p>
            </div>
          </div>
          
          <button className="flex justify-center w-full items-center gap-2 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-md">
            <Download size={18} /> Export Form 8846 Schedule Data
          </button>
        </div>
      )}

      {/* Tab: Form 8027 */}
      {activeTab === "8027" && (
        <div className="animate-in slide-in-from-right-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Form 8027: Tip Allocation</h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold shadow-md hover:bg-slate-800 transition-all">
              <Download size={16} /> Generate Form 8027 PDF
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="col-span-2 bg-white dark:bg-slate-900 border border-slate-200 rounded-xl p-6 shadow-sm">
               <div className="flex items-center justify-between mb-6">
                 <div>
                   <h3 className="font-bold text-slate-900">Large Food & Beverage Establishment</h3>
                   <p className="text-xs text-slate-500 mt-1">Enable auto-allocation if tips fall below 8% of gross receipts.</p>
                 </div>
                 <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={isLargeEstablishment} onChange={(e) => setIsLargeEstablishment(e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
               </div>

               <div className={`transition-all ${isLargeEstablishment ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                 <div className="mb-4">
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Allocation Method</label>
                   <select 
                     value={allocMethod} 
                     onChange={(e) => setAllocMethod(e.target.value)}
                     className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                   >
                     <option value="hours">Hours-worked Method (Under 25 FTEs)</option>
                     <option value="gross">Gross Receipts Method</option>
                     <option value="goodfaith">Good Faith Agreement</option>
                   </select>
                 </div>
                 <button 
                   onClick={handleRunEvaluator}
                   disabled={evaluating8027}
                   className="w-full py-3 bg-blue-100 text-blue-700 hover:bg-blue-200 font-bold rounded-lg text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                 >
                   {evaluating8027 ? "Evaluating..." : "Run Auto-Allocation Evaluator"} <ArrowRight size={16} />
                 </button>
               </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
               <h3 className="font-bold text-slate-900 mb-4 border-b border-slate-200 pb-2">Status Box (YTD)</h3>
               <div className="space-y-3 text-sm">
                 <div className="flex justify-between">
                   <span className="text-slate-500">Gross Receipts</span>
                   <span className="font-medium">${mockForm8027Data.grossReceipts.toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between text-blue-600 font-bold">
                   <span>8% Threshold</span>
                   <span>${mockForm8027Data.eightPercentThreshold.toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between mt-2">
                   <span className="text-slate-500">Total Declared</span>
                   <span className="font-medium">${mockForm8027Data.totalDeclaredTips.toLocaleString()}</span>
                 </div>
                 
                 <div className="mt-4 pt-4 border-t border-slate-200">
                   {mockForm8027Data.totalDeclaredTips >= mockForm8027Data.eightPercentThreshold ? (
                     <div className="flex items-center gap-2 text-emerald-600 font-bold">
                       <CheckCircle2 size={18} /> No allocation required.
                     </div>
                   ) : (
                     <div className="flex items-center gap-2 text-red-600 font-bold">
                       <AlertTriangle size={18} /> Allocation required!
                     </div>
                   )}
                 </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Tip Pools */}
      {activeTab === "pools" && (
        <div className="animate-in slide-in-from-right-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Tip Pool Management</h2>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-blue-700 transition-all">
              + Create Tip Pool
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pools.map(pool => (
              <div key={pool.id} className="bg-white dark:bg-slate-900 border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-slate-900 text-lg leading-tight">{pool.name}</h3>
                  <span className={`px-2 py-1 text-[10px] font-black uppercase tracking-wider rounded border ${
                    pool.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}>
                    {pool.status}
                  </span>
                </div>
                
                <div className="flex-1 space-y-3 mb-6 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Method</span>
                    <span className="font-medium capitalize">{pool.distributionMethod}</span>
                  </div>
                  <div className="flex justify-between">
                     <span className="text-slate-500">Members</span>
                     <span className="font-medium">{pool.participatingEmployees}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 pt-3">
                     <span className="text-slate-500 font-bold">Period Total</span>
                     <span className="font-bold text-blue-600">${pool.totalPoolAmount.toFixed(2)}</span>
                  </div>
                </div>

                {pool.stateRuleFlag && (
                  <div className="bg-amber-50 text-amber-800 text-xs p-3 rounded-lg border border-amber-200 flex items-start gap-2 mb-4">
                    <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                    <span>{pool.stateRuleFlag}</span>
                  </div>
                )}

                <button className="w-full mt-auto py-2 border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-sm rounded-lg transition-colors">
                  Manage Distribution
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
