"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Check, ArrowLeft, ArrowRight, Eye, EyeOff, AlertCircle, Calendar, DollarSign, Zap, Users, ChevronDown, HeartPulse } from "lucide-react";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";

const federalHolidays = [
  "01-01", "07-04", "11-11", "12-25" // Simplified for demo
];

const isValidPayrollDate = (dateStr: string) => {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 4) return false;
  
  const day = date.getDay();
  if (day === 0 || day === 6) return false;
  
  const monthDay = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  if (federalHolidays.includes(monthDay)) return false;
  
  return true;
};

const step1Schema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid work email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  agreeTos: z.boolean().refine((val) => val === true, "You must agree to the Terms of Service"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const step2Schema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  companySize: z.string().min(1, "Please select a company size"),
  industry: z.string().min(1, "Please select an industry"),
  state: z.string().min(2, "Please select a state"),
  multiState: z.boolean(),
});

const step3Schema = z.object({
  ein: z.string().regex(/^\d{2}-\d{7}$/, "EIN must be in XX-XXXXXXX format").or(z.literal("")),
  paySchedule: z.string(),
  firstPayrollDate: z.string().optional().refine((val) => !val || isValidPayrollDate(val), {
    message: "Date must be at least 4 business days from today (skipping weekends/holidays)"
  }),
});

const step4Schema = z.object({
  isEmployeeYou: z.boolean().optional(),
  empName: z.string().optional(),
  empEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  empTitle: z.string().optional(),
  empStartDate: z.string().optional(),
  empPayType: z.string().optional(),
  empPayRate: z.string().optional(),
});

type FormData = z.infer<typeof step1Schema> & z.infer<typeof step2Schema> & z.infer<typeof step3Schema> & z.infer<typeof step4Schema>;

const STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];
const INDUSTRIES = ["Technology", "Healthcare", "Retail", "Professional Services", "Construction", "Non-Profit", "Other"];
const SIZES = ["1-10", "11-50", "51-250", "251-1000", "1000+"];

const TESTIMONIALS = [
  { text: "CircleWorks completely changed how we run our agency. From onboarding to payroll, everything is just simple now.", author: "Rebecca Johnson", initials: "RJ" },
  { text: "The most intuitive HR platform we've ever used. Our team loves it and it saves us hours every week.", author: "David Chen", initials: "DC" },
  { text: "Saved us countless hours on payroll processing and compliance. A truly life-changing software.", author: "Sarah Miller", initials: "SM" }
];

function SignupFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stepParam = searchParams.get("step");

  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [unfinishedBanner, setUnfinishedBanner] = useState(false);
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  const methods = useForm<FormData>({
    mode: "onChange",
    defaultValues: {
      fullName: "", email: "", password: "", confirmPassword: "", agreeTos: false,
      companyName: "", companySize: "", industry: "", state: "", multiState: false,
      ein: "", paySchedule: "Bi-Weekly", firstPayrollDate: "",
      isEmployeeYou: false, empName: "", empEmail: "", empTitle: "", empStartDate: "", empPayType: "Salary", empPayRate: "",
    }
  });

  const { register, getValues, setValue, watch, formState: { errors } } = methods;

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("signup_in_progress");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.step > 1 && parsed.step < 5) {
          setUnfinishedBanner(true);
          setStep(parsed.step);
          Object.keys(parsed.data).forEach(key => {
            setValue(key as keyof FormData, parsed.data[key]);
          });
          router.replace(`?step=${parsed.step}`);
        }
      } catch (e) {}
    } else if (stepParam) {
      setStep(parseInt(stepParam));
    }
  }, [setValue, router, stepParam]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTestimonialIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const savePartial = async (currentStep: number, data: any) => {
    localStorage.setItem("signup_in_progress", JSON.stringify({ step: currentStep, data }));
    if (data.email) {
      fetch("/api/auth/signup/partial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).catch(() => {});
    }
  };

  const nextStep = async (skipStep = false) => {
    let isValid = false;
    const data = getValues();

    if (skipStep) {
      isValid = true;
    } else if (step === 1) {
      methods.clearErrors();
      const res = step1Schema.safeParse(data);
      if (!res.success) {
        res.error.issues.forEach((err) => methods.setError(err.path[0] as keyof FormData, { message: err.message }));
      } else {
        isValid = true;
      }
    } else if (step === 2) {
      methods.clearErrors();
      const res = step2Schema.safeParse(data);
      if (!res.success) {
        res.error.issues.forEach((err) => methods.setError(err.path[0] as keyof FormData, { message: err.message }));
      } else {
        isValid = true;
      }
    } else if (step === 3) {
      methods.clearErrors();
      const res = step3Schema.safeParse(data);
      if (!res.success) {
        res.error.issues.forEach((err) => methods.setError(err.path[0] as keyof FormData, { message: err.message }));
      } else {
        isValid = true;
      }
    } else if (step === 4) {
      methods.clearErrors();
      const res = step4Schema.safeParse(data);
      if (!res.success) {
        res.error.issues.forEach((err) => methods.setError(err.path[0] as keyof FormData, { message: err.message }));
      } else {
        isValid = true;
      }
    }

    if (isValid) {
      const next = step + 1;
      setStep(next);
      router.replace(`?step=${next}`);
      savePartial(next, data);

      if (next === 5) {
        localStorage.removeItem("signup_in_progress");
        setTimeout(() => {
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#3b82f6', '#10b981', '#f59e0b', '#6366f1']
          });
        }, 300);
      }
    }
  };

  const prevStep = () => {
    const prev = Math.max(1, step - 1);
    setStep(prev);
    router.replace(`?step=${prev}`);
  };

  const handleEinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 2) val = val.slice(0, 2) + "-" + val.slice(2, 9);
    setValue("ein", val);
  };

  const passwordValue = watch("password") || "";
  let passwordStrength = 0;
  if (passwordValue.length > 0) {
    if (passwordValue.length >= 8) passwordStrength += 25;
    if (/[A-Z]/.test(passwordValue)) passwordStrength += 25;
    if (/[a-z]/.test(passwordValue)) passwordStrength += 25;
    if (/[0-9]/.test(passwordValue)) passwordStrength += 25;
  }
  let strengthLabel = "Weak";
  if (passwordStrength >= 50) strengthLabel = "Fair";
  if (passwordStrength >= 75) strengthLabel = "Strong";
  if (passwordStrength === 100) strengthLabel = "Very Strong";

  const isEmployeeYou = watch("isEmployeeYou");
  useEffect(() => {
    if (isEmployeeYou) {
      const fullName = watch("fullName") || "";
      const names = fullName.split(" ");
      setValue("empName", fullName);
      setValue("empEmail", watch("email") || "");
    } else {
      setValue("empName", "");
      setValue("empEmail", "");
    }
  }, [isEmployeeYou, setValue, watch]);

  if (!mounted) return null;

  return (
    <main className="min-h-screen flex bg-white sm:bg-slate-50">
      {/* LEFT PANEL */}
      <div className="hidden lg:flex w-[40%] bg-[#0A1628] text-white flex-col justify-between p-12 relative overflow-hidden shrink-0">
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 mb-16">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="3" />
              <path d="M16 8C11.5817 8 8 11.5817 8 16C8 20.4183 11.5817 24 16 24" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <span className="text-xl font-black tracking-tight">CircleWorks</span>
          </Link>
          <h2 className="text-3xl font-bold mb-8">Join 5,000+ US companies</h2>

          <div className="space-y-6">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${step > s ? "bg-green-500 text-white" : step === s ? "bg-blue-600 text-white" : "border border-slate-600 text-slate-500"}`}>
                  {step > s ? <Check size={16} /> : s}
                </div>
                <span className={`font-semibold ${step === s ? "text-white" : "text-slate-400"}`}>
                  {s === 1 ? "Create Account" : s === 2 ? "Company Info" : s === 3 ? "Payroll Setup" : s === 4 ? "Add Team" : "Complete"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 mt-16 h-32">
          <AnimatePresence mode="wait">
            <motion.div
              key={testimonialIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              <p className="text-sm font-medium text-slate-300 leading-relaxed italic mb-4">"{TESTIMONIALS[testimonialIndex].text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold text-xs">{TESTIMONIALS[testimonialIndex].initials}</div>
                <p className="text-xs font-bold text-white">{TESTIMONIALS[testimonialIndex].author}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full lg:w-[60%] bg-white flex flex-col relative min-h-screen">
        {step < 5 && (
          <div className="absolute top-0 left-0 w-full h-1 bg-slate-100">
            <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${(step / 5) * 100}%` }} />
          </div>
        )}

        {step > 1 && step < 5 && (
          <button onClick={prevStep} className="absolute top-6 left-6 inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors z-10">
            <ArrowLeft size={16} /> Back
          </button>
        )}

        <div className="max-w-xl w-full mx-auto px-6 py-12 flex-1 flex flex-col justify-center">
          {unfinishedBanner && step < 5 && (
            <div className="mb-6 p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-3">
              <AlertCircle size={20} className="text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-bold text-amber-800">You have an unfinished signup — continue?</p>
                <button type="button" onClick={() => { localStorage.removeItem("signup_in_progress"); window.location.href = "/signup"; }} className="text-sm font-medium text-amber-700 underline mt-1 hover:text-amber-900">Start over instead</button>
              </div>
            </div>
          )}

          <h1 className="text-2xl lg:text-3xl font-black text-[#0A1628] tracking-tight mb-6">
            {step === 1 && "Create Your Account"}
            {step === 2 && "About Your Company"}
            {step === 3 && "Payroll Basics"}
            {step === 4 && "Add Your First Employee"}
            {step === 5 && <span className="text-[40px]">🎉 You're all set!</span>}
          </h1>

          <form onSubmit={(e) => { e.preventDefault(); nextStep(); }} className="space-y-6">
            {step === 1 && (
              <div className="space-y-5">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                    <input {...register("fullName")} className={`w-full px-4 py-3 rounded-lg border ${errors.fullName ? 'border-red-500' : 'border-slate-300'} focus:ring-2 focus:ring-blue-600 focus:outline-none`} />
                    {errors.fullName && <p aria-live="polite" className="text-red-600 text-sm mt-1">{errors.fullName.message as string}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Work Email</label>
                    <input {...register("email")} type="email" className={`w-full px-4 py-3 rounded-lg border ${errors.email ? 'border-red-500' : 'border-slate-300'} focus:ring-2 focus:ring-blue-600 focus:outline-none`} />
                    {errors.email && <p aria-live="polite" className="text-red-600 text-sm mt-1">{errors.email.message as string}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
                    <div className="relative">
                      <input {...register("password")} type={showPassword ? "text" : "password"} className={`w-full px-4 py-3 rounded-lg border ${errors.password ? 'border-red-500' : 'border-slate-300'} focus:ring-2 focus:ring-blue-600 focus:outline-none`} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-slate-400"><Eye size={20} /></button>
                    </div>
                    {passwordValue && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div className={`h-full transition-all ${passwordStrength <= 25 ? 'bg-red-500' : passwordStrength <= 50 ? 'bg-amber-500' : passwordStrength <= 75 ? 'bg-blue-500' : 'bg-green-500'}`} style={{ width: `${passwordStrength}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-slate-500 w-16">{strengthLabel}</span>
                      </div>
                    )}
                    {errors.password && <p aria-live="polite" className="text-red-600 text-sm mt-1">{errors.password.message as string}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Confirm Password</label>
                    <div className="relative">
                      <input {...register("confirmPassword")} type={showConfirmPassword ? "text" : "password"} className={`w-full px-4 py-3 rounded-lg border ${errors.confirmPassword ? 'border-red-500' : 'border-slate-300'} focus:ring-2 focus:ring-blue-600 focus:outline-none`} />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-3 text-slate-400"><Eye size={20} /></button>
                    </div>
                    {errors.confirmPassword && <p aria-live="polite" className="text-red-600 text-sm mt-1">{errors.confirmPassword.message as string}</p>}
                  </div>
                </div>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                  <div className="relative flex justify-center"><span className="bg-white px-4 text-sm text-slate-500">— or sign up with email —</span></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button type="button" className="flex items-center justify-center gap-2 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 font-semibold text-slate-700 text-sm">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.11c-.22-.67-.35-1.39-.35-2.11s.13-1.44.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.51 6.16-4.51z" fill="#EA4335"/></svg>
                    Continue with Google
                  </button>
                  <button type="button" className="flex items-center justify-center gap-2 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 font-semibold text-slate-700 text-sm">
                    <svg width="18" height="18" viewBox="0 0 21 21" fill="none"><rect x="1" y="1" width="9" height="9" fill="#F25022"/><rect x="11" y="1" width="9" height="9" fill="#7FBA00"/><rect x="1" y="11" width="9" height="9" fill="#00A4EF"/><rect x="11" y="11" width="9" height="9" fill="#FFB900"/></svg>
                    Continue with Microsoft
                  </button>
                </div>

                <div className="flex items-start gap-3 mt-4">
                  <input type="checkbox" {...register("agreeTos")} className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600" />
                  <div className="text-sm text-slate-600">
                    I agree to the <Link href="/legal/terms" target="_blank" className="text-blue-600 hover:underline">Terms of Service</Link> and <Link href="/legal/privacy" target="_blank" className="text-blue-600 hover:underline">Privacy Policy</Link>
                    {errors.agreeTos && <p aria-live="polite" className="text-red-600 text-xs mt-1">{errors.agreeTos.message as string}</p>}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Company Legal Name</label>
                  <input {...register("companyName")} className={`w-full px-4 py-3 rounded-lg border ${errors.companyName ? 'border-red-500' : 'border-slate-300'} focus:ring-2 focus:ring-blue-600 focus:outline-none`} />
                  {errors.companyName && <p aria-live="polite" className="text-red-600 text-sm mt-1">{errors.companyName.message as string}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Company Size</label>
                    <select {...register("companySize")} className={`w-full px-4 py-3 rounded-lg border bg-white ${errors.companySize ? 'border-red-500' : 'border-slate-300'} focus:ring-2 focus:ring-blue-600 focus:outline-none`}>
                      <option value="">Select size</option>
                      {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {errors.companySize && <p aria-live="polite" className="text-red-600 text-sm mt-1">{errors.companySize.message as string}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Primary State</label>
                    <select {...register("state")} className={`w-full px-4 py-3 rounded-lg border bg-white ${errors.state ? 'border-red-500' : 'border-slate-300'} focus:ring-2 focus:ring-blue-600 focus:outline-none`}>
                      <option value="">Select state</option>
                      {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {errors.state && <p aria-live="polite" className="text-red-600 text-sm mt-1">{errors.state.message as string}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Industry</label>
                  <select {...register("industry")} className={`w-full px-4 py-3 rounded-lg border bg-white ${errors.industry ? 'border-red-500' : 'border-slate-300'} focus:ring-2 focus:ring-blue-600 focus:outline-none`}>
                    <option value="">Select industry</option>
                    {INDUSTRIES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.industry && <p aria-live="polite" className="text-red-600 text-sm mt-1">{errors.industry.message as string}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Do you operate in multiple states?</label>
                  <div className="flex gap-4">
                    <label className={`flex-1 cursor-pointer border rounded-lg p-4 text-center font-bold ${watch('multiState') === true ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-300 text-slate-600'}`}>
                      <input type="radio" className="sr-only" checked={watch('multiState') === true} onChange={() => setValue('multiState', true)} />
                      Yes
                    </label>
                    <label className={`flex-1 cursor-pointer border rounded-lg p-4 text-center font-bold ${watch('multiState') === false ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-300 text-slate-600'}`}>
                      <input type="radio" className="sr-only" checked={watch('multiState') === false} onChange={() => setValue('multiState', false)} />
                      No
                    </label>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">EIN (Employer Identification Number)</label>
                  <input {...register("ein")} onChange={handleEinChange} placeholder="XX-XXXXXXX" className={`w-full px-4 py-3 rounded-lg border ${errors.ein ? 'border-red-500' : 'border-slate-300'} focus:ring-2 focus:ring-blue-600 focus:outline-none`} />
                  {errors.ein && <p aria-live="polite" className="text-red-600 text-sm mt-1">{errors.ein.message as string}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Pay Schedule</label>
                  <div className="grid grid-cols-2 gap-4">
                    {["Bi-Weekly", "Semi-Monthly", "Weekly", "Monthly"].map((schedule) => (
                      <label key={schedule} className={`relative cursor-pointer border rounded-lg p-4 flex flex-col items-center justify-center gap-2 ${watch('paySchedule') === schedule ? 'border-blue-600 bg-blue-50 text-blue-800 ring-1 ring-blue-600' : 'border-slate-300 text-slate-600 hover:border-slate-400'}`}>
                        <input type="radio" value={schedule} {...register("paySchedule")} className="sr-only" />
                        <span className="font-bold">{schedule}</span>
                        {schedule === "Bi-Weekly" && <span className="absolute -top-2.5 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Most Popular</span>}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">First Payroll Date</label>
                  <input type="date" {...register("firstPayrollDate")} className={`w-full px-4 py-3 rounded-lg border ${errors.firstPayrollDate ? 'border-red-500' : 'border-slate-300'} focus:ring-2 focus:ring-blue-600 focus:outline-none`} />
                  <p className="text-sm text-slate-500 mt-1">We need 4 business days to process your first run.</p>
                  {errors.firstPayrollDate && <p aria-live="polite" className="text-red-600 text-sm mt-1">{errors.firstPayrollDate.message as string}</p>}
                </div>
                <div className="text-center pt-2">
                  <button type="button" onClick={() => nextStep(true)} className="text-sm font-medium text-slate-500 underline hover:text-slate-800">I'll set this up later</button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3 bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <span className="text-sm font-semibold text-blue-900">Is one of the employees you?</span>
                  <label className="relative inline-flex items-center cursor-pointer ml-auto">
                    <input type="checkbox" {...register("isEmployeeYou")} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">First & Last Name</label>
                    <input {...register("empName")} className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Work Email</label>
                    <input {...register("empEmail")} type="email" className={`w-full px-4 py-3 rounded-lg border ${errors.empEmail ? 'border-red-500' : 'border-slate-300'} focus:ring-2 focus:ring-blue-600 focus:outline-none`} />
                    {errors.empEmail && <p aria-live="polite" className="text-red-600 text-sm mt-1">{errors.empEmail.message as string}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Job Title</label>
                  <input {...register("empTitle")} className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Start Date</label>
                    <input type="date" {...register("empStartDate")} className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Pay Type</label>
                    <div className="flex gap-2">
                      <label className={`flex-1 cursor-pointer border rounded-lg py-3 text-center text-sm font-bold ${watch('empPayType') === 'Salary' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-300 text-slate-600'}`}>
                        <input type="radio" value="Salary" {...register("empPayType")} className="sr-only" /> Salary
                      </label>
                      <label className={`flex-1 cursor-pointer border rounded-lg py-3 text-center text-sm font-bold ${watch('empPayType') === 'Hourly' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-300 text-slate-600'}`}>
                        <input type="radio" value="Hourly" {...register("empPayType")} className="sr-only" /> Hourly
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Pay Rate</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-slate-500"><DollarSign size={18} /></span>
                    <input {...register("empPayRate")} type="number" placeholder="0.00" className="w-full pl-10 pr-16 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none" />
                    <span className="absolute right-4 top-3.5 text-slate-500 font-medium">{watch("empPayType") === "Salary" ? "per year" : "per hour"}</span>
                  </div>
                  {watch("empPayRate") && (
                    <p className="text-sm text-slate-500 mt-2 font-medium">
                      {watch("empPayType") === "Salary" 
                        ? `Estimated hourly: $${(parseFloat(watch("empPayRate") || "0") / 2080).toFixed(2)}`
                        : `Estimated annual: $${(parseFloat(watch("empPayRate") || "0") * 2080).toLocaleString()}`}
                    </p>
                  )}
                </div>

                <div className="text-center pt-2">
                  <button type="button" onClick={() => nextStep(true)} className="text-sm font-medium text-slate-500 underline hover:text-slate-800">Add more employees after setup</button>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-6">
                <p className="text-slate-600 font-medium text-lg mb-8">
                  {watch("companyName")} • Pro Plan • First Payroll: {watch("firstPayrollDate") ? new Date(watch("firstPayrollDate") as string).toLocaleDateString("en-US") : "TBD"}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link href="/app/payroll/run" className="flex flex-col gap-3 p-5 rounded-xl border border-slate-200 hover:border-blue-600 hover:shadow-lg transition-all group">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center"><Zap size={20} /></div>
                    <div>
                      <h3 className="font-bold text-slate-900 group-hover:text-blue-600">Run Your First Payroll</h3>
                      <p className="text-sm text-slate-500 mt-1">Review and process your first run.</p>
                    </div>
                    <ArrowRight className="text-slate-400 group-hover:text-blue-600 mt-auto" size={18} />
                  </Link>

                  <Link href="/app/employees/new" className="flex flex-col gap-3 p-5 rounded-xl border border-slate-200 hover:border-blue-600 hover:shadow-lg transition-all group">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center"><Users size={20} /></div>
                    <div>
                      <h3 className="font-bold text-slate-900 group-hover:text-blue-600">Add Employees</h3>
                      <p className="text-sm text-slate-500 mt-1">Onboard the rest of your team.</p>
                    </div>
                    <ArrowRight className="text-slate-400 group-hover:text-blue-600 mt-auto" size={18} />
                  </Link>

                  <Link href="/app/benefits" className="flex flex-col gap-3 p-5 rounded-xl border border-slate-200 hover:border-blue-600 hover:shadow-lg transition-all group">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center"><HeartPulse size={20} /></div>
                    <div>
                      <h3 className="font-bold text-slate-900 group-hover:text-blue-600">Set Up Benefits</h3>
                      <p className="text-sm text-slate-500 mt-1">Configure health & retirement plans.</p>
                    </div>
                    <ArrowRight className="text-slate-400 group-hover:text-blue-600 mt-auto" size={18} />
                  </Link>
                </div>
              </div>
            )}

            {step < 5 && (
              <div className="pt-6 mt-6 border-t border-slate-100 flex flex-col items-end">
                <button type="submit" className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow hover:bg-blue-700 transition-colors">
                  {step === 4 ? "Complete Setup" : "Next"}
                </button>
                {step === 1 && <p className="text-gray-500 italic text-sm mt-3 w-full md:w-auto text-center md:text-right">Start for free — no credit card required</p>}
              </div>
            )}
          </form>
        </div>
      </div>
    </main>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>}>
      <SignupFlow />
    </Suspense>
  );
}
