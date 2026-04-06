"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  WelcomeScreen, PersonalInfoStep, TaxDocumentsStep, 
  DirectDepositStep, I9Step, SignDocumentsStep, CompletionScreen 
} from "./WizardSteps";

interface Props {
  payload: {
    employeeId: string | number;
    email: string;
  };
}

export default function OnboardingWizard({ payload }: Props) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    personal: {
       legalName: "",
       preferredName: "",
       pronouns: "",
       homeAddress: "",
       emergencyContact: ""
    },
    tax: {
       filingStatus: "",
       multipleJobs: false,
       exempt: false,
    },
    bank: {
       routingNumber: "",
       accountNumber: "",
       bankName: "",
    },
    i9: {
       citizenshipStatus: "",
       attested: false
    },
    docs: []
  });

  // Mock metadata that would usually come from the DB linked to the employeeId
  const companyName = "CircleWorks";
  const employeeName = "Alex Rivera"; // This would normally be fetched from the API with the employeeId

  const handleNext = (stepData: any) => {
    setData((prev) => ({ ...prev, ...stepData }));
    setStep((prev) => prev + 1);
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
    window.scrollTo(0, 0);
  };

  const steps = [
    { title: "Welcome", component: WelcomeScreen },
    { title: "Personal Info", component: PersonalInfoStep },
    { title: "Tax Documents", component: TaxDocumentsStep },
    { title: "Direct Deposit", component: DirectDepositStep },
    { title: "I-9 Verification", component: I9Step },
    { title: "Sign Documents", component: SignDocumentsStep },
    { title: "Completion", component: CompletionScreen },
  ];

  const CurrentStepComponent = steps[step].component;
  const progress = (step / (steps.length - 1)) * 100;

  return (
    <div className="max-w-[720px] mx-auto pt-10 pb-20 px-6">
      {/* Progress Bar Header */}
      {step > 0 && step < steps.length - 1 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3 text-[13px] font-bold text-slate-500 uppercase tracking-widest">
            <span>Step {step} of {steps.length - 2}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
             <motion.div 
               className="h-full bg-blue-600"
               initial={{ width: 0 }}
               animate={{ width: `${progress}%` }}
               transition={{ duration: 0.5, ease: "circOut" }}
             />
          </div>
          <p className="mt-4 text-[15px] font-bold text-slate-900 dark:text-white">
             {steps[step].title}
          </p>
        </div>
      )}

      {/* Wizard Content */}
      <div className="bg-white dark:bg-slate-950/50 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl shadow-xl shadow-slate-200/20 dark:shadow-none p-8 md:p-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.25 }}
          >
            <CurrentStepComponent 
              onNext={handleNext}
              onBack={step > 1 ? handleBack : undefined}
              data={data}
              companyName={companyName}
              employeeName={employeeName}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Safety Note */}
      {step < steps.length - 1 && (
        <div className="mt-8 flex items-center justify-center gap-2 text-slate-400 text-[12px]">
           <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
           Your progress is auto-saved.
        </div>
      )}
    </div>
  );
}
