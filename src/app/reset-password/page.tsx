"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { ArrowLeft, AlertTriangle, Check, Eye, EyeOff, X } from "lucide-react";
import { toast } from "sonner";
import { decodeJwt } from "jose";

const resetSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof resetSchema>;

function decodeTokenExpiry(token: string) {
  try {
    const decoded = decodeJwt(token);
    return typeof decoded.exp === "number" ? decoded.exp * 1000 : null;
  } catch {
    return null;
  }
}

function isTokenExpired(token: string | null) {
  if (!token) return true;
  const expiry = decodeTokenExpiry(token);
  return !expiry || Date.now() >= expiry;
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tokenState, setTokenState] = useState<"checking" | "valid" | "expired">("checking");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const passwordValue = watch("password") || "";

  const requirements = useMemo(
    () => ({
      length: passwordValue.length >= 8,
      uppercase: /[A-Z]/.test(passwordValue),
      lowercase: /[a-z]/.test(passwordValue),
      number: /[0-9]/.test(passwordValue),
      special: /[^A-Za-z0-9]/.test(passwordValue),
    }),
    [passwordValue]
  );

  const allRequirementsMet = Object.values(requirements).every(Boolean);

  useEffect(() => {
    if (!token || isTokenExpired(token)) {
      setTokenState("expired");
    } else {
      setTokenState("valid");
    }
  }, [token]);

  const onSubmit = async (data: FormData) => {
    if (!token) {
      setTokenState("expired");
      return;
    }

    if (!allRequirementsMet) {
      return;
    }

    setLoading(true);
    setFormError(null);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password: data.password,
          confirmPassword: data.confirmPassword,
        }),
      });

      const body = await response.json();
      if (!response.ok) {
        if (response.status === 401) {
          setTokenState("expired");
          return;
        }
        setFormError(body.error || "Unable to reset password. Please try again.");
        return;
      }

      toast.success("Password updated!");
      setSubmitted(true);
      window.setTimeout(() => {
        router.replace("/login");
      }, 1600);
    } catch (error) {
      console.error(error);
      setFormError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (tokenState === "checking") {
    return (
      <div className="text-center py-12">
        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-medium text-slate-500">Validating your secure link...</p>
      </div>
    );
  }

  if (tokenState === "expired") {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={32} className="text-red-500" />
        </div>
        <h1 className="text-xl font-black text-[#0A1628] mb-2 tracking-tight">Link expired</h1>
        <p className="text-sm font-medium text-slate-500 mb-8 leading-relaxed px-4">
          This password reset link is invalid or has expired. Request a new one.
        </p>
        <Link
          href="/forgot-password"
          className="inline-flex py-3 px-6 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
        >
          Request new link
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-black text-[#0A1628] mb-2 tracking-tight">Set new password</h1>
        <p className="text-sm font-medium text-slate-500">Please enter your new password below.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="relative group">
          <input
            type={showPassword ? "text" : "password"}
            {...register("password")}
            autoFocus
            aria-label="New Password"
            className={`peer w-full px-4 pt-6 pb-2 pr-12 bg-slate-50 border rounded-xl text-slate-900 placeholder-transparent focus:bg-white focus:outline-none focus:ring-4 transition-all ${
              errors.password ? "border-red-300 focus:border-red-500 focus:ring-red-500/10" : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/10"
            }`}
            placeholder="New Password"
          />
          <label
            className={`absolute left-4 top-2 text-[11px] font-bold uppercase tracking-widest transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-placeholder-shown:font-medium peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:text-[11px] peer-focus:top-2 peer-focus:font-bold peer-focus:uppercase peer-focus:tracking-widest ${
              errors.password ? "text-red-500" : "text-slate-500 peer-focus:text-blue-500"
            }`}
          >
            New Password
          </label>
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 focus:outline-none"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
          <p className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-3">Password Requirements</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div className={`flex items-center gap-2 ${requirements.length ? "text-emerald-600 font-medium" : "text-slate-500"}`}>
              {requirements.length ? <Check size={16} /> : <X size={16} className="opacity-50" />} 8+ characters
            </div>
            <div className={`flex items-center gap-2 ${requirements.uppercase ? "text-emerald-600 font-medium" : "text-slate-500"}`}>
              {requirements.uppercase ? <Check size={16} /> : <X size={16} className="opacity-50" />} Uppercase letter
            </div>
            <div className={`flex items-center gap-2 ${requirements.lowercase ? "text-emerald-600 font-medium" : "text-slate-500"}`}>
              {requirements.lowercase ? <Check size={16} /> : <X size={16} className="opacity-50" />} Lowercase letter
            </div>
            <div className={`flex items-center gap-2 ${requirements.number ? "text-emerald-600 font-medium" : "text-slate-500"}`}>
              {requirements.number ? <Check size={16} /> : <X size={16} className="opacity-50" />} Number
            </div>
            <div className={`flex items-center gap-2 ${requirements.special ? "text-emerald-600 font-medium" : "text-slate-500"}`}>
              {requirements.special ? <Check size={16} /> : <X size={16} className="opacity-50" />} Special character
            </div>
          </div>
        </div>

        <div className="relative group">
          <input
            type={showConfirmPassword ? "text" : "password"}
            {...register("confirmPassword")}
            aria-label="Confirm Password"
            className={`peer w-full px-4 pt-6 pb-2 pr-12 bg-slate-50 border rounded-xl text-slate-900 placeholder-transparent focus:bg-white focus:outline-none focus:ring-4 transition-all ${
              errors.confirmPassword ? "border-red-300 focus:border-red-500 focus:ring-red-500/10" : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/10"
            }`}
            placeholder="Confirm Password"
          />
          <label
            className={`absolute left-4 top-2 text-[11px] font-bold uppercase tracking-widest transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-placeholder-shown:font-medium peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:text-[11px] peer-focus:top-2 peer-focus:font-bold peer-focus:uppercase peer-focus:tracking-widest ${
              errors.confirmPassword ? "text-red-500" : "text-slate-500 peer-focus:text-blue-500"
            }`}
          >
            Confirm Password
          </label>
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 focus:outline-none"
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-1 font-medium">{errors.confirmPassword.message}</p>
          )}
        </div>

        {formError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {formError}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !allRequirementsMet || submitted}
          className="w-full mt-8 py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 focus:ring-4 focus:ring-blue-600/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Resetting...
            </>
          ) : (
            "Set new password"
          )}
        </button>
      </form>

      {submitted && (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Password updated successfully. Redirecting to login...
        </div>
      )}
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6 selection:bg-blue-500/30">
      <div className="max-w-md w-full relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2rem] p-10 shadow-xl shadow-slate-200/50 border border-slate-100"
        >
          <div className="flex justify-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <circle cx="16" cy="16" r="14" stroke="#0A1628" strokeWidth="3" />
                <path d="M16 8C11.5817 8 8 11.5817 8 16C8 20.4183 11.5817 24 16 24" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </Link>
          </div>
          <Suspense fallback={<div className="py-8 text-center text-sm text-slate-500">Loading reset form…</div>}>
            <ResetPasswordForm />
          </Suspense>
        </motion.div>

        <div className="mt-8 text-center">
          <Link href="/login" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">
            <ArrowLeft size={16} /> Back to login
          </Link>
        </div>
      </div>
    </main>
  );
}
