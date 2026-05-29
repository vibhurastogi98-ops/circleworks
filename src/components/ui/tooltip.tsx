"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export function TooltipContent({
  className = "",
  sideOffset = 8,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        sideOffset={sideOffset}
        className={`z-[1000] overflow-hidden rounded-md bg-slate-950 px-2.5 py-1.5 text-xs font-semibold text-white shadow-lg animate-in fade-in-0 zoom-in-95 dark:bg-slate-100 dark:text-slate-950 ${className}`}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className="fill-slate-950 dark:fill-slate-100" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}
