import { NextResponse } from "next/server";
import { mockSupplementalPayments } from "@/data/mockSupplementalPayments";

export async function GET() {
  return NextResponse.json({
    success: true,
    payments: mockSupplementalPayments,
    total: mockSupplementalPayments.length,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      recipientName,
      recipientType,
      paymentType,
      description,
      amount,
      scheduledDate,
    } = body;

    if (!recipientName || !paymentType || !amount) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: recipientName, paymentType, amount" },
        { status: 400 }
      );
    }

    // Tax treatment logic
    const taxTreatment =
      paymentType === "Advance"
        ? "Non-taxable (unrecouped advance)"
        : recipientType === "1099 Contractor"
          ? "1099-MISC Box 2"
          : "Supplemental flat rate (22%)";

    const newPayment = {
      id: `sp-${Date.now()}`,
      recipientName,
      recipientType: recipientType || "W-2 Employee",
      paymentType,
      description: description || "",
      amount,
      taxTreatment,
      status: "Pending" as const,
      scheduledDate: scheduledDate || new Date().toISOString().split("T")[0],
    };

    return NextResponse.json({ success: true, payment: newPayment });
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body" },
      { status: 400 }
    );
  }
}
