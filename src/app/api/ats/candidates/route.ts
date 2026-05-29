import { NextResponse } from "next/server";
import { getAtsCandidates } from "@/data/mockAts";

export async function GET() {
  return NextResponse.json({ candidates: getAtsCandidates() });
}
