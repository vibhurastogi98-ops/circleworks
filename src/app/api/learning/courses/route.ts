import { NextResponse, type NextRequest } from "next/server";
import { asc } from "drizzle-orm";

import { db } from "@/db";
import { courses } from "@/db/schema";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

/**
 * Global course catalog. Requires a session but is not tenant-scoped —
 * every workspace sees the same course library.
 */
export async function GET(request: NextRequest) {
  const session = await getSession(request);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const rows = await db
    .select({
      id: courses.id,
      title: courses.title,
      description: courses.description,
      provider: courses.provider,
      durationMinutes: courses.durationMinutes,
    })
    .from(courses)
    .orderBy(asc(courses.title));
  return NextResponse.json({ courses: rows });
}
