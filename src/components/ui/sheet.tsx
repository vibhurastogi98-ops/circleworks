"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";

type SheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
};

export function Sheet({ open, onOpenChange, children }: SheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100]">
          <motion.button
            type="button"
            aria-label="Close sheet"
            className="absolute inset-0 bg-slate-950/20 backdrop-blur-sm dark:bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
          />
          {children}
        </div>
      )}
    </AnimatePresence>
  );
}

export function SheetContent({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.aside
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", bounce: 0, duration: 0.32 }}
      className={`absolute right-0 top-0 h-[100dvh] w-full max-w-[400px] bg-white shadow-xl dark:bg-[#0F172A] ${className}`}
      role="dialog"
      aria-modal="true"
    >
      {children}
    </motion.aside>
  );
}
