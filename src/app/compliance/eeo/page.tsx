"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Download, Upload, AlertTriangle, AlertCircle,
  CheckCircle2, Users
} from "lucide-react";
import { eeoData, eeoJobCategories, eeoRaces, eeoValidationErrors, type EEOJobCategory, type EEORace } from "@/data/mockCompliance";

function getCount(cat: EEOJobCategory, race: EEORace, gender: "male" | "female"): number {
  const cell = eeoData.find((d) => d.jobCategory === cat && d.race === race && d.gender === gender);
  return cell?.count || 0;
}

function getCategoryTotal(cat: EEOJobCategory): number {
  return eeoData.filter((d) => d.jobCategory === cat).reduce((s, d) => s + d.count, 0);
}

function getRaceGenderTotal(race: EEORace, gender: "male" | "female"): number {
  return eeoData.filter((d) => d.race === race && d.gender === gender).reduce((s, d) => s + d.count, 0);
}

export default function EEOPage() {
  const [showImport, setShowImport] = useState(false);
  const totalHeadcount = eeoData.reduce((s, d) => s + d.count, 0);

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
              <Users size={22} className="text-blue-600" />
              EEO-1 Report Builder
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Component 1 — headcount by race/gender × job category.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowImport(true)}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm"
          >
            <Upload size={16} /> Import from HRIS
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
            <Download size={16} /> Export Component 1
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <h4 className="text-sm font-medium text-slate-500 mb-1">Total Headcount</h4>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{totalHeadcount}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <h4 className="text-sm font-medium text-slate-500 mb-1">Job Categories Used</h4>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {eeoJobCategories.filter((c) => getCategoryTotal(c) > 0).length}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <h4 className="text-sm font-medium text-slate-500 mb-1">Validation Status</h4>
          <div className="flex items-center gap-2">
            {eeoValidationErrors.some((e) => e.severity === "error") ? (
              <>
                <AlertCircle size={20} className="text-red-500" />
                <span className="text-lg font-bold text-red-600">{eeoValidationErrors.filter((e) => e.severity === "error").length} Error(s)</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={20} className="text-green-500" />
                <span className="text-lg font-bold text-green-600">Valid</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Validation Errors */}
      {eeoValidationErrors.length > 0 && (
        <div className="flex flex-col gap-3">
          {eeoValidationErrors.map((err) => (
            <div
              key={err.id}
              className={`flex items-start gap-3 p-4 rounded-xl border ${
                err.severity === "error"
                  ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900"
                  : "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900"
              }`}
            >
              {err.severity === "error" ? (
                <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertTriangle size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
              )}
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{err.field}</span>
                <p className={`text-sm font-medium mt-0.5 ${err.severity === "error" ? "text-red-700 dark:text-red-300" : "text-amber-700 dark:text-amber-300"}`}>
                  {err.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EEO Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Component 1 Data Grid</h3>
          <p className="text-xs text-slate-500 mt-1">Race/Ethnicity × Gender for each EEO Job Category</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <th className="px-4 py-3 font-bold text-slate-500 sticky left-0 bg-slate-50 dark:bg-slate-800/50 z-10 min-w-[200px]">Job Category</th>
                {eeoRaces.map((race) => (
                  <th key={race} colSpan={2} className="px-2 py-3 text-center font-bold text-slate-500 border-l border-slate-200 dark:border-slate-800">
                    <div className="truncate max-w-[100px]" title={race}>{race.length > 15 ? race.substring(0, 12) + "..." : race}</div>
                  </th>
                ))}
                <th className="px-4 py-3 text-center font-bold text-slate-500 border-l border-slate-200 dark:border-slate-800">Total</th>
              </tr>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <th className="px-4 py-1 sticky left-0 bg-slate-50 dark:bg-slate-800/50 z-10" />
                {eeoRaces.map((race) => (
                  <React.Fragment key={race}>
                    <th className="px-2 py-1 text-center text-[10px] text-slate-400 border-l border-slate-200 dark:border-slate-800">M</th>
                    <th className="px-2 py-1 text-center text-[10px] text-slate-400">F</th>
                  </React.Fragment>
                ))}
                <th className="px-4 py-1 border-l border-slate-200 dark:border-slate-800" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {eeoJobCategories.map((cat) => {
                const catTotal = getCategoryTotal(cat);
                if (catTotal === 0) return null;
                return (
                  <tr key={cat} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white sticky left-0 bg-white dark:bg-slate-900 z-10">{cat}</td>
                    {eeoRaces.map((race) => (
                      <React.Fragment key={race}>
                        <td className="px-2 py-3 text-center text-slate-600 dark:text-slate-400 border-l border-slate-100 dark:border-slate-800">
                          {getCount(cat, race, "male") || <span className="text-slate-300 dark:text-slate-700">-</span>}
                        </td>
                        <td className="px-2 py-3 text-center text-slate-600 dark:text-slate-400">
                          {getCount(cat, race, "female") || <span className="text-slate-300 dark:text-slate-700">-</span>}
                        </td>
                      </React.Fragment>
                    ))}
                    <td className="px-4 py-3 text-center font-bold text-slate-900 dark:text-white border-l border-slate-200 dark:border-slate-800">{catTotal}</td>
                  </tr>
                );
              })}
              {/* Totals row */}
              <tr className="bg-slate-50 dark:bg-slate-800/50 font-bold">
                <td className="px-4 py-3 text-slate-900 dark:text-white sticky left-0 bg-slate-50 dark:bg-slate-800/50 z-10">Total</td>
                {eeoRaces.map((race) => (
                  <React.Fragment key={race}>
                    <td className="px-2 py-3 text-center text-slate-900 dark:text-white border-l border-slate-200 dark:border-slate-800">
                      {getRaceGenderTotal(race, "male")}
                    </td>
                    <td className="px-2 py-3 text-center text-slate-900 dark:text-white">
                      {getRaceGenderTotal(race, "female")}
                    </td>
                  </React.Fragment>
                ))}
                <td className="px-4 py-3 text-center text-blue-600 border-l border-slate-200 dark:border-slate-800">{totalHeadcount}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Import Modal */}
      {showImport && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowImport(false)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md animate-in zoom-in-95 duration-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Import from HRIS</h3>
            <p className="text-sm text-slate-500 mb-6">This will pull the latest employee data from your HRIS system to populate the EEO-1 grid.</p>
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Note:</strong> Self-identification data will be used where available. Manual review may be required for incomplete records.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowImport(false)} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                Cancel
              </button>
              <button onClick={() => setShowImport(false)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-sm">
                Import Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
