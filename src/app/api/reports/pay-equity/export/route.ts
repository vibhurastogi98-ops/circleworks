import { payEquityRows, toCsv } from "@/data/reportsAnalytics";

export async function GET() {
  const headers = [
    "Segment",
    "Group",
    "Comparison",
    "Uncontrolled Gap",
    "Controlled Gap",
    "Sample Size",
    "Statistically Significant",
  ];
  const rows = payEquityRows.map((row) => [
    row.segment,
    row.group,
    row.comparison,
    row.uncontrolledGap,
    row.controlledGap,
    row.sampleSize,
    row.significant ? "Yes" : "No",
  ]);

  return new Response(toCsv(headers, rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="pay-equity-report.csv"',
    },
  });
}
