"use client";

import React, { useState, useEffect, useRef } from "react";

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, { open, setOpen });
        }
        return child;
      })}
    </div>
  );
}

export function DropdownMenuTrigger({ 
  children, 
  asChild, 
  open, 
  setOpen 
}: { 
  children: React.ReactNode; 
  asChild?: boolean; 
  open?: boolean; 
  setOpen?: (o: boolean) => void 
}) {
  const handleClick = () => setOpen?.(!open);
  
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, { 
      onClick: handleClick,
      "aria-expanded": open 
    });
  }
  
  return (
    <button onClick={handleClick} aria-expanded={open}>
      {children}
    </button>
  );
}

export function DropdownMenuContent({ 
  children, 
  className = "", 
  align = "left",
  open,
  setOpen
}: { 
  children: React.ReactNode; 
  className?: string; 
  align?: "left" | "right" | "end";
  open?: boolean;
  setOpen?: (o: boolean) => void;
}) {
  if (!open) return null;

  const alignmentClasses = {
    left: "left-0",
    right: "right-0",
    end: "right-0"
  };

  return (
    <div 
      className={`absolute z-50 mt-2 w-56 origin-top-right rounded-xl bg-white dark:bg-slate-900 shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-100 ${alignmentClasses[align]} ${className}`}
      onClick={() => setOpen?.(false)}
    >
      <div className="py-1">
        {children}
      </div>
    </div>
  );
}

export function DropdownMenuItem({ 
  children, 
  className = "", 
  onClick,
  disabled
}: { 
  children: React.ReactNode; 
  className?: string; 
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      className={`flex w-full items-center px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export function DropdownMenuSeparator() {
  return <div className="my-1 h-px bg-slate-100 dark:bg-slate-800" />;
}
