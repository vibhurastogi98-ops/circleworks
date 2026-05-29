"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Work email address is required")
    .email("Enter a valid work email address"),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

type ForgotPasswordResponse = {
  error?: string;
  retryAfterSeconds?: number;
};

function CircleWorksLogo() {
  return (
    <Link
      href="/"
      className="inline-flex items-center justify-center gap-3 rounded-lg text-[#0A1628] transition-colors hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
      aria-label="CircleWorks home"
    >
      <svg width="40" height="40" viewBox="0 0 36 36" fill="none" aria-hidden="true">
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

function maskPart(value: string) {
  if (value.length <= 1) return "*";
  if (value.length === 2) return `${value[0]}*`;
  return `${value[0]}${"*".repeat(Math.min(value.length - 1, 4))}`;
}

function maskEmail(email: string) {
  const [local = "", domain = ""] = email.split("@");
  const domainParts = domain.split(".");
  const domainName = domainParts[0] || "";
  const domainSuffix = domainParts.slice(1).join(".");

  return `${maskPart(local)}@${maskPart(domainName)}${domainSuffix ? `.${domainSuffix}` : ""}`;
}

function getMailLinks(email: string) {
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  const links = [
    { label: "Open Gmail →", href: "https://mail.google.com/" },
    { label: "Open Outlook →", href: "https://outlook.office.com/mail/" },
  ];

  if (/(outlook|hotmail|live|msn|office365|microsoft)/.test(domain)) {
    return [links[1], links[0]];
  }

  return links;
}

function getRateLimitMessage(rateLimitUntil: number | null) {
  if (!rateLimitUntil) {
    return "Too many requests. Please wait 10 minutes before requesting another reset link.";
  }

  const minutes = Math.max(1, Math.ceil((rateLimitUntil - Date.now()) / 60000));
  return `Too many requests. Please wait ${minutes} minute${minutes === 1 ? "" : "s"} before requesting another reset link.`;
}

export default function ForgotPasswordPage() {
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [rateLimitUntil, setRateLimitUntil] = useState<number | null>(null);
  const [resendSeconds, setResendSeconds] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  useEffect(() => {
    if (!submittedEmail) return;

    setResendSeconds(60);
    const timer = window.setInterval(() => {
      setResendSeconds((seconds) => {
        if (seconds <= 1) {
          window.clearInterval(timer);
          return 0;
        }

        return seconds - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [submittedEmail]);

  const mailLinks = useMemo(() => getMailLinks(submittedEmail), [submittedEmail]);
  const isRateLimited = Boolean(rateLimitUntil && rateLimitUntil > Date.now());

  const submitEmail = async (email: string, resend = false) => {
    if (isRateLimited) return;

    setLoading(true);
    setServerError("");
    setRateLimitUntil(null);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const body = (await response.json()) as ForgotPasswordResponse;

      if (response.status === 429) {
        const retryAfterMs = Math.max(body.retryAfterSeconds ?? 600, 60) * 1000;
        setRateLimitUntil(Date.now() + retryAfterMs);
        return;
      }

      if (!response.ok) {
        setServerError(body.error || "Unable to send the reset link. Please try again.");
        return;
      }

      setSubmittedEmail(email);
      if (resend) setResendSeconds(60);
    } catch {
      setServerError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (values: ForgotPasswordValues) => {
    void submitEmail(values.email.trim().toLowerCase());
  };

  const resendEmail = () => {
    if (!submittedEmail || resendSeconds > 0 || loading) return;
    void submitEmail(submittedEmail, true);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-5 py-10 text-slate-950 selection:bg-blue-200">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-10 shadow-lg shadow-slate-200/70"
      >
        <div className="text-center">
          <CircleWorksLogo />
          <Link
            href="/login"
            className="mt-6 inline-flex text-sm font-bold text-blue-600 transition-colors hover:text-blue-800 hover:underline focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            ← Back to Login
          </Link>
        </div>

        <div className="mt-8" aria-live="polite">
          {submittedEmail ? (
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-700">
                <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
              </div>
              <h1 className="mt-5 text-2xl font-bold text-[#0A1628]">Check your inbox!</h1>
              <p className="mt-3 text-sm font-medium leading-6 text-slate-500">
                We sent a reset link to{" "}
                <span className="font-bold text-slate-800">{maskEmail(submittedEmail)}</span>.
                It expires in 15 minutes.
              </p>

              {isRateLimited && (
                <div
                  role="alert"
                  className="mt-5 flex items-start gap-3 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-left text-sm font-semibold text-orange-800"
                >
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                  {getRateLimitMessage(rateLimitUntil)}
                </div>
              )}

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {mailLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                  >
                    {link.label}
                  </a>
                ))}
              </div>

              <button
                type="button"
                onClick={resendEmail}
                disabled={loading || resendSeconds > 0 || isRateLimited}
                className="mt-6 text-sm font-bold text-blue-600 transition-colors hover:text-blue-800 hover:underline disabled:cursor-not-allowed disabled:text-slate-400 disabled:no-underline"
              >
                {loading
                  ? "Sending..."
                  : resendSeconds > 0
                    ? `Resend email in ${resendSeconds}s`
                    : "Resend email"}
              </button>
            </div>
          ) : (
            <>
              <header className="text-center">
                <h1 className="text-[28px] font-bold leading-tight text-[#0A1628]">
                  Reset your password
                </h1>
                <p className="mt-3 text-sm font-medium leading-6 text-slate-500">
                  Enter your work email and we&apos;ll send you a secure reset link.
                </p>
              </header>

              {isRateLimited && (
                <div
                  role="alert"
                  className="mt-6 flex items-start gap-3 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-800"
                >
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                  {getRateLimitMessage(rateLimitUntil)}
                </div>
              )}

              {serverError && (
                <div
                  role="alert"
                  className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
                >
                  {serverError}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-7 space-y-5">
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-bold text-slate-800">
                    Work email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    autoFocus
                    placeholder="name@company.com"
                    {...register("email")}
                    className={`h-12 w-full rounded-lg border bg-white px-4 text-sm text-slate-950 outline-none transition-colors focus:border-blue-600 focus:ring-2 focus:ring-blue-100 ${
                      errors.email ? "border-red-500 bg-red-50" : "border-slate-300"
                    }`}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? "email-error" : undefined}
                  />
                  {errors.email && (
                    <p id="email-error" role="alert" className="mt-2 text-sm font-medium text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || isRateLimited}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-bold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      Sending...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </motion.section>
    </main>
  );
}
