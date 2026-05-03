"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Menu,
  X,
  ChevronDown,
  ShieldCheck,
  Star,
  Target,
  Users,
  Zap,
  Briefcase,
  FileCode2,
  BookOpen,
  MessageCircle,
  HelpCircle,
  Activity,
  Globe,
  Heart,
  ShoppingBag,
  Landmark,
  Rocket,
  DollarSign,
  UserPlus,
  Receipt,
  Shield,
  GraduationCap,
  MonitorPlay,
  Clock,
} from "lucide-react";

interface MegaMenuLinkProps {
  href: string;
  icon: React.ElementType;
  label: string;
  desc: string;
  onClick?: () => void;
}

interface MobileAccordionProps {
  label: string;
  children: React.ReactNode;
  activeLabel: string | null;
  setActiveLabel: (label: string | null) => void;
}

const PRODUCT_MENU = {
  platform: [
    { label: "Payroll", desc: "All 50 states, auto tax filing", icon: DollarSign, href: "/product/payroll" },
    { label: "HRIS", desc: "Employee records and org management", icon: Users, href: "/product/hris" },
    { label: "ATS", desc: "Hire faster with smart pipelines", icon: Briefcase, href: "/product/ats" },
    { label: "Onboarding", desc: "Automated Day-1 experience", icon: UserPlus, href: "/product/onboarding" },
    { label: "Benefits", desc: "Health, dental, vision, 401k", icon: Heart, href: "/product/benefits" },
    { label: "Time Tracking", desc: "Project and shift time tracking", icon: Clock, href: "/product/time-tracking" },
    { label: "Expenses", desc: "Automated expense approvals", icon: Receipt, href: "/product/expenses" },
    { label: "Performance", desc: "OKRs, reviews, and growth", icon: Target, href: "/product/performance" },
    { label: "Compliance", desc: "Stay compliant in all 50 states", icon: Shield, href: "/product/compliance" },
  ],
  why: [
    { label: "Customer Stories", desc: "See how companies scale", icon: Star, href: "/customers" },
    { label: "Security", desc: "Bank-level encryption", icon: ShieldCheck, href: "/security" },
    { label: "Integrations", desc: "Connect your tech stack", icon: Zap, href: "/integrations" },
    { label: "Pricing", desc: "Transparent, simple plans", icon: DollarSign, href: "/pricing" },
    { label: "ROI Calculator", desc: "Calculate your savings", icon: Target, href: "/roi-calculator" },
  ],
};

const SOLUTIONS_MENU = {
  sizes: [
    { label: "Startups", desc: "Foundations for growth", icon: Rocket, href: "/solutions/startups" },
    { label: "SMBs", desc: "Streamline your operations", icon: Users, href: "/solutions/smbs" },
    { label: "Mid-Market", desc: "Scale with confidence", icon: Target, href: "/solutions/mid-market" },
    { label: "Enterprise", desc: "Custom configurations", icon: Globe, href: "/solutions/enterprise" },
  ],
  industries: [
    { label: "Tech", desc: "Software and high-growth teams", icon: MonitorPlay, href: "/solutions/tech" },
    { label: "Healthcare", desc: "Providers and care teams", icon: Heart, href: "/solutions/healthcare" },
    { label: "Retail", desc: "Stores and commerce operations", icon: ShoppingBag, href: "/solutions/retail" },
    { label: "Non-Profit", desc: "Mission-driven organizations", icon: Landmark, href: "/solutions/non-profit" },
    { label: "Professional Services", desc: "Agencies and consulting", icon: Briefcase, href: "/solutions/professional-services" },
  ],
};

const INTEGRATIONS_MENU = [
  { label: "QuickBooks", desc: "Sync payroll journal entries", href: "/integrations/quickbooks", icon: Zap },
  { label: "Slack", desc: "Time-off alerts in chat", href: "/integrations/slack", icon: Zap },
  { label: "Okta", desc: "Single sign-on and provisioning", href: "/integrations/okta", icon: Zap },
  { label: "Checkr", desc: "Background screening", href: "/integrations/checkr", icon: Zap },
  { label: "DocuSign", desc: "E-signature workflows", href: "/integrations/docusign", icon: Zap },
  { label: "Guideline", desc: "401(k) and retirement sync", href: "/integrations/guideline", icon: Zap },
  { label: "Xero", desc: "Accounting reconciliation", href: "/integrations/xero", icon: Zap },
  { label: "Google Workspace", desc: "Directory and calendar sync", href: "/integrations/google-workspace", icon: Zap },
];

const RESOURCES_MENU = {
  left: [
    { label: "Blog", desc: "Stories, updates and insights", icon: BookOpen, href: "/blog" },
    { label: "Guides & Templates", desc: "Ready-to-use resources", icon: FileCode2, href: "/guides" },
    { label: "Glossary", desc: "Terms and definitions", icon: GraduationCap, href: "/glossary" },
    { label: "Webinars", desc: "Live and on-demand sessions", icon: MonitorPlay, href: "/webinars" },
    { label: "Compliance Hub", desc: "Guides for workplace compliance", icon: ShieldCheck, href: "/compliance-hub" },
  ],
  right: [
    { label: "Help Center", desc: "Support articles and FAQs", icon: HelpCircle, href: "/help" },
    { label: "API Docs", desc: "Developer reference and guides", icon: FileCode2, href: "/api-docs" },
    { label: "Changelog", desc: "Product updates and releases", icon: Activity, href: "/changelog" },
    { label: "Status Page", desc: "System health and uptime", icon: Globe, href: "/status" },
    { label: "Community", desc: "Customer forums and events", icon: MessageCircle, href: "/community" },
  ],
};

const NAV_ITEMS = [
  { label: "PRODUCT", isMega: true },
  { label: "SOLUTIONS", isMega: true },
  { label: "INTEGRATIONS", isMega: true, singleColumn: true },
  { label: "RESOURCES", isMega: true },
  { label: "PRICING", isMega: false, href: "/pricing" },
];

const MegaMenuLink = ({ href, icon: Icon, label, desc, onClick }: MegaMenuLinkProps) => (
  <Link href={href} onClick={onClick} className="group flex gap-3 p-2 -m-2 rounded-2xl hover:bg-slate-50 transition-colors">
    <div className="flex-shrink-0 mt-0.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
        <Icon size={20} />
      </div>
    </div>
    <div>
      <div className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{label}</div>
      <div className="text-xs text-slate-500">{desc}</div>
    </div>
  </Link>
);

const MobileAccordion = ({ label, children, activeLabel, setActiveLabel }: MobileAccordionProps) => {
  const isOpen = activeLabel === label;

  return (
    <div className="border-b border-slate-200">
      <button
        type="button"
        onClick={() => setActiveLabel(isOpen ? null : label)}
        className="flex w-full items-center justify-between py-4 text-left font-semibold text-slate-900"
        aria-expanded={isOpen}
      >
        {label}
        <ChevronDown className={`h-5 w-5 text-slate-500 transition-transform ${isOpen ? "rotate-180" : "rotate-0"}`} />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function Navbar({ forceLight = false }: { forceLight?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileActiveAccordion, setMobileActiveAccordion] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveMenu(null);
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (mobileOpen && mobileMenuRef.current) {
      document.body.style.overflow = "hidden";
      const focusable = mobileMenuRef.current.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled]), input, select, textarea"
      );
      focusable[0]?.focus();
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const handleMouseEnter = (menuLabel: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (activeMenu) {
      setActiveMenu(menuLabel);
    } else {
      timeoutRef.current = setTimeout(() => setActiveMenu(menuLabel), 200);
    }
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setActiveMenu(null), 200);
  };

  const closeMobile = () => {
    setMobileOpen(false);
    setMobileActiveAccordion(null);
  };

  const isNavWhite = scrolled || forceLight;

  return (
    <>
      <nav
        ref={navRef}
        role="navigation"
        aria-label="Primary navigation"
        className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isNavWhite ? "bg-white shadow-md" : "bg-transparent"
        }`}
        onMouseLeave={handleMouseLeave}
      >
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 lg:px-8 h-[72px]">
          <Link href="/" className="flex items-center gap-3" onClick={() => setActiveMenu(null)}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <circle cx="16" cy="16" r="14" stroke={isNavWhite ? "#0A1628" : "#ffffff"} strokeWidth="3" />
              <path d="M16 8C11.5817 8 8 11.5817 8 16C8 20.4183 11.5817 24 16 24" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <span className={`text-xl font-bold tracking-tight ${isNavWhite ? "text-slate-900" : "text-white"}`}>
              Circle<span className="text-blue-600">Works</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-1 h-full">
            {NAV_ITEMS.map((item) => {
              const isActive = item.href ? pathname === item.href : activeMenu === item.label;
              return (
                <div key={item.label} className="relative" onMouseEnter={() => (item.isMega ? handleMouseEnter(item.label) : handleMouseLeave())}>
                  {item.isMega ? (
                    <button
                      type="button"
                      aria-expanded={activeMenu === item.label}
                      aria-haspopup="menu"
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setActiveMenu(activeMenu === item.label ? null : item.label);
                        }
                      }}
                      className={`flex items-center gap-1 px-4 py-2.5 text-sm font-semibold transition-colors ${
                        isActive ? "text-blue-600" : isNavWhite ? "text-slate-700 hover:text-blue-600" : "text-white/90 hover:text-white"
                      }`}
                    >
                      {item.label}
                      <ChevronDown size={16} className="opacity-70" />
                      {isActive && (
                        <motion.span
                          layoutId="nav-indicator"
                          className="absolute -bottom-[1px] left-4 right-4 h-[3px] rounded-full bg-blue-600"
                        />
                      )}
                    </button>
                  ) : (
                    <Link
                      href={item.href || "#"}
                      className={`relative px-4 py-2.5 text-sm font-semibold transition-colors ${
                        isActive ? "text-blue-600" : isNavWhite ? "text-slate-700 hover:text-blue-600" : "text-white/90 hover:text-white"
                      }`}
                    >
                      {item.label}
                      {isActive && (
                        <motion.span
                          layoutId="nav-indicator"
                          className="absolute -bottom-[1px] left-4 right-4 h-[3px] rounded-full bg-blue-600"
                        />
                      )}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/login"
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                isNavWhite ? "border-slate-200 text-slate-700 hover:border-slate-300 hover:text-blue-600" : "border-white/40 text-white/90 hover:text-white"
              }`}
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 transition-all"
            >
              Start Free
            </Link>
          </div>

          <button
            type="button"
            aria-label="Toggle mobile menu"
            onClick={() => setMobileOpen((value) => !value)}
            className={`lg:hidden p-2 transition-colors ${isNavWhite ? "text-slate-900" : "text-white"}`}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <AnimatePresence>
          {activeMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute inset-x-0 top-full z-40 flex justify-center pointer-events-none"
              onMouseEnter={() => activeMenu && handleMouseEnter(activeMenu)}
              onMouseLeave={handleMouseLeave}
            >
              <div className="pointer-events-auto rounded-3xl border border-slate-200 bg-white shadow-[0_20px_80px_rgba(15,23,42,0.12)] w-full max-w-[640px] overflow-hidden">
                {activeMenu === "PRODUCT" && (
                  <div className="grid grid-cols-2 gap-px bg-slate-200 w-full">
                    <div className="bg-white p-8">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400 mb-5">Platform</p>
                      <div className="space-y-2">
                        {PRODUCT_MENU.platform.map((item) => (
                          <MegaMenuLink key={item.label} {...item} onClick={() => setActiveMenu(null)} />
                        ))}
                      </div>
                    </div>
                    <div className="bg-slate-50 p-8">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400 mb-5">Why CircleWorks</p>
                      <div className="space-y-2">
                        {PRODUCT_MENU.why.map((item) => (
                          <MegaMenuLink key={item.label} {...item} onClick={() => setActiveMenu(null)} />
                        ))}
                      </div>
                    </div>
                    <div className="col-span-2 border-t border-slate-200 bg-white p-4 text-center">
                      <Link
                        href="/product"
                        onClick={() => setActiveMenu(null)}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                      >
                        See all features
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                )}

                {activeMenu === "SOLUTIONS" && (
                  <div className="grid grid-cols-2 gap-px bg-slate-200 w-full">
                    <div className="bg-white p-8">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400 mb-5">By Company Size</p>
                      <div className="space-y-2">
                        {SOLUTIONS_MENU.sizes.map((item) => (
                          <MegaMenuLink key={item.label} {...item} onClick={() => setActiveMenu(null)} />
                        ))}
                      </div>
                    </div>
                    <div className="bg-slate-50 p-8">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400 mb-5">By Industry</p>
                      <div className="space-y-2">
                        {SOLUTIONS_MENU.industries.map((item) => (
                          <MegaMenuLink key={item.label} {...item} onClick={() => setActiveMenu(null)} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeMenu === "INTEGRATIONS" && (
                  <div className="w-full max-w-[320px] bg-white p-6">
                    <div className="space-y-2">
                      {INTEGRATIONS_MENU.map((item) => (
                        <MegaMenuLink key={item.label} {...item} onClick={() => setActiveMenu(null)} />
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-200 text-center">
                      <Link
                        href="/integrations"
                        onClick={() => setActiveMenu(null)}
                        className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700"
                      >
                        See all 50+ integrations
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                )}

                {activeMenu === "RESOURCES" && (
                  <div className="grid grid-cols-2 gap-px bg-slate-200 w-full">
                    <div className="bg-white p-8">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400 mb-5">Resources</p>
                      <div className="space-y-2">
                        {RESOURCES_MENU.left.map((item) => (
                          <MegaMenuLink key={item.label} {...item} onClick={() => setActiveMenu(null)} />
                        ))}
                      </div>
                    </div>
                    <div className="bg-slate-50 p-8">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400 mb-5">Support</p>
                      <div className="space-y-2">
                        {RESOURCES_MENU.right.map((item) => (
                          <MegaMenuLink key={item.label} {...item} onClick={() => setActiveMenu(null)} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={closeMobile}
            />

            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative flex h-full w-full flex-col overflow-y-auto bg-white p-6"
              ref={mobileMenuRef}
              role="dialog"
              aria-modal="true"
            >
              <div className="flex items-center justify-between mb-6">
                <Link href="/" className="flex items-center gap-3" onClick={closeMobile}>
                  <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <circle cx="16" cy="16" r="14" stroke="#0A1628" strokeWidth="3" />
                    <path d="M16 8C11.5817 8 8 11.5817 8 16C8 20.4183 11.5817 24 16 24" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  <span className="text-lg font-bold tracking-tight text-slate-900">CircleWorks</span>
                </Link>
                <button type="button" aria-label="Close menu" onClick={closeMobile} className="p-2 text-slate-900">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <MobileAccordion label="PRODUCT" activeLabel={mobileActiveAccordion} setActiveLabel={setMobileActiveAccordion}>
                  <div className="pl-4 border-l border-slate-200 space-y-3">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Platform</div>
                    {PRODUCT_MENU.platform.map((item) => (
                      <Link key={item.label} href={item.href} onClick={closeMobile} className="block text-base font-medium text-slate-900">
                        {item.label}
                      </Link>
                    ))}
                    <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400 pt-4">Why CircleWorks</div>
                    {PRODUCT_MENU.why.map((item) => (
                      <Link key={item.label} href={item.href} onClick={closeMobile} className="block text-base font-medium text-slate-900">
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </MobileAccordion>

                <MobileAccordion label="SOLUTIONS" activeLabel={mobileActiveAccordion} setActiveLabel={setMobileActiveAccordion}>
                  <div className="pl-4 border-l border-slate-200 space-y-3">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">By Company Size</div>
                    {SOLUTIONS_MENU.sizes.map((item) => (
                      <Link key={item.label} href={item.href} onClick={closeMobile} className="block text-base font-medium text-slate-900">
                        {item.label}
                      </Link>
                    ))}
                    <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400 pt-4">By Industry</div>
                    {SOLUTIONS_MENU.industries.map((item) => (
                      <Link key={item.label} href={item.href} onClick={closeMobile} className="block text-base font-medium text-slate-900">
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </MobileAccordion>

                <MobileAccordion label="INTEGRATIONS" activeLabel={mobileActiveAccordion} setActiveLabel={setMobileActiveAccordion}>
                  <div className="pl-4 border-l border-slate-200 space-y-3">
                    {INTEGRATIONS_MENU.map((item) => (
                      <Link key={item.label} href={item.href} onClick={closeMobile} className="block text-base font-medium text-slate-900">
                        {item.label}
                      </Link>
                    ))}
                    <Link href="/integrations" onClick={closeMobile} className="block text-sm font-semibold text-blue-600 pt-2">
                      See all 50+ →
                    </Link>
                  </div>
                </MobileAccordion>

                <MobileAccordion label="RESOURCES" activeLabel={mobileActiveAccordion} setActiveLabel={setMobileActiveAccordion}>
                  <div className="pl-4 border-l border-slate-200 space-y-3">
                    {RESOURCES_MENU.left.map((item) => (
                      <Link key={item.label} href={item.href} onClick={closeMobile} className="block text-base font-medium text-slate-900">
                        {item.label}
                      </Link>
                    ))}
                    {RESOURCES_MENU.right.map((item) => (
                      <Link key={item.label} href={item.href} onClick={closeMobile} className="block text-base font-medium text-slate-900">
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </MobileAccordion>

                <div className="border-b border-slate-200 pb-4">
                  <Link href="/pricing" onClick={closeMobile} className="block text-base font-semibold text-slate-900">
                    PRICING
                  </Link>
                </div>
              </div>

              <div className="mt-auto space-y-3 pt-6">
                <Link
                  href="/login"
                  onClick={closeMobile}
                  className="block rounded-full border border-slate-200 px-4 py-3 text-center text-base font-semibold text-slate-900 hover:bg-slate-50 transition"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  onClick={closeMobile}
                  className="block rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-center text-base font-semibold text-white shadow-lg shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 transition"
                >
                  Start Free
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
