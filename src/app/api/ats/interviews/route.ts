import { NextResponse } from "next/server";
import { getAtsInterviews } from "@/data/mockAts";

export async function GET() {
  return NextResponse.json({ interviews: getAtsInterviews() });
}
