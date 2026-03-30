import { Metadata } from "next";
import SolutionPageTemplate from "@/components/SolutionPageTemplate";

export const metadata: Metadata = {
  title: "Payroll & HR for Professional Services & Agencies | CircleWorks",
  description:
    "CircleWorks powers payroll and HR for agencies, consulting firms, and professional services. Manage client billable hours, project tracking, and compliance at scale.",
  keywords: ["agency payroll", "consulting HR", "professional services payroll", "billable hours tracking", "consulting compliance"],
  openGraph: {
    title: "Payroll & HR for Professional Services & Agencies | CircleWorks",
    description: "Payroll and HR platform built for agencies, consulting firms, and professional services.",
    type: "website",
  },
};

export default function ProfessionalServicesPage() {
  return (
    <SolutionPageTemplate
      title="Payroll & HR for Professional Services"
      subtitle="Agencies and consulting firms need flexibility. CircleWorks handles billable hour tracking, client-based teams, and revenue correlation with HR management."
      breadcrumbLabel="Professional Services"
      heroGradient="from-blue-400 via-indigo-400 to-purple-300"
      heroEmoji="🤝"
      problems={[
        {
          icon: "💼",
          title: "Billable Hour Chaos",
          description: "Tracking project hours, client assignments, and billable utilization across your team requires complex integrations and manual tracking.",
        },
        {
          icon: "👥",
          title: "Multiple Team Structures",
          description: "Managing full-time employees, contractors, subcontractors, and off-shore teams complicates payroll and compliance.",
        },
        {
          icon: "📊",
          title: "Revenue Alignment",
          description: "Connecting employee utilization to revenue recognition and profit margins requires siloed systems and manual reconciliation.",
        },
      ]}
      solutionIntro="CircleWorks integrates with your project management and accounting systems to deliver payroll that aligns with billable hours, project profitability, and client assignments."
      solutionPoints={[
        "Billable hour tracking integrated with time entries and project management systems",
        "Client-based team assignments with utilization reporting and bench tracking",
        "Flexible contractor and subcontractor management with 1099 integration",
        "Time entry to payroll to accounting reconciliation in one platform",
        "Project-based analytics to correlate employee compensation with revenue",
        "Custom reporting for partner compensation and profit sharing calculations",
      ]}
      features={[
        {
          icon: "⏱️",
          title: "Time & Project Tracking",
          description: "Track billable and non-billable hours against client projects with real-time utilization dashboards.",
        },
        {
          icon: "💰",
          title: "Revenue Alignment",
          description: "Connect payroll to project revenue, calculate utilization rates, and track gross profit by resource.",
        },
        {
          icon: "👥",
          title: "Multiple Worker Types",
          description: "Manage employees, contractors, subcontractors, and off-shore teams in one system.",
        },
        {
          icon: "📋",
          title: "Client Billables",
          description: "Track billable hours per client, generate invoices, and reconcile with project actuals automatically.",
        },
        {
          icon: "🌍",
          title: "Global Team Support",
          description: "Support international resources with multi-currency payroll, tax compliance, and contractor payments.",
        },
        {
          icon: "📊",
          title: "Partner Compensation",
          description: "Calculate partner draws, profit shares, and revenue bonuses with automated distributions.",
        },
      ]}
      useCaseSteps={[
        {
          number: "1",
          title: "Setup",
          description: "Import clients, projects, and team members. Connect your project management system.",
          icon: "🔧",
        },
        {
          number: "2",
          title: "Track",
          description: "Employees log billable and non-billable hours. Automatically categorize by client and project.",
          icon: "⌚",
        },
        {
          number: "3",
          title: "Analyze",
          description: "View utilization, billable rates, and project profitability. Identify bench time and capacity gaps.",
          icon: "📈",
        },
        {
          number: "4",
          title: "Pay",
          description: "Run payroll based on utilization, bonuses, and partner profit shares. Bill clients simultaneously.",
          icon: "💸",
        },
      ]}
      benefits={[
        {
          metric: "25%",
          description: "Increase in billable utilization tracking efficiency",
          icon: "📊",
        },
        {
          metric: "90%",
          description: "Faster project profitability analysis and reporting",
          icon: "📈",
        },
        {
          metric: "$50K+",
          description: "Average annual revenue recovery from time tracking optimization",
          icon: "💰",
        },
        {
          metric: "500+",
          description: "Agencies and professional services firms on CircleWorks",
          icon: "🏢",
        },
      ]}
      testimonials={[
        {
          quote:
            "CircleWorks finally connected our time tracking to our financials. We can now see real project profitability and bill accurately.",
          author: "Thomas Wright",
          company: "Strategic Consulting Group",
          role: "Managing Partner",
          avatar: "TW",
        },
        {
          quote:
            "Managing mix of full-time employees and contractors was a nightmare. CircleWorks handles all worker types seamlessly.",
          author: "Sophia Reyes",
          company: "Creative Collective Agency",
          role: "Operations Director",
          avatar: "SR",
        },
        {
          quote:
            "The partner draw calculations are accurate and automated. We save 40 hours per month on manual accounting.",
          author: "Michael O'Connor",
          company: "DataWorks Partners",
          role: "Finance Manager",
          avatar: "MO",
        },
      ]}
      ctaHeading="Transform Professional Services Payroll"
      ctaDescription="Connect your billable hours to payroll to revenue. CircleWorks gives you the visibility and automation professional services firms demand."
    />
  );
}
