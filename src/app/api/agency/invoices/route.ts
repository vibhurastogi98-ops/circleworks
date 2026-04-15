import { db } from "@/db";
import { agencyInvoices, agencyClients } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const invoices = await db.query.agencyInvoices.findMany({
      with: {
        client: true,
      },
      orderBy: [desc(agencyInvoices.createdAt)],
    });

    // Transform to include clientName for UI compatibility if needed
    const transformedInvoices = invoices.map(inv => ({
      ...inv,
      clientName: inv.client?.name || 'Unknown Client',
    }));

    return NextResponse.json({
      success: true,
      invoices: transformedInvoices,
    });
  } catch (error) {
    console.error("Error fetching agency invoices:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch invoices from database" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      clientId, 
      invoiceNumber, 
      periodStart, 
      periodEnd, 
      amount, 
      status, 
      dueDate,
      companyId
    } = body;

    if (!clientId || !invoiceNumber || !companyId) {
      return NextResponse.json(
        { success: false, error: "Client ID, Invoice Number, and Company ID are required" },
        { status: 400 }
      );
    }

    const [newInvoice] = await db
      .insert(agencyInvoices)
      .values({
        clientId,
        companyId,
        invoiceNumber,
        periodStart,
        periodEnd,
        amount,
        status,
        dueDate,
      })
      .returning();

    return NextResponse.json({
      success: true,
      invoice: newInvoice,
    });
  } catch (error) {
    console.error("Error creating agency invoice:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}
