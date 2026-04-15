"use client";

import React, { useState, createContext, useContext, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

const SelectContext = createContext<{
  value: string;
  setValue: (v: string) => void;
  open: boolean;
  setOpen: (o: boolean) => void;
}>({
  value: "",
  setValue: () => {},
  open: false,
  setOpen: () => {},
});

export function Select({
  value,
  defaultValue,
  onValueChange,
  children,
}: {
  value?: string;
  defaultValue?: string;
  onValueChange?: (v: string) => void;
  children: React.ReactNode;
}) {
  const [internalValue, setInternalValue] = useState(value || defaultValue || "");
  const [open, setOpen] = useState(false);

  const setValue = (v: string) => {
    setInternalValue(v);
    onValueChange?.(v);
    setOpen(false);
  };

  return (
    <SelectContext.Provider value={{ value: value !== undefined ? value : internalValue, setValue, open, setOpen }}>
      <div className="relative w-full">{children}</div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { open, setOpen, value } = useContext(SelectContext);
  const containerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setOpen]);

  return (
    <button
      ref={containerRef}
      onClick={() => setOpen(!open)}
      className={`flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-zinc-50 ${className}`}
    >
      {children}
      <ChevronDown className={`h-4 w-4 opacity-50 transition-transform ${open ? 'rotate-180' : ''}`} />
    </button>
  );
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  const { value } = useContext(SelectContext);
  return <span>{value || placeholder}</span>;
}

export function SelectContent({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { open } = useContext(SelectContext);
  if (!open) return null;

  return (
    <div className={`absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-slate-200 bg-white p-1 text-slate-900 shadow-2xl animate-in fade-in zoom-in-95 duration-100 dark:border-slate-800 dark:bg-slate-900 dark:text-zinc-50 ${className}`}>
      {children}
    </div>
  );
}

export function SelectItem({ value, children, className = "" }: { value: string; children: React.ReactNode; className?: string }) {
  const { value: selectedValue, setValue } = useContext(SelectContext);
  const isSelected = selectedValue === value;

  return (
    <button
      onClick={() => setValue(value)}
      className={`relative flex w-full cursor-default select-none items-center rounded-lg py-2 pl-3 pr-9 text-sm outline-none hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${isSelected ? 'bg-slate-50 dark:bg-slate-800 font-bold' : ''} ${className}`}
    >
      <span className="block truncate">{children}</span>
      {isSelected && (
        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-indigo-600">
          <Check className="h-4 w-4" />
        </span>
      )}
    </button>
  );
}
