"use client";

import React, { useMemo } from "react";
import { useParams } from "next/navigation";
import { getEmployeeById } from "@/data/mockEmployees";
import { FileText, Download, Trash2, UploadCloud, ShieldCheck } from "lucide-react";

export default function DocumentsTab() {
  const { id } = useParams();
  const emp = useMemo(() => getEmployeeById(id as string), [id]);

  if (!emp) return null;

  const getDocStatusStyle = (status: string) => {
     switch(status) {
        case 'Verified': return "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400";
        case 'Pending Review': return "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400";
        case 'Missing': return "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400";
        default: return "bg-slate-100 text-slate-700";
     }
  }

  // Mock list of docs
  const docs = [
     { id: 1, name: "I-9 Form", type: "Compliance", date: emp.startDate, expiry: null, status: "Verified" },
     { id: 2, name: "W-4 Form", type: "Tax", date: emp.startDate, expiry: null, status: "Verified" },
     { id: 3, name: "Offer Letter", type: "HR", date: emp.startDate, expiry: null, status: "Verified" },
     { id: 4, name: "Direct Deposit Auth", type: "Payroll", date: emp.startDate, expiry: null, status: "Verified" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
      
      {/* Upload & I-9 Status area */}
      <div className="lg:col-span-1 flex flex-col gap-6">
         
         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm overflow-hidden relative">
            {/* Subdued background pattern */}
            <ShieldCheck className="absolute -right-6 -bottom-6 w-32 h-32 text-blue-50 dark:text-blue-900/10 z-0" />
            
            <div className="relative z-10">
               <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">I-9 Compliance</h3>
               <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center text-sm">
                     <span className="text-slate-600 dark:text-slate-400">Section 1 (Employee)</span>
                     <span className="font-bold text-green-600">Completed</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                     <span className="text-slate-600 dark:text-slate-400">Section 2 (Employer)</span>
                     <span className="font-bold text-green-600">Completed</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-t border-slate-100 dark:border-slate-800 pt-3 mt-1">
                     <span className="text-slate-600 dark:text-slate-400">Re-verify Date</span>
                     <span className="font-medium text-slate-900 dark:text-white">N/A</span>
                  </div>
               </div>
               <button className="w-full mt-5 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  View I-9 Record
               </button>
            </div>
         </div>

         {/* Fast Upload widget */}
         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Upload Document</h3>
            <div className="flex flex-col gap-4">
               <select className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500">
                  <option value="">Select Document Type...</option>
                  <option value="ID">Identification</option>
                  <option value="CERT">Certification</option>
                  <option value="TAX">Tax Form</option>
                  <option value="OTHER">Other</option>
               </select>
               <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <UploadCloud size={32} className="text-blue-500" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Browse or drag files</span>
                  <input type="file" className="hidden" />
               </label>
               <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
                  Upload to Profile
               </button>
            </div>
         </div>
      </div>

      {/* Docs Table */}
      <div className="lg:col-span-2">
         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
               <h3 className="text-base font-bold text-slate-900 dark:text-white">Employee Documents</h3>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 font-medium text-slate-500">
                     <tr>
                        <th className="px-6 py-3 whitespace-nowrap">Document Name</th>
                        <th className="px-6 py-3 whitespace-nowrap">Category</th>
                        <th className="px-6 py-3 whitespace-nowrap">Date Added</th>
                        <th className="px-6 py-3 whitespace-nowrap">Status</th>
                        <th className="px-6 py-3 whitespace-nowrap text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                     {docs.map(doc => (
                        <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 group">
                           <td className="px-6 py-3">
                              <div className="flex items-center gap-3">
                                 <FileText size={16} className="text-blue-500 flex-shrink-0" />
                                 <span className="font-medium text-slate-900 dark:text-white capitalize group-hover:text-blue-600 transition-colors cursor-pointer">{doc.name}</span>
                              </div>
                           </td>
                           <td className="px-6 py-3 text-slate-600 dark:text-slate-400">{doc.type}</td>
                           <td className="px-6 py-3 text-slate-600 dark:text-slate-400">{new Date(doc.date).toLocaleDateString()}</td>
                           <td className="px-6 py-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getDocStatusStyle(doc.status)}`}>
                                 {doc.status}
                              </span>
                           </td>
                           <td className="px-6 py-3">
                              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 bg-white rounded shadow-sm border border-slate-200" title="Download">
                                    <Download size={14} />
                                 </button>
                                 <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 bg-white rounded shadow-sm border border-slate-200" title="Delete">
                                    <Trash2 size={14} />
                                 </button>
                              </div>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      </div>

    </div>
  );
}
