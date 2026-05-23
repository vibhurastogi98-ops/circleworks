import type { Metadata } from "next";

import LegalPageLayout from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "CircleWorks Terms of Service.",
};

export default function TermsPage() {
  return (
    <LegalPageLayout
      contentFile="terms.mdx"
      eyebrow="Terms of Service"
      title="Terms of Service"
      description="The rules and responsibilities for using CircleWorks payroll, HR, benefits, time, and reporting services."
    />
  );
}
