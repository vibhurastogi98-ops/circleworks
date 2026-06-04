import { NextRequest, NextResponse } from "next/server";
import { and, asc, count, eq, gte, inArray, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  agencyClientAssignments,
  agencyClients,
  agencyInvoiceItems,
  agencyInvoices,
  agencyProjects,
  companies,
  contractorInvoices,
  contractors,
  employees,
  onboardingCases,
  paySchedules,
  payrolls,
  ptoRequests,
  timesheets,
} from "@/db/schema";
import { normalizeAccountType } from "@/lib/account-types";
import type { DashboardSummary } from "@/lib/dashboard-summary";
import { getSession, resolveUserContext } from "@/lib/session";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function addDaysIso(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function scheduleIntervalDays(frequency?: string | null) {
  const normalized = frequency?.toLowerCase();
  if (normalized === "weekly") return 7;
  if (normalized === "biweekly" || normalized === "bi-weekly") return 14;
  if (normalized === "semi-monthly") return 15;
  if (normalized === "monthly") return 30;
  return 14;
}

function numberValue(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function marginPercent(revenue: number, cost: number) {
  if (revenue <= 0) return null;
  return Math.round(((revenue - cost) / revenue) * 1000) / 10;
}

export async function GET(request: NextRequest) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const context = await resolveUserContext(session);
  if (!context?.companyId) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  const companyId = context.companyId;
  const today = todayIso();

  const [
    [company],
    [employeeSummary],
    [nextPayroll],
    [defaultPaySchedule],
    [onboardingCaseSummary],
    [ptoSummary],
    [timesheetSummary],
    [agencyClientSummary],
    [agencyAssignmentSummary],
    [agencyInvoiceSummary],
    [agencyContractorDueSummary],
    [agencyNextContractorDue],
    [creatorContractorDueSummary],
    [creatorNextContractorDue],
    [creatorTaxSummary],
  ] = await Promise.all([
    db
      .select({
        id: companies.id,
        name: companies.name,
        accountType: companies.accountType,
      })
      .from(companies)
      .where(eq(companies.id, companyId))
      .limit(1),
    db
      .select({
        active: sql<number>`count(*) filter (where lower(coalesce(${employees.status}, 'active')) <> 'terminated')`,
        onboarding: sql<number>`count(*) filter (where lower(coalesce(${employees.status}, '')) in ('onboarding', 'pre_boarding'))`,
        contractors: sql<number>`count(*) filter (where lower(coalesce(${employees.employmentType}, '')) like '%contractor%' or lower(coalesce(${employees.payType}, '')) = 'contractor')`,
        salaryTotal: sql<number>`coalesce(sum(coalesce(${employees.salary}, 0)), 0)`,
      })
      .from(employees)
      .where(eq(employees.companyId, companyId)),
    db
      .select({
        date: payrolls.checkDate,
        employeeCount: sql<number>`count(${employees.id})`,
        estimatedGross: payrolls.totalGross,
        status: payrolls.status,
      })
      .from(payrolls)
      .leftJoin(employees, eq(employees.companyId, payrolls.companyId))
      .where(and(eq(payrolls.companyId, companyId), gte(payrolls.checkDate, today)))
      .groupBy(payrolls.id)
      .orderBy(asc(payrolls.checkDate))
      .limit(1),
    db
      .select({
        frequency: paySchedules.frequency,
      })
      .from(paySchedules)
      .where(eq(paySchedules.companyId, companyId))
      .orderBy(sql`${paySchedules.isDefault} desc`, asc(paySchedules.createdAt))
      .limit(1),
    db
      .select({ value: count() })
      .from(onboardingCases)
      .innerJoin(employees, eq(onboardingCases.employeeId, employees.id))
      .where(
        and(
          eq(employees.companyId, companyId),
          sql`lower(coalesce(${onboardingCases.status}, 'active')) not in ('complete', 'completed', 'closed')`,
        ),
      ),
    db
      .select({ value: count() })
      .from(ptoRequests)
      .where(and(eq(ptoRequests.companyId, companyId), eq(ptoRequests.status, "Pending"))),
    db
      .select({ value: count() })
      .from(timesheets)
      .where(and(eq(timesheets.companyId, companyId), inArray(timesheets.status, ["Pending", "Draft"]))),
    db
      .select({
        activeClients: count(),
      })
      .from(agencyClients)
      .where(eq(agencyClients.companyId, companyId)),
    db
      .select({
        activeProjects: sql<number>`count(distinct ${agencyProjects.id})`,
        activeContractors: sql<number>`count(*) filter (where lower(${agencyClientAssignments.workerType}) = 'contractor')`,
        assignmentCost: sql<number>`coalesce(sum(coalesce(${agencyClientAssignments.payRate}, 0) * coalesce(${agencyClientAssignments.hoursPerMonth}, 0)), 0)`,
        assignmentRevenue: sql<number>`coalesce(sum(coalesce(${agencyClientAssignments.billRate}, 0) * coalesce(${agencyClientAssignments.hoursPerMonth}, 0)), 0)`,
      })
      .from(agencyProjects)
      .leftJoin(agencyClientAssignments, eq(agencyClientAssignments.projectId, agencyProjects.id))
      .where(eq(agencyProjects.companyId, companyId)),
    db
      .select({
        revenue: sql<number>`coalesce(sum(coalesce(${agencyInvoiceItems.total}, 0)), 0)`,
        cost: sql<number>`coalesce(sum(coalesce(${agencyInvoiceItems.cost}, 0)), 0)`,
      })
      .from(agencyInvoiceItems)
      .innerJoin(agencyInvoices, eq(agencyInvoiceItems.invoiceId, agencyInvoices.id))
      .where(eq(agencyInvoices.companyId, companyId)),
    db
      .select({
        amount: sql<number>`coalesce(sum(coalesce(${contractorInvoices.amount}, 0)), 0)`,
        count: count(),
      })
      .from(contractorInvoices)
      .innerJoin(contractors, eq(contractorInvoices.contractorId, contractors.id))
      .where(
        and(
          eq(contractors.companyId, companyId),
          inArray(contractorInvoices.status, ["Pending", "Approved"]),
        ),
      ),
    db
      .select({ dueDate: contractorInvoices.dueDate })
      .from(contractorInvoices)
      .innerJoin(contractors, eq(contractorInvoices.contractorId, contractors.id))
      .where(
        and(
          eq(contractors.companyId, companyId),
          inArray(contractorInvoices.status, ["Pending", "Approved"]),
          gte(contractorInvoices.dueDate, today),
        ),
      )
      .orderBy(asc(contractorInvoices.dueDate))
      .limit(1),
    db
      .select({
        amount: sql<number>`coalesce(sum(coalesce(${contractorInvoices.amount}, 0)), 0)`,
        count: count(),
      })
      .from(contractorInvoices)
      .innerJoin(contractors, eq(contractorInvoices.contractorId, contractors.id))
      .where(
        and(
          eq(contractors.companyId, companyId),
          inArray(contractorInvoices.status, ["Pending", "Approved"]),
        ),
      ),
    db
      .select({ dueDate: contractorInvoices.dueDate })
      .from(contractorInvoices)
      .innerJoin(contractors, eq(contractorInvoices.contractorId, contractors.id))
      .where(
        and(
          eq(contractors.companyId, companyId),
          inArray(contractorInvoices.status, ["Pending", "Approved"]),
          gte(contractorInvoices.dueDate, today),
        ),
      )
      .orderBy(asc(contractorInvoices.dueDate))
      .limit(1),
    db
      .select({
        gross: sql<number>`coalesce(sum(coalesce(${payrolls.totalGross}, 0)), 0)`,
        taxes: sql<number>`coalesce(sum(coalesce(${payrolls.totalTaxes}, 0)), 0)`,
      })
      .from(payrolls)
      .where(and(eq(payrolls.companyId, companyId), gte(payrolls.checkDate, addDaysIso(-90)))),
  ]);

  if (!company) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  const activeHeadcount = numberValue(employeeSummary?.active);
  const onboardingEmployees = numberValue(employeeSummary?.onboarding);
  const salaryTotal = numberValue(employeeSummary?.salaryTotal);
  const payrollEstimate = numberValue(nextPayroll?.estimatedGross) || Math.round(salaryTotal / 12);
  const fallbackPayrollDate = defaultPaySchedule
    ? addDaysIso(scheduleIntervalDays(defaultPaySchedule.frequency))
    : null;
  const payrollDate = nextPayroll?.date ?? fallbackPayrollDate;
  const agencyRevenue =
    numberValue(agencyInvoiceSummary?.revenue) ||
    numberValue(agencyAssignmentSummary?.assignmentRevenue);
  const agencyCost =
    numberValue(agencyInvoiceSummary?.cost) ||
    numberValue(agencyAssignmentSummary?.assignmentCost);
  const contractorDueAmount = numberValue(agencyContractorDueSummary?.amount);
  const contractorDueCount = numberValue(agencyContractorDueSummary?.count);
  const taxAmount =
    numberValue(creatorTaxSummary?.taxes) ||
    Math.round(numberValue(creatorTaxSummary?.gross) * 0.25);

  const response: DashboardSummary = {
    accountType: normalizeAccountType(company.accountType),
    companyId,
    companyName: company.name,
    generatedAt: new Date().toISOString(),
    company: {
      headcount: {
        active: activeHeadcount,
        onboarding: onboardingEmployees,
      },
      nextPayroll: {
        date: payrollDate,
        employeeCount: numberValue(nextPayroll?.employeeCount) || activeHeadcount,
        estimatedGross: payrollEstimate,
        status: nextPayroll?.status ?? (fallbackPayrollDate ? "scheduled" : null),
      },
      pendingHrTasks: {
        total:
          numberValue(onboardingCaseSummary?.value) +
          onboardingEmployees +
          numberValue(ptoSummary?.value) +
          numberValue(timesheetSummary?.value),
        onboardingCases: numberValue(onboardingCaseSummary?.value),
        onboardingEmployees,
        ptoRequests: numberValue(ptoSummary?.value),
        timesheets: numberValue(timesheetSummary?.value),
      },
      quickActions: [
        { id: "run-payroll", label: "Run payroll", href: "/payroll/run", tone: "primary" },
        { id: "add-employee", label: "Add employee", href: "/employees/new", tone: "secondary" },
      ],
    },
    agency: {
      clientMargin: {
        revenue: agencyRevenue,
        cost: agencyCost,
        marginPercent: marginPercent(agencyRevenue, agencyCost),
        activeClients: numberValue(agencyClientSummary?.activeClients),
        activeProjects: numberValue(agencyAssignmentSummary?.activeProjects),
      },
      contractorPaymentsDue: {
        amount: contractorDueAmount,
        count: contractorDueCount,
        nextDueDate: agencyNextContractorDue?.dueDate ?? null,
      },
      nextMixedPayroll: {
        date: payrollDate,
        employeeCount: activeHeadcount,
        contractorCount:
          numberValue(agencyAssignmentSummary?.activeContractors) ||
          numberValue(employeeSummary?.contractors),
        estimatedGross: payrollEstimate,
        contractorAmount: contractorDueAmount,
        status: nextPayroll?.status ?? (fallbackPayrollDate ? "scheduled" : null),
      },
      quickActions: [
        { id: "pay-contractors", label: "Pay contractors", href: "/app/contractors", tone: "primary" },
        { id: "add-client", label: "Add client", href: "/app/clients", tone: "secondary" },
      ],
    },
    creator: {
      nextSelfPay: {
        date: payrollDate,
        amount: payrollEstimate,
        status: nextPayroll?.status ?? (fallbackPayrollDate ? "scheduled" : null),
      },
      taxSetAside: {
        amount: taxAmount,
        basis: numberValue(creatorTaxSummary?.taxes)
          ? "payroll_taxes"
          : numberValue(creatorTaxSummary?.gross)
            ? "estimated_gross"
            : "none",
      },
      contractorPayments: {
        amount: numberValue(creatorContractorDueSummary?.amount),
        count: numberValue(creatorContractorDueSummary?.count),
        nextDueDate: creatorNextContractorDue?.dueDate ?? null,
      },
      quickActions: [
        { id: "pay-myself", label: "Pay myself", href: "/app/pay-myself", tone: "primary" },
        { id: "add-contractor", label: "Add contractor", href: "/app/contractors", tone: "secondary" },
      ],
    },
  };

  return NextResponse.json(response);
}
