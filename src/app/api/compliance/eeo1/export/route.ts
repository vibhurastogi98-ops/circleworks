import { eeo1RaceEthnicities, eeo1Rows, getEEO1RowTotal } from "@/data/complianceModule";

export async function GET() {
  const headers = [
    "Job Category",
    ...eeo1RaceEthnicities.flatMap((race) => [`${race} Male`, `${race} Female`]),
    "Total",
  ];

  const rows = eeo1Rows.map((row) => [
    row.jobCategory,
    ...eeo1RaceEthnicities.flatMap((race) => [row.counts[race].male, row.counts[race].female]),
    getEEO1RowTotal(row),
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="eeo1-component-1.csv"',
    },
  });
}
