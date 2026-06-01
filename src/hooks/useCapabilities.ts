"use client";

import { useMemo } from "react";

import { getCapabilities } from "@/lib/capabilities";
import { usePlatformStore } from "@/store/usePlatformStore";

export function useCapabilities(accountTypeOverride?: string | null) {
  const accountType = usePlatformStore((state) => state.accountType);
  const resolvedAccountType = accountTypeOverride ?? accountType;

  return useMemo(() => getCapabilities(resolvedAccountType), [resolvedAccountType]);
}
