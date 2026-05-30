import * as XLSX from "xlsx";

import { payrollSummaryRows, toCsv } from "@/data/reportsAnalytics";

const headers = [
  "Employee",
  "Department",
  "Employee Type",
  "Gross",
  "Federal Tax",
  "FICA",
  "State Tax",
  "Other Deductions",
  "Net Pay",
];

const rows = payrollSummaryRows.map((row) => [
  row.employee,
  row.department,
  row.employeeType,
  row.gross,
  row.federalTax,
  row.fica,
  row.stateTax,
  row.otherDeductions,
  row.netPay,
]);

export async function GET(request: Request) {
  const url = new URL(request.url);
  const format = url.searchParams.get("format") ?? "csv";

  if (format === "xlsx") {
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payroll Summary");
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="payroll-summary.xlsx"',
      },
    });
  }

  return new Response(toCsv(headers, rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="payroll-summary.csv"',
    },
  });
}
