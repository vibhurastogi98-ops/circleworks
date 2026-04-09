"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useEmployee } from "@/hooks/useEmployees";
import { Briefcase, Calendar, User, Loader2, AlertCircle } from "lucide-react";

export default function EmployeeOverviewTab() {
  const { id } = useParams();
  const { data: emp, isLoading, error } = useEmployee(id as string);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading profile...</p>
      </div>
    );
  }

  if (error || !emp) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
        <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-600">
           <AlertCircle size={24} />
        </div>
        <div>
          <p className="text-lg font-bold text-slate-900 dark:text-white">Profile Not Found</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">We couldn't retrieve the data for this employee.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
      {/* Left Column: Details */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        
        {/* Personal info grid */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
           <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                 <User size={18} className="text-blue-500" /> Personal Information
              </h3>
              <Link href={`/employees/${id}/edit`} className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">Edit</Link>
           </div>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
              <div className="flex flex-col gap-1">
                 <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Full Name</span>
                 <span className="text-sm font-medium text-slate-900 dark:text-white">{emp.firstName} {emp.lastName}</span>
              </div>
              <div className="flex flex-col gap-1">
                 <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Preferred Name</span>
                 <span className="text-sm font-medium text-slate-900 dark:text-white">{emp.firstName}</span>
              </div>
              <div className="flex flex-col gap-1">
                 <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email Address</span>
                 <span className="text-sm font-medium text-slate-900 dark:text-white">{emp.email || "No email provided"}</span>
              </div>
              <div className="flex flex-col gap-1">
                 <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone Number</span>
                 <span className="text-sm font-medium text-slate-900 dark:text-white">+1 (555) 000-0000</span>
              </div>
              <div className="flex flex-col gap-1 sm:col-span-2">
                 <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Work Location</span>
                 <span className="text-sm font-medium text-slate-900 dark:text-white">{emp.location || "Remote"} ({emp.locationType})</span>
              </div>
           </div>
        </div>

        {/* Employment Details */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
           <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                 <Briefcase size={18} className="text-blue-500" /> Employment Details
              </h3>
           </div>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
              <div className="flex flex-col gap-1">
                 <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Job Title</span>
                 <span className="text-sm font-medium text-slate-900 dark:text-white">{emp.jobTitle}</span>
              </div>
              <div className="flex flex-col gap-1">
                 <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Department</span>
                 <span className="text-sm font-medium text-slate-900 dark:text-white">{emp.department}</span>
              </div>
              <div className="flex flex-col gap-1">
                 <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Employment Type</span>
                 <span className="text-sm font-medium text-slate-900 dark:text-white capitalize">{emp.employmentType}</span>
              </div>
              <div className="flex flex-col gap-1">
                 <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</span>
                 <span className="text-sm font-medium text-slate-900 dark:text-white capitalize">{emp.status}</span>
              </div>
           </div>
        </div>
      </div>

      {/* Right Column: Mini charts and timelines */}
      <div className="flex flex-col gap-6">
         
         {/* Org Mini Chart snippet */}
         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Reports To</h3>
            {emp.manager ? (
               <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                    <img src={emp.manager.avatar} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div>
                     <div className="text-sm font-bold text-slate-900 dark:text-white">{emp.manager.firstName} {emp.manager.lastName}</div>
                     <div className="text-xs text-slate-500 dark:text-slate-400">{emp.manager.jobTitle}</div>
                  </div>
               </div>
            ) : (
               <p className="text-sm text-slate-500 dark:text-slate-400 italic">No manager assigned.</p>
            )}

            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-6 mb-4">Direct Reports</h3>
            {emp.subordinates && emp.subordinates.length > 0 ? (
              <div className="flex flex-col gap-2">
                {emp.subordinates.slice(0, 3).map((sub: any) => (
                  <div key={sub.id} className="text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                      <img src={sub.avatar} alt="" className="w-full h-full object-cover" />
                    </div>
                    <span>{sub.firstName} {sub.lastName}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400 italic">No direct reports.</p>
            )}
         </div>

         {/* Key Dates */}
         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
               <Calendar size={18} className="text-blue-500" /> Key Dates
            </h3>
            
            <div className="flex flex-col gap-4">
               <div className="flex justify-between items-center text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="text-slate-600 dark:text-slate-400">Hire Date</span>
                  <span className="font-medium text-slate-900 dark:text-white">{emp.startDate ? new Date(emp.startDate).toLocaleDateString() : "Pending"}</span>
               </div>
               <div className="flex justify-between items-center text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="text-slate-600 dark:text-slate-400">Next Review</span>
                  <span className="font-medium text-slate-900 dark:text-white">Not scheduled</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Joined</span>
                  <span className="font-medium text-slate-900 dark:text-white">{emp.createdAt ? new Date(emp.createdAt).toLocaleDateString() : "Recent"}</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
