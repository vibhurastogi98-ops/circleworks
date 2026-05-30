"use client";

import { ShieldAlert } from "lucide-react";

export default function Forbidden() {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-gray-50 px-4 py-12 text-slate-950 dark:bg-slate-950 dark:text-white">
      <section className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300">
          <ShieldAlert className="h-12 w-12" />
        </div>
        <p className="mt-5 text-sm font-black uppercase tracking-wide text-red-600 dark:text-red-300">403</p>
        <h1 className="mt-2 text-2xl font-black">Access denied</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
          You don&apos;t have permission to view this page. Contact your admin.
        </p>
        <button
          type="button"
          onClick={() => window.history.back()}
          className="mt-6 inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Back
        </button>
      </section>
    </main>
  );
}
