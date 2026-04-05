"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Cookie as CookieIcon, ShieldCheck, Activity, Target, Palette } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";

type InteractedValue = "all" | "rejected" | "custom" | null;

export default function CookieBanner() {
  const [hasInteracted, setHasInteracted] = useState<InteractedValue>(null);
  const [showPreferences, setShowPreferences] = useState(false);
  const { getToken } = useAuth();
  
  // Custom toggles
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [personalization, setPersonalization] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("circleworks_consent");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setHasInteracted(parsed.mode);
        if (parsed.mode === "custom") {
          setAnalytics(parsed.preferences?.analytics || false);
          setMarketing(parsed.preferences?.marketing || false);
          setPersonalization(parsed.preferences?.personalization || false);
        }
      } catch (e) {
        setHasInteracted(null);
      }
    }
  }, []);

  const saveConsent = async (mode: InteractedValue, prefs = { analytics: false, marketing: false, personalization: false }) => {
    const payload = {
      mode,
      preferences: mode === "all" ? { analytics: true, marketing: true, personalization: true } : prefs
    };
    
    // Save locally
    localStorage.setItem("circleworks_consent", JSON.stringify(payload));
    setHasInteracted(mode);
    setShowPreferences(false);

    // Patch to tracking/user API
    try {
      const token = await getToken();
      if (token) {
        await fetch("https://circleworks-worker.vibhurastogi98.workers.dev/users/me", {
          method: "PATCH",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` 
          },
          body: JSON.stringify({ cookiePreferences: payload })
        });
      }
    } catch (e) {
      console.warn("Could not sync consent to backend API");
    }
  };

  if (hasInteracted) return null;

  return (
    <>
      <AnimatePresence>
        {!showPreferences && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0, transition: { duration: 0.2 } }}
            className="fixed bottom-0 left-0 right-0 z-[9990] p-4 pointer-events-none flex justify-center"
          >
            <div className="pointer-events-auto bg-[#0A1628] w-full max-w-7xl rounded-2xl shadow-[0_-15px_40px_-5px_rgba(10,22,40,0.3)] border border-slate-700 p-6 flex flex-col lg:flex-row items-center justify-between gap-6 overflow-hidden relative">
              
              {/* Left Side */}
              <div className="flex items-start lg:items-center gap-4 flex-1">
                <div className="hidden sm:flex shrink-0 w-12 h-12 bg-white/10 rounded-full items-center justify-center border border-white/5">
                  <CookieIcon size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-[15px] mb-1">Your privacy matters to us</h3>
                  <p className="text-slate-400 text-[13px] font-medium leading-relaxed max-w-3xl">
                    We use cookies to ensure the basic functionality of the platform and to enhance your online experience. 
                    You can choose optionally to opt-in/out of analytics or marketing cookies anytime. 
                    <Link href="/cookies" className="text-blue-400 hover:text-blue-300 ml-1.5 underline">Read our Cookie Policy</Link>.
                  </p>
                </div>
              </div>

              {/* Right Side Buttons */}
              <div className="flex flex-col sm:flex-row w-full lg:w-auto items-center gap-3 shrink-0">
                <button 
                  onClick={() => setShowPreferences(true)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-[13px] font-bold text-white bg-slate-800 hover:bg-slate-700 transition border border-slate-600 shadow-sm"
                >
                  Manage Preferences
                </button>
                <div className="flex flex-row w-full sm:w-auto gap-3">
                  <button 
                    onClick={() => saveConsent("rejected")}
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-lg text-[13px] font-bold text-white bg-slate-800 hover:bg-slate-700 transition border border-slate-600 shadow-sm"
                  >
                    Reject Non-Essential
                  </button>
                  <button 
                    onClick={() => saveConsent("all")}
                    className="flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-[13px] font-bold text-white bg-blue-600 hover:bg-blue-500 transition shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                  >
                    Accept All
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPreferences && (
          <React.Fragment>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9995]"
              onClick={() => setShowPreferences(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-xl bg-white rounded-2xl shadow-2xl z-[9999] overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
                <h2 className="text-lg font-black text-slate-900 tracking-tight">Cookie Preferences</h2>
                <button 
                  onClick={() => setShowPreferences(false)}
                  className="p-1.5 rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-800 transition"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <p className="text-sm font-medium text-slate-600 pb-2 border-b border-slate-100">
                  Manage how your data is tracked on CircleWorks. Our compliance model ensures you have full control over non-essential diagnostic data in accordance with the CCPA & GDPR.
                </p>

                {/* Essential Toggle */}
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200"><ShieldCheck size={20} className="text-slate-500" /></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900">Strictly Necessary</h4>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2 py-1 bg-slate-100 rounded">Always Active</span>
                    </div>
                    <p className="text-xs font-medium text-slate-500 mt-1 leading-relaxed">
                      Required for the platform to function securely. This tracks authenticated sessions, CSRF tokens, and security flags required for active human resource management.
                    </p>
                  </div>
                </div>

                {/* Analytics Toggle */}
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100"><Activity size={20} className="text-blue-500" /></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900">Performance & Analytics</h4>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={analytics} onChange={() => setAnalytics(!analytics)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <p className="text-xs font-medium text-slate-500 mt-1 leading-relaxed">
                      Allows us to count visits and traffic sources so we can measure and improve the performance of our site. 
                      They help us to know which pages are the most and least popular and see how visitors move around the site.
                    </p>
                  </div>
                </div>

                {/* Marketing Toggle */}
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100"><Target size={20} className="text-indigo-500" /></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900">Marketing & Targeting</h4>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={marketing} onChange={() => setMarketing(!marketing)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                    <p className="text-xs font-medium text-slate-500 mt-1 leading-relaxed">
                      May be set through our site by our advertising partners. They may be used by those companies to build a profile of your interests and show you relevant advertising on other sites.
                    </p>
                  </div>
                </div>

                {/* Personalization Toggle */}
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-full bg-fuchsia-50 flex items-center justify-center border border-fuchsia-100"><Palette size={20} className="text-fuchsia-500" /></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900">Personalization</h4>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={personalization} onChange={() => setPersonalization(!personalization)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-fuchsia-600"></div>
                      </label>
                    </div>
                    <p className="text-xs font-medium text-slate-500 mt-1 leading-relaxed">
                      Enables the website to provide enhanced functionality and visual personalization, such as remembering your specific UI layout configuration.
                    </p>
                  </div>
                </div>

              </div>
              
              <div className="p-5 border-t border-slate-100 bg-slate-50 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 shrink-0">
                <button 
                  onClick={() => saveConsent("rejected")}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-[13px] font-bold text-slate-700 bg-white hover:bg-slate-100 transition border border-slate-200 shadow-sm"
                >
                  Reject Non-Essential
                </button>
                <button 
                  onClick={() => saveConsent("custom", { analytics, marketing, personalization })}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-[13px] font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-[0_0_15px_rgba(37,99,235,0.2)]"
                >
                  Save Custom Choices
                </button>
              </div>
            </motion.div>
          </React.Fragment>
        )}
      </AnimatePresence>
    </>
  );
}
