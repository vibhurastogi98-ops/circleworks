export type WebinarTopic = "Payroll" | "Compliance" | "HR" | "HR Tips" | "Product Demo";

export type Webinar = {
  id: string;
  slug: string;
  title: string;
  description: string;
  date: string;
  timezone: string;
  timezoneName: string;
  durationMinutes: number;
  speaker: string;
  speakerTitle: string;
  topics: WebinarTopic[];
  featuredTags: string[];
  type: "upcoming" | "ondemand";
  thumbnail: string;
  videoUrl?: string;
};

export const FEATURED_WEBINAR_TAGS = [
  "2026 Payroll Updates",
  "Year-End Guide",
  "State Compliance",
  "New Features",
];

export const WEBINARS: Webinar[] = [
  {
    id: "payroll-updates-2026",
    slug: "2026-payroll-updates",
    title: "2026 Payroll Compliance Updates",
    description:
      "A practical briefing on 2026 payroll thresholds, year-end filing deadlines, multi-state withholding changes, and the controls finance teams should have in place before the first payroll run of the year.",
    date: "2026-06-11T18:00:00.000Z",
    timezone: "America/New_York",
    timezoneName: "ET",
    durationMinutes: 45,
    speaker: "Sarah Jenkins",
    speakerTitle: "Head of Compliance",
    topics: ["Payroll", "Compliance"],
    featuredTags: ["2026 Payroll Updates", "Year-End Guide"],
    type: "upcoming",
    thumbnail:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&q=80",
  },
  {
    id: "product-demo-payroll-hr",
    slug: "product-demo-payroll-hr",
    title: "Live Product Demo: Payroll and HR in One Flow",
    description:
      "See how CircleWorks connects payroll, onboarding, time, benefits, and compliance workflows in one operating system for growing teams.",
    date: "2026-06-24T17:00:00.000Z",
    timezone: "America/New_York",
    timezoneName: "ET",
    durationMinutes: 30,
    speaker: "David Chen",
    speakerTitle: "VP of Product",
    topics: ["HR", "Product Demo"],
    featuredTags: ["New Features"],
    type: "upcoming",
    thumbnail:
      "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&q=80",
  },
  {
    id: "state-compliance-live",
    slug: "state-compliance-hiring-playbook",
    title: "State Compliance Hiring Playbook",
    description:
      "A state-by-state operating session for hiring across borders, including tax registrations, local leave rules, final pay timing, and poster requirements.",
    date: "2026-07-09T16:00:00.000Z",
    timezone: "America/New_York",
    timezoneName: "ET",
    durationMinutes: 60,
    speaker: "Priya Nair",
    speakerTitle: "Senior Payroll Counsel",
    topics: ["Compliance", "HR"],
    featuredTags: ["State Compliance"],
    type: "upcoming",
    thumbnail:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&q=80",
  },
  {
    id: "year-end-checklist-2025",
    slug: "year-end-payroll-checklist",
    title: "The Ultimate Year-End Payroll Checklist",
    description:
      "A step-by-step walkthrough of W-2s, 1099s, final adjustments, benefit deductions, and reconciliation checks for a clean year-end close.",
    date: "2025-12-10T20:00:00.000Z",
    timezone: "America/New_York",
    timezoneName: "ET",
    durationMinutes: 50,
    speaker: "Michael Rivera",
    speakerTitle: "Payroll Operations Lead",
    topics: ["Payroll", "HR Tips"],
    featuredTags: ["Year-End Guide"],
    type: "ondemand",
    thumbnail:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&q=80",
    videoUrl: "https://player.vimeo.com/video/76979871",
  },
  {
    id: "multi-state-compliance-deep-dive",
    slug: "multi-state-compliance-deep-dive",
    title: "Multi-State Compliance Deep Dive",
    description:
      "Learn how to stay compliant in all 50 states, from payroll tax registration and nexus triggers to location-specific labor rules.",
    date: "2025-10-05T17:00:00.000Z",
    timezone: "America/New_York",
    timezoneName: "ET",
    durationMinutes: 60,
    speaker: "Sarah Jenkins",
    speakerTitle: "Head of Compliance",
    topics: ["Compliance"],
    featuredTags: ["State Compliance"],
    type: "ondemand",
    thumbnail:
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&q=80",
    videoUrl: "https://fast.wistia.net/embed/iframe/5wrdzcmj90",
  },
  {
    id: "new-features-spring-2026",
    slug: "new-features-spring-2026",
    title: "New Features: Payroll Controls and Employee Self-Service",
    description:
      "A guided tour of new CircleWorks controls for approval routing, employee profile updates, payroll previews, and compliance alerts.",
    date: "2026-04-16T17:00:00.000Z",
    timezone: "America/New_York",
    timezoneName: "ET",
    durationMinutes: 36,
    speaker: "David Chen",
    speakerTitle: "VP of Product",
    topics: ["Product Demo", "HR Tips"],
    featuredTags: ["New Features"],
    type: "ondemand",
    thumbnail:
      "https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&q=80",
    videoUrl: "https://player.vimeo.com/video/22439234",
  },
];

export function getWebinarBySlug(slug: string) {
  return WEBINARS.find((webinar) => webinar.slug === slug);
}

export function getWebinarEndDate(webinar: Webinar) {
  return new Date(new Date(webinar.date).getTime() + webinar.durationMinutes * 60_000);
}

export function formatWebinarDateTime(webinar: Webinar) {
  const formatted = new Intl.DateTimeFormat("en-US", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: webinar.timezone,
  }).format(new Date(webinar.date));

  return `${formatted} ${webinar.timezoneName}`;
}

function escapeIcsText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}

function formatIcsDate(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function buildWebinarIcs(webinar: Webinar) {
  const start = new Date(webinar.date);
  const end = getWebinarEndDate(webinar);
  const url = `https://circleworks.com/webinars/${webinar.slug}`;

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//CircleWorks//Webinars//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${webinar.id}@circleworks.com`,
    `DTSTAMP:${formatIcsDate(new Date())}`,
    `DTSTART:${formatIcsDate(start)}`,
    `DTEND:${formatIcsDate(end)}`,
    `SUMMARY:${escapeIcsText(webinar.title)}`,
    `DESCRIPTION:${escapeIcsText(webinar.description)}`,
    `LOCATION:${escapeIcsText("Online")}`,
    `URL:${url}`,
    "ORGANIZER;CN=CircleWorks:mailto:webinars@circleworks.com",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
