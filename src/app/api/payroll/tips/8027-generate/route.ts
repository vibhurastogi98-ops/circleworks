import React, { type ReactElement } from "react";
import { NextResponse } from "next/server";
import { Document, Page, StyleSheet, Text, View, type DocumentProps, renderToBuffer } from "@react-pdf/renderer";

type TipInput = {
  employeeId: string;
  employeeName?: string;
  name?: string;
  role?: string;
  hoursWorked: number;
  grossReceipts?: number;
  declaredTips: number;
  allocatedTips?: number;
  totalTips?: number;
};

type AllocationMethod = "hours" | "gross" | "goodfaith";

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 10,
    color: "#0f172a",
    fontFamily: "Helvetica",
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 4,
  },
  subtitle: {
    color: "#475569",
    marginBottom: 18,
  },
  section: {
    border: "1px solid #cbd5e1",
    padding: 12,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottom: "1px solid #94a3b8",
    paddingBottom: 5,
    marginBottom: 5,
    fontWeight: 700,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1px solid #e2e8f0",
    paddingVertical: 5,
  },
  employee: { width: "32%" },
  amount: { width: "17%", textAlign: "right" },
  note: {
    marginTop: 12,
    color: "#64748b",
    fontSize: 9,
  },
});

function money(value: number) {
  return `$${Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function allocateTips(tips: TipInput[], grossReceipts: number, allocMethod: AllocationMethod) {
  const eightPercentThreshold = grossReceipts * 0.08;
  const totalDeclared = tips.reduce((sum, tip) => sum + Number(tip.declaredTips || 0), 0);
  const shortfallAmount = Math.max(0, eightPercentThreshold - totalDeclared);
  const needsAllocation = shortfallAmount > 0;
  const underDeclared = tips.filter((tip) => {
    const receipts = Number(tip.grossReceipts || 0);
    if (receipts <= 0) return needsAllocation;
    return Number(tip.declaredTips || 0) / receipts < 0.08;
  });
  const denominator =
    allocMethod === "gross"
      ? underDeclared.reduce((sum, tip) => sum + Number(tip.grossReceipts || 0), 0)
      : underDeclared.reduce((sum, tip) => sum + Number(tip.hoursWorked || 0), 0);

  const allocatedTips = tips.map((tip) => {
    const shouldAllocate = needsAllocation && underDeclared.some((row) => row.employeeId === tip.employeeId);
    const basis = allocMethod === "gross" ? Number(tip.grossReceipts || 0) : Number(tip.hoursWorked || 0);
    const allocatedAmount = shouldAllocate && denominator > 0 ? shortfallAmount * (basis / denominator) : Number(tip.allocatedTips || 0);
    return {
      ...tip,
      allocatedTips: Number(allocatedAmount.toFixed(2)),
      totalTips: Number((Number(tip.declaredTips || 0) + allocatedAmount).toFixed(2)),
    };
  });

  return {
    needsAllocation,
    eightPercentThreshold: Number(eightPercentThreshold.toFixed(2)),
    totalDeclared: Number(totalDeclared.toFixed(2)),
    shortfallAmount: Number(shortfallAmount.toFixed(2)),
    allocMethod,
    allocatedTips,
  };
}

function Form8027Pdf({
  tips,
  grossReceipts,
  chargeReceipts,
  chargedTips,
  allocation,
}: {
  tips: ReturnType<typeof allocateTips>["allocatedTips"];
  grossReceipts: number;
  chargeReceipts: number;
  chargedTips: number;
  allocation: ReturnType<typeof allocateTips>;
}) {
  return React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: "LETTER", style: styles.page },
      React.createElement(Text, { style: styles.title }, "Form 8027 Tip Allocation Data"),
      React.createElement(Text, { style: styles.subtitle }, "Employer's Annual Information Return of Tip Income and Allocated Tips"),
      React.createElement(
        View,
        { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, "Establishment Totals"),
        React.createElement(View, { style: styles.row }, React.createElement(Text, null, "Gross receipts"), React.createElement(Text, null, money(grossReceipts))),
        React.createElement(View, { style: styles.row }, React.createElement(Text, null, "Charge receipts"), React.createElement(Text, null, money(chargeReceipts))),
        React.createElement(View, { style: styles.row }, React.createElement(Text, null, "Charged tips"), React.createElement(Text, null, money(chargedTips))),
        React.createElement(View, { style: styles.row }, React.createElement(Text, null, "8% gross receipts threshold"), React.createElement(Text, null, money(allocation.eightPercentThreshold))),
        React.createElement(View, { style: styles.row }, React.createElement(Text, null, "Total declared tips"), React.createElement(Text, null, money(allocation.totalDeclared))),
        React.createElement(View, { style: styles.row }, React.createElement(Text, null, "Allocated tip shortfall"), React.createElement(Text, null, money(allocation.shortfallAmount))),
        React.createElement(View, { style: styles.row }, React.createElement(Text, null, "Allocation method"), React.createElement(Text, null, allocation.allocMethod))
      ),
      React.createElement(
        View,
        { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, "Employee Allocation Detail"),
        React.createElement(
          View,
          { style: styles.tableHeader },
          React.createElement(Text, { style: styles.employee }, "Employee"),
          React.createElement(Text, { style: styles.amount }, "Hours"),
          React.createElement(Text, { style: styles.amount }, "Receipts"),
          React.createElement(Text, { style: styles.amount }, "Declared"),
          React.createElement(Text, { style: styles.amount }, "Allocated")
        ),
        ...tips.map((tip) =>
          React.createElement(
            View,
            { key: tip.employeeId, style: styles.tableRow },
            React.createElement(Text, { style: styles.employee }, tip.employeeName ?? tip.name ?? tip.employeeId),
            React.createElement(Text, { style: styles.amount }, String(tip.hoursWorked)),
            React.createElement(Text, { style: styles.amount }, money(tip.grossReceipts ?? 0)),
            React.createElement(Text, { style: styles.amount }, money(tip.declaredTips)),
            React.createElement(Text, { style: styles.amount }, money(tip.allocatedTips ?? 0))
          )
        )
      ),
      React.createElement(Text, { style: styles.note }, "Prepared for tax preparer review. Verify legal entity, EIN, establishment address, and final annual totals before IRS filing.")
    )
  );
}

export async function POST(request: Request) {
  try {
    const {
      tips,
      grossReceipts,
      chargeReceipts = 0,
      chargedTips = 0,
      allocMethod = "hours",
      mode = "json",
    } = await request.json();

    if (!grossReceipts || !tips || tips.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const allocation = allocateTips(tips, Number(grossReceipts), allocMethod);

    if (mode === "pdf") {
      const buffer = await renderToBuffer(
        React.createElement(Form8027Pdf, {
          tips: allocation.allocatedTips,
          grossReceipts: Number(grossReceipts),
          chargeReceipts: Number(chargeReceipts),
          chargedTips: Number(chargedTips),
          allocation,
        }) as ReactElement<DocumentProps>
      );

      const headers = new Headers();
      headers.set("Content-Type", "application/pdf");
      headers.set("Content-Disposition", 'attachment; filename="form-8027-tip-allocation.pdf"');
      return new NextResponse(new Uint8Array(buffer), { status: 200, headers });
    }

    return NextResponse.json({
      success: true,
      ...allocation,
    });
  } catch (error) {
    console.error("Form 8027 API error:", error);
    return NextResponse.json({ error: "Failed to generate Form 8027 data" }, { status: 500 });
  }
}
