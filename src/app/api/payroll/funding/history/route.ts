import { NextResponse } from "next/server";

type FundingLedgerItem = {
  id: string;
  date: string;
  type: "Debit" | "Credit";
  amount: number;
  status: "Cleared" | "Pending" | "Failed";
  reference: string;
  payrollRun: string;
  matched: boolean;
  note: string;
};

const TRUST_OPENING_BALANCE = 95000;

const ledger: FundingLedgerItem[] = [
  { id: "tx-11", date: "2026-05-28T15:00:00Z", type: "Debit", amount: 118000, status: "Pending", reference: "PR-RUN-MAY2X", payrollRun: "PR-2026-MAY2", matched: true, note: "Scheduled net pay + taxes disbursement" },
  { id: "tx-10", date: "2026-05-24T15:00:00Z", type: "Credit", amount: 118000, status: "Pending", reference: "ACH-WFL-122", payrollRun: "PR-2026-MAY2", matched: true, note: "Scheduled impound funding transfer" },
  { id: "tx-9", date: "2026-05-17T12:45:00Z", type: "Credit", amount: 8400, status: "Cleared", reference: "ACH-DEP-772", payrollRun: "-", matched: false, note: "Unmatched manual deposit" },
  { id: "tx-8", date: "2026-05-16T14:30:00Z", type: "Debit", amount: 118000, status: "Cleared", reference: "PR-RUN-MAY1X", payrollRun: "PR-2026-MAY1", matched: true, note: "Net pay + taxes disbursement" },
  { id: "tx-7", date: "2026-05-15T15:00:00Z", type: "Credit", amount: 118000, status: "Cleared", reference: "ACH-WFL-118", payrollRun: "PR-2026-MAY1", matched: true, note: "Impound funding transfer" },
  { id: "tx-6", date: "2026-04-30T14:30:00Z", type: "Debit", amount: 125000, status: "Cleared", reference: "PR-RUN-APR2X", payrollRun: "PR-2026-APR2", matched: true, note: "Net pay + taxes disbursement" },
  { id: "tx-5", date: "2026-04-26T15:00:00Z", type: "Credit", amount: 125000, status: "Cleared", reference: "ACH-WFL-991", payrollRun: "PR-2026-APR2", matched: true, note: "Impound funding transfer" },
  { id: "tx-4", date: "2026-04-15T14:30:00Z", type: "Debit", amount: 118000, status: "Cleared", reference: "PR-RUN-APR1X", payrollRun: "PR-2026-APR1", matched: true, note: "Net pay + taxes disbursement" },
  { id: "tx-3", date: "2026-04-11T09:12:00Z", type: "Credit", amount: 118000, status: "Cleared", reference: "ACH-WFL-882", payrollRun: "PR-2026-APR1", matched: true, note: "Impound funding transfer" },
  { id: "tx-2", date: "2026-03-29T14:30:00Z", type: "Debit", amount: 115000, status: "Cleared", reference: "PR-RUN-MAR2X", payrollRun: "PR-2026-MAR2", matched: true, note: "Net pay + taxes disbursement" },
  { id: "tx-1", date: "2026-03-25T15:00:00Z", type: "Credit", amount: 115000, status: "Cleared", reference: "ACH-WFL-773", payrollRun: "PR-2026-MAR2", matched: true, note: "Impound funding transfer" },
];

function dateKey(value: string) {
  return value.slice(0, 10);
}

function monthRange(statementMonth: string) {
  const validMonth = /^\d{4}-\d{2}$/.test(statementMonth) ? statementMonth : "2026-05";
  const [year, month] = validMonth.split("-").map(Number);
  const start = `${validMonth}-01`;
  const endDate = new Date(Date.UTC(year, month, 0));
  const end = endDate.toISOString().slice(0, 10);
  return { month: validMonth, start, end };
}

function signedAmount(tx: FundingLedgerItem) {
  return tx.type === "Credit" ? tx.amount : -tx.amount;
}

function monthLabel(month: string) {
  const date = new Date(`${month}-01T00:00:00Z`);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
}

export async function GET(req: Request) {
  const searchParams = new URL(req.url).searchParams;
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const statementMonth = searchParams.get("statementMonth") ?? "2026-05";
  const statementRange = monthRange(statementMonth);

  const filteredLedger = ledger.filter((tx) => {
    const date = dateKey(tx.date);
    if (startDate && date < startDate) return false;
    if (endDate && date > endDate) return false;
    return true;
  });

  const openingBalance = ledger
    .filter((tx) => dateKey(tx.date) < statementRange.start)
    .reduce((sum, tx) => sum + signedAmount(tx), TRUST_OPENING_BALANCE);

  const monthlyLedger = ledger.filter((tx) => {
    const date = dateKey(tx.date);
    return date >= statementRange.start && date <= statementRange.end;
  });

  const totalCredits = monthlyLedger
    .filter((tx) => tx.type === "Credit")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalDebits = monthlyLedger
    .filter((tx) => tx.type === "Debit")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const statement = {
    period: monthLabel(statementRange.month),
    month: statementRange.month,
    openingBalance,
    totalCredits,
    totalDebits,
    closingBalance: openingBalance + totalCredits - totalDebits,
    unmatchedItems: monthlyLedger.filter((tx) => !tx.matched).length,
  };

  return NextResponse.json({
    ledger: filteredLedger,
    statement,
  });
}
