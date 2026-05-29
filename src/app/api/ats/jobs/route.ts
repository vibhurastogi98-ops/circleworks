import { NextResponse } from "next/server";
import { getAtsJobs } from "@/data/mockAts";

export async function GET() {
  return NextResponse.json({ jobs: getAtsJobs() });
}
