"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSignUp } from "@clerk/nextjs/legacy";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Check, ArrowLeft, ArrowRight, Eye, EyeOff, AlertCircle, Building2, Building, Calendar, DollarSign, Zap, Search, Users, ChevronDown } from "lucide-react";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";

// Validation Schemas
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
  firstPayrollDate: z.string(),
});

const step4Schema = z.object({
  empName: z.string().optional(),
  empEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  empTitle: z.string().optional(),
  empStartDate: z.string().optional(),
  empPayType: z.string().optional(),
  empPayRate: z.string().optional(),
});

// Full combined schema type
type FormData = z.infer<typeof step1Schema> & z.infer<typeof step2Schema> & z.infer<typeof step3Schema> & z.infer<typeof step4Schema>;

const STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];
const INDUSTRIES = ["Technology", "Healthcare", "Retail", "Professional Services", "Construction", "Other"];
const SIZES = ["1-10", "11-50", "51-250", "251-1000", "1000+"];

export default function SignupPage() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [unfinishedBanner, setUnfinishedBanner] = useState(false);

  // Initialize generic form without full validation so we can validate step-by-step
  const methods = useForm<FormData>({
    mode: "onChange",
    defaultValues: {
      fullName: "", email: "", password: "", confirmPassword: "", agreeTos: false,
      companyName: "", companySize: "", industry: "", state: "", multiState: false,
      ein: "", paySchedule: "", firstPayrollDate: "",
      empName: "", empEmail: "", empTitle: "", empStartDate: "", empPayType: "Salary", empPayRate: "",
    }
  });

  const { register, trigger, getValues, setValue, watch, formState: { errors } } = methods;

  // Load from local storage on mount
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("circleworks_signup_progress");
    if (saved) {
      try {
        const { step: savedStep, data } = JSON.parse(saved);
        if (savedStep > 1 && savedStep < 5) {
          setUnfinishedBanner(true);
        }
        Object.keys(data).forEach((key) => {
          setValue(key as keyof FormData, data[key]);
        });
      } catch (e) {
        console.error(e);
      }
    }
  }, [setValue]);

  // Redirect if signed in
  useEffect(() => {
    if (isSignedIn) {
      router.replace("/dashboard");
    }
  }, [isSignedIn, router]);

  // Save to local storage on change
  useEffect(() => {
    if (!mounted) return;
    const subscription = methods.watch((value) => {
      localStorage.setItem("circleworks_signup_progress", JSON.stringify({ step: step, data: value }));
    });
    return () => subscription.unsubscribe();
  }, [methods.watch, step, mounted]);

  const handleGoogleSignup = async () => {
    if (!isLoaded) return;
    try {
      await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/dashboard",
      });
    } catch (err) {
      console.error("Google signup error", err);
    }
  };

  const handleMicrosoftSignup = async () => {
    if (!isLoaded) return;
    try {
      await signUp.authenticateWithRedirect({
        strategy: "oauth_microsoft",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/dashboard",
      });
    } catch (err) {
      console.error("Microsoft signup error", err);
    }
  };

  const passwordValue = watch("password") || "";
  const passwordStrength = Math.min(100, passwordValue.length * 10 + (/[A-Z]/.test(passwordValue) ? 10 : 0) + (/[0-9]/.test(passwordValue) ? 10 : 0));

  const nextStep = async () => {
    let isValid = false;
    if (step === 1) {
      const data = getValues();
      methods.clearErrors(); // Clear before re-validating
      const res = step1Schema.safeParse(data);
      if (!res.success) {
        (res.error as any).errors.forEach((err: any) => methods.setError(err.path[0] as keyof FormData, { message: err.message }));
      } else {
        isValid = true;
      }
    } else if (step === 2) {
      const data = getValues();
      methods.clearErrors();
      const res = step2Schema.safeParse(data);
      if (!res.success) {
        (res.error as any).errors.forEach((err: any) => methods.setError(err.path[0] as keyof FormData, { message: err.message }));
      } else {
        isValid = true;
      }
    } else if (step === 3) {
      isValid = true;
      const data = getValues();
      methods.clearErrors();
      if (data.ein && !/^\d{2}-\d{7}$/.test(data.ein)) {
         methods.setError("ein", { message: "EIN must be XX-XXXXXXX" });
         isValid = false;
      }
      if (data.firstPayrollDate) {
         const d = new Date(data.firstPayrollDate);
         const now = new Date();
         const diffTime = Math.abs(d.getTime() - now.getTime());
         const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
         if (diffDays < 4 && d > now) {
            methods.setError("firstPayrollDate", { message: "Date must be at least 4 days from today" });
            isValid = false;
         }
      }
    } else if (step === 4) {
      isValid = true;
    }

    if (isValid) {
      methods.clearErrors();
      setStep(prev => prev + 1);
      if (step + 1 === 5) {
        const formData = getValues();
        // Persist companyName to Clerk Metadata
        fetch("/api/users/me", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            companyName: formData.companyName,
          }),
        }).catch(err => console.error("Failed to persist company name on signup", err));

        localStorage.removeItem("circleworks_signup_progress");
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
    setStep(prev => Math.max(1, prev - 1));
  };

  const handleEinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 2) val = val.slice(0, 2) + "-" + val.slice(2, 9);
    setValue("ein", val);
  };

  if (!mounted) return null; // Avoid hydration mismatch

  return (
    <main className="min-h-screen flex bg-slate-50 selection:bg-blue-500/30 selection:text-blue-900">
      {/* LEFT: Branding Panel */}
      <div className="hidden lg:flex w-[40%] bg-[#0a1128] text-white flex-col justify-between p-12 relative overflow-hidden shrink-0">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
           <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-blue-600/10 rounded-full blur-[120px]" />
           <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-indigo-600/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 group mb-16">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="3" />
              <path d="M16 8C11.5817 8 8 11.5817 8 16C8 20.4183 11.5817 24 16 24" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <span className="text-xl font-black tracking-tight transition-colors">CircleWorks</span>
          </Link>

          <div className="space-y-8">
            {[
              { num: 1, title: "Account Details" },
              { num: 2, title: "Company Info" },
              { num: 3, title: "Payroll Setup" },
              { num: 4, title: "Add Team" },
            ].map((s) => (
              <div key={s.num} className={`flex items-center gap-4 transition-all duration-300 ${step === s.num ? "opacity-100 scale-105" : step > s.num ? "opacity-70" : "opacity-40"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step > s.num ? "bg-emerald-500 text-white" : step === s.num ? "bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]" : "bg-white/10 text-white"}`}>
                  {step > s.num ? <Check size={16} /> : s.num}
                </div>
                <span className={`font-semibold tracking-wide ${step === s.num ? "text-white" : "text-slate-300"}`}>{s.title}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 mt-16 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
          <p className="text-sm font-medium text-slate-200 leading-relaxed italic">
            "CircleWorks completely changed how we run our agency. From onboarding to payroll, everything is just simple now."
          </p>
          <div className="flex items-center gap-3 mt-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center font-bold text-xs">RJ</div>
            <div>
              <p className="text-xs font-bold text-white">Rebecca Johnson</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Join 5,000+ US companies</p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: Form Panel */}
      <div className="w-full lg:w-[60%] bg-white flex flex-col relative min-h-screen h-full overflow-y-auto">
        {/* Progress Bar (Top) */}
        {step < 5 && (
          <div className="w-full h-2 bg-slate-100 flex absolute top-0 left-0">
            {[1, 2, 3, 4, 5].map((i) => (
              <div 
                key={i} 
                className={`flex-1 h-full transition-all duration-500 ${step > i ? "bg-emerald-500" : step === i ? "bg-blue-500" : "bg-transparent"}`} 
              />
            ))}
          </div>
        )}

        <div className="max-w-xl w-full mx-auto px-6 py-8 flex-1 flex flex-col justify-center">
          {unfinishedBanner && step < 5 && (
             <div className="mb-4 p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2">
               <AlertCircle size={18} className="text-amber-600 mt-0.5 shrink-0" />
               <div>
                  <p className="text-xs font-bold text-amber-800">You have an unfinished signup.</p>
                  <p className="text-xs font-medium text-amber-700 mt-0.5">We saved your progress. Would you like to continue or <button type="button" onClick={() => { localStorage.removeItem("circleworks_signup_progress"); window.location.reload(); }} className="underline">start over</button>?</p>
               </div>
             </div>
          )}

          <div className="mb-6">
            {step > 1 && step < 5 && (
              <button onClick={prevStep} className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-700 transition-colors">
                <ArrowLeft size={16} /> Back
              </button>
            )}
            
            <h1 className="text-2xl lg:text-3xl font-black text-[#0a1128] tracking-tight mb-2">
              {step === 1 && "Create your account"}
              {step === 2 && "Tell us about your company"}
              {step === 3 && "Set up payroll basics"}
              {step === 4 && "Add your first employee"}
              {step === 5 && "You're ready!"}
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              {step === 1 && "Start your 30-day free trial."}
              {step === 2 && "Help us customize your workspace."}
              {step === 3 && "You can always change these settings later."}
              {step === 4 && "Who will you be paying first? (This can be you!)"}
              {step === 5 && "Your workspace is securely set up and ready to go."}
            </p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); nextStep(); }} className="space-y-4 flex-1 flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {step === 1 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-3">
                      <div className="relative group">
                        <input
                          {...register("fullName")}
                          autoFocus
                          className={`peer w-full px-4 pt-5 pb-1.5 bg-slate-50 border rounded-xl text-slate-900 placeholder-transparent focus:bg-white focus:outline-none focus:ring-4 transition-all ${errors.fullName ? "border-red-300 focus:border-red-500 focus:ring-red-500/10" : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/10"}`}
                          placeholder="Full Name"
                        />
                        <label className={`absolute left-4 top-2 text-[11px] font-bold uppercase tracking-widest transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-placeholder-shown:font-medium peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:text-[11px] peer-focus:top-2 peer-focus:font-bold peer-focus:uppercase peer-focus:tracking-widest ${errors.fullName ? "text-red-500" : "text-slate-500 peer-focus:text-blue-500"}`}>Full Legal Name</label>
                        {errors.fullName && <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-1 font-medium z-10">{errors.fullName.message as string}</p>}
                      </div>

                      <div className="relative group mt-1">
                        <input
                          type="email"
                          {...register("email")}
                          className={`peer w-full px-4 pt-5 pb-1.5 bg-slate-50 border rounded-xl text-slate-900 placeholder-transparent focus:bg-white focus:outline-none focus:ring-4 transition-all ${errors.email ? "border-red-300 focus:border-red-500 focus:ring-red-500/10" : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/10"}`}
                          placeholder="Work email address"
                        />
                        <label className={`absolute left-4 top-2 text-[11px] font-bold uppercase tracking-widest transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-placeholder-shown:font-medium peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:text-[11px] peer-focus:top-2 peer-focus:font-bold peer-focus:uppercase peer-focus:tracking-widest ${errors.email ? "text-red-500" : "text-slate-500 peer-focus:text-blue-500"}`}>Work Email Address</label>
                        {errors.email && <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-1 font-medium z-10">{errors.email.message as string}</p>}
                      </div>
                      
                      <div className="relative group mt-1">
                        <input
                          type={showPassword ? "text" : "password"}
                          {...register("password")}
                          className={`peer w-full px-4 pt-5 pb-1.5 pr-12 bg-slate-50 border rounded-xl text-slate-900 placeholder-transparent focus:bg-white focus:outline-none focus:ring-4 transition-all ${errors.password ? "border-red-300 focus:border-red-500 focus:ring-red-500/10" : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/10"}`}
                          placeholder="Password"
                        />
                        <label className={`absolute left-4 top-2 text-[11px] font-bold uppercase tracking-widest transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-placeholder-shown:font-medium peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:text-[11px] peer-focus:top-2 peer-focus:font-bold peer-focus:uppercase peer-focus:tracking-widest ${errors.password ? "text-red-500" : "text-slate-500 peer-focus:text-blue-500"}`}>Password (min 8 chars)</label>
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 focus:outline-none">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                        {/* Strength Meter */}
                        {passwordValue.length > 0 && (
                          <div className="absolute -bottom-2 left-0 w-full h-1 bg-slate-200 rounded-b-xl overflow-hidden">
                            <div className={`h-full transition-all ${passwordStrength < 40 ? 'bg-red-500' : passwordStrength < 80 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${passwordStrength}%` }} />
                          </div>
                        )}
                        {errors.password && <p className="text-red-500 text-xs mt-1 absolute -bottom-6 left-1 font-medium z-10">{errors.password.message as string}</p>}
                      </div>

                      <div className="relative group mt-2">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          {...register("confirmPassword")}
                          className={`peer w-full px-4 pt-5 pb-1.5 pr-12 bg-slate-50 border rounded-xl text-slate-900 placeholder-transparent focus:bg-white focus:outline-none focus:ring-4 transition-all ${errors.confirmPassword ? "border-red-300 focus:border-red-500 focus:ring-red-500/10" : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/10"}`}
                          placeholder="Confirm Password"
                        />
                        <label className={`absolute left-4 top-2 text-[11px] font-bold uppercase tracking-widest transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-placeholder-shown:font-medium peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:text-[11px] peer-focus:top-2 peer-focus:font-bold peer-focus:uppercase peer-focus:tracking-widest ${errors.confirmPassword ? "text-red-500" : "text-slate-500 peer-focus:text-blue-500"}`}>Confirm Password</label>
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 focus:outline-none">{showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                        {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-1 font-medium z-10">{errors.confirmPassword.message as string}</p>}
                      </div>

                      <div className="mt-3 flex items-start gap-3">
                        <div className="relative flex items-center justify-center w-5 h-5 mt-0.5">
                          <input 
                            type="checkbox" 
                            {...register("agreeTos")}
                            className={`peer appearance-none w-5 h-5 border-2 rounded focus:ring-2 focus:ring-blue-500/20 focus:outline-none checked:bg-blue-600 checked:border-blue-600 transition-colors ${errors.agreeTos ? "border-red-400" : "border-slate-300"}`} 
                          />
                          <Check size={12} className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                        </div>
                        <div className="flex-1">
                          <span className="text-xs font-medium text-slate-600 select-none">
                            I agree to the <Link href="/legal/terms" className="text-blue-600 hover:underline">Terms of Service</Link> and <Link href="/legal/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>.
                          </span>
                          {errors.agreeTos && <p className="text-red-500 text-xs mt-1 font-medium z-10">{errors.agreeTos.message as string}</p>}
                        </div>
                      </div>
                    </div>

                    <div className="relative pt-3 pb-1">
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                      <div className="relative flex justify-center text-sm"><span className="bg-white px-4 text-slate-400 font-medium text-xs">— or sign up with —</span></div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pb-2">
                       <button type="button" onClick={handleGoogleSignup} className="flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-sm font-bold text-slate-700">
                         <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.11c-.22-.67-.35-1.39-.35-2.11s.13-1.44.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.51 6.16-4.51z" fill="#EA4335"/></svg>
                         Google
                      </button>
                       <button type="button" onClick={handleMicrosoftSignup} className="flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-sm font-bold text-slate-700">
                        <svg width="18" height="18" viewBox="0 0 21 21" fill="none"><rect x="1" y="1" width="9" height="9" fill="#F25022"/><rect x="11" y="1" width="9" height="9" fill="#7FBA00"/><rect x="1" y="11" width="9" height="9" fill="#00A4EF"/><rect x="11" y="11" width="9" height="9" fill="#FFB900"/></svg>
                        Microsoft
                      </button>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                     <div className="relative group">
                        <input
                          {...register("companyName")}
                          autoFocus
                          className={`peer w-full px-4 pt-6 pb-2 bg-slate-50 border rounded-xl text-slate-900 placeholder-transparent focus:bg-white focus:outline-none focus:ring-4 transition-all ${errors.companyName ? "border-red-300 focus:border-red-500" : "border-slate-200 focus:border-blue-500"}`}
                          placeholder="Company Legal Name"
                        />
                        <label className={`absolute left-4 top-2 text-[11px] font-bold uppercase tracking-widest transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-placeholder-shown:font-medium peer-placeholder-shown:normal-case peer-focus:text-[11px] peer-focus:top-2 peer-focus:font-bold peer-focus:uppercase ${errors.companyName ? "text-red-500" : "text-slate-500"}`}>Company Legal Name</label>
                        {errors.companyName && <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-1 font-medium z-10">{errors.companyName.message as string}</p>}
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-[1.5rem]">
                        <div className="space-y-2">
                           <label className="text-xs font-bold text-slate-700 uppercase tracking-widest pl-1">Company Size</label>
                           <div className="relative group">
                             <select {...register("companySize")} className={`w-full bg-slate-50 border rounded-xl px-4 py-4 focus:bg-white focus:outline-none focus:ring-4 transition-all appearance-none cursor-pointer text-slate-900 font-bold ${errors.companySize ? "border-red-300 focus:border-red-500" : "border-slate-200 focus:border-blue-500"}`}>
                               <option value="" disabled>Select size</option>
                               {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                             </select>
                             <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-blue-500 transition-colors" size={18} />
                           </div>
                           {errors.companySize && <p className="text-red-500 text-xs mt-1 font-medium z-10">{errors.companySize.message as string}</p>}
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-bold text-slate-700 uppercase tracking-widest pl-1">Primary State</label>
                           <div className="relative group">
                             <select {...register("state")} className={`w-full bg-slate-50 border rounded-xl px-4 py-4 focus:bg-white focus:outline-none focus:ring-4 transition-all appearance-none cursor-pointer text-slate-900 font-bold ${errors.state ? "border-red-300 focus:border-red-500" : "border-slate-200 focus:border-blue-500"}`}>
                               <option value="" disabled>Select state</option>
                               {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                             </select>
                             <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-blue-500 transition-colors" size={18} />
                           </div>
                           {errors.state && <p className="text-red-500 text-xs mt-1 font-medium z-10">{errors.state.message as string}</p>}
                        </div>
                      </div>

                      <div className="space-y-2 mt-[1.5rem]">
                         <label className="text-xs font-bold text-slate-700 uppercase tracking-widest pl-1">Industry</label>
                         <div className="relative group">
                           <select {...register("industry")} className={`w-full bg-slate-50 border rounded-xl px-4 py-4 focus:bg-white focus:outline-none focus:ring-4 transition-all appearance-none cursor-pointer text-slate-900 font-bold ${errors.industry ? "border-red-300 focus:border-red-500" : "border-slate-200 focus:border-blue-500"}`}>
                             <option value="" disabled>Select industry</option>
                             {INDUSTRIES.map(s => <option key={s} value={s}>{s}</option>)}
                           </select>
                           <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-blue-500 transition-colors" size={18} />
                         </div>
                         {errors.industry && <p className="text-red-500 text-xs mt-1 font-medium z-10">{errors.industry.message as string}</p>}
                      </div>

                      <div className="flex items-center justify-between mt-6 p-4 rounded-xl border border-slate-200 bg-slate-50">
                         <div>
                            <p className="text-sm font-bold text-slate-800">Multiple States?</p>
                            <p className="text-xs font-medium text-slate-500">Do you hire employees in other states?</p>
                         </div>
                         <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" {...register("multiState")} className="sr-only peer" />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                          </label>
                      </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <div className="relative group">
                        <input
                          {...register("ein")}
                          onChange={handleEinChange}
                          className={`peer w-full px-4 pt-6 pb-2 bg-slate-50 border rounded-xl text-slate-900 placeholder-transparent focus:bg-white focus:outline-none focus:ring-4 transition-all ${errors.ein ? "border-red-300 focus:border-red-500" : "border-slate-200 focus:border-blue-500"}`}
                          placeholder="XX-XXXXXXX"
                          maxLength={10}
                        />
                        <label className={`absolute left-4 top-2 text-[11px] font-bold uppercase tracking-widest transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-placeholder-shown:font-medium peer-placeholder-shown:normal-case peer-focus:text-[11px] peer-focus:top-2 peer-focus:font-bold peer-focus:uppercase ${errors.ein ? "text-red-500" : "text-slate-500"}`}>Employer Identification Number (EIN)</label>
                        {errors.ein && <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-1 font-medium z-10">{errors.ein.message as string}</p>}
                    </div>

                    <div className="mt-[1.5rem] space-y-3">
                       <label className="text-xs font-bold text-slate-700 uppercase tracking-widest pl-1">Pay Schedule</label>
                       <div className="grid grid-cols-2 gap-3">
                         {["Weekly", "Bi-Weekly", "Semi-Monthly", "Monthly"].map((schedule) => (
                            <label key={schedule} className={`cursor-pointer border rounded-xl p-4 flex flex-col items-start gap-2 hover:border-blue-300 hover:bg-blue-50 transition-all ${watch('paySchedule') === schedule ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/20' : 'border-slate-200 bg-white'}`}>
                              <input type="radio" value={schedule} {...register("paySchedule")} className="sr-only" />
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><Calendar size={16} /></div>
                              <span className="text-sm font-bold text-slate-800 tracking-tight">{schedule}</span>
                            </label>
                         ))}
                       </div>
                    </div>

                    <div className="relative group mt-[1.5rem]">
                        <input
                          type="date"
                          {...register("firstPayrollDate")}
                          className={`peer w-full px-4 pt-6 pb-2 bg-slate-50 border rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-4 transition-all ${errors.firstPayrollDate ? "border-red-300 focus:border-red-500" : "border-slate-200 focus:border-blue-500"}`}
                        />
                        <label className={`absolute left-4 top-2 text-[11px] font-bold uppercase tracking-widest transition-all ${errors.firstPayrollDate ? "text-red-500" : "text-slate-500"}`}>First Payroll Date (min. 4 biz days)</label>
                        {errors.firstPayrollDate && <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-1 font-medium z-10">{errors.firstPayrollDate.message as string}</p>}
                    </div>

                    <div className="text-center pt-8">
                       <button type="button" onClick={() => nextStep()} className="text-sm font-bold text-slate-400 hover:text-slate-700 underline underline-offset-4">I'll set this up later</button>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative group">
                          <input
                            {...register("empName")}
                            className="peer w-full px-4 pt-6 pb-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-transparent focus:bg-white focus:outline-none focus:ring-4 focus:border-blue-500 focus:ring-blue-500/10 transition-all cursor-text"
                            placeholder="Employee Name"
                          />
                          <label className="absolute left-4 top-2 text-[11px] font-bold uppercase tracking-widest text-slate-500 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-placeholder-shown:font-medium peer-placeholder-shown:normal-case peer-focus:text-[11px] peer-focus:top-2 peer-focus:font-bold peer-focus:uppercase peer-focus:text-blue-500">Employee Name</label>
                      </div>
                      <div className="relative group">
                          <input
                            type="email"
                            {...register("empEmail")}
                            className={`peer w-full px-4 pt-6 pb-2 bg-slate-50 border rounded-xl text-slate-900 placeholder-transparent focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all cursor-text ${errors.empEmail ? 'border-red-300' : 'border-slate-200 focus:border-blue-500'}`}
                            placeholder="Employee Email"
                          />
                          <label className="absolute left-4 top-2 text-[11px] font-bold uppercase tracking-widest text-slate-500 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-placeholder-shown:font-medium peer-placeholder-shown:normal-case peer-focus:text-[11px] peer-focus:top-2 peer-focus:font-bold peer-focus:uppercase peer-focus:text-blue-500">Employee Email</label>
                          {errors.empEmail && <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-1 z-10">{errors.empEmail.message as string}</p>}
                      </div>
                    </div>

                    <div className="relative group mt-[1.5rem]">
                        <input
                          {...register("empTitle")}
                          className="peer w-full px-4 pt-6 pb-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-transparent focus:bg-white focus:outline-none focus:ring-4 focus:border-blue-500 focus:ring-blue-500/10 transition-all cursor-text"
                          placeholder="Job Title"
                        />
                        <label className="absolute left-4 top-2 text-[11px] font-bold uppercase tracking-widest text-slate-500 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-placeholder-shown:font-medium peer-placeholder-shown:normal-case peer-focus:text-[11px] peer-focus:top-2 peer-focus:font-bold peer-focus:uppercase peer-focus:text-blue-500">Job Title</label>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-[1.5rem]">
                       <div className="space-y-2">
                           <label className="text-xs font-bold text-slate-700 uppercase tracking-widest pl-1">Start Date</label>
                           <input type="date" {...register("empStartDate")} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 focus:bg-white focus:outline-none focus:ring-4 focus:border-blue-500 focus:ring-blue-500/10 transition-all" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-bold text-slate-700 uppercase tracking-widest pl-1">Pay Type</label>
                           <select {...register("empPayType")} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 focus:bg-white focus:outline-none focus:ring-4 focus:border-blue-500 focus:ring-blue-500/10 transition-all appearance-none">
                             <option value="Salary">Salary</option>
                             <option value="Hourly">Hourly</option>
                           </select>
                        </div>
                    </div>

                    <div className="relative group mt-[1.5rem]">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"><DollarSign size={18} /></div>
                        <input
                          {...register("empPayRate")}
                          className="peer w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:border-blue-500 focus:ring-blue-500/10 transition-all cursor-text"
                          placeholder={watch("empPayType") === "Salary" ? "Annual Salary (e.g. 75000)" : "Hourly Rate (e.g. 35.00)"}
                        />
                    </div>

                    <div className="text-center pt-8">
                       <button type="button" onClick={() => nextStep()} className="text-sm font-bold text-slate-400 hover:text-slate-700 underline underline-offset-4">Add more employees after setup</button>
                    </div>
                  </div>
                )}

                {step === 5 && (
                  <div className="text-center -mt-6">
                    <div className="w-24 h-24 bg-gradient-to-tr from-emerald-400 to-emerald-600 rounded-full mx-auto flex items-center justify-center text-white mb-8 shadow-xl shadow-emerald-500/30">
                      <Check size={48} strokeWidth={3} />
                    </div>
                    
                    <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-200 text-left">
                       <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Workspace Summary</h3>
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-slate-500 font-medium">Company Name</p>
                            <p className="font-bold text-slate-800">{watch("companyName") || "Not provided"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 font-medium">State / Setup</p>
                            <p className="font-bold text-slate-800">{watch("state") || "Not selected"} {watch("multiState") && "(Multi-state)"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 font-medium">Employees Added</p>
                            <p className="font-bold text-slate-800">{watch("empName") ? "1" : "0"} (will add more)</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 font-medium">First Payroll</p>
                            <p className="font-bold text-slate-800">{watch("firstPayrollDate") ? new Date(watch("firstPayrollDate") as string).toLocaleDateString() : "Pending setup"}</p>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-3">
                       <Link href="/dashboard" className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10 transition-all group">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center"><Zap size={20} /></div>
                             <div className="text-left">
                                <p className="font-bold text-slate-800">Go to Dashboard</p>
                                <p className="text-xs font-medium text-slate-500">Run your first payroll or setup benefits.</p>
                             </div>
                          </div>
                          <ArrowRight className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                       </Link>
                       <Link href="/dashboard/employees" className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10 transition-all group">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center"><Users size={20} /></div>
                             <div className="text-left">
                                <p className="font-bold text-slate-800">Add Employees</p>
                                <p className="text-xs font-medium text-slate-500">Input your team's details.</p>
                             </div>
                          </div>
                          <ArrowRight className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                       </Link>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
               {step < 5 && (
                  <button
                    type="submit"
                    className="w-full sm:w-auto ml-auto px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    {step === 4 ? "Complete Setup" : "Continue"} <ArrowRight size={18} />
                  </button>
               )}
            </div>
            
            {step === 1 && (
               <p className="text-center text-[10px] font-bold text-slate-400 mt-2 tracking-wide uppercase">Start for free — no credit card needed</p>
            )}
          </form>
        </div>
      </div>
    </main>
  );
}
