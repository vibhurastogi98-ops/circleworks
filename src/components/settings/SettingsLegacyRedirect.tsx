"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePlatformStore } from "@/store/usePlatformStore";
import { normalizeAccountType } from "@/lib/creator-mode";

export default function SettingsLegacyRedirect({ slug }: { slug: string }) {
  const router = useRouter();
  const { currentCompany, accountType } = usePlatformStore();
  const normalized = normalizeAccountType(currentCompany.accountType ?? accountType);
  useEffect(() => {
    router.replace(`/settings/${normalized}/${slug}`);
  }, [normalized, slug, router]);
  return null;
}
