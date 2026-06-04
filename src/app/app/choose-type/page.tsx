"use client";

import { useState } from "react";
import type { ElementType } from "react";
import { useRouter } from "next/navigation";
import { Building2, Clapperboard, Loader2, Users } from "lucide-react";

import type { AccountType } from "@/lib/account-types";
import { resolveDashboard } from "@/lib/dashboard-resolver";

const OPTIONS: Array<{
  value: AccountType;
  title: string;
  detail: string;
  icon: ElementType;
}> = [
  {
    value: "company",
    title: "Company",
    detail: "Payroll, HR, benefits, time, and compliance for an employer.",
    icon: Building2,
  },
  {
    value: "agency",
    title: "Agency",
    detail: "Client operations, mixed workforce payments, and margin tracking.",
    icon: Users,
  },
  {
    value: "creator",
    title: "Creator",
    detail: "Owner payroll, contractors, tax set-asides, expenses, and documents.",
    icon: Clapperboard,
  },
];

export default function ChooseAccountTypePage() {
  const router = useRouter();
  const [selected, setSelected] = useState<AccountType>("company");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const saveChoice = async () => {
    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/account-type/choose", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountType: selected }),
      });
      const data = (await response.json().catch(() => ({}))) as { redirectTo?: unknown; error?: unknown };

      if (!response.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not save account type.");
        return;
      }

      router.replace(typeof data.redirectTo === "string" ? data.redirectTo : resolveDashboard(selected));
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-4xl flex-col justify-center gap-6 px-4 py-8 sm:px-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400">Workspace setup</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950 dark:text-white">Choose account type</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
          This updates the workspace dashboard, navigation, and available modules for your account.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {OPTIONS.map((option) => {
          const Icon = option.icon;
          const active = selected === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setSelected(option.value)}
              className={`flex min-h-40 flex-col rounded-lg border p-5 text-left transition ${
                active
                  ? "border-blue-500 bg-blue-50 shadow-sm dark:border-blue-400 dark:bg-blue-500/10"
                  : "border-slate-200 bg-white hover:border-blue-200 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-400/50"
              }`}
            >
              <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${active ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>
                <Icon className="h-5 w-5" />
              </span>
              <span className="mt-4 text-base font-black text-slate-950 dark:text-white">{option.title}</span>
              <span className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{option.detail}</span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={saveChoice}
          disabled={saving}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Continue
        </button>
        {error ? <p className="text-sm font-semibold text-red-600 dark:text-red-400">{error}</p> : null}
      </div>
    </div>
  );
}
