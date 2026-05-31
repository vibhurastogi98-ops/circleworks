import {
  Download,
  FileCheck2,
  FileText,
  FolderOpen,
  ShieldCheck,
} from "lucide-react";

const documents = [
  { name: "Owner W-2 preview", type: "Payroll", status: "Draft", updated: "May 30, 2026" },
  { name: "Contractor 1099-NEC packet", type: "Tax", status: "Ready", updated: "May 28, 2026" },
  { name: "W-9 collection report", type: "Contractors", status: "Ready", updated: "May 24, 2026" },
  { name: "Quarterly estimated tax worksheet", type: "Tax", status: "Draft", updated: "May 20, 2026" },
];

function statusClasses(status: string) {
  if (status === "Ready") return "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300";
  return "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300";
}

export default function CreatorDocumentsPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-bold text-blue-600 dark:text-blue-300">Creator records</p>
            <h1 className="mt-1 text-2xl font-black text-slate-950 dark:text-white">Documents</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Payroll, contractor, and tax documents for the creator workspace.
            </p>
          </div>
          <button className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800">
            <Download className="h-4 w-4" /> Download all
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <FolderOpen className="h-5 w-5 text-blue-600 dark:text-blue-300" />
          <p className="mt-4 text-2xl font-black text-slate-950 dark:text-white">{documents.length}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Active documents</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
          <p className="mt-4 text-2xl font-black text-slate-950 dark:text-white">2</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Ready for filing</p>
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
          {documents.map((document) => (
            <div key={document.name} className="grid gap-3 p-5 md:grid-cols-[minmax(0,1fr)_140px_140px_140px] md:items-center">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                  <FileText className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-black text-slate-950 dark:text-white">{document.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{document.type}</p>
                </div>
              </div>
              <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-black ${statusClasses(document.status)}`}>
                {document.status}
              </span>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{document.updated}</p>
              <button className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 px-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
                Open
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
