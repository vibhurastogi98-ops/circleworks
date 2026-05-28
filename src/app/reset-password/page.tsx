"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowLeft, Check, Eye, EyeOff, Loader2, X } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const passwordRequirements = [
  {
    id: "length",
    label: "8+ chars",
    test: (value: string) => value.length >= 8,
  },
  {
    id: "uppercase",
    label: "Uppercase",
    test: (value: string) => /[A-Z]/.test(value),
  },
  {
    id: "lowercase",
    label: "Lowercase",
    test: (value: string) => /[a-z]/.test(value),
  },
  {
    id: "number",
    label: "Number",
    test: (value: string) => /[0-9]/.test(value),
  },
  {
    id: "special",
    label: "Special char",
    test: (value: string) => /[^A-Za-z0-9]/.test(value),
  },
] as const;

const resetPasswordSchema = z
  .object({
    password: z.string(),
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .superRefine((values, ctx) => {
    passwordRequirements.forEach((requirement) => {
      if (!requirement.test(values.password)) {
        ctx.addIssue({
          code: "custom",
          path: ["password"],
          message: "Password does not meet all requirements",
        });
      }
    });

    if (values.password !== values.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Passwords do not match",
      });
    }
  });

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
type TokenState = "checking" | "valid" | "expired";

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

function ResetPasswordInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [tokenState, setTokenState] = useState<TokenState>("checking");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const password = watch("password");
  const requirementState = useMemo(
    () =>
      passwordRequirements.map((requirement) => ({
        ...requirement,
        met: requirement.test(password || ""),
      })),
    [password]
  );
  const allRequirementsMet = requirementState.every((requirement) => requirement.met);

  useEffect(() => {
    let cancelled = false;

    async function validateToken() {
      if (!token) {
        setTokenState("expired");
        return;
      }

      setTokenState("checking");
      try {
        const response = await fetch(
          `/api/auth/reset-password?token=${encodeURIComponent(token)}`,
          { cache: "no-store" }
        );
        if (!cancelled) setTokenState(response.ok ? "valid" : "expired");
      } catch {
        if (!cancelled) setTokenState("expired");
      }
    }

    void validateToken();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const onSubmit = async (values: ResetPasswordValues) => {
    if (!token || tokenState !== "valid") {
      setTokenState("expired");
      return;
    }

    setLoading(true);
    setFormError("");

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, ...values }),
      });

      const body = (await response.json()) as { error?: string };

      if (!response.ok) {
        if (response.status === 401) {
          setTokenState("expired");
          return;
        }

        setFormError(body.error || "Unable to reset password. Please try again.");
        return;
      }

      router.replace("/login?passwordUpdated=1");
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (tokenState === "checking") {
    return (
      <div className="py-10 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" aria-hidden="true" />
        <p className="mt-4 text-sm font-medium text-slate-500">Validating your reset link...</p>
      </div>
    );
  }

  if (tokenState === "expired") {
    return (
      <div className="py-6 text-center">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 text-red-700">
          <AlertTriangle className="h-7 w-7" aria-hidden="true" />
        </div>
        <h2 className="text-2xl font-bold text-[#0A1628]">Link expired.</h2>
        <p className="mt-3 text-sm font-medium leading-6 text-slate-600">
          Request a new one.
        </p>
        <Link
          href="/forgot-password"
          className="mt-7 inline-flex h-11 items-center justify-center rounded-lg bg-blue-600 px-5 text-sm font-bold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        >
          Request a new one
        </Link>
      </div>
    );
  }

  return (
    <>
      <header className="mb-7 text-center">
        <h2 className="text-2xl font-bold text-[#0A1628]">Set new password</h2>
        <p className="mt-2 text-sm font-medium text-slate-500">
          Choose a strong password for your CircleWorks account.
        </p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-bold text-slate-800">
            New password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              autoFocus
              {...register("password")}
              className={`h-12 w-full rounded-lg border bg-white px-3 pr-11 text-sm text-slate-950 outline-none transition-colors focus:border-blue-600 focus:ring-2 focus:ring-blue-100 ${
                errors.password ? "border-red-400 bg-red-50" : "border-slate-300"
              }`}
              aria-invalid={Boolean(errors.password)}
              aria-describedby="password-requirements"
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
        </div>

        <div
          id="password-requirements"
          className="rounded-lg border border-slate-200 bg-slate-50 p-4"
        >
          <p className="mb-3 text-xs font-bold uppercase text-slate-600">
            Password requirements
          </p>
          <div className="grid gap-2 text-sm sm:grid-cols-2">
            {requirementState.map((requirement) => (
              <div
                key={requirement.id}
                className={`flex items-center gap-2 font-semibold ${
                  requirement.met ? "text-green-700" : "text-slate-500"
                }`}
              >
                {requirement.met ? (
                  <Check className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <X className="h-4 w-4" aria-hidden="true" />
                )}
                {requirement.label}
              </div>
            ))}
          </div>
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-1.5 block text-sm font-bold text-slate-800"
          >
            Confirm password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              {...register("confirmPassword")}
              className={`h-12 w-full rounded-lg border bg-white px-3 pr-11 text-sm text-slate-950 outline-none transition-colors focus:border-blue-600 focus:ring-2 focus:ring-blue-100 ${
                errors.confirmPassword ? "border-red-400 bg-red-50" : "border-slate-300"
              }`}
              aria-invalid={Boolean(errors.confirmPassword)}
              aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((visible) => !visible)}
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              aria-label={showConfirmPassword ? "Hide confirmation password" : "Show confirmation password"}
              title={showConfirmPassword ? "Hide confirmation password" : "Show confirmation password"}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p id="confirmPassword-error" role="alert" className="mt-1.5 text-sm font-medium text-red-600">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {formError && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
          >
            {formError}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !allRequirementsMet}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-bold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Updating...
            </>
          ) : (
            "Set new password"
          )}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
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

          <Suspense
            fallback={
              <div className="py-10 text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" aria-label="Loading reset form" />
              </div>
            }
          >
            <ResetPasswordInner />
          </Suspense>
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
