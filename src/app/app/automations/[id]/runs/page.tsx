import { AutomationRunsScreen } from "@/components/automations/AutomationsModuleScreens";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AutomationRunsPage({ params }: PageProps) {
  const { id } = await params;
  return <AutomationRunsScreen automationId={decodeURIComponent(id)} />;
}
