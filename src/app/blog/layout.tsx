import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HR & Payroll Blog — Tips & Guides | CircleWorks",
  description: "Expert payroll, HR, and compliance guides for US businesses. Stay updated on tax changes, hiring tips, and HR best practices.",
  openGraph: {
    title: "HR & Payroll Blog — Tips & Guides | CircleWorks",
    description: "Expert payroll, HR, and compliance guides for US businesses. Stay updated on tax changes, hiring tips, and HR best practices.",
    url: "https://circleworks.vercel.app/blog",
  },
  alternates: {
    canonical: "https://circleworks.vercel.app/blog",
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
