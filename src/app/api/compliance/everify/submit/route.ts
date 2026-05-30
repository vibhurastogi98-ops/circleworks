import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    caseNumber: `EV-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 89999)}`,
    status: "Submitted",
    nextStep: "Awaiting USCIS E-Verify webhook status update.",
  });
}
