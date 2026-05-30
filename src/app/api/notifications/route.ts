import { NextResponse } from "next/server";

import { createNotificationForEmployee, getNotificationsForContext } from "@/lib/notifications/server";
import { getSession, resolveUserContext } from "@/lib/session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const ctx = await resolveUserContext(session);
    if (!ctx) return NextResponse.json({ notifications: [], unreadCount: 0 });

    const notifications = await getNotificationsForContext(ctx);
    const unreadCount = notifications.filter((notification) => !notification.isRead).length;

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    console.error("[Notifications GET]", error);
    return NextResponse.json({ error: "Failed to load notifications" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const ctx = await resolveUserContext(session);
    if (!ctx) return NextResponse.json({ error: "Employee context not found" }, { status: 404 });

    const body = await req.json();
    const notification = await createNotificationForEmployee({
      ctx,
      userId: session.userId,
      type: String(body.type || "system.new_feature"),
      title: body.title ? String(body.title) : undefined,
      message: body.message || body.description ? String(body.message || body.description) : undefined,
      link: body.link ? String(body.link) : undefined,
      actionLabel: body.actionLabel ? String(body.actionLabel) : undefined,
      metadata: body.metadata && typeof body.metadata === "object" ? body.metadata : undefined,
    });

    return NextResponse.json({ notification });
  } catch (error) {
    console.error("[Notifications POST]", error);
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 });
  }
}
