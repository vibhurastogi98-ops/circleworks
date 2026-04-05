"use client";

import React, { useMemo } from "react";
import { useParams } from "next/navigation";
import { getEmployeeById } from "@/data/mockEmployees";
import { Briefcase, Calendar, MapPin, Phone, Mail, Link as LinkIcon, User } from "lucide-react";

export default function EmployeeOverviewTab() {
  const { id } = useParams();
  const emp = useMemo(() => getEmployeeById(id as string), [id]);

  if (!emp) return null;

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
              <button className="text-sm font-medium text-blue-600 hover:text-blue-700">Edit</button>
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
                 <span className="text-sm font-medium text-slate-900 dark:text-white">{emp.email}</span>
              </div>
              <div className="flex flex-col gap-1">
                 <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone Number</span>
                 <span className="text-sm font-medium text-slate-900 dark:text-white">+1 (555) 123-4567</span>
              </div>
              <div className="flex flex-col gap-1 sm:col-span-2">
                 <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Home Address</span>
                 <span className="text-sm font-medium text-slate-900 dark:text-white">123 Main St, Apt 4B, {emp.location}</span>
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
                 <span className="text-sm font-medium text-slate-900 dark:text-white">{emp.title}</span>
              </div>
              <div className="flex flex-col gap-1">
                 <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Department</span>
                 <span className="text-sm font-medium text-slate-900 dark:text-white">{emp.department}</span>
              </div>
              <div className="flex flex-col gap-1">
                 <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Employment Type</span>
                 <span className="text-sm font-medium text-slate-900 dark:text-white">{emp.type}</span>
              </div>
              <div className="flex flex-col gap-1">
                 <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</span>
                 <span className="text-sm font-medium text-slate-900 dark:text-white">{emp.status}</span>
              </div>
           </div>
        </div>
      </div>

      {/* Right Column: Mini charts and timelines */}
      <div className="flex flex-col gap-6">
         
         {/* Org Mini Chart snippet */}
         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Reports To</h3>
            {emp.managerId ? (
               <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-slate-300 flex-shrink-0" />
                  <div>
                     <div className="text-sm font-bold text-slate-900 dark:text-white">Manager Name</div>
                     <div className="text-xs text-slate-500 dark:text-slate-400">CEO</div>
                  </div>
               </div>
            ) : (
               <p className="text-sm text-slate-500 dark:text-slate-400">Top level executive.</p>
            )}

            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-6 mb-4">Direct Reports</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 italic">No direct reports.</p>
         </div>

         {/* Key Dates */}
         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
               <Calendar size={18} className="text-blue-500" /> Key Dates
            </h3>
            
            <div className="flex flex-col gap-4">
               <div className="flex justify-between items-center text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="text-slate-600 dark:text-slate-400">Hire Date</span>
                  <span className="font-medium text-slate-900 dark:text-white">{new Date(emp.startDate).toLocaleDateString()}</span>
               </div>
               <div className="flex justify-between items-center text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="text-slate-600 dark:text-slate-400">Next Review</span>
                  <span className="font-medium text-slate-900 dark:text-white">Oct 1, 2024</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Work Anniversary</span>
                  <span className="font-medium text-slate-900 dark:text-white">{new Date(emp.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
