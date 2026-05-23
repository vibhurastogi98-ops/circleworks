import { db } from "@/db";
import { supplementalPayments } from "@/db/schema";
import { NextRequest, NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { z } from "zod";

const paymentTypes = ["Royalty", "Residual", "Advance", "Commission", "Signing Bonus"] as const;
const recipientTypes = ["W-2 Employee", "1099 Contractor"] as const;
const paymentStatuses = ["Pending", "Approved", "Paid", "Held", "Recouping"] as const;

const createSupplementalPaymentSchema = z.object({
  companyId: z.coerce.number().int().positive().default(1),
  employeeId: z.coerce.number().int().positive().optional(),
  contractorId: z.coerce.number().int().positive().optional(),
  royaltyScheduleId: z.coerce.number().int().positive().optional(),
  recipientName: z.string().trim().min(1),
  recipientType: z.enum(recipientTypes),
  paymentType: z.enum(paymentTypes),
  description: z.string().trim().optional(),
  amount: z.coerce.number().positive(),
  taxTreatment: z.string().trim().optional(),
  status: z.enum(paymentStatuses).default("Pending"),
  scheduledDate: z.string().trim().optional(),
  paidDate: z.string().trim().optional(),
  projectTitle: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

function centsToDollars(value: number | null | undefined) {
  return (value ?? 0) / 100;
}

function dollarsToCents(value: number) {
  return Math.round(value * 100);
}

function defaultTaxTreatment(paymentType: (typeof paymentTypes)[number], recipientType: (typeof recipientTypes)[number]) {
  if (paymentType === "Advance") return "Non-taxable (unrecouped advance)";
  if (recipientType === "1099 Contractor") return "1099-MISC Box 2";
  return "Supplemental flat rate (22%)";
}

function toApiPayment(payment: typeof supplementalPayments.$inferSelect) {
  return {
    ...payment,
    id: String(payment.id),
    amount: centsToDollars(payment.amount),
    scheduledDate: payment.scheduledDate ?? "",
    paidDate: payment.paidDate ?? undefined,
  };
}

export async function GET() {
  try {
    const payments = await db.query.supplementalPayments.findMany({
      orderBy: [desc(supplementalPayments.scheduledDate)],
    });

    return NextResponse.json({
      success: true,
      payments: payments.map(toApiPayment),
    });
  } catch (error) {
    console.error("Error fetching supplemental payments:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch supplemental payments from database" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const parsed = createSupplementalPaymentSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid supplemental payment payload", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const payment = parsed.data;
    const [newPayment] = await db
      .insert(supplementalPayments)
      .values({
        companyId: payment.companyId,
        employeeId: payment.employeeId,
        contractorId: payment.contractorId,
        recipientName: payment.recipientName,
        recipientType: payment.recipientType,
        paymentType: payment.paymentType,
        amount: dollarsToCents(payment.amount),
        status: payment.status,
        taxTreatment: payment.taxTreatment || defaultTaxTreatment(payment.paymentType, payment.recipientType),
        description: payment.description || `${payment.paymentType} payment for ${payment.recipientName}`,
        projectTitle: payment.projectTitle,
        notes: payment.notes,
        royaltyScheduleId: payment.royaltyScheduleId,
        scheduledDate: payment.scheduledDate || new Date().toISOString().slice(0, 10),
        paidDate: payment.paidDate,
      })
      .returning();

    return NextResponse.json({
      success: true,
      payment: toApiPayment(newPayment),
    });
  } catch (error) {
    console.error("Error creating supplemental payment:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create supplemental payment" },
      { status: 500 }
    );
  }
}
