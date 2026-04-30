import { NextRequest, NextResponse } from "next/server";
import { executeEmployeeTerminationCascade, type TerminationType } from "@/lib/termination-cascade";

const TERMINATION_TYPES = new Set(["voluntary", "involuntary", "layoff", "other"]);

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const employeeId = Number(id);

    if (!Number.isInteger(employeeId)) {
      return NextResponse.json({ error: "Invalid employee ID" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const today = new Date().toISOString().slice(0, 10);
    const terminationType = TERMINATION_TYPES.has(body.terminationType)
      ? body.terminationType as TerminationType
      : "involuntary";

    const result = await executeEmployeeTerminationCascade({
      employeeId,
      terminationDate: body.terminationDate || today,
      terminationType,
      state: body.state,
      reason: body.reason,
      finalPayMode: body.finalPayMode,
    });

    return NextResponse.json({
      success: true,
      message: "Employee termination cascade completed",
      result,
    });
  } catch (error: any) {
    console.error("[Employee Termination Cascade Error]", error);
    return NextResponse.json(
      { error: error.message || "Failed to execute termination cascade" },
      { status: error.message === "Employee not found" ? 404 : 500 }
    );
  }
}
