import { renderToBuffer } from "@react-pdf/renderer";

import { Osha300APdfDocument } from "@/lib/compliance-osha-pdf";

export async function GET() {
  const pdfBuffer = await renderToBuffer(Osha300APdfDocument());

  return new Response(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="osha-300a-summary.pdf"',
    },
  });
}
