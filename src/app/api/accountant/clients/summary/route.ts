import { NextResponse, type NextRequest } from "next/server";
import { requireApiPermission } from "@/lib/apiRbac";
import { buildAccountantSummary, getAccountantDemoClients } from "@/lib/accountantPortalData";

export async function GET(req: NextRequest) {
  const permissionCheck = await requireApiPermission(req, "view_accountant_portal");
  if (permissionCheck.response) return permissionCheck.response;

  return NextResponse.json(buildAccountantSummary(getAccountantDemoClients()));
}
