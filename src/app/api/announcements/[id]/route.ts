import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { announcements, announcementReads } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const annId = parseInt(id);

    if (isNaN(annId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const item = await db.query.announcements.findFirst({
      where: eq(announcements.id, annId),
      with: {
        reads: true
      }
    });

    if (!item) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error("[Announcement GET Error]", error);
    return NextResponse.json({ error: "Failed to load announcement" }, { status: 500 });
  }
}

export async function PATCH(
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

    const body = await req.json();

    const [updated] = await db
      .update(announcements)
      .set({
        ...body,
        updatedAt: new Date(),
        publishAt: body.publishAt ? new Date(body.publishAt) : undefined,
        expireAt: body.expireAt ? new Date(body.expireAt) : undefined,
      })
      .where(eq(announcements.id, annId))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[Announcement PATCH Error]", error);
    return NextResponse.json({ error: "Failed to update announcement" }, { status: 500 });
  }
}

export async function DELETE(
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

    // Related reads will be deleted via cascade
    await db.delete(announcements).where(eq(announcements.id, annId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Announcement DELETE Error]", error);
    return NextResponse.json({ error: "Failed to delete announcement" }, { status: 500 });
  }
}
