import type { Metadata } from "next";

import { AgencyClientsModuleScreen } from "@/components/clients/AgencyClientsModuleScreen";

export const metadata: Metadata = {
  title: "Clients",
};

export default function AppClientsPage() {
  return <AgencyClientsModuleScreen />;
}
