import { notFound, redirect } from "next/navigation";

import DashboardPage from "@/app/dashboard/page";
import { isDashboardAccountType, resolveDashboard } from "@/lib/dashboard-resolver";
import { getAccountType } from "@/lib/session";

export default async function AccountTypeDashboardPage({
  params,
}: {
  params: Promise<{ accountType: string }>;
}) {
  const { accountType } = await params;
  if (!isDashboardAccountType(accountType)) notFound();

  const target = resolveDashboard(await getAccountType());
  if (target !== resolveDashboard(accountType)) redirect(target);

  return <DashboardPage />;
}
