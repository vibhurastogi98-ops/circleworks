"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronRight, ChevronLeft, Check, Save, Sparkles, GripVertical, Plus, AlertCircle, Briefcase, ArrowLeft } from "lucide-react";
import { getJobById, AtsJob, mockAtsJobs } from "@/data/mockAts";
import { getBanTheBoxJurisdiction } from "@/utils/compliance";
import { toast } from "sonner";

const STEPS = ["Job Details", "Description", "Application Form", "Posting Settings"];

export default function EditJobPage() {
  const { id } = useParams();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState<any>({
    title: "", department: "", location: "", type: "Full-Time", model: "Hybrid", salaryMin: "", salaryMax: "",
    description: "",
    questions: [],
    platforms: { linkedin: true, indeed: true, website: true }
  });

  useEffect(() => {
    const job = getJobById(id as string);
    if (job) {
      setFormData({
        ...formData,
        title: job.title,
        department: job.department,
        location: job.location,
        type: job.type,
        salaryMin: job.salaryMin.toString(),
        salaryMax: job.salaryMax.toString(),
        // Mocking questions since they aren't in the base AtsJob yet but we want them for the wizard
        questions: [
            { id: 1, text: "Why do you want to work here?", type: "text", required: true },
            { id: 2, text: "Link to portfolio or Github", type: "text", required: false }
        ]
      });
    }
    setLoading(false);
  }, [id]);

  const banTheBoxJurisdiction = getBanTheBoxJurisdiction(formData.location);

  const handleSave = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      // In real app, this would be a PATCH request
      const index = mockAtsJobs.findIndex(j => j.id === id);
      if (index !== -1) {
          mockAtsJobs[index] = {
              ...mockAtsJobs[index],
              title: formData.title,
              department: formData.department,
              location: formData.location,
              type: formData.type,
              salaryMin: parseInt(formData.salaryMin),
              salaryMax: parseInt(formData.salaryMax)
          };
      }

      toast.success("Job updated successfully", {
          description: "All changes have been synced to active job boards."
      });
      router.push(`/hiring/jobs/${id}`);
    }, 1000);
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  if (loading) return <div className="p-8 text-center text-slate-500">Loading job details...</div>;

  const job = getJobById(id as string);
  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <Briefcase className="text-slate-400" size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Job Not Found</h2>
        <Link href="/hiring/jobs" className="text-blue-600 font-bold hover:underline">Back to All Jobs</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto animate-in fade-in duration-500 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <div className="flex items-center text-sm text-slate-500 mb-2 gap-2">
              <Link href="/hiring/jobs" className="hover:text-slate-900 transition-colors">Jobs</Link>
              <ChevronRight size={14} />
              <Link href={`/hiring/jobs/${id}`} className="hover:text-slate-900 transition-colors truncate max-w-[150px]">{job.title}</Link>
              <ChevronRight size={14} />
              <span className="font-bold text-slate-900">Edit Details</span>
           </div>
           <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Edit Job Posting</h1>
        </div>
        <div className="flex items-center gap-3">
           <button 
              onClick={() => router.back()}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
           >
              Cancel
           </button>
           <button 
              onClick={handleSave}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-lg text-sm font-bold shadow-sm hover:opacity-90 transition-opacity"
           >
              <Save size={16} /> {isSubmitting ? "Saving..." : "Save Changes"}
           </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
         
         {/* Sidebar Navigation */}
         <div className="w-full md:w-64 shrink-0 flex flex-col gap-2">
            {STEPS.map((step, idx) => (
               <button 
                  key={idx} 
                  onClick={() => setCurrentStep(idx)}
                  className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                     currentStep === idx 
                        ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400 font-bold shadow-sm" 
                        : "bg-transparent border-transparent text-slate-500 hover:bg-slate-50"
                  }`}
               >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                     currentStep === idx ? "bg-blue-600 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                  }`}>
                     {idx + 1}
                  </div>
                  <span className="text-sm">{step}</span>
               </button>
            ))}
         </div>

         {/* Form Content */}
         <div className="flex-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col relative min-h-[500px]">
            
            <div className="p-6 sm:p-8 flex-1">
               {currentStep === 0 && (
                  <div className="flex flex-col gap-6 animate-in slide-in-from-right-4 duration-300">
                     <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Basic Information</h2>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="sm:col-span-2">
                           <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Job Title</label>
                           <input type="text" value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div>
                           <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                           <select value={formData.department} onChange={e=>setFormData({...formData, department: e.target.value})} className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none">
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
                           <input type="text" value={formData.location} onChange={e=>setFormData({...formData, location: e.target.value})} className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div>
                           <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Salary Min</label>
                           <input type="number" value={formData.salaryMin} onChange={e=>setFormData({...formData, salaryMin: e.target.value})} className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div>
                           <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Salary Max</label>
                           <input type="number" value={formData.salaryMax} onChange={e=>setFormData({...formData, salaryMax: e.target.value})} className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                     </div>
                  </div>
               )}

               {currentStep === 1 && (
                  <div className="flex flex-col gap-6 animate-in slide-in-from-right-4 duration-300 h-full flex-1">
                     <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Job Description</h2>
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 hover:bg-purple-200 transition-colors rounded-lg text-sm font-bold shadow-sm">
                           <Sparkles size={16} /> Regenerate with AI
                        </button>
                     </div>
                     <textarea 
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        className="w-full flex-1 min-h-[350px] border border-slate-300 dark:border-slate-700 rounded-lg p-4 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm leading-relaxed"
                        placeholder="Write the job description here..."
                     />
                  </div>
               )}

               {currentStep === 2 && (
                  <div className="flex flex-col gap-6 animate-in slide-in-from-right-4 duration-300">
                     <h2 className="text-xl font-bold text-slate-900 dark:text-white">Application Questions</h2>
                     <p className="text-sm text-slate-500">Add or remove fields that candidates must complete during application.</p>
                     
                     {banTheBoxJurisdiction && (
                        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex gap-3 text-amber-800 dark:text-amber-400">
                           <AlertCircle size={20} className="shrink-0 mt-0.5" />
                           <div className="text-sm">
                              <span className="font-bold block mb-1">Regional Compliance Active</span>
                              This job location (<b>{banTheBoxJurisdiction}</b>) has restrictions on criminal history inquiries. We have automatically blocked those fields from the form editor.
                           </div>
                        </div>
                     )}

                     <div className="flex flex-col gap-3">
                        {formData.questions.map((q: any, i: number) => (
                           <div key={q.id} className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-4 rounded-xl group">
                              <GripVertical size={20} className="text-slate-400 mt-2 shrink-0 cursor-move" />
                              <div className="flex-1 flex flex-col gap-3">
                                 <input type="text" value={q.text} onChange={(e) => {
                                    const next = [...formData.questions]; next[i].text = e.target.value; setFormData({...formData, questions: next});
                                 }} className="w-full bg-transparent border-b border-slate-300 dark:border-slate-600 focus:border-blue-500 outline-none px-1 py-1 font-medium text-slate-900 dark:text-white" />
                                 <div className="flex items-center justify-between text-xs">
                                    <div className="flex gap-4">
                                       <span className="text-slate-500">Type: <b>Short Text</b></span>
                                       <span className="text-slate-500">Required: <b>{q.required ? 'Yes' : 'No'}</b></span>
                                    </div>
                                    <button className="text-red-600 font-bold hover:underline">Remove</button>
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                     <button 
                        onClick={() => {
                           const next = [...formData.questions, { id: Date.now(), text: "", type: "text", required: false }];
                           setFormData({...formData, questions: next});
                        }}
                        className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                     >
                        <Plus size={18} /> Add Custom Question
                     </button>
                  </div>
               )}

               {currentStep === 3 && (
                  <div className="flex flex-col gap-6 animate-in slide-in-from-right-4 duration-300">
                     <h2 className="text-xl font-bold text-slate-900 dark:text-white">Job Board Status</h2>
                     <p className="text-sm text-slate-500">Manage where this job is currently published.</p>
                     
                     <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-xl">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center font-bold">CW</div>
                              <div>
                                 <div className="font-bold text-slate-900">Internal Careers Portal</div>
                                 <div className="text-xs text-green-700">Live • Published 14 days ago</div>
                              </div>
                           </div>
                           <button className="text-sm font-bold text-slate-600 hover:text-red-600">Unpublish</button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-xl">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-lg bg-[#0A66C2] text-white flex items-center justify-center font-bold text-lg">in</div>
                              <div>
                                 <div className="font-bold text-slate-900">LinkedIn Free Slots</div>
                                 <div className="text-xs text-green-700">Live • Active Syndication</div>
                              </div>
                           </div>
                           <button className="text-sm font-bold text-slate-600 hover:text-red-600">Unpublish</button>
                        </div>
                     </div>
                  </div>
               )}
            </div>

            {/* Footer Buttons */}
            <div className="border-t border-slate-200 dark:border-slate-800 p-4 sm:px-8 bg-slate-50 dark:bg-slate-800/30 flex justify-between items-center rounded-b-xl shrink-0 mt-auto">
               <button 
                  onClick={prevStep} 
                  disabled={currentStep === 0}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-0 transition-all flex items-center gap-2"
               >
                  <ChevronLeft size={16} /> Previous Step
               </button>
               
               {currentStep < STEPS.length - 1 ? (
                  <button 
                     onClick={nextStep}
                     className="px-6 py-2.5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-lg text-sm font-bold hover:opacity-90 transition-opacity flex items-center gap-2"
                  >
                     Next Step <ChevronRight size={16} />
                  </button>
               ) : (
                  <button 
                     onClick={handleSave}
                     disabled={isSubmitting}
                     className="px-8 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-sm transition-colors flex items-center gap-2 shadow-blue-500/30"
                  >
                     {isSubmitting ? "Syncing..." : "Finalize Changes"} 
                     {!isSubmitting && <Check size={16} />}
                  </button>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}
