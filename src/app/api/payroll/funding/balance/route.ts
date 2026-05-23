import { NextResponse } from "next/server";

export async function GET() {
  // Mocking the Impound Trust balances
  const upcomingPayroll = 125000.00; // Expected next payroll
  const impoundBalance = 240000.00; // Currently inside the CircleWorks settlement trust
  const pendingAchDebits = 14500.00;
  
  // 2x logic warning rule
  const isBelowWarningThreshold = impoundBalance < (upcomingPayroll * 2);
  const status = impoundBalance < upcomingPayroll ? "Insufficient Funds" : pendingAchDebits > 0 ? "Pending" : "Funded";
  
  return NextResponse.json({
    impoundBalance,
    upcomingPayroll,
    pendingAchDebits,
    lastFundedAmount: 125000.00,
    lastFundedDate: "2026-04-01T15:00:00Z",
    nextFundingDate: "2026-04-12T15:00:00Z",
    status,
    isBelowWarningThreshold,
    thresholdMultiple: 2,
    alerts: [
      {
        id: "low-impound-email",
        channel: "email",
        severity: isBelowWarningThreshold ? "warning" : "info",
        message: "Email finance admins if impound balance drops below 2x upcoming payroll.",
      },
      {
        id: "low-impound-in-app",
        channel: "in-app",
        severity: isBelowWarningThreshold ? "warning" : "info",
        message: "In-app warning is shown when trust balance falls below 2x upcoming payroll.",
      },
      {
        id: "debit-countdown",
        channel: "in-app",
        severity: "info",
        message: "Payroll debit reminders fire 7 days, 3 days, and 1 day before debit date.",
      },
    ],
    debitWarnings: [
      { daysBeforeDebit: 7, channel: ["email", "in-app"], enabled: true },
      { daysBeforeDebit: 3, channel: ["email", "in-app"], enabled: true },
      { daysBeforeDebit: 1, channel: ["email", "in-app"], enabled: true },
    ],
  });
}
