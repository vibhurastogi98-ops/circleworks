import { NextResponse } from "next/server";

const supportedProviders = new Set([
  "QuickBooks Online",
  "Xero",
  "NetSuite",
  "Generic CSV",
]);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { provider, templateName, mappings, journalEntries } = body;

    if (!supportedProviders.has(provider)) {
      return NextResponse.json(
        { success: false, error: "unsupported_accounting_provider" },
        { status: 400 }
      );
    }

    if (!templateName || !Array.isArray(mappings) || mappings.length === 0) {
      return NextResponse.json(
        { success: false, error: "templateName and mappings are required" },
        { status: 400 }
      );
    }

    const unmapped = mappings.filter((mapping) => !mapping.glAccountId);

    if (unmapped.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "unmapped_payroll_components",
          unmapped_component_ids: unmapped.map((mapping) => mapping.payrollComponentId),
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      provider,
      template: {
        name: templateName,
        mappings_saved: mappings.length,
      },
      sync: {
        status: provider === "NetSuite" || provider === "Generic CSV" ? "export_ready" : "sent",
        journal_entry_count: Array.isArray(journalEntries) ? journalEntries.length : 0,
        destination:
          provider === "QuickBooks Online"
            ? "QuickBooks Online Journal Entry API"
            : provider === "Xero"
              ? "Xero Manual Journals API"
              : provider === "NetSuite"
                ? "NetSuite CSV import file"
                : "Generic CSV export",
      },
    });
  } catch (error) {
    console.error("[POST /api/payroll/gl-mapping/sync]", error);
    return NextResponse.json(
      { success: false, error: "failed_to_sync_gl_mapping" },
      { status: 500 }
    );
  }
}
