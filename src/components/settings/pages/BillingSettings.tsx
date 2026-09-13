"use client";

import React, { useCallback, useEffect, useState } from "react";
import { CreditCard, TrendingUp, Zap } from "lucide-react";

type PlanResponse = {
  hasPlan: boolean;
  activeEmployees: number;
  plan: {
    id: string;
    name: string;
    basePriceCents: number;
    perSeatPriceCents: number;
    seatCount: number;
    status: string;
    trialEndsAt: string | null;
    effectiveFrom: string | null;
  } | null;
  estimatedNextInvoiceCents: number;
};

function money(cents: number) {
  return `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export default function BillingSettingsPage() {
  const [data, setData] = useState<PlanResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/billing/plan", { cache: "no-store", credentials: "include" });
      if (r.status === 401) { setErr("Please sign in."); return; }
      if (!r.ok) { setErr(`Failed (HTTP ${r.status})`); return; }
      const d = (await r.json()) as PlanResponse;
      setData(d);
      setErr(null);
    } catch { setErr("Network error"); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-5xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Billing &amp; Plans</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Your current subscription. Plan changes are handled by CircleWorks admin — reach out to change tiers.</p>
        </div>
      </div>

      {err && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">{err}</div>
      )}

      {!data && !err && <p className="text-sm text-slate-500">Loading…</p>}

      {data && !data.hasPlan && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
          <p className="font-black">No plan on file</p>
          <p className="mt-1 text-sm">Your workspace hasn't been provisioned to a plan yet. Contact CircleWorks to activate billing.</p>
        </div>
      )}

      {data?.plan && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 dark:from-blue-950 dark:to-slate-900 rounded-xl p-6 shadow-sm text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 p-6 opacity-10"><Zap size={120} /></div>
              <div className="relative z-10">
                <div className="mb-8">
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1 block">Current plan</span>
                  <h2 className="text-3xl font-black">{data.plan.name}</h2>
                  <p className="mt-1 text-xs text-slate-400">Status: <span className="font-black text-white">{data.plan.status}</span></p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Stat label="Base" value={money(data.plan.basePriceCents)} />
                  <Stat label="Per seat" value={money(data.plan.perSeatPriceCents)} />
                  <Stat label="Seats billed" value={String(data.plan.seatCount)} />
                  <Stat label="Active employees" value={String(data.activeEmployees)} />
                </div>
                {data.plan.trialEndsAt && (
                  <p className="mt-6 text-xs text-blue-300">Trial ends {new Date(data.plan.trialEndsAt).toLocaleDateString()}</p>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <TrendingUp size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Estimated next invoice</span>
              </div>
              <p className="mt-4 text-3xl font-black text-slate-950 dark:text-white">{money(data.estimatedNextInvoiceCents)}</p>
              <p className="mt-2 text-xs text-slate-500">Base + per-seat × {data.plan.seatCount}. Actual invoices are produced by CircleWorks admin.</p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard size={20} /> Payment method
            </h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Payment collection isn't wired in this build. To update a payment method, contact CircleWorks.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-blue-300">{label}</p>
      <p className="mt-1 text-lg font-black">{value}</p>
    </div>
  );
}
