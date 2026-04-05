"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronRight, ChevronLeft, Check, Sparkles, FileText, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { mockAtsCandidates } from "@/data/mockAts";

const STEPS = ["Select Candidate", "Offer Details", "Template Selection", "Preview & Send"];

export default function CreateOfferWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    candidateId: "",
    salary: "150000",
    signingBonus: "10000",
    startDate: "2024-10-01",
    equity: "5000 options",
    template: "Standard US Full-Time"
  });

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  const handleFinish = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      router.push("/hiring/offers");
    }, 1500);
  };

  const selectedCandidate = mockAtsCandidates.find(c => c.id === formData.candidateId);

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto animate-in fade-in duration-500 pb-12">
      
      {/* Header & Breadcrumb */}
      <div className="flex items-center text-sm text-slate-500 mb-2">
        <Link href="/hiring/offers" className="hover:text-slate-900 dark:hover:text-white transition-colors">Offers</Link>
        <ChevronRight size={14} className="mx-2" />
        <span className="font-medium text-slate-900 dark:text-white">Generate Offer</span>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
         
         <div className="w-full md:w-64 shrink-0 flex flex-col gap-2">
            {STEPS.map((step, idx) => (
               <div 
                  key={idx} 
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                     currentStep === idx 
                        ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400 font-bold shadow-sm" 
                        : currentStep > idx 
                           ? "bg-slate-50 border-slate-200 text-slate-900 dark:bg-slate-800/50 dark:border-slate-700/50 dark:text-white"
                           : "bg-transparent border-transparent text-slate-500"
                  }`}
               >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${currentStep > idx ? "bg-green-500 text-white" : currentStep === idx ? "bg-blue-600 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-500"}`}>
                     {currentStep > idx ? <Check size={12} /> : idx + 1}
                  </div>
                  <span className="text-sm">{step}</span>
               </div>
            ))}
         </div>

         <div className="flex-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col relative min-h-[500px]">
            
            <div className="p-6 sm:p-8 flex-1">
               {currentStep === 0 && (
                  <div className="flex flex-col gap-6 animate-in slide-in-from-right-4 duration-300">
                     <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Select Pending Candidate</h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {mockAtsCandidates.filter(c=>c.stage === 'Offer').map(c => (
                           <div key={c.id} onClick={() => setFormData({...formData, candidateId: c.id})} className={`p-4 border rounded-xl cursor-pointer transition-all ${formData.candidateId === c.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm ring-1 ring-blue-500' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}>
                              <div className="flex items-center gap-3 mb-2">
                                 <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-sm">
                                    {c.firstName.charAt(0)}{c.lastName.charAt(0)}
                                 </div>
                                 <div>
                                    <div className="font-bold text-slate-900 dark:text-white">{c.firstName} {c.lastName}</div>
                                    <div className="text-xs text-slate-500">Applying for: Job #{c.jobId}</div>
                                 </div>
                              </div>
                              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs">
                                 <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded font-medium">{c.source}</span>
                                 <span className="text-blue-600 font-bold">Offer Stage</span>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               )}

               {currentStep === 1 && (
                  <div className="flex flex-col gap-6 animate-in slide-in-from-right-4 duration-300">
                     <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Offer Variables</h2>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                           <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Base Salary (Annual)</label>
                           <input type="number" value={formData.salary} onChange={e=>setFormData({...formData, salary: e.target.value})} className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div>
                           <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Signing Bonus (Optional)</label>
                           <input type="number" value={formData.signingBonus} onChange={e=>setFormData({...formData, signingBonus: e.target.value})} className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div>
                           <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Equity or Stock Options</label>
                           <input type="text" value={formData.equity} onChange={e=>setFormData({...formData, equity: e.target.value})} className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div>
                           <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Start Date</label>
                           <input type="date" value={formData.startDate} onChange={e=>setFormData({...formData, startDate: e.target.value})} className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                     </div>
                  </div>
               )}

               {currentStep === 2 && (
                  <div className="flex flex-col gap-6 animate-in slide-in-from-right-4 duration-300">
                     <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Legal Template</h2>
                     <div className="space-y-3">
                        {['Standard US Full-Time', 'Contractor Agreement', 'Executive Track', 'International EOR'].map(t => (
                           <label key={t} className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${formData.template === t ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                              <input type="radio" name="template" checked={formData.template === t} onChange={() => setFormData({...formData, template: t})} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                              <span className="font-semibold text-slate-900 dark:text-white">{t}</span>
                           </label>
                        ))}
                     </div>
                  </div>
               )}

               {currentStep === 3 && (
                  <div className="flex flex-col gap-6 animate-in slide-in-from-right-4 duration-300 h-full">
                     <h2 className="text-xl font-bold text-slate-900 dark:text-white shrink-0">Review Final Document</h2>
                     <div className="flex-1 bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl relative overflow-hidden flex flex-col items-center justify-center min-h-[300px]">
                        
                        <div className="bg-white p-8 w-fit max-w-[90%] shadow-lg rounded m-8 text-black opacity-90 scale-90 origin-top">
                           <div className="text-xl font-serif font-bold text-center mb-6">Employment Offer Letter</div>
                           <p className="mb-4">Dear <strong>{selectedCandidate?.firstName || "Candidate"}</strong>,</p>
                           <p className="mb-4 text-justify">We are thrilled to offer you the position. Below are the details of our proposed setup based on the <strong>{formData.template}</strong> template.</p>
                           <ul className="list-disc pl-5 mb-4 space-y-1">
                              <li>Base Salary: <strong>${Number(formData.salary).toLocaleString()}/year</strong></li>
                              <li>Signing Bonus: <strong>${Number(formData.signingBonus).toLocaleString()}</strong></li>
                              <li>Equity: <strong>{formData.equity}</strong></li>
                              <li>Start Date: <strong>{new Date(formData.startDate).toLocaleDateString()}</strong></li>
                           </ul>
                           <p>Please review and sign below to automatically accept and trigger onboarding.</p>
                        </div>
                        
                     </div>
                  </div>
               )}
            </div>

            {/* Footer Buttons */}
            <div className="border-t border-slate-200 dark:border-slate-800 p-4 sm:px-8 bg-slate-50 dark:bg-slate-800/30 flex justify-between items-center rounded-b-xl shrink-0 mt-auto">
               <button onClick={prevStep} disabled={currentStep === 0 || isSubmitting} className="px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-2">
                  <ChevronLeft size={16} /> Back
               </button>
               {currentStep < STEPS.length - 1 ? (
                  <button onClick={nextStep} disabled={currentStep === 0 && !formData.candidateId} className="px-6 py-2.5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-lg text-sm font-bold hover:bg-slate-800 dark:hover:bg-slate-100 shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50">
                     Continue <ChevronRight size={16} />
                  </button>
               ) : (
                  <button onClick={handleFinish} disabled={isSubmitting} className="px-8 py-2.5 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 shadow-sm transition-colors flex items-center gap-2">
                     {isSubmitting ? "Sending..." : "Send via DocuSign"} 
                     {!isSubmitting && <Sparkles size={16} />}
                  </button>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}
