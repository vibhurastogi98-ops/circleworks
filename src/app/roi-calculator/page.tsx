import type { Metadata } from "next";
import ROICalculatorClient from "./ROICalculatorClient";

export const metadata: Metadata = {
  title: "ROI Calculator",
  description:
    "Calculate how much CircleWorks can save by replacing disconnected payroll, HRIS, ATS, benefits, and manual HR admin workflows.",
  alternates: {
    canonical: "https://circleworks.com/roi-calculator",
  },
  openGraph: {
    title: "CircleWorks ROI Calculator",
    description:
      "Enter your HR stack and team size to see estimated monthly savings, time saved, and efficiency gains.",
    url: "https://circleworks.com/roi-calculator",
  },
};

export default function ROICalculatorPage() {
  return <ROICalculatorClient />;
}
