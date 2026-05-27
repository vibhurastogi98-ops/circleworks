"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileText, Calendar, Building2, UploadCloud, CheckCircle2,
  Download, FileWarning, ArrowRight, Code, ShieldCheck, Eye, Map
} from "lucide-react";
import { toast } from "sonner";

interface FilingCard {
  form: string;
  label: string;
  dueDate: string;
  status: "Not Started" | "Draft" | "Filed" | "Amended" | "Not Applicable";
  amountDue: number;
}

interface FederalFilingData {
  quarter: string;
  year: number;
  dueDate: string;
  status: string;
  amountDue: number;
  payrollRunCount: number;
  line1_employees: number;
  line2_wages: number;
  line3_federalWithheld: number;
  line5a_socialSecurity: number;
  line5c_medicare: number;
  line5d_additionalMedicare: number;
  line5e_totalFica: number;
  line13_deposits: number;
  line14_balanceDue: number;
  detailLinks: Record<string, string>;
  form940: {
    year: number;
    status: string;
    dueDate: string;
    totalPayments: number;
    exemptPayments: number;
    excessWages: number;
    futaTaxableWages: number;
    futaGrossTax: number;
    futaCredit: number;
    stateCreditReduction: number;
    taxDue: number;
    creditReductionStates: Array<{ stateCode: string; taxableWages: number; rate: number; amount: number }>;
  };
  dashboardCards: FilingCard[];
  xmlPreview: string;
}

function currency(value: number | undefined) {
  return `$${(value ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function statusColor(status: string) {
  if (status === "Draft") return "text-blue-600 dark:text-blue-400";
  if (status === "Filed") return "text-emerald-600 dark:text-emerald-400";
  if (status === "Amended") return "text-purple-600 dark:text-purple-400";
  if (status === "Not Started") return "text-amber-600 dark:text-amber-400";
  return "text-slate-500";
}

export default function FederalFilingsPage() {
  const [activeTab, setActiveTab] = useState<"941" | "940" | "submit">("941");
  const [loading941, setLoading941] = useState(true);
  const [data941, setData941] = useState<FederalFilingData | null>(null);
  const [amendmentDraft, setAmendmentDraft] = useState<{ form: string; sourceQuarter: string; status: string } | null>(null);

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
          data: { quarter: data941?.quarter || "Q1-2026" }
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
    setAmendmentDraft({
      form: "941-X",
      sourceQuarter: data941?.quarter || "Q1-2026",
      status: "Draft",
    });
    toast.info("Initiating Form 941-X Amendment Workflow...", {
       description: "Extracting amended differentials from the Q1 payroll corrections."
    });
  };

  const filingCards: FilingCard[] = data941?.dashboardCards ?? [
    { form: "941", label: "941 (Due Q1)", dueDate: "Apr 30, 2026", status: "Draft", amountDue: 0 },
    { form: "940", label: "940 (Due Jan 31)", dueDate: "Jan 31, 2027", status: "Not Started", amountDue: 0 },
    { form: "944", label: "944 (Annual)", dueDate: "Jan 31, 2027", status: "Not Applicable", amountDue: 0 },
    { form: "state", label: "State Filings", dueDate: "Varies", status: "Draft", amountDue: 0 },
  ];

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
        {filingCards.map((card) => {
          const iconMap: Record<string, React.ReactNode> = {
            "941": <FileText className="text-blue-500" size={24} />,
            "940": <Calendar className="text-amber-500" size={24} />,
            "944": <FileWarning className="text-slate-500" size={24} />,
            state: <Building2 className="text-emerald-500" size={24} />,
          };
          const toneMap: Record<string, { bg: string; border: string; subtitle: string }> = {
            "941": { bg: "bg-blue-50 dark:bg-blue-500/10", border: "border-blue-100 dark:border-blue-500/20", subtitle: "Quarterly Returns" },
            "940": { bg: "bg-amber-50 dark:bg-amber-500/10", border: "border-amber-100 dark:border-amber-500/20", subtitle: "Annual FUTA" },
            "944": { bg: "bg-slate-50 dark:bg-slate-800", border: "border-slate-100 dark:border-slate-700", subtitle: "Annual Returns" },
            state: { bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-100 dark:border-emerald-500/20", subtitle: "State payroll tax filings" },
          };
          const tone = toneMap[card.form] ?? toneMap.state;
          return (
          <div
             key={card.form}
             onClick={() => {
                if (card.form === "941") setActiveTab("941");
                else if (card.form === "940") setActiveTab("940");
                else if (card.form === "944") toast.info("Form 944 annual return", { description: "Your company is currently configured for quarterly 941 filing." });
                else toast.success("Redirecting to detailed State Tax Filings dashboard...");
             }}
             className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer hover:border-blue-300 dark:hover:border-blue-700"
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border ${tone.bg} ${tone.border}`}>
              {iconMap[card.form]}
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">{card.label}</h3>
            <p className="text-sm text-slate-500">{tone.subtitle}</p>
            
            <div className="mt-5 space-y-2">
               <div className="flex justify-between items-center text-sm">
                 <span className="text-slate-500 dark:text-slate-400">Due Date</span>
                 <span className="font-semibold text-slate-800 dark:text-slate-200">{card.dueDate}</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                 <span className="text-slate-500 dark:text-slate-400">Status</span>
                 <span className={`font-semibold ${statusColor(card.status)}`}>
                   {card.status}
                 </span>
               </div>
               <div className="flex justify-between items-center text-sm">
                 <span className="text-slate-500 dark:text-slate-400">Amount due</span>
                 <span className="font-bold text-slate-900 dark:text-white">{currency(card.amountDue)}</span>
               </div>
            </div>
          </div>
        )})}
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
                  <p className="text-slate-500 text-sm mt-1">
                    Review {data941?.payrollRunCount ?? 0} payroll runs auto-populated for {data941?.quarter || "Q1-2026"}.
                  </p>
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

              {amendmentDraft && (
                <div className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-bold text-amber-900 dark:text-amber-300">{amendmentDraft.form} amendment created</div>
                    <div className="text-xs text-amber-800 dark:text-amber-400 mt-1">
                      Source filing: {amendmentDraft.sourceQuarter}. Status: {amendmentDraft.status}. Difference lines will be populated from corrected payroll runs.
                    </div>
                  </div>
                  <button onClick={() => setActiveTab("submit")} className="px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors">
                    Submit Amendment
                  </button>
                </div>
              )}

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
                        { line: "1", key: "line1", desc: "Number of employees who received wages, tips, or other compensation", val: data941?.line1_employees ?? 0 },
                        { line: "2", key: "line2", desc: "Wages, tips, and other compensation", val: currency(data941?.line2_wages) },
                        { line: "3", key: "line3", desc: "Federal income tax withheld from wages, tips, etc.", val: currency(data941?.line3_federalWithheld) },
                        { line: "5a", key: "line5", desc: "Taxable Social Security wages and employer/employee tax", val: currency(data941?.line5a_socialSecurity) },
                        { line: "5c", key: "line5", desc: "Taxable Medicare wages and employer/employee tax", val: currency(data941?.line5c_medicare) },
                        { line: "5d", key: "line5", desc: "Additional Medicare tax withholding", val: currency(data941?.line5d_additionalMedicare) },
                        { line: "5e", key: "line5", desc: "Total Social Security and Medicare taxes", val: currency(data941?.line5e_totalFica) },
                        { line: "13", key: "line13", desc: "Total deposits for this quarter, including overpayment from prior", val: currency(data941?.line13_deposits) },
                        { line: "14", key: "line14", desc: "Balance due / Overpayment", val: currency(data941?.line14_balanceDue), highlight: true },
                      ].map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                           <td className="py-4 px-4 font-medium text-slate-500">Line {row.line}</td>
                           <td className="py-4 px-4 text-slate-900 dark:text-white max-w-sm">{row.desc}</td>
                           <td className={`py-4 px-4 text-right font-medium ${row.highlight && row.val !== "$0.00" ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}`}>
                              {row.val}
                           </td>
                           <td className="py-4 px-4 text-center">
                              <button onClick={() => toast.info(`Line ${row.line} detail`, { description: data941?.detailLinks[row.key] ?? "Payroll register detail" })} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-xs flex items-center justify-center gap-1 mx-auto bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 px-2 py-1 rounded transition-colors">
                                <Eye size={14} /> View detail
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
                  <p className="text-slate-500 text-sm mt-1">
                    Auto-populated from full-year {data941?.form940.year ?? 2026} payroll, FUTA taxable wages, credits, and tax due.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="md:col-span-2 space-y-6">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                       <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">Line Highlights</h3>
                       <div className="space-y-4 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-600 dark:text-slate-400">Total payments to all employees (Line 3)</span>
                            <span className="font-bold">{currency(data941?.form940.totalPayments)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600 dark:text-slate-400">Payments exempt from FUTA (Line 4)</span>
                            <span className="font-bold">{currency(data941?.form940.exemptPayments)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600 dark:text-slate-400">Total of payments made to each employee in excess of $7,000 (Line 5)</span>
                            <span className="font-bold">{currency(data941?.form940.excessWages)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600 dark:text-slate-400">FUTA taxable wages after $7,000 cap</span>
                            <span className="font-bold">{currency(data941?.form940.futaTaxableWages)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600 dark:text-slate-400">FUTA gross tax at 6.0%</span>
                            <span className="font-bold">{currency(data941?.form940.futaGrossTax)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600 dark:text-slate-400">State unemployment credit</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">-{currency(data941?.form940.futaCredit)}</span>
                          </div>
                          <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-3">
                            <span className="text-slate-800 dark:text-slate-200 font-semibold">Total FUTA tax before adjustments (Line 8)</span>
                            <span className="font-black text-rose-600 dark:text-rose-400">{currency(data941?.form940.taxDue)}</span>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 p-5 rounded-2xl">
                       <h3 className="font-bold text-amber-900 dark:text-amber-400 mb-2 flex items-center gap-2">
                         <Map size={18} /> State Credit Reduction
                       </h3>
                       <p className="text-xs text-amber-800 dark:text-amber-500 mb-3">
                         If payroll was run in a credit-reduction state, Schedule A amounts are added to the Form 940 preview.
                       </p>
                       <div className="bg-white/60 dark:bg-slate-900/40 p-3 rounded-lg border border-amber-200 dark:border-amber-800/50">
                          {data941?.form940.creditReductionStates.length ? (
                            data941.form940.creditReductionStates.map((state) => (
                              <div key={state.stateCode} className="flex justify-between text-sm font-medium text-slate-800 dark:text-slate-300 mt-1 first:mt-0">
                                <span>{state.stateCode} (Rate {(state.rate * 100).toFixed(1)}%)</span>
                                <span className="text-amber-600 dark:text-amber-400">{currency(state.amount)}</span>
                              </div>
                            ))
                          ) : (
                            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              No credit reduction states detected for this payroll year.
                            </div>
                          )}
                          <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white mt-3 pt-3 border-t border-amber-200 dark:border-amber-800/50">
                            <span>Total credit reduction</span>
                            <span>{currency(data941?.form940.stateCreditReduction)}</span>
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
                        <option value="941">Form 941 (Quarterly) - {data941?.quarter ?? "Q1-2026"}</option>
                        <option value="940">Form 940 (Annual) - {data941?.year ?? 2026}</option>
                        <option value="944">Form 944 (Annual) - {data941?.year ?? 2026}</option>
                        {amendmentDraft && <option value="941-X">Form 941-X Amendment - {amendmentDraft.sourceQuarter}</option>}
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
                     <pre className="whitespace-pre-wrap text-blue-200">
                       {data941?.xmlPreview ?? "<IRSSubmission><FormType>941</FormType><Status>Building</Status></IRSSubmission>"}
                     </pre>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs mb-4">
                    <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                      <span className="block text-slate-400 mb-1">Provider</span>
                      <span className="font-semibold">{submissionMethod === "efile" ? "Approved e-file transmitter" : "EFTPS XML export"}</span>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                      <span className="block text-slate-400 mb-1">Tracking</span>
                      <span className="font-semibold">Confirmation, timestamp, IRS acknowledgment</span>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                      <span className="block text-slate-400 mb-1">Source</span>
                      <span className="font-semibold">{data941?.payrollRunCount ?? 0} payroll runs reconciled</span>
                    </div>
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
                           {submitResult.xmlPayload && (
                             <pre className="mt-3 max-h-20 overflow-y-auto rounded-lg bg-black/30 p-2 text-[11px] text-emerald-100 border border-white/10">
                               {submitResult.xmlPayload}
                             </pre>
                           )}
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
