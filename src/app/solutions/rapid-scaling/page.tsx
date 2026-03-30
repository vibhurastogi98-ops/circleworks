import { Metadata } from "next";
import SolutionPageTemplate from "@/components/SolutionPageTemplate";

export const metadata: Metadata = {
  title: "Payroll & HR for Rapid Scaling Companies | CircleWorks",
  description:
    "CircleWorks enables rapid hiring and scaling with automated onboarding, payroll, and HR management. Hire 100 people without breaking processes.",
  keywords: ["scaling payroll", "rapid hiring automation", "growth HR", "scaling compliance", "startup payroll"],
  openGraph: {
    title: "Payroll & HR for Rapid Scaling Companies | CircleWorks",
    description: "Payroll and HR platform built for fast-growing companies that need to scale without breaking.",
    type: "website",
  },
};

export default function RapidScalingPage() {
  return (
    <SolutionPageTemplate
      title="Payroll & HR for Rapid Scaling"
      subtitle="Growing companies can't afford to slow down. CircleWorks automates hiring, onboarding, payroll, and HR so you can scale from 10 to 1,000 people without building an internal infrastructure."
      breadcrumbLabel="Rapid Scaling"
      heroGradient="from-orange-400 via-amber-400 to-yellow-300"
      heroEmoji="📈"
      problems={[
        {
          icon: "🔥",
          title: "Breakneck Hiring Pace",
          description: "Scaling 10+ hires per month creates chaos. Manual onboarding, offer letters, and benefits enrollment become the bottleneck.",
        },
        {
          icon: "⚙️",
          title: "Process Breakdown",
          description: "Spreadsheets and disconnected tools don't scale. You need native integration between hiring, onboarding, payroll, and HR.",
        },
        {
          icon: "⚠️",
          title: "Compliance Gaps",
          description: "Rapid growth increases compliance risk. Missing I-9 verification, tax registration, or benefits setup creates liability.",
        },
      ]}
      solutionIntro="CircleWorks is built for scale-ups. From first hire to 1,000-person company, our unified platform automates every step of employee lifecycle management, keeping your processes scalable."
      solutionPoints={[
        "Automated offer letter generation and e-signature workflows",
        "Streamlined I-9, W-4, and onboarding document collection",
        "One-click payroll setup for new employees with zero manual data entry",
        "Instant benefits enrollment with automated plan provisioning",
        "Automated compliance checklist for each new hire",
        "Employee self-service portal so new hires complete their own setup",
      ]}
      features={[
        {
          icon: "📝",
          title: "Offer & Onboarding",
          description: "Automated offer letters, e-signatures, I-9 verification, and document collection in one flow.",
        },
        {
          icon: "🚀",
          title: "Self-Service Setup",
          description: "New employees complete their own W-4s, direct deposit, and emergency contact info through the mobile portal.",
        },
        {
          icon: "💰",
          title: "Instant Payroll",
          description: "New hires are ready for first payroll in minutes. No manual setup or data entry required.",
        },
        {
          icon: "🏥",
          title: "Benefits Onboarding",
          description: "Guided benefits enrollment with automatic provisioning to health plans, 401(k), FSA, and other carriers.",
        },
        {
          icon: "🔔",
          title: "Compliance Tracking",
          description: "Automated checklists ensure nothing is missed. Alerts for upcoming deadlines and required actions.",
        },
        {
          icon: "📊",
          title: "Scaling Analytics",
          description: "Track headcount growth, hiring velocity, time-to-productivity, and other key metrics as you scale.",
        },
      ]}
      useCaseSteps={[
        {
          number: "1",
          title: "Hire",
          description: "Generate offer letters and send for e-signature. All done within CircleWorks.",
          icon: "📋",
        },
        {
          number: "2",
          title: "Onboard",
          description: "New employees complete onboarding through the mobile app. I-9, W-4, tax forms all automated.",
          icon: "📱",
        },
        {
          number: "3",
          title: "Enroll",
          description: "Benefits options, plan comparisons, and enrollment all self-service and instant.",
          icon: "🏥",
        },
        {
          number: "4",
          title: "Pay",
          description: "First paycheck processed on time with zero manual work from your HR team.",
          icon: "💸",
        },
      ]}
      benefits={[
        {
          metric: "8 hrs",
          description: "Time saved per new hire with full automation",
          icon: "⏱️",
        },
        {
          metric: "100%",
          description: "Compliance coverage with automated checklists",
          icon: "✅",
        },
        {
          metric: "90%+",
          description: "Employee self-service completion rate",
          icon: "📱",
        },
        {
          metric: "$500K",
          description: "Potential savings at 100+ hires per year",
          icon: "💰",
        },
      ]}
      testimonials={[
        {
          quote:
            "We were hiring 50+ people per month and drowning in onboarding overhead. CircleWorks cut that completely. Candidates onboard themselves.",
          author: "Jennifer Chang",
          company: "VentureTech Ventures",
          role: "VP of People",
          avatar: "JC",
        },
        {
          quote:
            "The jump from 50 to 500 employees didn't break our payroll process because CircleWorks handles it. This platform grows with us.",
          author: "Alex Novak",
          company: "Scaling Systems Inc",
          role: "Founder & CEO",
          avatar: "AN",
        },
        {
          quote:
            "No more bottleneck at HR during hiring season. Everything is automated and our new employees are set up in minutes.",
          author: "Priya Gupta",
          company: "Growth Analytics Co",
          role: "Operations Manager",
          avatar: "PG",
        },
      ]}
      ctaHeading="Ready to Scale Without Breaking?"
      ctaDescription="Automate hiring, onboarding, and payroll as you grow. CircleWorks scales with you from startup to scale-up to enterprise."
    />
  );
}
