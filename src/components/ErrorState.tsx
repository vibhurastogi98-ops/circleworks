"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

type ErrorStateProps = {
  code?: number;
  title: string;
  description: string;
  retry?: () => void;
};

export default function ErrorState({
  code,
  title,
  description,
  retry,
}: ErrorStateProps) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-900 shadow-sm dark:border-red-500/30 dark:bg-red-950/30 dark:text-red-100">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-red-600 shadow-sm dark:bg-red-500/10 dark:text-red-300">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-black">{title}</h2>
            {code ? (
              <span className="rounded-full border border-red-200 bg-white px-2 py-0.5 text-xs font-black text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
                {code}
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm leading-6 text-red-700 dark:text-red-200">
            {description}
          </p>
          {retry ? (
            <button
              type="button"
              onClick={retry}
              className="mt-4 inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-red-600 px-3 text-sm font-bold text-white transition hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-[13px] font-medium leading-5 text-red-600">{message}</p>;
}

export function FormErrorSummary({ errors }: { errors: string[] }) {
  if (errors.length < 2) return null;
  return (
    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
      Please fix {errors.length} fields before continuing.
    </div>
  );
}
