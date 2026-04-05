import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "CircleWorks HR & Payroll dashboard — manage employees, payroll, compliance and more.",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
