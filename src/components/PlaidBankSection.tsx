"use client";

import React, { useCallback, useEffect, useState } from "react";
import type { PlaidLinkOnSuccessMetadata } from "react-plaid-link";
import { usePlaidLink } from "react-plaid-link";
import { Building2, CheckCircle2, HandCoins, Landmark, Loader2, Pencil, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";

type BankAccount = {
  id?: number;
  bankName?: string;
  bankLogoUrl?: string | null;
  mask?: string;
  accountNumber?: string;
  accountType?: string;
  verificationStatus?: "Verified" | "Pending" | "Unverified" | string;
  verified?: boolean;
};

type PlaidBankSectionProps = {
  initialData?: BankAccount | null;
  onSave: (data: BankAccount | null) => void;
};

const emptyManual = {
  bankName: "",
  routingNumber: "",
  accountNumber: "",
};

function maskFrom(account?: BankAccount | null) {
  return account?.mask || account?.accountNumber?.replace(/\D/g, "").slice(-4) || "0000";
}

function statusFor(account?: BankAccount | null) {
  if (!account) return "Unverified";
  if (account.verified) return "Verified";
  return account.verificationStatus || "Pending";
}

export function PlaidBankSection({ initialData, onSave }: PlaidBankSectionProps) {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [isMockPlaid, setIsMockPlaid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [manualOpen, setManualOpen] = useState(false);
  const [manualData, setManualData] = useState(emptyManual);
  const [bankData, setBankData] = useState<BankAccount | null>(initialData || null);

  useEffect(() => {
    setBankData(initialData || null);
  }, [initialData]);

  const fetchBankSetup = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/employees/me/bank-account", { credentials: "include" });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to load bank setup");

      setLinkToken(data.is_mock ? null : data.link_token);
      setIsMockPlaid(!!data.is_mock);
      if (data.bankAccount) {
        setBankData(data.bankAccount);
        onSave(data.bankAccount);
      } else {
        setBankData(null);
        onSave(null);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load bank setup.");
    } finally {
      setLoading(false);
    }
  }, [onSave]);

  useEffect(() => {
    fetchBankSetup();
  }, [fetchBankSetup]);

  const onSuccess = useCallback(async (public_token: string, metadata: PlaidLinkOnSuccessMetadata) => {
    try {
      setLoading(true);
      const selectedAccount = metadata?.accounts?.[0] || {};
      const accountId = selectedAccount.id;

      const res = await fetch("/api/employees/me/bank-account", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          public_token,
          processor_token: public_token,
          account_id: accountId,
          metadata,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success || !data.bankAccount) {
        throw new Error(data.error || "Failed to verify bank account.");
      }

      setBankData(data.bankAccount);
      onSave(data.bankAccount);
      toast.success(data.message || "Bank account verified instantly — ready for direct deposit");
    } catch (error: any) {
      toast.error(error.message || "An error occurred during bank verification.");
    } finally {
      setLoading(false);
    }
  }, [onSave]);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess,
    onExit: (error) => {
      if (error) {
        toast.error(error.display_message || error.error_message || "Plaid Link was closed before verification finished.");
      }
    },
  });

  const handleConnect = async () => {
    if (isMockPlaid) {
      await onSuccess("mock_public_token", {
        institution: { name: "Plaid Sandbox Bank" },
        accounts: [{ id: "mock_checking_4821", name: "Plaid Checking", type: "depository", subtype: "checking", mask: "4821", verification_status: "" }],
        link_session_id: "mock_link_session",
      } as PlaidLinkOnSuccessMetadata);
      return;
    }

    if (ready) open();
  };

  const handleManualSave = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/employees/me/bank-account", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method: "manual", ...manualData }),
      });
      const data = await res.json();

      if (!res.ok || !data.success || !data.bankAccount) {
        throw new Error(data.error || "Failed to save manual bank account.");
      }

      setBankData(data.bankAccount);
      setManualOpen(false);
      setManualData(emptyManual);
      onSave(data.bankAccount);
      toast.success(data.message || "Manual bank account saved — micro-deposit verification pending");
    } catch (error: any) {
      toast.error(error.message || "Failed to save manual bank account.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/employees/me/bank-account", {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) throw new Error(data?.error || "Failed to remove bank account.");

      setBankData(null);
      onSave(null);
      toast.success("Bank account removed.");
    } catch (error: any) {
      toast.error(error.message || "Failed to remove bank account.");
    } finally {
      setLoading(false);
    }
  };

  if (bankData?.bankName) {
    const status = statusFor(bankData);
    const verified = status.toLowerCase() === "verified";

    return (
      <div className="space-y-4">
        <div className={`flex items-center gap-3 rounded-xl border p-4 ${
          verified
            ? "border-emerald-100 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/10"
            : "border-amber-100 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/10"
        }`}>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm dark:bg-slate-800">
            {bankData.bankLogoUrl ? (
              <img src={bankData.bankLogoUrl} alt="" className="h-full w-full object-contain p-2" />
            ) : (
              <Building2 size={20} className={verified ? "text-emerald-600" : "text-amber-600"} />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="flex items-center gap-2 truncate text-sm font-bold text-slate-900 dark:text-white">
              <span className="truncate">{bankData.bankName} {bankData.accountType || "Checking"} ****{maskFrom(bankData)}</span>
              {verified && <CheckCircle2 size={15} className="shrink-0 text-emerald-500" />}
            </h4>
            <p className={`mt-0.5 text-[11px] font-semibold ${verified ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400"}`}>
              {verified
                ? "Bank account verified instantly — ready for direct deposit"
                : "Pending micro-deposit verification"}
            </p>
          </div>
          <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${
            verified
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
              : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
          }`}>
            {status}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleConnect}
            disabled={loading || (!isMockPlaid && !ready)}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-[12px] font-bold transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            <Pencil size={13} /> Change
          </button>
          <button
            onClick={handleRemove}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-lg border border-transparent px-3 py-2 text-[12px] font-bold text-red-600 transition-colors hover:border-red-100 hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-900/10"
          >
            <Trash2 size={13} /> Remove
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-dashed border-slate-200 p-5 text-center dark:border-slate-700">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-slate-100 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
        <Landmark size={24} className="text-slate-400" />
      </div>
      <h4 className="mb-1 text-sm font-bold text-slate-900 dark:text-white">No Bank Connected</h4>
      <p className="mx-auto mb-5 max-w-xs text-[12px] text-slate-500">
        Connect a checking account for direct deposit. Instant verification uses Plaid Link.
      </p>

      <button
        onClick={handleConnect}
        disabled={loading || (!isMockPlaid && !ready)}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-2.5 text-[13px] font-bold text-white shadow-sm transition-colors hover:bg-violet-700 disabled:opacity-50"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <HandCoins size={16} />}
        Connect Bank Instantly
      </button>

      <button
        onClick={() => setManualOpen((value) => !value)}
        className="mt-3 text-[11px] font-semibold text-slate-500 underline underline-offset-2 hover:text-slate-700 dark:hover:text-slate-300"
      >
        Enter manually (takes 2-3 days for micro-deposit verification)
      </button>

      {manualOpen && (
        <div className="mt-4 space-y-3 rounded-xl border border-slate-200 bg-white p-3 text-left dark:border-slate-700 dark:bg-slate-900">
          <input
            value={manualData.bankName}
            onChange={(event) => setManualData((current) => ({ ...current, bankName: event.target.value }))}
            placeholder="Bank name"
            className="h-9 w-full rounded-lg border border-slate-200 px-3 text-[13px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
          <input
            value={manualData.routingNumber}
            onChange={(event) => setManualData((current) => ({ ...current, routingNumber: event.target.value }))}
            placeholder="Routing number"
            inputMode="numeric"
            className="h-9 w-full rounded-lg border border-slate-200 px-3 text-[13px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
          <input
            value={manualData.accountNumber}
            onChange={(event) => setManualData((current) => ({ ...current, accountNumber: event.target.value }))}
            placeholder="Account number"
            inputMode="numeric"
            className="h-9 w-full rounded-lg border border-slate-200 px-3 text-[13px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
          <button
            onClick={handleManualSave}
            disabled={loading || !manualData.bankName || !manualData.routingNumber || !manualData.accountNumber}
            className="flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-slate-900 text-[12px] font-bold text-white transition-colors hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-900"
          >
            <ShieldCheck size={14} /> Save for Micro-Deposits
          </button>
        </div>
      )}
    </div>
  );
}
