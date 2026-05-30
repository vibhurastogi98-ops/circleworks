import React from "react";
import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

import type { Course } from "@/data/mockLearning";

const navy = "#0f172a";
const blue = "#2563eb";
const muted = "#64748b";

const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontFamily: "Helvetica",
    color: navy,
    backgroundColor: "#f8fafc",
  },
  frame: {
    flex: 1,
    borderWidth: 2,
    borderColor: blue,
    backgroundColor: "#ffffff",
    padding: 42,
    justifyContent: "space-between",
  },
  eyebrow: {
    color: blue,
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  title: {
    marginTop: 18,
    fontSize: 34,
    fontFamily: "Helvetica-Bold",
    lineHeight: 1.1,
  },
  learner: {
    marginTop: 30,
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
  },
  body: {
    marginTop: 16,
    fontSize: 12,
    lineHeight: 1.6,
    color: muted,
  },
  course: {
    marginTop: 18,
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
  },
  metaRow: {
    marginTop: 28,
    flexDirection: "row",
    gap: 18,
  },
  metaBox: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
  },
  metaLabel: {
    fontSize: 8,
    color: muted,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
  },
  metaValue: {
    marginTop: 6,
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  signature: {
    borderTopWidth: 1,
    borderTopColor: "#cbd5e1",
    paddingTop: 8,
    width: 180,
    fontSize: 10,
    color: muted,
  },
  seal: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3,
    borderColor: blue,
    alignItems: "center",
    justifyContent: "center",
  },
  sealText: {
    color: blue,
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
  },
});

export function LearningCertificatePdf({
  course,
  learner,
  issuedAt,
}: {
  course: Course;
  learner: string;
  issuedAt: string;
}) {
  return (
    <Document title={`Certificate - ${course.title}`} author="CircleWorks">
      <Page size="LETTER" orientation="landscape" style={styles.page}>
        <View style={styles.frame}>
          <View>
            <Text style={styles.eyebrow}>CircleWorks Learning Certificate</Text>
            <Text style={styles.title}>Certificate of Completion</Text>
            <Text style={styles.body}>This certifies that</Text>
            <Text style={styles.learner}>{learner}</Text>
            <Text style={styles.body}>has successfully completed the course</Text>
            <Text style={styles.course}>{course.title}</Text>
            <View style={styles.metaRow}>
              <View style={styles.metaBox}>
                <Text style={styles.metaLabel}>Category</Text>
                <Text style={styles.metaValue}>{course.category}</Text>
              </View>
              <View style={styles.metaBox}>
                <Text style={styles.metaLabel}>Duration</Text>
                <Text style={styles.metaValue}>{course.duration}</Text>
              </View>
              <View style={styles.metaBox}>
                <Text style={styles.metaLabel}>Passing Threshold</Text>
                <Text style={styles.metaValue}>80%</Text>
              </View>
              <View style={styles.metaBox}>
                <Text style={styles.metaLabel}>Issued</Text>
                <Text style={styles.metaValue}>{issuedAt}</Text>
              </View>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.signature}>CircleWorks Learning Admin</Text>
            <View style={styles.seal}>
              <Text style={styles.sealText}>CW</Text>
              <Text style={styles.sealText}>LMS</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
