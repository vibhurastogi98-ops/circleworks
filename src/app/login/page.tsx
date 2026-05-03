"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ShieldCheck, Lock, Eye, EyeOff, AlertCircle, X, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const QUOTES = [
  {
    quote: "CircleWorks completely transformed our HR operations. It's the most intuitive platform we've ever used.",
    author: "Sarah J.",
    company: "TechFlow",
    avatar: "SJ"
  },
  {
    quote: "The automated payroll features save us over 20 hours a week. I can't imagine going back to our old system.",
    author: "Michael R.",
    company: "Acme Corp",
    avatar: "MR"
  },
  {
    quote: "Onboarding contractors globally used to be a nightmare. Now it takes just a few clicks.",
    author: "Elena T.",
    company: "GlobalNet",
    avatar: "ET"
  }
];

const loginSchema = z.object({
  email: z.string().email("Please enter a valid work email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

type ErrorType = "none" | "invalid_credentials" | "locked" | "server";

export default function LoginPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn, refreshUser } = useAuth();

  const getNextPath = () => {
    if (typeof window === "undefined") return "/dashboard";
    const params = new URLSearchParams(window.location.search);
    const nextPath = params.get("next") || "/dashboard";
    return nextPath.startsWith("/") ? nextPath : "/dashboard";
  };

  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn) {
      router.replace(getNextPath());
    }
  }, [isLoaded, isSignedIn, router]);

  const [activeQuote, setActiveQuote] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorType, setErrorType] = useState<ErrorType>("none");
  const [errorMessage, setErrorMessage] = useState("");

  // MFA placeholder state (not implemented without Clerk — kept for UI consistency)
  const [mfaNeeded] = useState(false);
  const [mfaCode] = useState<string[]>(Array(6).fill(""));
  const mfaRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [countdown] = useState(0);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveQuote((prev) => (prev + 1) % QUOTES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const onLoginSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    setErrorType("none");
    setErrorMessage("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          rememberMe: data.rememberMe,
        }),
      });

      if (res.ok) {
        await refreshUser();
        router.push(getNextPath());
        return;
      }

      const body = await res.json();

      if (body.error === "invalid_credentials") {
        setErrorType("invalid_credentials");
      } else {
        setErrorMessage(body.error || "Internal server error. Please try again.");
        setErrorType("server");
      }
    } catch {
      setErrorMessage("Network error. Please check your connection and try again.");
      setErrorType("server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex selection:bg-blue-500/30 selection:text-blue-900">
      {/* LEFT: Branding */}
      <div className="hidden lg:flex w-1/2 bg-[#0A1628] text-white flex-col justify-between p-12 relative overflow-hidden">
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <svg width="36" height="36" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="3" />
              <path d="M16 8C11.5817 8 8 11.5817 8 16C8 20.4183 11.5817 24 16 24" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <span className="text-2xl font-black tracking-tight group-hover:text-blue-400 transition-colors">CircleWorks</span>
          </Link>
          <h2 className="mt-8 text-4xl font-light text-slate-300 leading-tight">
            Payroll & HR. <br />
            <span className="font-bold text-white">Simplified for America.</span>
          </h2>
        </div>

        <div className="relative z-10 w-full max-w-lg mb-16">
          <div className="h-32 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeQuote}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 flex flex-col justify-center"
              >
                <p className="text-[18px] text-white leading-relaxed font-medium">
                  &ldquo;{QUOTES[activeQuote].quote}&rdquo;
                </p>
                <div className="flex items-center gap-3 mt-5">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-sm text-white">
                    {QUOTES[activeQuote].avatar}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{QUOTES[activeQuote].author}</p>
                    <p className="text-xs text-slate-400 font-medium">{QUOTES[activeQuote].company}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Security Badges */}
        <div className="relative z-10 flex items-center gap-4 pt-8">
          <div className="flex items-center gap-2 text-xs text-white font-semibold tracking-wide border border-white/60 px-4 py-2.5 rounded-lg opacity-80 hover:opacity-100 transition-opacity">
            <ShieldCheck size={18} className="text-white" />
            SOC 2 Type II
          </div>
          <div className="flex items-center gap-2 text-xs text-white font-semibold tracking-wide border border-white/60 px-4 py-2.5 rounded-lg opacity-80 hover:opacity-100 transition-opacity">
            <Check size={18} className="text-white" />
            HIPAA Ready
          </div>
          <div className="flex items-center gap-2 text-xs text-white font-semibold tracking-wide border border-white/60 px-4 py-2.5 rounded-lg opacity-80 hover:opacity-100 transition-opacity">
            <Lock size={18} className="text-white" />
            256-bit AES
          </div>
        </div>
      </div>

      {/* RIGHT: Form */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center p-6 sm:p-10 lg:px-16 lg:py-8 relative overflow-y-auto">
        <div className="absolute right-6 top-6 hidden sm:flex items-center gap-2 text-sm font-semibold text-slate-600">
          <span>New here?</span>
          <Link
            href="/signup"
            className="inline-flex h-9 items-center justify-center rounded-lg bg-[#0A1628] px-4 text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
          >
            Start free
          </Link>
        </div>

        <div className="max-w-sm w-full mx-auto">
          {/* Mobile Logo */}
          <Link href="/" className="lg:hidden inline-flex items-center gap-2 mb-8">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14" stroke="#0A1628" strokeWidth="3" />
              <path d="M16 8C11.5817 8 8 11.5817 8 16C8 20.4183 11.5817 24 16 24" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <span className="text-xl font-black text-[#0A1628] tracking-tight">CircleWorks</span>
          </Link>

          <div aria-live="assertive" className="mb-4">
            {errorType === "invalid_credentials" && (
              <div className="p-3 rounded-lg bg-red-50 text-red-600 flex items-start gap-2 border border-red-100 relative pr-8">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span className="text-sm font-semibold">Incorrect email or password. Please try again.</span>
                <button onClick={() => setErrorType("none")} className="absolute right-2 top-2 text-red-400 hover:text-red-600">
                  <X size={16} />
                </button>
              </div>
            )}
            {errorType === "locked" && (
              <div className="p-3 rounded-lg bg-orange-50 text-orange-700 flex items-start gap-2 border border-orange-200">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">Account temporarily locked. Wait 15 minutes or reset your password.</span>
                  <Link href="/forgot-password" className="text-sm font-bold underline mt-1 text-orange-800">Reset Password</Link>
                </div>
              </div>
            )}
            {errorType === "server" && (
              <div className="p-3 rounded-lg bg-red-50 text-red-700 flex items-start gap-2 border border-red-100 relative pr-8">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span className="text-sm font-semibold">
                  {errorMessage || "Internal server error. Please try again."}
                </span>
                <button onClick={() => setErrorType("none")} className="absolute right-2 top-2 text-red-400 hover:text-red-600">
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          {!mfaNeeded ? (
            <>
              <header className="mb-6 text-center lg:text-left">
                <h2 className="text-[32px] font-bold text-[#0A1628] tracking-tight mb-1">Welcome back</h2>
                <p className="text-gray-500 font-medium">Sign in to CircleWorks</p>
              </header>

              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                <div className="relative group">
                  <input
                    type="email"
                    id="email"
                    tabIndex={1}
                    {...loginForm.register("email")}
                    autoFocus
                    className={`peer w-full px-4 pt-5 pb-1.5 bg-white border border-gray-300 rounded-lg text-slate-900 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all ${
                      loginForm.formState.errors.email ? "border-red-500" : ""
                    }`}
                    placeholder="Work email address"
                  />
                  <label
                    htmlFor="email"
                    className={`absolute left-4 top-1.5 text-[11px] font-bold uppercase tracking-widest transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-3.5 peer-placeholder-shown:font-medium peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:text-[11px] peer-focus:top-1.5 peer-focus:font-bold peer-focus:uppercase peer-focus:tracking-widest ${
                      loginForm.formState.errors.email ? "text-red-500" : "text-gray-500 peer-focus:text-blue-600"
                    }`}
                  >
                    Work email address
                  </label>
                  {loginForm.formState.errors.email && (
                    <p className="text-red-600 text-xs mt-1 absolute -bottom-5 left-1 font-medium z-10" aria-live="assertive">
                      {loginForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div className="relative group mt-3">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    tabIndex={2}
                    {...loginForm.register("password")}
                    className={`peer w-full px-4 pt-5 pb-1.5 pr-12 bg-white border border-gray-300 rounded-lg text-slate-900 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all ${
                      loginForm.formState.errors.password ? "border-red-500" : ""
                    }`}
                    placeholder="Password"
                  />
                  <label
                    htmlFor="password"
                    className={`absolute left-4 top-1.5 text-[11px] font-bold uppercase tracking-widest transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-3.5 peer-placeholder-shown:font-medium peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:text-[11px] peer-focus:top-1.5 peer-focus:font-bold peer-focus:uppercase peer-focus:tracking-widest ${
                      loginForm.formState.errors.password ? "text-red-500" : "text-gray-500 peer-focus:text-blue-600"
                    }`}
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                  {loginForm.formState.errors.password && (
                    <p className="text-red-600 text-xs mt-1 absolute -bottom-5 left-1 font-medium z-10" aria-live="assertive">
                      {loginForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      tabIndex={3}
                      {...loginForm.register("rememberMe")}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                    />
                    <span className="text-sm font-medium text-slate-700">Remember me</span>
                  </label>

                  <Link href="/forgot-password" tabIndex={4} className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline">
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  tabIndex={5}
                  disabled={loading}
                  className="w-full mt-4 h-11 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300" aria-live="polite">
              <header className="mb-6">
                <h2 className="text-[28px] font-bold text-[#0A1628] tracking-tight mb-2">Two-factor authentication</h2>
                <p className="text-gray-500 font-medium leading-relaxed">
                  Enter the 6-digit code from your authenticator app (or sent via SMS).
                </p>
              </header>

              <div className="flex gap-2 justify-center sm:justify-between mb-8">
                {mfaCode.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { mfaRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    readOnly
                    className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all bg-white"
                  />
                ))}
              </div>

              <div className="flex flex-col items-center gap-4">
                <button
                  type="button"
                  disabled={countdown > 0}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700 disabled:text-gray-400 transition-colors"
                >
                  {countdown > 0 ? `Resend code (${countdown}s)` : "Resend code"}
                </button>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 text-center lg:text-left">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors"
                >
                  <ChevronLeft size={16} /> Back to login
                </button>
              </div>
            </div>
          )}

          {!mfaNeeded && (
            <div className="mt-8 space-y-3 text-center">
              <p className="text-sm text-gray-500 font-medium">
                New to CircleWorks?{" "}
                <Link href="/signup" className="font-bold text-blue-600 hover:text-blue-700 hover:underline">
                  Start free
                </Link>
                .
              </p>
              <p className="text-xs text-gray-400 font-medium">
                No credit card required.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
