import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Check,
  CreditCard,
  ExternalLink,
  FileCheck,
  FileText,
  Globe,
  Heart,
  Landmark,
  Link2,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { generateSlug, integrations } from "@/data/integrations";
import type { Integration } from "@/data/integrations";

const SITE_URL = "https://circleworks.com";

const integrationIcons: Record<string, LucideIcon> = {
  QuickBooks: Landmark,
  Slack: MessageSquare,
  Okta: ShieldCheck,
  Xero: Landmark,
  "Google Workspace": Globe,
  "Microsoft Teams": MessageSquare,
  "Guideline 401(k)": Heart,
  "Human Interest": Heart,
  Brex: CreditCard,
  Ramp: CreditCard,
  Greenhouse: Activity,
  Lever: Activity,
  Checkr: FileCheck,
  Gusto: Zap,
  SimplyInsured: ShieldCheck,
  DocuSign: FileText,
};

const slugAliases: Record<string, string> = {
  guideline: "guideline-401-k",
  google: "google-workspace",
};

function findIntegration(slug: string) {
  const normalizedSlug = slugAliases[slug] ?? slug;
  return integrations.find((integration) => generateSlug(integration.name) === normalizedSlug);
}

function getRelatedIntegrations(integration: Integration) {
  const sameCategory = integrations.filter((item) => item.id !== integration.id && item.cat === integration.cat);
  const others = integrations.filter((item) => item.id !== integration.id && item.cat !== integration.cat);
  return [...sameCategory, ...others].slice(0, 4);
}

function IntegrationLogo({ integration, className = "h-24 w-24" }: { integration: Integration; className?: string }) {
  const Icon = integrationIcons[integration.name] ?? Zap;

  return (
    <div
      className={`${className} flex shrink-0 items-center justify-center rounded-[1.75rem] border border-white/20 text-white shadow-xl`}
      style={{ backgroundColor: integration.color }}
      aria-hidden="true"
    >
      <Icon className="h-10 w-10" strokeWidth={2.4} />
    </div>
  );
}

function CircleWorksLogo() {
  return (
    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[1.75rem] border border-white/10 bg-[#061122] text-white shadow-xl" aria-hidden="true">
      <span className="text-2xl font-black tracking-tight">CW</span>
    </div>
  );
}

function SetupScreenshot({ integration, step, index }: { integration: Integration; step: string; index: number }) {
  const labels = ["Integration library", "Secure authorization", "Field mapping", "Sync monitor"];

  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-slate-950 p-3 shadow-xl shadow-slate-900/10">
      <div className="rounded-[1.1rem] bg-white p-4">
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-300" />
            <span className="h-3 w-3 rounded-full bg-amber-300" />
            <span className="h-3 w-3 rounded-full bg-emerald-300" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Screenshot {index + 1}</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-[0.75fr_1fr]">
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="mb-4 flex items-center gap-3">
              <IntegrationLogo integration={integration} className="h-12 w-12 rounded-2xl" />
              <div>
                <div className="h-2.5 w-24 rounded-full bg-slate-300" />
                <div className="mt-2 h-2 w-16 rounded-full bg-slate-200" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-2 rounded-full bg-slate-200" />
              <div className="h-2 w-4/5 rounded-full bg-slate-200" />
              <div className="h-2 w-3/5 rounded-full bg-slate-200" />
            </div>
          </div>
          <div className="rounded-2xl border border-slate-100 p-4">
            <div className="mb-3 inline-flex rounded-full bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-blue-700">
              {labels[index] ?? "Setup"}
            </div>
            <p className="text-sm font-bold leading-relaxed text-slate-700">{step}</p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[0, 1, 2].map((item) => (
                <div key={item} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <div className="mb-2 h-2 w-8 rounded-full bg-slate-300" />
                  <div className="h-7 rounded-lg bg-white" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const integration = findIntegration(slug);

  if (!integration) {
    return {
      title: "Integration not found | CircleWorks",
    };
  }

  const canonicalPath = `/integrations/${generateSlug(integration.name)}`;

  return {
    title: `${integration.name} Integration | CircleWorks`,
    description: integration.desc,
    alternates: {
      canonical: `${SITE_URL}${canonicalPath}`,
    },
    openGraph: {
      title: `${integration.name} Integration | CircleWorks`,
      description: integration.desc,
      url: `${SITE_URL}${canonicalPath}`,
      type: "website",
    },
  };
}

export async function generateStaticParams() {
  return integrations.map((integration) => ({
    slug: generateSlug(integration.name),
  }));
}

export default async function IntegrationDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const integration = findIntegration(slug);

  if (!integration) {
    notFound();
  }

  const relatedIntegrations = getRelatedIntegrations(integration);

  return (
    <main className="min-h-screen bg-slate-50 font-sans selection:bg-cyan-200 selection:text-[#061122]">
      <Navbar forceLight />

      <section className="pt-28 pb-16 lg:pt-36">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link href="/integrations" className="mb-8 inline-flex items-center gap-2 text-sm font-black text-slate-500 transition hover:text-blue-600">
            <ArrowLeft className="h-4 w-4" />
            Back to integrations
          </Link>

          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch">
            <div className="rounded-[2.25rem] bg-[#061122] p-8 text-white shadow-2xl shadow-slate-900/20 lg:p-10">
              <div className="mb-10 inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-cyan-100">
                Official partner integration
              </div>
              <div className="flex flex-wrap items-center gap-5">
                <IntegrationLogo integration={integration} />
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/10 text-cyan-100">
                  <Link2 className="h-5 w-5" />
                </div>
                <CircleWorksLogo />
              </div>
              <div className="mt-10 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/15 px-4 py-2 text-sm font-black text-emerald-200 ring-1 ring-emerald-300/20">
                  <span className="h-2 w-2 rounded-full bg-emerald-300" />
                  Connected
                </span>
                <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-black text-slate-200 ring-1 ring-white/10">
                  {integration.cat}
                </span>
              </div>
            </div>

            <div className="rounded-[2.25rem] border border-slate-200 bg-white p-8 shadow-sm lg:p-10">
              <p className="text-sm font-black uppercase tracking-[0.24em] text-blue-600">{integration.cat}</p>
              <h1 className="mt-4 text-4xl font-black leading-tight tracking-tight text-[#061122] md:text-5xl">
                Connect CircleWorks and {integration.name}
              </h1>
              <p className="mt-6 text-lg font-medium leading-relaxed text-slate-600">
                {integration.desc}. Use this integration to remove manual handoffs, keep teams aligned, and make payroll changes flow cleanly across your stack.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/signup" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-4 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700">
                  Connect Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/settings/integrations" className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-black text-slate-700 transition hover:border-slate-300 hover:text-[#061122]">
                  Open app settings
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
          <div className="space-y-8">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-black tracking-tight text-[#061122]">Benefits</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {integration.benefits.map((benefit) => (
                  <div key={benefit} className="flex gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <Check className="h-4 w-4" strokeWidth={3} />
                    </div>
                    <p className="text-sm font-bold leading-relaxed text-slate-700">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-black tracking-tight text-[#061122]">Setup steps</h2>
              <div className="mt-8 space-y-8">
                {integration.setupSteps.map((step, index) => (
                  <div key={step} className="grid gap-5 lg:grid-cols-[56px_1fr]">
                    <div className="flex lg:block">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#061122] text-sm font-black text-white shadow-lg shadow-slate-900/15">
                        {index + 1}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-[#061122]">{["Choose integration", "Authorize access", "Map data", "Launch sync"][index] ?? `Step ${index + 1}`}</h3>
                      <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">{step}</p>
                      <div className="mt-5">
                        <SetupScreenshot integration={integration} step={step} index={index} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black tracking-tight text-[#061122]">Requirements</h2>
              <div className="mt-5 space-y-4">
                <div className="flex gap-3 rounded-2xl bg-blue-50 p-4 text-blue-900">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                  <div>
                    <p className="text-sm font-black">{integration.requirements}</p>
                    <p className="mt-1 text-xs font-bold text-blue-700/70">Admin access is required to authorize this connection.</p>
                  </div>
                </div>
                <div className="flex gap-3 rounded-2xl bg-slate-50 p-4 text-slate-700">
                  <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />
                  <div>
                    <p className="text-sm font-black">Average setup: under 5 minutes</p>
                    <p className="mt-1 text-xs font-bold text-slate-500">Most teams complete the first sync during onboarding.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] bg-[#061122] p-6 text-white shadow-xl shadow-slate-900/15">
              <h2 className="text-xl font-black tracking-tight">Ready to connect?</h2>
              <p className="mt-3 text-sm font-medium leading-relaxed text-slate-300">
                Launch the secure setup flow or invite an admin to configure {integration.name} for your workspace.
              </p>
              <Link href="/signup" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-4 text-sm font-black text-[#061122] transition hover:bg-cyan-50">
                Connect Now
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.24em] text-slate-400">Related Integrations</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-[#061122]">Keep building your stack</h2>
            </div>
            <Link href="/integrations" className="inline-flex items-center gap-2 text-sm font-black text-blue-600 hover:text-blue-700">
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {relatedIntegrations.map((related) => (
              <Link
                key={related.id}
                href={`/integrations/${generateSlug(related.name)}`}
                className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-900/10"
              >
                <IntegrationLogo integration={related} className="h-14 w-14 rounded-2xl grayscale transition group-hover:grayscale-0" />
                <h3 className="mt-5 text-lg font-black tracking-tight text-[#061122] group-hover:text-blue-600">{related.name}</h3>
                <p className="mt-2 line-clamp-2 text-sm font-medium leading-relaxed text-slate-500">{related.desc}</p>
                <span className="mt-4 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-600">
                  {related.cat}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.24em] text-blue-600">Developer Platform</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#061122]">Build your own integration</h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/docs" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-4 text-sm font-black text-white transition hover:bg-blue-700">
              API docs
              <ExternalLink className="h-4 w-4" />
            </Link>
            <Link
              href="https://github.com/vibhurastogi98-ops/circleworks"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-black text-slate-700 transition hover:text-[#061122]"
            >
              GitHub
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
