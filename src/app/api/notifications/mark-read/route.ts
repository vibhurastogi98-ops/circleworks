import { NextResponse } from "next/server";

import { markNotificationsRead } from "@/lib/notifications/server";
import { getSession, resolveUserContext } from "@/lib/session";

export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const ctx = await resolveUserContext(session);
    if (!ctx) return NextResponse.json({ error: "Employee context not found" }, { status: 404 });

    const body = await req.json().catch(() => ({}));
    const ids = Array.isArray(body.ids)
      ? body.ids
          .map((id: unknown) => Number(id))
          .filter((id: number) => Number.isInteger(id) && id > 0)
      : undefined;

    await markNotificationsRead(ctx, body.all ? undefined : ids);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Notifications mark-read PUT]", error);
    return NextResponse.json({ error: "Failed to mark notifications read" }, { status: 500 });
  }
}
