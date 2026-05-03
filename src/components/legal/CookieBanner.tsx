"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Shield, Cookie, Settings } from "lucide-react";
import { usePathname } from "next/navigation";


interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
}

type InteractedValue = "all" | "rejected" | "custom" | null;

export default function CookieBanner() {
  const pathname = usePathname();
  const [hasInteracted, setHasInteracted] = useState<InteractedValue>(null);
  const [showPreferences, setShowPreferences] = useState(false);

  
  // Custom toggles
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always required
    analytics: false,
    marketing: false,
    personalization: false,
  });

  useEffect(() => {
    const saved = localStorage.getItem("circleworks_consent");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setHasInteracted(parsed.mode);
        if (parsed.mode === "custom") {
          setPreferences(parsed.preferences || { necessary: true, analytics: false, marketing: false, personalization: false });
        }
      } catch (e) {
        setHasInteracted(null);
      }
    }
  }, []);

  const saveConsent = async (mode: InteractedValue, prefs = { analytics: false, marketing: false, personalization: false }) => {
    const payload = {
      mode,
      preferences: mode === "all" ? { necessary: true, analytics: true, marketing: true, personalization: true } : { necessary: true, ...prefs }
    };
    
    // Save locally
    localStorage.setItem("circleworks_consent", JSON.stringify(payload));
    setHasInteracted(mode);
    setShowPreferences(false);

    // Guest Mode: Skipping sync to backend API
    console.log("Consent saved locally:", payload);

  };

  const handleAcceptAll = () => {
    saveConsent("all");
  };

  const handleRejectAll = () => {
    saveConsent("rejected");
  };

  const handleSavePreferences = () => {
    saveConsent("custom", preferences);
  };

  const handlePreferenceChange = (category: keyof CookiePreferences, value: boolean) => {
    if (category === 'necessary') return; // Necessary cookies can't be disabled
    setPreferences(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const isAuthPage = ["/login", "/signup", "/forgot-password", "/reset-password"].some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  if (hasInteracted || isAuthPage) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-2xl"
      >
        {!showPreferences ? (
          // Simple banner view
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="flex-shrink-0 mt-1">
                  <Cookie className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                    We use cookies
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    We use cookies to improve your experience, personalize content, target advertising, and analyze traffic. 
                    By clicking "Accept all", you consent to our use of cookies.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-2 flex-shrink-0">
                <button
                  onClick={handleRejectAll}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Reject all
                </button>
                <button
                  onClick={() => setShowPreferences(true)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
                >
                  <Settings size={14} />
                  Manage preferences
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
                >
                  Accept all
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Expanded preferences view
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <Cookie className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                    Cookie Preferences
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Manage your cookie preferences below. You can change these settings at any time.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPreferences(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {/* Necessary Cookies */}
              <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                <Shield className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-slate-900 dark:text-white">Essential Cookies</h4>
                    <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6"></span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    These cookies are necessary for the website to function and cannot be switched off.
                  </p>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="flex items-start gap-3 p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="w-5 h-5 mt-0.5 flex-shrink-0">
                  <div className="w-full h-full rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-amber-600 dark:bg-amber-400"></div>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-slate-900 dark:text-white">Analytics Cookies</h4>
                    <button
                      onClick={() => handlePreferenceChange('analytics', !preferences.analytics)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        preferences.analytics ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        preferences.analytics ? 'translate-x-6' : 'translate-x-1'
                      }`}></span>
                    </button>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    These cookies allow us to analyze website traffic and usage patterns to improve the user experience.
                  </p>
                </div>
              </div>

              {/* Marketing Cookies */}
              <div className="flex items-start gap-3 p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="w-5 h-5 mt-0.5 flex-shrink-0">
                  <div className="w-full h-full rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-purple-600 dark:bg-purple-400"></div>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-slate-900 dark:text-white">Marketing Cookies</h4>
                    <button
                      onClick={() => handlePreferenceChange('marketing', !preferences.marketing)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        preferences.marketing ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        preferences.marketing ? 'translate-x-6' : 'translate-x-1'
                      }`}></span>
                    </button>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    These cookies are used to deliver advertisements that are relevant to you and your interests.
                  </p>
                </div>
              </div>

              {/* Personalization Cookies */}
              <div className="flex items-start gap-3 p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="w-5 h-5 mt-0.5 flex-shrink-0">
                  <div className="w-full h-full rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400"></div>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-slate-900 dark:text-white">Personalization Cookies</h4>
                    <button
                      onClick={() => handlePreferenceChange('personalization', !preferences.personalization)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        preferences.personalization ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        preferences.personalization ? 'translate-x-6' : 'translate-x-1'
                      }`}></span>
                    </button>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    These cookies allow the website to remember choices you make and provide enhanced, more personalized features.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={handleRejectAll}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Reject all
              </button>
              <button
                onClick={handleSavePreferences}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
              >
                Save preferences
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
