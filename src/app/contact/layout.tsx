import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact CircleWorks — Sales & Support",
  description: "Get in touch with CircleWorks. Talk to sales, book a demo, or reach our support team — we're here to help your US company.",
  openGraph: {
    title: "Contact CircleWorks — Sales & Support",
    description: "Get in touch with CircleWorks. Talk to sales, book a demo, or reach our support team — we're here to help your US company.",
    url: "https://circleworks.vercel.app/contact",
  },
  alternates: {
    canonical: "https://circleworks.vercel.app/contact",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
