import { NextResponse } from "next/server";
import { getAtsOverview } from "@/data/mockAts";

export async function GET() {
  return NextResponse.json(getAtsOverview());
}
