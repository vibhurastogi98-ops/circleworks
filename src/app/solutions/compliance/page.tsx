import { Metadata } from "next";
import SolutionPageTemplate from "@/components/SolutionPageTemplate";

export const metadata: Metadata = {
  title: "Payroll & HR Compliance Solutions | CircleWorks",
  description:
    "CircleWorks delivers compliance-first payroll and HR management. Stay audit-ready with automated tax filing, labor law compliance, and regulatory updates.",
  keywords: ["payroll compliance", "tax compliance platform", "labor law compliance", "audit ready payroll", "regulatory HR"],
  openGraph: {
    title: "Payroll & HR Compliance Solutions | CircleWorks",
    description: "Compliance-first payroll and HR management for regulated industries and mission-critical organizations.",
    type: "website",
  },
};

export default function CompliancePage() {
  return (
    <SolutionPageTemplate
      title="Compliance-First Payroll & HR"
      subtitle="For regulated industries and mission-critical companies, compliance isn't optional. CircleWorks delivers audit-ready payroll, automated tax filing, and continuous regulatory monitoring."
      breadcrumbLabel="Compliance-First"
      heroGradient="from-green-400 via-teal-400 to-blue-400"
      heroEmoji="🛡️"
      problems={[
        {
          icon: "📋",
          title: "Complex Regulations",
          description: "Federal, state, and local payroll rules change constantly. Staying compliant across all requirements is nearly impossible.",
        },
        {
          icon: "⚠️",
          title: "Audit Risk",
          description: "IRS and state department audits are expensive. One payroll error can trigger investigations and penalties.",
        },
        {
          icon: "📊",
          title: "Documentation Burden",
          description: "Maintaining audit trails, retention policies, and compliance documentation requires sophisticated systems.",
        },
      ]}
      solutionIntro="CircleWorks is built on compliance. Every calculation, every filing, every decision is documented, auditable, and defensible. Stay compliant automatically."
      solutionPoints={[
        "Automatic tax calculations and filing for federal, state, and local agencies",
        "Real-time labor law updates and compliance alerts",
        "Complete audit trails for every payroll transaction and HR decision",
        "SOC-2 Type II, HIPAA, and ACA compliance built-in",
        "Automated wage and hour compliance including meal breaks and overtime",
        "EEO-1, ACA, and other required reporting pre-built and automated",
      ]}
      features={[
        {
          icon: "📅",
          title: "Tax Filing Management",
          description: "All payroll tax filings and payments managed and submitted automatically to IRS, states, and local agencies.",
        },
        {
          icon: "📝",
          title: "Audit Trails",
          description: "Complete documentation of every payroll decision, change, and correction with user attribution and timestamps.",
        },
        {
          icon: "🔔",
          title: "Regulatory Monitoring",
          description: "Real-time alerts for new regulations, deadline changes, and compliance updates relevant to your company.",
        },
        {
          icon: "⚖️",
          title: "Labor Law Compliance",
          description: "Automated enforcement of minimum wage, overtime, meal breaks, and other wage and hour rules by state.",
        },
        {
          icon: "📊",
          title: "Compliance Reporting",
          description: "Pre-built reports for EEO-1, ACA, prevailing wage, and state-specific compliance requirements.",
        },
        {
          icon: "🔐",
          title: "Security & Privacy",
          description: "SOC-2 Type II certified, encrypted data at rest and in transit, role-based access controls, and compliance logging.",
        },
      ]}
      useCaseSteps={[
        {
          number: "1",
          title: "Setup",
          description: "Configure compliance requirements for your industry and jurisdictions. Built-in best practices.",
          icon: "⚙️",
        },
        {
          number: "2",
          title: "Monitor",
          description: "Real-time alerts for changes in regulations, tax deadlines, and compliance requirements.",
          icon: "🔔",
        },
        {
          number: "3",
          title: "Execute",
          description: "Payroll runs automatically with full compliance. All tax filings generated and submitted.",
          icon: "✅",
        },
        {
          number: "4",
          title: "Audit",
          description: "Complete audit-ready documentation available anytime. Pass inspections with confidence.",
          icon: "📋",
        },
      ]}
      benefits={[
        {
          metric: "100%",
          description: "Tax filing accuracy and on-time submission",
          icon: "✅",
        },
        {
          metric: "$250K+",
          description: "Average penalty avoidance over 3 years",
          icon: "💰",
        },
        {
          metric: "40 hrs+",
          description: "Monthly compliance work automated",
          icon: "⏱️",
        },
        {
          metric: "24/7",
          description: "Regulatory monitoring and compliance alerts",
          icon: "🔔",
        },
      ]}
      testimonials={[
        {
          quote:
            "As a healthcare provider, compliance is everything. CircleWorks keeps us audit-ready and gives us complete peace of mind.",
          author: "Dr. Susan Mitchell",
          company: "Advanced Medical Solutions",
          role: "Compliance Officer",
          avatar: "SM",
        },
        {
          quote:
            "We've gone through three IRS audits since using CircleWorks. Every audit cleared immediately thanks to our complete documentation.",
          author: "Richard Foster",
          company: "Midwest Manufacturing Co",
          role: "Finance Manager",
          avatar: "RF",
        },
        {
          quote:
            "The real-time regulatory updates mean we're always compliant. No more surprises with changing wage laws or new requirements.",
          author: "Christina Wallace",
          company: "National Logistics Inc",
          role: "HR Director",
          avatar: "CW",
        },
      ]}
      ctaHeading="Stay Audit-Ready Always"
      ctaDescription="Let CircleWorks handle compliance complexity. Automatic tax filing, regulatory monitoring, and audit-ready documentation, all built-in."
    />
  );
}
