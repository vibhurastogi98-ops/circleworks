"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import confetti from "canvas-confetti";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import {
  Check, ChevronRight, ChevronLeft, Eye, EyeOff, ShieldCheck, Lock,
  Users, Calendar, DollarSign, ArrowRight, AlertCircle, X, Briefcase,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type WizardData = {
  step1: { fullName: string; email: string; password: string; confirmPassword: string; agreedToTerms: boolean };
  step2: { companyName: string; companySize: string; industry: string; primaryState: string; multipleStates: boolean };
  step3: { ein: string; paySchedule: string; firstPayrollDate: string; skipPayroll: boolean };
  step4: { isAdminEmployee: boolean; firstName: string; lastName: string; employeeEmail: string; title: string; startDate: string; payType: string; payRate: string; skip: boolean };
};

const INITIAL_DATA: WizardData = {
  step1: { fullName: "", email: "", password: "", confirmPassword: "", agreedToTerms: false },
  step2: { companyName: "", companySize: "", industry: "", primaryState: "", multipleStates: false },
  step3: { ein: "", paySchedule: "", firstPayrollDate: "", skipPayroll: false },
  step4: { isAdminEmployee: false, firstName: "", lastName: "", employeeEmail: "", title: "", startDate: "", payType: "salary", payRate: "", skip: false },
};

// ─── Constants ───────────────────────────────────────────────────────────────

const US_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
  "Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa",
  "Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan",
  "Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada",
  "New Hampshire","New Jersey","New Mexico","New York","North Carolina",
  "North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island",
  "South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont",
  "Virginia","Washington","West Virginia","Wisconsin","Wyoming",
];

const INDUSTRIES = ["Technology","Healthcare","Retail","Professional Services","Construction","Other"];
const COMPANY_SIZES = ["1–10","11–50","51–250","251–1,000","1,000+"];
const PAY_SCHEDULES = [
  { value: "bi-weekly",    label: "Bi-Weekly",    desc: "Every 2 weeks · 26×/yr" },
  { value: "semi-monthly", label: "Semi-Monthly", desc: "Twice a month · 24×/yr" },
  { value: "weekly",       label: "Weekly",       desc: "Every week · 52×/yr" },
  { value: "monthly",      label: "Monthly",      desc: "Once a month · 12×/yr" },
];
const WIZARD_STEPS = [
  "Start free",
  "Your company",
  "Payroll basics",
  "First employee",
  "All set!",
];
const DRAFT_KEY = "cw_signup_draft";

// ─── Schemas ─────────────────────────────────────────────────────────────────

const step1Schema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Enter a valid work email address"),
  password: z.string().min(8, "At least 8 characters"),
  confirmPassword: z.string(),
  agreedToTerms: z.boolean().refine((v) => v === true, {
    message: "You must agree to our Terms and Privacy Policy",
  }),
});

const step2Schema = z.object({
  companyName: z.string().min(2, "Company legal name is required"),
  companySize: z.string().min(1, "Please select a company size"),
  industry: z.string().min(1, "Please select an industry"),
  primaryState: z.string().min(1, "Please select your primary state"),
  multipleStates: z.boolean(),
});

const step3Schema = z.object({
  ein: z.union([
    z.literal(""),
    z.string().regex(/^\d{2}-\d{7}$/, "EIN must be formatted as XX-XXXXXXX"),
  ]),
  paySchedule: z.string().min(1, "Please select a pay schedule"),
  firstPayrollDate: z.string(),
  skipPayroll: z.literal(false),
});

const step4Schema = z.object({
  isAdminEmployee: z.boolean(),
  firstName: z.string(),
  lastName: z.string(),
  employeeEmail: z.string(),
  title: z.string(),
  startDate: z.string(),
  payType: z.string(),
  payRate: z.string(),
  skip: z.literal(false),
});

type Step1Values = z.infer<typeof step1Schema>;
type Step2Values = z.infer<typeof step2Schema>;
type Step3Values = z.infer<typeof step3Schema>;
type Step4Values = z.infer<typeof step4Schema>;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getPasswordStrength(pw: string): { bars: number; label: string; color: string } {
  if (!pw) return { bars: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { bars: 1, label: "Weak",   color: "bg-red-500" };
  if (score === 2) return { bars: 2, label: "Fair",   color: "bg-orange-500" };
  if (score <= 4)  return { bars: 3, label: "Good",   color: "bg-yellow-500" };
  return            { bars: 4, label: "Strong", color: "bg-green-500" };
}

function formatEIN(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 9);
  return digits.length <= 2 ? digits : `${digits.slice(0, 2)}-${digits.slice(2)}`;
}

function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date);
  let count = 0;
  while (count < days) {
    result.setDate(result.getDate() + 1);
    const d = result.getDay();
    if (d !== 0 && d !== 6) count++;
  }
  return result;
}

function getMinPayrollDate(): string {
  return addBusinessDays(new Date(), 4).toISOString().split("T")[0];
}

// ─── Shared input styles ──────────────────────────────────────────────────────

const inputBase = "w-full h-11 px-4 border rounded-lg text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors";
const labelBase = "block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5";
const errCls = "text-red-500 text-xs mt-1";

function inputCls(hasErr: boolean) {
  return `${inputBase} ${hasErr ? "border-red-400 bg-red-50" : "border-slate-200"}`;
}

// ─── Step 1 ──────────────────────────────────────────────────────────────────

function Step1Form({ data, onComplete, onGoogleClick }: {
  data: WizardData["step1"];
  onComplete: (d: WizardData["step1"]) => void;
  onGoogleClick: () => void;
}) {
  const [showPw, setShowPw] = useState(false);
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<Step1Values>({
    resolver: zodResolver(step1Schema),
    defaultValues: data,
  });
  const pw = watch("password", "");
  const strength = getPasswordStrength(pw);

  // Auto-sync confirmPassword so the field is always valid without showing it
  useEffect(() => {
    setValue("confirmPassword", pw);
  }, [pw, setValue]);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-[32px] font-bold text-[#0A1628] tracking-tight leading-tight mb-1">Create your account</h2>
        <p className="text-gray-500 font-medium">No credit card · 30-day free trial</p>
      </div>

      <button
        type="button"
        onClick={onGoogleClick}
        className="w-full flex items-center justify-center gap-3 h-11 border border-slate-200 bg-white rounded-lg text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all shadow-sm mb-5"
      >
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0" aria-hidden="true">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </button>

      <div className="relative flex items-center gap-3 mb-5">
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">or</span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      <form onSubmit={handleSubmit(onComplete)} className="space-y-4">
        <div>
          <label className={labelBase}>Full Name</label>
          <input {...register("fullName")} placeholder="Jane Smith" autoFocus className={inputCls(!!errors.fullName)} />
          {errors.fullName && <p className={errCls}>{errors.fullName.message}</p>}
        </div>

        <div>
          <label className={labelBase}>Work Email</label>
          <input {...register("email")} type="email" placeholder="jane@company.com" className={inputCls(!!errors.email)} />
          {errors.email && <p className={errCls}>{errors.email.message}</p>}
        </div>

        <div>
          <label className={labelBase}>Password</label>
          <div className="relative">
            <input
              {...register("password")}
              type={showPw ? "text" : "password"}
              placeholder="At least 8 characters"
              className={`${inputCls(!!errors.password)} pr-9`}
            />
            <button type="button" onClick={() => setShowPw(!showPw)}
              className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-600">
              {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          {pw && (
            <div className="mt-1.5">
              <div className="flex gap-0.5 h-1 mb-0.5">
                {[1,2,3,4].map((i) => (
                  <div key={i} className={`flex-1 rounded-full transition-all duration-300 ${i <= strength.bars ? strength.color : "bg-gray-200"}`} />
                ))}
              </div>
              <p className={`text-[10px] font-semibold ${strength.bars <= 1 ? "text-red-500" : strength.bars === 2 ? "text-orange-500" : strength.bars === 3 ? "text-yellow-600" : "text-green-600"}`}>
                {strength.label}
              </p>
            </div>
          )}
          {errors.password && <p className={errCls}>{errors.password.message}</p>}
        </div>

        {/* confirmPassword is hidden and auto-synced to password */}
        <input type="hidden" {...register("confirmPassword")} />

        <div>
          <label className="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" {...register("agreedToTerms")}
              className="mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600 shrink-0" />
            <span className="text-sm text-gray-600 leading-snug">
              I agree to{" "}
              <Link href="/terms" className="text-blue-600 hover:underline font-semibold">Terms of Service</Link>
              {" "}and{" "}
              <Link href="/privacy" className="text-blue-600 hover:underline font-semibold">Privacy Policy</Link>
            </span>
          </label>
          {errors.agreedToTerms && <p className={errCls}>{errors.agreedToTerms.message}</p>}
        </div>

        <button type="submit"
          className="w-full h-11 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-all flex items-center justify-center gap-2 text-sm shadow-sm shadow-blue-600/20 mt-2">
          Continue <ChevronRight size={16} />
        </button>
      </form>
    </div>
  );
}

// ─── Step 2 ──────────────────────────────────────────────────────────────────

function Step2Form({ data, onComplete, onBack }: {
  data: WizardData["step2"];
  onComplete: (d: WizardData["step2"]) => void;
  onBack: () => void;
}) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<Step2Values>({
    resolver: zodResolver(step2Schema),
    defaultValues: data,
  });
  const multipleStates = watch("multipleStates");

  const selectCls = (hasErr: boolean) =>
    `${inputBase} ${hasErr ? "border-red-400 bg-red-50" : "border-gray-300"} bg-white`;

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#0A1628] mb-1">Tell us about your company</h2>
      <p className="text-gray-500 text-sm font-medium mb-5">Help us configure CircleWorks for your business.</p>

      <form onSubmit={handleSubmit(onComplete)} className="space-y-4">
        <div>
          <label className={labelBase}>Company Legal Name</label>
          <input {...register("companyName")} placeholder="Acme Corp, Inc."
            className={inputCls(!!errors.companyName)} />
          {errors.companyName && <p className={errCls}>{errors.companyName.message}</p>}
        </div>

        <div>
          <label className={labelBase}>Company Size</label>
          <select {...register("companySize")} className={selectCls(!!errors.companySize)}>
            <option value="">Select company size</option>
            {COMPANY_SIZES.map((s) => <option key={s} value={s}>{s} employees</option>)}
          </select>
          {errors.companySize && <p className={errCls}>{errors.companySize.message}</p>}
        </div>

        <div>
          <label className={labelBase}>Industry</label>
          <select {...register("industry")} className={selectCls(!!errors.industry)}>
            <option value="">Select industry</option>
            {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
          {errors.industry && <p className={errCls}>{errors.industry.message}</p>}
        </div>

        <div>
          <label className={labelBase}>Primary State</label>
          <select {...register("primaryState")} className={selectCls(!!errors.primaryState)}>
            <option value="">Select your state</option>
            {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          {errors.primaryState && <p className={errCls}>{errors.primaryState.message}</p>}
        </div>

        <div className="flex items-center justify-between p-3.5 border border-gray-200 rounded-xl bg-gray-50">
          <div>
            <p className="text-sm font-semibold text-slate-800">Operate in multiple states?</p>
            <p className="text-xs text-gray-500 mt-0.5">We&apos;ll configure multi-state tax compliance.</p>
          </div>
          <button type="button" onClick={() => setValue("multipleStates", !multipleStates)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${multipleStates ? "bg-blue-600" : "bg-gray-300"}`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${multipleStates ? "translate-x-6" : "translate-x-1"}`} />
          </button>
        </div>

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onBack}
            className="flex items-center gap-1.5 h-11 px-5 border border-gray-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-all text-sm">
            <ChevronLeft size={16} /> Back
          </button>
          <button type="submit"
            className="flex-1 h-11 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 text-sm">
            Continue <ChevronRight size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Step 3 ──────────────────────────────────────────────────────────────────

function Step3Form({ data, onComplete, onBack, onSkip }: {
  data: WizardData["step3"];
  onComplete: (d: WizardData["step3"]) => void;
  onBack: () => void;
  onSkip: () => void;
}) {
  const { register, handleSubmit, watch, setValue, control, formState: { errors } } = useForm<Step3Values>({
    resolver: zodResolver(step3Schema),
    defaultValues: { ...data, skipPayroll: false as const },
  });
  const paySchedule = watch("paySchedule");
  const minDate = getMinPayrollDate();

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#0A1628] mb-1">Set up payroll basics</h2>
      <p className="text-gray-500 text-sm font-medium mb-5">Configure how and when you&apos;ll pay your team.</p>

      <form onSubmit={handleSubmit(onComplete)} className="space-y-5">
        <div>
          <label className={labelBase}>Employer Identification Number (EIN)</label>
          <Controller
            name="ein"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                onChange={(e) => field.onChange(formatEIN(e.target.value))}
                placeholder="XX-XXXXXXX"
                maxLength={10}
                className={`${inputCls(!!errors.ein)} font-mono tracking-wider`}
              />
            )}
          />
          {errors.ein && <p className={errCls}>{errors.ein.message}</p>}
          <p className="text-[11px] text-gray-400 mt-0.5">Auto-formatted as you type. You can add this later.</p>
        </div>

        <div>
          <label className={labelBase}>Pay Schedule</label>
          <div className="grid grid-cols-2 gap-1.5">
            {PAY_SCHEDULES.map((sched) => {
              const active = paySchedule === sched.value;
              return (
                <button key={sched.value} type="button" onClick={() => setValue("paySchedule", sched.value)}
                  className={`p-3 border-2 rounded-xl text-left transition-all ${active ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-gray-300 bg-white"}`}>
                  <Calendar size={14} className={`mb-1.5 ${active ? "text-blue-600" : "text-gray-400"}`} />
                  <p className={`text-sm font-bold leading-tight ${active ? "text-blue-700" : "text-slate-700"}`}>{sched.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{sched.desc}</p>
                </button>
              );
            })}
          </div>
          {errors.paySchedule && <p className={errCls}>{errors.paySchedule.message}</p>}
        </div>

        <div>
          <label className={labelBase}>First Payroll Date</label>
          <input type="date" min={minDate} {...register("firstPayrollDate")}
            className={inputCls(false)} />
          <p className="text-[11px] text-gray-400 mt-0.5">Must be at least 4 business days from today.</p>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={onBack}
            className="flex items-center gap-1.5 h-11 px-5 border border-gray-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-all text-sm">
            <ChevronLeft size={16} /> Back
          </button>
          <button type="submit"
            className="flex-1 h-11 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 text-sm">
            Continue <ChevronRight size={16} />
          </button>
        </div>

        <div className="text-center">
          <button type="button" onClick={onSkip}
            className="text-sm text-gray-400 hover:text-blue-600 font-medium transition-colors hover:underline">
            I&apos;ll set this up later →
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Step 4 ──────────────────────────────────────────────────────────────────

function Step4Form({ data, adminEmail, adminName, onComplete, onBack, onSkip, loading }: {
  data: WizardData["step4"];
  adminEmail: string;
  adminName: string;
  onComplete: (d: WizardData["step4"]) => void;
  onBack: () => void;
  onSkip: () => void;
  loading: boolean;
}) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<Step4Values>({
    resolver: zodResolver(step4Schema),
    defaultValues: { ...data, skip: false as const },
  });
  const isAdminEmployee = watch("isAdminEmployee");

  useEffect(() => {
    if (isAdminEmployee) {
      const parts = adminName.trim().split(" ");
      setValue("firstName", parts[0] ?? "");
      setValue("lastName", parts.slice(1).join(" "));
      setValue("employeeEmail", adminEmail);
    }
  }, [isAdminEmployee, adminEmail, adminName, setValue]);

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#0A1628] mb-1">Add your first employee</h2>
      <p className="text-gray-500 text-sm font-medium mb-5">You can add more team members after setup.</p>

      <form onSubmit={handleSubmit(onComplete)} className="space-y-4">
        <div className="flex items-center justify-between p-3.5 bg-blue-50 border border-blue-200 rounded-xl">
          <div>
            <p className="text-sm font-semibold text-slate-800">I&apos;m also an employee</p>
            <p className="text-xs text-gray-500 mt-0.5">Pre-fill with your account details.</p>
          </div>
          <button type="button" onClick={() => setValue("isAdminEmployee", !isAdminEmployee)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${isAdminEmployee ? "bg-blue-600" : "bg-gray-300"}`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${isAdminEmployee ? "translate-x-6" : "translate-x-1"}`} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={labelBase}>First Name</label>
            <input {...register("firstName")} placeholder="Jane" className={inputCls(false)} />
          </div>
          <div>
            <label className={labelBase}>Last Name</label>
            <input {...register("lastName")} placeholder="Smith" className={inputCls(false)} />
          </div>
        </div>

        <div>
          <label className={labelBase}>Work Email</label>
          <input {...register("employeeEmail")} type="email" placeholder="jane@company.com" className={inputCls(false)} />
        </div>

        <div>
          <label className={labelBase}>Job Title</label>
          <input {...register("title")} placeholder="Product Manager" className={inputCls(false)} />
        </div>

        <div>
          <label className={labelBase}>Start Date</label>
          <input type="date" {...register("startDate")} className={inputCls(false)} />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={labelBase}>Pay Type</label>
            <select {...register("payType")}
              className={`${inputBase} border-gray-300 bg-white`}>
              <option value="salary">Salary</option>
              <option value="hourly">Hourly</option>
            </select>
          </div>
          <div>
            <label className={labelBase}>Pay Rate</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-400 text-xs font-medium">$</span>
              <input {...register("payRate")} placeholder="75,000" className={`${inputCls(false)} pl-6`} />
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onBack} disabled={loading}
            className="flex items-center gap-1.5 h-11 px-5 border border-gray-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-all text-sm disabled:opacity-50">
            <ChevronLeft size={16} /> Back
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 h-11 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-70">
            {loading
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Setting up…</>
              : <>Complete Setup <ChevronRight size={16} /></>}
          </button>
        </div>

        <div className="text-center">
          <button type="button" onClick={onSkip} disabled={loading}
            className="text-sm text-gray-400 hover:text-blue-600 font-medium transition-colors hover:underline disabled:opacity-50">
            Add more employees after setup →
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Step 5 ──────────────────────────────────────────────────────────────────

function Step5Success({ data }: { data: WizardData }) {
  const router = useRouter();
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    const end = Date.now() + 2500;
    const colors = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6"];
    const frame = () => {
      confetti({ particleCount: 3, angle: 60,  spread: 55, origin: { x: 0 }, colors });
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, []);

  const payrollDateStr = data.step3.firstPayrollDate
    ? new Date(data.step3.firstPayrollDate + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : null;

  const cards = [
    { label: "Run your first payroll", desc: "Process payroll in minutes", icon: DollarSign, href: "/payroll",    color: "border-blue-100   bg-blue-50   text-blue-600" },
    { label: "Add employees",          desc: "Build out your team",        icon: Users,       href: "/employees", color: "border-green-100  bg-green-50  text-green-600" },
    { label: "Set up benefits",        desc: "Health, dental & more",      icon: Briefcase,   href: "/benefits",  color: "border-purple-100 bg-purple-50 text-purple-600" },
  ];

  return (
    <div className="text-center pb-2">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4 mx-auto">
        <Check size={30} className="text-green-600" strokeWidth={2.5} />
      </div>
      <h2 className="text-2xl font-bold text-[#0A1628] mb-1">You&apos;re all set!</h2>
      <p className="text-gray-500 text-sm font-medium mb-5">Your CircleWorks account is ready to go.</p>

      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-5 text-left divide-y divide-slate-200">
        {[
          ["Company",      data.step2.companyName || "—"],
          ["Team members", data.step4.skip || data.step4.isAdminEmployee ? "1 admin" : "1 admin + 1 employee"],
          ["Plan",         "Starter Plan"],
          ["Next payroll", data.step3.skipPayroll ? "Not set" : (payrollDateStr || "Not set")],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between py-2 text-sm first:pt-0 last:pb-0">
            <span className="text-gray-500 font-medium">{k}</span>
            <span className="font-bold text-slate-800">{v}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2.5 mb-5">
        {cards.map(({ label, desc, icon: Icon, href, color }) => (
          <button key={href} onClick={() => router.push(href)}
            className={`border rounded-xl p-3 text-left hover:shadow-md transition-all group ${color}`}>
            <Icon size={16} className="mb-2 opacity-80 group-hover:scale-110 transition-transform" />
            <p className="text-xs font-bold text-slate-800 leading-tight">{label}</p>
            <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
          </button>
        ))}
      </div>

      <button onClick={() => router.push("/dashboard")}
        className="w-full h-11 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 text-sm">
        Go to Dashboard <ArrowRight size={16} />
      </button>
    </div>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-1.5 mb-2">
        {WIZARD_STEPS.map((_, idx) => {
          const done   = idx < step;
          const active = idx === step;
          return (
            <React.Fragment key={idx}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 transition-all duration-300
                ${done   ? "bg-green-500 text-white"
                : active ? "bg-blue-600 text-white"
                :          "bg-slate-100 text-slate-400"}`}>
                {done ? <Check size={12} strokeWidth={3} /> : idx + 1}
              </div>
              {idx < WIZARD_STEPS.length - 1 && (
                <div className={`flex-1 h-1 rounded-full transition-all duration-500 ${idx < step ? "bg-green-400" : "bg-slate-200"}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
      <p className="text-xs text-slate-400 font-semibold">
        Step {step + 1} of {WIZARD_STEPS.length} · {WIZARD_STEPS[step]}
      </p>
    </div>
  );
}

// ─── Main Wizard ─────────────────────────────────────────────────────────────

const stepVariants = {
  initial: (dir: number) => ({ opacity: 0, x: dir * 30 }),
  animate: { opacity: 1, x: 0 },
  exit:    (dir: number) => ({ opacity: 0, x: dir * -30 }),
};

function SignupWizardInner() {
  const searchParams = useSearchParams();
  const googleMode  = searchParams.get("mode") === "google";
  const googleEmail = searchParams.get("email") || "";
  const googleName  = searchParams.get("name") || "";

  const [step, setStep]                 = useState(googleMode ? 1 : 0);
  const [dir, setDir]                   = useState(1);
  const [isGoogleAuth, setIsGoogleAuth] = useState(googleMode);
  const [wdata, setWdata]               = useState<WizardData>(() => ({
    ...INITIAL_DATA,
    step1: googleMode
      ? { fullName: googleName, email: googleEmail, password: "__google__", confirmPassword: "__google__", agreedToTerms: true }
      : INITIAL_DATA.step1,
  }));
  const [showBanner, setShowBanner] = useState(false);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError]     = useState("");

  const handleGoogleSignup = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?mode=signup`,
      },
    });
  };

  useEffect(() => {
    if (googleMode && googleEmail) {
      setIsGoogleAuth(true);
      setStep(1);
    }
  }, [googleMode, googleEmail]);

  useEffect(() => {
    if (googleMode) return;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const { step: s } = JSON.parse(raw);
        if (s > 0) setShowBanner(true);
      }
    } catch {}
  }, [googleMode]);

  const saveDraft = useCallback((s: number, d: WizardData) => {
    try {
      const safe = { ...d, step1: { ...d.step1, password: "", confirmPassword: "" } };
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ step: s, data: safe }));
    } catch {}
  }, []);

  const restoreDraft = () => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const { step: s, data: d } = JSON.parse(raw);
        setWdata((prev) => ({ ...prev, ...d }));
        goTo(s, 1);
        setShowBanner(false);
      }
    } catch {}
  };

  const discardDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setShowBanner(false);
  };

  const autoSave = async (s: number, d: WizardData) => {
    try {
      await fetch("/api/auth/signup/partial", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: d.step1.email, step: s, companyName: d.step2.companyName }),
      });
    } catch {}
  };

  const goTo = (s: number, d = 1) => {
    setDir(d);
    setStep(s);
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  };

  const advance = async (patch: Partial<WizardData>, nextStep: number) => {
    const next = { ...wdata, ...patch };
    setWdata(next);
    saveDraft(nextStep, next);
    await autoSave(nextStep, next);
    goTo(nextStep, 1);
  };

  const handleStep3Skip = async () => {
    await advance({ step3: { ein: "", paySchedule: "", firstPayrollDate: "", skipPayroll: true } }, 3);
  };

  const handleStep4Skip = async () => {
    setApiLoading(true);
    setApiError("");
    const patch: WizardData["step4"] = { ...INITIAL_DATA.step4, skip: true };
    const next = { ...wdata, step4: patch };
    await submitSignup(next);
  };

  const submitSignup = async (data: WizardData) => {
    setApiLoading(true);
    setApiError("");
    try {
      const res = await fetch("/api/auth/signup/complete", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, googleAuth: isGoogleAuth }),
      });
      if (!res.ok) {
        let message = "Something went wrong. Please try again.";
        try {
          const body = await res.json();
          message = body.error || message;
        } catch {
          // Ignore non-JSON error bodies and use fallback message.
        }
        setApiError(message);
        setApiLoading(false);
        return;
      }
      localStorage.removeItem(DRAFT_KEY);
      goTo(4, 1);
    } catch {
      setApiError("Network error. Please check your connection and try again.");
    } finally {
      setApiLoading(false);
    }
  };

  return (
    <main className="min-h-screen lg:h-screen lg:overflow-hidden flex bg-slate-50 selection:bg-blue-500/30 selection:text-blue-900 relative">
      {/* Draft Banner */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ y: -50 }} animate={{ y: 0 }} exit={{ y: -50 }}
            className="fixed top-0 inset-x-0 z-50 bg-blue-600 text-white px-4 h-12 flex items-center justify-between text-xs font-medium shadow-lg"
          >
            <span>You have an unfinished signup — continue where you left off?</span>
            <div className="flex items-center gap-3">
              <button onClick={restoreDraft}
                className="bg-white text-blue-600 px-3 py-1 rounded-lg text-xs font-bold hover:bg-blue-50 transition-all">
                Continue
              </button>
              <button onClick={discardDraft} className="text-blue-200 hover:text-white transition-colors" aria-label="Dismiss">
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── LEFT PANEL ── */}
      <div className={`hidden lg:flex lg:w-1/2 bg-[#0A1628] text-white flex-col justify-between p-12 relative overflow-hidden flex-shrink-0 ${showBanner ? "pt-20" : ""}`}>
        {/* Background blurs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -left-32 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-900/40 rounded-full blur-3xl" />
        </div>

        {/* Top content */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 group mb-10">
            <svg width="36" height="36" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="3"/>
              <path d="M16 8C11.5817 8 8 11.5817 8 16C8 20.4183 11.5817 24 16 24" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round"/>
            </svg>
            <span className="text-2xl font-black tracking-tight group-hover:text-blue-400 transition-colors">CircleWorks</span>
          </Link>

          <div className="max-w-md">
            <h1 className="text-4xl font-light text-slate-300 leading-tight mb-4">
              Payroll & HR.<br />
              <span className="font-bold text-white">Simplified for America.</span>
            </h1>
            <p className="text-base text-white/65 leading-relaxed">
              Payroll, HR, onboarding, and compliance — all in one place. Setup in under 10 minutes.
            </p>
          </div>
        </div>

        {/* Bottom content */}
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1.5">
              {["SJ","MR","ET","AK"].map((ini) => (
                <div key={ini} className="w-6 h-6 rounded-full bg-blue-600 border-2 border-[#0A1628] flex items-center justify-center text-[9px] font-bold">{ini}</div>
              ))}
            </div>
            <span className="text-xs text-white/65 font-medium">5,000+ companies trust CircleWorks</span>
          </div>

          <blockquote className="text-xs text-white/60 italic leading-relaxed border-l-2 border-blue-500/40 pl-3">
            &ldquo;Setup took under 10 minutes. Saves us 20+ hrs/week on payroll.&rdquo;
            <footer className="text-white/40 not-italic mt-1 font-medium">— Sarah J., TechFlow</footer>
          </blockquote>

          <div className="flex items-center gap-3 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2 text-xs text-white font-semibold tracking-wide border border-white/60 px-4 py-2.5 rounded-lg opacity-80 hover:opacity-100 transition-opacity">
              <ShieldCheck size={16} /> SOC 2 Type II
            </div>
            <div className="flex items-center gap-2 text-xs text-white font-semibold tracking-wide border border-white/60 px-4 py-2.5 rounded-lg opacity-80 hover:opacity-100 transition-opacity">
              <Lock size={16} /> 256-bit AES
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className={`w-full lg:w-1/2 bg-white flex flex-col overflow-y-auto lg:overflow-hidden ${showBanner ? "pt-12" : ""}`}>
        {/* Header */}
        <div className="absolute right-6 top-6 hidden sm:flex items-center gap-2 text-sm font-semibold text-slate-600">
          <span>Already have an account?</span>
          <Link href="/login"
            className="inline-flex h-9 items-center justify-center rounded-lg bg-[#0A1628] px-4 text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 text-sm font-semibold">
            Sign in
          </Link>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-start lg:items-center justify-center p-6 sm:p-10 lg:px-16 lg:py-8">
          <div className="w-full max-w-sm">
            {/* Mobile logo */}
            <Link href="/" className="lg:hidden inline-flex items-center gap-2 mb-8">
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="14" stroke="#0A1628" strokeWidth="3"/>
                <path d="M16 8C11.5817 8 8 11.5817 8 16C8 20.4183 11.5817 24 16 24" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round"/>
              </svg>
              <span className="text-xl font-black text-[#0A1628] tracking-tight">CircleWorks</span>
            </Link>
            {/* Progress bar */}
            <ProgressBar step={step} />

            {/* Form */}
            <div>
              {apiError && (
                <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-100 flex items-start gap-2 relative pr-8" role="alert">
                  <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm font-semibold text-red-600 flex-1">{apiError}</p>
                  <button onClick={() => setApiError("")} className="absolute right-2 top-2 text-red-400 hover:text-red-600"><X size={16} /></button>
                </div>
              )}

              <AnimatePresence mode="wait" custom={dir}>
                <motion.div
                  key={step}
                  custom={dir}
                  variants={stepVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  {step === 0 && (
                    <Step1Form
                      data={wdata.step1}
                      onComplete={(d) => advance({ step1: d }, 1)}
                      onGoogleClick={handleGoogleSignup}
                    />
                  )}
                  {step === 1 && (
                    <Step2Form
                      data={wdata.step2}
                      onComplete={(d) => advance({ step2: d }, 2)}
                      onBack={() => goTo(0, -1)}
                    />
                  )}
                  {step === 2 && (
                    <Step3Form
                      data={wdata.step3}
                      onComplete={(d) => advance({ step3: d }, 3)}
                      onBack={() => goTo(1, -1)}
                      onSkip={handleStep3Skip}
                    />
                  )}
                  {step === 3 && (
                    <Step4Form
                      data={wdata.step4}
                      adminEmail={wdata.step1.email}
                      adminName={wdata.step1.fullName}
                      onComplete={(d) => {
                        const next = { ...wdata, step4: d };
                        setWdata(next);
                        submitSignup(next);
                      }}
                      onBack={() => goTo(2, -1)}
                      onSkip={handleStep4Skip}
                      loading={apiLoading}
                    />
                  )}
                  {step === 4 && <Step5Success data={wdata} />}
                </motion.div>
              </AnimatePresence>
            </div>

            {step < 4 && (
              <p className="mt-5 text-center text-sm text-gray-500 font-medium sm:hidden">
                Already have an account?{" "}
                <Link href="/login" className="font-bold text-blue-600 hover:text-blue-700 hover:underline">Sign in</Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function SignupWizard() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="w-7 h-7 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" /></div>}>
      <SignupWizardInner />
    </Suspense>
  );
}
