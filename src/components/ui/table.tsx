"use client";

import React from "react";

export function Table({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="w-full overflow-auto">
      <table className={`w-full caption-bottom text-sm ${className}`}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <thead className={`border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 ${className}`}>{children}</thead>;
}

export function TableBody({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <tbody className={`divide-y divide-slate-100 dark:divide-slate-800 ${className}`}>{children}</tbody>;
}

export function TableRow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <tr className={`transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/50 ${className}`}>{children}</tr>;
}

export function TableHead({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={`h-11 px-4 text-left align-middle font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px] ${className}`}>
      {children}
    </th>
  );
}

export function TableCell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <td className={`p-4 align-middle text-slate-700 dark:text-slate-300 ${className}`}>
      {children}
    </td>
  );
}
