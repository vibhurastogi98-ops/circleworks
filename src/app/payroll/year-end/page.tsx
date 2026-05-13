"use client";

import React, { useMemo, useState } from "react";
import {
  FileText,
  AlertCircle,
  CheckCircle2,
  Download,
  Send,
  ArrowRight,
  Loader2,
  FileCode,
  Pencil,
  X,
} from "lucide-react";

type W2Row = {
  id: string;
  employee: string;
  box1: number;
  box2: number;
  box3: number;
  box4: number;
  box5: number;
  box6: number;
  status: "reviewed" | "pending";
};

const initialRows: W2Row[] = [
  {
    id: "1",
    employee: "Alex Johnson",
    box1: 85_000,
    box2: 12_400,
    box3: 85_000,
    box4: 5_270,
    box5: 85_000,
    box6: 1_232.5,
    status: "reviewed",
  },
  {
    id: "2",
    employee: "Maria Garcia",
    box1: 92_500,
    box2: 14_100,
    box3: 92_500,
    box4: 5_735,
    box5: 92_500,
    box6: 1_341.25,
    status: "pending",
  },
  {
    id: "3",
    employee: "Jordan Lee",
    box1: 78_200,
    box2: 9_850,
    box3: 78_200,
    box4: 4_848.4,
    box5: 78_200,
    box6: 1_133.9,
    status: "pending",
  },
];

function money(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export default function YearEndW2Page() {
  const isJanuary = useMemo(() => new Date().getMonth() === 0, []);
  const [rows, setRows] = useState<W2Row[]>(initialRows);
  const [editRow, setEditRow] = useState<W2Row | null>(null);

  const [efiling, setEfiling] = useState(false);
  const [efiled, setEfiled] = useState(false);
  const [xmlLoading, setXmlLoading] = useState(false);

  const [distributing, setDistributing] = useState(false);
  const [distributed, setDistributed] = useState(false);

  const [w3Loading, setW3Loading] = useState(false);
  const [w3Done, setW3Done] = useState(false);

  const totals = useMemo(() => {
    return rows.reduce(
      (a, r) => ({
        box1: a.box1 + r.box1,
        box2: a.box2 + r.box2,
        box3: a.box3 + r.box3,
        box4: a.box4 + r.box4,
        box5: a.box5 + r.box5,
        box6: a.box6 + r.box6,
      }),
      { box1: 0, box2: 0, box3: 0, box4: 0, box5: 0, box6: 0 }
    );
  }, [rows]);

  const handleEfile = () => {
    setEfiling(true);
    setTimeout(() => {
      setEfiling(false);
      setEfiled(true);
    }, 2000);
  };

  const handleXml = () => {
    setXmlLoading(true);
    setTimeout(() => {
      setXmlLoading(false);
      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<SSAW2Submission>\n  <TaxYear>2025</TaxYear>\n  <Forms count="${rows.length}"/>\n</SSAW2Submission>\n`;
      const blob = new Blob([xml], { type: "application/xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "w2-ssaw2-stub.xml";
      a.click();
      URL.revokeObjectURL(url);
    }, 800);
  };

  const handleDistribute = () => {
    setDistributing(true);
    setTimeout(() => {
      setDistributing(false);
      setDistributed(true);
    }, 1500);
  };

  const handleW3 = () => {
    setW3Loading(true);
    setTimeout(() => {
      setW3Loading(false);
      setW3Done(true);
      setTimeout(() => setW3Done(false), 3000);
    }, 1500);
  };

  const saveEdit = () => {
    if (!editRow) return;
    setRows((prev) => prev.map((r) => (r.id === editRow.id ? { ...editRow } : r)));
    setEditRow(null);
  };

  return (
    <div className="flex flex-col gap-6 pb-24">
      {isJanuary ? (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-start gap-4">
          <AlertCircle className="text-amber-600 dark:text-amber-500 mt-0.5 shrink-0" size={20} />
          <div>
            <h3 className="font-bold text-amber-900 dark:text-amber-400">W-2s due January 31 — review and file</h3>
            <p className="text-sm text-amber-800 dark:text-amber-500 mt-1">
              Review employee W-2 data, correct errors, distribute copies, and file with the SSA Business Services
              Online by January 31.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex items-start gap-4">
          <FileText className="text-slate-500 mt-0.5 shrink-0" size={20} />
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-200">Year-end W-2 workspace</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Outside January, use this screen to prepare drafts. Remember: W-2s to employees and SSA filing are due
              January 31.
            </p>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Year-End W-2 / W-3 Processing</h1>
        <p className="text-sm text-slate-500 mt-1">Review, e-file, distribute, and generate W-3 transmittal totals.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 dark:text-white">Step 1: Review W-2 data</h3>
              <p className="text-xs text-slate-500 max-w-md text-right">
                Correct errors before filing. Boxes 3–6 reflect Social Security and Medicare wages and withheld tax.
              </p>
            </div>
            <div className="p-0 overflow-x-auto">
              <table className="w-full text-sm min-w-[960px]">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                    <th className="text-left px-3 py-3 font-semibold">Employee</th>
                    <th className="text-right px-2 py-3 font-semibold">Box 1 wages</th>
                    <th className="text-right px-2 py-3 font-semibold">Box 2 fed WH</th>
                    <th className="text-right px-2 py-3 font-semibold">Box 3 SS wages</th>
                    <th className="text-right px-2 py-3 font-semibold">Box 4 SS tax</th>
                    <th className="text-right px-2 py-3 font-semibold">Box 5 Med wages</th>
                    <th className="text-right px-2 py-3 font-semibold">Box 6 Med tax</th>
                    <th className="text-center px-2 py-3 font-semibold">Status</th>
                    <th className="text-center px-3 py-3 font-semibold w-24">Edit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-900 dark:text-slate-300">
                  {rows.map((r) => (
                    <tr key={r.id}>
                      <td className="px-3 py-3 font-medium">{r.employee}</td>
                      <td className="px-2 py-3 text-right font-mono text-xs">{money(r.box1)}</td>
                      <td className="px-2 py-3 text-right font-mono text-xs">{money(r.box2)}</td>
                      <td className="px-2 py-3 text-right font-mono text-xs">{money(r.box3)}</td>
                      <td className="px-2 py-3 text-right font-mono text-xs">{money(r.box4)}</td>
                      <td className="px-2 py-3 text-right font-mono text-xs">{money(r.box5)}</td>
                      <td className="px-2 py-3 text-right font-mono text-xs">{money(r.box6)}</td>
                      <td className="px-2 py-3 text-center">
                        <span
                          className={
                            r.status === "reviewed"
                              ? "text-emerald-600 text-xs font-bold bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded"
                              : "text-amber-600 text-xs font-bold bg-amber-50 dark:bg-amber-500/10 px-2 py-1 rounded"
                          }
                        >
                          {r.status === "reviewed" ? "Reviewed" : "Pending"}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => setEditRow({ ...r })}
                          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
                        >
                          <Pencil size={12} /> Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
              <h3 className="font-bold text-slate-900 dark:text-white">Steps 2–4: Filing, distribution, W-3</h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Step 2: File with SSA</h4>
                  <p className="text-sm text-slate-500 mt-1">
                    E-file via{" "}
                    <a
                      href="https://www.ssa.gov/bso/bsowelcome.htm"
                      className="text-blue-600 font-semibold hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      SSA Business Services Online
                    </a>{" "}
                    or export SSA W-2 XML for upload.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleEfile}
                    disabled={efiling || efiled}
                    className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed ${
                      efiled
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800"
                    }`}
                  >
                    {efiling ? <Loader2 size={16} className="animate-spin" /> : efiled ? <CheckCircle2 size={16} /> : <Send size={16} />}
                    {efiling ? "Filing…" : efiled ? "Marked filed" : "E-file (BSO)"}
                  </button>
                  <button
                    type="button"
                    onClick={handleXml}
                    disabled={xmlLoading}
                    className="px-4 py-2 text-sm font-bold rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-50 flex items-center gap-2 disabled:opacity-70"
                  >
                    {xmlLoading ? <Loader2 size={16} className="animate-spin" /> : <FileCode size={16} />}
                    Generate XML
                  </button>
                </div>
              </div>
              <hr className="border-slate-100 dark:border-slate-800" />
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Step 3: Distribute to employees</h4>
                  <p className="text-sm text-slate-500 mt-1">Email secure PDF copies and publish to the employee portal.</p>
                </div>
                <button
                  type="button"
                  onClick={handleDistribute}
                  disabled={distributing || distributed}
                  className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed ${
                    distributed
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800"
                      : "bg-white border border-slate-200 text-slate-700 dark:text-slate-200 dark:bg-slate-800 dark:border-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {distributing ? <Loader2 size={16} className="animate-spin" /> : distributed ? <CheckCircle2 size={16} /> : <ArrowRight size={16} />}
                  {distributing ? "Sending…" : distributed ? "Distributed" : "Distribute (email + portal)"}
                </button>
              </div>
              <hr className="border-slate-100 dark:border-slate-800" />
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Step 4: W-3 transmittal</h4>
                  <p className="text-sm text-slate-500 mt-1">Totals below roll up from reviewed W-2 lines for your W-3 summary.</p>
                </div>
                <button
                  type="button"
                  onClick={handleW3}
                  disabled={w3Loading || w3Done}
                  className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed ${
                    w3Done
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800"
                      : "bg-white border border-slate-200 text-slate-700 dark:text-slate-200 dark:bg-slate-800 dark:border-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {w3Loading ? <Loader2 size={16} className="animate-spin" /> : w3Done ? <CheckCircle2 size={16} /> : <Download size={16} />}
                  {w3Loading ? "Building…" : w3Done ? "W-3 pack ready" : "Download W-3 summary PDF"}
                </button>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/80 text-xs font-bold text-slate-500 uppercase tracking-wide">
                  W-3 totals preview (from W-2s)
                </div>
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr>
                      <td className="px-4 py-2 font-medium text-slate-600 dark:text-slate-400">Box 1 — Wages</td>
                      <td className="px-4 py-2 text-right font-mono font-bold">{money(totals.box1)}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-medium text-slate-600 dark:text-slate-400">Box 2 — Federal income tax withheld</td>
                      <td className="px-4 py-2 text-right font-mono font-bold">{money(totals.box2)}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-medium text-slate-600 dark:text-slate-400">Boxes 3 & 5 — SS / Med wages</td>
                      <td className="px-4 py-2 text-right font-mono font-bold">
                        {money(totals.box3)} / {money(totals.box5)}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-medium text-slate-600 dark:text-slate-400">Boxes 4 & 6 — SS / Med tax withheld</td>
                      <td className="px-4 py-2 text-right font-mono font-bold">
                        {money(totals.box4)} / {money(totals.box6)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Deadlines</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="text-emerald-500 mt-0.5 shrink-0" size={16} />
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">January 31</p>
                  <p className="text-xs text-slate-500">W-2 copies to employees</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="text-emerald-500 mt-0.5 shrink-0" size={16} />
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">January 31</p>
                  <p className="text-xs text-slate-500">SSA filing (paper or electronic)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {editRow ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Edit W-2 preview — {editRow.employee}</h3>
              <button type="button" onClick={() => setEditRow(null)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                <X size={18} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {(
                [
                  ["box1", "Box 1 wages"],
                  ["box2", "Box 2 federal WH"],
                  ["box3", "Box 3 SS wages"],
                  ["box4", "Box 4 SS tax"],
                  ["box5", "Box 5 Med wages"],
                  ["box6", "Box 6 Med tax"],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="flex flex-col gap-1 col-span-1">
                  <span className="text-xs font-semibold text-slate-500">{label}</span>
                  <input
                    type="number"
                    className="rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 font-mono text-sm"
                    value={editRow[key]}
                    onChange={(ev) =>
                      setEditRow({ ...editRow, [key]: Number.parseFloat(ev.target.value) || 0 })
                    }
                  />
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setEditRow(null)}
                className="px-4 py-2 text-sm font-bold text-slate-600 border border-slate-200 rounded-lg"
              >
                Cancel
              </button>
              <button type="button" onClick={saveEdit} className="px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg">
                Save corrections
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
