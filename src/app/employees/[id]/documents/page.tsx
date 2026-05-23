"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useEmployee } from "@/hooks/useEmployees";
import { FileText, Download, Trash2, UploadCloud, ShieldCheck, Loader2, AlertCircle, FileDigit, X } from "lucide-react";
import { formatDate } from "@/utils/formatDate";

export default function DocumentsTab() {
  const { id } = useParams();
  const { data: emp, isLoading, error } = useEmployee(id as string);
  const [uploadDrawerOpen, setUploadDrawerOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading document library...</p>
      </div>
    );
  }

  if (error || !emp) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
        <AlertCircle className="text-red-500" size={32} />
        <p className="text-lg font-bold text-slate-800 dark:text-slate-200">Record Not Found</p>
      </div>
    );
  }

  const getDocStatusStyle = (status: string) => {
     switch(status?.toLowerCase()) {
        case 'verified': 
        case 'approved': return "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400";
        case 'pending review': 
        case 'unread': return "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400";
        case 'missing': 
        case 'rejected': return "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400";
        default: return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400";
     }
  }

  const documents = emp.documents || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
      
      {/* Upload & I-9 Status area */}
      <div className="lg:col-span-1 flex flex-col gap-6">
         
         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm overflow-hidden relative">
            <ShieldCheck className="absolute -right-6 -bottom-6 w-32 h-32 text-blue-50 dark:text-blue-900/10 z-0" />
            
            <div className="relative z-10">
               <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">I-9 Compliance</h3>
               <div className="flex flex-col gap-3">
                  {[
                    { label: "Section 1", value: "Complete", tone: "text-emerald-600 dark:text-emerald-400" },
                    { label: "Section 2", value: "Pending Review", tone: "text-amber-600 dark:text-amber-400" },
                    { label: "Re-verify Date", value: emp.startDate ? formatDate(new Date(new Date(emp.startDate).setFullYear(new Date(emp.startDate).getFullYear() + 3))) : "Not scheduled", tone: "text-slate-700 dark:text-slate-300" },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between items-center text-sm border-b border-slate-100 pb-2 last:border-b-0 dark:border-slate-800">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">{row.label}</span>
                      <span className={`font-bold ${row.tone}`}>{row.value}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center text-sm">
                     <span className="text-slate-600 dark:text-slate-400 font-medium">Status</span>
                     <span className="font-bold text-amber-600 dark:text-amber-400">Pending Review</span>
                  </div>
                  <div className="text-[11px] text-slate-500 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-2 rounded border border-slate-100 dark:border-slate-700">
                     Verification documents must be provided within 3 business days of the hire date.
                  </div>
               </div>
               <button className="w-full mt-5 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm">
                  View Federal Requirements
               </button>
            </div>
         </div>

         {/* Fast Upload widget */}
         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Secure Upload</h3>
            <div className="flex flex-col gap-4">
               <select className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="">Select Category...</option>
                  <option value="ID">Identity Verification</option>
                  <option value="TAX">Tax Forms (W-4 / I-9)</option>
                  <option value="PAY">Direct Deposit Setup</option>
                  <option value="EDU">Certifications & Diplomas</option>
               </select>
               <label className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all group">
                  <UploadCloud size={40} className="text-blue-500 group-hover:scale-110 transition-transform" />
                  <div className="text-center">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200 block">Click to upload</span>
                    <span className="text-[11px] text-slate-500">PDF, PNG, JPG up to 10MB</span>
                  </div>
                  <input type="file" className="hidden" />
               </label>
               <button onClick={() => setUploadDrawerOpen(true)} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-all shadow-sm">
                  Open Upload Drawer
               </button>
            </div>
         </div>
      </div>

      {/* Docs Table */}
      <div className="lg:col-span-2">
         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
               <h3 className="text-base font-bold text-slate-900 dark:text-white">Document Repository</h3>
               <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{documents.length} Files</span>
            </div>
            <div className="overflow-x-auto flex-1">
               <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 font-medium text-slate-500 whitespace-nowrap">
                     <tr>
                        <th className="px-6 py-4">File Name</th>
                        <th className="px-6 py-4">Type</th>
                        <th className="px-6 py-4">Added On</th>
                        <th className="px-6 py-4">Expiry</th>
                        <th className="px-6 py-4 text-center">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                     {documents.length > 0 ? documents.map((doc: any) => (
                        <tr key={doc.id} className="hover:bg-slate-100/50 dark:hover:bg-slate-800/30 group transition-colors">
                           <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                 <FileText size={18} className="text-blue-500 flex-shrink-0" />
                                 <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[200px]">{doc.name}</span>
                              </div>
                           </td>
                           <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-medium">{doc.type}</td>
                           <td className="px-6 py-4 text-slate-500 dark:text-slate-500">{formatDate(doc.createdAt)}</td>
                           <td className="px-6 py-4 text-slate-500 dark:text-slate-500">{doc.expiryDate ? formatDate(doc.expiryDate) : "No expiry"}</td>
                           <td className="px-6 py-4">
                              <div className="flex justify-center">
                                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getDocStatusStyle(doc.status)}`}>
                                   {doc.status}
                                </span>
                              </div>
                           </td>
                           <td className="px-6 py-4">
                              <div className="flex items-center justify-end gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors" title="Download">
                                    <Download size={16} />
                                 </button>
                                 <button className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors" title="Delete">
                                    <Trash2 size={16} />
                                 </button>
                              </div>
                           </td>
                        </tr>
                     )) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-20 text-center text-slate-400">
                             <FileDigit size={48} className="mx-auto mb-4 opacity-20" />
                             <p className="text-base font-bold text-slate-900 dark:text-white">Zero Documents Linked</p>
                             <p className="text-sm mt-1">This employee's digital file is currently empty.</p>
                          </td>
                        </tr>
                     )}
                  </tbody>
               </table>
            </div>
         </div>
      </div>

      {uploadDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => setUploadDrawerOpen(false)} />
          <div className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 p-6 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Upload Document</h3>
              <button onClick={() => setUploadDrawerOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 space-y-5 overflow-y-auto p-6">
              <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 p-8 text-center transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/40">
                <UploadCloud size={36} className="mb-3 text-blue-500" />
                <span className="text-sm font-bold text-slate-900 dark:text-white">Drag and drop or click to upload</span>
                <span className="mt-1 text-xs text-slate-500">PDF, PNG, JPG up to 10MB</span>
                <input type="file" className="hidden" />
              </label>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
                <select className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800">
                  <option>I-9 / Work Authorization</option>
                  <option>Tax Forms</option>
                  <option>Direct Deposit</option>
                  <option>Policy Acknowledgement</option>
                  <option>Certification</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Expiry Date</label>
                <input type="date" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
              </div>
            </div>
            <div className="border-t border-slate-200 p-6 dark:border-slate-800">
              <button onClick={() => setUploadDrawerOpen(false)} className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-bold text-white hover:bg-blue-700">
                Store Document
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
