"use client";
import React from "react";
import { Download, Search, FileText } from "lucide-react";
import Link from "next/link";

export default function PaystubsPage({ params }: { params: { runId: string } }) {
  const stubs = [
    { name: "Jordan Brown", net: "$3,267.50", status: "Available" },
    { name: "Taylor Smith", net: "$4,102.10", status: "Available" },
    { name: "Alex Clark", net: "$2,890.00", status: "Available" },
  ];

  return (
    <div className="flex flex-col gap-6 pb-24">
       <div className="flex items-center justify-between">
        <div>
          <Link href={`/payroll/run/${params.runId}`} className="text-sm text-blue-600 font-bold mb-2 inline-block hover:underline">← Back to Run Details</Link>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center"><FileText size={20} className="text-indigo-600" /></div>
            Paystubs
          </h1>
          <p className="text-sm text-slate-500 mt-1 ml-[52px]">View and download paystubs for this run.</p>
        </div>
        <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md flex items-center gap-2">
          <Download size={16} /> Download All (ZIP)
        </button>
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
               <button className="w-full py-2 bg-slate-50 text-slate-700 font-semibold text-sm rounded-lg border border-slate-200 group-hover:bg-blue-50 group-hover:border-blue-200 group-hover:text-blue-700 transition-colors flex justify-center items-center gap-2">
                 <Download size={14} /> Download PDF
               </button>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
}
