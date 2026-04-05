"use client";
import React, { useState } from "react";
import { ArrowRight, Play, Search, AlertCircle, ArrowLeft, History, Calculator, CheckCircle2, ChevronDown, DollarSign } from "lucide-react";

export default function OffCyclePage() {
  const [activeTab, setActiveTab] = useState<"standard" | "retro">("standard");
  const [step, setStep] = useState(1);
  const [showRetroBanner, setShowRetroBanner] = useState(true);
  const [showRetroModal, setShowRetroModal] = useState(false);
  const [retroProcessed, setRetroProcessed] = useState(false);
  const [loadingRetro, setLoadingRetro] = useState(false);
  const [retroData, setRetroData] = useState<any>(null);

  const handleCalculateRetro = async () => {
    setLoadingRetro(true);
    try {
      const res = await fetch("/api/payroll/retro-calc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: "emp-alex-clark",
          oldRate: 85000,
          newRate: 92000,
          rateType: "salary",
          periods: [
             { name: "Feb 1 – Feb 15", hoursWorked: 86.67 },
             { name: "Feb 16 – Feb 28", hoursWorked: 86.67 },
             { name: "Mar 1 – Mar 15", hoursWorked: 86.67 }
          ]
        })
      });
      const data = await res.json();
      if (data.success) {
        setRetroData(data);
        setShowRetroModal(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingRetro(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Run Off-Cycle Payroll</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Issue bonuses, retroactive pay adjustments, or corrections outside the normal schedule.</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-xl w-max mx-auto mb-8">
        <button
          onClick={() => setActiveTab("standard")}
          className={`px-5 py-2 text-sm font-bold rounded-lg transition-all ${
            activeTab === "standard"
              ? "bg-white dark:bg-slate-800 text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Standard Off-Cycle
        </button>
        <button
          onClick={() => setActiveTab("retro")}
          className={`px-5 py-2 text-sm font-bold rounded-lg transition-all ${
            activeTab === "retro"
              ? "bg-white dark:bg-slate-800 text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Retroactive Pay
        </button>
      </div>

      {activeTab === "standard" && (
        <>
          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-4 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                    step === s
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                      : step > s
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div
                    className={`w-16 h-1 rounded-full ${
                      step > s ? "bg-emerald-500" : "bg-slate-100"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Content Box */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-2xl p-8">
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-bottom-4">
                <h2 className="text-xl font-bold mb-4">Select Employees</h2>
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search team..."
                    className="w-full pl-10 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div className="space-y-2 mb-8">
                  <div className="flex items-center justify-between p-4 border border-blue-500 bg-blue-50/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="w-10 h-10 bg-slate-200 rounded-full" />
                      <div>
                        <p className="font-bold">Jordan Brown</p>
                        <p className="text-xs text-slate-500">Marketing</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-slate-300 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="w-10 h-10 bg-slate-200 rounded-full" />
                      <div>
                        <p className="font-bold">Taylor Smith</p>
                        <p className="text-xs text-slate-500">Engineering</p>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setStep(2)}
                  className="w-full flex justify-center items-center gap-2 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Continue to Reasons <ArrowRight size={18} />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4">
                <h2 className="text-xl font-bold mb-4">Payment Details</h2>
                <div className="p-5 border border-slate-200 rounded-xl mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-slate-200 rounded-full" />
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
                        <input
                          type="number"
                          defaultValue="5000"
                          className="w-full pl-7 pr-3 py-2 bg-white border border-slate-200 rounded-lg font-bold"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 mb-8 flex gap-3 text-amber-800 text-sm">
                  <AlertCircle size={18} className="shrink-0 text-amber-600" />
                  <p>Taxes will be withheld at the supplemental rate of 22% for Federal Income Tax on bonuses.</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="flex-1 py-3.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200">
                    Back
                  </button>
                  <button onClick={() => setStep(3)} className="flex-[2] flex justify-center items-center gap-2 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700">
                    Review Taxes <ArrowRight size={18} />
                  </button>
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
                      <span>Federal Supp. Tax (22%)</span>
                      <span>-$1,100.00</span>
                    </div>
                    <div className="flex justify-between text-sm text-red-600">
                      <span>FICA SS (6.2%)</span>
                      <span>-$310.00</span>
                    </div>
                    <div className="flex justify-between text-sm text-red-600">
                      <span>FICA Med (1.45%)</span>
                      <span>-$72.50</span>
                    </div>
                    <div className="flex justify-between text-sm text-red-600">
                      <span>State Tax (est.)</span>
                      <span>-$250.00</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-200">
                    <span className="font-bold text-xl text-slate-900">Total Net Check</span>
                    <span className="text-3xl font-extrabold text-emerald-600">$3,267.50</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="flex-1 py-3.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200">
                    Back
                  </button>
                  <button className="flex-[2] flex justify-center items-center gap-2 py-3.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-500/20">
                    <Play size={18} /> Process Off-Cycle Run
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === "retro" && (
        <div className="animate-in fade-in">
          {showRetroBanner && !retroProcessed && (
            <div className="border border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 rounded-xl p-5 mb-8 flex flex-col sm:flex-row items-center gap-4 justify-between shadow-sm">
              <div className="flex gap-3">
                <div className="mt-0.5">
                  <History className="text-blue-600 dark:text-blue-400" size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-blue-900 dark:text-blue-100">Backdated change detected</h3>
                  <p className="text-sm text-blue-800 dark:text-blue-200/70 mt-1">
                    Alex Clark's compensation was changed from $85,000 to $92,000 effective Feb 01, 2026. Calculate retroactive adjustment?
                  </p>
                </div>
              </div>
              <button
                onClick={handleCalculateRetro}
                disabled={loadingRetro}
                className="shrink-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-lg shadow-md transition-all disabled:opacity-50"
              >
                {loadingRetro ? "Calculating..." : "Calculate Retro Pay"}
              </button>
            </div>
          )}

          {retroProcessed && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-8 mb-8 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                 <CheckCircle2 size={32} />
              </div>
              <h3 className="text-2xl font-black text-emerald-900">Retro Pay Processed Successfully</h3>
              <p className="text-emerald-700 mt-2 max-w-lg mb-6">
                The retroactive adjustment of ${retroData ? retroData.totalDifference.toFixed(2) : "1,076.92"} has been added to off-cycle payroll and paystubs will reflect "Retroactive Pay Adjustment".
              </p>
              <button 
                onClick={() => {
                  setRetroProcessed(false);
                  setShowRetroBanner(false);
                }}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors"
               >
                Finish
              </button>
            </div>
          )}

          {!retroProcessed && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calculator size={24} className="text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">No pending retro calculations</h3>
              <p className="text-slate-500">When you edit an employee's compensation and set an effective date in the past, it will appear here for automatic calculation.</p>
            </div>
          )}
        </div>
      )}

      {/* Retro Pay Calculator Modal */}
      {showRetroModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Retroactive Pay Calculator</h2>
                <p className="text-sm text-slate-500">Review discrepancies from backdated compensation updates.</p>
              </div>
            </div>

            <div className="p-6 overflow-y-auto">
               <div className="flex gap-4 mb-8 items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-lg">AC</div>
                  <div>
                    <h3 className="font-bold text-lg">Alex Clark</h3>
                    <p className="text-sm text-slate-500">Effective Date: <span className="font-medium text-slate-800">Feb 01, 2026</span></p>
                  </div>
                  <div className="ml-auto flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Old Rate</p>
                      <p className="font-bold text-slate-800">$85,000</p>
                    </div>
                    <ArrowRight size={14} className="text-slate-300" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-blue-500">New Rate</p>
                      <p className="font-bold text-slate-900">$92,000</p>
                    </div>
                  </div>
               </div>

               <h3 className="font-bold uppercase tracking-widest text-xs text-slate-500 mb-3">Pay Periods Affected</h3>
               
               {retroData && (
                 <div className="border border-slate-200 rounded-xl overflow-hidden mb-4">
                 <table className="w-full text-left text-sm">
                   <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
                     <tr>
                       <th className="px-4 py-3">Pay Period</th>
                       <th className="px-4 py-3 text-right">Old Gross</th>
                       <th className="px-4 py-3 text-right">New Gross</th>
                       <th className="px-4 py-3 text-right text-blue-600">Difference</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                     {retroData.periods.map((p: any, i: number) => (
                       <tr key={i}>
                         <td className="px-4 py-3 font-medium">{p.name}</td>
                         <td className="px-4 py-3 text-right text-slate-500">${p.oldGross.toFixed(2)}</td>
                         <td className="px-4 py-3 text-right font-medium">${p.newGross.toFixed(2)}</td>
                         <td className="px-4 py-3 text-right font-bold text-blue-600">+${p.difference.toFixed(2)}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
                 <div className="bg-slate-50 p-4 border-t border-slate-200 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-500 italic">
                      <span>Total Gross Adjustment:</span>
                      <span>+${retroData.totalDifference.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-red-500">
                      <span>Federal Supplemental (22%):</span>
                      <span>-${retroData.taxes.federal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-red-500">
                      <span>FICA (SS + Med):</span>
                      <span>-${(retroData.taxes.ficaSS + retroData.taxes.ficaMed).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-black text-slate-900 border-t border-slate-200 pt-2 text-sm">
                      <span>Estimated Net Payment:</span>
                      <span className="text-emerald-600">${retroData.netRetroPay.toFixed(2)}</span>
                    </div>
                 </div>
               </div>
               )}

               <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-sm text-amber-800">
                 <AlertCircle className="shrink-0 text-amber-600" size={18} />
                 <p>Standard Federal withholding and FICA taxes will be automatically applied to the difference amount when processed.</p>
               </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-between gap-3">
               <button 
                 onClick={() => setShowRetroModal(false)}
                 className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition-colors"
               >
                 Cancel
               </button>
               <div className="flex gap-3">
                 <button 
                   onClick={() => { setShowRetroModal(false); setRetroProcessed(true); }}
                   className="px-6 py-2.5 bg-white border border-slate-200 text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-sm"
                 >
                   Add to next regular run
                 </button>
                 <button 
                   onClick={() => { setShowRetroModal(false); setRetroProcessed(true); }}
                   className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-md flex items-center gap-2"
                 >
                   <Play size={16} /> Process as off-cycle run
                 </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
