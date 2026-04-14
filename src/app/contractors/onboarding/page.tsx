"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  UserPlus, Mail, FileCheck, Building2, CheckCircle2, ArrowRight,
  Send, ChevronRight, Clock, AlertTriangle, X, Shield, CreditCard,
  User, MapPin, Hash, PenTool, Loader2
} from "lucide-react";
import { mockContractors, type Contractor, type OnboardingStep } from "@/data/mockContractors";
import { ContractorSubNav } from "../page";
import { toast } from "sonner";

/* ─── Onboarding Step Config ──────────────────────────────────── */

const STEPS: { step: OnboardingStep; label: string; icon: React.ElementType; description: string }[] = [
  { step: "Invited", label: "Invitation Sent", icon: Mail, description: "Admin sends onboarding invitation via email" },
  { step: "Signed Up", label: "Portal Signup", icon: UserPlus, description: "Contractor creates account via invitation link" },
  { step: "W-9 Submitted", label: "W-9 Collected", icon: FileCheck, description: "Contractor completes guided W-9 wizard with e-signature" },
  { step: "Bank Added", label: "Bank Connected", icon: CreditCard, description: "Contractor adds bank account via Plaid or manual entry" },
  { step: "Activated", label: "Activated", icon: CheckCircle2, description: "Admin reviews and activates contractor" },
];

const STEP_ORDER: OnboardingStep[] = ["Invited", "Signed Up", "W-9 Submitted", "Bank Added", "Activated"];

function getStepIndex(step: OnboardingStep): number {
  return STEP_ORDER.indexOf(step);
}

/* ─── W-9 Wizard Modal ────────────────────────────────────────── */

function W9WizardModal({ onClose }: { onClose: () => void }) {
  const [wizardStep, setWizardStep] = useState(0);
  const [formData, setFormData] = useState({
    legalName: "",
    businessName: "",
    taxClassification: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    tin: "",
    tinType: "SSN",
    signature: false,
  });

  const TAX_CLASSIFICATIONS = [
    "Individual / Sole Proprietor",
    "C Corporation",
    "S Corporation",
    "Partnership",
    "Trust / Estate",
    "LLC - C Corp",
    "LLC - S Corp",
    "LLC - Partnership",
    "LLC - Single Member",
    "Other",
  ];

  const wizardSteps = [
    {
      title: "Legal Name & Business",
      icon: User,
      fields: (
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Legal Name (as shown on your tax return) *</label>
            <input
              type="text"
              value={formData.legalName}
              onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
              placeholder="e.g. John A. Smith"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Business Name (if different)</label>
            <input
              type="text"
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              placeholder="e.g. Smith Consulting LLC"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-slate-900 dark:text-white"
            />
          </div>
        </div>
      ),
    },
    {
      title: "Tax Classification",
      icon: Building2,
      fields: (
        <div className="flex flex-col gap-3">
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Federal Tax Classification *</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {TAX_CLASSIFICATIONS.map((tc) => (
              <button
                key={tc}
                onClick={() => setFormData({ ...formData, taxClassification: tc })}
                className={`p-3 rounded-lg border text-left text-sm font-medium transition-all ${
                  formData.taxClassification === tc
                    ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 ring-2 ring-orange-500/20"
                    : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-orange-300 hover:bg-orange-50/50"
                }`}
              >
                {tc}
              </button>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "Address",
      icon: MapPin,
      fields: (
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Street Address *</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="123 Main St, Suite 100"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-slate-900 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">City *</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">State *</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                maxLength={2}
                placeholder="CA"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">ZIP *</label>
              <input
                type="text"
                value={formData.zip}
                onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                maxLength={10}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "TIN / SSN",
      icon: Hash,
      fields: (
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Taxpayer ID Type *</label>
            <div className="flex gap-3">
              {["SSN", "EIN"].map((type) => (
                <button
                  key={type}
                  onClick={() => setFormData({ ...formData, tinType: type })}
                  className={`flex-1 p-3 rounded-lg border text-center text-sm font-bold transition-all ${
                    formData.tinType === type
                      ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-orange-300"
                  }`}
                >
                  {type === "SSN" ? "Social Security Number (SSN)" : "Employer Identification Number (EIN)"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">{formData.tinType} *</label>
            <input
              type="password"
              value={formData.tin}
              onChange={(e) => setFormData({ ...formData, tin: e.target.value })}
              placeholder={formData.tinType === "SSN" ? "XXX-XX-XXXX" : "XX-XXXXXXX"}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-slate-900 dark:text-white font-mono"
            />
            <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
              <Shield size={10} /> Encrypted with AES-256. Never stored in plain text.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "E-Signature",
      icon: PenTool,
      fields: (
        <div className="flex flex-col gap-5">
          <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-h-48 overflow-y-auto">
            <p className="font-bold text-slate-900 dark:text-white mb-2">Certification</p>
            <p>Under penalties of perjury, I certify that:</p>
            <ol className="list-decimal ml-4 mt-2 space-y-1">
              <li>The number shown on this form is my correct taxpayer identification number (or I am waiting for a number to be issued to me); and</li>
              <li>I am not subject to backup withholding because: (a) I am exempt from backup withholding, or (b) I have not been notified by the IRS that I am subject to backup withholding; and</li>
              <li>I am a U.S. citizen or other U.S. person; and</li>
              <li>The FATCA code(s) entered on this form (if any) indicating that I am exempt from FATCA reporting is correct.</li>
            </ol>
          </div>
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={formData.signature}
              onChange={(e) => setFormData({ ...formData, signature: e.target.checked })}
              className="mt-1 w-5 h-5 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">
              I certify, under penalties of perjury, that I have read and agree to the above certification.
              <span className="block text-[10px] text-slate-400 mt-1">This constitutes a legally binding electronic signature.</span>
            </span>
          </label>
        </div>
      ),
    },
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
              <FileCheck size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">W-9 Form Wizard</h3>
              <p className="text-xs text-slate-500">Step {wizardStep + 1} of {wizardSteps.length}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        {/* Progress */}
        <div className="px-5 pt-4">
          <div className="flex items-center gap-1">
            {wizardSteps.map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-1.5 rounded-full transition-all ${
                  i <= wizardStep ? "bg-gradient-to-r from-orange-500 to-amber-500" : "bg-slate-200 dark:bg-slate-700"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto max-h-[60vh]">
          <div className="flex items-center gap-2 mb-4">
            {React.createElement(wizardSteps[wizardStep].icon, { size: 18, className: "text-orange-600" })}
            <h4 className="text-base font-bold text-slate-900 dark:text-white">{wizardSteps[wizardStep].title}</h4>
          </div>
          {wizardSteps[wizardStep].fields}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <button
            onClick={() => setWizardStep(Math.max(0, wizardStep - 1))}
            disabled={wizardStep === 0}
            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 transition-colors"
          >
            Back
          </button>
          {wizardStep < wizardSteps.length - 1 ? (
            <button
              onClick={() => setWizardStep(wizardStep + 1)}
              className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold rounded-lg transition-colors"
            >
              Continue <ArrowRight size={14} />
            </button>
          ) : (
            <button
              onClick={() => {
                toast.success("W-9 submitted successfully", { description: "Form has been signed and stored securely." });
                onClose();
              }}
              disabled={!formData.signature}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PenTool size={14} /> Sign & Submit W-9
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Invite Modal ────────────────────────────────────────────── */

function InviteModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!email) return;
    setSending(true);
    await new Promise((r) => setTimeout(r, 1200));
    toast.success("Invitation sent!", { description: `Onboarding link sent to ${email}` });
    setSending(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
              <Send size={18} className="text-white" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Invite Contractor</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={18} className="text-slate-500" />
          </button>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Contractor Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Smith"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email Address *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contractor@company.com"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-slate-900 dark:text-white"
            />
          </div>
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-xs text-blue-700 dark:text-blue-400">
              <strong>What happens next:</strong> The contractor will receive an email with a link to create their portal account, fill out their W-9, and connect their bank account.
            </p>
          </div>
        </div>
        <div className="p-6 pt-0">
          <button
            onClick={handleSend}
            disabled={!email || sending}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-600/20"
          >
            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {sending ? "Sending..." : "Send Onboarding Invitation"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Onboarding Pipeline Card ────────────────────────────────── */

function OnboardingCard({ contractor }: { contractor: Contractor }) {
  const stepIdx = getStepIndex(contractor.onboardingStep);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            {contractor.name.split(" ").map((n) => n[0]).join("")}
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-white text-sm">{contractor.name}</p>
            <p className="text-xs text-slate-500">{contractor.email}</p>
          </div>
        </div>
        {contractor.status === "Onboarding" && (
          <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[10px] font-bold rounded-full uppercase tracking-wider border border-blue-200 dark:border-blue-800">
            In Progress
          </span>
        )}
        {contractor.status === "Pending" && (
          <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold rounded-full uppercase tracking-wider border border-amber-200 dark:border-amber-800">
            Pending
          </span>
        )}
      </div>

      {/* Step Progress */}
      <div className="flex items-center gap-1.5 mb-3">
        {STEPS.map((s, i) => (
          <div
            key={s.step}
            className={`flex-1 h-2 rounded-full transition-all ${
              i <= stepIdx
                ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                : "bg-slate-200 dark:bg-slate-700"
            }`}
          />
        ))}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
          Step {stepIdx + 1}/5: <span className="text-slate-900 dark:text-white">{STEPS[stepIdx].label}</span>
        </p>
        {contractor.status !== "Active" && (
          <button
            onClick={() => toast.info("Reminder sent", { description: `Nudge sent to ${contractor.email}` })}
            className="text-[10px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
          >
            <Send size={10} /> Send Reminder
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────────────────── */

export default function OnboardingPage() {
  const [showInvite, setShowInvite] = useState(false);
  const [showW9Wizard, setShowW9Wizard] = useState(false);

  const onboardingContractors = mockContractors.filter(
    (c) => c.status === "Onboarding" || c.status === "Pending"
  );
  const activeContractors = mockContractors.filter((c) => c.status === "Active");

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <UserPlus size={20} className="text-white" />
            </div>
            Contractor Onboarding
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 ml-[52px]">
            Invite contractors, collect W-9s, and manage the onboarding pipeline.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowW9Wizard(true)}
            className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <FileCheck size={16} /> Preview W-9 Wizard
          </button>
          <button
            onClick={() => setShowInvite(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-orange-600/20"
          >
            <Send size={16} /> Invite Contractor
          </button>
        </div>
      </div>

      <ContractorSubNav active="/contractors/onboarding" />

      {/* Onboarding Flow Diagram */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-5">Onboarding Flow</h3>
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.step}>
              <div className="flex flex-col items-center gap-2 min-w-[120px]">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${
                  i === 0 ? "bg-orange-100 dark:bg-orange-900/30" :
                  i === STEPS.length - 1 ? "bg-emerald-100 dark:bg-emerald-900/30" :
                  "bg-blue-100 dark:bg-blue-900/30"
                }`}>
                  <s.icon size={22} className={
                    i === 0 ? "text-orange-600" :
                    i === STEPS.length - 1 ? "text-emerald-600" :
                    "text-blue-600"
                  } />
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{s.label}</p>
                  <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{s.description}</p>
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <ChevronRight size={20} className="text-slate-300 dark:text-slate-600 flex-shrink-0 mt-[-24px]" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* In-Progress Contractors */}
      {onboardingContractors.length > 0 && (
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Clock size={16} className="text-amber-500" />
            In Progress ({onboardingContractors.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {onboardingContractors.map((c) => (
              <OnboardingCard key={c.id} contractor={c} />
            ))}
          </div>
        </div>
      )}

      {/* Recently Completed */}
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-500" />
          Recently Completed ({activeContractors.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeContractors.slice(0, 6).map((c) => (
            <OnboardingCard key={c.id} contractor={c} />
          ))}
        </div>
      </div>

      {/* Modals */}
      {showInvite && <InviteModal onClose={() => setShowInvite(false)} />}
      {showW9Wizard && <W9WizardModal onClose={() => setShowW9Wizard(false)} />}
    </div>
  );
}
