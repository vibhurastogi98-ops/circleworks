import { NextResponse, type NextRequest } from "next/server";
import { and, asc, eq, gte, lte } from "drizzle-orm";
import * as XLSX from "xlsx";

import { db } from "@/db";
import { employees, payrolls, payrollItems } from "@/db/schema";
import { getSession, resolveUserContext } from "@/lib/session";

export const dynamic = "force-dynamic";

const HEADERS = [
  "Check Date",
  "Pay Period",
  "Employee",
  "Department",
  "Employee Type",
  "Gross",
  "Federal Tax",
  "State Tax",
  "FICA (SS + Medicare)",
  "Benefits / Other Deductions",
  "Net Pay",
];

function toCsv(headers: string[], rows: (string | number)[][]): string {
  const escape = (v: string | number) => {
    const s = String(v ?? "");
    if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const lines = [headers.map(escape).join(",")];
  for (const row of rows) lines.push(row.map(escape).join(","));
  return lines.join("\n");
}

function money(cents: number) {
  return (cents / 100).toFixed(2);
}

export async function GET(request: NextRequest) {
  const session = await getSession(request);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const ctx = await resolveUserContext(session);
  if (!ctx?.companyId) return NextResponse.json({ error: "no_company" }, { status: 400 });

  const url = new URL(request.url);
  const format = url.searchParams.get("format") === "xlsx" ? "xlsx" : "csv";

  // Date window — defaults to the last 90 days of check dates.
  const now = new Date();
  const defaultStart = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const start = url.searchParams.get("start") ?? defaultStart;
  const end = url.searchParams.get("end") ?? now.toISOString().slice(0, 10);

  // Join items → payrolls (for check date + period) → employees (for name + dept).
  // Cross-tenant scoping via payrolls.company_id — the API key / session's
  // companyId is the only source of truth.
  const rows = await db
    .select({
      checkDate: payrolls.checkDate,
      periodStart: payrolls.payPeriodStart,
      periodEnd: payrolls.payPeriodEnd,
      firstName: employees.firstName,
      lastName: employees.lastName,
      department: employees.department,
      employmentType: employees.employmentType,
      gross: payrollItems.gross,
      federalTax: payrollItems.federalTax,
      stateTax: payrollItems.stateTax,
      ficaSs: payrollItems.ficaSs,
      ficaMed: payrollItems.ficaMed,
      benefits: payrollItems.benefits,
      net: payrollItems.net,
    })
    .from(payrollItems)
    .innerJoin(payrolls, eq(payrollItems.payrollId, payrolls.id))
    .leftJoin(employees, eq(payrollItems.employeeId, employees.id))
    .where(and(
      eq(payrolls.companyId, ctx.companyId),
      eq(payrolls.status, "paid"),
      gte(payrolls.checkDate, start),
      lte(payrolls.checkDate, end),
    ))
    .orderBy(asc(payrolls.checkDate), asc(payrollItems.employeeId));

  const data = rows.map((r) => {
    const employeeName = `${r.firstName ?? ""} ${r.lastName ?? ""}`.trim() || "—";
    const period = `${r.periodStart} → ${r.periodEnd}`;
    const federalTax = r.federalTax ?? 0;
    const stateTax = r.stateTax ?? 0;
    const fica = (r.ficaSs ?? 0) + (r.ficaMed ?? 0);
    const other = r.benefits ?? 0;
    return [
      String(r.checkDate ?? ""),
      period,
      employeeName,
      r.department ?? "",
      r.employmentType ?? "",
      money(r.gross ?? 0),
      money(federalTax),
      money(stateTax),
      money(fica),
      money(other),
      money(r.net ?? 0),
    ];
  });

  const filenameBase = `payroll-summary_${start}_to_${end}`;

  if (format === "xlsx") {
    const worksheet = XLSX.utils.aoa_to_sheet([HEADERS, ...data]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payroll Summary");
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filenameBase}.xlsx"`,
      },
    });
  }

  return new Response(toCsv(HEADERS, data), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filenameBase}.csv"`,
    },
  });
}
