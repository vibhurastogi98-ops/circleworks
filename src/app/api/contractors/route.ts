import { NextResponse, type NextRequest } from "next/server";
import { and, asc, count, desc, eq, gte, inArray, sum } from "drizzle-orm";

import { db } from "@/db";
import { contractorInvoices, contractors, contracts, necs1099 } from "@/db/schema";
import { getSession, resolveUserContext } from "@/lib/session";

export const dynamic = "force-dynamic";

const INVOICE_STATUSES = ["Pending", "Approved", "Revision Requested", "Rejected", "Paid"] as const;
type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

async function requireCompanyContext(request: NextRequest) {
  const session = await getSession(request);
  if (!session) return { error: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  const context = await resolveUserContext(session);
  if (!context?.companyId) return { error: NextResponse.json({ error: "workspace_not_found" }, { status: 404 }) };
  return { session, context };
}

function daysUntil(dateStr: string | null | undefined) {
  if (!dateStr) return null;
  const target = new Date(dateStr).getTime();
  return Math.floor((target - Date.now()) / 86_400_000);
}

async function loadContractorsForCompany(companyId: number) {
  const rows = await db
    .select({
      id: contractors.id,
      name: contractors.name,
      businessName: contractors.businessName,
      email: contractors.email,
      phone: contractors.phone,
      status: contractors.status,
      w9Status: contractors.w9Status,
      tinMasked: contractors.tinMasked,
      tinType: contractors.tinType,
      onboardingStep: contractors.onboardingStep,
      ytdPayments: contractors.ytdPayments,
      createdAt: contractors.createdAt,
    })
    .from(contractors)
    .where(eq(contractors.companyId, companyId))
    .orderBy(asc(contractors.name));

  if (rows.length === 0) return [];

  // Join earliest-expiring active contract for each contractor in one round trip.
  const contractRows = await db
    .select({
      contractorId: contracts.contractorId,
      contractId: contracts.id,
      endDate: contracts.endDate,
      status: contracts.status,
      title: contracts.title,
      type: contracts.type,
      rate: contracts.rate,
      rateUnit: contracts.rateUnit,
    })
    .from(contracts)
    .where(
      inArray(
        contracts.contractorId,
        rows.map((r) => r.id),
      ),
    )
    .orderBy(asc(contracts.endDate));

  const activeByContractor = new Map<number, (typeof contractRows)[number]>();
  for (const c of contractRows) {
    if (c.status !== "Active") continue;
    if (!activeByContractor.has(c.contractorId!)) activeByContractor.set(c.contractorId!, c);
  }

  return rows.map((c) => {
    const contract = activeByContractor.get(c.id) ?? null;
    return {
      ...c,
      contract: contract && {
        id: contract.contractId,
        title: contract.title,
        endDate: contract.endDate,
        daysUntilExpiry: daysUntil(contract.endDate ?? null),
        type: contract.type,
        rate: contract.rate,
        rateUnit: contract.rateUnit,
      },
    };
  });
}

async function computeStats(companyId: number) {
  const contractorIdsRows = await db
    .select({ id: contractors.id })
    .from(contractors)
    .where(eq(contractors.companyId, companyId));
  const contractorIds = contractorIdsRows.map((r) => r.id);

  const [active] = await db
    .select({ value: count() })
    .from(contractors)
    .where(and(eq(contractors.companyId, companyId), eq(contractors.status, "Active")));
  const [pendingW9] = await db
    .select({ value: count() })
    .from(contractors)
    .where(
      and(
        eq(contractors.companyId, companyId),
        inArray(contractors.w9Status, ["Pending", "Not Submitted", "Expired"]),
      ),
    );

  let paymentsThisMonth = 0;
  if (contractorIds.length > 0) {
    const firstOfMonth = new Date();
    firstOfMonth.setUTCDate(1);
    firstOfMonth.setUTCHours(0, 0, 0, 0);
    const [row] = await db
      .select({ total: sum(contractorInvoices.amount) })
      .from(contractorInvoices)
      .where(
        and(
          inArray(contractorInvoices.contractorId, contractorIds),
          inArray(contractorInvoices.status, ["Approved", "Paid"]),
          gte(contractorInvoices.submittedDate, firstOfMonth.toISOString().slice(0, 10)),
        ),
      );
    paymentsThisMonth = Number(row?.total ?? 0);
  }

  let necs1099Due = 0;
  if (contractorIds.length > 0) {
    const [row] = await db
      .select({ value: count() })
      .from(necs1099)
      .where(and(inArray(necs1099.contractorId, contractorIds), inArray(necs1099.status, ["Draft", "Ready"])));
    necs1099Due = Number(row?.value ?? 0);
  }

  return {
    active: Number(active?.value ?? 0),
    pendingW9: Number(pendingW9?.value ?? 0),
    paymentsThisMonth,
    necs1099Due,
  };
}

export async function GET(request: NextRequest) {
  const gate = await requireCompanyContext(request);
  if ("error" in gate) return gate.error;
  const { context } = gate;

  const { searchParams } = new URL(request.url);
  const resource = searchParams.get("resource") || "dashboard";

  switch (resource) {
    case "dashboard": {
      const [rows, stats] = await Promise.all([
        loadContractorsForCompany(context.companyId),
        computeStats(context.companyId),
      ]);
      return NextResponse.json({ stats, contractors: rows });
    }
    case "contractors": {
      const rows = await loadContractorsForCompany(context.companyId);
      return NextResponse.json({ contractors: rows });
    }
    case "contracts": {
      const contractorIds = (
        await db.select({ id: contractors.id }).from(contractors).where(eq(contractors.companyId, context.companyId))
      ).map((r) => r.id);
      if (contractorIds.length === 0) return NextResponse.json({ contracts: [] });
      const rows = await db
        .select()
        .from(contracts)
        .where(inArray(contracts.contractorId, contractorIds))
        .orderBy(desc(contracts.createdAt));
      return NextResponse.json({ contracts: rows });
    }
    case "invoices": {
      const status = searchParams.get("status");
      const contractorIds = (
        await db.select({ id: contractors.id }).from(contractors).where(eq(contractors.companyId, context.companyId))
      ).map((r) => r.id);
      if (contractorIds.length === 0) return NextResponse.json({ invoices: [] });
      const where = status
        ? and(inArray(contractorInvoices.contractorId, contractorIds), eq(contractorInvoices.status, status))
        : inArray(contractorInvoices.contractorId, contractorIds);
      const rows = await db
        .select({
          id: contractorInvoices.id,
          contractorId: contractorInvoices.contractorId,
          invoiceNumber: contractorInvoices.invoiceNumber,
          amount: contractorInvoices.amount,
          description: contractorInvoices.description,
          submittedDate: contractorInvoices.submittedDate,
          dueDate: contractorInvoices.dueDate,
          status: contractorInvoices.status,
          hours: contractorInvoices.hours,
          rate: contractorInvoices.rate,
          contractorName: contractors.name,
          contractorBusinessName: contractors.businessName,
        })
        .from(contractorInvoices)
        .innerJoin(contractors, eq(contractors.id, contractorInvoices.contractorId))
        .where(where)
        .orderBy(desc(contractorInvoices.submittedDate));
      return NextResponse.json({ invoices: rows });
    }
    case "1099s": {
      const yearParam = searchParams.get("year");
      const contractorIds = (
        await db.select({ id: contractors.id }).from(contractors).where(eq(contractors.companyId, context.companyId))
      ).map((r) => r.id);
      if (contractorIds.length === 0) return NextResponse.json({ nec1099s: [] });
      const where = yearParam
        ? and(inArray(necs1099.contractorId, contractorIds), eq(necs1099.taxYear, Number(yearParam)))
        : inArray(necs1099.contractorId, contractorIds);
      const rows = await db.select().from(necs1099).where(where).orderBy(desc(necs1099.taxYear));
      return NextResponse.json({ nec1099s: rows });
    }
    default:
      return NextResponse.json({ error: "unknown_resource" }, { status: 400 });
  }
}

async function assertContractorInCompany(contractorId: number, companyId: number) {
  const [row] = await db
    .select({ id: contractors.id })
    .from(contractors)
    .where(and(eq(contractors.id, contractorId), eq(contractors.companyId, companyId)))
    .limit(1);
  return !!row;
}

async function assertInvoiceInCompany(invoiceId: number, companyId: number) {
  const [row] = await db
    .select({ id: contractorInvoices.id })
    .from(contractorInvoices)
    .innerJoin(contractors, eq(contractors.id, contractorInvoices.contractorId))
    .where(and(eq(contractorInvoices.id, invoiceId), eq(contractors.companyId, companyId)))
    .limit(1);
  return !!row;
}

export async function POST(request: NextRequest) {
  const gate = await requireCompanyContext(request);
  if ("error" in gate) return gate.error;
  const { context } = gate;

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const action = String(body.action ?? "");

  switch (action) {
    case "invite": {
      const email = String(body.email ?? "").trim().toLowerCase();
      const name = String(body.name ?? "").trim() || email.split("@")[0] || "New Contractor";
      const businessName = typeof body.businessName === "string" ? body.businessName.trim() : null;
      const phone = typeof body.phone === "string" ? body.phone.trim() : null;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json({ error: "invalid_email" }, { status: 400 });
      }
      const [row] = await db
        .insert(contractors)
        .values({
          companyId: context.companyId,
          name,
          businessName,
          email,
          phone,
          status: "Onboarding",
          w9Status: "Not Submitted",
          onboardingStep: "Invited",
        })
        .returning();
      return NextResponse.json({ success: true, contractor: row });
    }

    case "create-contract": {
      const contractorId = Number(body.contractorId);
      if (!Number.isInteger(contractorId) || !(await assertContractorInCompany(contractorId, context.companyId))) {
        return NextResponse.json({ error: "invalid_contractor" }, { status: 400 });
      }
      const title = String(body.title ?? "").trim();
      const type = String(body.type ?? "Hourly");
      const rate = Number(body.rate ?? 0);
      const rateUnit = typeof body.rateUnit === "string" ? body.rateUnit : type === "Hourly" ? "/hr" : "flat";
      const startDate = typeof body.startDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.startDate)
        ? body.startDate
        : new Date().toISOString().slice(0, 10);
      const endDate = typeof body.endDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.endDate)
        ? body.endDate
        : null;
      const paymentTerms = typeof body.paymentTerms === "string" ? body.paymentTerms : "Net 30";
      const activateNow = Boolean(body.activate);
      if (!title || !Number.isInteger(rate) || rate < 0) {
        return NextResponse.json({ error: "invalid_contract_fields" }, { status: 400 });
      }
      const [row] = await db
        .insert(contracts)
        .values({
          contractorId,
          title,
          type,
          rate,
          rateUnit,
          startDate,
          endDate,
          paymentTerms,
          status: activateNow ? "Active" : "Draft",
          signedByAdmin: activateNow,
          signedAt: activateNow ? new Date() : null,
        })
        .returning();
      return NextResponse.json({ success: true, contract: row });
    }

    case "submit-invoice": {
      const contractorId = Number(body.contractorId);
      if (!Number.isInteger(contractorId) || !(await assertContractorInCompany(contractorId, context.companyId))) {
        return NextResponse.json({ error: "invalid_contractor" }, { status: 400 });
      }
      const amount = Math.round(Number(body.amount ?? 0));
      if (!Number.isFinite(amount) || amount <= 0) {
        return NextResponse.json({ error: "invalid_amount" }, { status: 400 });
      }
      const invoiceNumber = String(body.invoiceNumber ?? "").trim() || `INV-${Date.now()}`;
      const description = typeof body.description === "string" ? body.description : null;
      const submittedDate = typeof body.submittedDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.submittedDate)
        ? body.submittedDate
        : new Date().toISOString().slice(0, 10);
      const dueDate = typeof body.dueDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.dueDate)
        ? body.dueDate
        : new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10);
      const hours = body.hours !== undefined ? Number(body.hours) : null;
      const rate = body.rate !== undefined ? Number(body.rate) : null;

      const [row] = await db
        .insert(contractorInvoices)
        .values({
          contractorId,
          invoiceNumber,
          amount,
          description,
          submittedDate,
          dueDate,
          status: "Pending",
          hours: hours ?? undefined,
          rate: rate ?? undefined,
        })
        .returning();
      return NextResponse.json({ success: true, invoice: row });
    }

    case "approve-invoice":
    case "reject-invoice":
    case "request-revision": {
      const invoiceId = Number(body.invoiceId);
      if (!Number.isInteger(invoiceId) || !(await assertInvoiceInCompany(invoiceId, context.companyId))) {
        return NextResponse.json({ error: "invalid_invoice" }, { status: 400 });
      }
      const target: InvoiceStatus =
        action === "approve-invoice" ? "Approved" : action === "reject-invoice" ? "Rejected" : "Revision Requested";
      const [before] = await db
        .select({ status: contractorInvoices.status, amount: contractorInvoices.amount, contractorId: contractorInvoices.contractorId })
        .from(contractorInvoices)
        .where(eq(contractorInvoices.id, invoiceId))
        .limit(1);
      if (!before) return NextResponse.json({ error: "invoice_missing" }, { status: 404 });

      await db
        .update(contractorInvoices)
        .set({ status: target, updatedAt: new Date() })
        .where(eq(contractorInvoices.id, invoiceId));

      // On approve, bump contractor.ytdPayments so the stats card + row totals
      // reflect real approvals immediately.
      if (target === "Approved" && before.status !== "Approved" && before.status !== "Paid" && before.contractorId) {
        const [c] = await db
          .select({ ytd: contractors.ytdPayments })
          .from(contractors)
          .where(eq(contractors.id, before.contractorId))
          .limit(1);
        await db
          .update(contractors)
          .set({ ytdPayments: Number(c?.ytd ?? 0) + before.amount, updatedAt: new Date() })
          .where(eq(contractors.id, before.contractorId));
      }
      return NextResponse.json({ success: true, invoiceId, status: target });
    }

    case "activate-contractor": {
      const contractorId = Number(body.contractorId);
      if (!Number.isInteger(contractorId) || !(await assertContractorInCompany(contractorId, context.companyId))) {
        return NextResponse.json({ error: "invalid_contractor" }, { status: 400 });
      }
      const [existing] = await db
        .select({ w9Status: contractors.w9Status })
        .from(contractors)
        .where(eq(contractors.id, contractorId))
        .limit(1);
      if (existing?.w9Status !== "Collected") {
        return NextResponse.json({ error: "w9_required_before_activation" }, { status: 400 });
      }
      await db
        .update(contractors)
        .set({ status: "Active", onboardingStep: "Activated", updatedAt: new Date() })
        .where(eq(contractors.id, contractorId));
      return NextResponse.json({ success: true, contractorId });
    }

    case "submit-w9": {
      const contractorId = Number(body.contractorId);
      if (!Number.isInteger(contractorId) || !(await assertContractorInCompany(contractorId, context.companyId))) {
        return NextResponse.json({ error: "invalid_contractor" }, { status: 400 });
      }
      const legalName = typeof body.legalName === "string" ? body.legalName.trim() : "";
      const businessName = typeof body.businessName === "string" ? body.businessName.trim() : null;
      const tinRaw = typeof body.tin === "string" ? body.tin.replace(/\D/g, "") : "";
      const tinTypeRaw = String(body.tinType ?? "SSN").toUpperCase();
      const tinType = tinTypeRaw === "EIN" ? "EIN" : "SSN";
      const signed = Boolean(body.signature);
      if (!legalName) return NextResponse.json({ error: "legal_name_required" }, { status: 400 });
      if (tinRaw.length !== 9) return NextResponse.json({ error: "tin_must_be_9_digits" }, { status: 400 });
      if (!signed) return NextResponse.json({ error: "signature_required" }, { status: 400 });

      const tinMasked = tinType === "SSN" ? `***-**-${tinRaw.slice(-4)}` : `**-***${tinRaw.slice(-4)}`;

      const updates: Partial<typeof contractors.$inferInsert> = {
        name: legalName,
        w9Status: "Collected",
        tinMasked,
        tinType,
        onboardingStep: "W-9 Submitted",
        updatedAt: new Date(),
      };
      if (businessName) updates.businessName = businessName;

      const [row] = await db
        .update(contractors)
        .set(updates)
        .where(eq(contractors.id, contractorId))
        .returning();
      return NextResponse.json({ success: true, contractor: row });
    }

    case "generate-1099s": {
      const taxYear = Number.isInteger(Number(body.taxYear)) ? Number(body.taxYear) : new Date().getUTCFullYear();
      // OBBBA (2026+): 1099-NEC threshold raised from $600 to $2,000 for payments made in tax years 2026+.
      // Prior years stay at $600 to match the rules that were in effect when those payments happened.
      const THRESHOLD = taxYear >= 2026 ? 2000 : 600;

      // Every contractor in this company whose YTD payments meet the reporting threshold.
      const candidates = await db
        .select({
          id: contractors.id,
          name: contractors.name,
          ytdPayments: contractors.ytdPayments,
          tinMasked: contractors.tinMasked,
          w9Status: contractors.w9Status,
        })
        .from(contractors)
        .where(and(eq(contractors.companyId, context.companyId), gte(contractors.ytdPayments, THRESHOLD)));

      // Skip contractors that already have a Draft/Ready row for this year — we
      // don't overwrite in-flight forms. But re-generate on top of Filed/Delivered
      // is a manual escalation via a separate route (out of scope).
      const existing = candidates.length
        ? await db
            .select({ contractorId: necs1099.contractorId, status: necs1099.status })
            .from(necs1099)
            .where(
              and(
                inArray(necs1099.contractorId, candidates.map((c) => c.id)),
                eq(necs1099.taxYear, taxYear),
              ),
            )
        : [];
      const existingByContractor = new Map(existing.map((r) => [r.contractorId, r.status]));

      const toInsert = candidates.filter((c) => !existingByContractor.has(c.id));
      const created: { contractorId: number; box1Amount: number }[] = [];
      if (toInsert.length > 0) {
        const rows = await db
          .insert(necs1099)
          .values(
            toInsert.map((c) => ({
              contractorId: c.id,
              taxYear,
              box1Amount: c.ytdPayments ?? 0,
              status: c.w9Status === "Collected" ? "Ready" : "Draft",
              deliveryMethod: "E-Delivery",
              tin: c.tinMasked,
            })),
          )
          .returning();
        for (const r of rows) created.push({ contractorId: r.contractorId!, box1Amount: r.box1Amount });
      }

      return NextResponse.json({
        success: true,
        taxYear,
        candidateCount: candidates.length,
        createdCount: created.length,
        skippedExisting: candidates.length - toInsert.length,
        created,
      });
    }

    case "mark-1099-filed":
    case "deliver-1099": {
      const necId = Number(body.necId);
      if (!Number.isInteger(necId)) return NextResponse.json({ error: "invalid_nec_id" }, { status: 400 });
      // Scope check: make sure this nec row belongs to a contractor in the company.
      const [row] = await db
        .select({ id: necs1099.id })
        .from(necs1099)
        .innerJoin(contractors, eq(contractors.id, necs1099.contractorId))
        .where(and(eq(necs1099.id, necId), eq(contractors.companyId, context.companyId)))
        .limit(1);
      if (!row) return NextResponse.json({ error: "not_found_or_not_yours" }, { status: 404 });

      const targetStatus = action === "mark-1099-filed" ? "Filed" : "Delivered";
      const updates: Partial<typeof necs1099.$inferInsert> = {
        status: targetStatus,
        updatedAt: new Date(),
      };
      if (action === "deliver-1099" && typeof body.method === "string") {
        updates.deliveryMethod = body.method;
      }
      await db.update(necs1099).set(updates).where(eq(necs1099.id, necId));
      return NextResponse.json({ success: true, necId, status: targetStatus });
    }

    default:
      return NextResponse.json({ error: "unknown_action" }, { status: 400 });
  }
}
