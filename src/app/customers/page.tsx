import type { Metadata } from "next";
import CustomersPageClient from "./CustomersPageClient";

export const metadata: Metadata = {
  title: "Customer Stories | CircleWorks",
  description:
    "See how 5,000+ US companies use CircleWorks to run payroll, HR, benefits, and compliance.",
};

export default function CustomersPage() {
  return <CustomersPageClient />;
}
