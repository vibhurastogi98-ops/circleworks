import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

import { getOsha300ASummary, oshaIncidents } from "@/data/complianceModule";

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontFamily: "Helvetica",
    color: "#0f172a",
  },
  eyebrow: {
    fontSize: 9,
    color: "#2563eb",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 10,
    color: "#64748b",
    marginBottom: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  box: {
    width: "31%",
    border: "1 solid #cbd5e1",
    borderRadius: 6,
    padding: 10,
  },
  label: {
    fontSize: 8,
    color: "#64748b",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  value: {
    fontSize: 20,
    fontWeight: 700,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    marginTop: 6,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    borderBottom: "1 solid #e2e8f0",
    paddingVertical: 6,
  },
  header: {
    backgroundColor: "#f1f5f9",
    fontWeight: 700,
  },
  cell: {
    fontSize: 8,
    paddingRight: 8,
  },
  date: {
    width: "14%",
  },
  employee: {
    width: "22%",
  },
  description: {
    width: "44%",
  },
  small: {
    width: "10%",
  },
  footer: {
    marginTop: 22,
    fontSize: 9,
    color: "#64748b",
    lineHeight: 1.5,
  },
});

export function Osha300APdfDocument() {
  const summary = getOsha300ASummary();

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.eyebrow}>CircleWorks Compliance</Text>
        <Text style={styles.title}>OSHA 300A Annual Summary</Text>
        <Text style={styles.subtitle}>Calendar year {summary.year} · Generated from OSHA 300/301 incident data</Text>

        <View style={styles.grid}>
          <SummaryBox label="Recordable cases" value={summary.recordableCases} />
          <SummaryBox label="Injuries" value={summary.injuries} />
          <SummaryBox label="Illnesses" value={summary.illnesses} />
          <SummaryBox label="Days away" value={summary.totalDaysAway} />
          <SummaryBox label="Restricted days" value={summary.totalRestrictedDays} />
        </View>

        <Text style={styles.sectionTitle}>Recordable Incident Detail</Text>
        <View style={[styles.row, styles.header]}>
          <Text style={[styles.cell, styles.date]}>Date</Text>
          <Text style={[styles.cell, styles.employee]}>Employee</Text>
          <Text style={[styles.cell, styles.description]}>Description</Text>
          <Text style={[styles.cell, styles.small]}>Type</Text>
          <Text style={[styles.cell, styles.small]}>Days</Text>
        </View>
        {oshaIncidents
          .filter((incident) => incident.recordable)
          .map((incident) => (
            <View key={incident.id} style={styles.row}>
              <Text style={[styles.cell, styles.date]}>{incident.date}</Text>
              <Text style={[styles.cell, styles.employee]}>{incident.employee}</Text>
              <Text style={[styles.cell, styles.description]}>{incident.description}</Text>
              <Text style={[styles.cell, styles.small]}>{incident.type}</Text>
              <Text style={[styles.cell, styles.small]}>{incident.daysAway}</Text>
            </View>
          ))}

        <Text style={styles.footer}>
          Posting reminder: {summary.postingReminder} Review before certification and retain according to OSHA
          recordkeeping requirements.
        </Text>
      </Page>
    </Document>
  );
}

function SummaryBox({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.box}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}
