import { NextResponse } from "next/server";

export async function GET() {
  // Mocking the Impound Trust balances
  const upcomingPayroll = 125000.00; // Expected next payroll
  const impoundBalance = 240000.00; // Currently inside the CircleWorks settlement trust
  
  // 2x logic warning rule
  const isBelowWarningThreshold = impoundBalance < (upcomingPayroll * 2);
  const status = impoundBalance >= upcomingPayroll ? "Funded" : "Insufficient Funds";
  
  return NextResponse.json({
    impoundBalance,
    upcomingPayroll,
    pendingAchDebits: 14500.00,
    lastFundedAmount: 125000.00,
    lastFundedDate: "2026-04-01T15:00:00Z",
    nextFundingDate: "2026-04-12T15:00:00Z",
    status,
    isBelowWarningThreshold
  });
}
