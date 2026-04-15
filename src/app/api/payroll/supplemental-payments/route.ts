import { db } from "@/db";
import { supplementalPayments } from "@/db/schema";
import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const payments = await db.query.supplementalPayments.findMany({
      orderBy: [desc(supplementalPayments.scheduledDate)],
    });

    return NextResponse.json({
      success: true,
      payments,
    });
  } catch (error) {
    console.error("Error fetching supplemental payments:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch supplemental payments from database" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      employeeId, 
      paymentType, 
      amount, 
      status, 
      taxTreatment, 
      description,
      scheduledDate,
      companyId,
      recipientName,
      recipientType,
      projectTitle,
      notes
    } = body;

    if (!recipientName || !recipientType || !paymentType || !amount || !companyId) {
      return NextResponse.json(
        { success: false, error: "Recipient Name, Recipient Type, Payment Type, Amount, and Company ID are required" },
        { status: 400 }
      );
    }

    const [newPayment] = await db
      .insert(supplementalPayments)
      .values({
        employeeId: employeeId ? Number(employeeId) : undefined,
        companyId: Number(companyId),
        recipientName,
        recipientType,
        paymentType,
        amount: Number(amount),
        status,
        taxTreatment,
        description,
        projectTitle,
        notes,
        scheduledDate: scheduledDate || undefined,
      })
      .returning();

    return NextResponse.json({
      success: true,
      payment: newPayment,
    });
  } catch (error) {
    console.error("Error creating supplemental payment:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create supplemental payment" },
      { status: 500 }
    );
  }
}
