import { Metadata } from "next";
import SolutionPageTemplate from "@/components/SolutionPageTemplate";

export const metadata: Metadata = {
  title: "Payroll & HR for Retail & E-commerce Companies | CircleWorks",
  description:
    "CircleWorks delivers seamless payroll and HR for retail and e-commerce businesses. Manage shift-based teams, multi-location payroll, and employee scheduling at scale.",
  keywords: ["retail payroll", "e-commerce HR", "multi-location payroll", "shift scheduling", "retail compliance"],
  openGraph: {
    title: "Payroll & HR for Retail & E-commerce Companies | CircleWorks",
    description: "All-in-one platform for retail and e-commerce payroll, scheduling, and HR.",
    type: "website",
  },
};

export default function RetailEcommercePage() {
  return (
    <SolutionPageTemplate
      title="Payroll & HR for Retail & E-Commerce"
      subtitle="Retail and e-commerce teams move fast. CircleWorks delivers hassle-free multi-location payroll, shift scheduling, and compliance so you can focus on sales."
      breadcrumbLabel="Retail & E-commerce"
      heroGradient="from-orange-400 via-red-400 to-pink-300"
      heroEmoji="🛍️"
      problems={[
        {
          icon: "📍",
          title: "Multi-Location Nightmare",
          description: "Managing payroll, compliance, and scheduling across dozens of stores in different states requires impossible coordination.",
        },
        {
          icon: "⏰",
          title: "Shift-Based Complexity",
          description: "Hourly workers, part-time teams, and frequent scheduling changes make payroll a moving target every week.",
        },
        {
          icon: "📊",
          title: "Labor Cost Control",
          description: "Unexpected overtime, labor law violations, and payroll processing delays eat into margins quickly.",
        },
      ]}
      solutionIntro="CircleWorks is purpose-built for retail and e-commerce. Multi-location payroll, shift-based worker management, and automated compliance keep your labor costs predictable."
      solutionPoints={[
        "Centralized payroll for unlimited locations with per-store reporting",
        "Real-time scheduling and shift management with employee self-service",
        "Automated overtime alerts to prevent labor cost surprises",
        "Multi-state compliance handling for retail and e-commerce specific regulations",
        "Employee portal for time-off requests, schedule swaps, and paystub access",
        "Integration with POS systems for automatic time clocking",
      ]}
      features={[
        {
          icon: "🏪",
          title: "Multi-Location Payroll",
          description: "Run payroll for all locations simultaneously with centralized oversight and per-store reporting.",
        },
        {
          icon: "📅",
          title: "Smart Scheduling",
          description: "Intuitive shift creation, automatic time tracking, and employee self-service schedule swaps.",
        },
        {
          icon: "💸",
          title: "Labor Cost Control",
          description: "Real-time alerts for overtime, budget tracking, and automated wage calculations.",
        },
        {
          icon: "🛍️",
          title: "POS Integration",
          description: "Sync with Square, Shopify, Toast, and other POS systems for automatic time clocking.",
        },
        {
          icon: "⚖️",
          title: "Compliance Automation",
          description: "Stay compliant with state-specific wage laws, break requirements, and scheduling rules.",
        },
        {
          icon: "📊",
          title: "Labor Analytics",
          description: "Track labor costs by location, identify staffing trends, and forecast payroll expenses.",
        },
      ]}
      useCaseSteps={[
        {
          number: "1",
          title: "Setup",
          description: "Create store locations and import your team. Sync with your POS system.",
          icon: "⚙️",
        },
        {
          number: "2",
          title: "Schedule",
          description: "Build shifts, publish schedules, and let employees request time-off automatically.",
          icon: "📅",
        },
        {
          number: "3",
          title: "Track",
          description: "Monitor time clocking, overtime, and labor costs in real-time across all locations.",
          icon: "⌚",
        },
        {
          number: "4",
          title: "Pay",
          description: "Run payroll for all stores at once with automatic compliance and tax calculations.",
          icon: "💳",
        },
      ]}
      benefits={[
        {
          metric: "60%",
          description: "Faster payroll processing across all locations",
          icon: "⚡",
        },
        {
          metric: "20%",
          description: "Average reduction in uncontrolled overtime costs",
          icon: "💰",
        },
        {
          metric: "100+",
          description: "Retail chains and e-commerce companies trusting CircleWorks",
          icon: "🏪",
        },
        {
          metric: "24/7",
          description: "Mobile access for managers to review schedules and labor costs",
          icon: "📱",
        },
      ]}
      testimonials={[
        {
          quote:
            "CircleWorks handles all our multi-location payroll in minutes. What used to take our accounting team 2 days now takes 30 minutes.",
          author: "Jessica Martinez",
          company: "Trendy Retail Group",
          role: "VP of People Operations",
          avatar: "JM",
        },
        {
          quote:
            "The shift scheduling system cut our overtime costs by 15%. Employees love the self-service portal for requesting time-off.",
          author: "David Kim",
          company: "Fashion Forward Stores",
          role: "HR Director",
          avatar: "DK",
        },
        {
          quote:
            "Integration with our POS was seamless. Time tracking is now 100% accurate—no guesswork, no disputes.",
          author: "Amanda Foster",
          company: "Urban Outfitters DC",
          role: "Store Manager",
          avatar: "AF",
        },
      ]}
      ctaHeading="Scale Retail HR Effortlessly"
      ctaDescription="Stop wrestling with spreadsheets and manual payroll. CircleWorks handles multi-location complexity so you can grow your business."
    />
  );
}
