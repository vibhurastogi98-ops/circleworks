"use client";

import React, { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useEmployee } from "@/hooks/useEmployees";
import { useDataSync } from "@/hooks/useDataSync";
import { classifyEffectiveDate, getSavedCompensationChanges, saveCompensationChange } from "@/lib/payroll/compensation-sync";
import { PAY_PERIOD } from "@/data/payrollRunMocks";
import { DollarSign, TrendingUp, AlertCircle, Loader2, ArrowRightLeft, Sparkles } from "lucide-react";
import { formatDate } from "@/utils/formatDate";
import { toast } from "sonner";
import type { MidPeriodHandlingOption } from "@/store/usePayrollRunStore";

interface PendingChange {
  employeeId: string;
  employeeName: string;
  oldRate: number;
  newRate: number;
  effectiveDate: string;
}

export default function CompensationTab() {
  const { id } = useParams();
  const router = useRouter();
  const { notifyCompensationChange } = useDataSync();
  const { data: emp, isLoading, error } = useEmployee(id as string);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showMidPeriodModal, setShowMidPeriodModal] = useState(false);
  const [newAmount, setNewAmount] = useState("");
  const [effectiveDate, setEffectiveDate] = useState(PAY_PERIOD.start);
  const [reason, setReason] = useState("Annual Merit Increase");
  const [pendingChange, setPendingChange] = useState<PendingChange | null>(null);
  const [savedMarker, setSavedMarker] = useState<string | null>(null);

  const savedHistory = useMemo(() => {
    if (!emp) return [];
    return getSavedCompensationChanges()
      .filter((entry) => entry.employeeId === String(emp.id))
      .sort((a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime());
  }, [emp, savedMarker]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading compensation details...</p>
      </div>
    );
  }

  if (error || !emp) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
        <AlertCircle className="text-red-500" size={32} />
        <p className="text-lg font-bold text-slate-800 dark:text-slate-200">Record Not Found</p>
      </div>
    );
  }

  const currentSalary = savedHistory[0]?.newRate || emp.salary || 0;
  const payType = emp.payType === "hourly" || emp.employmentType === "hourly" ? "hourly" : "salary";
  const compensationUnit = payType === "hourly" ? "Hr" : "Yr";
  const employeeName = `${emp.firstName || ""} ${emp.lastName || ""}`.trim() || "Employee";

  const handleSaveChange = async (handling: MidPeriodHandlingOption, changeOverride?: PendingChange) => {
    const change = changeOverride || pendingChange;
    if (!change) return;

    saveCompensationChange({
      employeeId: change.employeeId,
      employeeName: change.employeeName,
      oldRate: change.oldRate,
      newRate: change.newRate,
      effectiveDate: change.effectiveDate,
      handling,
      payType,
      savedAt: new Date().toISOString(),
    });

    await notifyCompensationChange();

    setSavedMarker(new Date().toISOString());
    setShowRequestModal(false);
    setShowMidPeriodModal(false);
    setPendingChange(null);
    setNewAmount("");
    setReason("Annual Merit Increase");

    toast.success(
      handling === "prorate"
        ? "Compensation change synced to payroll with proration."
        : handling === "full_period"
          ? "Compensation change synced to payroll for the full current period."
          : "Compensation change will apply starting next payroll period."
    );
  };

  const handleSubmit = () => {
    const parsedAmount = Number(newAmount);
    if (!parsedAmount || parsedAmount <= 0 || !effectiveDate) {
      toast.error("Enter a valid amount and effective date.");
      return;
    }

    const nextPendingChange: PendingChange = {
      employeeId: String(emp.id),
      employeeName,
      oldRate: currentSalary,
      newRate: parsedAmount,
      effectiveDate,
    };

    const classification = classifyEffectiveDate(effectiveDate, PAY_PERIOD);
    if (classification === "past") {
      toast.message("This effective date is in a past pay period. Redirecting to retro pay.");
      router.push(`/payroll/off-cycle?mode=retro&employeeId=${emp.id}&effectiveDate=${effectiveDate}&oldRate=${currentSalary}&newRate=${parsedAmount}`);
      return;
    }

    if (classification === "mid_period") {
      setPendingChange(nextPendingChange);
      setShowMidPeriodModal(true);
      return;
    }

    setPendingChange(nextPendingChange);
    void handleSaveChange("next_period_only", nextPendingChange);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
      <div className="lg:col-span-1 flex flex-col gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
            <DollarSign className="text-green-600 dark:text-green-400" size={24} />
          </div>
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Current Base Pay</h3>
          <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            ${currentSalary.toLocaleString()}
            <span className="text-sm font-medium text-slate-500"> / {compensationUnit}</span>
          </div>

          <button
            onClick={() => setShowRequestModal(true)}
            className="mt-6 w-full py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
          >
            Save Compensation Change
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-blue-500" /> Pay Band
          </h3>
          <div className="flex justify-between text-xs text-slate-500 mb-2">
            <span>Market Low</span>
            <span>Market High</span>
          </div>
          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full relative overflow-hidden">
            <div className="absolute top-0 bottom-0 left-0 bg-blue-500 rounded-l-full" style={{ width: "45%" }} />
          </div>
          <div className="text-center mt-3 text-[13px] text-slate-600 dark:text-slate-400">
            Salary is within the standard competitive market range for <span className="font-semibold text-slate-900 dark:text-white">{emp.jobTitle}</span>.
          </div>
        </div>

        {savedHistory.length > 0 && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 text-blue-950 shadow-sm dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-100">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-lg bg-white/80 p-2 text-blue-600 dark:bg-slate-900/60 dark:text-blue-300">
                <ArrowRightLeft size={16} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold">Payroll sync ready</p>
                <p className="mt-1 text-xs text-blue-900/80 dark:text-blue-100/80">
                  Compensation updates on this employee are available in payroll review for the {formatDate(PAY_PERIOD.start)} to {formatDate(PAY_PERIOD.end)} period.
                </p>
                <button
                  onClick={() => router.push("/payroll")}
                  className="mt-3 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700"
                >
                  Review in Payroll <Sparkles size={13} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="lg:col-span-2">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Compensation History</h3>
            <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">Last update: {emp.updatedAt ? formatDate(emp.updatedAt) : "N/A"}</span>
          </div>

          <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-700 space-y-8">
            {savedHistory.map((entry, index) => (
              <div key={`${entry.employeeId}-${entry.effectiveDate}-${index}`} className="relative">
                <div className="absolute -left-[31px] w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 bg-blue-500 top-1" />
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-lg">
                      ${entry.newRate.toLocaleString()} <span className="text-sm font-medium text-slate-500">/ {compensationUnit}</span>
                    </h4>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <span>Changed from ${entry.oldRate.toLocaleString()}</span>
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {entry.handling === "prorate" ? "Prorated" : entry.handling === "full_period" ? "Full period" : "Next period"}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-md">
                    Effective {formatDate(entry.effectiveDate)}
                  </div>
                </div>
              </div>
            ))}

            <div className="relative">
              <div className="absolute -left-[31px] w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 bg-slate-300 top-1" />
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-lg">
                    ${(emp.salary || 0).toLocaleString()} <span className="text-sm font-medium text-slate-500">/ {compensationUnit}</span>
                  </h4>
                  <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Starting Salary</div>
                </div>
                <div className="text-sm font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-md">
                  Effective {emp.startDate ? formatDate(emp.startDate) : "Immediate"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Save Compensation Change</h2>
              <button onClick={() => setShowRequestModal(false)} className="text-slate-400 hover:text-slate-600 p-1">✕</button>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">New Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                  <input value={newAmount} onChange={(e) => setNewAmount(e.target.value)} type="number" className="w-full pl-8 pr-4 py-2 border rounded-lg text-sm dark:bg-slate-800 dark:border-slate-700 border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. 120000" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Effective Date</label>
                <input value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)} type="date" className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-slate-800 dark:border-slate-700 border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-slate-600" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Reason for Adjustment</label>
                <select value={reason} onChange={(e) => setReason(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-slate-800 dark:border-slate-700 border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none">
                  <option>Annual Merit Increase</option>
                  <option>Promotion</option>
                  <option>Market Rate Adjustment</option>
                  <option>Cost of Living</option>
                </select>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-lg flex items-start gap-2 mt-2">
                <AlertCircle className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" size={16} />
                <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                  If the effective date falls inside the current pay period, payroll will ask whether to apply the new rate to the full period, prorate it, or defer it to next period.
                </p>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button onClick={() => setShowRequestModal(false)} className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                <button onClick={handleSubmit} className="flex-1 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showMidPeriodModal && pendingChange && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">This rate change is mid-period. How should this be handled?</h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Effective {formatDate(pendingChange.effectiveDate)} falls within the current pay period of {formatDate(PAY_PERIOD.start)} to {formatDate(PAY_PERIOD.end)}.
                </p>
              </div>
              <button onClick={() => setShowMidPeriodModal(false)} className="text-slate-400 hover:text-slate-600 p-1">✕</button>
            </div>

            <div className="mt-6 space-y-3">
              <button onClick={() => void handleSaveChange("full_period")} className="w-full rounded-xl border border-slate-200 px-4 py-4 text-left hover:border-blue-300 hover:bg-blue-50/60 dark:border-slate-700 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/10">
                <p className="text-sm font-bold text-slate-900 dark:text-white">Apply to full period</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Treat the new rate as if it started at the beginning of this pay period.</p>
              </button>
              <button onClick={() => void handleSaveChange("prorate")} className="w-full rounded-xl border border-slate-200 px-4 py-4 text-left hover:border-blue-300 hover:bg-blue-50/60 dark:border-slate-700 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/10">
                <p className="text-sm font-bold text-slate-900 dark:text-white">Prorate</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Use old rate for days before the effective date and new rate for days after.</p>
              </button>
              <button onClick={() => void handleSaveChange("next_period_only")} className="w-full rounded-xl border border-slate-200 px-4 py-4 text-left hover:border-blue-300 hover:bg-blue-50/60 dark:border-slate-700 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/10">
                <p className="text-sm font-bold text-slate-900 dark:text-white">Apply starting next period only</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Keep this payroll period unchanged and apply the new rate on the next run.</p>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
