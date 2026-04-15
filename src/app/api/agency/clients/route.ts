import { db } from "@/db";
import { agencyClients } from "@/db/schema";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const clients = await db.query.agencyClients.findMany({
      orderBy: (clients, { asc }) => [asc(clients.name)],
    });

    return NextResponse.json({
      success: true,
      clients,
    });
  } catch (error) {
    console.error("Error fetching agency clients:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch clients from database" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      name, 
      email, 
      contactName, 
      billingRateType, 
      markupPercentage, 
      fixedFee, 
      hourlyRate, 
      billingCycle, 
      paymentTerms,
      companyId 
    } = body;

    if (!name || !companyId) {
      return NextResponse.json(
        { success: false, error: "Name and Company ID are required" },
        { status: 400 }
      );
    }

    const [newClient] = await db
      .insert(agencyClients)
      .values({
        name,
        email,
        contactName,
        billingRateType,
        markupPercentage,
        fixedFee,
        hourlyRate,
        billingCycle,
        paymentTerms,
        companyId,
      })
      .returning();

    return NextResponse.json({
      success: true,
      client: newClient,
    });
  } catch (error) {
    console.error("Error creating agency client:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create client" },
      { status: 500 }
    );
  }
}
