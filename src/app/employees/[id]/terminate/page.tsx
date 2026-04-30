"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ArrowLeft, Calendar, CheckCircle2, Loader2, Shield, UserX } from "lucide-react";
import { toast } from "sonner";
import { useEmployee } from "@/hooks/useEmployees";
import { useDataSync } from "@/hooks/useDataSync";

export default function TerminateEmployeePage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { notifyEmployeeChange } = useDataSync();
  const { data: employee, isLoading } = useEmployee(id as string);
  const [terminationDate, setTerminationDate] = useState(new Date().toISOString().slice(0, 10));
  const [terminationType, setTerminationType] = useState("involuntary");
  const [state, setState] = useState("CA");
  const [submitting, setSubmitting] = useState(false);
  const [cascadeResult, setCascadeResult] = useState<any>(null);

  const employeeName = employee ? `${employee.firstName || ""} ${employee.lastName || ""}`.trim() : "Employee";

  const handleConfirmTermination = async () => {
    setSubmitting(true);
    try {
      const response = await fetch(`/api/employees/${id}/terminate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          terminationDate,
          terminationType,
          state,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to terminate employee");

      setCascadeResult(data.result);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["employees"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] }),
        queryClient.invalidateQueries({ queryKey: ["payroll"] }),
        queryClient.invalidateQueries({ queryKey: ["payroll-preview"] }),
        queryClient.invalidateQueries({ queryKey: ["benefits"] }),
        queryClient.invalidateQueries({ queryKey: ["onboarding"] }),
      ]);
      await notifyEmployeeChange();
      toast.success("Termination cascade completed");
    } catch (error: any) {
      console.error("[Terminate Employee]", error);
      toast.error(error.message || "Termination cascade failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 pb-24">
      <div>
        <Link href="/employees" className="mb-3 inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:underline">
          <ArrowLeft size={15} /> Back to People
        </Link>
        <h1 className="flex items-center gap-3 text-2xl font-extrabold text-slate-900 dark:text-white">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-300">
            <UserX size={20} />
          </span>
          Terminate Employee
        </h1>
        <p className="ml-[52px] mt-1 text-sm text-slate-500 dark:text-slate-400">
          Confirm termination and run the PTO, payroll, benefits, access, and offboarding cascade.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_340px]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {isLoading ? (
            <div className="flex items-center gap-3 text-sm font-semibold text-slate-500">
              <Loader2 size={18} className="animate-spin" /> Loading employee...
            </div>
          ) : (
            <div className="space-y-5">
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-950 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-100">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-bold">This action runs a multi-module cascade for {employeeName}.</p>
                    <p className="mt-1 text-xs opacity-80">Employee status, PTO requests, payroll final pay, benefits, COBRA, access revocation, and offboarding tasks will be updated together.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Termination date</span>
                  <div className="relative mt-2">
                    <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="date"
                      value={terminationDate}
                      onChange={(event) => setTerminationDate(event.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </label>
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Type</span>
                  <select
                    value={terminationType}
                    onChange={(event) => setTerminationType(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="voluntary">Voluntary</option>
                    <option value="involuntary">Involuntary</option>
                    <option value="layoff">Layoff</option>
                    <option value="other">Other</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Work state</span>
                  <select
                    value={state}
                    onChange={(event) => setState(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="CA">CA</option>
                    <option value="CO">CO</option>
                    <option value="MT">MT</option>
                    <option value="ND">ND</option>
                    <option value="NY">NY</option>
                    <option value="TX">TX</option>
                  </select>
                </label>
              </div>

              <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-5 dark:border-slate-800">
                <button
                  onClick={handleConfirmTermination}
                  disabled={submitting || Boolean(cascadeResult)}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <UserX size={16} />}
                  {submitting ? "Running cascade..." : "Confirm Termination"}
                </button>
                {cascadeResult && (
                  <button
                    onClick={() => router.push("/onboarding/offboarding")}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <CheckCircle2 size={16} /> View Offboarding
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center gap-2">
            <Shield size={17} className="text-blue-600" />
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">Cascade Summary</h2>
          </div>
          {cascadeResult ? (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between gap-4"><span className="text-slate-500">PTO cancelled</span><span className="font-bold">{cascadeResult.pto.cancelledPendingRequests}</span></div>
              <div className="flex justify-between gap-4"><span className="text-slate-500">PTO payout</span><span className="font-bold">${cascadeResult.pto.payoutAmount.toFixed(2)}</span></div>
              <div className="flex justify-between gap-4"><span className="text-slate-500">Final pay date</span><span className="font-bold">{cascadeResult.payroll.finalPayDate}</span></div>
              <div className="flex justify-between gap-4"><span className="text-slate-500">COBRA due</span><span className="font-bold">{cascadeResult.benefits.cobraNoticeDueDate}</span></div>
              <div className="flex justify-between gap-4"><span className="text-slate-500">Tasks created</span><span className="font-bold">{cascadeResult.offboarding.tasks.length}</span></div>
              <div className="rounded-xl bg-emerald-50 p-3 text-xs font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">
                Events emitted: {cascadeResult.events.join(", ")}
              </div>
            </div>
          ) : (
            <div className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <p>PTO cancellation, final pay calculation, COBRA eligibility, access revocation, asset return, and offboarding task creation will appear here after confirmation.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
