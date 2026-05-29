import { NextResponse } from "next/server";

import { getStatusPayload } from "@/lib/status-monitor";

export const dynamic = "force-dynamic";

export async function GET() {
  const payload = await getStatusPayload();

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
