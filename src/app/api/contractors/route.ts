import { NextResponse } from "next/server";
import {
  mockContractors,
  mockContracts,
  mockInvoices,
  mock1099s,
  getContractorStats,
} from "@/data/mockContractors";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const resource = searchParams.get("resource") || "dashboard";

  switch (resource) {
    case "dashboard":
      return NextResponse.json({
        stats: getContractorStats(),
        contractors: mockContractors,
      });

    case "contractors":
      return NextResponse.json({ contractors: mockContractors });

    case "contracts":
      return NextResponse.json({ contracts: mockContracts });

    case "invoices": {
      const status = searchParams.get("status");
      const filtered = status
        ? mockInvoices.filter((inv) => inv.status === status)
        : mockInvoices;
      return NextResponse.json({ invoices: filtered });
    }

    case "1099s": {
      const year = searchParams.get("year");
      const filtered = year
        ? mock1099s.filter((n) => n.taxYear === Number(year))
        : mock1099s;
      return NextResponse.json({ nec1099s: filtered });
    }

    default:
      return NextResponse.json({ error: "Unknown resource" }, { status: 400 });
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const { action } = body;

  switch (action) {
    case "invite":
      return NextResponse.json({
        success: true,
        message: `Onboarding invitation sent to ${body.email}`,
        contractor: {
          id: `ctr-${Date.now()}`,
          name: body.name || "New Contractor",
          email: body.email,
          status: "Onboarding",
          onboardingStep: "Invited",
        },
      });

    case "approve-invoice":
      return NextResponse.json({
        success: true,
        message: `Invoice ${body.invoiceId} approved and queued for payment`,
      });

    case "reject-invoice":
      return NextResponse.json({
        success: true,
        message: `Invoice ${body.invoiceId} rejected`,
      });

    case "request-revision":
      return NextResponse.json({
        success: true,
        message: `Revision requested for invoice ${body.invoiceId}`,
      });

    case "file-1099":
      return NextResponse.json({
        success: true,
        message: `1099-NEC ${body.necId} filed with IRS`,
      });

    case "deliver-1099":
      return NextResponse.json({
        success: true,
        message: `1099-NEC delivered to contractor via ${body.method}`,
      });

    case "activate-contractor":
      return NextResponse.json({
        success: true,
        message: `Contractor ${body.contractorId} activated`,
      });

    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
}
