"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  ArrowRight, CheckCircle2, ChevronRight, Clock, CreditCard,
  FileCheck, Loader2, Mail, PenTool, Send, User, UserPlus, X,
} from "lucide-react";
import { toast } from "sonner";

import { ContractorSubNav } from "../page";

/* ─── Types (mirror /api/contractors) ─────────────────────────── */

type ContractorRow = {
  id: number;
  name: string;
  businessName: string | null;
  email: string;
  status: "Active" | "Onboarding" | "Pending" | "Inactive";
  w9Status: "Collected" | "Pending" | "Not Submitted" | "Expired";
  ytdPayments: number | null;
  onboardingStep: string | null;
};

type OnboardingStep = "Invited" | "Signed Up" | "W-9 Submitted" | "Bank Added" | "Activated";

const STEPS: { step: OnboardingStep; label: string; icon: React.ElementType; description: string }[] = [
  { step: "Invited",        label: "Invitation Sent", icon: Mail,          description: "Admin sends onboarding invitation via email" },
  { step: "Signed Up",      label: "Portal Signup",   icon: UserPlus,      description: "Contractor creates account via invitation link" },
  { step: "W-9 Submitted",  label: "W-9 Collected",   icon: FileCheck,     description: "Contractor completes W-9 with e-signature" },
  { step: "Bank Added",     label: "Bank Connected",  icon: CreditCard,    description: "Contractor adds a bank account for payments" },
  { step: "Activated",      label: "Activated",       icon: CheckCircle2,  description: "Admin reviews and activates contractor" },
];
const STEP_ORDER: OnboardingStep[] = ["Invited", "Signed Up", "W-9 Submitted", "Bank Added", "Activated"];
function getStepIndex(step: string | null): number {
  const i = STEP_ORDER.indexOf((step ?? "Invited") as OnboardingStep);
  return i < 0 ? 0 : i;
}

/* ─── W-9 Wizard (real POST to submit-w9) ─────────────────────── */

const TAX_CLASSIFICATIONS = [
  "Individual / Sole Proprietor", "C Corporation", "S Corporation", "Partnership",
  "Trust / Estate", "LLC - C Corp", "LLC - S Corp", "LLC - Partnership",
  "LLC - Single Member", "Other",
];

function W9WizardModal({
  contractor,
  onClose,
  onDone,
}: {
  contractor: ContractorRow;
  onClose: () => void;
  onDone: () => void;
}) {
  const [wizardStep, setWizardStep] = useState(0);
  const [form, setForm] = useState({
    legalName: contractor.name,
    businessName: contractor.businessName ?? "",
    taxClassification: TAX_CLASSIFICATIONS[0],
    address: "",
    city: "",
    state: "",
    zip: "",
    tin: "",
    tinType: "SSN" as "SSN" | "EIN",
    signature: false,
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    setErr(null);
    setBusy(true);
    const r = await fetch("/api/contractors", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "submit-w9",
        contractorId: contractor.id,
        legalName: form.legalName,
        businessName: form.businessName,
        tin: form.tin,
        tinType: form.tinType,
        signature: form.signature,
      }),
    });
    const data = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) { setErr(data.error || `submit_failed_${r.status}`); return; }
    toast.success("W-9 submitted", { description: "TIN and signature stored." });
    onDone();
    onClose();
  }

  const steps = [
    {
      title: "Legal name & business", icon: User,
      body: (
        <div className="flex flex-col gap-3">
          <label className="text-xs font-bold uppercase text-slate-500">Legal name *
            <input required value={form.legalName} onChange={(e) => setForm((s) => ({ ...s, legalName: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
          </label>
          <label className="text-xs font-bold uppercase text-slate-500">Business name
            <input value={form.businessName} onChange={(e) => setForm((s) => ({ ...s, businessName: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
          </label>
          <label className="text-xs font-bold uppercase text-slate-500">Tax classification
            <select value={form.taxClassification} onChange={(e) => setForm((s) => ({ ...s, taxClassification: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white">
              {TAX_CLASSIFICATIONS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
        </div>
      ),
    },
    {
      title: "TIN", icon: FileCheck,
      body: (
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            {(["SSN", "EIN"] as const).map((t) => (
              <button key={t} type="button" onClick={() => setForm((s) => ({ ...s, tinType: t }))} className={`flex-1 rounded-lg border px-3 py-2 text-sm font-bold ${form.tinType === t ? "border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300" : "border-slate-200 dark:border-slate-700"}`}>
                {t}
              </button>
            ))}
          </div>
          <label className="text-xs font-bold uppercase text-slate-500">
            {form.tinType} (9 digits, no dashes)
            <input inputMode="numeric" maxLength={11} value={form.tin} onChange={(e) => setForm((s) => ({ ...s, tin: e.target.value.replace(/\D/g, "").slice(0, 9) }))} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
          </label>
          <p className="text-xs text-slate-500">Only the last 4 digits will be stored in the DB. The full TIN is not persisted.</p>
        </div>
      ),
    },
    {
      title: "E-signature", icon: PenTool,
      body: (
        <div className="flex flex-col gap-4">
          <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
            <p className="mb-2 font-bold text-slate-900 dark:text-white">Certification</p>
            <p>Under penalties of perjury, I certify that the number shown on this form is my correct taxpayer identification number, I am not subject to backup withholding, I am a U.S. person, and any FATCA code entered is correct.</p>
          </div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={form.signature} onChange={(e) => setForm((s) => ({ ...s, signature: e.target.checked }))} className="mt-1 h-5 w-5 rounded border-slate-300 text-orange-600" />
            <span className="text-sm text-slate-700 dark:text-slate-300">
              I certify under penalties of perjury that I have read and agree to the above.
              <span className="mt-1 block text-[10px] text-slate-400">This constitutes a legally binding electronic signature.</span>
            </span>
          </label>
        </div>
      ),
    },
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={busy ? undefined : onClose} />
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500">
              <FileCheck size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">W-9 for {contractor.name}</h3>
              <p className="text-xs text-slate-500">Step {wizardStep + 1} of {steps.length}</p>
            </div>
          </div>
          <button onClick={onClose} disabled={busy} className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40">
            <X size={18} className="text-slate-500" />
          </button>
        </div>
        <div className="px-5 pt-4">
          <div className="flex items-center gap-1">
            {steps.map((_, i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= wizardStep ? "bg-gradient-to-r from-orange-500 to-amber-500" : "bg-slate-200 dark:bg-slate-700"}`} />
            ))}
          </div>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-5">
          <div className="mb-4 flex items-center gap-2">
            {React.createElement(steps[wizardStep]!.icon, { size: 18, className: "text-orange-600" })}
            <h4 className="text-base font-bold text-slate-900 dark:text-white">{steps[wizardStep]!.title}</h4>
          </div>
          {steps[wizardStep]!.body}
          {err && <p className="mt-3 text-xs text-red-500">{err}</p>}
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-800/50">
          <button onClick={() => setWizardStep(Math.max(0, wizardStep - 1))} disabled={wizardStep === 0 || busy} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 disabled:opacity-30 dark:text-slate-400 dark:hover:text-white">
            Back
          </button>
          {wizardStep < steps.length - 1 ? (
            <button onClick={() => setWizardStep(wizardStep + 1)} className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-orange-700">
              Continue <ArrowRight size={14} />
            </button>
          ) : (
            <button onClick={submit} disabled={!form.signature || form.tin.length !== 9 || busy} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50">
              {busy ? <Loader2 size={14} className="animate-spin" /> : <PenTool size={14} />}
              Sign & submit W-9
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Invite Modal (real POST) ────────────────────────────────── */

function InviteModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function send() {
    if (!email) return;
    setErr(null);
    setSending(true);
    const r = await fetch("/api/contractors", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "invite", email, name, businessName }),
    });
    const data = await r.json().catch(() => ({}));
    setSending(false);
    if (!r.ok) { setErr(data.error || `invite_failed_${r.status}`); return; }
    toast.success("Invitation recorded", { description: `Onboarding started for ${email}` });
    onDone();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 p-6 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500">
              <Send size={18} className="text-white" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Invite contractor</h3>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={18} className="text-slate-500" />
          </button>
        </div>
        <div className="flex flex-col gap-4 p-6">
          <label className="text-xs font-bold uppercase text-slate-500">Contractor name
            <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
          </label>
          <label className="text-xs font-bold uppercase text-slate-500">Business name
            <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
          </label>
          <label className="text-xs font-bold uppercase text-slate-500">Email *
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
          </label>
          {err && <p className="text-xs text-red-500">{err}</p>}
        </div>
        <div className="p-6 pt-0">
          <button onClick={send} disabled={!email || sending} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-orange-600/20 hover:from-orange-700 hover:to-amber-700 disabled:cursor-not-allowed disabled:opacity-50">
            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {sending ? "Sending…" : "Send onboarding invitation"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Onboarding Card (with per-row Complete-W9 + Activate) ──── */

function OnboardingCard({ contractor, onOpenW9, onActivated }: {
  contractor: ContractorRow;
  onOpenW9: (c: ContractorRow) => void;
  onActivated: () => void;
}) {
  const stepIdx = getStepIndex(contractor.onboardingStep);
  const [busy, setBusy] = useState(false);
  async function activate() {
    setBusy(true);
    const r = await fetch("/api/contractors", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "activate-contractor", contractorId: contractor.id }),
    });
    setBusy(false);
    if (!r.ok) { toast.error("Activation failed"); return; }
    toast.success(`${contractor.name} activated`);
    onActivated();
  }
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-amber-500 text-sm font-bold text-white shadow-sm">
            {contractor.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{contractor.name}</p>
            <p className="text-xs text-slate-500">{contractor.email}</p>
          </div>
        </div>
        <span className="rounded-full border border-blue-200 bg-blue-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
          {contractor.status}
        </span>
      </div>
      <div className="mb-3 flex items-center gap-1.5">
        {STEPS.map((s, i) => (
          <div key={s.step} className={`h-2 flex-1 rounded-full transition-all ${i <= stepIdx ? "bg-gradient-to-r from-emerald-500 to-emerald-400" : "bg-slate-200 dark:bg-slate-700"}`} />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
          Step {stepIdx + 1}/5: <span className="text-slate-900 dark:text-white">{STEPS[stepIdx]!.label}</span>
        </p>
        <div className="flex items-center gap-2">
          {contractor.w9Status !== "Collected" && (
            <button onClick={() => onOpenW9(contractor)} className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
              Complete W-9
            </button>
          )}
          {contractor.status !== "Active" && contractor.w9Status === "Collected" && (
            <button disabled={busy} onClick={activate} className="rounded-md bg-emerald-600 px-2 py-1 text-[10px] font-bold text-white hover:bg-emerald-700 disabled:opacity-50">
              {busy ? "…" : "Activate"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────────────────── */

export default function OnboardingPage() {
  const [showInvite, setShowInvite] = useState(false);
  const [w9For, setW9For] = useState<ContractorRow | null>(null);
  const [rows, setRows] = useState<ContractorRow[] | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/contractors?resource=contractors", { cache: "no-store", credentials: "include" });
      if (r.status === 401) { setLoadErr("Please sign in."); return; }
      if (!r.ok) { setLoadErr(`Failed (HTTP ${r.status})`); return; }
      const data = await r.json();
      setRows(data.contractors ?? []);
      setLoadErr(null);
    } catch { setLoadErr("Network error"); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const onboardingContractors = (rows ?? []).filter((c) => c.status === "Onboarding" || c.status === "Pending");
  const activeContractors = (rows ?? []).filter((c) => c.status === "Active");

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg shadow-blue-500/20">
              <UserPlus size={20} className="text-white" />
            </div>
            Contractor Onboarding
          </h1>
          <p className="ml-[52px] mt-1 text-sm text-slate-500 dark:text-slate-400">
            Invite contractors, collect W-9s, and manage the onboarding pipeline.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowInvite(true)} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-600/20 transition-all hover:from-orange-700 hover:to-amber-700">
            <Send size={16} /> Invite contractor
          </button>
        </div>
      </div>

      <ContractorSubNav active="/contractors/onboarding" />

      {loadErr && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">
          {loadErr}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="mb-5 text-sm font-bold text-slate-900 dark:text-white">Onboarding flow</h3>
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.step}>
              <div className="flex min-w-[120px] flex-col items-center gap-2">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl shadow-sm ${
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
                  <p className="mt-0.5 text-[10px] leading-tight text-slate-500">{s.description}</p>
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <ChevronRight size={20} className="mt-[-24px] flex-shrink-0 text-slate-300 dark:text-slate-600" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {rows === null && !loadErr && <p className="text-sm text-slate-500">Loading contractors…</p>}

      {onboardingContractors.length > 0 && (
        <div>
          <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
            <Clock size={16} className="text-amber-500" />
            In progress ({onboardingContractors.length})
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {onboardingContractors.map((c) => (
              <OnboardingCard key={c.id} contractor={c} onOpenW9={setW9For} onActivated={load} />
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
          <CheckCircle2 size={16} className="text-emerald-500" />
          Recently completed ({activeContractors.length})
        </h3>
        {activeContractors.length === 0 ? (
          <p className="text-sm text-slate-500">No activated contractors yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeContractors.slice(0, 6).map((c) => (
              <OnboardingCard key={c.id} contractor={c} onOpenW9={setW9For} onActivated={load} />
            ))}
          </div>
        )}
      </div>

      {showInvite && <InviteModal onClose={() => setShowInvite(false)} onDone={load} />}
      {w9For && <W9WizardModal contractor={w9For} onClose={() => setW9For(null)} onDone={load} />}
    </div>
  );
}
