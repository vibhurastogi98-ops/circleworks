"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  contentClassName?: string;
  overlayClassName?: string;
}

export function Dialog({ open, onOpenChange, children, contentClassName = "", overlayClassName = "" }: DialogProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    if (open) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className={`absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200 ${overlayClassName}`}
        onClick={() => onOpenChange(false)}
      />
      <div className={`relative z-10 w-full max-w-lg animate-in overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--surface-card)] shadow-2xl zoom-in-95 fade-in duration-200 ${contentClassName}`}>
        {children}
      </div>
    </div>
  );
}

export function DialogContent({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      {children}
    </div>
  );
}

export function DialogHeader({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`border-b border-[var(--border-muted)] p-6 ${className}`}>{children}</div>;
}

export function DialogTitle({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2 className={`text-xl font-bold text-[var(--text-primary)] ${className}`}>
      {children}
    </h2>
  );
}

export function DialogDescription({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={`mt-1 text-sm text-[var(--text-secondary)] ${className}`}>
      {children}
    </p>
  );
}

export function DialogFooter({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex justify-end gap-3 border-t border-[var(--border-muted)] bg-[var(--surface-inset)] p-6 ${className}`}>
      {children}
    </div>
  );
}

export function DialogTrigger({ children, asChild, onClick }: { children: React.ReactNode; asChild?: boolean; onClick?: () => void }) {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, { onClick });
  }
  return <button onClick={onClick}>{children}</button>;
}
