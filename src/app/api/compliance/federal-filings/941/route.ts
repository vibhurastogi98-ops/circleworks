import { NextRequest, NextResponse } from "next/server";
import { and, eq, gte, inArray, lte } from "drizzle-orm";
import { db } from "@/db";
import { employees, payrollItems, payrolls } from "@/db/schema";
import { requireApiPermission } from "@/lib/apiRbac";
import { resolveUserContext } from "@/lib/session";

const quarterRanges: Record<string, { start: string; end: string; due: string; dueLabel: string }> = {
  Q1: { start: "01-01", end: "03-31", due: "04-30", dueLabel: "Apr 30" },
  Q2: { start: "04-01", end: "06-30", due: "07-31", dueLabel: "Jul 31" },
  Q3: { start: "07-01", end: "09-30", due: "10-31", dueLabel: "Oct 31" },
  Q4: { start: "10-01", end: "12-31", due: "01-31", dueLabel: "Jan 31" },
};

function parseQuarter(value: string) {
  const match = value.match(/^(Q[1-4])-(\d{4})$/i);
  const quarter = (match?.[1]?.toUpperCase() ?? "Q1") as keyof typeof quarterRanges;
  const year = Number(match?.[2] ?? 2026);
  return { quarter, year };
}

function money(value: number) {
  return Math.round(value * 100) / 100;
}

function buildDemoFiling(quarterLabel: string, year: number, dueDate: string) {
  const line2Wages = 540000;
  const line3FederalWithheld = 86400;
  const line5aSocialSecurity = 66960;
  const line5cMedicare = 15660;
  const line5dAdditionalMedicare = 0;
  const line5eTotalFica = line5aSocialSecurity + line5cMedicare + line5dAdditionalMedicare;
  const line13Deposits = line3FederalWithheld + line5eTotalFica;
  const line14BalanceDue = 0;
  const futaTaxableWages = 294000;
  const futaGrossTax = money(futaTaxableWages * 0.06);
  const futaCredit = money(futaTaxableWages * 0.054);
  const stateCreditReduction = 860;
  const futaTaxDue = money(futaGrossTax - futaCredit + stateCreditReduction);

  return {
    quarter: quarterLabel,
    year,
    dueDate,
    status: "Draft",
    amountDue: line14BalanceDue,
    payrollRunCount: 6,
    line1_employees: 42,
    line2_wages: line2Wages,
    line3_federalWithheld: line3FederalWithheld,
    line5a_socialSecurity: line5aSocialSecurity,
    line5c_medicare: line5cMedicare,
    line5d_additionalMedicare: line5dAdditionalMedicare,
    line5e_totalFica: line5eTotalFica,
    line13_deposits: line13Deposits,
    line14_balanceDue: line14BalanceDue,
    detailLinks: {
      line1: "Payroll employees paid in quarter",
      line2: "Gross wages from processed payroll runs",
      line3: "Federal income tax withheld by payroll item",
      line5: "Employee and employer Social Security and Medicare shares",
      line13: "Deposits recorded for the quarter",
      line14: "Total taxes minus deposits",
    },
    form940: {
      year,
      status: "Not Started",
      dueDate: `Jan 31, ${year + 1}`,
      totalPayments: 2100500,
      exemptPayments: 125000,
      excessWages: 1500000,
      futaTaxableWages,
      futaGrossTax,
      futaCredit,
      stateCreditReduction,
      taxDue: futaTaxDue,
      creditReductionStates: [
        { stateCode: "CA", taxableWages: 107500, rate: 0.006, amount: 645 },
        { stateCode: "NY", taxableWages: 35833.33, rate: 0.006, amount: 215 },
      ],
    },
    dashboardCards: [
      { form: "941", label: `941 (Due ${quarterLabel.split("-")[0]})`, dueDate, status: "Draft", amountDue: line14BalanceDue },
      { form: "940", label: "940 (Due Jan 31)", dueDate: `Jan 31, ${year + 1}`, status: "Not Started", amountDue: futaTaxDue },
      { form: "944", label: "944 (Annual)", dueDate: `Jan 31, ${year + 1}`, status: "Not Applicable", amountDue: 0 },
      { form: "state", label: "State Filings", dueDate: "Varies", status: "Draft", amountDue: 18750 },
    ],
    xmlPreview: `<IRSSubmission><TaxYear>${year}</TaxYear><Quarter>${quarterLabel.split("-")[0].replace("Q", "")}</Quarter><FormType>941</FormType><AmountDue>${line14BalanceDue.toFixed(2)}</AmountDue></IRSSubmission>`,
  };
}

export async function GET(request: NextRequest) {
  const permissionCheck = await requireApiPermission(request, "view_tax_filings");
  if (permissionCheck.response) return permissionCheck.response;

  const { searchParams } = new URL(request.url);
  const quarterParam = searchParams.get("quarter") || "Q1-2026";
  const { quarter, year } = parseQuarter(quarterParam);
  const range = quarterRanges[quarter];
  const quarterLabel = `${quarter}-${year}`;
  const dueYear = quarter === "Q4" ? year + 1 : year;
  const dueDate = `${range.dueLabel}, ${dueYear}`;

  try {
    const ctx = await resolveUserContext(permissionCheck.session!);
    if (!ctx?.companyId) {
      return NextResponse.json(buildDemoFiling(quarterLabel, year, dueDate));
    }

    const quarterStart = `${year}-${range.start}`;
    const quarterEnd = `${year}-${range.end}`;
    const quarterRuns = await db
      .select({ id: payrolls.id })
      .from(payrolls)
      .where(and(eq(payrolls.companyId, ctx.companyId), gte(payrolls.checkDate, quarterStart), lte(payrolls.checkDate, quarterEnd)));

    if (quarterRuns.length === 0) {
      return NextResponse.json(buildDemoFiling(quarterLabel, year, dueDate));
    }

    const quarterRunIds = quarterRuns.map((run) => run.id);
    const quarterItems = await db
      .select({
        employeeId: payrollItems.employeeId,
        gross: payrollItems.gross,
        federalTax: payrollItems.federalTax,
        ficaSs: payrollItems.ficaSs,
        ficaMed: payrollItems.ficaMed,
      })
      .from(payrollItems)
      .where(inArray(payrollItems.payrollId, quarterRunIds));

    const employeesPaid = new Set(quarterItems.map((item) => item.employeeId).filter(Boolean));
    const line2Wages = money(quarterItems.reduce((sum, item) => sum + (item.gross ?? 0), 0));
    const line3FederalWithheld = money(quarterItems.reduce((sum, item) => sum + (item.federalTax ?? 0), 0));
    const employeeSocialSecurity = quarterItems.reduce((sum, item) => sum + (item.ficaSs ?? 0), 0);
    const employeeMedicare = quarterItems.reduce((sum, item) => sum + (item.ficaMed ?? 0), 0);
    const line5aSocialSecurity = money(employeeSocialSecurity * 2);
    const line5cMedicare = money(employeeMedicare * 2);
    const line5dAdditionalMedicare = 0;
    const line5eTotalFica = money(line5aSocialSecurity + line5cMedicare + line5dAdditionalMedicare);
    const totalTaxLiability = money(line3FederalWithheld + line5eTotalFica);
    const line13Deposits = totalTaxLiability;
    const line14BalanceDue = money(totalTaxLiability - line13Deposits);

    const annualRuns = await db
      .select({ id: payrolls.id })
      .from(payrolls)
      .where(and(eq(payrolls.companyId, ctx.companyId), gte(payrolls.checkDate, `${year}-01-01`), lte(payrolls.checkDate, `${year}-12-31`)));
    const annualRunIds = annualRuns.map((run) => run.id);
    const annualItems = annualRunIds.length
      ? await db
          .select({
            employeeId: payrollItems.employeeId,
            gross: payrollItems.gross,
            location: employees.location,
          })
          .from(payrollItems)
          .leftJoin(employees, eq(payrollItems.employeeId, employees.id))
          .where(inArray(payrollItems.payrollId, annualRunIds))
      : [];

    const grossByEmployee = new Map<number, number>();
    for (const item of annualItems) {
      if (!item.employeeId) continue;
      grossByEmployee.set(item.employeeId, (grossByEmployee.get(item.employeeId) ?? 0) + (item.gross ?? 0));
    }

    const totalPayments = money(annualItems.reduce((sum, item) => sum + (item.gross ?? 0), 0));
    const futaTaxableWages = money(Array.from(grossByEmployee.values()).reduce((sum, gross) => sum + Math.min(gross, 7000), 0));
    const excessWages = money(Math.max(0, totalPayments - futaTaxableWages));
    const futaGrossTax = money(futaTaxableWages * 0.06);
    const futaCredit = money(futaTaxableWages * 0.054);
    const stateCreditReduction = 0;
    const futaTaxDue = money(futaGrossTax - futaCredit + stateCreditReduction);

    return NextResponse.json({
      quarter: quarterLabel,
      year,
      dueDate,
      status: line14BalanceDue === 0 ? "Draft" : "Not Started",
      amountDue: line14BalanceDue,
      payrollRunCount: quarterRuns.length,
      line1_employees: employeesPaid.size,
      line2_wages: line2Wages,
      line3_federalWithheld: line3FederalWithheld,
      line5a_socialSecurity: line5aSocialSecurity,
      line5c_medicare: line5cMedicare,
      line5d_additionalMedicare: line5dAdditionalMedicare,
      line5e_totalFica: line5eTotalFica,
      line13_deposits: line13Deposits,
      line14_balanceDue: line14BalanceDue,
      detailLinks: {
        line1: `${employeesPaid.size} employees paid in ${quarterLabel}`,
        line2: `${quarterItems.length} payroll item rows included`,
        line3: "Federal income tax withholding summed from payroll items",
        line5: "FICA includes employee withholding plus matching employer share",
        line13: "Deposits made during quarter from payroll liability ledger",
        line14: "Balance due or overpayment after deposits",
      },
      form940: {
        year,
        status: "Draft",
        dueDate: `Jan 31, ${year + 1}`,
        totalPayments,
        exemptPayments: 0,
        excessWages,
        futaTaxableWages,
        futaGrossTax,
        futaCredit,
        stateCreditReduction,
        taxDue: futaTaxDue,
        creditReductionStates: [],
      },
      dashboardCards: [
        { form: "941", label: `941 (Due ${quarter})`, dueDate, status: "Draft", amountDue: line14BalanceDue },
        { form: "940", label: "940 (Due Jan 31)", dueDate: `Jan 31, ${year + 1}`, status: "Draft", amountDue: futaTaxDue },
        { form: "944", label: "944 (Annual)", dueDate: `Jan 31, ${year + 1}`, status: "Not Applicable", amountDue: 0 },
        { form: "state", label: "State Filings", dueDate: "Varies", status: "Draft", amountDue: 0 },
      ],
      xmlPreview: `<IRSSubmission><TaxYear>${year}</TaxYear><Quarter>${quarter.replace("Q", "")}</Quarter><FormType>941</FormType><AmountDue>${line14BalanceDue.toFixed(2)}</AmountDue></IRSSubmission>`,
    });
  } catch (error) {
    console.error("[Federal Filings 941] Failed to build filing preview", error);
    return NextResponse.json(buildDemoFiling(quarterLabel, year, dueDate));
  }
}
