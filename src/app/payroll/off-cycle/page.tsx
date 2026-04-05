"use client";
import React, { useState } from "react";
import { UserPlus, ArrowRight, Play, Search, AlertCircle } from "lucide-react";

export default function OffCyclePage() {
  const [step, setStep] = useState(1);
  return (
    <div className="max-w-4xl mx-auto pb-24">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Run Off-Cycle Payroll</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Issue bonuses, corrections, or off-cycle payments separate from the regular schedule.</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4 mb-8">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${step === s ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : step > s ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
              {s}
            </div>
            {s < 3 && <div className={`w-16 h-1 rounded-full ${step > s ? 'bg-emerald-500' : 'bg-slate-100'}`} />}
          </div>
        ))}
      </div>

      {/* Content Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-2xl p-8">
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-xl font-bold mb-4">Select Employees</h2>
            <div className="relative mb-6">
              <Search className="absolute left-3 top-3 text-slate-400" size={18}/>
              <input type="text" placeholder="Search team..." className="w-full pl-10 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
            <div className="space-y-2 mb-8">
               <div className="flex items-center justify-between p-4 border border-blue-500 bg-blue-50/50 rounded-xl">
                 <div className="flex items-center gap-3">
                    <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"/>
                    <div className="w-10 h-10 bg-slate-200 rounded-full"/>
                    <div><p className="font-bold">Jordan Brown</p><p className="text-xs text-slate-500">Marketing</p></div>
                 </div>
               </div>
               <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-slate-300 cursor-pointer">
                 <div className="flex items-center gap-3">
                    <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"/>
                    <div className="w-10 h-10 bg-slate-200 rounded-full"/>
                    <div><p className="font-bold">Taylor Smith</p><p className="text-xs text-slate-500">Engineering</p></div>
                 </div>
               </div>
            </div>
            <button onClick={() => setStep(2)} className="w-full flex justify-center items-center gap-2 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700">Continue to Reasons <ArrowRight size={18}/></button>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4">
            <h2 className="text-xl font-bold mb-4">Payment Details</h2>
            <div className="p-5 border border-slate-200 rounded-xl mb-6">
               <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-slate-200 rounded-full"/>
                  <span className="font-bold">Jordan Brown</span>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="text-xs font-bold text-slate-500 uppercase">Payment Type</label>
                   <select className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                     <option>Bonus</option>
                     <option>Correction</option>
                     <option>Severance</option>
                   </select>
                 </div>
                 <div>
                   <label className="text-xs font-bold text-slate-500 uppercase">Gross Amount</label>
                   <div className="relative mt-1">
                     <span className="absolute left-3 top-2.5 text-slate-500">$</span>
                     <input type="number" defaultValue="5000" className="w-full pl-7 pr-3 py-2 bg-white border border-slate-200 rounded-lg font-bold" />
                   </div>
                 </div>
               </div>
            </div>
            <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 mb-8 flex gap-3 text-amber-800 text-sm">
              <AlertCircle size={18} className="shrink-0 text-amber-600" />
              <p>Taxes will be withheld at the supplemental rate of 22% for Federal Income Tax on bonuses.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 py-3.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200">Back</button>
              <button onClick={() => setStep(3)} className="flex-[2] flex justify-center items-center gap-2 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700">Review Taxes <ArrowRight size={18}/></button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4">
            <h2 className="text-xl font-bold mb-4">Review & Submit</h2>
            <div className="bg-slate-50 rounded-xl p-6 mb-8 border border-slate-200">
               <div className="flex justify-between items-center mb-6">
                 <span className="font-bold text-slate-600">Total Gross</span>
                 <span className="text-xl font-extrabold">$5,000.00</span>
               </div>
               <div className="space-y-3 pt-4 border-t border-slate-200">
                 <div className="flex justify-between text-sm text-red-600">
                   <span>Federal Supp. Tax (22%)</span><span>-$1,100.00</span>
                 </div>
                 <div className="flex justify-between text-sm text-red-600">
                   <span>FICA SS (6.2%)</span><span>-$310.00</span>
                 </div>
                 <div className="flex justify-between text-sm text-red-600">
                   <span>FICA Med (1.45%)</span><span>-$72.50</span>
                 </div>
                 <div className="flex justify-between text-sm text-red-600">
                   <span>State Tax (est.)</span><span>-$250.00</span>
                 </div>
               </div>
               <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-200">
                 <span className="font-bold text-xl text-slate-900">Total Net Check</span>
                 <span className="text-3xl font-extrabold text-emerald-600">$3,267.50</span>
               </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 py-3.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200">Back</button>
              <button className="flex-[2] flex justify-center items-center gap-2 py-3.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-500/20"><Play size={18}/> Process Off-Cycle Run</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
