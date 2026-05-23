import type { Metadata } from "next";
import Link from "next/link";

import LegalPageLayout from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "CircleWorks Privacy Policy and data rights information.",
};

export default function PrivacyPage() {
  return (
    <LegalPageLayout
      contentFile="privacy.mdx"
      eyebrow="Privacy Policy"
      title="Privacy Policy"
      description="How CircleWorks collects, uses, shares, protects, and retains personal information."
      sidebarTitle="Privacy Topics"
    >
      <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-4">
        <p className="text-sm font-bold leading-6 text-blue-900">
          California residents can submit CCPA deletion or access requests through our{" "}
          <Link href="/contact?topic=data-subject-request" className="underline underline-offset-4">
            Data Subject Request form
          </Link>
          .
        </p>
      </div>
    </LegalPageLayout>
  );
}
