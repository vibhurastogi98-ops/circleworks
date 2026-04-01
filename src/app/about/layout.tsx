import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About CircleWorks — Payroll & HR Built for America",
  description: "Learn how CircleWorks is simplifying payroll and HR for 5,000+ US companies. Our mission: run payroll the American way.",
  openGraph: {
    title: "About CircleWorks — Payroll & HR Built for America",
    description: "Learn how CircleWorks is simplifying payroll and HR for 5,000+ US companies. Our mission: run payroll the American way.",
    url: "https://circleworks.vercel.app/about",
  },
  alternates: {
    canonical: "https://circleworks.vercel.app/about",
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
