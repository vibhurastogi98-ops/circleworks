import { Metadata } from "next";
import SolutionPageTemplate from "@/components/SolutionPageTemplate";

export const metadata: Metadata = {
  title: "Cost Optimization for Payroll & HR | CircleWorks",
  description:
    "CircleWorks helps companies reduce labor costs by 20-30% through smart payroll automation, overtime control, and benefits optimization.",
  keywords: ["reduce labor costs", "payroll savings", "HR cost optimization", "ROI calculator", "payroll efficiency"],
  openGraph: {
    title: "Cost Optimization for Payroll & HR | CircleWorks",
    description: "Reduce labor costs and HR overhead with automated payroll and intelligent workforce management.",
    type: "website",
  },
};

export default function CostOptimizationPage() {
  return (
    <SolutionPageTemplate
      title="Cost Optimization Through Smart HR"
      subtitle="Labor costs are often the biggest line item. CircleWorks helps companies save 20-30% through payroll automation, overtime control, benefits optimization, and intelligent workforce analytics."
      breadcrumbLabel="Cost Optimization"
      heroGradient="from-yellow-400 via-orange-400 to-red-400"
      heroEmoji="💰"
      problems={[
        {
          icon: "💸",
          title: "Uncontrolled Labor Costs",
          description: "Unexpected overtime, wage compliance, and inefficient scheduling dramatically impact the bottom line.",
        },
        {
          icon: "🏢",
          title: "HR Overhead",
          description: "Manual payroll, benefits admin, and compliance work ties up expensive resources and creates bottlenecks.",
        },
        {
          icon: "📊",
          title: "Lack of Visibility",
          description: "Without real-time insights into labor costs, utilization, and workforce composition, you can't optimize.",
        },
      ]}
      solutionIntro="CircleWorks delivers measurable ROI through payroll automation, intelligent scheduling, overtime prevention, and workforce analytics that uncover hidden cost reduction opportunities."
      solutionPoints={[
        "Automated payroll reduces processing time by 95% and cuts manual work",
        "Smart scheduling algorithms predict and prevent overtime before it happens",
        "Real-time labor cost dashboards for visibility and control",
        "Benefits optimization recommendations based on utilization and demographics",
        "Automated compliance reduces penalty risk and legal exposure",
        "Advanced analytics identify efficiency improvements and cost saving opportunities",
      ]}
      features={[
        {
          icon: "⏱️",
          title: "Automated Payroll",
          description: "Process payroll in minutes instead of days. Eliminate manual data entry and reduce administrative overhead.",
        },
        {
          icon: "📅",
          title: "Smart Scheduling",
          description: "Predictive scheduling algorithms that minimize overtime and optimize labor utilization.",
        },
        {
          icon: "💡",
          title: "Overtime Prevention",
          description: "Real-time alerts and proactive scheduling to control unplanned overtime before it impacts budget.",
        },
        {
          icon: "🏥",
          title: "Benefits Optimization",
          description: "Analyze utilization and recommend plan changes that reduce costs while maintaining employee satisfaction.",
        },
        {
          icon: "📊",
          title: "Labor Analytics",
          description: "Deep-dive analytics showing labor cost trends, utilization by department, and cost-saving opportunities.",
        },
        {
          icon: "💼",
          title: "Workforce Insights",
          description: "Identify high-cost areas, benchmark against industry standards, and find hidden savings opportunities.",
        },
      ]}
      useCaseSteps={[
        {
          number: "1",
          title: "Baseline",
          description: "Understand your current labor costs, breakdown by department, and opportunities for savings.",
          icon: "📈",
        },
        {
          number: "2",
          title: "Automate",
          description: "Implement payroll automation and smart tools to eliminate waste and control costs.",
          icon: "⚙️",
        },
        {
          number: "3",
          title: "Optimize",
          description: "Use analytics to identify trends, prevent overtime, and optimize benefits and scheduling.",
          icon: "🎯",
        },
        {
          number: "4",
          title: "Save",
          description: "Measure and realize 20-30% cost savings while improving employee experience and satisfaction.",
          icon: "💰",
        },
      ]}
      benefits={[
        {
          metric: "25-30%",
          description: "Average reduction in total labor costs",
          icon: "📉",
        },
        {
          metric: "95%",
          description: "Faster payroll processing time",
          icon: "⚡",
        },
        {
          metric: "$250K",
          description: "Median annual savings for mid-size companies",
          icon: "💵",
        },
        {
          metric: "20+",
          description: "Hours saved per month by HR team",
          icon: "⏱️",
        },
      ]}
      testimonials={[
        {
          quote:
            "CircleWorks' overtime prevention and smart scheduling cut our labor costs by 18% in the first year. Just the payroll automation paid for itself.",
          author: "Michelle Robinson",
          company: "Peak Operations LLC",
          role: "Operations Director",
          avatar: "MR",
        },
        {
          quote:
            "We were shocked at how much overtime was hidden in our payroll. The real-time monitoring prevents it now and saved us $85K first year.",
          author: "David Santos",
          company: "Logistics Plus Inc",
          role: "Finance Manager",
          avatar: "DS",
        },
        {
          quote:
            "The benefits optimization analysis showed we were overspending on health plans. Consolidated plans and saved 12% while employees actually got better options.",
          author: "Natalie Park",
          company: "Healthcare Staffing Solutions",
          role: "HR Director",
          avatar: "NP",
        },
      ]}
      ctaHeading="Unlock Your Cost Savings Today"
      ctaDescription="See how much you could save. Use our free ROI calculator to estimate your cost reduction potential, then start optimizing."
    />
  );
}
