import React, { type ReactElement } from "react";
import { NextResponse } from "next/server";
import { type DocumentProps, renderToBuffer } from "@react-pdf/renderer";
import {
  buildCertifiedPayrollWh347,
  CertifiedPayrollWh347Pdf,
  type GenerateWh347Request,
} from "@/lib/reports/certified-payroll-wh347";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as GenerateWh347Request;
    const generated = buildCertifiedPayrollWh347(payload);

    if ("error" in generated) {
      return NextResponse.json({ error: generated.error }, { status: 400 });
    }

    if (payload.mode === "pdf") {
      const buffer = await renderToBuffer(
        React.createElement(CertifiedPayrollWh347Pdf, { data: generated }) as ReactElement<DocumentProps>,
      );

      const headers = new Headers();
      headers.set("Content-Type", "application/pdf");
      headers.set("Content-Disposition", `attachment; filename="${generated.wh347.fileName}"`);
      headers.set("X-WH347-Status", generated.wh347.status);
      return new NextResponse(new Uint8Array(buffer), { status: 200, headers });
    }

    return NextResponse.json(generated);
  } catch (error) {
    console.error("[POST /api/reports/certified-payroll/generate-wh347]", error);
    return NextResponse.json({ error: "Failed to generate WH-347 data" }, { status: 500 });
  }
}
