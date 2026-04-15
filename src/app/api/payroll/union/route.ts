import { NextResponse } from "next/server";
import {
  mockUnions,
  mockUnionContracts,
  mockEmployeeUnionMemberships,
  mockUnionPayrollCalcs,
  mockContributionReports,
  getUnionPayrollStats,
} from "@/data/mockUnionPayroll";

export async function GET() {
  return NextResponse.json({
    success: true,
    unions: mockUnions,
    contracts: mockUnionContracts,
    memberships: mockEmployeeUnionMemberships,
    calculations: mockUnionPayrollCalcs,
    reports: mockContributionReports,
    stats: getUnionPayrollStats(),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, abbreviation, description } = body;

    if (!name || !abbreviation) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: name, abbreviation" },
        { status: 400 }
      );
    }

    const newUnion = {
      id: `u-${Date.now()}`,
      name,
      abbreviation,
      description: description || "",
      status: "Active" as const,
      memberCount: 0,
      contractCount: 0,
      color: "#6366F1",
    };

    return NextResponse.json({ success: true, union: newUnion });
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body" },
      { status: 400 }
    );
  }
}
