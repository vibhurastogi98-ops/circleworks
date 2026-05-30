"use client";

import type { ReactNode } from "react";
import Link from "next/link";

type EmptyStateCta = {
  label: string;
  href?: string;
  onClick?: () => void;
};

type EmptyStateProps = {
  illustration: ReactNode;
  title: string;
  description: string;
  cta?: EmptyStateCta;
};

export default function EmptyState({
  illustration,
  title,
  description,
  cta,
}: EmptyStateProps) {
  const ctaClass =
    "mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950";

  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center rounded-lg border border-slate-200 bg-white px-6 py-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-5 flex h-32 w-32 items-center justify-center">
        {illustration}
      </div>
      <h2 className="text-xl font-black text-slate-950 dark:text-white">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
        {description}
      </p>
      {cta?.href ? (
        <Link href={cta.href} className={ctaClass}>
          {cta.label}
        </Link>
      ) : cta?.onClick ? (
        <button type="button" onClick={cta.onClick} className={ctaClass}>
          {cta.label}
        </button>
      ) : null}
    </div>
  );
}
