"use client";

import React, { useState, useEffect, useCallback } from "react";
import { usePlaidLink } from "react-plaid-link";
import { Landmark, CheckCircle, RefreshCcw, HandCoins, Building2 } from "lucide-react";
import { toast } from "sonner";

export function PlaidBankSection({ initialData, onSave }: { initialData: any, onSave: (data: any) => void }) {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [bankData, setBankData] = useState(initialData || {});

  // Fetch Link Token from our backend on mount
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const res = await fetch("/api/employees/me/bank-account");
        const data = await res.json();
        setLinkToken(data.link_token);
      } catch (e) {
        console.error("Failed to fetch link token:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchToken();
  }, []);

  const onSuccess = useCallback(async (public_token: string, metadata: any) => {
    try {
      setLoading(true);
      // Send public_token to our backend to exchange
      const res = await fetch("/api/employees/me/bank-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ public_token, metadata, account_id: metadata?.account_id }),
      });
      const data = await res.json();
      
      if (data.success && data.bankAccount) {
        setBankData({ ...bankData, ...data.bankAccount, verified: true });
        onSave(data.bankAccount);
      } else {
        toast.error("Failed to verify bank account.");
      }
    } catch (e) {
      console.error(e);
      toast.error("An error occurred during verification.");
    } finally {
      setLoading(false);
    }
  }, [bankData, onSave]);

  const config: Parameters<typeof usePlaidLink>[0] = {
    token: linkToken!,
    onSuccess,
  };

  const { open, ready } = usePlaidLink(config);

  const handleManualFallback = () => {
    toast("Manual entry takes 2-3 days for micro-deposit verification. Modal would open here.");
  };

  // If already verified or mocked to have bank account
  if (bankData?.verified || bankData?.bankName) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800 rounded-xl">
           <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm">
             <Building2 size={20} className="text-emerald-600" />
           </div>
           <div className="flex-1">
             <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
               {bankData.bankName || "Chase Checking"} ****{bankData.mask || bankData.accountNumber?.slice(-4) || "0000"}
               <CheckCircle size={14} className="text-emerald-500" />
             </h4>
             <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">Bank account verified instantly — ready for direct deposit</p>
           </div>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => {
              if (ready) open();
            }}
            disabled={!ready || loading}
            className="flex-1 px-3 py-2 text-[12px] font-bold border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Change Account
          </button>
          <button 
            onClick={() => setBankData({})} 
            className="px-3 py-2 text-[12px] font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors border border-transparent hover:border-red-100"
          >
            Remove
          </button>
        </div>
      </div>
    );
  }

  // Initial State before verification
  return (
    <div className="flex flex-col items-center justify-center py-6 text-center">
      <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center mb-3">
        <Landmark size={24} className="text-slate-400" />
      </div>
      <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">No Bank Connected</h4>
      <p className="text-[12px] text-slate-500 max-w-[200px] mb-5">Connect a receiving bank account for direct deposits.</p>

      <button
        onClick={() => {
           if (ready) open();
        }}
        disabled={!ready || loading}
        className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-2.5 rounded-xl text-[13px] shadow-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
      >
        {loading ? <RefreshCcw size={16} className="animate-spin" /> : <HandCoins size={16} />} 
        Connect Bank Instantly
      </button>
      <button 
        onClick={handleManualFallback}
        className="mt-3 text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium underline underline-offset-2"
      >
        Enter manually
      </button>
      <p className="text-[10px] text-slate-400 mt-1.5">(takes 2-3 days for micro-deposit verification)</p>
    </div>
  );
}
