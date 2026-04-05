"use client";
import React, { useState } from "react";
import { Send, Users, DollarSign } from "lucide-react";

export default function ContractorsPage() {
  const [contractors] = useState([
    { id: 1, name: "Alice Design Studio", email: "alice@design.co", type: "1099-NEC", amount: "3500.00" },
    { id: 2, name: "Bob Dev LLC", email: "bob@dev.io", type: "1099-NEC", amount: "0.00" },
    { id: 3, name: "Charlie Content", email: "charlie@writer.net", type: "1099-NEC", amount: "750.00" },
  ]);

  return (
    <div className="flex flex-col gap-6 pb-24">
       <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center"><Users size={20} className="text-orange-600" /></div>
            Pay Contractors
          </h1>
          <p className="text-sm text-slate-500 mt-1 ml-[52px]">Process payments for 1099 contractors via next-day ACH.</p>
        </div>
        <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md flex items-center gap-2">
          <Send size={16} /> Submit $4,250.00
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden mt-4">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 text-xs font-bold text-slate-400 uppercase">
               <th className="px-5 py-4 w-12"><input type="checkbox" className="rounded text-blue-600" defaultChecked/></th>
               <th className="px-5 py-4">Contractor</th>
               <th className="px-5 py-4">Tax Target</th>
               <th className="px-5 py-4 w-60">Payment Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {contractors.map(c => (
              <tr key={c.id}>
                 <td className="px-5 py-4"><input type="checkbox" className="rounded text-blue-600" defaultChecked={Number(c.amount) > 0}/></td>
                 <td className="px-5 py-4">
                   <p className="font-bold">{c.name}</p>
                   <p className="text-xs text-slate-500">{c.email}</p>
                 </td>
                 <td className="px-5 py-4"><span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded font-mono text-xs">{c.type}</span></td>
                 <td className="px-5 py-4">
                   <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-400">$</span>
                      <input type="number" defaultValue={c.amount} className="w-full font-bold text-lg bg-slate-50 dark:bg-slate-800 border-none rounded-lg pl-8 pr-4 py-2 focus:ring-2 focus:ring-blue-500" />
                   </div>
                 </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
