import { NextResponse, type NextRequest } from "next/server";
import { and, desc, eq, isNull, or, sql } from "drizzle-orm";

import { db } from "@/db";
import { companies, employees, payrolls, payrollItems, paySchedules } from "@/db/schema";
import { getSession, resolveUserContext } from "@/lib/session";
import { normalizeAccountType } from "@/lib/account-types";

export const dynamic = "force-dynamic";

type PayScheduleUi = "Weekly" | "Biweekly" | "Semi-monthly" | "Monthly";

const UI_TO_DB: Record<PayScheduleUi, string> = {
  Weekly: "weekly",
  Biweekly: "biweekly",
  "Semi-monthly": "semi-monthly",
  Monthly: "monthly",
};
const DB_TO_UI: Record<string, PayScheduleUi> = {
  weekly: "Weekly",
  biweekly: "Biweekly",
  "semi-monthly": "Semi-monthly",
  monthly: "Monthly",
};
const PERIODS_PER_YEAR: Record<PayScheduleUi, number> = {
  Weekly: 52,
  Biweekly: 26,
  "Semi-monthly": 24,
  Monthly: 12,
};
const PERIOD_DAYS: Record<PayScheduleUi, number> = {
  Weekly: 7,
  Biweekly: 14,
  "Semi-monthly": 15,
  Monthly: 30,
};

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function computeAmounts(annualSalary: number, schedule: PayScheduleUi) {
  const gross = Math.round(annualSalary / PERIODS_PER_YEAR[schedule]);
  const federalTax = Math.round(gross * 0.15);
  const ficaSs = Math.round(gross * 0.062);
  const ficaMed = Math.round(gross * 0.0145);
  const stateTax = Math.round(gross * 0.05);
  const totalTax = federalTax + ficaSs + ficaMed + stateTax;
  const net = gross - totalTax;
  return { gross, federalTax, ficaSs, ficaMed, stateTax, totalTax, net };
}

/**
 * Deterministic status lifecycle for demo/no-live-ACH mode:
 *   pending  → processing (after 3s)  → paid (after 8s total).
 * Called on every GET; persists transitions to DB so a row's status matches
 * reality on the next refresh.
 */
async function promoteRunStatuses(companyId: number, employeeId: number) {
  const nowMs = Date.now();
  const rows = await db
    .select({
      id: payrolls.id,
      status: payrolls.status,
      createdAt: payrolls.createdAt,
    })
    .from(payrolls)
    .innerJoin(payrollItems, eq(payrollItems.payrollId, payrolls.id))
    .where(
      and(
        eq(payrolls.companyId, companyId),
        eq(payrollItems.employeeId, employeeId),
        or(eq(payrolls.status, "pending"), eq(payrolls.status, "processing")),
      ),
    );

  for (const row of rows) {
    const ageMs = nowMs - (row.createdAt?.getTime() ?? nowMs);
    let target: string | null = null;
    if (ageMs > 8_000) target = "paid";
    else if (ageMs > 3_000 && row.status === "pending") target = "processing";
    if (target && target !== row.status) {
      await db.update(payrolls).set({ status: target }).where(eq(payrolls.id, row.id));
    }
  }
}

async function requireCreatorContext(request: NextRequest) {
  const session = await getSession(request);
  if (!session) return { error: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  const context = await resolveUserContext(session);
  if (!context?.companyId) return { error: NextResponse.json({ error: "workspace_not_found" }, { status: 404 }) };
  const [company] = await db.select({ accountType: companies.accountType }).from(companies).where(eq(companies.id, context.companyId)).limit(1);
  if (!company) return { error: NextResponse.json({ error: "workspace_not_found" }, { status: 404 }) };
  const normalized = normalizeAccountType(company.accountType);
  if (normalized !== "creator") {
    return { error: NextResponse.json({ error: "pay_myself_is_creator_only" }, { status: 403 }) };
  }
  return { session, context };
}

export async function GET(request: NextRequest) {
  const gate = await requireCreatorContext(request);
  if ("error" in gate) return gate.error;
  const { context } = gate;

  await promoteRunStatuses(context.companyId, context.employeeId);

  const [emp] = await db
    .select({ salary: employees.salary })
    .from(employees)
    .where(eq(employees.id, context.employeeId))
    .limit(1);

  const [sched] = await db
    .select({ frequency: paySchedules.frequency })
    .from(paySchedules)
    .where(eq(paySchedules.companyId, context.companyId))
    .orderBy(sql`${paySchedules.isDefault} desc`, desc(paySchedules.createdAt))
    .limit(1);

  const scheduleUi = sched?.frequency ? (DB_TO_UI[sched.frequency] ?? "Semi-monthly") : "Semi-monthly";

  const runs = await db
    .select({
      id: payrolls.id,
      status: payrolls.status,
      checkDate: payrolls.checkDate,
      totalGross: payrolls.totalGross,
      totalTaxes: payrolls.totalTaxes,
      totalNet: payrolls.totalNet,
      createdAt: payrolls.createdAt,
      gross: payrollItems.gross,
      net: payrollItems.net,
    })
    .from(payrolls)
    .innerJoin(payrollItems, eq(payrollItems.payrollId, payrolls.id))
    .where(and(eq(payrolls.companyId, context.companyId), eq(payrollItems.employeeId, context.employeeId)))
    .orderBy(desc(payrolls.createdAt))
    .limit(20);

  return NextResponse.json({
    currentAnnualSalary: emp?.salary ?? 0,
    schedule: scheduleUi,
    history: runs.map((r) => ({
      id: r.id,
      status: r.status,
      checkDate: r.checkDate,
      gross: r.gross,
      net: r.net,
      taxes: r.gross - r.net,
      createdAt: r.createdAt?.toISOString() ?? null,
    })),
  });
}

export async function POST(request: NextRequest) {
  const gate = await requireCreatorContext(request);
  if ("error" in gate) return gate.error;
  const { context } = gate;

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const annualSalary = Math.max(0, Math.round(Number(body.annualSalary ?? 0)));
  const scheduleRaw = String(body.schedule ?? "");
  if (!(scheduleRaw in PERIODS_PER_YEAR)) {
    return NextResponse.json({ error: "invalid_schedule" }, { status: 400 });
  }
  if (!Number.isFinite(annualSalary) || annualSalary <= 0) {
    return NextResponse.json({ error: "invalid_annual_salary" }, { status: 400 });
  }
  const schedule = scheduleRaw as PayScheduleUi;
  const amounts = computeAmounts(annualSalary, schedule);

  const now = new Date();
  const start = new Date(now.getTime() - PERIOD_DAYS[schedule] * 86_400_000);

  const result = await db.transaction(async (tx) => {
    // Persist salary + schedule so refresh keeps them.
    await tx.update(employees).set({ salary: annualSalary }).where(eq(employees.id, context.employeeId));

    const [existingSched] = await tx
      .select({ id: paySchedules.id })
      .from(paySchedules)
      .where(and(eq(paySchedules.companyId, context.companyId), isNull(paySchedules.frequency)))
      .limit(1);
    // Prefer updating the default schedule if present, else insert a new default.
    const [defaultSched] = await tx
      .select({ id: paySchedules.id })
      .from(paySchedules)
      .where(and(eq(paySchedules.companyId, context.companyId), eq(paySchedules.isDefault, true)))
      .limit(1);
    void existingSched;
    if (defaultSched) {
      await tx
        .update(paySchedules)
        .set({ frequency: UI_TO_DB[schedule], updatedAt: new Date() })
        .where(eq(paySchedules.id, defaultSched.id));
    } else {
      await tx
        .insert(paySchedules)
        .values({
          companyId: context.companyId,
          name: "Owner payroll",
          frequency: UI_TO_DB[schedule],
          isDefault: true,
        });
    }

    // Insert payroll run + item.
    const [run] = await tx
      .insert(payrolls)
      .values({
        companyId: context.companyId,
        payPeriodStart: isoDate(start),
        payPeriodEnd: isoDate(now),
        checkDate: isoDate(now),
        totalGross: amounts.gross,
        totalTaxes: amounts.totalTax,
        totalNet: amounts.net,
        status: "pending",
        type: "regular",
      })
      .returning();

    await tx.insert(payrollItems).values({
      payrollId: run!.id,
      employeeId: context.employeeId,
      gross: amounts.gross,
      federalTax: amounts.federalTax,
      stateTax: amounts.stateTax,
      ficaSs: amounts.ficaSs,
      ficaMed: amounts.ficaMed,
      net: amounts.net,
      type: "regular",
    });

    return run!;
  });

  return NextResponse.json({
    ok: true,
    run: {
      id: result.id,
      status: result.status,
      checkDate: result.checkDate,
      gross: amounts.gross,
      net: amounts.net,
      taxes: amounts.totalTax,
      createdAt: result.createdAt?.toISOString() ?? null,
    },
  });
}
