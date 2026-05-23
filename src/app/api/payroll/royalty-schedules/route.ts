import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { royaltySchedules } from "@/db/schema";

const recipientTypes = ["W-2 Employee", "1099 Contractor"] as const;
const royaltyTypes = ["Percentage", "Flat Per Unit"] as const;
const paymentFrequencies = ["Monthly", "Quarterly", "Per Event", "One-Time"] as const;
const scheduleStatuses = ["Active", "Paused", "Completed", "Draft"] as const;

const createRoyaltyScheduleSchema = z.object({
  companyId: z.coerce.number().int().positive().default(1),
  employeeId: z.coerce.number().int().positive().optional(),
  contractorId: z.coerce.number().int().positive().optional(),
  recipientName: z.string().trim().min(1),
  recipientType: z.enum(recipientTypes).default("W-2 Employee"),
  projectTitle: z.string().trim().min(1),
  royaltyType: z.enum(royaltyTypes).default("Percentage"),
  rate: z.coerce.number().positive(),
  rateUnit: z.string().trim().optional(),
  unitsSold: z.coerce.number().int().min(0).default(0),
  unitsThreshold: z.coerce.number().int().min(0).default(0),
  frequency: z.enum(paymentFrequencies).default("Quarterly"),
  advanceBalance: z.coerce.number().min(0).default(0),
  totalRecouped: z.coerce.number().min(0).default(0),
  totalEarned: z.coerce.number().min(0).default(0),
  status: z.enum(scheduleStatuses).default("Draft"),
  nextPaymentDate: z.string().trim().optional(),
});

function dollarsToCents(value: number) {
  return Math.round(value * 100);
}

function centsToDollars(value: number | null | undefined) {
  return (value ?? 0) / 100;
}

function nextPaymentDateForFrequency(frequency: (typeof paymentFrequencies)[number]) {
  const days =
    frequency === "Monthly" ? 30 :
    frequency === "Quarterly" ? 90 :
    frequency === "Per Event" ? 7 :
    0;

  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function toApiSchedule(schedule: typeof royaltySchedules.$inferSelect) {
  return {
    ...schedule,
    id: String(schedule.id),
    advanceBalance: centsToDollars(schedule.advanceBalance),
    totalRecouped: centsToDollars(schedule.totalRecouped),
    totalEarned: centsToDollars(schedule.totalEarned),
    nextPaymentDate: schedule.nextPaymentDate ?? "",
    createdDate: schedule.createdAt?.toISOString().slice(0, 10) ?? "",
  };
}

export async function GET() {
  try {
    const schedules = await db.query.royaltySchedules.findMany({
      orderBy: [desc(royaltySchedules.nextPaymentDate)],
    });

    return NextResponse.json({
      success: true,
      schedules: schedules.map(toApiSchedule),
      total: schedules.length,
    });
  } catch (error) {
    console.error("Error fetching royalty schedules:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch royalty schedules from database" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const parsed = createRoyaltyScheduleSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid royalty schedule payload", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const schedule = parsed.data;
    const [newSchedule] = await db
      .insert(royaltySchedules)
      .values({
        companyId: schedule.companyId,
        employeeId: schedule.employeeId,
        contractorId: schedule.contractorId,
        recipientName: schedule.recipientName,
        recipientType: schedule.recipientType,
        projectTitle: schedule.projectTitle,
        royaltyType: schedule.royaltyType,
        rate: schedule.rate,
        rateUnit: schedule.rateUnit || (schedule.royaltyType === "Percentage" ? "% of net sales" : "per unit"),
        unitsSold: schedule.unitsSold,
        unitsThreshold: schedule.unitsThreshold,
        frequency: schedule.frequency,
        advanceBalance: dollarsToCents(schedule.advanceBalance),
        totalRecouped: dollarsToCents(schedule.totalRecouped),
        totalEarned: dollarsToCents(schedule.totalEarned),
        status: schedule.status,
        nextPaymentDate: schedule.nextPaymentDate || nextPaymentDateForFrequency(schedule.frequency),
      })
      .returning();

    return NextResponse.json({ success: true, schedule: toApiSchedule(newSchedule) });
  } catch (error) {
    console.error("Error creating royalty schedule:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create royalty schedule" },
      { status: 500 }
    );
  }
}
