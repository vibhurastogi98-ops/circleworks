"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Building2,
  CheckCircle,
  FileCheck,
  Globe,
  Lock,
  ShieldCheck,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type CookiePreferences = {
  strictlyNecessary: true;
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
};

type NewsletterState = "idle" | "loading" | "success" | "error";

const CONSENT_PREFERENCES_KEY = "consentPreferences";
const COOKIE_BANNER_KEY = "circleworks_consent";

const FOOTER_LINKS = {
  product: [
    { label: "Payroll", href: "/product/payroll" },
    { label: "HRIS", href: "/product/hris" },
    { label: "ATS", href: "/product/ats" },
    { label: "Benefits", href: "/product/benefits" },
    { label: "Time", href: "/product/time" },
    { label: "Expenses", href: "/product/expenses" },
    { label: "Performance", href: "/product/performance" },
    { label: "Compliance", href: "/product/compliance" },
    { label: "Analytics", href: "/product/analytics" },
  ],
  resources: [
    { label: "Blog", href: "/blog" },
    { label: "HR Guides", href: "/guides" },
    { label: "Glossary", href: "/blog/labor-law-dictionary" },
    { label: "Webinars", href: "/webinars" },
    { label: "Templates", href: "/templates" },
    { label: "Changelog", href: "/changelog" },
    { label: "Status", href: "/status" },
    { label: "API Docs", href: "/docs" },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "Careers", href: "/careers", badge: "Hiring" },
    { label: "Press", href: "/press" },
    { label: "Partners", href: "/partners" },
    { label: "Security", href: "/security" },
    { label: "Trust Center", href: "/trust" },
  ],
  support: [
    { label: "Help Center", href: "/help" },
    { label: "Contact", href: "/contact" },
    { label: "Demo", href: "/demo" },
    { label: "Pricing", href: "/pricing" },
    { label: "Community", href: "/community" },
    { label: "Accountant Portal", href: "/accountant-portal" },
  ],
};

const TRUST_BADGES = [
  { label: "SOC 2 Type II", icon: ShieldCheck },
  { label: "HIPAA", icon: Lock },
  { label: "GDPR", icon: Globe },
  { label: "CCPA", icon: FileCheck },
  { label: "E-Verify", icon: CheckCircle },
  { label: "BBB Accredited", icon: Building2 },
];

function LinkedInIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4 4l16 16" />
      <path d="M20 4 4 20" />
    </svg>
  );
}

function YouTubeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M2.5 7.1s-.2-1.7.6-2.5c.9-.9 2-.9 2.5-1 3.2-.2 6.4-.2 6.4-.2s3.2 0 6.4.2c.5.1 1.6.1 2.5 1 .8.8 1 2.5 1 2.5s.2 2 .2 4v1.8c0 2-.2 4-.2 4s-.2 1.7-1 2.5c-.9.9-2.1.9-2.6 1-2.8.2-6.5.2-6.5.2s-3.2 0-6.4-.2c-.5-.1-1.6-.1-2.5-1-.8-.8-1-2.5-1-2.5s-.2-2-.2-4V9.1c0-2 .2-4 .2-4z" />
      <path d="M9.6 15.4 15.8 12 9.6 8.6v6.8z" />
    </svg>
  );
}

function GitHubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

const SOCIAL_LINKS = [
  {
    label: "LinkedIn",
    href: "https://linkedin.com/company/circleworks",
    icon: LinkedInIcon,
  },
  {
    label: "Twitter/X",
    href: "https://twitter.com/circleworks",
    icon: XIcon,
  },
  {
    label: "YouTube",
    href: "https://youtube.com/@circleworks",
    icon: YouTubeIcon,
  },
  {
    label: "GitHub",
    href: "https://github.com/circleworks",
    icon: GitHubIcon,
  },
];

const defaultPreferences: CookiePreferences = {
  strictlyNecessary: true,
  analytics: true,
  marketing: false,
  personalization: false,
};

const cookieCategories: Array<{
  key: keyof CookiePreferences;
  name: string;
  description: string;
  locked?: boolean;
}> = [
  {
    key: "strictlyNecessary",
    name: "Strictly Necessary",
    description:
      "Required for security, login, consent records, payroll workflows, and core site functionality.",
    locked: true,
  },
  {
    key: "analytics",
    name: "Analytics",
    description:
      "Helps us understand aggregate site usage and improve content, onboarding, and product pages.",
  },
  {
    key: "marketing",
    name: "Marketing",
    description:
      "Helps measure campaign performance, attribution, and relevant product communications.",
  },
  {
    key: "personalization",
    name: "Personalization",
    description:
      "Remembers non-essential preferences like display choices and tailored resource recommendations.",
  },
];

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function readPreferences(): CookiePreferences {
  if (typeof window === "undefined") return defaultPreferences;

  const saved = window.localStorage.getItem(CONSENT_PREFERENCES_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved) as Partial<CookiePreferences>;
      return {
        strictlyNecessary: true,
        analytics: Boolean(parsed.analytics),
        marketing: Boolean(parsed.marketing),
        personalization: Boolean(parsed.personalization),
      };
    } catch {
      return defaultPreferences;
    }
  }

  const bannerConsent = window.localStorage.getItem(COOKIE_BANNER_KEY);
  if (bannerConsent) {
    try {
      const parsed = JSON.parse(bannerConsent) as {
        preferences?: {
          analytics?: boolean;
          marketing?: boolean;
          personalization?: boolean;
        };
      };
      return {
        strictlyNecessary: true,
        analytics: parsed.preferences?.analytics ?? defaultPreferences.analytics,
        marketing: parsed.preferences?.marketing ?? defaultPreferences.marketing,
        personalization:
          parsed.preferences?.personalization ?? defaultPreferences.personalization,
      };
    } catch {
      return defaultPreferences;
    }
  }

  return defaultPreferences;
}

function ToggleSwitch({
  checked,
  disabled,
  onChange,
  label,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      className={`relative h-7 w-12 shrink-0 rounded-full transition ${
        checked ? "bg-blue-600" : "bg-slate-300"
      } ${disabled ? "cursor-not-allowed opacity-80" : "hover:brightness-105"}`}
      aria-label={label}
      aria-pressed={checked}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
          checked ? "left-6" : "left-1"
        }`}
      />
    </button>
  );
}

function CookiePreferencesDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);

  useEffect(() => {
    if (open) {
      setPreferences(readPreferences());
    }
  }, [open]);

  const savePreferences = (nextPreferences: CookiePreferences) => {
    const payload = {
      ...nextPreferences,
      strictlyNecessary: true,
      savedAt: new Date().toISOString(),
      version: 1,
    };
    const bannerPayload = {
      mode:
        nextPreferences.analytics ||
        nextPreferences.marketing ||
        nextPreferences.personalization
          ? "custom"
          : "reject-non-essential",
      preferences: {
        essential: true,
        analytics: nextPreferences.analytics,
        marketing: nextPreferences.marketing,
        personalization: nextPreferences.personalization,
      },
      ccpaOptOut:
        !nextPreferences.analytics ||
        !nextPreferences.marketing ||
        !nextPreferences.personalization,
      savedAt: payload.savedAt,
      version: 1,
    };

    window.localStorage.setItem(CONSENT_PREFERENCES_KEY, JSON.stringify(payload));
    window.localStorage.setItem(COOKIE_BANNER_KEY, JSON.stringify(bannerPayload));
    window.dispatchEvent(
      new CustomEvent("consent_updated", {
        detail: payload,
      }),
    );
    onOpenChange(false);
  };

  const rejectAll = () => {
    const rejected: CookiePreferences = {
      strictlyNecessary: true,
      analytics: false,
      marketing: false,
      personalization: false,
    };
    setPreferences(rejected);
    savePreferences(rejected);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} contentClassName="max-w-2xl">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cookie Preferences</DialogTitle>
          <DialogDescription>
            We use cookies to improve your experience. Choose which types you allow.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 p-6">
          {cookieCategories.map((category) => {
            const enabled = preferences[category.key];
            return (
              <div
                key={category.key}
                className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div>
                  <p className="font-black text-slate-950">
                    {category.name}
                    {category.locked && (
                      <span className="ml-2 text-xs text-slate-500">(always on)</span>
                    )}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {category.description}
                  </p>
                </div>
                <ToggleSwitch
                  checked={enabled}
                  disabled={category.locked}
                  label={`${category.name} cookies`}
                  onChange={() =>
                    setPreferences((current) => ({
                      ...current,
                      [category.key]: !current[category.key],
                      strictlyNecessary: true,
                    }))
                  }
                />
              </div>
            );
          })}
        </div>

        <DialogFooter className="flex-col-reverse sm:flex-row">
          <button
            type="button"
            onClick={rejectAll}
            className="rounded-full px-5 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-100"
          >
            Reject All
          </button>
          <button
            type="button"
            onClick={() => savePreferences(preferences)}
            className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-black text-white transition hover:bg-blue-700"
          >
            Save Preferences
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function SiteFooter() {
  const [cookieDialogOpen, setCookieDialogOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [newsletterState, setNewsletterState] = useState<NewsletterState>("idle");
  const [newsletterError, setNewsletterError] = useState("");
  const lastSubmitAt = useRef(0);

  const subscribe = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    const now = Date.now();
    if (now - lastSubmitAt.current < 1000 || newsletterState === "loading") return;
    lastSubmitAt.current = now;

    if (!isValidEmail(normalizedEmail)) {
      setNewsletterState("error");
      setNewsletterError("Please enter a valid work email.");
      return;
    }

    setNewsletterState("loading");
    setNewsletterError("");

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, source: "footer" }),
      });

      if (!response.ok) {
        throw new Error("Unable to subscribe");
      }

      setNewsletterState("success");
      setEmail("");
    } catch {
      setNewsletterState("error");
      setNewsletterError("Something went wrong. Try again.");
    }
  };

  return (
    <footer className="border-t border-slate-700 bg-[#0A1628] pb-8 pt-16 text-slate-400">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-8">
        <div className="mb-16 flex flex-col items-start justify-between gap-8 border-b border-slate-700 pb-12 lg:flex-row lg:items-center">
          <div className="flex flex-col gap-3">
            <Link href="/" className="inline-flex cursor-pointer items-center gap-2 group">
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="16" cy="16" r="14" stroke="white" strokeWidth="3" />
                <path
                  d="M16 8C11.5817 8 8 11.5817 8 16C8 20.4183 11.5817 24 16 24"
                  stroke="#3B82F6"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
              <span className="text-[22px] font-bold tracking-tight text-white">
                Circle<span className="text-blue-500">Works</span>
              </span>
            </Link>
            <p className="text-[15px] font-medium text-slate-400">
              Payroll & HR. Simplified for America.
            </p>
          </div>

          <form
            onSubmit={subscribe}
            className="flex w-full flex-col gap-3 lg:w-auto sm:flex-row"
            noValidate
          >
            {newsletterState === "success" ? (
              <div className="flex min-h-12 items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-black text-emerald-300 sm:w-[430px]">
                <CheckCircle className="h-5 w-5" />
                You&apos;re subscribed! Check your inbox.
              </div>
            ) : (
              <>
                <div className="w-full sm:w-[300px]">
                  <label htmlFor="footer-newsletter-email" className="sr-only">
                    Work email
                  </label>
                  <input
                    id="footer-newsletter-email"
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      if (newsletterState === "error") {
                        setNewsletterState("idle");
                        setNewsletterError("");
                      }
                    }}
                    placeholder="Enter your work email"
                    className="w-full rounded-lg border border-slate-700/80 bg-[#0F1C2E] px-4 py-3 text-white placeholder-slate-500 transition-all focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    aria-invalid={newsletterState === "error"}
                    aria-describedby={
                      newsletterState === "error" ? "footer-newsletter-error" : undefined
                    }
                  />
                  {newsletterState === "error" && (
                    <p id="footer-newsletter-error" className="mt-2 text-sm font-bold text-red-400">
                      {newsletterError}
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={newsletterState === "loading"}
                  className="whitespace-nowrap rounded-lg bg-blue-600 px-6 py-3 font-bold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {newsletterState === "loading" ? "Subscribing..." : "Get HR Insights Free"}
                </button>
              </>
            )}
          </form>
        </div>

        <div className="mb-16 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-4">
            <h3 className="mb-2 text-[13px] font-bold uppercase tracking-widest text-white">
              Product
            </h3>
            <ul className="flex flex-col gap-3">
              {FOOTER_LINKS.product.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[15px] text-slate-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="mb-2 text-[13px] font-bold uppercase tracking-widest text-white">
              Resources
            </h3>
            <ul className="flex flex-col gap-3">
              {FOOTER_LINKS.resources.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[15px] text-slate-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="mb-2 text-[13px] font-bold uppercase tracking-widest text-white">
              Company
            </h3>
            <ul className="flex flex-col gap-3">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-2 text-[15px] text-slate-400 transition-colors hover:text-white"
                  >
                    {link.label}
                    {link.badge && (
                      <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="mb-2 text-[13px] font-bold uppercase tracking-widest text-white">
              Support
            </h3>
            <ul className="flex flex-col gap-3">
              {FOOTER_LINKS.support.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[15px] text-slate-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mb-16 flex flex-wrap items-center justify-center gap-4 opacity-70 sm:gap-6 lg:justify-start">
          {TRUST_BADGES.map((badge) => (
            <div
              key={badge.label}
              className="flex cursor-default items-center gap-2 text-white/90 transition-colors hover:text-white"
            >
              <badge.icon size={18} />
              <span className="text-[13px] font-bold tracking-wide">
                {badge.label}
              </span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-6 border-t border-slate-700 pt-8">
          <div className="flex flex-col items-center justify-between gap-6 lg:flex-row">
            <div className="flex flex-wrap items-center justify-center gap-3 text-[13px] font-medium lg:justify-start sm:gap-4">
              <span>&copy; 2026 CircleWorks Inc.</span>
              <span className="hidden text-slate-600 sm:inline">&middot;</span>
              <Link href="/legal/privacy" className="transition-colors hover:text-white">
                Privacy
              </Link>
              <span className="hidden text-slate-600 sm:inline">&middot;</span>
              <Link href="/legal/terms" className="transition-colors hover:text-white">
                Terms
              </Link>
              <span className="hidden text-slate-600 sm:inline">&middot;</span>
              <button
                type="button"
                onClick={() => setCookieDialogOpen(true)}
                className="transition-colors hover:text-white"
              >
                Cookie Settings
              </button>
            </div>

            <div className="flex items-center gap-4">
              {SOCIAL_LINKS.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-400 transition hover:text-white"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </div>

          <div className="text-center text-[11px] text-slate-500 lg:text-left">
            CircleWorks is not a law firm. Information provided is for
            educational purposes only.
          </div>
        </div>
      </div>

      <CookiePreferencesDialog
        open={cookieDialogOpen}
        onOpenChange={setCookieDialogOpen}
      />
    </footer>
  );
}

export default SiteFooter;
