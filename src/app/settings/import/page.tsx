"use client";

import React, { useState } from "react";
import { AlertCircle, CheckCircle2, Download, FileSpreadsheet, Upload } from "lucide-react";

const types = ["Employees", "Historical Payroll", "Time", "Expenses"] as const;

const requiredFields: Record<(typeof types)[number], string[]> = {
  Employees: ["First Name", "Last Name", "Email", "Hire Date", "Employment Type", "Department"],
  "Historical Payroll": ["Employee ID", "Pay Period Start", "Pay Period End", "Gross Pay", "Taxes Withheld", "Net Pay"],
  Time: ["Employee ID", "Date", "Clock In", "Clock Out", "Hours", "Project"],
  Expenses: ["Employee ID", "Date", "Merchant", "Category", "Amount", "Receipt URL"],
};

const mappedFields = ["first_name", "last_name", "email", "hire_date", "department", "location"];

export default function ImportSettingsPage() {
  const [importType, setImportType] = useState<(typeof types)[number]>("Employees");
  const [step, setStep] = useState<"upload" | "map" | "validate" | "commit">("upload");

  return (
    <div className="flex max-w-5xl animate-in flex-col gap-8 fade-in duration-500">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Data Import Hub</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Upload CSV files, map fields, preview validation results, and commit clean data.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="col-span-1 flex flex-col gap-2">
          {types.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                setImportType(type);
                setStep("upload");
              }}
              className={`rounded-xl border px-4 py-3 text-left text-sm font-bold transition-colors ${
                importType === type
                  ? "border-blue-600 bg-blue-600 text-white shadow-md"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="col-span-1 rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:col-span-3">
          <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-6 dark:border-slate-800">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Import {importType}</h2>
              <p className="mt-1 flex items-center gap-1 text-sm text-slate-500"><AlertCircle size={14} /> CSV only. Validation runs before data is committed.</p>
            </div>
            <button className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
              <Download size={16} /> Template
            </button>
          </div>

          <div className="mb-6 grid grid-cols-4 gap-2">
            {(["upload", "map", "validate", "commit"] as const).map((item, index) => (
              <button
                key={item}
                type="button"
                onClick={() => setStep(item)}
                className={`rounded-lg px-3 py-2 text-xs font-bold capitalize ${
                  step === item ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                {index + 1}. {item}
              </button>
            ))}
          </div>

          {step === "upload" && (
            <div className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-12 text-center transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:bg-slate-800">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                <FileSpreadsheet size={32} />
              </div>
              <h3 className="mb-2 text-lg font-bold text-slate-900 dark:text-white">Drag & drop your CSV file here</h3>
              <p className="mb-6 max-w-md text-sm text-slate-500">We will scan headers and suggest field mappings before importing anything.</p>
              <button onClick={() => setStep("map")} className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700">
                <Upload size={18} /> Browse Files
              </button>
            </div>
          )}

          {step === "map" && (
            <div className="grid gap-3">
              {requiredFields[importType].map((field, index) => (
                <div key={field} className="grid items-center gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-800 sm:grid-cols-[1fr_1fr]">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{field}</span>
                  <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950" defaultValue={mappedFields[index] || ""}>
                    <option value="">Ignore column</option>
                    {mappedFields.map((mapped) => <option key={mapped}>{mapped}</option>)}
                  </select>
                </div>
              ))}
            </div>
          )}

          {step === "validate" && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-500/20 dark:bg-emerald-500/10">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-emerald-600 dark:text-emerald-300" />
                <div>
                  <h3 className="font-bold text-emerald-950 dark:text-emerald-100">Validation preview passed</h3>
                  <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-200">4,982 rows ready. 18 warnings can be downloaded for review; no blocking errors found.</p>
                </div>
              </div>
            </div>
          )}

          {step === "commit" && (
            <div className="rounded-xl border border-slate-200 p-6 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Commit import</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">This will create or update {importType.toLowerCase()} records and write an immutable audit-log entry.</p>
              <button className="mt-5 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200">Commit validated rows</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
