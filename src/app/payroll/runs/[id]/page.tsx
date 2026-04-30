import { redirect } from "next/navigation";

export default async function PayrollRunAliasPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/payroll/run/${id}`);
}
