"use client";

import React, { useState } from "react";
import { Upload, FileSpreadsheet, Download, AlertCircle } from "lucide-react";

export default function ImportSettingsPage() {
  const [importType, setImportType] = useState("Employees");

  const types = ["Employees", "Historical Payroll", "Time Entries", "Expenses", "Benefits Enrollment"];

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500 max-w-5xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Data Import Hub</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Bulk upload and map legacy data via CSV.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
         {/* Sidebar Type Selector */}
         <div className="col-span-1 flex flex-col gap-2 relative z-10">
            {types.map(type => (
               <button
                  key={type}
                  onClick={() => setImportType(type)}
                  className={`px-4 py-3 text-sm font-bold rounded-xl text-left transition-colors relative overflow-hidden ${
                     importType === type 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                  }`}
               >
                  {type}
                  {importType === type && <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-blue-700/50 to-transparent pointer-events-none" />}
               </button>
            ))}
         </div>

         {/* Main Import Area */}
         <div className="col-span-1 md:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-8">
            
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-200 dark:border-slate-800">
               <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Import {importType}</h2>
                  <p className="text-sm text-slate-500 mt-1 flex items-center gap-1"><AlertCircle size={14}/> Maximum 50,000 rows per upload.</p>
               </div>
               <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-bold transition-colors">
                  <Download size={16}/> Download Template
               </button>
            </div>

            <div className="flex flex-col gap-8">
               <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-12 flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer group">
                  <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                     <FileSpreadsheet size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Drag & drop your CSV file here</h3>
                  <p className="text-sm text-slate-500 mb-6 max-w-md">Or carefully select a file from your computer. We will automatically map matching column headers.</p>
                  <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors shadow-sm">
                     <Upload size={18} /> Browse Files
                  </button>
               </div>

               <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-3">Required Fields for {importType}</h4>
                  <ul className="text-sm text-slate-600 dark:text-slate-400 grid grid-cols-2 gap-2 list-disc pl-5">
                     {importType === "Employees" && (
                        <><li>First Name</li><li>Last Name</li><li>Email</li><li>Hire Date</li><li>Employment Type</li></>
                     )}
                     {importType === "Historical Payroll" && (
                        <><li>Employee ID</li><li>Pay Period Start</li><li>Pay Period End</li><li>Gross Pay</li><li>Taxes Withheld</li></>
                     )}
                     {(importType !== "Employees" && importType !== "Historical Payroll") && (
                        <><li>Select template to view required schema...</li></>
                     )}
                  </ul>
               </div>
            </div>

         </div>
      </div>
    </div>
  );
}
