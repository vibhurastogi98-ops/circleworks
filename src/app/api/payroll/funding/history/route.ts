import { NextResponse } from "next/server";

export async function GET() {
  const ledger = [
    { id: "tx-7", date: "2026-04-10T09:00:00Z", type: "Credit", amount: 15600.00, status: "Pending", reference: "ACH-DEP-Q321", payrollRun: "-", note: "Unmatched Manual Deposit" },
    { id: "tx-6", date: "2026-04-05T14:30:00Z", type: "Debit", amount: 125000.00, status: "Cleared", reference: "PR-RUN-MAR2X", payrollRun: "PR-2026-M2", note: "Net Pay + Taxes Disbursement" },
    { id: "tx-5", date: "2026-04-01T15:00:00Z", type: "Credit", amount: 125000.00, status: "Cleared", reference: "ACH-WFL-991", payrollRun: "PR-2026-M2", note: "Impound Funding Transfer" },
    { id: "tx-4", date: "2026-03-20T14:30:00Z", type: "Debit", amount: 118000.00, status: "Cleared", reference: "PR-RUN-MAR1X", payrollRun: "PR-2026-M1", note: "Net Pay + Taxes Disbursement" },
    { id: "tx-3", date: "2026-03-18T09:12:00Z", type: "Credit", amount: 118000.00, status: "Cleared", reference: "ACH-WFL-882", payrollRun: "PR-2026-M1", note: "Impound Funding Transfer" },
    { id: "tx-2", date: "2026-03-05T14:30:00Z", type: "Debit", amount: 115000.00, status: "Cleared", reference: "PR-RUN-FEB2X", payrollRun: "PR-2026-F2", note: "Net Pay + Taxes Disbursement" },
    { id: "tx-1", date: "2026-03-01T15:00:00Z", type: "Credit", amount: 115000.00, status: "Cleared", reference: "ACH-WFL-773", payrollRun: "PR-2026-F2", note: "Impound Funding Transfer" },
  ];

  const statement = {
    period: "April 2026 (MTD)",
    openingBalance: 125000.00, // starting the month with impound pre-loaded
    totalCredits: 140600.00,
    totalDebits: 125000.00,
    closingBalance: 140600.00
  };

  return NextResponse.json({
    ledger,
    statement
  });
}
