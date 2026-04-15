"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Shield, Plus, Settings, ChevronRight, X, Save, Edit3, Trash2,
  ArrowLeft, Calendar, Percent, Heart, DollarSign, Users, Building2,
  CheckCircle2, AlertTriangle, Info, Clock,
} from "lucide-react";
import {
  mockUnions,
  mockUnionContracts,
  type UnionConfig,
  type UnionContract,
  type FringeBenefit,
} from "@/data/mockUnionPayroll";
import { formatDate } from "@/utils/formatDate";
import { toast } from "sonner";

/* ─── Color Map ────────────────────────────────────────────────── */

const UNION_COLORS: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
  "SAG-AFTRA": { bg: "bg-violet-50 dark:bg-violet-900/20", text: "text-violet-700 dark:text-violet-400", border: "border-violet-200 dark:border-violet-800", gradient: "from-violet-500 to-purple-600" },
  "IATSE": { bg: "bg-sky-50 dark:bg-sky-900/20", text: "text-sky-700 dark:text-sky-400", border: "border-sky-200 dark:border-sky-800", gradient: "from-sky-500 to-cyan-600" },
  "WGA": { bg: "bg-amber-50 dark:bg-amber-900/20", text: "text-amber-700 dark:text-amber-400", border: "border-amber-200 dark:border-amber-800", gradient: "from-amber-500 to-orange-600" },
  "DGA": { bg: "bg-rose-50 dark:bg-rose-900/20", text: "text-rose-700 dark:text-rose-400", border: "border-rose-200 dark:border-rose-800", gradient: "from-rose-500 to-red-600" },
};

const getUnionColor = (abbr: string) => UNION_COLORS[abbr] || UNION_COLORS["SAG-AFTRA"];

/* ─── Status Badge ─────────────────────────────────────────────── */

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, string> = {
    Active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    Inactive: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700",
    Expired: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border-red-200 dark:border-red-800",
    Upcoming: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${config[status] || config.Active}`}>
      {status}
    </span>
  );
}

/* ─── Add Union Modal ──────────────────────────────────────────── */

function AddUnionModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [abbr, setAbbr] = useState("");
  const [description, setDescription] = useState("");

  const handleSave = () => {
    if (!name || !abbr) {
      toast.error("Name and abbreviation are required");
      return;
    }
    toast.success("Union added", { description: `${abbr} has been configured.` });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg">
              <Plus size={20} className="text-white" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add Union</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-5">
          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">Union Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Screen Actors Guild – AFTRA"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">Abbreviation *</label>
            <input
              type="text"
              value={abbr}
              onChange={(e) => setAbbr(e.target.value)}
              placeholder="e.g. SAG-AFTRA"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the union..."
              rows={3}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-900 dark:text-white resize-none"
            />
          </div>
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all"
          >
            <Save size={16} /> Save Union
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Add Contract Modal ───────────────────────────────────────── */

function AddContractModal({ unionId, unionName, onClose }: { unionId: string; unionName: string; onClose: () => void }) {
  const [contractName, setContractName] = useState("");
  const [duesRate, setDuesRate] = useState("");
  const [pensionRate, setPensionRate] = useState("");
  const [hwRate, setHwRate] = useState("");
  const [workDuesRate, setWorkDuesRate] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [expirationDate, setExpirationDate] = useState("");

  const handleSave = () => {
    if (!contractName || !duesRate || !pensionRate || !hwRate) {
      toast.error("All rate fields are required");
      return;
    }
    toast.success("Contract added", { description: `${contractName} configured for ${unionName}.` });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-10">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">New Contract — {unionName}</h3>
            <p className="text-xs text-slate-500 mt-0.5">Configure rates per collective bargaining agreement</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-5">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Contract Name *</label>
            <input type="text" value={contractName} onChange={(e) => setContractName(e.target.value)} placeholder="e.g. SAG-AFTRA TV/Theatrical Agreement 2024-2027" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-900 dark:text-white" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-violet-600 uppercase tracking-wider block mb-2">Dues Rate (%) *</label>
              <input type="number" step="0.01" value={duesRate} onChange={(e) => setDuesRate(e.target.value)} placeholder="1.575" className="w-full px-4 py-2.5 bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-slate-900 dark:text-white" />
              <p className="text-[10px] text-violet-500 mt-1">of gross earnings • Employee</p>
            </div>
            <div>
              <label className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-2">Work Dues (%)</label>
              <input type="number" step="0.01" value={workDuesRate} onChange={(e) => setWorkDuesRate(e.target.value)} placeholder="1.0" className="w-full px-4 py-2.5 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white" />
              <p className="text-[10px] text-blue-500 mt-1">of gross earnings • Employee</p>
            </div>
            <div>
              <label className="text-xs font-bold text-emerald-600 uppercase tracking-wider block mb-2">Pension Rate (%) *</label>
              <input type="number" step="0.01" value={pensionRate} onChange={(e) => setPensionRate(e.target.value)} placeholder="14.5" className="w-full px-4 py-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-900 dark:text-white" />
              <p className="text-[10px] text-emerald-500 mt-1">employer contribution</p>
            </div>
            <div>
              <label className="text-xs font-bold text-pink-600 uppercase tracking-wider block mb-2">H&W Rate (%) *</label>
              <input type="number" step="0.01" value={hwRate} onChange={(e) => setHwRate(e.target.value)} placeholder="1.0" className="w-full px-4 py-2.5 bg-pink-50 dark:bg-pink-950/30 border border-pink-200 dark:border-pink-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50 text-slate-900 dark:text-white" />
              <p className="text-[10px] text-pink-500 mt-1">employer contribution</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Effective Date *</label>
              <input type="date" value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-900 dark:text-white" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Expiration Date</label>
              <input type="date" value={expirationDate} onChange={(e) => setExpirationDate(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-900 dark:text-white" />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3 sticky bottom-0 bg-white dark:bg-slate-900">
          <button onClick={onClose} className="px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400">Cancel</button>
          <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all">
            <Save size={16} /> Save Contract
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Settings Page ───────────────────────────────────────── */

export default function UnionSettingsPage() {
  const [showAddUnion, setShowAddUnion] = useState(false);
  const [addContractFor, setAddContractFor] = useState<{ id: string; name: string } | null>(null);
  const [expandedUnion, setExpandedUnion] = useState<string | null>("u-001");

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/payroll/union" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors">
              <ArrowLeft size={14} /> Back to Union Payroll
            </Link>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Settings size={20} className="text-white" />
            </div>
            Union Configuration
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 ml-[52px]">
            Manage union profiles, contract rates, and fringe benefit configurations.
          </p>
        </div>
        <button
          onClick={() => setShowAddUnion(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-600/20"
        >
          <Plus size={16} /> Add Union
        </button>
      </div>

      {/* Info */}
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-start gap-3">
        <Info size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-blue-800 dark:text-blue-300">How Union Configuration Works</p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            Add unions your company works with, then configure each union&apos;s contract with dues rates, pension fund contributions, health & welfare contributions, work dues, and fringe benefit rates. These rates are automatically applied during payroll processing for union member employees.
          </p>
        </div>
      </div>

      {/* Union Accordion List */}
      <div className="flex flex-col gap-4">
        {mockUnions.map((union) => {
          const uc = getUnionColor(union.abbreviation);
          const contracts = mockUnionContracts.filter(c => c.unionId === union.id);
          const isExpanded = expandedUnion === union.id;

          return (
            <div key={union.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
              {/* Union Header Row */}
              <button
                onClick={() => setExpandedUnion(isExpanded ? null : union.id)}
                className="w-full flex items-center justify-between p-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${uc.gradient} flex items-center justify-center shadow-lg shadow-indigo-500/10`}>
                    <Shield size={22} className="text-white" />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-slate-900 dark:text-white">{union.abbreviation}</h3>
                      <StatusBadge status={union.status} />
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{union.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{contracts.length} contract{contracts.length !== 1 ? "s" : ""}</p>
                    <p className="text-[10px] text-slate-500">{union.memberCount} members</p>
                  </div>
                  <ChevronRight size={20} className={`text-slate-400 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`} />
                </div>
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t border-slate-200 dark:border-slate-800">
                  {/* Description */}
                  <div className="px-5 py-3 bg-slate-50/50 dark:bg-slate-800/20">
                    <p className="text-xs text-slate-600 dark:text-slate-400">{union.description}</p>
                  </div>

                  {/* Contracts */}
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Contracts & Rate Schedules</h4>
                      <button
                        onClick={() => setAddContractFor({ id: union.id, name: union.abbreviation })}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
                      >
                        <Plus size={12} /> Add Contract
                      </button>
                    </div>

                    <div className="flex flex-col gap-3">
                      {contracts.map((contract) => (
                        <div key={contract.id} className={`border ${uc.border} rounded-xl overflow-hidden`}>
                          <div className={`${uc.bg} px-4 py-3 flex items-center justify-between`}>
                            <div>
                              <p className={`text-sm font-bold ${uc.text}`}>{contract.contractName}</p>
                              <p className="text-[10px] text-slate-500 mt-0.5">
                                {formatDate(contract.effectiveDate)} — {formatDate(contract.expirationDate)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <StatusBadge status={contract.status} />
                              <button className="p-1.5 rounded-lg hover:bg-white/50 dark:hover:bg-slate-800/50 transition-colors">
                                <Edit3 size={14} className="text-slate-400" />
                              </button>
                            </div>
                          </div>

                          <div className="px-4 py-3 bg-white dark:bg-slate-900">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                              <div className="bg-violet-50 dark:bg-violet-950/30 rounded-lg p-2.5">
                                <p className="text-[9px] font-bold text-violet-600 uppercase">Dues</p>
                                <p className="text-base font-black text-violet-800 dark:text-violet-300">{contract.duesRate}%</p>
                                <p className="text-[8px] text-violet-500">Employee</p>
                              </div>
                              <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-lg p-2.5">
                                <p className="text-[9px] font-bold text-emerald-600 uppercase">Pension</p>
                                <p className="text-base font-black text-emerald-800 dark:text-emerald-300">{contract.pensionRate}%</p>
                                <p className="text-[8px] text-emerald-500">Employer</p>
                              </div>
                              <div className="bg-pink-50 dark:bg-pink-950/30 rounded-lg p-2.5">
                                <p className="text-[9px] font-bold text-pink-600 uppercase">H&W</p>
                                <p className="text-base font-black text-pink-800 dark:text-pink-300">{contract.healthWelfareRate}%</p>
                                <p className="text-[8px] text-pink-500">Employer</p>
                              </div>
                              <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-2.5">
                                <p className="text-[9px] font-bold text-blue-600 uppercase">Work Dues</p>
                                <p className="text-base font-black text-blue-800 dark:text-blue-300">{contract.workDuesRate}%</p>
                                <p className="text-[8px] text-blue-500">Employee</p>
                              </div>
                            </div>

                            {/* Fringe benefits */}
                            {contract.fringeBenefits.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                                <p className="text-[10px] font-bold text-orange-600 uppercase mb-2">Fringe Benefits</p>
                                <div className="flex flex-wrap gap-2">
                                  {contract.fringeBenefits.map((fb) => (
                                    <span key={fb.id} className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800 rounded-lg text-[10px] font-bold">
                                      {fb.benefitName}: {fb.rate}%
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}

                      {contracts.length === 0 && (
                        <div className="text-center py-8 text-slate-500 text-sm">
                          No contracts configured. Click "Add Contract" to set up rates.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Reference */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Common Union Rate Reference</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium tracking-wide">
              <tr>
                <th className="px-4 py-3">Union</th>
                <th className="px-4 py-3 text-right">Typical Dues</th>
                <th className="px-4 py-3 text-right">Pension</th>
                <th className="px-4 py-3 text-right">H&W</th>
                <th className="px-4 py-3 text-right">Total Employer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {[
                { name: "SAG-AFTRA", dues: "1.575%", pension: "14.5–17%", hw: "0.84–1%", total: "~23.5%" },
                { name: "IATSE", dues: "2%", pension: "6.5–10%", hw: "6–8.5%", total: "~27%" },
                { name: "WGA", dues: "1.5%", pension: "8.5%", hw: "8.5%", total: "~21%" },
                { name: "DGA", dues: "2.5%", pension: "13%", hw: "7.5%", total: "~25.5%" },
              ].map((ref) => {
                const uc = getUnionColor(ref.name);
                return (
                  <tr key={ref.name} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold ${uc.bg} ${uc.text}`}>
                        <Shield size={10} />
                        {ref.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-violet-600">{ref.dues}</td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-emerald-600">{ref.pension}</td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-pink-600">{ref.hw}</td>
                    <td className="px-4 py-3 text-right text-sm font-black text-slate-900 dark:text-white">{ref.total}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-slate-400 mt-3 italic">
          * Rates shown are approximate typical values. Actual rates vary by specific contract, classification, and budget tier. Always reference the governing CBA.
        </p>
      </div>

      {/* Modals */}
      {showAddUnion && <AddUnionModal onClose={() => setShowAddUnion(false)} />}
      {addContractFor && (
        <AddContractModal
          unionId={addContractFor.id}
          unionName={addContractFor.name}
          onClose={() => setAddContractFor(null)}
        />
      )}
    </div>
  );
}
