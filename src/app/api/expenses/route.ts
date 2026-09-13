import { NextResponse, type NextRequest } from "next/server";
import { and, desc, eq, sql, sum } from "drizzle-orm";

import { db } from "@/db";
import { expenseItems, expenseReports, employees } from "@/db/schema";
import { getSession, resolveUserContext } from "@/lib/session";

export const dynamic = "force-dynamic";

type ItemInput = {
  date?: string;
  merchant?: string;
  category?: string;
  amount?: number | string;
  receiptUrl?: string | null;
};

const PENDING_STATUSES = ["Submitted", "Pending Payroll"] as const;

async function requireContext(request: NextRequest) {
  const session = await getSession(request);
  if (!session) return { error: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  const context = await resolveUserContext(session);
  if (!context?.companyId) return { error: NextResponse.json({ error: "workspace_not_found" }, { status: 404 }) };
  return { session, context };
}

async function computeStats(companyId: number) {
  // pendingReports counts only reports awaiting approval (Submitted).
  // pendingAmount is money still owed to the employee — that includes both
  // Submitted (not yet approved) AND Pending Payroll (approved but not yet
  // reimbursed via the next payroll run).
  const [pendingRow] = await db
    .select({
      pendingReports: sql<number>`count(*) filter (where ${expenseReports.status} = 'Submitted')`,
      pendingAmount: sql<number>`coalesce(sum(${expenseReports.totalAmount}) filter (where ${expenseReports.status} in ('Submitted','Pending Payroll')), 0)`,
      totalReports: sql<number>`count(*)`,
    })
    .from(expenseReports)
    .where(eq(expenseReports.companyId, companyId));

  const categoryRows = await db
    .select({
      category: expenseItems.category,
      value: sql<number>`coalesce(sum(${expenseItems.amount}), 0)`,
    })
    .from(expenseItems)
    .innerJoin(expenseReports, eq(expenseReports.id, expenseItems.reportId))
    .where(eq(expenseReports.companyId, companyId))
    .groupBy(expenseItems.category)
    .orderBy(desc(sql`coalesce(sum(${expenseItems.amount}), 0)`))
    .limit(8);

  return {
    pendingReports: Number(pendingRow?.pendingReports ?? 0),
    pendingAmount: Number(pendingRow?.pendingAmount ?? 0),
    totalReports: Number(pendingRow?.totalReports ?? 0),
    // No violations table today; caller expects this key so we return 0.
    violationCount: 0,
    categoryData: categoryRows.map((r) => ({ name: r.category, value: Number(r.value ?? 0) })),
  };
}

export async function GET(request: NextRequest) {
  const gate = await requireContext(request);
  if ("error" in gate) return gate.error;
  const { context } = gate;

  const url = new URL(request.url);
  const statusFilter = url.searchParams.get("status");

  const where = statusFilter
    ? and(eq(expenseReports.companyId, context.companyId), eq(expenseReports.status, statusFilter))
    : eq(expenseReports.companyId, context.companyId);

  const reports = await db
    .select({
      id: expenseReports.id,
      title: expenseReports.title,
      status: expenseReports.status,
      totalAmount: expenseReports.totalAmount,
      submittedAt: expenseReports.submittedAt,
      approvedAt: expenseReports.approvedAt,
      reimbursedAt: expenseReports.reimbursedAt,
      createdAt: expenseReports.createdAt,
      employeeId: expenseReports.employeeId,
      employeeFirst: employees.firstName,
      employeeLast: employees.lastName,
    })
    .from(expenseReports)
    .leftJoin(employees, eq(employees.id, expenseReports.employeeId))
    .where(where)
    .orderBy(desc(expenseReports.createdAt))
    .limit(100);

  const stats = await computeStats(context.companyId);

  return NextResponse.json({ stats, reports });
}

export async function POST(request: NextRequest) {
  const gate = await requireContext(request);
  if ("error" in gate) return gate.error;
  const { context } = gate;

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) return NextResponse.json({ error: "title_required" }, { status: 400 });

  const submit = Boolean(body.submit);
  const rawItems = Array.isArray(body.items) ? (body.items as ItemInput[]) : [];
  const cleanItems = rawItems
    .map((raw) => {
      const date = typeof raw.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(raw.date) ? raw.date : null;
      const merchant = typeof raw.merchant === "string" ? raw.merchant.trim() : "";
      const category = typeof raw.category === "string" ? raw.category.trim() : "";
      const amountNum = Math.round(Number(raw.amount ?? 0));
      const receiptUrl = typeof raw.receiptUrl === "string" ? raw.receiptUrl : null;
      return { date, merchant, category, amount: amountNum, receiptUrl };
    })
    .filter((it) => it.date && it.merchant && it.category && Number.isFinite(it.amount) && it.amount > 0);

  if (rawItems.length > 0 && cleanItems.length === 0) {
    return NextResponse.json({ error: "no_valid_items" }, { status: 400 });
  }

  const totalAmount = cleanItems.reduce((s, it) => s + it.amount, 0);
  const now = new Date();

  const result = await db.transaction(async (tx) => {
    const [report] = await tx
      .insert(expenseReports)
      .values({
        companyId: context.companyId,
        employeeId: context.employeeId,
        title,
        totalAmount,
        status: submit ? "Submitted" : "Draft",
        submittedAt: submit ? now : null,
      })
      .returning();

    if (cleanItems.length > 0) {
      await tx.insert(expenseItems).values(
        cleanItems.map((it) => ({
          reportId: report!.id,
          date: it.date as string,
          merchant: it.merchant,
          category: it.category,
          amount: it.amount,
          receiptUrl: it.receiptUrl,
        })),
      );
    }

    return report!;
  });

  return NextResponse.json({
    ok: true,
    report: {
      id: result.id,
      title: result.title,
      status: result.status,
      totalAmount: result.totalAmount,
      submittedAt: result.submittedAt?.toISOString() ?? null,
      createdAt: result.createdAt?.toISOString() ?? null,
      itemCount: cleanItems.length,
    },
  });
}

// Unused import guard — sum is exported by drizzle-orm and pulled in for future
// aggregate expansions (per-employee totals, etc.).
void sum;
