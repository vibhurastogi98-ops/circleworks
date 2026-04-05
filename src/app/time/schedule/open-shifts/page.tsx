"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Users, CheckCircle2, Clock, MapPin,
  ArrowRightLeft, XCircle, Zap
} from "lucide-react";
import { mockOpenShifts, mockShiftSwaps } from "@/data/mockTime";

const CLAIM_STYLES = {
  open: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  claimed: "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  approved: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
};

const SWAP_STYLES = {
  Pending: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400",
  Approved: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400",
  Denied: "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400",
};

export default function OpenShiftsPage() {
  const [tab, setTab] = useState<"shifts" | "swaps">("shifts");

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link href="/time/schedule" className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1 mb-2">
            <ArrowLeft size={12} /> Back to Schedule
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md">
              <Users size={22} className="text-white" />
            </div>
            Open Shifts & Swaps
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 ml-[52px]">
            Manage unassigned shifts and swap requests
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1 w-fit">
        {[
          { key: "shifts" as const, label: "Open Shifts", count: mockOpenShifts.filter(s => s.claimStatus === "open").length },
          { key: "swaps" as const, label: "Shift Swaps", count: mockShiftSwaps.filter(s => s.status === "Pending").length },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
              tab === t.key ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span className="min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 text-[10px] font-bold px-1">
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "shifts" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mockOpenShifts.map((shift) => (
            <div key={shift.id} className={`rounded-xl border p-5 shadow-sm hover:shadow-md transition-shadow ${CLAIM_STYLES[shift.claimStatus]}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider">{shift.day}, {shift.date}</span>
                {shift.autoApprove && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400">
                    <Zap size={10} /> Auto
                  </span>
                )}
              </div>
              <div className="text-lg font-black mb-1">{shift.startTime} – {shift.endTime}</div>
              <div className="text-sm font-semibold mb-2">{shift.role}</div>
              <div className="flex items-center gap-1 text-xs opacity-75 mb-4">
                <MapPin size={12} /> {shift.location}
              </div>

              {shift.claimStatus === "open" ? (
                <div className="flex gap-2">
                  <button className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-current/20 rounded-lg text-xs font-bold hover:opacity-80 transition-opacity">
                    Assign Employee
                  </button>
                </div>
              ) : shift.claimStatus === "claimed" ? (
                <div>
                  <div className="text-xs mb-2">Claimed by <span className="font-bold">{shift.claimedBy}</span></div>
                  <div className="flex gap-2">
                    <button className="flex-1 px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1">
                      <CheckCircle2 size={12} /> Approve
                    </button>
                    <button className="flex-1 px-3 py-2 border border-red-300 text-red-600 rounded-lg text-xs font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-1">
                      <XCircle size={12} /> Deny
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-xs">
                  <CheckCircle2 size={14} className="inline mr-1" /> Assigned to <span className="font-bold">{shift.claimedBy}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "swaps" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">Requester</th>
                  <th className="px-5 py-3">Original Shift</th>
                  <th className="px-5 py-3 text-center"><ArrowRightLeft size={14} className="inline" /></th>
                  <th className="px-5 py-3">Target</th>
                  <th className="px-5 py-3">Requested Shift</th>
                  <th className="px-5 py-3 text-center">Status</th>
                  <th className="px-5 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {mockShiftSwaps.map((swap) => (
                  <tr key={swap.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3 font-bold text-slate-900 dark:text-white">{swap.requesterName}</td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-400">{swap.originalShift}</td>
                    <td className="px-5 py-3 text-center text-slate-400"><ArrowRightLeft size={14} /></td>
                    <td className="px-5 py-3 font-bold text-slate-900 dark:text-white">{swap.targetName}</td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-400">{swap.requestedShift}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${SWAP_STYLES[swap.status]}`}>
                        {swap.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {swap.status === "Pending" && (
                        <div className="flex items-center justify-center gap-1">
                          <button className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors">
                            <CheckCircle2 size={16} />
                          </button>
                          <button className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                            <XCircle size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
