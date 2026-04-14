"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronRight, ChevronLeft, Check, Sparkles, GripVertical, Plus, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { getBanTheBoxJurisdiction } from "@/utils/compliance";
import { createJob } from "@/data/mockAts";
import { toast } from "sonner";

const STEPS = ["Job Details", "Description", "Application Form", "Posting Settings", "Publish"];

export default function CreateJobWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "", department: "", location: "", type: "Full-Time", model: "Hybrid", salaryMin: "", salaryMax: "",
    description: "",
    questions: [{ id: 1, text: "Why do you want to work here?", type: "text", required: true }],
    platforms: { linkedin: true, indeed: true, website: true }
  });

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  const banTheBoxJurisdiction = getBanTheBoxJurisdiction(formData.location);

  const handleFinish = () => {
    setIsSubmitting(true);
    
    // Simulate API call and persist to mock data
    setTimeout(() => {
      createJob({
        title: formData.title || "New Job Posting",
        department: formData.department || "General",
        location: formData.location || "Remote",
        type: formData.type,
        status: "Active",
        salaryMin: parseInt(formData.salaryMin) || 0,
        salaryMax: parseInt(formData.salaryMax) || 0,
      });

      toast.success("Job Published!", {
        description: `"${formData.title}" is now live on your careers page.`
      });
      
      router.push("/hiring/jobs");
    }, 1500);
  };

  const aiGenerateJD = () => {
     setFormData({...formData, description: "We are looking for a highly skilled individual to join our team...\n\n**Responsibilities:**\n- Lead development of scalable architecture\n- Mentor junior developers\n\n**Requirements:**\n- 5+ years of experience\n- Strong communication skills"});
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto animate-in fade-in duration-500 pb-12">
      
      {/* Header & Breadcrumb */}
      <div className="flex items-center text-sm text-slate-500 mb-2">
        <Link href="/hiring/jobs" className="hover:text-slate-900 dark:hover:text-white transition-colors">Jobs</Link>
        <ChevronRight size={14} className="mx-2" />
        <span className="font-medium text-slate-900 dark:text-white">Create New Job</span>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
         
         {/* Sidebar Navigation */}
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
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                     currentStep > idx ? "bg-green-500 text-white" : currentStep === idx ? "bg-blue-600 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                  }`}>
                     {currentStep > idx ? <Check size={12} /> : idx + 1}
                  </div>
                  <span className="text-sm">{step}</span>
               </div>
            ))}
         </div>

         {/* Form Content */}
         <div className="flex-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col relative min-h-[400px]">
            
            <div className="p-6 sm:p-8 flex-1">
               {currentStep === 0 && (
                  <div className="flex flex-col gap-6 animate-in slide-in-from-right-4 duration-300">
                     <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Job Details</h2>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="sm:col-span-2">
                           <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Job Title</label>
                           <input type="text" value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Senior Product Designer" />
                        </div>
                        <div>
                           <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                           <select value={formData.department} onChange={e=>setFormData({...formData, department: e.target.value})} className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none">
                              <option value="">Select Department...</option>
                              <option value="Engineering">Engineering</option>
                              <option value="Product">Product</option>
                              <option value="Marketing">Marketing</option>
                              <option value="Sales">Sales</option>
                           </select>
                        </div>
                        <div>
                           <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Work Model</label>
                           <select value={formData.model} onChange={e=>setFormData({...formData, model: e.target.value})} className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none">
                              <option value="Onsite">Onsite</option>
                              <option value="Hybrid">Hybrid</option>
                              <option value="Remote">Fully Remote</option>
                           </select>
                        </div>
                        <div className="sm:col-span-2">
                           <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Location</label>
                           <input type="text" value={formData.location} onChange={e=>setFormData({...formData, location: e.target.value})} className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. San Francisco, CA or Remote" />
                        </div>
                        <div>
                           <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Salary Min</label>
                           <input type="number" value={formData.salaryMin} onChange={e=>setFormData({...formData, salaryMin: e.target.value})} className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="80000" />
                        </div>
                        <div>
                           <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Salary Max</label>
                           <input type="number" value={formData.salaryMax} onChange={e=>setFormData({...formData, salaryMax: e.target.value})} className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="120000" />
                        </div>
                     </div>
                  </div>
               )}

               {currentStep === 1 && (
                  <div className="flex flex-col gap-6 animate-in slide-in-from-right-4 duration-300 h-full flex-1">
                     <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Job Description</h2>
                        <button onClick={aiGenerateJD} className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 hover:bg-purple-200 transition-colors rounded-lg text-sm font-bold shadow-sm">
                           <Sparkles size={16} /> Auto-write with AI
                        </button>
                     </div>
                     <textarea 
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        className="w-full flex-1 min-h-[300px] border border-slate-300 dark:border-slate-700 rounded-lg p-4 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm leading-relaxed"
                        placeholder="Write the job description here..."
                     />
                  </div>
               )}

               {currentStep === 2 && (
                  <div className="flex flex-col gap-6 animate-in slide-in-from-right-4 duration-300">
                     <h2 className="text-xl font-bold text-slate-900 dark:text-white">Application Form</h2>
                     <p className="text-sm text-slate-500">Configure what candidates provide when they apply. Resume and Name are always required.</p>
                     
                     {banTheBoxJurisdiction && (
                        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex gap-3 text-amber-800 dark:text-amber-400">
                           <AlertCircle size={20} className="shrink-0 mt-0.5" />
                           <div className="text-sm">
                              <span className="font-bold block mb-1">Ban-the-Box Compliance Notice</span>
                              Criminal history questions are restricted in <b>{banTheBoxJurisdiction}</b>. You cannot add background check or criminal history questions to this application form.
                           </div>
                        </div>
                     )}

                     <div className="flex flex-col gap-3">
                        {formData.questions.map((q, i) => (
                           <div key={q.id} className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-4 rounded-xl group cursor-move">
                              <GripVertical size={20} className="text-slate-400 mt-2 shrink-0 group-hover:text-slate-600 transition-colors" />
                              <div className="flex-1 flex flex-col gap-3">
                                 <input type="text" value={q.text} onChange={(e) => {
                                    const next = [...formData.questions]; next[i].text = e.target.value; setFormData({...formData, questions: next});
                                 }} className="w-full bg-transparent border-b border-slate-300 dark:border-slate-600 focus:border-blue-500 outline-none px-1 py-1 font-medium text-slate-900 dark:text-white" />
                                 <div className="flex items-center justify-between text-sm">
                                    <select className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md px-2 py-1 outline-none">
                                       <option>Short Text</option>
                                       <option>Long Text</option>
                                       <option>Multiple Choice</option>
                                       <option>File Upload</option>
                                    </select>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                       <input type="checkbox" checked={q.required} onChange={(e) => {
                                          const next = [...formData.questions]; next[i].required = e.target.checked; setFormData({...formData, questions: next});
                                       }} className="rounded text-blue-600 w-4 h-4" />
                                       <span className="text-slate-600 dark:text-slate-400">Required</span>
                                    </label>
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                     <div className="flex flex-col sm:flex-row gap-3">
                        <button 
                           onClick={() => {
                              const newId = formData.questions.length ? Math.max(...formData.questions.map(q=>q.id)) + 1 : 1;
                              setFormData({...formData, questions: [...formData.questions, {id: newId, text: '', type: 'text', required: false}]});
                           }}
                           className="flex-1 py-3 border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors">
                           <Plus size={18} /> Add Custom Question
                        </button>
                        <button 
                           disabled={!!banTheBoxJurisdiction}
                           title={banTheBoxJurisdiction ? `Criminal history questions are restricted in ${banTheBoxJurisdiction}` : 'Add a standard criminal history question'}
                           onClick={() => {
                              const newId = formData.questions.length ? Math.max(...formData.questions.map(q=>q.id)) + 1 : 1;
                              setFormData({...formData, questions: [...formData.questions, {id: newId, text: 'Have you ever been convicted of a felony?', type: 'Yes/No', required: true}]});
                           }}
                           className={`flex-1 py-3 border-2 border-dashed border-slate-300 dark:border-slate-700 font-semibold flex items-center justify-center gap-2 transition-colors rounded-xl ${banTheBoxJurisdiction ? 'opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-800 text-slate-400' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                           <Plus size={18} /> Add Criminal History
                        </button>
                     </div>
                  </div>
               )}

               {currentStep === 3 && (
                  <div className="flex flex-col gap-6 animate-in slide-in-from-right-4 duration-300">
                     <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Platform Syndication</h2>
                     <p className="text-sm text-slate-500 mb-4">Select where you want this job listing to be published automatically.</p>
                     
                     <div className="flex flex-col gap-4">
                        <label className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-colors ${formData.platforms.website ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'border-slate-200 dark:border-slate-700'}`}>
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">CW</div>
                              <div>
                                 <div className="font-bold text-slate-900 dark:text-white">Careers Website</div>
                                 <div className="text-xs text-slate-500">Post directly to your company careers page.</div>
                              </div>
                           </div>
                           <input type="checkbox" checked={formData.platforms.website} onChange={e=>setFormData({...formData, platforms: {...formData.platforms, website: e.target.checked}})} className="w-5 h-5 rounded text-blue-600" />
                        </label>

                        <label className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-colors ${formData.platforms.linkedin ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'border-slate-200 dark:border-slate-700'}`}>
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-lg bg-[#0A66C2] text-white flex items-center justify-center font-bold text-lg">in</div>
                              <div>
                                 <div className="font-bold text-slate-900 dark:text-white">LinkedIn</div>
                                 <div className="text-xs text-slate-500">Syndicate to LinkedIn Free Job Slots.</div>
                              </div>
                           </div>
                           <input type="checkbox" checked={formData.platforms.linkedin} onChange={e=>setFormData({...formData, platforms: {...formData.platforms, linkedin: e.target.checked}})} className="w-5 h-5 rounded text-blue-600" />
                        </label>

                        <label className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-colors ${formData.platforms.indeed ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'border-slate-200 dark:border-slate-700'}`}>
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold italic">I</div>
                              <div>
                                 <div className="font-bold text-slate-900 dark:text-white">Indeed</div>
                                 <div className="text-xs text-slate-500">Syndicate to Indeed Organic search.</div>
                              </div>
                           </div>
                           <input type="checkbox" checked={formData.platforms.indeed} onChange={e=>setFormData({...formData, platforms: {...formData.platforms, indeed: e.target.checked}})} className="w-5 h-5 rounded text-blue-600" />
                        </label>
                     </div>
                  </div>
               )}

               {currentStep === 4 && (
                  <div className="flex flex-col gap-6 animate-in slide-in-from-right-4 duration-300">
                     <div className="text-center py-8">
                        <div className="w-20 h-20 bg-green-100 dark:bg-green-500/20 text-green-600 flex items-center justify-center rounded-full mx-auto mb-6">
                           <Check size={40} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Ready to Publish!</h2>
                        <p className="text-sm text-slate-500 max-w-md mx-auto">Your job posting for <b>{formData.title || "Untitled Job"}</b> is fully configured. It will be posted to the selected boards immediately.</p>
                     </div>
                  </div>
               )}

            </div>

            {/* Footer Buttons */}
            <div className="border-t border-slate-200 dark:border-slate-800 p-4 sm:px-8 bg-slate-50 dark:bg-slate-800/30 flex justify-between items-center rounded-b-xl shrink-0 mt-auto">
               <button 
                  onClick={prevStep} 
                  disabled={currentStep === 0 || isSubmitting}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
               >
                  <ChevronLeft size={16} /> Back
               </button>
               
               {currentStep < STEPS.length - 1 ? (
                  <button 
                     onClick={nextStep}
                     className="px-6 py-2.5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-lg text-sm font-bold hover:bg-slate-800 dark:hover:bg-slate-100 shadow-sm transition-colors flex items-center gap-2"
                  >
                     Continue <ChevronRight size={16} />
                  </button>
               ) : (
                  <button 
                     onClick={handleFinish}
                     disabled={isSubmitting}
                     className="px-8 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-sm transition-colors flex items-center gap-2 shadow-blue-500/30"
                  >
                     {isSubmitting ? "Publishing..." : "Publish Job Post"} 
                     {!isSubmitting && <Sparkles size={16} />}
                  </button>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}
