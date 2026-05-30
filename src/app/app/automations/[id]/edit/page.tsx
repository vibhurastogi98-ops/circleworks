import { AutomationBuilderScreen } from "@/components/automations/AutomationsModuleScreens";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditAutomationPage({ params }: PageProps) {
  const { id } = await params;
  return <AutomationBuilderScreen automationId={decodeURIComponent(id)} />;
}
