"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ShieldCheck, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useSignIn } from "@clerk/nextjs/legacy";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const QUOTES = [
  {
    quote: "CircleWorks completely transformed our HR operations. It's the most intuitive platform we've ever used.",
    author: "Sarah J., VP of People at TechFlow"
  },
  {
    quote: "The automated payroll features save us over 20 hours a week. I can't imagine going back to our old system.",
    author: "Michael R., Founder & CEO"
  },
  {
    quote: "Onboarding contractors globally used to be a nightmare. Now it takes just a few clicks.",
    author: "Elena T., Operations Manager"
  }
];

const loginSchema = z.object({
  email: z.string().email("Please enter a valid work email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

const mfaSchema = z.object({
  mfaCode: z.string().length(6, "Code must be exactly 6 digits"),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type MfaFormValues = z.infer<typeof mfaSchema>;

export default function LoginPage() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const [activeQuote, setActiveQuote] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Custom states for MFA / errors
  const [errorMsg, setErrorMsg] = useState("");
  const [mfaNeeded, setMfaNeeded] = useState(false);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const mfaForm = useForm<MfaFormValues>({
    resolver: zodResolver(mfaSchema),
    defaultValues: {
      mfaCode: "",
    },
  });

  // Rotate quotes
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveQuote((prev) => (prev + 1) % QUOTES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Redirect if signed in
  useEffect(() => {
    if (isSignedIn) {
      router.replace("/dashboard");
    }
  }, [isSignedIn, router]);

  const onLoginSubmit = async (data: LoginFormValues) => {
    if (!isLoaded || isSignedIn) return;
    
    setLoading(true);
    setErrorMsg("");

    try {
      const result = await signIn.create({
        identifier: data.email,
        password: data.password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/dashboard");
      } else if (result.status === "needs_second_factor") {
        setMfaNeeded(true);
      } else {
        console.error("Sign-in incomplete:", result);
        setErrorMsg("Login incomplete. Check your credentials.");
      }
    } catch (err: any) {
      console.error(err);
      const isLocked = err.errors?.some((e: any) => e.code === "account_locked");
      if (isLocked) {
        setErrorMsg("Too many attempts. Wait 15 minutes or reset password.");
      } else {
        setErrorMsg("Incorrect email or password.");
      }
    } finally {
      setLoading(false);
    }
  };

  const onMfaSubmit = async (data: MfaFormValues) => {
    if (!isLoaded || isSignedIn) return;
    
    setLoading(true);
    setErrorMsg("");

    try {
      const result = await signIn.attemptSecondFactor({
        strategy: "totp",
        code: data.mfaCode,
      });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/dashboard");
      } else {
        setErrorMsg("Invalid code or incomplete status.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Invalid authentication code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!isLoaded) return;
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/dashboard",
      });
    } catch (err) {
      console.error("Google login error", err);
    }
  };

  const handleMicrosoftLogin = async () => {
    if (!isLoaded) return;
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_microsoft",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/dashboard",
      });
    } catch (err) {
      console.error("Microsoft login error", err);
    }
  };

  return (
    <main className="min-h-screen flex selection:bg-blue-500/30 selection:text-blue-900">
      {/* LEFT: Branding */}
      <div className="hidden lg:flex w-1/2 bg-[#0a1128] text-white flex-col justify-between p-12 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
           <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-blue-600/10 rounded-full blur-[120px]" />
           <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-indigo-600/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <svg width="36" height="36" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="3" />
              <path d="M16 8C11.5817 8 8 11.5817 8 16C8 20.4183 11.5817 24 16 24" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <span className="text-2xl font-black tracking-tight group-hover:text-blue-400 transition-colors">CircleWorks</span>
          </Link>
          <h2 className="mt-8 text-4xl font-light text-slate-300 leading-tight">
            The platform built for <br />
            <span className="font-bold text-white">creators, agencies & companies.</span>
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
                className="absolute inset-0"
              >
                <Lock size={32} className="text-blue-500/30 mb-4" />
                <p className="text-xl font-medium text-slate-200 leading-relaxed">
                  "{QUOTES[activeQuote].quote}"
                </p>
                <p className="mt-4 text-sm font-bold text-slate-400 uppercase tracking-wider">
                  — {QUOTES[activeQuote].author}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Security Badges */}
        <div className="relative z-10 flex items-center gap-6 pt-8 border-t border-slate-700/50">
          <div className="flex items-center gap-2 text-sm text-slate-400 font-semibold tracking-wide">
            <ShieldCheck size={18} className="text-emerald-400" />
            SOC 2 Type II
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400 font-semibold tracking-wide">
            <Check size={18} className="text-emerald-400" />
            HIPAA Compliant
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400 font-semibold tracking-wide">
            <Lock size={18} className="text-emerald-400" />
            256-bit Encryption
          </div>
        </div>
      </div>

      {/* RIGHT: Form */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center p-6 sm:p-10 lg:px-16 lg:py-8 relative overflow-y-auto">
        <div className="max-w-md w-full mx-auto">
          {/* Mobile Logo */}
          <Link href="/" className="lg:hidden inline-flex items-center gap-2 mb-6">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14" stroke="#0a1128" strokeWidth="3" />
              <path d="M16 8C11.5817 8 8 11.5817 8 16C8 20.4183 11.5817 24 16 24" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <span className="text-xl font-black text-[#0a1128] tracking-tight">CircleWorks</span>
          </Link>

          <header className="mb-6">
            <h2 className="text-3xl font-black text-[#0a1128] tracking-tight mb-2">Welcome back</h2>
            <p className="text-slate-500 font-medium">Sign in to CircleWorks</p>
          </header>

          <div aria-live="polite">
            {errorMsg && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 flex items-start gap-2 border border-red-100"
              >
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span className="text-sm font-semibold">{errorMsg}</span>
              </motion.div>
            )}
          </div>

          {!mfaNeeded ? (
            <>
              {/* SSO Buttons */}
              <div className="space-y-3 mb-6">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold hover:bg-slate-50 hover:border-slate-300 transition-all focus:outline-none focus:ring-4 focus:ring-slate-100 active:scale-[0.98]"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.11c-.22-.67-.35-1.39-.35-2.11s.13-1.44.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.84z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.51 6.16-4.51z" fill="#EA4335" />
                  </svg>
                  Continue with Google
                </button>
                <button
                  type="button"
                  onClick={handleMicrosoftLogin}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold hover:bg-slate-50 hover:border-slate-300 transition-all focus:outline-none focus:ring-4 focus:ring-slate-100 active:scale-[0.98]"
                >
                  <svg width="18" height="18" viewBox="0 0 21 21" fill="none">
                    <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
                    <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
                    <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
                    <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
                  </svg>
                  Continue with Microsoft
                </button>
              </div>

              <div className="relative mb-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-4 text-slate-400 font-medium">
                    — or sign in with email —
                  </span>
                </div>
              </div>

              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                <div className="relative group">
                  <input
                    type="email"
                    id="email"
                    {...loginForm.register("email")}
                    autoFocus
                    aria-label="Work email address"
                    className={`peer w-full px-4 pt-5 pb-1.5 bg-slate-50 border rounded-xl text-slate-900 placeholder-transparent focus:bg-white focus:outline-none focus:ring-4 transition-all ${
                      loginForm.formState.errors.email ? "border-red-300 focus:border-red-500 focus:ring-red-500/10" : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/10"
                    }`}
                    placeholder="Work email address"
                  />
                  <label 
                    htmlFor="email"
                    className={`absolute left-4 top-1.5 text-[10px] font-bold uppercase tracking-widest transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-3.5 peer-placeholder-shown:font-medium peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:text-[10px] peer-focus:top-1.5 peer-focus:font-bold peer-focus:uppercase peer-focus:tracking-widest ${
                      loginForm.formState.errors.email ? "text-red-500 peer-focus:text-red-500" : "text-slate-500 peer-focus:text-blue-500"
                    }`}
                  >
                    Work email address
                  </label>
                  {loginForm.formState.errors.email && (
                    <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-1 font-medium z-10">{loginForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="relative group mt-3">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    {...loginForm.register("password")}
                    aria-label="Password"
                    className={`peer w-full px-4 pt-5 pb-1.5 pr-12 bg-slate-50 border rounded-xl text-slate-900 placeholder-transparent focus:bg-white focus:outline-none focus:ring-4 transition-all ${
                      loginForm.formState.errors.password ? "border-red-300 focus:border-red-500 focus:ring-red-500/10" : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/10"
                    }`}
                    placeholder="Password"
                  />
                  <label 
                    htmlFor="password"
                    className={`absolute left-4 top-1.5 text-[10px] font-bold uppercase tracking-widest transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-3.5 peer-placeholder-shown:font-medium peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:text-[10px] peer-focus:top-1.5 peer-focus:font-bold peer-focus:uppercase peer-focus:tracking-widest ${
                      loginForm.formState.errors.password ? "text-red-500 peer-focus:text-red-500" : "text-slate-500 peer-focus:text-blue-500"
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
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  {loginForm.formState.errors.password && (
                    <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-1 font-medium z-10">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1 mt-3">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className="relative flex items-center justify-center w-4 h-4">
                      <input 
                        type="checkbox" 
                        {...loginForm.register("rememberMe")}
                        className="peer appearance-none w-4 h-4 border-2 border-slate-300 rounded focus:ring-2 focus:ring-blue-500/20 focus:outline-none checked:bg-blue-600 checked:border-blue-600 transition-colors" 
                      />
                      <Check size={10} className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                    </div>
                    <span className="text-xs font-medium text-slate-600 select-none group-hover:text-slate-800">Remember me</span>
                  </label>

                  <Link href="/help" className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline">
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 focus:ring-4 focus:ring-blue-600/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
            <form onSubmit={mfaForm.handleSubmit(onMfaSubmit)} className="space-y-4">
              <div className="mb-4">
                <p className="text-sm text-slate-600 mb-4 font-medium">Please enter the 6-digit code to complete sign in.</p>
                <div className="relative group">
                  <input
                    type="text"
                    id="mfaCode"
                    {...mfaForm.register("mfaCode")}
                    autoFocus
                    maxLength={6}
                    aria-label="6-digit authentication code"
                    className={`peer w-full px-4 pt-5 pb-1.5 bg-slate-50 border rounded-xl text-slate-900 tracking-[0.5em] font-bold text-center placeholder-transparent focus:bg-white focus:outline-none focus:ring-4 transition-all ${
                      mfaForm.formState.errors.mfaCode ? "border-red-300 focus:border-red-500 focus:ring-red-500/10" : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/10"
                    }`}
                    placeholder="000000"
                  />
                  <label 
                    htmlFor="mfaCode"
                    className={`absolute left-4 top-1.5 text-[10px] font-bold uppercase tracking-widest transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-3.5 peer-placeholder-shown:font-medium peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:text-[10px] peer-focus:top-1.5 peer-focus:font-bold peer-focus:uppercase peer-focus:tracking-widest ${
                      mfaForm.formState.errors.mfaCode ? "text-red-500 peer-focus:text-red-500" : "text-slate-500 peer-focus:text-blue-500"
                    }`}
                  >
                    Authentication Code
                  </label>
                  {mfaForm.formState.errors.mfaCode && (
                    <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-1 font-medium z-10">{mfaForm.formState.errors.mfaCode.message}</p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 focus:ring-4 focus:ring-blue-600/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Code"
                )}
              </button>

              <div className="text-center mt-3">
                <button 
                  type="button" 
                  onClick={() => {
                    setMfaNeeded(false);
                    mfaForm.reset();
                  }}
                  className="text-sm text-slate-500 hover:text-slate-800 font-medium"
                >
                  Back to login
                </button>
              </div>
            </form>
          )}

          <p className="mt-5 text-center text-sm text-slate-500 font-medium">
            Don't have an account?{" "}
            <Link href="/signup" className="text-blue-600 font-bold hover:underline">
              Start free &rarr;
            </Link>
          </p>
          <div id="clerk-captcha" />
        </div>
      </div>
    </main>
  );
}