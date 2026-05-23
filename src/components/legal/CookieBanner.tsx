"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Cookie, ShieldCheck, X } from "lucide-react";

interface CookiePreferences {
  essential: true;
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
}

type ConsentMode = "all" | "reject-non-essential" | "custom";

interface ConsentPayload {
  mode: ConsentMode;
  preferences: CookiePreferences;
  ccpaOptOut: boolean;
  savedAt: string;
  version: 1;
}

const STORAGE_KEY = "circleworks_consent";

const defaultPreferences: CookiePreferences = {
  essential: true,
  analytics: false,
  marketing: false,
  personalization: false,
};

const allPreferences: CookiePreferences = {
  essential: true,
  analytics: true,
  marketing: true,
  personalization: true,
};

const categories: Array<{
  key: keyof CookiePreferences;
  label: string;
  description: string;
  locked?: boolean;
}> = [
  {
    key: "essential",
    label: "Essential",
    description: "Required for security, login, consent records, and core site functionality.",
    locked: true,
  },
  {
    key: "analytics",
    label: "Analytics",
    description: "Helps us understand aggregate site usage and improve product pages.",
  },
  {
    key: "marketing",
    label: "Marketing",
    description: "Helps measure campaign performance and referral attribution where permitted.",
  },
  {
    key: "personalization",
    label: "Personalization",
    description: "Remembers display choices and similar non-essential preferences.",
  },
];

const isNonEssentialOptOut = (preferences: CookiePreferences) =>
  !preferences.analytics || !preferences.marketing || !preferences.personalization;

async function syncConsent(payload: ConsentPayload) {
  try {
    await fetch("/api/cookie-consent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch {
    // Local consent is the source of truth for the client experience.
  }
}

export default function CookieBanner() {
  const [isReady, setIsReady] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    setIsVisible(!saved);
    setIsReady(true);
  }, []);

  const saveConsent = (mode: ConsentMode, nextPreferences: CookiePreferences) => {
    const payload: ConsentPayload = {
      mode,
      preferences: nextPreferences,
      ccpaOptOut: mode === "reject-non-essential" || isNonEssentialOptOut(nextPreferences),
      savedAt: new Date().toISOString(),
      version: 1,
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    setIsVisible(false);
    setShowPreferences(false);
    void syncConsent(payload);
  };

  const handleAcceptAll = () => saveConsent("all", allPreferences);
  const handleRejectNonEssential = () => saveConsent("reject-non-essential", defaultPreferences);
  const handleSavePreferences = () => saveConsent("custom", preferences);

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === "essential") {
      return;
    }

    setPreferences((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  if (!isReady || !isVisible) {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed inset-x-0 bottom-0 z-[80] border-t border-white/10 bg-[#0A1628] px-4 py-4 text-white shadow-[0_-20px_60px_rgba(0,0,0,0.28)] print:hidden"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex max-w-3xl gap-3">
              <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-300">
                <Cookie className="h-5 w-5" />
              </div>
              <div>
                <p className="text-base font-black">We use cookies to improve your experience.</p>
                <p className="mt-1 text-sm leading-6 text-slate-300">
                  Read our{" "}
                  <Link href="/cookies" className="font-bold text-blue-300 underline-offset-4 hover:underline">
                    Cookie Policy
                  </Link>
                  . You can accept all cookies, reject non-essential cookies, or manage preferences.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={handleAcceptAll}
                className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-black text-white transition hover:bg-blue-500"
              >
                Accept All
              </button>
              <button
                type="button"
                onClick={() => setShowPreferences(true)}
                className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-black text-white transition hover:bg-white/10"
              >
                Manage Preferences
              </button>
              <button
                type="button"
                onClick={handleRejectNonEssential}
                className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-black text-white transition hover:bg-white/10"
              >
                Reject Non-Essential
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {showPreferences && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] grid place-items-center bg-slate-950/60 px-4 backdrop-blur-sm print:hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-preferences-title"
          >
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-white/10 bg-white p-6 shadow-2xl"
            >
              <div className="flex items-start justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-blue-700">
                    <ShieldCheck className="h-4 w-4" />
                    CCPA opt-out model
                  </div>
                  <h2 id="cookie-preferences-title" className="mt-4 text-2xl font-black tracking-tight text-slate-950">
                    Cookie Preferences
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Essential cookies stay on. Optional categories can be turned off, and that opt-out is saved for
                    California privacy compliance.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPreferences(false)}
                  className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Close cookie preferences"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-6 space-y-3">
                {categories.map((category) => {
                  const enabled = preferences[category.key];

                  return (
                    <div
                      key={category.key}
                      className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div>
                        <p className="font-black text-slate-950">
                          {category.label}
                          {category.locked && <span className="ml-2 text-xs text-slate-500">(locked ON)</span>}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-slate-600">{category.description}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => togglePreference(category.key)}
                        disabled={category.locked}
                        className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                          enabled ? "bg-blue-600" : "bg-slate-300"
                        } ${category.locked ? "cursor-not-allowed opacity-80" : "hover:brightness-105"}`}
                        aria-pressed={enabled}
                      >
                        <span
                          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
                            enabled ? "left-6" : "left-1"
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleRejectNonEssential}
                  className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                >
                  Reject Non-Essential
                </button>
                <button
                  type="button"
                  onClick={handleSavePreferences}
                  className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-black text-white transition hover:bg-blue-500"
                >
                  Save Preferences
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
