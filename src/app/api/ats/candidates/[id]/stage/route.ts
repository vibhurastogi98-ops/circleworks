import { NextResponse } from "next/server";
import { STAGES, type CandidateStage } from "@/data/mockAts";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function updateStage(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const newStage = body?.newStage as CandidateStage | undefined;

  if (!newStage || !STAGES.some((stage) => stage.id === newStage)) {
    return NextResponse.json(
      { error: "invalid_stage", required: "newStage" },
      { status: 400 },
    );
  }

  return NextResponse.json({
    candidateId: id,
    newStage,
    event: `ats.candidate.moved`,
    updatedAt: new Date().toISOString(),
  });
}

export async function POST(request: Request, context: RouteContext) {
  return updateStage(request, context);
}

export async function PUT(request: Request, context: RouteContext) {
  return updateStage(request, context);
}
