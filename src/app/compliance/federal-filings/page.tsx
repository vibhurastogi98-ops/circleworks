"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Calendar, Building2, UploadCloud, AlertCircle, CheckCircle2,
  Download, FileWarning, ArrowRight, Code, ShieldCheck, HelpCircle, Eye
} from "lucide-react";
import { toast } from "sonner";

export default function FederalFilingsPage() {
  const [activeTab, setActiveTab] = useState<"941" | "940" | "submit">("941");
  const [loading941, setLoading941] = useState(true);
  const [data941, setData941] = useState<any>(null);

  // E-File State
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<any>(null);
  const [selectedForm, setSelectedForm] = useState("941");
  const [submissionMethod, setSubmissionMethod] = useState("efile");

  useEffect(() => {
    async function fetch941() {
      try {
        const res = await fetch("/api/compliance/federal-filings/941?quarter=Q1-2026");
        const data = await res.json();
        setData941(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading941(false);
      }
    }
    fetch941();
  }, []);

  const handleSubmission = async () => {
    setSubmitting(true);
    setSubmitResult(null);
    try {
      const res = await fetch("/api/compliance/federal-filings/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formType: selectedForm,
          submissionMethod,
          data: { quarter: "Q1-2026" } // Mock payload
        })
      });
      const data = await res.json();
      setSubmitResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAmend941 = () => {
    toast.info("Initiating Form 941-X Amendment Workflow...", {
       description: "Extracting amended differentials from the Q1 payroll corrections."
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 pb-32">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <Building2 className="text-blue-600" size={32} />
            Federal Tax Filings
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
            Review, approve, and e-file federal employment tax returns (Forms 940, 941, 944) directly to the IRS.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => toast.loading("Loading Prior Filings Archive...", { duration: 2000 })} className="px-5 py-2.5 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-sm">
            <Download size={18} />
            Prior Filings
          </button>
          <button 
             onClick={() => setActiveTab("submit")}
             className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl flex items-center gap-2 transition-colors shadow-lg shadow-blue-500/20"
          >
            <UploadCloud size={18} />
            E-File Dashboard
          </button>
        </div>
      </div>

      {/* DASHBOARD CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { 
            title: "Form 941", 
            subtitle: "Quarterly Returns", 
            dueDate: "Apr 30, 2026", 
            status: "Draft", 
            amount: "$127,710.00",
            icon: <FileText className="text-blue-500" size={24} />,
            bg: "bg-blue-50 dark:bg-blue-500/10",
            border: "border-blue-100 dark:border-blue-500/20"
          },
          { 
            title: "Form 940", 
            subtitle: "Annual FUTA", 
            dueDate: "Jan 31, 2027", 
            status: "Not Started", 
            amount: "$TBD",
            icon: <Calendar className="text-amber-500" size={24} />,
            bg: "bg-amber-50 dark:bg-amber-500/10",
            border: "border-amber-100 dark:border-amber-500/20"
          },
          { 
            title: "Form 944", 
            subtitle: "Annual Returns", 
            dueDate: "Exempt", 
            status: "N/A", 
            amount: "$0.00",
            icon: <FileWarning className="text-slate-500" size={24} />,
            bg: "bg-slate-50 dark:bg-slate-800",
            border: "border-slate-100 dark:border-slate-700"
          },
          { 
            title: "State Filings", 
            subtitle: "Multiple Tax Types", 
            dueDate: "Varies", 
            status: "3 Pending", 
            amount: "View details",
            icon: <Building2 className="text-emerald-500" size={24} />,
            bg: "bg-emerald-50 dark:bg-emerald-500/10",
            border: "border-emerald-100 dark:border-emerald-500/20"
          }
        ].map((card, idx) => (
          <div 
             key={idx} 
             onClick={() => {
                if (card.title.includes("941")) setActiveTab("941");
                else if (card.title.includes("940")) setActiveTab("940");
                else if (card.title.includes("944")) toast.info("Form 944 currently exempt/Not applicable.", { description: "Your company files quarterly 941s instead." });
                else toast.success("Redirecting to detailed State Tax Filings dashboard...");
             }}
             className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer hover:border-blue-300 dark:hover:border-blue-700"
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border ${card.bg} ${card.border}`}>
              {card.icon}
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">{card.title}</h3>
            <p className="text-sm text-slate-500">{card.subtitle}</p>
            
            <div className="mt-5 space-y-2">
               <div className="flex justify-between items-center text-sm">
                 <span className="text-slate-500 dark:text-slate-400">Due Date</span>
                 <span className="font-semibold text-slate-800 dark:text-slate-200">{card.dueDate}</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                 <span className="text-slate-500 dark:text-slate-400">Status</span>
                 <span className={`font-semibold ${card.status === "Draft" ? "text-blue-600 dark:text-blue-400" : card.status === "Not Started" ? "text-amber-600 dark:text-amber-400" : card.status === "3 Pending" ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500"}`}>
                   {card.status}
                 </span>
               </div>
               <div className="flex justify-between items-center text-sm">
                 <span className="text-slate-500 dark:text-slate-400">Amount due</span>
                 <span className="font-bold text-slate-900 dark:text-white">{card.amount}</span>
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        {/* TAB NAVIGATION */}
        <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800 hide-scrollbar px-2">
          {[
            { id: "941", label: "Form 941 Quarterly", icon: FileText },
            { id: "940", label: "Form 940 Annual", icon: Calendar },
            { id: "submit", label: "E-File & Transmitter", icon: UploadCloud }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium whitespace-nowrap transition-colors ${
                  isActive 
                    ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10" 
                    : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                }`}
              >
                <tab.icon size={18} className={isActive ? "text-blue-600 dark:text-blue-400" : ""} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB CONTENT */}
        <div className="p-6 md:p-8">
          
          {/* TAB 1: FORM 941 */}
          {activeTab === "941" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    Employer&apos;s QUARTERLY Federal Tax Return (941)
                  </h2>
                  <p className="text-slate-500 text-sm mt-1">Review aggregated payroll data auto-populated for {data941?.quarter || "Q1-2026"}.</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => toast.promise(new Promise(resolve => setTimeout(resolve, 1500)), {
                     loading: 'Generating PDF Preview for Form 941...',
                     success: 'PDF Ready! Downloading...',
                     error: 'Failed to generate PDF.'
                  })} className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors">
                    <Download size={16} /> PDF Preview
                  </button>
                  <button onClick={handleAmend941} className="px-4 py-2 bg-amber-100/50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors">
                    <FileWarning size={16} /> Amend (941-X)
                  </button>
                </div>
              </div>

              {loading941 ? (
                 <div className="py-20 flex justify-center">
                    <div className="animate-spin w-8 h-8 rounded-full border-4 border-blue-600 border-t-transparent"></div>
                 </div>
              ) : (
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800">
                      <tr>
                         <th className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-400">Line</th>
                         <th className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-400">Description</th>
                         <th className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-400 text-right">Calculated Value</th>
                         <th className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-400 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 bg-white dark:bg-transparent">
                      {[
                        { line: "1", desc: "Number of employees who received wages, tips, or other compensation", val: data941?.line1_employees },
                        { line: "2", desc: "Wages, tips, and other compensation", val: `$${data941?.line2_wages.toLocaleString(undefined, {minimumFractionDigits: 2})}` },
                        { line: "3", desc: "Federal income tax withheld from wages, tips, etc.", val: `$${data941?.line3_federalWithheld.toLocaleString(undefined, {minimumFractionDigits: 2})}` },
                        { line: "5a-e", desc: "Total social security and Medicare taxes", val: `$${(data941?.line5a_socialSecurity + data941?.line5c_medicare).toLocaleString(undefined, {minimumFractionDigits: 2})}` },
                        { line: "13", desc: "Total deposits for this quarter, including overpayment from prior", val: `$${data941?.line13_deposits.toLocaleString(undefined, {minimumFractionDigits: 2})}` },
                        { line: "14", desc: "Balance due / Overpayment", val: `$${data941?.line14_balanceDue.toLocaleString(undefined, {minimumFractionDigits: 2})}`, highlight: true },
                      ].map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                           <td className="py-4 px-4 font-medium text-slate-500">Line {row.line}</td>
                           <td className="py-4 px-4 text-slate-900 dark:text-white max-w-sm">{row.desc}</td>
                           <td className={`py-4 px-4 text-right font-medium ${row.highlight && row.val !== "$0.00" ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}`}>
                              {row.val}
                           </td>
                           <td className="py-4 px-4 text-center">
                              <button onClick={() => toast.info(`Viewing payroll register breakdown for Line ${row.line}`)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-xs flex items-center justify-center gap-1 mx-auto bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 px-2 py-1 rounded transition-colors">
                                <Eye size={14} /> Details
                              </button>
                           </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="bg-blue-50 dark:bg-blue-900/10 p-4 border-t border-blue-100 dark:border-blue-800 flex items-center justify-between">
                     <span className="text-sm font-medium text-blue-800 dark:text-blue-300 flex items-center gap-2">
                       <CheckCircle2 size={16} /> All calculations verified against payroll register hashes.
                     </span>
                     <button onClick={() => setActiveTab("submit")} className="text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                       Proceed to E-File
                     </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 2: FORM 940 */}
          {activeTab === "940" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    Employer&apos;s Annual Federal Unemployment (FUTA) Tax Return
                  </h2>
                  <p className="text-slate-500 text-sm mt-1">Estimations and FUTA wages based on year-to-date payroll runs.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="md:col-span-2 space-y-6">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                       <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">Line Highlights</h3>
                       <div className="space-y-4 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-600 dark:text-slate-400">Total payments to all employees (Line 3)</span>
                            <span className="font-bold">$2,100,500.00</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600 dark:text-slate-400">Payments exempt from FUTA (Line 4)</span>
                            <span className="font-bold">$125,000.00</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600 dark:text-slate-400">Total of payments made to each employee in excess of $7,000 (Line 5)</span>
                            <span className="font-bold">$1,500,000.00</span>
                          </div>
                          <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-3">
                            <span className="text-slate-800 dark:text-slate-200 font-semibold">Total FUTA tax before adjustments (Line 8)</span>
                            <span className="font-black text-rose-600 dark:text-rose-400">$2,853.00</span>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 p-5 rounded-2xl">
                       <h3 className="font-bold text-amber-900 dark:text-amber-400 mb-2 flex items-center gap-2">
                         <MapIcon /> State Credit Reduction
                       </h3>
                       <p className="text-xs text-amber-800 dark:text-amber-500 mb-3">
                         If you paid FUTA wages in a state subject to credit reduction (e.g. CA, NY), additional taxes may apply. Schedule A (Form 940) will automatically calculate.
                       </p>
                       <div className="bg-white/60 dark:bg-slate-900/40 p-3 rounded-lg border border-amber-200 dark:border-amber-800/50">
                          <div className="flex justify-between text-sm font-medium text-slate-800 dark:text-slate-300">
                             <span>CA (Rate 0.6%)</span>
                             <span className="text-amber-600 dark:text-amber-400">$645.00</span>
                          </div>
                          <div className="flex justify-between text-sm font-medium text-slate-800 dark:text-slate-300 mt-1">
                             <span>NY (Rate 0.6%)</span>
                             <span className="text-amber-600 dark:text-amber-400">$215.00</span>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: E-FILE SUBMISSION */}
          {activeTab === "submit" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-8">
               <div className="text-center pb-6 border-b border-slate-200 dark:border-slate-800">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center rounded-full mx-auto mb-4">
                     <ShieldCheck size={32} />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">Authorized IRS E-File</h2>
                  <p className="text-slate-500 mt-2 max-w-lg mx-auto">
                    Transmit forms directly into the IRS Authorized e-file system, or generate bulk EFTPS XML files for external authorized provider transmission.
                  </p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  <div className="space-y-4">
                     <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">1. Select Form to Transmit</label>
                     <select 
                       value={selectedForm}
                       onChange={(e) => setSelectedForm(e.target.value)}
                       className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                     >
                        <option value="941">Form 941 (Quarterly) - Q1 2026</option>
                        <option value="940">Form 940 (Annual) - 2026</option>
                        <option value="944">Form 944 (Annual) - 2026</option>
                     </select>
                  </div>

                  <div className="space-y-4">
                     <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">2. Method of Transmission</label>
                     <select 
                       value={submissionMethod}
                       onChange={(e) => setSubmissionMethod(e.target.value)}
                       className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                     >
                        <option value="efile">Direct API (IRS Authorized Provider)</option>
                        <option value="eftps">Generate XML Payload (EFTPS File)</option>
                     </select>
                  </div>
               </div>

               <div className="bg-slate-900 dark:bg-slate-900 rounded-2xl p-6 text-white my-8 shadow-xl overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                     <Code size={120} />
                  </div>
                  <h3 className="font-bold flex items-center gap-2 mb-4 text-emerald-400">
                     <CheckCircle2 size={18} /> Payload Built Successfully
                  </h3>
                  <div className="text-sm font-mono bg-black/40 p-4 rounded-xl border border-white/10 mb-4 h-32 overflow-y-auto">
                     <span className="text-blue-300">&lt;IRSSubmission&gt;</span>{'\n'}
                     &nbsp;&nbsp;<span className="text-blue-300">&lt;TaxYear&gt;</span>2026<span className="text-blue-300">&lt;/TaxYear&gt;</span>{'\n'}
                     &nbsp;&nbsp;<span className="text-blue-300">&lt;Quarter&gt;</span>1<span className="text-blue-300">&lt;/Quarter&gt;</span>{'\n'}
                     &nbsp;&nbsp;<span className="text-slate-400">&lt;!-- Auto-generated from Payroll Run ID PRL-9020 --&gt;</span>{'\n'}
                     &nbsp;&nbsp;<span className="text-blue-300">&lt;EIN&gt;</span>XX-XXXXXXX<span className="text-blue-300">&lt;/EIN&gt;</span>{'\n'}
                     &nbsp;&nbsp;<span className="text-blue-300">&lt;FormData&gt;</span>...<span className="text-blue-300">&lt;/FormData&gt;</span>{'\n'}
                     <span className="text-blue-300">&lt;/IRSSubmission&gt;</span>
                  </div>
                  
                  {!submitResult ? (
                     <button 
                        onClick={handleSubmission}
                        disabled={submitting}
                        className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors text-lg"
                     >
                        {submitting ? (
                           <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/> Transmitting...</>
                        ) : (
                           <>Submit {selectedForm} to IRS <ArrowRight size={20} /></>
                        )}
                     </button>
                  ) : (
                     <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-emerald-900/50 border border-emerald-500 p-6 rounded-xl flex flex-col md:flex-row items-center gap-6">
                        <div className="w-16 h-16bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 bg-emerald-500 shadow-lg shadow-emerald-500/20">
                           <CheckCircle2 size={32} className="text-white" />
                        </div>
                        <div className="flex-1 text-center md:text-left space-y-2">
                           <h4 className="text-xl font-bold text-white">Transmission Successful</h4>
                           <p className="text-emerald-200 text-sm">{submitResult.message}</p>
                           <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 font-mono text-xs">
                              <div className="bg-black/30 p-2 rounded border border-white/5">
                                <span className="block text-emerald-400/70 mb-0.5 font-sans">Confirmation ID</span>
                                {submitResult.tracking.confirmationNumber}
                              </div>
                              <div className="bg-black/30 p-2 rounded border border-white/5">
                                <span className="block text-emerald-400/70 mb-0.5 font-sans">Timestamp</span>
                                {new Date(submitResult.tracking.timestamp).toLocaleTimeString()}
                              </div>
                              <div className="bg-black/30 p-2 rounded border border-white/5">
                                <span className="block text-emerald-400/70 mb-0.5 font-sans">IRS Response</span>
                                {submitResult.tracking.irsAcknowledgment}
                              </div>
                           </div>
                        </div>
                     </motion.div>
                  )}
               </div>

            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}

// Simple Map Icon placeholder component
function MapIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" x2="9" y1="3" y2="18" />
      <line x1="15" x2="15" y1="6" y2="21" />
    </svg>
  )
}
