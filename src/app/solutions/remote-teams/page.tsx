import { Metadata } from "next";
import SolutionPageTemplate from "@/components/SolutionPageTemplate";

export const metadata: Metadata = {
  title: "Payroll & HR for Remote & Distributed Teams | CircleWorks",
  description:
    "CircleWorks simplifies payroll and compliance for remote and distributed teams. Manage employees across all 50 US states with automatic tax registration and nexus tracking.",
  keywords: ["remote payroll", "distributed team HR", "multi-state payroll", "nexus tracking", "remote work compliance"],
  openGraph: {
    title: "Payroll & HR for Remote & Distributed Teams | CircleWorks",
    description: "Payroll and HR platform for remote-first and distributed teams across the US.",
    type: "website",
  },
};

export default function RemoteTeamsPage() {
  return (
    <SolutionPageTemplate
      title="Payroll & HR for Remote & Distributed Teams"
      subtitle="Managing employees across 50 states is a compliance minefield. CircleWorks handles multi-state tax registration, nexus tracking, and local labor laws automatically."
      breadcrumbLabel="Remote & Distributed Teams"
      heroGradient="from-cyan-400 via-blue-400 to-purple-400"
      heroEmoji="🌎"
      problems={[
        {
          icon: "🗺️",
          title: "Multi-State Tax Complexity",
          description: "Having employees in 10+ states means managing different tax codes, withholding rules, and compliance requirements for each jurisdiction.",
        },
        {
          icon: "📍",
          title: "Nexus & Registration Nightmare",
          description: "Determining tax nexus and registering with state agencies manually is time-consuming, error-prone, and easily missed.",
        },
        {
          icon: "⚖️",
          title: "Compliance Risk",
          description: "Missing state deadlines, failing to comply with local wage laws, or miscalculating taxes exposes the company to penalties and liability.",
        },
      ]}
      solutionIntro="CircleWorks was built for distributed teams. We automatically track employee locations, register with appropriate tax jurisdictions, manage state-specific labor laws, and calculate taxes precisely."
      solutionPoints={[
        "Automatic employee nexus tracking across all 50 states and DC",
        "Streamlined tax registration and filing for each required jurisdiction",
        "State-by-state labor law compliance including minimum wage and break requirements",
        "Multi-state benefit plan administration and ACA compliance",
        "Home office stipends and remote work tax deductions automated",
        "Real-time compliance alerts when new employees establish nexus",
      ]}
      features={[
        {
          icon: "📍",
          title: "Nexus Automation",
          description: "Automatic tracking of where employees live and work. We handle tax registration for each state required.",
        },
        {
          icon: "⚖️",
          title: "State Compliance",
          description: "Built-in rules for every state including minimum wage, overtime, meal break requirements, and labor law updates.",
        },
        {
          icon: "💰",
          title: "Multi-State Payroll",
          description: "Automatic tax calculations for all required states. One payroll run, complete nationwide compliance.",
        },
        {
          icon: "🏠",
          title: "Remote Work Benefits",
          description: "Home office stipends, equipment allowances, and remote work tax optimization built into payroll.",
        },
        {
          icon: "📱",
          title: "Location Flexibility",
          description: "Support for temporary work locations, traveling employees, and frequent workplace changes.",
        },
        {
          icon: "🛡️",
          title: "Audit Ready",
          description: "Complete documentation and audit trails for every state report and tax filing.",
        },
      ]}
      useCaseSteps={[
        {
          number: "1",
          title: "Expand",
          description: "Hire employees in new states. CircleWorks tracks location automatically.",
          icon: "🚀",
        },
        {
          number: "2",
          title: "Register",
          description: "Our system determines nexus and registers with all required tax authorities.",
          icon: "✍️",
        },
        {
          number: "3",
          title: "Comply",
          description: "Automatic calculation of state taxes, benefits, and labor law compliance.",
          icon: "✅",
        },
        {
          number: "4",
          title: "File",
          description: "File taxes and reports with each state automatically on schedule.",
          icon: "📤",
        },
      ]}
      benefits={[
        {
          metric: "100%",
          description: "Multi-state tax accuracy and compliance coverage",
          icon: "✅",
        },
        {
          metric: "50+",
          description: "States handled with automatic registration and updates",
          icon: "🗺️",
        },
        {
          metric: "$75K",
          description: "Average compliance risk reduction and penalty avoidance",
          icon: "🛡️",
        },
        {
          metric: "24/7",
          description: "Compliance monitoring and alerts for regulatory changes",
          icon: "🔔",
        },
      ]}
      testimonials={[
        {
          quote:
            "We went from hiring 2% of our team remote to 60%. CircleWorks handles all the state tax complexity so we don't have to worry.",
          author: "Emily Rodriguez",
          company: "TalentScale Solutions",
          role: "Director of People",
          avatar: "ER",
        },
        {
          quote:
            "No more tax registration delays or compliance surprises. CircleWorks is on top of everything as we expand into new states.",
          author: "Kevin Zhang",
          company: "Remote-First Tech Co",
          role: "CEO",
          avatar: "KZ",
        },
        {
          quote:
            "The automatic nexus tracking is incredible. We've never had a single compliance issue or missed deadline since switching.",
          author: "Lauren Thompson",
          company: "Distributed Design Studios",
          role: "Operations Lead",
          avatar: "LT",
        },
      ]}
      ctaHeading="Scale Remote Hiring Effortlessly"
      ctaDescription="Stop worrying about multi-state compliance. CircleWorks handles tax registration, nexus tracking, and compliance automatically as you hire remotely."
    />
  );
}
