"use client";

import { useParams } from "next/navigation";
import SettingsLegacyRedirect from "@/components/settings/SettingsLegacyRedirect";

export default function LegacyWorkflowDetailPage() {
  const params = useParams();
  const id = (params?.id as string) ?? "";
  return <SettingsLegacyRedirect slug={`workflows/${id}`} />;
}
