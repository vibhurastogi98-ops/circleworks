"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle, ChevronRight, ChevronLeft, Shield, AlertCircle, Info,
  FileText, ArrowRight, Check, AlertTriangle, HelpCircle
} from "lucide-react";

type W4Data = {
  firstName: string;
  lastName: string;
  ssn: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  filingStatus: "Single" | "Married Jointly" | "Head of Household" | "";
  hasMultipleJobs: boolean | null;
  jobOption: "estimator" | "worksheet" | "checkbox" | null;
  children: number;
  otherDependents: number;
  otherIncome: number;
  deductions: number;
  extraWithholding: number;
  signature: string;
  date: string;
};

const initialData: W4Data = {
  firstName: "",
  lastName: "",
  ssn: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  filingStatus: "",
  hasMultipleJobs: null,
  jobOption: null,
  children: 0,
  otherDependents: 0,
  otherIncome: 0,
  deductions: 0,
  extraWithholding: 0,
  signature: "",
  date: new Date().toISOString().split('T')[0],
};

const STEPS = [
  "Personal Info",
  "Multiple Jobs",
  "Dependents",
  "Adjustments",
  "Review & Sign"
];

export default function W4Wizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<W4Data>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const updateData = (fields: Partial<W4Data>) => {
    setData((prev) => ({ ...prev, ...fields }));
  };

  const nextStep = () => setCurrentStep((p) => Math.min(p + 1, STEPS.length - 1));
  const prevStep = () => setCurrentStep((p) => Math.max(p - 1, 0));

  const dependentsTotal = (data.children * 2000) + (data.otherDependents * 500);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/employees/me/w4", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        alert("Failed to submit W-4. Please try again.");
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Withholding Estimator Logic (Simplified)
  // Determine traffic light color based on input (dummy logic for visual effect)
  let trafficLight = "Yellow";
  let trafficMessage = "On track. Fill out all steps.";
  if (data.filingStatus && currentStep > 0) {
    if (data.hasMultipleJobs && data.jobOption === "checkbox") {
      trafficLight = "Green";
      trafficMessage = "Well-covered. Extra withholding checked.";
    } else if (data.extraWithholding > 100) {
      trafficLight = "Green";
      trafficMessage = "Well-covered. Extra voluntary withholding.";
    } else if (data.hasMultipleJobs && !data.jobOption) {
      trafficLight = "Red";
      trafficMessage = "Under-withheld. Action needed on multiple jobs.";
    } else {
      trafficLight = "Yellow";
      trafficMessage = "On track based on inputs.";
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mb-6">
          <CheckCircle size={40} />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">W-4 Submitted</h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-md">
          Your W-4 form has been successfully signed and submitted. A PDF copy has been saved to your employee documents.
        </p>
        <button
          onClick={() => window.location.href = '/me'}
          className="mt-8 px-6 py-2.5 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 items-start relative">
      <div className="flex-1 w-full relative">
        {/* Progress Bar */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Complete Your W-4</h1>
          <div className="flex items-center justify-between relative">
             <div className="absolute left-0 right-0 top-1/2 h-1 bg-slate-200 dark:bg-slate-700 -z-10 -translate-y-1/2 rounded-full" />
             <div
               className="absolute left-0 top-1/2 h-1 bg-violet-600 -z-10 -translate-y-1/2 transition-all duration-500 rounded-full"
               style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
             />
             {STEPS.map((step, idx) => {
               const isActive = currentStep === idx;
               const isPast = currentStep > idx;
               return (
                 <div key={idx} className="flex flex-col items-center gap-2 bg-white dark:bg-slate-900 px-2">
                   <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                     isActive ? "border-violet-600 bg-violet-600 text-white" :
                     isPast ? "border-violet-600 bg-violet-100 dark:bg-violet-900/30 text-violet-600" :
                     "border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 text-slate-400"
                   }`}>
                     {isPast ? <Check size={16} /> : idx + 1}
                   </div>
                   <span className={`text-[11px] font-semibold hidden md:block ${isActive ? "text-violet-600" : isPast ? "text-slate-700 dark:text-slate-300" : "text-slate-400"}`}>
                     {step}
                   </span>
                 </div>
               );
             })}
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 md:p-8 shadow-sm">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {currentStep === 0 && (
                <Step1PersonalInfo data={data} updateData={updateData} />
              )}
              {currentStep === 1 && (
                <Step2MultipleJobs data={data} updateData={updateData} />
              )}
              {currentStep === 2 && (
                <Step3Dependents data={data} updateData={updateData} dependentsTotal={dependentsTotal} />
              )}
              {currentStep === 3 && (
                <Step4Adjustments data={data} updateData={updateData} />
              )}
              {currentStep === 4 && (
                <Step5ReviewSign data={data} updateData={updateData} dependentsTotal={dependentsTotal} />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-10 pt-6 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition ${
                currentStep === 0 ? "opacity-0 pointer-events-none" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
            >
              <ChevronLeft size={18} /> Back
            </button>
            
            {currentStep < STEPS.length - 1 ? (
              <button
                onClick={nextStep}
                className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold transition shadow-sm hover:shadow"
              >
                Continue <ChevronRight size={18} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !data.signature}
                className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-xl font-semibold transition shadow-sm hover:shadow"
              >
                {isSubmitting ? "Submitting..." : "Submit W-4"} <CheckCircle size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar: Withholding Estimator */}
      <div className="w-full lg:w-[320xl] lg:max-w-sm sticky top-6">
        <div className="bg-slate-900 rounded-2xl p-6 text-white overflow-hidden relative shadow-lg">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-3xl rounded-full" />
          <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
            <Shield size={20} className="text-indigo-400" /> Withholding Estimator
          </h3>
          
          <div className="flex flex-col gap-5">
            <div className="p-4 bg-white/10 rounded-xl border border-white/5">
              <div className="text-[13px] text-white/70 mb-2">Estimated Status</div>
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5 p-1.5 bg-black/40 rounded-full">
                  <div className={`w-3 h-3 rounded-full transition-colors ${trafficLight === 'Red' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'bg-red-500/20'}`} />
                  <div className={`w-3 h-3 rounded-full transition-colors ${trafficLight === 'Yellow' ? 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.8)]' : 'bg-yellow-400/20'}`} />
                  <div className={`w-3 h-3 rounded-full transition-colors ${trafficLight === 'Green' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 'bg-green-500/20'}`} />
                </div>
                <span className="font-semibold text-sm">
                  {trafficLight === 'Red' && "Under-withheld"}
                  {trafficLight === 'Yellow' && "On Track"}
                  {trafficLight === 'Green' && "Well-Covered"}
                </span>
              </div>
              <p className="text-[12px] text-white/60 mt-3 leading-relaxed">
                {trafficMessage}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/70">Filing Status</span>
                <span className="font-semibold">{data.filingStatus || "Not Set"}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/70">Dependents</span>
                <span className="font-semibold">{dependentsTotal > 0 ? `$${dependentsTotal}` : "$0"}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/70">Extra Withholding</span>
                <span className="font-semibold">{data.extraWithholding > 0 ? `$${data.extraWithholding}` : "$0"}</span>
              </div>
            </div>
            
            <a href="https://www.irs.gov/individuals/tax-withholding-estimator" target="_blank" rel="noreferrer" className="mt-2 text-[12px] text-indigo-300 hover:text-indigo-200 flex items-center gap-1 transition">
              Use Official IRS Estimator <ArrowRight size={12} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Steps Components ---

function Step1PersonalInfo({ data, updateData }: { data: W4Data, updateData: (d: Partial<W4Data>) => void }) {
  const statuses = ["Single", "Married Jointly", "Head of Household"] as const;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Step 1: Personal Information</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Provide your details and select your anticipated filing status.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">First Name</label>
          <input
            type="text"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-violet-500 outline-none transition"
            value={data.firstName}
            onChange={(e) => updateData({ firstName: e.target.value })}
            placeholder="Legal First Name"
          />
        </div>
        <div>
          <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Last Name</label>
          <input
            type="text"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-violet-500 outline-none transition"
            value={data.lastName}
            onChange={(e) => updateData({ lastName: e.target.value })}
            placeholder="Legal Last Name"
          />
        </div>
      </div>

      <div>
        <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
          Social Security Number <Shield size={14} className="text-green-500" />
        </label>
        <input
          type="password"
          className="w-full max-w-sm px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-violet-500 outline-none transition font-mono"
          value={data.ssn}
          onChange={(e) => updateData({ ssn: e.target.value })}
          placeholder="XXX-XX-XXXX"
        />
        <p className="text-[11px] text-slate-500 mt-1">End-to-end encrypted and securely stored.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="md:col-span-6">
          <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Home Address</label>
          <input
            type="text"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-violet-500 outline-none transition"
            value={data.address}
            onChange={(e) => updateData({ address: e.target.value })}
            placeholder="123 Main St"
          />
        </div>
        <div className="md:col-span-3">
          <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">City</label>
          <input
            type="text"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-violet-500 outline-none transition"
            value={data.city}
            onChange={(e) => updateData({ city: e.target.value })}
          />
        </div>
        <div className="md:col-span-1">
          <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">State</label>
          <input
            type="text"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-violet-500 outline-none transition uppercase"
            maxLength={2}
            value={data.state}
            onChange={(e) => updateData({ state: e.target.value })}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Zip Code</label>
          <input
            type="text"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-violet-500 outline-none transition"
            value={data.zip}
            onChange={(e) => updateData({ zip: e.target.value })}
          />
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
        <label className="block text-sm font-bold text-slate-900 dark:text-white mb-3">Filing Status</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {statuses.map(status => (
            <div
              key={status}
              onClick={() => updateData({ filingStatus: status })}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                data.filingStatus === status
                  ? "border-violet-600 bg-violet-50 dark:bg-violet-900/20"
                  : "border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-700"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex flex-shrink-0 items-center justify-center ${
                  data.filingStatus === status ? "border-violet-600" : "border-slate-300 dark:border-slate-600"
                }`}>
                  {data.filingStatus === status && <div className="w-2.5 h-2.5 rounded-full bg-violet-600" />}
                </div>
                <span className={`text-sm font-semibold ${data.filingStatus === status ? "text-violet-900 dark:text-violet-100" : "text-slate-700 dark:text-slate-300"}`}>
                  {status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Step2MultipleJobs({ data, updateData }: { data: W4Data, updateData: (d: Partial<W4Data>) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Step 2: Multiple Jobs or Spouse Works</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Complete this step if you hold more than one job at a time, or are married filing jointly and your spouse also works.</p>
      </div>

      <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <p className="text-[15px] font-semibold text-slate-900 dark:text-white mb-4">
          Do you have multiple jobs or does your spouse work?
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => updateData({ hasMultipleJobs: true })}
            className={`px-6 py-2.5 rounded-lg border-2 font-semibold transition ${data.hasMultipleJobs === true ? "border-violet-600 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300" : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
          >
            Yes
          </button>
          <button
            onClick={() => updateData({ hasMultipleJobs: false, jobOption: null })}
            className={`px-6 py-2.5 rounded-lg border-2 font-semibold transition ${data.hasMultipleJobs === false ? "border-violet-600 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300" : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
          >
            No
          </button>
        </div>
      </div>

      {data.hasMultipleJobs === true && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-4 overflow-hidden"
          >
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Choose ONE of the following options to ensure accurate withholding:</p>
            
            <label className={`block p-4 rounded-xl border-2 cursor-pointer transition ${data.jobOption === 'estimator' ? 'border-violet-600 bg-violet-50 dark:bg-violet-900/10' : 'border-slate-200 dark:border-slate-700'}`}>
              <div className="flex gap-3">
                <input type="radio" className="mt-1 w-4 h-4 text-violet-600 focus:ring-violet-500" checked={data.jobOption === 'estimator'} onChange={() => updateData({ jobOption: 'estimator' })} />
                <div>
                  <div className="font-bold text-slate-900 dark:text-white text-[15px]">Option A: Use the Official Estimator</div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Most accurate and private. Use the IRS Tax Withholding Estimator online, then enter the generated values in Step 4.</p>
                </div>
              </div>
            </label>

            <label className={`block p-4 rounded-xl border-2 cursor-pointer transition ${data.jobOption === 'worksheet' ? 'border-violet-600 bg-violet-50 dark:bg-violet-900/10' : 'border-slate-200 dark:border-slate-700'}`}>
              <div className="flex gap-3">
                <input type="radio" className="mt-1 w-4 h-4 text-violet-600 focus:ring-violet-500" checked={data.jobOption === 'worksheet'} onChange={() => updateData({ jobOption: 'worksheet' })} />
                <div>
                  <div className="font-bold text-slate-900 dark:text-white text-[15px]">Option B: Use the Multiple Jobs Worksheet</div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Use the worksheet on page 3 of the IRS instructions to calculate extra withholding to enter in Step 4c.</p>
                </div>
              </div>
            </label>

            <label className={`block p-4 rounded-xl border-2 cursor-pointer transition ${data.jobOption === 'checkbox' ? 'border-violet-600 bg-violet-50 dark:bg-violet-900/10' : 'border-slate-200 dark:border-slate-700'}`}>
              <div className="flex gap-3">
                <input type="radio" className="mt-1 w-4 h-4 text-violet-600 focus:ring-violet-500" checked={data.jobOption === 'checkbox'} onChange={() => updateData({ jobOption: 'checkbox' })} />
                <div>
                  <div className="font-bold text-slate-900 dark:text-white text-[15px]">Option C: Check This Box</div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">If there are only two jobs total, you may check this box. Do the same on form W-4 for the other job. This option is generally more accurate than Option B for similar paying jobs. You may withhold more tax than necessary.</p>
                </div>
              </div>
            </label>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

function Step3Dependents({ data, updateData, dependentsTotal }: { data: W4Data, updateData: (d: Partial<W4Data>) => void, dependentsTotal: number }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Step 3: Claim Dependents</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">If your total income will be $200,000 or less ($400,000 or less if married filing jointly):</p>
      </div>

      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-xl flex gap-3 text-sm">
        <Info size={18} className="flex-shrink-0 mt-0.5" />
        <p>Complete this step only for your highest paying job. Leave blank for other jobs to avoid under-withholding.</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <div>
            <div className="font-bold text-[15px] text-slate-900 dark:text-white">Qualifying children under 17</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Multiply the number of children by $2,000</div>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="number"
              min={0}
              value={data.children}
              onChange={(e) => updateData({ children: parseInt(e.target.value) || 0 })}
              className="w-20 px-3 py-2 text-center rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 font-bold"
            />
            <div className="w-20 text-right font-bold text-slate-900 dark:text-white text-lg">
              ${(data.children * 2000).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <div>
            <div className="font-bold text-[15px] text-slate-900 dark:text-white">Other dependents</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Multiply the number of other dependents by $500</div>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="number"
              min={0}
              value={data.otherDependents}
              onChange={(e) => updateData({ otherDependents: parseInt(e.target.value) || 0 })}
              className="w-20 px-3 py-2 text-center rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 font-bold"
            />
            <div className="w-20 text-right font-bold text-slate-900 dark:text-white text-lg">
              ${(data.otherDependents * 500).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-between items-center p-5 bg-slate-900 rounded-xl text-white">
        <span className="font-bold text-lg">Total Dependent Deduction</span>
        <span className="text-2xl font-black text-green-400">${dependentsTotal.toLocaleString()}</span>
      </div>
    </div>
  );
}

function Step4Adjustments({ data, updateData }: { data: W4Data, updateData: (d: Partial<W4Data>) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Step 4: Other Adjustments (Optional)</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Complete this step if you have other income, deductions, or want extra tax withheld.</p>
      </div>

      <div className="space-y-5">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <label className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex-1">
              <span className="font-bold text-[15px] text-slate-900 dark:text-white block">4a. Other Income (not from jobs)</span>
              <span className="text-sm text-slate-500 dark:text-slate-400 block mt-1">If you want tax withheld for other income you expect this year that won't have withholding, enter the amount of other income here. Include interest, dividends, and retirement income.</span>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
              <input
                type="number"
                min={0}
                value={data.otherIncome || ''}
                onChange={(e) => updateData({ otherIncome: parseInt(e.target.value) || 0 })}
                className="w-32 pl-7 pr-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 font-bold outline-none focus:ring-2 focus:ring-violet-500"
                placeholder="0"
              />
            </div>
          </label>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <label className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex-1">
              <span className="font-bold text-[15px] text-slate-900 dark:text-white block">4b. Deductions</span>
              <span className="text-sm text-slate-500 dark:text-slate-400 block mt-1">If you expect to claim deductions other than the standard deduction and want to reduce your withholding, use the Deductions Worksheet and enter the result here.</span>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
              <input
                type="number"
                min={0}
                value={data.deductions || ''}
                onChange={(e) => updateData({ deductions: parseInt(e.target.value) || 0 })}
                className="w-32 pl-7 pr-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 font-bold outline-none focus:ring-2 focus:ring-violet-500"
                placeholder="0"
              />
            </div>
          </label>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-violet-50/50 dark:bg-violet-900/10">
          <label className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex-1">
              <span className="font-bold text-[15px] text-violet-900 dark:text-violet-100 block">4c. Extra Withholding</span>
              <span className="text-sm text-violet-700/80 dark:text-violet-300/80 block mt-1">Enter any additional tax you want withheld <strong>each pay period</strong>. This is often calculated from Step 2.</span>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-600 font-bold">$</span>
              <input
                type="number"
                min={0}
                value={data.extraWithholding || ''}
                onChange={(e) => updateData({ extraWithholding: parseInt(e.target.value) || 0 })}
                className="w-32 pl-7 pr-3 py-2.5 rounded-lg border border-violet-300 dark:border-violet-600 bg-white dark:bg-slate-900 font-bold outline-none focus:ring-2 focus:ring-violet-500 text-violet-900 dark:text-violet-100"
                placeholder="0"
              />
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}

function Step5ReviewSign({ data, updateData, dependentsTotal }: { data: W4Data, updateData: (d: Partial<W4Data>) => void, dependentsTotal: number }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Step 5: Review & Sign</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Review your generated W-4 form and provide your electronic signature.</p>
      </div>

      {/* Styled W-4 Preview */}
      <div className="bg-white border-2 border-slate-300 rounded-lg p-6 shadow-sm font-sans text-black select-none">
        <div className="border-b-4 border-black pb-4 mb-4 flex justify-between items-end">
          <div className="w-1/4">
            <div className="font-bold text-2xl mb-1">W-4</div>
            <div className="text-[10px] leading-tight">Department of the Treasury<br/>Internal Revenue Service</div>
          </div>
          <div className="text-center w-1/2 px-4">
            <div className="font-black text-xl leading-tight">Employee's Withholding Certificate</div>
            <div className="text-[11px] mt-2">▶ Complete Form W-4 so that your employer can withhold the correct federal income tax from your pay.<br/>▶ Give Form W-4 to your employer.<br/>▶ Your withholding is subject to review by the IRS.</div>
          </div>
          <div className="text-right w-1/4">
            <div className="font-bold mb-1">OMB No. 1545-0074</div>
            <div className="text-xl font-black">2024</div>
          </div>
        </div>

        <div className="flex border-b border-black text-xs font-bold bg-gray-100 rounded-t-sm">
          <div className="p-1 px-2 border-r border-black w-14 bg-black text-white text-center">Step 1</div>
          <div className="p-1 px-2">Personal Information</div>
        </div>
        <div className="flex border-b border-black text-sm">
          <div className="flex-1 border-r border-black p-2 bg-[#fdfdfd]">
            <div className="text-[10px] uppercase text-gray-500 font-bold mb-1">(a) First name and middle initial</div>
            <div className="font-mono bg-blue-50/50 p-1 min-h-[28px] uppercase">{data.firstName}</div>
            
            <div className="text-[10px] uppercase text-gray-500 font-bold mt-2 mb-1">Address</div>
            <div className="font-mono bg-blue-50/50 p-1 min-h-[28px] uppercase">{data.address}</div>
            
            <div className="text-[10px] uppercase text-gray-500 font-bold mt-2 mb-1">City, state, and ZIP code</div>
            <div className="font-mono bg-blue-50/50 p-1 min-h-[28px] uppercase">{data.city}, {data.state} {data.zip}</div>
          </div>
          <div className="w-1/3 flex flex-col">
            <div className="flex-1 border-b border-black p-2 bg-[#fdfdfd]">
               <div className="text-[10px] uppercase text-gray-500 font-bold mb-1">(b) Social security number</div>
               <div className="font-mono bg-blue-50/50 p-1 uppercase">***-**-****</div>
            </div>
            <div className="flex-2 p-2 relative bg-[#fdfdfd]">
               <div className="text-[10px] uppercase text-gray-500 font-bold mb-1">(c) Filing Status</div>
               <div className="font-bold text-[11px] flex items-center gap-1"><div className="w-3 h-3 border border-black rounded-sm flex items-center justify-center">{data.filingStatus === 'Single' && 'X'}</div> Single or Married filing sep.</div>
               <div className="font-bold text-[11px] flex items-center gap-1 mt-1"><div className="w-3 h-3 border border-black rounded-sm flex items-center justify-center">{data.filingStatus === 'Married Jointly' && 'X'}</div> Married filing jointly</div>
               <div className="font-bold text-[11px] flex items-center gap-1 mt-1"><div className="w-3 h-3 border border-black rounded-sm flex items-center justify-center">{data.filingStatus === 'Head of Household' && 'X'}</div> Head of household</div>
            </div>
          </div>
        </div>

        <div className="flex border-b border-black text-xs font-bold mt-2">
          <div className="p-1 px-2 border-r border-black w-14 bg-black text-white text-center">Step 2</div>
          <div className="p-1 px-2 flex-1">Multiple Jobs or Spouse Works</div>
          <div className="p-1 border-l border-black w-24 text-center">Checkbox ✓</div>
        </div>
        <div className="p-2 border-b border-black text-xs flex justify-between bg-[#fdfdfd]">
          <div><span className="font-bold">(c)</span> If there are only two jobs total, you may check this box.</div>
          <div className="w-4 h-4 border-2 border-black rounded-sm flex items-center justify-center mr-8 bg-blue-50/50">{data.jobOption === 'checkbox' && 'X'}</div>
        </div>

        <div className="flex border-b border-black text-xs font-bold mt-2">
          <div className="p-1 px-2 border-r border-black w-14 bg-black text-white text-center">Step 3</div>
          <div className="p-1 px-2 flex-1">Claim Dependents</div>
          <div className="p-1 border-l border-black w-24 text-center">Total</div>
        </div>
        <div className="flex border-b border-black text-xs bg-[#fdfdfd]">
          <div className="flex-1 p-2">Multiply children by $2,000. Multiply other dependents by $500. Add the amounts.</div>
          <div className="w-24 border-l border-black p-2 font-mono text-right bg-blue-50/50">{dependentsTotal > 0 ? dependentsTotal : ''}</div>
        </div>

        <div className="flex border-b border-black text-xs font-bold mt-2">
          <div className="p-1 px-2 border-r border-black w-14 bg-black text-white text-center">Step 4</div>
          <div className="p-1 px-2 flex-1">Other Adjustments</div>
          <div className="p-1 border-l border-black w-24"></div>
        </div>
        <div className="flex border-b border-black text-xs bg-[#fdfdfd]">
          <div className="flex-1 p-2"><span className="font-bold">(a) Other income.</span> Enter the amount here.</div>
          <div className="w-24 border-l border-black p-2 font-mono text-right bg-blue-50/50">{data.otherIncome > 0 ? data.otherIncome : ''}</div>
        </div>
        <div className="flex border-b border-black text-xs bg-[#fdfdfd]">
          <div className="flex-1 p-2"><span className="font-bold">(b) Deductions.</span> Enter the result here.</div>
          <div className="w-24 border-l border-black p-2 font-mono text-right bg-blue-50/50">{data.deductions > 0 ? data.deductions : ''}</div>
        </div>
        <div className="flex border-b border-black text-xs bg-[#fdfdfd]">
          <div className="flex-1 p-2"><span className="font-bold">(c) Extra withholding.</span> Enter any additional tax you want withheld each pay period.</div>
          <div className="w-24 border-l border-black p-2 font-mono text-right bg-blue-50/50">{data.extraWithholding > 0 ? data.extraWithholding : ''}</div>
        </div>
      </div>

      {/* Signature Section */}
      <div className="p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
        <h3 className="font-bold text-slate-900 dark:text-white mb-2">Electronic Signature</h3>
        <p className="text-sm text-slate-500 mb-6">Under penalties of perjury, I declare that this certificate, to the best of my knowledge and belief, is true, correct, and complete.</p>
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Type your full legal name</label>
            <input
              type="text"
              value={data.signature}
              onChange={(e) => updateData({ signature: e.target.value })}
              className="w-full px-4 py-3 border-b-2 border-slate-300 dark:border-slate-600 bg-transparent text-lg font-serif italic outline-none focus:border-violet-600 text-slate-900 dark:text-white transition"
              placeholder={`${data.firstName} ${data.lastName}`}
            />
          </div>
          <div className="w-full md:w-1/3">
            <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Date</label>
            <input
              type="date"
              value={data.date}
              onChange={(e) => updateData({ date: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
