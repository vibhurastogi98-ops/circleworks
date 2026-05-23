import { NextResponse } from "next/server";

import { FEATURED_WEBINAR_TAGS, WEBINARS } from "@/data/webinars";

export async function GET() {
  return NextResponse.json({
    webinars: WEBINARS,
    featuredTags: FEATURED_WEBINAR_TAGS,
  });
}
