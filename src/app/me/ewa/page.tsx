"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Info,
  ShieldCheck,
  WalletCards,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

import { useEmployeeSelfService } from "@/hooks/useEmployeePortal";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

function formatCurrency(value: number) {
  return currency.format(value);
}

function formatLocalDate(value: string, options: Intl.DateTimeFormatOptions) {
  const normalizedValue = value.includes("T") ? value : `${value}T00:00:00`;
  return new Date(normalizedValue).toLocaleDateString("en-US", options);
}

export default function EwaPage() {
  const { data: portalData } = useEmployeeSelfService();
  const data = portalData.ewa;
  const maxAdvance = Math.max(0, Math.floor(data.availableAmount / 25) * 25);
  const canRequestAdvance = maxAdvance >= 25;
  const sliderMax = Math.max(25, maxAdvance);
  const [requestAmount, setRequestAmount] = useState(
    Math.min(250, maxAdvance),
  );
  const selectedAmount = canRequestAdvance
    ? Math.min(requestAmount, maxAdvance)
    : 0;
  const nextPayday = formatLocalDate(data.nextPayDate, {
    month: "short",
    day: "numeric",
  });

  const amountOptions = useMemo(
    () =>
      data.suggestedAmounts
        .filter((amount) => amount <= maxAdvance)
        .slice(0, 4),
    [data.suggestedAmounts, maxAdvance],
  );

  const handleRequest = () => {
    if (selectedAmount < 25) {
      toast.error("Minimum advance is $25");
      return;
    }
    if (selectedAmount > data.availableAmount) {
      toast.error("Amount exceeds your available Early Pay balance");
      return;
    }

    toast.success(
      `${formatCurrency(selectedAmount)} is on the way. Repayment auto-deducts from your next payroll on ${nextPayday}.`,
    );
  };

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Early Pay
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Use a portion of wages you have already earned this pay period.
        </p>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700/60 dark:bg-slate-800/40"
      >
        <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="p-5 md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300">
                    <Zap size={22} />
                  </span>
                  <div>
                    <p className="text-[12px] font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-300">
                      Available now
                    </p>
                    <p className="text-[13px] text-slate-500 dark:text-slate-400">
                      {data.provider.displayName} -{" "}
                      {data.provider.transferRail}
                    </p>
                  </div>
                </div>
                <p className="mt-6 text-5xl font-black tracking-normal text-slate-950 dark:text-white">
                  {formatCurrency(data.availableAmount)}
                </p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  {data.earnedPercent}% of this pay period is earned, with{" "}
                  {data.accessiblePercent}% available for Early Pay.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 px-4 py-3 text-right dark:border-slate-700/60">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Next payday
                </p>
                <p className="mt-1 text-lg font-black text-slate-900 dark:text-white">
                  {nextPayday}
                </p>
              </div>
            </div>

            <div className="mt-7">
              <div className="mb-2 flex items-center justify-between text-[12px] font-semibold text-slate-500 dark:text-slate-400">
                <span>Earned this period</span>
                <span>{formatCurrency(data.earnedWages)}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${Math.min(100, data.earnedPercent)}%` }}
                />
              </div>
            </div>

            <div className="mt-8 rounded-xl bg-slate-50 p-4 dark:bg-slate-900/30">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-[12px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Advance amount
                  </p>
                  <p className="mt-1 text-3xl font-black text-slate-950 dark:text-white">
                    {formatCurrency(selectedAmount)}
                  </p>
                </div>
                <p className="text-right text-[12px] text-slate-500 dark:text-slate-400">
                  Auto-deducts from next run
                </p>
              </div>

              <input
                type="range"
                aria-label="Early Pay advance amount"
                min={25}
                max={sliderMax}
                step={25}
                value={selectedAmount}
                disabled={!canRequestAdvance}
                onChange={(event) => setRequestAmount(Number(event.target.value))}
                className="mt-5 w-full accent-emerald-600"
              />
              <div className="mt-1 flex justify-between text-[11px] text-slate-400">
                <span>$25</span>
                <span>{formatCurrency(maxAdvance)}</span>
              </div>

              {amountOptions.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {amountOptions.map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => setRequestAmount(amount)}
                      className={`h-9 rounded-lg px-4 text-[13px] font-bold transition-colors ${
                        selectedAmount === amount
                          ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                          : "bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      {formatCurrency(amount)}
                    </button>
                  ))}
                </div>
              ) : null}

              <button
                type="button"
                onClick={handleRequest}
                disabled={!canRequestAdvance}
                className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-[14px] font-black text-white shadow-sm transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-700"
              >
                <Zap size={18} /> Get paid now
              </button>
            </div>
          </div>

          <div className="border-t border-slate-100 bg-slate-50 p-5 dark:border-slate-700/40 dark:bg-slate-900/30 lg:border-l lg:border-t-0">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-200 dark:bg-slate-700" />
              <div className="rounded-2xl bg-emerald-50 p-4 dark:bg-emerald-900/20">
                <div className="flex items-center justify-between">
                  <WalletCards
                    size={20}
                    className="text-emerald-600 dark:text-emerald-300"
                  />
                  <span className="rounded-full bg-white px-2 py-1 text-[10px] font-black uppercase text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">
                    Ready
                  </span>
                </div>
                <p className="mt-5 text-[12px] font-semibold text-emerald-700 dark:text-emerald-200">
                  Early Pay balance
                </p>
                <p className="mt-1 text-2xl font-black text-slate-950 dark:text-white">
                  {formatCurrency(data.availableAmount)}
                </p>
              </div>

              <div className="mt-4 space-y-3 text-[13px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">
                    Transfer
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {data.provider.settlementTiming}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">
                    Fee
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-300">
                    $0.00
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">
                    Repayment
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {nextPayday}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-start gap-2 rounded-xl bg-blue-50 p-3 text-[12px] leading-5 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200">
              <Info size={15} className="mt-0.5 shrink-0" />
              <p>{data.repayment.description}; no separate payment is due.</p>
            </div>
          </div>
        </div>
      </motion.section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-3 text-[15px] font-bold text-slate-900 dark:text-white">
            Early Pay history
          </h2>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700/60 dark:bg-slate-800/40">
            <div className="hidden grid-cols-[1fr_auto_1fr_auto] gap-4 border-b border-slate-100 bg-slate-50 px-4 py-3 text-[12px] font-bold uppercase tracking-wide text-slate-500 dark:border-slate-700/40 dark:bg-slate-800/80 sm:grid">
              <span>Date</span>
              <span>Amount</span>
              <span>Repayment</span>
              <span>Status</span>
            </div>
            {data.requests.map((req, index) => (
              <motion.div
                key={req.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.04 }}
                className="grid grid-cols-1 items-center gap-2 border-b border-slate-100 px-4 py-3 transition-colors last:border-b-0 hover:bg-slate-50 dark:border-slate-700/30 dark:hover:bg-slate-700/20 sm:grid-cols-[1fr_auto_1fr_auto] sm:gap-4"
              >
                <span className="text-[13px] text-slate-600 dark:text-slate-300">
                  {formatLocalDate(req.requestedAt, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <span className="text-[14px] font-bold text-slate-900 dark:text-white">
                  {formatCurrency(req.amount)}
                </span>
                <span className="text-[12px] text-slate-500">
                  {formatLocalDate(req.repaymentDate, {
                    month: "short",
                    day: "numeric",
                  })}{" "}
                  via {req.repaymentMethod}
                </span>
                <span className="flex w-fit items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                  <CheckCircle2 size={11} /> {req.status}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-3 flex items-center gap-2 text-[15px] font-bold text-slate-900 dark:text-white">
            <ShieldCheck size={16} className="text-emerald-500" /> Eligibility
          </h2>
          <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700/60 dark:bg-slate-800/40">
            {data.eligibilityRequirements.map((requirement) => (
              <div key={requirement} className="flex items-start gap-2">
                <CheckCircle2
                  size={14}
                  className="mt-0.5 shrink-0 text-emerald-500"
                />
                <p className="text-[12px] text-slate-600 dark:text-slate-300">
                  {requirement}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
