"use client";

import React from "react";

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--surface-card)] shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`border-b border-[var(--border-muted)] p-6 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={`text-lg font-bold leading-none text-[var(--text-primary)] ${className}`}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`mt-1.5 text-sm text-[var(--text-secondary)] ${className}`}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`border-t border-[var(--border-muted)] bg-[var(--surface-inset)] p-6 ${className}`}>
      {children}
    </div>
  );
}
