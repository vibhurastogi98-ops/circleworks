import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { searchAnalytics } from "@/db/schema";
import { getSession, resolveUserContext } from "@/lib/session";

interface SearchAnalyticsBody {
  query?: string;
  resultCount?: number;
  selectedResultType?: string | null;
  selectedResultId?: string | null;
  selectedResultTitle?: string | null;
  timeToSelectionMs?: number | null;
  source?: string;
}

export async function POST(request: NextRequest) {
  const session = await getSession(request);
  const ctx = session ? await resolveUserContext(session) : null;

  let body: SearchAnalyticsBody;
  try {
    body = (await request.json()) as SearchAnalyticsBody;
  } catch {
    return NextResponse.json({ error: "Invalid analytics payload" }, { status: 400 });
  }

  const query = (body.query ?? "").trim();
  if (!query && !body.selectedResultId) {
    return NextResponse.json({ ok: true, stored: false });
  }

  try {
    await db.insert(searchAnalytics).values({
      companyId: ctx?.companyId ?? null,
      userId: session?.userId ?? null,
      query,
      resultCount: Number.isFinite(body.resultCount) ? Math.max(0, Number(body.resultCount)) : 0,
      selectedResultType: body.selectedResultType ?? null,
      selectedResultId: body.selectedResultId ?? null,
      selectedResultTitle: body.selectedResultTitle ?? null,
      timeToSelectionMs: Number.isFinite(body.timeToSelectionMs)
        ? Math.max(0, Number(body.timeToSelectionMs))
        : null,
      source: body.source ?? "command_palette",
    });

    return NextResponse.json({ ok: true, stored: true });
  } catch (error) {
    console.warn("Search analytics write failed", error);
    return NextResponse.json({ ok: true, stored: false });
  }
}
