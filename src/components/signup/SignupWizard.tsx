"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import {
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Eye,
  EyeOff,
  HeartPulse,
  Loader2,
  Mail,
  Users,
  X,
} from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import type { Provider } from "@supabase/supabase-js";
import { z } from "zod";

import { createSupabaseBrowserClient } from "@/lib/supabase";

const DRAFT_KEY = "signup_in_progress";
const STEP_COUNT = 5;

const WIZARD_STEPS = [
  { title: "Account", detail: "Create your login" },
  { title: "Company", detail: "Legal profile" },
  { title: "Payroll", detail: "Schedule basics" },
  { title: "Employees", detail: "First team member" },
  { title: "Ready", detail: "Launch CircleWorks" },
];

const TESTIMONIALS = [
  {
    quote:
      "CircleWorks helped us replace disconnected payroll, HR, and benefits workflows with one clean operating system.",
    name: "Avery Morgan",
    role: "People Ops, Meridian Health",
    initials: "AM",
  },
  {
    quote:
      "We opened payroll in three states without adding another admin hire. The setup flow made every next step obvious.",
    name: "Priya Shah",
    role: "COO, Northstar Labs",
    initials: "PS",
  },
  {
    quote:
      "Our first run was approved in minutes, and the compliance defaults saved us from a dozen spreadsheets.",
    name: "Marcus Lee",
    role: "Founder, Bluebird Retail",
    initials: "ML",
  },
];

const US_STATES = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
  "District of Columbia",
];

const COMPANY_SIZES = ["1–10", "11–50", "51–250", "251–1,000", "1,000+"];
const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Retail",
  "Professional Services",
  "Construction",
  "Non-Profit",
  "Other",
];

const FEDERAL_HOLIDAYS = [
  "2026-01-01",
  "2026-01-19",
  "2026-02-16",
  "2026-05-25",
  "2026-06-19",
  "2026-07-03",
  "2026-09-07",
  "2026-10-12",
  "2026-11-11",
  "2026-11-26",
  "2026-12-25",
  "2027-01-01",
  "2027-01-18",
  "2027-02-15",
  "2027-05-31",
  "2027-06-18",
  "2027-07-05",
  "2027-09-06",
  "2027-10-11",
  "2027-11-11",
  "2027-11-25",
  "2027-12-24",
];

const PAY_SCHEDULES = [
  {
    value: "bi-weekly",
    label: "Bi-Weekly",
    detail: "Every 2 weeks",
    icon: CalendarDays,
  },
  {
    value: "semi-monthly",
    label: "Semi-Monthly",
    detail: "Twice monthly",
    icon: CircleDollarSign,
  },
  {
    value: "weekly",
    label: "Weekly",
    detail: "Every week",
    icon: Mail,
  },
  {
    value: "monthly",
    label: "Monthly",
    detail: "Once a month",
    icon: BriefcaseBusiness,
  },
] as const;

type PaySchedule = (typeof PAY_SCHEDULES)[number]["value"];
type SignupProvider = Extract<Provider, "google" | "azure">;
type SignupMode = "email" | "google" | "microsoft";

type WizardData = {
  step1: {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    agreedToTerms: boolean;
  };
  step2: {
    companyName: string;
    companySize: string;
    industry: string;
    primaryState: string;
    multipleStates: boolean;
  };
  step3: {
    ein: string;
    paySchedule: PaySchedule | "";
    firstPayrollDate: string;
    skipPayroll: boolean;
  };
  step4: {
    isAdminEmployee: boolean;
    firstName: string;
    lastName: string;
    workEmail: string;
    jobTitle: string;
    startDate: string;
    payType: "salary" | "hourly";
    payRate: string;
    skip: boolean;
  };
};

const INITIAL_DATA: WizardData = {
  step1: {
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreedToTerms: false,
  },
  step2: {
    companyName: "",
    companySize: "",
    industry: "",
    primaryState: "",
    multipleStates: false,
  },
  step3: {
    ein: "",
    paySchedule: "",
    firstPayrollDate: "",
    skipPayroll: false,
  },
  step4: {
    isAdminEmployee: true,
    firstName: "",
    lastName: "",
    workEmail: "",
    jobTitle: "Founder",
    startDate: "",
    payType: "salary",
    payRate: "",
    skip: false,
  },
};

const inputBase =
  "h-12 w-full rounded-lg border bg-white px-3 text-sm text-slate-950 outline-none transition-colors focus:border-blue-600 focus:ring-2 focus:ring-blue-100 lg:h-10";
const selectBase =
  "h-12 w-full rounded-lg border bg-white px-3 text-sm text-slate-950 outline-none transition-colors focus:border-blue-600 focus:ring-2 focus:ring-blue-100 lg:h-10";
const labelBase = "mb-1.5 block text-sm font-bold text-slate-800 lg:mb-1 lg:text-xs";
const errorBase = "mt-1.5 text-sm font-medium text-red-600 lg:mt-1 lg:text-xs";

const step1Schema = z
  .object({
    fullName: z.string().trim().min(2, "Full name is required"),
    email: z.string().trim().email("Enter a valid work email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
    agreedToTerms: z.boolean().refine((value) => value, {
      message: "You must agree to the Terms of Service and Privacy Policy",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

const step2Schema = z.object({
  companyName: z.string().trim().min(2, "Company legal name is required"),
  companySize: z.string().min(1, "Select a company size"),
  industry: z.string().min(1, "Select an industry"),
  primaryState: z.string().min(1, "Select a primary state"),
  multipleStates: z.boolean(),
});

const step3Schema = z
  .object({
    ein: z.string(),
    paySchedule: z.enum(["bi-weekly", "semi-monthly", "weekly", "monthly", ""]),
    firstPayrollDate: z.string(),
    skipPayroll: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.skipPayroll) return;

    if (!data.ein) {
      ctx.addIssue({
        code: "custom",
        path: ["ein"],
        message: "EIN is required",
      });
    } else if (!/^\d{2}-\d{7}$/.test(data.ein)) {
      ctx.addIssue({
        code: "custom",
        path: ["ein"],
        message: "EIN must be formatted as XX-XXXXXXX",
      });
    }

    if (!data.paySchedule) {
      ctx.addIssue({
        code: "custom",
        path: ["paySchedule"],
        message: "Select a pay schedule",
      });
    }

    if (!data.firstPayrollDate) {
      ctx.addIssue({
        code: "custom",
        path: ["firstPayrollDate"],
        message: "Choose a first payroll date",
      });
      return;
    }

    if (data.firstPayrollDate < getMinPayrollDate()) {
      ctx.addIssue({
        code: "custom",
        path: ["firstPayrollDate"],
        message: "First payroll date must be at least 4 business days from today",
      });
    }
  });

const step4Schema = z
  .object({
    isAdminEmployee: z.boolean(),
    firstName: z.string(),
    lastName: z.string(),
    workEmail: z.string(),
    jobTitle: z.string(),
    startDate: z.string(),
    payType: z.enum(["salary", "hourly"]),
    payRate: z.string(),
    skip: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.skip) return;

    if (data.firstName.trim().length < 1) {
      ctx.addIssue({
        code: "custom",
        path: ["firstName"],
        message: "First name is required",
      });
    }

    if (data.lastName.trim().length < 1) {
      ctx.addIssue({
        code: "custom",
        path: ["lastName"],
        message: "Last name is required",
      });
    }

    const emailResult = z.string().email().safeParse(data.workEmail.trim());
    if (!emailResult.success) {
      ctx.addIssue({
        code: "custom",
        path: ["workEmail"],
        message: "Enter a valid work email",
      });
    }

    if (!data.jobTitle.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["jobTitle"],
        message: "Job title is required",
      });
    }

    if (!data.startDate) {
      ctx.addIssue({
        code: "custom",
        path: ["startDate"],
        message: "Start date is required",
      });
    }

    const numericRate = Number(data.payRate.replace(/[$,\s]/g, ""));
    if (!Number.isFinite(numericRate) || numericRate <= 0) {
      ctx.addIssue({
        code: "custom",
        path: ["payRate"],
        message: "Enter a pay rate",
      });
    }
  });

type Step1Values = z.infer<typeof step1Schema>;
type Step2Values = z.infer<typeof step2Schema>;
type Step3Values = z.infer<typeof step3Schema>;
type Step4Values = z.infer<typeof step4Schema>;

function getPasswordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (!password) return { score: 0, label: "", color: "bg-slate-200" };
  if (score <= 2) return { score: 1, label: "Weak", color: "bg-red-500" };
  if (score === 3) return { score: 2, label: "Fair", color: "bg-amber-500" };
  if (score === 4) return { score: 3, label: "Strong", color: "bg-blue-500" };
  return { score: 4, label: "Very Strong", color: "bg-green-500" };
}

function isFederalHoliday(date: Date) {
  return FEDERAL_HOLIDAYS.includes(formatDateInput(date));
}

function addBusinessDays(date: Date, days: number) {
  const result = new Date(date);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    const day = result.getDay();
    if (day !== 0 && day !== 6 && !isFederalHoliday(result)) added += 1;
  }
  return result;
}

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getMinPayrollDate() {
  return formatDateInput(addBusinessDays(new Date(), 4));
}

function formatEin(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 9);
  return digits.length > 2 ? `${digits.slice(0, 2)}-${digits.slice(2)}` : digits;
}

function splitName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" "),
  };
}

function fieldClass(hasError: boolean) {
  return `${inputBase} ${hasError ? "border-red-400 bg-red-50" : "border-slate-300"}`;
}

function selectClass(hasError: boolean) {
  return `${selectBase} ${hasError ? "border-red-400 bg-red-50" : "border-slate-300"}`;
}

function GoogleLogo() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function MicrosoftLogo() {
  return (
    <span className="grid h-5 w-5 shrink-0 grid-cols-2 gap-0.5" aria-hidden="true">
      <span className="bg-[#F25022]" />
      <span className="bg-[#7FBA00]" />
      <span className="bg-[#00A4EF]" />
      <span className="bg-[#FFB900]" />
    </span>
  );
}

function CircleWorksLogo() {
  return (
    <span className="inline-flex items-center gap-3">
      <svg width="34" height="34" viewBox="0 0 36 36" fill="none" aria-hidden="true">
        <circle cx="18" cy="18" r="14" stroke="currentColor" strokeWidth="3" />
        <path
          d="M18 9.5a8.5 8.5 0 0 0 0 17"
          stroke="#3B82F6"
          strokeLinecap="round"
          strokeWidth="3"
        />
      </svg>
      <span className="text-2xl font-black">CircleWorks</span>
    </span>
  );
}

function InlineError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" aria-live="polite" className={errorBase}>
      {message}
    </p>
  );
}

function StepProgress({ step }: { step: number }) {
  const progress = ((step + 1) / STEP_COUNT) * 100;

  return (
    <div className="mb-8 lg:mb-5">
      <div className="h-1 overflow-hidden rounded-full bg-slate-100" aria-label="Signup progress">
        <div
          className="h-full rounded-full bg-blue-600 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-3 text-sm font-semibold text-slate-500 lg:mt-2 lg:text-xs">
        Step {step + 1} of {STEP_COUNT}
      </p>
    </div>
  );
}

function LeftStepRail({ step }: { step: number }) {
  return (
    <ol className="space-y-2.5">
      {WIZARD_STEPS.map((wizardStep, index) => {
        const complete = index < step;
        const active = index === step;
        return (
          <li key={wizardStep.title} className="flex items-center gap-3">
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold xl:h-8 xl:w-8 xl:text-sm ${
                complete
                  ? "bg-green-500 text-white"
                  : active
                    ? "bg-blue-500 text-white"
                    : "bg-white/10 text-white/55"
              }`}
            >
              {complete ? <Check className="h-4 w-4" aria-hidden="true" /> : index + 1}
            </span>
            <span>
              <span className={`block text-[13px] font-bold ${active ? "text-white" : "text-white/70"}`}>
                {wizardStep.title}
              </span>
              <span className="block text-[11px] leading-4 text-white/45">{wizardStep.detail}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function RotatingTestimonial() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % TESTIMONIALS.length);
    }, 6000);

    return () => window.clearInterval(timer);
  }, []);

  const testimonial = TESTIMONIALS[index];

  return (
    <div>
      <AnimatePresence mode="wait">
        <motion.div
          key={testimonial.name}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35 }}
          className="space-y-3.5"
        >
          <p className="max-w-md text-[13px] leading-5 text-blue-100">
            &ldquo;{testimonial.quote}&rdquo;
          </p>
          <div className="flex items-center gap-3 border-t border-white/15 pt-3.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500 text-sm font-bold">
              {testimonial.initials}
            </span>
            <span>
              <span className="block text-sm font-bold leading-5">{testimonial.name}</span>
              <span className="block text-xs leading-5 text-blue-100">{testimonial.role}</span>
            </span>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Step1Form({
  data,
  onComplete,
  onOAuth,
  oauthLoading,
}: {
  data: WizardData["step1"];
  onComplete: (data: WizardData["step1"]) => void;
  onOAuth: (provider: SignupProvider) => void;
  oauthLoading: SignupProvider | null;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const {
    register,
    handleSubmit,
    clearErrors,
    setError,
    setFocus,
    watch,
    formState: { errors },
  } = useForm<Step1Values>({
    resolver: zodResolver(step1Schema),
    defaultValues: data,
  });

  const password = watch("password");
  const agreedToTerms = watch("agreedToTerms");
  const strength = getPasswordStrength(password);

  const handleOAuthClick = (provider: SignupProvider) => {
    if (!agreedToTerms) {
      setError("agreedToTerms", {
        type: "manual",
        message: "You must agree to the Terms of Service and Privacy Policy",
      });
      setFocus("agreedToTerms");
      return;
    }

    onOAuth(provider);
  };

  return (
    <form onSubmit={handleSubmit(onComplete)} noValidate className="space-y-5 lg:space-y-3">
      <header>
        <h2 className="text-3xl font-bold text-[#0A1628] lg:text-2xl">Create your account</h2>
        <p className="mt-2 text-base font-medium text-slate-500 lg:mt-1 lg:text-sm">
          Start your CircleWorks workspace in a few minutes.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => handleOAuthClick("google")}
          disabled={oauthLoading !== null}
          className="flex h-12 items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold text-slate-800 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-60 lg:h-10"
        >
          {oauthLoading === "google" ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <GoogleLogo />
          )}
          Continue with Google
        </button>
        <button
          type="button"
          onClick={() => handleOAuthClick("azure")}
          disabled={oauthLoading !== null}
          className="flex h-12 items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold text-slate-800 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-60 lg:h-10"
        >
          {oauthLoading === "azure" ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <MicrosoftLogo />
          )}
          Continue with Microsoft
        </button>
      </div>

      <div className="flex items-center gap-3 text-sm font-semibold text-slate-400 lg:text-xs">
        <span className="h-px flex-1 bg-slate-200" />
        <span>— or sign up with email —</span>
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2 lg:gap-3">
        <div>
          <label htmlFor="fullName" className={labelBase}>
            Full name
          </label>
          <input
            id="fullName"
            autoFocus
            autoComplete="name"
            {...register("fullName")}
            className={fieldClass(Boolean(errors.fullName))}
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={errors.fullName ? "fullName-error" : undefined}
          />
          <InlineError id="fullName-error" message={errors.fullName?.message} />
        </div>

        <div>
          <label htmlFor="email" className={labelBase}>
            Work email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...register("email")}
            className={fieldClass(Boolean(errors.email))}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          <InlineError id="email-error" message={errors.email?.message} />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2 lg:gap-3">
        <div>
          <label htmlFor="password" className={labelBase}>
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              {...register("password")}
              className={`${fieldClass(Boolean(errors.password))} pr-11`}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "password-error" : "password-strength"}
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              aria-label={showPassword ? "Hide password" : "Show password"}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
          <div id="password-strength" className="mt-2 lg:mt-1">
            <div className="grid h-1.5 grid-cols-4 gap-1 lg:h-1">
              {[1, 2, 3, 4].map((bar) => (
                <span
                  key={bar}
                  className={`rounded-full ${
                    password && bar <= strength.score ? strength.color : "bg-slate-200"
                  }`}
                />
              ))}
            </div>
            {password && (
              <p className="mt-1 text-xs font-bold text-slate-500 lg:text-[11px]">
                Password strength: {strength.label}
              </p>
            )}
          </div>
          <InlineError id="password-error" message={errors.password?.message} />
        </div>

        <div>
          <label htmlFor="confirmPassword" className={labelBase}>
            Confirm password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              {...register("confirmPassword")}
              className={`${fieldClass(Boolean(errors.confirmPassword))} pr-11`}
              aria-invalid={Boolean(errors.confirmPassword)}
              aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((visible) => !visible)}
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              aria-label={showConfirm ? "Hide confirmation password" : "Show confirmation password"}
              title={showConfirm ? "Hide confirmation password" : "Show confirmation password"}
            >
              {showConfirm ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
          <InlineError id="confirmPassword-error" message={errors.confirmPassword?.message} />
        </div>
      </div>

      <div>
        <label className="flex items-start gap-3 text-sm font-medium text-slate-700">
          <input
            id="agreedToTerms"
            type="checkbox"
            {...register("agreedToTerms", {
              onChange: () => clearErrors("agreedToTerms"),
            })}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
            aria-invalid={Boolean(errors.agreedToTerms)}
            aria-describedby={errors.agreedToTerms ? "terms-error" : undefined}
          />
          <span>
            I agree to{" "}
            <Link href="/terms" target="_blank" rel="noopener noreferrer" className="font-bold text-blue-700 hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" target="_blank" rel="noopener noreferrer" className="font-bold text-blue-700 hover:underline">
              Privacy Policy
            </Link>
          </span>
        </label>
        <InlineError id="terms-error" message={errors.agreedToTerms?.message} />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="flex h-12 min-w-32 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-bold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 lg:h-10"
        >
          Next
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <p className="text-center text-sm italic text-slate-500 lg:text-xs">
        Start for free — no credit card required
      </p>
    </form>
  );
}

function Step2Form({
  data,
  onComplete,
}: {
  data: WizardData["step2"];
  onComplete: (data: WizardData["step2"]) => void;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Step2Values>({
    resolver: zodResolver(step2Schema),
    defaultValues: data,
  });
  const multipleStates = watch("multipleStates");

  return (
    <form onSubmit={handleSubmit(onComplete)} noValidate className="space-y-5 lg:space-y-4">
      <header>
        <h2 className="text-3xl font-bold text-[#0A1628] lg:text-2xl">
          Tell us about your company
        </h2>
        <p className="mt-2 text-base font-medium text-slate-500 lg:mt-1 lg:text-sm">
          We use this to tune payroll, taxes, and compliance defaults.
        </p>
      </header>

      <div>
        <label htmlFor="companyName" className={labelBase}>
          Company legal name
        </label>
        <input
          id="companyName"
          {...register("companyName")}
          className={fieldClass(Boolean(errors.companyName))}
          aria-invalid={Boolean(errors.companyName)}
          aria-describedby={errors.companyName ? "companyName-error" : undefined}
        />
        <InlineError id="companyName-error" message={errors.companyName?.message} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="companySize" className={labelBase}>
            Company size
          </label>
          <select
            id="companySize"
            {...register("companySize")}
            className={selectClass(Boolean(errors.companySize))}
            aria-invalid={Boolean(errors.companySize)}
            aria-describedby={errors.companySize ? "companySize-error" : undefined}
          >
            <option value="">Select size</option>
            {COMPANY_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <InlineError id="companySize-error" message={errors.companySize?.message} />
        </div>

        <div>
          <label htmlFor="industry" className={labelBase}>
            Industry
          </label>
          <select
            id="industry"
            {...register("industry")}
            className={selectClass(Boolean(errors.industry))}
            aria-invalid={Boolean(errors.industry)}
            aria-describedby={errors.industry ? "industry-error" : undefined}
          >
            <option value="">Select industry</option>
            {INDUSTRIES.map((industry) => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </select>
          <InlineError id="industry-error" message={errors.industry?.message} />
        </div>
      </div>

      <div>
        <label htmlFor="primaryState" className={labelBase}>
          Primary state
        </label>
        <select
          id="primaryState"
          {...register("primaryState")}
          className={selectClass(Boolean(errors.primaryState))}
          aria-invalid={Boolean(errors.primaryState)}
          aria-describedby={errors.primaryState ? "primaryState-error" : undefined}
        >
          <option value="">Select state</option>
          {US_STATES.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
        <InlineError id="primaryState-error" message={errors.primaryState?.message} />
      </div>

      <fieldset>
        <legend className={labelBase}>Do you operate in multiple states?</legend>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Yes", value: true },
            { label: "No", value: false },
          ].map((option) => {
            const active = multipleStates === option.value;
            return (
              <button
                key={option.label}
                type="button"
                onClick={() => setValue("multipleStates", option.value, { shouldDirty: true })}
                className={`h-12 rounded-lg border text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 lg:h-10 ${
                  active
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <WizardActions />
    </form>
  );
}

function Step3Form({
  data,
  onComplete,
  onSkip,
}: {
  data: WizardData["step3"];
  onComplete: (data: WizardData["step3"]) => void;
  onSkip: () => void;
}) {
  const minPayrollDate = useMemo(() => getMinPayrollDate(), []);
  const {
    control,
    handleSubmit,
    register,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Step3Values>({
    resolver: zodResolver(step3Schema),
    defaultValues: { ...data, skipPayroll: false },
  });
  const paySchedule = watch("paySchedule");

  return (
    <form onSubmit={handleSubmit((values) => onComplete(values as WizardData["step3"]))} noValidate className="space-y-5 lg:space-y-4">
      <header>
        <h2 className="text-3xl font-bold text-[#0A1628] lg:text-2xl">Set up payroll basics</h2>
        <p className="mt-2 text-base font-medium text-slate-500 lg:mt-1 lg:text-sm">
          Add the minimum details needed to prepare your first run.
        </p>
      </header>

      <div>
        <label htmlFor="ein" className={labelBase}>
          EIN
        </label>
        <Controller
          name="ein"
          control={control}
          render={({ field }) => (
            <input
              id="ein"
              inputMode="numeric"
              maxLength={10}
              placeholder="XX-XXXXXXX"
              value={field.value}
              onBlur={field.onBlur}
              ref={field.ref}
              onChange={(event) => field.onChange(formatEin(event.target.value))}
              className={`${fieldClass(Boolean(errors.ein))} font-mono`}
              aria-invalid={Boolean(errors.ein)}
              aria-describedby={errors.ein ? "ein-error" : undefined}
            />
          )}
        />
        <InlineError id="ein-error" message={errors.ein?.message} />
      </div>

      <fieldset>
        <legend className={labelBase}>Pay schedule</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {PAY_SCHEDULES.map(({ value, label, detail, icon: Icon }) => {
            const active = paySchedule === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() =>
                  setValue("paySchedule", value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                className={`min-h-24 rounded-lg border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 lg:min-h-20 lg:p-3 ${
                  active
                    ? "border-blue-600 bg-blue-50"
                    : "border-slate-300 bg-white hover:bg-slate-50"
                }`}
              >
                <Icon
                  className={`mb-3 h-5 w-5 lg:mb-2 lg:h-4 lg:w-4 ${active ? "text-blue-700" : "text-slate-500"}`}
                  aria-hidden="true"
                />
                <span className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  {label}
                  {value === "bi-weekly" && (
                    <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                      Most popular
                    </span>
                  )}
                </span>
                <span className="mt-1 block text-sm text-slate-500 lg:text-xs">{detail}</span>
              </button>
            );
          })}
        </div>
        <InlineError id="paySchedule-error" message={errors.paySchedule?.message} />
      </fieldset>

      <div>
        <label htmlFor="firstPayrollDate" className={labelBase}>
          First payroll date
        </label>
        <input
          id="firstPayrollDate"
          type="date"
          min={minPayrollDate}
          {...register("firstPayrollDate")}
          className={fieldClass(Boolean(errors.firstPayrollDate))}
          aria-invalid={Boolean(errors.firstPayrollDate)}
          aria-describedby={errors.firstPayrollDate ? "firstPayrollDate-error" : undefined}
        />
        <p className="mt-1.5 text-xs font-medium text-slate-500">
          We need 4 business days to process your first run.
        </p>
        <InlineError id="firstPayrollDate-error" message={errors.firstPayrollDate?.message} />
      </div>

      <WizardActions />

      <button
        type="button"
        onClick={onSkip}
        className="w-full rounded-lg py-2 text-sm font-bold text-slate-500 transition-colors hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
      >
        I&apos;ll set this up later
      </button>
    </form>
  );
}

function Step4Form({
  adminEmail,
  adminName,
  data,
  loading,
  onComplete,
  onSkip,
}: {
  adminEmail: string;
  adminName: string;
  data: WizardData["step4"];
  loading: boolean;
  onComplete: (data: WizardData["step4"]) => void;
  onSkip: () => void;
}) {
  const adminNameParts = useMemo(() => splitName(adminName), [adminName]);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Step4Values>({
    resolver: zodResolver(step4Schema),
    defaultValues: {
      ...data,
      firstName: data.firstName || adminNameParts.firstName,
      lastName: data.lastName || adminNameParts.lastName,
      workEmail: data.workEmail || adminEmail,
      skip: false,
    },
  });
  const isAdminEmployee = watch("isAdminEmployee");
  const payType = watch("payType");
  const payRate = watch("payRate");
  const numericPayRate = Number(payRate.replace(/[$,\s]/g, ""));
  const convertedPay = Number.isFinite(numericPayRate) && numericPayRate > 0
    ? payType === "hourly"
      ? `${new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        }).format(numericPayRate * 2080)} per year`
      : `${new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 2,
        }).format(numericPayRate / 2080)} per hour`
    : "";

  useEffect(() => {
    if (!isAdminEmployee) return;
    setValue("firstName", adminNameParts.firstName, { shouldDirty: true });
    setValue("lastName", adminNameParts.lastName, { shouldDirty: true });
    setValue("workEmail", adminEmail, { shouldDirty: true });
  }, [adminEmail, adminNameParts.firstName, adminNameParts.lastName, isAdminEmployee, setValue]);

  return (
    <form onSubmit={handleSubmit((values) => onComplete(values as WizardData["step4"]))} noValidate className="space-y-5 lg:space-y-4">
      <header>
        <h2 className="text-3xl font-bold text-[#0A1628] lg:text-2xl">
          Add your first employee (or yourself)
        </h2>
        <p className="mt-2 text-base font-medium text-slate-500 lg:mt-1 lg:text-sm">
          Add yourself or one teammate so employee setup is ready.
        </p>
      </header>

      <fieldset>
        <legend className={labelBase}>Is one of the employees you?</legend>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Yes", value: true },
            { label: "No", value: false },
          ].map((option) => {
            const active = isAdminEmployee === option.value;
            return (
              <button
                key={option.label}
                type="button"
                onClick={() =>
                  setValue("isAdminEmployee", option.value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                className={`h-12 rounded-lg border text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 lg:h-10 ${
                  active
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className={labelBase}>
            First name
          </label>
          <input
            id="firstName"
            autoComplete="given-name"
            {...register("firstName")}
            className={fieldClass(Boolean(errors.firstName))}
            aria-invalid={Boolean(errors.firstName)}
            aria-describedby={errors.firstName ? "firstName-error" : undefined}
          />
          <InlineError id="firstName-error" message={errors.firstName?.message} />
        </div>

        <div>
          <label htmlFor="lastName" className={labelBase}>
            Last name
          </label>
          <input
            id="lastName"
            autoComplete="family-name"
            {...register("lastName")}
            className={fieldClass(Boolean(errors.lastName))}
            aria-invalid={Boolean(errors.lastName)}
            aria-describedby={errors.lastName ? "lastName-error" : undefined}
          />
          <InlineError id="lastName-error" message={errors.lastName?.message} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="workEmail" className={labelBase}>
            Work email
          </label>
          <input
            id="workEmail"
            type="email"
            autoComplete="email"
            {...register("workEmail")}
            className={fieldClass(Boolean(errors.workEmail))}
            aria-invalid={Boolean(errors.workEmail)}
            aria-describedby={errors.workEmail ? "workEmail-error" : undefined}
          />
          <InlineError id="workEmail-error" message={errors.workEmail?.message} />
        </div>

        <div>
          <label htmlFor="jobTitle" className={labelBase}>
            Job title
          </label>
          <input
            id="jobTitle"
            {...register("jobTitle")}
            className={fieldClass(Boolean(errors.jobTitle))}
            aria-invalid={Boolean(errors.jobTitle)}
            aria-describedby={errors.jobTitle ? "jobTitle-error" : undefined}
          />
          <InlineError id="jobTitle-error" message={errors.jobTitle?.message} />
        </div>
      </div>

      <fieldset>
        <legend className={labelBase}>Pay type</legend>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Salary", value: "salary" as const },
            { label: "Hourly", value: "hourly" as const },
          ].map((option) => {
            const active = payType === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  setValue("payType", option.value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                className={`h-12 rounded-lg border text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 lg:h-10 ${
                  active
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="startDate" className={labelBase}>
            Start date
          </label>
          <input
            id="startDate"
            type="date"
            {...register("startDate")}
            className={fieldClass(Boolean(errors.startDate))}
            aria-invalid={Boolean(errors.startDate)}
            aria-describedby={errors.startDate ? "startDate-error" : undefined}
          />
          <InlineError id="startDate-error" message={errors.startDate?.message} />
        </div>

        <div>
          <label htmlFor="payRate" className={labelBase}>
            Pay rate
          </label>
          <div className="relative">
            <input
              id="payRate"
              inputMode="decimal"
              placeholder={payType === "hourly" ? "35" : "75000"}
              {...register("payRate")}
              className={`${fieldClass(Boolean(errors.payRate))} pr-24`}
              aria-invalid={Boolean(errors.payRate)}
              aria-describedby={errors.payRate ? "payRate-error" : "payRate-conversion"}
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
              {payType === "hourly" ? "per hour" : "per year"}
            </span>
          </div>
          {convertedPay && (
            <p id="payRate-conversion" className="mt-1.5 text-xs font-medium text-slate-500">
              Equivalent to {convertedPay}
            </p>
          )}
          <InlineError id="payRate-error" message={errors.payRate?.message} />
        </div>
      </div>

      <div className="flex justify-end pt-1">
        <button
          type="submit"
          disabled={loading}
          className="flex h-12 min-w-40 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-bold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 lg:h-10"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Setting up...
            </>
          ) : (
            <>
              Submit
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </>
          )}
        </button>
      </div>

      <button
        type="button"
        onClick={onSkip}
        disabled={loading}
        className="w-full rounded-lg py-2 text-sm font-bold text-slate-500 transition-colors hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Add more employees after setup
      </button>
    </form>
  );
}

function Step5Success({ data }: { data: WizardData }) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
  }, []);

  const payrollDate = data.step3.skipPayroll
    ? "Not set"
    : data.step3.firstPayrollDate
      ? new Date(`${data.step3.firstPayrollDate}T00:00:00`).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "Not set";
  const employees = data.step4.skip ? "1 admin" : data.step4.isAdminEmployee ? "1 employee" : "2 employees";

  const actionCards = [
    {
      title: "Run Your First Payroll",
      description: "Review your pay schedule and launch your first run.",
      href: "/app/payroll/run",
      icon: CircleDollarSign,
      tone: "bg-blue-50 text-blue-700 border-blue-100",
    },
    {
      title: "Add Employees",
      description: "Invite your team and finish employee records.",
      href: "/app/employees/new",
      icon: Users,
      tone: "bg-green-50 text-green-700 border-green-100",
    },
    {
      title: "Set Up Benefits",
      description: "Configure medical, dental, vision, and 401k options.",
      href: "/app/benefits",
      icon: HeartPulse,
      tone: "bg-cyan-50 text-cyan-700 border-cyan-100",
    },
  ];

  return (
    <div className="space-y-7 lg:space-y-5">
      <header className="text-center">
        <h2 className="text-[40px] font-bold leading-tight text-[#0A1628]">
          🎉 You&apos;re all set!
        </h2>
        <p className="mt-3 text-base font-medium text-slate-500 lg:mt-2 lg:text-sm">
          {data.step2.companyName || "Your company"} is on the Starter plan. Estimated first payroll date: {payrollDate}.
        </p>
      </header>

      <dl className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
        {[
          ["Company", data.step2.companyName || "Not set"],
          ["Employees", employees],
          ["Plan", "Starter"],
          ["Next payroll", payrollDate],
        ].map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs font-bold uppercase text-slate-500">{label}</dt>
            <dd className="mt-1 text-sm font-bold text-slate-900">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-3 lg:grid-cols-3">
        {actionCards.map(({ title, description, href, icon: Icon, tone }) => (
          <Link
            key={href}
            href={href}
            className={`group rounded-lg border p-4 transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${tone}`}
          >
            <Icon className="h-6 w-6" aria-hidden="true" />
            <span className="mt-3 block text-sm font-bold leading-tight text-slate-900">
              {title}
            </span>
            <span className="mt-2 block text-xs leading-5 text-slate-600">
              {description}
            </span>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-blue-700">
              Continue
              <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </span>
          </Link>
        ))}
      </div>

      <Link
        href="/app"
        className="flex h-12 w-full items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-bold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 lg:h-10"
      >
        Go to dashboard
      </Link>
    </div>
  );
}

function WizardActions({ label = "Next" }: { label?: string }) {
  return (
    <div className="flex justify-end pt-1">
      <button
        type="submit"
        className="flex h-12 min-w-32 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-bold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 lg:h-10"
      >
        {label}
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

const stepVariants = {
  initial: (direction: number) => ({ opacity: 0, x: direction * 24 }),
  animate: { opacity: 1, x: 0 },
  exit: (direction: number) => ({ opacity: 0, x: direction * -24 }),
};

function sanitizeDraft(data: WizardData) {
  return {
    ...data,
    step1: {
      ...data.step1,
      password: "",
      confirmPassword: "",
    },
  };
}

function toCompletePayload(data: WizardData, signupMode: SignupMode) {
  return {
    step1: data.step1,
    step2: data.step2,
    step3: data.step3,
    step4: {
      isAdminEmployee: data.step4.isAdminEmployee,
      firstName: data.step4.firstName,
      lastName: data.step4.lastName,
      employeeEmail: data.step4.workEmail,
      title: data.step4.jobTitle,
      startDate: data.step4.startDate,
      payType: data.step4.payType,
      payRate: data.step4.payRate,
      skip: data.step4.skip,
    },
    googleAuth: signupMode !== "email",
  };
}

function isDraftShape(value: unknown): value is { step: number; data: Partial<WizardData> } {
  if (!value || typeof value !== "object") return false;
  const draft = value as { step?: unknown; data?: unknown };
  return typeof draft.step === "number" && !!draft.data && typeof draft.data === "object";
}

function getSignupMode(rawMode: string | null): SignupMode {
  if (rawMode === "google") return "google";
  if (rawMode === "microsoft") return "microsoft";
  return "email";
}

function getStepFromSearch(rawStep: string | null) {
  if (!rawStep) return null;
  const parsed = Number(rawStep);
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= STEP_COUNT
    ? parsed - 1
    : null;
}

function SignupWizardInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const signupMode = getSignupMode(searchParams.get("mode"));
  const isOAuthSignup = signupMode !== "email";
  const oauthEmail = searchParams.get("email") || "";
  const oauthName = searchParams.get("name") || "";
  const requestedStep = getStepFromSearch(searchParams.get("step"));

  const [step, setStep] = useState(requestedStep ?? (isOAuthSignup ? 1 : 0));
  const [direction, setDirection] = useState(1);
  const [wizardData, setWizardData] = useState<WizardData>(() => ({
    ...INITIAL_DATA,
    step1: isOAuthSignup
      ? {
          fullName: oauthName,
          email: oauthEmail,
          password: "__oauth_password__",
          confirmPassword: "__oauth_password__",
          agreedToTerms: true,
        }
      : INITIAL_DATA.step1,
    step4: isOAuthSignup
      ? {
          ...INITIAL_DATA.step4,
          firstName: splitName(oauthName).firstName,
          lastName: splitName(oauthName).lastName,
          workEmail: oauthEmail,
        }
      : INITIAL_DATA.step4,
  }));
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const [draftCandidate, setDraftCandidate] = useState<{ step: number; data: Partial<WizardData> } | null>(null);
  const [apiError, setApiError] = useState("");
  const [completionLoading, setCompletionLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<SignupProvider | null>(null);

  const hasProgress = step > 0 && step < 4;

  const updateStepUrl = useCallback(
    (nextStep: number) => {
      const params = new URLSearchParams(window.location.search);
      params.set("step", String(nextStep + 1));
      router.replace(`/signup?${params.toString()}`, { scroll: false });
    },
    [router]
  );

  const goTo = useCallback((nextStep: number, nextDirection = 1) => {
    setDirection(nextDirection);
    setStep(nextStep);
    updateStepUrl(nextStep);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "auto" });
  }, [updateStepUrl]);

  useEffect(() => {
    if (!searchParams.get("step")) {
      updateStepUrl(step);
    }
  }, [searchParams, step, updateStepUrl]);

  const saveDraftLocal = useCallback((nextStep: number, nextData: WizardData) => {
    try {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({
          step: nextStep,
          data: sanitizeDraft(nextData),
          savedAt: new Date().toISOString(),
        })
      );
    } catch {
      // Local draft persistence is best effort.
    }
  }, []);

  const saveDraftBackend = useCallback(async (nextStep: number, nextData: WizardData) => {
    try {
      await fetch("/api/auth/signup/partial", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: nextData.step1.email,
          step: nextStep,
          data: sanitizeDraft(nextData),
        }),
      });
    } catch {
      // The user can still proceed if autosave is unavailable.
    }
  }, []);

  const clearDrafts = useCallback(async () => {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {}

    try {
      await fetch("/api/auth/signup/partial", {
        method: "DELETE",
        credentials: "include",
      });
    } catch {}
  }, []);

  const advance = useCallback(
    async (patch: Partial<WizardData>, nextStep: number) => {
      const nextData = { ...wizardData, ...patch };
      setWizardData(nextData);
      saveDraftLocal(nextStep, nextData);
      await saveDraftBackend(nextStep, nextData);
      goTo(nextStep, 1);
    },
    [goTo, saveDraftBackend, saveDraftLocal, wizardData]
  );

  useEffect(() => {
    if (isOAuthSignup) return;

    async function loadDraft() {
      try {
        const raw = localStorage.getItem(DRAFT_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as unknown;
          if (isDraftShape(parsed) && parsed.step > 0) {
            setDraftCandidate(parsed);
            setShowDraftBanner(true);
            return;
          }
        }
      } catch {}

      try {
        const response = await fetch("/api/auth/signup/partial", {
          credentials: "include",
        });
        if (!response.ok) return;
        const body = (await response.json()) as unknown;
        const payload = body as { draft?: unknown };
        if (isDraftShape(payload.draft) && payload.draft.step > 0) {
          setDraftCandidate(payload.draft);
          setShowDraftBanner(true);
        }
      } catch {}
    }

    void loadDraft();
  }, [isOAuthSignup]);

  useEffect(() => {
    if (!hasProgress) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasProgress]);

  const restoreDraft = () => {
    if (!draftCandidate) return;
    const restored = {
      ...INITIAL_DATA,
      ...draftCandidate.data,
      step1: {
        ...INITIAL_DATA.step1,
        ...(draftCandidate.data.step1 ?? {}),
      },
      step2: {
        ...INITIAL_DATA.step2,
        ...(draftCandidate.data.step2 ?? {}),
      },
      step3: {
        ...INITIAL_DATA.step3,
        ...(draftCandidate.data.step3 ?? {}),
      },
      step4: {
        ...INITIAL_DATA.step4,
        ...(draftCandidate.data.step4 ?? {}),
      },
    };

    setWizardData(restored);
    setShowDraftBanner(false);
    setDraftCandidate(null);
    goTo(restored.step1.password ? draftCandidate.step : 0, 1);
  };

  const discardDraft = async () => {
    setShowDraftBanner(false);
    setDraftCandidate(null);
    await clearDrafts();
  };

  const handleOAuthSignup = async (provider: SignupProvider) => {
    setOauthLoading(provider);
    setApiError("");

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setApiError(error.message || "SSO signup failed. Please try again.");
      setOauthLoading(null);
    }
  };

  const completeSignup = async (nextData: WizardData) => {
    setCompletionLoading(true);
    setApiError("");

    try {
      await saveDraftBackend(4, nextData);

      const response = await fetch("/api/auth/signup/complete", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toCompletePayload(nextData, signupMode)),
      });

      if (!response.ok) {
        let message = "Something went wrong. Please try again.";
        try {
          const body = (await response.json()) as { error?: string };
          message = body.error || message;
        } catch {}
        setApiError(message);
        return;
      }

      setWizardData(nextData);
      await clearDrafts();
      goTo(4, 1);
      router.refresh();
    } catch {
      setApiError("Network error. Please check your connection and try again.");
    } finally {
      setCompletionLoading(false);
    }
  };

  const handleStep4Complete = (step4: WizardData["step4"]) => {
    const nextData = { ...wizardData, step4 };
    void completeSignup(nextData);
  };

  const handleStep4Skip = () => {
    const nextData = {
      ...wizardData,
      step4: {
        ...INITIAL_DATA.step4,
        skip: true,
      },
    };
    void completeSignup(nextData);
  };

  return (
    <main className="flex min-h-screen bg-white text-slate-950 selection:bg-blue-200 lg:h-screen lg:overflow-hidden">
      <AnimatePresence>
        {showDraftBanner && (
          <motion.div
            initial={{ y: -56 }}
            animate={{ y: 0 }}
            exit={{ y: -56 }}
            className="fixed inset-x-0 top-0 z-50 flex min-h-14 items-center justify-between gap-4 bg-blue-600 px-4 py-3 text-white shadow-lg"
          >
            <p className="text-sm font-bold">You have an unfinished signup — continue?</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={restoreDraft}
                className="rounded-lg bg-white px-3 py-1.5 text-sm font-bold text-blue-700"
              >
                Continue
              </button>
              <button
                type="button"
                onClick={() => void discardDraft()}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/80 hover:bg-white/10 hover:text-white"
                aria-label="Dismiss unfinished signup"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <aside className="hidden h-screen w-1/2 flex-col overflow-hidden bg-[#0A1628] px-8 py-7 text-white lg:flex xl:px-12">
        <div>
          <Link
            href="/"
            className="inline-flex rounded-lg text-white transition-colors hover:text-blue-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
          >
            <CircleWorksLogo />
            <span className="sr-only">Home</span>
          </Link>

          <h1 className="mt-8 max-w-md text-[38px] font-bold leading-[1.1] xl:text-[42px]">
            Join 5,000+ US companies
          </h1>
        </div>

        <div className="mt-8 space-y-5">
          <div>
            <p className="text-sm font-bold uppercase text-blue-200">Signup progress</p>
            <div className="mt-3">
              <LeftStepRail step={step} />
            </div>
          </div>

          <RotatingTestimonial />
        </div>
      </aside>

      <section className="relative flex min-h-screen min-w-0 w-full flex-col overflow-x-hidden bg-white lg:h-screen lg:w-1/2 lg:overflow-hidden">
        <div className="sticky top-0 z-20 flex items-center justify-between bg-white px-5 py-5 sm:px-8">
          {step > 0 && step < 4 ? (
            <button
              type="button"
              onClick={() => goTo(step - 1, -1)}
              className="inline-flex items-center gap-2 rounded-lg px-1 py-2 text-sm font-bold text-slate-600 transition-colors hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </button>
          ) : (
            <span aria-hidden="true" />
          )}
          <Link
            href="/login"
            className="rounded-lg bg-[#0A1628] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            Sign in
          </Link>
        </div>

        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-5 pb-16 sm:px-8 lg:h-full lg:max-w-2xl lg:justify-start lg:px-10 lg:py-8 xl:max-w-3xl xl:px-12">
          <StepProgress step={step} />

          {apiError && (
            <div
              role="alert"
              aria-live="assertive"
              className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700"
            >
              {apiError}
            </div>
          )}

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.18 }}
            >
              {step === 0 && (
                <Step1Form
                  data={wizardData.step1}
                  onComplete={(step1) => void advance({ step1 }, 1)}
                  onOAuth={handleOAuthSignup}
                  oauthLoading={oauthLoading}
                />
              )}

              {step === 1 && (
                <Step2Form
                  data={wizardData.step2}
                  onComplete={(step2) => void advance({ step2 }, 2)}
                />
              )}

              {step === 2 && (
                <Step3Form
                  data={wizardData.step3}
                  onComplete={(step3) => void advance({ step3 }, 3)}
                  onSkip={() =>
                    void advance(
                      {
                        step3: {
                          ein: "",
                          paySchedule: "",
                          firstPayrollDate: "",
                          skipPayroll: true,
                        },
                      },
                      3
                    )
                  }
                />
              )}

              {step === 3 && (
                <Step4Form
                  adminEmail={wizardData.step1.email}
                  adminName={wizardData.step1.fullName}
                  data={wizardData.step4}
                  loading={completionLoading}
                  onComplete={handleStep4Complete}
                  onSkip={handleStep4Skip}
                />
              )}

              {step === 4 && <Step5Success data={wizardData} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </main>
  );
}

export default function SignupWizard() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" aria-label="Loading signup" />
        </div>
      }
    >
      <SignupWizardInner />
    </Suspense>
  );
}
