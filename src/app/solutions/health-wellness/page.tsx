import { Metadata } from "next";
import SolutionPageTemplate from "@/components/SolutionPageTemplate";

export const metadata: Metadata = {
  title: "Payroll & HR for Health & Wellness Companies | CircleWorks",
  description:
    "CircleWorks simplifies payroll and HR for healthcare, fitness, and wellness providers. Manage hourly staff, scheduling, and HIPAA compliance in one platform.",
  keywords: ["payroll for healthcare", "HR platform for wellness", "medical office payroll", "HIPAA compliant HR", "healthcare scheduling"],
  openGraph: {
    title: "Payroll & HR for Health & Wellness Companies | CircleWorks",
    description: "Healthcare-focused payroll, HIPAA-compliant HR, and automated scheduling.",
    type: "website",
  },
};

export default function HealthWellnessPage() {
  return (
    <SolutionPageTemplate
      title="Payroll & HR for Health & Wellness"
      subtitle="Healthcare, fitness, and wellness companies need specialized HR solutions. CircleWorks delivers HIPAA compliance, shift scheduling, and hourly payroll automation."
      breadcrumbLabel="Health & Wellness"
      heroGradient="from-green-400 via-emerald-400 to-teal-300"
      heroEmoji="⚕️"
      problems={[
        {
          icon: "👩‍⚕️",
          title: "Hourly Workforce Complexity",
          description: "Managing shifts, overtime, and scheduling for doctors, nurses, and support staff requires specialized tools beyond basic payroll.",
        },
        {
          icon: "🛡️",
          title: "HIPAA & Privacy Headaches",
          description: "Healthcare employers must maintain HIPAA compliance, secure employee records, and handle sensitive health information carefully.",
        },
        {
          icon: "📋",
          title: "License & Credential Tracking",
          description: "Medical professionals require ongoing license verification, CEU tracking, and compliance documentation for renewals.",
        },
      ]}
      solutionIntro="CircleWorks is built with healthcare compliance in mind. Our platform handles HIPAA requirements, shift-based payroll, and specialized reporting for health and wellness organizations."
      solutionPoints={[
        "HIPAA-compliant secure document storage and employee records",
        "Real-time shift scheduling with overtime alerts and automatic calculations",
        "Specialized Time & Attendance tracking for healthcare workflows",
        "License and credential expiration tracking and automatic reminders",
        "Multi-location payroll management for clinics, hospitals, and practices",
        "State-specific healthcare labor law compliance and prevailing wage support",
      ]}
      features={[
        {
          icon: "⏱️",
          title: "Shift Scheduling",
          description: "Create schedules, swap shifts, manage time-off requests, and track attendance in one place.",
        },
        {
          icon: "💉",
          title: "License Management",
          description: "Track professional licenses, certifications, CEU requirements, and automatic renewal reminders.",
        },
        {
          icon: "💸",
          title: "Hourly Payroll",
          description: "Automatic overtime calculation, prevailing wage support, and shift differentials.",
        },
        {
          icon: "🛡️",
          title: "HIPAA Compliance",
          description: "Encrypted records, audit trails, and secure document workflows for healthcare data.",
        },
        {
          icon: "📍",
          title: "Multi-Location Support",
          description: "Manage staff, payroll, and compliance across multiple clinics, offices, or facilities.",
        },
        {
          icon: "📊",
          title: "Benefits Administration",
          description: "ACA compliance, health plan enrollment, and benefits tracking for healthcare employees.",
        },
      ]}
      useCaseSteps={[
        {
          number: "1",
          title: "Onboard",
          description: "Import staff and verify licenses. Set up schedules and compliance requirements.",
          icon: "📝",
        },
        {
          number: "2",
          title: "Schedule",
          description: "Create shifts, manage time-off, and track attendance with real-time updates.",
          icon: "📅",
        },
        {
          number: "3",
          title: "Pay",
          description: "Auto-calculate overtime, shift differentials, and specialized compensation.",
          icon: "💰",
        },
        {
          number: "4",
          title: "Comply",
          description: "Stay HIPAA-ready with automated license tracking and regulatory updates.",
          icon: "✅",
        },
      ]}
      benefits={[
        {
          metric: "40%",
          description: "Reduction in scheduling time with automated tools",
          icon: "⏱️",
        },
        {
          metric: "99.9%",
          description: "Uptime for HIPAA-compliant secure storage",
          icon: "🛡️",
        },
        {
          metric: "$15K",
          description: "Average savings on compliance risk and penalties",
          icon: "💵",
        },
        {
          metric: "50+",
          description: "Health & Wellness providers in our community",
          icon: "👨‍⚕️",
        },
      ]}
      testimonials={[
        {
          quote:
            "CircleWorks handles all our HIPAA requirements without the headache. Our patient data is secure and our payroll runs flawlessly.",
          author: "Dr. James Patterson",
          company: "Midwest Family Clinic",
          role: "Clinic Director",
          avatar: "JP",
        },
        {
          quote:
            "The shift scheduling and automated overtime calculation saves our office manager 10 hours per week. A game-changer for our practice.",
          author: "Nina Patel",
          company: "Urban Wellness Collective",
          role: "Operations Manager",
          avatar: "NP",
        },
        {
          quote:
            "License tracking across all our nurses keeps us compliant and organized. No more lost certifications or compliance surprises.",
          author: "Robert Lee",
          company: "Capital Health Systems",
          role: "HR Manager",
          avatar: "RL",
        },
      ]}
      ctaHeading="Transform Wellness HR Today"
      ctaDescription="Let CircleWorks handle the complexity of healthcare payroll and HR. HIPAA-ready, fully compliant, and built for your team."
    />
  );
}
