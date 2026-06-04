"use client";

import { normalizeAccountType, type PlatformAccountType } from "@/lib/creator-mode";
import { usePlatformStore } from "@/store/usePlatformStore";

export function useAccountType(): PlatformAccountType {
  return usePlatformStore((state) =>
    normalizeAccountType(state.currentCompany.accountType ?? state.accountType),
  );
}
