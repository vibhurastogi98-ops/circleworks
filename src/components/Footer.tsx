import React from "react";
import Link from "next/link";
import {
  Building2,
  CheckCircle,
  FileCheck,
  Globe,
  Lock,
  ShieldCheck,
} from "lucide-react";

const FOOTER_LINKS = {
  product: [
    { label: "Payroll", href: "/product/payroll" },
    { label: "HRIS", href: "/product/hris" },
    { label: "ATS", href: "/product/ats" },
    { label: "Benefits", href: "/product/benefits" },
    { label: "Time", href: "/product/time" },
    { label: "Expenses", href: "/product/expenses" },
    { label: "Performance", href: "/product/performance" },
    { label: "Compliance", href: "/product/compliance" },
    { label: "Analytics", href: "/product/analytics" },
  ],
  resources: [
    { label: "Blog", href: "/blog" },
    { label: "HR Guides", href: "/guides" },
    { label: "Glossary", href: "/blog/labor-law-dictionary" },
    { label: "Webinars", href: "/webinars" },
    { label: "Templates", href: "/templates" },
    { label: "Changelog", href: "/changelog" },
    { label: "Status", href: "/status" },
    { label: "API Docs", href: "/docs" },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "Careers", href: "/careers", badge: "Hiring" },
    { label: "Press", href: "/press" },
    { label: "Partners", href: "/partners" },
    { label: "Security", href: "/security" },
    { label: "Trust Center", href: "/trust" },
  ],
  support: [
    { label: "Help Center", href: "/help" },
    { label: "Contact", href: "/contact" },
    { label: "Demo", href: "/demo" },
    { label: "Pricing", href: "/pricing" },
    { label: "Community", href: "/community" },
    { label: "Accountant Portal", href: "/accountant-portal" },
  ],
};

const TRUST_BADGES = [
  { label: "SOC 2 Type II", icon: ShieldCheck },
  { label: "HIPAA", icon: Lock },
  { label: "GDPR", icon: Globe },
  { label: "CCPA", icon: FileCheck },
  { label: "E-Verify", icon: CheckCircle },
  { label: "BBB Accredited", icon: Building2 },
];

function LinkedInIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M4 4l16 16" />
      <path d="M20 4L4 20" />
    </svg>
  );
}

function YouTubeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M2.5 7.1s-.2-1.7.6-2.5c.9-.9 2-.9 2.5-1 3.2-.2 6.4-.2 6.4-.2s3.2 0 6.4.2c.5.1 1.6.1 2.5 1 .8.8 1 2.5 1 2.5s.2 2 .2 4v1.8c0 2-.2 4-.2 4s-.2 1.7-1 2.5c-.9.9-2.1.9-2.6 1-2.8.2-6.5.2-6.5.2s-3.2 0-6.4-.2c-.5-.1-1.6-.1-2.5-1-.8-.8-1-2.5-1-2.5s-.2-2-.2-4V9.1c0-2 .2-4 .2-4z" />
      <path d="M9.6 15.4L15.8 12 9.6 8.6v6.8z" />
    </svg>
  );
}

function GitHubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

const SOCIAL_LINKS = [
  { label: "LinkedIn", href: "https://linkedin.com", icon: LinkedInIcon },
  { label: "Twitter(X)", href: "https://twitter.com", icon: XIcon },
  { label: "YouTube", href: "https://youtube.com", icon: YouTubeIcon },
  { label: "GitHub", href: "https://github.com", icon: GitHubIcon },
];

export function SiteFooter() {
  return (
    <footer className="bg-[#0A1628] text-slate-400 pt-16 pb-8 border-t border-slate-700">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
        {/* TOP ROW: Logo/Tagline & Email Capture */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-16 pb-12 border-b border-slate-700">
          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 group cursor-pointer inline-flex"
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="16" cy="16" r="14" stroke="white" strokeWidth="3" />
                <path
                  d="M16 8C11.5817 8 8 11.5817 8 16C8 20.4183 11.5817 24 16 24"
                  stroke="#3B82F6"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
              <span className="text-[22px] font-bold text-white tracking-tight">
                Circle<span className="text-blue-500">Works</span>
              </span>
            </Link>
            <p className="text-[15px] text-slate-400 font-medium">
              Payroll & HR. Simplified for America.
            </p>
          </div>

          <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Enter your work email"
              className="px-4 py-3 bg-[#0F1C2E] border border-slate-700/80 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all w-full sm:w-[300px]"
            />
            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors whitespace-nowrap">
              Get HR Insights Free
            </button>
          </div>
        </div>

        {/* 4-COLUMN LINK GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
          {/* Column 1: Product */}
          <div className="flex flex-col gap-4">
            <h3 className="text-white text-[13px] font-bold tracking-widest uppercase mb-2">
              Product
            </h3>
            <ul className="flex flex-col gap-3">
              {FOOTER_LINKS.product.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[15px] text-slate-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Resources */}
          <div className="flex flex-col gap-4">
            <h3 className="text-white text-[13px] font-bold tracking-widest uppercase mb-2">
              Resources
            </h3>
            <ul className="flex flex-col gap-3">
              {FOOTER_LINKS.resources.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[15px] text-slate-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Company */}
          <div className="flex flex-col gap-4">
            <h3 className="text-white text-[13px] font-bold tracking-widest uppercase mb-2">
              Company
            </h3>
            <ul className="flex flex-col gap-3">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[15px] text-slate-400 hover:text-white transition-colors flex items-center gap-2"
                  >
                    {link.label}
                    {link.badge && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-emerald-400 border border-emerald-500/30 bg-emerald-500/10">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Support */}
          <div className="flex flex-col gap-4">
            <h3 className="text-white text-[13px] font-bold tracking-widest uppercase mb-2">
              Support
            </h3>
            <ul className="flex flex-col gap-3">
              {FOOTER_LINKS.support.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[15px] text-slate-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* TRUST BADGES ROW */}
        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 mb-16 opacity-70">
          {TRUST_BADGES.map((badge) => (
            <div
              key={badge.label}
              className="flex items-center gap-2 text-white/90 hover:text-white transition-colors cursor-default"
            >
              <badge.icon size={18} />
              <span className="text-[13px] font-bold tracking-wide">
                {badge.label}
              </span>
            </div>
          ))}
        </div>

        {/* BOTTOM BAR */}
        <div className="pt-8 border-t border-slate-700 flex flex-col gap-6">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 text-[13px] font-medium">
              <span>Copyright 2025 CircleWorks Inc.</span>
              <span className="hidden sm:inline text-slate-600">&middot;</span>
              <Link
                href="/legal/privacy"
                className="hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
              <span className="hidden sm:inline text-slate-600">&middot;</span>
              <Link
                href="/legal/terms"
                className="hover:text-white transition-colors"
              >
                Terms of Service
              </Link>
              <span className="hidden sm:inline text-slate-600">&middot;</span>
              <button className="hover:text-white transition-colors">
                Cookie Settings
              </button>
            </div>

            <div className="flex items-center gap-4">
              {SOCIAL_LINKS.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  className="text-slate-500 hover:text-white transition-colors"
                  aria-label={social.label}
                >
                  <social.icon width={20} height={20} />
                </Link>
              ))}
            </div>
          </div>

          {/* VERY BOTTOM: Educational Info */}
          <div className="text-center lg:text-left text-[11px] text-slate-500">
            CircleWorks is not a law firm. Information provided is for
            educational purposes only.
          </div>
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;
