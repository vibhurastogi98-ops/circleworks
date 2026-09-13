"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Building2, CheckCircle2, Clock, Download, Eye, HardDriveUpload, Info,
  Loader2, Search, Send,
} from "lucide-react";
import { toast } from "sonner";

import { ContractorSubNav } from "../page";

type NEC1099Row = {
  id: number;
  contractorId: number;
  taxYear: number;
  box1Amount: number;
  status: "Draft" | "Ready" | "Filed" | "Delivered";
  deliveryMethod: string | null;
  tin: string | null;
  createdAt: string | null;
};

type ContractorLite = {
  id: number;
  name: string;
  ytdPayments: number | null;
  w9Status: string;
};

const fmtMoney = (val: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(val);

export default function NEC1099Page() {
  const [taxYear, setTaxYear] = useState(new Date().getUTCFullYear());
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<NEC1099Row[] | null>(null);
  const [contractors, setContractors] = useState<ContractorLite[]>([]);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [filingId, setFilingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const [rNec, rContr] = await Promise.all([
        fetch(`/api/contractors?resource=1099s&year=${taxYear}`, { cache: "no-store", credentials: "include" }),
        fetch(`/api/contractors?resource=contractors`, { cache: "no-store", credentials: "include" }),
      ]);
      if (rNec.status === 401 || rContr.status === 401) { setLoadErr("Please sign in."); return; }
      if (!rNec.ok) { setLoadErr(`Failed (HTTP ${rNec.status})`); return; }
      const nec = await rNec.json();
      setRows(nec.nec1099s ?? []);
      if (rContr.ok) {
        const c = await rContr.json();
        setContractors((c.contractors ?? []).map((x: { id: number; name: string; ytdPayments: number | null; w9Status: string }) => ({
          id: x.id, name: x.name, ytdPayments: x.ytdPayments, w9Status: x.w9Status,
        })));
      }
      setLoadErr(null);
    } catch { setLoadErr("Network error"); }
  }, [taxYear]);

  useEffect(() => { void load(); }, [load]);

  const contractorNameById = useMemo(() => {
    const m = new Map<number, string>();
    for (const c of contractors) m.set(c.id, c.name);
    return m;
  }, [contractors]);

  const filtered = useMemo(() => {
    return (rows ?? []).filter((n) => {
      const name = contractorNameById.get(n.contractorId) ?? "";
      return name.toLowerCase().includes(search.toLowerCase());
    });
  }, [rows, contractorNameById, search]);

  const totals = useMemo(() => {
    const readyOrDraft = filtered.filter((n) => n.status === "Draft" || n.status === "Ready").length;
    const filedOrDelivered = filtered.filter((n) => n.status === "Filed" || n.status === "Delivered").length;
    const totalBox1 = filtered.reduce((s, n) => s + (n.box1Amount ?? 0), 0);
    return { readyOrDraft, filedOrDelivered, totalBox1 };
  }, [filtered]);

  // OBBBA (2026+): 1099-NEC threshold raised from $600 to $2,000 for payments made in 2026+.
  const threshold = taxYear >= 2026 ? 2000 : 600;
  const thresholdLabel = threshold === 2000 ? "$2,000" : "$600";

  const eligibleUngenerated = useMemo(() => {
    const existing = new Set((rows ?? []).map((r) => r.contractorId));
    return contractors.filter((c) => (c.ytdPayments ?? 0) >= threshold && !existing.has(c.id)).length;
  }, [contractors, rows, threshold]);

  async function generate() {
    setGenerating(true);
    const r = await fetch("/api/contractors", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "generate-1099s", taxYear }),
    });
    const data = await r.json().catch(() => ({}));
    setGenerating(false);
    if (!r.ok) { toast.error(data.error || `generate_failed_${r.status}`); return; }
    toast.success(`Generated ${data.createdCount} draft${data.createdCount === 1 ? "" : "s"}`, {
      description: data.skippedExisting > 0 ? `Skipped ${data.skippedExisting} that already exist for ${taxYear}.` : undefined,
    });
    void load();
  }

  async function markFiled(id: number) {
    setFilingId(id);
    const r = await fetch("/api/contractors", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "mark-1099-filed", necId: id }),
    });
    setFilingId(null);
    if (!r.ok) { toast.error("Mark-filed failed"); return; }
    toast.success("Marked as Filed (record only — no IRS submission)");
    void load();
  }

  async function markDelivered(id: number, method: "E-Delivery" | "USPS-Mail") {
    const r = await fetch("/api/contractors", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "deliver-1099", necId: id, method }),
    });
    if (!r.ok) { toast.error("Deliver failed"); return; }
    toast.success(`Marked as Delivered via ${method}`);
    void load();
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-rose-500 shadow-lg shadow-red-500/20">
              <Building2 size={20} className="text-white" />
            </div>
            1099-NEC Generation
          </h1>
          <p className="ml-[52px] mt-1 text-sm text-slate-500 dark:text-slate-400">
            Auto-generate 1099-NEC drafts for contractors paid {thresholdLabel}+/year (OBBBA raised the threshold to $2,000 for 2026+). E-filing to the IRS is out of scope for this build — this view records status only.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select value={taxYear} onChange={(e) => setTaxYear(Number(e.target.value))} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500/50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {[0, 1, 2].map((offset) => {
              const y = new Date().getUTCFullYear() - offset;
              return <option key={y} value={y}>{y} Tax Year</option>;
            })}
          </select>
          <button
            onClick={generate}
            disabled={generating || eligibleUngenerated === 0}
            title={eligibleUngenerated === 0 ? "All eligible contractors already have a draft for this year" : ""}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-600/20 transition-all hover:from-red-700 hover:to-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {generating ? <Loader2 size={16} className="animate-spin" /> : <HardDriveUpload size={16} />}
            Generate {eligibleUngenerated > 0 ? `(${eligibleUngenerated})` : ""}
          </button>
        </div>
      </div>

      <ContractorSubNav active="/contractors/1099s" />

      {loadErr && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">{loadErr}</div>
      )}

      {taxYear === new Date().getUTCFullYear() && (
        <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
          <Info size={18} className="mt-0.5 flex-shrink-0 text-blue-500" />
          <div>
            <p className="text-sm font-bold text-blue-800 dark:text-blue-300">
              Current tax year ({taxYear}) preview
            </p>
            <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
              Amounts are YTD contractor payments (contractor.ytdPayments, updated when invoices are approved).
              Real forms cannot be filed until January of the following year. Only contractors with {thresholdLabel}+ in YTD payments produce a draft.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Total Box 1 (Nonemployee Comp)</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{fmtMoney(totals.totalBox1)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Ready / Draft forms</p>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-500">{totals.readyOrDraft}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Filed & delivered</p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-500">{totals.filedOrDelivered}</p>
        </div>
      </div>

      <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3 border-b border-slate-200 p-4 dark:border-slate-800">
          <div className="relative max-w-sm flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by contractor name…" className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 font-medium tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-800/50">
              <tr>
                <th className="px-5 py-3.5">Contractor</th>
                <th className="px-5 py-3.5">TIN</th>
                <th className="px-5 py-3.5 text-right">Box 1 amount</th>
                <th className="px-5 py-3.5">Delivery</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {rows === null && !loadErr && (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">Loading 1099-NEC forms…</td></tr>
              )}
              {rows !== null && filtered.map((nec) => (
                <tr key={nec.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="px-5 py-4">
                    <p className="font-bold text-slate-900 dark:text-white">{contractorNameById.get(nec.contractorId) ?? `#${nec.contractorId}`}</p>
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-slate-600 dark:text-slate-400">{nec.tin || "—"}</td>
                  <td className="px-5 py-4 text-right">
                    <span className="font-bold text-slate-900 dark:text-white">{fmtMoney(nec.box1Amount)}</span>
                  </td>
                  <td className="px-5 py-4">
                    {nec.status === "Delivered" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                        <CheckCircle2 size={14} /> Delivered ({nec.deliveryMethod ?? "—"})
                      </span>
                    ) : nec.status === "Filed" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                        <Clock size={14} /> Pending delivery
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500 dark:bg-slate-800">
                        Not sent
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      nec.status === "Filed" || nec.status === "Delivered"
                        ? "border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400"
                        : "border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-800 dark:bg-amber-500/20 dark:text-amber-400"
                    }`}>
                      {nec.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => toast.info("PDF preview not wired in this build.", { description: "Data model + status is live; PDF rendering is out of scope for Phase 6." })}
                        className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20"
                        title="View form"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => toast.info("PDF download not wired in this build.")}
                        className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                        title="Download PDF"
                      >
                        <Download size={16} />
                      </button>
                      {(nec.status === "Draft" || nec.status === "Ready") && (
                        <button
                          onClick={() => markFiled(nec.id)}
                          disabled={filingId === nec.id}
                          className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-700 hover:bg-slate-200 disabled:opacity-40 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                          title="Record as filed (no IRS submission)"
                        >
                          {filingId === nec.id ? "…" : "Mark filed"}
                        </button>
                      )}
                      {nec.status === "Filed" && (
                        <button
                          onClick={() => markDelivered(nec.id, "E-Delivery")}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2 py-1 text-[10px] font-bold text-white hover:bg-emerald-700"
                          title="Mark delivered via E-Delivery"
                        >
                          <Send size={12} /> Delivered
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {rows !== null && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    {eligibleUngenerated > 0
                      ? `No 1099-NEC forms for ${taxYear} yet. Click Generate to create drafts for ${eligibleUngenerated} eligible contractor${eligibleUngenerated === 1 ? "" : "s"}.`
                      : `No 1099-NEC forms for ${taxYear}. No contractors have crossed the ${thresholdLabel} YTD threshold.`}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
