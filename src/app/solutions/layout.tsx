import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payroll & HR Solutions | CircleWorks",
  description:
    "Explore CircleWorks solutions tailored to your industry and business needs. From tech companies to healthcare, retail to professional services, we have the right payroll and HR solution for you.",
  keywords: [
    "payroll solutions",
    "HR solutions",
    "industry-specific payroll",
    "scaling payroll",
    "compliance payroll",
    "remote team payroll",
  ],
  openGraph: {
    title: "Payroll & HR Solutions | CircleWorks",
    description:
      "Find the CircleWorks solution that fits your business. Tailored for every industry and use case.",
    type: "website",
  },
};

export default function SolutionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
