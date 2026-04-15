"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, Search, Filter, FileText, CheckCircle2, XCircle, Clock, RefreshCw, X } from "lucide-react";
import { mockAtsCandidates } from "@/data/mockAts";
import { formatDate } from "@/utils/formatDate";
import { HireCandidateModal } from "@/components/hiring/HireCandidateModal";

export default function OffersDirectory() {
  const [filter, setFilter] = useState("All");
  const [hireModalOpen, setHireModalOpen] = useState(false);
  const [selectedHireData, setSelectedHireData] = useState<any>(null);

  // Mock offers by mapping candidates in Offer/Hired stage
  const offers = mockAtsCandidates
     .filter(c => c.stage === 'Offer' || c.stage === 'Hired' || c.stage === 'Withdrawn')
     .map(c => ({
        id: `off-${c.id}`,
        candidateId: c.id,
        candidateName: `${c.firstName} ${c.lastName}`,
        firstName: c.firstName,
        lastName: c.lastName,
        email: c.email,
        phone: "+1 (555) 000-0000", // Hardcoded for mock
        jobTitle: c.jobId === 'job-1' ? 'Senior Frontend Engineer' : 'Product Manager',
        salary: 145000,
        status: c.stage === 'Hired' ? 'Accepted' : c.stage === 'Withdrawn' ? 'Declined' : 'Pending',
        sentAt: c.appliedDate,
        expiresAt: new Date(new Date(c.appliedDate).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
     }));

  const handleOpenHireModal = (offer: any) => {
    setSelectedHireData({
      candidate: {
        id: offer.candidateId,
        firstName: offer.firstName,
        lastName: offer.lastName,
        email: offer.email,
        phone: offer.phone,
      },
      offer: {
        id: offer.id.replace('off-', ''), // Assume DB ID is numeric if it existed
        salary: offer.salary,
        startDate: new Date().toISOString().split('T')[0], // Mock start date
        title: offer.jobTitle,
      }
    });
    setHireModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Offer Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Track and manage all extended job offers.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/hiring/offers/new" className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
            <Plus size={16} /> Create Offer
          </Link>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
         <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            {['All', 'Pending', 'Accepted', 'Declined'].map(f => (
               <button 
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === f ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}
               >
                  {f}
               </button>
            ))}
         </div>

         <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
               <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
               <input 
                  type="text" 
                  placeholder="Search offers..." 
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
               />
            </div>
         </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col">
         <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
               <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium tracking-wide">
                  <tr>
                     <th className="px-6 py-4">Candidate</th>
                     <th className="px-6 py-4">Job Title</th>
                     <th className="px-6 py-4">Base Salary</th>
                     <th className="px-6 py-4">Status</th>
                     <th className="px-6 py-4">Sent Date</th>
                     <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {offers.filter(o => filter === 'All' || o.status === filter).map(offer => (
                     <tr key={offer.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 group">
                        <td className="px-6 py-4">
                           <div className="font-bold text-slate-900 dark:text-white">{offer.candidateName}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                           {offer.jobTitle}
                        </td>
                        <td className="px-6 py-4 text-slate-900 dark:text-white font-medium">
                           ${offer.salary.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                           <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold
                              ${offer.status === 'Accepted' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' :
                                offer.status === 'Pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                                'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                              }
                           `}>
                              {offer.status === 'Accepted' && <CheckCircle2 size={14}/>}
                              {offer.status === 'Declined' && <XCircle size={14}/>}
                              {offer.status === 'Pending' && <Clock size={14}/>}
                              {offer.status}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                           {formatDate(offer.sentAt)}
                           <div className="text-xs text-red-500">Exp: {formatDate(offer.expiresAt)}</div>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <div className="flex items-center justify-end gap-3">
                              {offer.status === 'Accepted' && (
                                <button 
                                  onClick={() => handleOpenHireModal(offer)}
                                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-bold text-xs hover:bg-blue-700 transition-colors shadow-sm"
                                >
                                  Move to Onboarding
                                </button>
                              )}
                              
                              {offer.status === 'Pending' ? (
                                 <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg font-bold text-xs transition-colors">
                                       <RefreshCw size={12} /> Resend
                                    </button>
                                    <button className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg font-bold text-xs transition-colors">
                                       <X size={12} /> Withdraw
                                    </button>
                                 </div>
                              ) : (
                                 <button className="text-blue-600 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity hover:underline">
                                    View PDF
                                 </button>
                              )}
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {selectedHireData && (
        <HireCandidateModal 
          isOpen={hireModalOpen} 
          onClose={() => setHireModalOpen(false)}
          candidate={selectedHireData.candidate}
          offer={selectedHireData.offer}
        />
      )}
    </div>
  );
}
