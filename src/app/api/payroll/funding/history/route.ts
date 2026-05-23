import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const searchParams = new URL(req.url).searchParams;
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const ledger = [
    { id: "tx-7", date: "2026-04-10T09:00:00Z", type: "Credit", amount: 15600.00, status: "Pending", reference: "ACH-DEP-Q321", payrollRun: "-", matched: false, note: "Unmatched Manual Deposit" },
    { id: "tx-6", date: "2026-04-05T14:30:00Z", type: "Debit", amount: 125000.00, status: "Cleared", reference: "PR-RUN-MAR2X", payrollRun: "PR-2026-M2", matched: true, note: "Net Pay + Taxes Disbursement" },
    { id: "tx-5", date: "2026-04-01T15:00:00Z", type: "Credit", amount: 125000.00, status: "Cleared", reference: "ACH-WFL-991", payrollRun: "PR-2026-M2", matched: true, note: "Impound Funding Transfer" },
    { id: "tx-4", date: "2026-03-20T14:30:00Z", type: "Debit", amount: 118000.00, status: "Cleared", reference: "PR-RUN-MAR1X", payrollRun: "PR-2026-M1", matched: true, note: "Net Pay + Taxes Disbursement" },
    { id: "tx-3", date: "2026-03-18T09:12:00Z", type: "Credit", amount: 118000.00, status: "Cleared", reference: "ACH-WFL-882", payrollRun: "PR-2026-M1", matched: true, note: "Impound Funding Transfer" },
    { id: "tx-2", date: "2026-03-05T14:30:00Z", type: "Debit", amount: 115000.00, status: "Cleared", reference: "PR-RUN-FEB2X", payrollRun: "PR-2026-F2", matched: true, note: "Net Pay + Taxes Disbursement" },
    { id: "tx-1", date: "2026-03-01T15:00:00Z", type: "Credit", amount: 115000.00, status: "Cleared", reference: "ACH-WFL-773", payrollRun: "PR-2026-F2", matched: true, note: "Impound Funding Transfer" },
  ];

  const filteredLedger = ledger.filter((tx) => {
    const date = tx.date.slice(0, 10);
    if (startDate && date < startDate) return false;
    if (endDate && date > endDate) return false;
    return true;
  });

  const statement = {
    period: "April 2026 (MTD)",
    openingBalance: 125000.00, // starting the month with impound pre-loaded
    totalCredits: 140600.00,
    totalDebits: 125000.00,
    closingBalance: 140600.00,
    unmatchedItems: filteredLedger.filter((tx) => !tx.matched).length,
  };

  return NextResponse.json({
    ledger: filteredLedger,
    statement,
  });
}
