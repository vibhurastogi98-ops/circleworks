import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, { params }: RouteContext) {
  const { id } = await params;

  return NextResponse.json({
    candidateId: id,
    onboardingCaseId: `onb-${id}`,
    event: "ats.candidate.hired",
    actions: [
      "create_pre_hire",
      "send_welcome_email",
      "assign_onboarding_tasks",
    ],
    updatedAt: new Date().toISOString(),
  });
}
