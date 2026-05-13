import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { companies, employees, payrollItems, payrolls } from "@/db/schema";
import type { PayrollRunReportData, PayrollRunReportEmployeeRow, PayrollRunReportGlLine } from "./payroll-run-report-types";

function formatPeriod(start: string, end: string) {
  return `${start} – ${end}`;
}

export function currency(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Demo runs keyed by history UI ids (e.g. pr-001). */
function demoReportForSlug(slug: string): PayrollRunReportData | null {
  const m = /^pr-?(\d+)$/i.exec(slug.trim());
  if (!m) return null;
  const n = parseInt(m[1], 10);
  const label = `PR-${String(n).padStart(3, "0")}`;
  return {
    companyName: "CircleWorks Demo Co.",
    runIdLabel: label,
    payPeriodLabel: "Mar 1 – 15, 2026",
    runDateLabel: "Mar 15, 2026",
    totalPayroll: 278_420,
    totalGross: 230_000,
    totalTaxes: 52_105,
    totalDeductions: 30_000,
    totalNet: 196_315,
    employerFica: 17_595,
    employerFuta: 420,
    employerSuta: 1_380,
    employerBenefits: 30_000,
    employees: [
      { name: "Alex Johnson", gross: 7_208.33, taxes: 1_891.2, deductions: 400, net: 4_917.13 },
      { name: "Maria Garcia", gross: 7_708.33, taxes: 2_012.5, deductions: 250, net: 5_445.83 },
      { name: "Jordan Lee", gross: 6_250, taxes: 1_534.1, deductions: 180, net: 4_535.9 },
    ],
    glMappingConfigured: true,
    journalLines: [
      { account: "6200", description: "Wages & salaries", debit: 230_000, credit: 0 },
      { account: "2110", description: "FIT payable", debit: 0, credit: 42_100 },
      { account: "2120", description: "FICA payable (EE+ER)", debit: 0, credit: 38_500 },
      { account: "2130", description: "State IT payable", debit: 0, credit: 15_200 },
      { account: "1010", description: "Cash — net pay", debit: 0, credit: 196_315 },
    ],
  };
}

export async function buildPayrollRunReportData(
  runIdParam: string,
  companyId: number
): Promise<PayrollRunReportData | null> {
  const numericId = Number.parseInt(runIdParam, 10);
  if (!Number.isFinite(numericId)) {
    return demoReportForSlug(runIdParam);
  }

  const [run] = await db
    .select()
    .from(payrolls)
    .where(and(eq(payrolls.id, numericId), eq(payrolls.companyId, companyId)))
    .limit(1);

  if (!run) {
    return null;
  }

  const [co] = await db.select().from(companies).where(eq(companies.id, run.companyId!)).limit(1);

  const items = await db
    .select({
      firstName: employees.firstName,
      lastName: employees.lastName,
      gross: payrollItems.gross,
      federalTax: payrollItems.federalTax,
      stateTax: payrollItems.stateTax,
      ficaSs: payrollItems.ficaSs,
      ficaMed: payrollItems.ficaMed,
      benefits: payrollItems.benefits,
      net: payrollItems.net,
    })
    .from(payrollItems)
    .innerJoin(employees, eq(payrollItems.employeeId, employees.id))
    .where(eq(payrollItems.payrollId, run.id));

  const employeeRows: PayrollRunReportEmployeeRow[] = items.map((r) => {
    const taxes = (r.federalTax ?? 0) + (r.stateTax ?? 0) + (r.ficaSs ?? 0) + (r.ficaMed ?? 0);
    const gross = r.gross;
    const ben = r.benefits ?? 0;
    const deductions = Math.max(0, gross - taxes - ben - r.net);
    return {
      name: `${r.firstName} ${r.lastName ?? ""}`.trim(),
      gross,
      taxes,
      deductions,
      net: r.net,
    };
  });

  const sum = (fn: (e: PayrollRunReportEmployeeRow) => number) => employeeRows.reduce((a, e) => a + fn(e), 0);

  const totalGross =
    run.totalGross && run.totalGross > 0 ? run.totalGross : employeeRows.length ? sum((e) => e.gross) : 0;
  const totalTaxes =
    run.totalTaxes && run.totalTaxes > 0 ? run.totalTaxes : employeeRows.length ? sum((e) => e.taxes) : 0;
  const totalDeductions = employeeRows.length ? sum((e) => e.deductions) : 0;
  const totalNet = run.totalNet && run.totalNet > 0 ? run.totalNet : employeeRows.length ? sum((e) => e.net) : 0;

  const erFicaSs = employeeRows.length ? sum((e) => e.gross * 0.062) : 0;
  const erFicaMed = employeeRows.length ? sum((e) => e.gross * 0.0145) : 0;
  const employerFica = Math.round((erFicaSs + erFicaMed) * 100) / 100;
  const employerFuta = Math.round(totalGross * 0.003 * 100) / 100;
  const employerSuta = Math.round(totalGross * 0.005 * 100) / 100;
  const employerBenefits = run.totalBenefits && run.totalBenefits > 0 ? run.totalBenefits : 0;

  const totalPayroll = totalGross + employerFica + employerFuta + employerSuta + employerBenefits;

  const payPeriodLabel = formatPeriod(String(run.payPeriodStart), String(run.payPeriodEnd));
  const runDateLabel = String(run.checkDate);

  const glMappingConfigured = process.env.PAYROLL_GL_MAPPING_ENABLED === "true";
  const journalLines: PayrollRunReportGlLine[] = glMappingConfigured
    ? [
        { account: "6200", description: "Payroll expense (gross)", debit: totalGross, credit: 0 },
        {
          account: "6310",
          description: "Employer payroll taxes",
          debit: employerFica + employerFuta + employerSuta,
          credit: 0,
        },
        { account: "2100", description: "Payroll liabilities (net + taxes)", debit: 0, credit: totalNet + totalTaxes },
      ]
    : [];

  return {
    companyName: co?.name ?? "Company",
    runIdLabel: `RUN-${run.id}`,
    payPeriodLabel,
    runDateLabel,
    totalPayroll: Math.round(totalPayroll * 100) / 100,
    totalGross,
    totalTaxes,
    totalDeductions,
    totalNet,
    employerFica,
    employerFuta,
    employerSuta,
    employerBenefits,
    employees:
      employeeRows.length > 0
        ? employeeRows
        : [
            {
              name: "— No payroll line items yet —",
              gross: 0,
              taxes: 0,
              deductions: 0,
              net: 0,
            },
          ],
    glMappingConfigured,
    journalLines,
  };
}
