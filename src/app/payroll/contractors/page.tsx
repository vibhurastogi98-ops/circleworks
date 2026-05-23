"use client";
import React, { useState, useMemo } from "react";
import { Send, Users, DollarSign } from "lucide-react";

export default function ContractorsPage() {
  const [contractors, setContractors] = useState([
    { id: 1, name: "Alice Design Studio", email: "alice@design.co", type: "1099-NEC", mode: "one-time", amount: "3500.00", hours: "0", rate: "0", selected: true },
    { id: 2, name: "Bob Dev LLC", email: "bob@dev.io", type: "1099-NEC", mode: "hours-rate", amount: "0.00", hours: "42", rate: "95", selected: false },
    { id: 3, name: "Charlie Content", email: "charlie@writer.net", type: "1099-NEC", mode: "one-time", amount: "750.00", hours: "0", rate: "0", selected: true },
  ]);

  const toggleSelection = (id: number) => {
    setContractors(prev => prev.map(c => c.id === id ? { ...c, selected: !c.selected } : c));
  };
  
  const updateAmount = (id: number, val: string) => {
    setContractors(prev => prev.map(c => c.id === id ? { ...c, amount: val, selected: Number(val) > 0 } : c));
  };

  const updateHoursRate = (id: number, field: "hours" | "rate", val: string) => {
    setContractors(prev => prev.map(c => {
      if (c.id !== id) return c;
      const next = { ...c, [field]: val };
      const amount = Number(next.hours) * Number(next.rate);
      return { ...next, amount: amount.toFixed(2), selected: amount > 0 };
    }));
  };
  
  const totalAmount = useMemo(() => {
    return contractors.filter(c => c.selected).reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  }, [contractors]);

  const fmtTotal = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(totalAmount);

  return (
    <div className="flex flex-col gap-6 pb-24 text-slate-900 dark:text-slate-100">
       <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center"><Users size={20} className="text-orange-600" /></div>
            Pay Contractors
          </h1>
          <p className="text-sm text-slate-500 mt-1 ml-[52px]">Process payments for 1099 contractors via next-day ACH.</p>
        </div>
        <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md flex items-center gap-2 transition-colors">
          <Send size={16} /> Submit {fmtTotal}
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden mt-4">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 text-xs font-bold text-slate-500 uppercase">
               <th className="px-5 py-4 w-12"><input type="checkbox" className="rounded text-blue-600" defaultChecked/></th>
               <th className="px-5 py-4">Contractor</th>
               <th className="px-5 py-4">Tax Target</th>
               <th className="px-5 py-4">Payment Method</th>
               <th className="px-5 py-4 w-72">Payment Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {contractors.map(c => (
              <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                 <td className="px-5 py-4">
                   <input 
                     type="checkbox" 
                     className="rounded text-blue-600" 
                     checked={c.selected}
                     onChange={() => toggleSelection(c.id)}
                   />
                 </td>
                 <td className="px-5 py-4">
                   <p className="font-bold text-slate-900 dark:text-white">{c.name}</p>
                   <p className="text-xs text-slate-500">{c.email}</p>
                 </td>
                 <td className="px-5 py-4">
                   <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md font-mono text-xs font-semibold">{c.type}</span>
                 </td>
                 <td className="px-5 py-4">
                   <select
                     value={c.mode}
                     onChange={(event) => setContractors(prev => prev.map(item => item.id === c.id ? { ...item, mode: event.target.value } : item))}
                     className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold dark:border-slate-700 dark:bg-slate-800"
                   >
                     <option value="one-time">One-time amount</option>
                     <option value="hours-rate">Hours x rate</option>
                   </select>
                 </td>
                 <td className="px-5 py-4">
                   {c.mode === "hours-rate" ? (
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        value={c.hours}
                        onChange={(e) => updateHoursRate(c.id, "hours", e.target.value)}
                        className="w-full rounded-lg bg-slate-50 px-3 py-2 font-bold dark:bg-slate-800"
                        aria-label={`${c.name} hours`}
                      />
                      <input
                        type="number"
                        value={c.rate}
                        onChange={(e) => updateHoursRate(c.id, "rate", e.target.value)}
                        className="w-full rounded-lg bg-slate-50 px-3 py-2 font-bold dark:bg-slate-800"
                        aria-label={`${c.name} rate`}
                      />
                      <span className="col-span-2 text-xs font-bold text-slate-500">{Number(c.hours) || 0}h x ${Number(c.rate) || 0}/hr = ${Number(c.amount).toFixed(2)}</span>
                    </div>
                   ) : (
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-500 font-bold">$</span>
                      <input 
                        type="number" 
                        value={c.amount} 
                        onChange={(e) => updateAmount(c.id, e.target.value)}
                        className="w-full font-bold text-lg bg-slate-50 dark:bg-slate-800 border-none rounded-lg pl-8 pr-4 py-2 focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white" 
                      />
                    </div>
                   )}
                 </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
