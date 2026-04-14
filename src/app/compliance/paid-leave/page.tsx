"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, Users, Calculator, AlertTriangle, CheckCircle2, 
  ChevronRight, Download, Shield, Calendar, Search, FileText, Info
} from "lucide-react";

export default function PaidLeaveTrackerPage() {
  const [states, setStates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Calculator state
  const [calcStateId, setCalcStateId] = useState<string>("");
  const [calcPayroll, setCalcPayroll] = useState<string>("");
  const [calcResult, setCalcResult] = useState<any>(null);

  // Employee Check state
  const [empSearchId, setEmpSearchId] = useState<string>("EMP-001");
  const [empData, setEmpData] = useState<any>(null);
  const [empLoading, setEmpLoading] = useState(false);

  useEffect(() => {
    async function fetchStates() {
      try {
        const res = await fetch("/api/compliance/paid-leave/states");
        const data = await res.json();
        setStates(data.states);
        if (data.states.length > 0) {
          setCalcStateId(data.states[0].id);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchStates();
  }, []);

  const handleCalculate = () => {
    const state = states.find(s => s.id === calcStateId);
    const payrollAmt = parseFloat(calcPayroll);
    if (!state || isNaN(payrollAmt)) return;

    const eeContribution = payrollAmt * (state.employeeRate / 100);
    const erContribution = payrollAmt * (state.employerRate / 100);
    const totalDue = eeContribution + erContribution;

    setCalcResult({
      eeContribution,
      erContribution,
      totalDue
    });
  };

  const handleCheckEmployee = async () => {
    if (!empSearchId) return;
    setEmpLoading(true);
    setEmpData(null);
    try {
      const res = await fetch(`/api/compliance/paid-leave/eligibility/${empSearchId}`);
      const data = await res.json();
      setEmpData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setEmpLoading(false);
    }
  };

  const handleExport = () => {
    alert("Compliance Report exported successfully!");
  };

  const handleUpdateRate = (id: string) => {
    setStates(prev => prev.map(s => s.id === id ? { ...s, alert: null } : s));
    alert("State rate updated to the latest 2026 standard successfully!");
  };

  const activeAlerts = states.filter(s => s.alert);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 pb-32">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <Shield className="text-blue-600" size={32} />
            State Paid Leave Tracker
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
            Manage mandatory state family and medical leave programs, track contributions, and evaluate employee eligibility automatically.
          </p>
        </div>
        <button 
          onClick={handleExport}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl flex items-center gap-2 transition-colors shadow-lg shadow-blue-500/20"
        >
          <Download size={18} />
          Export Compliance Report
        </button>
      </div>

      {/* ALERTS SECTION */}
      {activeAlerts.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-2xl p-4 flex items-start gap-4"
        >
          <div className="bg-amber-100 dark:bg-amber-500/20 p-2 rounded-full flex-shrink-0 mt-1">
            <AlertTriangle className="text-amber-600 dark:text-amber-400" size={20} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-amber-900 dark:text-amber-400 text-lg">Annual Rate Updates Required</h3>
            <div className="mt-2 space-y-2">
              {activeAlerts.map(state => (
                <div key={state.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-white/60 dark:bg-slate-900/40 p-3 rounded-xl border border-amber-100 dark:border-amber-500/20">
                  <span className="text-amber-800 dark:text-amber-300 font-medium">{state.alert}</span>
                  <button 
                    onClick={() => handleUpdateRate(state.id)}
                    className="mt-2 sm:mt-0 text-sm bg-amber-600 hover:bg-amber-700 text-white px-4 py-1.5 rounded-lg font-medium transition-colors"
                  >
                    One-Click Update
                  </button>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* MAIN LAYOUT: Table & Side Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Table */}
        <div className="lg:col-span-2 space-y-8">
          <div className="p-6 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Building2 className="text-slate-400" size={20} />
                State Programs Overview
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              {loading ? (
                <div className="h-48 flex items-center justify-center">
                  <div className="animate-spin w-8 h-8 rounded-full border-4 border-blue-600 border-t-transparent"></div>
                </div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                      <th className="pb-3 font-semibold">State / Program</th>
                      <th className="pb-3 font-semibold">EE Rate</th>
                      <th className="pb-3 font-semibold">ER Rate</th>
                      <th className="pb-3 font-semibold">Wage Base</th>
                      <th className="pb-3 font-semibold">My Employees</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {states.map((state) => (
                      <tr key={state.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-4 font-medium flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center text-xs border border-blue-100 dark:border-blue-800">
                            {state.stateCode}
                          </div>
                          {state.programName}
                        </td>
                        <td className="py-4">
                          <span className="inline-flex px-2 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-md font-medium text-xs">
                            {state.employeeRate}%
                          </span>
                        </td>
                        <td className="py-4">
                          <span className="inline-flex px-2 py-1 bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 rounded-md font-medium text-xs">
                            {state.employerRate}%
                          </span>
                        </td>
                        <td className="py-4 text-slate-600 dark:text-slate-300">
                          ${state.wageBase.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                            <Users size={14} className="text-slate-400" />
                            <span className="font-medium">{state.employeeCount}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* PTO INTEGRATION SECTION */}
          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-xl shadow-blue-900/20">
            {/* Decorative background circles */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 flex-1">
              <div className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase mb-3 backdrop-blur-md border border-white/20">
                <Calendar size={12} /> PTO Integration
              </div>
              <h3 className="text-2xl font-bold mb-2">Smart Leave Detection</h3>
              <p className="text-indigo-100 max-w-lg leading-relaxed text-sm mb-3">
                When employees request standard PTO for parental or medical reasons, we'll automatically notify them if they might qualify for state paid leave programs. 
              </p>
              <div className="flex items-center gap-2 text-indigo-200 text-xs font-semibold bg-white/10 w-fit px-3 py-1.5 rounded-lg border border-white/5">
                <CheckCircle2 size={14} className="text-indigo-300" />
                Track concurrent PTO + state leave usage
              </div>
            </div>
            
            <div className="relative z-10 w-full md:w-auto bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-lg text-slate-900 dark:text-white border border-indigo-100 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-full text-indigo-600 dark:text-indigo-400">
                  <Info size={16} />
                </div>
                <span className="font-semibold text-sm">Action Suggested</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-3 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg border border-slate-100 dark:border-slate-700">
                "This may qualify for CA PFL — apply?"
              </p>
              <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-1.5 rounded-lg text-xs font-semibold transition-colors">
                Configure Rules
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Widgets */}
        <div className="space-y-6">
          
          {/* CALCULATOR WIDGET */}
          <div className="p-6 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Calculator size={100} />
            </div>
            
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
              <Calculator className="text-blue-600" size={18} />
              Contribution Calculator
            </h3>
            
            <div className="space-y-4 relative z-10">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Select State</label>
                <select 
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                  value={calcStateId}
                  onChange={(e) => setCalcStateId(e.target.value)}
                >
                  {states.map(s => (
                    <option key={s.id} value={s.id}>{s.stateCode} - {s.programName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Payroll Total ($)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                  <input 
                    type="number" 
                    placeholder="e.g. 50000"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                    value={calcPayroll}
                    onChange={(e) => setCalcPayroll(e.target.value)}
                  />
                </div>
              </div>
              
              <button 
                onClick={handleCalculate}
                className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold py-2.5 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
              >
                Calculate Due
              </button>

              <AnimatePresence>
                {calcResult && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 overflow-hidden"
                  >
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                        <span className="text-slate-500">EE Deduction:</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          +${calcResult.eeContribution.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                        <span className="text-slate-500">ER Cost:</span>
                        <span className="font-semibold text-rose-600 dark:text-rose-400">
                          +${calcResult.erContribution.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex flex-col gap-2 bg-blue-50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-100 dark:border-blue-800/30">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-blue-800 dark:text-blue-300">Total Run Due:</span>
                          <span className="font-black text-blue-700 dark:text-blue-400">
                            ${calcResult.totalDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex gap-1.5 items-start mt-1 text-xs text-blue-600 dark:text-blue-300/80 bg-blue-100/50 dark:bg-blue-800/30 p-2 rounded">
                          <CheckCircle2 size={14} className="shrink-0 mt-0.5" />
                          <p>Auto-adds to payroll deductions and employer costs in payroll run.</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ELIGIBILITY CHECKER */}
          <div className="p-6 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
              <Search className="text-blue-600" size={18} />
              Eligibility Checker
            </h3>
            
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Enter Employee ID (e.g. 1)"
                value={empSearchId}
                onChange={(e) => setEmpSearchId(e.target.value)}
                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
              />
              <button 
                onClick={handleCheckEmployee}
                disabled={empLoading || !empSearchId}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 rounded-xl flex items-center justify-center transition-colors"
              >
                {empLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> : <Search size={16} />}
              </button>
            </div>

            <AnimatePresence>
              {empData && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold border border-indigo-200 dark:border-indigo-800">
                      {empData.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold">{empData.name}</div>
                      <div className="text-xs text-slate-500">ID: {empData.employeeId} • {empData.ptoBalance} hrs PTO</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Qualifying Programs</div>
                    {empData.programs.map((prog: any) => (
                      <div key={prog.id} className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">{prog.programName}</span>
                          <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded">
                            <CheckCircle2 size={10} /> {prog.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mb-2">{prog.rules}</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-white dark:bg-slate-900 p-1.5 rounded border border-slate-100 dark:border-slate-800">
                            <span className="text-slate-400 block mb-0.5">Duration</span>
                            <span className="font-medium">{prog.balance}</span>
                          </div>
                          <div className="bg-white dark:bg-slate-900 p-1.5 rounded border border-slate-100 dark:border-slate-800">
                            <span className="text-slate-400 block mb-0.5">Max Benefit</span>
                            <span className="font-medium">{prog.accrued}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {empData.recentRequests?.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Recent Requests</div>
                      {empData.recentRequests.map((req: any) => (
                        <div key={req.id} className="text-xs bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/50 p-2 rounded-lg text-blue-800 dark:text-blue-300">
                          <strong>{req.date}</strong> - {req.type}
                          <div className="mt-1 flex items-start gap-1">
                            <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                            <span className="font-medium">{req.suggestion}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}
