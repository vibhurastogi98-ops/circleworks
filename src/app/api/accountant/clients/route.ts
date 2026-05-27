import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { firmClients, companies } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireApiPermission } from "@/lib/apiRbac";
import { getAccountantDemoClients } from "@/lib/accountantPortalData";

export async function GET(req: NextRequest) {
  const permissionCheck = await requireApiPermission(req, "view_accountant_portal");
  if (permissionCheck.response) return permissionCheck.response;

  try {
    const clients = await db
      .select({
        id: firmClients.id,
        name: companies.name,
        logoUrl: companies.logoUrl,
        status: firmClients.status,
      })
      .from(firmClients)
      .leftJoin(companies, eq(firmClients.companyId, companies.id));

    const dbClients = clients.map(client => ({
      id: "cl_" + client.id,
      slug: client.name?.toLowerCase().replace(/ /g, '-') || 'client',
      name: client.name || "Unnamed Client",
      logoUrl: client.logoUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${client.id}&backgroundColor=1e293b`,
      industry: "Unspecified",
      plan: "Standard",
      employeeCount: 0,
      contractorCount: 0,
      status: client.status === "Active" ? "on_time" : client.status === "Pending" ? "action_required" : "issue",
      statusLabel: client.status === "Active" ? "Payroll On Time" : client.status === "Pending" ? "Action Required" : "Issue",
      nextPayrollDate: "N/A",
      nextPayrollAmount: 0,
      lastPayrollDate: "N/A",
      state: "US",
      ein: "XX-XXXXXXX",
      monthlyPayrollVolume: 0,
      pendingApprovals: 0,
      setupComplete: true,
    }));
    
    const demoClients = getAccountantDemoClients();
    return NextResponse.json({
      clients: dbClients.length > 0 ? dbClients : demoClients,
      source: dbClients.length > 0 ? "database" : "demo",
    });
  } catch (error) {
    console.error("Failed to fetch clients from DB:", error);
    return NextResponse.json({ clients: getAccountantDemoClients(), source: "demo" });
  }
}
