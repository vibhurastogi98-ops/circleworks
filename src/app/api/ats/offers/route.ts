import { NextResponse } from "next/server";
import { getAtsOffers } from "@/data/mockAts";

export async function GET() {
  return NextResponse.json({ offers: getAtsOffers() });
}
