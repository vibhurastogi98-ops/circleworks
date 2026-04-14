"use client";

import React, { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, Save, MapPin, Shield, TrendingUp, Calculator,
  Bell, Globe, Upload, ChevronDown, ChevronRight, Edit3,
  AlertTriangle, CheckCircle2, Info, Clock, DollarSign,
  FileText, ArrowRight, X, BarChart3, Zap, ExternalLink,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Cell,
} from "recharts";
import { toast } from "sonner";
import {
  ALL_RATE_HISTORIES,
  EXPERIENCE_RATINGS,
  MULTI_STATE_VIEW,
  SUI_ALERTS,
  calculateVoluntaryContribution,
  type SUIRateRecord,
  type ExperienceRating,
  type SUIAlert,
  type MultiStateEntry,
  type VoluntaryContributionResult,
} from "@/data/mockSUI";

/* ──────────────────────────────────── Constants ───────────────────────────── */

type TabId = "federal" | "states" | "sui-rates" | "experience" | "voluntary" | "alerts" | "multi-state";

const TABS: { id: TabId; label: string; icon: React.ElementType; badge?: string }[] = [
  { id: "federal", label: "Federal EIN", icon: Building2 },
  { id: "states", label: "State Accounts", icon: MapPin },
  { id: "sui-rates", label: "SUI Rate History", icon: FileText },
  { id: "experience", label: "Experience Rating", icon: TrendingUp },
  { id: "voluntary", label: "Voluntary Contribution", icon: Calculator },
  { id: "alerts", label: "Rate Alerts", icon: Bell, badge: "2" },
  { id: "multi-state", label: "Multi-State View", icon: Globe },
];

const STATE_OPTIONS = [
  { abbr: "CA", name: "California" },
  { abbr: "NY", name: "New York" },
  { abbr: "TX", name: "Texas" },
];

/* ──────────────────────────────────── Helpers ─────────────────────────────── */

function fmt$(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 });
}

function fmtPct(n: number) {
  return `${n.toFixed(2)}%`;
}

/* ──────────────────────────────────── Sub-Components ──────────────────────── */

/** Card with a subtle gradient header */
function SectionCard({
  title,
  subtitle,
  icon: Icon,
  children,
  headerRight,
  gradient = "from-slate-600 to-slate-800",
}: {
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  children: React.ReactNode;
  headerRight?: React.ReactNode;
  gradient?: string;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className={`bg-gradient-to-r ${gradient} px-6 py-4 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
            <Icon size={18} className="text-white" />
          </div>
          <div>
            <h2 className="text-white font-bold text-base">{title}</h2>
            {subtitle && <p className="text-white/60 text-xs">{subtitle}</p>}
          </div>
        </div>
        {headerRight}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

/** Animated badge pill */
function StatusBadge({ status }: { status: MultiStateEntry["status"] }) {
  const map = {
    current: { color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", label: "Current" },
    needs_update: { color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", label: "Needs Update" },
    overdue: { color: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400", label: "Overdue" },
  };
  const s = map[status];
  return (
    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${s.color}`}>
      {s.label}
    </span>
  );
}

/** Severity icon for alerts */
function AlertSeverityIcon({ severity }: { severity: SUIAlert["severity"] }) {
  switch (severity) {
    case "critical":
      return <AlertTriangle size={18} className="text-rose-500" />;
    case "warning":
      return <Clock size={18} className="text-amber-500" />;
    case "info":
      return <Info size={18} className="text-blue-500" />;
    case "success":
      return <CheckCircle2 size={18} className="text-emerald-500" />;
  }
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ MAIN PAGE ━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export default function TaxSetupPage() {
  const [activeTab, setActiveTab] = useState<TabId>("sui-rates");
  const [selectedState, setSelectedState] = useState("CA");
  const [editingRate, setEditingRate] = useState<string | null>(null);
  const [editRateValue, setEditRateValue] = useState("");

  // Voluntary Contribution state
  const [vcAmount, setVcAmount] = useState<number>(5000);
  const [vcResult, setVcResult] = useState<VoluntaryContributionResult | null>(null);
  const [vcCalculating, setVcCalculating] = useState(false);

  // Alerts state
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  // OCR Upload state
  const [uploading, setUploading] = useState(false);

  // Memoised data
  const rateHistory = useMemo(() => ALL_RATE_HISTORIES[selectedState] || [], [selectedState]);
  const experienceData = useMemo(() => EXPERIENCE_RATINGS.find((e) => e.stateAbbr === selectedState), [selectedState]);
  const activeAlerts = useMemo(() => SUI_ALERTS.filter((a) => !dismissedAlerts.has(a.id)), [dismissedAlerts]);

  /* ── Handlers ─────────────────────────────────────────────────────────────── */

  const handleUpdateRate = useCallback((recordId: string, newRate: string) => {
    toast.promise(
      fetch("/api/payroll/sui", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_rate", stateAbbr: selectedState, taxYear: 2026, newRate }),
      }).then((r) => r.json()),
      {
        loading: "Saving new SUI rate…",
        success: (d) => { setEditingRate(null); return d.message; },
        error: "Failed to update rate.",
      }
    );
  }, [selectedState]);

  const handleOCRUpload = useCallback(() => {
    setUploading(true);
    toast.promise(
      fetch("/api/payroll/sui", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "import_notice", stateAbbr: selectedState }),
      })
        .then((r) => r.json())
        .then((d) => {
          setUploading(false);
          return d;
        }),
      {
        loading: "Processing rate notice via OCR…",
        success: (d) =>
          `Parsed: ${d.parsed.state} ${d.parsed.taxYear} @ ${d.parsed.rate}%. Ready to review.`,
        error: "OCR import failed.",
      }
    );
  }, [selectedState]);

  const handleCalculateVC = useCallback(() => {
    setVcCalculating(true);
    // Simulate API call
    setTimeout(() => {
      const result = calculateVoluntaryContribution(selectedState, vcAmount);
      setVcResult(result);
      setVcCalculating(false);
      if (result && result.estimatedAnnualSavings > 0) {
        toast.success("Projection calculated!", { description: `Save ${fmt$(result.estimatedAnnualSavings)}/yr with a ${fmt$(vcAmount)} contribution.` });
      } else {
        toast.info("No meaningful savings at this contribution level.");
      }
    }, 800);
  }, [selectedState, vcAmount]);

  const handleDismissAlert = useCallback((id: string) => {
    setDismissedAlerts((prev) => new Set(prev).add(id));
    toast("Alert dismissed");
  }, []);

  /* ── Render ───────────────────────────────────────────────────────────────── */
  return (
    <div className="flex flex-col gap-6 pb-24">
      {/* ─── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
              <Shield size={20} className="text-white" />
            </div>
            Company Tax Setup
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 ml-[52px]">
            Federal &amp; state tax IDs, SUI rate management, experience rating, and voluntary contributions.
          </p>
        </div>
        <button
          onClick={() => toast.success("All changes saved!")}
          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Save size={16} /> Save Changes
        </button>
      </div>

      {/* ─── Tab Navigation ───────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-1.5 overflow-x-auto hide-scrollbar">
        <div className="flex gap-1 min-w-max">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
                {tab.badge && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    isActive ? "bg-rose-500 text-white" : "bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400"
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── State Selector (for SUI tabs) ────────────────────────────────── */}
      {["sui-rates", "experience", "voluntary"].includes(activeTab) && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <span className="text-sm font-bold text-slate-600 dark:text-slate-400">State:</span>
          <div className="flex gap-2">
            {STATE_OPTIONS.map((s) => (
              <button
                key={s.abbr}
                onClick={() => { setSelectedState(s.abbr); setEditingRate(null); setVcResult(null); }}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  selectedState === s.abbr
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md"
                    : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-500"
                }`}
              >
                {s.abbr} — {s.name}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* ─── Tab Content ──────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2 }}
        >

          {/* ═══════════════ FEDERAL EIN ═══════════════ */}
          {activeTab === "federal" && (
            <SectionCard title="Federal EIN" subtitle="Employer Identification Number" icon={Building2} gradient="from-blue-600 to-blue-800">
              <div className="max-w-md">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Employer Identification Number (EIN)
                </label>
                <input
                  type="text"
                  defaultValue="12-3456789"
                  className="w-full mt-2 font-mono text-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                />
                <p className="text-xs text-slate-500 mt-2">
                  Required for all IRS filings and W-2 generation.
                </p>
              </div>
            </SectionCard>
          )}

          {/* ═══════════════ STATE TAX ACCOUNTS ═══════════════ */}
          {activeTab === "states" && (
            <SectionCard
              title="State Tax Accounts"
              subtitle="Manage state-specific tax IDs and rates"
              icon={MapPin}
              gradient="from-violet-600 to-purple-800"
              headerRight={
                <button className="text-sm font-bold text-white/80 hover:text-white bg-white/15 px-3 py-1.5 rounded-lg transition-colors">
                  + Add State
                </button>
              }
            >
              <div className="space-y-4">
                {/* California */}
                <div className="p-5 border border-slate-200 dark:border-slate-700 rounded-xl hover:shadow-md transition-shadow">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-black">CA</span>
                    California
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase">EDD Account Number</label>
                      <input type="text" defaultValue="123-4567-8" className="w-full mt-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase">SUTA / UI Rate</label>
                      <div className="relative mt-1">
                        <input type="number" defaultValue={3.4} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-3 pr-8 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
                        <span className="absolute right-3 top-2.5 text-slate-500">%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* New York */}
                <div className="p-5 border border-amber-200 dark:border-amber-800 rounded-xl bg-amber-50/50 dark:bg-amber-900/10 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xs font-black">NY</span>
                      New York
                    </h3>
                    <span className="text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400 px-2.5 py-1 rounded-full">Missing Info</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase">NY ID Number (NYS-45)</label>
                      <input type="text" placeholder="Enter NY ID" className="w-full mt-1 bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-amber-500" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase">UI Rate</label>
                      <input type="text" placeholder="e.g. 2.1%" className="w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                </div>

                {/* Texas */}
                <div className="p-5 border border-slate-200 dark:border-slate-700 rounded-xl hover:shadow-md transition-shadow">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-black">TX</span>
                    Texas
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase">TWC Account Number</label>
                      <input type="text" defaultValue="98-765432-1" className="w-full mt-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase">UI Rate</label>
                      <div className="relative mt-1">
                        <input type="number" defaultValue={2.7} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-3 pr-8 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
                        <span className="absolute right-3 top-2.5 text-slate-500">%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>
          )}

          {/* ═══════════════ SUI RATE HISTORY TABLE ═══════════════ */}
          {activeTab === "sui-rates" && (
            <div className="space-y-6">
              <SectionCard
                title={`SUI Rate History — ${STATE_OPTIONS.find((s) => s.abbr === selectedState)?.name}`}
                subtitle="View and manage historical SUI rates by tax year"
                icon={FileText}
                gradient="from-indigo-600 to-violet-700"
                headerRight={
                  <button
                    onClick={handleOCRUpload}
                    disabled={uploading}
                    className="flex items-center gap-2 text-sm font-bold text-white/80 hover:text-white bg-white/15 hover:bg-white/25 px-4 py-2 rounded-xl transition-all disabled:opacity-50"
                  >
                    <Upload size={14} />
                    {uploading ? "Processing…" : "Import Rate Notice (PDF)"}
                  </button>
                }
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700">
                        <th className="py-3 px-4 font-bold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Tax Year</th>
                        <th className="py-3 px-4 font-bold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Rate</th>
                        <th className="py-3 px-4 font-bold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Wage Base</th>
                        <th className="py-3 px-4 font-bold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Annual Max / EE</th>
                        <th className="py-3 px-4 font-bold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Date Updated</th>
                        <th className="py-3 px-4 font-bold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Source</th>
                        <th className="py-3 px-4 font-bold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {rateHistory.map((row, idx) => (
                        <tr
                          key={row.id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group"
                          onClick={() => {
                            if (editingRate !== row.id) {
                              setEditingRate(row.id);
                              setEditRateValue(String(row.rate));
                            }
                          }}
                        >
                          <td className="py-4 px-4">
                            <span className="font-bold text-slate-900 dark:text-white">{row.taxYear}</span>
                            {idx === 0 && (
                              <span className="ml-2 text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                                CURRENT
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            {editingRate === row.id ? (
                              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={editRateValue}
                                  onChange={(e) => setEditRateValue(e.target.value)}
                                  className="w-24 bg-white dark:bg-slate-800 border-2 border-blue-500 rounded-lg px-2 py-1 text-sm font-mono outline-none"
                                  autoFocus
                                />
                                <span className="text-slate-400">%</span>
                                <button
                                  onClick={() => handleUpdateRate(row.id, editRateValue)}
                                  className="text-xs font-bold bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingRate(null)}
                                  className="text-xs text-slate-500 hover:text-slate-700"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ) : (
                              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                {fmtPct(row.rate)}
                                <Edit3 size={12} className="inline ml-2 opacity-0 group-hover:opacity-60 transition-opacity" />
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-4 font-medium text-slate-700 dark:text-slate-300">{fmt$(row.wageBase)}</td>
                          <td className="py-4 px-4 font-medium text-slate-700 dark:text-slate-300">{fmt$(row.annualMaximum)}</td>
                          <td className="py-4 px-4 text-slate-500 dark:text-slate-400">{row.dateUpdated}</td>
                          <td className="py-4 px-4">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                              row.source === "Rate Notice"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                : row.source === "OCR Import"
                                ? "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400"
                                : row.source === "State Portal"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                            }`}>
                              {row.source}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingRate(row.id);
                                setEditRateValue(String(row.rate));
                              }}
                              className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Rate Trend Mini-Visual */}
                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <h3 className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-4 flex items-center gap-2">
                    <BarChart3 size={14} /> Rate Trend
                  </h3>
                  <div className="h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[...rateHistory].reverse()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="taxYear" fontSize={12} />
                        <YAxis domain={[0, "auto"]} unit="%" fontSize={12} />
                        <Tooltip
                          contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                          formatter={(value: any) => [`${value}%`, "SUI Rate"]}
                        />
                        <Bar dataKey="rate" radius={[6, 6, 0, 0]}>
                          {[...rateHistory].reverse().map((_, i) => (
                            <Cell key={i} fill={i === rateHistory.length - 1 ? "#6366f1" : "#a5b4fc"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </SectionCard>
            </div>
          )}

          {/* ═══════════════ EXPERIENCE RATING TRACKER ═══════════════ */}
          {activeTab === "experience" && experienceData && (
            <div className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Reserve Balance", value: fmt$(experienceData.reserveAccountBalance), icon: DollarSign, color: "from-emerald-500 to-teal-600" },
                  { label: "Benefit Ratio", value: (experienceData.benefitRatio * 100).toFixed(2) + "%", icon: TrendingUp, color: "from-blue-500 to-indigo-600" },
                  { label: "Current Rate Tier", value: experienceData.currentRateTier, icon: Shield, color: "from-violet-500 to-purple-600" },
                  { label: "Years of Experience", value: `${experienceData.yearsOfExperience} yrs`, icon: Clock, color: "from-amber-500 to-orange-600" },
                ].map((kpi) => (
                  <div key={kpi.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 hover:shadow-md transition-shadow">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center shadow-md mb-3`}>
                      <kpi.icon size={16} className="text-white" />
                    </div>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{kpi.label}</p>
                    <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{kpi.value}</p>
                  </div>
                ))}
              </div>

              {/* Claims History Chart */}
              <SectionCard
                title="Claims History vs. Premiums Paid"
                subtitle={`${experienceData.state} — last ${experienceData.claimsHistory.length} years`}
                icon={BarChart3}
                gradient="from-teal-600 to-cyan-700"
              >
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={experienceData.claimsHistory} barGap={4}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="year" fontSize={12} />
                      <YAxis fontSize={12} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                      <Tooltip
                        contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                        formatter={(value: any) => [fmt$(value)]}
                      />
                      <Legend wrapperStyle={{ fontSize: "12px", fontWeight: 600 }} />
                      <Bar dataKey="claims" name="UI Claims" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="premiums" name="Premiums Paid" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </SectionCard>

              {/* Projected Rate */}
              <div className="bg-gradient-to-r from-indigo-600 to-violet-700 rounded-2xl p-6 shadow-lg text-white relative overflow-hidden">
                <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
                <div className="absolute -left-4 -bottom-6 w-24 h-24 bg-white/5 rounded-full blur-xl" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-white/15 backdrop-blur rounded-xl flex items-center justify-center">
                      <Zap size={20} className="text-yellow-300" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Projected Next Year Rate</h3>
                      <p className="text-white/60 text-sm">Based on current reserve balance &amp; claims history</p>
                    </div>
                  </div>
                  <div className="flex items-end gap-6 mt-4">
                    <div>
                      <p className="text-xs font-bold text-white/50 uppercase tracking-wider mb-1">Current</p>
                      <p className="text-3xl font-black">{experienceData.currentRateTier}</p>
                    </div>
                    <ArrowRight size={28} className="text-white/40 mb-2" />
                    <div>
                      <p className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1">Projected</p>
                      <p className="text-3xl font-black text-emerald-300">{experienceData.projectedRateTier}</p>
                    </div>
                    <div className="ml-auto bg-white/15 backdrop-blur rounded-xl px-5 py-3">
                      <p className="text-xs text-white/50 uppercase font-bold tracking-wider">Est. Savings</p>
                      <p className="text-xl font-black text-emerald-300">
                        {fmt$(
                          Math.round(
                            ((parseFloat(experienceData.currentRateTier.match(/[\d.]+/)?.[0] || "0") -
                              experienceData.projectedNextRate) /
                              100) *
                              7000 *
                              (MULTI_STATE_VIEW.find((s) => s.stateAbbr === selectedState)?.employeeCount || 1)
                          )
                        )}
                        /yr
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════ VOLUNTARY CONTRIBUTION CALCULATOR ═══════════════ */}
          {activeTab === "voluntary" && (
            <div className="space-y-6">
              <SectionCard
                title="Voluntary Contribution Calculator"
                subtitle={`Estimate savings for ${STATE_OPTIONS.find((s) => s.abbr === selectedState)?.name}`}
                icon={Calculator}
                gradient="from-emerald-600 to-teal-700"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Input Section */}
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block mb-2">
                        Voluntary Contribution Amount
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                        <input
                          type="number"
                          value={vcAmount}
                          onChange={(e) => { setVcAmount(Number(e.target.value)); setVcResult(null); }}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-4 py-4 text-xl font-mono font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
                          min={0}
                          step={500}
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-2">
                        Enter the amount you're willing to contribute voluntarily to your state SUI reserve account.
                      </p>
                    </div>

                    {/* Quick amount buttons */}
                    <div className="flex flex-wrap gap-2">
                      {[2500, 5000, 10000, 15000, 25000].map((amt) => (
                        <button
                          key={amt}
                          onClick={() => { setVcAmount(amt); setVcResult(null); }}
                          className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                            vcAmount === amt
                              ? "bg-emerald-600 text-white shadow-md"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                          }`}
                        >
                          {fmt$(amt)}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={handleCalculateVC}
                      disabled={vcCalculating || vcAmount <= 0}
                      className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                    >
                      {vcCalculating ? (
                        <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Calculating…</>
                      ) : (
                        <><Calculator size={18} /> Calculate &amp; Analyze</>
                      )}
                    </button>
                  </div>

                  {/* Results Section */}
                  <div>
                    <AnimatePresence mode="wait">
                      {vcResult ? (
                        <motion.div
                          key="result"
                          initial={{ opacity: 0, scale: 0.96 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.96 }}
                          className="space-y-4"
                        >
                          {/* Rate Change */}
                          <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-6 text-white relative overflow-hidden">
                            <div className="absolute -right-6 -top-6 w-28 h-28 bg-emerald-500/10 rounded-full blur-xl" />
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Rate Tier Change</p>
                            <div className="flex items-center gap-4">
                              <div className="text-center">
                                <p className="text-2xl font-black">{vcResult.currentTier}</p>
                                <p className="text-[10px] text-slate-500 uppercase mt-1">Current</p>
                              </div>
                              <ArrowRight size={24} className="text-emerald-400" />
                              <div className="text-center">
                                <p className="text-2xl font-black text-emerald-400">{vcResult.projectedNewTier}</p>
                                <p className="text-[10px] text-emerald-500 uppercase mt-1">Projected</p>
                              </div>
                            </div>
                          </div>

                          {/* Impact Cards */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
                              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">Annual Savings</p>
                              <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">{fmt$(vcResult.estimatedAnnualSavings)}</p>
                              <p className="text-[11px] text-emerald-600/60 dark:text-emerald-500/60 mt-1">per year</p>
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                              <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase">ROI Breakeven</p>
                              <p className="text-2xl font-black text-blue-700 dark:text-blue-300 mt-1">{vcResult.roiBreakevenMonths} mo</p>
                              <p className="text-[11px] text-blue-600/60 dark:text-blue-500/60 mt-1">to recoup</p>
                            </div>
                          </div>

                          {/* ROI Summary */}
                          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                            <p className="text-sm font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2">
                              <Zap size={14} className="text-amber-500" />
                              Quick Summary
                            </p>
                            <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                              Pay <strong>{fmt$(vcResult.contributionAmount)}</strong> extra now → save <strong>{fmt$(vcResult.estimatedAnnualSavings)}</strong>/year → ROI in <strong>{vcResult.roiBreakevenMonths} months</strong>
                            </p>
                          </div>

                          {/* CTA */}
                          <button
                            onClick={() =>
                              toast.success("Voluntary contribution payment initiated!", {
                                description: `${fmt$(vcResult.contributionAmount)} payment to ${selectedState} SUI reserve account is being processed.`,
                              })
                            }
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
                          >
                            <DollarSign size={18} /> Calculate &amp; Pay {fmt$(vcResult.contributionAmount)}
                          </button>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="placeholder"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="h-full flex flex-col items-center justify-center text-center py-12"
                        >
                          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                            <Calculator size={32} className="text-slate-400" />
                          </div>
                          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Enter an amount and click Calculate</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">See how a voluntary contribution can lower your SUI rate</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </SectionCard>
            </div>
          )}

          {/* ═══════════════ ANNUAL RATE CHANGE ALERTS ═══════════════ */}
          {activeTab === "alerts" && (
            <div className="space-y-6">
              <SectionCard
                title="Annual Rate Change Alerts"
                subtitle="Notifications for SUI rate notices, updates, and deadlines"
                icon={Bell}
                gradient="from-rose-600 to-pink-700"
              >
                {activeAlerts.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 size={28} className="text-emerald-600" />
                    </div>
                    <p className="font-bold text-slate-700 dark:text-slate-300">All caught up!</p>
                    <p className="text-sm text-slate-500 mt-1">No pending rate alerts at this time.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeAlerts.map((alert) => (
                      <motion.div
                        key={alert.id}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        className={`p-5 rounded-xl border-l-4 relative group ${
                          alert.severity === "critical"
                            ? "bg-rose-50 dark:bg-rose-900/10 border-l-rose-500 border border-rose-200 dark:border-rose-800"
                            : alert.severity === "warning"
                            ? "bg-amber-50 dark:bg-amber-900/10 border-l-amber-500 border border-amber-200 dark:border-amber-800"
                            : alert.severity === "success"
                            ? "bg-emerald-50 dark:bg-emerald-900/10 border-l-emerald-500 border border-emerald-200 dark:border-emerald-800"
                            : "bg-blue-50 dark:bg-blue-900/10 border-l-blue-500 border border-blue-200 dark:border-blue-800"
                        }`}
                      >
                        <button
                          onClick={() => handleDismissAlert(alert.id)}
                          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600 transition-all"
                        >
                          <X size={16} />
                        </button>
                        <div className="flex items-start gap-4">
                          <div className="mt-0.5">
                            <AlertSeverityIcon severity={alert.severity} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold text-sm text-slate-900 dark:text-white">{alert.title}</h4>
                              <span className="text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">
                                {alert.stateAbbr}
                              </span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{alert.message}</p>
                            <div className="flex items-center gap-3 mt-3">
                              <span className="text-xs text-slate-500">{alert.date}</span>
                              {alert.actionLabel && (
                                <button
                                  onClick={() => {
                                    if (alert.type === "rate_not_updated") {
                                      setActiveTab("sui-rates");
                                      setSelectedState(alert.stateAbbr);
                                    } else {
                                      toast.success(`${alert.actionLabel} — reminder set!`);
                                    }
                                  }}
                                  className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 px-3 py-1 rounded-lg transition-colors flex items-center gap-1"
                                >
                                  {alert.actionLabel} <ArrowRight size={12} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </SectionCard>
            </div>
          )}

          {/* ═══════════════ MULTI-STATE VIEW ═══════════════ */}
          {activeTab === "multi-state" && (
            <SectionCard
              title="Multi-State SUI Overview"
              subtitle="All states with employees — rates, liabilities & due dates"
              icon={Globe}
              gradient="from-cyan-600 to-blue-700"
            >
              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total States</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{MULTI_STATE_VIEW.length}</p>
                </div>
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Employees</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {MULTI_STATE_VIEW.reduce((sum, s) => sum + s.employeeCount, 0)}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Est. Annual Liability</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {fmt$(MULTI_STATE_VIEW.reduce((sum, s) => sum + s.annualLiability, 0))}
                  </p>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                      <th className="py-3 px-4 font-bold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">State</th>
                      <th className="py-3 px-4 font-bold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider text-center">Employees</th>
                      <th className="py-3 px-4 font-bold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">SUI Rate</th>
                      <th className="py-3 px-4 font-bold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Wage Base</th>
                      <th className="py-3 px-4 font-bold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Est. Liability</th>
                      <th className="py-3 px-4 font-bold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Due Date</th>
                      <th className="py-3 px-4 font-bold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Status</th>
                      <th className="py-3 px-4 font-bold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Last Updated</th>
                      <th className="py-3 px-4 font-bold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-transparent">
                    {MULTI_STATE_VIEW.map((row) => (
                      <tr
                        key={row.stateAbbr}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2.5">
                            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-[11px] font-black shadow-sm">
                              {row.stateAbbr}
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white">{row.state}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center font-semibold text-slate-700 dark:text-slate-300">{row.employeeCount}</td>
                        <td className="py-4 px-4">
                          <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{fmtPct(row.currentRate)}</span>
                        </td>
                        <td className="py-4 px-4 font-medium text-slate-700 dark:text-slate-300">{fmt$(row.wageBase)}</td>
                        <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">{fmt$(row.annualLiability)}</td>
                        <td className="py-4 px-4 text-slate-600 dark:text-slate-400">{row.dueDate}</td>
                        <td className="py-4 px-4"><StatusBadge status={row.status} /></td>
                        <td className="py-4 px-4 text-slate-500 dark:text-slate-400 text-xs">{row.lastUpdated}</td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => { setActiveTab("sui-rates"); setSelectedState(row.stateAbbr); }}
                              className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 px-2.5 py-1 rounded-lg transition-colors"
                            >
                              History
                            </button>
                            <button
                              onClick={() => { setActiveTab("experience"); setSelectedState(row.stateAbbr); }}
                              className="text-[11px] font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 hover:bg-violet-100 dark:hover:bg-violet-900/40 px-2.5 py-1 rounded-lg transition-colors"
                            >
                              Rating
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
}
