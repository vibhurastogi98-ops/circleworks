import { AutomationBuilderScreen } from "@/components/automations/AutomationsModuleScreens";

type PageProps = {
  searchParams?: Promise<{ template?: string }>;
};

export default async function NewAutomationPage({ searchParams }: PageProps) {
  const params = await searchParams;
  return <AutomationBuilderScreen templateId={params?.template ?? null} />;
}
