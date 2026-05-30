"use client";

import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "outline" | "default" | "secondary";
  className?: string;
}

export function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  const baseStyles = "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border";
  
  const variants = {
    default: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-400 dark:border-indigo-800",
    secondary: "bg-[var(--surface-inset)] text-[var(--text-secondary)] border-[var(--border-default)]",
    outline: "bg-transparent text-[var(--text-secondary)] border-[var(--border-default)]",
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
