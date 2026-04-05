"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, CheckCircle2, AlertTriangle, ShoppingCart,
  FileText, Globe, Monitor, Send, Download
} from "lucide-react";
import { laborPosters, remoteEmployeePosterTracking, type PosterStatus } from "@/data/mockCompliance";

const STATUS_CONFIG: Record<PosterStatus, { label: string; color: string; icon: React.ElementType }> = {
  current: { label: "Current", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800", icon: CheckCircle2 },
  update_available: { label: "Update Available", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800", icon: AlertTriangle },
  ordered: { label: "Ordered", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800", icon: ShoppingCart },
  expired: { label: "Expired", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800", icon: AlertTriangle },
};

export default function PostersPage() {
  const [jurisdictionFilter, setJurisdictionFilter] = useState<string>("all");

  const jurisdictions = Array.from(new Set(laborPosters.map((p) => p.jurisdiction)));
  const federalPosters = laborPosters.filter((p) => p.jurisdiction === "federal");
  const statePosters = laborPosters.filter((p) => p.jurisdiction !== "federal");
  const stateGroups = Array.from(new Set(statePosters.map((p) => p.jurisdiction)));

  const needUpdate = laborPosters.filter((p) => p.status === "update_available" || p.status === "expired").length;
  const currentCount = laborPosters.filter((p) => p.status === "current").length;

  const filteredPosters = jurisdictionFilter === "all"
    ? laborPosters
    : laborPosters.filter((p) => p.jurisdiction === jurisdictionFilter);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link href="/compliance/dashboard" className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <ArrowLeft size={18} className="text-slate-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText size={22} className="text-blue-600" />
              Labor Poster Compliance
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Federal and state poster requirements for all work locations.</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
          <ShoppingCart size={16} /> Order Printed Posters
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Globe size={16} className="text-blue-500" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Posters</span>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{laborPosters.length}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={16} className="text-green-500" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current</span>
          </div>
          <div className="text-3xl font-black text-green-600">{currentCount}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-amber-500" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Needs Update</span>
          </div>
          <div className="text-3xl font-black text-amber-600">{needUpdate}</div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <select
          value={jurisdictionFilter}
          onChange={(e) => setJurisdictionFilter(e.target.value)}
          className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Jurisdictions</option>
          <option value="federal">Federal</option>
          {stateGroups.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Posters Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Poster Inventory</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-3">Poster Name</th>
                <th className="px-6 py-3">Jurisdiction</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Effective Date</th>
                <th className="px-6 py-3">Last Updated</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredPosters.map((poster) => {
                const cfg = STATUS_CONFIG[poster.status];
                const Icon = cfg.icon;
                return (
                  <tr key={poster.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{poster.name}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        poster.jurisdiction === "federal"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                          : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                      }`}>
                        {poster.jurisdiction === "federal" ? "Federal" : poster.jurisdiction}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{poster.category}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.color}`}>
                        <Icon size={10} />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-xs">
                      {new Date(poster.effectiveDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-xs">
                      {new Date(poster.lastUpdated).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {poster.status === "update_available" ? (
                        <button className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm">
                          Update
                        </button>
                      ) : (
                        <button className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 rounded-lg text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700">
                          View
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Remote Employee Digital Distribution */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Monitor size={18} className="text-slate-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Remote Employee Distribution</h3>
          </div>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm">
            <Send size={12} /> Send Digital Posters
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-3">Employee</th>
                <th className="px-6 py-3">State</th>
                <th className="px-6 py-3">Distributed</th>
                <th className="px-6 py-3">Last Sent</th>
                <th className="px-6 py-3">Acknowledged</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {remoteEmployeePosterTracking.map((emp, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{emp.employeeName}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                      {emp.state}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {emp.postersDistributed ? (
                      <CheckCircle2 size={16} className="text-green-500" />
                    ) : (
                      <AlertTriangle size={16} className="text-amber-500" />
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-xs">
                    {emp.lastDistributed || "Not sent"}
                  </td>
                  <td className="px-6 py-4">
                    {emp.acknowledged ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">
                        Acknowledged
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                        Pending
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
