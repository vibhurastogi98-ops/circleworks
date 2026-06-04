"use client";

import { useMemo } from "react";

import { getCapabilities } from "@/lib/capabilities";
import { useAccountType } from "@/hooks/useAccountType";

export function useCapabilities(accountTypeOverride?: string | null) {
  const accountType = useAccountType();
  const resolvedAccountType = accountTypeOverride ?? accountType;

  return useMemo(() => getCapabilities(resolvedAccountType), [resolvedAccountType]);
}
