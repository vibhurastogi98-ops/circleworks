"use client";
import React, { useState } from "react";
import { CopyPlus, Save, LayoutGrid, CheckCircle2, SlidersHorizontal, Settings2, Share2, FileSpreadsheet } from "lucide-react";
import { mockGLAccounts, mockPayrollComponents, type PayrollComponent } from "@/data/mockGL";
import { toast } from "sonner";

export default function GLMappingPage() {
  const [components, setComponents] = useState<PayrollComponent[]>(mockPayrollComponents);
  const [showPreview, setShowPreview] = useState(false);
  const [activeIntegration, setActiveIntegration] = useState("QuickBooks Online");
  
  const handleMapAccount = (compId: string, glId: string | null) => {
    setComponents(components.map(c => c.id === compId ? { ...c, assignedGlId: glId } : c));
  };

  const handleSaveTemplate = () => {
    toast.success("GL Mapping Template Saved", { description: "Active payrolls will now use this journal entity mapping."});
  };

  const categories = ["Gross Pay", "Taxes (Employer)", "Taxes (Employee)", "Deductions", "Net Pay"];

  // Journal Entry Preview Math
  // Mocking a sample run of $100k gross for a preview
  const mockTotals: Record<string, number> = {
    "comp-1": 85000, "comp-2": 5000, "comp-3": 10000, // Gross: 100k
    "comp-4": 7650, "comp-5": 600, // Employer Taxes: ~8.25k
    "comp-6": 12000, "comp-7": 4000, "comp-8": 7650, // Employee Taxes: ~23.65k
    "comp-9": 2500, "comp-10": 4000, // Deductions: ~6.5k
    "comp-11": 69850 // Net
  };

  return (
    <div className="max-w-6xl mx-auto pb-24 animate-in fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">General Ledger Mapping</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Map payroll components to your Chart of Accounts for automated journal entries.</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-3">
          <button 
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-sm font-medium shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <LayoutGrid size={16} /> Journal Entry Preview
          </button>
          <button 
            onClick={handleSaveTemplate}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-blue-700 transition-all"
          >
            <Save size={16} /> Save Mapping
          </button>
        </div>
      </div>

      {/* Integration Status Bar */}
      <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4 mb-8 flex items-center justify-between">
         <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
             <CheckCircle2 size={20} />
           </div>
           <div>
             <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Active Sync: {activeIntegration}</h3>
             <p className="text-xs text-slate-500">124 Accounts synced 5 mins ago</p>
           </div>
         </div>
         <div className="flex gap-2">
            <button className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50">Sync Now</button>
            <button className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 flex items-center gap-1">
              <Settings2 size={14} /> Providers
            </button>
         </div>
      </div>

      {/* Main Mapping Area */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-12 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <div className="col-span-5">Payroll Line Item</div>
          <div className="col-span-1 text-center">Type</div>
          <div className="col-span-4">GL Account Mapping</div>
          <div className="col-span-2">Department Split</div>
        </div>
        
        <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
           {categories.map(category => (
             <React.Fragment key={category}>
               <div className="bg-slate-100/50 dark:bg-slate-800/30 px-6 py-2 text-xs font-black tracking-widest text-slate-700 uppercase">
                 {category}
               </div>
               
               {components.filter(c => c.category === category).map((comp) => (
                 <div key={comp.id} className="grid grid-cols-12 py-4 px-6 items-center hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors group">
                    <div className="col-span-5 pr-4">
                      <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">{comp.name}</p>
                      {comp.assignedGlId === null && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase">Action Required</p>}
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <span className={`text-[10px] uppercase font-black tracking-wider px-2 py-1 rounded ${
                        comp.defaultEntryType === 'Debit' ? 'bg-indigo-50 text-indigo-700' : 'bg-fuchsia-50 text-fuchsia-700'
                      }`}>
                        {comp.defaultEntryType}
                      </span>
                    </div>
                    <div className="col-span-4 pr-6">
                      <select 
                        value={comp.assignedGlId || ""}
                        onChange={(e) => handleMapAccount(comp.id, e.target.value || null)}
                        className={`w-full bg-slate-50 border ${comp.assignedGlId ? 'border-slate-200' : 'border-red-300 ring-2 ring-red-100'} rounded-lg py-2 px-3 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none`}
                      >
                        <option value="">-- Select GL Account --</option>
                        {mockGLAccounts.map(gl => (
                          <option key={gl.id} value={gl.id}>
                            {gl.code} - {gl.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2">
                       <button className="flex justify-between items-center w-full px-3 py-2 text-xs font-medium text-slate-500 border border-dashed border-slate-300 rounded-lg hover:border-slate-400 hover:text-slate-700 hover:bg-slate-50">
                         No Split <SlidersHorizontal size={12} className="opacity-50 group-hover:opacity-100" />
                       </button>
                    </div>
                 </div>
               ))}
             </React.Fragment>
           ))}
        </div>
      </div>

      {/* Journal Entry Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
               <div>
                 <h2 className="text-xl font-bold text-slate-900">Journal Entry Preview</h2>
                 <p className="text-sm text-slate-500">Simulating a $100k standard gross payroll run.</p>
               </div>
               <div className="flex gap-2">
                 <button className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">
                   <FileSpreadsheet size={16} />
                 </button>
                 <button onClick={() => setShowPreview(false)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-sm rounded-lg hover:bg-slate-200 transition-colors">
                   Close Preview
                 </button>
               </div>
            </div>

            <div className="p-6 overflow-y-auto bg-slate-50">
               <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                 <table className="w-full text-sm text-left">
                    <thead className="bg-slate-900 text-white font-medium text-xs tracking-wider uppercase">
                       <tr>
                         <th className="px-4 py-3 border-r border-slate-700">Account Code</th>
                         <th className="px-4 py-3">Account Name</th>
                         <th className="px-4 py-3 border-r border-slate-700">Payroll Description</th>
                         <th className="px-4 py-3 text-right bg-slate-800">Debit</th>
                         <th className="px-4 py-3 text-right bg-slate-800">Credit</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {components.map(comp => {
                        const gl = mockGLAccounts.find(g => g.id === comp.assignedGlId);
                        const val = mockTotals[comp.id] || 0;
                        if (!gl || val === 0) return null;
                        
                        return (
                          <tr key={comp.id} className="hover:bg-slate-50">
                             <td className="px-4 py-3 font-mono text-xs text-slate-500 border-r border-slate-100">{gl.code}</td>
                             <td className="px-4 py-3 font-bold text-slate-700">{gl.name}</td>
                             <td className="px-4 py-3 text-slate-500 border-r border-slate-100">{comp.name}</td>
                             <td className="px-4 py-3 text-right font-mono font-medium">{comp.defaultEntryType === 'Debit' ? `$${val.toLocaleString()}` : ''}</td>
                             <td className="px-4 py-3 text-right font-mono font-medium">{comp.defaultEntryType === 'Credit' ? `$${val.toLocaleString()}` : ''}</td>
                          </tr>
                        );
                      })}
                      
                      {/* Totals Row */}
                      <tr className="bg-blue-50/50 border-t-2 border-slate-200 text-blue-900 font-black">
                         <td colSpan={3} className="px-4 py-4 text-right">BALANCED TOTAL:</td>
                         <td className="px-4 py-4 text-right border-x border-slate-200/50">$108,250.00</td>
                         <td className="px-4 py-4 text-right">$108,250.00</td>
                      </tr>
                    </tbody>
                 </table>
               </div>
            </div>
            
            <div className="p-5 border-t border-slate-100 bg-white rounded-b-2xl flex justify-between">
               <span className="text-xs text-slate-500 flex items-center gap-1"><Share2 size={14}/> Auto-syncs to QuickBooks Online on Approval</span>
               <button 
                 onClick={() => { setShowPreview(false); toast.success("Manual Sync Initiated"); }}
                 className="px-6 py-2 bg-slate-900 hover:bg-black text-white text-sm font-bold rounded-lg shadow-md transition-colors"
               >
                 Send to GL
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
