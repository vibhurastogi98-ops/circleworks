"use client";

import React, { useMemo, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Download, FileSpreadsheet, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

type Step = "upload" | "map" | "validate" | "commit";

type ParseResponse = {
  headers: string[];
  rows: string[][];
  suggestedMapping: Record<string, string | null>;
  availableFields: string[];
  requiredFields: string[];
  rowCount: number;
};

type ValidateResult =
  | { rowIndex: number; status: "inserted"; employeeId: number }
  | { rowIndex: number; status: "skipped"; reason: string }
  | { rowIndex: number; status: "error"; errors: { rowIndex: number; field: string; message: string }[] };

type CommitResponse = {
  dryRun: boolean;
  total: number;
  inserted: number;
  skipped: number;
  errors: number;
  results: ValidateResult[];
};

const IMPORT_TYPES = ["Employees", "Historical Payroll", "Time", "Expenses"] as const;
type ImportType = (typeof IMPORT_TYPES)[number];

const SAMPLE_EMPLOYEES_CSV = `firstName,lastName,email,jobTitle,department,startDate,salary
Alex,Chen,alex@example.com,Engineer,Engineering,2025-01-15,120000
Priya,Nair,priya@example.com,Designer,Design,2025-02-01,95000
`;

export default function ImportSettingsPage() {
  const [importType, setImportType] = useState<ImportType>("Employees");
  const [step, setStep] = useState<Step>("upload");
  const [parseData, setParseData] = useState<ParseResponse | null>(null);
  const [mapping, setMapping] = useState<Record<string, string | null>>({});
  const [validation, setValidation] = useState<CommitResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const disabled = importType !== "Employees";

  async function handleFile(file: File) {
    setBusy(true);
    const form = new FormData();
    form.append("file", file);
    const r = await fetch("/api/import/employees/parse", { method: "POST", credentials: "include", body: form });
    setBusy(false);
    const data = await r.json().catch(() => ({}));
    if (!r.ok) { toast.error(data.error || `parse_failed_${r.status}`); return; }
    setParseData(data);
    setMapping(data.suggestedMapping ?? {});
    setValidation(null);
    setStep("map");
  }

  async function runValidate() {
    if (!parseData) return;
    setBusy(true);
    const r = await fetch("/api/import/employees/commit", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ headers: parseData.headers, rows: parseData.rows, mapping, dryRun: true }),
    });
    setBusy(false);
    const data = await r.json().catch(() => ({}));
    if (!r.ok) { toast.error(data.error || `validate_failed_${r.status}`); return; }
    setValidation(data);
    setStep("validate");
  }

  async function runCommit() {
    if (!parseData) return;
    setBusy(true);
    const r = await fetch("/api/import/employees/commit", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ headers: parseData.headers, rows: parseData.rows, mapping, dryRun: false }),
    });
    setBusy(false);
    const data = await r.json().catch(() => ({}));
    if (!r.ok) { toast.error(data.error || `commit_failed_${r.status}`); return; }
    setValidation(data);
    setStep("commit");
    toast.success(`${data.inserted} employees imported`, { description: `${data.skipped} skipped, ${data.errors} errors` });
  }

  function reset() {
    setParseData(null);
    setMapping({});
    setValidation(null);
    setStep("upload");
    if (fileRef.current) fileRef.current.value = "";
  }

  function downloadTemplate() {
    const blob = new Blob([SAMPLE_EMPLOYEES_CSV], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "employees-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const requiredMapped = useMemo(() => {
    if (!parseData) return true;
    const mapped = new Set(Object.values(mapping).filter((v): v is string => Boolean(v)));
    return parseData.requiredFields.every((f) => mapped.has(f));
  }, [mapping, parseData]);

  return (
    <div className="flex max-w-5xl animate-in flex-col gap-8 fade-in duration-500">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Data Import Hub</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Upload a CSV to bulk-add records. Currently supports Employees; other types are coming soon.</p>
        </div>
        {importType === "Employees" && (
          <button onClick={downloadTemplate} className="inline-flex items-center gap-2 px-3 py-2 text-sm font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
            <Download size={14} /> Download template
          </button>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        {IMPORT_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => { setImportType(t); reset(); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-bold ${
              importType === t
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
            }`}
          >
            {t}
            {t !== "Employees" && <span className="ml-2 text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400">Coming soon</span>}
          </button>
        ))}
      </div>

      {disabled && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
          <span className="font-black">{importType} import isn't wired yet.</span> Only Employees is available. Follow-up work will add the others.
        </div>
      )}

      {!disabled && (
        <>
          {/* Step progress */}
          <div className="flex items-center gap-3">
            {(["upload", "map", "validate", "commit"] as Step[]).map((s, i) => (
              <React.Fragment key={s}>
                <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black ${step === s ? "bg-blue-600 text-white" : (["upload","map","validate","commit"].indexOf(step) > i) ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-500 dark:bg-slate-700"}`}>{i + 1}</span>
                <span className={`text-sm font-bold ${step === s ? "text-slate-950 dark:text-white" : "text-slate-500"}`}>{s[0].toUpperCase() + s.slice(1)}</span>
                {i < 3 && <span className="flex-1 border-t border-dashed border-slate-300 dark:border-slate-700" />}
              </React.Fragment>
            ))}
          </div>

          {step === "upload" && (
            <div className="rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 p-10 text-center">
              <FileSpreadsheet className="mx-auto h-12 w-12 text-slate-400" />
              <p className="mt-4 text-sm font-bold text-slate-950 dark:text-white">Upload employees CSV</p>
              <p className="mt-1 text-xs text-slate-500">CSV, up to 5MB, up to 5,000 rows. Required columns: <code>firstName</code>, <code>email</code>.</p>
              <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
              <button onClick={() => fileRef.current?.click()} disabled={busy} className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-2 text-sm font-bold text-white">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Choose file
              </button>
            </div>
          )}

          {step === "map" && parseData && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm font-bold text-slate-950 dark:text-white">{parseData.rowCount} rows detected. Map columns to employee fields.</p>
              <div className="mt-4 grid gap-2">
                {parseData.headers.map((h) => (
                  <div key={h} className="grid grid-cols-2 gap-2 items-center">
                    <span className="font-mono text-xs text-slate-700 dark:text-slate-300 truncate">{h}</span>
                    <select
                      value={mapping[h] ?? ""}
                      onChange={(e) => setMapping((m) => ({ ...m, [h]: e.target.value || null }))}
                      className="h-9 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white px-2 text-sm"
                    >
                      <option value="">-- ignore --</option>
                      {parseData.availableFields.map((f) => (
                        <option key={f} value={f}>{f}{parseData.requiredFields.includes(f) ? " *" : ""}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
              {!requiredMapped && (
                <p className="mt-4 flex items-center gap-2 text-sm text-red-600"><AlertCircle size={14} /> Map all required fields ({parseData.requiredFields.join(", ")}) to continue.</p>
              )}
              <div className="mt-6 flex justify-end gap-2">
                <button onClick={reset} className="px-4 py-2 text-sm font-medium text-slate-600">Start over</button>
                <button onClick={runValidate} disabled={busy || !requiredMapped} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-2 text-sm font-bold text-white">
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Validate
                </button>
              </div>
            </div>
          )}

          {step === "validate" && validation && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-4">
                <StatChip label="Ready to insert" value={validation.inserted} color="emerald" />
                <StatChip label="Skipped (duplicate)" value={validation.skipped} color="amber" />
                <StatChip label="Errors" value={validation.errors} color="red" />
              </div>
              <ResultsTable results={validation.results} />
              <div className="mt-6 flex justify-end gap-2">
                <button onClick={() => setStep("map")} className="px-4 py-2 text-sm font-medium text-slate-600">Back to mapping</button>
                <button onClick={runCommit} disabled={busy || validation.inserted === 0} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 px-4 py-2 text-sm font-bold text-white">
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  Commit {validation.inserted} rows
                </button>
              </div>
            </div>
          )}

          {step === "commit" && validation && (
            <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-5 dark:border-emerald-500/40 dark:bg-emerald-500/10">
              <p className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
                Import complete: {validation.inserted} inserted, {validation.skipped} skipped, {validation.errors} errors.
              </p>
              <ResultsTable results={validation.results} />
              <div className="mt-6 flex justify-end">
                <button onClick={reset} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 hover:bg-slate-700 px-4 py-2 text-sm font-bold text-white">
                  Import another file
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatChip({ label, value, color }: { label: string; value: number; color: "emerald" | "amber" | "red" }) {
  const cls =
    color === "emerald" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300" :
    color === "amber" ? "bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300" :
    "bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-300";
  return (
    <div className={`rounded-lg px-3 py-2 ${cls}`}>
      <p className="text-xs font-bold uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-black">{value}</p>
    </div>
  );
}

function ResultsTable({ results }: { results: ValidateResult[] }) {
  const errors = results.filter((r) => r.status === "error");
  const skipped = results.filter((r) => r.status === "skipped");
  if (errors.length === 0 && skipped.length === 0) return null;
  return (
    <div className="mt-4 max-h-64 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-800">
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500">
          <tr>
            <th className="px-3 py-2">Row</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">Detail</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {[...errors, ...skipped].map((r) => (
            <tr key={r.rowIndex}>
              <td className="px-3 py-2 font-bold text-slate-700 dark:text-slate-300">{r.rowIndex + 2}</td>
              <td className="px-3 py-2">
                <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${r.status === "error" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{r.status}</span>
              </td>
              <td className="px-3 py-2 text-slate-600 dark:text-slate-400">
                {r.status === "error" ? r.errors.map((e) => `${e.field}: ${e.message}`).join("; ") : r.status === "skipped" ? r.reason : ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
