"use client";
import { useEffect, useMemo, useState } from "react";
import { 
  Settings2, Save, Wallet, AlertOctagon, TrendingUp, TrendingDown, 
  Download, AlertTriangle, Activity, FileText, Mail, Bell
} from "lucide-react";
import { toast } from "sonner";

type FundingStatus = "Funded" | "Pending" | "Insufficient Funds";

type FundingLedgerItem = {
  id: string;
  date: string;
  type: "Debit" | "Credit";
  amount: number;
  status: string;
  reference: string;
  payrollRun: string;
  note: string;
  matched: boolean;
};

type FundingAlert = {
  id: string;
  channel: "email" | "in-app";
  severity: "info" | "warning" | "critical";
  message: string;
};

type DebitWarning = {
  daysBeforeDebit: 7 | 3 | 1;
  channel: Array<"email" | "in-app">;
  enabled: boolean;
};

type FundingBalanceResponse = {
  impoundBalance: number;
  upcomingPayroll: number;
  pendingAchDebits: number;
  lastFundedAmount: number;
  lastFundedDate: string;
  nextFundingDate: string;
  status: FundingStatus;
  isBelowWarningThreshold: boolean;
  thresholdMultiple: number;
  alerts: FundingAlert[];
  debitWarnings: DebitWarning[];
};

type TrustStatement = {
  period: string;
  month: string;
  openingBalance: number;
  totalCredits: number;
  totalDebits: number;
  closingBalance: number;
  unmatchedItems: number;
};

type FundingHistoryResponse = {
  ledger: FundingLedgerItem[];
  statement: TrustStatement;
};

function fmtMoney(amount = 0) {
  return amount.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function fmtDate(value?: string, options?: Intl.DateTimeFormatOptions) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-US", options);
}

function fmtTime(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function statusBadgeClass(status: FundingStatus) {
  if (status === "Funded") return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300";
  if (status === "Pending") return "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300";
  return "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300";
}

function ledgerStatusBadgeClass(status: string) {
  if (status === "Pending") return "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300";
  if (status === "Failed") return "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300";
  return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300";
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"general" | "funding">("general");

  return (
    <div className="flex flex-col gap-6 pb-24 max-w-6xl mx-auto animate-in fade-in">
       <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
             <Settings2 size={28} className="text-blue-600" />
            Payroll Settings & Funding
          </h1>
          <p className="text-sm text-slate-500 mt-2">Configure payroll autopilot, approval chains, and monitor your trust account impound balances.</p>
        </div>
        {activeTab === "general" && (
          <button 
            onClick={() => toast.success("Settings Saved!")}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md flex items-center gap-2 transition-all"
          >
            <Save size={16} /> Save Settings
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-xl w-max">
        <button
          onClick={() => setActiveTab("general")}
          className={`px-5 py-2 text-sm font-bold rounded-lg transition-all ${
            activeTab === "general"
              ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          General Workflow Settings
        </button>
        <button
          onClick={() => setActiveTab("funding")}
          className={`px-5 py-2 text-sm font-bold rounded-lg transition-all ${
            activeTab === "funding"
              ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          Funding
        </button>
      </div>

      {activeTab === "general" && <GeneralSettingsTab />}
      {activeTab === "funding" && <FundingReconciliationTab />}
    </div>
  );
}

// ------------------------------------------
// GENERAL SETTINGS TAB (Original UI Ported)
// ------------------------------------------
function GeneralSettingsTab() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 space-y-10 animate-in slide-in-from-bottom-4 shadow-sm">
         <section>
           <h3 className="text-xl font-bold mb-4 border-b border-slate-100 dark:border-slate-800 pb-3 text-slate-800 dark:text-slate-100">Check Date Calculation</h3>
           <div className="grid gap-4 md:grid-cols-2">
             <label className="rounded-xl border-2 border-blue-500 bg-blue-50 p-5 dark:bg-blue-900/10">
               <div className="flex items-center gap-2">
                 <input type="radio" name="check-date-method" defaultChecked className="text-blue-600" />
                 <span className="text-sm font-bold text-slate-900 dark:text-white">Use scheduled payday</span>
               </div>
               <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">If payday lands on a bank holiday or weekend, move to the prior business day.</p>
             </label>
             <label className="rounded-xl border border-slate-200 p-5 dark:border-slate-700">
               <div className="flex items-center gap-2">
                 <input type="radio" name="check-date-method" className="text-blue-600" />
                 <span className="text-sm font-bold text-slate-900 dark:text-white">Always pay after period close</span>
               </div>
               <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Calculate check dates from pay period end plus configured processing days.</p>
             </label>
           </div>
         </section>

         <section>
           <h3 className="text-xl font-bold mb-4 border-b border-slate-100 dark:border-slate-800 pb-3 text-slate-800 dark:text-slate-100">Payroll Bank Account</h3>
           <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800/50">
             <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
               <div>
                 <p className="text-sm font-black text-slate-900 dark:text-white">Operating Checking •••• 4821</p>
                 <p className="mt-1 text-sm text-slate-500">ACH debit account used for payroll funding and tax payments.</p>
               </div>
               <button className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                 Change account
               </button>
             </div>
           </div>
         </section>

         <section>
           <h3 className="text-xl font-bold mb-4 border-b border-slate-100 dark:border-slate-800 pb-3 text-slate-800 dark:text-slate-100">Funding Timing</h3>
           <div className="grid grid-cols-2 gap-4">
             <div className="p-5 flex flex-col justify-between border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/10 rounded-xl cursor-pointer">
                <div className="flex items-center gap-2 mb-3">
                  <input type="radio" name="funding" defaultChecked className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">2-Day ACH (Default)</h4>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Submit payroll by Wednesday 5PM PT to pay employees on Friday. Zero outbound fees.</p>
             </div>
             <div className="p-5 flex flex-col justify-between border border-slate-200 dark:border-slate-700 rounded-xl opacity-60">
                <div className="flex items-center gap-2 mb-3">
                  <input type="radio" name="funding" disabled className="w-4 h-4" />
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">Next-Day Expedited ACH <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest font-black">Locked</span></h4>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Submit payroll by Thursday 5PM PT. Requires additional automated underwriting approval to unlock.</p>
             </div>
           </div>
         </section>

         <section>
           <h3 className="text-xl font-bold mb-4 border-b border-slate-100 dark:border-slate-800 pb-3 text-slate-800 dark:text-slate-100">Payroll Approver Chain</h3>
           <div className="space-y-4">
             <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Select who must mathematically approve payroll before ACH debit requests are issued.</p>
             
             <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
               <span className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-black text-slate-700 dark:text-slate-300 shadow-sm">1</span>
               <select className="flex-1 max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none">
                 <option>Sarah Chen (Finance Manager)</option>
               </select>
             </div>
             
             <div className="flex items-center justify-center h-4 w-8 border-r-2 border-slate-200 dark:border-slate-700" />
             
             <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
               <span className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-black text-slate-700 dark:text-slate-300 shadow-sm">2</span>
               <select className="flex-1 max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none">
                 <option>Michael Torres (HR Director)</option>
               </select>
             </div>
             
             <button className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-4 px-2">
               + Add Sequential Step
             </button>
           </div>
         </section>

         <section>
           <h3 className="text-xl font-bold mb-4 border-b border-slate-100 dark:border-slate-800 pb-3 text-slate-800 dark:text-slate-100">Autopilot Services</h3>
           <label className="flex items-start gap-4 p-5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer transition-colors">
             <input type="checkbox" className="mt-1 w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
             <div>
               <h4 className="font-bold text-slate-900 dark:text-white">Enable AutoPayroll Processing</h4>
               <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">Automatically batch and run scheduled payroll for designated Autopilot salaried employees 2 days before deadline. You will still receive a preview exception-report email 24 hours prior to funds capture.</p>
             </div>
           </label>
         </section>

         <section>
           <h3 className="text-xl font-bold mb-4 border-b border-slate-100 dark:border-slate-800 pb-3 text-slate-800 dark:text-slate-100">Notification Settings</h3>
           <div className="grid gap-3 md:grid-cols-3">
             {["Payroll draft ready", "Approval requested", "Payroll processed"].map((label) => (
               <label key={label} className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                 <input type="checkbox" defaultChecked className="h-5 w-5 rounded border-slate-300 text-blue-600" />
                 <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{label}</span>
               </label>
             ))}
           </div>
         </section>
    </div>
  );
}

// ------------------------------------------
// FUNDING RECONCILIATION TAB (New logic)
// ------------------------------------------
function FundingReconciliationTab() {
  const [balanceData, setBalanceData] = useState<FundingBalanceResponse | null>(null);
  const [historyData, setHistoryData] = useState<FundingHistoryResponse | null>(null);
  const [startDate, setStartDate] = useState("2026-05-01");
  const [endDate, setEndDate] = useState("2026-05-31");
  const [statementMonth, setStatementMonth] = useState("2026-05");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadFundingData() {
      setError(null);
      setLoading(true);

      const params = new URLSearchParams({ startDate, endDate, statementMonth });
      try {
        const [balanceResponse, historyResponse] = await Promise.all([
          fetch("/api/payroll/funding/balance", { cache: "no-store" }),
          fetch(`/api/payroll/funding/history?${params.toString()}`, { cache: "no-store" }),
        ]);

        if (!balanceResponse.ok || !historyResponse.ok) {
          throw new Error("Funding data could not be loaded.");
        }

        const [balance, history] = (await Promise.all([
          balanceResponse.json(),
          historyResponse.json(),
        ])) as [FundingBalanceResponse, FundingHistoryResponse];

        if (!ignore) {
          setBalanceData(balance);
          setHistoryData(history);
        }
      } catch (err) {
        console.error(err);
        if (!ignore) setError("Funding data could not be loaded.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadFundingData();

    return () => {
      ignore = true;
    };
  }, [startDate, endDate, statementMonth]);

  const ledger = useMemo(() => historyData?.ledger ?? [], [historyData]);
  const statement = historyData?.statement;
  const unmatchedCount = statement?.unmatchedItems ?? ledger.filter((tx) => !tx.matched).length;
  const fundingStatus = balanceData?.status ?? "Pending";

  const exportCsv = () => {
    const rows = [
      ["Date", "Type", "Amount", "Status", "Reference #", "Payroll Run"],
      ...ledger.map((tx) => [tx.date, tx.type, tx.amount, tx.status, tx.reference, tx.payrollRun]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `funding-history-${startDate}-to-${endDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Funding history CSV exported");
  };

  const exportPdf = () => {
    const reportWindow = window.open("", "_blank", "width=960,height=720");
    if (!reportWindow) {
      toast.error("Allow pop-ups to export the funding PDF.");
      return;
    }

    const rows = ledger.map((tx) => `
      <tr class="${tx.matched ? "" : "unmatched"}">
        <td>${escapeHtml(fmtDate(tx.date, { month: "short", day: "numeric", year: "numeric" }))}</td>
        <td>${escapeHtml(tx.type)}</td>
        <td class="amount">${tx.type === "Credit" ? "+" : "-"}${escapeHtml(fmtMoney(tx.amount))}</td>
        <td>${escapeHtml(tx.status)}${tx.matched ? "" : " / Unmatched"}</td>
        <td>${escapeHtml(tx.reference)}</td>
        <td>${escapeHtml(tx.payrollRun)}</td>
      </tr>
    `).join("");

    reportWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>Funding History ${escapeHtml(startDate)} to ${escapeHtml(endDate)}</title>
          <style>
            body { color: #0f172a; font-family: Inter, Arial, sans-serif; margin: 32px; }
            h1 { font-size: 22px; margin: 0 0 6px; }
            .meta { color: #64748b; font-size: 12px; margin-bottom: 22px; }
            .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 22px; }
            .summary div { border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; }
            .label { color: #64748b; display: block; font-size: 10px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
            .value { display: block; font-size: 15px; font-weight: 800; margin-top: 4px; }
            table { border-collapse: collapse; font-size: 12px; width: 100%; }
            th { background: #f8fafc; color: #475569; font-size: 10px; letter-spacing: .08em; text-align: left; text-transform: uppercase; }
            th, td { border-bottom: 1px solid #e2e8f0; padding: 9px; }
            .amount { text-align: right; }
            .unmatched { background: #fffbeb; }
            @media print { body { margin: 20mm; } button { display: none; } }
          </style>
        </head>
        <body>
          <button onclick="window.print()" style="float:right;padding:8px 12px">Print / Save PDF</button>
          <h1>Payroll Funding History</h1>
          <div class="meta">${escapeHtml(startDate)} to ${escapeHtml(endDate)} · Statement ${escapeHtml(statement?.period ?? "-")}</div>
          <div class="summary">
            <div><span class="label">Impound Balance</span><span class="value">${escapeHtml(fmtMoney(balanceData?.impoundBalance))}</span></div>
            <div><span class="label">Pending ACH Debits</span><span class="value">${escapeHtml(fmtMoney(balanceData?.pendingAchDebits))}</span></div>
            <div><span class="label">Closing Balance</span><span class="value">${escapeHtml(fmtMoney(statement?.closingBalance))}</span></div>
            <div><span class="label">Unmatched</span><span class="value">${unmatchedCount}</span></div>
          </div>
          <table>
            <thead>
              <tr><th>Date</th><th>Type</th><th class="amount">Amount</th><th>Status</th><th>Reference #</th><th>Payroll Run</th></tr>
            </thead>
            <tbody>${rows || `<tr><td colspan="6">No funding activity for this date range.</td></tr>`}</tbody>
          </table>
        </body>
      </html>
    `);
    reportWindow.document.close();
    reportWindow.focus();
    toast.success("Funding history PDF report opened");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <Activity className="animate-spin text-slate-400" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm font-semibold text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
        {error}
      </div>
    );
  }

  return (
    <div className="animate-in slide-in-from-bottom-4 space-y-6">
      {balanceData?.isBelowWarningThreshold && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-xl flex items-start gap-4">
          <AlertOctagon className="text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-bold text-amber-900 dark:text-amber-100">Low Impound Balance</h4>
            <p className="text-sm text-amber-800 dark:text-amber-200/70 mt-1">Your trust account balance ({fmtMoney(balanceData.impoundBalance)}) is below the required {balanceData.thresholdMultiple}x upcoming payroll threshold ({fmtMoney(balanceData.upcomingPayroll * balanceData.thresholdMultiple)}). Email and in-app alerts are enabled for finance admins.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {(balanceData?.alerts ?? []).map((alert) => (
          <div key={alert.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-start gap-3 shadow-sm">
            {alert.channel === "email" ? <Mail size={17} className="text-blue-600 mt-0.5" /> : <Bell size={17} className="text-blue-600 mt-0.5" />}
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-slate-500">{alert.channel} alert</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1">{alert.message}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-500 mb-1 flex items-center justify-between gap-3">
              Impound Balance
              <span className={`text-[10px] px-2 py-0.5 rounded uppercase tracking-wider font-bold ${statusBadgeClass(fundingStatus)}`}>{fundingStatus}</span>
            </h3>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">{fmtMoney(balanceData?.impoundBalance)}</p>
         </div>

         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-500 mb-1">Pending ACH Debits</h3>
            <p className="text-2xl font-bold text-slate-700 dark:text-slate-300 mt-3">{fmtMoney(balanceData?.pendingAchDebits)}</p>
         </div>

         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-500 mb-1">Last Funded Amount</h3>
            <p className="text-2xl font-bold text-slate-700 dark:text-slate-300 mt-3">{fmtMoney(balanceData?.lastFundedAmount)}</p>
            <p className="text-xs text-slate-400 mt-1">{fmtDate(balanceData?.lastFundedDate, { month: "short", day: "numeric" })}</p>
         </div>

         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/10 dark:to-slate-900">
            <h3 className="text-sm font-bold text-slate-500 mb-1">Next Funding Date</h3>
            <p className="text-xl font-bold text-slate-900 dark:text-white mt-3">{fmtDate(balanceData?.nextFundingDate, { month: "long", day: "numeric" })}</p>
            <p className="text-xs text-slate-500 mt-1">{fmtTime(balanceData?.nextFundingDate)}</p>
         </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Debit Date Warnings</h3>
            <p className="mt-1 text-xs text-slate-500">Email and in-app reminders are active before the next payroll debit date.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(balanceData?.debitWarnings ?? []).map((warning) => (
              <span key={warning.daysBeforeDebit} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                {warning.daysBeforeDebit}-day
                <span className="text-slate-400">{warning.channel.join(" + ")}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
           <div className="flex flex-col gap-3 mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
             <div className="flex items-center gap-2 text-slate-500">
               <Wallet size={20} />
               <h3 className="font-bold text-lg text-slate-900 dark:text-white">Trust Account Statement</h3>
             </div>
             <input
               type="month"
               value={statementMonth}
               onChange={(event) => setStatementMonth(event.target.value)}
               className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
             />
           </div>
           
           <div className="space-y-4 text-sm mb-6">
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Statement Period</span>
                <span className="font-medium text-right">{statement?.period ?? "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Opening Balance</span>
                <span className="font-medium">{fmtMoney(statement?.openingBalance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-600 flex items-center gap-1"><TrendingUp size={14}/> Credits</span>
                <span className="font-bold text-emerald-600">+{fmtMoney(statement?.totalCredits)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1"><TrendingDown size={14}/> Debits</span>
                <span className="font-bold">-{fmtMoney(statement?.totalDebits)}</span>
              </div>
              <div className="flex justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                <span className="font-bold text-slate-900 dark:text-white text-base">Closing Balance</span>
                <span className="font-black text-slate-900 dark:text-white text-lg">{fmtMoney(statement?.closingBalance)}</span>
              </div>
           </div>

           <div className="bg-amber-100/50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 rounded-lg p-3 text-xs flex gap-2">
              <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={14} />
              <p className="text-amber-800 dark:text-amber-500">{unmatchedCount} unmatched item{unmatchedCount === 1 ? "" : "s"} found. Match transactions against payroll runs for reconciliation.</p>
           </div>
        </div>

        <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
           <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
             <h3 className="font-bold text-lg text-slate-900 dark:text-white">Funding History</h3>
             <div className="flex flex-wrap items-center gap-2">
               <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="px-2 py-1.5 border border-slate-200 dark:border-slate-700 rounded text-xs bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300" />
               <span className="text-xs text-slate-400">to</span>
               <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} className="px-2 py-1.5 border border-slate-200 dark:border-slate-700 rounded text-xs bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300" />
               <button onClick={exportCsv} className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded hover:bg-slate-200 transition-colors dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
                 <Download size={14} /> CSV
               </button>
               <button onClick={exportPdf} className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded hover:bg-slate-200 transition-colors dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
                 <FileText size={14} /> PDF
               </button>
             </div>
           </div>

           <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-sm">
                 <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                   <tr>
                     <th className="px-4 py-3">Date</th>
                     <th className="px-4 py-3">Type</th>
                     <th className="px-4 py-3 text-right">Amount</th>
                     <th className="px-4 py-3 text-center">Status</th>
                     <th className="px-4 py-3 text-center">Reference #</th>
                     <th className="px-4 py-3 text-center">Payroll Run</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {ledger.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-10 text-center text-sm font-semibold text-slate-500">No funding activity found for this date range.</td>
                      </tr>
                    )}
                    {ledger.map((tx) => {
                      const isUnmatched = !tx.matched;
                      return (
                        <tr key={tx.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/30 ${isUnmatched ? "bg-amber-50/40 dark:bg-amber-900/10" : ""}`}>
                          <td className="px-4 py-3 whitespace-nowrap text-slate-500 text-xs">
                             {fmtDate(tx.date, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </td>
                          <td className={`px-4 py-3 font-medium ${isUnmatched ? "text-amber-800 dark:text-amber-400" : "text-slate-900 dark:text-slate-200"}`}>
                             {tx.type}
                             <p className="text-[11px] text-slate-400 font-normal mt-0.5">{tx.note}</p>
                          </td>
                          <td className={`px-4 py-3 text-right font-bold ${tx.type === "Credit" ? "text-emerald-600" : "text-slate-700 dark:text-slate-300"}`}>
                             {tx.type === "Credit" ? "+" : "-"}{fmtMoney(tx.amount)}
                          </td>
                          <td className="px-4 py-3 text-center">
                              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded ${ledgerStatusBadgeClass(tx.status)}`}>{tx.status}</span>
                              {isUnmatched && <span className="inline-block ml-2 text-[10px] bg-amber-100 text-amber-700 px-1 py-0.5 rounded dark:bg-amber-500/15 dark:text-amber-300">Unmatched</span>}
                            </td>
                          <td className="px-4 py-3 text-center text-xs font-mono text-slate-400">{tx.reference}</td>
                          <td className="px-4 py-3 text-center">
                             {isUnmatched ? (
                               <button className="text-[10px] font-bold text-blue-600 border border-blue-200 px-2 py-0.5 rounded hover:bg-blue-50 dark:border-blue-900 dark:hover:bg-blue-950/40">Match Run</button>
                             ) : (
                               <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded">{tx.payrollRun}</span>
                             )}
                          </td>
                        </tr>
                      );
                    })}
                 </tbody>
              </table>
           </div>
        </div>
      </div>

    </div>
  );
}
