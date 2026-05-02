"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, AlertTriangle, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type FormData = z.infer<typeof schema>;

const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;
const RATE_LIMIT_LIMIT = 3;
const STORAGE_KEY = "cw_forgot_password_requests";

function loadRequestTimestamps() {
  if (typeof window === "undefined") return [] as number[];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const timestamps = JSON.parse(stored) as number[];
    return timestamps.filter((timestamp) => Date.now() - timestamp < RATE_LIMIT_WINDOW_MS);
  } catch {
    return [];
  }
}

function saveRequestTimestamps(timestamps: number[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(timestamps));
}

export default function ForgotPasswordPage() {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const [nextAvailableAt, setNextAvailableAt] = useState<number | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    const timestamps = loadRequestTimestamps();
    if (timestamps.length >= RATE_LIMIT_LIMIT) {
      setRateLimited(true);
      setNextAvailableAt(timestamps[0] + RATE_LIMIT_WINDOW_MS);
    }
  }, []);

  const addRequest = () => {
    const timestamps = loadRequestTimestamps();
    const updated = [...timestamps, Date.now()].filter(
      (timestamp) => Date.now() - timestamp < RATE_LIMIT_WINDOW_MS
    );
    saveRequestTimestamps(updated);
    if (updated.length >= RATE_LIMIT_LIMIT) {
      setRateLimited(true);
      setNextAvailableAt(updated[0] + RATE_LIMIT_WINDOW_MS);
    }
  };

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    const timestamps = loadRequestTimestamps();

    if (timestamps.length >= RATE_LIMIT_LIMIT) {
      setRateLimited(true);
      setNextAvailableAt(timestamps[0] + RATE_LIMIT_WINDOW_MS);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });

      const body = await response.json();
      if (!response.ok) {
        setServerError(body.error || "Unable to send the reset link. Please try again.");
        return;
      }

      addRequest();
      setSubmittedEmail(data.email);
    } catch (error) {
      console.error(error);
      setServerError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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

          {!submittedEmail ? (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-black text-[#0A1628] mb-2 tracking-tight">Reset your password</h1>
                <p className="text-sm font-medium text-slate-500">We'll send a reset link to your email.</p>
              </div>

              {rateLimited && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 flex items-start gap-3 border border-red-100">
                  <AlertTriangle size={20} className="shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold">Too many requests. Try again in 10 minutes.</p>
                    {nextAvailableAt ? (
                      <p className="text-xs text-red-500 mt-1">
                        Available again in {Math.max(1, Math.ceil((nextAvailableAt - Date.now()) / 60000))} minutes.
                      </p>
                    ) : null}
                  </div>
                </div>
              )}

              {serverError && (
                <div className="mb-4 rounded-xl bg-red-50 border border-red-100 p-4 text-sm font-medium text-red-700">
                  {serverError}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    {...register("email")}
                    autoFocus
                    placeholder="name@company.com"
                    className={`w-full bg-slate-50 border rounded-2xl pl-12 pr-5 py-4 focus:outline-none focus:ring-4 transition-all font-medium text-slate-900 ${
                      errors.email ? "border-red-300 focus:border-red-500 focus:ring-red-500/10" : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/10"
                    }`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1 font-medium pl-1">{errors.email.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || rateLimited}
                  className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send reset link"
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={32} className="text-emerald-500" />
              </div>
              <h1 className="text-xl font-black text-[#0A1628] mb-2 tracking-tight">Check your email!</h1>
              <p className="text-sm font-medium text-slate-500 mb-8 leading-relaxed">
                We sent a password reset link to <br />
                <span className="font-bold text-slate-800">{submittedEmail}</span>
              </p>
              <button
                onClick={() => setSubmittedEmail(null)}
                className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline"
              >
                Didn't receive it? Try again
              </button>
            </div>
          )}
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
