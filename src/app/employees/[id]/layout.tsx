"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { getEmployeeById } from "@/data/mockEmployees";
import { ChevronLeft, Mail, Phone, Edit, MoreHorizontal, UserCheck, Calendar, MapPin } from "lucide-react";

export default function EmployeeProfileLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  const employeeId = params.id as string;
  
  const emp = useMemo(() => getEmployeeById(employeeId), [employeeId]);

  if (!emp) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Employee Not Found</h2>
        <Link href="/employees" className="text-blue-600 hover:underline mt-4">Return to Directory</Link>
      </div>
    );
  }

  const tabs = [
    { name: "Overview", href: `/employees/${emp.id}` },
    { name: "Compensation", href: `/employees/${emp.id}/compensation` },
    { name: "Benefits", href: `/employees/${emp.id}/benefits` },
    { name: "Time & PTO", href: `/employees/${emp.id}/time` },
    { name: "Documents", href: `/employees/${emp.id}/documents` },
    { name: "Payroll", href: `/employees/${emp.id}/payroll` },
    { name: "Performance", href: `/employees/${emp.id}/performance` },
    { name: "Activity", href: `/employees/${emp.id}/activity` },
  ];

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
      {/* Back Link */}
      <Link href="/employees" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors w-fit">
        <ChevronLeft size={16} /> Back to Directory
      </Link>

      {/* Profile Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
         {/* Cover Area (optional styling) */}
         <div className="h-24 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-800/50 w-full"></div>
         
         <div className="px-6 sm:px-8 pb-6 flex flex-col sm:flex-row gap-6 relative">
            {/* Avatar */}
            <div className="-mt-12 shrink-0 relative">
               <img src={emp.avatar} alt="Avatar" className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border-4 border-white dark:border-slate-900 object-cover bg-slate-200 shadow-sm" />
               <div className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-white dark:border-slate-900 ${emp.status === 'Active' ? 'bg-green-500' : 'bg-amber-500'}`}></div>
            </div>

            {/* Info */}
            <div className="flex-1 flex flex-col gap-3 pt-2 sm:pt-4">
               <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div>
                     <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
                        {emp.firstName} {emp.lastName}
                     </h1>
                     <p className="text-[15px] font-medium text-slate-600 dark:text-slate-300 mt-1">
                        {emp.title} • {emp.department}
                     </p>
                  </div>
                  <div className="flex items-center gap-2">
                     <button className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2">
                        <Edit size={14} /> Edit
                     </button>
                     <button className="px-2 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2">
                        <MoreHorizontal size={14} />
                     </button>
                  </div>
               </div>

               {/* Meta attributes */}
               <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                     <Mail size={14} /> {emp.email}
                  </div>
                  <div className="flex items-center gap-2">
                     <Phone size={14} /> +1 (555) 123-4567
                  </div>
                  <div className="flex items-center gap-2">
                     <MapPin size={14} /> {emp.location} ({emp.locationType})
                  </div>
                  <div className="flex items-center gap-2">
                     <Calendar size={14} /> Started {new Date(emp.startDate).getFullYear()}
                  </div>
                  <div className="flex items-center gap-2">
                     <UserCheck size={14} /> {emp.type}
                  </div>
               </div>
            </div>
         </div>

         {/* Navigation Tabs */}
         <div className="px-4 sm:px-8 border-t border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-6">
               {tabs.map((tab) => {
                  const isActive = pathname === tab.href;
                  return (
                     <Link
                        key={tab.name}
                        href={tab.href}
                        className={`py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors focus:outline-none ${
                          isActive 
                           ? "border-blue-600 text-blue-600 dark:text-blue-400" 
                           : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700"
                        }`}
                     >
                        {tab.name}
                     </Link>
                  );
               })}
            </div>
         </div>
      </div>

      {/* Tab Content Area */}
      <div className="w-full">
         {children}
      </div>
    </div>
  );
}
