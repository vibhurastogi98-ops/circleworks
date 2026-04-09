"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronLeft, Check, UploadCloud, Landmark, ShieldCheck, Loader2, ArrowRight } from "lucide-react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useEmployees } from "@/hooks/useEmployees";
import { usePlaidLink } from "react-plaid-link";

import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const STEPS = ["Personal Info", "Employment", "Compensation", "Tax & Banking"];

export default function AddEmployeeWizard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { currentUser } = useDashboardData();
  const { data: employees = [], addEmployeeAsync, isAdding } = useEmployees();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    personalEmail: "",
    workEmail: "",
    jobTitle: "",
    department: "",
    managerId: "",
    startDate: "",
    type: "Full-Time",
    locationType: "Remote",
    salary: "",
    payFrequency: "Bi-Weekly",
    bankName: "",
    accountNumber: "",
    routingNumber: "",
    plaidAccessToken: "",
  });

  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    const createLinkToken = async () => {
      try {
        const response = await fetch("/api/plaid/create-link-token", { method: "POST" });
        const data = await response.json();
        setLinkToken(data.link_token);
      } catch (err) {
        console.error("Link Token Error:", err);
      }
    };
    createLinkToken();
  }, []);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async (public_token, metadata) => {
      try {
        const response = await fetch("/api/plaid/exchange-public-token", {
          method: "POST",
          body: JSON.stringify({ public_token }),
        });
        const data = await response.json();
        if (data.account) {
          setFormData(f => ({
            ...f,
            bankName: data.account.name || metadata.institution?.name || "Connected Bank",
            routingNumber: data.account.routing || "********",
            accountNumber: data.account.account || "********",
            plaidAccessToken: data.access_token
          }));
          toast.success(`Connected to ${metadata.institution?.name || "your bank"}!`);
        }
      } catch (err) {
        console.error("Exchange Error:", err);
        toast.error("Failed to link bank account.");
      }
    },
  });
  
  // Basic validation per step
  const validateStep = (step: number) => {
    switch(step) {
      case 0:
        return formData.firstName.length > 0 && formData.lastName.length > 0 && formData.personalEmail.length > 0;
      case 1:
        return formData.jobTitle.length > 0 && formData.startDate.length > 0;
      case 2:
        return formData.salary.length > 0;
      case 3:
        // Banking info is optional — employee can fill it in later
        return true;
      default:
        return true;
    }
  };

  const handleNext = async () => {
    if (validateStep(currentStep)) {
      if (currentStep < STEPS.length - 1) {
        // Move to next step
        const nextStep = currentStep + 1;
        setCurrentStep(nextStep);
        
        // Auto-fill work email based on company domain if moving from personal info step
        if (currentStep === 0 && !formData.workEmail) {
          const domain = currentUser?.companyName?.toLowerCase().replace(/[^a-z0-9]/g, "") || "company";
          setFormData(f => ({ ...f, workEmail: `${formData.firstName.toLowerCase()}.${formData.lastName.toLowerCase()}@${domain}.com` }));
        }
      } else {
        // Complete wizard - FINAL STEP - REAL API CALL
        if (isSubmitting) return; // Prevent duplicate submissions
        
        setIsSubmitting(true);
        
        const payload = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.workEmail || formData.personalEmail,
          jobTitle: formData.jobTitle,
          department: formData.department,
          managerId: formData.managerId ? parseInt(formData.managerId) : null,
          employmentType: formData.type.toLowerCase(), // Convert "Full-Time" to "full-time", "Part-Time" to "part-time", etc.
          startDate: formData.startDate,
          salary: formData.salary ? parseInt(formData.salary) : null,
          locationType: formData.locationType,
          bankInfo: {
            bankName: formData.bankName,
            routingNumber: formData.routingNumber,
            accountNumberMasked: formData.accountNumber,
            plaidAccessToken: formData.plaidAccessToken,
          },
          compensation: {
            salary: formData.salary ? parseInt(formData.salary) : null,
            payFrequency: formData.payFrequency,
          }
        };

        console.log("FORM DATA", payload);

        try {
          console.log("Submitting employee data:", payload);
          await addEmployeeAsync(payload);
          // Invalidate both employees and dashboard so counts update immediately
          queryClient.invalidateQueries({ queryKey: ['employees'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
          toast.success(`${formData.firstName} ${formData.lastName} has been added!`);
          router.push("/employees");
        } catch (error) {
          console.error("Save error:", error);
          toast.error("Failed to save employee. Please check your connection.");
          setIsSubmitting(false);
        }
      }
    } else {
      toast.error("Please fill in the required fields to proceed.");
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <Link href="/employees" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors w-fit">
          <ChevronLeft size={16} /> Back to Directory
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Add New Employee</h1>
      </div>

      {/* Wizard Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[500px]">
        {/* Progress Sidebar */}
        <div className="w-full md:w-64 bg-slate-50 dark:bg-slate-800/50 p-6 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 flex flex-col gap-6">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider hidden md:block">Steps</h2>
          <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-visible">
            {STEPS.map((step, idx) => {
              const isActive = currentStep === idx;
              const isPast = currentStep > idx;
              return (
                <div key={step} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors flex-shrink-0
                    ${isActive ? "border-blue-600 bg-blue-600 text-white" : 
                      isPast ? "border-green-500 bg-green-500 text-white" : 
                      "border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-600 bg-transparent"}`}
                  >
                    {isPast ? <Check size={16} /> : idx + 1}
                  </div>
                  <div className="flex flex-col whitespace-nowrap">
                    <span className={`text-sm font-medium ${isActive ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"}`}>
                      {step}
                    </span>
                  </div>
                  {idx < STEPS.length - 1 && <div className="hidden md:block absolute w-0.5 h-6 bg-slate-200 dark:bg-slate-700 left-[27px] mt-[44px]" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 p-6 sm:p-8 flex flex-col">
          <div className="flex-1">
            {currentStep === 0 && (
              <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-right-4 duration-500">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3">Personal Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">First Name <span className="text-red-500">*</span></label>
                    <input type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500" placeholder="Jane" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Last Name <span className="text-red-500">*</span></label>
                    <input type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500" placeholder="Doe" />
                  </div>
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Personal Email <span className="text-red-500">*</span></label>
                    <input type="email" value={formData.personalEmail} onChange={e => setFormData({...formData, personalEmail: e.target.value})} className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500" placeholder="jane.doe@gmail.com" />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-right-4 duration-500">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3">Employment Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Job Title <span className="text-red-500">*</span></label>
                    <input type="text" value={formData.jobTitle} onChange={e => setFormData({...formData, jobTitle: e.target.value})} className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500" placeholder="e.g. Senior Designer" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Department</label>
                    <select value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500">
                      <option value="">Select Dept</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Design">Design</option>
                      <option value="Sales">Sales</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Reports To (Manager)</label>
                    <select 
                      value={formData.managerId} 
                      onChange={e => setFormData({...formData, managerId: e.target.value})} 
                      className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">No Manager (Root)</option>
                      {employees.map((emp: any) => (
                        <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.jobTitle})</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Work Email (Auto-generated)</label>
                    <input type="email" value={formData.workEmail} onChange={e => setFormData({...formData, workEmail: e.target.value})} className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Start Date <span className="text-red-500">*</span></label>
                    <input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 text-slate-500 dark:text-slate-400" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Type</label>
                    <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500">
                      <option value="Full-Time">Full-Time</option>
                      <option value="Part-Time">Part-Time</option>
                      <option value="Contractor">Contractor</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-right-4 duration-500">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3">Compensation</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Base Salary / Rate <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                      <input type="number" value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} className="w-full pl-8 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500" placeholder="80000" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Pay Frequency</label>
                    <select value={formData.payFrequency} onChange={e => setFormData({...formData, payFrequency: e.target.value})} className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500">
                      <option value="Weekly">Weekly</option>
                      <option value="Bi-Weekly">Bi-Weekly</option>
                      <option value="Semi-Monthly">Semi-Monthly</option>
                      <option value="Monthly">Monthly</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Tax & Banking Information</h3>
                  <button 
                    onClick={() => open()} 
                    disabled={!ready}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-blue-600 text-white rounded-lg text-sm font-bold shadow-sm hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    <Landmark size={16} /> Link Bank with Plaid
                  </button>
                </div>
                
                {formData.plaidAccessToken && (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-800 flex items-center justify-center text-emerald-600">
                       <ShieldCheck size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Bank Linked Successfully</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Payroll will be deposited to {formData.bankName}</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Bank Name <span className="text-red-500">*</span></label>
                    <input type="text" value={formData.bankName} onChange={e => setFormData({...formData, bankName: e.target.value})} className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500" placeholder="e.g. Chase" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Routing Number <span className="text-red-500">*</span></label>
                    <input type="text" value={formData.routingNumber} onChange={e => setFormData({...formData, routingNumber: e.target.value})} className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500" placeholder="xxxxxxxxx" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Account Number <span className="text-red-500">*</span></label>
                    <input type="password" value={formData.accountNumber} onChange={e => setFormData({...formData, accountNumber: e.target.value})} className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500" placeholder="•••••••••" />
                  </div>

                  <div className="sm:col-span-2 mt-4 p-4 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <UploadCloud className="text-slate-400" size={24} />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Upload W-4 Form Document</span>
                    <span className="text-xs text-slate-500">(Optional for now)</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <button 
              onClick={() => setCurrentStep(s => Math.max(0, s - 1))}
              disabled={currentStep === 0}
              className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Back
            </button>
            <button 
              onClick={handleNext}
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : currentStep === STEPS.length - 1 ? (
                <>Complete & Invite <Check size={16} /></>
              ) : (
                <>Next <ArrowRight size={16} /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
