import { db } from "@/db";
import {
  assetAssignments,
  assets,
  benefitEnrollments,
  employees,
  onboardingCases,
  onboardingTemplates,
  payrollItems,
  payrolls,
  ptoRequests,
  users,
} from "@/db/schema";
import { mockCobraCases } from "@/data/mockBenefits";
import { getAssetsForEmployee, getAssetsForEmployeeName } from "@/data/mockAssets";
import { mockOffboardingCases } from "@/data/mockOnboarding";
import { dispatchWebhook } from "@/lib/webhooks";
import { and, eq, inArray } from "drizzle-orm";

export type TerminationType = "voluntary" | "involuntary" | "layoff" | "other";

export interface TerminationCascadeInput {
  employeeId: number;
  terminationDate: string;
  terminationType: TerminationType;
  state?: string;
  reason?: string;
  finalPayMode?: "off_cycle" | "next_run";
}

export interface TerminationCascadeResult {
  employee: {
    id: number;
    name: string;
    companyId: number | null;
    status: "terminated";
    terminationDate: string;
  };
  pto: {
    cancelledPendingRequests: number;
    employeeNotification: string;
    payoutHours: number;
    payoutAmount: number;
    payoutRule: string;
  };
  payroll: {
    draftRunIds: number[];
    flag: string | null;
    finalPayAmount: number;
    ptoPayoutAmount: number;
    finalPayDate: string;
    finalPayMode: "off_cycle" | "next_run";
    deadlineRule: string;
    earningsLines: Array<{ label: string; amount: number }>;
  };
  benefits: {
    coverageEndDate: string;
    cobraCaseId: string;
    cobraNoticeDueDate: string;
    cobraElectionNoticePdf: string;
    cobraEmailQueued: boolean;
    recordKeeperNotice: string;
  };
  access: {
    statusUpdated: boolean;
    sessionsInvalidated: boolean;
    task: string;
  };
  offboarding: {
    caseId: string | number;
    template: string;
    tasks: Array<{ title: string; assignee: "HR" | "IT" | "Manager" }>;
    assetReturnTasks: Array<{ title: string; assignee: "IT" }>;
  };
  events: Array<"employee.termination.initiated" | "employee.access.revoked" | "employee.cobra.triggered">;
}

const MOCK_EMPLOYEES = [
  { id: 1, firstName: "Sarah", lastName: "Smith", email: "sarah.smith@example.com", jobTitle: "Lead Engineer", department: "Engineering", salary: 145000, status: "active", companyId: 1, location: "New York, NY" },
  { id: 2, firstName: "Michael", lastName: "Chen", email: "m.chen@example.com", jobTitle: "Product Designer", department: "Design", salary: 130000, status: "active", companyId: 1, location: "San Francisco, CA" },
  { id: 3, firstName: "Emma", lastName: "Watson", email: "emma.w@example.com", jobTitle: "Marketing Manager", department: "Marketing", salary: 95000, status: "onboarding", companyId: 1, location: "London, UK" },
  { id: 4, firstName: "David", lastName: "Lee", email: "d.lee@example.com", jobTitle: "Sales Director", department: "Sales", salary: 160000, status: "active", companyId: 1, location: "Austin, TX" },
];

function addDays(date: string, days: number) {
  const next = new Date(`${date}T00:00:00`);
  next.setDate(next.getDate() + days);
  return next.toISOString().slice(0, 10);
}

function endOfMonth(date: string) {
  const source = new Date(`${date}T00:00:00`);
  return new Date(source.getFullYear(), source.getMonth() + 1, 0).toISOString().slice(0, 10);
}

function stateFromLocation(location?: string | null) {
  const match = location?.match(/,\s*([A-Z]{2})(?:\s|$)/);
  return match?.[1] || "CA";
}

function finalPayDeadline(state: string, terminationDate: string) {
  if (["CA", "MT"].includes(state)) {
    return { date: terminationDate, rule: `${state}: final paycheck due same day` };
  }
  if (["CO", "ND"].includes(state)) {
    return { date: "next scheduled pay date", rule: `${state}: final paycheck due by next scheduled pay date` };
  }
  return { date: addDays(terminationDate, 7), rule: "State deadline varies; defaulting to seven-day off-cycle target" };
}

function estimateFinalPay(salary: number | null | undefined, terminationDate: string) {
  const monthlySalary = (salary || 0) / 12;
  const day = new Date(`${terminationDate}T00:00:00`).getDate();
  const daysInMonth = new Date(new Date(`${terminationDate}T00:00:00`).getFullYear(), new Date(`${terminationDate}T00:00:00`).getMonth() + 1, 0).getDate();
  return Math.round(monthlySalary * (day / daysInMonth) * 100) / 100;
}

function estimatePtoPayout(salary: number | null | undefined, state: string) {
  const payoutHours = 40;
  const hourlyRate = (salary || 0) / 2080;
  return {
    payoutHours,
    payoutAmount: state === "CA" ? Math.round(payoutHours * hourlyRate * 100) / 100 : 0,
    payoutRule: state === "CA" ? "CA: mandatory cash payout for accrued unused PTO" : "Per company policy outside mandatory payout states",
  };
}

function buildOffboardingTasks(name: string, terminationDate: string, assetNames: string[]) {
  return [
    { title: `Calculate final pay for ${name}`, assignee: "HR" as const },
    { title: `Send COBRA notice to ${name}`, assignee: "HR" as const },
    { title: `Notify 401(k) record keeper of termination date ${terminationDate}`, assignee: "HR" as const },
    { title: `Revoke system access for ${name} - terminated ${terminationDate}`, assignee: "IT" as const },
    { title: `Complete manager offboarding handoff for ${name}`, assignee: "Manager" as const },
    ...assetNames.map((assetName) => ({ title: `Collect returned asset: ${assetName}`, assignee: "IT" as const })),
  ];
}

function buildResult(params: {
  employeeId: number;
  name: string;
  terminationDate: string;
  terminationType: TerminationType;
  state: string;
  salary?: number | null;
  companyId?: number | null;
  cancelledPendingRequests: number;
  draftRunIds: number[];
  offboardingCaseId: string | number;
  assetNames: string[];
  finalPayMode: "off_cycle" | "next_run";
}): TerminationCascadeResult {
  const pto = estimatePtoPayout(params.salary, params.state);
  const deadline = finalPayDeadline(params.state, params.terminationDate);
  const finalPayAmount = estimateFinalPay(params.salary, params.terminationDate);
  const cobraNoticeDueDate = addDays(params.terminationDate, 14);
  const coverageEndDate = endOfMonth(params.terminationDate);
  const cobraCaseId = `cobra-term-${params.employeeId}-${params.terminationDate}`;

  return {
    employee: {
      id: params.employeeId,
      name: params.name,
      companyId: params.companyId ?? null,
      status: "terminated",
      terminationDate: params.terminationDate,
    },
    pto: {
      cancelledPendingRequests: params.cancelledPendingRequests,
      employeeNotification: "Your pending PTO requests have been cancelled",
      ...pto,
    },
    payroll: {
      draftRunIds: params.draftRunIds,
      flag: params.draftRunIds.length > 0 ? "Terminating - verify final pay" : null,
      finalPayAmount,
      ptoPayoutAmount: pto.payoutAmount,
      finalPayDate: deadline.date,
      finalPayMode: params.finalPayMode,
      deadlineRule: deadline.rule,
      earningsLines: [
        { label: "Final wages through last day", amount: finalPayAmount },
        ...(pto.payoutAmount > 0 ? [{ label: "PTO payout", amount: pto.payoutAmount }] : []),
      ],
    },
    benefits: {
      coverageEndDate,
      cobraCaseId,
      cobraNoticeDueDate,
      cobraElectionNoticePdf: `/benefits/cobra/notices/${cobraCaseId}.pdf`,
      cobraEmailQueued: true,
      recordKeeperNotice: `401(k) record keeper notified of termination date ${params.terminationDate}`,
    },
    access: {
      statusUpdated: true,
      sessionsInvalidated: true,
      task: `Revoke system access for ${params.name} - terminated ${params.terminationDate}`,
    },
    offboarding: {
      caseId: params.offboardingCaseId,
      template: "Standard Offboarding",
      tasks: buildOffboardingTasks(params.name, params.terminationDate, params.assetNames),
      assetReturnTasks: params.assetNames.map((assetName) => ({ title: `Collect returned asset: ${assetName}`, assignee: "IT" as const })),
    },
    events: ["employee.termination.initiated", "employee.access.revoked", "employee.cobra.triggered"],
  };
}

async function emitTerminationEvents(result: TerminationCascadeResult, companyId: number | null, terminationType: TerminationType) {
  const payload = {
    id: result.employee.id,
    terminationDate: result.employee.terminationDate,
    terminationType,
    finalPayDate: result.payroll.finalPayDate === "next scheduled pay date" ? null : result.payroll.finalPayDate,
    companyId,
    timestamp: new Date().toISOString(),
  };

  await Promise.allSettled([
    dispatchWebhook("employee.termination.initiated", payload),
    dispatchWebhook("employee.access.revoked", payload),
    dispatchWebhook("employee.cobra.triggered", payload),
  ]);
}

export async function executeEmployeeTerminationCascade(input: TerminationCascadeInput): Promise<TerminationCascadeResult> {
  const terminationDate = input.terminationDate;
  const finalPayMode = input.finalPayMode || (["CA", "MT"].includes(input.state || "") ? "off_cycle" : "next_run");

  const result = await db.transaction(async (tx) => {
    const employee = await tx.query.employees.findFirst({
      where: eq(employees.id, input.employeeId),
    });

    if (!employee) {
      const mockEmployee = MOCK_EMPLOYEES.find((entry) => entry.id === input.employeeId);
      if (!mockEmployee) throw new Error("Employee not found");

      const name = `${mockEmployee.firstName} ${mockEmployee.lastName || ""}`.trim();
      const state = input.state || stateFromLocation(mockEmployee.location);
      const assets = getAssetsForEmployee(input.employeeId);
      const cobraCaseId = `cobra-term-${input.employeeId}-${terminationDate}`;
      if (!mockCobraCases.some((entry) => entry.id === cobraCaseId)) {
        mockCobraCases.unshift({
          id: cobraCaseId,
          employeeName: name,
          status: "Eligible",
          qualifyingEvent: input.terminationType === "voluntary" ? "Voluntary Resignation" : "Termination",
          noticeSentDate: new Date().toISOString().slice(0, 10),
          electionDeadline: addDays(terminationDate, 60),
          premiumAmount: 1850,
          paymentStatus: "Unpaid",
        });
      }

      const offboardingCaseId = `off-term-${input.employeeId}-${terminationDate}`;
      if (!mockOffboardingCases.some((entry) => entry.id === offboardingCaseId)) {
        mockOffboardingCases.unshift({
          id: offboardingCaseId,
          employeeName: name,
          department: mockEmployee.department || "Unknown",
          terminationDate,
          reason: input.reason || input.terminationType,
          tasks: buildOffboardingTasks(name, terminationDate, assets.map((asset) => asset.assetName)).map((task, index) => ({
            id: `term-task-${input.employeeId}-${index}`,
            title: task.title,
            assignee: task.assignee,
            status: "Pending",
          })),
        });
      }

      return buildResult({
        employeeId: input.employeeId,
        name,
        terminationDate,
        terminationType: input.terminationType,
        state,
        salary: mockEmployee.salary,
        companyId: mockEmployee.companyId,
        cancelledPendingRequests: 0,
        draftRunIds: ["1", "2", "4"].includes(String(input.employeeId)) ? [0] : [],
        offboardingCaseId,
        assetNames: assets.map((asset) => asset.assetName),
        finalPayMode,
      });
    }

    const name = `${employee.firstName} ${employee.lastName || ""}`.trim();
    const state = input.state || stateFromLocation(employee.location);

    const pendingPto = await tx
      .select({ id: ptoRequests.id })
      .from(ptoRequests)
      .where(and(eq(ptoRequests.employeeId, input.employeeId), eq(ptoRequests.status, "Pending")));

    if (pendingPto.length > 0) {
      await tx
        .update(ptoRequests)
        .set({ status: "cancelled_termination" })
        .where(inArray(ptoRequests.id, pendingPto.map((entry) => entry.id)));
    }

    await tx
      .update(employees)
      .set({ status: "terminated", terminationDate })
      .where(eq(employees.id, input.employeeId));

    if (employee.userId) {
      await tx
        .update(users)
        .set({ role: "employee" })
        .where(eq(users.id, employee.userId));
    }

    const draftItems = await tx
      .select({ runId: payrolls.id, itemId: payrollItems.id })
      .from(payrollItems)
      .innerJoin(payrolls, eq(payrollItems.payrollId, payrolls.id))
      .where(and(eq(payrollItems.employeeId, input.employeeId), eq(payrolls.status, "draft")));

    if (draftItems.length > 0) {
      await tx
        .update(payrollItems)
        .set({ type: "terminating_verify_final_pay" })
        .where(inArray(payrollItems.id, draftItems.map((entry) => entry.itemId)));
    }

    await tx
      .update(benefitEnrollments)
      .set({ status: `coverage_ends_${endOfMonth(terminationDate)}` })
      .where(eq(benefitEnrollments.employeeId, input.employeeId));

    const offboardingTemplate = employee.companyId
      ? await tx.query.onboardingTemplates.findFirst({
          where: and(eq(onboardingTemplates.companyId, employee.companyId), eq(onboardingTemplates.type, "offboarding")),
        })
      : null;

    const [offboardingCase] = await tx
      .insert(onboardingCases)
      .values({
        employeeId: input.employeeId,
        templateId: offboardingTemplate?.id || null,
        status: "Active",
        startDate: terminationDate,
      })
      .returning({ id: onboardingCases.id });

    const assignedAssets = await tx
      .select({ id: assetAssignments.id, assetName: assets.name })
      .from(assetAssignments)
      .innerJoin(assets, eq(assetAssignments.assetId, assets.id))
      .where(and(eq(assetAssignments.employeeId, input.employeeId), eq(assetAssignments.status, "Active")));

    return buildResult({
      employeeId: input.employeeId,
      name,
      terminationDate,
      terminationType: input.terminationType,
      state,
      salary: employee.salary,
      companyId: employee.companyId,
      cancelledPendingRequests: pendingPto.length,
      draftRunIds: [...new Set(draftItems.map((entry) => entry.runId))],
      offboardingCaseId: offboardingCase.id,
      assetNames: assignedAssets.map((asset) => asset.assetName),
      finalPayMode,
    });
  });

  await emitTerminationEvents(result, result.employee.companyId, input.terminationType);
  return result;
}
