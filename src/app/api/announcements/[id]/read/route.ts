import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { announcements, announcementReads, users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Guest Mode: Authentication disabled
    const clerkUserId = "user_2lI7hKq2Xy4Z6mN8sO1A3ZDRQRD";

    const { id } = await params;
    const annId = parseInt(id);

    if (isNaN(annId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    // Get current user employee mapping
    const user = await db.query.users.findFirst({
      where: eq(users.clerkUserId, clerkUserId),
      with: { employees: true }
    });

    const employeeId = user?.employees?.[0]?.id;

    if (!employeeId) {
       // Just increment views if we can't find specific employee
       await db.update(announcements)
        .set({ viewsCount: sql`${announcements.viewsCount} + 1` })
        .where(eq(announcements.id, annId));
       return NextResponse.json({ success: true });
    }

    // Check if already read
    const existingRead = await db.query.announcementReads.findFirst({
      where: (table, { and, eq }) => and(
        eq(table.announcementId, annId),
        eq(table.employeeId, employeeId)
      )
    });

    if (!existingRead) {
      await db.insert(announcementReads).values({
        announcementId: annId,
        employeeId: employeeId
      });

      await db.update(announcements)
        .set({
           viewsCount: sql`${announcements.viewsCount} + 1`,
           uniqueReaders: sql`${announcements.uniqueReaders} + 1`
        })
        .where(eq(announcements.id, annId));
    } else {
      await db.update(announcements)
        .set({ viewsCount: sql`${announcements.viewsCount} + 1` })
        .where(eq(announcements.id, annId));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Announcement READ Error]", error);
    return NextResponse.json({ error: "Failed to mark as read" }, { status: 500 });
  }
}
