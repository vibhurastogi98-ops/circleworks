import { db } from "@/db";
import {
  benefitEnrollments,
  benefitPlans,
  employees,
  payrollBenefitDeductions,
  payrolls,
} from "@/db/schema";
import { mockBenefitPlans, mockRetirementAccounts } from "@/data/mockBenefits";
import { MOCK_EMPLOYEES } from "@/data/payrollRunMocks";
import { and, eq, inArray, sql } from "drizzle-orm";

export type PaySchedule = "weekly" | "biweekly" | "semi-monthly";

export interface PayrollDeductionLine {
  employeeId: number | string;
  benefitPlanId: number | string;
  planName: string;
  monthlyPremium: number;
  employeeShare: number;
  perPaycheckAmount: number;
  pretaxOrPosttax: "pre_tax" | "post_tax";
  deductionCode: string;
}

export interface PayrollDeductionResult {
  changedEmployeesCount: number;
  deductions: PayrollDeductionLine[];
  paySchedule: PaySchedule;
}

type PayrollRunRow = typeof payrolls.$inferSelect;

type ActivePayrollDeductionLine = PayrollDeductionLine & {
  enrollmentCreatedAt?: Date | null;
  planCreatedAt?: Date | null;
};

const PAY_PERIODS_PER_MONTH: Record<PaySchedule, number> = {
  "semi-monthly": 2,
  biweekly: 2.167,
  weekly: 4.333,
};

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

function inferPaySchedule(startDate?: string | Date | null, endDate?: string | Date | null): PaySchedule {
  if (!startDate || !endDate) return "biweekly";

  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffDays = Math.round((end.getTime() - start.getTime()) / 86400000) + 1;

  if (diffDays <= 7) return "weekly";

  const startDay = start.getDate();
  const endDay = end.getDate();
  const endMonthLastDay = new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate();
  const looksSemiMonthly =
    (startDay === 1 && (endDay === 15 || endDay === 16)) ||
    (startDay >= 15 && endDay === endMonthLastDay);

  return looksSemiMonthly ? "semi-monthly" : "biweekly";
}

function getPretaxOrPosttax(planType: string) {
  const normalized = planType.toLowerCase();
  if (["medical", "dental", "vision", "401k", "fsa", "hsa"].includes(normalized)) {
    return "pre_tax" as const;
  }
  return "post_tax" as const;
}

function getDeductionCode(planType: string) {
  const normalized = planType.toLowerCase();
  if (normalized === "medical") return "MED_PRE";
  if (normalized === "dental") return "DENT_PRE";
  if (normalized === "vision") return "VIS_PRE";
  if (normalized === "401k") return "RET_401K_PRE";
  if (normalized === "fsa") return "FSA_PRE";
  if (normalized === "hsa") return "HSA_PRE";
  if (normalized === "life") return "LIFE_POST";
  if (normalized === "ad&d") return "ADND_POST";
  return `${normalized.replace(/[^a-z0-9]+/g, "_").toUpperCase()}_${getPretaxOrPosttax(planType) === "pre_tax" ? "PRE" : "POST"}`;
}

function calculateEmployeeSharePercent(employeePremium: number, employerPremium: number) {
  const totalMonthlyPremium = employeePremium + employerPremium;
  if (totalMonthlyPremium <= 0) return employeePremium > 0 ? 100 : 0;
  return roundCurrency((employeePremium / totalMonthlyPremium) * 100);
}

export function calculateBenefitPerPaycheck(monthlyPremium: number, employeeSharePercent: number, paySchedule: PaySchedule) {
  return roundCurrency((monthlyPremium * (employeeSharePercent / 100)) / PAY_PERIODS_PER_MONTH[paySchedule]);
}

function formatPlanDisplayName(planType: string, planName: string, carrier?: string | null) {
  if (planType === "401k") return "401(k)";
  if (planType.toLowerCase() === "medical") return `Medical (${carrier || planName})`;
  if (planType.toLowerCase() === "dental") return `Dental (${carrier || planName})`;
  if (planType.toLowerCase() === "vision") return `Vision (${carrier || planName})`;
  return carrier ? `${planName} (${carrier})` : planName;
}

function inferMonthly401kPremium(fullName: string, annualSalaryOrGrossMonthlyBasis: number) {
  const account = mockRetirementAccounts.find((item) => item.employeeName.toLowerCase() === fullName.toLowerCase());
  const contributionRate = account?.contributionRate ?? 6;
  return roundCurrency((annualSalaryOrGrossMonthlyBasis * (contributionRate / 100)) / 12);
}

function buildMockPayrollDeductions(runId: string): PayrollDeductionResult {
  const paySchedule = "biweekly";
  const medicalGold = mockBenefitPlans.find((plan) => plan.id === "bp-1")!;
  const medicalSilver = mockBenefitPlans.find((plan) => plan.id === "bp-2")!;
  const dental = mockBenefitPlans.find((plan) => plan.id === "bp-3")!;
  const vision = mockBenefitPlans.find((plan) => plan.id === "bp-4")!;
  const retirement = mockBenefitPlans.find((plan) => plan.id === "bp-6")!;

  const deductions: PayrollDeductionLine[] = [];

  MOCK_EMPLOYEES.forEach((employee, index) => {
    const selectedPlans = [index % 3 === 0 ? medicalSilver : medicalGold, dental];
    if (index % 5 !== 0) selectedPlans.push(vision);
    if (index % 4 !== 0) selectedPlans.push(retirement);

    selectedPlans.forEach((plan) => {
      const is401k = plan.type === "401k";
      const monthlyPremium = is401k
        ? inferMonthly401kPremium(employee.name, employee.grossPay * 26)
        : roundCurrency(plan.employeePremium + plan.employerPremium);
      const employeeShare = is401k
        ? 100
        : calculateEmployeeSharePercent(plan.employeePremium, plan.employerPremium);

      deductions.push({
        employeeId: employee.id,
        benefitPlanId: plan.id,
        planName: formatPlanDisplayName(plan.type, plan.name, plan.carrier),
        monthlyPremium,
        employeeShare,
        perPaycheckAmount: calculateBenefitPerPaycheck(monthlyPremium, employeeShare, paySchedule),
        pretaxOrPosttax: getPretaxOrPosttax(plan.type),
        deductionCode: getDeductionCode(plan.type),
      });
    });
  });

  return {
    deductions,
    paySchedule,
    changedEmployeesCount: runId === "draft-preview" ? 3 : 0,
  };
}

function stripSourceMetadata(line: ActivePayrollDeductionLine): PayrollDeductionLine {
  const { enrollmentCreatedAt: _enrollmentCreatedAt, planCreatedAt: _planCreatedAt, ...deduction } = line;
  return deduction;
}

function buildLineSignature(line: PayrollDeductionLine) {
  return [
    line.benefitPlanId,
    line.deductionCode,
    line.pretaxOrPosttax,
    line.monthlyPremium,
    line.employeeShare,
    line.perPaycheckAmount,
  ].join(":");
}

function countChangedEmployeesSinceDraft(
  run: PayrollRunRow,
  activeLines: ActivePayrollDeductionLine[],
  persistedLines: PayrollDeductionLine[],
) {
  const changedEmployeeIds = new Set<string | number>();

  if (persistedLines.length === 0) {
    activeLines.forEach((line) => {
      if (
        (line.enrollmentCreatedAt && run.createdAt && line.enrollmentCreatedAt > run.createdAt) ||
        (line.planCreatedAt && run.createdAt && line.planCreatedAt > run.createdAt)
      ) {
        changedEmployeeIds.add(line.employeeId);
      }
    });

    return changedEmployeeIds.size;
  }

  const persistedByEmployee = new Map<string, string[]>();
  persistedLines.forEach((line) => {
    const key = String(line.employeeId);
    const signatures = persistedByEmployee.get(key) || [];
    signatures.push(buildLineSignature(line));
    persistedByEmployee.set(key, signatures);
  });

  const activeByEmployee = new Map<string, string[]>();
  activeLines.forEach((line) => {
    const key = String(line.employeeId);
    const signatures = activeByEmployee.get(key) || [];
    signatures.push(buildLineSignature(line));
    activeByEmployee.set(key, signatures);
  });

  const employeeIds = new Set([...persistedByEmployee.keys(), ...activeByEmployee.keys()]);
  employeeIds.forEach((employeeId) => {
    const persistedSignature = (persistedByEmployee.get(employeeId) || []).sort().join("|");
    const activeSignature = (activeByEmployee.get(employeeId) || []).sort().join("|");
    if (persistedSignature !== activeSignature) {
      changedEmployeeIds.add(employeeId);
    }
  });

  return changedEmployeeIds.size;
}

async function getRun(runId: string) {
  if (!/^\d+$/.test(runId)) {
    return null;
  }

  const [run] = await db
    .select()
    .from(payrolls)
    .where(eq(payrolls.id, Number(runId)))
    .limit(1);

  return run || null;
}

async function getActiveBenefitDeductionsForRun(run: PayrollRunRow): Promise<ActivePayrollDeductionLine[]> {
  const paySchedule = inferPaySchedule(run.payPeriodStart, run.payPeriodEnd);

  const enrolled = await db
    .select({
      employeeId: employees.id,
      employeeFirstName: employees.firstName,
      employeeLastName: employees.lastName,
      annualSalary: employees.salary,
      enrollmentCreatedAt: benefitEnrollments.createdAt,
      planId: benefitPlans.id,
      planName: benefitPlans.name,
      planType: benefitPlans.type,
      carrier: benefitPlans.carrier,
      employeePremium: benefitPlans.employeePremium,
      employerPremium: benefitPlans.employerPremium,
      planCreatedAt: benefitPlans.createdAt,
    })
    .from(benefitEnrollments)
    .innerJoin(employees, eq(benefitEnrollments.employeeId, employees.id))
    .innerJoin(benefitPlans, eq(benefitEnrollments.planId, benefitPlans.id))
    .where(
      and(
        eq(employees.companyId, run.companyId as number),
        inArray(benefitEnrollments.status, ["Active", "Enrolled", "Completed"]),
        eq(benefitPlans.status, "Active")
      )
    );

  return enrolled.map((row) => {
    const fullName = `${row.employeeFirstName} ${row.employeeLastName || ""}`.trim();
    const is401k = row.planType.toLowerCase() === "401k";
    const monthlyPremium = is401k
      ? inferMonthly401kPremium(fullName, row.annualSalary || 0)
      : roundCurrency((row.employeePremium || 0) + (row.employerPremium || 0));
    const employeeShare = is401k
      ? 100
      : calculateEmployeeSharePercent(row.employeePremium || 0, row.employerPremium || 0);

    return {
      employeeId: row.employeeId,
      benefitPlanId: row.planId,
      planName: formatPlanDisplayName(row.planType, row.planName, row.carrier),
      monthlyPremium,
      employeeShare,
      perPaycheckAmount: calculateBenefitPerPaycheck(monthlyPremium, employeeShare, paySchedule),
      pretaxOrPosttax: getPretaxOrPosttax(row.planType),
      deductionCode: getDeductionCode(row.planType),
      enrollmentCreatedAt: row.enrollmentCreatedAt,
      planCreatedAt: row.planCreatedAt,
    };
  });
}

async function getPersistedBenefitDeductions(runId: number): Promise<PayrollDeductionLine[]> {
  const rows = await db
    .select({
      employeeId: payrollBenefitDeductions.employeeId,
      benefitPlanId: payrollBenefitDeductions.benefitPlanId,
      planName: payrollBenefitDeductions.planName,
      monthlyPremium: payrollBenefitDeductions.monthlyPremium,
      employeeShare: payrollBenefitDeductions.employeeShare,
      perPaycheckAmount: payrollBenefitDeductions.perPaycheckAmount,
      pretaxOrPosttax: payrollBenefitDeductions.pretaxOrPosttax,
      deductionCode: payrollBenefitDeductions.deductionCode,
    })
    .from(payrollBenefitDeductions)
    .where(eq(payrollBenefitDeductions.payrollId, runId));

  return rows.map((row) => ({
    employeeId: row.employeeId || "",
    benefitPlanId: row.benefitPlanId || "",
    planName: row.planName,
    monthlyPremium: Number(row.monthlyPremium || 0),
    employeeShare: Number(row.employeeShare || 0),
    perPaycheckAmount: Number(row.perPaycheckAmount || 0),
    pretaxOrPosttax: row.pretaxOrPosttax === "post_tax" ? "post_tax" : "pre_tax",
    deductionCode: row.deductionCode,
  }));
}

export async function getPayrollDeductions(runId: string): Promise<PayrollDeductionResult> {
  const run = await getRun(runId);

  if (!run) {
    return buildMockPayrollDeductions(runId);
  }

  const paySchedule = inferPaySchedule(run.payPeriodStart, run.payPeriodEnd);
  const activeLines = await getActiveBenefitDeductionsForRun(run);
  const persistedLines = await getPersistedBenefitDeductions(run.id);
  const changedEmployeesCount = countChangedEmployeesSinceDraft(run, activeLines, persistedLines);

  return {
    deductions: persistedLines.length > 0 ? persistedLines : activeLines.map(stripSourceMetadata),
    paySchedule,
    changedEmployeesCount,
  };
}

export async function syncPayrollBenefitDeductionsForRun(runId: string | number): Promise<PayrollDeductionResult> {
  const run = await getRun(String(runId));

  if (!run) {
    return buildMockPayrollDeductions(String(runId));
  }

  const paySchedule = inferPaySchedule(run.payPeriodStart, run.payPeriodEnd);
  const activeLines = await getActiveBenefitDeductionsForRun(run);
  const persistedLines = await getPersistedBenefitDeductions(run.id);
  const changedEmployeesCount = countChangedEmployeesSinceDraft(run, activeLines, persistedLines);
  const deductions = activeLines.map(stripSourceMetadata);

  await db
    .delete(payrollBenefitDeductions)
    .where(eq(payrollBenefitDeductions.payrollId, run.id));

  if (deductions.length > 0) {
    await db.insert(payrollBenefitDeductions).values(
      deductions.map((line) => ({
        payrollId: run.id,
        employeeId: Number(line.employeeId),
        benefitPlanId: Number(line.benefitPlanId),
        planName: line.planName,
        monthlyPremium: line.monthlyPremium,
        employeeShare: line.employeeShare,
        perPaycheckAmount: line.perPaycheckAmount,
        pretaxOrPosttax: line.pretaxOrPosttax,
        deductionCode: line.deductionCode,
      }))
    );
  }

  const totalBenefits = roundCurrency(deductions.reduce((sum, line) => sum + line.perPaycheckAmount, 0));
  await db.update(payrolls).set({ totalBenefits: Math.round(totalBenefits) }).where(eq(payrolls.id, run.id));

  return {
    deductions,
    paySchedule,
    changedEmployeesCount,
  };
}

export async function getCompanyPayrollDeductionTotals(companyId: number) {
  const [totals] = await db
    .select({
      enrolledCount: sql<number>`count(*)`,
      totalEmployeePremium: sql<number>`coalesce(sum(${benefitPlans.employeePremium}), 0)`,
    })
    .from(benefitEnrollments)
    .innerJoin(employees, eq(benefitEnrollments.employeeId, employees.id))
    .innerJoin(benefitPlans, eq(benefitEnrollments.planId, benefitPlans.id))
    .where(and(eq(employees.companyId, companyId), eq(benefitPlans.status, "Active")));

  return totals;
}
