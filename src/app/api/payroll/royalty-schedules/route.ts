import { NextResponse } from "next/server";
import { mockRoyaltySchedules } from "@/data/mockSupplementalPayments";

export async function GET() {
  return NextResponse.json({
    success: true,
    schedules: mockRoyaltySchedules,
    total: mockRoyaltySchedules.length,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      recipientName,
      recipientType,
      projectTitle,
      royaltyType,
      rate,
      rateUnit,
      frequency,
      advanceBalance,
      unitsThreshold,
    } = body;

    if (!recipientName || !projectTitle || !rate) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: recipientName, projectTitle, rate" },
        { status: 400 }
      );
    }

    const newSchedule = {
      id: `rs-${Date.now()}`,
      recipientName,
      recipientType: recipientType || "W-2 Employee",
      projectTitle,
      royaltyType: royaltyType || "Percentage",
      rate,
      rateUnit: rateUnit || "% of net sales",
      unitsSold: 0,
      unitsThreshold: unitsThreshold || 0,
      frequency: frequency || "Quarterly",
      advanceBalance: advanceBalance || 0,
      totalRecouped: 0,
      totalEarned: 0,
      status: "Draft" as const,
      nextPaymentDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      createdDate: new Date().toISOString().split("T")[0],
    };

    return NextResponse.json({ success: true, schedule: newSchedule });
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body" },
      { status: 400 }
    );
  }
}
