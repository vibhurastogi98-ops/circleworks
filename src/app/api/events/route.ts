import { NextRequest, NextResponse } from "next/server";
import { getSession, resolveUserContext } from "@/lib/session";
import { getCompanyEventsSince } from "@/lib/realtime-event-log";

/**
 * Sec. 02 — REST fallback: fetch realtime events missed while WS was disconnected.
 * Query: ?since={ISO-8601 timestamp}
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ctx = await resolveUserContext(session);
    const since = req.nextUrl.searchParams.get("since") ?? new Date(0).toISOString();

    if (!ctx) {
      return NextResponse.json({
        events: [] as const,
        serverTime: new Date().toISOString(),
      });
    }

    const events = getCompanyEventsSince(ctx.companyId, since);
    return NextResponse.json({
      events,
      serverTime: new Date().toISOString(),
    });
  } catch (e) {
    console.error("[GET /api/events]", e);
    return NextResponse.json({ error: "Failed to load events" }, { status: 500 });
  }
}
