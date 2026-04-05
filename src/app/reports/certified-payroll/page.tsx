"use client";
import React, { useState, useEffect } from "react";
import { Shield, ArrowRight, FileText, CheckCircle2, ChevronLeft, Download, AlertTriangle, Play, Save } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function CertifiedPayrollPage() {
  const [step, setStep] = useState(1);

  // Setup Form State
  const [setup, setSetup] = useState({
    contractName: "Federal Courthouse HQ Renovations",
    contractNumber: "DOJ-FX-9921",
    agency: "Department of Justice",
    address: "123 Justice Ave, Washington DC",
    weekEnding: "2026-04-12",
    payrollNo: 3
  });

  // Trackers State
  const [workers, setWorkers] = useState([
     { id: 1, name: "Maria Santos", classification: "Electrician", hours: [8,8,8,8,0,0,0], rate: 45.00 },
     { id: 2, name: "David Martinez", classification: "Carpenter", hours: [8,8,8,8,8,0,0], rate: 40.00 },
     { id: 3, name: "John Doe", classification: "Laborer", hours: [10,10,10,10,0,0,0], rate: 22.00 }, // Underpaid according to our mock (which requires 25.00)
  ]);

  const [validatedWorkers, setValidatedWorkers] = useState<any[]>([]);
  const [hasViolations, setHasViolations] = useState<boolean>(false);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/reports/certified-payroll").then(res => res.json()).then(data => setHistory(data.history));
  }, []);

  const runValidation = async () => {
    try {
      const payload = { contractName: setup.contractName, weekEnding: setup.weekEnding, workers: workers.map(w => ({ ...w, hourlyRate: w.rate })) };
      const res = await fetch("/api/reports/certified-payroll/generate-wh347", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setValidatedWorkers(data.validatedWorkers || []);
      setHasViolations(data.hasViolations || false);
      if (data.hasViolations) {
        toast.error("Prevailing Wage Violation Detected!");
      } else {
        toast.success("All wages meet DOL Davis-Bacon standards.");
      }
      setStep(3);
    } catch (e) {
      console.error(e);
    }
  };

  const calculateTotalHours = (hoursArray: number[]) => hoursArray.reduce((sum, val) => sum + val, 0);

  return (
    <div className="max-w-7xl mx-auto pb-24 animate-in fade-in">
       {/* Header */}
       <div className="flex items-center justify-between mb-8 print:hidden">
         <div className="flex items-center gap-4">
           <Link href="/reports" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
             <ChevronLeft size={18} />
           </Link>
           <div>
             <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
               <Shield size={28} className="text-blue-600" />
               Certified Payroll (WH-347)
             </h1>
             <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Davis-Bacon prevailing wage compliance generator.</p>
           </div>
         </div>
       </div>

       {/* Step Indicator */}
       <div className="flex items-center gap-4 mb-8 print:hidden">
          {[1,2,3].map(num => (
            <div key={num} className="flex items-center gap-2">
               <div className={`w-8 h-8 rounded-full flex justify-center items-center font-bold text-sm transition-colors ${
                 step >= num ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
               }`}>
                 {num}
               </div>
               <span className={`text-sm font-bold ${step >= num ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                 {num === 1 && "Setup Project"}
                 {num === 2 && "Prevailing Wages"}
                 {num === 3 && "Generate & E-Sign"}
               </span>
               {num !== 3 && <div className="w-8 border-t-2 border-slate-200 mx-2" />}
            </div>
          ))}
       </div>

       {/* STEP 1: SETUP FORM */}
       {step === 1 && (
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm">
               <h3 className="text-xl font-bold mb-6 border-b border-slate-100 pb-2">Contract Details</h3>
               <div className="grid grid-cols-2 gap-6">
                 <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Contract Name</label>
                   <input value={setup.contractName} onChange={e => setSetup({...setup, contractName: e.target.value})} className="w-full border-slate-200 rounded-lg px-4 py-2 font-medium bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none" />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Contract No.</label>
                   <input value={setup.contractNumber} onChange={e => setSetup({...setup, contractNumber: e.target.value})} className="w-full border-slate-200 rounded-lg px-4 py-2 font-medium bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none" />
                 </div>
                 <div className="col-span-2">
                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Contracting Agency / Project Location</label>
                   <div className="flex gap-2">
                     <input value={setup.agency} onChange={e => setSetup({...setup, agency: e.target.value})} className="flex-1 border-slate-200 rounded-lg px-4 py-2 font-medium bg-slate-50 outline-none" />
                     <input value={setup.address} onChange={e => setSetup({...setup, address: e.target.value})} className="flex-1 border-slate-200 rounded-lg px-4 py-2 font-medium bg-slate-50 outline-none" />
                   </div>
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Week Ending Date</label>
                   <input type="date" value={setup.weekEnding} onChange={e => setSetup({...setup, weekEnding: e.target.value})} className="w-full border-slate-200 rounded-lg px-4 py-2 font-medium bg-slate-50 outline-none" />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Payroll Number</label>
                   <div className="flex items-center px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-lg border border-slate-200">
                     #{setup.payrollNo} (Auto-incremented)
                   </div>
                 </div>
               </div>
               
               <div className="mt-8 flex justify-end">
                 <button onClick={() => setStep(2)} className="bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-transform hover:scale-105">
                    Continue to Prevailing Wages <ArrowRight size={18} />
                 </button>
               </div>
            </div>

            <div className="md:col-span-1 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6">
               <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"><FileText size={16}/> Report History Ledger</h3>
               <div className="space-y-3">
                 {history.map(item => (
                   <div key={item.id} className="bg-white border border-slate-200 p-3 rounded-lg shadow-sm">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold text-slate-700">{item.contract}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${item.status === 'Submitted' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                          {item.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">Week Ending: <span className="font-medium text-slate-700">{new Date(item.weekEnding).toLocaleDateString()}</span></p>
                      <p className="text-xs text-slate-500">Payroll #{item.payrollNo}</p>
                   </div>
                 ))}
               </div>
            </div>
         </div>
       )}

       {/* STEP 2: PREVAILING WAGES TRACKER */}
       {step === 2 && (
         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm animate-in slide-in-from-bottom-4">
           <div className="p-6 border-b border-slate-100 bg-slate-50 dark:bg-slate-800/50">
             <h3 className="text-xl font-bold flex items-center justify-between">
               Review Worker Classifications & Output
               <button onClick={runValidation} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm rounded-lg font-bold shadow-md flex items-center gap-2">
                  <Play size={16} /> Validate & Generate Form
               </button>
             </h3>
             <p className="text-sm text-slate-500 mt-1">Ensure hourly rates clear the DOL Davis-Bacon schedules for the mapped classifications.</p>
           </div>
           <div className="overflow-x-auto">
             <table className="w-full text-left text-sm">
               <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs uppercase tracking-wider">
                 <tr>
                   <th className="px-4 py-3">Worker Name</th>
                   <th className="px-4 py-3">Work Classification</th>
                   <th className="px-4 py-3 text-center">M</th>
                   <th className="px-4 py-3 text-center">T</th>
                   <th className="px-4 py-3 text-center">W</th>
                   <th className="px-4 py-3 text-center">Th</th>
                   <th className="px-4 py-3 text-center">F</th>
                   <th className="px-4 py-3 text-center">S</th>
                   <th className="px-4 py-3 text-center">Su</th>
                   <th className="px-4 py-3 text-center">Total Hrs</th>
                   <th className="px-4 py-3 text-right">Hourly Rate</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {workers.map((w, idx) => (
                    <tr key={w.id} className="hover:bg-slate-50">
                       <td className="px-4 py-3 font-medium">{w.name}</td>
                       <td className="px-4 py-3">
                         <select 
                           value={w.classification} 
                           onChange={(e) => {
                             const newWorkers = [...workers];
                             newWorkers[idx].classification = e.target.value;
                             setWorkers(newWorkers);
                           }}
                           className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs"
                         >
                           <option>Electrician</option>
                           <option>Carpenter</option>
                           <option>Laborer</option>
                           <option>Plumber</option>
                         </select>
                       </td>
                       {w.hours.map((h, dIdx) => (
                         <td key={dIdx} className="px-2 py-3 text-center">
                           <input 
                             value={h || ""} 
                             onChange={(e) => {
                               const newWorkers = [...workers];
                               newWorkers[idx].hours[dIdx] = Number(e.target.value);
                               setWorkers(newWorkers);
                             }}
                             className="w-8 text-center text-xs bg-slate-50 border border-slate-200 rounded" 
                           />
                         </td>
                       ))}
                       <td className="px-4 py-3 text-center font-bold text-slate-700">{calculateTotalHours(w.hours)}</td>
                       <td className="px-4 py-3 text-right">
                         <input 
                           type="number"
                           value={w.rate}
                           onChange={(e) => {
                             const newWorkers = [...workers];
                             newWorkers[idx].rate = Number(e.target.value);
                             setWorkers(newWorkers);
                           }}
                           className="w-20 text-right bg-slate-50 border border-slate-200 rounded px-2 py-1 flex ml-auto font-mono text-sm"
                         />
                       </td>
                    </tr>
                  ))}
               </tbody>
             </table>
           </div>
         </div>
       )}

       {/* STEP 3: GENERATION & E-SIGN */}
       {step === 3 && (
         <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6">
            
            {hasViolations && (
              <div className="bg-red-50 border-2 border-red-200 p-4 rounded-xl flex items-start gap-4 print:hidden">
                <AlertTriangle className="text-red-500 shrink-0 mt-1" size={24} />
                <div>
                  <h3 className="text-red-900 font-bold text-lg">DOL Compliance Warning</h3>
                  <p className="text-red-800 text-sm mt-1 mb-3">One or more employees are reporting an hourly rate beneath the Davis-Bacon minimum prevailing thresholds. You must correct this to legally certify the WH-347 form.</p>
                  <table className="text-xs w-full text-left bg-white rounded overflow-hidden max-w-2xl border border-red-100">
                     <thead className="bg-red-100 text-red-900">
                        <tr><th className="px-2 py-1">Worker</th><th className="px-2 py-1">Classification</th><th className="px-2 py-1">Current Rate</th><th className="px-2 py-1">Required Minimum</th></tr>
                     </thead>
                     <tbody className="divide-y divide-red-100">
                        {validatedWorkers.filter(w => w.isUnderpaid).map(w => (
                          <tr key={w.id}>
                            <td className="px-2 py-2 font-bold text-slate-800">{w.name}</td>
                            <td className="px-2 py-2 text-slate-600">{w.classification}</td>
                            <td className="px-2 py-2 text-red-600 font-black">${w.rate.toFixed(2)}</td>
                            <td className="px-2 py-2 text-emerald-700 font-medium">${w.minimumRequired.toFixed(2)}</td>
                          </tr>
                        ))}
                     </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 print:hidden">
               <button onClick={() => setStep(2)} className="px-4 py-2 border border-slate-200 text-slate-600 font-bold text-sm bg-white rounded-lg shadow-sm hover:bg-slate-50">Back to Edit</button>
               <button 
                 onClick={() => window.print()}
                 className="px-4 py-2 border border-blue-200 text-blue-600 font-bold text-sm bg-blue-50 rounded-lg shadow-sm hover:bg-blue-100 flex items-center gap-2"
               >
                 <Download size={16} /> Print to PDF
               </button>
               <button 
                 disabled={hasViolations}
                 className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 <CheckCircle2 size={16} /> Certify & Lock Form
               </button>
            </div>

            {/* MOCK WH-347 FORM (CSS Native Rendering for PDF) */}
            <div className="bg-white border-2 border-slate-900 p-8 pt-12 min-h-[1056px] shadow-2xl overflow-hidden print:w-full print:border-none print:shadow-none print:p-0 relative font-serif">
                <div className="absolute top-4 right-8 border border-black p-1 text-[10px] text-center w-48 font-sans uppercase font-bold">
                   OMB No. 1235-0008<br/>Expires: 04/30/2026
                </div>

                <div className="text-center mb-8">
                   <h2 className="text-2xl font-bold uppercase tracking-widest border-b-2 border-black inline-block pb-1">U.S. Department of Labor</h2>
                   <h3 className="text-lg font-bold uppercase mt-2">Wage and Hour Division</h3>
                   <div className="mt-4 flex justify-between px-12 font-sans text-sm tracking-wide">
                     <span>PAYROLL NO.: <span className="underline font-bold decoration-dotted">{setup.payrollNo}</span></span>
                     <span>FOR WEEK ENDING: <span className="underline font-bold decoration-dotted">{setup.weekEnding}</span></span>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 text-sm font-sans">
                   <div className="border border-black p-2 min-h-16">
                     <span className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Contractor or Subcontractor</span>
                     <span className="font-bold">CircleWorks Inc.</span>
                   </div>
                   <div className="border border-black p-2 flex flex-col justify-between">
                     <span className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Project and Location</span>
                     <span className="font-bold">{setup.contractName}</span>
                     <span className="font-bold">{setup.address}</span>
                   </div>
                   <div className="col-span-2 border border-black p-2 flex justify-between items-end">
                     <div>
                       <span className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Project or Contract No.</span>
                       <span className="font-bold">{setup.contractNumber}</span>
                     </div>
                     <span className="font-bold text-slate-600 block pr-8">{setup.agency}</span>
                   </div>
                </div>

                <table className="w-full text-[10px] font-sans border-collapse border border-black text-center mt-8">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border border-black p-1 w-32">Name & ID Number of Worker</th>
                      <th className="border border-black p-1 w-8">No. of Exceptions</th>
                      <th className="border border-black p-1 w-24">Work Classification</th>
                      <th className="border border-black p-1">Hours by Day</th>
                      <th className="border border-black p-1 w-12">Total Hours</th>
                      <th className="border border-black p-1 w-16">Rate of Pay</th>
                      <th className="border border-black p-1">Gross Earned</th>
                    </tr>
                  </thead>
                  <tbody>
                    {validatedWorkers.map(w => (
                      <tr key={w.id} className={w.isUnderpaid ? "bg-red-50 text-red-900" : ""}>
                         <td className="border border-black p-2 font-bold text-left bg-white">
                           {w.name}<br/>
                           <span className="text-[9px] font-mono font-medium text-slate-500">xxx-xx-{Math.floor(1000 + Math.random()*9000)}</span>
                         </td>
                         <td className="border border-black p-1">0</td>
                         <td className="border border-black p-1 uppercase">{w.classification}</td>
                         <td className="border border-black p-0">
                            <table className="w-full h-full">
                              <tbody>
                                <tr className="text-[8px] bg-slate-50 border-b border-black"><td>M</td><td>T</td><td>W</td><td>Th</td><td>F</td><td>S</td><td>Su</td></tr>
                                <tr>
                                  {w.hours.map((h:any, i:any) => <td key={i} className="border-r border-black last:border-r-0 py-1">{h || '-'}</td>)}
                                </tr>
                              </tbody>
                            </table>
                         </td>
                         <td className="border border-black p-1 font-bold">{calculateTotalHours(w.hours)}</td>
                         <td className={`border border-black p-1 font-mono ${w.isUnderpaid ? 'text-red-600 font-bold' : ''}`}>${w.rate.toFixed(2)}</td>
                         <td className="border border-black p-1 font-mono">${(calculateTotalHours(w.hours) * w.rate).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* STATEMENT OF COMPLIANCE */}
                <div className="mt-12 break-inside-avoid relative">
                   <h3 className="font-bold uppercase text-base text-center border-b border-black pb-2 mb-4">Statement of Compliance</h3>
                   <p className="text-xs leading-relaxed text-left text-justify indent-8 px-4">
                     Date: <span className="underline font-bold decoration-dotted">{new Date().toLocaleDateString()}</span>. I, <span className="underline font-bold decoration-dotted">Alex HR Admin</span> do hereby state:
                   </p>
                   <ol className="list-decimal pl-12 text-[10px] mt-4 space-y-3 pr-4 text-justify leading-relaxed">
                     <li>That I pay or supervise the payment of the persons employed by the contractor or subcontractor on the designated project. That during the payroll period commencing on the highlighted dates, all persons employed on said project have been paid the full weekly wages earned, that no rebates have been or will be made either directly or indirectly.</li>
                     <li>That any payrolls otherwise under this contract required to be submitted for the above period are correct and complete; that the wage rates for laborers or mechanics contained therein are not less than the applicable wage rates contained in any wage determination incorporated into the contract; that the classifications set forth therein for each laborer or mechanic conform with the work he performed.</li>
                     <li>That any apprentices employed in the above period are duly registered in a bona fide apprenticeship program registered with a State apprenticeship agency recognized by the Bureau of Apprenticeship and Training, U.S. Department of Labor.</li>
                   </ol>
                   
                   <div className="grid grid-cols-2 mt-12 px-8 gap-12 font-sans">
                      <div className="border-t border-black pt-1">
                        <p className="text-[10px] font-bold uppercase">Name and Title</p>
                        <p className="text-sm font-serif italic text-slate-700 mt-2">Alex Admin - HR Director</p>
                      </div>
                      <div className="border-t border-black pt-1">
                        <p className="text-[10px] font-bold uppercase">Signature</p>
                        {hasViolations ? (
                          <p className="text-xs font-bold text-red-500 mt-4 tracking-widest uppercase">Signature Blocked: Compliance Error</p>
                        ) : (
                          <p className="text-xl font-signature font-black text-blue-800 mt-2 italic opacity-80" style={{fontFamily: "'Brush Script MT', cursive"}}>Alex Admin (e-Signed)</p>
                        )}
                      </div>
                   </div>
                </div>

            </div>
         </div>
       )}
    </div>
  );
}
