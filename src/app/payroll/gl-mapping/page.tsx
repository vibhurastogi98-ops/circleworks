"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileText,
  LayoutGrid,
  Link2,
  RefreshCw,
  Save,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import {
  mockGLAccounts,
  mockPayrollComponents,
  type GLAccount,
  type PayrollComponent,
} from "@/data/mockGL";

type AccountingProvider = "QuickBooks Online" | "Xero" | "NetSuite" | "Generic CSV";
type ProviderStatus = "connected" | "available";

type ProviderOption = {
  name: AccountingProvider;
  source: string;
  status: ProviderStatus;
};

type MappingTemplate = {
  id: string;
  name: string;
  isDefault?: boolean;
  mappingCount: number;
  updatedAt: string;
};

type JournalRow = {
  date: string;
  group: PayrollComponent["previewGroup"];
  description: string;
  debitAccount: string;
  creditAccount: string;
  amount: number;
  mapped: boolean;
};

const providerDetails: Record<AccountingProvider, string> = {
  "QuickBooks Online": "Chart of Accounts API",
  Xero: "Chart of Accounts API",
  NetSuite: "CSV import format",
  "Generic CSV": "User-defined column mapping",
};

const defaultProviders: ProviderOption[] = (Object.keys(providerDetails) as AccountingProvider[]).map((name) => ({
  name,
  source: providerDetails[name],
  status: name === "QuickBooks Online" ? "connected" : "available",
}));

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

const genericCsvColumns = [
  ["Posting Date", "Date"],
  ["Memo", "Description"],
  ["Debit GL", "Debit Account"],
  ["Credit GL", "Credit Account"],
  ["Line Amount", "Amount"],
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function buildJournalRows(components: PayrollComponent[], accounts: GLAccount[]): JournalRow[] {
  return components
    .map((component) => {
      const account = accounts.find((item) => item.id === component.assignedGlId);
      const amount = mockTotals[component.id] || 0;
      const accountLabel = `${account?.code ?? "UNMAPPED"} ${account?.name ?? ""}`.trim();

      return {
        date: "2026-05-29",
        group: component.previewGroup,
        description: component.name,
        debitAccount: component.defaultEntryType === "Debit" ? accountLabel : "",
        creditAccount: component.defaultEntryType === "Credit" ? accountLabel : "",
        amount,
        mapped: Boolean(account),
      };
    })
    .filter((row) => row.amount > 0);
}

export default function GLMappingPage() {
  const [components, setComponents] = useState<PayrollComponent[]>(mockPayrollComponents);
  const [accounts, setAccounts] = useState<GLAccount[]>(mockGLAccounts);
  const [providers, setProviders] = useState<ProviderOption[]>(defaultProviders);
  const [templates, setTemplates] = useState<MappingTemplate[]>([]);
  const [activeCategory, setActiveCategory] = useState<PayrollComponent["category"]>("Earnings");
  const [activeComponentId, setActiveComponentId] = useState(mockPayrollComponents[0]?.id ?? "");
  const [templateName, setTemplateName] = useState("Default Payroll GL Mapping");
  const [activeProvider, setActiveProvider] = useState<AccountingProvider>("QuickBooks Online");
  const [showPreview, setShowPreview] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadMapping() {
      try {
        const response = await fetch("/api/payroll/gl-mapping", { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to load GL mapping");
        const data = await response.json();

        if (cancelled) return;
        const apiComponents = data.payrollComponents ?? mockPayrollComponents;
        setAccounts(data.chartOfAccounts ?? mockGLAccounts);
        setComponents(apiComponents);
        setProviders(data.providers ?? defaultProviders);
        setTemplates(data.templates ?? []);
        setActiveProvider((data.provider ?? "QuickBooks Online") as AccountingProvider);
        setTemplateName(data.templates?.[0]?.name ?? "Default Payroll GL Mapping");
        setActiveComponentId(apiComponents[0]?.id ?? mockPayrollComponents[0]?.id ?? "");
      } catch {
        if (!cancelled) {
          toast.error("Using local GL mapping defaults", {
            description: "The accounting integration endpoint did not respond.",
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadMapping();
    return () => {
      cancelled = true;
    };
  }, []);

  const journalRows = useMemo(() => buildJournalRows(components, accounts), [accounts, components]);
  const filteredComponents = components.filter((component) => component.category === activeCategory);
  const unmappedCount = components.filter((component) => !component.assignedGlId).length;
  const mappedCount = components.length - unmappedCount;
  const totalJournalAmount = journalRows.reduce((sum, row) => sum + row.amount, 0);
  const activeProviderDetails = providers.find((provider) => provider.name === activeProvider);

  const updateComponent = (componentId: string, updates: Partial<PayrollComponent>) => {
    setComponents((current) =>
      current.map((component) =>
        component.id === componentId ? { ...component, ...updates } : component
      )
    );
  };

  const handleSaveTemplate = () => {
    const trimmedName = templateName.trim();
    if (!trimmedName) {
      toast.error("Template name is required");
      return;
    }

    const savedTemplate: MappingTemplate = {
      id: `tpl-${trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      name: trimmedName,
      mappingCount: components.length,
      updatedAt: new Date().toISOString(),
    };

    setTemplates((current) => [
      savedTemplate,
      ...current.filter((template) => template.name !== trimmedName),
    ]);
    toast.success("GL mapping template saved", {
      description: `${trimmedName} will be used for upcoming payroll journal entries.`,
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
        const error = await response.json().catch(() => null);
        throw new Error(error?.error ?? "Sync failed");
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
    const csv = [headers, ...lines]
      .map((line) => line.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
      .join("\n");
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
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
              <Link2 size={20} />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Payroll GL Mapping</h1>
          </div>
          <p className="mt-2 max-w-3xl text-slate-500 dark:text-slate-400">
            Map payroll earnings, deductions, taxes, and employer contributions to accounting system accounts before payroll posts.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowPreview(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <LayoutGrid size={16} /> Preview Journal
          </button>
          <button
            onClick={handleSaveTemplate}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            <Save size={16} /> Save Template
          </button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-black uppercase tracking-wider text-slate-500">Mapped components</p>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{mappedCount}/{components.length}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-black uppercase tracking-wider text-slate-500">Journal preview</p>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{formatCurrency(totalJournalAmount)}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-black uppercase tracking-wider text-slate-500">Active integration</p>
          <p className="mt-2 truncate text-sm font-black text-slate-900 dark:text-white">{activeProvider}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-black uppercase tracking-wider text-slate-500">Template</p>
          <p className="mt-2 truncate text-sm font-black text-slate-900 dark:text-white">{templateName || "Untitled"}</p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
        <section className="rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200 p-5 dark:border-slate-800">
            <h2 className="text-base font-black text-slate-900 dark:text-white">Payroll Line Items</h2>
            <p className="mt-1 text-sm text-slate-500">Select a component or group to review its GL mapping.</p>
          </div>
          <div className="max-h-[640px] overflow-y-auto p-3">
            {categories.map((category) => {
              const categoryComponents = components.filter((component) => component.category === category);
              const mappedInCategory = categoryComponents.filter((component) => component.assignedGlId).length;

              return (
                <div key={category} className="mb-3">
                  <button
                    onClick={() => {
                      setActiveCategory(category);
                      setActiveComponentId(categoryComponents[0]?.id ?? activeComponentId);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-left transition-colors ${
                      activeCategory === category
                        ? "bg-blue-50 text-blue-800 ring-1 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-200 dark:ring-blue-500/30"
                        : "text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span className="text-sm font-bold">{category}</span>
                    <span className="rounded-full bg-white px-2 py-0.5 text-xs font-black text-slate-500 shadow-sm dark:bg-slate-800">
                      {mappedInCategory}/{categoryComponents.length}
                    </span>
                  </button>
                  <div className="mt-2 flex flex-col gap-1 pl-2">
                    {categoryComponents.map((component) => {
                      const active = component.id === activeComponentId;
                      const account = accounts.find((item) => item.id === component.assignedGlId);

                      return (
                        <button
                          key={component.id}
                          type="button"
                          onClick={() => {
                            setActiveCategory(component.category);
                            setActiveComponentId(component.id);
                          }}
                          className={`rounded-lg border px-3 py-2 text-left transition-colors ${
                            active
                              ? "border-blue-200 bg-blue-50 dark:border-blue-500/30 dark:bg-blue-500/10"
                              : "border-transparent hover:border-slate-200 hover:bg-slate-50 dark:hover:border-slate-700 dark:hover:bg-slate-800/60"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate text-xs font-bold text-slate-800 dark:text-slate-100">{component.name}</span>
                            {account ? (
                              <CheckCircle2 size={14} className="shrink-0 text-emerald-600" />
                            ) : (
                              <AlertCircle size={14} className="shrink-0 text-amber-600" />
                            )}
                          </div>
                          <p className="mt-1 truncate text-[11px] font-mono text-slate-500">
                            {account ? `${account.code} ${account.name}` : "Unmapped"}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
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

        <section className="rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="grid gap-4 border-b border-slate-200 p-5 dark:border-slate-800 lg:grid-cols-[1fr_220px_220px]">
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
                {providers.map((provider) => (
                  <option key={provider.name}>{provider.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-slate-500">Saved templates</label>
              <select
                value={templateName}
                onChange={(event) => setTemplateName(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              >
                {[{ name: templateName, id: "current" }, ...templates]
                  .filter((template, index, list) => list.findIndex((item) => item.name === template.name) === index)
                  .map((template) => (
                    <option key={template.id} value={template.name}>{template.name}</option>
                  ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3 text-xs dark:border-slate-800">
            <span className="font-bold text-slate-500">
              Showing {filteredComponents.length} {activeCategory.toLowerCase()} component{filteredComponents.length === 1 ? "" : "s"}
              {loading ? " while syncing chart of accounts..." : ""}
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 font-black text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {activeProviderDetails?.source ?? providerDetails[activeProvider]}
            </span>
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
                  const selectedAccount = accounts.find((account) => account.id === component.assignedGlId);
                  const isActive = component.id === activeComponentId;

                  return (
                    <tr
                      key={component.id}
                      className={isActive ? "bg-blue-50/60 dark:bg-blue-500/10" : "hover:bg-slate-50/70 dark:hover:bg-slate-800/30"}
                    >
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{component.name}</td>
                      <td className="px-4 py-3">
                        <select
                          value={component.assignedGlId || ""}
                          onChange={(event) => updateComponent(component.id, { assignedGlId: event.target.value || null })}
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950"
                        >
                          <option value="">Select</option>
                          {accounts.filter((account) => account.status === "active").map((account) => (
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
        {providers.map((provider) => (
          <button
            key={provider.name}
            onClick={() => setActiveProvider(provider.name)}
            className={`rounded-lg border p-4 text-left transition-colors ${
              activeProvider === provider.name
                ? "border-blue-300 bg-blue-50 text-blue-900"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-black">{provider.name}</p>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${
                provider.status === "connected"
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                  : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300"
              }`}>
                {provider.status}
              </span>
            </div>
            <p className="mt-1 text-xs opacity-75">{provider.source}</p>
          </button>
        ))}
      </section>

      {activeProvider === "Generic CSV" && (
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-base font-black text-slate-900 dark:text-white">Generic CSV Column Mapping</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-5">
            {genericCsvColumns.map(([source, target]) => (
              <label key={source} className="text-xs font-black uppercase tracking-wider text-slate-500">
                {source}
                <input
                  defaultValue={target}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm normal-case tracking-normal text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </label>
            ))}
          </div>
        </section>
      )}

      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl dark:bg-slate-900">
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
                <div key={group} className="mb-6 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
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
                {activeProvider}: {activeProviderDetails?.source ?? providerDetails[activeProvider]}
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
