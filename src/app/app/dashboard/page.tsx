import { redirect } from "next/navigation";

import { resolveDashboard } from "@/lib/dashboard-resolver";
import { getAccountType } from "@/lib/session";

export default async function DashboardIndexPage() {
  redirect(resolveDashboard(await getAccountType()));
}
