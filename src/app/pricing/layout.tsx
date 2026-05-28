import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CircleWorks Pricing — Simple Payroll & HR Plans",
  description: "Plans from $8/employee/mo. Full-service payroll, HRIS & benefits for every US company. No setup fees, cancel anytime.",
  openGraph: {
    title: "CircleWorks Pricing — Simple Payroll & HR Plans",
    description: "Plans from $8/employee/mo. Full-service payroll, HRIS & benefits for every US company. No setup fees, cancel anytime.",
    url: "https://circleworks.com/pricing",
  },
  alternates: {
    canonical: "https://circleworks.com/pricing",
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
