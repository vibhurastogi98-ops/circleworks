import { NextResponse } from "next/server";
import { db } from "@/db";
import { firmClients, companies } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
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

    // Map DB clients to match the expected UI structure during this transition phase.
    const dbClients = clients.map(client => ({
      id: "cl_" + client.id,
      slug: client.name?.toLowerCase().replace(/ /g, '-') || 'client',
      name: client.name || "Unnamed Client",
      logoUrl: client.logoUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${client.id}&backgroundColor=1e293b`,
      industry: "Unspecified",
      plan: "Standard",
      employeeCount: 0, 
      contractorCount: 0,
      status: client.status === "Active" ? "on_time" : "action_required",
      statusLabel: client.status === "Active" ? "Payroll On Time" : "Action Required",
      nextPayrollDate: "N/A",
      nextPayrollAmount: 0,
      lastPayrollDate: "N/A",
      state: "US",
      ein: "XX-XXXXXXX",
      monthlyPayrollVolume: 0,
      pendingApprovals: 0,
      setupComplete: true,
    }));

    // If the database is completely empty (no seed data yet), we can still return a simulated payload 
    // or we just return an empty array to reflect the true empty DB state. We'll stick to true empty state.
    
    return NextResponse.json({ clients: dbClients });
  } catch (error) {
    console.error("Failed to fetch clients from DB:", error);
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 });
  }
}
