import React, { type ReactElement } from "react";
import { NextResponse } from "next/server";
import { type DocumentProps, renderToBuffer } from "@react-pdf/renderer";

import { getCourse } from "@/data/mockLearning";
import { LearningCertificatePdf } from "@/lib/learning-certificate-pdf";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> },
) {
  try {
    const { courseId } = await params;
    const { searchParams } = new URL(request.url);
    const learner = searchParams.get("learner") || "CircleWorks Learner";
    const course = getCourse(courseId);
    const issuedAt = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date());

    const buffer = await renderToBuffer(
      React.createElement(LearningCertificatePdf, {
        course,
        learner,
        issuedAt,
      }) as ReactElement<DocumentProps>,
    );

    const headers = new Headers();
    headers.set("Content-Type", "application/pdf");
    headers.set("Content-Disposition", `attachment; filename="${course.id}-certificate.pdf"`);
    return new NextResponse(new Uint8Array(buffer), { status: 200, headers });
  } catch (error) {
    console.error("[GET /api/learning/certificates/[courseId]]", error);
    return NextResponse.json({ error: "Failed to generate certificate." }, { status: 500 });
  }
}
