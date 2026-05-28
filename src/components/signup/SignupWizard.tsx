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
  Shield,
  Users,
  X,
} from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import type { Provider } from "@supabase/supabase-js";
import { z } from "zod";

import { createSupabaseBrowserClient } from "@/lib/supabase";

const DRAFT_KEY = "cw_signup_draft";
const STEP_COUNT = 5;

const WIZARD_STEPS = [
  { title: "Account", detail: "Create your login" },
  { title: "Company", detail: "Legal profile" },
  { title: "Payroll", detail: "Schedule basics" },
  { title: "Employees", detail: "First team member" },
  { title: "Ready", detail: "Launch CircleWorks" },
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
];

const COMPANY_SIZES = ["1-10", "11-50", "51-250", "251-1000", "1000+"];
const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Retail",
  "Professional Services",
  "Construction",
  "Other",
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
    employeeName: string;
    employeeEmail: string;
    title: string;
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
    employeeName: "",
    employeeEmail: "",
    title: "Founder",
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
    employeeName: z.string(),
    employeeEmail: z.string(),
    title: z.string(),
    startDate: z.string(),
    payType: z.enum(["salary", "hourly"]),
    payRate: z.string(),
    skip: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.skip) return;

    if (data.employeeName.trim().length < 2) {
      ctx.addIssue({
        code: "custom",
        path: ["employeeName"],
        message: data.isAdminEmployee ? "Confirm your name" : "Employee name is required",
      });
    }

    const emailResult = z.string().email().safeParse(data.employeeEmail.trim());
    if (!emailResult.success) {
      ctx.addIssue({
        code: "custom",
        path: ["employeeEmail"],
        message: "Enter a valid employee email",
      });
    }

    if (!data.title.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["title"],
        message: "Title is required",
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
  if (score === 4) return { score: 3, label: "Good", color: "bg-blue-500" };
  return { score: 4, label: "Strong", color: "bg-green-500" };
}

function addBusinessDays(date: Date, days: number) {
  const result = new Date(date);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    const day = result.getDay();
    if (day !== 0 && day !== 6) added += 1;
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
  return (
    <div className="mb-8 lg:mb-5">
      <div className="grid grid-cols-5 gap-2" aria-label="Signup progress">
        {WIZARD_STEPS.map((wizardStep, index) => {
          const complete = index < step;
          const active = index === step;
          return (
            <div key={wizardStep.title} className="min-w-0 text-center">
              <div
                className={`flex h-9 items-center justify-center rounded-lg text-sm font-bold transition-colors lg:h-7 lg:text-xs ${
                  complete
                    ? "bg-green-500 text-white"
                    : active
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-400"
                }`}
              >
                {complete ? <Check className="h-4 w-4" aria-hidden="true" /> : index + 1}
              </div>
              <p className="mt-2 hidden truncate text-center text-xs font-semibold text-slate-500 sm:block lg:mt-1">
                {wizardStep.title}
              </p>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-sm font-semibold text-slate-500 lg:mt-2 lg:text-xs">
        Step {step + 1} of {STEP_COUNT}: {WIZARD_STEPS[step].detail}
      </p>
    </div>
  );
}

function LeftStepRail({ step }: { step: number }) {
  return (
    <ol className="space-y-4">
      {WIZARD_STEPS.map((wizardStep, index) => {
        const complete = index < step;
        const active = index === step;
        return (
          <li key={wizardStep.title} className="flex items-center gap-3">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold ${
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
              <span className={`block text-sm font-bold ${active ? "text-white" : "text-white/70"}`}>
                {wizardStep.title}
              </span>
              <span className="block text-xs text-white/45">{wizardStep.detail}</span>
            </span>
          </li>
        );
      })}
    </ol>
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
          Sign up with Google
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
          Sign up with Microsoft
        </button>
      </div>

      <div className="flex items-center gap-3 text-sm font-semibold text-slate-400 lg:text-xs">
        <span className="h-px flex-1 bg-slate-200" />
        <span>or use email</span>
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
          />
          <span>
            I agree to{" "}
            <Link href="/terms" className="font-bold text-blue-700 hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="font-bold text-blue-700 hover:underline">
              Privacy Policy
            </Link>
          </span>
        </label>
        <InlineError id="terms-error" message={errors.agreedToTerms?.message} />
      </div>

      <button
        type="submit"
        className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-bold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 lg:h-10"
      >
        Continue
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </button>

      <p className="text-center text-sm font-semibold text-slate-500 lg:text-xs">
        Start for free — no credit card
      </p>
    </form>
  );
}

function Step2Form({
  data,
  onBack,
  onComplete,
}: {
  data: WizardData["step2"];
  onBack: () => void;
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

      <WizardActions onBack={onBack} />
    </form>
  );
}

function Step3Form({
  data,
  onBack,
  onComplete,
  onSkip,
}: {
  data: WizardData["step3"];
  onBack: () => void;
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
                <span className="block text-sm font-bold text-slate-900">{label}</span>
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
        <InlineError id="firstPayrollDate-error" message={errors.firstPayrollDate?.message} />
      </div>

      <WizardActions onBack={onBack} />

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
  onBack,
  onComplete,
  onSkip,
}: {
  adminEmail: string;
  adminName: string;
  data: WizardData["step4"];
  loading: boolean;
  onBack: () => void;
  onComplete: (data: WizardData["step4"]) => void;
  onSkip: () => void;
}) {
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
      employeeName: data.employeeName || adminName,
      employeeEmail: data.employeeEmail || adminEmail,
      skip: false,
    },
  });
  const isAdminEmployee = watch("isAdminEmployee");

  useEffect(() => {
    if (!isAdminEmployee) return;
    setValue("employeeName", adminName, { shouldDirty: true });
    setValue("employeeEmail", adminEmail, { shouldDirty: true });
  }, [adminEmail, adminName, isAdminEmployee, setValue]);

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
        <legend className={labelBase}>Who should we add first?</legend>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Myself", value: true },
            { label: "Employee", value: false },
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

      <div>
        <label htmlFor="employeeName" className={labelBase}>
          {isAdminEmployee ? "Your name" : "Employee name"}
        </label>
        <input
          id="employeeName"
          autoComplete="name"
          {...register("employeeName")}
          className={fieldClass(Boolean(errors.employeeName))}
          aria-invalid={Boolean(errors.employeeName)}
          aria-describedby={errors.employeeName ? "employeeName-error" : undefined}
        />
        <InlineError id="employeeName-error" message={errors.employeeName?.message} />
      </div>

      <div>
        <label htmlFor="employeeEmail" className={labelBase}>
          Email
        </label>
        <input
          id="employeeEmail"
          type="email"
          autoComplete="email"
          {...register("employeeEmail")}
          className={fieldClass(Boolean(errors.employeeEmail))}
          aria-invalid={Boolean(errors.employeeEmail)}
          aria-describedby={errors.employeeEmail ? "employeeEmail-error" : undefined}
        />
        <InlineError id="employeeEmail-error" message={errors.employeeEmail?.message} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="title" className={labelBase}>
            Title
          </label>
          <input
            id="title"
            {...register("title")}
            className={fieldClass(Boolean(errors.title))}
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? "title-error" : undefined}
          />
          <InlineError id="title-error" message={errors.title?.message} />
        </div>

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
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="payType" className={labelBase}>
            Pay type
          </label>
          <select id="payType" {...register("payType")} className={selectClass(false)}>
            <option value="salary">Salary</option>
            <option value="hourly">Hourly</option>
          </select>
        </div>

        <div>
          <label htmlFor="payRate" className={labelBase}>
            Pay rate
          </label>
          <input
            id="payRate"
            inputMode="decimal"
            placeholder="75000"
            {...register("payRate")}
            className={fieldClass(Boolean(errors.payRate))}
            aria-invalid={Boolean(errors.payRate)}
            aria-describedby={errors.payRate ? "payRate-error" : undefined}
          />
          <InlineError id="payRate-error" message={errors.payRate?.message} />
        </div>
      </div>

      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="flex h-12 items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-60 lg:h-10"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Back
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-bold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 lg:h-10"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Setting up...
            </>
          ) : (
            <>
              Complete setup
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

    const colors = ["#2563EB", "#10B981", "#06B6D4", "#F97316"];
    const end = Date.now() + 2200;
    const frame = () => {
      confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0 }, colors });
      confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
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
      title: "Run your first payroll",
      href: "/payroll/run",
      icon: CircleDollarSign,
      tone: "bg-blue-50 text-blue-700 border-blue-100",
    },
    {
      title: "Add employees",
      href: "/employees",
      icon: Users,
      tone: "bg-green-50 text-green-700 border-green-100",
    },
    {
      title: "Set up benefits",
      href: "/benefits/enrollment",
      icon: HeartPulse,
      tone: "bg-cyan-50 text-cyan-700 border-cyan-100",
    },
  ];

  return (
    <div className="space-y-7 lg:space-y-5">
      <header className="text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-green-100 text-green-700 lg:h-12 lg:w-12">
          <Check className="h-8 w-8 lg:h-6 lg:w-6" aria-hidden="true" />
        </span>
        <h2 className="mt-5 text-3xl font-bold text-[#0A1628] lg:mt-3 lg:text-2xl">You&apos;re ready!</h2>
        <p className="mt-2 text-base font-medium text-slate-500 lg:mt-1 lg:text-sm">
          Your CircleWorks workspace is ready to launch.
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

      <div className="grid gap-3 sm:grid-cols-3">
        {actionCards.map(({ title, href, icon: Icon, tone }) => (
          <Link
            key={href}
            href={href}
            className={`rounded-lg border p-4 transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${tone}`}
          >
            <Icon className="h-6 w-6" aria-hidden="true" />
            <span className="mt-3 block text-sm font-bold leading-tight text-slate-900">
              {title}
            </span>
          </Link>
        ))}
      </div>

      <Link
        href="/dashboard"
        className="flex h-12 w-full items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-bold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 lg:h-10"
      >
        Go to dashboard
      </Link>
    </div>
  );
}

function WizardActions({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex gap-3 pt-1">
      <button
        type="button"
        onClick={onBack}
        className="flex h-12 items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 lg:h-10"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Back
      </button>
      <button
        type="submit"
        className="flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-bold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 lg:h-10"
      >
        Continue
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
  const employeeName = splitName(data.step4.employeeName);

  return {
    step1: data.step1,
    step2: data.step2,
    step3: data.step3,
    step4: {
      isAdminEmployee: data.step4.isAdminEmployee,
      firstName: employeeName.firstName,
      lastName: employeeName.lastName,
      employeeEmail: data.step4.employeeEmail,
      title: data.step4.title,
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

function SignupWizardInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const signupMode = getSignupMode(searchParams.get("mode"));
  const isOAuthSignup = signupMode !== "email";
  const oauthEmail = searchParams.get("email") || "";
  const oauthName = searchParams.get("name") || "";

  const [step, setStep] = useState(isOAuthSignup ? 1 : 0);
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
          employeeName: oauthName,
          employeeEmail: oauthEmail,
        }
      : INITIAL_DATA.step4,
  }));
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const [draftCandidate, setDraftCandidate] = useState<{ step: number; data: Partial<WizardData> } | null>(null);
  const [apiError, setApiError] = useState("");
  const [completionLoading, setCompletionLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<SignupProvider | null>(null);

  const hasProgress = step > 0 && step < 4;

  const goTo = useCallback((nextStep: number, nextDirection = 1) => {
    setDirection(nextDirection);
    setStep(nextStep);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

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

      <aside className="hidden w-1/2 flex-col justify-between overflow-hidden bg-[#0A1628] px-10 py-10 text-white lg:flex xl:px-14">
        <div>
          <Link
            href="/"
            className="inline-flex rounded-lg text-white transition-colors hover:text-blue-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
          >
            <CircleWorksLogo />
            <span className="sr-only">Home</span>
          </Link>

          <div className="mt-10">
            <p className="text-sm font-bold uppercase text-blue-200">Signup progress</p>
            <div className="mt-5">
              <LeftStepRail step={step} />
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <p className="text-3xl font-bold leading-tight xl:text-4xl">Join 5,000+ US companies</p>
            <p className="mt-3 max-w-md text-sm leading-6 text-blue-100 xl:text-base xl:leading-7">
              &ldquo;CircleWorks helped us replace disconnected payroll, HR, and benefits
              workflows with one clean operating system.&rdquo;
            </p>
          </div>
          <div className="flex items-center gap-3 border-t border-white/15 pt-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500 text-sm font-bold">
              AM
            </span>
            <span>
              <span className="block text-sm font-bold">Avery Morgan</span>
              <span className="block text-sm text-blue-100">People Ops, Meridian Health</span>
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-2 rounded-lg border border-white/25 px-3 py-2 text-sm font-semibold">
              <Shield className="h-4 w-4 text-blue-200" aria-hidden="true" />
              SOC 2
            </span>
            <span className="inline-flex items-center gap-2 rounded-lg border border-white/25 px-3 py-2 text-sm font-semibold">
              <HeartPulse className="h-4 w-4 text-blue-200" aria-hidden="true" />
              HIPAA
            </span>
          </div>
        </div>
      </aside>

      <section className="relative flex min-h-screen min-w-0 w-full flex-col overflow-x-hidden bg-white lg:h-screen lg:w-1/2 lg:overflow-hidden">
        <div className="flex items-center justify-end px-5 py-5 sm:px-8">
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
                  onBack={() => goTo(0, -1)}
                  onComplete={(step2) => void advance({ step2 }, 2)}
                />
              )}

              {step === 2 && (
                <Step3Form
                  data={wizardData.step3}
                  onBack={() => goTo(1, -1)}
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
                  onBack={() => goTo(2, -1)}
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
