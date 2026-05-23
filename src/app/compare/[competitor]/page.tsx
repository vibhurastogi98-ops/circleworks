import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Fragment } from "react";
import {
  ArrowRight,
  ArrowRightLeft,
  Check,
  Info,
  Minus,
  X,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const dynamicParams = false;

const SITE_URL = "https://circleworks.com";
const LAST_UPDATED = "May 23, 2026";
const EMPLOYEE_COUNTS = [10, 25, 50, 100] as const;

const COMPETITORS = [
  "gusto",
  "rippling",
  "adp",
  "paychex",
  "paycom",
  "bamboohr",
] as const;

type Competitor = (typeof COMPETITORS)[number];
type FeatureValue = boolean | string;

type Feature = {
  name: string;
  circleworks: FeatureValue;
  competitor: FeatureValue;
};

type FeatureGroup = {
  group: string;
  features: Feature[];
};

type CompetitorData = {
  name: string;
  slug: Competitor;
  strength: string;
  verdict: string;
  metaDescription: string;
  pricingIntro: string;
  competitorPricingLabel: string;
  hiddenFees: string[];
  pricingRows: Record<(typeof EMPLOYEE_COUNTS)[number], string>;
  pricingNotes: Record<(typeof EMPLOYEE_COUNTS)[number], string>;
  featureGroups: FeatureGroup[];
  faqs: Array<{
    question: string;
    answer: string;
  }>;
};

const circleworksCost = (employees: number) => `$${20 + employees * 6}/mo`;

const baseFeatureGroups = (
  competitorName: string,
  overrides: Partial<Record<string, FeatureValue>>,
): FeatureGroup[] => {
  const groupDefinitions: Array<{
    group: string;
    features: Array<[string, FeatureValue]>;
  }> = [
    {
      group: "Payroll",
      features: [
        ["Automated payroll runs", true],
        ["Federal, state, and local tax filings", true],
        ["Multi-state payroll", true],
        ["Contractor payments and 1099s", true],
      ],
    },
    {
      group: "HRIS",
      features: [
        ["Employee profiles and directory", true],
        ["Documents and e-signatures", true],
        ["Custom fields and approval workflows", true],
        ["Org chart and employee self-service", true],
      ],
    },
    {
      group: "ATS",
      features: [
        ["Job posts and applicant pipeline", true],
        ["Interview scheduling", true],
        ["Offer letters and onboarding handoff", true],
      ],
    },
    {
      group: "Time",
      features: [
        ["Time tracking and timesheets", true],
        ["PTO policies and approvals", true],
        ["Overtime alerts", true],
      ],
    },
    {
      group: "Benefits",
      features: [
        ["Medical, dental, and vision benefits", true],
        ["401(k), HSA, and FSA administration", true],
        ["COBRA and workers' comp workflows", true],
      ],
    },
    {
      group: "Automation",
      features: [
        ["Workflow automation builder", true],
        ["Onboarding and offboarding automations", true],
        ["Accounting, Slack, and Google sync", true],
      ],
    },
    {
      group: "Pricing",
      features: [
        ["Published monthly pricing", true],
        ["No implementation fee", true],
        ["Month-to-month availability", true],
      ],
    },
    {
      group: "Support",
      features: [
        ["Migration support", true],
        ["Payroll specialist access", true],
        ["Priority support for every plan", true],
      ],
    },
  ];

  return groupDefinitions.map(({ group, features }) => ({
    group,
    features: features.map(([name, defaultValue]) => {
      const competitor = overrides[name] ?? defaultValue;

      return {
        name,
        circleworks: true,
        competitor:
          competitor === true ? `Included with ${competitorName}` : competitor,
      };
    }),
  }));
};

const competitorData: Record<Competitor, CompetitorData> = {
  gusto: {
    name: "Gusto",
    slug: "gusto",
    strength: "simple payroll, benefits setup, and very small business onboarding",
    verdict:
      "Choose CircleWorks when payroll needs to sit next to HRIS, ATS, time, benefits, and automation without jumping tiers for everyday workflows.",
    metaDescription:
      "Compare CircleWorks vs Gusto for payroll, HRIS, ATS, time, benefits, automation, pricing, support, migration, and hidden fees.",
    pricingIntro:
      "Gusto is transparent at the entry tier, but teams often move to Plus or Premium for multi-state payroll, time tracking, hiring tools, and deeper HR support.",
    competitorPricingLabel: "Gusto entry / comparable plan",
    hiddenFees: [
      "Multi-state payroll, time tracking, PTO, and hiring tools typically require the Plus tier.",
      "Dedicated support, compliance alerts, and HR experts sit on higher tiers.",
      "Broker integration and certain benefits services can add per-employee costs.",
    ],
    pricingRows: {
      10: "$109/mo entry or $200/mo comparable",
      25: "$199/mo entry or $380/mo comparable",
      50: "$349/mo entry or $680/mo comparable",
      100: "$649/mo entry or $1,280/mo comparable",
    },
    pricingNotes: {
      10: "Entry plan excludes several workflows agencies usually need.",
      25: "Comparable plan assumes Plus for multi-state and time.",
      50: "Premium support and compliance features increase the gap.",
      100: "Costs scale quickly when HR support and add-ons matter.",
    },
    featureGroups: baseFeatureGroups("Gusto", {
      "Federal, state, and local tax filings": "Single-state on entry plan",
      "Multi-state payroll": "Plus tier",
      "Custom fields and approval workflows": "Limited",
      "Job posts and applicant pipeline": "Plus tier",
      "Interview scheduling": "Plus tier",
      "Time tracking and timesheets": "Plus tier",
      "Overtime alerts": "Limited",
      "COBRA and workers' comp workflows": "Partner/add-on dependent",
      "Workflow automation builder": "Limited",
      "Published monthly pricing": true,
      "No implementation fee": true,
      "Month-to-month availability": true,
      "Priority support for every plan": "Premium tier",
    }),
    faqs: [
      {
        question: "Is CircleWorks better than Gusto?",
        answer:
          "CircleWorks is better for agencies, creators, and startups that want payroll, HRIS, ATS, time, benefits, and automation in one operating system. Gusto is strongest for very small teams that mainly need simple payroll and basic benefits.",
      },
      {
        question: "How do I switch from Gusto to CircleWorks?",
        answer:
          "CircleWorks imports employee profiles, payroll settings, tax details, documents, PTO balances, and historical payroll exports from Gusto. The onboarding team validates the first payroll in parallel before you fully switch.",
      },
      {
        question: "Does CircleWorks include time tracking without a higher tier?",
        answer:
          "Yes. CircleWorks includes time tracking, timesheets, PTO, overtime alerts, and payroll sync in the core platform instead of requiring a higher payroll bundle.",
      },
      {
        question: "What Gusto fees should I compare closely?",
        answer:
          "Look at tier upgrades for multi-state payroll, time tracking, hiring, compliance alerts, dedicated support, and broker-connected benefits before comparing total monthly cost.",
      },
    ],
  },
  rippling: {
    name: "Rippling",
    slug: "rippling",
    strength: "IT management, device management, app access, and complex enterprise operations",
    verdict:
      "Choose CircleWorks when you want HR and payroll depth without buying a broad IT and finance platform module by module.",
    metaDescription:
      "Compare CircleWorks vs Rippling for HR, payroll, ATS, time, benefits, automation, pricing modules, support, migration, and hidden fees.",
    pricingIntro:
      "Rippling uses modular pricing around a required platform. Payroll, benefits, time, recruiting, finance, and IT modules can change the quote materially.",
    competitorPricingLabel: "Rippling platform-plus estimate",
    hiddenFees: [
      "Core platform is required before add-on products.",
      "Payroll, benefits, recruiting, time, device, and finance modules are commonly priced separately.",
      "Some modules may include a monthly base fee in addition to per-employee pricing.",
    ],
    pricingRows: {
      10: "$115+/mo before payroll modules",
      25: "$235+/mo before payroll modules",
      50: "$435+/mo before payroll modules",
      100: "$835+/mo before payroll modules",
    },
    pricingNotes: {
      10: "Assumes platform-plus-user entry pricing only.",
      25: "Payroll, benefits, time, and ATS can move this into quote territory.",
      50: "Module count becomes the real driver.",
      100: "Enterprise controls and IT features often change the package.",
    },
    featureGroups: baseFeatureGroups("Rippling", {
      "Automated payroll runs": "Payroll module",
      "Federal, state, and local tax filings": "Payroll module",
      "Multi-state payroll": "Payroll module",
      "Contractor payments and 1099s": "Payroll module",
      "Job posts and applicant pipeline": "Recruiting module",
      "Interview scheduling": "Recruiting module",
      "Offer letters and onboarding handoff": "Recruiting module",
      "Time tracking and timesheets": "Time module",
      "PTO policies and approvals": "Included/module dependent",
      "Medical, dental, and vision benefits": "Benefits module",
      "401(k), HSA, and FSA administration": "Benefits/add-on dependent",
      "COBRA and workers' comp workflows": "Add-on dependent",
      "Workflow automation builder": "Higher package/add-on",
      "Published monthly pricing": false,
      "No implementation fee": "Quote dependent",
      "Month-to-month availability": "Contract dependent",
      "Priority support for every plan": "Package dependent",
    }),
    faqs: [
      {
        question: "Is CircleWorks better than Rippling?",
        answer:
          "CircleWorks is better for teams that want a focused HR, payroll, ATS, time, and benefits platform with straightforward pricing. Rippling is strongest when IT, device provisioning, app access, and finance workflows are as important as HR.",
      },
      {
        question: "How do I switch from Rippling to CircleWorks?",
        answer:
          "CircleWorks maps Rippling employee records, payroll configuration, benefits data, time policies, documents, and workflow rules into a cleaner HR and payroll setup. Migration support includes validation and parallel payroll review.",
      },
      {
        question: "Why can Rippling pricing be hard to compare?",
        answer:
          "Rippling pricing depends on the platform tier and the modules you add. A team comparing HR and payroll should price payroll, benefits, time, recruiting, workflows, and support together before deciding.",
      },
      {
        question: "Does CircleWorks replace Rippling IT features?",
        answer:
          "No. CircleWorks focuses on payroll, HR, time, hiring, benefits, compliance, and automation. If device management and app provisioning are the main requirement, Rippling may be the better fit.",
      },
    ],
  },
  adp: {
    name: "ADP",
    slug: "adp",
    strength: "legacy payroll compliance, broad service coverage, and large-company payroll operations",
    verdict:
      "Choose CircleWorks when you want modern payroll and HR workflows without quote-only packaging, legacy UI friction, or separate add-ons for everyday team operations.",
    metaDescription:
      "Compare CircleWorks vs ADP for payroll, HRIS, ATS, time, benefits, automation, pricing, support, migration, and hidden fees.",
    pricingIntro:
      "ADP packages vary by RUN tier, Workforce Now configuration, add-ons, pay frequency, and negotiated quote. Published package pages generally point buyers to sales for pricing.",
    competitorPricingLabel: "ADP quote-based plan",
    hiddenFees: [
      "Payroll package, pay frequency, and add-on modules can change monthly cost.",
      "Timekeeping, hiring, HR support, garnishment, posters, and integrations may require higher packages or add-ons.",
      "Year-end, correction, implementation, or per-run fees may appear depending on contract and package.",
    ],
    pricingRows: {
      10: "Quote required",
      25: "Quote required",
      50: "Quote required",
      100: "Quote required",
    },
    pricingNotes: {
      10: "RUN package and pay frequency affect quote.",
      25: "HR and time modules can raise cost.",
      50: "May shift from RUN-style package to mid-market configuration.",
      100: "Workforce Now-style pricing is usually custom.",
    },
    featureGroups: baseFeatureGroups("ADP", {
      "Automated payroll runs": true,
      "Federal, state, and local tax filings": true,
      "Multi-state payroll": "Higher package/configuration",
      "Documents and e-signatures": "Package dependent",
      "Custom fields and approval workflows": "Higher package",
      "Job posts and applicant pipeline": "Add-on/package dependent",
      "Interview scheduling": "Add-on/package dependent",
      "Time tracking and timesheets": "Timekeeping add-on",
      "Overtime alerts": "Timekeeping add-on",
      "Medical, dental, and vision benefits": "Add-on/service dependent",
      "401(k), HSA, and FSA administration": "Add-on/service dependent",
      "COBRA and workers' comp workflows": "Add-on/service dependent",
      "Workflow automation builder": "Limited/custom",
      "Published monthly pricing": false,
      "No implementation fee": "Contract dependent",
      "Month-to-month availability": "Contract dependent",
      "Priority support for every plan": "Package dependent",
    }),
    faqs: [
      {
        question: "Is CircleWorks better than ADP?",
        answer:
          "CircleWorks is better for agencies, creators, and startups under 500 employees that want a modern HR and payroll product with transparent pricing. ADP is strongest for companies that prioritize legacy payroll breadth and large-enterprise service coverage.",
      },
      {
        question: "How do I switch from ADP to CircleWorks?",
        answer:
          "CircleWorks imports employee data, payroll history, tax setup, direct deposit details, PTO balances, and documents from ADP exports. The migration team verifies payroll calculations before the first live run.",
      },
      {
        question: "Will CircleWorks handle multi-state payroll like ADP?",
        answer:
          "Yes. CircleWorks supports multi-state payroll, tax setup, filings, employee self-service, and payroll reporting for distributed U.S. teams.",
      },
      {
        question: "What ADP fees should I ask about?",
        answer:
          "Ask about pay-run pricing, implementation, year-end forms, timekeeping, HR support, recruiting, garnishments, integrations, and contract commitments before comparing against CircleWorks.",
      },
    ],
  },
  paychex: {
    name: "Paychex",
    slug: "paychex",
    strength: "traditional payroll service, tax administration, and hands-on payroll support",
    verdict:
      "Choose CircleWorks when you need payroll plus connected hiring, HR, time, benefits, and automations in a modern product your team can use daily.",
    metaDescription:
      "Compare CircleWorks vs Paychex for payroll, HRIS, ATS, time, benefits, automation, pricing, support, migration, and hidden fees.",
    pricingIntro:
      "Paychex packages are commonly quote-based. The right comparison depends on payroll package, HR tools, time tracking, benefits, integrations, and support model.",
    competitorPricingLabel: "Paychex quote-based plan",
    hiddenFees: [
      "Most Paychex Flex packages request pricing through sales.",
      "Time and attendance, HR services, benefits, workers' comp, and integrations can be add-ons.",
      "Implementation, year-end forms, and service extras may vary by plan and contract.",
    ],
    pricingRows: {
      10: "Quote required",
      25: "Quote required",
      50: "Quote required",
      100: "Quote required",
    },
    pricingNotes: {
      10: "Select package, payroll frequency, and add-ons drive quote.",
      25: "HR and time modules often matter at this size.",
      50: "Benefits and compliance services can change total cost.",
      100: "Mid-market service configuration is usually custom.",
    },
    featureGroups: baseFeatureGroups("Paychex", {
      "Automated payroll runs": true,
      "Federal, state, and local tax filings": true,
      "Multi-state payroll": true,
      "Documents and e-signatures": "Package dependent",
      "Custom fields and approval workflows": "Limited/package dependent",
      "Job posts and applicant pipeline": "Add-on/package dependent",
      "Interview scheduling": "Add-on/package dependent",
      "Time tracking and timesheets": "Add-on",
      "Overtime alerts": "Add-on",
      "Medical, dental, and vision benefits": "Service/add-on dependent",
      "401(k), HSA, and FSA administration": "Service/add-on dependent",
      "COBRA and workers' comp workflows": "Service/add-on dependent",
      "Workflow automation builder": "Limited",
      "Published monthly pricing": false,
      "No implementation fee": "Contract dependent",
      "Month-to-month availability": "Contract dependent",
      "Priority support for every plan": "Package dependent",
    }),
    faqs: [
      {
        question: "Is CircleWorks better than Paychex?",
        answer:
          "CircleWorks is better for teams that want a modern all-in-one HR and payroll workspace with transparent pricing and built-in workflows. Paychex is strongest for traditional payroll service and companies that want a long-established provider.",
      },
      {
        question: "How do I switch from Paychex to CircleWorks?",
        answer:
          "CircleWorks uses Paychex exports to migrate employees, payroll settings, tax details, pay history, documents, and PTO balances. The onboarding team runs checks before the first live payroll.",
      },
      {
        question: "Does CircleWorks include time and attendance?",
        answer:
          "Yes. CircleWorks includes time tracking, scheduling, PTO, overtime alerts, and payroll sync as part of the core product experience.",
      },
      {
        question: "What Paychex fees should I compare?",
        answer:
          "Compare payroll package fees, implementation, year-end forms, time and attendance, HR services, benefits administration, workers' comp, and integration costs.",
      },
    ],
  },
  paycom: {
    name: "Paycom",
    slug: "paycom",
    strength: "enterprise single-database HCM, employee self-service, and talent management depth",
    verdict:
      "Choose CircleWorks when you want the unified feel of a single HR and payroll system without enterprise contracts, sales-led pricing, or a heavyweight implementation.",
    metaDescription:
      "Compare CircleWorks vs Paycom for payroll, HRIS, ATS, time, benefits, automation, pricing, support, migration, and hidden fees.",
    pricingIntro:
      "Paycom pricing is quote-based and commonly shaped by employee count, payroll frequency, modules, implementation, and service scope.",
    competitorPricingLabel: "Paycom quote-based plan",
    hiddenFees: [
      "Public pricing is not published; buyers need a sales quote.",
      "Implementation, setup, pay frequency, and module scope can change total cost.",
      "Talent, time, benefits, expense, and automation modules should be priced together.",
    ],
    pricingRows: {
      10: "Quote required",
      25: "Quote required",
      50: "Quote required",
      100: "Quote required",
    },
    pricingNotes: {
      10: "Often harder to justify for smaller teams.",
      25: "Implementation and module scope matter.",
      50: "Full HCM quote can replace multiple systems but raises commitment.",
      100: "Enterprise-style rollout and contract terms become central.",
    },
    featureGroups: baseFeatureGroups("Paycom", {
      "Automated payroll runs": true,
      "Federal, state, and local tax filings": true,
      "Multi-state payroll": true,
      "Employee profiles and directory": true,
      "Documents and e-signatures": true,
      "Custom fields and approval workflows": true,
      "Job posts and applicant pipeline": true,
      "Interview scheduling": true,
      "Offer letters and onboarding handoff": true,
      "Time tracking and timesheets": true,
      "PTO policies and approvals": true,
      "Overtime alerts": true,
      "Medical, dental, and vision benefits": true,
      "401(k), HSA, and FSA administration": "Service dependent",
      "COBRA and workers' comp workflows": "Service dependent",
      "Workflow automation builder": "Advanced package",
      "Published monthly pricing": false,
      "No implementation fee": "Quote dependent",
      "Month-to-month availability": "Contract dependent",
      "Priority support for every plan": "Service model dependent",
    }),
    faqs: [
      {
        question: "Is CircleWorks better than Paycom?",
        answer:
          "CircleWorks is better for agencies, creators, and startups under 500 employees that want a lighter, transparent, all-in-one platform. Paycom is strongest for larger organizations that want enterprise HCM depth and can absorb a bigger implementation.",
      },
      {
        question: "How do I switch from Paycom to CircleWorks?",
        answer:
          "CircleWorks imports employee records, payroll history, tax details, job and compensation data, documents, time policies, and benefits data from Paycom exports. Migration includes data validation and payroll testing.",
      },
      {
        question: "Can CircleWorks support employee self-service?",
        answer:
          "Yes. Employees can update personal details, view paystubs, submit time, request PTO, complete onboarding, access documents, and manage core HR tasks in CircleWorks.",
      },
      {
        question: "What Paycom fees should I ask about?",
        answer:
          "Ask about setup, implementation, pay frequency, module-level pricing, minimum contract terms, support scope, and the cost of adding time, benefits, talent, and automation tools.",
      },
    ],
  },
  bamboohr: {
    name: "BambooHR",
    slug: "bamboohr",
    strength: "core HR, employee records, performance management, and employee experience",
    verdict:
      "Choose CircleWorks when payroll is not an afterthought and you want HR, payroll, time, ATS, benefits, and automations working from the same source of truth.",
    metaDescription:
      "Compare CircleWorks vs BambooHR for HRIS, payroll, ATS, time, benefits, automation, pricing, support, migration, and hidden fees.",
    pricingIntro:
      "BambooHR is quote-based and positions payroll, benefits, time tracking, and performance as add-on solutions depending on package and company needs.",
    competitorPricingLabel: "BambooHR quote-based plan",
    hiddenFees: [
      "Payroll is an add-on, not the default center of the product.",
      "Benefits administration, time tracking, and performance can be separate add-on solutions.",
      "Pricing changes with headcount, selected package, add-ons, and implementation scope.",
    ],
    pricingRows: {
      10: "Quote required",
      25: "Quote required",
      50: "Quote required",
      100: "Quote required",
    },
    pricingNotes: {
      10: "Core HR may be enough, but payroll changes the comparison.",
      25: "Add payroll and time before comparing total platform cost.",
      50: "Performance, benefits, and payroll add-ons become more relevant.",
      100: "Discounting may apply, but total add-on scope drives price.",
    },
    featureGroups: baseFeatureGroups("BambooHR", {
      "Automated payroll runs": "Payroll add-on",
      "Federal, state, and local tax filings": "Payroll add-on",
      "Multi-state payroll": "Payroll add-on",
      "Contractor payments and 1099s": "Payroll add-on/partner dependent",
      "Employee profiles and directory": true,
      "Documents and e-signatures": true,
      "Custom fields and approval workflows": true,
      "Org chart and employee self-service": true,
      "Job posts and applicant pipeline": true,
      "Interview scheduling": true,
      "Offer letters and onboarding handoff": true,
      "Time tracking and timesheets": "Time add-on",
      "PTO policies and approvals": true,
      "Overtime alerts": "Time add-on",
      "Medical, dental, and vision benefits": "Benefits add-on",
      "401(k), HSA, and FSA administration": "Benefits/add-on dependent",
      "COBRA and workers' comp workflows": "Add-on/partner dependent",
      "Workflow automation builder": "Limited",
      "Accounting, Slack, and Google sync": "Integrations",
      "Published monthly pricing": false,
      "No implementation fee": "Quote dependent",
      "Month-to-month availability": "Contract dependent",
      "Priority support for every plan": "Package dependent",
    }),
    faqs: [
      {
        question: "Is CircleWorks better than BambooHR?",
        answer:
          "CircleWorks is better when payroll, time, benefits, and hiring need to be first-class workflows inside the same system. BambooHR is strongest as a core HR and employee experience platform.",
      },
      {
        question: "How do I switch from BambooHR to CircleWorks?",
        answer:
          "CircleWorks migrates BambooHR employee profiles, documents, job data, PTO balances, onboarding records, and HR fields, then connects payroll and benefits so you do not need separate add-on workflows.",
      },
      {
        question: "Does CircleWorks include payroll by default?",
        answer:
          "Yes. CircleWorks was built around payroll, tax setup, direct deposit, HRIS, time, benefits, and compliance workflows together.",
      },
      {
        question: "What BambooHR fees should I compare?",
        answer:
          "Compare the base HR package plus payroll, time tracking, benefits administration, performance management, implementation, and any integration costs.",
      },
    ],
  },
};

// App Router equivalent of getStaticPaths for /compare/[competitor].
export function generateStaticParams() {
  return COMPETITORS.map((competitor) => ({ competitor }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ competitor: string }>;
}): Promise<Metadata> {
  const { competitor } = await params;
  const data = competitorData[competitor as Competitor];

  if (!data) {
    return {
      title: "CircleWorks Comparison",
      description:
        "Compare CircleWorks against payroll and HR software alternatives.",
    };
  }

  const title = `CircleWorks vs ${data.name}: Side-by-Side Comparison`;

  return {
    title,
    description: data.metaDescription,
    alternates: {
      canonical: `${SITE_URL}/compare/${data.slug}`,
    },
    openGraph: {
      title,
      description: data.metaDescription,
      url: `${SITE_URL}/compare/${data.slug}`,
      type: "article",
    },
  };
}

function Status({ value, highlighted = false }: { value: FeatureValue; highlighted?: boolean }) {
  if (value === true) {
    return (
      <span
        className={`inline-flex items-center gap-2 font-bold ${
          highlighted ? "text-blue-700" : "text-slate-700"
        }`}
      >
        <span
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
            highlighted ? "bg-blue-100" : "bg-slate-100"
          }`}
        >
          <Check className="h-4 w-4" />
        </span>
        Included
      </span>
    );
  }

  if (value === false) {
    return (
      <span className="inline-flex items-center gap-2 font-semibold text-slate-400">
        <X className="h-5 w-5" />
        Not included
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-2 font-semibold ${
        highlighted ? "text-blue-700" : "text-slate-600"
      }`}
    >
      <Minus className="h-5 w-5 shrink-0" />
      {value}
    </span>
  );
}

export default async function ComparePage({
  params,
}: {
  params: Promise<{ competitor: string }>;
}) {
  const { competitor } = await params;
  const data = competitorData[competitor as Competitor];

  if (!data) {
    notFound();
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: data.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <main className="min-h-screen bg-white font-sans selection:bg-blue-200 selection:text-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Navbar />

      <section className="relative overflow-hidden border-b border-slate-800 bg-[#0A1628] px-4 pb-16 pt-32 text-center sm:px-6 lg:px-8 lg:pb-24 lg:pt-44">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-blue-500/20 blur-[120px]" />
        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-4 py-2 text-sm font-bold text-blue-200">
            <span className="h-2 w-2 rounded-full bg-blue-300" />
            Last updated: {LAST_UPDATED}
          </div>

          <h1 className="max-w-5xl text-4xl font-black leading-[1.08] tracking-tight text-white md:text-6xl lg:text-7xl">
            CircleWorks vs {data.name}: Side-by-Side Comparison
          </h1>

          <p className="mt-6 max-w-3xl text-lg font-medium leading-8 text-slate-300">
            {data.verdict}
          </p>

          <div className="mt-10 grid w-full max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-white/5 text-left shadow-2xl backdrop-blur md:grid-cols-2">
            <div className="border-b border-white/10 bg-blue-500/10 p-6 md:border-b-0 md:border-r md:p-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-400/20 text-blue-200">
                <Check className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-black text-white">
                CircleWorks is best for:
              </h2>
              <p className="mt-3 text-base font-medium leading-7 text-blue-50">
                Agencies, creators, startups {"<500 employees"}
              </p>
            </div>
            <div className="p-6 md:p-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-slate-300">
                <Info className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-black text-white">
                {data.name} is best for:
              </h2>
              <p className="mt-3 text-base font-medium leading-7 text-slate-300">
                {data.strength}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="mb-10 max-w-3xl">
          <p className="text-sm font-black uppercase tracking-widest text-blue-600">
            Feature Comparison Table
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0A1628] md:text-5xl">
            Feature by feature, not bundle by bundle.
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            CircleWorks highlights the core workflows modern teams expect in one
            platform. The {data.name} column reflects common packaging, add-on,
            and quote-based limitations buyers should validate.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse text-left">
              <thead>
                <tr>
                  <th className="w-1/3 border-b border-slate-200 bg-slate-50 p-5 text-sm font-black uppercase tracking-wider text-slate-500">
                    Feature
                  </th>
                  <th className="w-1/3 border-x border-blue-100 border-b bg-blue-50 p-5 text-xl font-black text-blue-700">
                    CircleWorks
                  </th>
                  <th className="w-1/3 border-b border-slate-200 bg-slate-50 p-5 text-xl font-black text-[#0A1628]">
                    {data.name}
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.featureGroups.map((group) => (
                  <Fragment key={group.group}>
                    <tr>
                      <td
                        colSpan={3}
                        className="border-y border-slate-200 bg-slate-100 px-5 py-3 text-sm font-black uppercase tracking-widest text-slate-700"
                      >
                        {group.group}
                      </td>
                    </tr>
                    {group.features.map((feature) => (
                      <tr
                        key={`${group.group}-${feature.name}`}
                        className="border-b border-slate-100 last:border-b-0"
                      >
                        <td className="p-5 align-top text-base font-bold text-[#0A1628]">
                          {feature.name}
                        </td>
                        <td className="border-x border-blue-100 bg-blue-50/70 p-5 align-top">
                          <Status value={feature.circleworks} highlighted />
                        </td>
                        <td className="p-5 align-top">
                          <Status value={feature.competitor} />
                        </td>
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 max-w-3xl">
            <p className="text-sm font-black uppercase tracking-widest text-blue-600">
              Pricing Comparison
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0A1628] md:text-5xl">
              Monthly cost at 10, 25, 50, and 100 employees.
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              {data.pricingIntro}
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <div className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
              <div className="border-b border-blue-100 bg-blue-50 p-6">
                <h3 className="text-2xl font-black text-blue-700">
                  CircleWorks
                </h3>
                <p className="mt-2 font-semibold text-blue-900">
                  $20/mo base + $6 per employee, core platform included.
                </p>
              </div>
              <div className="divide-y divide-slate-100">
                {EMPLOYEE_COUNTS.map((employees) => (
                  <div
                    key={employees}
                    className="grid grid-cols-[1fr_auto] gap-4 p-5"
                  >
                    <span className="font-bold text-slate-600">
                      {employees} employees
                    </span>
                    <span className="text-xl font-black text-[#0A1628]">
                      {circleworksCost(employees)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 bg-slate-100 p-6">
                <h3 className="text-2xl font-black text-[#0A1628]">
                  {data.name}
                </h3>
                <p className="mt-2 font-semibold text-slate-600">
                  {data.competitorPricingLabel}
                </p>
              </div>
              <div className="divide-y divide-slate-100">
                {EMPLOYEE_COUNTS.map((employees) => (
                  <div key={employees} className="p-5">
                    <div className="grid grid-cols-[1fr_auto] gap-4">
                      <span className="font-bold text-slate-600">
                        {employees} employees
                      </span>
                      <span className="text-right text-lg font-black text-[#0A1628]">
                        {data.pricingRows[employees]}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-medium text-slate-500">
                      {data.pricingNotes[employees]}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start">
              <Info className="h-6 w-6 shrink-0 text-amber-700" />
              <div>
                <h3 className="text-lg font-black text-amber-950">
                  Hidden fees and quote items to ask {data.name} about
                </h3>
                <ul className="mt-3 grid gap-2 text-sm font-semibold leading-6 text-amber-900 md:grid-cols-3">
                  {data.hiddenFees.map((fee) => (
                    <li key={fee}>{fee}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#0A1628] px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-24">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-full max-w-4xl -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-[100px]" />
        <div className="relative z-10 mx-auto max-w-4xl">
          <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full border border-blue-400/30 bg-blue-400/20 text-blue-200">
            <ArrowRightLeft className="h-8 w-8" />
          </div>
          <h2 className="text-3xl font-black tracking-tight text-white md:text-5xl">
            Switching from {data.name}? We make it easy.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg font-medium leading-8 text-slate-300">
            We import your employees, documents, payroll history, tax settings,
            benefits data, and workflows, then validate everything before your
            first live payroll.
          </p>
          <Link
            href="/switch"
            className="mt-10 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-lg font-black text-[#0A1628] shadow-lg transition hover:bg-slate-100"
          >
            Start Your Migration
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="mb-10 text-center">
          <p className="text-sm font-black uppercase tracking-widest text-blue-600">
            Competitor FAQ
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0A1628] md:text-5xl">
            Questions about CircleWorks vs {data.name}
          </h2>
        </div>

        <div className="space-y-4">
          {data.faqs.map((faq) => (
            <article
              key={faq.question}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h3 className="text-xl font-black text-[#0A1628]">
                {faq.question}
              </h3>
              <p className="mt-3 text-base font-medium leading-7 text-slate-600">
                {faq.answer}
              </p>
            </article>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
