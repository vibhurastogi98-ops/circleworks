import type { Metadata } from "next";

import { ContractorsModuleScreen } from "@/components/contractors/ContractorsModuleScreen";

export const metadata: Metadata = {
  title: "Contractors",
};

export default function AppContractorsPage() {
  return <ContractorsModuleScreen />;
}
