import { NextRequest, NextResponse } from "next/server";
import { requireApiPermission } from "@/lib/apiRbac";
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
  const permissionCheck = await requireApiPermission(req, "view_tax_filings");
  if (permissionCheck.response) return permissionCheck.response;

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
  const permissionCheck = await requireApiPermission(req, "submit_tax_filings");
  if (permissionCheck.response) return permissionCheck.response;

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
    const stateAbbr = body.stateAbbr || "CA";
    const latest = ALL_RATE_HISTORIES[stateAbbr]?.[0];
    const parsedRate = stateAbbr === "NY" ? 3.9 : stateAbbr === "TX" ? 2.4 : 3.1;
    const parsedWageBase = stateAbbr === "NY" ? 12700 : stateAbbr === "TX" ? 9000 : 7000;

    return NextResponse.json({
      success: true,
      message: "Rate notice parsed successfully.",
      parsed: {
        state: stateAbbr,
        taxYear: (latest?.taxYear ?? 2026) + 1,
        rate: parsedRate,
        wageBase: parsedWageBase,
        annualMaximum: Math.round(parsedRate / 100 * parsedWageBase),
        dateUpdated: new Date().toISOString().slice(0, 10),
        source: "OCR Import",
        sourceFileName: body.fileName || "state-sui-rate-notice.pdf",
        confidence: 0.94,
      },
    });
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
