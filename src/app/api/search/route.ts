import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { runGlobalSearch } from "@/lib/search/server";
import type { SearchResponse } from "@/lib/search/types";
import { getSession, resolveUserContext } from "@/lib/session";

export async function GET(request: NextRequest) {
  const startedAt = Date.now();
  const { searchParams } = request.nextUrl;
  const query = (searchParams.get("q") ?? "").trim();
  const requestedCompanyId = searchParams.get("companyId");
  const rawTypes = searchParams.get("types");

  if (query.length < 2) {
    const response: SearchResponse = {
      companyId: requestedCompanyId,
      query,
      tookMs: Date.now() - startedAt,
      resultCount: 0,
      source: "mock",
      results: [],
    };
    return NextResponse.json(response);
  }

  const session = await getSession(request);
  const ctx = session ? await resolveUserContext(session) : null;
  const { source, results } = await runGlobalSearch({ query, rawTypes, session, ctx });

  const response: SearchResponse = {
    companyId: ctx?.companyId ?? requestedCompanyId ?? null,
    query,
    tookMs: Date.now() - startedAt,
    resultCount: results.length,
    source,
    results,
  };

  return NextResponse.json(response);
}
