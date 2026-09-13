"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Download,
  FileCheck2,
  FileText,
  FolderOpen,
  Loader2,
  ShieldCheck,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

import { normalizeAccountType } from "@/lib/creator-mode";
import { usePlatformStore } from "@/store/usePlatformStore";

const COPY_BY_TYPE = {
  company: {
    eyebrow: "Company documents",
    description: "Your personal payroll, tax, HR, and benefits documents.",
  },
  agency: {
    eyebrow: "Agency records",
    description: "Your workspace-issued contracts, tax, and workforce documents.",
  },
  creator: {
    eyebrow: "Creator records",
    description: "Payroll, contractor, and tax documents for your creator workspace.",
  },
} as const;

const TYPE_OPTIONS = ["Payroll", "Tax", "Compliance", "HR", "Benefits", "Contract", "Other"];

type Doc = {
  id: number;
  name: string;
  type: string;
  status: string;
  fileUrl: string | null;
  downloadUrl: string | null;
  createdAt: string | null;
};

function statusClasses(status: string) {
  if (status === "Ready") return "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300";
  if (status === "Draft") return "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300";
  return "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300";
}

export default function CreatorDocumentsPage() {
  const { accountType, currentCompany } = usePlatformStore();
  const normalizedAccountType = normalizeAccountType(currentCompany.accountType ?? accountType);
  const bucket =
    normalizedAccountType === "agency" ? "agency" : normalizedAccountType === "creator" ? "creator" : "company";
  const copy = COPY_BY_TYPE[bucket];

  const fileRef = useRef<HTMLInputElement | null>(null);
  const [documents, setDocuments] = useState<Doc[] | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadType, setUploadType] = useState<string>("Other");

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/documents", { cache: "no-store", credentials: "include" });
      if (r.status === 401) { setLoadErr("Please sign in."); return; }
      if (!r.ok) { setLoadErr(`Failed (HTTP ${r.status})`); return; }
      const data = await r.json();
      setDocuments(data.documents ?? []);
      setLoadErr(null);
    } catch { setLoadErr("Network error"); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("name", file.name);
      form.append("type", uploadType);
      const r = await fetch("/api/documents", { method: "POST", credentials: "include", body: form });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        toast.error(data.error || `upload_failed_${r.status}`);
        return;
      }
      toast.success(`Uploaded ${file.name}`);
      void load();
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function download(doc: Doc) {
    if (doc.downloadUrl) {
      window.open(doc.downloadUrl, "_blank", "noopener");
      return;
    }
    // Metadata-only row (no stored file yet). Refetch — the URL may be a
    // freshly-signable object that expired; if still missing, notify.
    const r = await fetch("/api/documents", { cache: "no-store", credentials: "include" });
    const data = await r.json().catch(() => ({}));
    const fresh = (data.documents as Doc[])?.find((d) => d.id === doc.id);
    if (fresh?.downloadUrl) window.open(fresh.downloadUrl, "_blank", "noopener");
    else toast.error("No file attached to this document.");
  }

  async function remove(doc: Doc) {
    if (!confirm(`Remove "${doc.name}"?`)) return;
    const r = await fetch(`/api/documents?id=${doc.id}`, { method: "DELETE", credentials: "include" });
    if (!r.ok) {
      const data = await r.json().catch(() => ({}));
      toast.error(data.error || `delete_failed_${r.status}`);
      return;
    }
    toast.success("Removed.");
    void load();
  }

  const active = documents?.length ?? 0;
  const ready = documents?.filter((d) => d.status === "Ready").length ?? 0;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-bold text-blue-600 dark:text-blue-300">{copy.eyebrow}</p>
            <h1 className="mt-1 text-2xl font-black text-slate-950 dark:text-white">Documents</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">{copy.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={uploadType}
              onChange={(e) => setUploadType(e.target.value)}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
              aria-label="Document type"
            >
              {TYPE_OPTIONS.map((t) => <option key={t}>{t}</option>)}
            </select>
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-black text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {uploading ? "Uploading…" : "Upload"}
            </button>
          </div>
        </div>
      </section>

      {loadErr && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">
          {loadErr}
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <FolderOpen className="h-5 w-5 text-blue-600 dark:text-blue-300" />
          <p className="mt-4 text-2xl font-black text-slate-950 dark:text-white">{active}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Active documents</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
          <p className="mt-4 text-2xl font-black text-slate-950 dark:text-white">{ready}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Ready</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <FileCheck2 className="h-5 w-5 text-amber-600 dark:text-amber-300" />
          <p className="mt-4 text-2xl font-black text-slate-950 dark:text-white">Jan 31</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Next filing deadline</p>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-100 p-5 dark:border-slate-800">
          <h2 className="text-base font-black text-slate-950 dark:text-white">Document queue</h2>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {!documents && !loadErr && (
            <p className="p-5 text-sm text-slate-500">Loading documents…</p>
          )}
          {documents?.length === 0 && (
            <p className="p-5 text-sm text-slate-500">
              No documents yet. Upload one using the button above.
            </p>
          )}
          {documents?.map((doc) => (
            <div key={doc.id} className="grid gap-3 p-5 md:grid-cols-[minmax(0,1fr)_140px_140px_180px] md:items-center">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                  <FileText className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-black text-slate-950 dark:text-white">{doc.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{doc.type}</p>
                </div>
              </div>
              <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-black ${statusClasses(doc.status)}`}>
                {doc.status}
              </span>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : "—"}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => download(doc)}
                  className="inline-flex h-9 flex-1 items-center justify-center gap-1 rounded-lg border border-slate-200 px-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <Download className="h-3.5 w-3.5" /> Download
                </button>
                <button
                  type="button"
                  onClick={() => remove(doc)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:border-red-300 hover:text-red-600 dark:border-slate-700"
                  aria-label="Remove"
                  title="Remove"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
