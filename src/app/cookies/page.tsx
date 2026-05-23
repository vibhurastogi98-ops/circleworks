import type { Metadata } from "next";

import LegalPageLayout from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "CircleWorks Cookie Policy and cookie inventory.",
};

export default function CookiesPage() {
  return (
    <LegalPageLayout
      contentFile="cookies.mdx"
      eyebrow="Cookie Policy"
      title="Cookie Policy"
      description="A short guide to the cookies CircleWorks uses, why they exist, and how long they remain."
      sidebarTitle="Cookie Topics"
    />
  );
}
