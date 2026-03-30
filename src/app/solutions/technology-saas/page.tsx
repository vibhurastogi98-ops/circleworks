import { Metadata } from "next";
import SolutionPageTemplate from "@/components/SolutionPageTemplate";

export const metadata: Metadata = {
  title: "Payroll & HR for Technology & SaaS Companies | CircleWorks",
  description:
    "CircleWorks is the payroll and HR platform built for tech and SaaS companies. Handle global contractor payments, equity integration, and SOC-2 compliance in one platform.",
  keywords: ["payroll software for tech", "HR platform for SaaS", "contractor payments", "equity management", "US payroll"],
  openGraph: {
    title: "Payroll & HR for Technology & SaaS Companies | CircleWorks",
    description: "All-in-one platform for tech company payroll, benefits, and HR compliance.",
    type: "website",
  },
};

export default function TechSaasPage() {
  return (
    <SolutionPageTemplate
      title="Payroll & HR Built for Tech Teams"
      subtitle="From startups to scale-ups, CircleWorks handles global payroll, contractor payments, and compliance automation so your team can focus on building."
      breadcrumbLabel="Technology & SaaS"
      heroGradient="from-purple-400 via-blue-400 to-cyan-300"
      heroEmoji="💻"
      problems={[
        {
          icon: "🌍",
          title: "Global Complexity",
          description: "Managing employees and contractors across jurisdictions requires expertise in local tax laws and compliance requirements.",
        },
        {
          icon: "👥",
          title: "Contractor-Heavy",
          description: "Tech companies rely heavily on contractors, freelancers, and agency resources. Managing 1099s, invoices, and payments manually is a nightmare.",
        },
        {
          icon: "⚡",
          title: "Fast Scaling Chaos",
          description: "Hiring 10+ people per month means payroll, benefits, and compliance bottlenecks. You need automation, not spreadsheets.",
        },
      ]}
      solutionIntro="CircleWorks was built from the ground up to solve tech company challenges. We integrate equity management, support global contractor payments, and automate SOC-2 auditing."
      solutionPoints={[
        "Global contractor payments in 150+ countries with real-time FX conversion",
        "Equity integration for stock options, RSUs, and cap table management",
        "Automated SOC-2 Type II compliance reporting and audit trails",
        "R&D tax credit optimization for engineering-driven companies",
        "Native multi-state payroll with automated tax registration",
        "Rest API and webhooks for seamless custom integrations",
      ]}
      features={[
        {
          icon: "💸",
          title: "Payroll Automation",
          description: "Native US payroll with automatic tax calculations, 2-day direct deposit, and garnishment support.",
        },
        {
          icon: "🌎",
          title: "Global Contractor Network",
          description: "Pay contractors worldwide with automated 1099 generation, invoice tracking, and milestone-based payments.",
        },
        {
          icon: "📊",
          title: "Advanced Analytics",
          description: "Custom dashboards for headcount forecasting, compensation parity analysis, and turnover predictions.",
        },
        {
          icon: "🛡️",
          title: "Compliance & Security",
          description: "SOC-2 Type II certified, HIPAA compliant, and ACA-ready with automated labor law updates.",
        },
        {
          icon: "📱",
          title: "Remote-First Portal",
          description: "Mobile-first employee portal for time-off requests, paystub downloads, and mobile-optimized workflows.",
        },
        {
          icon: "🔗",
          title: "Native Integrations",
          description: "QuickBooks, Okta, Slack, Brex, Greenhouse, and 15+ integrations built into the platform.",
        },
      ]}
      useCaseSteps={[
        {
          number: "1",
          title: "Launch",
          description: "Start hiring and building your team with instant employee onboarding.",
          icon: "🚀",
        },
        {
          number: "2",
          title: "Scale",
          description: "Add international contractors and manage distributed teams globally.",
          icon: "📈",
        },
        {
          number: "3",
          title: "Automate",
          description: "Set up recurring payroll runs, benefits, and compliance tasks automatically.",
          icon: "⚙️",
        },
        {
          number: "4",
          title: "Grow",
          description: "Focus on your product while CircleWorks handles all HR backend operations.",
          icon: "🌟",
        },
      ]}
      benefits={[
        {
          metric: "95%",
          description: "Faster payroll processing with one-click runs",
          icon: "⚡",
        },
        {
          metric: "30+",
          description: "Hours saved monthly by each HR manager",
          icon: "⏱️",
        },
        {
          metric: "$250K",
          description: "Average annual savings on compliance overhead",
          icon: "💰",
        },
        {
          metric: "150+",
          description: "Countries supported for contractor payments",
          icon: "🌍",
        },
      ]}
      testimonials={[
        {
          quote:
            "CircleWorks eliminated our need for expensive accountants. The global contractor payments and tax compliance automation has saved us thousands.",
          author: "Sarah Chen",
          company: "TechVenture Labs",
          role: "CEO",
          avatar: "SC",
        },
        {
          quote:
            "The equity integration feature is a game-changer. We can now manage stock options, RSUs, and cap tables all in one place.",
          author: "Marcus Johnson",
          company: "DataFlow AI",
          role: "Head of People",
          avatar: "MJ",
        },
        {
          quote:
            "As we scaled from 20 to 200 employees, CircleWorks scaled with us. No compliance surprises, no missed deadlines.",
          author: "Pavel Ivanov",
          company: "CloudSync Systems",
          role: "Founder",
          avatar: "PI",
        },
      ]}
      ctaHeading="Ready to Streamline Tech Payroll?"
      ctaDescription="Get your tech company on CircleWorks today. No credit card required. See why 5,000+ tech and SaaS companies trust us."
    />
  );
}
