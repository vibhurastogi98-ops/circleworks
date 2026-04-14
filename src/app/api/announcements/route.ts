import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { announcements, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const filter = searchParams.get('filter') || 'All'; // All, Active, Scheduled, Expired

    // For simplicity we just fetch all and let client filter if needed, or filter here
    let items = await db.query.announcements.findMany({
      orderBy: [desc(announcements.createdAt)],
      with: {
        reads: true,
      }
    });

    if (filter === 'Active') {
      items = items.filter(i => i.status === 'Published');
    } else if (filter === 'Scheduled') {
      items = items.filter(i => i.status === 'Scheduled');
    } else if (filter === 'Expired') {
      items = items.filter(i => i.status === 'Expired');
    }

    return NextResponse.json(items);
  } catch (error) {
    console.error("[Announcements GET Error]", error);
    return NextResponse.json({ error: "Failed to fetch announcements" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Usually we check if user is admin, assume yes for settings
    const body = await req.json();

    const [announcement] = await db.insert(announcements).values({
      title: body.title,
      body: body.body,
      audience: body.audience || 'All Employees',
      department: body.department || null,
      location: body.location || null,
      priority: body.priority || 'Normal',
      status: body.status || 'Draft',
      publishAt: body.publishAt ? new Date(body.publishAt) : null,
      expireAt: body.expireAt ? new Date(body.expireAt) : null,
      isPinned: body.isPinned || false,
      attachments: body.attachments || null,
    }).returning();

    return NextResponse.json(announcement, { status: 201 });
  } catch (error) {
    console.error("[Announcements POST Error]", error);
    return NextResponse.json({ error: "Failed to create announcement" }, { status: 500 });
  }
}
