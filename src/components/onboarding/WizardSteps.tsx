"use client";

import React, { useEffect, useState } from "react";
import { User, MapPin, Briefcase, FileText, CheckCircle, ArrowRight, ArrowLeft, Building, CreditCard, ShieldCheck, PenTool, CalendarDays, IdCard, Loader2 } from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { usePlaidLink } from "react-plaid-link";
import NewHirePacket from "@/components/onboarding/NewHirePacket";
import type { OnboardingData, OnboardingMetadata } from "@/components/onboarding/types";

interface StepProps {
  onNext: (data: Partial<OnboardingData>) => void;
  onBack?: () => void;
  data: OnboardingData;
  metadata: OnboardingMetadata;
}

function formatStartDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// ---------------------------------------------------------
// STEP 0: Welcome Screen
// ---------------------------------------------------------
export function WelcomeScreen({ onNext, metadata }: StepProps) {
  return (
    <div className="flex flex-col items-center text-center py-8">
      <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400">
        <Briefcase size={32} />
      </div>
      <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
        Welcome to {metadata.companyName}, {metadata.firstName}!
      </h2>
      <p className="text-slate-600 dark:text-slate-400 max-w-md mb-8">
        Complete these 5 steps before {formatStartDate(metadata.startDate)} so you're ready to go on day one.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg mb-10">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-start gap-3 text-left">
          <CalendarDays size={18} className="text-blue-500 mt-0.5" />
          <div>
             <p className="text-[12px] font-bold text-slate-500 uppercase">Start Date</p>
             <p className="text-[15px] text-slate-900 dark:text-white font-medium">{formatStartDate(metadata.startDate)}</p>
          </div>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-start gap-3 text-left">
          <MapPin size={18} className="text-blue-500 mt-0.5" />
          <div>
             <p className="text-[12px] font-bold text-slate-500 uppercase">Office Location</p>
             <p className="text-[15px] text-slate-900 dark:text-white font-medium">{metadata.officeLocation}</p>
          </div>
        </div>
        <div className="md:col-span-2 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-3 text-left">
          <img src={metadata.managerPhotoUrl} alt="" className="w-11 h-11 rounded-full bg-slate-100 dark:bg-slate-800 object-cover" />
          <div>
             <p className="text-[12px] font-bold text-slate-500 uppercase">Your Manager</p>
             <p className="text-[15px] text-slate-900 dark:text-white font-medium">{metadata.managerName}</p>
          </div>
        </div>
      </div>

      <button
        onClick={() => onNext({})}
        className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2"
      >
        Start Pre-Boarding <ArrowRight size={18} />
      </button>
      <p className="mt-4 text-[13px] text-slate-400">Estimated time: 10-15 minutes</p>
    </div>
  );
}

// ---------------------------------------------------------
// STEP 1: Personal Info
// ---------------------------------------------------------
export function PersonalInfoStep({ onNext, onBack, data, metadata }: StepProps) {
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [createError, setCreateError] = useState("");
  const [formData, setFormData] = useState(data.personal || {
    legalName: "",
    preferredName: "",
    pronouns: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    homeAddress: "",
    city: "",
    state: "",
    zip: "",
  });

  const submitPersonalInfo = async () => {
    setIsCreatingAccount(true);
    setCreateError("");
    try {
      const res = await fetch("/api/preboarding/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: metadata.employeeId,
          email: metadata.email,
          companyName: metadata.companyName,
          personal: formData,
        }),
      });

      if (!res.ok) throw new Error("Unable to create your account from this invitation.");
      onNext({ personal: formData });
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : "Unable to create your account.");
    } finally {
      setIsCreatingAccount(false);
    }
  };

  return (
    <div className="py-2">
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
        <User size={20} className="text-blue-500" /> Personal Information
      </h3>
      <p className="text-slate-500 text-[14px] mb-6">Let's start with your basics for our HR system.</p>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">Full Legal Name</label>
            <input 
              type="text" 
              className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
              placeholder="As it appears on your ID"
              value={formData.legalName}
              onChange={e => setFormData({...formData, legalName: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">Preferred Name</label>
            <input 
              type="text" 
              className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
              placeholder="What we should call you"
              value={formData.preferredName}
              onChange={e => setFormData({...formData, preferredName: e.target.value})}
            />
          </div>
        </div>
        <div>
          <label className="block text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">Pronouns <span className="text-slate-400 font-medium">(optional)</span></label>
          <input
            type="text"
            className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
            placeholder="e.g. she/her, he/him, they/them"
            value={formData.pronouns}
            onChange={e => setFormData({...formData, pronouns: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">Home Address</label>
          <input 
            type="text" 
            className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
            placeholder="123 Example St"
            value={formData.homeAddress}
            onChange={e => setFormData({...formData, homeAddress: e.target.value})}
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">City</label>
            <input type="text" className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/30 transition-all" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
          </div>
          <div>
            <label className="block text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">State</label>
            <input type="text" maxLength={2} className="w-full p-3 uppercase bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/30 transition-all" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value.toUpperCase()})} />
          </div>
          <div>
            <label className="block text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">ZIP</label>
            <input type="text" className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/30 transition-all" value={formData.zip} onChange={e => setFormData({...formData, zip: e.target.value})} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">Emergency Contact Name</label>
            <input
              type="text"
              className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
              value={formData.emergencyContactName}
              onChange={e => setFormData({...formData, emergencyContactName: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">Emergency Contact Phone</label>
            <input
              type="tel"
              className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
              value={formData.emergencyContactPhone}
              onChange={e => setFormData({...formData, emergencyContactPhone: e.target.value})}
            />
          </div>
        </div>
      </div>

      {createError && (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-medium text-red-700">
          {createError}
        </p>
      )}

      <div className="flex items-center justify-between mt-10 p-2">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-white font-medium">
          <ArrowLeft size={16} /> Back
        </button>
        <button 
          onClick={submitPersonalInfo}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all disabled:opacity-50 flex items-center gap-2"
          disabled={isCreatingAccount || !formData.legalName || !formData.homeAddress || !formData.emergencyContactName || !formData.emergencyContactPhone}
        >
          {isCreatingAccount ? <Loader2 size={16} className="animate-spin" /> : null}
          Create Account & Continue
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// STEP 2: Tax Documents (Simplified W-4)
// ---------------------------------------------------------
export function TaxDocumentsStep({ onNext, onBack, data, metadata }: StepProps) {
  const [formData, setFormData] = useState(data.tax || {
    filingStatus: "single",
    multipleJobs: false,
    claimDependents: 0,
    otherIncome: 0,
    deductions: 0,
    extraWithholding: 0,
    exempt: false,
    stateFormCompleted: false,
    workState: metadata.workState,
  });

  return (
    <div className="py-2">
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
        <FileText size={20} className="text-blue-500" /> Tax Withholding (Form W-4)
      </h3>
      <p className="text-slate-500 text-[14px] mb-6">Complete your federal W-4 and the required state withholding form for {metadata.workState}.</p>

      <div className="space-y-6">
        <div>
          <label className="block text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-3">Step 1(c): Filing Status</label>
          <div className="grid grid-cols-1 gap-2">
            {["Single or Married filing separately", "Married filing jointly", "Head of household"].map((status) => (
               <label key={status} className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${formData.filingStatus === status.toLowerCase() ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10' : 'border-slate-200 dark:border-slate-800'}`}>
                 <input 
                   type="radio" 
                   className="w-4 h-4 text-blue-600 mr-3" 
                   checked={formData.filingStatus === status.toLowerCase()}
                   onChange={() => setFormData({...formData, filingStatus: status.toLowerCase()})}
                 />
                 <span className="text-[14px] font-medium text-slate-900 dark:text-white">{status}</span>
               </label>
            ))}
          </div>
        </div>

        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-xl">
           <div className="flex items-start gap-3">
              <ShieldCheck size={18} className="text-amber-600 mt-0.5" />
              <p className="text-[13px] text-amber-900 dark:text-amber-200">
                You can also claim exemption from withholding if you meet specific legal requirements.
              </p>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">Dependent credits</label>
            <input type="number" min={0} className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/30 transition-all" value={formData.claimDependents} onChange={e => setFormData({...formData, claimDependents: Number(e.target.value)})} />
          </div>
          <div>
            <label className="block text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">Extra withholding</label>
            <input type="number" min={0} className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/30 transition-all" value={formData.extraWithholding} onChange={e => setFormData({...formData, extraWithholding: Number(e.target.value)})} />
          </div>
          <div>
            <label className="block text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">Other income</label>
            <input type="number" min={0} className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/30 transition-all" value={formData.otherIncome} onChange={e => setFormData({...formData, otherIncome: Number(e.target.value)})} />
          </div>
          <div>
            <label className="block text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">Deductions</label>
            <input type="number" min={0} className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/30 transition-all" value={formData.deductions} onChange={e => setFormData({...formData, deductions: Number(e.target.value)})} />
          </div>
        </div>

        <label className="flex items-start gap-3 p-4 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer">
          <input
            type="checkbox"
            className="w-5 h-5 mt-0.5 rounded text-blue-600 focus:ring-blue-500"
            checked={formData.stateFormCompleted}
            onChange={e => setFormData({...formData, stateFormCompleted: e.target.checked, workState: metadata.workState})}
          />
          <span className="text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed">
            I completed the {metadata.workState} state withholding form for my work location.
          </span>
        </label>
      </div>

      <div className="flex items-center justify-between mt-10 p-2">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-white font-medium">
          <ArrowLeft size={16} /> Back
        </button>
        <button 
          onClick={() => onNext({ tax: formData })}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all"
          disabled={!formData.filingStatus || !formData.stateFormCompleted}
        >
          Next Step
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// STEP 3: Direct Deposit
// ---------------------------------------------------------
export function DirectDepositStep({ onNext, onBack, data, metadata }: StepProps) {
  const [useManual, setUseManual] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [plaidError, setPlaidError] = useState("");
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [formData, setFormData] = useState(data.bank || {
    method: "",
    routingNumber: "",
    accountNumber: "",
    bankName: "",
    accountMask: "",
  });

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async (publicToken) => {
      const res = await fetch("/api/plaid/exchange-public-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ public_token: publicToken }),
      });
      const accountData = await res.json();
      const account = accountData.account || accountData.mock_account;
      setFormData({
        method: "plaid",
        bankName: account?.name || "Verified bank account",
        routingNumber: account?.routing || "",
        accountNumber: "",
        accountMask: account?.account || "Verified",
        plaidAccessToken: accountData.access_token,
      });
      setPlaidError("");
      setIsConnecting(false);
    },
    onExit: () => setIsConnecting(false),
  });

  useEffect(() => {
    if (linkToken && ready && isConnecting) {
      open();
    }
  }, [isConnecting, linkToken, open, ready]);

  const connectPlaid = async () => {
    setIsConnecting(true);
    setPlaidError("");
    try {
      const res = await fetch("/api/plaid/create-link-token", { method: "POST" });
      const tokenData = await res.json();

      if (tokenData.is_mock) {
        setFormData({
          method: "plaid",
          bankName: "Plaid Checking (Mock)",
          routingNumber: "012345678",
          accountNumber: "",
          accountMask: "••••1111",
          plaidAccessToken: "mock_access_token",
        });
        setIsConnecting(false);
        return;
      }

      setLinkToken(tokenData.link_token);
    } catch {
      setPlaidError("Plaid is unavailable right now. You can enter bank details manually.");
      setIsConnecting(false);
    }
  };

  return (
    <div className="py-2">
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
        <CreditCard size={20} className="text-blue-500" /> Direct Deposit
      </h3>
      <p className="text-slate-500 text-[14px] mb-6">Choose how you'd like to receive your pay from {metadata.companyName}.</p>

      {!useManual ? (
        <div className="space-y-6">
          <div className="p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
              <Building size={24} className="text-blue-600" />
            </div>
            <h4 className="text-[16px] font-bold text-slate-900 dark:text-white mb-2">Connect with Plaid</h4>
            <p className="text-[14px] text-slate-500 mb-6 max-w-xs">Connecting your bank with Plaid is the fastest and most secure way to set up payroll.</p>
            {formData.method === "plaid" && (
              <div className="w-full mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-left dark:border-emerald-900/50 dark:bg-emerald-900/10">
                <p className="text-[13px] font-bold text-emerald-700 dark:text-emerald-300">{formData.bankName}</p>
                <p className="text-[12px] text-emerald-600 dark:text-emerald-400">{formData.accountMask} connected for direct deposit</p>
              </div>
            )}
            <button
              onClick={connectPlaid}
              disabled={isConnecting || (!!linkToken && !ready)}
              className="w-full py-3 bg-black dark:bg-white dark:text-black text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isConnecting ? <Loader2 size={16} className="animate-spin" /> : null}
              Continue with Plaid
            </button>
            {plaidError && <p className="mt-3 text-[12px] font-medium text-red-600">{plaidError}</p>}
            <button 
              onClick={() => setUseManual(true)}
              className="mt-4 text-[13px] text-slate-500 hover:text-blue-500 font-medium underline"
            >
              Enter bank details manually
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">Bank Name</label>
            <input 
              type="text" 
              className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
              placeholder="e.g. Chase, Wells Fargo"
              value={formData.bankName}
              onChange={e => setFormData({...formData, method: "manual", bankName: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">Routing Number</label>
              <input 
                type="text" 
                className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                value={formData.routingNumber}
                onChange={e => setFormData({...formData, method: "manual", routingNumber: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">Account Number</label>
              <input 
                type="text" 
                className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                value={formData.accountNumber}
                onChange={e => setFormData({...formData, method: "manual", accountNumber: e.target.value})}
              />
            </div>
          </div>
          <button 
            onClick={() => setUseManual(false)}
            className="text-[13px] text-blue-500 hover:text-blue-600 font-medium"
          >
            ← Back to Plaid
          </button>
        </div>
      )}

      <div className="flex items-center justify-between mt-10 p-2">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-white font-medium">
          <ArrowLeft size={16} /> Back
        </button>
        <button 
          onClick={() => onNext({ bank: formData })}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all disabled:opacity-50"
          disabled={!formData.method || (formData.method === "manual" && (!formData.bankName || !formData.routingNumber || !formData.accountNumber))}
        >
          Next Step
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// STEP 4: I-9 Section 1
// ---------------------------------------------------------
export function I9Step({ onNext, onBack, data }: StepProps) {
  const [formData, setFormData] = useState(data.i9 || {
    citizenshipStatus: "",
    alienRegistrationNumber: "",
    attested: false
  });

  return (
    <div className="py-2">
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
        <ShieldCheck size={20} className="text-blue-500" /> Form I-9 Verification
      </h3>
      <p className="text-slate-500 text-[14px] mb-6">Federal law requires completion of Form I-9 prior to your start date.</p>

      <div className="space-y-6">
        <div>
          <label className="block text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-3">Citizenship Status</label>
          <div className="grid grid-cols-1 gap-2">
            {[
              "A citizen of the United States", 
              "A noncitizen national of the United States", 
              "A lawful permanent resident", 
              "A noncitizen authorized to work"
            ].map((status) => (
               <label key={status} className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${formData.citizenshipStatus === status ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10' : 'border-slate-200 dark:border-slate-800'}`}>
                 <input 
                   type="radio" 
                   className="w-4 h-4 text-blue-600 mr-3" 
                   checked={formData.citizenshipStatus === status}
                   onChange={() => setFormData({...formData, citizenshipStatus: status})}
                 />
                 <span className="text-[14px] font-medium text-slate-900 dark:text-white">{status}</span>
               </label>
            ))}
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <p className="text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-2">Reminder</p>
          <p className="text-[13px] text-slate-500">
            Bring your ID documents on your first day. Originals are required for employer review.
          </p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              ["List A", "U.S. passport, Permanent Resident Card, or other document proving identity and work authorization."],
              ["List B", "Driver's license, state ID, school ID, voter registration card, or military card."],
              ["List C", "Social Security card, birth certificate, or employment authorization document."],
            ].map(([title, copy]) => (
              <div key={title} className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3">
                <div className="flex items-center gap-2 text-[12px] font-black text-slate-900 dark:text-white">
                  <IdCard size={14} className="text-blue-500" />
                  {title}
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{copy}</p>
              </div>
            ))}
          </div>
        </div>

        {formData.citizenshipStatus === "A noncitizen authorized to work" && (
          <div>
            <label className="block text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">USCIS / Alien Registration Number</label>
            <input
              type="text"
              className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
              value={formData.alienRegistrationNumber}
              onChange={e => setFormData({...formData, alienRegistrationNumber: e.target.value})}
            />
          </div>
        )}

        <label className="flex items-start gap-3 cursor-pointer group">
           <input 
             type="checkbox" 
             className="w-5 h-5 mt-1 rounded text-blue-600 focus:ring-blue-500" 
             checked={formData.attested}
             onChange={e => setFormData({...formData, attested: e.target.checked})}
           />
           <span className="text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">
             I attest, under penalty of perjury, that the info provided is true and correct, and that I am authorized to work in the United States.
           </span>
        </label>
      </div>

      <div className="flex items-center justify-between mt-10 p-2">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-white font-medium">
          <ArrowLeft size={16} /> Back
        </button>
        <button 
          onClick={() => onNext({ i9: formData })}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!formData.attested || !formData.citizenshipStatus}
        >
          Next Step
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// STEP 5: Sign Documents
// ---------------------------------------------------------
export function SignDocumentsStep({ onNext, onBack, data, metadata }: StepProps) {
  const [signedDocs, setSignedDocs] = useState<string[]>(data.docs || []);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const documents = [
    { id: "offer-letter", title: "Offer Letter", type: "Required" },
    { id: "handbook", title: "Employee Handbook Acknowledgment", type: "Required" },
    { id: "company-policies", title: "Company Policies", type: "Required" },
  ];

  const handleSign = (id: string) => {
    if (signedDocs.includes(id)) {
      setSignedDocs(signedDocs.filter(d => d !== id));
    } else {
      setSignedDocs([...signedDocs, id]);
    }
  };

  const handleComplete = async () => {
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/preboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: metadata.employeeId,
          email: metadata.email,
          companyName: metadata.companyName,
          employeeName: metadata.employeeName,
          startDate: metadata.startDate,
          signedDocuments: signedDocs,
          documentFolder: `employees/${metadata.employeeId}/documents`,
        }),
      });

      if (!res.ok) throw new Error("Unable to complete pre-boarding");
      setSubmitting(false);
      onNext({ docs: signedDocs });
    } catch (error) {
      setSubmitting(false);
      setSubmitError(error instanceof Error ? error.message : "Unable to complete pre-boarding");
    }
  };

  return (
    <div className="py-2">
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
        <PenTool size={20} className="text-blue-500" /> Electronic Signature
      </h3>
      <p className="text-slate-500 text-[14px] mb-6">Review and e-sign each new hire document for {metadata.companyName}. Signed copies are auto-saved to your employee documents folder.</p>

      <div className="space-y-3">
        {documents.map((doc) => (
          <div 
            key={doc.id}
            className={`p-4 border rounded-xl flex items-center justify-between transition-all ${signedDocs.includes(doc.id) ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10' : 'border-slate-200 dark:border-slate-800'}`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${signedDocs.includes(doc.id) ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                <FileText size={18} />
              </div>
              <div>
                <p className="text-[14px] font-bold text-slate-900 dark:text-white">{doc.title}</p>
                <p className={`text-[12px] font-medium ${doc.type === 'Required' ? 'text-amber-600' : 'text-slate-500'}`}>{doc.type}</p>
              </div>
            </div>
            
            <button 
              onClick={() => handleSign(doc.id)}
              className={`px-4 py-2 rounded-lg text-[13px] font-bold transition-all ${signedDocs.includes(doc.id) ? 'bg-emerald-600 text-white' : 'border border-blue-600 text-blue-600 hover:bg-blue-50'}`}
            >
              {signedDocs.includes(doc.id) ? 'E-signed' : 'E-sign'}
            </button>
          </div>
        ))}
      </div>

      {submitError && (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-medium text-red-700">
          {submitError}
        </p>
      )}

      <div className="flex items-center justify-between mt-10 p-2">
        <button onClick={onBack} disabled={submitting} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-white font-medium disabled:opacity-50">
          <ArrowLeft size={16} /> Back
        </button>
        <button 
          onClick={handleComplete}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all disabled:opacity-50 flex items-center gap-2"
          disabled={signedDocs.filter(id => documents.find(d => d.id === id)?.type === 'Required').length < documents.length || submitting}
        >
          {submitting ? "Queueing New Hire Packet..." : "Complete Pre-Boarding"}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// STEP 6: Completion Screen
// ---------------------------------------------------------
export function CompletionScreen({ metadata }: StepProps) {
  return (
    <div className="flex flex-col items-center text-center py-8">
      <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6 text-emerald-600 dark:text-emerald-400">
        <CheckCircle size={48} />
      </div>
      <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
        You are all set! See you on {formatStartDate(metadata.startDate)}
      </h2>
      <p className="text-slate-600 dark:text-slate-400 max-w-md mb-8">
        Congratulations, {metadata.firstName}! Your pre-boarding is complete. We've sent your signed documents to your employee documents folder.
      </p>

      <div className="p-6 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-2xl w-full max-w-md mb-10">
        <p className="text-[14px] text-blue-800 dark:text-blue-300 font-medium mb-4">
          Download your official New Hire Packet to review company info and your first day schedule.
        </p>
        
        <PDFDownloadLink 
          document={<NewHirePacket employeeName={metadata.employeeName} companyName={metadata.companyName} startDate={metadata.startDate} officeLocation={metadata.officeLocation} />} 
          fileName={`${metadata.employeeName.replace(/\s+/g, '_')}_New_Hire_Packet.pdf`}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
        >
          {({ loading }) => loading ? 'Generating Packet...' : 'Download Your New Hire Packet'}
        </PDFDownloadLink>
      </div>

      <div className="text-slate-500 text-[14px]">
        First day check-in starts at <span className="font-bold text-slate-900 dark:text-white">9:00 AM</span>.
      </div>
    </div>
  );
}
