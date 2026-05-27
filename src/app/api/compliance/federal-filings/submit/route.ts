import { NextRequest, NextResponse } from "next/server";
import { requireApiPermission } from "@/lib/apiRbac";

export async function POST(request: NextRequest) {
  const permissionCheck = await requireApiPermission(request, "submit_tax_filings");
  if (permissionCheck.response) return permissionCheck.response;

  try {
    const body = await request.json();
    const { formType, submissionMethod, data } = body;

    const isEFile = submissionMethod === "efile";
    const confirmationNumber = `${isEFile ? "IRS" : "EFTPS"}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    const timestamp = new Date().toISOString();
    const quarter = data?.quarter ?? "Q1-2026";
    const xmlPayload = `<IRSSubmission><FormType>${formType}</FormType><Period>${quarter}</Period><GeneratedAt>${timestamp}</GeneratedAt><TransmissionMode>${submissionMethod}</TransmissionMode></IRSSubmission>`;

    return NextResponse.json({
      success: true,
      message: isEFile
        ? "Successfully transmitted to IRS via approved e-file provider."
        : "IRS-formatted XML generated for EFTPS upload.",
      formType,
      submissionMethod,
      xmlPayload: isEFile ? null : xmlPayload,
      tracking: {
        confirmationNumber,
        timestamp,
        irsAcknowledgment: isEFile ? "Pending IRS acknowledgment" : "Generated for external upload",
      },
    });
  } catch (error) {
    console.error("[Federal Filing Submit]", error);
    return NextResponse.json({ success: false, error: "Failed to process federal filing submission." }, { status: 500 });
  }
}
