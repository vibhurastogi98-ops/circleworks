"use client";

import React, { useState } from "react";
import { Check, User, MapPin, Briefcase, DollarSign, FileText, CheckCircle, ArrowRight, ArrowLeft, Building, CreditCard, ShieldCheck, PenTool } from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import NewHirePacket from "@/lib/newHirePacket";

interface StepProps {
  onNext: (data: any) => void;
  onBack?: () => void;
  data: any;
  companyName: string;
  employeeName: string;
}

// ---------------------------------------------------------
// STEP 0: Welcome Screen
// ---------------------------------------------------------
export function WelcomeScreen({ onNext, companyName, employeeName }: StepProps) {
  return (
    <div className="flex flex-col items-center text-center py-8">
      <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400">
        <Briefcase size={32} />
      </div>
      <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
        Welcome to {companyName}, {employeeName}!
      </h2>
      <p className="text-slate-600 dark:text-slate-400 max-w-md mb-8">
        We're so excited to have you on board! Let's get your pre-boarding squared away so you're ready to hit the ground running on day one.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg mb-10">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-start gap-3 text-left">
          <MapPin size={18} className="text-blue-500 mt-0.5" />
          <div>
             <p className="text-[12px] font-bold text-slate-500 uppercase">Office Location</p>
             <p className="text-[15px] text-slate-900 dark:text-white font-medium">Headquarters (SF / Remote)</p>
          </div>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-start gap-3 text-left">
          <User size={18} className="text-blue-500 mt-0.5" />
          <div>
             <p className="text-[12px] font-bold text-slate-500 uppercase">Your Manager</p>
             <p className="text-[15px] text-slate-900 dark:text-white font-medium">Michael Arrington</p>
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
export function PersonalInfoStep({ onNext, onBack, data }: StepProps) {
  const [formData, setFormData] = useState(data.personal || {
    legalName: "",
    preferredName: "",
    pronouns: "",
    homeAddress: "",
    emergencyContact: ""
  });

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
          <label className="block text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">Home Address</label>
          <input 
            type="text" 
            className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
            placeholder="123 Example St, City, State, Zip"
            value={formData.homeAddress}
            onChange={e => setFormData({...formData, homeAddress: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">Emergency Contact</label>
          <input 
            type="text" 
            className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
            placeholder="Name and Phone Number"
            value={formData.emergencyContact}
            onChange={e => setFormData({...formData, emergencyContact: e.target.value})}
          />
        </div>
      </div>

      <div className="flex items-center justify-between mt-10 p-2">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-white font-medium">
          <ArrowLeft size={16} /> Back
        </button>
        <button 
          onClick={() => onNext({ personal: formData })}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all"
        >
          Next Step
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// STEP 2: Tax Documents (Simplified W-4)
// ---------------------------------------------------------
export function TaxDocumentsStep({ onNext, onBack, data }: StepProps) {
  const [formData, setFormData] = useState(data.tax || {
    filingStatus: "single",
    multipleJobs: false,
    exempt: false
  });

  return (
    <div className="py-2">
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
        <FileText size={20} className="text-blue-500" /> Tax Withholding (Form W-4)
      </h3>
      <p className="text-slate-500 text-[14px] mb-6">Complete a simplified W-4 to ensure we withhold the correct amount of tax.</p>

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
      </div>

      <div className="flex items-center justify-between mt-10 p-2">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-white font-medium">
          <ArrowLeft size={16} /> Back
        </button>
        <button 
          onClick={() => onNext({ tax: formData })}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all"
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
export function DirectDepositStep({ onNext, onBack, data, companyName }: StepProps) {
  const [useManual, setUseManual] = useState(false);
  const [formData, setFormData] = useState(data.bank || {
    routingNumber: "",
    accountNumber: "",
    bankName: ""
  });

  return (
    <div className="py-2">
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
        <CreditCard size={20} className="text-blue-500" /> Direct Deposit
      </h3>
      <p className="text-slate-500 text-[14px] mb-6">Choose how you'd like to receive your pay from {companyName}.</p>

      {!useManual ? (
        <div className="space-y-6">
          <div className="p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
              <Building size={24} className="text-blue-600" />
            </div>
            <h4 className="text-[16px] font-bold text-slate-900 dark:text-white mb-2">Connect with Plaid</h4>
            <p className="text-[14px] text-slate-500 mb-6 max-w-xs">Connecting your bank with Plaid is the fastest and most secure way to set up payroll.</p>
            <button className="w-full py-3 bg-black dark:bg-white dark:text-black text-white font-bold rounded-xl flex items-center justify-center gap-2">
              Continue with Plaid
            </button>
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
              onChange={e => setFormData({...formData, bankName: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">Routing Number</label>
              <input 
                type="text" 
                className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                value={formData.routingNumber}
                onChange={e => setFormData({...formData, routingNumber: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">Account Number</label>
              <input 
                type="text" 
                className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                value={formData.accountNumber}
                onChange={e => setFormData({...formData, accountNumber: e.target.value})}
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
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all"
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
            Please remember to bring your original identity and work authorization documents on your first day.
            <span className="block mt-2 font-medium text-blue-600 cursor-pointer">View Acceptable Documents List</span>
          </p>
        </div>

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
export function SignDocumentsStep({ onNext, onBack, data, companyName }: StepProps) {
  const [signedDocs, setSignedDocs] = useState<string[]>(data.docs || []);
  const documents = [
    { id: "offer-letter", title: "Offer Letter", type: "Required" },
    { id: "handbook", title: "Employee Handbook", type: "Required" },
    { id: "equity", title: "Equity Grant Agreement", type: "Optional" }
  ];

  const handleSign = (id: string) => {
    if (signedDocs.includes(id)) {
      setSignedDocs(signedDocs.filter(d => d !== id));
    } else {
      setSignedDocs([...signedDocs, id]);
    }
  };

  return (
    <div className="py-2">
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
        <PenTool size={20} className="text-blue-500" /> Electronic Signature
      </h3>
      <p className="text-slate-500 text-[14px] mb-6">Review and sign your new hire documents for {companyName}.</p>

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
              {signedDocs.includes(doc.id) ? 'Signed ✓' : 'Sign Now'}
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-10 p-2">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-white font-medium">
          <ArrowLeft size={16} /> Back
        </button>
        <button 
          onClick={() => onNext({ docs: signedDocs })}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all disabled:opacity-50"
          disabled={signedDocs.filter(id => documents.find(d => d.id === id)?.type === 'Required').length < 2}
        >
          Complete Pre-Boarding
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// STEP 6: Completion Screen
// ---------------------------------------------------------
export function CompletionScreen({ companyName, employeeName, data }: StepProps) {
  return (
    <div className="flex flex-col items-center text-center py-8">
      <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6 text-emerald-600 dark:text-emerald-400">
        <CheckCircle size={48} />
      </div>
      <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
        You're all set!
      </h2>
      <p className="text-slate-600 dark:text-slate-400 max-w-md mb-8">
        Congratulations, {employeeName}! Your pre-boarding is complete. We've sent your signed documents to your folder.
      </p>

      <div className="p-6 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-2xl w-full max-w-md mb-10">
        <p className="text-[14px] text-blue-800 dark:text-blue-300 font-medium mb-4">
          Download your official New Hire Packet to review company info and your first day schedule.
        </p>
        
        <PDFDownloadLink 
          document={<NewHirePacket employeeName={employeeName} companyName={companyName} />} 
          fileName={`${employeeName.replace(/\s+/g, '_')}_New_Hire_Packet.pdf`}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
        >
          {({ loading }) => loading ? 'Generating Packet...' : 'Download New Hire Packet'}
        </PDFDownloadLink>
      </div>

      <div className="text-slate-500 text-[14px]">
        See you on your start date at <span className="font-bold text-slate-900 dark:text-white">9:00 AM</span>!
      </div>
    </div>
  );
}
