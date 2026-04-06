"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, AlertCircle, RefreshCcw, Mail } from "lucide-react";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";

/**
 * Public Welcome / Onboarding Entry Point
 * circleworks.com/welcome/[token]
 */
export default function WelcomePage() {
  const params = useParams();
  const token = params.token as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payload, setPayload] = useState<{ employeeId: string | number; email: string } | null>(null);

  useEffect(() => {
    async function verify() {
      try {
        const res = await fetch(`/api/verify-token?token=${encodeURIComponent(token)}`);
        const data = await res.json();
        
        if (data.valid) {
          setPayload(data.payload);
        } else {
          setError(data.error || "The invitation link has expired or is invalid.");
        }
      } catch (err) {
        setError("Unable to verify your invitation. Please check your internet connection.");
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      verify();
    }
  }, [token]);

  // 1. LOADING STATE
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Verifying Secure Invitation...</h2>
        <p className="text-slate-500 mt-2">Connecting to CircleWorks secure servers</p>
      </div>
    );
  }

  // 2. ERROR / EXPIRED STATE
  if (error || !payload) {
    return (
      <div className="max-w-xl mx-auto mt-20 px-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center shadow-xl shadow-slate-200/20 dark:shadow-none">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-900/10 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Link Expired or Invalid</h2>
          <p className="text-slate-500 leading-relaxed mb-8">
            This invitation link is no longer valid. For security purposes, pre-boarding links expire after 72 hours.
          </p>
          
          <div className="space-y-3">
             <button 
               onClick={() => window.location.reload()}
               className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
             >
               <RefreshCcw size={18} /> Try Again
             </button>
             <button className="w-full py-3.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
               <Mail size={18} /> Contact HR Support
             </button>
          </div>
          
          <p className="mt-8 text-[12px] text-slate-400">
             Security ID: {token?.substring(0, 8)}...
          </p>
        </div>
      </div>
    );
  }

  // 3. SUCCESS / WIZARD STATE
  return <OnboardingWizard payload={payload} />;
}
