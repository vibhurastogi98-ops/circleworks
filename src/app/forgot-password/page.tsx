"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowLeft, CheckCircle2, Loader2, Mail } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Work email address is required")
    .email("Enter a valid email address"),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;
const RATE_LIMIT_LIMIT = 3;
const RATE_LIMIT_BLOCK_MS = 10 * 60 * 1000;
const STORAGE_KEY = "cw_forgot_password_requests";

type RequestState = {
  timestamps: number[];
  blockedUntil: number | null;
};

function CircleWorksLogo() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-3 rounded-lg text-[#0A1628] transition-colors hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
    >
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
    </Link>
  );
}

function getRequestState(): RequestState {
  if (typeof window === "undefined") return { timestamps: [], blockedUntil: null };

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { timestamps: [], blockedUntil: null };

    const parsed = JSON.parse(stored) as Partial<RequestState>;
    const now = Date.now();
    return {
      timestamps: Array.isArray(parsed.timestamps)
        ? parsed.timestamps.filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS)
        : [],
      blockedUntil:
        typeof parsed.blockedUntil === "number" && parsed.blockedUntil > now
          ? parsed.blockedUntil
          : null,
    };
  } catch {
    return { timestamps: [], blockedUntil: null };
  }
}

function saveRequestState(state: RequestState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getRetryMinutes(blockedUntil: number | null) {
  if (!blockedUntil) return 10;
  return Math.max(1, Math.ceil((blockedUntil - Date.now()) / 60000));
}

export default function ForgotPasswordPage() {
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [blockedUntil, setBlockedUntil] = useState<number | null>(null);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  useEffect(() => {
    setBlockedUntil(getRequestState().blockedUntil);
  }, []);

  const registerLocalRequest = () => {
    const now = Date.now();
    const state = getRequestState();
    const timestamps = [...state.timestamps, now].filter(
      (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS
    );
    const nextBlockedUntil =
      timestamps.length >= RATE_LIMIT_LIMIT ? now + RATE_LIMIT_BLOCK_MS : state.blockedUntil;

    saveRequestState({ timestamps, blockedUntil: nextBlockedUntil });
    setBlockedUntil(nextBlockedUntil);
  };

  const onSubmit = async (values: ForgotPasswordValues) => {
    const localState = getRequestState();

    if (localState.blockedUntil) {
      setBlockedUntil(localState.blockedUntil);
      return;
    }

    setLoading(true);
    setServerError("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email }),
      });

      const body = (await response.json()) as { error?: string; retryAfterSeconds?: number };

      if (response.status === 429) {
        const retryAfterMs = Math.max(body.retryAfterSeconds ?? 600, 60) * 1000;
        const retryUntil = Date.now() + retryAfterMs;
        setBlockedUntil(retryUntil);
        saveRequestState({ timestamps: localState.timestamps, blockedUntil: retryUntil });
        return;
      }

      if (!response.ok) {
        setServerError(body.error || "Unable to send the reset link. Please try again.");
        return;
      }

      registerLocalRequest();
      setSubmittedEmail(values.email);
    } catch {
      setServerError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isBlocked = Boolean(blockedUntil && blockedUntil > Date.now());

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-5 py-10 text-slate-950 selection:bg-blue-200">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
          className="rounded-lg border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60"
        >
          <div className="mb-8 flex justify-center">
            <CircleWorksLogo />
          </div>

          <div aria-live="polite">
            {submittedEmail ? (
              <div className="text-center">
                <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-green-700">
                  <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
                </div>
                <h2 className="text-2xl font-bold text-[#0A1628]">✓ Check your email!</h2>
                <p className="mt-3 text-sm font-medium leading-6 text-slate-600">
                  We sent a reset link to{" "}
                  <span className="font-bold text-slate-900">{submittedEmail}</span>.
                </p>
              </div>
            ) : (
              <>
                <header className="mb-7 text-center">
                  <h2 className="text-2xl font-bold text-[#0A1628]">Reset your password</h2>
                  <p className="mt-2 text-sm font-medium text-slate-500">
                    We&apos;ll send a reset link to your email.
                  </p>
                </header>

                {isBlocked && (
                  <div
                    role="alert"
                    className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
                  >
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                    <div>
                      <p>Too many requests. Try again in 10 minutes.</p>
                      <p className="mt-1 text-xs text-red-600">
                        Available again in {getRetryMinutes(blockedUntil)} minutes.
                      </p>
                    </div>
                  </div>
                )}

                {serverError && (
                  <div
                    role="alert"
                    className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
                  >
                    {serverError}
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
                  <div>
                    <label htmlFor="email" className="mb-1.5 block text-sm font-bold text-slate-800">
                      Email address
                    </label>
                    <div className="relative">
                      <Mail
                        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                        aria-hidden="true"
                      />
                      <input
                        id="email"
                        type="email"
                        autoFocus
                        autoComplete="email"
                        placeholder="name@company.com"
                        {...register("email")}
                        className={`h-12 w-full rounded-lg border bg-white pl-10 pr-3 text-sm text-slate-950 outline-none transition-colors focus:border-blue-600 focus:ring-2 focus:ring-blue-100 ${
                          errors.email ? "border-red-400 bg-red-50" : "border-slate-300"
                        }`}
                        aria-invalid={Boolean(errors.email)}
                        aria-describedby={errors.email ? "email-error" : undefined}
                      />
                    </div>
                    {errors.email && (
                      <p id="email-error" role="alert" className="mt-1.5 text-sm font-medium text-red-600">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || isBlocked}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-bold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        Sending...
                      </>
                    ) : (
                      "Send reset link"
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </motion.div>

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-lg text-sm font-bold text-slate-500 transition-colors hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to login
          </Link>
        </div>
      </div>
    </main>
  );
}
