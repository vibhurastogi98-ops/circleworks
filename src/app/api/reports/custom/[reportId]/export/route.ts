import * as XLSX from "xlsx";

import {
  buildCustomRows,
  customReportFields,
  getSavedCustomReport,
  toCsv,
} from "@/data/reportsAnalytics";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ reportId: string }> },
) {
  const { reportId } = await params;
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") ?? "csv";
  const report = getSavedCustomReport(reportId);
  const fields = report.fields
    .map((fieldId) => customReportFields.find((field) => field.id === fieldId))
    .filter(Boolean);
  const rows = buildCustomRows(report.fields, report.rowCount);
  const filename = `${report.id}-report`;

  if (format === "xlsx") {
    const worksheetRows = rows.map((row) =>
      Object.fromEntries(fields.map((field) => [field?.label ?? "", row[field?.id ?? ""] ?? ""])),
    );
    const worksheet = XLSX.utils.json_to_sheet(worksheetRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" }) as Buffer;

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}.xlsx"`,
      },
    });
  }

  const csv = toCsv(
    fields.map((field) => field?.label ?? ""),
    rows.map((row) => fields.map((field) => row[field?.id ?? ""] ?? "")),
  );

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}.csv"`,
    },
  });
}
