"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calculator,
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
  Building,
  Rocket,
  ArrowRight,
  // Menu,
  // X,
  Coins,
  FileCheck,
  Clock,
  Wallet,
  PieChart,
  MonitorPlay,
  GraduationCap
} from "lucide-react";

// --- Data Definitions ---

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
    { label: "Payroll", desc: "Tax-perfect native payroll", icon: Coins, href: "/product/payroll" },
    { label: "HRIS", desc: "Core employee system of record", icon: Users, href: "/product/hris" },
    { label: "ATS", desc: "Source to hire pipelines", icon: Target, href: "/product/ats" },
    { label: "Onboarding", desc: "Digital offer letters & I-9s", icon: Briefcase, href: "/product/onboarding" },
    { label: "Benefits", desc: "401k, Health, and Commuter", icon: Heart, href: "/product/benefits" },
    { label: "Time Tracking", desc: "Scheduling and attendance", icon: Clock, href: "/product/time-tracking" },
    { label: "Expenses", desc: "Automated receipt matching", icon: Wallet, href: "/product/expenses" },
    { label: "Performance", desc: "Reviews and goal tracking", icon: Activity, href: "/product/performance" },
    { label: "Compliance Hub", desc: "Multi-state labor laws handled", icon: ShieldCheck, href: "/product/compliance" },
    { label: "Reporting", desc: "Board-ready analytics", icon: PieChart, href: "/product/reporting" },
  ],
  why: [
    { label: "Customer Stories", desc: "See how companies scale", icon: Star, href: "/customers" },
    { label: "Security", desc: "Bank-level encryption", icon: ShieldCheck, href: "/security" },
    { label: "Integrations", desc: "Connect your tech stack", icon: Zap, href: "/integrations" },
    { label: "Pricing", desc: "Transparent, simple plans", icon: Calculator, href: "/pricing" },
    { label: "ROI Calculator", desc: "Calculate your savings", icon: Target, href: "/resources/roi-calculator" },
  ],
};

const SOLUTIONS_MENU = {
  sizes: [
    { label: "Startups", desc: "Foundations for growth", icon: Rocket, href: "/solutions/startups" },
    { label: "SMBs", desc: "Streamline your operations", icon: Building, href: "/solutions/smbs" },
    { label: "Mid-Market", desc: "Scale with confidence", icon: Target, href: "/solutions/mid-market" },
    { label: "Enterprise", desc: "Custom configurations", icon: Globe, href: "/solutions/enterprise" },
  ],
  industries: [
    { label: "Technology & SaaS", desc: "Software & high-growth tech", icon: MonitorPlay, href: "/solutions/technology-saas" },
    { label: "Healthcare & Wellness", desc: "Clinics & care providers", icon: Heart, href: "/solutions/health-wellness" },
    { label: "Retail & Ecommerce", desc: "Stores & digital commerce", icon: ShoppingBag, href: "/solutions/retail-ecommerce" },
    { label: "Non-Profit", desc: "Organizations & charities", icon: Landmark, href: "/solutions/nonprofit" },
    { label: "Creators", desc: "Talent, royalties & 1099s", icon: Star, href: "/solutions/creators" },
    { label: "Professional Services", desc: "Agencies & consulting", icon: Briefcase, href: "/solutions/professional-services" },
  ],
  useCases: [
    { label: "Rapid Scaling", desc: "Hire 10 to 500 quickly", icon: Rocket, href: "/solutions/rapid-scaling" },
    { label: "Compliance & Risk", desc: "Audit-ready operations", icon: ShieldCheck, href: "/solutions/compliance" },
    { label: "Cost Optimization", desc: "Maximize your margins", icon: Coins, href: "/solutions/cost-optimization" },
    { label: "Remote Teams", desc: "Operate a global team", icon: Globe, href: "/solutions/remote-teams" },
  ],
};

const INTEGRATIONS_MENU = [
  { label: "QuickBooks", desc: "Sync payroll journal entries", href: "/integrations/quickbooks", icon: Zap },
  { label: "Slack", desc: "Time-off requests in chat", href: "/integrations/slack", icon: Zap },
  { label: "Okta", desc: "Seamless employee provision", href: "/integrations/okta", icon: Zap },
  { label: "Checkr", desc: "Fast background checks", href: "/integrations/checkr", icon: Zap },
  { label: "DocuSign", desc: "E-signature integration", href: "/integrations/docusign", icon: Zap },
  { label: "Guideline", desc: "Retirement contributions", href: "/integrations/guideline-401-k", icon: Zap },
  { label: "Xero", desc: "Accounting synchronization", href: "/integrations/xero", icon: Zap },
  { label: "Google Workspace", desc: "Directory & email sync", href: "/integrations/google-workspace", icon: Zap },
];

const RESOURCES_MENU = {
  learn: [
    { label: "Blog", desc: "HR & Payroll insights", icon: FileCheck, href: "/blog" },
    { label: "Guides & Templates", desc: "Free HR assets", icon: BookOpen, href: "/guides" },
    { label: "Payroll Glossary", desc: "Industry terms defined", icon: GraduationCap, href: "/blog/labor-law-dictionary" },
    { label: "State Tax Guides", desc: "Jurisdiction compliance", icon: Globe, href: "/resources/state-tax-guides" },
    { label: "Overtime Tracker", desc: "State specific rules", icon: Clock, href: "/resources/overtime-tracker" },
  ],
  tools: [
    { label: "Help Center", desc: "Support articles & FAQs", icon: HelpCircle, href: "/help" },
    { label: "API Docs", desc: "Developer documentation", icon: FileCode2, href: "/docs" },
    { label: "Payroll Calculator", desc: "Calculate paychecks", icon: Calculator, href: "/resources/payroll-calculator" },
    { label: "Community", desc: "Connect with native users", icon: MessageCircle, href: "/community" },
  ],
};

const NAV_ITEMS = [
  { label: "PRODUCT", isMega: true },
  { label: "SOLUTIONS", isMega: true },
  { label: "INTEGRATIONS", isMega: true, singleColumn: true },
  { label: "RESOURCES", isMega: true },
  { label: "PRICING", isMega: false, href: "/pricing" },
];

// --- Subcomponents ---

const MegaMenuLink = ({ href, icon: Icon, label, desc, onClick }: MegaMenuLinkProps) => (
  <Link href={href} onClick={onClick} className="flex gap-3 p-2 -m-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
    <div className="flex-shrink-0 mt-0.5">
      <div className="w-8 h-8 rounded-md bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
        <Icon size={20} />
      </div>
    </div>
    <div>
      <div className="text-[15px] font-semibold text-slate-900 dark:text-white mb-0.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        {label}
      </div>
      <div className="text-[13px] text-slate-500 dark:text-slate-400 line-clamp-1">{desc}</div>
    </div>
  </Link>
);

const MobileAccordion = ({ label, children, activeLabel, setActiveLabel }: MobileAccordionProps) => {
  const isOpen = activeLabel === label;
  return (
    <div className="border-b border-slate-200 dark:border-slate-800">
      <button
        onClick={() => setActiveLabel(isOpen ? null : label)}
        className="flex items-center justify-between w-full py-4 text-left font-semibold text-slate-900 dark:text-white"
        aria-expanded={isOpen}
      >
        {label}
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <Zap className="w-5 h-5 opacity-50" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pb-4 flex flex-col gap-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Main Navbar Component ---

export default function Navbar({ forceLight = false }: { forceLight?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileActiveAccordion, setMobileActiveAccordion] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const pathname = usePathname();

  // Scroll handler
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // initial check
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Keyboard navigation & Esc to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveMenu(null);
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus trap for mobile menu
  useEffect(() => {
    if (mobileOpen && mobileMenuRef.current) {
      document.body.style.overflow = "hidden";
      const focusableElements = mobileMenuRef.current.querySelectorAll(
        'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      firstElement?.focus();
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Click outside listener for desktop
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
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

  // Hover handlers with custom delays to prevent accidental triggers/hides
  const handleMouseEnter = (menuLabel: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (activeMenu) {
      // If a menu is already open, switch instantly for better UX
      setActiveMenu(menuLabel);
    } else {
      timeoutRef.current = setTimeout(() => {
        setActiveMenu(menuLabel);
      }, 350);
    }
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 500);
  };

  const closeMenus = () => {
    setActiveMenu(null);
    setMobileOpen(false);
  };

  // Determine navbar styles
  // The user prompt specifically asked for navy text on light, white text on dark for the logo, and a sticky nav with white bg + shadow-md after 80px scroll.
  const isNavWhite = scrolled || forceLight;

  return (
    <>
      <nav
        ref={navRef}
        onMouseLeave={handleMouseLeave}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isNavWhite
            ? "bg-white shadow-md py-3"
            : "bg-transparent py-5"
          }`}
      >
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* LEFT: Logo */}
            <Link href="/" className="flex items-center gap-2 group z-50" onClick={closeMenus} onMouseEnter={handleMouseLeave}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="14" stroke={isNavWhite ? "#0A1628" : "currentColor"} className="dark:stroke-white" strokeWidth="3" />
                <path d="M16 8C11.5817 8 8 11.5817 8 16C8 20.4183 11.5817 24 16 24" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" />
              </svg>
              <div className="flex flex-col">
                <span className={`text-[22px] font-bold tracking-tight transition-colors ${isNavWhite ? "text-[#0A1628]" : "text-white"
                  }`}>
                  Circle<span className="text-blue-500">Works</span>
                </span>
              </div>
            </Link>

            {/* CENTER: Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1 h-full">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href || (item.label !== "PRICING" && activeMenu === item.label);

                return (
                  <div
                    key={item.label}
                    className="relative"
                    onMouseEnter={() => item.isMega ? handleMouseEnter(item.label) : handleMouseLeave()}
                    onMouseLeave={handleMouseLeave}
                  >
                    {item.isMega ? (
                      <button
                        className={`px-4 py-2.5 text-[14px] font-bold tracking-wide transition-colors relative flex items-center gap-1.5 ${isActive
                            ? (isNavWhite ? "text-blue-600" : "text-blue-400")
                            : (isNavWhite ? "text-slate-600 hover:text-slate-900" : "text-slate-300 hover:text-white")
                          }`}
                        aria-expanded={activeMenu === item.label}
                      >
                        {item.label}

                        {/* Active Underline */}
                        {isActive && (
                          <motion.div
                            layoutId="nav-indicator"
                            className="absolute -bottom-[20px] left-0 right-0 h-[3px] bg-blue-600 rounded-t-full"
                          />
                        )}
                      </button>
                    ) : (
                      <Link
                        href={item.href || "#"}
                        onClick={closeMenus}
                        className={`px-4 py-2.5 text-[14px] font-bold tracking-wide transition-colors relative flex items-center gap-1.5 ${isActive
                            ? (isNavWhite ? "text-blue-600" : "text-blue-400")
                            : (isNavWhite ? "text-slate-600 hover:text-slate-900" : "text-slate-300 hover:text-white")
                          }`}
                      >
                        {item.label}
                        {isActive && (
                          <motion.div
                            layoutId="nav-indicator"
                            className="absolute -bottom-[20px] left-0 right-0 h-[3px] bg-blue-600 rounded-t-full"
                          />
                        )}
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>

            {/* RIGHT: CTAs */}
            <div className="hidden lg:flex items-center gap-4 z-50" onMouseEnter={handleMouseLeave}>
              <Link
                href="/login"
                className={`font-semibold text-[15px] transition-colors ${isNavWhite ? "text-[#0A1628] hover:text-blue-600" : "text-white hover:text-blue-400"
                  }`}
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-full px-6 py-2.5 transition-all shadow-[0_4px_14px_0_rgba(59,130,246,0.39)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.23)] hover:-translate-y-0.5"
              >
                Start Free — No Credit Card
              </Link>
            </div>

            {/* Mobile Hamburger */}
            <button
              aria-label="Toggle menu"
              className={`lg:hidden p-2 -mr-2 z-[60] relative transition-colors ${mobileOpen ? "text-[#0A1628]" : (isNavWhite ? "text-[#0A1628]" : "text-white")
                }`}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <div className="w-6 h-5 flex flex-col justify-between items-center overflow-hidden">
                <span className={`w-full h-0.5 bg-current transform transition-all duration-300 origin-left ${mobileOpen ? "rotate-[42deg] translate-x-1" : ""}`} />
                <span className={`w-full h-0.5 bg-current transform transition-all duration-300 ${mobileOpen ? "opacity-0 translate-x-4" : ""}`} />
                <span className={`w-full h-0.5 bg-current transform transition-all duration-300 origin-left ${mobileOpen ? "-rotate-[42deg] translate-x-1" : ""}`} />
              </div>
            </button>
          </div>
        </div>

        {/* --- DESKTOP MEGA MENUS --- */}
        <div className="hidden lg:flex justify-center absolute left-0 right-0 top-full pointer-events-none">
          <AnimatePresence>
            {activeMenu && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
                className="pt-2 pointer-events-auto"
                onMouseEnter={() => handleMouseEnter(activeMenu)}
                onMouseLeave={handleMouseLeave}
              >
                {/* Product Menu: 2-column, 320px wide each = ~640px + gap/padding */}
                {activeMenu === "PRODUCT" && (
                  <div className="bg-white dark:bg-[#0F1C2E] rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] dark:shadow-2xl border border-slate-200 dark:border-slate-800 p-8 flex gap-12 w-[720px] origin-top">
                    <div className="flex-1 w-[320px]">
                      <h3 className="text-[12px] font-bold text-slate-400 tracking-wider mb-5 uppercase">Platform</h3>
                      <div className="flex flex-col gap-3">
                        {PRODUCT_MENU.platform.map((item) => (
                          <MegaMenuLink key={item.label} {...item} onClick={closeMenus} />
                        ))}
                      </div>
                    </div>
                    <div className="flex-1 w-[320px] bg-slate-50 dark:bg-slate-800/20 -my-8 -mr-8 p-8 border-l border-slate-100 dark:border-slate-800 flex flex-col">
                      <h3 className="text-[12px] font-bold text-slate-400 tracking-wider mb-5 uppercase">Why CircleWorks</h3>
                      <div className="flex flex-col gap-3">
                        {PRODUCT_MENU.why.map((item) => (
                          <MegaMenuLink key={item.label} {...item} onClick={closeMenus} />
                        ))}
                      </div>
                      <div className="mt-auto pt-6">
                        <Link href="/product" onClick={closeMenus} className="text-blue-600 dark:text-blue-400 font-bold text-[15px] flex items-center gap-2 hover:gap-3 transition-all">
                          See all features <ArrowRight size={16} />
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                {/* Solutions Menu */}
                {activeMenu === "SOLUTIONS" && (
                  <div className="bg-white dark:bg-[#0F1C2E] rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] dark:shadow-2xl border border-slate-200 dark:border-slate-800 p-8 flex gap-12 w-[960px] origin-top">
                    <div className="flex-1">
                      <h3 className="text-[12px] font-bold text-slate-400 tracking-wider mb-5 uppercase">By Company Size</h3>
                      <div className="flex flex-col gap-3">
                        {SOLUTIONS_MENU.sizes.map((item) => (
                          <MegaMenuLink key={item.label} {...item} onClick={closeMenus} />
                        ))}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-[12px] font-bold text-slate-400 tracking-wider mb-5 uppercase">By Industry</h3>
                      <div className="flex flex-col gap-3">
                        {SOLUTIONS_MENU.industries.map((item) => (
                          <MegaMenuLink key={item.label} {...item} onClick={closeMenus} />
                        ))}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-[12px] font-bold text-slate-400 tracking-wider mb-5 uppercase">By Use Case</h3>
                      <div className="flex flex-col gap-3">
                        {SOLUTIONS_MENU.useCases.map((item) => (
                          <MegaMenuLink key={item.label} {...item} onClick={closeMenus} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Integrations Menu */}
                {activeMenu === "INTEGRATIONS" && (
                  <div className="bg-white dark:bg-[#0F1C2E] rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] dark:shadow-2xl border border-slate-200 dark:border-slate-800 p-6 w-[400px] origin-top flex flex-col">
                    <h3 className="text-[12px] font-bold text-slate-400 tracking-wider mb-4 uppercase">Popular Integrations</h3>
                    <div className="flex flex-col gap-2">
                      {INTEGRATIONS_MENU.map((item) => (
                        <MegaMenuLink key={item.label} {...item} onClick={closeMenus} />
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <Link href="/integrations" onClick={closeMenus} className="text-blue-600 dark:text-blue-400 font-bold text-[15px] flex items-center gap-2 hover:gap-3 transition-all w-full justify-center">
                        See all 50+ integrations <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                )}

                {/* Resources Menu */}
                {activeMenu === "RESOURCES" && (
                  <div className="bg-white dark:bg-[#0F1C2E] rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] dark:shadow-2xl border border-slate-200 dark:border-slate-800 p-8 flex gap-12 w-[680px] origin-top">
                    <div className="flex-1">
                      <h3 className="text-[12px] font-bold text-slate-400 tracking-wider mb-5 uppercase">Learn</h3>
                      <div className="flex flex-col gap-3">
                        {RESOURCES_MENU.learn.map((item) => (
                          <MegaMenuLink key={item.label} {...item} onClick={closeMenus} />
                        ))}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-[12px] font-bold text-slate-400 tracking-wider mb-5 uppercase">Tools & Support</h3>
                      <div className="flex flex-col gap-3">
                        {RESOURCES_MENU.tools.map((item) => (
                          <MegaMenuLink key={item.label} {...item} onClick={closeMenus} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* --- MOBILE FULL SCREEN OVERLAY --- */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-white dark:bg-[#0A1628] lg:hidden flex flex-col pt-24 pb-8 px-6 overflow-y-auto"
            ref={mobileMenuRef}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex-1 flex flex-col gap-2">
              <MobileAccordion label="PRODUCT" activeLabel={mobileActiveAccordion} setActiveLabel={setMobileActiveAccordion}>
                <div className="pl-4 border-l-2 border-slate-100 dark:border-slate-800 flex flex-col gap-3 py-2">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2 mb-1">Platform</div>
                  {PRODUCT_MENU.platform.map(item => (
                    <Link key={item.label} href={item.href} onClick={closeMenus} className="text-slate-700 dark:text-slate-300 font-medium py-1">{item.label}</Link>
                  ))}
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-4 mb-1">Why CircleWorks</div>
                  {PRODUCT_MENU.why.map(item => (
                    <Link key={item.label} href={item.href} onClick={closeMenus} className="text-slate-700 dark:text-slate-300 font-medium py-1">{item.label}</Link>
                  ))}
                </div>
              </MobileAccordion>

              <MobileAccordion label="SOLUTIONS" activeLabel={mobileActiveAccordion} setActiveLabel={setMobileActiveAccordion}>
                <div className="pl-4 border-l-2 border-slate-100 dark:border-slate-800 flex flex-col gap-3 py-2">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2 mb-1">By Company Size</div>
                  {SOLUTIONS_MENU.sizes.map(item => (
                    <Link key={item.label} href={item.href} onClick={closeMenus} className="text-slate-700 dark:text-slate-300 font-medium py-1">{item.label}</Link>
                  ))}
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-4 mb-1">By Industry</div>
                  {SOLUTIONS_MENU.industries.map(item => (
                    <Link key={item.label} href={item.href} onClick={closeMenus} className="text-slate-700 dark:text-slate-300 font-medium py-1">{item.label}</Link>
                  ))}
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-4 mb-1">By Use Case</div>
                  {SOLUTIONS_MENU.useCases.map(item => (
                    <Link key={item.label} href={item.href} onClick={closeMenus} className="text-slate-700 dark:text-slate-300 font-medium py-1">{item.label}</Link>
                  ))}
                </div>
              </MobileAccordion>

              <MobileAccordion label="INTEGRATIONS" activeLabel={mobileActiveAccordion} setActiveLabel={setMobileActiveAccordion}>
                <div className="pl-4 border-l-2 border-slate-100 dark:border-slate-800 flex flex-col gap-3 py-2">
                  {INTEGRATIONS_MENU.map(item => (
                    <Link key={item.label} href={item.href} onClick={closeMenus} className="text-slate-700 dark:text-slate-300 font-medium py-1">{item.label}</Link>
                  ))}
                  <Link href="/integrations" onClick={closeMenus} className="text-blue-600 font-bold py-1 mt-2">See all 50+ &rarr;</Link>
                </div>
              </MobileAccordion>

              <MobileAccordion label="RESOURCES" activeLabel={mobileActiveAccordion} setActiveLabel={setMobileActiveAccordion}>
                <div className="pl-4 border-l-2 border-slate-100 dark:border-slate-800 flex flex-col gap-3 py-2">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2 mb-1">Learn</div>
                  {RESOURCES_MENU.learn.map(item => (
                    <Link key={item.label} href={item.href} onClick={closeMenus} className="text-slate-700 dark:text-slate-300 font-medium py-1">{item.label}</Link>
                  ))}
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-4 mb-1">Tools</div>
                  {RESOURCES_MENU.tools.map(item => (
                    <Link key={item.label} href={item.href} onClick={closeMenus} className="text-slate-700 dark:text-slate-300 font-medium py-1">{item.label}</Link>
                  ))}
                </div>
              </MobileAccordion>

              <div className="border-b border-slate-200 dark:border-slate-800">
                <Link
                  href="/pricing"
                  onClick={closeMenus}
                  className="flex items-center justify-between w-full py-4 text-left font-semibold text-slate-900 dark:text-white"
                >
                  PRICING
                </Link>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3">
              <Link
                href="/login"
                onClick={closeMenus}
                className="w-full text-center py-4 rounded-xl border-2 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                tabIndex={0}
              >
                Log In
              </Link>
              <Link
                href="/signup"
                onClick={closeMenus}
                className="w-full text-center py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30"
                tabIndex={0}
              >
                Start Free — No Credit Card
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
