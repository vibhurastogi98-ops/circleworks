import React from "react";
import { Download, FileText, CheckCircle2, Building2 } from "lucide-react";
import Link from "next/link";

export default async function RunDetailPage({ params }: { params: { runId: string } }) {
  const { runId } = await params;
  return (
    <div className="flex flex-col gap-6 pb-24">
       <div className="flex items-center justify-between">
        <div>
          <Link href="/payroll/history" className="text-sm text-blue-600 font-bold mb-2 inline-block hover:underline">← Back to History</Link>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center"><CheckCircle2 size={20} className="text-emerald-600" /></div>
            Run Detail: {runId.toUpperCase()}
          </h1>
          <p className="text-sm text-slate-500 mt-1 ml-[52px]">Processed on Apr 5, 2026. All transfers successful.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/payroll/run/${runId}/paystubs`} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl shadow-sm flex items-center gap-2 hover:bg-slate-50">
            <FileText size={16} /> View Paystubs
          </Link>
          <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md flex items-center gap-2">
            <Download size={16} /> Download Journal Entry (CSV)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6 mt-4">
         <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm col-span-1">
           <p className="text-xs font-bold text-slate-400 uppercase">Debited Amount</p>
           <p className="text-3xl font-extrabold mt-1">$278,420.00</p>
           <div className="mt-6 pt-4 border-t border-slate-100 space-y-2 text-sm">
             <div className="flex justify-between"><span className="text-slate-500">Gross</span><span className="font-bold">$230,000</span></div>
             <div className="flex justify-between"><span className="text-slate-500">Employer Taxes</span><span className="font-bold">$18,420</span></div>
             <div className="flex justify-between"><span className="text-slate-500">Benefits</span><span className="font-bold">$30,000</span></div>
           </div>
         </div>
         <div className="col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50"><h3 className="font-bold flex items-center gap-2"><Building2 size={16}/> Tax Liability Breakdown</h3></div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-100">
                  <th className="text-left px-4 py-2 font-semibold">Agency</th>
                  <th className="text-left px-4 py-2 font-semibold">Type</th>
                  <th className="text-right px-4 py-2 font-semibold">Amount</th>
                  <th className="text-center px-4 py-2 font-semibold">Payment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr><td className="px-4 py-3 font-bold">IRS</td><td className="px-4 py-3 text-slate-600">Federal IT</td><td className="px-4 py-3 text-right font-mono">$42,100.00</td><td className="px-4 py-3 text-center"><span className="text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded">Paid via EFTPS</span></td></tr>
                <tr><td className="px-4 py-3 font-bold">IRS</td><td className="px-4 py-3 text-slate-600">FICA (SS & Med)</td><td className="px-4 py-3 text-right font-mono">$38,500.00</td><td className="px-4 py-3 text-center"><span className="text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded">Paid via EFTPS</span></td></tr>
                <tr><td className="px-4 py-3 font-bold">CA EDD</td><td className="px-4 py-3 text-slate-600">State IT (CA)</td><td className="px-4 py-3 text-right font-mono">$15,200.00</td><td className="px-4 py-3 text-center"><span className="text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded">Paid via EDD e-Services</span></td></tr>
              </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
