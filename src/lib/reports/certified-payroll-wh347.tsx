import React from "react";
import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
export type Wh347Mode = "json" | "pdf";

export interface CertifiedPayrollWorker {
  id: number;
  name: string;
  ssnLast4: string;
  classification: string;
  hoursByDay: Record<DayKey, number>;
  hourlyRate: number;
  withholding: number;
  deductions: number;
}

export interface GenerateWh347Request {
  mode?: Wh347Mode;
  contractName?: string;
  contractNumber?: string;
  contractingAgency?: string;
  projectLocation?: string;
  weekEnding?: string;
  payrollNo?: number;
  contractorName?: string;
  contractorAddress?: string;
  contractorType?: "prime" | "subcontractor";
  wageDeterminationNo?: string;
  isFinalPayroll?: boolean;
  adminSigner?: string;
  adminTitle?: string;
  workers?: CertifiedPayrollWorker[];
}

export interface ValidatedWh347Worker extends CertifiedPayrollWorker {
  maskedSsn: string;
  prevailingWageRate: number;
  isUnderpaid: boolean;
  totalHours: number;
  grossWages: number;
  totalDeductions: number;
  netWages: number;
}

export interface Wh347Generation {
  success: true;
  reportType: "Certified Payroll (Davis-Bacon)";
  hasViolations: boolean;
  validatedWorkers: ValidatedWh347Worker[];
  wageDeterminations: Record<string, number>;
  wh347: {
    form: "DOL WH-347";
    revision: "Rev. January 2025";
    ombControlNo: "1235-0008";
    ombExpires: "01/31/2028";
    status: "blocked_by_prevailing_wage_violation" | "ready_to_submit";
    fileName: string;
    mimeType: "application/pdf";
    generatedAt: string;
    fields: {
      contractorOrSubcontractor: string;
      contractorAddress: string;
      contractorType: "prime" | "subcontractor";
      isFinalPayroll: boolean;
      contractName: string;
      contractNumber: string;
      contractingAgency: string;
      projectLocation: string;
      wageDeterminationNo: string;
      weekEnding: string;
      payrollNo: number;
      employees: Array<{
        name: string;
        ssn: string;
        workClassification: string;
        hoursByDay: Record<DayKey, number>;
        totalHours: number;
        rateOfPay: number;
        grossWages: number;
        withholding: number;
        deductions: number;
        netWages: number;
      }>;
      statementOfCompliance: {
        signerName: string;
        signerTitle: string;
        eSignatureStatus: "blocked" | "e-signed";
        signedAt: string | null;
      };
    };
  };
}

const dayColumns: { key: DayKey; label: string }[] = [
  { key: "mon", label: "Mon" },
  { key: "tue", label: "Tue" },
  { key: "wed", label: "Wed" },
  { key: "thu", label: "Thu" },
  { key: "fri", label: "Fri" },
  { key: "sat", label: "Sat" },
  { key: "sun", label: "Sun" },
];

export const dolWageDeterminations: Record<string, number> = {
  Carpenter: 39.2,
  Electrician: 48.5,
  Laborer: 25,
  Plumber: 42.75,
  "Heavy Equipment Operator": 44.6,
  Painter: 36.35,
};

const styles = StyleSheet.create({
  page: {
    padding: 18,
    fontSize: 7,
    fontFamily: "Helvetica",
    color: "#0f172a",
  },
  compliancePage: {
    padding: 42,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#0f172a",
  },
  topMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  title: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 8,
    textAlign: "center",
    marginBottom: 8,
  },
  metaText: {
    fontSize: 6,
    textAlign: "right",
    lineHeight: 1.25,
  },
  setupGrid: {
    borderWidth: 1,
    borderColor: "#111827",
    marginBottom: 8,
  },
  setupRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#111827",
  },
  setupCell: {
    flex: 1,
    minHeight: 32,
    padding: 5,
    borderRightWidth: 1,
    borderRightColor: "#111827",
  },
  setupCellLast: {
    flex: 1,
    minHeight: 32,
    padding: 5,
  },
  label: {
    fontSize: 5,
    textTransform: "uppercase",
    color: "#475569",
    marginBottom: 3,
    fontFamily: "Helvetica-Bold",
  },
  value: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
  },
  table: {
    borderWidth: 1,
    borderColor: "#111827",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#e2e8f0",
    borderBottomWidth: 1,
    borderBottomColor: "#111827",
    minHeight: 22,
  },
  tableRow: {
    flexDirection: "row",
    minHeight: 38,
    borderBottomWidth: 1,
    borderBottomColor: "#111827",
  },
  th: {
    padding: 3,
    fontSize: 5,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    borderRightWidth: 1,
    borderRightColor: "#111827",
  },
  td: {
    padding: 3,
    fontSize: 6,
    borderRightWidth: 1,
    borderRightColor: "#111827",
  },
  workerNo: { width: "4%" },
  workerName: { width: "11%" },
  workerId: { width: "7%" },
  classification: { width: "12%" },
  days: { width: "21%" },
  totalHours: { width: "5%" },
  rate: { width: "7%" },
  gross: { width: "8%" },
  deductions: { width: "10%" },
  net: { width: "7%" },
  status: { width: "8%" },
  dayMiniRow: {
    flexDirection: "row",
  },
  dayMiniCell: {
    flex: 1,
    textAlign: "center",
    fontSize: 5,
    paddingVertical: 1,
  },
  complianceTitle: {
    fontSize: 15,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    marginBottom: 18,
    textTransform: "uppercase",
  },
  paragraph: {
    lineHeight: 1.45,
    marginBottom: 10,
  },
  signatureGrid: {
    flexDirection: "row",
    gap: 28,
    marginTop: 42,
  },
  signatureBox: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: "#111827",
    paddingTop: 6,
  },
  foot: {
    position: "absolute",
    bottom: 16,
    left: 18,
    right: 18,
    fontSize: 6,
    color: "#64748b",
    textAlign: "center",
  },
});

function money(value: number) {
  return `$${Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function sanitizeFilePart(value: string) {
  return value.replace(/[^a-zA-Z0-9-_]/g, "_");
}

function totalHours(hoursByDay: Record<DayKey, number>) {
  return dayColumns.reduce((sum, day) => sum + Number(hoursByDay?.[day.key] || 0), 0);
}

function normalizeNumber(value: unknown) {
  const next = Number(value || 0);
  return Number.isFinite(next) && next >= 0 ? next : 0;
}

function maskSsn(last4: string) {
  const digits = String(last4 || "").replace(/\D/g, "").slice(-4).padStart(4, "0");
  return `xxx-xx-${digits}`;
}

function weekDates(weekEnding: string) {
  const end = new Date(`${weekEnding}T00:00:00`);
  const start = new Date(end);
  start.setDate(end.getDate() - 6);

  return dayColumns.map((day, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return {
      ...day,
      date: date.toLocaleDateString("en-US", { month: "numeric", day: "numeric" }),
    };
  });
}

export function buildCertifiedPayrollWh347(payload: GenerateWh347Request): Wh347Generation | { error: string } {
  const contractNumber = payload.contractNumber?.trim();
  const payrollNo = Number(payload.payrollNo);

  if (!payload.contractName || !contractNumber || !payload.contractingAgency || !payload.projectLocation || !payload.weekEnding || !payrollNo) {
    return { error: "Contract setup fields and payrollNo are required to generate WH-347" };
  }

  if (!payload.workers?.length) {
    return { error: "At least one worker is required" };
  }

  const generatedAt = new Date().toISOString();
  let hasViolations = false;

  const validatedWorkers = payload.workers.map((worker, index) => {
    const classification = worker.classification || "Laborer";
    const prevailingWageRate = dolWageDeterminations[classification] ?? 0;
    const hourlyRate = normalizeNumber(worker.hourlyRate);
    const withholding = normalizeNumber(worker.withholding);
    const deductions = normalizeNumber(worker.deductions);
    const hoursByDay = dayColumns.reduce<Record<DayKey, number>>((hours, day) => {
      hours[day.key] = normalizeNumber(worker.hoursByDay?.[day.key]);
      return hours;
    }, {} as Record<DayKey, number>);
    const hours = totalHours(hoursByDay);
    const grossWages = Number((hours * hourlyRate).toFixed(2));
    const totalDeductions = Number((withholding + deductions).toFixed(2));
    const netWages = Number((grossWages - totalDeductions).toFixed(2));
    const isUnderpaid = hourlyRate < prevailingWageRate;

    if (isUnderpaid) hasViolations = true;

    return {
      id: worker.id || index + 1,
      name: worker.name || `Worker ${index + 1}`,
      ssnLast4: String(worker.ssnLast4 || "").replace(/\D/g, "").slice(-4),
      classification,
      hoursByDay,
      hourlyRate,
      withholding,
      deductions,
      maskedSsn: maskSsn(worker.ssnLast4),
      prevailingWageRate,
      isUnderpaid,
      totalHours: hours,
      grossWages,
      totalDeductions,
      netWages,
    };
  });

  const contractorName = payload.contractorName?.trim() || "CircleWorks Inc.";
  const contractorAddress = payload.contractorAddress?.trim() || "100 Market St, San Francisco, CA 94105";
  const wageDeterminationNo = payload.wageDeterminationNo?.trim() || "TBD";

  return {
    success: true,
    reportType: "Certified Payroll (Davis-Bacon)",
    hasViolations,
    validatedWorkers,
    wageDeterminations: dolWageDeterminations,
    wh347: {
      form: "DOL WH-347",
      revision: "Rev. January 2025",
      ombControlNo: "1235-0008",
      ombExpires: "01/31/2028",
      status: hasViolations ? "blocked_by_prevailing_wage_violation" : "ready_to_submit",
      fileName: `WH-347-${sanitizeFilePart(contractNumber)}-${payrollNo}-${payload.weekEnding}.pdf`,
      mimeType: "application/pdf",
      generatedAt,
      fields: {
        contractorOrSubcontractor: contractorName,
        contractorAddress,
        contractorType: payload.contractorType ?? "prime",
        isFinalPayroll: Boolean(payload.isFinalPayroll),
        contractName: payload.contractName,
        contractNumber,
        contractingAgency: payload.contractingAgency,
        projectLocation: payload.projectLocation,
        wageDeterminationNo,
        weekEnding: payload.weekEnding,
        payrollNo,
        employees: validatedWorkers.map((worker) => ({
          name: worker.name,
          ssn: worker.maskedSsn,
          workClassification: worker.classification,
          hoursByDay: worker.hoursByDay,
          totalHours: worker.totalHours,
          rateOfPay: worker.hourlyRate,
          grossWages: worker.grossWages,
          withholding: worker.withholding,
          deductions: worker.deductions,
          netWages: worker.netWages,
        })),
        statementOfCompliance: {
          signerName: payload.adminSigner ?? "Alex HR Admin",
          signerTitle: payload.adminTitle ?? "HR Director",
          eSignatureStatus: hasViolations ? "blocked" : "e-signed",
          signedAt: hasViolations ? null : generatedAt,
        },
      },
    },
  };
}

export function CertifiedPayrollWh347Pdf({ data }: { data: Wh347Generation }) {
  const dates = weekDates(data.wh347.fields.weekEnding);
  const fields = data.wh347.fields;

  return (
    <Document title={data.wh347.fileName.replace(/\.pdf$/i, "")} author="CircleWorks">
      <Page size="LETTER" orientation="landscape" style={styles.page}>
        <View style={styles.topMeta}>
          <View>
            <Text>{data.wh347.revision}</Text>
            <Text>U.S. Department of Labor - Wage and Hour Division</Text>
          </View>
          <View>
            <Text style={styles.metaText}>OMB No.: {data.wh347.ombControlNo}</Text>
            <Text style={styles.metaText}>Expires: {data.wh347.ombExpires}</Text>
          </View>
        </View>

        <Text style={styles.title}>Davis-Bacon and Related Acts Weekly Certified Payroll Form</Text>
        <Text style={styles.subtitle}>WH-347 Certified Payroll</Text>

        <View style={styles.setupGrid}>
          <View style={styles.setupRow}>
            <View style={styles.setupCell}>
              <Text style={styles.label}>Submission of Final DBRA Certified Payroll Form</Text>
              <Text style={styles.value}>{fields.isFinalPayroll ? "Checked" : "Not checked"}</Text>
            </View>
            <View style={styles.setupCell}>
              <Text style={styles.label}>Prime Contractor / Subcontractor</Text>
              <Text style={styles.value}>{fields.contractorType === "prime" ? "Prime Contractor" : "Subcontractor"}</Text>
            </View>
            <View style={styles.setupCell}>
              <Text style={styles.label}>Project Name</Text>
              <Text style={styles.value}>{fields.contractName}</Text>
            </View>
            <View style={styles.setupCellLast}>
              <Text style={styles.label}>Certified Payroll No.</Text>
              <Text style={styles.value}>{fields.payrollNo}</Text>
            </View>
          </View>
          <View style={styles.setupRow}>
            <View style={styles.setupCell}>
              <Text style={styles.label}>Project No. or Contract No.</Text>
              <Text style={styles.value}>{fields.contractNumber}</Text>
            </View>
            <View style={styles.setupCell}>
              <Text style={styles.label}>Contracting Agency</Text>
              <Text style={styles.value}>{fields.contractingAgency}</Text>
            </View>
            <View style={styles.setupCell}>
              <Text style={styles.label}>Week Ending Date</Text>
              <Text style={styles.value}>{fields.weekEnding}</Text>
            </View>
            <View style={styles.setupCellLast}>
              <Text style={styles.label}>Wage Determination No.</Text>
              <Text style={styles.value}>{fields.wageDeterminationNo}</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row" }}>
            <View style={styles.setupCell}>
              <Text style={styles.label}>Business Name</Text>
              <Text style={styles.value}>{fields.contractorOrSubcontractor}</Text>
            </View>
            <View style={styles.setupCell}>
              <Text style={styles.label}>Business Address</Text>
              <Text style={styles.value}>{fields.contractorAddress}</Text>
            </View>
            <View style={styles.setupCellLast}>
              <Text style={styles.label}>Project Location</Text>
              <Text style={styles.value}>{fields.projectLocation}</Text>
            </View>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, styles.workerNo]}>1A Entry</Text>
            <Text style={[styles.th, styles.workerName]}>1B-1D Worker</Text>
            <Text style={[styles.th, styles.workerId]}>1E ID No.</Text>
            <Text style={[styles.th, styles.classification]}>3 Classification</Text>
            <Text style={[styles.th, styles.days]}>4 Hours by Day</Text>
            <Text style={[styles.th, styles.totalHours]}>5 Total</Text>
            <Text style={[styles.th, styles.rate]}>6A Rate</Text>
            <Text style={[styles.th, styles.gross]}>6C Gross</Text>
            <Text style={[styles.th, styles.deductions]}>7A/7B Deductions</Text>
            <Text style={[styles.th, styles.net]}>8 Net</Text>
            <Text style={[styles.th, styles.status]}>9 Paid</Text>
          </View>
          {data.validatedWorkers.map((worker, index) => (
            <View key={`${worker.id}-${worker.classification}-${index}`} style={styles.tableRow} wrap={false}>
              <Text style={[styles.td, styles.workerNo]}>{index + 1}</Text>
              <Text style={[styles.td, styles.workerName]}>{worker.name}</Text>
              <Text style={[styles.td, styles.workerId]}>{worker.maskedSsn}</Text>
              <Text style={[styles.td, styles.classification]}>{worker.classification}</Text>
              <View style={[styles.td, styles.days]}>
                <View style={styles.dayMiniRow}>
                  {dates.map((day) => (
                    <Text key={day.key} style={styles.dayMiniCell}>
                      {day.label}
                    </Text>
                  ))}
                </View>
                <View style={styles.dayMiniRow}>
                  {dates.map((day) => (
                    <Text key={day.key} style={styles.dayMiniCell}>
                      {day.date}
                    </Text>
                  ))}
                </View>
                <View style={styles.dayMiniRow}>
                  {dates.map((day) => (
                    <Text key={day.key} style={styles.dayMiniCell}>
                      {worker.hoursByDay[day.key] || "-"}
                    </Text>
                  ))}
                </View>
              </View>
              <Text style={[styles.td, styles.totalHours]}>{worker.totalHours}</Text>
              <Text style={[styles.td, styles.rate]}>{money(worker.hourlyRate)}</Text>
              <Text style={[styles.td, styles.gross]}>{money(worker.grossWages)}</Text>
              <Text style={[styles.td, styles.deductions]}>
                W/H {money(worker.withholding)}
                {"\n"}Other {money(worker.deductions)}
              </Text>
              <Text style={[styles.td, styles.net]}>{money(worker.netWages)}</Text>
              <Text style={[styles.td, styles.status]}>
                {worker.isUnderpaid ? `Below ${money(worker.prevailingWageRate)}` : "Meets WD"}
              </Text>
            </View>
          ))}
        </View>

        <Text style={styles.foot}>
          Generated by CircleWorks from WH-347-required payroll fields. Verify against the active DOL WH-347 before submission.
        </Text>
      </Page>

      <Page size="LETTER" style={styles.compliancePage}>
        <Text style={styles.complianceTitle}>Statement of Compliance</Text>
        <Text style={styles.paragraph}>
          Date: {new Date(data.wh347.generatedAt).toLocaleDateString("en-US")}. I, {fields.statementOfCompliance.signerName}, {fields.statementOfCompliance.signerTitle}, do hereby state:
        </Text>
        <Text style={styles.paragraph}>
          1. That I pay or supervise the payment of the persons employed by {fields.contractorOrSubcontractor} on the {fields.contractName} project; that during the payroll period commencing with the week ending {fields.weekEnding}, all persons employed on said project have been paid the full weekly wages earned.
        </Text>
        <Text style={styles.paragraph}>
          2. That all regular payrolls and basic records required for this payroll period are complete and accurate and will be made available upon request.
        </Text>
        <Text style={styles.paragraph}>
          3. That classifications listed for each laborer or mechanic conform with the work performed, and wage rates are not less than the applicable Davis-Bacon wage determination rates incorporated into the contract.
        </Text>

        <View style={styles.signatureGrid}>
          <View style={styles.signatureBox}>
            <Text>Name and Title</Text>
            <Text style={{ marginTop: 10, fontFamily: "Helvetica-Bold" }}>
              {fields.statementOfCompliance.signerName} - {fields.statementOfCompliance.signerTitle}
            </Text>
          </View>
          <View style={styles.signatureBox}>
            <Text>Signature</Text>
            <Text style={{ marginTop: 10, fontFamily: "Helvetica-Bold", color: data.hasViolations ? "#dc2626" : "#166534" }}>
              {data.hasViolations ? "Signature blocked by prevailing wage violation" : `${fields.statementOfCompliance.signerName} (e-signed)`}
            </Text>
          </View>
        </View>

        <Text style={{ marginTop: 34, fontSize: 8, color: "#64748b" }}>
          Generated file: {data.wh347.fileName}
        </Text>
      </Page>
    </Document>
  );
}
