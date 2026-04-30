"use client";
import React from "react";
import { Download, Search, FileText, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

function PaystubDownloadButton({ type = "PDF" }: { type?: "PDF" | "ZIP" }) {
  const [downloading, setDownloading] = useState(false);
  const isZip = type === "ZIP";
  
  return (
    <button 
      onClick={() => { setDownloading(true); setTimeout(() => setDownloading(false), 1500); }} 
      disabled={downloading}
      className={
        isZip 
          ? "px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
          : "w-full py-2 bg-slate-50 text-slate-700 font-semibold text-sm rounded-lg border border-slate-200 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
      }
    >
      {downloading ? <Loader2 size={isZip ? 16 : 14} className="animate-spin" /> : <Download size={isZip ? 16 : 14} />} 
      {downloading ? `Generating ${type}...` : `Download ${isZip ? "All (ZIP)" : "PDF"}`}
    </button>
  );
}

export default function PaystubsPage({ params }: { params: Promise<{ runId: string }> }) {
  const { runId } = React.use(params);
  const stubs = [
    {
      name: "Jordan Brown",
      net: "$3,417.49",
      status: "Available",
      reimbursements: [{ description: "WFH Equipment - March 2026", amount: "$149.99" }],
    },
    {
      name: "Taylor Smith",
      net: "$4,314.50",
      status: "Available",
      reimbursements: [{ description: "Field Visit Travel Reimbursement", amount: "$212.40" }],
    },
    { name: "Alex Clark", net: "$2,890.00", status: "Available", reimbursements: [] },
  ];

  return (
    <div className="flex flex-col gap-6 pb-24">
       <div className="flex items-center justify-between">
        <div>
          <Link href={`/payroll/run/${runId}`} className="text-sm text-blue-600 font-bold mb-2 inline-block hover:underline">← Back to Run Details</Link>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center"><FileText size={20} className="text-indigo-600" /></div>
            Paystubs
          </h1>
          <p className="text-sm text-slate-500 mt-1 ml-[52px]">View and download paystubs for this run.</p>
        </div>
        <PaystubDownloadButton type="ZIP" />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 shadow-sm p-6 mt-4">
        <div className="relative mb-6 max-w-sm">
           <Search className="absolute left-3 top-3 text-slate-400" size={18}/>
           <input type="text" placeholder="Search employees..." className="w-full pl-10 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stubs.map(s => (
             <div key={s.name} className="flex flex-col gap-4 p-4 border border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all group">
               <div className="flex justify-between items-start">
                 <div>
                   <h3 className="font-bold">{s.name}</h3>
                   <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold uppercase">{s.status}</span>
                 </div>
                 <div className="text-right">
                   <p className="text-xs text-slate-500 font-bold uppercase">Net Pay</p>
                   <p className="font-extrabold text-slate-900">{s.net}</p>
                 </div>
               </div>
               {s.reimbursements.length > 0 && (
                <div className="rounded-lg border border-cyan-100 bg-cyan-50/60 px-3 py-2 text-xs dark:border-cyan-900/40 dark:bg-cyan-950/20">
                  <p className="font-bold text-cyan-800 dark:text-cyan-200 mb-1">Expense Reimbursements</p>
                  {s.reimbursements.map((line) => (
                    <div key={line.description} className="flex items-center justify-between text-cyan-900 dark:text-cyan-100">
                      <span>{line.description}</span>
                      <span className="font-bold">{line.amount}</span>
                    </div>
                  ))}
                </div>
               )}
               <PaystubDownloadButton type="PDF" />
             </div>
          ))}
        </div>
      </div>
    </div>
  );
}
