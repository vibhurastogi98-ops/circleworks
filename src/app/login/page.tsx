"use client";

import {
  type ClipboardEvent,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Eye,
  EyeOff,
  FileText,
  Loader2,
  LockKeyhole,
  Shield,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { Provider } from "@supabase/supabase-js";
import { z } from "zod";

import { useAuth } from "@/context/AuthContext";
import { createSupabaseBrowserClient } from "@/lib/supabase";

const TESTIMONIALS = [
  {
    quote:
      "CircleWorks gave our finance and people teams one trusted place to run payroll, benefits, and onboarding.",
    name: "Priya Shah",
    company: "Northstar Health",
    initials: "PS",
  },
  {
    quote:
      "We cut payroll close from two days to an afternoon, with audit trails our compliance team actually likes.",
    name: "Marcus Lee",
    company: "Apex Studio",
    initials: "ML",
  },
  {
    quote:
      "The employee experience feels polished, and the back office finally has the controls we needed.",
    name: "Elena Torres",
    company: "Kinetic Labs",
    initials: "ET",
  },
];

const TRUST_BADGES = [
  { label: "SOC 2 Type II", icon: FileText },
  { label: "HIPAA Ready", icon: Shield },
  { label: "256-bit AES", icon: LockKeyhole },
];

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Work email address is required")
    .email("Enter a valid work email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

const mfaSchema = z.object({
  code: z.string().regex(/^\d{6}$/, "Enter the 6-digit verification code"),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type MfaFormValues = z.infer<typeof mfaSchema>;
type AuthStep = "credentials" | "mfa";
type LoginError =
  | "none"
  | "invalid_credentials"
  | "locked"
  | "unverified"
  | "mfa"
  | "server";
type SsoProvider = Extract<Provider, "google" | "azure">;

type LoginResponseBody = {
  success?: boolean;
  redirectTo?: unknown;
  error?: unknown;
  message?: unknown;
  mfaRequired?: boolean;
  requiresMfa?: boolean;
};

const providerLabels: Record<SsoProvider, string> = {
  google: "Google",
  azure: "Microsoft",
};

function getNextPath() {
  if (typeof window === "undefined") return "/dashboard";
  const params = new URLSearchParams(window.location.search);
  const nextPath = params.get("next") || "/dashboard";
  return nextPath.startsWith("/") ? nextPath : "/dashboard";
}

function hasExplicitNext() {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).has("next");
}

function getErrorText(error: unknown, message: unknown) {
  if (typeof error === "string" && error.length > 0) return error;
  if (typeof message === "string" && message.length > 0) return message;
  return "";
}

function isLockedError(body: LoginResponseBody, status: number) {
  const text = getErrorText(body.error, body.message).toLowerCase();
  return (
    status === 423 ||
    status === 429 ||
    text.includes("account_locked") ||
    text.includes("locked") ||
    text.includes("too many") ||
    text.includes("rate limit")
  );
}

function isUnverifiedEmailError(body: LoginResponseBody, status: number) {
  const text = getErrorText(body.error, body.message).toLowerCase();
  return (
    status === 403 ||
    text.includes("unverified") ||
    text.includes("email_not_confirmed") ||
    text.includes("email not confirmed") ||
    text.includes("verify your email")
  );
}

function isInvalidCredentialsError(body: LoginResponseBody, status: number) {
  const text = getErrorText(body.error, body.message).toLowerCase();
  return (
    status === 401 ||
    text === "invalid_credentials" ||
    text.includes("invalid credentials") ||
    text.includes("email or password")
  );
}

function CircleWorksLogo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <svg
        width="36"
        height="36"
        viewBox="0 0 36 36"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
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

function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return <Loader2 className={`${className} animate-spin`} aria-hidden="true" />;
}

function ErrorBanner({
  errorMessage,
  errorType,
  onDismiss,
  onResendVerification,
}: {
  errorMessage: string;
  errorType: LoginError;
  onDismiss: () => void;
  onResendVerification: () => void;
}) {
  if (errorType === "none") return null;

  const tone =
    errorType === "locked"
      ? "border-orange-200 bg-orange-50 text-orange-900"
      : errorType === "unverified"
        ? "border-yellow-200 bg-yellow-50 text-yellow-900"
        : "border-red-200 bg-red-50 text-red-700";

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm font-semibold ${tone}`}
    >
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        {errorType === "invalid_credentials" && "Incorrect email or password. Please try again."}
        {errorType === "locked" && (
          <>
            Account temporarily locked. Wait 15 minutes or{" "}
            <Link href="/forgot-password" className="font-bold underline underline-offset-2">
              Reset Password
            </Link>
            .
          </>
        )}
        {errorType === "unverified" && (
          <>
            Please verify your email.{" "}
            <button
              type="button"
              onClick={onResendVerification}
              className="font-bold text-yellow-950 underline underline-offset-2"
            >
              Resend verification →
            </button>
          </>
        )}
        {errorType === "mfa" && (errorMessage || "That code did not work. Try again.")}
        {errorType === "server" &&
          (errorMessage || "Internal server error. Please try again.")}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md opacity-70 transition hover:bg-black/5 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        aria-label="Dismiss error"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

export function LoginPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn, refreshUser } = useAuth();
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [step, setStep] = useState<AuthStep>("credentials");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ssoLoading, setSsoLoading] = useState<SsoProvider | null>(null);
  const [errorType, setErrorType] = useState<LoginError>("none");
  const [errorMessage, setErrorMessage] = useState("");
  const [pendingLogin, setPendingLogin] = useState<LoginFormValues | null>(null);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [resendSeconds, setResendSeconds] = useState(0);
  const [useBackupCode, setUseBackupCode] = useState(false);
  const mfaPanelRef = useRef<HTMLDivElement>(null);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  const mfaForm = useForm<MfaFormValues>({
    resolver: zodResolver(mfaSchema),
    defaultValues: { code: "" },
  });

  useEffect(() => {
    if (!isLoaded || !isSignedIn || step === "mfa") return;
    router.replace(getNextPath());
  }, [isLoaded, isSignedIn, router, step]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get("reset") === "success" || params.get("passwordUpdated") === "1") {
      toast.success("Password updated successfully! Please sign in.");
      params.delete("reset");
      params.delete("passwordUpdated");
    }

    if (params.get("error") === "oauth_failed") {
      setErrorType("server");
      setErrorMessage("SSO sign-in failed. Please try again.");
      params.delete("error");
    }

    const nextUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`;
    window.history.replaceState(null, "", nextUrl);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveTestimonial((current) => (current + 1) % TESTIMONIALS.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (step !== "mfa") return;

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
  }, [step]);

  useEffect(() => {
    if (step !== "mfa") return;
    const timer = window.setTimeout(() => otpRefs.current[0]?.focus(), 50);
    return () => window.clearTimeout(timer);
  }, [step]);

  useEffect(() => {
    if (step !== "mfa") return;

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const panel = mfaPanelRef.current;
      if (!panel) return;

      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter((element) => element.offsetParent !== null);

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [step]);

  const clearError = () => {
    setErrorType("none");
    setErrorMessage("");
  };

  const redirectAfterLogin = async (body: LoginResponseBody) => {
    await refreshUser();
    let redirectTo = getNextPath();

    if (
      !hasExplicitNext() &&
      typeof body.redirectTo === "string" &&
      body.redirectTo.startsWith("/")
    ) {
      redirectTo = body.redirectTo;
    }

    router.push(redirectTo);
  };

  const submitLogin = async (data: LoginFormValues, mfaCode?: string) => {
    setLoading(true);
    clearError();

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          rememberMe: data.rememberMe,
          ...(mfaCode ? { mfaCode } : {}),
        }),
      });

      const body = (await response.json()) as LoginResponseBody;

      if (response.ok && (body.mfaRequired || body.requiresMfa)) {
        setPendingLogin(data);
        setStep("mfa");
        setOtpDigits(["", "", "", "", "", ""]);
        setUseBackupCode(false);
        mfaForm.reset({ code: "" });
        return;
      }

      if (response.ok) {
        setPendingLogin(null);
        await redirectAfterLogin(body);
        return;
      }

      if (isLockedError(body, response.status)) {
        setErrorType("locked");
      } else if (isUnverifiedEmailError(body, response.status)) {
        setErrorType("unverified");
      } else if (mfaCode && isInvalidCredentialsError(body, response.status)) {
        setErrorType("mfa");
        setErrorMessage("That code did not work. Try again.");
      } else if (isInvalidCredentialsError(body, response.status)) {
        setErrorType("invalid_credentials");
      } else {
        setErrorMessage(
          getErrorText(body.error, body.message) || "Internal server error. Please try again."
        );
        setErrorType("server");
      }
    } catch {
      setErrorMessage("Network error. Please check your connection and try again.");
      setErrorType("server");
    } finally {
      setLoading(false);
    }
  };

  const handleSsoLogin = async (provider: SsoProvider) => {
    setSsoLoading(provider);
    clearError();

    const supabase = createSupabaseBrowserClient();
    const callbackUrl = new URL("/auth/callback", window.location.origin);

    if (hasExplicitNext()) {
      callbackUrl.searchParams.set("next", getNextPath());
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: callbackUrl.toString(),
      },
    });

    if (error) {
      setErrorMessage(
        error.message || `${providerLabels[provider]} sign-in failed. Please try again.`
      );
      setErrorType("server");
      setSsoLoading(null);
    }
  };

  const onLoginSubmit = (data: LoginFormValues) => {
    setPendingLogin(data);
    void submitLogin(data);
  };

  const onMfaSubmit = (data: MfaFormValues) => {
    if (!pendingLogin) {
      setStep("credentials");
      setErrorMessage("Your sign-in session expired. Please enter your password again.");
      setErrorType("server");
      return;
    }

    void submitLogin(pendingLogin, data.code);
  };

  const syncOtpDigits = (nextDigits: string[]) => {
    setOtpDigits(nextDigits);
    mfaForm.setValue("code", nextDigits.join(""), {
      shouldDirty: true,
      shouldValidate: false,
    });
    if (errorType === "mfa") clearError();
  };

  const handleOtpChange = (index: number, value: string) => {
    const digits = value.replace(/\D/g, "");
    const nextDigits = [...otpDigits];

    if (!digits) {
      nextDigits[index] = "";
      syncOtpDigits(nextDigits);
      return;
    }

    digits
      .slice(0, 6 - index)
      .split("")
      .forEach((digit, offset) => {
        nextDigits[index + offset] = digit;
      });

    syncOtpDigits(nextDigits);
    const nextIndex = Math.min(index + digits.length, 5);
    otpRefs.current[nextIndex]?.focus();
  };

  const handleOtpKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !otpDigits[index] && index > 0) {
      const nextDigits = [...otpDigits];
      nextDigits[index - 1] = "";
      syncOtpDigits(nextDigits);
      otpRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      otpRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowRight" && index < 5) {
      event.preventDefault();
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const pastedDigits = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pastedDigits) return;

    event.preventDefault();
    const nextDigits = ["", "", "", "", "", ""];
    pastedDigits.split("").forEach((digit, index) => {
      nextDigits[index] = digit;
    });
    syncOtpDigits(nextDigits);
    otpRefs.current[Math.min(pastedDigits.length, 6) - 1]?.focus();
  };

  const goBackToCredentials = () => {
    setStep("credentials");
    setPendingLogin(null);
    setOtpDigits(["", "", "", "", "", ""]);
    setUseBackupCode(false);
    mfaForm.reset({ code: "" });
    clearError();
  };

  const handleResendCode = () => {
    if (resendSeconds > 0) return;
    setResendSeconds(60);
    toast.success("Verification code resent.");
  };

  const handleResendVerification = () => {
    toast.success("Verification email resent.");
  };

  const testimonial = TESTIMONIALS[activeTestimonial];

  return (
    <main
      id="main-content"
      className="flex min-h-screen bg-white text-slate-950 selection:bg-blue-200"
    >
      <section
        aria-label="CircleWorks"
        className="relative hidden w-1/2 overflow-hidden bg-[#0A1628] text-white lg:flex lg:flex-col lg:justify-between"
      >
        <div className="flex h-full flex-col justify-between p-12 xl:p-16">
          <div>
            <Link
              href="/"
              className="inline-flex rounded-lg text-white outline-none transition-colors hover:text-blue-200 focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A1628]"
            >
              <CircleWorksLogo />
              <span className="sr-only">Home</span>
            </Link>
            <h1 className="mt-10 max-w-md text-4xl font-bold leading-tight text-white">
              Payroll & HR. Simplified for America.
            </h1>
          </div>

          <div className="max-w-xl">
            <div className="relative min-h-52">
              <AnimatePresence mode="wait">
                <motion.figure
                  key={testimonial.name}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35 }}
                  className="absolute inset-0 flex flex-col justify-end"
                >
                  <blockquote className="text-lg font-medium leading-8 text-white">
                    &ldquo;{testimonial.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-6 flex items-center gap-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white">
                      {testimonial.initials}
                    </span>
                    <span>
                      <span className="block text-sm font-bold text-white">
                        {testimonial.name}
                      </span>
                      <span className="block text-sm text-blue-100">
                        {testimonial.company}
                      </span>
                    </span>
                  </figcaption>
                </motion.figure>
              </AnimatePresence>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {TRUST_BADGES.map(({ label, icon: Icon }) => (
              <div
                key={label}
                className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/[0.03] px-3 py-2 text-sm font-semibold text-white"
              >
                <Icon className="h-4 w-4 text-white" aria-hidden="true" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex min-h-screen min-w-0 w-full flex-col justify-center overflow-x-hidden bg-white px-5 py-10 sm:px-8 lg:w-1/2 lg:px-14 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          {step === "credentials" ? (
            <>
              <header className="mb-7">
                <h2 className="text-[32px] font-bold leading-tight text-[#0A1628]">
                  Welcome back
                </h2>
                <p className="mt-2 text-base font-medium text-slate-500">
                  Sign in to CircleWorks
                </p>
              </header>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => void handleSsoLogin("google")}
                  disabled={loading || ssoLoading !== null}
                  className="flex h-11 w-full items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white px-4 text-base font-semibold text-slate-800 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {ssoLoading === "google" ? <Spinner /> : <GoogleLogo />}
                  Continue with Google
                </button>

                <button
                  type="button"
                  onClick={() => void handleSsoLogin("azure")}
                  disabled={loading || ssoLoading !== null}
                  className="flex h-11 w-full items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white px-4 text-base font-semibold text-slate-800 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {ssoLoading === "azure" ? <Spinner /> : <MicrosoftLogo />}
                  Continue with Microsoft
                </button>
              </div>

              <div className="my-6 flex items-center gap-3 text-sm font-semibold text-slate-400">
                <span className="h-px flex-1 bg-slate-200" />
                <span>— or sign in with email —</span>
                <span className="h-px flex-1 bg-slate-200" />
              </div>

              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} noValidate className="space-y-5">
                <div>
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      autoFocus
                      placeholder=" "
                      aria-invalid={Boolean(loginForm.formState.errors.email)}
                      aria-describedby={
                        loginForm.formState.errors.email ? "email-error" : undefined
                      }
                      {...loginForm.register("email")}
                      className={`peer h-14 w-full rounded-lg border bg-white px-4 pb-2 pt-6 text-base text-slate-950 outline-none transition-colors placeholder:text-transparent focus:border-blue-600 focus:ring-2 focus:ring-blue-100 ${
                        loginForm.formState.errors.email
                          ? "border-red-500"
                          : "border-slate-300"
                      }`}
                    />
                    <label
                      htmlFor="email"
                      className={`pointer-events-none absolute left-4 top-2 text-xs font-semibold transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:font-medium peer-focus:top-2 peer-focus:text-xs peer-focus:font-semibold ${
                        loginForm.formState.errors.email
                          ? "text-red-600"
                          : "text-slate-500 peer-focus:text-blue-700"
                      }`}
                    >
                      Work email address
                    </label>
                  </div>
                  {loginForm.formState.errors.email && (
                    <p
                      id="email-error"
                      role="alert"
                      className="mt-2 text-sm font-medium text-red-600"
                    >
                      {loginForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder=" "
                      aria-invalid={Boolean(loginForm.formState.errors.password)}
                      aria-describedby={
                        loginForm.formState.errors.password ? "password-error" : undefined
                      }
                      {...loginForm.register("password")}
                      className={`peer h-14 w-full rounded-lg border bg-white px-4 pb-2 pt-6 pr-12 text-base text-slate-950 outline-none transition-colors placeholder:text-transparent focus:border-blue-600 focus:ring-2 focus:ring-blue-100 ${
                        loginForm.formState.errors.password
                          ? "border-red-500"
                          : "border-slate-300"
                      }`}
                    />
                    <label
                      htmlFor="password"
                      className={`pointer-events-none absolute left-4 top-2 text-xs font-semibold transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:font-medium peer-focus:top-2 peer-focus:text-xs peer-focus:font-semibold ${
                        loginForm.formState.errors.password
                          ? "text-red-600"
                          : "text-slate-500 peer-focus:text-blue-700"
                      }`}
                    >
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword((visible) => !visible)}
                      title={showPassword ? "Hide password" : "Show password"}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" aria-hidden="true" />
                      ) : (
                        <Eye className="h-5 w-5" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                  {loginForm.formState.errors.password && (
                    <p
                      id="password-error"
                      role="alert"
                      className="mt-2 text-sm font-medium text-red-600"
                    >
                      {loginForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between gap-4">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <input
                      type="checkbox"
                      {...loginForm.register("rememberMe")}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                    />
                    Remember me
                  </label>

                  <Link
                    href="/forgot-password"
                    className="text-sm font-bold text-blue-600 hover:text-blue-800 hover:underline focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                  >
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading || ssoLoading !== null}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-bold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <Spinner />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </button>

                <ErrorBanner
                  errorMessage={errorMessage}
                  errorType={errorType}
                  onDismiss={clearError}
                  onResendVerification={handleResendVerification}
                />
              </form>

              <p className="mt-8 text-center text-sm font-medium text-slate-500">
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="font-bold text-blue-700 hover:text-blue-800 hover:underline focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  Start free →
                </Link>
              </p>
            </>
          ) : (
            <div ref={mfaPanelRef}>
              <header className="mb-7">
                <h2 className="text-[32px] font-bold leading-tight text-[#0A1628]">
                  Two-factor authentication
                </h2>
                <p className="mt-2 text-base font-medium leading-7 text-slate-500">
                  Enter the 6-digit code from your authenticator app (or sent via SMS).
                </p>
              </header>

              <form onSubmit={mfaForm.handleSubmit(onMfaSubmit)} noValidate className="space-y-5">
                <div>
                  <label className="mb-3 block text-sm font-bold text-slate-800">
                    {useBackupCode ? "Backup code" : "Authentication code"}
                  </label>
                  <input type="hidden" {...mfaForm.register("code")} />
                  <div className="grid grid-cols-6 gap-2">
                    {otpDigits.map((digit, index) => (
                      <input
                        key={index}
                        ref={(node) => {
                          otpRefs.current[index] = node;
                        }}
                        type="text"
                        inputMode="numeric"
                        autoComplete={index === 0 ? "one-time-code" : "off"}
                        maxLength={1}
                        value={digit}
                        onChange={(event) => handleOtpChange(index, event.target.value)}
                        onKeyDown={(event) => handleOtpKeyDown(index, event)}
                        onPaste={handleOtpPaste}
                        aria-label={`Digit ${index + 1}`}
                        aria-invalid={Boolean(mfaForm.formState.errors.code)}
                        className={`h-12 rounded-lg border bg-white text-center text-xl font-bold text-slate-950 outline-none transition-colors focus:border-blue-600 focus:ring-2 focus:ring-blue-100 ${
                          mfaForm.formState.errors.code ? "border-red-500" : "border-slate-300"
                        }`}
                      />
                    ))}
                  </div>
                  {mfaForm.formState.errors.code && (
                    <p
                      id="mfa-code-error"
                      role="alert"
                      className="mt-2 text-sm font-medium text-red-600"
                    >
                      {mfaForm.formState.errors.code.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-bold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <Spinner />
                      Verifying...
                    </>
                  ) : (
                    "Verify code"
                  )}
                </button>

                <ErrorBanner
                  errorMessage={errorMessage}
                  errorType={errorType}
                  onDismiss={clearError}
                  onResendVerification={handleResendVerification}
                />
              </form>

              <div className="mt-5 flex flex-col items-center gap-3 text-sm font-bold">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendSeconds > 0}
                  className="text-blue-600 transition-colors hover:text-blue-800 hover:underline disabled:cursor-not-allowed disabled:text-slate-400 disabled:no-underline"
                >
                  {resendSeconds > 0 ? `Resend code in ${resendSeconds}s` : "Resend code"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setUseBackupCode((current) => !current);
                    setOtpDigits(["", "", "", "", "", ""]);
                    mfaForm.reset({ code: "" });
                    otpRefs.current[0]?.focus();
                  }}
                  className="text-slate-500 transition-colors hover:text-slate-900 hover:underline"
                >
                  Use backup code
                </button>

                <button
                  type="button"
                  onClick={goBackToCredentials}
                  className="text-slate-500 transition-colors hover:text-slate-900 hover:underline focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  ← Back to login
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default LoginPage;
