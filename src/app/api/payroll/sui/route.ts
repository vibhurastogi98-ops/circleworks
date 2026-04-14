import { NextRequest, NextResponse } from "next/server";
import {
  ALL_RATE_HISTORIES,
  EXPERIENCE_RATINGS,
  MULTI_STATE_VIEW,
  SUI_ALERTS,
  calculateVoluntaryContribution,
} from "@/data/mockSUI";

/**
 * GET /api/payroll/sui
 * Returns SUI rate management data.
 * Query params:
 *   - state (optional): state abbreviation to filter by (e.g. "CA")
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const stateFilter = searchParams.get("state");

  const rateHistories = stateFilter
    ? { [stateFilter]: ALL_RATE_HISTORIES[stateFilter] || [] }
    : ALL_RATE_HISTORIES;

  const experienceRatings = stateFilter
    ? EXPERIENCE_RATINGS.filter((e) => e.stateAbbr === stateFilter)
    : EXPERIENCE_RATINGS;

  const multiStateView = stateFilter
    ? MULTI_STATE_VIEW.filter((s) => s.stateAbbr === stateFilter)
    : MULTI_STATE_VIEW;

  const alerts = stateFilter
    ? SUI_ALERTS.filter((a) => a.stateAbbr === stateFilter)
    : SUI_ALERTS;

  return NextResponse.json({
    rateHistories,
    experienceRatings,
    multiStateView,
    alerts,
  });
}

/**
 * POST /api/payroll/sui
 * Actions:
 *   - "calculate_voluntary": calculate voluntary contribution result
 *   - "update_rate": update a rate row (stub)
 *   - "import_notice": OCR import of a rate notice PDF (stub)
 */
export async function POST(req: NextRequest) {
  const body = await req.json();

  if (body.action === "calculate_voluntary") {
    const result = calculateVoluntaryContribution(
      body.stateAbbr,
      body.contributionAmount
    );
    if (!result) {
      return NextResponse.json(
        { error: "State not found or invalid data." },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: true, result });
  }

  if (body.action === "update_rate") {
    // Stub: in production this would persist to DB
    return NextResponse.json({
      success: true,
      message: `SUI rate for ${body.stateAbbr} updated to ${body.newRate}% for tax year ${body.taxYear}.`,
    });
  }

  if (body.action === "import_notice") {
    // Stub: simulates OCR parsing of a SUI rate notice PDF
    return NextResponse.json({
      success: true,
      message: "Rate notice parsed successfully.",
      parsed: {
        state: body.stateAbbr || "CA",
        taxYear: 2027,
        rate: 3.1,
        wageBase: 7000,
        annualMaximum: 217,
        source: "OCR Import",
      },
    });
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
