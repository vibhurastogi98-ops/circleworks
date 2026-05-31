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
  return <thead className={`border-b border-[var(--border-muted)] bg-[var(--surface-inset)] ${className}`}>{children}</thead>;
}

export function TableBody({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <tbody className={`divide-y divide-[var(--border-muted)] ${className}`}>{children}</tbody>;
}

export function TableRow({ children, className = "", ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={`transition-colors hover:bg-[var(--surface-inset)] ${className}`} {...props}>
      {children}
    </tr>
  );
}

export function TableHead({ children, className = "", ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th 
      className={`h-11 px-4 text-left align-middle text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] ${className}`}
      {...props}
    >
      {children}
    </th>
  );
}

export function TableCell({ children, className = "", ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td 
      className={`p-4 align-middle text-[var(--text-secondary)] ${className}`}
      {...props}
    >
      {children}
    </td>
  );
}
