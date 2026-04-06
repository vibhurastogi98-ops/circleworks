/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Register a cleaner font if needed, otherwise use defaults
// Font.register({ family: 'Inter', src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2' });

const styles = StyleSheet.create({
  page: {
    padding: 60,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2563eb',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  text: {
    fontSize: 11,
    color: '#334155',
    lineHeight: 1.6,
    marginBottom: 8,
  },
  bold: {
    fontWeight: 'bold',
    color: '#0f172a',
  },
  list: {
    marginLeft: 15,
    marginTop: 5,
  },
  listItem: {
    fontSize: 11,
    color: '#334155',
    marginBottom: 4,
    flexDirection: 'row',
  },
  bullet: {
    width: 10,
    fontSize: 11,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 60,
    right: 60,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
    textAlign: 'center',
    fontSize: 9,
    color: '#94a3b8',
  }
});

interface NewHirePacketProps {
  employeeName: string;
  companyName: string;
}

const NewHirePacket = ({ employeeName, companyName }: NewHirePacketProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>New Hire Packet</Text>
          <Text style={styles.subtitle}>Welcome to {companyName}</Text>
        </View>
        <Text style={{ fontSize: 10, color: '#94a3b8' }}>Issue Date: {new Date().toLocaleDateString()}</Text>
      </View>

      {/* Welcome Letter */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Welcome</Text>
        <Text style={styles.text}>Dear {employeeName},</Text>
        <Text style={styles.text}>
          We are absolutely thrilled to have you join {companyName}! This packet contains important information to help you navigate your first few days and get settled into your new role.
        </Text>
        <Text style={styles.text}>
          Our mission is to empower teams to build the future of HR and Payroll, and we believe your skills and experience will be instrumental in our continued success.
        </Text>
      </View>

      {/* First Day Schedule */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>First Day Schedule</Text>
        <View style={styles.list}>
          <View style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.text}><Text style={styles.bold}>09:00 AM:</Text> Welcome & Office Tour</Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.text}><Text style={styles.bold}>10:00 AM:</Text> IT Setup & Hardware Handover</Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.text}><Text style={styles.bold}>11:30 AM:</Text> HR Orientation (Benefits & Policies)</Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.text}><Text style={styles.bold}>12:30 PM:</Text> Team Lunch</Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.text}><Text style={styles.bold}>02:00 PM:</Text> Initial Manager 1-on-1</Text>
          </View>
        </View>
      </View>

      {/* IT Setup */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>IT Setup Instructions</Text>
        <Text style={styles.text}>
          Your primary workstations and accounts have been provisioned. Please follow these steps to activate your access:
        </Text>
        <View style={styles.list}>
          <View style={styles.listItem}>
            <Text style={styles.bullet}>1.</Text>
            <Text style={styles.text}>Connect to the "CW-Internal" Wi-Fi network.</Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.bullet}>2.</Text>
            <Text style={styles.text}>Log in to your laptop using your temporary credentials.</Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.bullet}>3.</Text>
            <Text style={styles.text}>Set up Multi-Factor Authentication (MFA) via the Okta dashboard.</Text>
          </View>
        </View>
      </View>

      {/* HR Contact */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>HR Support</Text>
        <Text style={styles.text}>
          If you have any questions before your start date, please reach out to our People Operations team:
        </Text>
        <Text style={styles.text}><Text style={styles.bold}>Email:</Text> people@circleworks.com</Text>
        <Text style={styles.text}><Text style={styles.bold}>Phone:</Text> (555) 123-4567</Text>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>
        CircleWorks HRIS & Payroll Platform · Confidently Managed by {companyName}
      </Text>
    </Page>
  </Document>
);

export default NewHirePacket;
