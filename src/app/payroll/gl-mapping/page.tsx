"use client";

import React, { useMemo, useState } from "react";
import {
  CheckCircle2,
  Download,
  FileText,
  LayoutGrid,
  RefreshCw,
  Save,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { mockGLAccounts, mockPayrollComponents, type PayrollComponent } from "@/data/mockGL";

type AccountingProvider = "QuickBooks Online" | "Xero" | "NetSuite" | "Generic CSV";

const providerDetails: Record<AccountingProvider, string> = {
  "QuickBooks Online": "Chart of Accounts API",
  Xero: "Chart of Accounts API",
  NetSuite: "CSV import format",
  "Generic CSV": "User-defined column mapping",
};

const categories: PayrollComponent["category"][] = [
  "Earnings",
  "Deductions",
  "Taxes",
  "Employer Contributions",
];

const previewGroups: PayrollComponent["previewGroup"][] = [
  "Gross Pay",
  "Tax Liabilities",
  "Net Pay",
  "Employer Costs",
];

const mockTotals: Record<string, number> = {
  "comp-1": 85000,
  "comp-2": 5000,
  "comp-3": 10000,
  "comp-4": 7650,
  "comp-5": 600,
  "comp-6": 12000,
  "comp-7": 4000,
  "comp-8": 7650,
  "comp-9": 2500,
  "comp-10": 4000,
  "comp-11": 69850,
  "comp-12": 9000,
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function buildJournalRows(components: PayrollComponent[]) {
  return components.map((component) => {
    const account = mockGLAccounts.find((item) => item.id === component.assignedGlId);
    const amount = mockTotals[component.id] || 0;

    return {
      date: "2026-05-29",
      group: component.previewGroup,
      description: component.name,
      debitAccount: component.defaultEntryType === "Debit" ? `${account?.code ?? "UNMAPPED"} ${account?.name ?? ""}`.trim() : "",
      creditAccount: component.defaultEntryType === "Credit" ? `${account?.code ?? "UNMAPPED"} ${account?.name ?? ""}`.trim() : "",
      amount,
      mapped: Boolean(account),
    };
  }).filter((row) => row.amount > 0);
}

export default function GLMappingPage() {
  const [components, setComponents] = useState<PayrollComponent[]>(mockPayrollComponents);
  const [activeCategory, setActiveCategory] = useState<PayrollComponent["category"]>("Earnings");
  const [templateName, setTemplateName] = useState("Default Payroll GL Mapping");
  const [activeProvider, setActiveProvider] = useState<AccountingProvider>("QuickBooks Online");
  const [showPreview, setShowPreview] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const journalRows = useMemo(() => buildJournalRows(components), [components]);
  const filteredComponents = components.filter((component) => component.category === activeCategory);
  const unmappedCount = components.filter((component) => !component.assignedGlId).length;

  const updateComponent = (componentId: string, updates: Partial<PayrollComponent>) => {
    setComponents((current) =>
      current.map((component) =>
        component.id === componentId ? { ...component, ...updates } : component
      )
    );
  };

  const handleSaveTemplate = () => {
    toast.success("GL mapping template saved", {
      description: `${templateName} will be used for upcoming payroll journal entries.`,
    });
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const response = await fetch("/api/payroll/gl-mapping/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: activeProvider,
          templateName,
          mappings: components.map((component) => ({
            payrollComponentId: component.id,
            glAccountId: component.assignedGlId,
            debitCredit: component.defaultEntryType,
            deptSplit: component.deptSplit,
          })),
          journalEntries: journalRows,
        }),
      });

      if (!response.ok) {
        throw new Error("Sync failed");
      }

      toast.success("Journal entries approved", {
        description: `Sent to ${activeProvider}.`,
      });
      setShowPreview(false);
    } catch {
      toast.error("Unable to sync journal entries");
    } finally {
      setSyncing(false);
    }
  };

  const exportCsv = () => {
    const headers = ["Date", "Description", "Debit Account", "Credit Account", "Amount"];
    const lines = journalRows.map((row) => [
      row.date,
      row.description,
      row.debitAccount,
      row.creditAccount,
      row.amount.toFixed(2),
    ]);
    const csv = [headers, ...lines].map((line) => line.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "payroll-journal-preview.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportPdf = () => {
    window.print();
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 pb-24">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">GL Mapping</h1>
          <p className="mt-2 max-w-3xl text-slate-500 dark:text-slate-400">
            Map payroll earnings, deductions, taxes, and employer contributions to accounting system accounts before payroll posts.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowPreview(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <LayoutGrid size={16} /> Journal Preview
          </button>
          <button
            onClick={handleSaveTemplate}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            <Save size={16} /> Save Template
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.5fr]">
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200 p-5 dark:border-slate-800">
            <h2 className="text-base font-black text-slate-900 dark:text-white">Payroll Line Items</h2>
            <p className="mt-1 text-sm text-slate-500">Select a component group to map accounts.</p>
          </div>
          <div className="p-3">
            {categories.map((category) => {
              const count = components.filter((component) => component.category === category).length;
              return (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`mb-2 flex w-full items-center justify-between rounded-lg px-4 py-3 text-left transition-colors ${
                    activeCategory === category
                      ? "bg-blue-50 text-blue-800 ring-1 ring-blue-200"
                      : "text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                  }`}
                >
                  <span className="text-sm font-bold">{category}</span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-black text-slate-500 dark:bg-slate-800">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="border-t border-slate-200 p-5 text-sm dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700 dark:text-slate-200">Mapping status</span>
              <span className={unmappedCount ? "font-black text-amber-600" : "font-black text-emerald-600"}>
                {unmappedCount ? `${unmappedCount} unmapped` : "Complete"}
              </span>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="grid gap-4 border-b border-slate-200 p-5 dark:border-slate-800 md:grid-cols-[1fr_220px]">
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-slate-500">Named template</label>
              <input
                value={templateName}
                onChange={(event) => setTemplateName(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-slate-500">Accounting system</label>
              <select
                value={activeProvider}
                onChange={(event) => setActiveProvider(event.target.value as AccountingProvider)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              >
                {(Object.keys(providerDetails) as AccountingProvider[]).map((provider) => (
                  <option key={provider}>{provider}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="bg-slate-50 text-xs font-black uppercase tracking-wider text-slate-500 dark:bg-slate-800/70">
                <tr>
                  <th className="px-4 py-3">Payroll Component</th>
                  <th className="px-4 py-3">GL Account Code</th>
                  <th className="px-4 py-3">GL Account Name</th>
                  <th className="px-4 py-3">Debit/Credit</th>
                  <th className="px-4 py-3">Dept Split</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredComponents.map((component) => {
                  const selectedAccount = mockGLAccounts.find((account) => account.id === component.assignedGlId);
                  return (
                    <tr key={component.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{component.name}</td>
                      <td className="px-4 py-3">
                        <select
                          value={component.assignedGlId || ""}
                          onChange={(event) => updateComponent(component.id, { assignedGlId: event.target.value || null })}
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950"
                        >
                          <option value="">Select</option>
                          {mockGLAccounts.map((account) => (
                            <option key={account.id} value={account.id}>
                              {account.code}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {selectedAccount?.name ?? "Unmapped"}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={component.defaultEntryType}
                          onChange={(event) => updateComponent(component.id, { defaultEntryType: event.target.value as PayrollComponent["defaultEntryType"] })}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-black outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950"
                        >
                          <option>Debit</option>
                          <option>Credit</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={component.deptSplit}
                          onChange={(event) => updateComponent(component.id, { deptSplit: event.target.value as PayrollComponent["deptSplit"] })}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950"
                        >
                          <option>None</option>
                          <option>Employee Department</option>
                          <option>Project Code</option>
                          <option>Location</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section className="grid gap-3 md:grid-cols-4">
        {(Object.keys(providerDetails) as AccountingProvider[]).map((provider) => (
          <button
            key={provider}
            onClick={() => setActiveProvider(provider)}
            className={`rounded-xl border p-4 text-left transition-colors ${
              activeProvider === provider
                ? "border-blue-300 bg-blue-50 text-blue-900"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            }`}
          >
            <p className="text-sm font-black">{provider}</p>
            <p className="mt-1 text-xs opacity-75">{providerDetails[provider]}</p>
          </button>
        ))}
      </section>

      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
            <div className="flex flex-col gap-4 border-b border-slate-200 p-5 dark:border-slate-800 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Journal Entry Preview</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Review entries before payroll completes. Approve to send entries to {activeProvider}.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200">
                  <Download size={15} /> CSV
                </button>
                <button onClick={exportPdf} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200">
                  <FileText size={15} /> PDF
                </button>
                <button onClick={() => setShowPreview(false)} className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200">
                  Close
                </button>
              </div>
            </div>

            <div className="overflow-y-auto p-5">
              {previewGroups.map((group) => (
                <div key={group} className="mb-6 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="bg-slate-900 px-4 py-3 text-xs font-black uppercase tracking-wider text-white">
                    {group}
                  </div>
                  <table className="w-full min-w-[900px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-black uppercase tracking-wider text-slate-500 dark:bg-slate-800">
                      <tr>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Description</th>
                        <th className="px-4 py-3">Debit Account</th>
                        <th className="px-4 py-3">Credit Account</th>
                        <th className="px-4 py-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {journalRows.filter((row) => row.group === group).map((row) => (
                        <tr key={`${row.group}-${row.description}`} className={!row.mapped ? "bg-red-50/60" : ""}>
                          <td className="px-4 py-3 font-mono text-xs text-slate-500">{row.date}</td>
                          <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{row.description}</td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{row.debitAccount || "-"}</td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{row.creditAccount || "-"}</td>
                          <td className="px-4 py-3 text-right font-mono font-black">{formatCurrency(row.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950 sm:flex-row sm:items-center sm:justify-between">
              <span className="inline-flex items-center gap-2 text-xs font-bold text-slate-500">
                <CheckCircle2 size={15} className="text-emerald-600" />
                {activeProvider}: {providerDetails[activeProvider]}
              </span>
              <button
                onClick={handleSync}
                disabled={syncing || unmappedCount > 0}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-black text-white shadow-sm transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                {syncing ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
                Approve and Send Journal Entries
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
