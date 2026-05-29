"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import {
  Activity,
  AppWindow,
  ArrowRight,
  BookOpen,
  Briefcase,
  Building2,
  Calculator,
  ChevronDown,
  Clock,
  DollarSign,
  FileCode2,
  FileSignature,
  Heart,
  HelpCircle,
  KeyRound,
  Landmark,
  Library,
  Menu,
  MessageCircle,
  MessageSquare,
  PiggyBank,
  Receipt,
  Rocket,
  SearchCheck,
  Shield,
  Sparkles,
  Target,
  Users,
  UserPlus,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";

type MenuKey = "product" | "solutions" | "integrations" | "resources";

type NavItem =
  | {
      key: MenuKey;
      label: string;
      href?: never;
    }
  | {
      key: "pricing";
      label: string;
      href: string;
    };

type MenuLink = {
  label: string;
  href: string;
  description?: string;
  icon: LucideIcon;
};

export type NavbarProps = {
  forceLight?: boolean;
  transparent?: boolean;
};

const OPEN_DELAY_MS = 150;
const CLOSE_DELAY_MS = 200;
const EXIT_DURATION_MS = 150;

const navItems: NavItem[] = [
  { key: "product", label: "PRODUCT" },
  { key: "solutions", label: "SOLUTIONS" },
  { key: "integrations", label: "INTEGRATIONS" },
  { key: "resources", label: "RESOURCES" },
  { key: "pricing", label: "PRICING", href: "/pricing" },
];

const productPlatformLinks: MenuLink[] = [
  {
    label: "Payroll",
    href: "/product/payroll",
    description: "All 50 states, auto tax filing",
    icon: DollarSign,
  },
  {
    label: "HRIS",
    href: "/product/hris",
    description: "Employee records and org management",
    icon: Users,
  },
  {
    label: "ATS",
    href: "/product/ats",
    description: "Hire faster with smart pipelines",
    icon: Briefcase,
  },
  {
    label: "Onboarding",
    href: "/product/onboarding",
    description: "Automated Day-1 experience",
    icon: UserPlus,
  },
  {
    label: "Benefits",
    href: "/product/benefits",
    description: "Health, dental, vision, 401k",
    icon: Heart,
  },
  {
    label: "Time Tracking",
    href: "/product/time",
    description: "Project and shift time tracking",
    icon: Clock,
  },
  {
    label: "Expenses",
    href: "/product/expenses",
    description: "Automated expense approvals",
    icon: Receipt,
  },
  {
    label: "Performance",
    href: "/product/performance",
    description: "OKRs, reviews, and growth",
    icon: Target,
  },
  {
    label: "Compliance",
    href: "/product/compliance",
    description: "Stay compliant in all 50 states",
    icon: Shield,
  },
];

const productWhyLinks: MenuLink[] = [
  {
    label: "Customer Stories",
    href: "/customers",
    icon: Sparkles,
  },
  {
    label: "Security",
    href: "/security",
    icon: Shield,
  },
  {
    label: "Integrations",
    href: "/integrations",
    icon: Zap,
  },
  {
    label: "Pricing",
    href: "/pricing",
    icon: DollarSign,
  },
  {
    label: "ROI Calculator",
    href: "/roi-calculator",
    icon: Calculator,
  },
];

const companySizeLinks: MenuLink[] = [
  {
    label: "Startups",
    href: "/solutions/startups",
    description: "Launch payroll and HR quickly",
    icon: Rocket,
  },
  {
    label: "SMBs (10-250)",
    href: "/solutions/smbs",
    description: "Simple workflows for growing teams",
    icon: Users,
  },
  {
    label: "Mid-Market (250-2000)",
    href: "/solutions/mid-market",
    description: "Controls for multi-site operations",
    icon: Building2,
  },
  {
    label: "Enterprise (2000+)",
    href: "/solutions/enterprise",
    description: "Configurable workflows and support",
    icon: Landmark,
  },
];

const industryLinks: MenuLink[] = [
  {
    label: "Technology",
    href: "/solutions/technology",
    description: "Fast-moving distributed teams",
    icon: AppWindow,
  },
  {
    label: "Healthcare",
    href: "/solutions/healthcare",
    description: "Credentialed teams and compliance",
    icon: Heart,
  },
  {
    label: "Retail",
    href: "/solutions/retail",
    description: "Hourly, seasonal, and multi-location",
    icon: Building2,
  },
  {
    label: "Non-Profit",
    href: "/solutions/non-profit",
    description: "Grant-aware people operations",
    icon: Landmark,
  },
  {
    label: "Professional Services",
    href: "/solutions/professional-services",
    description: "Client teams, projects, and approvals",
    icon: Briefcase,
  },
];

const integrationLinks: MenuLink[] = [
  { label: "QuickBooks", href: "/integrations/quickbooks", icon: Calculator },
  { label: "Slack", href: "/integrations/slack", icon: MessageSquare },
  { label: "Okta", href: "/integrations/okta", icon: KeyRound },
  { label: "Checkr", href: "/integrations/checkr", icon: SearchCheck },
  { label: "DocuSign", href: "/integrations/docusign", icon: FileSignature },
  { label: "Guideline", href: "/integrations/guideline", icon: PiggyBank },
  { label: "Xero", href: "/integrations/xero", icon: Activity },
  {
    label: "Google Workspace",
    href: "/integrations/google-workspace",
    icon: AppWindow,
  },
];

const resourceLeftLinks: MenuLink[] = [
  { label: "Blog", href: "/blog", icon: BookOpen },
  { label: "HR Guides", href: "/guides", icon: Library },
  { label: "Glossary", href: "/glossary", icon: BookOpen },
  { label: "Webinars", href: "/webinars", icon: MessageCircle },
  { label: "Templates", href: "/templates", icon: FileCode2 },
  {
    label: "State Payroll Guides",
    href: "/resources/state-tax-guides",
    icon: Landmark,
  },
];

const resourceRightLinks: MenuLink[] = [
  { label: "Changelog", href: "/changelog", icon: Activity },
  { label: "API Docs", href: "/docs", icon: FileCode2 },
  { label: "Status", href: "/status", icon: Zap },
  { label: "Help Center", href: "/help", icon: HelpCircle },
  { label: "Community", href: "/community", icon: MessageCircle },
];

function CircleWorksLogo() {
  return (
    <svg
      aria-hidden="true"
      className="h-8 w-auto"
      viewBox="0 0 174 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="16" cy="16" r="14" stroke="#0A1628" strokeWidth="3" />
      <path
        d="M16 8C11.58 8 8 11.58 8 16s3.58 8 8 8"
        stroke="#2563EB"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <text
        x="40"
        y="22"
        fill="#0A1628"
        fontFamily="Inter, ui-sans-serif, system-ui, sans-serif"
        fontSize="20"
        fontWeight="700"
        letterSpacing="0"
      >
        CircleWorks
      </text>
    </svg>
  );
}

function MenuSection({
  title,
  children,
  subtle = false,
}: {
  title: string;
  children: ReactNode;
  subtle?: boolean;
}) {
  return (
    <div className={subtle ? "bg-gray-50 p-6" : "bg-white p-6"}>
      <p className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
        {title}
      </p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function DesktopMenuLink({
  item,
  close,
  compact = false,
}: {
  item: MenuLink;
  close: () => void;
  compact?: boolean;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      role="menuitem"
      data-menu-item
      onClick={close}
      className="group flex rounded-lg p-2 outline-none transition-colors hover:bg-blue-50 focus-visible:bg-blue-50 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
    >
      <span className="mr-3 mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-gray-100 text-gray-700 transition-colors group-hover:bg-white group-hover:text-blue-600">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium text-gray-900 transition-colors group-hover:text-blue-600">
          {item.label}
        </span>
        {item.description && !compact ? (
          <span className="block truncate text-xs leading-5 text-gray-500">
            {item.description}
          </span>
        ) : null}
      </span>
    </Link>
  );
}

function MobileAccordion({
  label,
  isOpen,
  onToggle,
  children,
}: {
  label: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="border-b border-gray-200">
      <button
        type="button"
        className="flex w-full items-center justify-between py-4 text-left text-sm font-medium text-gray-900"
        aria-expanded={isOpen}
        onClick={onToggle}
      >
        {label}
        <ChevronDown
          aria-hidden="true"
          className={`h-4 w-4 text-gray-500 transition-transform duration-150 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`grid transition-[grid-template-rows,opacity] duration-150 ease-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="pb-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

function MobileLinkList({
  links,
  close,
}: {
  links: MenuLink[];
  close: () => void;
}) {
  return (
    <div className="space-y-1 border-l border-gray-200 pl-4">
      {links.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          onClick={close}
          className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600"
        >
          <item.icon className="h-4 w-4 text-gray-400" aria-hidden="true" />
          {item.label}
        </Link>
      ))}
    </div>
  );
}

function getMenuWidth(menu: MenuKey) {
  if (menu === "product") return "w-[640px]";
  if (menu === "integrations") return "w-[280px]";
  return "w-[480px]";
}

function getMenuPosition(menu: MenuKey) {
  return menu === "product" ? "left-0" : "left-1/2 -translate-x-1/2";
}

export function Navbar(_props: NavbarProps = {}) {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mobileRevealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const mobileCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const focusAfterOpenRef = useRef(false);

  const [activeMenu, setActiveMenu] = useState<MenuKey | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileVisible, setMobileVisible] = useState(false);
  const [mobileSection, setMobileSection] = useState<MenuKey | null>(null);

  const clearTimers = () => {
    if (openTimerRef.current) clearTimeout(openTimerRef.current);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
    if (mobileRevealTimerRef.current) clearTimeout(mobileRevealTimerRef.current);
    if (mobileCloseTimerRef.current) clearTimeout(mobileCloseTimerRef.current);
    openTimerRef.current = null;
    closeTimerRef.current = null;
    exitTimerRef.current = null;
    revealTimerRef.current = null;
    mobileRevealTimerRef.current = null;
    mobileCloseTimerRef.current = null;
  };

  const showMenu = (menu: MenuKey, shouldFocus = false) => {
    clearTimers();
    focusAfterOpenRef.current = shouldFocus;
    setActiveMenu(menu);
    revealTimerRef.current = setTimeout(() => {
      setMenuVisible(true);
      revealTimerRef.current = null;
    }, 0);
  };

  const scheduleOpen = (menu: MenuKey) => {
    clearTimers();

    if (activeMenu && activeMenu !== menu) {
      showMenu(menu);
      return;
    }

    openTimerRef.current = setTimeout(() => showMenu(menu), OPEN_DELAY_MS);
  };

  const closeMenu = () => {
    if (!activeMenu) return;
    if (openTimerRef.current) clearTimeout(openTimerRef.current);

    setMenuVisible(false);
    exitTimerRef.current = setTimeout(() => {
      setActiveMenu(null);
      exitTimerRef.current = null;
    }, EXIT_DURATION_MS);
  };

  const scheduleClose = () => {
    if (openTimerRef.current) clearTimeout(openTimerRef.current);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(closeMenu, CLOSE_DELAY_MS);
  };

  const closeAll = () => {
    clearTimers();
    setActiveMenu(null);
    setMenuVisible(false);
    setMobileOpen(false);
    setMobileVisible(false);
    setMobileSection(null);
  };

  const openMobile = () => {
    if (mobileRevealTimerRef.current) clearTimeout(mobileRevealTimerRef.current);
    if (mobileCloseTimerRef.current) clearTimeout(mobileCloseTimerRef.current);
    setMobileOpen(true);
    mobileRevealTimerRef.current = setTimeout(() => {
      setMobileVisible(true);
      mobileRevealTimerRef.current = null;
    }, 0);
  };

  const closeMobile = () => {
    if (mobileRevealTimerRef.current) clearTimeout(mobileRevealTimerRef.current);
    if (mobileCloseTimerRef.current) clearTimeout(mobileCloseTimerRef.current);
    setMobileVisible(false);
    mobileCloseTimerRef.current = setTimeout(() => {
      setMobileOpen(false);
      setMobileSection(null);
      mobileCloseTimerRef.current = null;
    }, EXIT_DURATION_MS);
  };

  useEffect(() => {
    return clearTimers;
  }, []);

  useEffect(() => {
    closeAll();
    // Route changes should always leave the next page with a closed navbar.
  }, [pathname]);

  useEffect(() => {
    if (activeMenu && focusAfterOpenRef.current && menuRef.current) {
      focusAfterOpenRef.current = false;
      menuRef.current.querySelector<HTMLElement>("[data-menu-item]")?.focus();
    }
  }, [activeMenu, menuVisible]);

  useEffect(() => {
    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        closeAll();
        menuButtonRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (!navRef.current?.contains(event.target as Node)) {
        closeMenu();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [activeMenu]);

  useEffect(() => {
    if (!mobileOpen) return;

    document.body.style.overflow = "hidden";
    const focusable = drawerRef.current?.querySelector<HTMLElement>(
      "a[href], button:not([disabled])",
    );
    focusable?.focus();

    const trapFocus = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Tab" || !drawerRef.current) return;

      const focusableElements = Array.from(
        drawerRef.current.querySelectorAll<HTMLElement>(
          "a[href], button:not([disabled])",
        ),
      );

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];

      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", trapFocus);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", trapFocus);
    };
  }, [mobileOpen]);

  const handleTriggerKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    menu: MenuKey,
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (activeMenu === menu) {
        closeMenu();
      } else {
        showMenu(menu, true);
      }
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      showMenu(menu, true);
    }

    if (event.key === "Escape") {
      closeMenu();
    }
  };

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!menuRef.current || !activeMenu) return;

    const items = Array.from(
      menuRef.current.querySelectorAll<HTMLElement>("[data-menu-item]"),
    );
    const currentIndex = items.indexOf(document.activeElement as HTMLElement);

    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu();
      triggerRefs.current[activeMenu]?.focus();
      return;
    }

    if (!items.length) return;

    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      items[(currentIndex + 1 + items.length) % items.length]?.focus();
    }

    if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      items[(currentIndex - 1 + items.length) % items.length]?.focus();
    }

    if (event.key === "Home") {
      event.preventDefault();
      items[0]?.focus();
    }

    if (event.key === "End") {
      event.preventDefault();
      items[items.length - 1]?.focus();
    }
  };

  const renderMenu = (menu: MenuKey) => {
    if (menu === "product") {
      return (
        <>
          <div className="grid grid-cols-[1.25fr_0.75fr] divide-x divide-gray-200">
            <MenuSection title="Platform">
              {productPlatformLinks.map((item) => (
                <DesktopMenuLink key={item.label} item={item} close={closeAll} />
              ))}
            </MenuSection>
            <MenuSection title="Why CircleWorks" subtle>
              {productWhyLinks.map((item) => (
                <DesktopMenuLink
                  key={item.label}
                  item={item}
                  close={closeAll}
                  compact
                />
              ))}
            </MenuSection>
          </div>
          <Link
            href="/product"
            role="menuitem"
            data-menu-item
            onClick={closeAll}
            className="flex w-full items-center justify-center gap-2 bg-blue-600 px-5 py-4 text-sm font-semibold text-white outline-none transition-colors hover:bg-blue-700 focus-visible:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            See all features
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </>
      );
    }

    if (menu === "solutions") {
      return (
        <div className="grid grid-cols-2 divide-x divide-gray-200">
          <MenuSection title="By Company Size">
            {companySizeLinks.map((item) => (
              <DesktopMenuLink key={item.label} item={item} close={closeAll} />
            ))}
          </MenuSection>
          <MenuSection title="By Industry" subtle>
            {industryLinks.map((item) => (
              <DesktopMenuLink key={item.label} item={item} close={closeAll} />
            ))}
          </MenuSection>
        </div>
      );
    }

    if (menu === "integrations") {
      return (
        <div className="bg-white p-4">
          <div className="space-y-1">
            {integrationLinks.map((item) => (
              <DesktopMenuLink
                key={item.label}
                item={item}
                close={closeAll}
                compact
              />
            ))}
          </div>
          <div className="mt-3 border-t border-gray-200 pt-3">
            <Link
              href="/integrations"
              role="menuitem"
              data-menu-item
              onClick={closeAll}
              className="flex items-center justify-between rounded-lg px-2 py-2 text-sm font-semibold text-blue-600 outline-none transition-colors hover:bg-blue-50 focus-visible:bg-blue-50 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              See all 50+ integrations
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 divide-x divide-gray-200">
        <MenuSection title="Learn">
          {resourceLeftLinks.map((item) => (
            <DesktopMenuLink
              key={item.label}
              item={item}
              close={closeAll}
              compact
            />
          ))}
        </MenuSection>
        <MenuSection title="Support" subtle>
          {resourceRightLinks.map((item) => (
            <DesktopMenuLink
              key={item.label}
              item={item}
              close={closeAll}
              compact
            />
          ))}
        </MenuSection>
      </div>
    );
  };

  return (
    <>
      <nav
        ref={navRef}
        role="navigation"
        aria-label="Primary navigation"
        className="sticky top-0 z-50 h-16 border-b border-[#E5E7EB] bg-white backdrop-blur-sm"
        onMouseLeave={scheduleClose}
      >
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 sm:px-6 xl:px-8">
          <Link
            href="/"
            aria-label="CircleWorks home"
            className="flex h-16 shrink-0 items-center"
            onClick={closeAll}
          >
            <CircleWorksLogo />
          </Link>

          <div className="hidden h-16 items-center justify-center lg:flex">
            {navItems.map((item) => {
              if (item.key === "pricing") {
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    onMouseEnter={scheduleClose}
                    className="flex h-16 items-center whitespace-nowrap px-2 text-[14px] font-medium text-gray-700 transition-colors hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 xl:px-4"
                  >
                    {item.label}
                  </Link>
                );
              }

              const isOpen = activeMenu === item.key;

              return (
                <div
                  key={item.key}
                  className="relative flex h-16 items-center"
                  onMouseEnter={() => scheduleOpen(item.key)}
                >
                  <button
                    ref={(node) => {
                      triggerRefs.current[item.key] = node;
                    }}
                    type="button"
                    aria-expanded={isOpen}
                    aria-haspopup="menu"
                    aria-controls={`${item.key}-mega-menu`}
                    onClick={() =>
                      isOpen ? closeMenu() : showMenu(item.key)
                    }
                    onKeyDown={(event) =>
                      handleTriggerKeyDown(event, item.key)
                    }
                    className="flex h-16 items-center gap-1 whitespace-nowrap px-2 text-[14px] font-medium text-gray-700 transition-colors hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 xl:px-4"
                  >
                    {item.label}
                    <ChevronDown
                      aria-hidden="true"
                      className={`h-4 w-4 transition-transform duration-150 ${
                        isOpen ? "rotate-180 text-blue-600" : "text-gray-400"
                      }`}
                    />
                  </button>

                  {isOpen ? (
                    <div
                      className={`absolute top-full z-50 pt-2 ${getMenuPosition(
                        item.key,
                      )} ${getMenuWidth(
                        item.key,
                      )}`}
                      onMouseEnter={() => showMenu(item.key)}
                      onMouseLeave={scheduleClose}
                    >
                      <div
                        ref={menuRef}
                        id={`${item.key}-mega-menu`}
                        role="menu"
                        aria-label={`${item.label} menu`}
                        onKeyDown={handleMenuKeyDown}
                        className={`overflow-hidden rounded-lg border border-gray-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.14)] transition-all duration-150 ease-out ${
                          menuVisible
                            ? "translate-y-0 opacity-100"
                            : "-translate-y-1 opacity-0"
                        }`}
                      >
                        {renderMenu(item.key)}
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className="hidden shrink-0 items-center gap-2 lg:flex">
            <Link
              href="/login"
              className="whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="whitespace-nowrap rounded-full bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              Start Free <span aria-hidden="true">&mdash;</span> No Credit Card
            </Link>
          </div>

          <button
            ref={menuButtonRef}
            type="button"
            aria-label="Open navigation menu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation-drawer"
            onClick={openMobile}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#0A1628] transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 lg:hidden"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </nav>

      {mobileOpen ? (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            aria-label="Close navigation menu"
            className={`absolute inset-0 bg-[#0A1628]/40 backdrop-blur-sm transition-opacity duration-150 ${
              mobileVisible ? "opacity-100" : "opacity-0"
            }`}
            onClick={closeMobile}
          />
          <div
            ref={drawerRef}
            id="mobile-navigation-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            className={`relative flex h-full w-full max-w-[420px] flex-col overflow-y-auto bg-white px-5 py-4 shadow-2xl transition-transform duration-150 ease-out ${
              mobileVisible ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="mb-4 flex h-12 items-center justify-between">
              <Link
                href="/"
                aria-label="CircleWorks home"
                className="flex items-center"
                onClick={closeAll}
              >
                <CircleWorksLogo />
              </Link>
              <button
                type="button"
                aria-label="Close navigation menu"
                onClick={closeMobile}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#0A1628] transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1">
              <MobileAccordion
                label="PRODUCT"
                isOpen={mobileSection === "product"}
                onToggle={() =>
                  setMobileSection(
                    mobileSection === "product" ? null : "product",
                  )
                }
              >
                <div className="space-y-4">
                  <MobileLinkList links={productPlatformLinks} close={closeAll} />
                  <MobileLinkList links={productWhyLinks} close={closeAll} />
                </div>
              </MobileAccordion>

              <MobileAccordion
                label="SOLUTIONS"
                isOpen={mobileSection === "solutions"}
                onToggle={() =>
                  setMobileSection(
                    mobileSection === "solutions" ? null : "solutions",
                  )
                }
              >
                <div className="space-y-4">
                  <MobileLinkList links={companySizeLinks} close={closeAll} />
                  <MobileLinkList links={industryLinks} close={closeAll} />
                </div>
              </MobileAccordion>

              <MobileAccordion
                label="INTEGRATIONS"
                isOpen={mobileSection === "integrations"}
                onToggle={() =>
                  setMobileSection(
                    mobileSection === "integrations" ? null : "integrations",
                  )
                }
              >
                <div className="space-y-3">
                  <MobileLinkList links={integrationLinks} close={closeAll} />
                  <Link
                    href="/integrations"
                    onClick={closeAll}
                    className="ml-4 flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50"
                  >
                    See all 50+ integrations
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </MobileAccordion>

              <MobileAccordion
                label="RESOURCES"
                isOpen={mobileSection === "resources"}
                onToggle={() =>
                  setMobileSection(
                    mobileSection === "resources" ? null : "resources",
                  )
                }
              >
                <div className="space-y-4">
                  <MobileLinkList links={resourceLeftLinks} close={closeAll} />
                  <MobileLinkList links={resourceRightLinks} close={closeAll} />
                </div>
              </MobileAccordion>

              <Link
                href="/pricing"
                onClick={closeAll}
                className="flex border-b border-gray-200 py-4 text-sm font-medium text-gray-900 hover:text-blue-600"
              >
                PRICING
              </Link>
            </div>

            <div className="space-y-3 border-t border-gray-200 pt-4">
              <Link
                href="/login"
                onClick={closeAll}
                className="flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-blue-600"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                onClick={closeAll}
                className="flex w-full items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700"
              >
                Start Free
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default Navbar;
