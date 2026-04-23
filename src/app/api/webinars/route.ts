import { NextResponse } from "next/server";

export const WEBINARS = [
  {
    id: "w1",
    slug: "2026-payroll-updates",
    title: "2026 Payroll Compliance Updates",
    description: "Learn about the new tax brackets, multi-state compliance laws, and how CircleWorks automates year-end filing. Join our experts to ensure your business is ready for the new fiscal year.",
    date: "2026-05-15T14:00:00Z",
    duration: "45 min",
    speaker: "Sarah Jenkins, Head of Compliance",
    topics: ["Payroll", "Compliance"],
    type: "upcoming",
    thumbnail: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80",
    videoUrl: "",
  },
  {
    id: "w2",
    slug: "mastering-hr-automation",
    title: "Mastering HR Automation for Startups",
    description: "Discover how to put your onboarding, offboarding, and benefits administration on autopilot. We'll show you how to save 10+ hours a week on manual HR tasks.",
    date: "2026-06-02T10:00:00Z",
    duration: "60 min",
    speaker: "David Chen, VP of Product",
    topics: ["HR", "Product Demo"],
    type: "upcoming",
    thumbnail: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80",
    videoUrl: "",
  },
  {
    id: "w3",
    slug: "year-end-checklist-2025",
    title: "The Ultimate Year-End Payroll Checklist",
    description: "Our comprehensive guide to closing out the year without pulling your hair out. A step-by-step walkthrough of W-2s, 1099s, and final adjustments.",
    date: "2025-12-10T15:00:00Z",
    duration: "50 min",
    speaker: "Michael Scott, Payroll Specialist",
    topics: ["Payroll", "HR Tips"],
    type: "ondemand",
    thumbnail: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80",
    videoUrl: "https://player.vimeo.com/video/123456789",
  },
  {
    id: "w4",
    slug: "state-compliance-deep-dive",
    title: "Multi-State Compliance Deep Dive",
    description: "Hiring across borders? Learn exactly what you need to do to stay compliant in all 50 states, from tax registration to local labor laws.",
    date: "2025-10-05T13:00:00Z",
    duration: "60 min",
    speaker: "Sarah Jenkins, Head of Compliance",
    topics: ["Compliance"],
    type: "ondemand",
    thumbnail: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80",
    videoUrl: "https://player.vimeo.com/video/987654321",
  }
];

export async function GET() {
  return NextResponse.json({ webinars: WEBINARS });
}
