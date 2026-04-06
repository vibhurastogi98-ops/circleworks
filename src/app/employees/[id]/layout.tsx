"use client";

import React from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useEmployee } from "@/hooks/useEmployees";
import { ChevronLeft, Mail, Phone, Edit, MoreHorizontal, UserCheck, Calendar, MapPin, Loader2 } from "lucide-react";

export default function EmployeeProfileLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  const employeeId = params.id as string;
  
  const { data: emp, isLoading } = useEmployee(employeeId);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-medium">Fetching employee profile...</p>
      </div>
    );
  }

  if (!emp) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-4">
          <UserCheck size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Employee Not Found</h2>
        <p className="text-slate-500 mt-1">The profile you are looking for does not exist or has been removed.</p>
        <Link href="/employees" className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
          Return to Directory
        </Link>
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
         {/* Cover Area */}
         <div className="h-24 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 dark:from-blue-900/20 dark:to-indigo-900/20 w-full border-b border-white/10"></div>
         
         <div className="px-6 sm:px-8 pb-6 flex flex-col sm:flex-row gap-6 relative">
            {/* Avatar */}
            <div className="-mt-12 shrink-0 relative">
               <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border-4 border-white dark:border-slate-900 overflow-hidden bg-slate-100 shadow-xl">
                  <img src={emp.avatar} alt="Avatar" className="w-full h-full object-cover" />
               </div>
               <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-white dark:border-slate-900 ${emp.status === 'active' ? 'bg-green-500' : 'bg-amber-500 shadow-sm'}`}></div>
            </div>

            {/* Info */}
            <div className="flex-1 flex flex-col gap-3 pt-2 sm:pt-4">
               <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div>
                     <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
                        {emp.firstName} {emp.lastName}
                     </h1>
                     <p className="text-[15px] font-medium text-slate-600 dark:text-slate-300 mt-1">
                        {emp.jobTitle} • {emp.department}
                     </p>
                  </div>
                  <div className="flex items-center gap-2">
                     <button className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-2 shadow-sm active:scale-95">
                        <Edit size={14} /> Edit Profile
                     </button>
                     <button className="px-2 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-2 shadow-sm active:scale-95">
                        <MoreHorizontal size={14} />
                     </button>
                  </div>
               </div>

               {/* Meta attributes */}
               <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-slate-600 dark:text-slate-400 font-medium">
                  <div className="flex items-center gap-2 hover:text-blue-600 transition-colors cursor-default">
                     <Mail size={14} className="text-slate-400" /> {emp.email || "No email"}
                  </div>
                  <div className="flex items-center gap-2">
                     <Phone size={14} className="text-slate-400" /> +1 (555) 000-0000
                  </div>
                  <div className="flex items-center gap-2">
                     <MapPin size={14} className="text-slate-400" /> {emp.location || "Remote"}
                  </div>
                  <div className="flex items-center gap-2">
                     <Calendar size={14} className="text-slate-400" /> Member since {emp.startDate ? new Date(emp.startDate).getFullYear() : "2024"}
                  </div>
                  <div className="flex items-center gap-2">
                     <UserCheck size={14} className="text-slate-400" /> <span className="capitalize">{emp.employmentType}</span>
                  </div>
               </div>
            </div>
         </div>

         {/* Navigation Tabs */}
         <div className="px-4 sm:px-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-6">
               {tabs.map((tab) => {
                  const isActive = pathname === tab.href;
                  return (
                     <Link
                        key={tab.name}
                        href={tab.href}
                        className={`py-4 text-[13px] font-bold border-b-2 whitespace-nowrap transition-all focus:outline-none ${
                          isActive 
                           ? "border-blue-600 text-blue-600 dark:text-blue-400" 
                           : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700"
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
