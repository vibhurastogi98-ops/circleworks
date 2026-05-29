import { IndividualTimesheetScreen } from "@/components/time/TimeModuleScreens";

export default async function IndividualTimesheetPage({
  params,
}: {
  params: Promise<{ employeeId: string }>;
}) {
  const { employeeId } = await params;
  return <IndividualTimesheetScreen employeeId={employeeId} />;
}
