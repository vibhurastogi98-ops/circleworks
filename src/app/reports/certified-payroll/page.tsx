"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  Download,
  FileText,
  Hash,
  MapPin,
  PenLine,
  Play,
  Save,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/utils/formatDate";

type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

interface CertifiedPayrollHistoryItem {
  id: string;
  contractName: string;
  contractNumber: string;
  contractingAgency: string;
  projectLocation: string;
  weekEnding: string;
  payrollNo: number;
  status: string;
  generatedAt: string;
}

interface WorkerRow {
  id: number;
  name: string;
  ssnLast4: string;
  classification: string;
  hoursByDay: Record<DayKey, number>;
  hourlyRate: number;
  withholding: number;
  deductions: number;
}

interface ValidatedWorker extends WorkerRow {
  maskedSsn: string;
  prevailingWageRate: number;
  isUnderpaid: boolean;
  totalHours: number;
  grossWages: number;
  totalDeductions: number;
  netWages: number;
}

interface GeneratedWh347 {
  hasViolations: boolean;
  validatedWorkers: ValidatedWorker[];
  wh347: {
    status: string;
    fileName: string;
    generatedAt: string;
    fields: {
      statementOfCompliance: {
        signerName: string;
        signerTitle: string;
        eSignatureStatus: string;
        signedAt: string | null;
      };
    };
  };
}

const dayColumns: { key: DayKey; label: string }[] = [
  { key: "mon", label: "Mon" },
  { key: "tue", label: "Tue" },
  { key: "wed", label: "Wed" },
  { key: "thu", label: "Thu" },
  { key: "fri", label: "Fri" },
  { key: "sat", label: "Sat" },
  { key: "sun", label: "Sun" },
];

const wageDeterminations: Record<string, number> = {
  Carpenter: 39.2,
  Electrician: 48.5,
  Laborer: 25,
  Plumber: 42.75,
  "Heavy Equipment Operator": 44.6,
  Painter: 36.35,
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function totalHours(hoursByDay: Record<DayKey, number>) {
  return dayColumns.reduce((sum, day) => sum + Number(hoursByDay[day.key] || 0), 0);
}

function getWeekStart(weekEnding: string) {
  const end = new Date(`${weekEnding}T00:00:00`);
  end.setDate(end.getDate() - 6);
  return end.toISOString().slice(0, 10);
}

export default function CertifiedPayrollPage() {
  const [step, setStep] = useState(1);
  const [history, setHistory] = useState<CertifiedPayrollHistoryItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDocument, setGeneratedDocument] = useState<GeneratedWh347 | null>(null);

  const [setup, setSetup] = useState({
    contractName: "Federal Courthouse HQ Renovations",
    contractNumber: "DOJ-FX-9921",
    contractingAgency: "Department of Justice",
    projectLocation: "123 Justice Ave, Washington, DC 20001",
    weekEnding: "2026-04-12",
    payrollNo: 3,
    adminSigner: "Alex HR Admin",
    adminTitle: "HR Director",
  });

  const [workers, setWorkers] = useState<WorkerRow[]>([
    {
      id: 1,
      name: "Maria Santos",
      ssnLast4: "2841",
      classification: "Electrician",
      hoursByDay: { mon: 8, tue: 8, wed: 8, thu: 8, fri: 0, sat: 0, sun: 0 },
      hourlyRate: 45,
      withholding: 312,
      deductions: 96,
    },
    {
      id: 2,
      name: "David Martinez",
      ssnLast4: "7392",
      classification: "Carpenter",
      hoursByDay: { mon: 8, tue: 8, wed: 8, thu: 8, fri: 8, sat: 0, sun: 0 },
      hourlyRate: 40,
      withholding: 260,
      deductions: 84,
    },
    {
      id: 3,
      name: "John Doe",
      ssnLast4: "1188",
      classification: "Laborer",
      hoursByDay: { mon: 10, tue: 10, wed: 10, thu: 10, fri: 0, sat: 0, sun: 0 },
      hourlyRate: 22,
      withholding: 118,
      deductions: 52,
    },
  ]);

  useEffect(() => {
    fetch("/api/reports/certified-payroll")
      .then((res) => res.json())
      .then((data: { history?: CertifiedPayrollHistoryItem[] }) => {
        const nextHistory = data.history ?? [];
        setHistory(nextHistory);
        const matchingPayrolls = nextHistory
          .filter((item) => item.contractNumber === setup.contractNumber)
          .map((item) => item.payrollNo);
        setSetup((current) => ({ ...current, payrollNo: Math.max(0, ...matchingPayrolls) + 1 }));
      })
      .catch(() => toast.error("Certified payroll history could not be loaded."));
  }, [setup.contractNumber]);

  const weekStart = useMemo(() => getWeekStart(setup.weekEnding), [setup.weekEnding]);
  const flaggedWorkers = useMemo(
    () => workers.filter((worker) => worker.hourlyRate < (wageDeterminations[worker.classification] ?? 0)),
    [workers],
  );
  const wh347Workers = generatedDocument?.validatedWorkers ?? [];

  const updateWorker = <K extends keyof WorkerRow>(index: number, key: K, value: WorkerRow[K]) => {
    setWorkers((current) => current.map((worker, workerIndex) => (workerIndex === index ? { ...worker, [key]: value } : worker)));
  };

  const updateHours = (workerIndex: number, day: DayKey, value: number) => {
    setWorkers((current) =>
      current.map((worker, index) =>
        index === workerIndex ? { ...worker, hoursByDay: { ...worker.hoursByDay, [day]: value } } : worker,
      ),
    );
  };

  const saveSetupAndContinue = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/reports/certified-payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(setup),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Unable to save setup");
      setSetup((current) => ({ ...current, payrollNo: data.report.payrollNo }));
      toast.success("Certified payroll setup saved.");
      setStep(2);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Certified payroll setup could not be saved.");
    } finally {
      setIsSaving(false);
    }
  };

  const generateWh347 = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/reports/certified-payroll/generate-wh347", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...setup,
          workers,
        }),
      });
      const data = (await res.json()) as GeneratedWh347 & { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Unable to generate WH-347");
      setGeneratedDocument(data);
      if (data.hasViolations) {
        toast.error("Prevailing wage violation detected.");
      } else {
        toast.success("WH-347 is ready to submit.");
      }
      setStep(3);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "WH-347 could not be generated.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-24 animate-in fade-in">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8 print:hidden">
        <div className="flex items-center gap-4">
          <Link href="/reports" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <ChevronLeft size={18} />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
              <Shield size={28} className="text-blue-600" />
              Certified Payroll (Davis-Bacon)
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">DOL WH-347 generation for weekly prevailing wage reporting.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <FileText size={14} />
          /api/reports/certified-payroll
        </div>
      </div>

      <div className="flex items-center gap-4 mb-8 overflow-x-auto print:hidden">
        {[1, 2, 3].map((num) => (
          <div key={num} className="flex items-center gap-2 shrink-0">
            <div className={`w-8 h-8 rounded-full flex justify-center items-center font-bold text-sm transition-colors ${step >= num ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"}`}>
              {num}
            </div>
            <span className={`text-sm font-bold ${step >= num ? "text-slate-900 dark:text-white" : "text-slate-400"}`}>
              {num === 1 && "Setup"}
              {num === 2 && "Wages"}
              {num === 3 && "WH-347"}
            </span>
            {num !== 3 && <div className="w-8 border-t-2 border-slate-200 mx-2" />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Building2 size={18} className="text-blue-600" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Report Setup</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <label className="space-y-2">
                <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Contract Name</span>
                <input value={setup.contractName} onChange={(e) => setSetup({ ...setup, contractName: e.target.value })} className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 font-medium bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
              </label>
              <label className="space-y-2">
                <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Contract Number</span>
                <input value={setup.contractNumber} onChange={(e) => setSetup({ ...setup, contractNumber: e.target.value })} className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 font-medium bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
              </label>
              <label className="space-y-2">
                <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Contracting Agency</span>
                <input value={setup.contractingAgency} onChange={(e) => setSetup({ ...setup, contractingAgency: e.target.value })} className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 font-medium bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
              </label>
              <label className="space-y-2">
                <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Week Ending Date</span>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-slate-400" />
                  <input type="date" value={setup.weekEnding} onChange={(e) => setSetup({ ...setup, weekEnding: e.target.value })} className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 font-medium bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </label>
              <label className="md:col-span-2 space-y-2">
                <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Project Location Address</span>
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-slate-400" />
                  <input value={setup.projectLocation} onChange={(e) => setSetup({ ...setup, projectLocation: e.target.value })} className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 font-medium bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </label>
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <Calendar size={14} />
                  7-Day Period
                </div>
                <p className="mt-2 text-sm font-bold text-slate-900 dark:text-white">{formatDate(weekStart)} - {formatDate(setup.weekEnding)}</p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <Hash size={14} />
                  Payroll Number
                </div>
                <p className="mt-2 text-sm font-bold text-slate-900 dark:text-white">#{setup.payrollNo} auto-incremented per contract</p>
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <button onClick={saveSetupAndContinue} disabled={isSaving} className="bg-slate-900 hover:bg-black text-white px-5 py-3 rounded-lg font-bold flex items-center gap-2 shadow-sm disabled:opacity-50">
                {isSaving ? <Save size={18} /> : <ArrowRight size={18} />}
                Continue
              </button>
            </div>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded-xl p-5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText size={16} />
              History
            </h2>
            <div className="space-y-3">
              {history.map((item) => (
                <div key={item.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-lg shadow-sm">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{item.contractName}</p>
                      <p className="text-[11px] text-slate-500">{item.contractNumber}</p>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${item.status === "Submitted" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">{item.contractingAgency}</p>
                  <p className="text-xs text-slate-500">Week ending <span className="font-medium text-slate-700 dark:text-slate-300">{formatDate(item.weekEnding)}</span> - Payroll #{item.payrollNo}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm animate-in slide-in-from-bottom-4">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Prevailing Wage Tracking</h2>
              <p className="text-sm text-slate-500 mt-1">{setup.contractNumber} - week ending {formatDate(setup.weekEnding)}</p>
            </div>
            <button onClick={generateWh347} disabled={isGenerating} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm rounded-lg font-bold shadow-sm flex items-center gap-2 disabled:opacity-50">
              <Play size={16} />
              Generate WH-347
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Classification</th>
                  {dayColumns.map((day) => <th key={day.key} className="px-2 py-3 text-center">{day.label}</th>)}
                  <th className="px-4 py-3 text-center">Total</th>
                  <th className="px-4 py-3 text-right">Rate</th>
                  <th className="px-4 py-3 text-right">DOL Rate</th>
                  <th className="px-4 py-3">Flag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {workers.map((worker, workerIndex) => {
                  const prevailingRate = wageDeterminations[worker.classification] ?? 0;
                  const isUnderpaid = worker.hourlyRate < prevailingRate;
                  return (
                    <tr key={worker.id} className={isUnderpaid ? "bg-red-50 dark:bg-red-950/20" : "hover:bg-slate-50 dark:hover:bg-slate-800/40"}>
                      <td className="px-4 py-3">
                        <input value={worker.name} onChange={(e) => updateWorker(workerIndex, "name", e.target.value)} className="w-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 font-medium text-slate-900 dark:text-white" />
                      </td>
                      <td className="px-4 py-3">
                        <select value={worker.classification} onChange={(e) => updateWorker(workerIndex, "classification", e.target.value)} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs text-slate-900 dark:text-white">
                          {Object.keys(wageDeterminations).map((classification) => <option key={classification}>{classification}</option>)}
                        </select>
                      </td>
                      {dayColumns.map((day) => (
                        <td key={day.key} className="px-2 py-3 text-center">
                          <input type="number" min="0" value={worker.hoursByDay[day.key] || ""} onChange={(e) => updateHours(workerIndex, day.key, Number(e.target.value))} className="w-12 text-center text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded py-1 text-slate-900 dark:text-white" />
                        </td>
                      ))}
                      <td className="px-4 py-3 text-center font-bold text-slate-700 dark:text-slate-300">{totalHours(worker.hoursByDay)}</td>
                      <td className="px-4 py-3 text-right">
                        <input type="number" min="0" value={worker.hourlyRate} onChange={(e) => updateWorker(workerIndex, "hourlyRate", Number(e.target.value))} className="w-24 text-right bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 ml-auto font-mono text-sm text-slate-900 dark:text-white" />
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-700 dark:text-slate-300">{currency.format(prevailingRate)}</td>
                      <td className="px-4 py-3">
                        {isUnderpaid ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-100 px-2 py-1 rounded">
                            <AlertTriangle size={12} />
                            Under
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded">
                            <CheckCircle2 size={12} />
                            Clear
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {flaggedWorkers.length > 0 && (
            <div className="m-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 flex items-start gap-2">
              <AlertTriangle size={18} className="mt-0.5 shrink-0" />
              <span>{flaggedWorkers.length} employee rate is below the DOL wage determination for the selected classification.</span>
            </div>
          )}
        </div>
      )}

      {step === 3 && generatedDocument && (
        <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6">
          {generatedDocument.hasViolations && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-start gap-4 print:hidden">
              <AlertTriangle className="text-red-500 shrink-0 mt-1" size={24} />
              <div>
                <h2 className="text-red-900 font-bold text-lg">Prevailing Wage Violation</h2>
                <p className="text-red-800 text-sm mt-1 mb-3">WH-347 e-signature is blocked until every employee meets the Davis-Bacon rate for the selected classification.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                  {generatedDocument.validatedWorkers.filter((worker) => worker.isUnderpaid).map((worker) => (
                    <div key={worker.id} className="bg-white rounded border border-red-100 p-3">
                      <p className="font-bold text-slate-900">{worker.name}</p>
                      <p className="text-slate-500">{worker.classification}</p>
                      <p className="mt-1 text-red-700 font-bold">{currency.format(worker.hourlyRate)} / required {currency.format(worker.prevailingWageRate)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap justify-end gap-3 print:hidden">
            <button onClick={() => setStep(2)} className="px-4 py-2 border border-slate-200 text-slate-600 font-bold text-sm bg-white rounded-lg shadow-sm hover:bg-slate-50">Back to Edit</button>
            <button onClick={() => window.print()} className="px-4 py-2 border border-blue-200 text-blue-600 font-bold text-sm bg-blue-50 rounded-lg shadow-sm hover:bg-blue-100 flex items-center gap-2">
              <Download size={16} />
              Download WH-347 PDF
            </button>
            <button disabled={generatedDocument.hasViolations} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              <PenLine size={16} />
              {generatedDocument.wh347.fields.statementOfCompliance.eSignatureStatus === "e-signed" ? "E-Signed" : "E-Sign Blocked"}
            </button>
          </div>

          <div className="bg-white border-2 border-slate-900 p-8 pt-12 min-h-[1056px] shadow-2xl overflow-hidden print:w-full print:border-none print:shadow-none print:p-0 relative font-serif">
            <div className="absolute top-4 right-8 border border-black p-1 text-[10px] text-center w-48 font-sans uppercase font-bold">
              OMB No. 1235-0008<br />Expires: 04/30/2026
            </div>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold uppercase tracking-widest border-b-2 border-black inline-block pb-1">U.S. Department of Labor</h2>
              <h3 className="text-lg font-bold uppercase mt-2">Wage and Hour Division</h3>
              <p className="font-sans text-sm mt-2">WH-347 Certified Payroll</p>
              <div className="mt-4 flex justify-between px-12 font-sans text-sm tracking-wide">
                <span>PAYROLL NO.: <span className="underline font-bold decoration-dotted">{setup.payrollNo}</span></span>
                <span>FOR WEEK ENDING: <span className="underline font-bold decoration-dotted">{setup.weekEnding}</span></span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 text-sm font-sans">
              <div className="border border-black p-2 min-h-16">
                <span className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Contractor or Subcontractor</span>
                <span className="font-bold">CircleWorks Inc.</span>
              </div>
              <div className="border border-black p-2 flex flex-col justify-between">
                <span className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Project and Location</span>
                <span className="font-bold">{setup.contractName}</span>
                <span className="font-bold">{setup.projectLocation}</span>
              </div>
              <div className="col-span-2 border border-black p-2 flex justify-between items-end">
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Project or Contract No.</span>
                  <span className="font-bold">{setup.contractNumber}</span>
                </div>
                <span className="font-bold text-slate-600 block pr-8">{setup.contractingAgency}</span>
              </div>
            </div>

            <table className="w-full text-[10px] font-sans border-collapse border border-black text-center mt-8">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-black p-1 w-32">Name & ID Number of Worker</th>
                  <th className="border border-black p-1 w-24">Work Classification</th>
                  <th className="border border-black p-1">Hours by Day</th>
                  <th className="border border-black p-1 w-10">Total Hours</th>
                  <th className="border border-black p-1 w-12">Rate of Pay</th>
                  <th className="border border-black p-1 w-14">Gross Earned</th>
                  <th className="border border-black p-1 w-20">Withholding & Deductions</th>
                  <th className="border border-black p-1 w-14">Net Wages</th>
                </tr>
              </thead>
              <tbody>
                {wh347Workers.map((worker) => (
                  <tr key={worker.id} className={worker.isUnderpaid ? "bg-red-50 text-red-900" : ""}>
                    <td className="border border-black p-2 font-bold text-left bg-white">
                      {worker.name}<br />
                      <span className="text-[9px] font-mono font-medium text-slate-500">{worker.maskedSsn}</span>
                    </td>
                    <td className="border border-black p-1 uppercase text-[9px]">{worker.classification}</td>
                    <td className="border border-black p-0">
                      <table className="w-full h-full">
                        <tbody>
                          <tr className="text-[7px] bg-slate-50 border-b border-black">{dayColumns.map((day) => <td key={day.key}>{day.label}</td>)}</tr>
                          <tr>
                            {dayColumns.map((day) => <td key={day.key} className="border-r border-black last:border-r-0 py-1 text-[8px]">{worker.hoursByDay[day.key] || "-"}</td>)}
                          </tr>
                        </tbody>
                      </table>
                    </td>
                    <td className="border border-black p-1 font-bold">{worker.totalHours}</td>
                    <td className={`border border-black p-1 font-mono ${worker.isUnderpaid ? "text-red-600 font-bold" : ""}`}>{currency.format(worker.hourlyRate)}</td>
                    <td className="border border-black p-1 font-mono">{currency.format(worker.grossWages)}</td>
                    <td className="border border-black p-0">
                      <div className="flex flex-col text-[8px] text-left px-1">
                        <span>W/H: {currency.format(worker.withholding)}</span>
                        <span>Ded: {currency.format(worker.deductions)}</span>
                        <span className="border-t border-slate-300 font-bold">Total: {currency.format(worker.totalDeductions)}</span>
                      </div>
                    </td>
                    <td className="border border-black p-1 font-bold font-mono bg-slate-50">{currency.format(worker.netWages)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-12 break-inside-avoid relative">
              <h3 className="font-bold uppercase text-base text-center border-b border-black pb-2 mb-4">Statement of Compliance</h3>
              <p className="text-xs leading-relaxed text-left text-justify indent-8 px-4">
                Date: <span className="underline font-bold decoration-dotted">{formatDate(generatedDocument.wh347.generatedAt)}</span>. I, <span className="underline font-bold decoration-dotted">{setup.adminSigner}</span> do hereby state:
              </p>
              <ol className="list-decimal pl-12 text-[10px] mt-4 space-y-3 pr-4 text-justify leading-relaxed">
                <li>That I pay or supervise the payment of the persons employed by the contractor or subcontractor on the designated project, and that all persons employed on said project have been paid the full weekly wages earned.</li>
                <li>That the payrolls required under this contract are correct and complete, and that the wage rates are not less than the applicable wage rates contained in the wage determination incorporated into the contract.</li>
                <li>That the classifications set forth for each laborer or mechanic conform with the work performed.</li>
              </ol>
              <div className="grid grid-cols-2 mt-12 px-8 gap-12 font-sans">
                <div className="border-t border-black pt-1">
                  <p className="text-[10px] font-bold uppercase">Name and Title</p>
                  <p className="text-sm font-serif italic text-slate-700 mt-2">{setup.adminSigner} - {setup.adminTitle}</p>
                </div>
                <div className="border-t border-black pt-1">
                  <p className="text-[10px] font-bold uppercase">Signature</p>
                  {generatedDocument.hasViolations ? (
                    <p className="text-xs font-bold text-red-500 mt-4 tracking-widest uppercase">Signature Blocked</p>
                  ) : (
                    <p className="text-xl font-black text-blue-800 mt-2 italic opacity-80" style={{ fontFamily: "'Brush Script MT', cursive" }}>{setup.adminSigner} (e-Signed)</p>
                  )}
                </div>
              </div>
              <p className="mt-8 text-[10px] font-sans text-slate-500">Generated file: {generatedDocument.wh347.fileName}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
